/******************************************************************************
* intent: define the Open Exercise folder tree
*
* struct:
* data_open_tree: this is json data for the tree. { exers[], folders[], versions[] }
* shorts: OT = open-tree
******************************************************************************/

var data_open_tree=[];
var global_exercise_tree="";// id cua bai tap dang duoc chon
var need_update=[];// luu tre cac bai tap da co version moi
var undo_version=[];
var counter_undo=0;

/******************************************************************************
*
******************************************************************************/
//remove exercie by id

function removeExercise(xid ,version)                                   {
var delete_exer_url = Editor.url_exercises+"?action=deletehistory&exerciseid="+xid+"&version="+version;
var rowsAffected = 0;
$.ajax({ async: false, cache: false, url: delete_exer_url
, success: function(in_data)                                                  {
   rowsAffected = parseInt(in_data);
   if( rowsAffected >= 1 )
      // delete version from data_open_tree.versions
      data_open_tree.versions.splice( data_open_tree.versions
      .  findIndex( x => ( x.version==version && x.exerciseid==xid ))
      ,  1);                                                                  }
, error: function (xhr, status, error)                                        {
   console.log(error.toString());                             }});
return rowsAffected;                                                          }

function reloadTree()
{
    Editor.ajaxLoader("visible");
    $.ajax({
        url: _url_folder,
        type: 'POST',
        dataType: 'json',
        data: _init_data,
        complete: function(data, textStatus) { },
        success: function(data, textStatus, xhr) {
            var folders =  data.folders;
            data_open_tree = data;
            var treedata = [];
            for(var i=0;i<folders.length;i++)                                       {
                // check if the current node is a child node
                var parentnode = folders.filter(function(v) {
                    return v.id === folders[i].parentId;
                });
                if(parentnode.length == 0)                                           {
                    var arrayobj = get_two_level(folders[i]);
                    if(arrayobj != undefined && arrayobj.length>0)
                        treedata.push(arrayobj[0]);                                       }}
            build_open_tree("browser", treedata);
            Editor.ajaxLoader("hidden"); },
        error: function(xhr, textStatus, errorThrown)                              {
            Editor.ajaxLoader("hidden");
            isAjaxSessionTimeOut(xhr);                                          }
    });
}
var eventloadingtree = "";
function load_open_tree(eventname) {
// to prevent load open tree being called twice in touch & click actions    
if (eventloadingtree == "") eventloadingtree = eventname;
else if(eventloadingtree != eventname) return;

if(data_open_tree.length == 0){
Editor.ajaxLoader("visible");
$.ajax({
  url: _url_folder,
  type: 'POST',
  dataType: 'json',
  data: _init_data,
   complete: function(data, textStatus) { },
   success: function(data, textStatus, xhr) {
      var folders =  data.folders;
      data_open_tree = data;
      var treedata = [];
      for(var i=0;i<folders.length;i++)                                       {
         // check if the current node is a child node
         var parentnode = folders.filter(function(v) {
            return v.id === folders[i].parentId;
         });
         if(parentnode.length == 0)                                           {
            var arrayobj = get_two_level(folders[i]);
            if(arrayobj != undefined && arrayobj.length>0)
            treedata.push(arrayobj[0]);                                       }}
      build_open_tree("browser", treedata);
      try                                                                     {
         $('#lnk-exercise').popup('open');                                    }
      catch(e)                                                                {
          console.log("Error at load_open_tree " + e);
          //alert("Some problem happened during loading folder exercises, please try again later, thanks.");
      }
	  
	  //HUNG NGUYEN Add checkbox to item
	  //$('li.history').prepend($('<input type="checkbox" style="float: left;margin-top:1px" />'))
      Editor.ajaxLoader("hidden"); },
   error: function(xhr, textStatus, errorThrown)                              {
      Editor.ajaxLoader("hidden");
      isAjaxSessionTimeOut(xhr);                                          }});}
else                                                                          {
   try                                                                        {
      $('#lnk-exercise').popup('open');                                       }
   catch(e)                                                                   {
       console.log("Error at load_open_tree " + e);                           }}}//load_open_tree

