<%@page import="com.coax.db.dto.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%@page import="java.util.*"%>
<%@page import="com.coax.common.Cli.WriteLogClient"%>
<%@page import="java.net.*"%>
<%@page import="java.io.*"%>
<%@page import="com.coax.db.dao.*"%>
<%@page import="com.google.gson.Gson"%>
<%@ include file="session-check.jsp" %>
<%  
String usermode = (String) session.getAttribute("usermode");
String sAction = request.getParameter("action");
String sUserIdparam = request.getParameter("userId");
if(!usersession.equals("-1")) sUserIdparam = usersession;

ExerciseDAO xizdao = new ExerciseDAO();
if (validsession || usersession.equals("-1")) {
	String sExercise = request.getParameter("exerciseid");//exerciseid=5&userId=6
	String sVersion = request.getParameter("version");

    if("deletehistory".equals(sAction))                                       {
       if(sExercise!=null)                                                    {
        HistoriesDAO hisDAO = new HistoriesDAO();
        int rowsaffect = hisDAO.deleteHistory( Integer.parseInt(sExercise)
        ,   Integer.parseInt(sVersion) );
        out.println( rowsaffect );
        return;
                                                                              }
        out.println("no record not found");
        return;
	}
	else if(sExercise!=null && usersession!=null && sVersion!=null)                {
	   HistoriesDAO historiesdao = new HistoriesDAO();
       String sJson = historiesdao.GetHistoryRestore(Integer.parseInt(sUserIdparam),
             Integer.parseInt(sExercise), Integer.parseInt(sVersion));
        out.println(sJson);
        return;                                                               }

	else if ("xizinfo".equals(sAction))                                            {
	   long xizid = -1;
	   try{ xizid = Long.parseLong(sExercise);}
	   catch(NumberFormatException e){}
	   if(xizid != -1)                                                        {
	      Exercises xiz = xizdao.getExerciseModeById( xizid, "standalone" );
	      out.println(xiz.jsonObject());                                      }
       return;                                                                }
	else if("updateSkipValues".equals(sAction))                               {
	   long historyId = -1;
	   try{ historyId = Long.parseLong(request.getParameter("id"));}
	   catch(NumberFormatException e){}
	   if(historyId != -1)                                                    {
	      HistoriesDAO historiesdao = new HistoriesDAO();
	      String proc = request.getParameter("proc");
	      if(proc == null) proc = "";
	      String mysql = "update histories set proc_skipped = '"+proc+"' where id = ?";
	      System.out.println(mysql);
	      Object[] obj = {historyId};
	      out.println(historiesdao.executeUpdate(mysql,obj,1));               }
	   return;                                                                }
	else if (sAction != null)                                                 {
        XmlDAO xml = new XmlDAO();
        Map<String,Object> history = xml.Histories(sAction);
        Gson gson = new Gson();
        String json = gson.toJson(history);
        out.println(json);
        return;                                                               }
    /****************************/
	String sparam = request.getParameter("exerId");//exerId=5&userId=6
    if (sparam == null) { 
    	List<Exercises> list = xizdao.getByUserMode(usermode);
        String s = "[";
        if (list != null) {
            for (int i = 0; i < list.size(); i++) {
                Exercises item = (Exercises) list.get(i);
                if (i > 0)  s = s + ",";
                s = s + item.jsonObject();            } }
        s = s + "]";
        s = s.replace("\r\n", "");
        s = s.replace("\r", "");
        s = s.replace("\n", "");
        out.write(s);
    } else {
    	if(sVersion==null ){
    		Exercises exer = xizdao.getExerciseModeById(Long.parseLong(sparam), usermode);
    		if(exer!=null){
        		String xmlStroke = String
        				.format("<root><segments userId = \"%s\" exerId = \"%s\" selectId = \"%s\" historyId = \"-1\" status = \"1\" latex = \"%s\" fromStep = \"0\" toStep = \"0\" version = \"-1\">",
        						sUserIdparam, sparam, sparam,
        						exer.getFormula());   
        		xmlStroke += exer.getStroke().substring("<segments>".length());
        		xmlStroke += "<color>green</color></root>";
        		XmlDAO xml = new XmlDAO();
                Map<String,Object> data = xml.Histories(xmlStroke);
                sVersion = ""+ data.get("version"); 
                out.write("[{\"exerciseid\":"+sparam+",\"userid\":"+sUserIdparam+",\"version\":"+sVersion+"}]");
    		}
    	}
    }           
}//end if validsession

%>
