<?php
/* =====================================================================
   Configuration du parcours « accès sur demande ».
   Copier ce fichier en config.php (non versionné) et le remplir.
   Sur OVH : base MySQL créée dans l'espace client, puis schema.mysql.sql
   importé via phpMyAdmin.
   ===================================================================== */
return [
    // Adresse publique du site, sans barre finale (sert aux liens des e-mails)
    'url_site' => 'https://kyolismanager.com',

    // Base de données. OVH : 'mysql:host=xxx.mysql.db;dbname=xxx;charset=utf8mb4'
    // En local : SQLite, la base est créée toute seule au premier appel.
    'db_dsn'  => 'sqlite:' . __DIR__ . '/../storage/kyolis.sqlite',
    'db_user' => null,
    'db_pass' => null,

    // Clé secrète : signe les liens de l'équipe et anonymise les adresses IP.
    // Générer une valeur longue et aléatoire, ne jamais la partager.
    // ex. php -r "echo bin2hex(random_bytes(32));"
    'secret' => 'REMPLACER_PAR_UNE_CLE_ALEATOIRE',

    // E-mails
    'mail_from'     => 'contact@kyolismanager.com',   // expéditeur (doit être sur le domaine)
    'mail_from_nom' => 'KYOLIS® Manager',
    'mail_equipe'   => 'contact@kyolismanager.com',   // reçoit les nouvelles demandes
    // 'php' = fonction mail() d'OVH ; 'fichier' = écrit les e-mails dans storage/mails (tests locaux)
    'mail_mode'     => 'php',

    // Espace équipe (liste des demandes) : empreinte du mot de passe.
    // Générer avec : php -r "echo password_hash('votre-mot-de-passe', PASSWORD_DEFAULT);"
    'equipe_mot_de_passe_hash' => '',

    // Fichier d'installation livré par le lien personnel.
    // Sur OVH, le placer HORS du dossier www (ex. /homez.xxx/kyolis/installateurs/).
    'installateur'         => __DIR__ . '/../storage/installateurs/KYOLIS-Manager-Setup.exe',
    'installateur_nom'     => 'KYOLIS-Manager-Setup-1.0.0.exe',
    'installateur_version' => '1.0.0',

    // Lien personnel : durée de validité et nombre de téléchargements autorisés
    'lien_jours'           => 7,
    'lien_telechargements' => 3,

    // Anti-robots : délai minimum de remplissage et demandes max par heure et par IP
    'delai_min_secondes' => 4,
    'demandes_par_heure' => 3,
];
