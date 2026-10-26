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
css/  tokens.css  base.css  shared.css   + pages/{home,securite,telechargement,ressources}.css
js/   main.js (point d'entrée)
      core/        KyolisElement.js (classe de base) · reveal.js (apparition au scroll)
      components/  atoms/      kyolis-button · kyolis-icon · kyolis-badge
                   molecules/  kyolis-media-item · kyolis-road-card · kyolis-faq-item
                   organisms/  kyolis-header · kyolis-footer · kyolis-posture
                               kyolis-measure-block · kyolis-feature-block
pages/  index.html · fonctionnalites.html · securite.html · telechargement.html · ressources.html
```
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
  seule fois dans son rôle, titre « Quatre cadres, une même exigence », mesures/posture/roadmap OK.
- Discours « aligné sur » harmonisé + tirets de prose supprimés.

**Reste à faire :**
- **Obtenir l'application** (ex-Téléchargement) : Phase 1 faite (page de demande + formulaire +
  pop-up newsletter, design moderne 2 colonnes). Champs : nom, société, e-mail pro, téléphone,
  besoin (tous required) + case newsletter cochée par défaut. Reste la **Phase 2 back** (PHP/MySQL
  OVH, captcha OVH, e-mail de vérification, lien d'accès personnel). Lien « Configurer Windows
  Hello » présent mais **URL Microsoft à vérifier**.
- **Ressources** : à réordonner = mettre le **versionnement / changelog de l'app EN TÊTE**, la
  **FAQ ensuite** (pas l'inverse). + SBOM à approfondir. Idée pour plus tard : **page tuto** avec
  vidéos YouTube pour accompagner l'installation.
- README à remettre à jour (il parle encore de « Desktop » et est en retard sur la réalité).

## Décisions / changements actés (à implémenter plus tard)

- **Accès sur demande** (décision patrons) : l'app n'est **plus en téléchargement libre**.
  L'utilisateur remplit un **formulaire**, l'équipe échange avec lui, puis partage l'app.
  Implique : transformer `telechargement.html` en page de demande, changer tous les CTA
  « Télécharger ». Libellé du CTA non encore tranché. **Ne pas coder tant que non validé.**
  (Options de parcours et anti-spam déjà discutées : formulaire simple / vérif e-mail /
  qualification + revue / lien d'accès personnel.)

## Placeholders à remplacer avant mise en ligne

- Lien **Contacter l'équipe** = `href="#"` (vraie adresse ou page contact à définir).
- **Captures d'écran** : toutes les zones rayées `.shot` sont des placeholders.
- **Téléchargement** : version, date, taille, lien, **empreinte SHA-256** (ne pas affirmer la
  signature EV tant qu'elle n'existe pas).
- **Logo footer** : prévoir une version **blanche** (fond sombre).
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
