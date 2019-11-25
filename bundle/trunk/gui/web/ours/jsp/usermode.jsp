<%-- 
    Document   : usermode
    Created on : Jun 12, 2012, 10:59:10 PM
    Author     : cz
--%>

<%@page import="java.util.HashMap"%>
<%@page import="java.util.Map"%>
<%@page import="com.coax.db.dao.UserModeDAO"%>
<%@page trimDirectiveWhitespaces="true"%>
<%
    response.addHeader("Access-Control-Allow-Origin", "*");
%>
<%
    boolean jsonP = false;
    String cb = request.getParameter("callback");
    if (cb != null) {
        jsonP = true;
        response.setContentType("text/javascript");
    } else {
        response.setContentType("application/x-json");
    }

    if (jsonP) {
        out.write(cb + "(");
    }
    String node = request.getParameter("node");
    if (node == "root") {
    } else {
        try {
            int id = Integer.parseInt(node);
            out.print(UserModeDAO.getAllToJson(id));

            if (jsonP) {
                out.write(");");
            }
            return;
        } catch (Exception e) {
        }

    }
    out.write(UserModeDAO.getAllToJson());

    if (jsonP) {
        out.write(");");
    }


%>