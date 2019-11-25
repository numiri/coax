function Editor() { }

Editor.instance = null;
Editor.boardMath=null;//the board of jsxgraph
Editor.VarParamMath=[]; //array contains variables and parameters
Editor.EquationLatex=[];//containt array latex
Editor.BackupEquation=[];//use to backup the equation each submit or grap click
Editor.VarMathSelected=[];
Editor.initialize = function(in_equation_canvas_name, in_toolbar_name) {
	
    Editor.using_mobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(andRoid)|(webOS)/i) != null; //
    Editor.is_iphone = detect_iphone();
    
    if (Editor.using_mobile == true) {
        // removeh over css
        for (var i = 0; i < document.styleSheets.length; i++) {
            for (var j = 0; j < document.styleSheets[i].rules.length; j++) {
                if (document.styleSheets[i].rules[j].cssText.match("hover") != null) {
                    document.styleSheets[i].deleteRule(j--);
                }
            }
        }
    }

    BuildToolbar();
    Editor.fix_toolbar();
  
    UpdateDisplay('abc','none');
    Editor.canvas_div = document.getElementById(String(in_equation_canvas_name));

    // canvas size beneath
    Editor.fit_to_screen();
    // array of div elements
    Editor.toolbar_buttons = new Array();
    // set up our divs (canvas, toolbar);
    Editor.build_buttons(in_toolbar_name);
    Editor.buildMoreButtons();
    
    // top left hand corner of our canvases relative to window
    Editor.div_position = findPosition(Editor.canvas_div);
    // build our layers (two of each for double buffering)
    Editor.contexts = new Array();
    Editor.canvases = new Array();
    // get our convases
    Editor.add_canvas(); // canvas 0 - pen strokes
    // initialize managers
    RenderManager.initialize(Editor.canvas_width, Editor.canvas_width, Editor.canvases.length);
    CollisionManager.initialize();
    RecognitionManager.initialize();
    CorrectionMenu.initialize();
    //SettingsMenu.initialize();
    FormulaMenu.initialize();
    HistorySegments.Table();
    ExercisesMenu.initialize();
    ResizeTo.Setup();
    Substitute.initialize();
    Flottom.initialize();
    SysEquations.initialize();
    Keyboard.initialize();
    MagnifyingGlass.init_box();
    // create the mouse 
    Editor.setup_events();
    // list of segments we deal with
    Editor.segments = new Array();
    // segments currentlys elected
    Editor.selected_segments = new Array();
    Editor.selected_segments_transform = new Array();
    Editor.selected_segments_not_transform = new Array();
    // bounding box before we started resizing
    Editor.original_bb = null;
    // current bounding box
    Editor.selected_bb = null;
    // variables for resizing
    Editor.selected_size = new Vector2(0, 0);
    Editor.selected_position = new Vector2(0, 0);
    Editor.resize_offset = new Vector2(0, 0);
    // can be either "Stroke" or "Rectangle"
    Editor.selection_method = null;
    // start and end positions for rectangle selection
    Editor.start_rect_selection = null;
    Editor.end_rect_selection = null;
    Editor.previous_stroke_position = null;
    // the stroke currently being created
    Editor.current_stroke = null;
    // an image object the load method will set
    Editor.temp_image = null;
    // a text object the user can type into
    Editor.current_text = null;
    // the edge we are currently grabbing in resize mode
    Editor.grabbed_edge = -1;
    // initialize mouse variables
    Editor.change_step = false;
    Editor.flag_status = 0;
    //Editor.check_rectangle = false;
    Editor.check_pen = false;
    Editor.check_group = false;
    Editor.hand = 0;
    // khoi tao mang instance_id duoc chon
    Editor.arr_seg_select = new Array();
    // khoi tao mang instance_id ton tai
    Editor.arr_seg_set_field = new Array();
    Editor.set_field = new Array();
    // khoi tao mang instance_id truoc khi chon tung ngon
    Editor.arr_seg_list = new Array();
    // lay bai tap gan day
    Exercise.recent=[];
    Exercise.recent =jQuery.parseJSON( localStorage.getItem(Exercise.C_RECENT));
    Editor.checkScroll = true;
    Editor.screen = false;
    Editor.hint = "false";
    
    Editor.touchID = -1;
    Editor.touchID1 = -1;
    Editor.touchID2 = -1;
    Editor.tempx = 1;
    Editor.tempy = 1;
    Editor.mouse1_down = false;
    Editor.mouse2_down = false;
    Editor.mouse_position = new Vector2(-1, -1);
    Editor.mouse_position_prev = new Vector2(-1, -1);
    Editor.mouse_position_second_prev = new Vector2(-1, -1);
    Editor.mouse_position_second = new Vector2(-1, -1);
    Editor.mouse_position_first_prev = new Vector2(-1, -1);
    Editor.mouse_position_first = new Vector2(-1, -1);
    Editor.mouse_position_save_prev = new Vector2(-1, -1);
    Editor.mouse_position_save = new Vector2(-1, -1);
    Editor.undo_stack = new Array();
    Editor.redo_stack = new Array();
    Editor.redo_stack_backup = [];
    // alla ctions including undo/redo stored here
    Editor.action_list = new Array();
    Editor.isZoom = null;
    Editor.isSelectS3 = null;
    Editor.current_action = null;
    Editor.space_action = null;
    //Diem bat dau ve
    Editor.startPoint = new Vector2(-1, -1);
    //Diem cuoi but ve
    Editor.EndPoint = new Vector2(-1, -1);
    Editor.segmentSplits = new Array();
    Editor.segments_dralf = new Array();
    Editor.segments_v = new Array();
    Editor.rateScroll = 1;//dung de xoay man hinh tinh ty le giua man hinh
    Editor.Scroll = new Vector2(0,0);//dung de xoay man hinh.Khi cap nhat lai vi tri cho cac segments
    Editor.rectangleSelectionTool();
    Editor.svg = null;
    Exercise.flag =true;

    $.extend($.mobile.zoom, {locked:true,enabled:false});
    //SettingsMenu.onlyButton(); 
}

