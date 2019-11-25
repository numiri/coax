<%@ page language="java" contentType="application/json" pageEncoding="UTF-8"%>
<%@page trimDirectiveWhitespaces="true"%>
<%@ page import="java.util.*"%>
<%@ page import="com.coax.db.dao.*"%>
<%@ page import="com.coax.db.dto.*"%>
<%
    response.addHeader("Access-Control-Allow-Origin", "*");
%>

<%
    String username = request.getParameter("username");//common
    String password = request.getParameter("password");//coax
    String token = request.getParameter("token");//freeciv
    String exerciseid = request.getParameter("exerciseid");//freeciv
    String mod = request.getParameter("mod");
    String userfreeciv = request.getParameter("userfreeciv");
    System.out.println("gia tri cua hidden field:" + userfreeciv);

    System.out.println(" user : " + username + " pass : " + password);
    session = request.getSession();
    String sessionid = session.getId();
    System.out.println("==================================\r");
    System.out.println("Session server: " + sessionid + "\r");
    Cookie[] cookies = request.getCookies();
    String sessionclient = "";
    if (cookies != null) {
        for (int i = 0; i < cookies.length; i++) {
            System.out.print("name: " + cookies[i].getName() + "value: "
                    + cookies[i].getValue() + "\r");
            if (cookies[i].getName().compareToIgnoreCase("JSESSIONID") == 0) {
                sessionclient = cookies[i].getValue();

            }
        }
    }

    System.out.println("client: " + sessionclient + "gia tri ss:"
            + sessionid.compareToIgnoreCase(sessionclient) + "\r");

    if (username != null && password != null) {
        password = password.trim();
        username = username.trim();
    }

    String procedure = "{ call login (?,?)}";
    String[] params = {"p_name", "p_password"};
    Object[] obj = {username, password};
    UsersDAO users = new UsersDAO();
    List<Users> list = new LinkedList<Users>();
    if (token != null) {
        Users user = UsersDAO.LoginMd5(username, token);
        list.add(user);
    } else {
        list = users.getItem(procedure, params, obj);
    }

    long userId = -1;

    for (int i = 0; i < list.size(); i++) {
        Users item = (Users) list.get(i);
        userId = item.getId();
    }

    System.out.print("USERID CUA dologin" + userId);
    if (list.size() > 0) {

        LoginsDAO loginsDAO = new LoginsDAO();
        Logins loginItem = new Logins();
        loginItem.setIp(request.getRemoteHost());
        loginItem.setDevice("");
        loginItem.setUserId(userId);
        loginItem.setToken("");
        loginsDAO.insertOnSubmit(loginItem);

        Cookie cook = new Cookie("username", username);
        cook.setPath("/");
        response.addCookie(cook);

        String sUserId = "" + userId;
        Cookie ckUserId = new Cookie("userid", sUserId);
        ckUserId.setPath("/");
        response.addCookie(ckUserId);
        ckUserId = new Cookie("JSESSIONID", sessionid);
        ckUserId.setPath("/");
        response.addCookie(ckUserId);
        System.out.println("login :" + sUserId + "\r");
        System.out.println("DA XET USERNAME TAI DAY \r");
        System.out.println("server  : " + request.getServerName()
                + " tess : " + request.getRemoteHost());
        String usermode = list.get(0).getUserMode().getName();
        /*
        * hpham 1209181117
        * dua cac doan setAtribute ve cung mot cho va them mot atribute de kiem tra qua trinh login
        * se kiem tra va set JSESSION client
        */
        session.setAttribute("usermode", usermode);
        session.setAttribute("username", username);
        session.setAttribute("userid", sUserId);
        session.setAttribute("jid", sessionid);
        if (token == null) {
            out.println("{success:true,messages:{mode:'" + usermode + "',username:'" + username + "',token:'" + Utils.getMD5(password) + "'}}");

        } else {
            response.sendRedirect("../index.jsp?mode=" + usermode + "&exerciseid=" + exerciseid);
        }

    } else {
        out.println("{success:false,errors:{reason:'Login failed.Try again'}}");
    }
%>
