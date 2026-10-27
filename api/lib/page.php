<?php
/* =====================================================================
   Gabarit des pages servies par api/ (confirmation, décision, lien
   personnel, espace équipe). Reprend les feuilles et composants du site.
   <base> pointe sur pages/ pour que les liens relatifs de l'en-tête et
   du pied de page fonctionnent ; les formulaires visent donc des URL
   absolues (fonction url()).
   ===================================================================== */
declare(strict_types=1);

/* Pages jamais indexées : elles ne servent qu'aux liens envoyés par e-mail */
function page(string $titre, string $contenu): never {
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    header('Referrer-Policy: no-referrer');   // les jetons ne fuient pas vers d'autres sites
    header('X-Frame-Options: DENY');
    $base = h(url('pages/'));
    echo <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<base href="$base">
<title>{$titre} · KYOLIS Manager</title>
<link rel="stylesheet" href="../css/tokens.css">
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/shared.css">
<link rel="stylesheet" href="../css/pages/espace.css">
</head>
<body>
<kyolis-header></kyolis-header>
$contenu
<kyolis-footer></kyolis-footer>
<script type="module" src="../js/main.js"></script>
</body>
</html>
HTML;
    exit;
}

/* Page simple : icône, sur-titre, titre, texte, et contenu libre en dessous */
function pageMessage(string $surTitre, string $titre, string $texte, string $suite = '', string $icone = 'mail'): never {
    $contenu = <<<HTML
<section class="hero-lite center">
  <div class="wrap narrow">
    <kyolis-icon name="$icone" size="56" style="color:var(--color-green)"></kyolis-icon>
    <div class="eyebrow" style="margin-top:16px">$surTitre</div>
    <h1>$titre</h1>
    <p class="lead">$texte</p>
    $suite
  </div>
</section>
HTML;
    page(strip_tags($titre), $contenu);
}
