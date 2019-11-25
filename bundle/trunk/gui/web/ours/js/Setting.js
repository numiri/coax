//phan nay cua SettingsMenu//

//template for setting jquery mobile


SettingsMenu.tree ={};
Editor.SettingSkip = '';//it can be either each value of Editor.SkipValues or a combination of those
Editor.ExerciseSkip = '';
Editor.SkipValues = {'Corx':',corx', 'Light':',showlight', 'Rex':',rex'};
function SettingsMenu() {}
SettingsMenu.SettingValues = new Array();
SettingsMenu.initialize = function(id_user, user_name) {
   /*
   _.each(Editor.SkipValues,function(item) {
      Editor.SettingSkip += item; 
      // saving in db is skip, the opposite of the value display on settings page (ON)  
   });*/
   Editor.SettingSkip = Editor.SkipValues.Corx;
   
	SettingsMenu.close_button = document.getElementById("st_close_button");
	SettingsMenu.close_button
			.addEventListener("click", SettingsMenu.hide, true);

	SettingsMenu.touch_start_position = null;
	SettingsMenu.current_Y = 0;
	SettingsMenu.div_moving = false;
	SettingsMenu.div_speed = 0;
	SettingsMenu.touchend_time;
	SettingsMenu.touch_moving = false;
	SettingsMenu.user = id_user;
	SettingsMenu.mode = null;

	console.log("userid: " + SettingsMenu.user);
	SettingsMenu.menu = document.getElementById("settings_menu");
	SettingsMenu.label = document.getElementById("st_node_label");

	SettingsMenu.current_list = document.getElementById("st_category_list");
	SettingsMenu.current_grid = document.getElementById("st_symbol_grid");
	SettingsMenu.center_panel = document.getElementById("st_center");

	SettingsMenu.offset = 0;

	if (Editor.using_mobile) {
		SettingsMenu.current_list.addEventListener("touchstart",
				SettingsMenu.touchstart, true);
		SettingsMenu.current_list.addEventListener("touchmove",
				SettingsMenu.touchmove, true);
		SettingsMenu.current_list.addEventListener("touchend",
				SettingsMenu.touchend, true);

		SettingsMenu.current_grid.addEventListener("touchstart",
				SettingsMenu.touchstart, true);
		SettingsMenu.current_grid.addEventListener("touchmove",
				SettingsMenu.touchmove, true);
		SettingsMenu.current_grid.addEventListener("touchend",
				SettingsMenu.touchend, true);
	}
	SettingsMenu.BuildSetting();
	//g209 SettingsMenu.onlyButton();
}
//g209 SettingsMenu.onlyButton = function()						                  {
SettingsMenu.onlyButton = function(data)                                      {//g209
//g209 	$.when(get_setting()).done(function(get_setting)						  {
//g209 		var setttings =  SymbolTree.parseXml(get_setting);
 //g209    	var data = setttings.root.children;
    	for ( var i = 0; i < data.length; i++) {
    		var item = data[i];
    		var category = item.category;
    		
    		switch (category) {
    		case "Buttons":
    			for(var j=0;j<item.children.length;j++){
    				var item2 = item.children[j];
    				var id_setting = item2.id;
    				_.each(toolbars,function(button){
    					if(button.id ==item2.name){
						var display = item2.defaultvalue?"block":"none";
						$('#'+item2.name).parent().css('display',display);
						//if(display=="block") $('#more-'+item2.name).css('display', "none"); // for buttons set hidden in setting page displaying on more menu
						return button.display = display;
    					}
    				});
    			}
    			UpdateDisplay('','');
    			break;
    		}
    	}
//g209 	});
}

/*
 * lay setting theo cach moi
 */
function get_setting(){
    var d = $.Deferred();
    var sb = new StringBuilder();
	sb.append(Editor.url_setting);
    $.ajax({url:sb}).done(function(p){
        d.resolve(p);
    }).fail(d.reject); 
    return d.promise();
}
/*
 * lay theme theo cach moi
 */
function get_theme(){
    var d = $.Deferred();
    //FIXME: su dung tam de lam tiep, can sua lai khi chuong trinh da lam xong!
    $.get(Editor.theme_server_url).done(function(a){
        d.resolve(a);
    }).fail(d.reject); 
    return d.promise();
}

/*
 * {"root":"buttons"{[]}}
 * 
 * 
 */