/******************************************************************************
*
******************************************************************************/

function buid_trash(id,data) { } //$('#'+id).tree({data: data,dragAndDrop: true});

var OTdropVersionInTrash = function( event, ui )                              {
//================
$('#recyclebinexer').attr("style", "visibility: hidden;");
if(ui && ui.draggable)                                                        {
   if(ui && ui.draggable)                                                     {
      if($(ui.draggable).parent() && $(ui.draggable).parent().parent())       {
         var historyEle = $(ui.draggable).parent().parent();
         var strExercise = historyEle.attr("exerciseid");
         var version = historyEle.attr("version");
         if(strExercise && version)                                           {
            result = removeExercise(strExercise, version);
            if (result) historyEle.remove();
//          removeExercise(strExercise, version).then(function (result)       {
//            if (result) historyEle.remove();                              });
                                                                          }}}}}

var OTcallContextMenu = function( id )                                        {
//================                                          //Calling context menu
$( "li.context-menu-one" ).bind( "taphold", tapholdHandler );
function tapholdHandler( event ){
	 event.preventDefault();
	 event.stopPropagation(); }

$("body").contextmenu({
		delegate: ".context-menu-one2",
		menu: "#options",
//        position: {my: "left top", at: "left bottom"},
		position: function(event, ui){
			return {my: "left top", at: "left bottom"
                        , of: ui.target};		},
		preventSelect: true,
		taphold: true,
		show: { effect: "fold", duration: "slow"},
		hide: { effect: "explode", duration: "slow" },
		focus: function(event, ui) {
			var menuId = ui.item.find(">a").attr("href");
			$("#info").text("focus " + menuId);		},
		blur: function(event, ui) {
			$("#info").text("");		},
		beforeOpen: function(event, ui) { },
		open: function(event, ui) {
			ExercisesMenu.is_request = true;
			event.stopImmediatePropagation();
			event.preventDefault();		},
		select: function(event, ui) { },
                close:function(event,ui){ ExercisesMenu.is_request = false; }
	});
   // TouchHold();
$$('li.context-menu-one').hold(function(e) {
		var exerciseid = $$(this).attr('exerciseid');
		var version = $$(this).attr('version');
		if(!exerciseid||!version){ return; }
});
}

var OTbindTreeOpen = function(e,id)                                            {
//================
var	level = e.node.getLevel();
destroy_undo();
if(!e.node.exerciseid&&level>=2)                                               {
   var children = e.node.children;
   for(var i =0;i<children.length;i++)                                         {
      var folder = children[i];
      if(!folder.exerciseid)                                                   {
         var node = $('#'+id).tree('getNodeById', folder.id);
         var data = get_two_level({name: folder.label, id: folder.id});
         if(data.length)   $('#'+id).tree('loadData',data[0].children,node); }}}
      else                                                                     {
         if(e.node.version=="maxversion")                                      {
            var node = $('#'+id).tree('getNodeById', e.node.id);
      	    var exerciseid = e.node.exerciseid;
      	    if( has_need_update(exerciseid))                                   {
      	       var data = get_version_by_exercise_id(exerciseid);
      	       if(data.length) $('#'+id).tree('loadData',data,node);        }}}}

var OTbindTreeSelect = function( event ) {
//================
destroy_undo();
if(!event.node) return;
if (event.node.exerciseid) {
   var exerciseid =event.node.exerciseid;
   var exercise =_(data_open_tree.exers).find(function(item){
      return item.exerciseId ==exerciseid;            });
   if(exercise){
      if(event.node.version=="maxversion")
           global_exercise_tree = event.node.id;
      else global_exercise_tree = event.node.parent.id;
   select_exercise_open_tree(exercise,event.node.version); }}}

var OTonCreateLi = function ( node, li ) {}
var OTonDragStop = function() { alert( "drag stop detected" ); } //sn170716

