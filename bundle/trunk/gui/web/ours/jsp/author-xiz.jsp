<%----------------------------------------------------------------------------
* This is the form to author a non-ActiveMath exercise
*-----------------------------------------------------------------------------
*
* Deprecating:  
* CRUDexercises() stored procedure.  We wrote Java procedures 
* in ExerciseDAO.java instead because I dont know how to insert NULLs via  
* the stored procedure.  Also, stored procedure is an unecessary layer and 
* another syntax to learn -- compile, loops, ifs, nulls, data types, ...
*
* jdb debug:
* stop in org.apache.jsp.coax_002dweb_002dsdang.author_002dxiz_jsp._jspService
*
* key variables:  action, xizid
*    action:  action dictates database action -- create, update, delete, select
*    xizid:   the exercise to take action on.  it also scrolls the droplist 
*    .        to the exercise in question
* they manifest as server jsp variables & form <input>.  They are set on the 
* server passed to the browser in-lined into html.  both initialized as -1
*
* the "action" hiddden <form> value sets the mode for this page:
* -1:   blank form
*  0:   create new exercise.  
*  1:   edit exercise
*  2:   display selected exercise
*  3:   delete exercise
* 
* todo:  
* 1.  disable the id field.  the disabled attribute does not allow it to 
*     change when switching exercises !?!
* 5.  upload images
*
------------------------------------------------------------------------------
*                            java section
----------------------------------------------------------------------------%>
<%@ include file="session-check.jsp"%>
<%@ page import="com.coax.db.dao.*"%>
<%@ page import="com.coax.db.dto.*"%>
<%@ page import="java.util.List"%>
<%@ page import="java.util.Collection"%>
<%@ page import="java.util.LinkedList"%>
<%@page trimDirectiveWhitespaces="true"%>
<%-- import for uploadFile --%>
<%@ page import="java.io.*,java.util.*, javax.servlet.*" %>
<%@ page import="javax.servlet.http.*" %>
<%@ page import="org.apache.commons.fileupload.*" %>
<%@ page import="org.apache.commons.fileupload.disk.*" %>
<%@ page import="org.apache.commons.fileupload.servlet.*" %>
<%@ page import="org.apache.commons.io.output.*" %>


<%

// retrieve "action" & "xizid".  
// it's important that we check Request's action & xizid for nulls 
// otherwise we'll get null pointer exceptions at runtime
//c setup read-write on db
//d populate Droplist - "Nam" stands for non-activemath


// jdb "request" with:  print request.getParameterNames().nextElement() 
ServletContext context = pageContext.getServletContext();
int action = -1; long xizid = -1;
if ( isSubstantive( request.getParameter( "action" ) ) ) 
   action = Integer.parseInt(request.getParameter( "action" ) );
if ( isSubstantive( request.getParameter( "xizid"  ) )  ) 
   xizid  = Long.parseLong( request.getParameter( "xizid"  ) );             

ExerciseDAO xizdao = new ExerciseDAO(); //c
Exercises xiz = null;
UsersDAO userdao = new UsersDAO();
boolean isAdmin = userdao.isAdministrator(Long.parseLong(userid));
String alertmessage = "";
//**** core control
switch( action )                                                              {
case 0: // insert
   xiz = hsrequest2exercise( request, userid );
   xizdao.insertExercise( xiz );
   xiz = xizdao.getMaxidExerciseOf( userid );
   xizid = xiz.getId();
   uploadFile( context, request );
   updateAssignedFolders(request.getParameter("addLst"), 
                         request.getParameter("remLst"), xiz.getId());
   break;
case 1:  // update
   xiz = hsrequest2exercise( request, userid );
   int update = xizdao.updateExercise( xiz, Long.parseLong(userid), isAdmin );
   xiz = xizdao.getExerciseModeById( xizid, "standalone"); //a
   if(update == 0) 
      alertmessage = "Failed to update the exercise '"+xizid+"'. "
                  +  "It may not existing or "
                  +  "You are not the admin or its author.";
   else if(update == -1) 
      alertmessage = "Update failed. Please try again later!";
   else
      alertmessage = "Updated successfully.";
   // uploadFile( context, request );
   updateAssignedFolders(request.getParameter("addLst"), 
                         request.getParameter("remLst"), xiz.getId());
   break;
case 2:  // select
   xiz = xizdao.getExerciseModeById( xizid, "standalone" );
   break;
case -1: break; // blank
case  3: 
   int delete = xizdao.deleteExercise( xizid, Long.parseLong(userid), isAdmin );
   if(delete == 0) 
      alertmessage = "Failed to delete the exercise '"+xizid+"'. "
		            +  "It may not existing or "
		            +  "You are not the admin or its author.";
   else if(delete == -1) 
      alertmessage = "Delete failed. Please try again later!";
   else
      alertmessage = "Deleted successfully.";
            
   break; // delete.  need to delete corresponding media too (images..)
default: break;                                                               }