//FIXME: thu tu cac thanh phan trong setting, tieu de cua cac set can chinh trong code server
//slider:co structure {id:day la id cua buttuon, value://gia tri cua slider}
var slider_refresh = [];//mang de chua object co dang {id://id cua button slider, value: gia tri cua slider on}
var list_style = new Array();
var index_style = 0;
SettingsMenu.BuildSetting = function() {	
	list_style = new Array();
	$.when(get_setting(),get_theme())
    .done(function(get_setting,get_theme){
    	//var li_html = '';
    	var current_style={};
    	
    	var buttons =
		'<ul data-role="listview" data-inset="true" id="buttons">' 
		+'<% _.each(children, function(item) { %> ' 
		+'<li> '
	    +'<fieldset class="ui-grid-a">'
	    +      '<div class="ui-block-a title-l">  <b> <%=item.symbol %></b></div>'
	    +       '<div class="ui-block-b title-r" onclick="<%=item.functionName%>(this)">' 
	    +           '<input type="checkbox" name="copy" targetid ="<%=item.name%>" '
	    +'<%if($.browser.webkit)%>'
	    +'<%{%>'
	    +	'style="width: 17px;height: 17px;"'
	    +'<%}%>'
	    +			'onclick="<%=item.functionName%><%=item.type%>(this)" id="<%=item.id%>" '
		+			'<%if (item.value != "") {%>'
		+				'<%var value2 = GetSettingValueById(item.id)==null?item.defaultvalue: GetSettingValueById(item.id); %>'
		+				'<%if (value2 == false) {%>'
		+				'<%} else {%>'
		+				'checked="<%=value2%>"'
		+			'<%}%>'
		+		'<%}%>'
	    +		'/>'
	    +       '</div>'	   
	    +  '</fieldset>'
	    + '</li>'
		+	" <% }); %></ul>";
      var gesture =
         "<% _.each(children, function(item) { %> " 
         +'<li>'
         +'<fieldset  class="ui-grid-a ui-body-d ui-corner-all">'
            +'<div class="ui-block-a title-a" > <b><%=item.category%></b></div>'
            +'<div class="ui-block-b title-b"> '
            +'<% if(item.children[0].defaultvalue=="del") item.children[0].defaultvalue="";%>'
            +'<% var value= GetSettingValueById(item.id)==null?item.children[0].defaultvalue: GetSettingValueById(item.children[0].id)%>'
            +'<% slider_refresh.push({id:item.children[0].nameTag,value:value});%>'
            +   '<select style="width: 80px;" name="<%=item.id %>"  data-mini="true"  data-role="slider" onchange="SliderSetting('
            +  '\'<%=item.children[0].nameTag%>\',\'{\\\'off\\\':\\\'<%=item.children[1].id%>\\\',\\\'on\\\':\\\'<%=item.children[0].id%>\\\'}\');"'
            +  ' id="<%=item.children[0].nameTag%>">'
            +     '<option value="off" <% if(item.children[0].defaultvalue=="del" && item.children[0].nameTag=="OneTouch") {%>selected<%}%>>Off</option>'
            +     '<option value="on">On</option>'
            +    '</select>'
            +'</div>'      
         +'</fieldset>'
          + '</li>'
         +" <% }); %>";
    	
    	/*
    	var gesture =
    		'<ul data-role="listview" data-inset="true" id="gestures">'+ 
			"<% _.each(children, function(item) { %> " 
		 	+'<li>'
		 	+'<fieldset  class="ui-grid-a ui-body-d ui-corner-all">'
            +'<div class="ui-block-a title-a" > <b><%=item.category%></b></div>'
            +'<div class="ui-block-b title-b"> '
            +'<% var value= GetSettingValueById(item.id)==null?item.children[0].defaultvalue: GetSettingValueById(item.children[0].id)%>'
            +'<% slider_refresh.push({id:item.children[0].nameTag,value:value});%>'
            +   '<select name="<%=item.id %>"  data-mini="true"  data-role="slider" '
            +	'onchange="SliderSetting('
            +	'\'<%=item.children[0].nameTag%>\',\'{\\\'off\\\':\\\'<%=item.children[1].id%>\\\',\\\'on\\\':\\\'<%=item.children[0].id%>\\\'}\');"'
            +	' id="<%=item.children[0].nameTag%>">'
    		+     '<option value="off">Off</option>'
            +     '<option value="on">On</option>'
            +    '</select>'
            +'</div>'	   
		 	+'</fieldset>'
		    + '</li>'
			+" <% }); %></ul>";
    	//static
    	var layout = '<fieldset class="ui-grid-a ui-body-d ui-corner-all" id="writing">'
                     +   '<div class="ui-block-a title-a"> <b> alt button placement</b></div>'
                     +   '<div class="ui-block-b title-b"> '
                     +       '<select name="alt" onchange="SliderSetting(\'alt\',\'{\\\'off\\\':\\\'left\\\',\\\'on\\\':\\\'right\\\'}\');" '
                     +		 ' data-mini="true" id="alt" data-role="slider">'
                     +          '<option value="off">Left</option>'
                     +           '<option value="on">Right</option>'
                     +       '</select>'
                     +   '</div>'	   
                     +'</fieldset>';
    	
    	var style='<% _.each(themes, function(item,index) { %> '
    				+'<%list_style.push(new objStyle(item.id, item.background, item.strokeColor)); %>'
    				+'<option value="<%=item.id%>">Template <%=index%> - <%=item.name%></option>'
    				+' <% }); %>';
    	*/
      var layout = '<li><fieldset class="ui-grid-a ui-body-d ui-corner-all">'
         +   '<div class="ui-block-a title-a"> <b> alt button placement</b></div>'
         +   '<div class="ui-block-b title-b"> '
         +       '<select style="width: 80px;" name="alt" onchange="SliderSetting(\'alt\',\'{\\\'off\\\':\\\'left\\\',\\\'on\\\':\\\'right\\\'}\');" '
         +      ' data-mini="true" id="alt" data-role="slider">'
         +          '<option value="off">Left</option>'
         +          '<option value="on">Right</option>'
         +       '</select>'
         +   '</div>'      
         +'</fieldset></li>';
      var style = '<% _.each(themes, function(item,index) { %> '
         +          '<%list_style.push(new objStyle(item.id, item.background, item.strokeColor)); %>'
         +          '<option value="<%=item.id%>">Template <%=index%> - <%=item.name%></option>'
         +         '<% }); %>';

      var setttings =  SymbolTree.parseXml(get_setting);
      if(setttings == undefined){
         alert("There is a problem with getting configuration. The page needs to be reloaded.");
         var href = window.location.href;
         window.location.href = href;
         return;
      }
    	var data = setttings.root.children;
    	
    	SettingsMenu.onlyButton(data);//g209
    	SettingsMenu.tree = setttings.root.children;
    	var buttons_html = '<p>Buttons</p>';
    	var other_html = '<p>Other</p><ul data-role="listview" data-inset="true" id="gestures">';
      
    	for ( var i = 0; i < data.length; i++) {
    		var item = data[i];
    		var category = item.category;
    		switch (category) {
    		case "Buttons":
    		  buttons_html +=	_.template(buttons,{"children": item.children});
    		  break;
    			
    		case "Style":
    			var theme = item.children[0];
    			other_html +='<li><fieldset class="ui-grid-a ui-body-d ui-corner-all">';
    			other_html +='<div class="ui-block-a title-a"> <b> Style</b></div>';
    			other_html +='<div class="ui-block-b title-b"> ';
            other_html +='<select on'+theme.event+'="'+theme.functionName +theme.type +'(this);"  id="'+theme.id+'">';
            other_html +=  _.template(style,{"themes":JSON.parse(get_theme)});
            other_html +='</select>';
            other_html +='</div>';      
            other_html +='</fieldset></li>';
    			current_style.index=theme.defaultvalue;
    			current_style.id=theme.id;    			
    			break;	    			

    		case "Layouts":
    		  other_html +=	layout;
    			var value= GetSettingValueById(item.id)==null?item.children[0].defaultvalue: GetSettingValueById(item.children[0].id)
    			slider_refresh.push({id:'alt',value:value});
    			if(item.children[0].id == 'right' && value != 'true') ResizeTo.Layout('left');
    			break;
    		case "Gestures":
    		  other_html +=	_.template(gesture,{"children": item.children});
    			break;
    		}
    	}
    	other_html += '</ul>';
    	$('#page-setting-content').empty();
    	$('#page-setting-content').append(buttons_html + other_html);
    	if(current_style.index){
    		try{
    			$('#'+current_style.id).val(current_style.index);
    			$('#'+current_style.id).selectmenu('refresh');

    		}catch (e){
    			console.log('SettingsMenu.BuildSetting:' + current_style.id);
			}
    	}
    	for(var i =0;i<slider_refresh.length;i++){
    		var item = slider_refresh[i];
    		var selectedValue = 'off';
 			if(item.value) selectedValue = 'on';
 			try{
            $('#'+item.id).val(selectedValue).slider('refresh');
         }catch (e) {
            console.log('SettingsMenu.BuildSetting:' + item.id + " e:"+e);
         }
    	}
    	SkipCorxUIDisplay();
    });

}
/*
SettingsMenu.BuildCheckbox = function(children)                               {
   var str = "";
   for ( var j = 0; j < children.length; j++)                                 {
      var item2 = children[j];
	  var sb = new StringBuilder();
         sb.append("<" + item2.tag + " ");
         sb.append("type = \"" + item2.type + "\" ");
         sb.append("targetid = \"" + item2.name + "\" ");
         sb.append("id = \"" + item2.id + "\" ");
		if (item2.value != "")                                                {
			var value = GetSettingValueById(item2.id) == null ? item2
            .   defaultvalue : GetSettingValueById(item2.id);
			if (value == false) {}
			else {sb.append(item2.value + " = \"" + value + "\" ");          }}
		sb.append("name = \"" + item2.nameTag + "\" ");
		sb.append("style = \"" + item2.css + "\" ");
		sb.append("on" + item2.event + "=\"" + item2.functionName + item2.type
		+    "(this);\" ");
		sb.append(">");
		sb.append("</" + item2.tag + " >");
		var label = '<label for="' + item2.id + '">' + item2.symbol
		+   '</label>'
		sb.append(label);
		str += sb.toString();                                                 }
	return str;                                                               }

*/
SettingsMenu.loadInfo = function(id_setting, value_setting) {
	switch (id_setting) {
	case "shGraph":
	   if(value_setting == 'true') document.getElementById("graph").style.display = "block";
	   else document.getElementById("graph").style.display = "none";
		break;
	case "shAuthor": // sn130312 start - author
	   if(value_setting == 'true') document.getElementById("author").style.display = "block";
	   else document.getElementById("author").style.display = "none";
		break; // sn130312 end
	case "shUndo":
	   document.getElementById("undo").style.display = "block";
		break;
	case "shLabel":
	   if(value_setting == 'true') document.getElementById("relabel").style.display = "block";
	   else document.getElementById("relabel").style.display = "none";
		break;
	case "shRedo":
	   if(value_setting == 'true') document.getElementById("redo").style.display = "block";
	   else document.getElementById("redo").style.display = "none";
		break;
	case "shClear":
		document.getElementById("clear").style.display = "block";
		break;
	case "shSubmit":
		document.getElementById("align").style.display = "block";
		break;
	case "shCommand":
		document.getElementById("rectangle_select").style.display = "block";
		break;
	case "shGroup":
	   if(value_setting == 'true') document.getElementById("group").style.display = "block";
	   else document.getElementById("group").style.display = "none";
		break;
	case "shGetInkML":
		document.getElementById("getInkML").style.display = "block";
		break;
	case "shStroke":
		document.getElementById("stroke_select").style.display = "block";
		break;
	case "shKboard":
	   if(value_setting == 'true') document.getElementById("kboard").style.display = "block";
	   else document.getElementById("kboard").style.display = "none";
		break;
	case "shPaste":
	   if(value_setting == 'true') document.getElementById("paste").style.display = "block";
	   else document.getElementById("paste").style.display = "none";
		break;
	case "shCopy":
	   if(value_setting == 'true') document.getElementById("copy").style.display = "block";
	   else document.getElementById("copy").style.display = "none";
		break;
	case "left":
		ResizeTo.Layout("left");
		break;
	case "right":
		ResizeTo.Layout("right");
		break;
	case "stroketrue":
		Editor.set_color = true;
		break;
	case "strokefalse":
	   if(value_setting == 'true') Editor.set_color = false;
		break;
	case "auto1true":
	   if(value_setting == 'true') Editor.interior = true;
		break;
	case "auto1false":
		Editor.interior = false;
		break;
	case "autotrue":
	   if(value_setting == 'true') Editor.extend = true;
		break;
	case "autofalse":
		Editor.extend = false;
		break;

	case "showsymboltrue":
	   if(value_setting == 'true') Editor.show_symbol = true;
		break;
	case "showsymbolfalse":
	   if(value_setting == 'false') Editor.show_symbol = false;
		break;

   case "skipcorxfalse":
      var re = new RegExp(Editor.SkipValues.Corx,"g");
      Editor.SettingSkip = Editor.SettingSkip.replace(re,'');
      break;
   case "OneTouchtrue":
      if(value_setting == 'true') Editor.OneTouch = true;
      break;
	case "crssHeight":
		Editor.height = parseInt(value_setting);
		break;
	case "crssWidth":
		Editor.width = parseInt(value_setting);
		break;
	case "themes":
		//buildList(null, value_setting);
		break;

	default:
		break;
	}
}