//<<<<< append the svg vao vung editor
Editor.createSvg = function(){
    var svg;
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute("id", "svgId");
    svg.setAttribute("class", "pen_stroke");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("style", "position: absolute; left: 0px; top: 0px;");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.appendChild(Editor.createg());
    Editor.svg = svg;
    return svg;
}

//<<<<< kiem tra nhung segments da chon thi khong add vao mang
Editor.segment_selected = function(in_segment, seg_selected) {
    for (var k = 0; k < seg_selected.length; k++) {
        if (seg_selected[k] == in_segment) return true;
    }
    return false;
}

//<<<<< kiem tra mang segments co nhung set_id trung nhau
Editor.get_segment_by_id = function(in_id) {
    var result = new Array();
    for (var k = 0; k < Editor.segments.length; k++) {
        if (Editor.segments[k].set_id == in_id) result.push(Editor.segments[k]);
    }
    return result;
}

//<<<<< dua nhung segments duoc chon vao mang roi tinh min-max
Editor.add_selected_segment = function(in_segment, seg_selected) {
    if (seg_selected.contains(in_segment) || in_segment == undefined || in_segment == null) return;
    var segment_mins = in_segment.worldMinPosition();
    var segment_maxs = in_segment.worldMaxPosition();
    var segment_draw_mins = in_segment.worldMinDrawPosition();
    var segment_draw_maxs = in_segment.worldMaxDrawPosition();
    // update selected bounding box
    if (seg_selected.length == 0) {
        Editor.selected_bb = new BoundingBox(segment_mins, segment_maxs, segment_draw_mins, segment_draw_maxs);
    } else {
        for (var k = 0; k < seg_selected.length; k++)
            if (seg_selected[k] == in_segment) return;
        // update logical extents
        if (segment_mins.x < Editor.selected_bb.mins.x) Editor.selected_bb.mins.x = segment_mins.x;
        if (segment_mins.y < Editor.selected_bb.mins.y) Editor.selected_bb.mins.y = segment_mins.y;
        if (segment_maxs.x > Editor.selected_bb.maxs.x) Editor.selected_bb.maxs.x = segment_maxs.x;
        if (segment_maxs.y > Editor.selected_bb.maxs.y) Editor.selected_bb.maxs.y = segment_maxs.y;
        // update render extents
        if (segment_draw_mins.x < Editor.selected_bb.render_mins.x) Editor.selected_bb.render_mins.x = segment_draw_mins.x;
        if (segment_draw_mins.y < Editor.selected_bb.render_mins.y) Editor.selected_bb.render_mins.y = segment_draw_mins.y;
        if (segment_draw_maxs.x > Editor.selected_bb.render_maxs.x) Editor.selected_bb.render_maxs.x = segment_draw_maxs.x;
        if (segment_draw_maxs.y > Editor.selected_bb.render_maxs.y) Editor.selected_bb.render_maxs.y = segment_draw_maxs.y;
    }
    // finally add to the selected lsit
    seg_selected.push(in_segment);
}

