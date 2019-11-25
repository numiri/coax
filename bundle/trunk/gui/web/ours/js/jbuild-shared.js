function buildTree(_tag, init, data_tree) {
	var build_id = createTree(_tag, data_tree, init);
	
	$(_tag).treeview({
		control: "#treecontrol",
		toggle : toggle_shared
	}); 	
	if(_tag == "#browser"){
	   if($("#browser li").first().hasClass("expandable"))
	      $("#browser li>div").first().click();
	}else if(_tag == "#grouptree"){
	   $("#grouptree li>div").first().click()
	}
} 

var command = {};
command.target =[];
function action_context(action, el) {
	var id =  el.target[0].id;
	_current_tag = id;
	_current_prefix = id.replace(/\d+/, "");
	var real_id = id.replace(/\D+/, "");
	var command = el.cmd;
	switch (command) {
	case 'new':
		var is_two="";

		if(_current_prefix== prefix_folder)
		{
			is_two = _.find(folder_exers,function(item){
				return item.folderId==real_id;
			});
		}
		else if(_current_prefix==prefix_group){

			is_two = _.find(group_users,function(item){
				return item.groupId==real_id;
			});
		}
		if(is_two){
			alert("Cannot create folder here because a folder must not mix exercises with sub-folders.")
		}else{
		_t_valid = "new";
		$(".ui-dialog-title").text("Create new item");
		$("#dialog-form").dialog("open");	
		}
		break;
	case 'edit':
		_t_valid = "edit";

		var jSons = [];
		if (id.indexOf(init_group.parent_prefix) !== -1) {
			$(".ui-dialog-title").text("Edit group item");
			jSons = dtree_group;
		} else if (id.indexOf(init_folder.parent_prefix) !== -1) {
			$(".ui-dialog-title").text("Edit folder item");
			jSons = dtree_folder;
		}
		var _temp_current = id.replace(/\D+/, "");
		var object = _.find(jSons, function(item) {
			return item.id == _temp_current;
		});
		if (object) {
			$("#name").val(object.name);
			$("#des").val(object.description)
		}
		
		$("#dialog-form").dialog("open");
		break;
	case 'delete':
	   if($("#"+el.target[0].id).siblings('ul').children('li').children('ul').length>0){
	      alert("Parent folder '"+$("#"+el.target[0].id).text()+"' cannot be deleted. Must delete its child till it is childless.");
	   }else                                                                   {
		var template = "'<%= name %>' will be deleted. Are you sure?";
		var _temp_current = id.replace(/\D+/, "");
		var tag_message = 'dc-message';
		switch (_current_prefix) {
		case init_folder.parent_prefix:
			template = 'Folder ' + template;
			
			var folder = findObject(dtree_folder, _temp_current);
			
			if(folder)
				{
				var compiled = _.template(template);
				$('#'+tag_message).html(compiled({name:folder.name}));
//				$('#dialog-confirm .ui-dialog-buttonset button:first-child span').text('Delete Item');
//				$("#dialog-confirm .ui-dialog-title").text("Delete Folder");
            $('#dialog-confirm ~ div .ui-dialog-buttonset button:first-child span').text('Delete Folder');
            $("#dialog-confirm").prev().find("span:first").text('Delete Folders');
				$( "#dialog-confirm" ).dialog("open");	
				}
			
			break;
		case init_group.parent_prefix:
			template = 'Group ' + template;
			var group = findObject(dtree_group, _temp_current);
			if(group)
				{
				var compiled = _.template(template);
				$('#'+tag_message).html(compiled({name:group.name}));
//				$('#dialog-confirm .ui-dialog-buttonset button:first-child span').text('Delete Item');
//				$("#dialog-confirm .ui-dialog-title").text("Delete Group");
            $('#dialog-confirm ~ div .ui-dialog-buttonset button:first-child span').text('Delete Group');
            $("#dialog-confirm").prev().find("span:first").text('Delete Groups');
				$( "#dialog-confirm" ).dialog("open");	
				}
			
			break;
		}//switch
	   }//else - childless
		break;
	case 'assign':
		var _temp_current = id.replace(/\D+/, "");
		switch (_current_prefix) {
		
		case init_folder.parent_prefix:
			flag_folder =true;
			flag_group = false;
			var folder = findObject(dtree_folder, _temp_current);
			$(".ui-dialog-title").text("Assign Exercise" + "->(" +  folder.name +")");
			$(window).resize(function() {
				fixed_size_window();
			});
			
			$("#filter").attr('placeholder','Search Exercise');
			$("#filter").keyup(function() {
				get_all_children(true);
			});
			clear_panel();
			
			load_children_by_parentid(_current_tag);
			$("#dialog-panel").dialog("open");
			fixed_size_window();
			break;
		case init_group.parent_prefix:
			flag_group =true;
			flag_folder=false;
			var group = findObject(dtree_group, _temp_current);
			$(".ui-dialog-title").text("Assign User"+'->(' +group.name +')');
			$(window).resize(function() {
				fixed_size_window();
			});
			// get_all_children();
			clear_panel();
			$("#filter").attr('placeholder','Search User');
			$("#filter").keyup(function() {
				get_all_children(true);
			});
			load_children_by_parentid(_current_tag);
			fixed_size_window();
			$("#dialog-panel").dialog("open");
			break;
		}
		
		break;
	case 'clean':
	   if(_current_prefix== prefix_folder){
	      var lis = $('#sharedfolder li');
	      for ( var i = 0; i < lis.length; i++) {
	         var itemId = lis[i].getAttribute("folderid");
	         $("#"+itemId).click();
	      }
      }
      else if(_current_prefix==prefix_group){
         var lis = $('#sharedgroup li');
         for ( var i = 0; i < lis.length; i++) {
            var itemId = lis[i].id.substr(1);// "ggroup1087 --> "group1087""
            $("#"+itemId).click();
         }
      }
	   break;
	}
}

