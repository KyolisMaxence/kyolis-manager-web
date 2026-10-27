<?php
/* Routeur du serveur PHP local (php -S) : reproduit les .htaccess d'OVH,
   que le serveur intégré ignore, et désactive le cache navigateur. */
$chemin = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('#^/(storage/|api/lib/|api/config(\.example)?\.php|api/.*\.sql)#', $chemin)) {
    http_response_code(404);
    exit('Introuvable');
}
header('Cache-Control: no-store');
return false;   // le serveur intégré sert le fichier (ou exécute le PHP) normalement