//<<<<< cap nhat min-max nhung segments duoc chon roi new lai boundingbox
Editor.update_selected_bb = function() {
    if (Editor.selected_segments.length == 0) {
        Editor.selected_bb = null;
        return;
    } else if (Editor.selected_segments.length == 1) {
        Editor.selected_bb = new BoundingBox(Editor.selected_segments[0].worldMinPosition(), Editor.selected_segments[0].worldMaxPosition(), Editor.selected_segments[0].worldMinDrawPosition(), Editor.selected_segments[0].worldMaxDrawPosition());
    } else {
        var mins = Editor.selected_segments[0].worldMinPosition();
        var maxs = Editor.selected_segments[0].worldMaxPosition();
        var render_mins = Editor.selected_segments[0].worldMinDrawPosition();
        var render_maxs = Editor.selected_segments[0].worldMaxDrawPosition();
        for (var k = 1; k < Editor.selected_segments.length; k++) {
            // lgoical extents
            var seg_mins = Editor.selected_segments[k].worldMinPosition();
            var seg_maxs = Editor.selected_segments[k].worldMaxPosition();
            if (seg_mins.x < mins.x) mins.x = seg_mins.x;
            if (seg_mins.y < mins.y) mins.y = seg_mins.y;
            if (seg_maxs.x > maxs.x) maxs.x = seg_maxs.x;
            if (seg_maxs.y > maxs.y) maxs.y = seg_maxs.y;
            // render extents
            var render_seg_mins = Editor.selected_segments[k].worldMinDrawPosition();
            var render_seg_maxs = Editor.selected_segments[k].worldMaxDrawPosition();
            if (render_seg_mins.x < render_mins.x) render_mins.x = render_seg_mins.x;
            if (render_seg_mins.y < render_mins.y) render_mins.y = render_seg_mins.y;
            if (render_seg_maxs.x > render_maxs.x) render_maxs.x = render_seg_maxs.x;
            if (render_seg_maxs.y > render_maxs.y) render_maxs.y = render_seg_maxs.y;
        }
        Editor.selected_bb = new BoundingBox(mins, maxs, render_mins, render_maxs);
    }
}

//<<<<< dua stroke vao mang segment
Editor.add_segment = function(in_segment) {
    if (Editor.segments.contains(in_segment)) return;
    Editor.segments.push(in_segment);
}

//<<<<< xoa nhung segments duoc chon
Editor.remove_segment = function(in_segment) {
    if (in_segment == null) return;
    var ui = Segment.unique_id(in_segment);
    for (var k = 0; k < Editor.segments.length; k++) {
        if (Segment.unique_id(Editor.segments[k]) == ui) {
            Editor.segments.splice(k, 1);
            break;
        }
    }
}

//<<<<< giong ham tren
Editor.remove_selected_segment = function(in_segment) {
    if (in_segment == null) return;
    for (var k = 0; k < Editor.selected_segments.length; k++)
        if (Editor.selected_segments[k] == in_segment) {
            Editor.selected_segments.splice(k, 1);
            return;
        }
}

sort_segments = function(a, b) {
    return a.set_id - b.set_id;
}

//<<<<< khoi tao lai mang segments duoc chon
Editor.clear_selected_segments = function() {
    Editor.selected_segments.length = 0;
    Editor.selected_bb = null;
    Editor.selected_position = new Vector2(0, 0);
    Editor.selected_size = new Vector2(0, 0);
}

//<<<<< dua the canvas vao vung editor
Editor.add_canvas = function() {
    var canvas = Editor.build_canvas();
    canvas.style.zIndex = Editor.canvases.length;
    Editor.canvases.push(canvas);
    Editor.canvas_div.appendChild(canvas);
    Editor.canvas_div.appendChild(Editor.createSvg());
    var context = canvas.getContext('2d');
    Editor.contexts.push(context);
}
//<<<<<< generate context menu variable on each stroke.

