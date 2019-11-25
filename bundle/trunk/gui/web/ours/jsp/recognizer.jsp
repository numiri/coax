<%@ page import="com.coax.common.Cli.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%@ include file="session-check.jsp" %>

<%
        RecognizerXml rx = new RecognizerXml();
        String s = rx.BuildXml(request.getParameter("segmentList"), false);
        out.println(s);
%>