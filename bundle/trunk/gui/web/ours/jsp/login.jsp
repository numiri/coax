<%----------------------------------------------------------------------------
* login form
*-----------------------------------------------------------------------------
* key variables:  action
* the "action" hiddden <form> value sets the mode for this page:
*  1:   check username/password
*  0:   blank login form
* 
* weakness:
* hard-coded path of index.jsp to be the same as this file, eg. path = "."
------------------------------------------------------------------------------
*                            java section
----------------------------------------------------------------------------%>

<%@ page import="com.coax.common.Cli.Utils.*"%>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<%@ page trimDirectiveWhitespaces="true"%>

<%---- from dologin.jsp. start ----%>
<%@ page import="java.util.*"%>
<%@ page import="com.coax.db.dao.*"%>
<%@ page import="com.coax.db.dto.*"%>
<%

int action = 0;
if ( isSubstantive( request.getParameter( "action" ) ) ) action = Integer
.    parseInt(      request.getParameter( "action" ) );

switch( action )                                                              {
case 0: //
   try{
      session.invalidate();
   }catch(Exception e){}
   session = request.getSession(true);
   session.setAttribute("requesturl",
         (String)request.getAttribute("javax.servlet.forward.request_uri"));
   break;
case 1:  // dologin.jsp is obsolete
    String username = request.getParameter("username");//common
    String password = request.getParameter("password");//coax
    String token = request.getParameter("token");//freeciv
    String exerciseid = request.getParameter("exerciseid");//freeciv

    if (username != null && password != null) {
        password = password.trim();
        username = username.trim();           }

    //String procedure = "{ call login (?,?)}";
    //String[] params = {"p_name", "p_password"};
    //Object[] obj = {username, password};
    
    List<Users> list = new LinkedList<Users>();
    if (token != null) {
        Users user = UsersDAO.LoginMd5(username, token);
        list.add(user); }
    else { 
       //list = users.getItem(procedure, params, obj);
       UsersDAO userdao = new UsersDAO();
       Users user = userdao.login(username, password);
       if(user != null) list.add(user);}

    long userId = -1;
    if (list.size() > 0) {
    	userId = ((Users) list.get(0)).getId(); 

        LoginsDAO loginsDAO = new LoginsDAO();
        Logins loginItem = new Logins();
        loginItem.setIp(request.getRemoteHost());
        loginItem.setDevice("");
        loginItem.setUserId(userId);
        loginItem.setToken("");
        loginsDAO.insertOnSubmit(loginItem);
/*
        Cookie cook = new Cookie("username", username);
        cook.setPath("/");
        response.addCookie(cook);

        Cookie ckUserId = new Cookie("userid", Long.toString(userId));
        ckUserId.setPath("/");
        response.addCookie(ckUserId);
        
        String sessionid = request.getSession(true).getId();
        ckUserId = new Cookie("JSESSIONID", sessionid);
        ckUserId.setPath("/");
        response.addCookie(ckUserId);
*/        
        String usermode = list.get(0).getUserMode().getName();

        session.setAttribute("usermode", usermode);
        session.setAttribute("username", username);
        session.setAttribute("userid", Long.toString(userId));
        session.setAttribute("jid", session.getId());
        String returnUrl = (String) session.getAttribute("requesturl");
        if(returnUrl!=null && (returnUrl.indexOf("shared.jsp")!=-1 
                           || returnUrl.indexOf("author-xiz.jsp")!=-1)){
           response.sendRedirect(response.encodeURL(returnUrl));
        }else{
        if (token == null && usermode.equalsIgnoreCase("standalone"))
             response.sendRedirect(response.encodeURL( "./index.jsp?mode=standalone" ));
        else   
           response.sendRedirect(response.encodeURL("./index.jsp?mode=" + usermode 
           +   "&exerciseid=" + exerciseid));
        }
    } else {
    	session.removeAttribute("usermode");
    	session.removeAttribute("username");
    	session.removeAttribute("userid");
    	session.removeAttribute("jid");
        session.setAttribute("error", "Failed to sign in. Please try again!");
    }
   break;
default: break;                                                               }
%>
<%! public boolean isSubstantive( String s )                               {
    return ( s!=null  &&  s!=""  &&  s!="null" ) ? true : false;           } %>

<%---- from dologin.jsp. end ----%>

<!-----------------------------------------------------------------------------
                                html section
------------------------------------------------------------------------------>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    <title>Login</title>
</head>

<body ontouchmove="event.preventDefault();">
    <form action="login.jsp" method="post">
        <div style="z-index:99;position:relative;box-shadow:0 .375rem .375rem -.25rem rgba( 0, 0, 0, .2 );
        background-color: #fff;background: rgba(255, 255, 255, 1);
        clear: both;width: 100%;height: 64px;/*ie*/height: 4rem;overflow:hidden;">
                    <h2 style="color: rgba(0,139,93,1);margin-left:3px;">Coax</h2>
        </div>
        <div align="center">
            <h2 style="color: rgba(0,139,93,1);font-size: 27px;/*ie*/font-size: 1.675rem;
            margin-bottom: 13px;/*ie*/line-height: 1.4;margin: 0 0 .415rem 0;">Sign In</h2>
<% 
if(session.getAttribute("error")!=null){ 
	out.print( "<p style='color:red;'>"+session.getAttribute( "error")+ "</p>"); 
	session.removeAttribute( "error"); }
else{
%>

            <p style="font-size: .875rem;line-height: 1.6;display: block;
            -webkit-margin-before: 1em;-webkit-margin-after: 1em;
             -webkit-margin-start: 0px;-webkit-margin-end: 0px;">
             Already registered? Sign in with your Coax account.</p>

<%
}
%>        

            <p> Username:&nbsp;
                <input type='text' id='username' name='username' />
            </p>
            <p> Password:&nbsp;
                <input type='password' id='password' name='password' />
            </p>
            <p>
                <input type='hidden' id='action' name='action' value="1" />
                <input type='submit' name='bsubmit' value='SIGN IN'/>
            </p>
            <p style="font-size: .875rem;line-height: 1.6;display: block;
            -webkit-margin-before: 1em;-webkit-margin-after: 1em;
            -webkit-margin-start: 0px;-webkit-margin-end: 0px;">
                <a href="#" rel="ext" style="text-decoration: none; color: rgba(0,109,164,1);">
                Forgot your username or password?</a>
            </p>
            <rule style="height: 1px; line-height: 1px;
            min-height: 1px;width:auto;margin:.35rem 0;background-color:black;border-top:1px dashed #eee;">
            </rule>
            <p style="font-size:75%;line-height:1.6;margin:0 0 1rem 0;display: block;
            -webkit-margin-before: 1em;-webkit-margin-after: 1em;
            -webkit-margin-start: 0px;-webkit-margin-end: 0px;">New to Coax? 
            <a href="web/ours/jsp/register.jsp" style="text-decoration:none;color: rgba(0,109,164,1);">Go to Register page!</a>
            </p>
        </div>
    </form>

</body>

</html>
