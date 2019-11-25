var xmlDoc;

function Segments(min) {
    this.points = new Array();
    this.mins = min;
    this.symbols = new Array();
    this.certainties = new Array();
}

Segments.prototype.Add = function(point) {
    this.points.push(point);
}

function Group() {
    this.segments = new Array();
    this._dashs = new Array();
    this.Fractions = new Array();
}

Group.prototype.PrintfFraction = function() {
    for (var k = 0; k < this.Fractions.length; k++) {
        //console.log("phan so " + this.Fractions[k].toString());
    }
}
Group.prototype.AddList = function(in_segments) {
    for (var k = 0; k < in_segments.length; k++) {
        this.Add(in_segments[k]);
    }
}

Group.prototype.isExistsFrac = function() {
    for (var k = 0; k < this.segments.length; k++) {
        if (this.segments[k].symbol == "frac") return true;
    }
    return false;
}

Group.prototype.isHeart = function() {
    for (var k = 0; k < this.segments.length; k++) {
        if (this.segments[k] == undefined) continue;
        if (Gestures.isSegmentHeart(this.segments[k])) return true;
    }
    return false;
}

Group.prototype.isExistsDash = function() {
    var bBool = false;
    if (this.segments.length == 1) {
        if (this.segments[0].symbol == "_dash") {
            return true;
        }
    }
    return bBool;
}

Group.prototype.isExistsLparen = function(){
    for(var k = 0;k < this.segments.length;k++){
        if(this.segments[k].symbol == "_lparen")
            return true;
    }
    return false;
}

Group.prototype.isExistsRparen = function(){
    for(var k = this.segments.length - 1;k >= 0;k--){
        if(this.segments[k].symbol == "_rparen")
            return true;
    }
    return false;
}

Group.prototype.isExists = function() {
    if (this.isExistsDash() || this.isExistsEqual() || this.isExistsPlus() || this.isExistsFrac() || this.isHeart()) {
        return true;
    }
    return false;
}

Group.prototype.isExistsEqual = function() {
    var bBool = false;
    if (this.segments.length == 2) {
        if (this.segments[0].symbol == this.segments[1].symbol && this.segments[1].symbol == "_equal") {

            bBool = true;
        }
    }
    return bBool;
}

Group.prototype.isExistsPlus = function() {
    var bBool = false;
    if (this.segments.length == 2) {
        if (this.segments[0].symbol == this.segments[1].symbol && (this.segments[1].symbol == "_plus")) {
            bBool = true;
        }
    }
    return bBool;
}

Group.prototype.printf = function() {
    var s = "";
    for (var k = 0; k < this.segments.length; k++) {
        s = s + " ( " + this.segments[k].symbol + "," + this.segments[k].set_id + " )";
    }
}

Group.prototype.PrintfSegment = function() {
    if (this.segments.length > 0) {
        Fractions.printf(this.segments);
    }
}

Group.prototype.isUndefined = function() {
    if (this.segments.length == 0) return false;
    for (var k = 0; k < this.segments.length; k++) {
        if (this.segments[k].symbol != undefined) return true;
    }
    return false;
}
//
Group.prototype.maxGroup = function() {
    var max = 0;
    if (this.segments.length > 0) {
        max = this.segments[0].worldMaxPosition().x;
        for (var k = 1; k < this.segments.length; k++) {
            if (max < this.segments[k].worldMaxPosition().x) {
                max = this.segments[k].worldMaxPosition().x;
            }
        }
    }
    return max;
}

Group.prototype.maxY = function() {
    var max = 0;
    if (this.segments.length > 0) {
        max = this.segments[0].worldMaxPosition().y;
        for (var k = 1; k < this.segments.length; k++) {
            if (max < this.segments[k].worldMaxPosition().y) {
                max = this.segments[k].worldMaxPosition().y;
            }
        }
    }
    return max;
}

Group.prototype.minGroup = function() {
    var min = 0;
    if (this.segments.length > 0) {
        min = this.segments[0].worldMinPosition().x;
        for (var k = 1; k < this.segments.length; k++) {
            if (min > this.segments[k].worldMinPosition().x) {
                min = this.segments[k].worldMinPosition().x;
            }
        }

    }
    return min;
}

Group.prototype.minPosition = function() {
    var min = new Vector2(0, 0);
    if (this.segments.length > 0) {
        var xMin = this.segments[0].worldMinPosition().x;
        var yMin = this.segments[0].worldMinPosition().y;
        for (var k = 1; k < this.segments.length; k++) {
            if (xMin > this.segments[k].worldMinPosition().x) {
                xMin = this.segments[k].worldMinPosition().x;
            }
            if (yMin > this.segments[k].worldMinPosition().y) {
                yMin = this.segments[k].worldMinPosition().y;
            }
        }
        min = new Vector2(xMin, yMin);
    }
    return min;
}

Group.prototype.maxPosition = function() {
    var max = new Vector2(0, 0);
    if (this.segments.length > 0) {
        var xMax = this.segments[0].worldMaxPosition().x;
        var yMax = this.segments[0].worldMaxPosition().y;
        for (var k = 1; k < this.segments.length; k++) {
            if (xMax < this.segments[k].worldMaxPosition().x) {
                xMax = this.segments[k].worldMaxPosition().x;
            }
            if (xMax < this.segments[k].worldMaxPosition().y) {
                yMax = this.segments[k].worldMaxPosition().y;
            }
        }
        max = new Vector2(xMax, yMax);
    }
    return max;
}

