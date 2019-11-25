function Buttons() { }

Buttons.COUNT = 0;
Buttons.Command = 0;
Buttons.Submit = 1;
Buttons.Redo = 2;
Buttons.Group = 3;
Buttons.Label = 4;
Buttons.Settings = 5;
Buttons.Key = 6;
Buttons.Copy = 7;
Buttons.Paste = 8;
Buttons.Undo = 9;
Buttons.Hint = 10;
Buttons.Author = 11;
Buttons.Graph = 12;
Buttons.Exercises = 13;
Buttons.Help = 14;
Buttons.More = 15;
// hpham
var tbl_overlay = 'ui-btn ui-shadow ui-btn-corner-all'
		+' ui-btn-inline ui-btn-icon-top ui-btn-up-a';
//review: http://jqmiconpack.andymatthews.net/
var toolbars=[
{order:'1',id:'undo',label:'Undo',  default:'1',display:'block', icon:"undo",position:"1"},
{order:'3',id:'redo',label:'Redo',  default:'', display:'block', icon:"repeat", position:"2"},
{order:'2',id:'submit',label:'Submit',	default:'1',	display:'block', icon:"bolt",position:"1"},
{order:'4',id:'group',	label:'Group',	default:'',	display:'block', icon:"group",position:"2"},
{order:'5',id:'relabel',label:'Label',	default:'',	display:'block', icon:"bookmark",position:"2"},
{order:'6',id:'settings',label:'Setting',default:'1',	display:'block', icon:"cog",position:"1"},
{order:'7',id:'copy',	label:'Copy',	default:'',	display:'block', icon:"copy",position:"2"},
{order:'8',id:'paste',	label:'Paste',	default:'',	display:'block', icon:"paste",position:"2"},
{order:'9',id:'kboard',label:'Key',	default:'1',	display:'block', icon:"keyboard",position:"1"},
{order:'10',id:'hint',label:'Hint',	default:'',	display:'none', icon:"comment",position:"2"},
{order:'11',id:'author',label:'Author',	default:'',	display:'block', icon:"edit",position:"2"},
{order:'13',id:'exercises', label:'Exercises',	default:'1',	display:'block', icon:"book",position:"1"},
{order:'14',id:'graph',label:'Graph',	default:'1',	display:'block', icon:"pencil",position:"2"},
{order:'15',id:'help',label:'Help',  default:'', display:'block', icon:"info",position:"2"},
{order:'16',id:'more',label:'More',default:'1', display:'block', icon:"reorder",position:"1"},
{order:'12',id:'command',label:' Alt&nbsp;', default:'1', display:'block', icon:"adjust",position:"1"}];

  var tmp_toolbar ='<% _.each(buttons, function(item) { %>'
       	+'<div class="ui-block-c" style="display:<%=item.display%>" >'
			+'<% if(item.icon) {%>'
			+ '<%	var notext="" %>'
			+ '<% if(Editor.is_iphone){%>'
 			//+ '<%	notext="data-iconpos=\\"notext\\"" %>'
			+ '<%	}	%>'
			+'<a  id="<%=item.id%>" data-role="button"  <%=notext%>'
			+' data-iconpos="top" data-icon="<%=item.icon%>" '
			+' data-theme="a" data-inline="true"><%=item.label%></a>'
			+'<%}else{%>'
			+'<a  id="<%=item.id%>" data-role="button" data-theme="a" >'
			+'<%=item.label%></a>'
			+'<%}%>'
			+'</div>'
       	+' <% }); %>';
function ButtonState(button_id) {
	this.overlay_id = document.getElementById(button_id);
	try{
		this.overlay_div = document.getElementById(button_id);	
	} 
	catch (e) {
		// TODO: handle exception
		console.log(button_id);
	}
	
	Buttons.COUNT++;
	this.enabled = false;
	this.touched = false;							}

ButtonState.prototype.setEnabled = function(enabled) {
	//FIXME: bo cai nay de chay tam
	this.enabled = enabled;
	if (this.enabled) this.overlay_div.className = tbl_overlay + " toolbar_button_enabled";
	else
	this.overlay_div.className = tbl_overlay +" toolbar_button_disabled";
}

function BuildToolbar()														  {
    html=_.template(tmp_toolbar,{'buttons':toolbars});						
    $('#toolbar').empty();
    $('#toolbar').append(html);												  }	