function clear_panel()
{	$("#filter").val('');
	$('#'+list_userslist).empty();
	$('#'+list_guserslist).empty();
	ajaxLoader("hidden");//enablebtn_shared();
}
function delete_shared()
{
	$('#flash-shared').html('');
	_current_prefix='deleteall';
	var tag_message = 'dc-message';
	var lisF = $('#sharedfolder li');
	var sharedfolders =''; 
	for ( var i = 0; i < lisF.length; i++) {
		var item = lisF[i];
		var name = item.textContent.trim();
		if(i>0) sharedfolders += ", ";
		sharedfolders += "'" + name + "'";
	}
	if(lisF.length>1)       sharedfolders = "the folders: " + sharedfolders;
	else if(lisF.length==1) sharedfolders = "the folder: "  + sharedfolders;

	var lisG = $('#sharedgroup li');
   var sharedgroups =''; 
   for ( var i = 0; i < lisG.length; i++) {
      var item = lisG[i];
      var name = item.textContent.trim();
      if(i>0) sharedgroups += ", ";
      sharedgroups += "'" + name + "'";
   }
   if(lisG.length>1)       sharedgroups = "the groups: " + sharedgroups;
   else if(lisG.length==1) sharedgroups = "the group: "  + sharedgroups;
	
	if(sharedfolders && sharedgroups)                                          {
		$('#'+tag_message).html("Unshare " + sharedfolders + " & " + sharedgroups + "?");
		$('#dialog-confirm ~ div .ui-dialog-buttonset button:first-child span').text('Delete');
		$("#dialog-confirm").prev().find("span:first").text('Delete Sharing');
		$( "#dialog-confirm" ).dialog("open");	
		}
	else
		{
			$('#flash-shared').html('<span style="color:red">Folder & group/user must be selected to unshare!</span>');
		}
		
}

function clear_flash_shared()
{
	$('#flash-shared').html('');
}