Group.prototype.removeSegment = function() {
    var i = 0;
    while (i < this.segments.length) {
        var seg = this.segments[i];
        if (seg.symbol == undefined) {
            for (var j = i; j < this.segments.length - 1; j++) {
                this.segments[j] = this.segments[j + 1];
            }
            this.segments.pop();
        } else
        i++;
    }
}

Group.prototype.minY = function() {
    var min = 0;
    if (this.segments.length > 0) {
        min = this.segments[0].worldMinPosition().y;
        for (var k = 1; k < this.segments.length; k++) {
            if (min > this.segments[k].worldMinPosition().y) {
                min = this.segments[k].worldMinPosition().y;
            }
        }

    }
    return min;
}

Group.prototype.AddFrac = function(in_Frac) {
    if (this.Fractions.contains(in_Frac)) {
        return;
    }
    this.Fractions.push(in_Frac);
}

Group.prototype.AddListFrac = function(in_Fracs){
    for(var k = 0;k < in_Fracs.length;k++){
        this.AddFrac(in_Fracs[k]);
    }
}

Group.prototype.Add = function(in_segment) {
    if (this.segments.contains(in_segment)) return;
    if (in_segment.symbol == "_dash" || in_segment.symbol == "frac") { 
        this._dashs.push(in_segment);
    }
    this.segments.push(in_segment);
}

function Fracs(fracs, in_segments) {
    var arrtemp = new Array();
    for (var k = 0; k < fracs.length; k++) {
        var num = new Array();
        var deni = new Array();
        for (var i = 0; i < in_segments.length; i++) {
            var seg = in_segments[i];
            if (seg.set_id == fracs[k].set_id) continue;
            var mFrac = Space.isExistsFrac(fracs[k], seg.worldMinPosition(), seg.worldMaxPosition());
            if (mFrac == 1) {
                num.push(seg);
            } else if (mFrac == 2) {
                deni.push(seg);
            }
        }

        if (num.length > 0 || deni.length > 0) {
            fracs[k].symbol = "frac";
            arrtemp.push(fracs[k]);
        }
    }

    return arrtemp;
}

Group.prototype.Sort = function() {
    //sap xep tang dan
    this._dashs = Fractions.Sort(this._dashs);
    this.segments = Fractions.Sort(this.segments); 
    var temp = this._dashs;
    this._dashs = Fracs(this._dashs, this.segments);
    this.segments = Sort(this._dashs, this.segments);
    this._dashs = Gestures.Sort(this._dashs);
}

function Sort(fracs, in_segments) {
    var j = 0;
    var arrtemp = new Array();
    Fractions.UpdateStatus(fracs, in_segments);
    for (var k = 0; k < fracs.length; k++) {
        var num = new Array();
        for (var i = j; i < in_segments.length; i++) {
            var seg = in_segments[i];
            if (
            fracs[k].worldMinPosition().x <= seg.worldMinPosition().x + seg.size.x / 2 && fracs[k].worldMaxPosition().x >= seg.worldMaxPosition().x - seg.size.x / 2) {
                if (fracs[k].worldMinPosition().y > seg.worldMaxPosition().y) {
                    num.push(seg);
                } else if (fracs[k].worldMaxPosition().y < seg.worldMinPosition().y) {
                    j = i;
                    break;
                }
            }
        }
        if (num.length > 0) {
            num = Gestures.Sort(num);
            for (var m = 0; m < num.length; m++) {
                arrtemp.push(num[m]);
            }
            arrtemp.push(fracs[k]);
        }
    }
    var temp = new Array();
    for (var k = j; k < in_segments.length; k++) {
        temp.push(in_segments[k]);
    }
    temp = Gestures.Sort(temp);
    for (var k = 0; k < temp.length; k++) {
        arrtemp.push(temp[k]);
    }
    return arrtemp;
}

function Expression(idExpress) {
    this.idExpress = idExpress;
    this.groups = new Array();
}

Expression.prototype.Add = function(group) {
    this.groups.push(group);
}

function loadFileXml(xmlFile) {
    var xmlHttp;
    var doc;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlHttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlHttp.open("GET", xmlFile, false);
    xmlHttp.send();
    xmlDoc = xmlHttp.responseXML;
    doc = xmlDoc;
    return doc;
}

function LoadXML(xmlFile, index, ArrExpression, data_segment) {
    var x = xmlFile.getElementsByTagName("segments");
    
    if (x.length - 1 >= parseInt(FormulaMenu.check_value) || parseInt(ExercisesMenu.check_value) != -1 || Keyboard.isKeyboard) {
       
        for (var j = 0; j < x.length; j++) {
            var idSegment = 0;
            var express = new Expression(idSegment);
            var group = x[j].getElementsByTagName("group");

            for (var m = 0; m < group.length; m++) {
                var read = new Group(); //group  
                var values = group[m].getElementsByTagName("points")[0].childNodes[0].nodeValue;
                var arr = values.split('-');
                var mins = group[m].getElementsByTagName("minPos")[0].childNodes[0].nodeValue;
                var symbols = Fractions.Trim(group[m].getElementsByTagName("symbols")[0].childNodes[0].nodeValue);
                var scale = group[m].getElementsByTagName("scale")[0].childNodes[0].nodeValue;
                var arrMins = mins.split('-');
                for (var i = 0; i < arr.length; i++) {
                    var arrPMin = arrMins[i].split(',');
                    var pMin = new Vector2(parseInt(arrPMin[0]), parseInt(arrPMin[1]));
                    var seg = new Segments(pMin);
                    var arrPoint = arr[i].split('|');
                    for (var k = 0; k < arrPoint.length; k++) {
                        var arrP = arrPoint[k].split(',');
                        var xx = parseInt(arrP[0]);
                        var yy = parseInt(arrP[1]);
                        var p = new Vector2(xx, yy);
                        var pointSeg = Vector2.Add(p, pMin);
                        seg.Add(pointSeg);
                    }
                    seg.symbols.push(symbols.replace("frac", "_dash"));
                    seg.certainties.push(scale);

                    read.Add(seg); //them tung segment tao thanh nhom
                }
                express.Add(read); //them mot nhom vao bieu thuc
            }
            Formula.Add(express, ArrExpression);
        }
        FormulaMenu.Hide();
        Formula.WriteSegment(index, ArrExpression, data_segment);
    }
    else
        alert("Bieu thuc chua ton tai. Vui long chon lai!");
}