// <<<<< send softcode to server
SettingsMenu.postServer = function() {
	//debugger;
	var sb = new StringBuilder();
	sb.append(Editor.url_setting);
	sb.append("?setting=<Root id = \"" + SettingsMenu.user + "\">");
	for ( var i = 0; i < SettingsMenu.SettingValues.length; i++) {
		sb.append("<Symbol id = \"" + SettingsMenu.SettingValues[i].item1
				+ "\" default = \"" + SettingsMenu.SettingValues[i].item2
				+ "\">");
		sb.append("</Symbol>");
	}
	sb.append("</Root>");
	$.ajax({
		type : "GET",
		url : String(sb),
		success : function(in_data, textStatus, xmlhttp) {
		   isAjaxSessionTimeOut(xmlhttp);
		}
	});
}

SettingsMenu.hide = function() {

	// Editor.state = EditorState.SegmentsSelected;
	// if (Editor.selection_method == "Stroke") Editor.strokeSelectionTool();
	// else
	Editor.clearButtonOverlays();
	Editor.rectangleSelectionTool();
	SettingsMenu.menu.style.display = "none";
	SettingsMenu.postServer();
}

SettingsMenu.show = function() {
	window.location.href ="#page-setting";
	
	return false;
	
}

SettingsMenu.populateCategoryList = function(list_div, node, start_index) {

	var child_nodes = node.children;
	var node_index = start_index;
	if (SettingsMenu.setting_tree.current.children_type == NodeType.Category) {
		var child_divs = list_div.childNodes;
		while (child_divs.length > 0)
			list_div.removeChild(child_divs.item(0));

		// add each category node
		for ( var k = 0; k < child_nodes.length; k++) {
			if (child_nodes[k] != undefined) {
				var div = document.createElement("div");
				div.className = "category_row button";
				div.innerHTML = child_nodes[k].category;
				div.addEventListener("click", SettingsMenu.select_category,
						true);
				div.style.lineHeight = SettingsMenu.center_panel.clientHeight/ 5 + "px";
				SettingsMenu.current_list.appendChild(div);
			}
		}

		SettingsMenu.label.innerHTML = SettingsMenu.build_title_html();
		if (SettingsMenu.setting_tree.current != SettingsMenu.setting_tree.root) {
			SettingsMenu.up.innerHTML = "Up ("
					+ SettingsMenu.setting_tree.current.parent.category + ")";
			// console.log(SettingsMenu.up.innerHTML);
		} else
			SettingsMenu.up.innerHTML = "";

		if (Editor.using_mobile) {
			SettingsMenu.current_list.style.setProperty('-webkit-transform',
					'translate3d(0px,0px,0px)', null);
			SettingsMenu.current_Y = 0;
		}
	}
}