function delete_all_shared(){
	var lis = $('#sharedfolder li');
	var folderids = '';
	for ( var i = 0; i < lis.length; i++) {
		var item = lis[i];
		var folderid = item.getAttribute('folderid').replace(prefix_folder, '');
		folderids += folderid + ",";//must be comma 
	}
	folderids = folderids.replace(/,$/, "");
	
	var groupuserids = '';
	var grplst = $('#sharedgroup li');
	for ( var i = 0; i < grplst.length; i++) {
	   var item = grplst[i];
	   var userid = item.getAttribute('userid');
      var groupid = item.getAttribute('groupid').replace(prefix_group, '');
      if(userid) groupuserids += "-1,"+ userid  + ";";
      else       groupuserids += groupid + ",-1"+ ";";
         
	}
	groupuserids = groupuserids.replace(/;$/, "");

	var data = {
		lfd : folderids,
		lgu : groupuserids,
		userId : _t_user_id,
		fn : 2
	}
	$.ajax({
		url : init_folder.url,
		type : "get",
		contentType : "application/json",
		data : data,
		dataType : "json",
		cache : false,
		success : function(data) {
			if(data.delete>0){
				$('#'+init_folder.tag).empty();
				$('#'+init_group.tag).empty();
				$('#'+init_group.tag_list).empty();
				$('#'+init_folder.tag_list).empty();
				loadTree(init_folder.url_action, _init_data, init_folder.tag,
						init_folder, dtree_folder);
				loadTree(init_group.url_action, _init_data, init_group.tag,
						init_group, dtree_group);	
			}
			else if(data.errormessage) alert(data.errormessage);
			else alert('No existing share was removed from the database!');
		},
		error: function(xmlhttp) {
		   if(isAjaxSessionTimeOut(xmlhttp)) return;
		}
	});
}
/*********************************************/
function delete_item(url,tag, dtree,current_tag) {
//	$("#" + tag).treeview({
//		remove : $("#" + current_tag).parent("li").filter(":first")
//	});
	var parent = $("#" + current_tag).parent().parent()[0].id;
	$("#" + current_tag).parent().remove();
	$('#'+ parent +" li:last-child").addClass('last');
	
	
	var _temp_current = current_tag.replace(/\D+/, "");
	var item = _.find(dtree, function(itemx) {
		return itemx.id == _temp_current;
	});
	if (item) {
		var _send_data = {
			id : item.id,
			userId : _t_user_id,
			fn : 2
		}
		loadTree(url, _send_data);
		dtree.splice(dtree.indexOf(item), 1);
		
		//remove bottom panel
		$('ul#sharedfolder li#f' + current_tag).remove();
		$('ul#sharedgroup li#g' + current_tag).remove();
		
		_current_tag = "";
	}
}
/*********************************************/
function createTree(_tag, _json, init) {
	//debugger;
	var data_child = init.data_child;
	var data_parent = init.data_parent;
	var class_child = init.class_child;
	var class_parent = init.class_parent;
	var id = init.id;
	var parent_id = init.relate_id;
	var parent_name = init.parent_name;
	var child_id = init.child_id;
	var child_id_2 = init.child_id_2;
	var child_name = init.child_name;
	var parent_prefix = init.parent_prefix;
	var child_prefix = parent_prefix;// /init.child_prefix;
	var relate_parent = init.relate_parent;
	var attribute_name = init.attribute_name
	var attribute_value = init.attribute_value;

	var children = _json[data_child];
	var parent = _json[data_parent];

	if (data_child == init_group.data_child) {
		group_users = children;
	}
	
	if (data_child == init_folder.data_child) {
		folder_exers = children;
	}
	var build_id = '';

	_.each(parent, function(item) {
		build_id += "#" + parent_prefix + item.id + ',';
	});
	
	if(parent.length > 0)
	{
		for(var i = 0; i < parent.length; i++){
		   // check if the current node is a child node
		   var parentnode = parent.filter(function(v) {
		      return v.id === parent[i].parentId;
		   });
			if(parentnode.length == 0)
			{
				//Create root
				li = createItem(_tag, parent_prefix + parent[i][id],
									parent[i][parent_name], class_parent);
									
				var addedFile = new Array();
				
				//Create tree by Hung Nguyen
				//Must be clone parent and children because there are many references to these Arrays so we cannot modify them
				var data_parent = parent.slice(0);
				var data_children = children.slice(0);
				var tree_items = new Array(data_parent[i]);
				
				for ( var j = 0; j < data_children.length; j++)
				{
					if (data_children[j][relate_parent] == data_parent[i][id]) {
						createItemLeft("#ul-" + parent_prefix + data_parent[i][id],
							child_prefix + data_children[j][child_id],
							data_children[j][child_name], class_child, attribute_name,
							data_children[j][attribute_value],data_children[j]);
						
						addedFile.push(j);
					}
				}
				
				for ( var j = addedFile.length - 1; j >= 0 ; j--)
				{
					data_children.splice(addedFile[j],1);
				}
				
				data_parent.splice(i,1);
				
				CreateTreeRecursive(tree_items, data_parent, parent_prefix, parent_name, class_parent, id, data_children,
				relate_parent, child_prefix, child_id, child_name, class_child, attribute_name, attribute_value)
			}
		}//for
		
	}
	build_id = build_id.replace(/,$/, "");
	return build_id;
}
/*********************************************/
function CreateTreeRecursive(tree_items, data_items, parent_prefix, parent_name, class_parent, id, file_items,
relate_parent, child_prefix, child_id, child_name, class_child, attribute_name, attribute_value)
{
	var addedIndex = new Array();
	var addedFile = new Array();
	
	if(data_items.length > 0)
	{
		_.each(tree_items, function(item) {
			for ( var i = 0; i < data_items.length; i++)
			{
				if (data_items[i].parentId == item.id) {
					createItem("#ul-" + parent_prefix + item[id],
						parent_prefix + data_items[i][id], data_items[i][parent_name],
						class_parent);
						
					addedIndex.push(i);
				}
			}
		});
		
		addedIndex.sort(function(a, b){return a-b});
		
		for ( var i = addedIndex.length - 1; i >= 0 ; i--)
		{
			tree_items.push(data_items[addedIndex[i]]);
			data_items.splice(addedIndex[i],1);
		}
		
		_.each(tree_items, function(item) {
			
			for ( var i = 0; i < file_items.length; i++)
			{
				if (file_items[i][relate_parent] == item[id]) {
					createItemLeft("#ul-" + parent_prefix + item[id],
						child_prefix + file_items[i][child_id],
						file_items[i][child_name], class_child, attribute_name,
						file_items[i][attribute_value],file_items[i]);
					
					addedFile.push(i);
				}
			}
		});
		
		addedFile.sort(function(a, b){return a-b});
		
		for ( var i = addedFile.length - 1; i >= 0 ; i--)
		{
			file_items.splice(addedFile[i],1);
		}
		
		if(addedIndex.length > 0)
		{
			CreateTreeRecursive(tree_items, data_items, parent_prefix, parent_name, class_parent, id, file_items, 
			relate_parent, child_prefix, child_id, child_name, class_child, attribute_name, attribute_value);
		}
	}
}
/*********************************************/
function createItem(_parent, _id, _name, _type) {
	var _li = document.createElement("li");
	_li.setAttribute("class", "closed cursor");

	var _span = document.createElement("span");
	_span.setAttribute('onclick','doSomething('+_id + ''+');');
	_span.setAttribute("id", _id);
	_span.setAttribute("class", _type);
	_span.innerHTML = _name;

	var _ul = document.createElement("ul");
	_ul.setAttribute("id", "ul-" + _id);

	_li.appendChild(_span);
	_li.appendChild(_ul);

	$(_parent).append(_li);

	return _li;
}
function doSomething(e)
{
	if($("#"+e.id).hasClass('file')){
		$('#options-left').css("display","none");
		$('#options-right').css("display","none");
		return;
	}

	if($("#"+e.id).hasClass('selected-2')){
		$('#options-left').css("display","none");
		$('#options-right').css("display","none");
	}else{
		if(e.id.indexOf('folder')>=0){
		$('#options-left').css("display","block");
		$('#options-right').css("display","none");
		}
		else{
		$('#options-left').css("display","none");
		$('#options-right').css("display","block");
		}
		command.target[0]={id:e.id};
	}
}
function action_tree(action){
	command.cmd = action;
	action_context(action, command)
}
/*********************************************/
function createItemLeft(_parent, _id, _name, _type, attrname, attrvalue,item_exer) {
	
	var _li = document.createElement("li");
	_li.setAttribute("class", "cursor");
	var _span = document.createElement("span");
	_span.setAttribute("id", _id);
	_span.setAttribute("class", _type);
	_span.setAttribute(attrname, attrvalue);
	_span.setAttribute('onclick','doSomething('+_id + ''+');');
	

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

	return _li;
}
/*********************************************/
function toogle_shared_exercise()
{
	if(_current_tag)
	{
		var key = _current_tag.replace(/\d/g, '');
		switch (key) {

			case 'folder':
			$('li').filter('.cursor').find(">span.secleted").removeClass(
				'secleted');

			var li = $('#' + _current_tag);

			if (!li.hasClass('selected')) {
				li.removeClass('secleted-actvie');
			} else {
				if (li.hasClass('active')) {
					li.addClass('secleted-actvie');
				}
			}
			break;
		}
	}
}
/*********************************************/
function toggle_shared() {

	if(_current_tag){

		var key = _current_tag.replace(/\d/g, '');
		switch (key) {

			case 'folder':
			$('li').filter('.cursor').find(">span.secleted-actvie").removeClass(
				'secleted-actvie');

			var li = $('#' + _current_tag);

			if (!li.hasClass('selected')) {
				li.removeClass('secleted-actvie');
			} else {
				if (li.hasClass('active')) {
					li.addClass('secleted-actvie');
				}
			}
			break;
		}
	}
}
/*********************************************/
function checkVal(_val) {
	if (_val != "") {
		return true;
	}
	$(".validateTips").text("Please check value, try again!");
	return false;
}
/*********************************************/
function reSet() {
	$(".validateTips").text("All form fields are required.");

	$("#name").val(""), $("#des").val(""), $("#name").focus();
}
/*********************************************/
function addNew() {
	// _temp_id++;
	var _send_data = {
		parentId : _current_tag.replace(/\D+/, ""),
		name : $("#name").val(),
		description : $("#des").val(),
		userId : _t_user_id,
		fn : 0
	}

	switch (_current_prefix) {
	case init_folder.parent_prefix:
		loadTree(init_folder.url_action, _send_data);
		break;
	case init_group.parent_prefix:
		loadTree(init_group.url_action, _send_data);
		break;
	}

}
/*********************************************/
function findValue(_id, _json) {
	for ( var i = 0; i < _json.length; i++) {
		if (_id == _json[i].id) {
			return i;
		}
	}
	return -1;
}
/*********************************************/
function upDate() {
	switch (_current_prefix) {
	case init_folder.parent_prefix:
		update_switch(init_folder.url_action, dtree_folder);
		break;
	case init_group.parent_prefix:
		update_switch(init_group.url_action, dtree_group);
		break;
	}
}
/*********************************************/
function update_switch(url, dttree) {

	var _temp_current = _current_tag.replace(/\D+/, "");

	var object = _.find(dttree, function(item) {
		return item.id == _temp_current;
	})
	if (object) {

		var _send_data = {
			id : object.id,
			name : $("#name").val(),
			description : $("#des").val(),
			userId : _t_user_id,
			fn : 1
		}
		loadTree(url, _send_data,object,_current_tag);
		object.name = $("#name").val();
		object.description = $("#des").val();
		$("#" + _current_tag).text($("#name").val());
	}
}
/*********************************************/
function loadTree(_url, _data, _id, init, data_tree) {
   ajaxLoader("show");
   var link = window.location.href;
   if(link.indexOf("web/ours/") == -1){
      if(_url == _url_folder_action)
         _url = _url_folder;
      else if(_url == _url_group_action)
      _url = _url_group;
   } 
	$('#flash-shared').html('');
	$.ajax({
		url : _url,
		type : "get",
		contentType : "application/json",
		data : _data,
		dataType : "json",
		cache : false,
		async: false,
		success : function(data) {
			switch (_data.fn) {

			case -1:// group
				data_tree = data;
				buildTree("#" + _id, init, data_tree);
				
				break;
			case 3:// folder
				if (_id == init_folder.tag) {
					dtree_folder = data[init.data_parent];
				} else if (_id ==init_group.tag) {
					dtree_group = data[init.data_parent];
				}
				
				data_tree = data;
				buildTree("#" + _id, init, data_tree);
				//$( "div#page-setting[data-role=page]" ).page( "destroy" ).page();
				break;
			case -2:// folder
				if(data=='0')
					{
					$('#flash-shared').html('<span style="color:red;">Delete failed!</span>');
					}

				break;
			case 0:
				if(data)
					{
					switch (_current_prefix) {
					case init_folder.parent_prefix:
					
						var branches = createItem("#ul-" + _current_tag,
								init_folder.parent_prefix + data.id, data.name,
								init_folder.class_parent);
						$("#ul-" + _current_tag).treeview({
							add : branches
						});
						//buildContext("#"+init_folder.parent_prefix+data.id);
						dtree_folder.push(data);
						break;
					case init_group.parent_prefix:
						var branches = createItem("#ul-" + _current_tag,
								init_group.parent_prefix + data.id, data.name,
								init_group.class_parent);
						$("#ul-" + _current_tag).treeview({
							add : branches
						});
						//buildContext("#"+init_group.parent_prefix+data.id);
						dtree_group.push(data);
						break;
					}	
					}
				break;
			case 1:
				if(data)
					{
				
					}
				else
					{
					$('#flash-shared').html('<span style="color:red;">Update failed!</span>');
					}
				break;
			/*
			 * case 1: // chua lam gi break; case 2: // chua lam gi break;
			 */
			}
			
			InitDrag();
			
			InitDrop();
		},
		error : function(err) {
			// When Service call fails
		   if(isAjaxSessionTimeOut(err)) return;
		}
	});
	ajaxLoader("hidden");
}

