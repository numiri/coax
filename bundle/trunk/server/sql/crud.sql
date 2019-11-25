--=============================================================================
-- usage: (see durc.sql for alternative way of source-ing sql file
--=============================================================================


--p_t = 0 INSERT
--p_t = 1 UPDATE HISTORIES (action, parentID, UserId, stroke, formula, sessionId, image, result)
--p_t = 2 UPDATE HISTORIES (action, parentID, UserId, sessionId, result)
--p_t = 3 DELETE
DROP PROCEDURE IF EXISTS CRUDHistory;
delimiter //
create DEFINER='root'@'localhost' 

create procedure CRUDHistory ( INOUT p_id BIGINT, IN p_exerciseId BIGINT
,  IN p_userId BIGINT, IN p_stepFrom SMALLINT, IN p_stepTo SMALLINT
,  IN p_stroke TEXT, IN p_formula TEXT, IN p_action SMALLINT
,  IN p_sessionId bigint, IN p_parentID bigint,  INOUT p_version SMALLINT
,  IN p_image TEXT, IN p_result bit, IN p_isdelete SMALLINT
,  IN p_proc_skipped VARCHAR(20), IN p_t SMALLINT )
begin
case when p_t = 0 then
   if p_version <=0 then
      select ifnull(max(version),0) + 1 into p_version
      from histories where exerciseId = p_exerciseId and userId = p_userId; 
   end if;
	    
   INSERT INTO histories ( parentID, exerciseId, userId, stepFrom, stepTo
   ,      stroke, formula, action, sessionId, version,  image
   ,      result, proc_skipped )
   VALUES ( id, p_exerciseId, p_userId, p_stepFrom, p_stepTo, p_stroke, p_formula
   ,      p_action, p_sessionId, p_version, p_image, p_result,p_proc_skipped );
   set p_id  = @@identity;
	      
when p_t = 1 then  
   UPDATE histories SET 
       action = p_action, parentID = p_parentID, userId = p_userId, sessionId = p_sessionId,
       stroke = p_stroke,
       formula = p_formula,
       image = p_image,
       result = p_result,
       proc_skipped = p_proc_skipped
   WHERE id = p_id;
when p_t = 2 then  
   UPDATE histories SET 
       action = p_action, parentID = p_parentID, userId = p_userId, sessionId = p_sessionId,
       result = p_result, proc_skipped = p_proc_skipped,
       stroke = CASE 
       WHEN result = 0 THEN REPLACE(stroke, '<color>green</color>', '<color>red</color>'  )
       WHEN result = 1 THEN REPLACE(stroke, '<color>red</color>'  , '<color>green</color>')
       END
   WHERE id = p_id;
when p_t = 3 then
   UPDATE histories SET 
      action = p_action, parentID = p_parentID, userId = p_userId, sessionId = p_sessionId,
      isdelete = p_isdelete 
   WHERE id = p_id;
end case;
end //
delimiter ;