SettingsMenu.build_title_html = function() {

	var node = SettingsMenu.setting_tree.current;
	var node_names = new Array();

	do {

		node_names.unshift(node.category);
		node = node.parent;
	} while (node != null);

	var sb = new StringBuilder();
	for ( var k = 0; k < node_names.length; k++) {
		sb.append("<span class=\"rr_node button\" onclick=\"SettingsMenu_up(")
				.append(node_names.length - 1 - k).append(");\">").append(
						node_names[k]).append("</span>");
		if (k != node_names.length - 1)
			// sb.append(" · ");
			// sb.append(" \u2023 "); // arrow bullet
			sb.append("<span class=\"rr_node_delimiter\">  \u25b7  </span>");

	}

	// console.log(sb.toString());
	return sb.toString();
}

SettingsMenu.up = function(node_count) {
	if (SettingsMenu.setting_tree.current.parent != null) {
		if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
			SettingsMenu.center_panel.removeChild(SettingsMenu.current_grid);
			SettingsMenu.center_panel.appendChild(SettingsMenu.current_list);
		}
		SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.current.parent;
		SettingsMenu.populateCategoryList(SettingsMenu.current_list,
				SettingsMenu.setting_tree.current, 0);
	}

	return;
}

SettingsMenu_up = function(node_count) {
	if (node_count == 0)
		return;

	if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
		SettingsMenu.center_panel.removeChild(SettingsMenu.current_grid);
		SettingsMenu.center_panel.appendChild(SettingsMenu.current_list);
	}

	for ( var k = 0; k < node_count; k++) {
		SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.current.parent;
	}
	SettingsMenu.populateCategoryList(SettingsMenu.current_list,
			SettingsMenu.setting_tree.current, 0);
}

