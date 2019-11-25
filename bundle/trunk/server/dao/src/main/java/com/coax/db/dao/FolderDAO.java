/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dao;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import com.coax.db.dto.*;
import com.google.gson.Gson;

import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
/**
 *
 * @author phuctq
 */
public class FolderDAO extends IData<Folder>{
    public FolderDAO(){
    }
    @Override
    public String getJson(List<Folder> list) {
        String sJson = "[";
        int flag = 0;
        for(int i = 0;i<list.size();i++){
            Folder item = (Folder)list.get(i);
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
    protected Object OnSubmit(Folder item, int t) {
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
        } catch (SQLException ex) {
            Logger.getLogger(FolderDAO.class.getName()).log(Level.SEVERE, null, ex);
        }
	fig.close();
	return result;
    }

    @Override
    protected Folder getItem(ResultSet rs) {
        Folder item = new Folder();
	try {
            item.setId(rs.getLong(Folder.c_Id));
            item.setDescription(rs.getString(Folder.c_description));
            item.setIsDelete(rs.getBoolean(Folder.c_isDelete));
            item.setName(rs.getString(Folder.c_name));
            item.setParent(rs.getLong(Folder.c_parent));
            item.setRowGuid(rs.getString(Folder.c_rowGuid));
            item.setUserId(rs.getLong(Folder.c_userId));
	} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
	}
	return item;
    }
    @Override
    public List<Folder> getAll() {
        String mySql = "{ call getFolders()}";
	return this.getAll(mySql);
    }    
/*************************************************
 * get folders that user 
 * either created 
 * or was shared to
 * or able to see due to permission inherit
 *  (all folders that are under shared folders)
 * user must not be Admin
 * use getAll to get folders an admin can see
 *************************************************/    
    public List<Folder> getAssignedFolders(long user_id) {
       //get selected folder Ids
       List<String> selectedFolderIds = this.getAssignedFolderIds(user_id);
       if(selectedFolderIds.size() == 0) return new ArrayList<Folder>();
       String selectedFlds = "";
       for (int i = 0; i < selectedFolderIds.size(); i++)
          selectedFlds += "," + selectedFolderIds.get(i);
       if (selectedFlds.startsWith(",")) selectedFlds = selectedFlds.substring(1);

       String sql = "select * from folders "
             + "where id in ("+selectedFlds+") order by name";
       System.out.println("getAssignedFolders:\n" + sql);
       List<Folder> folderLst = this.getAll(sql);   
       return folderLst;
    }
/*****************************************************************************/    
    public List<String> getAssignedFolderIds(long user_id)                    {
       List<String> folderLst = new ArrayList<String>();
       GroupDAO groupdao = new GroupDAO();
       List<Group> groupLst = groupdao.getAssignedGroups(user_id);
       if(groupLst.size() == 0) return folderLst;
       
       Subconfig fig = Subconfig.getInstance();
       fig.init();
       try{
          //get selected group Ids for getting users assigned
          String selectedGrps = "";
          for (int i = 0; i < groupLst.size(); i++)
             selectedGrps += "," + groupLst.get(i).getId();
          if (selectedGrps.startsWith(",")) selectedGrps = selectedGrps.substring(1);

          String sql = "select * from "
                + "(select get_hierarchical_data(id, 'folders') as id, @level as level "
                + "from ( select @start_with := 0, @id := @start_with, @level := 0 ) vars, folders "
                + "where @id is not null and (isdelete < 1 or isdelete is null)) fld "
                + "left join (select distinct folderId from shared "
                + "where  (groupId in ("+selectedGrps+") and userId=-1) "
                + "or userId = "+user_id+") s on fld.id = s.folderId";
          System.out.println("getAssignedFolders:\n" + sql);
          Statement st = fig.connec.createStatement() ;
          ResultSet rs = st.executeQuery(sql);
          boolean isContinued;
          while(rs.next())                                                     {
             try                                                               {
                isContinued = true;
                while(isContinued){
                   isContinued = false;
                   String sharedFld = rs.getString("folderId");
                   if(sharedFld!=null && !"null".equalsIgnoreCase(sharedFld)){
                      int level = rs.getInt("level");
                      folderLst.add(rs.getString("id"));
                      while(rs.next()){//next item
                         int levelofNextItm = rs.getInt("level");
                         if(levelofNextItm>level) folderLst.add(rs.getString("id"));
                         else{
                            isContinued = true; // to use the current rs
                            break;
                         }
                      }//3rd while
                   }//if
                }//2nd while
             }catch (SQLException e)                                          {}
          }//while
          st.close();
          rs.close();
       }catch (SQLException ex)                                               {
          Logger.getLogger(this.getClass().getName()).log(Level.SEVERE,null,ex);}
       fig.close();
       return folderLst;
    }
/*****************************************************************************/
  //no longer use the slq procedures GET_FOLDER, GET_FOLDER_RE, GET_GROUP, GET_GROUP_RE    
    
    
	/*
	public List<Folder> getActivedFolder(int user_id) { 
		String procedure = "{ call GET_FOLDER(?) }";
		String[] params = {"user_id"};
        Object[] obj = {user_id};
		return this.getItem(procedure, params, obj);
    }
    */  
/*
show create procedure GET_FOLDER;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_FOLDER`(IN user_id INT)
BEGIN 
   SET @@SESSION.max_sp_recursion_depth = 255; 
   
   CALL GET_FOLDER_RE(user_id,NULL, @FOUT);
   IF @FOUT IS NULL THEN
      SET @FOUT = -1;
   END IF;
   
   SET @FS = CONCAT('SELECT id, name, description, CASE WHEN parentid IN (', 
   @FOUT ,
   ') THEN parentid ELSE 0 END AS parentid, rowGuid, userId, isDelete FROM folders WHERE id IN (', 
   @FOUT ,')');
   
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
      
      SET @FS = CONCAT('SELECT group_concat(id) INTO @LSTOUT FROM folders WHERE userid = ', user_id, ' OR id IN
      (
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
}