function InitDrop()
{
	$(".folder").droppable({
		hoverClass: "ui-state-active",
		accept: function(ele) { 
			return ($(this).attr("id").indexOf("folder") == 0 && $(ele).attr("id").indexOf("folder") == 0)
				|| ($(this).attr("id").indexOf("group") == 0 && $(ele).attr("id").indexOf("group") == 0)
		},
		drop: function (event, ui) {
			var ele = this;
			
			if(!(($(ui.draggable).hasClass("file") && $(ele).parent("li").find(">ul>li>span.folder").length > 0)
				|| ($(ui.draggable).hasClass("folder") && ($(ele).parent("li").find(">ul>li>span.file").length > 0 
				|| $(ui.draggable).parent("li").find("li>span.folder").filter(function () {
						return $(this).attr("id") === $(ele).attr("id")
					}).length > 0))
				|| ($(ui.draggable).hasClass("file") && $(ele).parent("li").find("ul>li>span.file").filter(function () {
						return ($(ele).attr("id").indexOf("folder") == 0 && $(this).attr("exerciseid") === $(ui.draggable).attr("exerciseid"))
							|| ($(ele).attr("id").indexOf("group") == 0 && $(this).attr("userid") === $(ui.draggable).attr("userid"))
					}).length > 0)
			))
			{
				

				if ($(ele).attr("id").indexOf("folder") == 0) {//folder;
					if ($(ui.draggable).hasClass("file")) {
						var cid = $(ui.draggable).attr("exerciseid");
					}
					else {
						var cid = $(ui.draggable).attr("id").replace("folder", "");
					}
					var oid = $(ui.draggable).parent("li").parent("ul").attr("id").replace("ul-folder", "");
					var pid = $(ele).attr("id").replace("folder", "");


					var _send_data = {
						id: cid,
						parentId: pid,
						oid: oid,
						name: $(ui.draggable).hasClass("file") ? "1" : "0",
						fn: 4
					}

					$.ajax({
						url: _url_folder_action, //"../../../web/ours/jsp/folder.jsp",
						type: "get",
						contentType: "application/json",
						data: _send_data,
						dataType: "json",
						cache: false,
						success: function (data) {

							var tmp = $(ui.draggable).parent("li");

							$(ui.draggable).parent("li").siblings(":last").addClass("last")
							$(ui.draggable).parent("li").remove();
							$(ele).siblings("ul").append(tmp);
							$("#browser").treeview({
								add: tmp
							});

							$(tmp).find("span").css({ top: 0, left: 0 });

							InitDrag();
							
							InitDrop();
						},
						error: function(xmlhttp) {
						   if(isAjaxSessionTimeOut(xmlhttp)) return;
						}
					});



				}
				else {//group
					if ($(ui.draggable).hasClass("file")) {
						var cid = $(ui.draggable).attr("userid");
					}
					else {
						var cid = $(ui.draggable).attr("id").replace("group", "");
					}
					var oid = $(ui.draggable).parent("li").parent("ul").attr("id").replace("ul-group", "");
					var pid = $(ele).attr("id").replace("group", "");


					var _send_data = {
						id: cid,
						parentId: pid,
						oid: oid,
						name: $(ui.draggable).hasClass("file") ? "1" : "0",
						fn: 4
					}
					
					var tmp = $(ui.draggable).parent("li");
					
					$.ajax({
						url: _url_group_action, //"../../../web/ours/jsp/group.jsp",
						type: "get",
						contentType: "application/json",
						data: _send_data,
						dataType: "json",
						cache: false,
						success: function (data) {
							
							var tmp = $(ui.draggable).parent("li");

							$(ui.draggable).parent("li").siblings(":last").addClass("last")
							$(ui.draggable).parent("li").remove();
							$(ele).siblings("ul").append(tmp);
							$("#browser").treeview({
								add: tmp
							});

							$(tmp).find("span").css({ top: 0, left: 0 });

							InitDrag();
							
							InitDrop();
						},
						error: function(xmlhttp) {
						   if(isAjaxSessionTimeOut(xmlhttp)) return;
						}
					})					
				}
			}
		}
	});
	$(".folder").disableSelection();
}