SettingsMenu.select_category = function(e) {
	// console.log("selecting category");
	if (SettingsMenu.touch_moving == true)
		return;
	// TODO: buil cac nut cap 2
	var category = e.currentTarget.innerHTML;
	// console.log(category);
	// figure out new current
	for ( var k = 0; k < SettingsMenu.setting_tree.current.children.length; k++) {
		if (SettingsMenu.setting_tree.current.children[k] != undefined) {
			if (SettingsMenu.setting_tree.current.children[k].category == category) {
				SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.current.children[k]
				break;
			}
		}
	}
	if (SettingsMenu.setting_tree != undefined) {
		if (SettingsMenu.setting_tree.current.children_type == NodeType.Category)
			SettingsMenu.populateCategoryList(SettingsMenu.current_list,
					SettingsMenu.setting_tree.current, 0);
		else if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
			SettingsMenu.populateSymbolGrid(SettingsMenu.current_grid,
					SettingsMenu.setting_tree.current, 0);
			SettingsMenu.center_panel.removeChild(SettingsMenu.current_list);
			SettingsMenu.center_panel.appendChild(SettingsMenu.current_grid);
		}
	}

}

SettingsMenu.populateSymbolGrid = function(grid_div, node, start_index) {
	var child_nodes = node.children;
	var node_index = start_index;
	debugger;
	if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
		var child_divs = grid_div.childNodes;
		while (child_divs.length > 0)
			grid_div.removeChild(child_divs.item(0));

		// add each cell node
		for ( var k = 0; k < child_nodes.length; k++) {
			var div = document.createElement("div");
			div.className = "symbol_cell button";

			// console.log(child_nodes[k].symbol);
			var sb = new StringBuilder();
			sb.append(child_nodes[k].symbol);
			sb.append("<" + child_nodes[k].tag + " ");
			sb.append("type = \"" + child_nodes[k].type + "\" ");
			sb.append("targetid = \"" + child_nodes[k].name + "\" ");
			sb.append("id = \"" + child_nodes[k].id + "\" ");
			if (child_nodes[k].value != "") {
				var value = GetSettingValueById(child_nodes[k].id) == null ? child_nodes[k].defaultvalue
						: GetSettingValueById(child_nodes[k].id);
				if (value == false) {

				} else {

					sb.append(child_nodes[k].value + " = \"" + value + "\" ");
				}
			}
			sb.append("name = \"" + child_nodes[k].nameTag + "\" ");
			sb.append("style = \"" + child_nodes[k].css + "\" ");
			sb.append("on" + child_nodes[k].event + "=\""
					+ child_nodes[k].functionName + child_nodes[k].type
					+ "(this);\" ");
			sb.append(">");
			sb.append("</" + child_nodes[k].tag + " >");
			if (child_nodes[k].type != "number") {
				div.setAttribute("onclick", child_nodes[k].functionName
						+ "(this); ")
			}
			div.innerHTML = sb;
			// console.log(child_nodes[k].symbol);
			div.style.lineHeight = SettingsMenu.center_panel.clientHeight / 3
					+ "px";
			// style template
			if (child_nodes[k].id == "themes") {
				div.style.lineHeight = SettingsMenu.center_panel.clientHeight/ 5 + "px";
				div.style.width = "100%";
				buildList(div.childNodes[0], child_nodes[k].defaultvalue);
			}
			SettingsMenu.current_grid.appendChild(div);
		}

		SettingsMenu.label.innerHTML = SettingsMenu.build_title_html();
		if (SettingsMenu.setting_tree.current != SettingsMenu.setting_tree.root)
			SettingsMenu.up.innerHTML = "Up ("
					+ SettingsMenu.setting_tree.current.parent.category + ")";
		// if(Editor.using_ipad || Editor.using_iphone)
		if (Editor.using_mobile) {
			SettingsMenu.current_grid.style.setProperty('-webkit-transform',
					'translate3d(0px,0px,0px)', null);
			SettingsMenu.current_Y = 0;
		}

	}
}

