<?php
/* =====================================================================
   Socle commun du parcours « accès sur demande » : configuration, base
   de données, jetons, signatures, journal. Inclus par chaque point
   d'entrée de api/. Jamais appelé directement (bloqué par .htaccess).

   Principes de sécurité :
   - aucun jeton stocké en clair (seule son empreinte SHA-256 est en base) ;
   - liens de l'équipe signés (HMAC avec la clé secrète) ;
   - aucune action sur un simple GET : les messageries d'entreprise
     ouvrent les liens pour les analyser, chaque action passe par un POST ;
   - adresses IP jamais stockées, seulement une empreinte (anti-robots).
   ===================================================================== */
declare(strict_types=1);

const RACINE_API = __DIR__ . '/..';

$cheminConfig = RACINE_API . '/config.php';
if (!is_file($cheminConfig)) {
    http_response_code(500);
    exit('Configuration absente : copier api/config.example.php en api/config.php.');
}
$CONFIG = require $cheminConfig;

function cfg(string $cle) {
    global $CONFIG;
    return $CONFIG[$cle] ?? null;
}

date_default_timezone_set('Europe/Paris');

function maintenant(): string {
    return date('Y-m-d H:i:s');
}

/* ---------- Base de données ---------- */

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    // SQLite : le dossier de la base (hors du dossier public) est créé au premier appel
    if (str_starts_with((string) cfg('db_dsn'), 'sqlite:')) {
        $dossier = dirname(substr((string) cfg('db_dsn'), 7));
        if (!is_dir($dossier)) mkdir($dossier, 0700, true);
    }
    $pdo = new PDO(cfg('db_dsn'), cfg('db_user'), cfg('db_pass'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite') {
        creerSchemaSqlite($pdo);
    }
    return $pdo;
}

/* Même structure que schema.mysql.sql, pour les tests locaux */
function creerSchemaSqlite(PDO $pdo): void {
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec("CREATE TABLE IF NOT EXISTS demandes (
        id INTEGER PRIMARY KEY AUTOINCREMENT, cree_le TEXT NOT NULL,
        nom TEXT NOT NULL, fonction TEXT NOT NULL, email TEXT NOT NULL, societe TEXT NOT NULL,
        tel TEXT NOT NULL, equipe TEXT NOT NULL, parc TEXT NOT NULL, message TEXT NOT NULL,
        newsletter INTEGER NOT NULL DEFAULT 0, ip_empreinte TEXT NOT NULL, statut TEXT NOT NULL,
        email_jeton TEXT, email_confirme_le TEXT, decide_le TEXT, note_equipe TEXT, poste_id TEXT)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS acces (
        id INTEGER PRIMARY KEY AUTOINCREMENT, demande_id INTEGER NOT NULL REFERENCES demandes(id),
        jeton TEXT NOT NULL UNIQUE, version TEXT NOT NULL, cree_le TEXT NOT NULL, expire_le TEXT NOT NULL,
        telechargements INTEGER NOT NULL DEFAULT 0, max_telechargements INTEGER NOT NULL, dernier_le TEXT)");
    $pdo->exec("CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, cree_le TEXT NOT NULL,
        confirme_le TEXT, jeton TEXT, source TEXT NOT NULL, ip_empreinte TEXT NOT NULL DEFAULT '')");
    $pdo->exec("CREATE TABLE IF NOT EXISTS journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT, demande_id INTEGER NOT NULL REFERENCES demandes(id),
        le TEXT NOT NULL, evenement TEXT NOT NULL, detail TEXT)");
}

function journaliser(int $demandeId, string $evenement, ?string $detail = null): void {
    db()->prepare('INSERT INTO journal (demande_id, le, evenement, detail) VALUES (?, ?, ?, ?)')
        ->execute([$demandeId, maintenant(), $evenement, $detail]);
}