if(xiz == null)                                                               {
   xiz = new Exercises();xiz.setId(-1);xiz.setUserid(Long.parseLong(userid) );}
boolean isUDable = UD_able( xiz, userid, isAdmin);

xiz.null2empty();
String folderlist = getFolders(xiz.getId());
%>

<%!
/****************************/
public boolean UD_able(Exercises xiz, String userid, boolean isAdmin){
   if(isAdmin) return true;
   else if(xiz.getUserid() == Long.parseLong(userid)) return true;
   return false;
}
/****************************/
public void updateAssignedFolders(String addStr, String remStr, long exerId)  {
   Folder_ExercisesDAO folderDao = new Folder_ExercisesDAO();
   
   if(addStr != null)                                                         {
	String[] addLst = addStr.split(",");
	for(int j = 0;j < addLst.length;j++)                                      {
	   if(addLst[j].trim() != "")                                             {
		   Object[] obj = {Long.parseLong(addLst[j]),exerId};
		   folderDao.executeUpdate("insert into folder_exercise (folderId, exerciseId ) values ( ?, ? )"
		                           , obj, 0);                              }} }
   if(remStr!=null && !"".equals(remStr.trim())){
	   Object[] obj = {exerId};
	   folderDao.executeUpdate("delete from folder_exercise where exerciseId = ? and folderId in ("+remStr+")", obj, 2);
   }
}
public String getFolders(Long exerciseId)                                    {
   Folder_ExercisesDAO fxizdao = new Folder_ExercisesDAO();
   StringBuilder sb = new StringBuilder();
   String folderids = "";
   sb.append("<ul id='sharedfolder' style='margin:0px;height:80px;width:255px;border:solid grey 1px;list-style:none;padding-left:2px;overflow-y: scroll;font-size: 13px;'>");
   if(exerciseId>-1)                                                         {
	   List<Folder> list = fxizdao.getFoldersbyExerciseId(exerciseId);
	   for ( Folder item : list ){
	      sb.append( "<li id='ffolder"+item.getId()
	            +"' class='cursor sharedlist' folderid='folder"
	            +item.getId()+"' exerid=''><span><i class='icon-folder-open'></i>"
	            +item.getName()+"</span></li>" );
	      folderids += "'"+item.getId() + "',";                             }}
   sb.append("</ul>");
   if(folderids.endsWith(","))
      folderids = folderids.substring(0, folderids.length()-1);
   sb.append("<script>var savedFolders = ["+folderids+"];</script>");
   return sb.toString();                                                      }
/****************************/
/*
public String loadXizsList( ExerciseDAO xizdao, String userid, long xizid )   {
   List<Exercises> list = xizdao.getNamExercisesByUser( Long
   .   parseLong(userid) );
   StringBuilder sb = new StringBuilder();
   for ( Exercises item : list )                                              {
      String selected = ( item.getId() == xizid ) ? " selected=\"true\" ":"";
      sb.append( "<option value=\"" + item.getId() + "\"" + selected + "> " 
      +        item.getId() + " - " 
      +        item.getFormula().replace("\\\\", "\\") + "</option>" );       }
   return sb.toString();                                                      }
*/
public Exercises hsrequest2exercise( HttpServletRequest request,String userid){
   Exercises exer =  new Exercises(     request.getParameter("xizid")
   ,  userid,                           request.getParameter("content") 
   ,  request.getParameter("formula"),  request.getParameter("stroke")
   ,  request.getParameter("variable"), request.getParameter("amid")
   ,  request.getParameter("friendly_id")
   ,  !isSubstantive(request.getParameter("skip_corx")));
   exer.setFormula(exer.getFormula().replace("\\\\", "\\").replace("\\", "\\\\"));
   return exer;                                                               }
