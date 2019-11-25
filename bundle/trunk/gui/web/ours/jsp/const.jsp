<%-- 
    Document   : checksession
    Created on : Jun 1, 2012, 9:23:09 AM
    Author     : cz
--%>

<%@page import="com.coax.db.dao.SessionDAO"%>
<%@page import="com.coax.db.dto.Session"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%!
    public boolean checkLogin(String did) {

        if (did != null) {
            SessionDAO dao = new SessionDAO();
            Session ses = dao.GetSessionByToken(did);
            ses.Update();
            return true;
        }
        return false;
    }

    public Session checkSession(String did) {

        if (did != null) {
            SessionDAO dao = new SessionDAO();
            Session ses = dao.GetSessionByToken(did);
            ses.Update();
            return ses;
        }
        return null;
    }
    
%>
<%!
 public String c_userid = "userid";
 public String c_username = "username";
 public String c_usermode = "usermode";
%>
