<%@ include file="session-check.jsp"%>
<%@page import="com.mysql.jdbc.PreparedStatement"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="com.coax.db.dao.*"%>
<%@page import="com.coax.db.dto.*"%>
<%@page trimDirectiveWhitespaces="true"%>
<%

/*****************************************************************************
* shared (used for organize exercise)
******************************************************************************
*
  userId : id of user that using share
  fn     : function from client post  
	     fn = -1 : select , fn =0 : insert, fn=1 : edit, fn=2 : delete
  sfiz   : list of folderId and exerciseId from client post
  sgrp   : list of groupId and userId from client post 
*****************************************************************************/
//String sUserId = request.getParameter("userId");
UsersDAO userdao = new UsersDAO();
boolean isAdmin = userdao.isAdministrator(Long.parseLong(userid));
String sFn = request.getParameter("fn"); 
if(sFn == null){
   response.setContentType("text/html");
%>
<!DOCTYPE html>
<html>
<head>
<title>Share Management</title>

<link rel="stylesheet" type="text/css" href="../css/filter.css" />
<link rel="stylesheet" href="../../theirs/jquery/css/jquery-ui.css" />
<script type="text/javascript">
    Editor={};
   ExercisesMenu ={};
   ExercisesMenu.is_request=true;
</script>
<script src="../js/Config.js"></script>
<script src="../js/Classifier.js"></script>
<script src="../js/Editor.Constants.js"></script>
<script src="../js/session-check.js"></script>
<script src="../../theirs/jquery/jquery-1.8.3.js"></script>
<script type="text/javascript" src="../../theirs/underscorejs/underscore.js"></script>
<link rel="stylesheet" href="../../theirs/jquery/css/jquery.css" />
<link rel="stylesheet" href="../../theirs/jquery/css/screen.css" />
<link rel="stylesheet" href="../../theirs/jquery/css/jquery-ui-1.10.3.custom-widget.css"/>
<script src="../../theirs/jquery/jquery-ui-1.10.3.custom-widget.js"></script>
<script src="../../theirs/jquery/jquery-ui-1.10.3.custom.js"></script>
<script src="../../theirs/jquery/jquery-ui-1.10.3.custom-dialog.js"></script>
<script src="../../theirs/jquery/jquery.cookie.js" type="text/javascript"></script>
<script type="text/javascript" src="../../theirs/jquery/jquery.spin.js" ></script>

<script type="text/javascript">
(function ($) {
  // Detect touch support
  $.support.touch = 'ontouchend' in document;

  // Ignore browsers without touch support
  if (!$.support.touch) {
    return;
  }
  var mouseProto = $.ui.mouse.prototype,
      _mouseInit = mouseProto._mouseInit,
      _mouseDestroy = mouseProto._mouseDestroy,
      touchHandled;

  /**
   * Simulate a mouse event based on a corresponding touch event
   * @param {Object} event A touch event
   * @param {String} simulatedType The corresponding mouse event
   */
  function simulateMouseEvent (event, simulatedType) {

    // Ignore multi-touch events
    if (event.originalEvent.touches.length > 1) {
      return;
    }

    event.preventDefault();

    var touch = event.originalEvent.changedTouches[0],
        simulatedEvent = document.createEvent('MouseEvents');
    
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
      simulatedType,    // type
      true,             // bubbles                    
      true,             // cancelable                 
      window,           // view                       
      1,                // detail                     
      touch.screenX,    // screenX                    
      touch.screenY,    // screenY                    
      touch.clientX,    // clientX                    
      touch.clientY,    // clientY                    
      false,            // ctrlKey                    
      false,            // altKey                     
      false,            // shiftKey                   
      false,            // metaKey                    
      0,                // button                     
      null              // relatedTarget              
    );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
  }

  /**
   * Handle the jQuery UI widget's touchstart events
   * @param {Object} event The widget element's touchstart event
   */
  mouseProto._touchStart = function (event) {

    var self = this;

    // Ignore the event if another widget is already being handled
    if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
      return;
    }

    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;

    // Track movement to determine if interaction was a click
    self._touchMoved = false;

    // Simulate the mouseover event
    simulateMouseEvent(event, 'mouseover');

    // Simulate the click event
    simulateMouseEvent(event, 'click');

    // Simulate the mousedown event
    simulateMouseEvent(event, 'mousedown');
  };
  


  /**
   * Handle the jQuery UI widget's touchmove events
   * @param {Object} event The document's touchmove event
   */
  mouseProto._touchMove = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Interaction was not a click
    this._touchMoved = true;

    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');
  };

  /**
   * Handle the jQuery UI widget's touchend events
   * @param {Object} event The document's touchend event
   */
  mouseProto._touchEnd = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Simulate the mouseup event
    simulateMouseEvent(event, 'mouseup');

    // Simulate the mouseout event
    simulateMouseEvent(event, 'mouseout');

    // If the touch interaction did not move, it should trigger a click
    if (!this._touchMoved) {

      // Simulate the click event
      simulateMouseEvent(event, 'click');
    }

    // Unset the flag to allow other widgets to inherit the touch event
    touchHandled = false;
  };

  /**
   * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
   * This method extends the widget with bound touch event handlers that
   * translate touch events to mouse events and pass them to the widget's
   * original mouse event handling methods.
   */
  mouseProto._mouseInit = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element.bind({
      touchstart: $.proxy(self, '_touchStart'),
      touchmove: $.proxy(self, '_touchMove'),
      touchend: $.proxy(self, '_touchEnd')
    });

    // Call the original $.ui.mouse init method
    _mouseInit.call(self);
  };

  /**
   * Remove the touch event handlers
   */
  mouseProto._mouseDestroy = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element.unbind({
      touchstart: $.proxy(self, '_touchStart'),
      touchmove: $.proxy(self, '_touchMove'),
      touchend: $.proxy(self, '_touchEnd')
    });

    // Call the original $.ui.mouse destroy method
    _mouseDestroy.call(self);
  };

})(jQuery);
</script>
<script src="../js/jbuild-shared.js" type="text/javascript"></script>
<script src="../../theirs/jquery/jquery.treeview.js" type="text/javascript"></script>
<script src="../../theirs/jquery/jquery.treeview.edit.js" type="text/javascript"></script>
<script src="../../theirs/jquery/jquery.reveal.js" type="text/javascript"></script>
<script src="../../theirs/jquery/jquery.ui-contextmenu.js" type="text/javascript"></script>
<script src="../../theirs/jquery/taphold.js" type="text/javascript"></script>
<script src="../js/oex-panel.js" type="text/javascript"></script>
<style>
label,input {display: block;}
input.text {margin-bottom: 12px;width: 95%;padding: .4em;}
fieldset {padding: 0;border: 0;margin-top: 25px;}
.ui-dialog .ui-state-error {padding: .3em;}
.ui-dialog .ui-dialog-content {overflow: hidden;}
#myDiv {width: 150px;border: solid 1px #2AA7DE;background: #6CC8EF;text-align: center;padding: 4em .5em;margin: 1em;float: left;}
#myList {margin: 1em;float: left;}
#myList UL {padding: 0px;margin: 0em 1em;}
#myList LI {width: 100px;border: solid 1px #2AA7DE;background: #6CC8EF;padding: 5px 5px;margin: 2px 0px;list-style: none;}
#options {clear: left;}
#options INPUT {font-family: Verdana, Arial, Helvetica, sans-serif;font-size: 11px;width: 150px;}
</style>
<link href="../../theirs/jquery/css/jquery.contextMenu.css" rel="stylesheet" type="text/css">
</head>
<body >
<div id="loaderx" ontouchstart="event.preventDefault();"></div>
<div style='-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;' 
 unselectable='on' onselectstart='return false;' onmousedown='return false;' >

    <div id="flash-shared" style="text-align: center;"></div>
    <!-- Dialog result -->
    <div id="myModal" class="reveal-modal">
        <h1>Result Save Share</h1>
        <a class="close-reveal-modal">&#215;</a>
        <ul id="listsave" class="filtered" style="text-align: left;"></ul>
    </div>
    <div id="div-left-shared" style="float: left; width: 50%; border-right: none;">
        <div id="div-list" style="float: left; width: 100%; height: 50%;">
            <h1>Folder & Exercise</h1>
            <ul id="browser" class="filetree">
            </ul>
            <ul id="options-left" style="display:none">
                    <li ><a  onclick="action_tree('new')"><span class="ui-icon ui-icon-plusthick"></span>New</a></li>
                    <li ><a onclick="action_tree('edit')"><span class="ui-icon  ui-icon-pencil"></span>Edit</a></li>
                    <li ><a onclick="action_tree('delete')"><span class="ui-icon ui-icon-minusthick"></span>Delete</a></li>
                    <li ><a onclick="action_tree('assign')"><span class="ui-icon ui-icon-arrowthick-1-e"></span>Assign</a></li>
                    <li ><a onclick="action_tree('clean')"><span class="ui-icon ui-icon-trash"></span>Deselect</a></li>
            </ul>   
            <div style="clear:both;"></div>
            <ul id="sharedfolder" class="filtered">
            </ul>
        </div>
    </div>

    <div id="div-right-shared" style="float: left; width: 48%;">
        <div id="div-push-shared" style="float:left;width:86px;height:inherit;border-left:none;text-align:center;">
          <h1 id="shareactions">Share Actions</h1> 
          <input type="button" class="btn" style="width:100%;margin-bottom:10px;" id="btnShared" value="Show"   onclick="check_shared()" />
          <input type="button" class="btn" style="width:100%;margin-bottom:10px;" id="btnSave"   value="Save"   onclick="save_share()"   /> 
          <input type="button" class="btn" style="width:100%;margin-bottom:10px;" id="btnDelete" value="Delete" onclick="delete_shared()" <% if(!isAdmin) out.write("disabled"); %>/>
          <input type="button" class="btn" style="width:100%;margin-bottom:10px;" id="btnHelp"   value="Help"   onclick="help()"         />
        </div>
        
