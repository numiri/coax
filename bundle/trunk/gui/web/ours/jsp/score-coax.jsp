<%-- 
    Document   : score-coax
    Created on : Sep 18, 2012, 9:33:48 AM
    Author     : cz
    -thuc hien chen userid,exerid vao bang score.
    -bang bonus duoc nhap truoc nen can chu y co the chen duoc vao bang score
    nhung khi lay diem thuong thi lai khong co gi ca.
--%>
<%@ include file="session-check.jsp" %>
<%@page import="com.coax.db.dao.ScoreDAO"%>
<!DOCTYPE html>
<%
    String username = (String) session.getAttribute("username");
    String usermode = (String) session.getAttribute("usermode");

    if (username != null
            && com.coax.db.dao.Mode.connected.toString().compareToIgnoreCase(usermode)==0) {
        String exerid = request.getParameter("exerid");
        long result = ScoreDAO.CRUScoreByUserIdExerid(Integer.parseInt(userid), Integer.parseInt(exerid));
    }
%>