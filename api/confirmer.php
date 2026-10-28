<?php
/* =====================================================================
   api/confirmer.php?t=JETON : lien de l'e-mail de vérification.
   GET  : affiche un bouton « Confirmer mon adresse » (aucune action,
          les messageries qui analysent les liens ne confirment rien).
   POST : confirme l'adresse, passe la demande « à traiter » et prévient
          l'équipe par e-mail.
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';

const JOURS_VALIDITE_VERIFICATION = 7;

$jeton = (string) ($_POST['t'] ?? $_GET['t'] ?? '');
$demande = null;
if (preg_match('/^[a-f0-9]{64}$/', $jeton)) {
    $st = db()->prepare("SELECT * FROM demandes WHERE email_jeton = ? AND statut = 'email_a_confirmer'");
    $st->execute([empreinte($jeton)]);
    $demande = $st->fetch() ?: null;
}

$lienAccueil = '<div style="margin-top:32px"><kyolis-button href="index.html" variant="ghost">Retour à l\'accueil</kyolis-button></div>';

if (!$demande || strtotime($demande['cree_le']) < time() - JOURS_VALIDITE_VERIFICATION * 86400) {
    http_response_code(404);
    pageMessage('Lien expiré', 'Ce lien n\'est plus valable',
        'Il a peut-être déjà servi, ou il date de plus de ' . JOURS_VALIDITE_VERIFICATION . ' jours. Si votre adresse est déjà confirmée, notre équipe revient vers vous rapidement. Sinon, vous pouvez refaire une demande.',
        '<div style="margin-top:32px"><kyolis-button href="demande-acces.html">Refaire une demande</kyolis-button></div>');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $action = h(url('api/confirmer.php'));
    pageMessage('Dernière étape', 'Confirmez votre adresse',
        'Un clic pour confirmer l\'adresse <b>' . h($demande['email']) . '</b> et transmettre votre demande à l\'équipe KYOLIS®.',
        <<<HTML
<form method="post" action="$action" class="espace-form">
  <input type="hidden" name="t" value="$jeton">
  <button type="submit" class="espace-btn">Confirmer mon adresse</button>
</form>
HTML);
}

db()->prepare("UPDATE demandes SET statut = 'a_traiter', email_confirme_le = ?, email_jeton = NULL WHERE id = ?")
    ->execute([maintenant(), $demande['id']]);
journaliser((int) $demande['id'], 'email_confirme');
// Case newsletter cochée : l'adresse vient d'être vérifiée, l'inscription est active
if ($demande['newsletter']) inscrireNewsletterConfirmee($demande['email']);

if (mailEquipe($demande)) {
    journaliser((int) $demande['id'], 'equipe_prevenue');
} else {
    journaliser((int) $demande['id'], 'erreur_mail', 'Alerte équipe non envoyée');
}

pageMessage('Adresse confirmée', 'Merci, votre demande est transmise',
    'Un membre de l\'équipe KYOLIS® vous contacte rapidement pour échanger sur vos besoins. Vous recevrez ensuite votre accès personnel par e-mail.',
    $lienAccueil, 'shield');
