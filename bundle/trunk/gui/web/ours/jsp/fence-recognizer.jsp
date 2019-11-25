<%@ page language="java" contentType="text/xml; charset=US-ASCII"
	pageEncoding="US-ASCII"%>
<%@ page import="com.coax.common.Cli.*"%>
<% response.addHeader("Access-Control-Allow-Origin", "*"); %>
<%@page trimDirectiveWhitespaces="true"%>

<%

RecognizerXml rx = new RecognizerXml();
String s = rx.BuildXml(request.getParameter("segmentList"),true);
// hardcode _heart if not _doudle
// possibilities: "_heart" || "_circle" || "_square" || "_trapezium"
if(s.indexOf("symbol=\"v\"") != -1)
   s = s.replace("symbol=\"v\"", "symbol=\"_heart\"");
out.println(s);
%>