Formula.ArrExpression = new Array();
Formula.data_segment = new Array();

function Formula() {

}

Formula.Add = function(redSegment, array) {
    if (array.contains(redSegment)) return;
    array.push(redSegment);
}

Formula.clear = function(arrays) {
    while (arrays.length > 0) {
        arrays.pop();
    }
    arrays.length = 0;
}
Formula.offsetMins = function(grpSegments) {
    var offsets = new Array();
    for (var i = 0; i < grpSegments.length; i++) {
        var mins = grpSegments[i].mins;
        if (i > 0) {
            var offsetX = mins.x - grpSegments[0].mins.x;
            var offsetY = mins.y - grpSegments[0].mins.y;
            var vector = new Vector2(offsetX, offsetY);
            offsets.push(vector);
        }
    }
    return offsets;
}
/*****************************************************************************/
Formula.WriteSegment = function(index, arrexpression, data_segment) {
/*****************************************************************************/
var avg = Keyboard.getAvgHeight();
Gestures.state = 3;
var groups = arrexpression[index].groups;
for (var m = 0; m < groups.length; m++) {
    var groups_selects = new Array(), symbols = new Array(), cer = new Array()
    ,   preMin = null;
    var l = groups[m].segments.length;
    var test = groups[m].segments.clone();
    var offsets = Formula.offsetMins(groups[m].segments);
    for (var i = 0; i < groups[m].segments.length; i++) {
        var points = groups[m].segments[i].points;
        var mins = groups[m].segments[i].mins;
        //var avg = 0;
            
        if (Keyboard.isKeyboard) {
            var positions = new Vector2(0, 0);
            if (Editor.using_mobile){
                if (Editor.Exercises.change_layout) {
                    if (Editor.mouse_position_first.x > Editor.mouse_position_second.x) {
                      positions = Editor.mouse_position_second; }
                    else if (Editor.mouse_position_first.x < Editor.mouse_position_second.x){
                      positions = Editor.mouse_position_second; } } }
            else { positions = Editor.mouse_position; }
            if (i != 0) {
                mins.x = positions.x + offsets[i - 1].x;
                mins.y = positions.y + offsets[i - 1].y;
            } else {
                mins.x = positions.x;
                mins.y = positions.y;            }        }

        var symbol = groups[m].segments[i].symbols[0];
        Editor.current_stroke = new PenStroke(points[0].x, points[0].y, 8);
        Editor.add_segment(Editor.current_stroke);
        for (var j = 0; j < points.length; j++) 
            Editor.current_stroke.add_point(points[j]);
        var tmpScale = parseFloat(groups[m].segments[i].certainties[0]);
        var f_scale = new Vector2(tmpScale, tmpScale);
        var checkSuccess = false;
        if (Keyboard.isKeyboard) 
             checkSuccess = Editor.current_stroke.finish_stroke(mins, f_scale);
        else checkSuccess = Editor.current_stroke.finish_stroke(mins, f_scale);

        if (checkSuccess) {
            groups_selects.push(Editor.current_stroke);
            symbols.push(symbol);
            cer.push(1); }
         else { Editor.segments.pop(); }
        data_segment.push(Editor.current_stroke);
        Editor.current_stroke = null;
    }
    if (groups_selects.length > 0) {
        var g = new Group();
        g.AddList(Formula.Copy(groups_selects, symbols, cer));
        var height = g.maxY() - g.minY();
        if (Keyboard.isKeyboard) {
            var scale;
            if (avg == 0 || symbols[0]== "dots" || symbols[0] == ".") 
                              scale = 1;
            else if (avg > 0) scale = height / avg;
            Gestures.ZoomFence(g.segments, true, scale);
            if (Editor.Exercises.change_layout){
                var center = new Vector2.Add(g.maxPosition(), g.minPosition());
                center = new Vector2(center.x/2 , center.y /2);
                for (var i = 0; i < g.segments.length; i++){
                    var seg = g.segments[i];
                    var trans = new Vector2.Subtract(positions, center);
                    seg.translate(trans);
                    seg.render();                } } } }
} // end for m
var action;
if (Keyboard.isKeyboard)
     action = new ActionSegments(Keyboard.data_segment, false, Editor.DataSegments);
else action = new ActionSegments( Formula.data_segment, false, Editor.DataSegments);
action.Apply();
Editor.add_action(action);
if (Flottom.Exp.is_create){
    if (Flottom.Exp.flag == 0) {
        Flottom.Exp.stroke_paren.push([action, 0]);
        Editor.undo_stack.pop(); }
    else {
        Flottom.Exp.stroke_paren.push([action, 1]);
        Editor.undo_stack.pop();    } }
delete Formula.data_segment;
Formula.data_segment = new Array();
delete Keyboard.data_segment;
Keyboard.data_segment = new Array();
}
Formula.Copy = function(groups, symbols, cers, status) {
    var set_id = Segment.set_count++;
    var bBool = false;
    var instance_ids = new Array();
    var l = groups.length;
    var sts = false;
    sts = l >= 2 ? true : false;
    for (var k = 0; k < groups.length; k++) {
        groups[k].set_id = set_id;
        instance_ids.push(groups[k].instance_id);
        groups[k].symbol = Fractions.Trim(symbols[0]);
        groups[k].flag = sts;
    }
    RecognitionManager.result_table.push(Group.recognionManager(instance_ids, symbols, cers, set_id));
    if (status == true) {
        var action = new ActionSegments(groups, true, Editor.CopySegments); //segHeart //Gestures.copy_segments        
        var index = -1;
        for (var k = 0; k < groups.length; k++) {
            index = -1;
            if (k == 0) {
                index = AutoGroup.FindActionCopy(set_id);
                if (index == -1) {
                    index = AutoGroup.FindAction(set_id);
                }
                if (index != -1) {
                    Editor.undo_stack[index] = action;
                }
            } else {
                index = AutoGroup.FindAction(set_id);
                AutoGroup.removeAction(index);
            }
        }
    }
    return groups;
}