function InitDrag()
{
	$("#browser .folder").filter(function () {
		return $(this).parent("li").parent("ul").attr("id") && $(this).parent("li").parent("ul").attr("id").indexOf("ul-folder") == 0
	}).draggable({
		revert: function (evt, ui) {
			return !($(evt).hasClass("folder")) || $(evt).parent("li").find(">ul>li>span.file").length > 0
				|| $(this).parent("li").find("li>span.folder").filter(function () {
						return $(this).attr("id") === $(evt).attr("id")
					}).length > 0
		},
		start: function( event, ui ) {
			DeleteMenu();
		},
		stop: function( event, ui ) {
			CreateMenu();
		}
	}); 

	$("#grouptree .folder").filter(function () {
		return $(this).parent("li").parent("ul").attr("id") && $(this).parent("li").parent("ul").attr("id").indexOf("ul-group") == 0
	}).draggable({
		revert: function (evt, ui) {
			return !($(evt).hasClass("folder")) || $(evt).parent("li").find(">ul>li>span.file").length > 0
				|| $(this).parent("li").find("li>span.folder").filter(function () {
						return $(this).attr("id") === $(evt).attr("id")
					}).length > 0
		},
		start: function( event, ui ) {
			DeleteMenu();
		},
		stop: function( event, ui ) {
			CreateMenu();
		}
	});

	$("#browser .file").draggable({
		revert: function (evt, ui) {
			return !($(evt).hasClass('folder')) || $(evt).parent("li").find(">ul>li>span.folder").length > 0
					|| $(evt).parent("li").find("ul>li>span.file").filter(function () {
						return $(this).attr("exerciseid") === $(this).attr("exerciseid")
					}).length > 0
		}
	});

	$("#grouptree .file").draggable({
		revert: function (evt, ui) {
			return !($(evt).hasClass('folder')) || $(evt).parent("li").find(">ul>li>span.folder").length > 0
					|| $(evt).parent("li").find("ul>li>span.file").filter(function () {
						return $(this).attr("userid") === $(this).attr("userid")
					}).length > 0
		}
	});
}

