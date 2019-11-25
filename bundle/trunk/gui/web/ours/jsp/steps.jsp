<%@ include file="session-check.jsp" %>
<%@page import="org.activemath.webapp.user.User"%>
<%@page import="org.activemath.webapp.dict.queries.AMAbstractQuery"%>
<%@page import="com.coax.common.Cli.Utils"%>
<%@page import="com.coax.common.Cli.CidAlign"%>
<%@ page import="java.util.*"%>
<%@ page import="com.coax.db.dao.XmlDAO"%>
<%@ page import="java.net.*"%>
<%@ page import="java.io.*"%>
<%@page trimDirectiveWhitespaces="true"%>

<%
    response.setContentType("text/xml");
 
    String mode = (String) session.getAttribute("usermode");
    boolean isConnected = (com.coax.db.dao.Mode.connected.toString().compareToIgnoreCase(mode) == 0);

    if (validsession) {
        XmlDAO xml = new XmlDAO();
        String c_useram = "useram";

        String sParam = request.getParameter("segments");
        String title = "";

        if (isConnected) {
            title = xml.BuildStringDatFile(sParam).replaceAll("\r", "").replaceAll("\t", "").replaceAll("\n", "");
        } else {
            title = sParam;
        }
        title = sParam; //g: Why need the 5 lines of code just above?


        if(title!= null) Utils.WriteFileTxt("xmlstep", title);
        CidAlign ma = new CidAlign();
        ma.setUserMode(mode);
        if (session.getAttribute(c_useram) != null && isConnected) {
            ma.setUseram((User) session.getAttribute(c_useram));
        }

        ma.Execute(title,request.getRemoteAddr());
        ma.setSession(session);
        out.println(ma.getXmlToClient());

        if (session.getAttribute(c_useram) == null && isConnected) {
            User user = ma.getUseram();
            if (user != null) {
                session.setAttribute(c_useram, ma.getUseram());
            }

        }
    }
       else if (usersession.equals("-1")) {
        XmlDAO xml = new XmlDAO();

        String sParam = request.getParameter("segments");
        String title = "";

        if (isConnected) {
            title = xml.BuildStringDatFile(sParam).replaceAll("\r", "").replaceAll("\t", "").replaceAll("\n", "");
        } else {
            title = sParam;
        }
      //  title = sParam;

        if(title!= null) Utils.WriteFileTxt("xmlstep", title); 
        CidAlign ma = new CidAlign();
        ma.setUserMode(mode);
        ma.Execute(title,request.getRemoteAddr());
        ma.setSession(session);
        out.println(ma.getXmlToClient());

    } 

%>