function write_iphone_portraint() 											  {
		var over_toolbar = _.filter(toolbars, 
    			function(item){ return item.default != '1'; });
    	var d_toolbar = _.filter(toolbars, 
    			function(item){ return item.default == '1'; });
    	var html='';
    	if(islandscape())													  {
			html='<div  class="ui-block-a" style="width:100%;">'+'</div>';
    		html +='<div id="d-toolbar" class="ui-block-a" style="width:100%;">'
    			 +_.template(tmp_toolbar,{'buttons':toolbars})+'</div>'; 	  }
    	else 																  {
    		html='<div  class="ui-block-a" style="width:100%;">'
    			+ _.template(tmp_toolbar,{'buttons':over_toolbar})+'</div>';
    		html +='<div id="d-toolbar" class="ui-block-a" style="width:100%;">'
    			+_.template(tmp_toolbar,{'buttons':d_toolbar})+'</div>';      }
    	return html;														  }


function UpdateDisplay(id,value)											  {
   _.each(toolbars, function(item){
		if(item.id==id){		return	item.display=value; }});
	var count =	_.countBy(toolbars, function(item) 							  {
		return (item.display == 'block') ? 'block' : 'none';					  
	});
	var width = 1;
		width =	 100/count.block;
	$('#toolbar .ui-block-c').css('width',width+"%");						  }

function CoutDisplay(items) 												  {
	var count ={block:0,none:0}
	for(var i=0;i<items.length; i++)										  {
		var item = items[i];
		if($(item).css('block')!='none'){count.block +=1;					  }
		else{		count.none +=1;											 }}
	return count;															  }

function BalanceToolbar()													  {
	if(Editor.is_iphone && !islandscape())									  {
		var count=_.countBy(toolbars, function(item) 						  {
		  return (item.display=='block' && 
		  	item.position=='1') ? 'block' : 'none';});

		var d_toolbars = $('#d-toolbar > div');
		var count_d =	CoutDisplay(d_toolbars);

		if(count.block<6 && islandscape() == false){
			for(var i=0;i<6-count.block;i++){
				var temp = $('#toolbar div:first div:first');
				var id = $('#toolbar div:first div:first a').attr('id');
				 _.each(toolbars, function(item){
				if(item.id==id){return	item.position=1;}});
				temp.insertAfter($('#toolbar #d-toolbar div:first'));}}
		else if(islandscape()){											   }}}


ButtonState.prototype.setTouched = function(touched) {
	this.touched = touched;
	if (this.enabled) {
		if (this.touched){
			this.overlay_div.className =  tbl_overlay +  " toolbar_button_touched";
		}
		else
		this.overlay_div.className =tbl_overlay + " toolbar_button_enabled";
	}
}

ButtonState.prototype.setBackground = function(color){
	this.overlay_div.style.background = color;
}

ButtonState.prototype.setSelected = function(selected) {
	this.selected = selected;
	if (this.enabled && this.selected) this.overlay_div.className = tbl_overlay + " toolbar_button_selected";
}

Editor.clearButtonOverlays = function() {
	for (var k = 0; k < Editor.button_states.length; k++) {
		Editor.button_states[k].setTouched(false);
		Editor.button_states[k].setEnabled(true);
	}
}

