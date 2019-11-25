<%@ include file="session-check.jsp" %>
<%@ page import="com.coax.common.Cli.*"%>
<%@ page trimDirectiveWhitespaces="true"%>

<%--------------------------------------------------------------
this is steps.jsp, reworked with:
1.  session-check.jsp
2.  if(A) { xxx; a } elseif(B) { xxx; b } else {c} has been changed to
    if ( -A && -B ) {c}  xxx if(A) {a} else if (B) {b}
    the 2 SHOULD be equivalent, except that we don't repeat the xxx code

input:  latex1, latex2, <maxima variable="x,y">
output: 0 = wrong, 1 = "right"

tomcat debugger:  
> print request.getQueryString()
-------------------------------------------------------------------%>

<%
response.setContentType("text/xml");

Corx corx = new Corx();
corx.setUserMode("standalone");
corx.Execute( request.getParameter("qstring"), request.getRemoteAddr());
out.println(corx.getXmlToClient());
%>
