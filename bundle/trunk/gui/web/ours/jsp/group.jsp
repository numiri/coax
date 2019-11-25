<%@ include file="session-check.jsp" %>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="com.coax.db.dao.*"%>
<%@page import="com.coax.db.dto.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%
    response.setContentType("text/json");
    GroupDAO groups = new GroupDAO();
    Group item = new Group();
    String name = request.getParameter("name");
    String description = request.getParameter("description");
    String fn = request.getParameter("fn");
	String oid = request.getParameter("oid");
	String sUserId = request.getParameter("userId");
    if(!usersession.equals("-1")) sUserId = usersession;
    String _parentId  = request.getParameter("parentId");
    String _id = request.getParameter("id");
    String mysql = "";
    long userId = -1;
    if(fn != null){
       String rowGuid = java.util.UUID.randomUUID().toString();
        int t = -1;
        long parentId = -1;
        long id = -1;
        try{
            t = Integer.parseInt(fn);
        }
        catch(Exception err){
            System.out.println(err.getMessage());
        }
        try{
            userId = Long.parseLong(sUserId);
            parentId = Long.parseLong(_parentId);
        }
        catch(Exception err){
            System.out.println(err.getMessage());
        }
        if(_id != null && _id !=""){
            try{            
            id = Long.parseLong(_id);
         }
        catch(Exception err){
            System.out.println(err.getMessage());
        } 
        }
        Object result;
        switch(t){
            case 0 :{
                    mysql = "insert into groups(description,parentId,name,rowGuid,userId,isDelete) ";
                    mysql += " values(?,?,?,?,?,?)";
                    groups.setMySql(mysql);
                    item.setDescription(description);
                    item.setId(-1);
                    item.setIsDelete(false);
                    item.setName(name);
                    item.setRowGuid(rowGuid);
                    item.setUserId(userId);
                    item.setParent(parentId);
                    result = groups.insertOnSubmit(item);
                    item.setId(Long.parseLong(result.toString()));
                    out.write(item.jsonObject());
                    break;
            }
            case 1:{                   
                   Object obj[] = {id};
                   mysql = "select * from groups where id = ?";
                   List<Group> list = groups.getItems(mysql, obj);
                   if(list.size() > 0){
                       item = list.get(0);
                       item.setId(id);
                       item.setDescription(description);
                       item.setName(name);
                      // item.setIsDelete(false); 
                   }
                    else{
                       item.setId(id);
                       item.setDescription(description);
                       item.setName(name);
                       item.setIsDelete(false);
                       item.setUserId(userId);
                   }
                   mysql = "update groups set description =?,parentId =?,name =?  where id =?";                    
                   result = groups.update(mysql, item.getDescription(),
                           item.getParent(),item.getName(),item.getId());
                    out.write(item.jsonObject());
                    break;
            }
            case 2:{
                item.setId(id);
                item.setIsDelete(true);
                //result = groups.deleteItem(id);//groups.deleteOnSubmint(item);
                //mysql = "delete from groups where id=?";
                mysql = "update groups set isDelete = 1 where id=?";
                Object []obj = {id};
                //result = groups.executeUpdate(mysql, obj, 2);
                result = groups.update(mysql, obj);
                
				
				mysql ="delete from groups_users where groupId = ?";
				result = groups.executeUpdate(mysql, obj, 2);
				
				mysql ="delete from shared where groupId = ?";
				result = groups.executeUpdate(mysql, obj, 2);
				
                out.write(result.toString());
                 break;                    
            }
            case 3:{
               /*
                List<Group> list = new ArrayList<Group>();        
                //Object obj[] = {userId};
                String kGroups = "groups";
                String kUsers = "users";                
                String jGroups = "";
                String jsonExers = "";
				//String procedure = "{ call GET_GROUP(?) }";
				//String[] params = {"user_id"};
                //list = groups.getItem(procedure, params, obj);
                jGroups = groups.getJson(list);
                if(jGroups.equals("")){
                    jGroups = "[]";
                }
                System.out.println("group.jsp jGroups: "+jGroups);
                Group_UserDAO gUsers = new Group_UserDAO();
                List<Group_Users> lUsers = gUsers.getActivedGroupUser((int)userId); 
                jsonExers = gUsers.getJson(lUsers);
                if(jsonExers.equals("")){
                    jsonExers = "[]";
                }
                System.out.println("group.jsp jsonExers: "+jsonExers);
                StringBuilder createJson = new StringBuilder();
                createJson.append("{\"" + kGroups + "\":").append(jGroups).append(",");
                createJson.append("\"" + kUsers + "\":").append(jsonExers);
                createJson.append("}");             
                System.out.println("group.jsp createJson: "+createJson.toString());
                out.write(createJson.toString());
                */
                Group_UserDAO GrpUsers = new Group_UserDAO();
                out.write(GrpUsers.getAllGroupsUsersbyLogger(userId));
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
					mysql = "delete from groups_users where userId = " + id + " and groupId = " + oid;
					result = groups.update(mysql);
					
					mysql = "insert into groups_users(groupId,userId) values(" + _parentId + "," + id + ")";
					result = groups.update(mysql);
				}
				else{
					mysql ="update groups set parentId = " + _parentId + " where id = " + id;                   
					result = groups.update(mysql);
				}
				break;
			}
            default :{
                   List<Group> list = new ArrayList<Group>();                  
                   mysql = "select * from groups where userId = ?";
                   Object obj[] = {userId};
                   if(userId != -1){
                       list = groups.getItems(mysql, obj);                       
                       //khi user chon folder chua co thu muc goc.Thi tao ra thu muc goc cho user
                       if(list.size() == 0){
                           mysql = "insert into groups(description,parentId,name,rowGuid,userId,isDelete) ";
                           mysql += " values(?,?,?,?,?,?)";
                           groups.setMySql(mysql);
                           item = new Group();
                           item.setName("root");
                           item.setDescription("");
                           item.setIsDelete(false);
                           item.setParent(0);
                           item.setRowGuid(java.util.UUID.randomUUID().toString());
                           item.setUserId(userId);
                           Object obj_id = groups.insertOnSubmit(item);
                           item.setId(Long.parseLong(obj_id.toString()));
                           list.add(item);
                       }
                       String json = groups.getJson(list);
                       out.write(json);
                   }
                   break;
            }
        }
    }
%>