Editor.initContextMenuStroke =function(){
    Editor.VarMathSelected = [];
    var menu =function(){
        if(Editor.selected_segments && Editor.selected_segments.length>0)
        {
            var seg = Editor.selected_segments[0];
            if(seg && seg.symbol && (seg.symbol.indexOf("_") >0 || seg.symbol.indexOf("_") < 0 ))
            {
                var regPattern =/[a-zA-Z]/g;
                if(regPattern.test(seg.symbol)){
                    return [
                        {
                            title: 'Set as variable',
                            action: function()
                            {
                                var selectedEle = undefined;
                                var segmentvisible = $('.segment_set:visible').each(function(index,ele){
                                    var style = $(ele).attr('style');
                                    if(style){
                                        var arrayStyle = style.split(';');
                                        var isVisibility = false;
                                        for(var i = 0 ; i< arrayStyle.length;i++){
                                            if(arrayStyle[i] == 'visibility: visible')
                                            {
                                                isVisibility=true;
                                                break;
                                            }
                                        }
                                        if(isVisibility)
                                        {
                                            selectedEle = ele;
                                        }
                                    }
                                });
                                if(selectedEle && $(selectedEle).text()) {
                                    var addedvar=false;
                                    $.map(Editor.VarMathSelected, function(elementOfArray, indexInArray) { if (elementOfArray.name == $(selectedEle).text()){addedvar = true; }});
                                    if (!addedvar)
                                    {
                                        Editor.VarMathSelected.push({name:$(selectedEle).text(),type:'var' ,checked:true})
                                    }
                                }
                            }
                        }
                    ];
                }
            }
            return [
                {
                    title: 'Set as variable',
                    disabled:true
                }
            ];
        }
    }

    d3.selectAll('g')
        .on('contextmenu', d3.contextMenu(menu , {
            onOpen: function () {
            },
            onClose: function () {
                console.log('Menu has been closed.');
            }
        })); // attach menu to element
}

//<<<<< tao the canvas
Editor.build_canvas = function() {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "pen-canvas");
    canvas.setAttribute("onclick", "event.preventDefault();");
    canvas.setAttribute("ontouchmove", "event.preventDefault();");
    canvas.setAttribute("ontouchstart", "event.preventDefault();");
    canvas.setAttribute("width", Editor.canvas_width);
    canvas.setAttribute("height", Editor.canvas_height);
    canvas.style.position = "absolute";
    canvas.setAttribute("tabindex", "0");
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    return canvas;
}

//<<<<< dua mot qua trinh vao mang action (qua trinh ve, qua trinh move, qua trinh zoom.....)
/*
 * a: the action will be added when should_keep becomes true 
 *    in HistorySegments.add_new_transforms
 * b: a backup if the stroke is a dot & remove in Gestures.EndPenStroke
 */
Editor.add_action = function(action) {
   if(action instanceof HistorySegments
   && action.toString() == "TransformSegments" && !action.shouldKeep() )      {
      Editor.current_action = action; //a
      return;                                                                 }
   
   Editor.redo_stack_backup.length = 0;
   if(action instanceof ActionSegments
         && action.toString() == "AddSegments" && !action.shouldKeep() )
      Editor.redo_stack_backup = Editor.redo_stack.slice(0);//b            

   Editor.redo_stack.length = 0;
   if (Editor.undo_stack.length > 0)                                          {
      var prev_action = Editor.undo_stack.pop();
      if (prev_action.shouldKeep() == true) 
         Editor.undo_stack.push(prev_action);                                 }

   if (Editor.action_list.length > 0)                                         {
      var prev_action = Editor.action_list.pop();
      if (prev_action.shouldKeep() == true) 
         Editor.action_list.push(prev_action);                                }

   Editor.undo_stack.push(action);
   Editor.current_action = action;
   Editor.action_list.push(action);
}