function check_shared() {
	var lis = $('#sharedfolder li');
	if (lis.length == 0) return;
	
	var folderids = '';
	for ( var i = 0; i < lis.length; i++) {
		var item = lis[i];
		var folderid = item.getAttribute('folderid').replace(prefix_folder, '');
		folderids += folderid + ";";
	}

	folderids = folderids.replace(/,$/, "");
	var data = {
		lfd : folderids,
		userId : _t_user_id,
		fn : -1
	}
	if (data.lfd) {
	   ajaxLoader("show");//disablebtn_shared();
		$.ajax({
					url : url_shared,
					type : "get",
					data : data,
					success : function(data, textStatus, xmlhttp) {
		            if(isAjaxSessionTimeOut(xmlhttp)) return;
						if (data) {
							clear_select();
							$('#sharedgroup').empty();
							var listshared = [];
							for ( var i = 0; i < data.length; i++) {
								var item = data[i];
								var userid = item.userId;
								var groupid = item.groupId;
								var shared = _.find(listshared, function(item) {
									return item.groupId == groupid
											&& item.userId == userid;
								});
								if (!shared) {
									if (userid != "-1") {
									   var users = group_users.filter(
									         function (item) {
									            return item.userId == userid;
									         }
									     );
									   /*
										var user = _
												.find(
														group_users,
														function(item) {
															return item.userId == userid;
														});
														*/
										if (users.length>0) {
											var li2 = '<li onclick="removeSelect(this)" id="g'
													+ prefix_group
													+ users[0].id
													+ '" class="cursor sharedlist" groupid="'
													+ groupid
													+ '"  userid="'
													+ users[0].userId
													+ '"><span >'+class_icon_user
													+ users[0].username
													+ '</span></li>';
											$('#sharedgroup').append(li2);
											for ( var j = 0; j < users.length; j++)
											   expand_group('group' + users[j].id);
										}

									} else {
										var groupName = item.groupName;
										var li2 = '<li onclick="removeSelect(this)" id="g'
												+ prefix_group
												+ groupid
												+ '" class="cursor sharedlist" groupid="'
												+ groupid
												+ '"  userid="'
												+ "-1"
												+ '"><span >' + class_icon_th_list
												+ groupName + '</span></li>';
										$('#sharedgroup').append(li2);
										expand_group('group' + groupid);

									}
									listshared.push(item);
								}

							}//for
							ajaxLoader("hidden");//enablebtn_shared();
						}
					},
					error: function(jqXHR, textStatus, errorThrown) {
					   ajaxLoader("hidden");//enablebtn_shared();
					}
				});
	}//if
}

function clear_select() {
	$('#grouptree span.selected').removeClass('selected');
}

function expand_group(id) {

	$('#' + id).addClass('selected');
	var parents = $('#' + id).parents();
	for ( var i = 0; i < parents.length; i++) {
		var parent = parents[i];
		if (parent.id == 'grouptree') {
			$('#grouptree li:first').removeClass('expandable lastExpandable')
					.addClass('collapsable lastCollapsable');
			return;
		} else if (parent.tagName == "UL" || parent.tagName == "ul") {
			$('#' + parent.id).css('display', 'block');
			$('#' + parent.id).parent().find('>div').removeClass(
					'expandable-hitarea').addClass('collapsable-hitarea');
			$('#' + parent.id).parent().removeClass('expandable').addClass(
					'collapsable');
		}
	}
}

function expand_folder(id) {

	$('#' + id).addClass('selected');
	var parents = $('#' + id).parents();
	for ( var i = 0; i < parents.length; i++) {
		var parent = parents[i];
		if (parent.id == 'grouptree'|| parent.id == 'browser') {
			$('#grouptree li:first').removeClass('expandable lastExpandable')
					.addClass('collapsable lastCollapsable');
			return;
		} else if (parent.tagName == "UL" || parent.tagName == "ul") {
			$('#' + parent.id).css('display', 'block');
			$('#' + parent.id).parent().find('>div').removeClass(
					'expandable-hitarea').addClass('collapsable-hitarea');
			$('#' + parent.id).parent().removeClass('expandable').addClass(
					'collapsable');
		}
	}

}

