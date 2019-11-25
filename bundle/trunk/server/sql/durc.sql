--=============================================================================
-- usage:
-- mysql> delimiter //
-- mysql> source filename.sql
-- mysql> drop FUNCTION get_hierarchical_data;// (to start from scratch)
--        (edit file.sql)
-- mysql> source ...
--=============================================================================

create FUNCTION get_hierarchical_data( value int, node_type varchar(20) ) 
RETURNS INT
NOT DETERMINISTIC READS SQL DATA
BEGIN
DECLARE _id INT;   DECLARE _parent INT;   DECLARE _next INT;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET @id = NULL;
IF node_type = 'groups' then 
   SET _parent = @id;   SET _id = -1;
   IF @id IS NULL THEN RETURN NULL; END IF;
   LOOP
      SELECT  MIN(id) INTO @id FROM groups
      WHERE   parentId = _parent   AND id > _id;
      IF @id IS NOT NULL OR _parent = @start_with THEN
              SET @level = @level + 1;
              RETURN @id;
      END IF;
      SET @level := @level - 1;
      SELECT  id, parentId INTO _id, _parent FROM groups
      WHERE   id = _parent;
   END LOOP;
END IF;
IF node_type = 'folders' then 
   SET _parent = @id;   SET _id = -1;
   IF @id IS NULL THEN RETURN NULL; END IF;
   LOOP
      SELECT  MIN(id) INTO @id FROM folders
      WHERE   parentId = _parent   AND id > _id;
      IF @id IS NOT NULL OR _parent = @start_with THEN
              SET @level = @level + 1;
              RETURN @id;
      END IF;
      SET @level := @level - 1;
      SELECT  id, parentId INTO _id, _parent FROM folders
      WHERE   id = _parent;
   END LOOP;
END IF;
return 0;
END
