<%@page language="java" contentType="text/html; charset=ISO-8859-1" 
pageEncoding="ISO-8859-1"%>

<%
response.addHeader("Access-Control-Allow-Origin", "*");
/*
session = request.getSession(true);
String sessionid = session.getId();
Cookie[] cookies = request.getCookies();
String usersession = (String) session.getAttribute("userid");
if (usersession == null)  usersession = "";
String sessionclient = "";
String userid = ""; 
if (cookies != null)                                                          {
   for (int i = 0; i < cookies.length; i++)                                   {
      if (cookies[i].getName().compareToIgnoreCase("JSESSIONID") == 0)
         sessionclient = cookies[i].getValue();
      if (cookies[i].getName().compareToIgnoreCase("userid") == 0)            {
    	  userid        = cookies[i].getValue();                              }}}

boolean validsession 
=   ( sessionid.compareToIgnoreCase(sessionclient) == 0 )
&&  ( usersession.compareToIgnoreCase(userid) == 0 )
&& ( usersession != "" ) ;
if ( !usersession.equals("-1")  && !validsession ){
   String url = response.encodeRedirectURL(this.getServletContext().getInitParameter("login"));
   response.sendRedirect(url);
   return;                                                                }
*/
String usersession = (String) session.getAttribute("userid");
if (usersession != null) usersession = usersession.trim();

if (usersession == null || "".equals(usersession))                            {
   String url = response.encodeRedirectURL(
                this.getServletContext().getInitParameter("login"));
   String requesturi = request.getRequestURI();
   if(requesturi.indexOf("shared.jsp")!=-1  
         || requesturi.indexOf("author-xiz.jsp")!=-1)                         {
		RequestDispatcher dispatcher = request.getRequestDispatcher(response.encodeURL(url));
		dispatcher.forward(request, response);                                }
   else response.sendRedirect(response.encodeURL(url));                                           
   return;
}

//keep the userid variable because some other jsps are using it.
//usersession & userid are interchangeable
String userid = usersession; 
boolean validsession = ( usersession != "" );
%>