//<<<<< thuc hien undo
Editor.undo = function() {
    //if (Editor.button_states[Buttons.Undo].enabled == false) return;
    //else {
        //Editor.check_rectangle = true;
        Editor.clear_selected_segments();
        Editor.rectangleSelectionTool();
    //}

    if (Editor.undo_stack.length > 0) {
        var action = Editor.undo_stack.pop();
        if (action.shouldKeep()) {
            action.Undo();
            Editor.redo_stack.push(action);
            Editor.action_list.push(new Undo());
            //console.log("Undo " + action.toString());
            //<<<<<<<<<< Make Subtitutions
            if (action.toString() == "DeleteSegments") {
                while (action.Flag() == false) {
                    RenderManager.render();
                    action = Editor.undo_stack.pop();
                    action.Undo();
                    Editor.redo_stack.push(action);
                    Editor.action_list.push(new Undo());
                    if (action.toString() == "TransformSegments") break;
                }
            }
            //<<<<<<<<<< Make Fence
            else if (action.toString() == "TransformSegments") {
                while (action.Flag() == false && Editor.undo_stack.length > 0) {
                    RenderManager.render();
                    action = Editor.undo_stack.pop();
                    action.Undo();
                    Editor.redo_stack.push(action);
                    Editor.action_list.push(new Undo());
                    if (action.toString() == "GroupSegments") {
                        var obj = {
                            set_id: action.segments[0].set_id
                        };
                        Editor.rdCoverItem(obj);
                    }
                    if (action.toString() == "AddSegments") break;
                }
            }
	    //<<<<<<<<<< Make Flottom
            else if (action.toString() == "FlottomSegments") {
		RenderManager.render();
		action = Editor.undo_stack.pop();
		action.Undo();
		Editor.redo_stack.push(action);
		Editor.action_list.push(new Undo());
            }
            switch (Editor.state) {
                case EditorState.StrokeSelecting:
                    Editor.state = EditorState.ReadyToStrokeSelect;
                    break;
                case EditorState.RectangleSelecting:
                    Editor.state = EditorState.ReadyToRectangleSelect;
                    break;
                case EditorState.MiddleOfStroke:
                    Editor.state = EditorState.ReadyToStroke;
                    break;
                case EditorState.MiddleOfText:
                    Editor.state = EditorState.ReadyForText;
            }
            RenderManager.render();
            return;
        }
    }
}

Editor.author = function () { window.open( Editor.author_url ); } // sn-130313 

//<<<<< thu hien redo
Editor.redo = function() {
    //if (Editor.button_states[Buttons.Redo].enabled == false) return;
    //else {
        //Editor.check_rectangle = true;
        Editor.clear_selected_segments();
        Editor.rectangleSelectionTool();
    //}

    if (Editor.redo_stack.length > 0) {
        var action = Editor.redo_stack.pop();
        action.Apply();
        Editor.undo_stack.push(action);
        Editor.action_list.push(new Redo());
        //console.log("Redo " + action.toString());
        //<<<<<<<<<< Make Subtitutions
        if (action.toString() == "TransformSegments") {
            while (action.Flag() == false && Editor.redo_stack.length > 0) {
                RenderManager.render();
                action = Editor.redo_stack.pop();
                action.Apply();
                Editor.undo_stack.push(action);
                Editor.action_list.push(new Redo());
                if (action.toString() == "DeleteSegments") break;
            }
        }else if (action.toString() == "AddSegments") {
            //var count = 0;
            while (action.Flag() == false && Editor.redo_stack.length > 0) {
                RenderManager.render();
                action = Editor.redo_stack.pop();
                action.Apply();
                Editor.undo_stack.push(action);
                Editor.action_list.push(new Redo());
                if (action.toString() == "GroupSegments") {
                    var obj = {
                        set_id: action.new_set_id
                    };
                    Editor.rdCoverItem(obj, true);
                }
                if (action.toString() == "TransformSegments") //{
                    break;
            }
        }
	//<<<<<<<<<< Make Subtitutions
        if (action.toString() == "TransformSegments") {
            if (action.Flag() == true && Editor.redo_stack.length > 0) {
		var temp_action = Editor.redo_stack[Editor.redo_stack.length - 1];
		if (temp_action.toString() == "FlottomSegments"){
		    RenderManager.render();
		    action = Editor.redo_stack.pop();
		    action.Apply();
		    Editor.undo_stack.push(action);
		    Editor.action_list.push(new Redo());
		}
            }
        }
        RenderManager.render();
    }
}
Editor.printUndoStack = function() {
    //console.log("---");
    for (var k = 0; k < Editor.undo_stack.length; k++) {
        //console.log(Editor.undo_stack[k].toXML());
        }
}

