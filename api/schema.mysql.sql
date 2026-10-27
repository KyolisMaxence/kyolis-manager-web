-- =====================================================================
-- Base du parcours « accès sur demande » (MySQL, hébergement OVH).
-- À importer une fois via phpMyAdmin. En local, la base SQLite est
-- créée automatiquement par lib/bootstrap.php avec la même structure.
-- Modèle centré sur le POSTE : 1 demande = 1 poste = 1 accès.
-- =====================================================================

CREATE TABLE IF NOT EXISTS demandes (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cree_le          DATETIME     NOT NULL,
  nom              VARCHAR(120) NOT NULL,
  fonction         VARCHAR(120) NOT NULL,
  email            VARCHAR(190) NOT NULL,
  societe          VARCHAR(160) NOT NULL,
  tel              VARCHAR(40)  NOT NULL,
  equipe           VARCHAR(10)  NOT NULL,
  parc             VARCHAR(10)  NOT NULL,
  message          TEXT         NOT NULL,
  newsletter       TINYINT(1)   NOT NULL DEFAULT 0,
  ip_empreinte     CHAR(64)     NOT NULL,
  -- email_a_confirmer -> a_traiter -> acceptee | refusee
  statut           VARCHAR(20)  NOT NULL,
  email_jeton      CHAR(64)     NULL,      -- empreinte SHA-256 du jeton envoyé
  email_confirme_le DATETIME    NULL,
  decide_le        DATETIME     NULL,
  note_equipe      TEXT         NULL,      -- raison de la décision, échanges
  poste_id         CHAR(36)     NULL,      -- identifiant de poste, pour le futur code d'activation
  INDEX (statut), INDEX (email), INDEX (ip_empreinte, cree_le)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS acces (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  demande_id       INT UNSIGNED NOT NULL,
  jeton            CHAR(64)     NOT NULL UNIQUE,   -- empreinte SHA-256 du lien personnel
  version          VARCHAR(20)  NOT NULL,
  cree_le          DATETIME     NOT NULL,
  expire_le        DATETIME     NOT NULL,
  telechargements  INT UNSIGNED NOT NULL DEFAULT 0,
  max_telechargements INT UNSIGNED NOT NULL,
  dernier_le       DATETIME     NULL,
  FOREIGN KEY (demande_id) REFERENCES demandes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Historique de chaque demande (le « mini CRM »)
CREATE TABLE IF NOT EXISTS journal (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  demande_id       INT UNSIGNED NOT NULL,
  le               DATETIME     NOT NULL,
  evenement        VARCHAR(40)  NOT NULL,
  detail           TEXT         NULL,
  INDEX (demande_id),
  FOREIGN KEY (demande_id) REFERENCES demandes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
