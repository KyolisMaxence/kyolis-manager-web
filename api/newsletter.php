<?php
/* =====================================================================
   POST api/newsletter.php : inscription depuis le bloc newsletter de
   pages/ressources.html (envoyé en fetch). Même fonctionnement que la
   demande d'accès : anti-robots sans service externe, puis e-mail de
   confirmation ; l'inscription n'est active qu'après le clic.
   Répond en JSON : { ok: true } ou { ok: false, message }.
   La réponse est identique que l'adresse soit nouvelle ou déjà inscrite :
   le formulaire ne permet pas de savoir qui est inscrit.
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json(['ok' => false, 'message' => 'Méthode non autorisée.'], 405);
}

// Robots : succès factice, rien n'est enregistré
$duree = (int) ($_POST['duree'] ?? 0);
if (trim((string) ($_POST['website'] ?? '')) !== '' || $duree < 2000) {
    json(['ok' => true]);
}

$email = mb_strtolower(mb_substr(trim((string) ($_POST['email'] ?? '')), 0, 190));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json(['ok' => false, 'message' => "L'adresse e-mail ne semble pas valide."], 422);
}

purgerDonneesExpirees();
$ip = ipEmpreinte();
$st = db()->prepare('SELECT COUNT(*) FROM newsletter WHERE ip_empreinte = ? AND cree_le > ?');
$st->execute([$ip, date('Y-m-d H:i:s', time() - 3600)]);
if ((int) $st->fetchColumn() >= cfg('demandes_par_heure')) {
    json(['ok' => false, 'message' => 'Trop d\'inscriptions envoyées depuis ce réseau. Réessayez dans une heure.'], 429);
}

$st = db()->prepare('SELECT id, confirme_le FROM newsletter WHERE email = ?');
$st->execute([$email]);
$existant = $st->fetch();
if ($existant && $existant['confirme_le']) {
    json(['ok' => true]);   // déjà inscrit : rien à faire, et on ne le dit pas
}

$jeton = nouveauJeton();
if ($existant) {
    db()->prepare('UPDATE newsletter SET jeton = ?, cree_le = ?, ip_empreinte = ? WHERE id = ?')
        ->execute([empreinte($jeton), maintenant(), $ip, $existant['id']]);
} else {
    db()->prepare("INSERT INTO newsletter (email, cree_le, jeton, source, ip_empreinte) VALUES (?, ?, ?, 'site', ?)")
        ->execute([$email, maintenant(), empreinte($jeton), $ip]);
}

if (!mailNewsletterConfirmation($email, $jeton)) {
    json(['ok' => false, 'message' => "L'e-mail de confirmation n'a pas pu partir. Réessayez plus tard."], 500);
}
json(['ok' => true]);
