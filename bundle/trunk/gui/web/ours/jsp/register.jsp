<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
         pageEncoding="ISO-8859-1"%>
<%@ page trimDirectiveWhitespaces="true"%>
<%@ include file="paths.jsp" %>
<%@ include file="doregister.jsp" %>

	
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <script type="text/javascript" src=<%=c_path_extjs%> ></script>
    <script type="text/javascript" src=<%=c_path_extalljs%> ></script>
    <script type="text/javascript" src=<%=c_path_registerjs%> ></script>
    <link href=<%=c_path_extallcss%> rel="stylesheet" type="text/css"/>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
        <title>Registration</title>
    </head>
      <body style="margin: 10px">
<% 
if(session.getAttribute("error")!=null){ 
	out.println( "<p style='color:red;'>"+session.getAttribute( "error")+ "</p>"); 
	session.removeAttribute( "error"); }
else if(session.getAttribute("success")!=null){
	out.println( "<p style='color:green;'>Registered successfully</p>");
	session.removeAttribute( "success"); }
else out.println( "<p>&nbsp;</p>");
%>      
      
          <form action="<%=request.getRequestURI()%>" method="post">
              <table>
                  <tr>
                      <td> Firstname:</td>
                      <td>
                          <input type='text' id='first' name='first' value='<%=first%>'/>
                      </td>
                  </tr>
                  <tr>
                      <td> Lastname:</td>
                      <td>
                          <input type='text' id='last' name='last' value='<%=last%>' />
                      </td>
                  </tr>
                  <tr>
                      <td> Birthday:</td>
                      <td>
                          <input type='text' id='birthday' name='birthday' value='<%=birthday%>' />
                          (MM/dd/yyyy)
                      </td>
                  </tr>
                  <tr>
                      <td> Email:</td>
                      <td>
                          <input type='text' id='email' name='email' value='<%=email%>' />
                      </td>
                  </tr>
                  <tr>
                      <td> Address:</td>
                      <td>
                          <input type='text' id='address' name='address' value='<%=address%>' />
                      </td>
                  </tr>
                  <tr>
                      <td> Phone:</td>
                      <td>
                          <input type='text' id='phone' name='phone' value='<%=phone%>' />
                      </td>
                  </tr>
                  <tr>
                      <td> Username:</td>
                      <td>
                          <input type='text' id='username' name='username' value='<%=username%>' />
                      </td>
                  </tr>
                  <tr>
                      <td> Password:</td>
                      <td>
                          <input type='password' id='password' name='pass' value='<%=pass%>' />
                      </td>
                  </tr>
                  <tr>
                      <td> Usermode:</td>
                      <td>
                          <select id='usermode' name='usermode'>
                              <option value="1">Standalone</option>
                              <option value="2">Connected</option>
                              <option value="3">Freeciv</option>
                          </select>
                      </td>
                  </tr>
                  <tr>
                      <td> &nbsp;</td>
                      <td>
                          <input type='submit' name='submit' value='Register'/>
                      </td>
                  </tr>                  
              </table>
      </form>
  </body>
</html>