function save_share() {
	var lis = $('#sharedfolder li');
	var folderids = '';
	var fexerids = '';
	var t = "-1";
	var foldershared = [];
	var groupshared = [];
	for ( var i = 0; i < lis.length; i++) {
		var item = lis[i];
		//var exerid = item.getAttribute('exerid');
		var folderid = item.getAttribute('folderid').replace(prefix_folder, '');
		var id = item.id;
		var name = item.textContent;
	   folderids += folderid + ";";
		foldershared.push({
			id : id,
			exerid : t,
			folderid : folderid,
			name : name
		});
	}//for each of lis

	folderids = folderids.replace(/;$/, "");
	lis = $('#sharedgroup li');

	for ( var i = 0; i < lis.length; i++) {
		var item = lis[i];
		var userid = item.getAttribute('userid');
		var groupid = item.getAttribute('groupid').replace(prefix_group, '');
		var id = item.id;
		var name = item.textContent;
		if (userid > 0) {
		   fexerids += t + "," + userid + ";";
			groupshared.push({
				id : id,
				userid : userid,
				groupid : groupid,
				name : name
			});
		} else {
			fexerids += groupid + ',' + t + ";";
			groupshared.push({
				id : id,
				userid : t,
				groupid : groupid,
				name : name
			});
		}
	}
	fexerids = fexerids.replace(/;$/, "");

	var data = {
		lfd : folderids,
		lgu : fexerids,
		userId : _t_user_id,
		fn : 0
	}
	if (data.lfd && data.lgu) {
	   ajaxLoader("show");//disablebtn_shared();
		$.ajax({
					url : url_shared,
					type : "get",
					data : data,
					success : function(data, textStatus, xmlhttp) {
					   if(isAjaxSessionTimeOut(xmlhttp)) return;
						if (data) {
							var error = '';
							var exists = '';
							var success = '';
							_
									.each(
											data,
											function(item) {
												var exerid = item.exerciseId;
												var folderid = item.folderId;
												var userid = item.userId;
												var groupid = item.groupId;

												var group = _
												      .find(
																groupshared,
																function(group) {
																   if(groupid==-1) 
																      return group.userid == userid;
																   else
																      return group.userid == userid
																			&& group.groupid == groupid;
																});

												var folder = _
														.find(
																foldershared,
																function(folder) {
																	return folder.exerid == exerid
																			&& folder.folderid == folderid;
																});
												if (item.id == 0) {
													if (exists == '') {
														exists += '<li style="color:#49AFCD"><b>Existing shares</b></li>';
													}
													exists += '<li style="color:orange">'
															+ folder.name
															+ '<-->'
															+ group.name
															+ '</li>'
												}

												if (item.id == -1) {
													if (error == '') {
														error += '<li style="color:#49AFCD"><b>Failed to save</b></li>';
													}
													error += '<li style="color:red">'
															+ folder.name
															+ '<-->'
															+ group.name
															+ '</li>'
												}

												if (item.id > 0) {
													if (success == '') {
														success += '<li style="color:#49AFCD"><b>Successfully saved</b></li>';
													}
													success += '<li style="color:green">'
															+ folder.name
															+ '<-->'
															+ group.name
															+ '</li>'
												}

											})
							$('#' + 'listsave').empty();
							var height = $(window).height() / 2;
							var css = {
								height : height + 'px',
								overflowY : 'auto',
								overflowX : 'hidden'
							};
							$('#' + 'listsave')
									.append(error + exists + success);
							$('#' + 'listsave').css(css);
							$('#' + 'myModal').reveal($(this).data());
							ajaxLoader("hidden");//enablebtn_shared();
						} else {
						   ajaxLoader("hidden");//enablebtn_shared();
						}
					}
				});
	}

}

function fixed_size() {
	var height = $(window).height();
	var up = height / 2;
	$('#browser').css('height', up + 'px');
	$('#grouptree').css('height', up + 'px');
	
	var scroll = {
		overflowX : 'hidden',
		overflowY : 'auto'
	};
	
	$('#browser').css(scroll);
	$('#grouptree').css(scroll);
	$('#div-push-shared').css('height', height + 'px');
	$('#btnShared').css('marginTop', up + 'px');

	$('#sharedfolder').css('height', up + 'px');
	$('#sharedgroup').css('height', up + 'px');

	$('#sharedfolder').css(scroll);
	$('#sharedgroup').css(scroll);
	var drs_width = $('#div-right-shared').width();
	var btshared = $('#btnShared').width();
	//alert(btshared);
	$('#div-push-shared').css('width', (btshared+31) + 'px');
	$('#wrap-guser-shared').css('width', (drs_width-btshared-35) + 'px');
}
/*
function disablebtn_shared() {
	$('#btnShared').attr("disabled", "disabled");//
	$('#btnShared').addClass('disabled');
	$('#btnSave').attr("disabled", "disabled");
	$('#btnSave').addClass('disabled');
	$('#btnDelete').attr("disabled", "disabled");
	$('#btnDelete').addClass('disabled');
}

function enablebtn_shared() {
	$('#btnShared').removeAttr("disabled");
	$('#btnShared').removeClass('disabled');

	$('#btnSave').removeAttr("disabled");
	$('#btnSave').removeClass('disabled');
	
	$('#btnDelete').removeAttr("disabled");
	$('#btnDelete').removeClass('disabled');

}
*/
function findObject(collection, id)
{
 var object = _.find(collection,function(item){
	 return item.id == id;
 })	
 return object;
}

