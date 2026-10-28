# Parcours « accès sur demande » : mise en ligne chez OVH

Le formulaire du site (`pages/demande-acces.html`) envoie la demande à `api/demande.php`.
Parcours : demande, e-mail de vérification au demandeur, alerte à l'équipe, décision
dans l'espace équipe, lien personnel de téléchargement (7 jours, 3 téléchargements).

## Ce qu'il faut chez OVH

1. **Hébergement web avec PHP 8.1 ou plus** et une **base MySQL** (offre Perso ou Pro), dédié
   au site : l'hébergement Starter existant sert déjà lakyobox.com. Sans MySQL, le code
   fonctionne aussi avec SQLite : `db_dsn` = `sqlite:` suivi d'un chemin **hors du dossier www**.
2. **La boîte `contact@kyolismanager.com`** créée (elle envoie et reçoit les e-mails du parcours).

## Étapes

1. Créer la base MySQL dans l'espace client OVH, puis importer `api/schema.mysql.sql`
   avec phpMyAdmin.
2. Copier `api/config.example.php` en `api/config.php` et remplir :
   - `url_site` : `https://kyolismanager.com`
   - `db_dsn`, `db_user`, `db_pass` : ceux de la base OVH
   - `secret` : `php -r "echo bin2hex(random_bytes(32));"`
   - `equipe_mot_de_passe_hash` : `php -r "echo password_hash('le-mot-de-passe', PASSWORD_DEFAULT);"`
   - `mail_mode` : `php`
   - `installateur` : chemin du fichier `.exe`, **hors du dossier www**
3. Déposer le site par FTP. Les fichiers `.htaccess` de `api/` et `storage/` bloquent
   l'accès à la configuration et au code commun : les déposer aussi.
4. Déposer l'installateur à l'endroit indiqué dans `installateur`.
5. Tester : faire une demande avec une vraie adresse, confirmer, se connecter sur
   `https://kyolismanager.com/api/equipe.php`, accepter, télécharger.

## En local

```
python tools/serve-php.py
```
Avec `mail_mode = 'fichier'`, les e-mails sont écrits dans `storage/mails/` au lieu d'être
envoyés. La base SQLite `storage/kyolis.sqlite` se crée toute seule.

## Points de sécurité

- Aucun jeton stocké en clair, seulement son empreinte. Adresses IP jamais stockées.
- Liens de l'équipe signés, et espace équipe protégé par mot de passe.
- Aucune action sur un simple clic de lien : les messageries d'entreprise ouvrent les liens
  pour les analyser, chaque action passe par un bouton.
- Anti-robots sans service externe : champ piège, délai minimum, 3 demandes par heure et par IP.
