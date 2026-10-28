<?php
/* =====================================================================
   api/decision.php?id=12&s=SIGNATURE : fiche d'une demande, pour l'équipe.
   Double protection : connexion à l'espace équipe (un e-mail transféré ne
   suffit pas) et lien signé (HMAC), impossible à deviner pour une autre demande.
   GET  : affiche la demande, son historique et les actions possibles.
   POST : action = accepter | refuser | renvoyer | note
     accepter : crée l'identifiant de poste et le lien personnel, l'envoie ;
     refuser  : clôt la demande (aucun e-mail : l'équipe prévient elle-même) ;
     renvoyer : nouveau lien personnel (lien expiré ou perdu) ;
     note     : enregistre seulement la note (échanges, raison de la décision).
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
exigerEquipe();

$id =(int) ($_POST['id'] ?? $_GET['id'] ?? 0);
$sig = (string) ($_POST['s'] ?? $_GET['s'] ?? '');
$d = $id ? demande($id) : null;

if (!$d || !signatureValide('decision:' . $id, $sig)) {
    http_response_code(404);
    pageMessage('Lien invalide', 'Demande introuvable', 'Ce lien ne correspond à aucune demande. Vérifiez qu\'il a été copié en entier.', '', 'lock');
}

/* Crée un lien personnel pour le poste et l'envoie au demandeur */
function envoyerLienPersonnel(array $d): bool {
    $jeton = nouveauJeton();
    $expire = date('Y-m-d H:i:s', time() + (int) cfg('lien_jours') * 86400);
    db()->prepare('INSERT INTO acces (demande_id, jeton, version, cree_le, expire_le, max_telechargements)
            VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$d['id'], empreinte($jeton), cfg('installateur_version'), maintenant(), $expire, cfg('lien_telechargements')]);
    $ok = mailAcces($d, $jeton, $expire);
    journaliser((int) $d['id'], $ok ? 'lien_envoye' : 'erreur_mail', $ok ? 'Valable jusqu\'au ' . date('d/m/Y', strtotime($expire)) : 'Lien personnel non envoyé');
    return $ok;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string) ($_POST['action'] ?? '');
    $note = mb_substr(trim((string) ($_POST['note'] ?? '')), 0, 4000);
    if ($note !== '' && $note !== (string) $d['note_equipe']) {
        db()->prepare('UPDATE demandes SET note_equipe = ? WHERE id = ?')->execute([$note, $id]);
        journaliser($id, 'note_modifiee');
    }

    // Sans installateur sur le serveur, un lien personnel ne mènerait à rien : on n'en envoie pas
    $installateurPresent = is_file((string) cfg('installateur'));

    if (in_array($action, ['accepter', 'renvoyer'], true) && !$installateurPresent) {
        $retour = 'Le fichier d\'installation n\'est pas encore sur le serveur : aucun lien n\'a été envoyé. Réessayez une fois le fichier déposé.';
    } elseif ($action === 'accepter' && $d['statut'] === 'a_traiter') {
        db()->prepare("UPDATE demandes SET statut = 'acceptee', decide_le = ?, poste_id = ? WHERE id = ?")
            ->execute([maintenant(), uuid4(), $id]);
        journaliser($id, 'acceptee');
        $retour = envoyerLienPersonnel(demande($id))
            ? 'Demande acceptée : le lien personnel est parti.'
            : 'Demande acceptée, mais l\'e-mail n\'a pas pu partir. Réessayez avec « Renvoyer un lien ».';
    } elseif ($action === 'refuser' && $d['statut'] === 'a_traiter') {
        db()->prepare("UPDATE demandes SET statut = 'refusee', decide_le = ? WHERE id = ?")->execute([maintenant(), $id]);
        journaliser($id, 'refusee');
        $retour = 'Demande refusée. Aucun e-mail n\'a été envoyé au demandeur.';
    } elseif ($action === 'renvoyer' && $d['statut'] === 'acceptee') {
        $retour = envoyerLienPersonnel($d) ? 'Nouveau lien personnel envoyé.' : 'L\'e-mail n\'a pas pu partir.';
    } elseif ($action === 'note') {
        $retour = 'Note enregistrée.';
    }
    // Retour à l'adresse de la fiche : un rechargement ne renvoie pas le formulaire
    $_SESSION['retour'] = $retour;
    header('Location: ' . url('api/decision.php?id=' . $id . '&s=' . $sig), true, 303);
    exit;
}
$retour = $_SESSION['retour'] ?? '';
unset($_SESSION['retour']);

/* ---------- Affichage de la fiche ---------- */

