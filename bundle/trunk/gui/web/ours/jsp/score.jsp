<%-- 
    Document   : score
    Created on : Aug 26, 2012, 11:15:36 AM
    Author     : cz
--%>

<%@page import="com.google.gson.Gson"%>
<%@page import="com.coax.db.dao.BonusDAO"%>
<%@page import="java.util.LinkedList"%>
<%@page import="com.coax.db.dao.ScoreDAO"%>
<%@page import="com.coax.db.dto.Score"%>
<%@page import="com.coax.db.dto.Users"%>
<%@page import="com.coax.db.dto.Bonus"%>
<%@page import="java.util.List"%>
<%@page import="com.coax.db.dao.UsersDAO"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%

    String username = request.getParameter("username");//freeciv
    String token = request.getParameter("token");//freeciv
    String bonusid = request.getParameter("bonusid");//update-bonus danh dau da su dung
    Users user = null;
    if (token != null) {
        user = UsersDAO.LoginMd5(username, token);
    }
    if (user != null) {
        if (bonusid == null) {
            List<Bonus> bonuses = new LinkedList<Bonus>();
            bonuses = BonusDAO.ReCalculatedBonus((int)user.getId());
            String json = BonusDAO.ListToJson(bonuses);
            out.println(json);
        } else {
            System.out.println(bonusid);
            ScoreDAO.UpdateFromJson(bonusid);
        }
    }
%>