<div id="dialog-help" title="Help text for buttons" style='display:none;overflow:scroll;font-family:monospace;white-space:pre;font-size:1.3em;'>
<strong>Save:</strong> save the connection you made between the bottom 2 panels.
<strong>Delete:</strong> delete the displayed connections in the bottom 2 panels.
<p>
<strong>Show:</strong> display the groups & users that can see the folders in the lower left panel.
Select from the top left panel and press Show.
Lower right will show EXPLICIT shares, eg. the rows of the Shared table in the database.  
It does NOT show shares inherited as subfolders or group memberships.
<u>Example</u>:  
As pictured below, folder f1 contains a subfolder f2 and group g1 contains a user jdoe.
Dots show explicit shares.
case 1:  ............           case 2:
         :          :
f1 .......    g1    :           f1 .......... g1
 |             |    :            |             |
 +-- f2        +-- jdoe          +-- f2        +-- jdoe
dots show explicit shares.
-- folder f1 has subfolder f2, and
-- f1 was EXPLICITLY shared w/ user jdoe, then 
-- f2 will NOT show as shared w/ jdoe.  
The converse for user-groups is similar.
-- user jdoe is in group g1, and
-- f1 is EXPLICITLY shared w/ g1 and shows explicitly
-- d2 will NOT show as shared w/ jdoe, but
-- jdoe will can open exercises of f2
</div>
        
