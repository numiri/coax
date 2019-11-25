
package com.coax.db.dao;

import com.coax.db.dto.Group;
import com.coax.db.dto.Group_Users;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Group_UserDAO extends IData<Group_Users>{
    public Group_UserDAO(){
    }
    @Override
    public String getJson(List<Group_Users> list) {
        String sJson = "[";
        int flag = 0;
        for(int i = 0;i<list.size();i++){
            Group_Users item = (Group_Users)list.get(i);
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
    protected Object OnSubmit(Group_Users item, int t) {
        Subconfig fig = Subconfig.getInstance();
	fig.init();
	this.sToreprocedure = "{ CALL CRUDGroup_Users(?,?,?,?) }";
	Object result = -1;
	try {
		CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
		cs.registerOutParameter(1, java.sql.Types.BIGINT);
		if(t != 0)
                    cs.setLong("p_" + Group_Users.c_id , item.getId());                
                cs.setLong("p_" + Group_Users.c_userId, item.getUserId());
                cs.setLong("p_" + Group_Users.c_groupId, item.getGroupId());                
                cs.setInt("p_t",t);
                cs.execute();
                result =(long)cs.getLong("p_" + Group_Users.c_id);
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
    protected Group_Users getItem(ResultSet rs) {
        Group_Users item = new Group_Users();
	try {
            item.setId(rs.getLong(Group_Users.c_id));
            item.setGroupId(rs.getLong(Group_Users.c_groupId));
            item.setName(rs.getString(Group_Users.c_name));
            item.setUserName(rs.getString(Group_Users.c_username));
            item.setUserId(rs.getLong(Group_Users.c_userId));
	} catch (SQLException e) {
			// TODO Auto-generated catch block
            e.printStackTrace();
	}
	return item;
    }

    @Override
    public List<Group_Users> getAll() {
        String mySql = "{ call getAllGroup_Users()}";
	return this.getAll(mySql);
    }
/*g removed - having the new function getAllGroupsUsersbyLogger  
	public List<Group_Users> getActivedGroupUser(int user_id) { 
		String procedure = "{ call GET_GROUP_USER(?) }";
		String[] params = {"user_id"};
        Object[] obj = {user_id};
		return this.getItem(procedure, params, obj);
    }    
    */
/*
show create procedure GET_GROUP;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_GROUP`(IN user_id INT)
BEGIN 
   SET @@SESSION.max_sp_recursion_depth = 255; 
   
   CALL GET_GROUP_RE(user_id,NULL, @GOUT);
   IF @GOUT IS NULL THEN
      SET @GOUT = '-1';
   END IF;
   
   SET @GS = CONCAT('SELECT id, name, description, CASE WHEN parentid IN (', 
   @GOUT ,
   ') THEN parentid ELSE 0 END AS parentid, rowGuid, userId, isDelete FROM groups WHERE id IN (', 
   @GOUT ,')');
   PREPARE stmt FROM @GS;
      
   EXECUTE stmt;    
   DEALLOCATE PREPARE stmt;
END

=============
show create procedure GET_GROUP_USER;	
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_GROUP_USER`(IN user_id INT)
BEGIN 
   SET @@SESSION.max_sp_recursion_depth = 255; 
   
   CALL GET_GROUP_RE(user_id,NULL, @GOUT);
   IF @GOUT IS NULL THEN
      SET @GOUT = '-1';
   END IF;
   
   SET @GS = CONCAT('SELECT groups_users.id, groupId, groups.id as groupId, users.name as username, groups_users.userId, groups.name as name 
               FROM groups_users, users, groups WHERE users.id = groups_users.userId AND groups_users.groupId = groups.id 
               AND groups.id IN (', @GOUT, ')');
   
   PREPARE stmt FROM @GS;
      
   EXECUTE stmt;    
   DEALLOCATE PREPARE stmt;
END
show create procedure GET_GROUP_RE;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_GROUP_RE`(IN user_id INT ,IN LSTIN VARCHAR(500), OUT LSTOUT VARCHAR(500))
BEGIN 
   DECLARE TOUT VARCHAR(500);
   IF LSTIN IS NULL THEN 
      SELECT group_concat(id) INTO LSTOUT FROM groups WHERE  userid = user_id OR id IN (
         SELECT groupId FROM groups_users WHERE userid = user_id);
      IF LSTOUT IS NOT NULL THEN
         CALL GET_GROUP_RE(user_id, LSTOUT, TOUT);
         SET LSTOUT = TOUT;
      END IF;
   ELSE 
      SET @GS = CONCAT('SELECT group_concat(id) INTO @GTMP FROM groups WHERE parentId IN (', LSTIN ,') AND id NOT IN (' , LSTIN , ');');
      PREPARE stmt FROM @GS;
      EXECUTE stmt;    
      DEALLOCATE PREPARE stmt;
      IF @GTMP IS NOT NULL THEN
         SET LSTOUT = concat(LSTIN,',',@GTMP);  
         CALL GET_GROUP_RE(user_id, LSTOUT, TOUT);
         IF TOUT IS NOT NULL THEN
            SET LSTOUT = TOUT;
         END IF;
      ELSE
         SET LSTOUT = LSTIN;
      END IF;
   END IF;
END
 */

/*****************************************************************************/   
   public String getAllGroupsUsersbyLogger(long user_id)                      {
      List<Group> groupLst;
      List<Group_Users> groupuserLst;
      String jGroups = "";
      String jsonExers = "";
      
      UsersDAO userdao = new UsersDAO();
      boolean isAdmin = userdao.isAdministrator(user_id);
      
      GroupDAO groupdao = new GroupDAO();
      if(isAdmin)
           groupLst = groupdao.getAll("select * from groups "
                                  + "where isDelete is null or isDelete=0 "
                                  + "order by name");
      else groupLst = groupdao.getAssignedGroups(user_id);

      jGroups = groupdao.getJson(groupLst);
      if(jGroups.equals("")) jGroups = "[]";

      //get selected group Ids for getting users assigned
      String selectedGrps = "";
      for (int i = 0; i < groupLst.size(); i++)
         selectedGrps += "," + groupLst.get(i).getId();
      if (selectedGrps.startsWith(",")) selectedGrps = selectedGrps.substring(1);
      String mysql = "SELECT groups_users.id, groupId, users.name as username, "
                     + "groups_users.userId, groups.name "
                     + "FROM groups_users, users, groups "
                     + "WHERE users.id = groups_users.userId "
                     + "AND groups_users.groupId = groups.id "
                     + "AND groups.id IN ("+selectedGrps+") "
                     + "order by username";
      groupuserLst = this.getAll(mysql);
      jsonExers = this.getJson(groupuserLst);
      if(jsonExers.equals("")){
          jsonExers = "[]";
      }

      StringBuilder createJson = new StringBuilder();
      createJson.append("{\"groups\":").append(jGroups).append(",");
      createJson.append("\"users\":").append(jsonExers);
      createJson.append("}");              
      return createJson.toString();                                           }
/*****************************************************************************/
}