SettingsMenu.up = function(node_count) {
	if (SettingsMenu.setting_tree.current.parent != null) {
		if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
			SettingsMenu.center_panel.removeChild(SettingsMenu.current_grid);
			SettingsMenu.center_panel.appendChild(SettingsMenu.current_list);
		}
		SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.current.parent;
		SettingsMenu.populateCategoryList(SettingsMenu.current_list,
				SettingsMenu.setting_tree.current, 0);
	}

	return;
}
// phan cua Crosshair

function CrossChangenumber(e) {
	var text = parseInt(e.value);
	var id = e.id;
	if (id == "crssHeight" && text != NaN) {
		Editor.height = text;
		var tupe = new Tuple(id, Editor.height);
		UpdateSettingValue(id, tupe);
	}

	if (id == "crssWidth" && text != NaN) {
		Editor.width = text;
		var tupe = new Tuple(id, Editor.width);
		UpdateSettingValue(id, tupe);
	}
}

function OptionCross(e) {
	return;
	SwitchStatusRadio(e);
	var radios = document.getElementsByName("radInterior");
	for ( var i = 0; i < radios.length; i++) {
		var checked = radios[i].checked;
		var id = radios[i].getAttribute("id");
		if (checked == true && id == "crsstrue") {
			Editor.crosshair = true;
		} else if (checked == true && id == "crssfalse") {
			Editor.crosshair = false;
		}
		var tupe = new Tuple(id, checked);
		UpdateSettingValue(id, tupe);
	}
}
/*
function OptionCrossRadio(e) {
	OptionLayoutRadio(e);
}
*/
// <<<<< style template

function objStyle(id, background, stroke_color) {
	this.id = id;
	this.background = background;
	this.stroke_color = stroke_color;
}

function buildList(node_style, default_value) 					             {
	//list_style = new Array();
	var temp_index = -1;
	$.ajax({
		type : "POST",
		url : Editor.theme_server_url,
		dataType : "JSON",
		async: false,
		success : function(in_data) {
			var themes = eval(in_data);
			$.each(themes, function(index, theme) {
				var id = theme.id;
				var name = theme.name;
				var bg = theme.background;
				console.log('duoc chay vao luc @ @' + new Date());
				var stroke_color = theme.strokeColor;
				if (node_style != null) {
					var optionNode = document.createElement("option");
					optionNode.text = "Template " + index + " - " + name;
					node_style.appendChild(optionNode);
					list_style.push(new objStyle(id, bg, stroke_color));
					//debugger;
					if (id == default_value) {  temp_index = index;     }} 
					else if (id == default_value && node_style == null) {
					setStyle(bg, stroke_color, "");}});
			if (node_style != null) {
				index_style = temp_index;
				node_style.selectedIndex = index_style;}}});				 }
/*
function optionStyle(e) {
	return;
}

function optionStyleRadio(e) {
	OptionLayoutRadio(e);
}
*/
function optionStylecombobox(e) {
	index_style = e.selectedIndex;
	
	var bg = list_style[index_style].background;
	var stroke_color = list_style[index_style].stroke_color;
	var tupe = new Tuple("themes", list_style[index_style].id);
	UpdateSettingValue("themes", tupe);
	setStyle(bg, stroke_color, "");
	SettingsMenu.postServer();
}

function setStyle(color_bg, color_str, color_left) {
	// <<<<< set background
	document.getElementById("equation_canvas").style.background = color_bg;
	Editor.selected_segment_color = color_str;
}

// phan cua layout

function OptionLayout(e) {
	SwitchStatusRadio(e);
	var radios = document.getElementsByName("layMenu");
	for ( var i = 0; i < radios.length; i++) {

		var checked = radios[i].checked;
		var id = radios[i].getAttribute("id");
		if (checked == true && id == "left") {
			ResizeTo.Layout(id);
		} else if (checked == true && id == "right") {
			ResizeTo.Layout(id);
		}
		var tupe = new Tuple(id, checked);
		UpdateSettingValue(id, tupe);
	}
}