<script>
$( document ).ready( function( ) {
   
   var mgtop= $("#btnShared").css("margin-top").replace(/[^-\d\.]/g, '');
   mgtop -= 20;
   $("#shareactions").css("margin-top",mgtop+"px");
   $("#shareactions").css("margin-bottom","-"+mgtop+"px");
});
</script>
        <div id="wrap-guser-shared"
            style="float: right; width: 80%; border-right: none; border-top: none; border-bottom: none; height: 100%; border-radius: 0px; box-shadow: none;">

            <h1>Group & User</h1>
            <ul id="grouptree" class="filetree">

            </ul>
<ul id="options-right" style="display:none">
        <li ><a onclick="action_tree('new')"><span class="ui-icon ui-icon-plusthick"></span>New</a></li>
        <li ><a onclick="action_tree('edit')"><span class="ui-icon  ui-icon-pencil"></span>Edit</a></li>
        <li ><a onclick="action_tree('delete')"><span class="ui-icon ui-icon-minusthick"></span>Delete</a></li>
        <li ><a onclick="action_tree('assign')"><span class="ui-icon ui-icon-arrowthick-1-e"></span>Assign</a></li>
        <li ><a onclick="action_tree('clean')"><span class="ui-icon ui-icon-trash"></span>Deselect</a></li>
</ul>   
<div style="clear:both;"></div>
            <ul id='sharedgroup' class="filtered">
            </ul>
        </div>
    </div>
    </div>
    <!-- Menu context -->
    <!-- <ul id="myMenu" class="contextMenu">
        <li class="quit separator"><a href="#new">New</a></li>
        <li class="edit"><a href="#edit">Edit</a></li>
        <li class="delete"><a href="#delete">Delete</a></li>
        <li class="assign"><a href="#assign">Assign</a></li>
    </ul> -->

<ul id="options" style="display: none;">
        <li style="width: 111px;"><a href="#new"><span class="ui-icon ui-icon-plusthick"></span>New</a></li>
        <li style="width: 111px;"><a href="#edit"><span class="ui-icon  ui-icon-pencil"></span>Edit</a></li>
        <li style="width: 111px;"><a href="#delete"><span class="ui-icon ui-icon-minusthick"></span>Delete</a></li>
        <li style="width: 111px;"><a href="#assign"><span class="ui-icon ui-icon-arrowthick-1-e"></span>Assign</a></li>