//#########ham cac chuc nang thuc hien undo redo cua ArrayCover#######
//kiem mot doi tuong co la cha trong arrayCover
Editor.checkSetIdCovers = function(value) {
    if (typeof value.item1.set_id == 'number') return value.item1.set_id == this.set_id && value.item4 == 0;
    else
        return false;

}

//kiem mot doi tuong co la con trong arrayCover.
Editor.GetSegmentByIdParent = function(value) {
    if (typeof value.item1.set_id == 'number') return value.item4 == this.item1.set_id;
    else
        return false;

}
//isRedo==true thuc hien redo, mac dinh thuc hien undo cho CoverItem
Editor.rdCoverItem = function(obj, isRedo) {
    var bfilter = null;
    var t = null;
    var index = null;
    var child = null;
    var arrChild = null;
    if (isRedo == true) {
        bfilter = arrCoverRedo.filter(Editor.checkSetIdCovers, obj);
        if (bfilter.length != 0) {
            t = bfilter[0];
            index = arrCoverRedo.indexOf(t);
            arrCoverRedo.splice(index, 1);
            arrChild = arrCoverRedo.filter(Editor.GetSegmentByIdParent, t);

            for (var i = 0; i < arrChild.length; i++) {
                child = arrChild[i];
                index = arrCoverRedo.indexOf(child);
                arrCoverRedo.splice(index, 1);
                arrCoverItems.push(arrChild[i]);
            }
            arrCoverItems.push(t);
        }
    } else {
        bfilter = arrCoverItems.filter(Editor.checkSetIdCovers, obj);
        if (bfilter.length == 1) {
            t = bfilter[0];
            index = arrCoverItems.indexOf(t);
            arrCoverItems.splice(index, 1);
            arrChild = arrCoverItems.filter(Editor.GetSegmentByIdParent, t);

            for (var i = 0; i < arrChild.length; i++) {
                child = arrChild[i];
                index = arrCoverItems.indexOf(child);
                arrCoverItems.splice(index, 1);
                arrCoverRedo.push(arrChild[i]);
            }
            arrCoverRedo.push(t);
        }

    }
}
//#########ket thuc ham cac chuc nang thuc hien undo redo cua ArrayCover#######

Editor.createg = function(){
    var g;
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var sb = new StringBuilder();
    sb.append("translate(").append(0).append(',').append(0).append(") ");
    sb.append("scale(").append(1).append(',').append(1).append(") ");
    g.setAttribute("id", "gId");
    g.setAttribute("transform", sb.toString());
    g.setAttribute("style", "fill:none;stroke-linecap:round;");
    return g;
}

//Them 1 segment vao danh sach 
Editor.AddSegmentSplit = function(in_segment) {
    var index = Editor.FindIndexSegment(in_segment.set_id, Editor.segmentSplits);
    if (index != -1) {
        return;
    }
    Editor.segmentSplits.push(in_segment);
}

//ham tim segment
Editor.FindIndexSegment = function(set_id, in_segments) {
    var index = -1;
    for (var k = 0; k < in_segments.length; k++) {
        if (in_segments[k].set_id == set_id) {
            return k;
        }
    }
    return index;
}

///Tim vitri segmentSplit trong danh sach theo set_id
Editor.FindIndexSplitSegment = function(set_id) {
    var index = -1;
    for (var k = 0; k < Editor.segmentSplits.length; k++) {
        if (Editor.segmentSplits[k].set_id == set_id) {
            return k;
        }
    }
    return index;
}
//Xoa 1 segmentSplit ra khoi sanh sach Split
Editor.DeleteSegmentSplit = function(index) {
    if (index >= 0) {
        for (var k = index; k < Editor.segmentSplits.length - 1; k++) {
            Editor.segmentSplits[k] = Editor.segmentSplits[k + 1];
        }
        Editor.segmentSplits.pop();
    }
}

//Xoa tat ca cac segment split
Editor.clearListSegmentSplit = function() {
    while (Editor.segmentSplits.length > 0) {
        Editor.segmentSplits.pop();
    }
    Editor.segmentSplits.length = 0;
}

Editor.is_touch_device = function() {  
  try {  
    document.createEvent("TouchEvent");  
    Editor.using_mobile = true;
    return true;  
  } catch (e) {  
    return false;  
  }  
}