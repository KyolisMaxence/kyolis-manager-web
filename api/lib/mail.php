<?php
/* =====================================================================
   Envoi des e-mails du parcours, en texte brut UTF-8.
   mail_mode = 'php'     : fonction mail() de l'hébergement OVH ;
   mail_mode = 'fichier' : écrit l'e-mail dans storage/mails/ (tests locaux).
   Textes des e-mails validés par les patrons le 28/10/2026.
   ===================================================================== */
declare(strict_types=1);

function envoyerMail(string $a, string $sujet, string $corps, ?string $repondreA = null): bool {
    // Aucune donnée saisie ne doit pouvoir injecter un en-tête
    $a = str_replace(["\r", "\n"], '', $a);
    if (!filter_var($a, FILTER_VALIDATE_EMAIL)) return false;
    $repondreA = $repondreA && filter_var($repondreA, FILTER_VALIDATE_EMAIL) ? $repondreA : cfg('mail_equipe');

    $de = sprintf('%s <%s>', mb_encode_mimeheader((string) cfg('mail_from_nom'), 'UTF-8'), cfg('mail_from'));
    $entetes = implode("\r\n", [
        'From: ' . $de,
        'Reply-To: ' . $repondreA,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ]);
    $sujetEncode = mb_encode_mimeheader($sujet, 'UTF-8');

    if (cfg('mail_mode') === 'fichier') {
        $dossier = RACINE_API . '/../storage/mails';
        if (!is_dir($dossier)) mkdir($dossier, 0700, true);
        $nom = sprintf('%s/%s-%s.eml', $dossier, date('Ymd-His'), bin2hex(random_bytes(3)));
        return (bool) file_put_contents($nom, "To: $a\r\nSubject: $sujet\r\n$entetes\r\n\r\n$corps");
    }
    return mail($a, $sujetEncode, $corps, $entetes, '-f' . cfg('mail_from'));
}

/* 1. Au demandeur : confirmer son adresse */
function mailVerification(array $d, string $jeton): bool {
    $lien = url('api/confirmer.php?t=' . $jeton);
    $corps = <<<TXT
Bonjour {$d['nom']},

Merci pour votre demande d'accès à KYOLIS® Manager.

Pour la valider, confirmez votre adresse e-mail en ouvrant ce lien :
$lien

Sans cette confirmation, nous ne pourrons pas donner suite à votre demande.
Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.

L'équipe KYOLIS®
TXT;
    return envoyerMail($d['email'], 'Confirmez votre demande d\'accès à KYOLIS® Manager', $corps);
}

/* 1 bis. Inscription à la newsletter depuis le site : confirmer l'adresse */
function mailNewsletterConfirmation(string $email, string $jeton): bool {
    $lien = url('api/newsletter-confirmer.php?t=' . $jeton);
    $corps = <<<TXT
Bonjour,

Pour recevoir les mises à jour et les avis de sécurité de KYOLIS® Manager, confirmez votre inscription en ouvrant ce lien :
$lien

Uniquement pour les mises à jour et les avis de sécurité de KYOLIS® Manager. Jamais de démarchage commercial, jamais transmis à un tiers. Désinscription en un clic dans chaque e-mail.

Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet e-mail : elle sera supprimée.

L'équipe KYOLIS®
TXT;
    return envoyerMail($email, 'Confirmez votre inscription aux nouvelles de KYOLIS® Manager', $corps);
}

/* 2. À l'équipe : une demande confirmée attend une décision */
function mailEquipe(array $d): bool {
    $lien = url('api/decision.php?id=' . $d['id'] . '&s=' . signer('decision:' . $d['id']));
    $equipe = LIBELLES_EQUIPE[$d['equipe']] ?? $d['equipe'];
    $parc = LIBELLES_PARC[$d['parc']] ?? $d['parc'];
    $nl = $d['newsletter'] ? 'oui' : 'non';
    $corps = <<<TXT
Nouvelle demande d'accès à KYOLIS® Manager (n° {$d['id']}), adresse e-mail confirmée.

Nom : {$d['nom']}
Fonction : {$d['fonction']}
Société : {$d['societe']}
E-mail : {$d['email']}
Téléphone : {$d['tel']}
Déjà équipé KYOLIS® : $equipe
Nombre de switches : $parc
Newsletter : $nl

Besoin exprimé :
{$d['message']}

Pour accepter ou refuser la demande, après avoir échangé avec le demandeur :
$lien
TXT;
    // « Répondre » écrit directement au demandeur
    return envoyerMail((string) cfg('mail_equipe'), "Nouvelle demande d'accès : {$d['societe']} ({$d['nom']})", $corps, $d['email']);
}

/* 3. Au demandeur accepté : son lien personnel */
function mailAcces(array $d, string $jeton, string $expire): bool {
    $lien = url('api/telecharger.php?t=' . $jeton);
    $jours = (int) cfg('lien_jours');
    $date = date('d/m/Y', strtotime($expire));
    $versions = url('pages/versions.html#verifier');
    $corps = <<<TXT
Bonjour {$d['nom']},

Votre accès à KYOLIS® Manager est prêt. Voici votre lien personnel de téléchargement :
$lien

Ce lien est réservé à votre poste. Il est valable $jours jours (jusqu'au $date) et ne doit pas être partagé : pour équiper un autre poste, faites une nouvelle demande.

Avant d'installer, vous pouvez vérifier l'empreinte du fichier sur la page des notes de version :
$versions

Une question ? Répondez simplement à cet e-mail.

L'équipe KYOLIS®
TXT;
    return envoyerMail($d['email'], 'Votre accès à KYOLIS® Manager', $corps);
}