</ul>   
    <!--Dialog Form -->
    <div id="dialog-form" title="Item" style='-moz-user-select: text; -webkit-user-select:  text; -ms-user-select:none; user-select:text;'>
        <span class="validateTips">All form fields are required.</span>
        <form>
            <fieldset>
                <label for="name">Name</label> <input type="text" name="name"
                    id="name" value="" class="text ui-widget-content ui-corner-all" />
                <label for="des">Description</label> <input type="text" name="des"
                    id="des" value="" class="text ui-widget-content ui-corner-all" />
            </fieldset>
        </form>
    </div>
    <!--Dialog Delete -->
    <div id="dialog-confirm" title="Empty the recycle bin?">
        <p>
            <span class="ui-icon ui-icon-alert"
                style="float: left; margin: 0 7px 20px 0;"></span><span id='dc-message'></span>
        </p>
    </div>
    <!--Dialog Panel -->
    <div id="dialog-panel" title="Item"  >
        <div id="flash" style="text-align: center;"></div>
        <div id="div-left"
            style="float: left; width: 50%; border-right: none;height: inherit;">
            <div id="div-list-panel" style="float: left; width: 100%;">
                <div id='wrap-user'>
                    <input id="filter" name="filter" type="text"
                        placeholder="Search user" class="input-xlarge search-query"
                        style="width: 100%; padding-right: 0px; padding-left: 0px;">

                    <ul id="userslist" class="filtered">

                    </ul>

                    <div class="pagination" style="text-align: center;">
                        <ul></ul>
                    </div>
                </div>
            </div>
        </div>
		<div id="div-push" style="float: left; width: 58px; height: inherit; border-left: none;">
		   <input type="button" id="push" value=">>" onclick="push_user()"
		       class="btn" /> <br /> <input type="button" id="back" value="<<"
		       onclick="back_user()" class="btn" />
		</div>
        <div id="div-right" style="float: left; width: 40%; height: inherit;">
            <div id="wrap-guser"
                style="float: left;width: 100%;  border-right: none; border-bottom: none; height: 100%; border-radius: 0px; box-shadow: none;">
                <h1>Assign list</h1>
                <ul id='guserslist'></ul><br>
            </div>
        </div>
    </div>
