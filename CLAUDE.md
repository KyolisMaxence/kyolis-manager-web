# CLAUDE.md — KYOLIS Manager (site vitrine)

Point de situation pour reprendre le travail. Dernière mise à jour : 18/06/2026.

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

- **Nom du produit : « KYOLIS Manager »** (plus jamais « Desktop »).
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
  via winget). Lien « Configurer Windows Hello » présent mais **URL Microsoft à vérifier**.
- **Ressources** : à réordonner = mettre le **versionnement / changelog de l'app EN TÊTE**, la
  **FAQ ensuite** (pas l'inverse). + SBOM à approfondir. Idée pour plus tard : **page tuto** avec
  vidéos YouTube pour accompagner l'installation.
- README à remettre à jour (il parle encore de « Desktop » et est en retard sur la réalité).

## Textes nouveaux À FAIRE VALIDER (ajoutés en oct. 2026)

Les textes déjà validés sont restés **mot pour mot** (ne jamais les reformuler sans accord).
Les textes ci-dessous sont nouveaux et doivent passer par les patrons :

1. **Accueil**, section « Obtenir l'application » : titre « Un accès personnel, pas un
   téléchargement anonyme », son paragraphe et les 4 étapes (demande, confirmation e-mail,
   échange, accès).
2. **Page de demande** : phrase « Une demande correspond à un poste… », intitulés de groupes
   « Vous » / « Votre réseau », nouveaux champs « Fonction », « Déjà équipé KYOLIS ? »,
   « Nombre de switches » et leurs choix.
3. **Page `versions.html`** (entière) : titre, intro, étiquette « Version actuelle » (pas de
   programme bêta : la 1.0.0 est la version publiée), bloc « Vérifiez le fichier reçu » (commande PowerShell, mention de
   l'avertissement Windows), bloc final « Être prévenu de chaque version ». Le contenu de la
   version 1.0.0 reprend le changelog validé. **Doublon à trancher** : le changelog est aussi
   toujours sur Ressources.
4. **Accès à `versions.html`** : lien « Notes de version » ajouté dans le pied de page
   uniquement (le menu validé n'a pas été touché). Ajout au menu à décider.
5. **Bloc « Cartographie du réseau »** (dernier bloc de Fonctionnalités, nouveauté de l'app) :
   titre « Voyez comment votre réseau est câblé », intro et 4 puces. Textes alternatifs (alt) des
   captures : reprennent les titres des blocs.
6. **Meta descriptions** (Google) de l'accueil, de la page de demande et de `versions.html`.
8. **Nouveautés repérées dans l'app** (Doc, partie 4) : 7 lignes ajoutées, marquées
   `<!-- Ligne nouvelle (Doc, partie 4) -->` (6 sur Fonctionnalités, 1 sur Sécurité « Intégrité
   vérifiée », à retirer si refusée). Plus le texte alternatif de la capture « Session verrouillée ».
9. **Textes du parcours d'accès** (`api/lib/mail.php` et pages de `api/`) : les 3 e-mails
   (vérification, alerte équipe, accès personnel), les pages « Confirmez votre adresse »,
   « Merci, votre demande est transmise », lien personnel, liens expirés, messages d'erreur
   du formulaire et « Envoi en cours… ».
**Partie 2 du Doc tranchée (27/10/2026)** : corrections 1, 3, 4, 5, 6 validées et appliquées
(bénéfices de l'accueil, appel final « Demandez votre accès… », syslog « export texte », partage
« clé générée par l'application »). Point 2 (pastille « Tout le parc en un scan ») inchangé.
Ces textes sont désormais validés.
7. ~~**Incohérence à signaler**~~ (réglée, voir ci-dessus) (texte validé, gardé tel quel) : l'appel final de l'accueil dit
   « Téléchargez KYOLIS Manager… », alors que l'accès est désormais sur demande.

## Décisions / changements actés (à implémenter plus tard)

- **Accès sur demande** (décision patrons) : l'app n'est **plus en téléchargement libre**.
  L'utilisateur remplit un **formulaire**, l'équipe échange avec lui, puis partage l'app.
  Implique : transformer `telechargement.html` en page de demande, changer tous les CTA
  « Télécharger ». Libellé du CTA non encore tranché. **Ne pas coder tant que non validé.**
  (Options de parcours et anti-spam déjà discutées : formulaire simple / vérif e-mail /
  qualification + revue / lien d'accès personnel.)

## Placeholders à remplacer avant mise en ligne

- Lien **Contacter l'équipe** : mène à `ressources.html#contact`, où le **téléphone 04 79 68 76 54**
  est confirmé. L'e-mail `contact@kyolis-manager.com` (le même que dans l'app) est affiché
  **par avance** (27/10/2026) : la boîte est **à faire créer par l'IT** avant la mise en ligne.
  Le bouton « Nous contacter » ouvre un e-mail vers cette adresse.
- **Captures réelles** : originaux dans `assets/img/captures/` (non versionnés, données sensibles),
  versions floutées publiables dans `assets/img/app/` via `python tools/masquer-captures.py`.
  Photo SBOM non publiée tant que l'app affiche des paquets vulnérables (correction à la prochaine MAJ).
- **Captures d'écran** : vraies captures intégrées (oct. 2026) sur l'accueil, Fonctionnalités et
  Sécurité, via `src` (recadrage `-cadre.webp`) et `full` (image entière, agrandie au clic) sur
  `kyolis-app-shot`, `kyolis-feature-block` et `kyolis-measure-block`. Les maquettes HTML restent
  en secours quand `src` est absent.
- **Menu mobile** : fait (27/10/2026). Sous 920px, bouton à trois traits dans `kyolis-header` qui
  déroule les liens + « Contacter l'équipe » ; « Obtenir l'application » reste visible dans la barre.
  Fermeture au clic sur un lien, à côté, ou avec Échap.
- **Téléchargement** : version, date, taille, lien, **empreinte SHA-256** (ne pas affirmer la
  signature EV tant qu'elle n'existe pas).
- **Logos** : fournis (oct. 2026) dans `assets/img/logo/` (horizontal et vertical, couleur, blanc,
  noir). En-tête = horizontal couleur (blanc sur le héros sombre), pied de page = horizontal blanc.
- **Serveur local** : `python tools/serve-php.py` (site + formulaire PHP, sans cache) ;
  `python tools/serve.py` reste disponible pour le site seul, sans PHP.
- **Polices** : basculer les Google Fonts en local (souveraineté / CNIL) avant prod.
- **Mentions légales + RGPD**, newsletter / avis de sécurité, **SBOM** réel (CycloneDX).
- Pas encore versionné (git) ni déployé. **Hébergement = OVH** (pro, hébergeur français,
  cohérent souveraineté). Site statique sur hébergement web OVH ; le back-end du formulaire
  (accès sur demande) se fera en **PHP/MySQL** côté OVH, e-mail via SMTP OVH ou Mailjet (FR).

## À valider avec les patrons (notes de réunion)

1. Quelles **fonctions de sécurité** sont réellement livrées vs roadmap.
2. **Infos de téléchargement** réelles (version, lien, SHA-256, signature).
3. **Captures** de l'app.
4. **Modèle commercial** (gratuit/licence, réservé clients, etc.).