Formula.GroupCopy = function(in_segment, segments) {
    for (var k = 0; k < segments.length; k++) {
        segments[k].set_id = in_segment.set_id;
    }
    for (var i = 1; i < Editor.segments.length; i++) {
        var value = Editor.segments[i];
        for (var j = i - 1; j >= 0 && Editor.segments[j].set_id > value.set_id; j--)
        Editor.segments[j + 1] = Editor.segments[j];
        Editor.segments[j + 1] = value;
    }
}

Formula.groupExpress = function(groups) {
    if (groups.length == 0) return;
    if (groups.length == 1) {
        RecognitionManager.enqueueSegment(groups[0]);
        return;
    }
    var set_id = Segment.set_count++;

    for (var k = 0; k < groups.length; k++) {
        groups[k].set_id = set_id;
    }
    RecognitionManager.classify(set_id, false);
    RenderManager.render();
    return;
}

Group.recognionManager = function(instance_ids, symbols, cers, set_id) {
    var reccongni = new RecognitionResult();
    var certainties = new Array();
    var resuits = symbols.length;
    symbols = symbols;
    certainties = cers;
    reccongni.Add(symbols, certainties, resuits, instance_ids, set_id);
    return reccongni;
}

Group.printfS = function() {
/*
	for (var k = 0; k < Editor.segments.length; k++) {
        //console.log("k = " + k + " set_id " + Editor.segments[k].set_id);
    }
    //console.log(" RecognitionManager.result_table ");
    for (var k = 0; k < RecognitionManager.result_table.length; k++) {
        //console.log("k = " + k + " set_id " + RecognitionManager.result_table[k].set_id);
    }
 */   
}
//======================Popup Menu=====================

function FormulaMenu() {

}

FormulaMenu.check_value = null;

FormulaMenu.initialize = function() {
    FormulaMenu.close_button = document.getElementById("fm_close_button");
    FormulaMenu.close_button.addEventListener("click", FormulaMenu.Hide, true);
    FormulaMenu.submit_button = document.getElementById("submitFm");
    FormulaMenu.submit_button.addEventListener("click", FormulaMenu.Submit, true);
    FormulaMenu.menu = document.getElementById("formula_menu");
    FormulaMenu.oprator = document.getElementById("oprator");
}

FormulaMenu.Hide = function() {
    Editor.clearButtonOverlays();
    Editor.rectangleSelectionTool();
    FormulaMenu.menu.style.display = "none";
}

FormulaMenu.Show = function() {
    Editor.state = EditorState.Relabeling;
    FormulaMenu.menu.style.display = "block";
}

FormulaMenu.Check = function(value) {
    FormulaMenu.check_value = value;
    var int_value = parseInt(FormulaMenu.check_value);
    var xmlDoc = loadFileXml("formula.xml");
    LoadXML(xmlDoc, int_value, Formula.ArrExpression, Formula.data_segment);
}

//============================================phan chon bai tap===========================================

function ExercisesMenu() {

}

ExercisesMenu.check_value = null;
ExercisesMenu.is_request=false;

ExercisesMenu.initialize = function() {
    Exercise.ArrExpression = new Array();
    Exercise.data_segment = new Array();
}

ExercisesMenu.opentree =function(eventname){
    try{
       load_open_tree(eventname);
    //$('#lnk-exercise').popup('open');    
    }
    catch(e){
        console.log("error at opentree");
    }
    
}

ExercisesMenu.selected = function() {
    Exercise.selected = true;
    Exercise.clearall();
    var index = ExercisesMenu.select_exercise.selectedIndex;
    ExercisesMenu.check_value = ExercisesMenu.select_exercise[index].value;
    var int_value = parseInt(ExercisesMenu.check_value);
    if(int_value != Exercise.current.exercise_id) 
       ExercisesMenu.select_acion(int_value);
}

ExercisesMenu.scroll_popup;
ExercisesMenu.loaded = function(){
    ExercisesMenu.scroll_popup= new iScroll('div-popup');
}


ExercisesMenu.selected_tree = function(exercise_curr) {
    Editor.ajaxLoader("visible");
    ExercisesMenu.recent(exercise_curr)
    Exercise.selected = true;
    Exercise.clearall();
    ExercisesMenu.settings();
    if(exercise_curr.variable && exercise_curr.variable.toLowerCase() != "null")
       SysEquations.s_variable = exercise_curr.variable.trim();
    else SysEquations.s_variable = "";
    if(exercise_curr.version>0){
        ExercisesMenu.restore(SettingsMenu.user,exercise_curr.exercise_id,
                                exercise_curr.version);
        Exercises.id_select = parseInt(exercise_curr.exercise_id);
        Exercises.id_default = parseInt(exercise_curr.exercise_id);
        HistorySegments.version = exercise_curr.version;
    }
    else ExercisesMenu.select_acion(exercise_curr.exercise_id);
}

