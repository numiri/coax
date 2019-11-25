<%@ include file="session-check.jsp" %>
<%@ page import="com.coax.common.Cli.Utils"%>
<%@ page import="com.coax.common.Cli.Cmd"%>
<%@ page import="com.coax.common.Cli.SeshatAlign"%>
<%@ page import="java.util.Date"%>
<%@ page import="java.text.SimpleDateFormat"%>
<%@page trimDirectiveWhitespaces="true"%>

<%
response.setContentType("text/xml");
String action = request.getParameter("action");
String content = request.getParameter("input");
String id = request.getParameter("id");
if(id == null) id="";

String filename = userid + "shtmp" + new SimpleDateFormat("-yyMMddHHmmss-SSS").format(new Date()).toString();
String fileinput = Utils.Combine(Cmd.getWorkingPath(), filename + ".scgink");
String fileoutput = Utils.Combine(Cmd.getWorkingPath(), filename + ".scgink");
if(content!= null) {
   Utils.WriteFile(fileinput, content, false);
   out.println(SeshatAlign.run(action,fileinput,fileoutput,id));
}
%>