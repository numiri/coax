//sn141001 changed classifer_server_url to 129.21.34.109:1504

/** Server configuration **/
Editor.classifier = new Classifier();
var server     = "./web/ours/jsp/";
Editor.oursjsp = "./web/ours/jsp/";
Editor.ourscss = "./web/ours/css/";

Editor.editor_root = "./";
Editor.connected_components_server_url = "http://129.21.34.104:2000/";

// Editor.rex_engine = "mic";// 0: myscript - 1: pen entry
//a midra = hybrid mic + draculae.  motivated by shapes because mic recognition 
//  to latex is bad when strokes shrinks via shape.  Draculae is better at this 
//  recognition.
//b smash = hybrid of seshat for symbols and mathpix for latex
Editor.rex_engine = "smash";
if( Editor.rex_engine === "mic" )                                             {
   Editor.classifier_server_url = "http://micm.modstein.com:8069/api/MMip";
   Editor.align_server_url      = "http://micm.modstein.com:8069/api/MMip";   }
else if( Editor.rex_engine === "midra" )                                      { //a
   Editor.classifier_server_url = "http://micm.modstein.com:8069/api/MMip";
   Editor.align_server_url      = "web/ours/jsp/steps.jsp";                   }
else if( Editor.rex_engine === "cid" )                                        {
   Editor.classifier_server_url = "web/ours/jsp/recognizer.jsp";
   Editor.align_server_url      = "web/ours/jsp/steps.jsp";                   }
else if( Editor.rex_engine === "pet" )                                        {
   Editor.classifier_server_url = "http://saskatoon.cs.rit.edu:6501/";
   Editor.align_server_url      = "http://saskatoon.cs.rit.edu:6500/";        }
else if( Editor.rex_engine === "mipet" )                                      {
   Editor.classifier_server_url = "http://micm.modstein.com:8069/api/MMip";
   Editor.align_server_url      = "http://saskatoon.cs.rit.edu:6500/";        }
else if( Editor.rex_engine === "smash" )                                      {
   Editor.classifier_server_url = "web/ours/jsp/seshat.jsp";
   Editor.align_server_url      = "https://api.mathpix.com/v3/latex";         }
else if( Editor.rex_engine === "seshat" )                                     {
   Editor.classifier_server_url = "web/ours/jsp/seshat.jsp";
   Editor.align_server_url      = "web/ours/jsp/seshat.jsp";                  }

// data server (saskatoon)
Editor.data_server_url = "http://129.21.34.109:500/"
Editor.author_url = "./web/ours/jsp/author-xiz.jsp";
Editor.AuraThickness = 2;
Editor.inkml_save_server_url = "http://129.21.34.109:4205/";

Editor.symbol_tree = "web/ours/xml/example_tree_icdar.xml";
Editor.setting_tree = "settings_tree.xml";
Editor.keyboard = "web/ours/xml/keyboard.xml";

// Gestures
Editor.xiz_level = "k8";
Editor.gestures_server = "./web/ours/jsp/fence-recognizer.jsp";
Editor.draculae_validSymbols = ["_equal","_plus",
                                "sin","cos","tan","cot","sec","csc",
                                "sinh","cosh","sech","csch","tanh","coth",
                                "log","lg","lim","d/dt","d/dx","d/dy","d/dz"];
Editor.shapeSymbols = ["_heart","_circle","_square","_trapezium"];

Editor.url_login = "http://localhost:8080/activemath-cox/login.jsp";
Editor.corx_url      = Editor.oursjsp + "corx.jsp";
Editor.url_exercises = Editor.oursjsp + "exercises.jsp";
Editor.url_setting   = Editor.oursjsp + "settings.jsp";
Editor.url_history   = Editor.oursjsp + "history.jsp";
Editor.url_history   = "http://localhost:8080/activemath-cox/historys.jsp";
Editor.login_server_url = "./login.jsp";

Editor.theme_server_url = Editor.oursjsp + "theme.jsp";

/** Asthetics **/

// colors assumed to be 3 byte hex (ie no rgba() bs)
Editor.segment_color = "#111111";
Editor.stroke_color = "#111111";
Editor.selected_segment_color = "green";
//Editor.selected_segment_color = "#FF0000";
Editor.selection_box_color = "#303030";
Editor.segment_set_box_color = "#FF8020";
Editor.control_point_fill_color = "#FFAA00";
Editor.control_point_line_color = "#111111";
Editor.control_point_radius = 60;
Editor.control_point_line_width = 1;
Editor.recognition_result_color = "#111111";
Editor.stroke_width = 3;
Editor.selected_stroke_width = 4;
Editor.stroke_select_color = "#44F"
Editor.stroke_select_width = 1.5;
Editor.dot_width = 6;//size of a dot
Editor.flat_slope = .15; // threshhold to be considered a "_dash" stroke.  for seshat & mathpix rex.
// Set arr config
ArrConfig.Addarr();
// Config gesture
Editor.zoom1 = ArrConfig.getStatus(""); // -t 1
Editor.zoom2 = ArrConfig.getStatus("-t 2"); // -t 2
Editor.select_s3 = ArrConfig.getStatus("-l 2"); // -l 2
Editor.select_s2 = ArrConfig.getStatus("-l 3"); // -l 3
Editor.fence = ArrConfig.getStatus("-f 1"); // -f 1
Editor.moveSpace = 30;
Editor.timer_doubleclick = 100;
Editor.AutoGroupPen = true;
Editor.Space = false;
Editor.set_color = false;
Editor.extend = false;
Editor.interior = false;
Editor.show_symbol = false;
Editor.OneTouch = false;
Editor.drag = false;
Editor.mod_history = true;
Editor.dragHeight = -30;
Editor.top = -10;
Editor.SpaceHeight = Editor.dragHeight + Editor.top - 25;
Editor.height = 25;
Editor.width = 40;
Editor.crosshair = false;
Editor.status_moveSub = false; //bat trang thai la true khi su kien Substitute xay ra
Editor.floppositeMoveTopMessage = "detected flopposite";
Editor.floppositeMoveBottomMessage = "detected flopposite";
Editor.flottomMoveLeftMessage = "detected \"=\" crossing";
Editor.floppositeMoveRightMessage = "detected \"=\" crossing";
Editor.CopySegments = "CopySegments";
Editor.AddSegments = "AddSegments";
Editor.DataSegments = "DataSegments";
Editor.DeleteSegments = "DeleteSegments";
Editor.TransformSegments = "TransformSegments";
Editor.FlottomSegments = "FlottomSegments";
Editor.History = "History";

