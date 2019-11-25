
package com.coax.db.dao;

import com.coax.db.dto.Folder;
import com.coax.db.dto.Folder_Exercises;

import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

public class Folder_ExercisesDAO extends IData<Folder_Exercises>{
    public Folder_ExercisesDAO(){}

    @Override
    public String getJson(List<Folder_Exercises> list) {
         String sJson = "[";
        int flag = 0;
        for(int i = 0;i<list.size();i++){
            Folder_Exercises item = (Folder_Exercises)list.get(i);
            if(i > 0 )
                sJson = sJson + ",";
            sJson = sJson + item.jsonObject();
            flag = 1;
        }
	sJson = sJson + "]";
	if(flag == 0)
            sJson ="";
        return sJson;
    }

    @Override
    protected Object OnSubmit(Folder_Exercises item, int t) {
        Subconfig fig = Subconfig.getInstance();
	fig.init();
	this.sToreprocedure = "{ CALL CRUDFolder_Exercises(?,?,?,?) }";
	Object result = -1;
	try {
		CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
		cs.registerOutParameter(1, java.sql.Types.BIGINT);
		if(t != 0)
                    cs.setLong("p_" + Folder_Exercises.c_Id , item.getId());
                cs.setLong("p_" + Folder_Exercises.c_exerciseId, item.getExerciseId());
                cs.setLong("p_" + Folder_Exercises.folderidId, item.getFolderId());     
                cs.setInt("p_t",t);
                cs.execute();
                result =(long)cs.getLong("p_" + Folder_Exercises.c_Id);
                item.setId(cs.getLong("p_" + Folder_Exercises.c_Id));
                System.out.print(item.toString());
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
                        result = 0;
		}
		fig.close();
		return result;
    }

    @Override
    protected Folder_Exercises getItem(ResultSet rs) {
        Folder_Exercises item = new Folder_Exercises();
        try {
            item.setId(rs.getLong(Folder_Exercises.c_Id));
            item.setExerciseId(rs.getLong(Folder_Exercises.c_exerciseId));     
            item.setFolderId(rs.getLong(Folder_Exercises.folderidId));    
            item.setFolderName(rs.getString(Folder_Exercises.c_folderName));
            item.setExerciseName(rs.getString(Folder_Exercises.c_exerciseName)); 
            
            item.setAmid(rs.getString(Folder_Exercises.c_amid)); 
            item.setLatex(rs.getString(Folder_Exercises.c_latex)); 
            item.setVariable(rs.getString(Folder_Exercises.c_variable)); 
            item.setXiznum(rs.getString(Folder_Exercises.c_xiznum)); 
            item.setFrienlyId(rs.getString(Folder_Exercises.c_friendlyid)); 
	} catch (SQLException e) {
			// TODO Auto-generated catch block
            e.printStackTrace();
	}
        return item;
    }