function SliderSetting(id,json_ids)											  {
	var value=$('#'+id).val();
	json_ids = json_ids.replace(/'/g, '"');
	var ids =jQuery.parseJSON(json_ids)
	console.log("slider value: " + value);
	if ( value == 'on') {
		CaseSliderLayout(id,ids.on,true);
		var tupe = new Tuple(ids.on, true);
		UpdateSettingValue(ids.on, tupe);	
		tupe = new Tuple(ids.off, false);
		UpdateSettingValue(ids.off, tupe);
		SettingsMenu.postServer();} 
	else if (value == 'off') {
		CaseSliderLayout(id,ids.off,false);//g 
		var tupe = new Tuple(ids.off,false);//g 
		UpdateSettingValue(ids.off, tupe);	
		tupe = new Tuple(ids.on, false);
		UpdateSettingValue(ids.on, tupe);
		SettingsMenu.postServer();											}}

function CaseSliderLayout(id,layout,value)									 {
	switch (id) {
	case "alt":
		ResizeTo.Layout(layout);
		break;
	case "radInterior":
		Editor.interior = value;
		break;
	case "radStroke":
		Editor.set_color = value;
		break;
	case "radExtend":
		Editor.extend = value;
		break;
	case "showsymbol":
		Editor.show_symbol = value;
		break;
   case "skipcorx":
      if(value){
         var re = new RegExp(Editor.SkipValues.Corx,"g");
         Editor.SettingSkip = Editor.SettingSkip.replace(re,'');
      }else{
         if(Editor.SettingSkip.indexOf(Editor.SkipValues.Corx) == -1)
            Editor.SettingSkip += Editor.SkipValues.Corx;
      }
      SkipCorxUIDisplay();
      break;
   case "OneTouch":
      Editor.OneTouch = value;
      break;
	}}
/*
function OptionLayoutRadio(e) {
	var currentTag = document.getElementById(e.id);
	if (currentTag != undefined) {
		currentTag.checked = !currentTag.checked;
	}
}*/
// Thiet lap Setting Gesture Insert Interior
/*
function OptionInterior(e) {
	SwitchStatusRadio(e);
	var radios = document.getElementsByName("radInterior");
	for ( var i = 0; i < radios.length; i++) {
		var checked = radios[i].checked;
		var id = radios[i].getAttribute("id");
		if (checked == true && id == "auto1true") {
			Editor.interior = true;
		} else if (checked == true && id == "auto1false") {
			Editor.interior = false;
		}
		var tupe = new Tuple(id, checked);
		UpdateSettingValue(id, tupe);
	}
}
*/
/*
function OptionInteriorRadio(e) {
	OptionLayoutRadio(e);
}*/
// Thiet lap Setting Gesture Insert Extend
/*
function OptionExtend(e) {
	SwitchStatusRadio(e);
	var radios = document.getElementsByName("radExtend");
	for ( var i = 0; i < radios.length; i++) {
		var checked = radios[i].checked;
		var id = radios[i].getAttribute("id");
		if (checked == true && id == "autotrue") {
			Editor.extend = true;
			// console.log("hpham Editor.extend :" + Editor.extend);
		} else if (checked == true && id == "autofalse") {
			Editor.extend = false;
			// console.log("hpham Editor.extend: " + Editor.extend);
		}
		var tupe = new Tuple(id, checked);
		UpdateSettingValue(id, tupe);
	}
}*/
/*
function OptionExtendRadio(e) {
	OptionLayoutRadio(e);
}
*/
// phan stroke
/*
function OptionStroke(e) {
	SwitchStatusRadio(e);
	var radios = document.getElementsByName("radStroke");
	for ( var i = 0; i < radios.length; i++) {
		var checked = radios[i].checked;
		var id = radios[i].getAttribute("id");
		if (checked == true && id == "stroketrue") {
			Editor.set_color = true;
		} else if (checked == true && id == "strokefalse") {
			Editor.set_color = false;
		}
		var tupe = new Tuple(id, checked);
		UpdateSettingValue(id, tupe);
	}
}*/
/*
function OptionStrokeRadio(e) {
	OptionLayoutRadio(e);
}*/
// end phan stroke

function SwitchStatusRadio(e) {
	var tagName = $.trim(e.tagName.toLowerCase());
	var id = null;
	var flagdiv = false;

	if (tagName == "div") {
		id = e.firstElementChild.id;
		var currentTag = document.getElementById(id);
		if (currentTag != undefined) {
			currentTag.checked = true;
		}
	}
}
function ShowHideButtons(e) {
	var tagName = $.trim(e.tagName.toLowerCase());
	
	
	if (tagName == "div") {
		var id = e.firstElementChild.id;
		if(!id)
		{
			id = e.firstElementChild.firstElementChild.id;
		}

		var currentTag = document.getElementById(id);
		if (currentTag != undefined) {
			var targetid = $.trim(currentTag.getAttribute("targetid"));
			currentTag.checked = !currentTag.checked;
			var currentValue = currentTag.checked;

			SwitchStatus(currentValue, targetid, id);
		}
		
	}
}
function ShowHideButtonsCheckBox(e) {
	var id = e.id;
	var currentTag = document.getElementById(id);

	if (currentTag != undefined) {
		var targetid = $.trim(currentTag.getAttribute("targetid"));
		currentTag.checked = !currentTag.checked;
	}

}

function GetSettingValueById(id) {
	for ( var i = 0; i < SettingsMenu.SettingValues.length; i++) 			  {
		var t = SettingsMenu.SettingValues[i];
		if (t.item1 == id) {  return t.item2;							     }}
	return null;															  }

function GetSettingValueById2(id) 											  {
	for ( var i = 0; i < SettingsMenu.SettingValues.length; i++) {
		var t = SettingsMenu.SettingValues[i];
		if (t.item1 == id) {		return t;								 }}
	return null;															  }


function UpdateSettingValue(id, tupe) 			                              {
	//FIXME: UPDATE
  var item=GetSettingValueById2(id);
	if(item){
		var currValue = item.item2;
		if (currValue != tupe.item2) {
			item.item2 = tupe.item2;										}}
	else	{
		SettingsMenu.SettingValues.push(tupe);								}}

function SwitchStatus(status, button, label) 								  {
	var tupe = new Tuple(label, status);
	UpdateSettingValue(label, tupe);
	if (status == false) {
		$('#'+button).parent().css('display','none');
		//$('#more-'+button).css('display','block'); // for buttons set hidden in setting page displaying on more menu
		UpdateDisplay(button,'none')
		SettingsMenu.postServer();} 
		else {
		$('#'+button).parent().css('display','block');
		//$('#more-'+button).css('display','none');// for buttons set hidden in setting page displaying on more menu
		UpdateDisplay(button,'block');
		SettingsMenu.postServer();								            }}

SettingsMenu.touchstart = function(e) {
	SettingsMenu.touch_start_position = new Vector2(e.touches[0].clientX,
			e.touches[0].clientY);
	SettingsMenu.div_moving = true;
	SettingsMenu.div_speed = 0;
	SettingsMenu.touch_moving = false;
}

SettingsMenu.touchmove = function(e) {
	SettingsMenu.touch_moving = true;
	var to_move = null;
	var to_move_height;
	var center_height = SettingsMenu.center_panel.clientHeight;
	if (SettingsMenu.setting_tree.current.children_type == NodeType.Category) {
		// //console.log("chieu dai " +
		// SettingsMenu.current_list.childNodes.length);
		if (SettingsMenu.current_list.childNodes.length <= 5)
			return;
		to_move = SettingsMenu.current_list;

		to_move_height = SettingsMenu.current_list.childNodes.length
				* center_height / 5.0;
		// //console.log("do di chuyen " + to_move_height);
	} else if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
		if (SettingsMenu.current_grid.childNodes.length <= 9)
			return;
		to_move = SettingsMenu.current_grid;
		if (SettingsMenu.current_grid.childNodes.length % 3 != 0)
			to_move_height = (Math
					.floor(SettingsMenu.current_grid.childNodes.length / 3) + 1)
					* (center_height / 3.0);
		else
			to_move_height = Math
					.floor(SettingsMenu.current_grid.childNodes.length / 3)
					* (center_height / 3.0);
	}
	var touch_current_position = new Vector2(e.touches[0].clientX,
			e.touches[0].clientY);
	var delta = Vector2.Subtract(touch_current_position,
			SettingsMenu.touch_start_position);

	SettingsMenu.div_speed = delta.y;

	var new_position = SettingsMenu.current_Y + delta.y;
	// //console.log("chieu dai y " + touch_current_position.y);
	if (new_position > 0)
		new_position = 0;
	if (new_position < (center_height - to_move_height))
		new_position = center_height - to_move_height;

	SettingsMenu.current_Y = new_position;

	var sb = new StringBuilder();
	sb.append("translate3d(0px,").append(SettingsMenu.current_Y).append(
			"px,0px)");
	to_move.style.setProperty('-webkit-transform', sb.toString(), null);
	// to_move.style.top = delta.y + "px";
	SettingsMenu.touch_start_position = touch_current_position;
}

