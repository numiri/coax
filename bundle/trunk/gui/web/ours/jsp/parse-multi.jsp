<%@ include file="session-check.jsp" %>
<%@ page import="com.coax.common.Cli.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%
//	Utils.WriteLog("dia chi ip client:", request.getRemoteAddr());
	MultiAlign ma = new MultiAlign();
	ma.Execute(request.getParameter("segments"),
			request.getRemoteAddr());
	out.println(ma.getXmlToClient());
%>