    @Override
    public List<Folder_Exercises> getAll() {
        String mySql = "{ call getAllFolder_Exercises()}";
        return this.getAll(mySql);
    }
/*    
    public List<Folder_Exercises> getActivedFolderExercise(int user_id) { 
		String procedure = "{ call GET_FOLDER_EXERCISE(?) }";
		String[] params = {"user_id"};
        Object[] obj = {user_id};
		return this.getItem(procedure, params, obj);
    }
    */    
/*
show create procedure GET_FOLDER_EXERCISE;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_FOLDER_EXERCISE`(IN user_id INT)
BEGIN 
   SET @@SESSION.max_sp_recursion_depth = 255; 
   
   CALL GET_FOLDER_RE(user_id,NULL, @FOUT);
   IF @FOUT IS NULL THEN
      SET @FOUT = -1;
   END IF;
   
   SET @FS = CONCAT('SELECT folder_exercise.id,folder_exercise.folderId,
             folder_exercise.exerciseId,folders.name as folderName,
             exercises.content as exerciseName ,
             exercises.xiznum as xiznum,exercises.variable as variable,
             exercises.amid as amid, exercises.formula as latex, 
             exercises.friendly_id as friendly_id 
             FROM exercises,folders,folder_exercise 
             WHERE folder_exercise.folderId = folders.id 
             AND folder_exercise.exerciseId = exercises.id 
             AND folders.id IN (', @FOUT , ') AND amid is NULL');
   
   PREPARE stmt FROM @FS;
      
   EXECUTE stmt;    
   DEALLOCATE PREPARE stmt;
END
show create procedure GET_FOLDER_RE;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_FOLDER_RE`(IN user_id INT ,IN LSTIN VARCHAR(500), OUT LSTOUT VARCHAR(500))
BEGIN 
   DECLARE TOUT VARCHAR(500);
   DECLARE GROUPID VARCHAR(500);
   
   IF LSTIN IS NULL THEN 
      CALL GET_GROUP_RE(user_id, NULL, GROUPID);
      IF GROUPID IS NULL THEN
         SET GROUPID = '-1';
      END IF;
      
      SET @FS = CONCAT('SELECT group_concat(id) INTO @LSTOUT FROM folders WHERE userid = ', user_id, ' OR id IN(
         SELECT folderid FROM shared WHERE userid = ', user_id, ' OR (groupId IN (', GROUPID, ') AND userid IS NULL)
      );');
      PREPARE stmt FROM @FS;
      EXECUTE stmt;    
      DEALLOCATE PREPARE stmt;
      
      SET LSTOUT = @LSTOUT;
      IF LSTOUT IS NOT NULL THEN
         CALL GET_FOLDER_RE(user_id, LSTOUT, TOUT);
         SET LSTOUT = TOUT;
      END IF;
   ELSE 
      SET @FS = CONCAT('SELECT group_concat(id) INTO @FTMP FROM folders WHERE parentId IN (', LSTIN ,') AND id NOT IN (' , LSTIN , ');');
      PREPARE stmt FROM @FS;
      EXECUTE stmt;    
      DEALLOCATE PREPARE stmt;
      IF @FTMP IS NOT NULL THEN
         SET LSTOUT = concat(LSTIN,',',@FTMP);  
         CALL GET_FOLDER_RE(user_id, LSTOUT, TOUT);
         
         IF TOUT IS NOT NULL THEN
            SET LSTOUT = TOUT;
         END IF;
      ELSE
         SET LSTOUT = LSTIN;
      END IF;
      
   END IF;
END

 */
    public List<Folder> getFoldersbyExerciseId(Long id){
       String sql = "select distinct f.id, f.name, f.description, f.parentId, f.rowGuid, f.userId, f.isDelete "
             + "from folder_exercise fe, folders f "
             + "where fe.exerciseId = ? and fe.folderId = f.id and f.isDelete = 0 "
             + "order by name";
       Object obj[] = {id};
       FolderDAO fd = new FolderDAO();
       List<Folder> list = fd.getItems(sql, obj); 
       return list;
    }
    public String getAllFoldersExercisesbyLogger(long user_id)                {
       UsersDAO userdao = new UsersDAO();
       boolean isAdmin = userdao.isAdministrator(user_id);
       
       List<Folder> folderLst;
       String jsonFolders = "";
       String jsonExers = "";
       
       FolderDAO folderdao = new FolderDAO();
       if(isAdmin) 
          folderLst = folderdao.getAll("select * from folders "
                                     + "where isDelete is null or isDelete=0 "
                                     + "order by name");
       else folderLst = folderdao.getAssignedFolders(user_id);
       jsonFolders = folderdao.getJson(folderLst);
        if(jsonFolders.equals("")){
           jsonFolders = "[]";
       }
      //get selected group Ids for getting users assigned
        String selectedFolderIds = "";
        for (int i = 0; i < folderLst.size(); i++)
           selectedFolderIds += "," + folderLst.get(i).getId();
        if (selectedFolderIds.startsWith(",")) 
           selectedFolderIds = selectedFolderIds.substring(1);
        
       Folder_ExercisesDAO _folderExerDao = new Folder_ExercisesDAO();
       String mysql = "SELECT fe.id, fe.folderId, fe.exerciseId, "
             + "f.name as folderName, e.content as exerciseName, "
             + "e.xiznum, e.variable, e.amid, e.formula as latex, "
             + "e.friendly_id FROM exercises e,folders f,folder_exercise fe "
             + "WHERE fe.folderId = f.id AND fe.exerciseId = e.id "
             + "AND f.id IN ("+selectedFolderIds+") AND amid is NULL "
             + "order by exerciseName";
       System.out.println("getAllFoldersExercisesbyLogger:\n" + mysql);
       List<Folder_Exercises> _lfolderExers = _folderExerDao.getAll(mysql);
       jsonExers = _folderExerDao.getJson(_lfolderExers);
       if(jsonExers.equals("")){
           jsonExers = "[]";
       }
       
       String history = HistoriesDAO.getHistoryByUserId(user_id);
              
       StringBuilder createJson = new StringBuilder();
       createJson.append("{\"folders\":").append(jsonFolders).append(",");
       createJson.append("\"exers\":").append(jsonExers).append(",");
       createJson.append("\"versions\":").append(history);
       createJson.append("}");              
       
       return createJson.toString();

    }
}
