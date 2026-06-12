-- AKB Szavazó - JAVÍTÓ MIGRÁCIÓ
-- Futtasd le egyszer phpMyAdmin-ban, ha a régi `polls` táblából
-- hiányoznak az options / status / votes / device_votes oszlopok
-- (tünet: a kérdés megjelenik, de a válaszlehetőségek nem).

-- Hiányzó oszlopok pótlása (ha már léteznek, hagyd ki az adott sort).
ALTER TABLE polls ADD COLUMN options      JSON NOT NULL DEFAULT (JSON_ARRAY())  AFTER question;
ALTER TABLE polls ADD COLUMN status       ENUM('active','closed') NOT NULL DEFAULT 'active' AFTER options;
ALTER TABLE polls ADD COLUMN votes        JSON NOT NULL DEFAULT (JSON_OBJECT()) AFTER status;
ALTER TABLE polls ADD COLUMN device_votes JSON NOT NULL DEFAULT (JSON_ARRAY())  AFTER votes;

-- A régi (hibás) szavazások törlése, mert nincs bennük opció:
DELETE FROM polls WHERE JSON_LENGTH(options) = 0;
