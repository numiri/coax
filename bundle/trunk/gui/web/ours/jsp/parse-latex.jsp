<%@ page import="com.coax.common.Cli.*"%>
<%@ page trimDirectiveWhitespaces="true"%>

<%
response.setContentType("text/html");
String fraz = request.getParameter("f");
System.out.println("f:"+fraz);
try{
   fraz = Latex2Maxima.ToMaxima(fraz);
}catch(Throwable e) {
   System.out.println(e.toString()); 
}
out.print(fraz);
%>