ExercisesMenu.restore = function(userid,exerciseid,version){
   var param ={'exerciseid': exerciseid, 'action': 'xizinfo' };
   $.ajax({
      url : Editor.url_exercises,
      type : "POST",
      dataType: 'json',
      data : param,
      async: false,
      cache : false,
      success : function(data){
         var exercise = eval(data);
         if(exercise.skip_corx == "true"){
            if(Editor.ExerciseSkip.indexOf(Editor.SkipValues.Corx) == -1)
               Editor.ExerciseSkip += Editor.SkipValues.Corx;
         }
         else{
            var re = new RegExp(Editor.SkipValues.Corx,"g");
            Editor.ExerciseSkip = Editor.SettingSkip.replace(re,'');
         }
         var data ={'exerciseid': exerciseid, 'userid': userid, 'version':version };
         $.ajax({
             url: Editor.url_exercises,
             type: 'POST',
             dataType: 'json',
             data: data
         })
         .done(function(data) {
           ExercisesMenu.restore_select(data,version, exerciseid);
         })
         .fail(function(xmlhttp) {
             console.log("Loading histories in ExercisesMenu.restore --> error");
             isAjaxSessionTimeOut(xmlhttp);
         })
         .always(function() {
            SkipCorxUIDisplay();
            ExercisesMenu.showXizInfo(exercise.content, exercise.friendly_id, Exercise.current.version);
         });
      },error : function(err) {
         Editor.ExerciseSkip = '';
         if(!isAjaxSessionTimeOut(err))
            alert("Unable to get Exercise info now, please try it later!");
    }});
}
ExercisesMenu.settings = function(){
   var str_locations = window.location;
   var str_mode = /standalone/;
   if (str_locations.toString().match(str_mode) != null)
       SettingsMenu.mode = str_locations.toString().match(str_mode).toString();
   if (SettingsMenu.user == "anonymous" || SettingsMenu.mode == "standalone"){
               Editor.mod_history = false;
               document.getElementById("lhint").style.visibility = "hidden";
               document.getElementById("hint").parentNode.style.display = "none";
   }
   else {
      var hide_node = document.getElementById("selectexes");
      hide_node.style.visibility = "hidden";
      document.getElementById("lhint").style.visibility = "visible";
      document.getElementById("lhint").innerHTML = "";
      
      Editor.mod_history = true;
      //g: rm 
      /*
      Exercises.id_default = 8;
      if(Exercises.id_default != Exercise.current.exercise_id) 
         ExercisesMenu.select_acion( Exercises.id_default );
         */
   }
}


ExercisesMenu.recent =function(exercise_curr)
{
    if(Exercise.recent)
    {
        ExercisesMenu.removeRecent(exercise_curr);
         if(Exercise.recent.length>=3)
        {
         Exercise.recent.splice(3,Exercise.recent.length-3);
        }
    }
   var temp =(JSON.parse(JSON.stringify(exercise_curr)));
   if(Exercise.recent){
        Exercise.recent.unshift(temp);
   }
   else{
    Exercise.recent=[];
        Exercise.recent.push(temp);
   }
    
    localStorage.setItem(Exercise.C_RECENT, JSON.stringify(Exercise.recent));   
}
ExercisesMenu.problemSelect = function()
{
    var search =$('#txt-problem').val();
    if(search)
    {
       var result = _.find(folder_exers,function(item){
            return item.xiznum.indexOf(search)>=0;
        });
       if(result)
       {
        Exercise.current.index =1;
        Exercise.current.latex =result.latex;
        Exercise.current.variable =result.variable;
        Exercise.current.folder_id=init_folder.parent_prefix+result.folderId;
        Exercise.current.content=result.exerciseName;
        Exercise.current.exercise_id = result.exerciseId;
        Exercise.current.xiznum= result.xiznum;
        ExercisesMenu.selected_tree(Exercise.current);
       }
    }
}


ExercisesMenu.BuildRecentList = function()
{//<span id="mathfont<%=index%>"><%=item.content%></span>
   var temp ='<%_.each(recent,function(item,index){%>'
        +'<li id="recent<%=index%>" class="ui-li ui-li-static ui-btn-up-c" onclick="ExercisesMenu.recentSelect(<%=item.exercise_id%>,\'<%=item.folder_id%>\',\'recent<%=index%>\')">'
        +'<fieldset class="ui-grid-a">'
        +'<div class="ui-block-a title-l" style="width:100%;">'
        +'<%=item.folder_id%>_<%=item.friendly_id%>'
        +'<span id="mathfont<%=index%>"><%=item.content%></span></div>'
        +'</fieldset>'
        +'</li>'
        +'<%})%>';
    var html =_.template(temp,{'recent':Exercise.recent});
    $('#lst_recent').empty();
    $('#lst_recent').append(html);
    $( "#lst_recent li:nth-child(1)" ).addClass('ui-first-child');
    $( "#lst_recent li:last-child" ).addClass('ui-last-child');
    
    if(Exercise.recent && Exercise.recent.length)
    {
        for(var i=0;i<Exercise.recent.length;i++)
        {
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,"mathfont"+i]);
        }
        $("#treecontrol a:eq(0)").click();
        var folder_id =Exercise.recent[0].folder_id
        var f_e_id = folder_id.replace(/\D/g,'');
       _.find(folder_exers,function(item){
            if(item.id ==f_e_id)
            {
                $("#lnk-exercise").html(item.folderName) ;         
                return true;
            }
        });
        
    }
    $('#lst_recent').listview('refresh');
    $("#treecontrol").css('display','none');
}
/*****************************************************************************/
ExercisesMenu.recentSelect = function(exercise_id,folder_id,li_id)
{
    if(ExercisesMenu.is_request)
    {
        return;
    }
    $('#lst_recent li').removeClass('ui-btn-down-f');
    $('#'+li_id).addClass('ui-btn-down-f') ;  
    var current = _.find(Exercise.recent,function(item){
        return item.folder_id==folder_id&& item.exercise_id==exercise_id;
    });

    Exercise.current = current;

    ExercisesMenu.selected_tree(Exercise.current);
}
/*****************************************************************************/
ExercisesMenu.showXizInfo = function(content, friendly_id, version)           {
   var intro = "EX:" + friendly_id ;
   if(content) intro += " "+content;
   if(version>1) intro += " Ver:"+version;
   $("#instruction-xiz-info").html(intro);                                    }
