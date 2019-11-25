<%@page import="com.sun.org.apache.bcel.internal.generic.AALOAD"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="com.coax.db.dao.*"%>
<%@page import="com.coax.db.dto.*"%>
<%@page contentType="text/json" pageEncoding="UTF-8"%>
<%@page trimDirectiveWhitespaces="true"%>
<%
    response.addHeader("Access-Control-Allow-Origin", "*");
%>
<%
    String sPage = request.getParameter("page");
    String sFn = request.getParameter("fn");
    String sFind = request.getParameter("keyword");
    String sgroupId = request.getParameter("groupId");
    long groupId = 0;
    try{
        groupId = Long.parseLong(sgroupId);
    }
    catch(Exception error){
        groupId = 0;
    }
    if(sFind == null){
        sFind = "";
    }
    int fn = -1;
    try{
        fn = Integer.parseInt(sFn);
    }
    catch(Exception error){
    }
    int _page = 1;
    try{
        _page = Integer.parseInt(sPage);
    }
    catch(Exception error){
    }
    int row = 20;//default
    int i = (_page - 1) * row;
    //lay danh sach users
    UsersDAO items = new UsersDAO();
    List<com.coax.db.dto.Users> list = new ArrayList<Users>();    
    String mysql = "select * from users where name like  ?";    
    mysql = "select * from users where name like ? and id not in(select userId from groups_users ";
    mysql += " where groupId =?);";
    sFind = "%" + sFind + "%";
    Object []obj = {sFind,groupId};
    list = items.getItems(mysql, obj);
    int l = list.size();//tong so record
    int allPage = l/row;
    allPage = l % row == 0 ? allPage : allPage + 1;
    List<com.coax.db.dto.Users> list1 = new ArrayList<Users>();
    int count = 0;
    String _json = "[";    
    while( count < row && i < l){        
        Users _demoTest = list.get(i);    
        String userName = "username";
         StringBuilder sBuilder = new StringBuilder();
         sBuilder.append("{ \"" + Users.c_Id + "\":\"").append(_demoTest.getId()).append("\",");
         sBuilder.append(" \"" + Users.c_email + "\":\"").append(_demoTest.getEmail()).append("\",");
         sBuilder.append(" \"" + userName + "\":\"").append(_demoTest.getName()).append("\"");
         sBuilder.append("}");
         if(count == 0){
            _json += sBuilder.toString();
         }
         else{
             _json += "," + sBuilder.toString();
         }
         list1.add(list.get(i));
        i++;
        count ++;        
    }
    _json += "]";
    String sJsonUser = "users";
    String sJsonPage = "pages";
    String json = "";  
    try{
        json = items.getJson(list1);
    }
    catch(Exception error){        
        json = _json;        
    }
    if(json.equals("")){
        json = "[]";
       // allPage = 0;
    }
    StringBuilder createJson = new StringBuilder();
    createJson.append("{\"" + sJsonUser + "\":").append(json).append(",");
    createJson.append("\"" + sJsonPage + "\":").append(allPage);
    createJson.append("}");
    out.write(createJson.toString());
    
%>