/* Applique les durées de conservation annoncées dans pages/confidentialite.html :
   - adresse jamais confirmée : demande supprimée après 30 jours ;
   - demande refusée : supprimée 1 an après la décision ;
   - empreinte d'adresse IP : effacée après 24 heures (elle ne sert qu'à freiner les robots) ;
   - inscription à la newsletter jamais confirmée : supprimée après 30 jours.
   Les demandes acceptées restent : la relation client se poursuit (suppression à la main
   3 ans après le dernier échange, ou sur demande de la personne).
   Appelé à chaque nouvelle demande et à chaque ouverture de l'espace équipe. */
function purgerDonneesExpirees(): void {
    $pdo = db();
    $avant = fn(int $secondes) => date('Y-m-d H:i:s', time() - $secondes);
    $st = $pdo->prepare("SELECT id FROM demandes
        WHERE (statut = 'email_a_confirmer' AND cree_le < ?) OR (statut = 'refusee' AND decide_le < ?)");
    $st->execute([$avant(30 * 86400), $avant(365 * 86400)]);
    $ids = $st->fetchAll(PDO::FETCH_COLUMN);
    if ($ids) {
        $marques = implode(',', array_fill(0, count($ids), '?'));
        foreach (['journal', 'acces'] as $table) {
            $pdo->prepare("DELETE FROM $table WHERE demande_id IN ($marques)")->execute($ids);
        }
        $pdo->prepare("DELETE FROM demandes WHERE id IN ($marques)")->execute($ids);
    }
    $pdo->prepare("UPDATE demandes SET ip_empreinte = '' WHERE ip_empreinte <> '' AND cree_le < ?")
        ->execute([$avant(86400)]);
    $pdo->prepare("DELETE FROM newsletter WHERE confirme_le IS NULL AND cree_le < ?")->execute([$avant(30 * 86400)]);
    $pdo->prepare("UPDATE newsletter SET ip_empreinte = '' WHERE ip_empreinte <> '' AND cree_le < ?")
        ->execute([$avant(86400)]);
}

/* Inscrit une adresse déjà vérifiée (case newsletter du formulaire de demande,
   confirmée par le clic de vérification de la demande). Sans effet si déjà inscrite. */
function inscrireNewsletterConfirmee(string $email): void {
    $st = db()->prepare('SELECT id, confirme_le FROM newsletter WHERE email = ?');
    $st->execute([$email]);
    $ligne = $st->fetch();
    if (!$ligne) {
        db()->prepare("INSERT INTO newsletter (email, cree_le, confirme_le, source) VALUES (?, ?, ?, 'demande')")
            ->execute([$email, maintenant(), maintenant()]);
    } elseif (!$ligne['confirme_le']) {
        db()->prepare('UPDATE newsletter SET confirme_le = ?, jeton = NULL WHERE id = ?')->execute([maintenant(), $ligne['id']]);
    }
}

/* Lien de désinscription d'un inscrit, signé : impossible de désinscrire quelqu'un d'autre */
function lienDesinscription(int $id): string {
    return url('api/desinscription.php?n=' . $id . '&s=' . signer('desinscription:' . $id));
}

function demande(int $id): ?array {
    $st = db()->prepare('SELECT * FROM demandes WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

/* ---------- Jetons et signatures ---------- */

/* Jeton envoyé par e-mail ; seule son empreinte est stockée */
function nouveauJeton(): string {
    return bin2hex(random_bytes(32));
}

function empreinte(string $jeton): string {
    return hash('sha256', $jeton);
}

/* Signature des liens réservés à l'équipe (ex. décision sur la demande 12) */
function signer(string $objet): string {
    return hash_hmac('sha256', $objet, cfg('secret'));
}

function signatureValide(string $objet, string $signature): bool {
    return hash_equals(signer($objet), $signature);
}

function ipEmpreinte(): string {
    return hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', cfg('secret'));
}

function uuid4(): string {
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

/* ---------- Sortie ---------- */

function h(?string $texte): string {
    return htmlspecialchars((string) $texte, ENT_QUOTES, 'UTF-8');
}

function url(string $chemin): string {
    return rtrim((string) cfg('url_site'), '/') . '/' . ltrim($chemin, '/');
}

function json(array $donnees, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ---------- Espace équipe : session protégée par mot de passe ---------- */

function demarrerSession(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('kyolis_equipe');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/api/', 'httponly' => true, 'samesite' => 'Lax',
        'secure' => str_starts_with((string) cfg('url_site'), 'https://'),
    ]);
    session_start();
}

/* Jeton anti-falsification à joindre à chaque formulaire de l'équipe */
function jetonCsrf(): string {
    demarrerSession();
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(16));
}

/* Bloque la page tant que l'équipe n'est pas connectée ; gère le formulaire de connexion.
   Sur un POST, vérifie aussi le jeton anti-falsification. */
function exigerEquipe(): void {
    demarrerSession();
    if (!empty($_SESSION['equipe'])) {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && !hash_equals(jetonCsrf(), (string) ($_POST['csrf'] ?? ''))) {
            http_response_code(403);
            pageMessage('Session expirée', 'Action non prise en compte', 'Rechargez la page puis recommencez.', '', 'lock');
        }
        return;
    }
    $erreur = '';
    if (isset($_POST['mot_de_passe'])) {
        $hash = (string) cfg('equipe_mot_de_passe_hash');
        if ($hash !== '' && password_verify((string) $_POST['mot_de_passe'], $hash)) {
            session_regenerate_id(true);
            $_SESSION['equipe'] = true;
            header('Location: ' . $_SERVER['REQUEST_URI'], true, 303);   // revient sur la page demandée
            exit;
        }
        sleep(1);   // freine les essais en série
        $erreur = '<p class="espace-erreur" role="alert">Mot de passe incorrect.</p>';
    }
    $cible = h($_SERVER['REQUEST_URI']);
    http_response_code(401);
    pageMessage('Espace équipe', 'Connexion', 'Réservé à l\'équipe KYOLIS®.', <<<HTML
<form method="post" action="$cible" class="espace-form espace-login">
  $erreur
  <label for="mdp">Mot de passe</label>
  <input type="password" id="mdp" name="mot_de_passe" autocomplete="current-password" required autofocus>
  <button type="submit" class="espace-btn">Se connecter</button>
</form>
HTML, 'lock');
}

/* Les libellés lisibles des listes du formulaire */
const LIBELLES_EQUIPE = ['oui' => 'Oui, déjà équipé', 'projet' => 'En projet', 'non' => 'Non'];
const LIBELLES_PARC   = ['1-5' => '1 à 5', '6-20' => '6 à 20', '21-50' => '21 à 50', '50+' => 'Plus de 50'];
const LIBELLES_EVENEMENT = [
    'demande_recue'            => 'Demande reçue',
    'mail_verification_envoye' => 'E-mail de vérification envoyé',
    'email_confirme'           => 'Adresse e-mail confirmée',
    'equipe_prevenue'          => 'Équipe prévenue par e-mail',
    'note_modifiee'            => 'Note modifiée',
    'acceptee'                 => 'Demande acceptée',
    'refusee'                  => 'Demande refusée',
    'lien_envoye'              => 'Lien personnel envoyé',
    'telechargement'           => 'Téléchargement',
    'erreur_mail'              => 'Erreur d\'envoi d\'e-mail',
    'erreur_fichier'           => 'Erreur : fichier introuvable',
];
const LIBELLES_STATUT = [
    'email_a_confirmer' => 'E-mail à confirmer',
    'a_traiter'         => 'À traiter',
    'acceptee'          => 'Acceptée',
    'refusee'           => 'Refusée',
];

require __DIR__ . '/mail.php';
require __DIR__ . '/page.php';