/*****************************************************************************/
ExercisesMenu.removeRecent = function(duplicate)
{
    var index =-1;
    if(Exercise.recent){
        for(var i=0;i<Exercise.recent.length;i++){
            var item = Exercise.recent[i];
            
            if(duplicate.folder_id==item.folder_id 
                && duplicate.exercise_id==item.exercise_id ){
                index = i;
                break;
            }
        }    
        if(index>=0){
            Exercise.recent.splice(index,1);
        }
    }
}

/*******************************************************************************
* INTENT: move the server output of steps into the HistorySegments via 
*         HS.TableList()
* INPUT:  array of json objects, one for each step.  
*         see the output of exercise.jsp
* OUTPUT: calls HS.TableList() to change swipeR div's which displays Steps
*******************************************************************************/
ExercisesMenu.restore_select = function(response,version,exerciseid)           {
/******************************************************************************/
count=0;
var Exercises = eval(response);
HistorySegments.setIdCurrHis = new Array();
var latexs = new Array();
var sLatex = new Array();
var sb = new StringBuilder();

$.each(Exercises, function(in_dex, Exercise) {
   var segs = new Array();
   for ( var k = 0; k < Editor.segments.length;k++) 
       segs.push(Editor.segments[k]);
   var action = new ActionSegments(segs, false, Editor.DeleteSegments);
   action.Apply();
   RenderManager.render();

   var xmldoc = new DOMParser().parseFromString(Exercise.stroke, "text/xml");
   id = parseInt(Exercise.id);
   activeMathId = Exercise.amid;
   Exercises.id_activeMath = Exercise.amid;
   Exercise.ArrExpression = new Array();
   Exercise.data_segment = new Array();

   LoadXML(xmldoc, 0, Exercise.ArrExpression, Exercise.data_segment);
   Editor.translateCenter(Editor.segments);

   var latex = Exercise.formula.replace(/\\\\/g,"\\");//g 
   var list_latex = new Array();
   Exercises.id_select = Exercise.sessionId;
   HistorySegments.StepTo= Exercise.stepTo;
   var arrString = latex.split("$$");
   var image_nodes = new Array();
   var temp_text ="";
   for(var k = 0;k < arrString.length;k++)                                  {
      if (arrString[k])                                                     {
         arrString[k] = arrString[k].replace(/\$/gm, "")
         list_latex.push(arrString[k]);                                     }
      image_nodes.push("data:image/png;base64");                            }
   sLatex = list_latex;
   latexs.push(latex);
   var color_node = xmldoc.getElementsByTagName("color");
   
   try { 
	   if ( color_node.length >=1 )
		   HistorySegments.check_step = (color_node[0].childNodes[0].nodeValue=="green") ? true : false;
	   else
		   HistorySegments.check_step = false;
   }catch(e) { console.log("color err " + e);                                }

   
	   
   if(in_dex==0)                                                            {
      HistorySegments.check_delete = false;
      Editor.Exercises.current = new Editor.Exercises(Editor.segments
      ,   SysEquations.Expressions);
      Editor.Exercises.current.importExercises();
      Editor.undo_stack.pop();
      ResizeTo.Layout(Editor.Exercises.change_layout);                      }
   else { count ++; }
   HistorySegments.TableList(list_latex, null, Exercise.proc_skipped);
   HistorySegments.list_segments[HistorySegments.index].id = in_dex;
   HistorySegments.list_segments[HistorySegments.index]
   .   historiesId  =  Exercises[HistorySegments.index].id;
   Editor.updateMathFont( list_latex );
   Editor.undo_stack.pop();

   if (Editor.am_correction && HistorySegments.is_finish)
      Editor.inserPoint(); 

   MagnifyingGlass.node_box.style.display = "none";
   if (MagnifyingGlass.manage_svg != null) {
      $(MagnifyingGlass.manage_svg).remove();
      MagnifyingGlass.manage_svg = null;
      MagnifyingGlass.manage_g = null;         
   } });           // end $.each,     pausecomp(10000);

Exercise.selected = false;
if(HistorySegments.list_segments.length >0)
	HistorySegments.writeBlankStep();

Exercises.id_select = parseInt(exerciseid);
Exercises.id_default = parseInt(exerciseid);
HistorySegments.version = version;
Editor.ajaxLoader("hidden");
}
//TODO: lay bai tap
ExercisesMenu.select_acion = function(value){
    Exercises.id_default = value;
    var id = 0;
	var activeMathId = "";
    var geturl;
    if (value != -1) {
        geturl = $.ajax({
            type: "POST",
            url: Editor.url_exercises,
            data: { exerId: value, userId: SettingsMenu.user },
            success: function(response, textStatus, xmlhttp) {
               if(isAjaxSessionTimeOut(xmlhttp)) return;
               if(response!=""){
                var Exercises = eval(response);
                $.each(Exercises, function(in_dex, Exercise) {
	                //case: new version. Data returned: [{"exerciseid":6,"userid":67,"version":7}]
	                if( Exercise.version != undefined){
	                	data_open_tree.versions.push(Exercise);
	                    var exer =_(data_open_tree.exers).find(function(item){
	                    	return item.exerciseId == Exercise.exerciseid;
	                    });
	                    if(exer){
	                    	ExercisesMenu.is_request = false;
	                    	
	                    	if(Exercise.version>0)
	                    	   select_exercise_open_tree(exer,Exercise.version);
	                    	else console.log("ExercisesMenu.select_acion, Exercise.version <1");
	                    	
	                    	var node = $('#browser').tree('getNodeById', global_exercise_tree);
	                    	var exerVers = get_version_by_exercise_id(Exercise.exerciseid);
	                    	if(exerVers.length) 
	                    		$('#browser').tree('loadData',exerVers, node);	
	                    }
	                }
	                else{
	                    var xmldoc = new DOMParser().parseFromString(Exercise.stroke, "text/xml");
	                    id = parseInt(Exercise.id);
						activeMathId = Exercise.amid;
						Exercises.id_activeMath = Exercise.amid;
	                    ExercisesMenu.check_value = value;
	                    delete Exercise.ArrExpression;
	                    Exercise.ArrExpression = new Array();
	                    delete Exercise.data_segment;
	                    Exercise.data_segment = new Array();
	                    LoadXML(xmldoc, 0, Exercise.ArrExpression, Exercise.data_segment);
	                    
	                    Editor.translateCenter(Editor.segments);

	                    Editor.Exercises.current = new Editor.Exercises(Editor.segments, SysEquations.Expressions);
	                    Editor.Exercises.current.importExercises();
	                    Editor.undo_stack.pop();
	                    ResizeTo.Layout(Editor.Exercises.change_layout);

	                    MagnifyingGlass.node_box.style.display = "none";
	                    if (MagnifyingGlass.manage_svg != null) {
	                        $(MagnifyingGlass.manage_svg).remove();
	                        MagnifyingGlass.manage_svg = null;
	                        MagnifyingGlass.manage_g = null;                    }
	                }                 	
                }); // end $.each
                Exercise.selected = false;
               }else Editor.ajaxLoader("hidden");        }});  // end success, $.ajax
    }
}

