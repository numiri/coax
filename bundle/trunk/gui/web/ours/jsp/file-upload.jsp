<%@ page import="java.io.*,java.util.*, javax.servlet.*" %>
<%@ page import="javax.servlet.http.*" %>
<%@ page import="org.apache.commons.fileupload.*" %>
<%@ page import="org.apache.commons.fileupload.disk.*" %>
<%@ page import="org.apache.commons.fileupload.servlet.*" %>
<%@ page import="org.apache.commons.io.output.*" %>

File file ;
int maxFileSize = 5000 * 1024;
int maxMemSize = 5000 * 1024;
ServletContext context = pageContext.getServletContext();
String filePath = context.getInitParameter("file-upload");

// Verify the content type
String contentType = request.getContentType();
if ((contentType.indexOf("multipart/form-data") >= 0)) {

   //a maximum size that will be stored in memory
   //b Location to save data that is larger than maxMemSize.
   //c Create a new file upload handler
   //c maximum file size to be uploaded.

   DiskFileItemFactory factory = new DiskFileItemFactory();
   factory.setSizeThreshold(maxMemSize);                      //a
   factory.setRepository(new File("/tmp"));                   //b
   ServletFileUpload upload = new ServletFileUpload(factory); //c
   upload.setSizeMax( maxFileSize );                          //d
   try{ 
      //e Parse the request to get file items.
      //f Process the uploaded file items
      List fileItems = upload.parseRequest(request); //e
      Iterator i = fileItems.iterator(); // f

      out.println("<html> <head> <title>File upload</title> </head> <body>");
      while ( i.hasNext () )                                                  {
         FileItem fi = (FileItem)i.next();
         if ( !fi.isFormField () )	                                      {

         // Get the uploaded file parameters
         String fieldName = fi.getFieldName();
         String fileName = fi.getName();
         boolean isInMemory = fi.isInMemory();
         long sizeInBytes = fi.getSize();

         // Write the file
         int incr = ( fileName.lastIndexOf("/") >= 0 ) ? 0 : 1;
         file = new File( filePath + "/"
         +      fileName.substring( fileName.lastIndexOf("/")+1 ) );
         fi.write( file ) ;
         out.println("Uploaded Filename: " + filePath + fileName + "<br>");  }}
      out.write("</body> </html>");                                           }
   catch(Exception ex) {  System.out.println(ex); }                           }
else                                                                          {
   out.write("<html> <head> <title>File upload</title> </head> <body>" 
   +   " <p>No file uploaded</p> </body> </html>");                           }
%>