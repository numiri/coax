/******************************************************************************
* 170713:
* this file is not used in index.jsp; therefore it seems to be dead code.
* most (if not all) the functions here seems to be duplicated in Setting.js
******************************************************************************/

//phan nay cua SettingsMenu//

function SettingsMenu() {

}
SettingsMenu.SettingValues = new Array();
SettingsMenu.initialize = function(id_user, user_name) {
    SettingsMenu.close_button = document.getElementById("st_close_button");
    SettingsMenu.close_button.addEventListener("click", SettingsMenu.hide, true);

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
        SettingsMenu.current_list.addEventListener("touchstart", SettingsMenu.touchstart, true);
        SettingsMenu.current_list.addEventListener("touchmove", SettingsMenu.touchmove, true);
        SettingsMenu.current_list.addEventListener("touchend", SettingsMenu.touchend, true);

        SettingsMenu.current_grid.addEventListener("touchstart", SettingsMenu.touchstart, true);
        SettingsMenu.current_grid.addEventListener("touchmove", SettingsMenu.touchmove, true);
        SettingsMenu.current_grid.addEventListener("touchend", SettingsMenu.touchend, true);
    }
    var sb = new StringBuilder();
    sb.append(Editor.url_setting);
    $.ajax({
        url: String(sb),
        success: function(in_data) {
            SettingsMenu.setting_tree = SymbolTree.parseXml(in_data);
            SettingsMenu.setting_tree.root.children.splice(0, 0, SettingsMenu.recognition_node);
            Exercise.buildDropdown();
        }
    });
}

SettingsMenu.loadInfo = function(id_setting, value_setting){
    //console.info("id_setting:" + id_setting + ",value_setting: " + value_setting);
    switch (id_setting) {
        case "shUndo":
            document.getElementById("undo").style.display = "block";
            break;
        // sn-ink start
/*
        case "ink":  
            document.getElementById("ink").style.display = "block";
            break;
*/
        // sn-ink end
        case "shLabel":
            document.getElementById("relabel").style.display = "block";
            break;
        case "shRedo":
            document.getElementById("redo").style.display = "block";
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
            document.getElementById("group").style.display = "block";
            break;
        case "shGetInkML":
            document.getElementById("getInkML").style.display = "block";
            break;
        case "shStroke":
            document.getElementById("stroke_select").style.display = "block";
            break;
        case "shKboard":
            document.getElementById("kboard").style.display = "block";
            break;
        case "shPaste":
            document.getElementById("paste").style.display = "block";
            break;
        case "shCopy":
            document.getElementById("copy").style.display = "block";
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
            Editor.set_color = false;
            break;
        case "auto1true":
            Editor.interior = true;
            break;
        case "auto1false":
            Editor.interior = false;
            break;

        case "showsymboltrue":
            Editor.show_symbol = true;
            break;
        case "showsymbolfalse":
            Editor.show_symbol = false;
            break;

        case "autotrue":
            Editor.extend = true;
            break;
        case "autofalse":
            Editor.extend = false;
            break;
        case "crssHeight":
            Editor.height = parseInt(value_setting);
            break;
        case "crssWidth":
            Editor.width = parseInt(value_setting);
            break;
        case "themes":
            buildList(null, value_setting);
            break;
    
        default:
            break;
    }
}

//<<<<< send softcode to server
SettingsMenu.postServer = function(){
    var sb = new StringBuilder();
    sb.append(Editor.url_setting);
    sb.append("?setting=<Root id = \"" + SettingsMenu.user + "\">");
    for (var i = 0; i < SettingsMenu.SettingValues.length; i++){
        sb.append("<Symbol id = \"" + SettingsMenu.SettingValues[i].item1 + "\" default = \"" + SettingsMenu.SettingValues[i].item2 + "\">");
        sb.append("</Symbol>");
    }
    sb.append("</Root>");
    $.ajax({
        type: "GET",
        url: String(sb),
        success: function(in_data) {
            console.log("successful!");
        },
    });
}