function build_open_tree(id, data){ 
//================
$('#recyclebinexer').droppable(                                                {
   accept: "span",
   hoverClass:"drop-hover",
   drop: function( event, ui ) { OTdropVersionInTrash( event, ui ); }        });
$('#'+id).tree(                                                                {
data: data,
onDragStop: OTonDragStop, //sn170716

onCreateLi: function(node, $li) { // OTonCreateLi(node,$li); }
if( node.exerciseid && ( node.version >= -1 || node.version == "maxversion" 
||                       node.version ==  0 ))                                 {
   if (node.version != "maxversion" && node.version != -1)                     {
      $li.attr('version', node.version);
      $li.attr('exerciseid', node.exerciseid);
      $li.addClass('childnode');
      if (node.history && node.history == "1")                                 {
         $li.addClass('history');
         $li.find('span').draggable(                                           {
            revert: function (event, ui)                                       {
               $(this).data("uiDraggable").originalPosition = {top: 0,left:0};
               return !event;                                                 },
            start: function (event, ui)                                       {
               if ($('#recyclebinexer').css("visibility") == "hidden")
                   $('#recyclebinexer').attr("style", "top:" 
                   +  (ui.offset.top - ((ui.offset.top - 20) / 2)) 
                   +  "px; right:0px;visibility: visible;z-index:10");        },
            stop: function (event, ui)                                        {
//sn170716: start 
// this seems to trigger open-xiz on drag-release, but breaks "New" on phone
// delete was broken, but now mysteriously fixed!?!
// always remember to test Delete & New on the phone w/ any code change here.
// behavior is erratic.
// if( insignificant_drag ) { then count action as select exercise & open it: }
var xid, version, xiz;
xid     = event.srcElement.parentElement.parentElement.getAttribute("exerciseid");
version = event.srcElement.parentElement.parentElement.getAttribute("version");
xiz     = _(data_open_tree.exers).find( function(item){ return item
.         exerciseId == xid; });
select_exercise_open_tree( xiz, version );
// else cancel drag
//sn170716: end
               $('#recyclebinexer').attr("style", "visibility: hidden;");     },

            zIndex: 10                                                    }); }
      $li.addClass('context-menu-one');
      $li.find('.jqtree-title').addClass('file');                              }
   else { $li.find('.jqtree-title').addClass('folder close'); }        }
},
openedIcon: '-',
closedIcon: '+',
dragAndDrop: false,
onCanMove: function(node)              {
   if (! node.version) return false;
   else                return true;    },
onCanMoveTo: function(moved_node, target_node, position) {
   if (target_node) return (position == 'inside'); // Example: can move inside menu, not before or after
   else             return true;                         },
useContextMenu: true                                                         });

$(document).ready(            function(     ) { OTcallContextMenu(id);       });
$('#'+id).bind('tree.open',   function( e   ) { OTbindTreeOpen(e,id);        });
$("#"+id).bind('tree.select', function(event) { OTbindTreeSelect( event );   });
$('#'+id).bind( 'tree.move', function(event)                                  {
        console.log('moved_node', event.move_info.moved_node);
        console.log('target_node', event.move_info.target_node);
        console.log('position', event.move_info.position);
        console.log('previous_parent', event.move_info.previous_parent);     });

}

function select_exercise_open_tree(exercise,version){
	if(!ExercisesMenu.is_request){
		if(version=="maxversion"){
		 version=	_(data_open_tree.versions).max(function(item){
		 		return item.exerciseid==exercise.exerciseId&&item.version;
			}).version;
		}
    	Exercise.current.index =1;
    	Exercise.current.latex =exercise.latex;
    	Exercise.current.variable =exercise.variable;
    	Exercise.current.folder_id=exercise.folderId;
    	Exercise.current.content=exercise.exerciseName;
    	Exercise.current.exercise_id = exercise.exerciseId;
    	Exercise.current.xiznum= exercise.friendly_id;
    	Exercise.current.friendly_id= exercise.friendly_id;
    	Exercise.current.version= version;
    	ExercisesMenu.selected_tree(Exercise.current);
    }
}