///=============================================================================
function Exercise() {

}
Exercise.current ={"index":0,"latex":"","variable":"","folder_id":"",
"content":"","exercise_id":0,"friendly_id":"","xiznum":"","version":""};
Exercise.recent = [];
Exercise.C_RECENT="Recent";

Exercise.selected = false;

Exercise.clearall = function() {
    
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    delete Editor.arr_seg_select;
    Editor.arr_seg_select = new Array();
    delete Editor.arr_seg_set_field;
    Editor.arr_seg_set_field = new Array();
    Exercises.PhraseFormats=[];
    Substitute.initialize();
    Flottom.initialize();
    HistorySegments.animation_length = 0.25;
    delete HistorySegments.list_segments;
    HistorySegments.list_segments = new Array();
    delete HistorySegments.list_step_wrong;
    HistorySegments.list_step_wrong = new Array();
    delete HistorySegments.current_seg;
    HistorySegments.current_seg = new Array();
    delete HistorySegments.preLatex;
    HistorySegments.preLatex = null;
    HistorySegments.status = false;
    HistorySegments.index = -1;
    HistorySegments.block;
    HistorySegments.current;
    HistorySegments.current_index = -1;
    HistorySegments.currMaxima = null;
    HistorySegments.sum_height = 0;
    HistorySegments.active = false;
    HistorySegments.height_node = 0;
    HistorySegments.currMaxima = null;
    HistorySegments.myScroll;
    HistorySegments.checkauto = false;
    HistorySegments.step = 0;
    HistorySegments.count_child = 0;
    HistorySegments.check_step = false;
    HistorySegments.check_delete = false;
    HistorySegments.is_finish = false;
    HistorySegments.in_id = -1;
    HistorySegments.version=-1;
	Exercises.id_activeMath = ""; 
	Exercises.userInputPostion = - 1;
    document.getElementById("history").innerHTML = "";
    document.getElementById("note").innerHTML = "Notification";
    var exerImage = document.getElementById("exer");
    exerImage.style.height = 0 + "px";
    exerImage.style.paddingBottom = 0 + "px";
    exerImage.innerHTML = "";
    exerImage.style.height = 0;
    document.getElementById("tex_result").innerHTML = "";
    document.getElementById("segmentSplit").innerHTML = "";
    Exercises.ListImages = new Array();
    Exercises.id_default = -1;
    Exercises.id_select = -1;
    Exercises.to_step = -1;
    Exercises.from_step = 0;
    Exercise.clearSegment();

    $('.pen_stroke').remove();
    $('.segment_set').remove();
    $('.segmentSplit').remove();
    document.getElementById(Gestures.dralf).style.visibility = "hidden";
    document.getElementById(Gestures.btnResize).style.visibility = "hidden";

    delete Editor.undo_stack;
    Editor.undo_stack = new Array();
    delete Editor.redo_stack;
    Editor.redo_stack = new Array();
    delete Editor.action_list;
    Editor.action_list = new Array();
    delete Editor.segments;
    Editor.segments = new Array();
    arrCoverItems = new Array();
    arrCoverRedo = new Array();
    delete Gestures.DralfIds;
    Gestures.DralfIds = new Array();
    delete Editor.segmentSplits;
    Editor.segmentSplits = new Array();
    delete RenderManager.segment_set_divs;
    RenderManager.segment_set_divs = new Array();
    delete RecognitionManager.result_table;
    RecognitionManager.result_table = new Array();
    delete RecognitionManager.segment_queue;
    RecognitionManager.segment_queue = new Array();
    RecognitionManager.timeout = null;
    RecognitionManager.max_segments = 1;

    var w = Editor.canvases[0].width;
    Editor.canvases[0].width = 1;
    Editor.canvases[0].width = w;
    SysEquations.initialize();
}