$statut = LIBELLES_STATUT[$d['statut']] ?? $d['statut'];
$lignes = [
    'Fonction' => $d['fonction'], 'Société' => $d['societe'],
    'E-mail' => '<a href="mailto:' . h($d['email']) . '">' . h($d['email']) . '</a>',
    'Téléphone' => '<a href="tel:' . h(preg_replace('/[^0-9+]/', '', $d['tel'])) . '">' . h($d['tel']) . '</a>',
    'Déjà équipé KYOLIS®' => LIBELLES_EQUIPE[$d['equipe']] ?? $d['equipe'],
    'Nombre de switches' => LIBELLES_PARC[$d['parc']] ?? $d['parc'],
    'Newsletter' => $d['newsletter'] ? 'Oui' : 'Non',
    'Reçue le' => date('d/m/Y à H:i', strtotime($d['cree_le'])),
];
$fiche = '';
foreach ($lignes as $cle => $valeur) {
    $brut = in_array($cle, ['E-mail', 'Téléphone'], true);
    $fiche .= '<div><dt>' . h($cle) . '</dt><dd>' . ($brut ? $valeur : h((string) $valeur)) . '</dd></div>';
}
if ($d['poste_id']) $fiche .= '<div><dt>Identifiant de poste</dt><dd><code>' . h($d['poste_id']) . '</code></dd></div>';

$st = db()->prepare('SELECT * FROM journal WHERE demande_id = ? ORDER BY id DESC');
$st->execute([$id]);
$historique = '';
foreach ($st->fetchAll() as $j) {
    $historique .= '<li><time>' . date('d/m/Y H:i', strtotime($j['le'])) . '</time> ' . h(LIBELLES_EVENEMENT[$j['evenement']] ?? $j['evenement'])
        . ($j['detail'] ? ' <span>(' . h($j['detail']) . ')</span>' : '') . '</li>';
}

$st = db()->prepare('SELECT * FROM acces WHERE demande_id = ? ORDER BY id DESC');
$st->execute([$id]);
$liens = '';
foreach ($st->fetchAll() as $a) {
    $etat = strtotime($a['expire_le']) < time() ? 'expiré' : 'valable';
    $liens .= sprintf('<li>Version %s, %s jusqu\'au %s, %d / %d téléchargement(s)</li>',
        h($a['version']), $etat, date('d/m/Y', strtotime($a['expire_le'])), $a['telechargements'], $a['max_telechargements']);
}

$boutons = match ($d['statut']) {
    'a_traiter' => '<button name="action" value="accepter" class="espace-btn">Accepter et envoyer le lien</button>
                    <button name="action" value="refuser" class="espace-btn espace-btn--ghost">Refuser</button>',
    'acceptee'  => '<button name="action" value="renvoyer" class="espace-btn">Renvoyer un nouveau lien</button>',
    default     => '',
};
$attente = $d['statut'] === 'email_a_confirmer'
    ? '<p class="espace-note">Le demandeur n\'a pas encore confirmé son adresse e-mail : pas de décision possible pour l\'instant.</p>' : '';
if (in_array($d['statut'], ['a_traiter', 'acceptee'], true) && !is_file((string) cfg('installateur'))) {
    $attente .= '<p class="espace-note">Le fichier d\'installation n\'est pas encore sur le serveur : l\'envoi de lien est bloqué tant qu\'il n\'est pas déposé. Vous pouvez déjà échanger avec le demandeur et noter vos remarques.</p>';
}

$liens = $liens ?: '<li>Aucun pour l\'instant.</li>';
$nomH = h($d['nom']);
$messageH = nl2br(h($d['message']));
$noteH = h($d['note_equipe']);
$action = h(url('api/decision.php'));
$sigH = h($sig);
$csrf = jetonCsrf();
$retourHtml = $retour ? '<p class="espace-retour" role="status">' . h($retour) . '</p>' : '';

page('Demande n° ' . $id, <<<HTML
<section class="espace">
  <div class="wrap espace__wrap">
    <a class="espace__retour" href="../api/equipe.php">← Toutes les demandes</a>
    <div class="eyebrow">Demande n° $id · $statut</div>
    <h1>$nomH</h1>
    $retourHtml
    <div class="espace__grid">
      <div class="card">
        <dl class="espace-fiche">$fiche</dl>
        <h3>Besoin exprimé</h3>
        <p class="espace-message">$messageH</p>
      </div>
      <div class="card">
        <form method="post" action="$action" class="espace-form">
          <input type="hidden" name="id" value="$id">
          <input type="hidden" name="s" value="$sigH">
          <input type="hidden" name="csrf" value="$csrf">
          <label for="note">Note de l'équipe (échanges, raison de la décision)</label>
          <textarea id="note" name="note" rows="5">$noteH</textarea>
          $attente
          <div class="espace-actions">
            $boutons
            <button name="action" value="note" class="espace-btn espace-btn--ghost">Enregistrer la note</button>
          </div>
        </form>
        <h3>Liens personnels</h3>
        <ul class="espace-liste">$liens</ul>
        <h3>Historique</h3>
        <ul class="espace-liste espace-histo">$historique</ul>
      </div>
    </div>
  </div>
</section>
HTML);