</body>
</html>
<%   
}else{//sFn is not null
   String sfiz = request.getParameter("lfd"); 
   if (sfiz == null) sfiz = "";
   String sgrp = request.getParameter("lgu");
   String mysql = "";
   long folderId = -1;
   long groupId = -1;
   long exerId = -1;
   int fn = - 1;
   
   try{
       fn = Integer.parseInt(sFn);System.out.println("shared.jsp function:"+fn);
   }
   catch(Exception e){
       e.printStackTrace();
   }
   String sGroup_UsersJSon = "";
   //create json Shared
   String jsonShared = "";

   SharedDAO _sharedDao = new  SharedDAO();
   
   if(fn == 0){//insert shares                 
       String []sfizs = sfiz.split(";");
       String []sgrps = sgrp.split(";");
       List<Shared> list = new ArrayList<Shared>() ;//_sharedDao.query(mysql, userId);
       Shared item ;
       /*
       String sFolderOnly = "";
       for(int i = 0;i< sfizs.length;i++){
           String []mlfd = sfizs[i].split(",");
           if(mlfd.length == 2){
               if(sFolderOnly == ""){
                   sFolderOnly = sFolderOnly + mlfd[0].trim();
               }
               else{
                   sFolderOnly = sFolderOnly + "," + mlfd[0].trim();
               }
           }
       }
       */
       /*
      mysql = "select distinct shared.*,'' as userName "
               +"   ,groups.name as groupName "
               + " from shared "
               + "  inner join groups on shared.groupId = groups.id "                  
               + " where  folderId in (" + sFolderOnly + ")";
      List<Shared> itemsShared = _sharedDao.getAll(mysql);      
      String sListId = "";//dung de xoa
      if(itemsShared.size() > 0){
          sListId = sListId + itemsShared.get(0).getId();
          for(int i =1;i < itemsShared.size();i++){
              Shared _item = itemsShared.get(i);
              sListId = sListId + "," + _item.getId();
          }
          //thuc hien xoa tat ca 
          mysql = " delete from shared where id in (" + sListId + ")";   
          _sharedDao.delete(mysql);
      }
      */
       for(int i = 0;i < sfizs.length;i++){
           //String []mlfd = sfizs[i].split(",");
           for(int j = 0;j < sgrps.length;j++){                
               String []msgrp = sgrps[j].split(",");
               item = new Shared();
               //if(mlfd.length == 2 && msgrp.length == 2 ){
               if(msgrp.length == 2 ){
                  
                   folderId = Long.parseLong(sfizs[i]);
                   exerId = -1;
                   groupId = Long.parseLong(msgrp[0]);
                   long userId = Long.parseLong(msgrp[1]);
                   
                   item.setExerciseId(exerId);
                   item.setFolderId(folderId);
                   item.setGroupId(groupId);
                   item.setUserId(userId);  
                   
                   //mysql = "insert into shared(folderId,groupId,userId,exerciseId) values(?,?,?,?)";
                   mysql = "insert into shared(folderId,groupId,userId,exerciseId) " 
                         + "select "+folderId+","+groupId+","+userId+","+exerId+" from dual where not exists "
                         + "(select * from shared where folderId=? and groupid=? and userId=? and exerciseId=?)";
                   
                   int t = 0;
                   Object []obj = {folderId,groupId,userId,exerId};
                   Object result = _sharedDao.executeUpdate(mysql, obj, t);
                   
                   System.out.println("mysql:" + mysql + " result:"+result.toString());
                   item.setId(Long.parseLong(result.toString()));                    
                   list.add(item);                    
               }
           }//end for j
       }//end for i
       String jsonString = _sharedDao.getJson(list);
       response.setContentType("text/json");
       out.write(jsonString);
   }  
   else if(fn == -1){//list all shares of selected folders        
       List<Shared> list = new ArrayList<Shared>();            
       
       String []sfizs = sfiz.split(";");
       String sFolderOnly = "";
       for(int i = 0;i < sfizs.length;i++){
          if(sFolderOnly.equals("")){
              sFolderOnly += sfizs[i];
          }
          else{
              sFolderOnly += "," + sfizs[i];
          }
       }//end for i
       if(!sFolderOnly.equals("")){
            mysql = "select shared.*, users.name as userName, groups.name as groupName "
                  + "from shared "
                  + "left join groups on shared.groupId = groups.id "
                  + "left join users on shared.userId = users.id "
                  + "where folderId in (" + sFolderOnly + ")";
             List<Shared> itemsShared = _sharedDao.getAll(mysql);
             for(Shared item : itemsShared){
                 list.add(item);
             }
             System.out.println(mysql + "\n result size " + list.size());
       }
       
       String json = _sharedDao.getJson(list);
       if(json == ""){
           json = "[]";
       }
       response.setContentType("text/json");
       out.write(json);              
   }//
   else if(fn == 2){//delete share
      StringBuilder createJson = new StringBuilder();
      response.setContentType("text/json");
      if(!isAdmin){
         createJson.append("{\"delete\":0,");
         createJson.append(" \"errormessage\":\"Only Admin users can delete shares!\"}");
         out.write(createJson.toString());
      }
      else{
         
        String[] sgrps = sgrp.split(";");
        String userids = "";
        String groupids = "";
        for(int i = 0; i < sgrps.length; i++){
           String[] m = sgrps[i].split(",");
           if(m.length == 2){
              if("-1".equals(m[0])) userids += "," + m[1];
              else groupids += "," + m[0];
           }//m.length=2
        }//for sgrps
        if (userids.startsWith(",")) userids = userids.substring(1);
        if (groupids.startsWith(",")) groupids = groupids.substring(1);
        
         int result = 0;
         if(sfiz.length()>0 && (userids.length()>0 || groupids.length()>0)){
           mysql = "";//must set to be empty 
           if(userids.length()>0)
              mysql +=  "(folderId in ("+sfiz+") and userId in ("+userids+"))";
           if(groupids.length()>0){
              if(mysql.length()>0) mysql += " or ";
              mysql += "(folderId in ("+sfiz+") and groupId in ("+groupids+"))";
           }
           
           mysql = "delete from shared where " + mysql; System.out.println(mysql);
           result = _sharedDao.delete(mysql);
           result = result == 0? -1 : result;
           createJson.append("{\"delete\":").append(result).append("}");
           out.write(createJson.toString());
         }
         else{
           createJson.append("{\"delete\":").append(result).append("}");
           out.write(createJson.toString());
         }
      }//else admin
  }//if(fn == 2)   
}//sFn != null
   
%>
  