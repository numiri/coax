<%-- 
    Document   : test
    Created on : Mar 26, 2012, 2:38:51 PM
    Author     : DL
--%>

<%@page import="com.coax.common.Cli.Cmd"%>
<%@page contentType="text/html" pageEncoding="windows-1252"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0//EN" "http://www.w3.org/TR/REC-html40/strict.dtd">
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
        <title>JSP Page</title>
    </head>
    <body>
        <%
       out.println( Cmd.GetDateTime());
        %>
    </body>
</html>