public boolean isSubstantive( String s )                                      {
return ( s!=null  &&  s!=""  &&  s!="null" ) ? true : false;                  }

public boolean isEmpty( String s )                                            {
return ( s==null  ||  s==""  ||  s=="null" ) ? true : false;                  }

/*******************/
public void uploadFile( ServletContext context, HttpServletRequest request )  {
/*******************/

File file ;
int maxFileSize = 5000 * 1024;
int maxMemSize = 5000 * 1024;
String filePath = context.getInitParameter("file-upload");

// Verify the content type
String contentType = request.getContentType();
if ((contentType.indexOf("multipart/form-data") >= 0))                        {

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

      while ( i.hasNext () )                                                  {
         FileItem fi = (FileItem)i.next();
         if ( !fi.isFormField () )                                            {

         // Get the uploaded file parameters
         String fieldName = fi.getFieldName();
         String fileName = fi.getName();
         boolean isInMemory = fi.isInMemory();
         long sizeInBytes = fi.getSize();

         // Write the file
         int incr = ( fileName.lastIndexOf("/") >= 0 ) ? 0 : 1;
         file = new File( filePath + "/"
         +      fileName.substring( fileName.lastIndexOf("/")+1 ) );
         fi.write( file );                                                  }}}
   catch(Exception ex) {  System.out.println(ex); }                          }}
%>

<!-----------------------------------------------------------------------------
*                                html section
enctype="multipart/form-data" 
------------------------------------------------------------------------------>

<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" 
      xmlns:svg="http://www.w3.org/2000/svg" 
      xmlns:xlink="http://www.w3.org/1999/xlink">
<head>
<!--    <meta name="viewport" content="user-scalable=no, maximum-scale=1.0, minimum-scale=1.0"></meta> -->
   <meta name="apple-mobile-web-app-capable" content="yes"></meta>
   <meta name="apple-mobile-web-app-status-bar-style" content="black"></meta>
   <title>Authorization: Creating Exercises</title>
   <link rel="stylesheet" type="text/css" href="../css/filter.css" />
   <link rel="stylesheet" href="../../theirs/jquery/css/jquery.css" />
   <link rel="stylesheet" href="../../theirs/jquery/css/jquery-ui.css" />
   <link rel="stylesheet" href="../../theirs/jquery/css/jquery-ui-1.10.3.custom-widget.css"/>
	
	<script type="text/javascript" src="../../theirs/jquery/jquery-1.8.3.js"></script>
	<script type="text/javascript" src="../../theirs/jquery/jquery-ui-1.10.3.custom-widget.js"></script>
	<script type="text/javascript" src="../../theirs/jquery/jquery-ui-1.10.3.custom.js"></script>
	<script type="text/javascript" src="../../theirs/jquery/jquery-ui-1.10.3.custom-dialog.js"></script>
	<script type="text/javascript" src="../../theirs/jquery/jquery.spin.js" ></script>
	
	<script type="text/javascript" src="../../theirs/jquery/jquery.treeview.js"></script>
	<script type="text/javascript" src="../../theirs/jquery/jquery.treeview.edit.js"></script>
	
    <script type="text/javascript" src="../../theirs/jquery/jquery.cookie.js"></script>
<!-- phan nay de cho constant -->
<script type="text/javascript">
    Editor={};
</script>
<script type="text/javascript" src="../js/Config.js"></script>
<script type="text/javascript" src="../js/Classifier.js"></script>
<script type="text/javascript" src="../js/Editor.Constants.js"></script>
<!-- END phan nay de cho constant -->
<script type="text/javascript" src="../js/session-check.js"></script>
<style>
.requiredAsterisk {color: red;font-size: 1.5em;vertical-align: middle;} 
.ui-dialog{max-width:98% !important;}
body {max-width:98% !important;padding:10px;}
</style>
</head>
<body>
<div id="loaderx" ontouchstart="event.preventDefault();"></div>
<form action="author-xiz.jsp" method="post">
<div id="folder-dialog" title="Folders" style="background-color: white;display: none;" >
  <div id="wrapper" style="width:100%;">
    <p id="recentselectedfolder" style="text-decoration:underline;padding:6px;font-size:medium;margin:0px;">Recent Folders...</p>
    <div style="color:black;background-color:ghostwhite;padding:6px;font-size: medium;margin:0px;">Choose Folders</div>
    
    <div class="tree"><ul id="availablefolders" class="filetree"></ul></div>
  </div>               
