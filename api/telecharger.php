<?php
/* =====================================================================
   api/telecharger.php?t=JETON : lien personnel envoyé au demandeur accepté.
   GET  : page avec le bouton de téléchargement (rien n'est compté :
          les messageries qui analysent les liens ne consomment rien).
   POST : vérifie validité et quota, compte, puis envoie le fichier.
   Le fichier est hors du dossier public : impossible de le récupérer
   sans lien personnel valable.
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

$jeton = (string) ($_POST['t'] ?? $_GET['t'] ?? '');
$acces = null;
if (preg_match('/^[a-f0-9]{64}$/', $jeton)) {
    $st = db()->prepare("SELECT a.*, d.nom, d.statut FROM acces a JOIN demandes d ON d.id = a.demande_id WHERE a.jeton = ?");
    $st->execute([empreinte($jeton)]);
    $acces = $st->fetch() ?: null;
}

$contact = '<p class="note" style="margin-top:24px">Besoin d\'un nouveau lien ? Écrivez-nous à <a href="mailto:contact@kyolismanager.com">contact@kyolismanager.com</a> ou appelez le 04 79 68 76 54.</p>';

if (!$acces || $acces['statut'] !== 'acceptee') {
    http_response_code(404);
    pageMessage('Lien invalide', 'Ce lien n\'est pas reconnu', 'Vérifiez qu\'il a été copié en entier depuis l\'e-mail reçu.', $contact, 'lock');
}
if (strtotime($acces['expire_le']) < time()) {
    http_response_code(410);
    pageMessage('Lien expiré', 'Ce lien a expiré', 'Pour votre sécurité, chaque lien personnel n\'est valable que quelques jours.', $contact, 'lock');
}
if ($acces['telechargements'] >= $acces['max_telechargements']) {
    http_response_code(410);
    pageMessage('Lien épuisé', 'Ce lien a déjà servi', 'Le nombre de téléchargements prévus pour ce poste est atteint.', $contact, 'lock');
}

$fichier = (string) cfg('installateur');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $action = h(url('api/telecharger.php'));
    $version = h($acces['version']);
    $nom = h($acces['nom']);
    $date = date('d/m/Y', strtotime($acces['expire_le']));
    $indispo = is_file($fichier) ? '' : '<p class="espace-erreur">Le fichier est en cours de mise à disposition. Réessayez un peu plus tard ou contactez-nous.</p>';
    pageMessage('Votre accès personnel', 'KYOLIS Manager ' . $version,
        "Bonjour $nom, votre application est prête. Ce lien est réservé à votre poste et reste valable jusqu'au $date.",
        <<<HTML
<form method="post" action="$action" class="espace-form">
  <input type="hidden" name="t" value="$jeton">
  $indispo
  <button type="submit" class="espace-btn">Télécharger pour Windows</button>
</form>
<p class="note" style="margin-top:24px">Avant d'installer, comparez l'empreinte du fichier avec celle publiée sur la page <a href="versions.html#verifier">Notes de version</a>.</p>
HTML, 'download');
}

if (!is_file($fichier)) {
    journaliser((int) $acces['demande_id'], 'erreur_fichier', 'Installateur introuvable sur le serveur');
    http_response_code(503);
    pageMessage('Indisponible', 'Fichier momentanément indisponible', 'Notre équipe est prévenue. Réessayez un peu plus tard.', $contact, 'lock');
}

db()->prepare('UPDATE acces SET telechargements = telechargements + 1, dernier_le = ? WHERE id = ?')
    ->execute([maintenant(), $acces['id']]);
journaliser((int) $acces['demande_id'], 'telechargement', 'Version ' . $acces['version']);

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename((string) cfg('installateur_nom')) . '"');
header('Content-Length: ' . filesize($fichier));
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
readfile($fichier);
