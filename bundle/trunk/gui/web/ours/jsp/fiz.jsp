<%@ include file="session-check.jsp"%>
<%@page import="com.sun.org.apache.bcel.internal.generic.AALOAD"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="com.coax.db.dao.*"%>
<%@page import="com.coax.db.dto.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%
response.setContentType("text/json");
    //String sUserId = request.getParameter("userId");
    String fn = request.getParameter("fn");
    if(fn != null){        
        String sFolder_exers = request.getParameter("fexers");
        String sAmid = request.getParameter("amid");
        String sId = request.getParameter("exid");
        String ids = request.getParameter("ids");
        String sFolderId = request.getParameter("folderId");
        String sPage = request.getParameter("page");
        long folderId = -1;
        String mysql = "";
        long id = -1;
        try{
            folderId = Long.parseLong(sFolderId);
        }
        catch(Exception e){
            
        }
        try{
            id = Long.parseLong(sId);
        }
        catch(Exception e){
            
        }
        int t = Integer.parseInt(fn);
        switch(t){
            case 0 :{//insert               
                //ExerciseDAO _dao = new ExerciseDAO();           
                Folder_Exercises item;
                String []arrs = sFolder_exers.split(";");
                Folder_ExercisesDAO folderDao = new Folder_ExercisesDAO();
                List<com.coax.db.dto.Folder_Exercises> list = new ArrayList<com.coax.db.dto.Folder_Exercises>();
                for(int j = 0;j < arrs.length;j++){
                    String []m = arrs[j].split(",");
                    item = new Folder_Exercises();
                    item.setId(0);
                    if(m.length == 2){
                        folderId = Long.parseLong(m[1]);
                        id = Long.parseLong(m[0]);
                        item.setExerciseId(id);
                        item.setFolderId(folderId);
                        mysql = "insert into folder_exercise(folderId,exerciseId) values(?,?)";
                        Object []obj = {folderId,id};
                        Object results = folderDao.executeUpdate(mysql, obj, 0);
                        item.setId(Long.parseLong(results.toString()));
                    }
                    list.add(item);
                }
                String json = folderDao.getJson(list);
                if(json == ""){
                    json = "[]";
                }
                out.write(json);
                break;
            }
            case 1 :{//edit
                break;
            }
            case 3:{//doc danh sach cac bai tap trong folder
                mysql = "select folder_exercise.id,folder_exercise.folderId,";
                mysql = mysql + " folder_exercise.exerciseId,folders.name as folderName,";
                mysql = mysql + " exercises.content as exerciseName ";
                mysql = mysql + " from exercises,folders,folder_exercise ";
                mysql = mysql + " where folder_exercise.folderId = folders.id ";
                mysql = mysql + " and folder_exercise.exerciseId = exercises.id ";
                mysql = mysql + " and folder_exercise.folderId = ?; ";
                Object []obj = {folderId};
                Folder_ExercisesDAO folderExerDao = new Folder_ExercisesDAO();
                List<Folder_Exercises> list = folderExerDao.getItems(mysql, obj);
                String json = folderExerDao.getJson(list);
                if(json == ""){
                    json = "[]";
                }
                out.write(json);
                break;
            }
            case 2 :{//delete 
                String []arrs = ids.split(";");
                Folder_ExercisesDAO folderDao = new Folder_ExercisesDAO();
                Folder_Exercises item;
                List<com.coax.db.dto.Folder_Exercises> list = new ArrayList<com.coax.db.dto.Folder_Exercises>();
                for(int j = 0;j < arrs.length;j++){
                    String []m = arrs[j].split(",");
                    item = new Folder_Exercises();
                    item.setId(0);
                    if(m.length == 2){
                        long exerId = 0;
                        exerId = Long.parseLong(m[1]);
                        id = Long.parseLong(m[0]);
                        item.setExerciseId(exerId);
                        item.setFolderId(0);                        
                        mysql = "delete from  folder_exercise where id = ?";
                        Object []obj = {id};
                        Object results = folderDao.executeUpdate(mysql, obj,2);
                        if(Long.parseLong(results.toString()) == 1){
                            item.setId(id);
                        }                        
                    }
                    list.add(item);
                }
                String json = folderDao.getJson(list);
                if(json == ""){
                    json = "[]";
                }
                out.write(json);
                break;
            }
            default :{
                //lay danh sach cac bai tap
                String sFind = request.getParameter("keyword");
                if(sFind == null){
                   sFind = "";
                }
                int _page = 1;
                try{
                    _page = Integer.parseInt(sPage);
                }
                catch(Exception error){
                }
                int row = 20;//default
                int i = (_page - 1) * row;
                String sJsonUser = "exers";
                String sJsonPage = "pages";
                mysql = "select * from exercises where content like ? and id not in ("; 
                mysql = mysql + " select exerciseId  ";
                mysql = mysql + " from folder_exercise ";
                mysql = mysql + " where folderId = ?);";
                List<com.coax.db.dto.Exercises> list = new ArrayList<com.coax.db.dto.Exercises>();
                com.coax.db.dto.Exercises _item = new com.coax.db.dto.Exercises();
                ExerciseDAO exedao = new ExerciseDAO();
                sFind = "%" + sFind + "%";
                Object []obj = {sFind,folderId};
                list = exedao.getItems(mysql, obj);
                String json = exedao.getJson(list);
                int l = list.size();//tong so record
                int allPage = l/row;
                allPage = l % row == 0 ? allPage : allPage + 1;
                String _json = "[";
                int count = 0;
                 while( count < row && i < l){        
                    com.coax.db.dto.Exercises _demoTest = list.get(i);       
                    StringBuilder sBuilder = new StringBuilder();
                    sBuilder.append("{ \"" + Exercises.c_id + "\":\"").append(_demoTest.getId()).append("\",");
                    sBuilder.append(" \"" + Exercises.c_formula + "\":\"").append(_demoTest.getFormula()).append("\",");
                    sBuilder.append(" \"" + Exercises.c_content + "\":\"").append(_demoTest.getContent()).append("\"");
                    sBuilder.append("}");
                    if(count == 0){
                       _json += sBuilder.toString();
                    }
                    else{
                        _json += "," + sBuilder.toString();
                    }        
                       i++;
                       count ++;        
                   }//end wile
                 _json = _json + "]";
                 if(_json.equals("[]")){
                    // allPage = 0;
                 }
                StringBuilder createJson = new StringBuilder();
                createJson.append("{\"" + sJsonUser + "\":").append(_json).append(",");
                createJson.append("\"" + sJsonPage + "\":").append(allPage);
                createJson.append("}");
                out.write(createJson.toString());                
                break;
            }
        }
    }
%>