</div>
<div id="folderexercise-dialog" title="Folders - Exercises" style="background-color: white;display: none;" >
  <div id="wrapper" style="width:100%;">
    <div class="tree"><ul id="availableFEs" class="filetree"></ul></div>
  </div>               
</div>
<div id="help-dialog" title="Help" style="background-color: white;display: none;" >
  <div id="wrapper" style="width:100%;">
  To be developed...
  </div>               
</div>
<p style="color: rgba(0,139,93,1);font-size: 1.5rem;margin-top: 10px;margin-bottom: 10px;">Author Exercise</p>
<a style="float:right;" href="javascript:$('#help-dialog').dialog('open');">Help</a>
<div> 
<button onclick="return setControlArgs(4);" style="margin: 7px;">Choose Exercise</button>
</div>
<p/>
<hr/>
<table border=0 >
<tr> <td>&nbsp;</td>        <td colspan="2">&nbsp;</td> </tr>
<tr> <td style="vertical-align: top;"> Author Id: </td>    
<td colspan="2"><input style="background: gainsboro;" id='userid' name='userid' type="text" readonly value="<%= xiz.getUserid() %>" /></td></tr>
<tr> <td style="vertical-align: top;"> Exercise Id: </td>
<td colspan="2"><input style="background: gainsboro;" id='xizid'  name='xizid'  type="text" readonly value="<%= xiz.getId() %>"     /></td></tr>
<tr> <td style="vertical-align: top;"> Friendly Id: <span class="requiredAsterisk">*</span></td>
<td colspan="2"><textarea id='friendly_id' name='friendly_id' rows=1><%=xiz.getFriendlyId() %> </textarea> </td> </tr>     
<tr> <td style="vertical-align: top;"> Variable: </td>   
<td colspan="2"><textarea id='variable' name='variable' rows=1><%= xiz.getVariable() %> </textarea> </td> </tr>
<tr> <td style="vertical-align: top;"> Formula: <span class="requiredAsterisk">*</span></td>    
<td colspan="2"><textarea id='formula' name='formula' rows=1 cols=40 ><%=xiz.getFormula().replace("\\\\", "\\") %> </textarea> </td> </tr>
<tr>
<td style="vertical-align: top;"> Stroke: <span class="requiredAsterisk">*</span></td> 
<td colspan="2"><textarea id='stroke' name='stroke' rows=5 cols=40><%= xiz.getStroke() %> </textarea> </td> </tr>
<tr>
<td style="vertical-align: top;"> Exercise Name: </td>
<td colspan="2"><textarea id='content' name='content' rows=4 cols=40><%= xiz.getContent() %> </textarea> </td> </tr>

<tr style="vertical-align: top;"><td style="width: 105px;"> Check Step Correctness: </td>
<td colspan="2"><input type="checkbox" id="skip_corx" name="skip_corx" <%=!xiz.getSkip_corx()? "checked": "" %>/> </td> </tr>
<tr style="vertical-align: top;">
<td> Folders: <span class="requiredAsterisk">*</span></td><td style="background: gainsboro;"><%= folderlist %></td>
<td style="vertical-align: middle;">
<button onclick="return selectFolder();" style="height:100%;width:100%;white-space:normal;">Choose<br/>Folder</button></td> </tr>
<tr> <td> &nbsp;</td> <td colspan="2">

<button onclick="return setControlArgs(0);">Create</button>
<button onclick="return setControlArgs(1);" <% if(!isUDable) out.write("disabled"); %> >Update</button>
<button onclick="return setControlArgs(-1);">Clear</button>
<button onclick="return setControlArgs(3);" <% if(!isUDable) out.write("disabled"); %>>Delete</button>
<input type='hidden' id='action' name='action' value="<%= String.valueOf(action) %>" /> 
<input type='hidden' id='addLst' name='addLst' />
<input type='hidden' id='remLst' name='remLst' />
</td> </tr>
</table>
</form>

