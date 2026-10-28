<?php
/* =====================================================================
   api/newsletter-confirmer.php?t=JETON : lien de l'e-mail de confirmation.
   GET : bouton « Confirmer mon inscription » (rien ne se passe sur un simple
   clic analysé par une messagerie) ; POST : active l'inscription.
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

$jeton = (string) ($_POST['t'] ?? $_GET['t'] ?? '');
$inscrit = null;
if (preg_match('/^[a-f0-9]{64}$/', $jeton)) {
    $st = db()->prepare('SELECT * FROM newsletter WHERE jeton = ? AND confirme_le IS NULL');
    $st->execute([empreinte($jeton)]);
    $inscrit = $st->fetch() ?: null;
}

$accueil = '<div style="margin-top:32px"><kyolis-button href="index.html" variant="ghost">Retour à l\'accueil</kyolis-button></div>';

if (!$inscrit) {
    http_response_code(404);
    pageMessage('Lien expiré', 'Ce lien n\'est plus valable',
        'Votre inscription est peut-être déjà confirmée. Sinon, vous pouvez vous réinscrire depuis la page L\'application.',
        '<div style="margin-top:32px"><kyolis-button href="ressources.html#newsletter">S\'inscrire à nouveau</kyolis-button></div>', 'mail');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $action = h(url('api/newsletter-confirmer.php'));
    pageMessage('Newsletter', 'Confirmez votre inscription',
        'Un clic pour recevoir les mises à jour et les avis de sécurité de KYOLIS® Manager à l\'adresse <b>' . h($inscrit['email']) . '</b>.',
        <<<HTML
<form method="post" action="$action" class="espace-form">
  <input type="hidden" name="t" value="$jeton">
  <button type="submit" class="espace-btn">Confirmer mon inscription</button>
</form>
HTML, 'mail');
}

db()->prepare('UPDATE newsletter SET confirme_le = ?, jeton = NULL WHERE id = ?')->execute([maintenant(), $inscrit['id']]);

pageMessage('Inscription confirmée', 'Merci, vous êtes inscrit',
    'Vous serez prévenu à chaque nouvelle version et à chaque avis de sécurité important. Jamais de démarchage commercial. Chaque e-mail contient un lien de désinscription.',
    $accueil, 'shield');