SettingsMenu.touchend = function(e) {
	SettingsMenu.div_moving = true;
	SettingsMenu.touchend_time = (new Date()).getTime();
	setTimeout(SettingsMenu.animate);
}

SettingsMenu.decelleration = 100;
SettingsMenu.animate = function() {
	var to_move = null;
	var to_move_height;
	var center_height = SettingsMenu.center_panel.clientHeight;
	if (SettingsMenu.setting_tree.current.children_type == NodeType.Category) {
		if (SettingsMenu.current_list.childNodes.length <= 5)
			return;
		to_move = SettingsMenu.current_list;

		to_move_height = SettingsMenu.current_list.childNodes.length
				* center_height / 5.0;
	} else if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
		if (SettingsMenu.current_grid.childNodes.length <= 9)
			return;
		to_move = SettingsMenu.current_grid;
		if (SettingsMenu.current_grid.childNodes.length % 3 != 0)
			to_move_height = (Math
					.floor(SettingsMenu.current_grid.childNodes.length / 3) + 1)
					* (center_height / 3.0);
		else
			to_move_height = Math
					.floor(SettingsMenu.current_grid.childNodes.length / 3)
					* (center_height / 3.0);
	}

	var current_time = (new Date()).getTime();
	if (SettingsMenu.div_speed > 0) {
		SettingsMenu.div_speed -= (current_time - SettingsMenu.touchend_time)/ 1000.0 * SettingsMenu.decelleration;
		if (SettingsMenu.div_speed < 0)
			SettingsMenu.div_speed = 0;
	} else if (SettingsMenu.div_speed < 0) {
		SettingsMenu.div_speed += (current_time - SettingsMenu.touchend_time)/ 1000.0 * SettingsMenu.decelleration;
		if (SettingsMenu.div_speed > 0)
			SettingsMenu.div_speed = 0;
	}
	SettingsMenu.touchend_time = current_time

	if (SettingsMenu.div_speed == 0.0) {
		SettingsMenu.div_moving = false;
		return;
	}

	var new_position = SettingsMenu.current_Y + SettingsMenu.div_speed;
	if (new_position > 0) {
		new_position = 0;
		SettingsMenu.div_moving = false;
	}
	if (new_position < (center_height - to_move_height)) {
		new_position = center_height - to_move_height;
		SettingsMenu.div_moving = false;
	}

	SettingsMenu.current_Y = new_position;
	var sb = new StringBuilder();
	sb.append("translate3d(0px,").append(SettingsMenu.current_Y).append(
			"px,0px)");
	to_move.style.setProperty('-webkit-transform', sb.toString(), null);

	if (SettingsMenu.div_moving) {
		setTimeout(SettingsMenu.animate);
	}
}

//window.onbeforeunload = function() { alert('your work will lost!'); };
