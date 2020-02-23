DELIMITER //

CREATE PROCEDURE forigu_art(IN dosiero VARCHAR(255))
BEGIN
  
  DELETE FROM var 
  WHERE var_drv_id in (SELECT drv_id FROM drv WHERE drv_art_id in 
      (SELECT art_id FROM art WHERE art_amrk = dosiero));

  DELETE FROM trd 
  WHERE trd_snc_id in (SELECT snc_id FROM snc WHERE snc_drv_id in 
       (SELECT drv_id FROM drv WHERE drv_art_id in (SELECT art_id FROM art WHERE art_amrk = dosiero)));

  DELETE FROM rim WHERE rim_art_id in (SELECT art_id FROM art WHERE art_amrk = dosiero);

  DELETE FROM snc 
  WHERE snc_drv_id in (SELECT drv_id FROM drv WHERE drv_art_id in 
       (SELECT art_id FROM art WHERE art_amrk = dosiero));

  DELETE FROM drv 
  WHERE drv_art_id in (SELECT art_id FROM art WHERE art_amrk = dosiero);

  DELETE FROM art WHERE art_amrk = dosiero;
  
END//

DELIMITER ;