function get_two_level(itemx){
	var folders = data_open_tree.folders;
	//var exers = data_open_tree.exers;
	//var versions = data_open_tree.versions;

	var brands = [{'label': itemx.name, 'id': itemx.id,children:[]}];

	//get folder by itemx
	var filter_folders =_(folders).filter(function(item){
			if(item.parentId==itemx.id)
			{
				return {label:item.name, id:item.id};
			}
	});
/*
	//get exercise by itemx
	var filter_exercies =_(folders).filter(function(item){
			if(item.parentId==itemx.id){
				return {label:item.name, id:item.id};
			}
	}); */
	// con cua brand
	var children =[];

	// get child cap 3
	for(var i=0;i<filter_folders.length;i++){
		var level2 = filter_folders[i];
		var child = {'label': level2.name, 'id': level2.id};
		var folder2s = _(folders).filter(function(item){
			if(item.parentId==level2.id)
			{
				return {label:item.name, id:item.id};
			}});
			child.children=[];
			if(folder2s.length){
				
			_(folder2s).each(function(item){
					child.children.push( {'label': item.name, 'id': item.id});
					return item;
				})}
			var exercise_version = get_exercise_version_by_id(level2.id)
			_(exercise_version).each(function(item){
				child.children.push(item);
			});
			children.push(child);
	}

	var result = get_exercise_version_by_id(itemx.id)

	brands[0].children = children;

	_(result).each(function(item){
		brands[0].children.push(item);
	});

	return brands;
}


function get_exercise_version_by_id(folderid){
	var folders = data_open_tree.folders;
	var exers = data_open_tree.exers;
	var versions = data_open_tree.versions;
	var result = [];
	_.chain((exers).filter(function(item){
    	return item.folderId==folderid;
	})).each(function(item){
	     temp = { id:folderid +'_'+item.id, 
   	           label: item.friendly_id + ": " + item.exerciseName, 
   	           exerciseid: item.exerciseId, version:"maxversion"};
	     v_by_excise = [];
	     v_by_excise.push({label:"new", exerciseid: item.exerciseId, version:-1});
	    _(versions).filter(function(version){
	        if( version.exerciseid == item.exerciseId){
	        	return v_by_excise.push({label:version.version, exerciseid: version.exerciseid, 
	        							version:version.version, history: "1"});
	        }	        
	     });
	     temp.children = v_by_excise;
	     result.push(temp);
	});
	return result;
}

function get_version_by_exercise_id(exerciseid)
{
	var versions = data_open_tree.versions;
	var v_by_excise = [];
	v_by_excise.push({label:"new", exerciseid: exerciseid, version:-1});
	 _(versions).filter(function(version){
	        if( version.exerciseid == exerciseid&&!version.isdelete){
	        	return v_by_excise.push({label:version.version, exerciseid:
	        				 version.exerciseid, version:version.version});
	        }	        
	     });
	 return v_by_excise;
}

function update_version(id,item){
	var current_node = $("#"+id).tree('getNodeById', global_exercise_tree);
	if(current_node == null) console.log("Cannot get node of "+id);
	else{
    	var last_node = current_node.children[current_node.children.length-1];
	    $('#'+id).tree('addNodeAfter',item,last_node);
	    add_need_update(current_node.exerciseid);
	}
}

function add_need_update(id){
	need_update.push(id);
}

function get_exercise_id(id)
{
	var arr = id.split("_");
	return arr[1];
}

function has_need_update(id)
{
	return 	_(need_update).find(function(item){
		return item==id;
	});
}
function destroy_undo()
{
	$('#btn-undo-version').css('display','none');
	undo_version=[];
	counter_undo+=1;
}

/*****************************************************************************************************/

function TouchHold()
{
	var element = document.id('browser'),
				timer;

			element.store('touchhold:delay', 700);
			element.addEvent('touchhold', function(event){
				$('#popupBasic').popup('open');
			});
		
}
