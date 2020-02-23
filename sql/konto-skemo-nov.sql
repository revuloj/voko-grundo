DROP VIEW _redaktanto_poshto_unu;

ALTER TABLE redaktanto ADD subid_gg TEXT;
ALTER TABLE redaktanto ADD subid_yh TEXT;
ALTER TABLE redaktanto ADD subid_fb TEXT;
ALTER TABLE redaktanto ADD subid_gh TEXT;

UPDATE redaktanto SET subid_gg=subid;

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
  