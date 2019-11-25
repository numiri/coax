/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dao;

import com.coax.db.dto.Folder;
import com.coax.db.dto.Group;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author phuctq
 */
public class GroupDAO extends IData<Group>{

    public GroupDAO(){}
    @Override
    public String getJson(List<Group> list) {
        String sJson = "[";        
        for(int i = 0;i<list.size();i++){
            Group item = (Group)list.get(i);
            if(i > 0 )
                sJson = sJson + ",";
            sJson = sJson + item.jsonObject();
        }
        sJson = sJson + "]";	
        return sJson;
    }

    @Override
    protected Object OnSubmit(Group item, int t) {
        Subconfig fig = Subconfig.getInstance();
	fig.init();
	Object result = 0;
        try {
            PreparedStatement cs = fig.connec.prepareStatement(this.m_mySql);
            System.out.println("mysql : " + this.m_mySql);
            if(t == 0){
                cs = fig.connec.prepareStatement(this.m_mySql,PreparedStatement.RETURN_GENERATED_KEYS);
            }
            cs.setString(1, item.getDescription());
            cs.setLong(2, item.getParent());
            cs.setString(3,item.getName());
            cs.setString(4, item.getRowGuid());
            cs.setLong(5, item.getUserId());
            cs.setBoolean(6, item.isIsDelete());
            if(t != 0){
                cs.setLong(7, item.getId());
            }
            int i = cs.executeUpdate();
            if(t == 0){
                ResultSet keyResultSet = cs.getGeneratedKeys();                
                if (keyResultSet.next()) {
                    result = (long) keyResultSet.getInt(1);
                }
                System.out.println("thanh cong id : " + result);
            }
            else{
                if(i!= 0){
                    result =(long)item.getId();
                }
            }
            cs.close();
        } catch (SQLException ex) {
            Logger.getLogger(FolderDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
		fig.close();
		return result;
    }

    @Override
    protected Group getItem(ResultSet rs) {
        Group item = new Group();
	try {
            item.setId(rs.getLong(Group.c_Id));
            item.setDescription(rs.getString(Group.c_description));
            item.setIsDelete(rs.getBoolean(Group.c_isDelete));
            item.setName(rs.getString(Group.c_name));
            item.setParent(rs.getLong(Group.c_parent));
            item.setRowGuid(rs.getString(Group.c_rowGuid));
            item.setUserId(rs.getLong(Group.c_userId));
	} catch (SQLException e) {
	}
	return item;
    }

    @Override
    public List<Group> getAll() {
        String mySql = "{ call getGroups()}";
	return this.getAll(mySql);
    }
/*****************************************************************************/    
  //no longer use the slq procedures GET_FOLDER, GET_FOLDER_RE, GET_GROUP, GET_GROUP_RE
/*    
	public List<Group> getActivedGroup(int user_id) { 
		String procedure = "{ call GET_GROUP(?) }";
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
show create procedure GET_GROUP_RE;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_GROUP_RE`(IN user_id INT ,IN LSTIN VARCHAR(500), OUT LSTOUT VARCHAR(500))
BEGIN 
   DECLARE TOUT VARCHAR(500);
   
   IF LSTIN IS NULL THEN 
      
      SELECT group_concat(id) INTO LSTOUT FROM groups WHERE  userid = user_id OR id IN 
      (
         SELECT groupId FROM groups_users WHERE userid = user_id
      );
      
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
/*****************************************************************************
 * get groups that the user  
 *    either created 
 *    or was assigned to 
 *    or able to see due to permision inherit 
 *    (those are all groups hierachially up to the root of an assigned group)
 * user should not be an admin 
 * (admin can see all groups regarless he has permission or not --> getAll() )     
 */
    public List<Group> getAssignedGroups(long user_id)                        {
       List<String> selectedGroupIds = this.getAssignedGroupIds(user_id);
       if(selectedGroupIds.size()==0) return new ArrayList<Group>();
       String selectedGrps = "";
       for (int i = 0; i < selectedGroupIds.size(); i++)
          selectedGrps += "," + selectedGroupIds.get(i);
       if (selectedGrps.startsWith(",")) selectedGrps = selectedGrps.substring(1);

       String sql = "select * from groups "
             + "where id in ("+selectedGrps+") order by name";
       System.out.println("getAssignedGroups:\n" + sql);
       List<Group> grouplist = this.getAll(sql);  
       return grouplist;
    }
/*****************************************************************************/    
    public List<String> getAssignedGroupIds(long user_id)                     {
       List<String> grouplist = new ArrayList<String>();
       Subconfig fig = Subconfig.getInstance();
       fig.init();
       try                                                                     {
          String mysql = "select grp.*, gu.userId as assignedUser from("
          + "select get_hierarchical_data(id, 'groups') as id, @level as level "
          + "from ( select @start_with := 0, @id := @start_with,@level := 0) vars, groups "
          + "where @id is not null and (isdelete < 1 or isdelete is null)) grp "
          + "left join groups_users gu on grp.id = gu.groupId "
          + "and gu.userId="+user_id;
          
          System.out.println("getAssignedGroups:\n" + mysql);
          Statement st = fig.connec.createStatement() ;
          ResultSet rs = st.executeQuery(mysql);
          List<CustomizedGroup> cgrpLst = new ArrayList<CustomizedGroup>();
          //get all groups returned by the sql above
          while(rs.next())                                                     {
             CustomizedGroup cg = new CustomizedGroup();
             try                                                               {
                cg.id = rs.getString("id");
                cg.level = rs.getInt("level");
                cg.assignedUser = rs.getLong("assignedUser");
                cgrpLst.add(cg);                                               } 
             catch (SQLException e)                                          {}}//while
          st.close();
          rs.close();
          //get hierarchical groups that user inherits permissions
          /*
+------+-------+--------------+
| id   | level | assignedUser |
+------+-------+--------------+
|1     | 1     |         NULL |
| 35   | 2     |         NULL |
|   38 | 3     |           67 |
| 36   | 2     |           67 |
| 41   | 2     |         NULL |
| 42   | 2     |         NULL |
|   61 | 3     |         NULL |
|   67 | 3     |           67 |
| 47   | 2     |         NULL |
| 62   | 2     |         NULL |
+------+-------+--------------+           */          
          for (int i = 0; i < cgrpLst.size(); i++)                             {
             CustomizedGroup cg = cgrpLst.get(i);
             //a group will be added to the list if it 
             //   is assigned directly to the user (column assignedUser)
             if( cg.assignedUser == user_id)                                  {
                grouplist.add(cg.id);
                cg.added = true;
                //scan up the tree to get parent groups that user inherits 
                // when the level>1 (meaning the node is a child)
                if(cg.level>1)                                                 {
                   int currentLevel = cg.level;
                   for ( int j=i-1; j>=0; j--){
                      CustomizedGroup cgtmp = cgrpLst.get(j);
                      if(cgtmp.level == currentLevel-1){
                         // add to the list if the node is not in the list yet 
                         if(!cgtmp.added)                                     {
                            cgtmp.added = true;
                            grouplist.add(cgtmp.id);                          }
                         
                         //stop looking up the parent nodes when level is 1 --> root node
                         if(cgtmp.level == 1) break;
                         else currentLevel--; //continue to check the next parent node
                      }//if
                      else continue;
                   }//for
                   
                }//if cg.level>1
             }//if
          }//for
          
       }catch (SQLException ex) {
         Logger.getLogger(this.getClass().getName()).log(Level.SEVERE, null, ex);
       }
       fig.close();
       return grouplist;
    }
}
/*****************************************************************************/
class CustomizedGroup{
   String id;
   int level;
   long assignedUser;
   boolean added = false;
}