function CreateMenu()
{
	$("body").contextmenu({
		delegate: ".folder",
		menu: "#options",
//        position: {my: "left top", at: "left bottom"},
		position: function(event, ui){
			return {my: "left top", at: "left bottom", of: ui.target};
		},
		preventSelect: true,
		taphold: true,
		show: { effect: "fold", duration: "slow"},
		hide: { effect: "explode", duration: "slow" },
		focus: function(event, ui) {
			var menuId = ui.item.find(">a").attr("href");
			$("#info").text("focus " + menuId);
		},
		blur: function(event, ui) {
			$("#info").text("");
		},
		beforeOpen: function(event, ui) {
//			$("#container").contextmenu("replaceMenu", "#options2");
//			$("#container").contextmenu("replaceMenu", [{title: "aaa"}, {title: "bbb"}]);
		},
		open: function(event, ui) {

		},
		select: function(event, ui) {
		action_context(event,ui);
		}
	});
}

function DeleteMenu()
{
	$("body").contextmenu("destroy")
}
//================================
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
// ================================
function help(){
   $("#dialog-help").dialog("open");
}
function removeSelect(obj){
   var liId = obj.getAttribute("id");
   if(liId.startsWith('ggroup')){
      var userid = obj.getAttribute("userid");
      if(userid == -1 || userid == ""){
         liId = liId.substring(1);
         $("#"+liId).click();
         $('#options-right').css("display","none");
      }
      else{
         var users = $('span[userid=\"'+userid+'\"]');
         for ( var j = 0; j < users.length; j++){
            var node =$("#"+users[j].id);
            if(node.hasClass("selected")) node.click();
         }
      }
   }else if(liId.startsWith('ffolder')){
      liId = liId.substring(1);
      $("#"+liId).click();
      $('#options-left').css("display","none");
   }
}
$(document).ready(
		function() {
			
		CreateMenu();
	
//	$('#group6').click(function(event) { alert('hi'); }); /* Act on the event */
        $(window).resize(function() { fixed_size(); });
			fixed_size();
			$("#main").css({
				height : $(window).height() - 30
			});
			reSet();
			loadTree(init_folder.url_action, _init_data, init_folder.tag,
					init_folder, dtree_folder);
			loadTree(init_group.url_action, _init_data, init_group.tag,
					init_group, dtree_group);
			
			$(function() {
				$("#dialog-form").dialog({
					autoOpen : false,
					height : 280,
					width : 350,
					modal : true,
					buttons : {
						Save : function() {
							var b_valid = true;
							b_valid = b_valid && checkVal(_current_tag);
							b_valid = b_valid && checkVal($("#name").val());
							b_valid = b_valid && checkVal($("#des").val());
							if (b_valid) {
								switch (_t_valid) {
								case "new":
									addNew();
									reSet();
									break;
								case "edit":
									upDate();
									reSet();
									$(this).dialog("close");
									break;
								}
							}
						},
						Cancel : function() {
							reSet();
							$(this).dialog("close");
						}
					},
					close : function() {
						reSet();
					}
				});
				
				$("#dialog-panel").dialog({
					autoOpen : false,
					height : .8* $(window).height(),
					width : .8* $(window).width(),
					modal : true,
					close : function() {
						reSet();
					}
				});
				$("#dialog-help").dialog({
               autoOpen : false,
               height : .8* $(window).height(),
               width: 640,
               modal : true,
            });
				
				$( "#dialog-confirm" ).dialog({
					autoOpen : false,
				      resizable: false,
				      height:150,
				      modal: true,
				      buttons: {
				        "Delete Item": function() {
				        	switch (_current_prefix) {
				    		case init_folder.parent_prefix:
				    			delete_item(init_folder.url_action ,init_folder.tag, dtree_folder,_current_tag);
				    			$( this ).dialog( "close" );
				    			break;
				    		case init_group.parent_prefix:
				    			delete_item(init_group.url_action,init_group.tag, dtree_group,_current_tag);
				    			$( this ).dialog( "close" );
				    			break;
				    		case 'deleteall':
				    			delete_all_shared();
				    			$( this ).dialog( "close" );
				    		}
				        },
				        Cancel: function() {
				          $( this ).dialog( "close" );
				        }
				      }
				    });
				
				$("#new").button().click(function() {
					//TODO:
				var current = 	_current_tag;
					_t_valid = "new";
					$(".ui-dialog-title").text("Create new item");
					$("#dialog-form").dialog("open");
				});
				$("#edit").button().click(function() {
					_t_valid = "edit";

					$(".ui-dialog-title").text("Edit item");
					var _temp_current = _current_tag.replace("folder", "");
					var _index = findValue(_temp_current, jSons);
					if (_index != -1) {
						$("#name").val(jSons[_index].name);
						$("#des").val(jSons[_index].description)
					}
					$("#dialog-form").dialog("open");
				});
				$("#delete").button().click(
						function() {
							$("#browser").treeview(
									{
										remove : $("#" + _current_tag).parents(
												"li").filter(":first")
									});
							var _temp_current = _current_tag.replace("folder",
									"");
							var _index = findValue(_temp_current, jSons);
							if (_index != -1) {
								var _send_data = {
									id : jSons[_index].id,
									userId : _t_user_id,
									fn : 2
								}
								loadTree(_url, _send_data);
								jSons.splice(_index, 1);
								_current_tag = "";
							}
						});
			});
			$(window).scrollTop(0);	
		});

	