<!-----------------------------------------------------------------------------
*                             javascript section
------------------------------------------------------------------------------>
<script> 
function validInputs(){
   var valid =  document.getElementById("formula").value != ""
         && document.getElementById("friendly_id").value != ""
         &&      document.getElementById("stroke").value != ""
         &&                    $("#sharedfolder").html() != "";
   ajaxLoader("hidden");
   if(!valid) alert("Fields Formula, Friendly id, Stroke and Folders are required!");
   
   return valid;
}
/*---------------------------------------
* set the "action" params to send to server
*
*a on create (action=0), we need a dummy xizid value, otherwise sending an 
*  empty string may cause jsp errors.  The stored procedure CRUDexercise() 
*  will properly ignore this xizid on action=0.
---------------------------------------*/

function setControlArgs( crudtype )                                           {
   document.getElementById("action").value = crudtype;
   ajaxLoader("show");
   if (crudtype == 2) return true;
   else if (crudtype == 0)                                                    {//create
      if(!validInputs()) return false;
      document.getElementById("xizid").nodeValue = -1; //a
      savedFolders = [];
      setFolders4Saving();
      return true;                                                            }
   else if(crudtype == 1 )                                                    {//update
      if(!validInputs()) return false;
      setFolders4Saving();
      return true;                                                            }
   else if(crudtype == 3)                                                     {
     if(document.getElementById("xizid").value == -1){
        alert("Let's choose an exercise first!");
        ajaxLoader("hidden");
     }else{
        var x=window.confirm("Are you sure you want to delete the exercise \""
              +document.getElementById("xizid").value+"\" ?")
        if (x) return true;
        ajaxLoader("hidden");
     }
	 document.getElementById("action").value = -1;                       }
   else if(crudtype == 4)                                                     {
    ajaxLoader("hidden");
    selectFolder(true);
   }
   else                                                                       {
      document.getElementById("action").value = -1;
      document.getElementById("xizid").value = -1;
      document.getElementById("formula").value = "";
      document.getElementById("friendly_id").value = "";
      document.getElementById("variable").value = "";
      document.getElementById("stroke").value = "";
      document.getElementById("content").value = "";
      $('#skip_corx').attr('checked', false);
      $("#sharedfolder").html("");
      
      ajaxLoader("hidden");                                                   }
   return false;                                                              }
/****************************************************************************/   
function setFolders4Saving()                                                  {
   $.cookie('sharedfolder_content', $("#sharedfolder").html());

   var lilist          = $("#sharedfolder li");
   var addedFolders    = new Array();
   var removedFolders  = new Array();
   var assignedFolders = new Array();
   
   for(var i = 0; i < lilist.length; i++)                                     {
    if(lilist[i].id.startsWith("ffolder"))                                    {
       var id = lilist[i].id.substring(7);
       assignedFolders.push(id);
       if(!savedFolders.includes(id)) addedFolders.push(id);                 }}
   for(var i = 0; i < savedFolders.length; i++)
      if(!assignedFolders.includes(savedFolders[i])) removedFolders.push(savedFolders[i]);
   
   $("#addLst").attr("value",addedFolders.join());
   $("#remLst").attr("value",removedFolders.join());                          }//setFolders4Saving
/****************************************************************************/   
function exists(id)                                                           {
   var lilist = $("#sharedfolder li");
   for(var i = 0; i < lilist.length; i++)
      if(lilist[i].id == id) return true;
   
   return false;                                                              }//exists
/****************************************************************************/   
function selectFolder(withExercise)                                           {
   ajaxLoader("show");
   //must remove 2 targets
   $("#availablefolders").html("");
   $("#availableFEs").html("");

   var _init_data = {userId : <%=userid%>,fn : 3};
   $.ajax({
      url : "folder.jsp",
      type : "get",
      contentType : "application/json",
      data : _init_data,
      dataType : "json",
      cache : false,
      success : function(data)                                            {
         var targetTree = "#availablefolders";
         var targetdialog = "#folder-dialog";
         if(withExercise){
            targetTree = "#availableFEs";
            targetdialog = "#folderexercise-dialog";
            flag_shared = false;
         }
         
         createTree(targetTree, init_folder, data, withExercise);
         $(targetTree).treeview({
            control: "#treecontrol"
        });
        ajaxLoader("hidden"); 
        $(targetdialog).dialog("open");
        $(targetTree+" li>div").first().click();
        // Remove focus on all buttons within the div with class ui-dialog
        //$('.ui-dialog :button').blur();
        return false;                                                     }
     , error : function(err)                                              {
         ajaxLoader("hidden");
         if(!isAjaxSessionTimeOut(err))
            alert("Unable to get folders now, please try it later!");
     }});
   
   return false;                                                              }