Editor.build_buttons = function(in_div_name) {
	Editor.toolbar_div = document.getElementById(String(in_div_name));
	Editor.toolbar_button_overlay = Editor.toolbar_div.getElementsByClassName(tbl_overlay);
	Editor.button_states = new Array();
	Editor.button_states.push(new ButtonState("command"));
	Editor.button_states.push(new ButtonState("submit"));
	Editor.button_states.push(new ButtonState("redo"));
	Editor.button_states.push(new ButtonState("group"));
	Editor.button_states.push(new ButtonState("relabel"));
	Editor.button_states.push(new ButtonState("settings"));
	Editor.button_states.push(new ButtonState("kboard"));
	Editor.button_states.push(new ButtonState("copy"));
	Editor.button_states.push(new ButtonState("paste"));
	Editor.button_states.push(new ButtonState("undo"));
	Editor.button_states.push(new ButtonState("hint"));
        Editor.button_states.push(new ButtonState("author"));
        Editor.button_states.push(new ButtonState("graph"));
        Editor.button_states.push(new ButtonState("exercises"));
        Editor.button_states.push(new ButtonState("help"));
        Editor.button_states.push(new ButtonState("more"));

	Editor.clearButtonOverlays();
	return;
	// add button names
	Editor.button_labels.push("Command");
	Editor.button_labels.push("Submit");
	Editor.button_labels.push("Redo");
	Editor.button_labels.push("Group");
	Editor.button_labels.push("Relabel");
	Editor.button_labels.push("Settings");
	Editor.button_labels.push("Key");
	Editor.button_labels.push("Copy");
	Editor.button_labels.push("Paste");
	Editor.button_labels.push("Undo");
	Editor.button_labels.push("Hint");
    Editor.button_labels.push("Author");
Editor.button_labels.push("Graph");
	Editor.button_labels.push("Exercises");
	Editor.button_labels.push("Help");
	Editor.button_labels.push("More");
	// convert button name to class
	Editor.button_classes = new Array();e
	for (var k = 0; k < Editor.button_labels.length; k++) {
		var sb = new StringBuilder();
		for (var j = 0; j < Editor.button_labels[k].length; j++) {
			if (Editor.button_labels[k][j] >= 'A' && Editor.button_labels[k][j] <= 'Z') sb.append(Editor.button_labels[k][j].toLowerCase());
			else if (Editor.button_labels[k][j] == ' ') sb.append('_');
			else
			sb.append(Editor.button_labels[k][j]);
		}
		Editor.button_classes.push(sb.toString());
	}
	Editor.toolbar_div = document.getElementById(String(in_div_name));
	Editor.toolbar_div.className = "toolbar";
	var toolbar_ul = document.createElement("ul");
	toolbar_ul.className = "button_list";
	Editor.toolbar_div.appendChild(toolbar_ul);
	for (var k = 0; k < Editor.button_labels.length; k++) {
		var button_li = document.createElement("li");
		button_li.setAttribute("onselectstart", "return false;")
		button_li.innerHTML = Editor.button_labels[k];
		button_li.className = "toolbar_button";
		button_li.id = Editor.button_classes[k];
		toolbar_ul.appendChild(button_li);
		Editor.toolbar_buttons.push(button_li);
	}
}
Editor.buildMoreButtons = function()                                          {
   var content = "";
   var tmp = '<a href="javascript:closeMoreButtons();morebtnclk(\'ID\');" id="more-ID" data-role="button" data-icon="ui-icon-ICON" '
      + ' class="ui-link ui-btn ui-icon-ICON ui-btn-icon-left" role="button" ' 
      + ' style="font-weight:normal;color:white;text-decoration:none;text-align:left;background-image:none;display:DISPLAY;">&nbsp;LABEL</a>';
   /* the code below is for buttons that were set as hide in setting page will be shown in "More" menu
   for(var i=0;i<toolbars.length; i++)
      if(toolbars[i].position == "2" && toolbars[i].default != "1")
         content += tmp.replace(/ICON/g,toolbars[i].icon)
                       .replace(/ID/g,toolbars[i].id)
                       .replace(/LABEL/g,toolbars[i].label)
                       .replace(/DISPLAY/g,toolbars[i].display);
   */
   content += tmp.replace(/ICON/g,'signout').replace(/ID/g,'signout')
                 .replace(/LABEL/g,'Sign out').replace(/DISPLAY/g,'block')
                 .replace(/closeMoreButtons/g,'signout');
   $("#popup-more").html(content);
}
function signout(){
   window.location.href = Editor.login_server_url;
   Editor.ajaxLoader("hidden");
   Editor.ajaxLoader("show");
}
function closeMoreButtons(){
   $('#popup-more').popup('close');
}

function morebtnclk(id)                                                       {
   //var s = $._data( $('a#help')[0], 'events' );
/*   
   var node = document.getElementById(id);
   var clickEvent = document.createEvent ('MouseEvents');
   clickEvent.initEvent ('mousedown', true, true);
   node.dispatchEvent (clickEvent);
   clickEvent.initEvent ('mouseup', true, true);
   node.dispatchEvent (clickEvent);
*/
   switch (id) {
   case "redo":    Editor.redo();break;//run correctly
   case "group":   Editor.groupTool();break;//run correctly
   case "relabel": Editor.relabel();break;//sometimes the Relabel popup is open, sometimes not --> the popup issue hasnt identified yet
   case "copy":    if(!Editor.using_mobile){
                     CopyPasteSegments.Copys();
                     if (CopyPasteSegments.listSegment.length > 0)
                        CopyPasteSegments.flag = true;
                   }
                   break;  
   case "paste":   if(!Editor.using_mobile) CopyPasteSegments.Paste(0);
                   break;
   case "author":  if (!Editor.using_mobile) Editor.author();//run correctly on laptop, on ipad it cannot open new window
                   break;
   case "graph":   Editor.graph();break;//run correctly
   case "help":    Editor.help();break;//sometimes the help popup is open, sometimes not --> the popup issue hasnt identified yet
   }
}