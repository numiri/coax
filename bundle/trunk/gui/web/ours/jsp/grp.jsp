<%@ include file="session-check.jsp" %>
<%@page import="com.google.gson.reflect.TypeToken"%>
<%@page import="java.lang.reflect.Type"%>
<%@page import="com.google.gson.Gson"%>
<%@page import="com.sun.org.apache.bcel.internal.generic.AALOAD"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="com.coax.db.dao.*"%>
<%@page import="com.coax.db.dto.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%
    response.setContentType("text/json");
    String sFn = request.getParameter("fn");
    String sgroupId = request.getParameter("groupId");
    String sUserId = request.getParameter("userId");
    String sId = request.getParameter("id");
    String gusers = request.getParameter("gusers");
    String ids = request.getParameter("ids");//[3:16:16 PM] hai pham: keyword
    String mySql ="";
    Gson gson = new Gson();    
    long groupId = 2;
    long userId = -1;
    int fn = -1;
    try{
        fn = Integer.parseInt(sFn);
    }
    catch(Exception errorFn){
        fn = -1;
    }
    String sGroup_UsersJSon = "";
    try{
        userId = Long.parseLong(sUserId);
    }
    catch(Exception error){
    }
    try{
        groupId = Long.parseLong(sgroupId);
      }
        catch(Exception err){
            groupId = -1;
            System.out.println(err.getMessage());
    }   
    switch(fn){
        case -1:{//select group            
              mySql = "select groups_users.id,groupId,groups.id as groupId ";
              mySql += ",groups.name as name,groups_users.userId,";
              mySql += "users.name as username ";
              mySql += "from groups_users,users,groups ";
              mySql += "where users.id = groups_users.userId ";
              mySql += "and groups_users.groupId = groups.id ";
              mySql += "and groups_users.groupId = ?; ";
              Object []obj = {groupId};
              Group_UserDAO gUsers = new Group_UserDAO();
              List<Group_Users> list = gUsers.getItems(mySql, obj);//gUsers.getItem(procedure, params, obj);               
              System.out.println("mysql group : " + mySql);              
              String jSonGroup = gUsers.getJson(list);
              sGroup_UsersJSon = jSonGroup;
              out.write(sGroup_UsersJSon);//success
            break;
        }
        case 0:{//insert
             Group_Users item;
             Group_UserDAO _itemDao;            
            _itemDao = new Group_UserDAO();
            String _json = "{'error':'khong thanh cong " + gusers + "'}";//item.jsonObject();
            List<Group_Users> _listUser = new ArrayList<Group_Users>();
            if(gusers != null && gusers != ""){
                gusers = gusers.trim();
                String []arrs = gusers.split(";");
                for(int i = 0;i< arrs.length;i++){
                    String []m = arrs[i].toString().split(",");
                    item = new Group_Users();
                    if(m.length == 2){
                        try{
                            groupId = Long.parseLong(m[1]);
                        }
                        catch(Exception error){
                            groupId = -1;
                        }
                         try{
                            userId = Long.parseLong(m[0]);
                        }
                        catch(Exception error){
                            userId = -1;
                        }                        
                        if(userId != -1 && groupId !=-1){
                            mySql = "insert into groups_users(groupId,userId) values(?,?)";
                            item.setId(-1);
                            item.setGroupId(groupId);
                            item.setUserId(userId);
                            Object []obj = {item.getGroupId(),item.getUserId()};                          
                            Object result = _itemDao.executeUpdate(mySql, obj, 0);
                            if(result.toString().equals("-1") || result.toString().equals("0")){
                                item.setId(0);
                            }
                            else
                                item.setId(Long.parseLong(result.toString()));
                        }
                        else{
                            item.setId(0);
                        }
                        
                    }//end if m
                    else{
                       item.setId(0); 
                    }
                    _listUser.add(0,item);                    
                } 
                _json = _itemDao.getJson(_listUser);
                out.write(_json);
                return;
            }
            out.write(_json);
            break;
        }
        case 1:{//edit
            break;
        }
        case 3:{//lay danh sach users thuoc group             
            break;
        }            
        case 2:{//delete user ra khoi group
            long id = 0;
             String json ="{success : 1}";
            Group_Users item;
            Group_UserDAO _itemDao;            
            List<Group_Users> _listUser = new ArrayList<Group_Users>();
            _itemDao = new Group_UserDAO();
            if(ids != null && ids !=""){
                ids = ids.trim();
                String []arrs = ids.split(";");                
                for(int i = 0;i < arrs.length;i++){
                    String []m = arrs[i].toString().split(",");
                    item = new Group_Users();
                    if(m.length ==2){
                         try{
                            id = Long.parseLong(m[0]);
                        }
                        catch(Exception _error){
                            id = 0;
                        }
                         long _userId = 0;
                         try{
                            _userId = Long.parseLong(m[1]);
                        }
                        catch(Exception _error){
                            _userId = 0;
                        }
                          mySql = "delete from groups_users where id = ?;";      
                          item.setId(id);
                          item.setGroupId(1);
                          item.setUserId(_userId); 
                          Object obj[]={id};
                            Object result = _itemDao.executeUpdate(mySql, obj, 0);
                            if(result.toString().equals("-1") || result.toString().equals("0")){
                                item.setId(0);
                            }
                    }                                                          
                    _listUser.add(item);
                }
                json = _itemDao.getJson(_listUser);
                out.write(json);
            }            
            break;
        }
            default:{
                String json ="{success : 0}";
                out.write(json);//success
                break;
            }
    } 
%>