CREATE TABLE redaktanto (
  red_id VARCHAR(20) PRIMARY KEY NOT NULL,
  nomo VARCHAR(100) NOT NULL,
  subid_gg TEXT,
  subid_yh TEXT,
  subid_fb TEXT,
  subid_gh TEXT
);

CREATE TABLE retposhto (
  red_id VARCHAR(20) NOT NULL,
  numero INTEGER NOT NULL,
  retposhto VARCHAR(100) NOT NULL,
  PRIMARY KEY (red_id, numero)
);

CREATE VIEW _redaktanto_poshto_unu AS
SELECT
  r.red_id as red_id,
  r.nomo as nomo,
  r.subid_gg as subid_gg,
  r.subid_yh as subid_yh,
  r.subid_fb as subid_fb,
  r.subid_gh as subid_gh,
  p.retposhto as retposhto
FROM redaktanto r, retposhto p
WHERE r.red_id=p.red_id
  AND p.numero = 1;





