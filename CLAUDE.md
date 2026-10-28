# CLAUDE.md — KYOLIS Manager (site vitrine)

Point de situation pour reprendre le travail. Dernière mise à jour : 18/06/2026.

## Reprise du 29/10/2026 (mise en ligne)

- **Hébergement OVH Perso 48 mois payé le 28/10** (commande 261570359, 114,62 € TTC), en cours de
  livraison. À sa livraison : onglet « Mes sites » → ajouter kyolismanager.com + www, activer le
  SSL Let's Encrypt (non coché dans le tunnel, gratuit), récupérer l'accès FTP-SSH.
- **Config de production prête** : `storage/deploiement/config.php` (non versionnée ; secret,
  https://kyolismanager.com, SQLite hors www dans `../../kyolis-data/`, mot de passe équipe déjà
  défini par l'utilisateur via `tools/mot-de-passe-equipe.py`).
- **Paquet à déposer** : `python tools/preparer-deploiement.py` → `storage/deploiement/www/` (+ zip),
  à copier dans le dossier www de l'hébergement. Méthode d'envoi à choisir (WinSCP avec connexion
  enregistrée par l'utilisateur, ou explorateur FTP OVH). Jamais saisir le mot de passe FTP soi-même.
- Puis : tester en ligne (vraie demande, e-mails depuis contact@kyolismanager.com, espace équipe).
- Prévu aussi le 29/10 : adresse de contact dans l'app, lien SBOM, fichier d'installation 1.0.0
  (« Accepter » reste bloqué tant qu'il n'est pas dans `kyolis-data/installateurs/`).
- Travail du 28/10 **pas encore commité** au moment de l'arrêt.

## Le projet

Site vitrine de **KYOLIS Manager**, le logiciel d'administration des switches réseau KYOLIS
(Windows, local/hors ligne). HTML/CSS/JS natif, **Web Components**, sans framework ni build.

**Positionnement validé (terrain, pas conformité d'abord) :** l'app est un outil
d'**observation et de diagnostic** de parc. Le fil rouge : « fini le switch par switch ».
Elle **scanne** le réseau, **repère** les anomalies (IP en doublon, mots de passe faibles,
firmwares à mettre à jour), puis on **résout** soit par une action directe, soit en ouvrant
le switch (interface web ou SSH/Telnet). La sécurité/conformité est une **preuve**, pas l'accroche.

## Lancer en local

```bash
cd /Users/maxence_vp/Desktop/kyolis-manager-web
python3 -m http.server 8000
```
Ouvrir **http://localhost:8000/pages/index.html** (toujours via HTTP, jamais en `file://` :
les modules ES et Web Components sont bloqués sinon).

## Architecture

```
assets/img/logo.png          Logo KYOLIS (symbole carré, 500x500)
css/  tokens.css  base.css  shared.css   + pages/{home,securite,demande-acces,versions,ressources}.css
data/ releases.json          Source unique des versions (notes de version, canaux stable/bêta, SHA-256)
js/   main.js (point d'entrée)
      core/        KyolisElement.js (classe de base) · reveal.js (apparition au scroll)
      components/  atoms/      kyolis-button · kyolis-icon · kyolis-badge
                   molecules/  kyolis-media-item · kyolis-road-card · kyolis-faq-item
                   organisms/  kyolis-header · kyolis-footer · kyolis-posture
                               kyolis-measure-block · kyolis-feature-block
                               kyolis-app-shot (maquette HTML de l'app, 7 vues, remplaçable par src=)
                               kyolis-release-list (rend data/releases.json, en light DOM)
pages/  index.html · fonctionnalites.html · securite.html · versions.html · ressources.html
        demande-acces.html · demande-envoyee.html
```

**Direction visuelle (oct. 2026)** : couleurs et polices = charte KYOLIS ; structure inspirée de
Raycast : échelle de surfaces pétrole (`--dark-0..3`), filets de 1px au lieu d'ombres, rayons
serrés (4 à 16px), rythme de section 96px, un seul bouton principal (vert), héros sombre avec le
produit au centre et un seul « moment signature » (bandes diagonales vertes). L'ambre
`--color-amber` est réservé aux illustrations d'interface.
Les pages sont dans `pages/`, donc les chemins pointent en `../css/…`, `../js/…`, `../assets/…`.
Header et footer sont des organismes uniques (source unique pour toutes les pages).

## Conventions de rédaction (IMPORTANT)

- **Nom du produit : « KYOLIS® Manager »** (plus jamais « Desktop »).
- **Marque : toujours « KYOLIS® »** (® = Alt 0174) dans tout texte visible : pages, titres,
  textes alternatifs, e-mails, pages de `api/`, notes de version (décision du 28/10/2026).
  Pas dans les noms de fichiers, adresses, URL ni commentaires de code.
- **Discours conformité** : lister **NIS2, CRA, ISO 27001**. **ANSSI** est une agence, pas une
  norme : elle n'apparaît **qu'une fois, sur la page Sécurité, dans son rôle** (recommandations).
  Toujours dire **« aligné sur »**, jamais **« conforme »** (tant que non certifié).
  « Conformité » reste OK quand on parle de celle du **client**.
- **Style** : **jamais de tiret cadratin « — » ni de « -- »** dans le texte (ça fait robot).
  Virgules, deux-points, parenthèses ou vraie phrase à la place. (Les `--` du CSS sont du code.)
- Ton **grand public** (« on parle au vendeur, pas au mécano ») : éviter le jargon.

## État d'avancement

**Fait :**
- Structure rangée, site fonctionnel en local.
- Renommage KYOLIS Manager partout + logo dans le header + CTA (Télécharger / Contacter l'équipe).
- **Accueil** : entièrement relu et validé (hero, étapes Scanner/Repérer/Résoudre, bénéfices,
  bloc sécurité, « Nos valeurs » / « KYOLIS conseille, vous agissez »).
- **Fonctionnalités** : retour du patron appliqué (ordre 1‑5‑3‑4‑2‑7‑6 + corrections de contenu).
- **Sécurité** : page **validée et close**. Badges = NIS2 · CRA · ISO 27001, ANSSI gardé une
  seule fois dans son rôle, titre « Quatre cadres, une même exigence », mesures/posture OK. Section « Notre vision » (feuille de route) supprimée le 27/10/2026
  à la demande ; le composant `kyolis-road-card` est gardé, inutilisé, si elle revient.
- Discours « aligné sur » harmonisé + tirets de prose supprimés.

**Reste à faire :**
- **Obtenir l'application** (ex-Téléchargement) : Phase 1 faite (page de demande + formulaire +
  pop-up newsletter, design moderne 2 colonnes). Champs : nom, société, e-mail pro, téléphone,
  besoin (tous required) + case newsletter cochée par défaut. Oct. 2026 : fichier renommé
  `demande-acces.html` (textes validés inchangés). **Phase 2 back faite le 27/10/2026** dans `api/`
  (PHP 8, MySQL chez OVH, SQLite en local) : demande, e-mail de vérification, alerte équipe,
  espace équipe `api/equipe.php` (mot de passe) avec fiche, note, Accepter/Refuser, lien personnel
  7 jours / 3 téléchargements, identifiant de poste créé à l'acceptation (futur code d'activation).
  Anti-robots sans service externe (choix de l'utilisateur). Testé de bout en bout en local.
  Mise en ligne : voir `api/INSTALLATION.md`. Local : `python tools/serve-php.py` (PHP installé
  via winget). Lien « Configurer Windows Hello » vérifié le 28/10/2026 (nouvelle adresse Microsoft).
  `.ovhconfig` à la racine : PHP 8.3 chez OVH.
- **Ressources** (page L'application) : notes de version en tête (renvoi vers `versions.html`),
  FAQ ensuite. SBOM à approfondir. Idée pour plus tard : **page tuto** avec
  vidéos YouTube pour accompagner l'installation.
- README à remettre à jour (il parle encore de « Desktop » et est en retard sur la réalité).

## Textes validés le 28/10/2026 (Doc « Textes à valider »)

Les patrons ont validé **en bloc** tous les textes ajoutés en octobre : section « Un accès
personnel » de l'accueil (4 étapes), nouveaux champs du formulaire, page `versions.html`, bloc
« Cartographie du réseau », 7 nouveautés de la partie 4 (dont « Intégrité vérifiée » sur
Sécurité), meta descriptions, e-mails et pages du parcours d'accès (`api/`), corrections de la
partie 2. **Ils sont désormais intouchables comme les autres.** Tout nouveau texte passe par le
Doc https://claude.ai/artifact/4WCr8aVMQR1ubZwBTRf9Wq.

Décisions du 28/10 :
- Fonctions qui existent mais ne font pas la différence, **retirées du site** : allumer/éteindre
  un switch, badge de fin de vie, mots de passe compromis avec temps de cassage.
- **Notes de version** : uniquement sur `versions.html` (lien dans le menu et le pied de page) ;
  la page L'application garde son bloc titre et renvoie vers elle par un bouton.
- Le menu ayant 5 liens, il passe au bouton à trois traits **sous 1140px**.
- **Bouton principal : « Recevoir l'application »** (remplace « Obtenir l'application », qui
  laissait croire à un téléchargement immédiat) sur tous les boutons et le pied de page ; le
  libellé de l'en-tête vit dans `CTA` (`kyolis-header.js`). Sur-titres et titre de la page de
  demande et de l'accueil aussi en « Recevoir l'application » ; titre « Obtenez KYOLIS Manager. » gardé.
- Encore ouvert : 3 étapes (page de demande) ou 4 étapes (accueil) pour décrire le parcours.

**RGPD (28/10/2026, validé par les patrons le jour même)** : `pages/mentions-legales.html` et
`pages/confidentialite.html` (modèle lakyobox.com ; identité officielle KYOLIS SAS, RCS Nanterre
519 722 698, Antony ; directeur de la publication Stéphane Manuse ; hébergeur OVH). Polices servies
en local (`assets/fonts/`, OFL, copiées des paquets Fontsource de l'app) : aucun tiers, donc pas de
bandeau cookies. Case newsletter **décochée par défaut** + phrase « Jamais de démarchage
commercial… ». Durées de conservation appliquées par `purgerDonneesExpirees()` (api/lib/bootstrap.php).

## Décisions / changements actés (à implémenter plus tard)

- **Accès sur demande** (décision patrons) : l'app n'est **plus en téléchargement libre**.
  L'utilisateur remplit un **formulaire**, l'équipe échange avec lui, puis partage l'app.
  Implique : transformer `telechargement.html` en page de demande, changer tous les CTA
  « Télécharger ». Libellé du CTA tranché le 28/10/2026 : « Recevoir l'application ».
  (Options de parcours et anti-spam déjà discutées : formulaire simple / vérif e-mail /
  qualification + revue / lien d'accès personnel.)

## Placeholders à remplacer avant mise en ligne

- Lien **Contacter l'équipe** : mène à `ressources.html#contact`, où le **téléphone 04 79 68 76 54**
  est confirmé. E-mail **`contact@kyolismanager.com`** (sans tiret : c'est le domaine que KYOLIS
  possède chez OVH, avec .fr/.eu/.pro), boîte demandée à l'IT le 27/10/2026. Le bouton « Nous
  contacter » ouvre un e-mail vers cette adresse. L'app affichait contact@kyolis-manager.com
  (avec tiret, domaine non détenu) : l'utilisateur la corrige dans l'app avant la mise en ligne.
  Pas de rachat du domaine avec tiret (décidé le 27/10/2026).
- **Domaine du site : kyolismanager.com.** Chez OVH, le seul hébergement (offre Starter, sans base
  de données) sert déjà lakyobox.com : il faut un **hébergement dédié** au site (achat à valider).
  Le code tourne aussi avec SQLite si l'hébergement n'a pas de MySQL.
- **Captures réelles** : originaux dans `assets/img/captures/` (non versionnés, données sensibles),
  versions floutées publiables dans `assets/img/app/` via `python tools/masquer-captures.py`.
  Photo SBOM non publiée tant que l'app affiche des paquets vulnérables (correction à la prochaine MAJ).
- **Captures d'écran** : vraies captures intégrées (oct. 2026) sur l'accueil, Fonctionnalités et
  Sécurité, via `src` (recadrage `-cadre.webp`) et `full` (image entière, agrandie au clic) sur
  `kyolis-app-shot`, `kyolis-feature-block` et `kyolis-measure-block`. Les maquettes HTML restent
  en secours quand `src` est absent.
- **Menu mobile** : fait (27/10/2026). Sous 1140px, bouton à trois traits dans `kyolis-header` qui
  déroule les liens + « Contacter l'équipe » ; « Obtenir l'application » reste visible dans la barre.
  Fermeture au clic sur un lien, à côté, ou avec Échap.
- **Téléchargement** : version, date, taille, lien, **empreinte SHA-256** (ne pas affirmer la
  signature EV tant qu'elle n'existe pas).
- **Logos** : fournis (oct. 2026) dans `assets/img/logo/` (horizontal et vertical, couleur, blanc,
  noir). En-tête = horizontal couleur (blanc sur le héros sombre), pied de page = horizontal blanc.
- **Serveur local** : `python tools/serve-php.py` (site + formulaire PHP, sans cache) ;
  `python tools/serve.py` reste disponible pour le site seul, sans PHP.
- **Polices** : en local depuis le 28/10/2026 (plus de Google Fonts).
- **Mentions légales + RGPD** : faites et validées (28/10/2026).
- **Newsletter** : branchée le 28/10/2026, même fonctionnement que la demande d'accès
  (`api/newsletter.php` → e-mail de confirmation → `newsletter-confirmer.php` ; désinscription signée
  `desinscription.php`, l'adresse est effacée). La case du formulaire de demande inscrit aussi, une fois
  l'adresse vérifiée. Espace équipe : onglet « Newsletter » + export CSV avec le lien de désinscription
  de chaque inscrit. **L'envoi des newsletters n'est pas codé** : exporter et envoyer avec l'outil de
  l'équipe, en ajoutant le lien de désinscription (et idéalement l'en-tête List-Unsubscribe).
- **SBOM** réel (CycloneDX) : lien du pied de page vide, à relier à l'app (prévu le 29/10).
- **Version 1.0.0** : fichier d'installation pas encore disponible ; date, taille et SHA-256 à
  ajouter dans `data/releases.json` quand il arrive (`Get-FileHash fichier.exe -Algorithm SHA256`).
- Pas encore versionné (git) ni déployé. **Hébergement = OVH** (pro, hébergeur français,
  cohérent souveraineté). Site statique sur hébergement web OVH ; le back-end du formulaire
  (accès sur demande) se fera en **PHP/MySQL** côté OVH, e-mail via SMTP OVH ou Mailjet (FR).

## À valider avec les patrons (notes de réunion)

1. Quelles **fonctions de sécurité** sont réellement livrées vs roadmap.
2. **Infos de téléchargement** réelles (version, lien, SHA-256, signature).
3. **Captures** de l'app.
4. **Modèle commercial** (gratuit/licence, réservé clients, etc.).
