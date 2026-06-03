-- AKB Szavazó - MySQL séma
-- Futtasd le egyszer az adatbázisodon (pl. phpMyAdmin-ban):

CREATE TABLE IF NOT EXISTS polls (
  id           VARCHAR(64)  NOT NULL PRIMARY KEY,
  question     TEXT         NOT NULL,
  options      JSON         NOT NULL,
  status       ENUM('active','closed') NOT NULL DEFAULT 'active',
  votes        JSON         NOT NULL,
  device_votes JSON         NOT NULL,
  created_at   BIGINT       NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