Exercise={};
Exercise.current={};
Exercise.current ={"index":0,"latex":"","variable":"","folder_id":"","content":"","exercise_id":0,"xiznum":"","version":""};
Exercise.recent = [];
Exercise.C_RECENT="Recent";
Exercise.flag =false;

Editor.aesar = 2/3;
// OE
var _current_tag = "";
var _current_prefix = "";
var _t_valid = "new";
var _t_user_id = 1;
var _url = "";
var prefix_group = 'group';// tranh dat co so(01...9)
var prefix_folder = 'folder';// tranh co chu so(01...9)
var _url_folder = Editor.oursjsp + 'folder.jsp';
var _url_group = Editor.oursjsp + 'group.jsp';
var _url_group_action = '../../../web/ours/jsp/' + 'group.jsp';   //v was var _url_group_action = Editor.oursjsp + 'group.jsp';
var _url_folder_action = '../../../web/ours/jsp/' + 'folder.jsp'; //v was var _url_folder_action = Editor.oursjsp + 'folder.jsp';
var url_shared = '../../../web/ours/jsp/' + 'shared.jsp';
var url_user = '../../../web/ours/jsp/' + "users.jsp";
var url_guser = '../../../web/ours/jsp/' + "group-users.jsp";
var url_exercise = '../../../web/ours/jsp/' + "fiz.jsp";
var url_fexecise = url_exercise;
var flag_shared = true;
var flag_group = false
var flag_folder = false;
var temp_delete = '';
var group =false;
var folder = false;
var jSons = null;
var flag_hold = false;

var page_current = 1;
var page_show = 3;
var page_count = 0;
var height_title_h1 = 40;
var height_margin_list = 22;

var message_group = '<p style="color:red">please select group and users!</p>';
var message_folder = '<p style="color:red">please select folder and exercise!</p>';
var class_list = 'cursor sharedlist';
var class_icon_book = '<i class="icon-book"></i> ';
var class_icon_user = '<i class="icon-user"></i> ';
var class_icon_th_list = '<i class="icon-th-list"></i> ';
var class_icon_folder_open =  '<i class="icon-folder-open"></i> ';
var tmp_user_list = '<% _.each(users, function(item) { %> <li id="user_select<%= item.id %>" class="<%=class_list%>"  onclick="select_user(<%=item.id%>)"><span><%=class_icon_user%><%= item.name %></span></li> <% }); %>';
var tmp_exercise_list = '<% _.each(exers, function(item) { %> <li id="exer_select<%= item.id %>" class="<%=class_list%>" onclick="select_exercise(<%=item.id%>)"><span><%=class_icon_book%><%= item.content %></span></li> <% }); %>';

var _init_data = {
		userId : _t_user_id,
		fn : 3
	// -1//
	};

var list_guserslist = 'guserslist';
var list_userslist = 'userslist';
var class_select = 'selected';
var tag_span = 'span';

var dtree_folder = [];
var dtree_group = [];
var group_users = [];
var folder_exers = [];
var version_exers = [];
var g_gusers = [];

var init_folder = {
	data_child : "exers",// key du lieu cua cha
	data_parent : "folders",// key du lieu cua con
	class_child : "file",// the hien cua cha tren cay
	class_parent : "folder",// the hien cua cha tren cay
	id : "id", // id cua cha
	relate_id : "parentId",// khoa dai dien lam cha
	parent_name : "name",// ten the hien cua cha
	child_id : "id",// id cua con
	child_id_2 : "id", // id thu hai cua con
	child_name : "exerciseName",// ten the hien cua con
	parent_prefix : prefix_folder, // prefix cho li id cua cha
	child_prefix : "exer",// prefix cho li cua con
	relate_parent : "folderId",
	attribute_name : "exerciseid",
	attribute_value : "exerciseId",
	url : url_shared,// url crud cua share
	url_action : _url_folder_action,// crud cua folder
	tag : 'browser',// tree id cua folder
	tag_list : 'sharedfolder'// list cua folder
};

var init_group = {
	data_child : "users",// key du lieu cua cha
	data_parent : "groups",// key du lieu cua con
	class_child : "file",// the hien cua cha tren cay
	class_parent : "folder",// the hien cua cha tren cay
	id : "id", // id cua cha
	relate_id : "parentId",// khoa dai dien lam cha
	parent_name : "name",// ten the hien cua cha
	child_id : "id",// id cua con
	child_id_2 : "userId", // id thu hai cua con
	child_name : "username",// ten the hien cua con
	parent_prefix : prefix_group, // prefix cho li id cua cha
	child_prefix : "exer",// frefix cho li cua con
	relate_parent : "groupId",
	attribute_name : "userid",
	attribute_value : "userId",
	url : url_shared,// url crud cua share
	url_action : _url_group_action,// url crud cua group
	tag : 'grouptree',// tree id
	tag_list : 'sharedgroup'// list cua group
};
var SkipCorxLight_background = "windowframe";

