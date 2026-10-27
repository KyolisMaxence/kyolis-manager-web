<?php
/* =====================================================================
   api/equipe.php : espace équipe, liste des demandes (le « mini CRM »).
   Protégé par le mot de passe de l'équipe (config.php). Chaque ligne
   ouvre la fiche signée de la demande (api/decision.php).
   ===================================================================== */
declare(strict_types=1);
require __DIR__ . '/lib/bootstrap.php';
exigerEquipe();

if (isset($_GET['deconnexion'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: ' . url('pages/index.html'), true, 303);
    exit;
}

$filtre = (string) ($_GET['statut'] ?? 'a_traiter');
if ($filtre !== 'toutes' && !isset(LIBELLES_STATUT[$filtre])) $filtre = 'a_traiter';

$sql = 'SELECT id, cree_le, nom, societe, parc, statut FROM demandes'
    . ($filtre === 'toutes' ? '' : ' WHERE statut = ?') . ' ORDER BY id DESC LIMIT 500';
$st = db()->prepare($sql);
$st->execute($filtre === 'toutes' ? [] : [$filtre]);
$demandes = $st->fetchAll();

$compteurs = [];
foreach (db()->query('SELECT statut, COUNT(*) AS n FROM demandes GROUP BY statut') as $c) {
    $compteurs[$c['statut']] = (int) $c['n'];
}

$onglets = '';
foreach (['a_traiter' => 'À traiter', 'acceptee' => 'Acceptées', 'refusee' => 'Refusées',
          'email_a_confirmer' => 'E-mail à confirmer', 'toutes' => 'Toutes'] as $cle => $libelle) {
    $n = $cle === 'toutes' ? array_sum($compteurs) : ($compteurs[$cle] ?? 0);
    $actif = $cle === $filtre ? ' aria-current="page"' : '';
    $onglets .= sprintf('<a href="../api/equipe.php?statut=%s"%s>%s <span>%d</span></a>', $cle, $actif, $libelle, $n);
}

$lignes = '';
foreach ($demandes as $d) {
    $lien = '../api/decision.php?id=' . $d['id'] . '&amp;s=' . signer('decision:' . $d['id']);
    $lignes .= sprintf('<tr><td>%d</td><td>%s</td><td><a href="%s">%s</a></td><td>%s</td><td>%s</td><td>%s</td></tr>',
        $d['id'], date('d/m/Y', strtotime($d['cree_le'])), $lien, h($d['nom']), h($d['societe']),
        h(LIBELLES_PARC[$d['parc']] ?? $d['parc']), h(LIBELLES_STATUT[$d['statut']] ?? $d['statut']));
}
$tableau = $lignes
    ? "<table class=\"espace-table\"><thead><tr><th>N°</th><th>Reçue le</th><th>Nom</th><th>Société</th><th>Switches</th><th>Statut</th></tr></thead><tbody>$lignes</tbody></table>"
    : '<p class="espace-note">Aucune demande dans cette catégorie.</p>';

page('Espace équipe', <<<HTML
<section class="espace">
  <div class="wrap espace__wrap">
    <a class="espace__retour" href="../api/equipe.php?deconnexion=1">Se déconnecter</a>
    <div class="eyebrow">Espace équipe</div>
    <h1>Demandes d'accès</h1>
    <nav class="espace-onglets" aria-label="Filtrer par statut">$onglets</nav>
    <div class="card espace-table-wrap">$tableau</div>
  </div>
</section>
HTML);