SettingsMenu.hide = function() {

    //Editor.state = EditorState.SegmentsSelected;
    //if (Editor.selection_method == "Stroke") Editor.strokeSelectionTool();
    //else
    Editor.clearButtonOverlays();
    Editor.rectangleSelectionTool();
    SettingsMenu.menu.style.display = "none";
    SettingsMenu.postServer();
}

SettingsMenu.show = function() {
    SettingsMenu.menu.style.display = "block";
    if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
        SettingsMenu.center_panel.removeChild(SettingsMenu.current_grid);
        SettingsMenu.center_panel.appendChild(SettingsMenu.current_list);
    }

    SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.root;
    SettingsMenu.populateCategoryList(SettingsMenu.current_list, SettingsMenu.setting_tree.current, 0);
    SettingsMenu.center_panel.appendChild(SettingsMenu.current_list);
}


SettingsMenu.populateCategoryList = function(list_div, node, start_index) {
    var child_nodes = node.children;
    var node_index = start_index;
    if (SettingsMenu.setting_tree.current.children_type == NodeType.Category) {
        var child_divs = list_div.childNodes;
        while (child_divs.length > 0)
        list_div.removeChild(child_divs.item(0));

        // add each category node
        for (var k = 0; k < child_nodes.length; k++) {
            if (child_nodes[k] != undefined) {
                var div = document.createElement("div");
                div.className = "category_row button";
                div.innerHTML = child_nodes[k].category;
                div.addEventListener("click", SettingsMenu.select_category, true);
                div.style.lineHeight = SettingsMenu.center_panel.clientHeight / 5 + "px";
                SettingsMenu.current_list.appendChild(div);
            }
        }

        SettingsMenu.label.innerHTML = SettingsMenu.build_title_html();
        if (SettingsMenu.setting_tree.current != SettingsMenu.setting_tree.root) {
            SettingsMenu.up.innerHTML = "Up (" + SettingsMenu.setting_tree.current.parent.category + ")";
            //console.log(SettingsMenu.up.innerHTML);
        } else
        SettingsMenu.up.innerHTML = "";

        if (Editor.using_mobile) {
            SettingsMenu.current_list.style.setProperty('-webkit-transform', 'translate3d(0px,0px,0px)', null);
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
    }
    while (node != null);

    var sb = new StringBuilder();
    for (var k = 0; k < node_names.length; k++) {
        sb.append("<span class=\"rr_node button\" onclick=\"SettingsMenu_up(").append(node_names.length - 1 - k).append(");\">").append(node_names[k]).append("</span>");
        if (k != node_names.length - 1)
        //sb.append("  ·  ");
        //sb.append("  \u2023  ");	// arrow bullet
        sb.append("<span class=\"rr_node_delimiter\">  \u25b7  </span>");

    }

    //console.log(sb.toString());
    return sb.toString();
}

SettingsMenu.up = function(node_count) {
    if (SettingsMenu.setting_tree.current.parent != null) {
        if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
            SettingsMenu.center_panel.removeChild(SettingsMenu.current_grid);
            SettingsMenu.center_panel.appendChild(SettingsMenu.current_list);
        }
        SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.current.parent;
        SettingsMenu.populateCategoryList(SettingsMenu.current_list, SettingsMenu.setting_tree.current, 0);
    }

    return;
}

SettingsMenu_up = function(node_count) {
    if (node_count == 0) return;

    if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
        SettingsMenu.center_panel.removeChild(SettingsMenu.current_grid);
        SettingsMenu.center_panel.appendChild(SettingsMenu.current_list);
    }

    for (var k = 0; k < node_count; k++) {
        SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.current.parent;
    }
    SettingsMenu.populateCategoryList(SettingsMenu.current_list, SettingsMenu.setting_tree.current, 0);
}

