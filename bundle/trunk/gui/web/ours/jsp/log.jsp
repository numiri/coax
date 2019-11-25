<%-- 
    Document   : log
    Created on : Oct 18, 2012, 4:23:30 PM
    Author     : ag
--%>

<%@page import="com.coax.common.Cli.WriteLogClient"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<%
    String username = (String) session.getAttribute("username");
    String exerid = request.getParameter("exerid") + "";
    String action = request.getParameter("action") + "";
    String error = request.getParameter("error") + "";
    WriteLogClient wlc = new WriteLogClient();
    wlc.setAction(action);
    wlc.setException(error);
    wlc.setExerid(exerid);
    wlc.setUsername(username);
    wlc.WriteLog();
%>