/****************************************************************************/
function createTree(_tag, init, _json, withExercise)                          {
   var id = init.id;
   var parent_name = init.parent_name;
   var parent_prefix = init.parent_prefix;
   var relate_parent = init.relate_parent;
   var parent = _json[init.data_parent];
   
   ///withExercise
   var data_child = init.data_child;
   var class_child = init.class_child;
   var child_id = init.child_id;
   var child_name = init.child_name;
   var child_prefix = parent_prefix;// /init.child_prefix;
   var attribute_name = init.attribute_name
   var attribute_value = init.attribute_value;
   var children = _json[data_child];

   for(var i = 0; i < parent.length; i++)                                     {
   // check if the current node is a child node
      var parentnode = parent.filter(function(v) {
         return v.id === parent[i].parentId;
      });
      if(parentnode.length == 0)                                             {
          createItem(_tag, parent_prefix+parent[i][id], 
                parent[i][parent_name], init.class_parent);
          
          var data_parent = parent.slice(0);
          var tree_items = new Array(data_parent[i]);

          if(withExercise){
             var addedFile = new Array();
             var data_children = children.slice(0);
             for ( var j = 0; j < data_children.length; j++)                  {
                 if (data_children[j][relate_parent] == data_parent[i][id])   {
                     createItemLeft("#ul-" + parent_prefix + data_parent[i][id],
                         child_prefix + data_children[j][child_id],
                         data_children[j][child_name], class_child, attribute_name,
                         data_children[j][attribute_value],data_children[j]);
                     addedFile.push(j);                                       }}
             for ( var j = addedFile.length - 1; j >= 0 ; j--)
                 data_children.splice(addedFile[j],1);
          }//withExercise
          
          data_parent.splice(i,1);
          CreateTreeRecursive(tree_items, data_parent, parent_prefix, 
                parent_name, init.class_parent, id, relate_parent, withExercise,
                data_children, child_prefix, child_id, child_name, 
                class_child, attribute_name, attribute_value);              }}}//createTree
/****************************************************************************/
function CreateTreeRecursive(tree_items, data_items, parent_prefix, parent_name, 
      class_parent, id, relate_parent, withExercise,
      data_children, child_prefix, child_id, 
      child_name, class_child, attribute_name, attribute_value)               {                   
   var addedIndex = new Array();
   
   if(data_items.length > 0)                                                  {
     for ( var l = 0; l < tree_items.length; l++ )                            {
        var item = tree_items[l];
        for ( var i = 0; i < data_items.length; i++)                          {
            if (data_items[i].parentId == item.id)                            {
                createItem("#ul-" + parent_prefix + item[id], 
                  parent_prefix+data_items[i][id], data_items[i][parent_name], 
                  class_parent);
                addedIndex.push(i);                                         }}}
     addedIndex.sort(function(a, b){return a-b});
     for ( var i = addedIndex.length - 1; i >= 0 ; i--)                       {
         tree_items.push(data_items[addedIndex[i]]);
         data_items.splice(addedIndex[i],1);                                  }
     if(withExercise)                                                         {
        var addedFile = new Array();
        for ( var g = 0; g < tree_items.length; g++)                          {
           var item = tree_items[g];
           for ( var i = 0; i < data_children.length; i++){
               if (data_children[i][relate_parent] == item[id]) {
                   createItemLeft("#ul-" + parent_prefix + item[id],
                       child_prefix + data_children[i][child_id],
                       data_children[i][child_name], class_child, attribute_name,
                       data_children[i][attribute_value],data_children[i]);
                   addedFile.push(i);                                        }}}
       addedFile.sort(function(a, b){return a-b});
       for ( var i = addedFile.length - 1; i >= 0 ; i--)
          data_children.splice(addedFile[i],1);
     }//withExercise
     
     if(addedIndex.length > 0)
         CreateTreeRecursive(tree_items, data_items, parent_prefix, 
               parent_name, class_parent, id, relate_parent, withExercise,
               data_children, child_prefix, child_id, child_name, 
               class_child, attribute_name, attribute_value);                }}
