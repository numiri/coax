<%@ include file="session-check.jsp" %>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="com.coax.db.dao.*"%>
<%@page import="com.coax.db.dto.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%
    response.setContentType("text/json");

    FolderDAO _folderDao = new FolderDAO();
    Folder item = new Folder();
    String name = request.getParameter("name");
    String description = request.getParameter("description");
    String fn = request.getParameter("fn");
    String oid = request.getParameter("oid");
    String sUserId = request.getParameter("userId");
    if(!usersession.equals("-1")) sUserId = usersession; 
    	
    String _parentId  = request.getParameter("parentId");
    String _id = request.getParameter("id");
    long userId = -1;
    if(fn != null && fn !=""){
        //fn 0 insert,1 edit,2 delete, 4 update parent
        String rowGuid = java.util.UUID.randomUUID().toString();
        int t = -1;
        long parentId = -1;
        long id = -1;
        try{
            t = Integer.parseInt(fn);
        }
        catch(Exception err){
            System.out.println("Folder.jsp , parseInt( fn = "+fn+ ") with error "+err.getMessage());
        }
        try{
            userId = Long.parseLong(sUserId);
            parentId = Long.parseLong(_parentId);
        }
        catch(Exception err){
            System.out.println("Folder.jsp , parseLong sUserId = "+sUserId+" or _parentId = "+_parentId+" with error "+err.getMessage());
        }
        if(_id != null && _id !=""){
            try{ 
            id = Long.parseLong(_id);
         }
        catch(Exception err){
            System.out.println("Folder.jsp , parseLong _id = "+_id+" with error "+err.getMessage());
        } 
        }
        Object result;
        String mysql ="";
        switch(t){
            case 0 :{
                   mysql = "insert into folders(description,parentId,name,rowGuid,userId,isDelete) ";
                   mysql += " values(?,?,?,?,?,?)";
                   _folderDao.setMySql(mysql);
                    item.setDescription(description);
                    item.setId(-1);
                    item.setIsDelete(false);
                    item.setName(name);
                    item.setRowGuid(rowGuid);
                    item.setUserId(userId);
                    item.setParent(parentId);
                    result = _folderDao.insertOnSubmit(item); 
                    item.setId(Long.parseLong(result.toString()));
                    out.write(item.jsonObject());
                    break;
            }
            case 1:{                  
                   mysql = "select * from folders where id = ?;";
                   Object obj[] = {id};
                   List<Folder> list = _folderDao.getItems(mysql, obj);
                   if(list.size() > 0){
                       item = list.get(0);
                       item.setId(id);
                       item.setDescription(description);
                       item.setName(name);                       
                   }
                    else{
                       item.setId(id);
                       item.setDescription(description);
                       item.setName(name);
                       item.setIsDelete(false);
                       item.setUserId(userId);
                   }
                   mysql ="update folders set description =?,parentId =?,name =? where id = ?";                   
                   result = _folderDao.update(mysql, item.getDescription(),item.getParent()
                           ,item.getName(),item.getId());
                   out.write(result.toString());
                    break;
            }
            case 2:{
                   item.setId(id);
                   item.setIsDelete(true);
                   //mysql ="delete from folders where id = ?";
                   mysql ="update folders set isDelete = 1 where id = ?";
                   Object[] obj = {id};
                   //result = _folderDao.executeUpdate(mysql, obj, 2);
                   result = _folderDao.update(mysql, obj);
				   
				   mysql ="delete from folder_exercise where folderId = ?";
				   result = _folderDao.executeUpdate(mysql, obj, 2);
				   
				   mysql ="delete from shared where folderId = ?";
				   result = _folderDao.executeUpdate(mysql, obj, 2);
				   
                   item.setId(Long.parseLong(result.toString()));
                   out.write(item.jsonObject());
                   break;
            }
            case 3:{
               /*
                List<Folder> list = new ArrayList<Folder>();
                
                String folders = "folders";
                String exers = "exers";
                String versions = "versions";
                Object obj[] = {userId};
                String jsonFolders = "";
                String jsonExers = "[]";
                list = _folderDao.getActivedFolder((int)userId);
                jsonFolders = _folderDao.getJson(list);
                 if(jsonFolders.equals("")){
                    jsonFolders = "[]";
                }
               
                Folder_ExercisesDAO _folderExerDao = new Folder_ExercisesDAO();
                
                List<Folder_Exercises> _lfolderExers = _folderExerDao.getActivedFolderExercise((int)userId);
                jsonExers = _folderExerDao.getJson(_lfolderExers);
                if(jsonExers.equals("")){
                    jsonExers = "[]";
                }

                StringBuilder createJson = new StringBuilder();
                String history =HistoriesDAO.getHistoryByUserId(userId);
                createJson.append("{\"" + folders + "\":").append(jsonFolders).append(",");
                createJson.append("\"" + exers + "\":").append(jsonExers).append(",");
                createJson.append("\"" + versions + "\":").append(history);
                createJson.append("}");              
                out.write(createJson.toString());
                */
                Folder_ExercisesDAO _folderExerDao = new Folder_ExercisesDAO();
                out.write(_folderExerDao.getAllFoldersExercisesbyLogger(userId));
                break;
            }
			case 4:{
				//var _send_data = {
				//	id : cid,
				//	parentId : pid,
				//	sUserId: oid,
				//	name : $(ui.draggable).hasClass("file") ? "1" : "0",
				//	fn : 1
				//}
				
				if(name.equals("1"))//exercise
				{
					mysql = "delete from folder_exercise where exerciseId = " + id + " and folderId = " + oid;
					result = _folderDao.update(mysql);
					
					mysql = "insert into folder_exercise(folderId,exerciseId) values(" + _parentId + "," + id + ")";
					result = _folderDao.update(mysql);
				}
				else{
					mysql ="update folders set parentId = " + _parentId + " where id = " + id;                   
					result = _folderDao.update(mysql);
				}
				break;
			}
            default :{
                   List<Folder> list = new ArrayList<Folder>();
                   mysql ="select * from folders where userId = ?";
                   Object obj[] = {userId};
                   if(userId != -1){
                       list = _folderDao.getItems(mysql, obj);
                       //khi user chon folder chua co thu muc goc.Thi tao ra thu muc goc cho user
                       if(list.size() == 0){
                           item = new Folder();
                           mysql = "insert into folders(description,parentId,name,rowGuid,userId,isDelete) ";
                           mysql += " values(?,?,?,?,?,?)";
                           _folderDao.setMySql(mysql);
                           item.setName("home");
                           item.setDescription("home");
                           item.setIsDelete(false);
                           item.setParent(0);
                           item.setRowGuid(rowGuid);
                           item.setUserId(userId);
                           Object obj_id = _folderDao.insertOnSubmit(item);
                           item.setId(Long.parseLong(obj_id.toString()));
                           list.add(item);
                       }
                       String json = _folderDao.getJson(list);
                       out.write(json);
                   }
                   break;
            }
        }
    }
%>
