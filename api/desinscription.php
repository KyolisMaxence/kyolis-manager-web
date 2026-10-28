<?php
/* =====================================================================
   api/desinscription.php?n=12&s=SIGNATURE : lien de désinscription placé
   dans chaque newsletter (fonction lienDesinscription()).
   GET : bouton « Me désinscrire » ; POST : supprime l'inscription.
   Pour les newsletters envoyées plus tard, ajouter aussi les en-têtes
   List-Unsubscribe et List-Unsubscribe-Post : les messageries affichent
   alors leur propre bouton « Se désabonner » (désinscription en un clic).
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

$id = (int) ($_POST['n'] ?? $_GET['n'] ?? 0);
$sig = (string) ($_POST['s'] ?? $_GET['s'] ?? '');
$inscrit = null;
if ($id && signatureValide('desinscription:' . $id, $sig)) {
    $st = db()->prepare('SELECT * FROM newsletter WHERE id = ?');
    $st->execute([$id]);
    $inscrit = $st->fetch() ?: null;
}

$accueil = '<div style="margin-top:32px"><kyolis-button href="index.html" variant="ghost">Retour à l\'accueil</kyolis-button></div>';

if (!$inscrit) {
    pageMessage('Newsletter', 'Vous n\'êtes plus inscrit',
        'Cette adresse ne reçoit plus la newsletter de KYOLIS® Manager.', $accueil, 'mail');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $action = h(url('api/desinscription.php'));
    $sigH = h($sig);
    pageMessage('Newsletter', 'Se désinscrire',
        'L\'adresse <b>' . h($inscrit['email']) . '</b> ne recevra plus les mises à jour ni les avis de sécurité de KYOLIS® Manager.',
        <<<HTML
<form method="post" action="$action" class="espace-form">
  <input type="hidden" name="n" value="$id">
  <input type="hidden" name="s" value="$sigH">
  <button type="submit" class="espace-btn">Me désinscrire</button>
</form>
HTML, 'mail');
}

// L'adresse est effacée, pas seulement marquée : plus rien n'est conservé
db()->prepare('DELETE FROM newsletter WHERE id = ?')->execute([$id]);
pageMessage('Newsletter', 'Désinscription confirmée',
    'Votre adresse a été supprimée de notre liste. Vous pouvez vous réinscrire à tout moment depuis la page L\'application.',
    $accueil, 'mail');