SettingsMenu.select_category = function(e) {
    //console.log("selecting category");
    if (SettingsMenu.touch_moving == true) return;

    var category = e.currentTarget.innerHTML;
    //console.log(category);
    // figure out new current
    for (var k = 0; k < SettingsMenu.setting_tree.current.children.length; k++) {
        if (SettingsMenu.setting_tree.current.children[k] != undefined) {
            if (SettingsMenu.setting_tree.current.children[k].category == category) {
                SettingsMenu.setting_tree.current = SettingsMenu.setting_tree.current.children[k]
                break;
            }
        }
    }
    if (SettingsMenu.setting_tree != undefined) {
        if (SettingsMenu.setting_tree.current.children_type == NodeType.Category) SettingsMenu.populateCategoryList(SettingsMenu.current_list, SettingsMenu.setting_tree.current, 0);
        else if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
            SettingsMenu.populateSymbolGrid(SettingsMenu.current_grid, SettingsMenu.setting_tree.current, 0);
            SettingsMenu.center_panel.removeChild(SettingsMenu.current_list);
            SettingsMenu.center_panel.appendChild(SettingsMenu.current_grid);
        }
    }

}



SettingsMenu.populateSymbolGrid = function(grid_div, node, start_index) {
    var child_nodes = node.children;
    var node_index = start_index;
    if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
        var child_divs = grid_div.childNodes;
        while (child_divs.length > 0)
        grid_div.removeChild(child_divs.item(0));

        // add each cell node
        for (var k = 0; k < child_nodes.length; k++) {
            var div = document.createElement("div");
            div.className = "symbol_cell button";

            //console.log(child_nodes[k].symbol);
            var sb = new StringBuilder();
            sb.append(child_nodes[k].symbol);
            sb.append("<" + child_nodes[k].tag + " ");
            sb.append("type = \"" + child_nodes[k].type + "\" ");
            sb.append("targetid = \"" + child_nodes[k].name + "\" ");
            sb.append("id = \"" + child_nodes[k].id + "\" ");
            if (child_nodes[k].value != "") {
                var value = GetSettingValueById(child_nodes[k].id) == null ? child_nodes[k].defaultvalue : GetSettingValueById(child_nodes[k].id);
                if (value == false) {

                } else {

                    sb.append(child_nodes[k].value + " = \"" + value + "\" ");
                }
            }
            sb.append("name = \"" + child_nodes[k].nameTag + "\" ");
            sb.append("style = \"" + child_nodes[k].css + "\" ");
            sb.append("on" + child_nodes[k].event + "=\"" + child_nodes[k].functionName + child_nodes[k].type + "(this);\" ");
            sb.append(">");
            sb.append("</" + child_nodes[k].tag + " >");
            if (child_nodes[k].type != "number") {
                div.setAttribute("onclick", child_nodes[k].functionName + "(this); ")
            }
            div.innerHTML = sb;
            //console.log(child_nodes[k].symbol);
            div.style.lineHeight = SettingsMenu.center_panel.clientHeight / 3 + "px";
            // style template
            if (child_nodes[k].id == "themes"){
                div.style.lineHeight = SettingsMenu.center_panel.clientHeight / 5 + "px";
                div.style.width = "100%";
                buildList(div.childNodes[0], child_nodes[k].defaultvalue);
            }
            SettingsMenu.current_grid.appendChild(div);
        }

        SettingsMenu.label.innerHTML = SettingsMenu.build_title_html();
        if (SettingsMenu.setting_tree.current != SettingsMenu.setting_tree.root) SettingsMenu.up.innerHTML = "Up (" + SettingsMenu.setting_tree.current.parent.category + ")";
        // if(Editor.using_ipad || Editor.using_iphone)
        if (Editor.using_mobile) {
            SettingsMenu.current_grid.style.setProperty('-webkit-transform', 'translate3d(0px,0px,0px)', null);
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
        SettingsMenu.populateCategoryList(SettingsMenu.current_list, SettingsMenu.setting_tree.current, 0);
    }

    return;
}
//phan cua Crosshair

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
    for (var i = 0; i < radios.length; i++) {
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

function OptionCrossRadio(e) {
    OptionLayoutRadio(e);
}

//<<<<< style template
var list_style = new Array();
var index_style = 0;
function objStyle (id, background, stroke_color){
    this.id = id;
    this.background = background;
    this.stroke_color = stroke_color;
}

function buildList(node_style, default_value){
    list_style = new Array();
    var temp_index = -1;
    $.ajax({
        type: "POST",
        url: Editor.theme_server_url,
        dataType: "JSON",
        success: function(in_data) {			
            var themes =  eval(in_data);            
            $.each(themes, function(index, theme) {
                var id = theme.id;
                var name = theme.name;
                var bg = theme.background;
                var stroke_color = theme.strokeColor;
                if (node_style != null){
                    var optionNode = document.createElement("option");
                    optionNode.text = "Template " + index + " - " + name;
                    node_style.appendChild(optionNode);
                    list_style.push(new objStyle(id, bg, stroke_color));
                    if (id == default_value){
                        temp_index = index;
                    }
                }
                else if (id == default_value && node_style == null){
                    setStyle(bg, stroke_color, "");
                }
            });
            if (node_style != null){
                index_style = temp_index;
                node_style.selectedIndex = index_style;
            }
        }
    });
}

function optionStyle(e){
    return;
}

function optionStyleRadio(e) {
    OptionLayoutRadio(e);
}

function optionStylecombobox(e){
    index_style = e.selectedIndex;
    var bg = list_style[index_style].background;
    var stroke_color = list_style[index_style].stroke_color;
    var tupe = new Tuple("themes", list_style[index_style].id);
    UpdateSettingValue("themes", tupe);
    setStyle(bg, stroke_color, "");
}

function setStyle(color_bg, color_str, color_left){
    //<<<<< set background
    document.getElementById("equation_canvas").style.background = color_bg;
    //<<<<< set stroke
    Editor.selected_segment_color = color_str;
    //<<<<< set left
    //var left_id = document.getElementById("toolbar");
    //left_id.style.background = "-moz-linear-gradient(center left , " + color_left + ", ghostWhite, " + color_left + ")"; /* firefox */
    //left_id.style.background = "-webkit-gradient(linear, left top, right top, color-stop(0%," + color_left + "), color-stop(50%,ghostWhite), color-stop(100%," + color_left + "))"; /* webkit */
}

//phan cua layout

function OptionLayout(e) {
    SwitchStatusRadio(e);
    var radios = document.getElementsByName("layMenu");
    for (var i = 0; i < radios.length; i++) {

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

function OptionLayoutRadio(e) {
    var currentTag = document.getElementById(e.id);
    if (currentTag != undefined) {
        currentTag.checked = !currentTag.checked;
    }
}
//Thiet lap Setting Gesture Insert Interior

function OptionInterior(e) {
    SwitchStatusRadio(e);
    var radios = document.getElementsByName("radInterior");
    for (var i = 0; i < radios.length; i++) {
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

function OptionInteriorRadio(e) {
    OptionLayoutRadio(e);
}
//Thiet lap Setting Gesture Insert Extend

function OptionExtend(e) {
    SwitchStatusRadio(e);
    var radios = document.getElementsByName("radExtend");
    for (var i = 0; i < radios.length; i++) {
        var checked = radios[i].checked;
        var id = radios[i].getAttribute("id");
        if (checked == true && id == "autotrue") {
            Editor.extend = true;
            //console.log("hpham Editor.extend :" + Editor.extend);
        } else if (checked == true && id == "autofalse") {
            Editor.extend = false;
            //console.log("hpham Editor.extend:  " + Editor.extend);
        }
        var tupe = new Tuple(id, checked);
        UpdateSettingValue(id, tupe);
    }
}

function OptionExtendRadio(e) {
    OptionLayoutRadio(e);
}

// phan stroke

function OptionStroke(e) {
    SwitchStatusRadio(e);
    var radios = document.getElementsByName("radStroke");
    for (var i = 0; i < radios.length; i++) {
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
}

function OptionStrokeRadio(e) {
    OptionLayoutRadio(e);
}
//end phan stroke

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
    for (var i = 0; i < SettingsMenu.SettingValues.length; i++) {
        var t = SettingsMenu.SettingValues[i];
        if (t.item1 == id) {
            return t.item2;
        }
    }
    return null;
}

function UpdateSettingValue(id, tupe) {
    for (var i = 0; i < SettingsMenu.SettingValues.length; i++) {
        var t = SettingsMenu.SettingValues[i];
        if (t.item1 == id) {
            var currValue = SettingsMenu.SettingValues[i].item2;
            if (currValue != tupe.item2) {
                SettingsMenu.SettingValues[i].item2 = tupe.item2;
            }
            return;
        }
    }
    SettingsMenu.SettingValues.push(tupe);
    //for (var i = 0; i < SettingsMenu.SettingValues.length; i++) {
    //    var t = SettingsMenu.SettingValues[i];
    //    console.log(">>>>>>>>id, value:" + t.item1 + "," + t.item2);
    //}
}

function SwitchStatus(status, button, label) {
    var tupe = new Tuple(label, status);
    UpdateSettingValue(label, tupe);
    if (status == false) {
        document.getElementById(button).style.display = "none";
        // document.getElementById(divider).style.display = "none";
    } else {
        document.getElementById(button).style.display = "block";
        //document.getElementById(divider).style.display = "block";
    }
}

SettingsMenu.touchstart = function(e) {
    SettingsMenu.touch_start_position = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
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
        ////console.log("chieu dai " + SettingsMenu.current_list.childNodes.length);
        if (SettingsMenu.current_list.childNodes.length <= 5) return;
        to_move = SettingsMenu.current_list;

        to_move_height = SettingsMenu.current_list.childNodes.length * center_height / 5.0;
        ////console.log("do di chuyen " + to_move_height);
    } else if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
        if (SettingsMenu.current_grid.childNodes.length <= 9) return;
        to_move = SettingsMenu.current_grid;
        if (SettingsMenu.current_grid.childNodes.length % 3 != 0) to_move_height = (Math.floor(SettingsMenu.current_grid.childNodes.length / 3) + 1) * (center_height / 3.0);
        else
        to_move_height = Math.floor(SettingsMenu.current_grid.childNodes.length / 3) * (center_height / 3.0);
    }
    var touch_current_position = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
    var delta = Vector2.Subtract(touch_current_position, SettingsMenu.touch_start_position);

    SettingsMenu.div_speed = delta.y;

    var new_position = SettingsMenu.current_Y + delta.y;
    ////console.log("chieu dai y " + touch_current_position.y);
    if (new_position > 0) new_position = 0;
    if (new_position < (center_height - to_move_height)) new_position = center_height - to_move_height;

    SettingsMenu.current_Y = new_position;



    var sb = new StringBuilder();
    sb.append("translate3d(0px,").append(SettingsMenu.current_Y).append("px,0px)");
    to_move.style.setProperty('-webkit-transform', sb.toString(), null);
    //to_move.style.top = delta.y + "px";
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
        if (SettingsMenu.current_list.childNodes.length <= 5) return;
        to_move = SettingsMenu.current_list;

        to_move_height = SettingsMenu.current_list.childNodes.length * center_height / 5.0;
    } else if (SettingsMenu.setting_tree.current.children_type == NodeType.Symbol) {
        if (SettingsMenu.current_grid.childNodes.length <= 9) return;
        to_move = SettingsMenu.current_grid;
        if (SettingsMenu.current_grid.childNodes.length % 3 != 0) to_move_height = (Math.floor(SettingsMenu.current_grid.childNodes.length / 3) + 1) * (center_height / 3.0);
        else
        to_move_height = Math.floor(SettingsMenu.current_grid.childNodes.length / 3) * (center_height / 3.0);
    }

    var current_time = (new Date()).getTime();
    if (SettingsMenu.div_speed > 0) {
        SettingsMenu.div_speed -= (current_time - SettingsMenu.touchend_time) / 1000.0 * SettingsMenu.decelleration;
        if (SettingsMenu.div_speed < 0) SettingsMenu.div_speed = 0;
    } else if (SettingsMenu.div_speed < 0) {
        SettingsMenu.div_speed += (current_time - SettingsMenu.touchend_time) / 1000.0 * SettingsMenu.decelleration;
        if (SettingsMenu.div_speed > 0) SettingsMenu.div_speed = 0;
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
    sb.append("translate3d(0px,").append(SettingsMenu.current_Y).append("px,0px)");
    to_move.style.setProperty('-webkit-transform', sb.toString(), null);

    if (SettingsMenu.div_moving) {
        setTimeout(SettingsMenu.animate);
    }
