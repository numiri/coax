<%@ include file="session-check.jsp"%>
<%@ page import="java.util.*"%>
<%@ page trimDirectiveWhitespaces="true"%>
<%@ page import="com.coax.db.dao.XmlDAO"%>
<%  if (usersession.equals("-1") || validsession) {
        XmlDAO xml = new XmlDAO();
        String sSetting = request.getParameter("setting");
        if (sSetting != null) {
            xml.wirteSetting(sSetting);
        }
        String sXml = xml.reasXml(Long.parseLong(usersession));	
        int index = sXml.indexOf(">");
        if (index != -1) {
            sXml = sXml.substring(index + 1);
        }
        out.println(sXml);
    }
%>



