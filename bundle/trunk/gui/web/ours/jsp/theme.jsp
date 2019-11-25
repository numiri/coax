<%@ include file="session-check.jsp" %>
<%@ page import="com.coax.db.dto.Theme"%>
<%@ page trimDirectiveWhitespaces="true"%>
<%@ page import="java.util.List"%>
<%@ page import="com.coax.db.dao.ThemesDAO"%>

<%  if (validsession) {
        ThemesDAO themes = new ThemesDAO();
        List<Theme> list = themes.getAll();
        if (list.size() > 0) {
            out.write(themes.getJson(list));
        }
    }
%>