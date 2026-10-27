<?php
/* =====================================================================
   POST api/demande.php : reçoit le formulaire de pages/demande-acces.html
   (envoyé en fetch), enregistre la demande et envoie l'e-mail de
   vérification. Répond en JSON : { ok: true } ou { ok: false, message }.

   Anti-robots, sans service externe :
   - champ piège « website » rempli => robot ;
   - formulaire rempli trop vite (champ « duree » posé par le script) ;
   - nombre de demandes limité par heure et par adresse IP (empreinte).
   Un robot détecté reçoit une réponse de succès factice : il n'apprend rien.
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json(['ok' => false, 'message' => 'Méthode non autorisée.'], 405);
}

$champ = fn(string $nom, int $max) => mb_substr(trim((string) ($_POST[$nom] ?? '')), 0, $max);

// Robots : succès factice, rien n'est enregistré
$duree = (int) ($_POST['duree'] ?? 0);
if ($champ('website', 200) !== '' || $duree < cfg('delai_min_secondes') * 1000) {
    json(['ok' => true]);
}

$d = [
    'nom'      => $champ('nom', 120),
    'fonction' => $champ('fonction', 120),
    'email'    => mb_strtolower($champ('email', 190)),
    'societe'  => $champ('societe', 160),
    'tel'      => $champ('tel', 40),
    'equipe'   => $champ('equipe', 10),
    'parc'     => $champ('parc', 10),
    'message'  => $champ('message', 4000),
    'newsletter' => isset($_POST['newsletter']) ? 1 : 0,
];

foreach (['nom', 'fonction', 'email', 'societe', 'tel', 'message'] as $requis) {
    if ($d[$requis] === '') json(['ok' => false, 'message' => 'Merci de remplir tous les champs.'], 422);
}
if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) {
    json(['ok' => false, 'message' => "L'adresse e-mail ne semble pas valide."], 422);
}
if (!preg_match('/^[0-9+ ().-]{6,}$/', $d['tel'])) {
    json(['ok' => false, 'message' => 'Le numéro de téléphone ne semble pas valide.'], 422);
}
if (!isset(LIBELLES_EQUIPE[$d['equipe']]) || !isset(LIBELLES_PARC[$d['parc']])) {
    json(['ok' => false, 'message' => 'Merci de choisir une réponse dans chaque liste.'], 422);
}

$ip = ipEmpreinte();
$st = db()->prepare('SELECT COUNT(*) FROM demandes WHERE ip_empreinte = ? AND cree_le > ?');
$st->execute([$ip, date('Y-m-d H:i:s', time() - 3600)]);
if ((int) $st->fetchColumn() >= cfg('demandes_par_heure')) {
    json(['ok' => false, 'message' => 'Trop de demandes envoyées depuis ce réseau. Réessayez dans une heure ou appelez-nous au 04 79 68 76 54.'], 429);
}

$jeton = nouveauJeton();
db()->prepare('INSERT INTO demandes (cree_le, nom, fonction, email, societe, tel, equipe, parc, message,
        newsletter, ip_empreinte, statut, email_jeton) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    ->execute([maintenant(), $d['nom'], $d['fonction'], $d['email'], $d['societe'], $d['tel'], $d['equipe'],
        $d['parc'], $d['message'], $d['newsletter'], $ip, 'email_a_confirmer', empreinte($jeton)]);
$d['id'] = (int) db()->lastInsertId();
journaliser($d['id'], 'demande_recue');

if (!mailVerification($d, $jeton)) {
    journaliser($d['id'], 'erreur_mail', 'E-mail de vérification non envoyé');
    json(['ok' => false, 'message' => "Votre demande est enregistrée mais l'e-mail de confirmation n'a pas pu partir. Appelez-nous au 04 79 68 76 54."], 500);
}
journaliser($d['id'], 'mail_verification_envoye');
json(['ok' => true]);