Exercise.clearSegment = function() {
    Editor.clear_selected_segments();
    var arrSegment = new Array();
    for (var i = 0; i < Editor.segments.length; i++) {
        arrSegment.push(Editor.segments[i]);
    }
    Editor.add_action(new HistorySegments(arrSegment, true,Editor.TransformSegmentss));
    var action = new ActionSegments(arrSegment, true,Editor.DeleteSegments);
    action.Apply();
    RenderManager.render();
}

Exercise.groupExpress = function(groups) {
    Formula.groupExpress(groups);
}

/******************************************************************************
* intent: convert array of latex to concatenated string in mathjax format
* input : tex[] = [ $2x-3y=4$, 4x-6y=32$ ]
* output: \begin{align} y &= 3x-2 \\ x &= 5x+4 \end{align}
*
* \begin{aligned} \dot{x}&=\sigma(y-x)\\ \dot{y}&=\rho x - y -xz \end{aligned}
* texs[i] = ( i==0 &&       && !stex.match(/^\$/) ) ? "\\begin{align}" + texs[i] : "$$" + texs[i];
* texs[i] = ( i<texs.length && !stex.match(/^\$/) ) ? "\\begin{align}" + texs[i] : "$$" + texs[i];
******************************************************************************/
Exercise.latex2mathjax = function( texs )                                    {
   var alltex = "", m = "", n = "", o = "", p = ""; var stex;
   for (var i = 0; i < texs.length; i++)                                      {
      stex = String( texs[i] );
      if ( !stex.match( /^\$/ ) ) texs[i] = texs[i] + "$";
      if ( !stex.match( /\$$/ ) ) texs[i] = "$" + texs[i];
      alltex += texs[i];                                                      }
   m = alltex;
   m = m.replace( /\$\$/g, "\\\\" );
   n = m.replace( /^\$/, "\\begin{align} " );
   o = n.replace( /\$$/,   " \\end{align}" );
   p = o.replace( /=/g, " &= " );
   return p;                                                                  }

/******************************************************************************
* intent:  concatenate array of phrases into a single string
* input :  tex[] = [ 2x-3y=4, 4x-6y=32 ]
* output:  2x-3y=4,4x-6y=32
******************************************************************************/
Exercise.concatLatex = function( texs )                                      {
   var output = "";
   for (var i = 0; i < texs.length; i++) output += texs[i] + ",";
   output = output.substring( 0 , output.length-1 ); 
   return output;                                                 }

/******************************************************************************
*
******************************************************************************/

Exercise.buildDropdown = function() {
    var str_locations = window.location;
    var str_mode = /standalone/;
    if (str_locations.toString().match(str_mode) != null)
        SettingsMenu.mode = str_locations.toString().match(str_mode).toString();
    
    // tam thoi de build app
    //SettingsMenu.mode = "standalone";
    var array_id = new Array();
    var optionNode = document.createElement("option");
    optionNode.setAttribute("value", -1);
    optionNode.text = "Exercise";
    ExercisesMenu.select_exercise.appendChild(optionNode);
    HistorySegments.is_finish = false;
    $.ajax({
        type: "POST",
        url: Editor.url_exercises,
        dataType: "JSON",
        success: function(in_data) {
            var Exercises =  eval(in_data);
            var count = 0;
          
            $.each(Exercises, function(index, Exercise) {
          	var optionNode = document.createElement("option");
                var la_tex = String(Exercise.formula).replace(/[/]/g, String.fromCharCode(92));
                array_id.push(Exercise.id);
                optionNode.setAttribute("value", Exercise.id);
                optionNode.setAttribute("latex", "$" + la_tex + "$");
                optionNode.setAttribute("variable", Exercise.variable);
                optionNode.text = la_tex;
                count++;
                ExercisesMenu.select_exercise.appendChild(optionNode);
            });
            if (SettingsMenu.user == "anonymous" || SettingsMenu.mode == "standalone"){
                Editor.mod_history = false;
                document.getElementById("lhint").style.visibility = "hidden";
                document.getElementById("hint").parentNode.style.display = "none";
            }
            else {
                var hide_node = document.getElementById("selectexes");
                hide_node.style.visibility = "hidden";
                document.getElementById("lhint").style.visibility = "visible";
                document.getElementById("lhint").innerHTML = "";
                Editor.mod_history = true;
                /*//g: rm
                Exercises.id_default = 7;
                if(Exercises.id_default != Exercise.current.exercise_id) 
                   ExercisesMenu.select_acion(7);
                   */
            }
        },error: function(xmlhttp) {
           if(isAjaxSessionTimeOut(xmlhttp)) return;
        }
    });
}