/****************************************************************************/
function createItem(_parent, parent_prefix_id, _name, _type)                  {
   var _li = document.createElement("li");
   _li.setAttribute("class", "closed cursor");

   var _span = document.createElement("span");
   _span.setAttribute("id", parent_prefix_id);
   //_span.setAttribute('onclick','addtoFolderList('+parent_prefix_id+');');
   if(exists("f"+parent_prefix_id)) 
      _span.setAttribute("class", _type + " selected");
   else _span.setAttribute("class", _type);
   _span.innerHTML = _name;
   _li.appendChild(_span);

   var _ul = document.createElement("ul");
   _ul.setAttribute("id", "ul-" + parent_prefix_id);
   _li.appendChild(_ul);

   $(_parent).append(_li);                                                    }
/****************************************************************************/
function createItemLeft(_parent, _id, _name, _type, attrname, attrvalue,item_exer) {
    
    var _li = document.createElement("li");
    _li.setAttribute("class", "cursor");
    var _span = document.createElement("span");
    _span.setAttribute("id", _id);
    _span.setAttribute("class", _type);
    _span.setAttribute(attrname, attrvalue);
    _span.setAttribute('onclick',"exerciseSelected('"+_id + "');");

    if(_parent.indexOf('folder')>=0 && item_exer != null)
    {
    _span.setAttribute("amid", item_exer.amid);
    _span.setAttribute("latex", item_exer.latex);
    _span.setAttribute("variable", item_exer.variable);
    _span.setAttribute("xiznum", item_exer.xiznum); 
    _span.setAttribute("friendlyid", item_exer.friendly_id);    
    }
    
    _span.innerHTML = _name;
    var _ul = document.createElement("ul");
    _ul.setAttribute("id", "ul-" + _id);
    _li.appendChild(_span);
    $(_parent).append(_li);
} 
function exerciseSelected(id){
   document.getElementById("xizid").value = $('#'+id).attr("exerciseid");
   setControlArgs(2);
   $("form").submit();
}
ExercisesMenu ={};
ExercisesMenu.is_request=true;
/* */
function ajaxLoader(status)                                                   {
   if (status == "hidden") $('#loaderx').empty();
   else                                                                       {
       var opts = {
                 lines: 11, // The number of lines to draw
                 length: 10, // The length of each line
                 width: 12, // The line thickness
                 radius: 30, // The radius of the inner circle
                 corners: 1, // Corner roundness (0..1)
                 rotate: 34, // The rotation offset
                 direction: 1, // 1: clockwise, -1: counterclockwise
                 color: '#000', // #rgb or #rrggbb or array of colors
                 speed: 1, // Rounds per second
                 trail: 60, // Afterglow percentage
                 shadow: false, // Whether to render a shadow
                 hwaccel: false, // Whether to use hardware acceleration
                 className: 'spinner', // The CSS class to assign to the spinner
                 zIndex: 2e9, // The z-index (defaults to 2000000000)
                 top: 15, // Top position relative to parent in px
                 left: 'auto' // Left position relative to parent in px
           };
	 var target = document.getElementById('loaderx');
	 var spinner = new Spinner(opts).spin(target);                           }}
/****************************************************************************/
$( document ).ready( function( )                                              {
   $('body').css('width',($(window).width() - 5)+"px");
   $("#help-dialog").dialog(                                                  {
      autoOpen : false,
      height : .8* $(window).height(),
      width : "430px",
      closeOnEscape: true,
      modal : true                                                          });
   $("#folderexercise-dialog").dialog(                                        {
      autoOpen : false,
      height : .8* $(window).height(),
      width : "430px",
      closeOnEscape: true,
      modal : true,
      close : function() {flag_shared = true;}                               });   
   $("#folder-dialog").dialog(                                                {
      autoOpen : false,
      height : .8* $(window).height(),
      width : "430px",
      modal : true,
      closeOnEscape: true                                                   });   
   $('#recentselectedfolder').on('click', function()                          {
      var s = $.cookie('sharedfolder_content');
      if(s == null)
         alert("You have no recent folders. Please select from the tree below!");
      else                                                                    {
         $("#sharedfolder").html(s);
         $('#folder-dialog').dialog('close');                                }});    
   $( window ).unload(function()                                              {
      $("button").each(function()                                             {
         $( this ).attr('disabled','disabled');                          });});
   
   <%
   if(alertmessage!=""){
      out.write("alert(\""+alertmessage+"\");");
   }
   %>
});
</script>
</body></html>
