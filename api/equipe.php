<?php
/* =====================================================================
   api/equipe.php : espace équipe, liste des demandes (le « mini CRM »).
   Protégé par le mot de passe de l'équipe (config.php). Chaque ligne
   ouvre la fiche signée de la demande (api/decision.php).
   ?vue=newsletter : inscrits confirmés ; ?export=newsletter : fichier CSV.
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

purgerDonneesExpirees();

$inscrits = db()->query('SELECT id, email, confirme_le, source FROM newsletter WHERE confirme_le IS NOT NULL ORDER BY confirme_le DESC')->fetchAll();
$ongletNewsletter = fn(bool $actif) => sprintf('<a href="../api/equipe.php?vue=newsletter"%s>Newsletter <span>%d</span></a>',
    $actif ? ' aria-current="page"' : '', count($inscrits));

/* Export CSV des inscrits confirmés, avec le lien de désinscription personnel
   à placer dans chaque envoi (obligatoire et promis aux inscrits) */
if (($_GET['export'] ?? '') === 'newsletter') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="newsletter-kyolis-manager-' . date('Y-m-d') . '.csv"');
    $sortie = fopen('php://output', 'w');
    fwrite($sortie, "\xEF\xBB\xBF");   // BOM : accents lisibles dans Excel
    fputcsv($sortie, ['email', 'inscrit_le', 'origine', 'lien_desinscription'], ';');
    foreach ($inscrits as $i) {
        fputcsv($sortie, [$i['email'], date('d/m/Y', strtotime($i['confirme_le'])),
            $i['source'] === 'demande' ? 'demande d\'accès' : 'site', lienDesinscription((int) $i['id'])], ';');
    }
    exit;
}

if (($_GET['vue'] ?? '') === 'newsletter') {
    $lignes = '';
    foreach ($inscrits as $i) {
        $lignes .= sprintf('<tr><td>%s</td><td>%s</td><td>%s</td><td><a href="%s">Désinscrire</a></td></tr>',
            h($i['email']), date('d/m/Y', strtotime($i['confirme_le'])),
            $i['source'] === 'demande' ? 'Demande d\'accès' : 'Site', h(lienDesinscription((int) $i['id'])));
    }
    $tableau = $lignes
        ? "<table class=\"espace-table\"><thead><tr><th>E-mail</th><th>Inscrit le</th><th>Origine</th><th></th></tr></thead><tbody>$lignes</tbody></table>"
        : '<p class="espace-note">Aucun inscrit pour l\'instant.</p>';
    $onglet = $ongletNewsletter(true);
    page('Newsletter', <<<HTML
<section class="espace">
  <div class="wrap espace__wrap">
    <a class="espace__retour" href="../api/equipe.php">← Demandes d'accès</a>
    <div class="eyebrow">Espace équipe</div>
    <h1>Inscrits à la newsletter</h1>
    <nav class="espace-onglets" aria-label="Rubriques"><a href="../api/equipe.php">Demandes d'accès</a>$onglet</nav>
    <p class="espace-note" style="margin:0 0 16px">Uniquement les adresses confirmées. Promesse faite aux inscrits : mises à jour et avis de sécurité seulement, jamais de démarchage commercial. Chaque envoi doit contenir le lien de désinscription de la personne (colonne du fichier exporté).</p>
    <div class="espace-actions" style="margin-bottom:16px"><a class="espace-btn espace-btn--ghost" style="display:inline-flex;align-items:center;text-decoration:none" href="../api/equipe.php?export=newsletter">Exporter en CSV</a></div>
    <div class="card espace-table-wrap">$tableau</div>
  </div>
</section>
HTML);
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
$onglets .= $ongletNewsletter(false);

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
