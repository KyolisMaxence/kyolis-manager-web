# KYOLIS Manager — Site vitrine (Web Components)

Architecture atomique en HTML/CSS/JS natif, sans framework ni build.
Composants = Web Components natifs. Aucune dépendance d'exécution.

## Arborescence complète

    css/
      tokens.css              Charte (couleurs, type, espacements) — SOURCE UNIQUE
      base.css                Reset, polices, styles de contenu (light DOM)
      shared.css              Motifs réutilisés entre pages (.shot, .check-list,
                              .hero-lite, .grid-3, .note)
      pages/
        home.css              Styles propres à l'accueil
        securite.css          Styles propres à la page Sécurité
        telechargement.css    Styles propres au Téléchargement
        ressources.css        Styles propres aux Ressources
    js/
      core/
        KyolisElement.js      Classe de base des composants (factorise le boilerplate)
        reveal.js             Révélation au scroll mutualisée (IntersectionObserver)
      components/
        atoms/
          kyolis-button.js
          kyolis-icon.js      Bibliothèque de pictos SVG centralisée
          kyolis-badge.js
        molecules/
          kyolis-media-item.js
          kyolis-road-card.js
          kyolis-faq-item.js
        organisms/
          kyolis-header.js    Source unique (nav dans la constante NAV)
          kyolis-footer.js    Source unique
          kyolis-posture.js   Section posture, variante claire/sombre via [dark]
          kyolis-measure-block.js   Bloc mesure livrée (Sécurité)
          kyolis-feature-block.js   Bloc fonctionnalité (Fonctionnalités)
      main.js                 Point d'entrée : importe tout + active les reveals
    pages/
      index.html              Accueil
      fonctionnalites.html
      securite.html
      telechargement.html
      ressources.html

## Lancer en local

Les modules ES et le rendu des composants nécessitent un serveur HTTP
(pas d'ouverture en file://). Servir depuis la RACINE du projet :

    python3 -m http.server 8000

Puis ouvrir http://localhost:8000/pages/index.html

Avec VS Code + Live Server : ouvrir le dossier racine, clic droit sur
pages/index.html puis Open with Live Server. Les chemins relatifs (css/, js/)
sont conçus pour un service depuis la racine.

## Principes d'architecture

- Atomic design réel. atoms puis molecules puis organisms. Un composant =
  un fichier = une responsabilité. Les molécules composent des atomes,
  les organismes composent molécules et atomes.
- DRY. Header et footer sont des organismes uniques, zéro duplication
  entre pages. Le boilerplate des composants est dans KyolisElement.
  Les motifs CSS récurrents sont dans shared.css.
- Charte centralisée. Toutes les valeurs dans tokens.css sur :root.
  Jamais de couleur en dur, toujours var(--color-*). Les custom properties
  traversent le shadow DOM, les composants y accèdent sans les redéclarer.
- SEO / accessibilité. Le contenu rédactionnel (titres, paragraphes,
  listes) reste en light DOM via les slots, donc indexable. Le shadow DOM
  n'encapsule que structure et style. Focus clavier visible partout.
  prefers-reduced-motion respecté (reveal.js révèle sans animer).
- Pas de sur-découpage. Un layout unique (hero, grilles) reste une
  classe de page. On ne composantise que ce qui se réutilise.

Note technique : ::slotted() ne style que les éléments directs du slot,
pas leurs descendants. Les listes à puce (.check-list) sont donc stylées
en light DOM via shared.css, pas dans les composants.

## Créer un nouveau composant

1. Choisir le niveau (atom/molecule/organism) selon ce qu'il compose.
2. Créer js/components/<niveau>/kyolis-xxx.js :

    import { KyolisElement, define } from '../../core/KyolisElement.js';
    class KyolisXxx extends KyolisElement {
      render() {
        return {
          css: `:host{display:block}`,
          html: `<div><slot></slot></div>`,
        };
      }
    }
    define('kyolis-xxx', KyolisXxx);

3. L'importer dans js/main.js.

## À faire avant mise en ligne

1. POLICES EN LOCAL. Retirer l'@import Google Fonts dans base.css et
   activer les @font-face locaux (bloc en commentaire). Cohérence
   hors-ligne / souveraineté / CNIL. Déposer les .ttf dans assets/fonts/.
2. CAPTURES. Remplacer les zones .shot (rayées) et les attributs shot="..."
   des kyolis-feature-block par de vraies images.
3. TÉLÉCHARGEMENT. Renseigner version, date, taille, lien installeur et
   empreinte SHA-256 dans la dl-card. Ne pas affirmer la signature EV tant
   qu'elle n'est pas en place.
4. NEWSLETTER. Brancher le champ email sur l'outil choisi (Brevo conseillé).
5. CONTACT / MENTIONS. Compléter coordonnées, mentions légales, RGPD.
   Faire valider juridiquement le texte conformité et la posture.
6. CHANGELOG. Dupliquer le bloc .cl-entry dans ressources.html par version.

## Honnêteté (brief section 11)

Séparation visuelle livré vs feuille de route préservée (page Sécurité :
kyolis-measure-block pour le livré, kyolis-road-card pour le prévu).
Ne pas présenter une fonction de la feuille de route comme disponible.
Pas de témoignages tant qu'il n'y a pas de clients déployés.

## Charte

Pas d'orange : le #f57200 du brief est écarté (décision validée).
Base pétrole #445760, accent vert #359a66 (sémantique : conforme, livré, CTA).
Rouge #d32f2f réservé aux erreurs, non utilisé pour l'instant.
Titres Montserrat, corps Open Sans.
