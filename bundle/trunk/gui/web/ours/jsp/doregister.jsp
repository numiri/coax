<%@page import="com.coax.db.dto.Users"%>
<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Formatter"%>
<%@page import="java.text.DateFormat"%>
<%@page import="java.security.Timestamp"%>
<%@page import="com.coax.db.dao.UsersDAO"%>
<%@page import="java.util.Date"%>
<%! public String getTextValue( String s )  {
	if(s!=null) return s.trim();
	else return "";                         } %>
<%
session.removeAttribute( "error"); 
session.removeAttribute( "success");

String address = getTextValue(request.getParameter("address"));
String phone = getTextValue(request.getParameter("phone"));
String email = getTextValue(request.getParameter("email"));
String birthday = getTextValue(request.getParameter("birthday"));
String first = getTextValue(request.getParameter("first"));
String last = getTextValue(request.getParameter("last")); 
String pass = getTextValue(request.getParameter("pass"));
String username = getTextValue(request.getParameter("username"));
int umodeId = 1;

if (!address.isEmpty() && !phone.isEmpty()
 && !email.isEmpty() && !birthday.isEmpty()
 && !first.isEmpty() && !last.isEmpty()
 && !username.isEmpty() && !pass.isEmpty() )                     {
	DateFormat format = new SimpleDateFormat("MM/dd/yyyy");
	Date dbirthday = null;
	try{
		dbirthday = (Date) format.parse(birthday);
		birthday = format.format(dbirthday);//convert 31/12/2005 to 2007-07-12
	}catch (java.text.ParseException pe){
		
	}
	String name =  first + " " + last;
	umodeId = Integer.parseInt(request.getParameter("usermode"));

    UsersDAO userdao = new UsersDAO();

    boolean bemail = userdao.IsEmailExists(email);
    boolean busername = userdao.IsUserExists(username);
    if (bemail) {
        //out.print("{success:false,errors:[{id:'email',msg:'Email is exists!'}]}");
        session.setAttribute("error", "Failed to register. Email does exist. Please try again!");

    } else if (busername) {
        //out.print("{success:false,errors:[{id:'username',msg:'User name is exists!'}]}");
        session.setAttribute("error", "Failed to register. Username does exist. Please try again!");
    } else if (dbirthday == null ){
    	session.setAttribute("error", "Failed to register. Birthday may be in wrong format. Please try again!");
    }
    else {
        Users u = new Users(username, pass, email, name, dbirthday, address, phone);
        u.setUserModeid(umodeId);

        Object obj = userdao.insertOnSubmit(u);
        int id = Integer.parseInt(obj.toString());
        if (id <= 0) {
            //out.print("{success:false,errors:{reason:'Error 500 internal server.'}}");
        	session.setAttribute("error", "Failed to register. Error 500 internal server. Please try again later!");
        } else {
            //out.print("{success:true}");
            session.setAttribute("success",true);
        }

    }
} 
%>

	


