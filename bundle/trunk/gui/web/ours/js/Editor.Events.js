// mods
// copeAjaxError():  hide spinner

/******************************************************************************
*                                Editor.Events.js
******************************************************************************/

///save infor item bi cover
var arrCoverItems = new Array();
var arrCoverRedo = new Array();
var ratescroll = 1;
var oldWidth = 0;
var touches = [];
var touchable = 'createTouch' in document;  // false enables mouse stroking on win10 chrome.  var touchable = false;
var devicejs = device.noConflict();
var EditorState = {
    // select tool states
    "ReadyToStrokeSelect": 0,
    "StrokeSelecting": 1,
    "ReadyToRectangleSelect": 2,
    "RectangleSelecting": 3,
    // pen states
    "ReadyToStroke": 4,
    "MiddleOfStroke": 5,
    // text tool states
    "ReadyForText": 6,
    "MiddleOfText": 7,
    // new selection states
    // one individual segment or many individual segments
    // happens during stroke select
    "SegmentsSelected": 8,
    // a set of segments 
    // moving individual segments
    "MovingSegments": 9,
    // resizing a guy
    "Resizing": 10,
    "Relabeling": 11,
    "MultyRectangleSelecting": 12,
    "Settings": 13,
    "Zoom": 14,
    "ReplaceSub": 15,
    "Flottom": 16
};
Editor.isResized = function(){
   if(ResizeTo.bodyOuterWidth == -1){
      console.log('resized');
      window.setTimeout("Editor.fit_to_screen()",500);
   }
   return true;
}
//<<<<< tinh lai vung editor
Editor.fit_to_screen = function(event) {
   // do nothing if the function is called from other pages (ie. setting page) 
   // rather than main page (which has canvas) 
   if(document.getElementById("show-content").offsetWidth == 0){
      ResizeTo.bodyOuterWidth = -1;
      return;
   }
    
    Editor.screen = true;
    var root_div = document.getElementById("equation_editor_root");

    root_div.style.width = window.innerWidth + "px";
    root_div.style.height = window.innerHeight + "px";
    Editor.canvas_width = Editor.canvas_div.offsetWidth;
    Editor.canvas_height = Editor.canvas_div.offsetHeight;
    Editor.div_position = findPosition(Editor.canvas_div);
    window.scroll(0, 0);
    // Change size on browser or scale on device mobile
    var nodecanvas = document.getElementById("pen-canvas");
    if (nodecanvas != null) {
   if (ResizeTo.rate_change_screen != 0){

       document.getElementById("centerpanel").style.height = (100 - ResizeTo.rate_change_screen) + "%";
       Editor.canvas_div.style.height = ResizeTo.rate_change_screen + "%";
       ResizeTo.UpdatePanelCanvas(ResizeTo.rate_change_screen);
   }
   else{

       ResizeTo.height_canvas = window.innerHeight * 1 * 0.57;
       nodecanvas.setAttribute("height", ResizeTo.height_canvas);
   }
   ResizeTo.width_canvas = window.innerWidth * 1;
   nodecanvas.setAttribute("width", ResizeTo.width_canvas);
    }
    Fractions.doTimer();
    if (Editor.checkScroll){
   Editor.translateCenter(Editor.segments);
    }
    Editor.Exercises.renderPosition();
    Editor.screen = false;
    ResizeTo.change();
    ResizeTo.positionRecyclebin();
    if(ResizeTo.start != undefined && ResizeTo.current != undefined){
       ResizeTo.Action(ResizeTo.start, ResizeTo.start);
       ResizeTo.rate_change_screen = 0;
    }
    ResizeTo.bodyOuterWidth =  $("body").outerWidth();
}

Editor.fix_toolbar= function()
{
    if(Editor.is_iphone)
    {
        if(islandscape()){
            $('#equation_canvas').css('height',(60-3)+'%');
        }
        else{
            $('#equation_canvas').css('height',(60-3)+'%');
        }
    }
    else
    {
        if(islandscape())
        {
        $('#equation_canvas').css('height',(60-3.082)+'%');
        }
        else
        {
         $('#equation_canvas').css('height',(60-4.251)+'%');
        }
        
    }
    $( "div#page-canvas[data-role=page]" ).page( "destroy" ).page();
    $( "div#page-canvas").css('padding-bottom','0');
}


Editor.actionLayout = function(show){
    document.getElementById("toolbar").style.visibility = show;
    document.getElementById("center").style.visibility = show;
    document.getElementById("center").style.borderTop = "1px solid #888888";
    document.getElementById("show-content").style.visibility = show;
    document.getElementById("log").style.visibility = show;
    document.getElementById("log").style.borderBottom = "1px solid #888888";
    recyclebin.style.visibility = show;
}

Editor.ajaxLoader = function(show){
        if (show == "hidden"){
            $('#loaderx').empty();
            Editor.rectangleSelectionTool();
            ExercisesMenu.is_request=false;
        }
        else{
            ExercisesMenu.is_request=true;
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
      var spinner = new Spinner(opts).spin(target);
      Editor.state = -1;
    }
}

Editor.fhint = function () {
   Editor.hint  = true;
   Editor.align();
   Editor.hint  = false;
}
Editor.help = function () {
   $('#popup-help').popup('open');
}
Editor.more = function(){
   var viewportOffset = document.getElementById("more").getBoundingClientRect();
   $("#popup-more").css("left",viewportOffset.left+"px");
   $('#popup-more').popup('open');
}
Editor.setup_events = function() {
    //<<<<< setup on device or browser

   if(Editor.is_touch_device()){
	 Editor.canvas_div.addEventListener('touchstart', Editor.onStart, false);
     window.addEventListener('touchmove', Editor.onMove, false);
     document.addEventListener('touchend', Editor.onEnd, false);
   }
//   if (touchable && !devicejs.desktop() ) {
 //  Editor.canvas_div.addEventListener('touchstart', Editor.onStart, false);
  // window.addEventListener('touchmove', Editor.onMove, false);
  // document.addEventListener('touchend', Editor.onEnd, false);
   //} else {
   Editor.canvas_div.addEventListener("mousedown", Editor.onStart, false);
   window.addEventListener("mousemove", Editor.onMove, false);
   document.addEventListener("mouseup", Editor.onEnd, false);   
   //}

    window.addEventListener("resize", Editor.fit_to_screen, false);
    //window.addEventListener("orientationchange", Editor.fit_to_screen, false);
    // jquery event for easy character input handling; otherwise a pain in the butt
    $('#equation_canvas').keypress(Editor.onKeyPress);
    $('#equation_canvas').keydown(Editor.preventBackspace);
    var button_index = 0;
    
    // command
    document.getElementById("command").addEventListener("mousedown", function(e) {
   CopyPasteSegments.Copys();
   Editor.selectPenTool();
   Editor.button_states[Buttons.Command].setTouched(true);
    }, true);
    document.getElementById("command").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Command].setTouched(false);
   Editor.rectangleSelectionTool();
    }, true);
    // <<<<< action on divece of moblie
    document.getElementById("command").addEventListener("touchstart", function(e) {
   CopyPasteSegments.Copys();
   Editor.selectPenTool();
   Editor.button_states[Buttons.Command].setTouched(true);
   RenderManager.render();
   event.preventDefault();
    }, true);
    document.getElementById("command").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Command].setTouched(false);
   Editor.rectangleSelectionTool();
    }, true);
    
    // align
    document.getElementById("submit").addEventListener("touchstart", function(e) {
   if (Editor.using_mobile){ Editor.align(); Editor.showStepInk();            }
   Editor.button_states[Buttons.Submit].setTouched(true);
   event.preventDefault();
    }, false);
    document.getElementById("submit").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Submit].setTouched(false);
    }, false);
    document.getElementById("submit").addEventListener("mousedown", function(e) {
   if (!Editor.using_mobile){ Editor.align(); Editor.showStepInk();            }
   Editor.button_states[Buttons.Submit].setTouched(true);
   event.preventDefault();
    }, false);
    document.getElementById("submit").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Submit].setTouched(false);
    }, false);
    
    // redo
    document.getElementById("redo").addEventListener("mousedown", function(e) {
   if (!Editor.using_mobile) Editor.redo();
   Editor.button_states[Buttons.Redo].setTouched(true);
    }, false);
    document.getElementById("redo").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Redo].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("redo").addEventListener("touchstart", function(e) {
   if (Editor.using_mobile) Editor.redo();
   Editor.button_states[Buttons.Redo].setTouched(true);
    }, false);
    document.getElementById("redo").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Redo].setTouched(false);
    }, false);

    document.getElementById("graph").addEventListener("mousedown", function(e) {
	if (!Editor.using_mobile) Editor.graph();
	Editor.button_states[Buttons.Graph].setTouched(true);
    }, false);
    document.getElementById("graph").addEventListener("mouseup", function(e) {
	Editor.button_states[Buttons.Graph].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("graph").addEventListener("touchstart", function(e) {
	if (Editor.using_mobile) Editor.graph();
	Editor.button_states[Buttons.Graph].setTouched(true);
    }, false);
    document.getElementById("graph").addEventListener("touchend", function(e) {
	Editor.button_states[Buttons.Graph].setTouched(false);
    }, false);
    
    // sn-130313 start
    // author
    document.getElementById("author").addEventListener("mousedown", function(e) {
   if (!Editor.using_mobile) Editor.author();
   Editor.button_states[Buttons.Author].setTouched(true);
    }, false);
    document.getElementById("author").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Author].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("author").addEventListener("touchstart", function(e) {
   if (Editor.using_mobile) Editor.author();
   Editor.button_states[Buttons.Author].setTouched(true);
    }, false);
    document.getElementById("author").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Author].setTouched(false);
    }, false);
    // sn-130313 end
    
    // group tool
    document.getElementById("group").addEventListener("mousedown", function(e) {
   if (!Editor.using_mobile) Editor.groupTool();
   Editor.button_states[Buttons.Group].setTouched(true);
    }, false);
    document.getElementById("group").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Group].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("group").addEventListener("touchstart", function(e) {
   if (Editor.using_mobile) Editor.groupTool();
   Editor.button_states[Buttons.Group].setTouched(true);
    }, false);
    document.getElementById("group").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Group].setTouched(false);
    }, false);
    
    // label tool
    document.getElementById("relabel").addEventListener("mousedown", function(e) {
   if (!Editor.using_mobile) Editor.relabel();
   Editor.button_states[Buttons.Label].setTouched(true);
    }, false);
    document.getElementById("relabel").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Label].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("relabel").addEventListener("touchstart", function(e) {
   if (Editor.using_mobile) Editor.relabel();
   Editor.button_states[Buttons.Label].setTouched(true);
    }, false);
    document.getElementById("relabel").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Label].setTouched(false);
    }, false);
        
    // settings tool
    document.getElementById("settings").addEventListener("mousedown", function(e) {
   if (!Editor.using_mobile) Editor.Settings();
   Editor.button_states[Buttons.Settings].setTouched(true);
    }, false);
    document.getElementById("settings").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Settings].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("settings").addEventListener("touchstart", function(e) {
   if (Editor.using_mobile) Editor.Settings();
   Editor.button_states[Buttons.Settings].setTouched(true);
    }, false);
    document.getElementById("settings").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Settings].setTouched(false);
    }, false);
   
    // undo
    document.getElementById("undo").addEventListener("mousedown", function(e) {
   if(!Editor.using_mobile) Editor.undo();
   Editor.button_states[Buttons.Undo].setTouched(true);
    }, false);
    document.getElementById("undo").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Undo].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("undo").addEventListener("touchstart", function(e) {
   if(Editor.using_mobile) Editor.undo();
   Editor.button_states[Buttons.Undo].setTouched(true);
    }, false);
    document.getElementById("undo").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Undo].setTouched(false);
    }, false);
    
    // copy
    document.getElementById("copy").addEventListener("mousedown", function(e) {
      if(!Editor.using_mobile){
          CopyPasteSegments.Copys();
          if (CopyPasteSegments.listSegment.length > 0){
             CopyPasteSegments.flag = true;
          }
      }
      Editor.button_states[Buttons.Copy].setTouched(true);
    }, false);
    document.getElementById("copy").addEventListener("mouseup", function(e) {
       Editor.button_states[Buttons.Copy].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("copy").addEventListener("touchstart", function(e) {
   if(Editor.using_mobile){
       CopyPasteSegments.Copys();
       if (CopyPasteSegments.listSegment.length > 0){
      CopyPasteSegments.flag = true;
       }
   }
   Editor.button_states[Buttons.Copy].setTouched(true);
    }, false);
    document.getElementById("copy").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Copy].setTouched(false);
    }, false);
    
    // paste
    document.getElementById("paste").addEventListener("mousedown", function(e) {
   if(!Editor.using_mobile) CopyPasteSegments.Paste(0);
   Editor.button_states[Buttons.Paste].setTouched(true);
    }, false);
    document.getElementById("paste").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Paste].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("paste").addEventListener("touchstart", function(e) {
   if(Editor.using_mobile) CopyPasteSegments.Paste(0);
   Editor.button_states[Buttons.Paste].setTouched(true);
    }, false);
    document.getElementById("paste").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Paste].setTouched(false);
    }, false);
    
    // help
    document.getElementById("help").addEventListener("mousedown", function(e) {
   if(!Editor.using_mobile) Editor.help();
   Editor.button_states[Buttons.Help].setTouched(true);
    }, false);
    document.getElementById("help").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Help].setTouched(false);
    }, false);
    // <<<<< action on divece of moblie
    document.getElementById("help").addEventListener("touchstart", function(e) {
   if(Editor.using_mobile) Editor.help();
   Editor.button_states[Buttons.Help].setTouched(true);
    }, false);
    document.getElementById("help").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Help].setTouched(false);
    }, false);
    
    // more
    document.getElementById("more").addEventListener("mousedown", function(e) {
   if(!Editor.using_mobile) Editor.more();
   Editor.button_states[Buttons.More].setTouched(true);
    }, false);
    document.getElementById("more").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.More].setTouched(false);
    }, false);
    // <<<<< action on device of moblie
    document.getElementById("more").addEventListener("touchstart", function(e) {
   if(Editor.using_mobile) Editor.more();
   Editor.button_states[Buttons.More].setTouched(true);
    }, false);
    document.getElementById("more").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.More].setTouched(false);
    }, false);
    
    
    // hint
    document.getElementById("hint").addEventListener("mousedown", function(e) {
   if(!Editor.using_mobile) Editor.fhint();
   Editor.button_states[Buttons.Hint].setTouched(true);
    }, false);
    document.getElementById("hint").addEventListener("mouseup", function(e) {
   Editor.button_states[Buttons.Hint].setTouched(false);
    }, false);    
    // <<<<< action on divece of moblie
    document.getElementById("hint").addEventListener("touchstart", function(e) {
   if(Editor.using_mobile) Editor.fhint();
   Editor.button_states[Buttons.Hint].setTouched(true);
    }, false);
    document.getElementById("hint").addEventListener("touchend", function(e) {
   Editor.button_states[Buttons.Hint].setTouched(false);
    }, false);
    
    Editor.canvas_div.setAttribute("onselectstart", "return false;");
    // prevent right click menu on canvas
    Editor.canvas_div.setAttribute("oncontextmenu", "return false;");
    //OPEN Exercises//exercises
    document.getElementById("exercises").addEventListener("click", function(e) {
    //Editor.button_states[Buttons.Hint].setTouched(false);
        //window.location.href ="#popup-exercise";
    }, false);

     document.getElementById("exercises").addEventListener("mousedown", function(e) {
        ExercisesMenu.BuildRecentList();
        try{
            $('#popup-exercise').popup('open');
        }
        catch(e){
            console.log("Editor.setup_events");
        }
    }, false);

         // <<<<< action on divece of moblie
    document.getElementById("exercises").addEventListener("touchstart", function(e) {
        ExercisesMenu.BuildRecentList();
        try{
            $('#popup-exercise').popup('open');
        }
        catch(e){
            console.log("Editor.setup_events");
        }
     
    }, false);
    document.getElementById("exercises").addEventListener("touchend", function(e) {
        
    }, false);
}

Editor.onResize = function(e) {
    // just update the position of our main div to properly handle mouse events
    Editor.div_position = findPosition(Editor.canvas_div);
}

Editor.onStart = function(e) {
    if (Editor.Exercises.current != null){
   if (Editor.Exercises.current.exercises_current.length > 0){
       Editor.Exercises.current.node.renderNone(Editor.Exercises.current.exercises_current);
       Box.selected = new Box(document.getElementById("box"));
       delete Editor.Exercises.current.exercises_current;
       Editor.Exercises.current.exercises_current = new Array();
       Editor.Exercises.current.flag = false;
   }
    }
    
    ResizeTo.check_down = false;
    Flottom.accept = false;
    if (Editor.using_mobile) {
   for (var i = 0; i < e.changedTouches.length; i++) {
       var touch = e.changedTouches[i];
       if (Editor.touchID < 0) {
      //<<<<<Editor.hand = 0;
      Editor.touchID = touch.identifier;
      Editor.mouse_position_prev = Editor.mouse_position;
      Editor.mouse_position = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
      Editor.BeginPoint = Editor.mouse_position;
      //<<<<<finger left
      Editor.mouse_position_first_prev = Editor.mouse_position_first;
      Editor.mouse_position_first = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
      if (e.changedTouches.length == 1 && touches.length == 1) {
          Gestures.copy_before = false;
          //<<<<<finger right
          Editor.mouse_position_second_prev = Editor.mouse_position_second;
          Editor.mouse_position_second = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
      }
      continue;
       }
       //<<<<< (1c)
       else {
      if ((e.changedTouches.length == 2 && touches.length == 0) || (e.changedTouches.length == 1 && touches.length == 1)) {
          Gestures.copy_before = false;
          //<<<<<finger right
          Editor.mouse_position_second_prev = Editor.mouse_position_second;
          Editor.mouse_position_second = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
      } else if (e.changedTouches.length == 1
            && Editor.state != EditorState.ReadyToStroke && Editor.state != EditorState.MiddleOfStroke) {
          Editor.state = EditorState.MultyRectangleSelecting;
          if (touches.length == 2) {
         //<<<<<finger left
         Substitute.mouse_position_third_prev = Substitute.mouse_position_third;
         Substitute.mouse_position_third = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
         Editor.touchID1 = touch.identifier;
          } else if (touches.length == 3) {
         delete Substitute.segments_second;
         Substitute.segments_second = new Array();
         Substitute.bounding_2.style.visibility = "hidden";
         //<<<<< (7)
         if (Substitute.segments_first.length == 0)
             //<<<<< (I)
             Substitute.SaveInforBox1();
         //<<<<<finger right
         Substitute.mouse_position_fourth_prev = Substitute.mouse_position_fourth;
         Substitute.mouse_position_fourth = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
         Editor.touchID2 = touch.identifier;
          }
      }
      else if (e.changedTouches.length == 2 && touches.length == 2
         && Editor.state != EditorState.ReadyToStroke && Editor.state != EditorState.MiddleOfStroke) {
          Editor.state = EditorState.MultyRectangleSelecting;
          if (i == 0){
         //<<<<<finger left
         Substitute.mouse_position_third_prev = Substitute.mouse_position_third;
         Substitute.mouse_position_third = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
         Editor.touchID1 = touch.identifier;
          }
          else if (i == 1){
         delete Substitute.segments_second;
         Substitute.segments_second = new Array();
         Substitute.bounding_2.style.visibility = "hidden";
         //<<<<< (7)
         if (Substitute.segments_first.length == 0)
             //<<<<< (I)
             Substitute.SaveInforBox1();
         //<<<<<finger left
         Substitute.mouse_position_fourth_prev = Substitute.mouse_position_fourth;
         Substitute.mouse_position_fourth = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
         Editor.touchID2 = touch.identifier;
          }
      }
       }
   }
   touches = e.touches;
   //<<<<< (1b)
   if (touches.length == 2) {
       Gestures.copy_before = false;
       //<<<<<finger left
       Editor.mouse_position_first_prev = Editor.mouse_position_first;
       Editor.mouse_position_first = new Vector2(touches[0].clientX - Editor.div_position[0], touches[0].clientY - Editor.div_position[1]);
       //<<<<<finger right
       Editor.mouse_position_second_prev = Editor.mouse_position_second;
       Editor.mouse_position_second = new Vector2(touches[1].clientX - Editor.div_position[0], touches[1].clientY - Editor.div_position[1]);
       if (Editor.state != EditorState.ReadyToStroke && Editor.state != EditorState.MiddleOfStroke) {
      if (Editor.state != EditorState.ReplaceSub && Editor.state != EditorState.Flottom) {
          Substitute.initialize();
          //<<<<< (4)
          Gestures.MultiTouch();
          Gestures.SelectMulti_s3();
      } else if (Editor.state == EditorState.ReplaceSub) {
          //<<<<< (8)
          Editor.state = EditorState.Flottom;
      }
       }
   }
    } else {
   if (e.button == 0) {
       //<<<<<Editor.hand = 0;
       Editor.mouse_position_prev = Editor.mouse_position;
       Editor.mouse_position = new Vector2(e.pageX - Editor.div_position[0], e.pageY - Editor.div_position[1]);
       Editor.BeginPoint = Editor.mouse_position;
   } else
   return;
    }
    //<<<<<=========================
    var now = new Date().getTime();
    Editor.mouse1_down = true;
    Gestures.flag_copy = false;
    switch (Editor.state) {
    case EditorState.ReadyToStrokeSelect:
         break;
    case EditorState.ReadyToRectangleSelect:
   // get the segments that are under the mouse click
   
        RenderManager.unsetField(Editor.set_field);
        delete Editor.set_field;
        Editor.set_field = new Array();
        delete Editor.arr_seg_select;
        Editor.arr_seg_select = new Array();
   
        Editor.clear_selected_segments();
        var click_result1 = CollisionManager.get_point_collides(Editor.mouse_position);
        var click_result2 = CollisionManager.get_point_collides_bb(Editor.mouse_position);
        var click_result3 = CollisionManager.getDash();
   // --- start --- kiem tra diem click nam trong stroke - trung stroke - ngoai stroke - tuong doi dau bang hoac dau tru
        if (click_result1.length > 0)
           Gestures.selectActive(click_result1);
        else                                                                 {
           Gestures.ReadyPenStroke();
           if (Editor.using_mobile)
              Editor.start_rect_selection = Editor.end_rect_selection = null;
      
           Editor.state = EditorState.RectangleSelecting;
           xTouchHold.tick = -1;
           xTouchHold.start();
                                                                              }
        //DUMPME:ham nay xuat hien border
        RenderManager.render();
        Fractions.CreateGroup();
        Space.printf();
        break;
    case EditorState.MultyRectangleSelecting:
	   if (touches.length == 2) {
	       if (Editor.button_states[Buttons.Key].touched)
	      return;
	       var mouse_delta_s = Vector2.Subtract(Editor.mouse_position_first, Editor.mouse_position_first_prev);
	       var mouse_delta_e = Vector2.Subtract(Editor.mouse_position_second, Editor.mouse_position_second_prev);
	       Gestures.SelectMulti_s2(mouse_delta_s, mouse_delta_e);
	   }
	   else if (touches.length == 4){
	       Editor.start_rect_selection = Editor.end_rect_selection = null;
	       Editor.start_rect_selection = Substitute.mouse_position_third_prev.clone();
	       Editor.end_rect_selection = Substitute.mouse_position_fourth_prev.clone();
	       var mouse_delta_s = Vector2.Subtract(Substitute.mouse_position_third, Substitute.mouse_position_third_prev);
	       var mouse_delta_e = Vector2.Subtract(Substitute.mouse_position_fourth, Substitute.mouse_position_fourth_prev);
	       Gestures.SelectMulti_s2(mouse_delta_s, mouse_delta_e);
	   }
	   break;
    //<<<<< (1a)
    case EditorState.SegmentsSelected:
	   Gestures.SelectSingle();
	   break;
    //<<<<< (2b)
    case EditorState.ReplaceSub:
	   //<<<<< (6)
	   Substitute.selected = Substitute.SelectSingle(Editor.mouse_position, Substitute.segments_first);
	   Fractions.CreateGroup(true);
	   Substitute.CreateExpression();
	   break;
	    case EditorState.Flottom:
	   if (touches.length == 2){
	       //<<<<< (8)
	       Flottom.Check(Editor.mouse_position_first, Editor.mouse_position_second);
	       Flottom.Exp.current = new Flottom.Exp(Editor.segments, Substitute.segments_first, Substitute.segments_second);
	       Flottom.Exp.current.startRender();
	       //Fractions.CreateGroup(true);
	       //Flottom.GroupFracs = Fractions.Groups.clone();
	       //Flottom.CreateGroup();
	   }
	   break;
    case EditorState.ReadyToStroke:
	   //<<<<< (5)
	   if (Editor.button_states[Buttons.Command].touched) {
	       Editor.state = EditorState.MiddleOfStroke;
	       Gestures.ReadyBoxStroke(Editor.fence, true);
	   } else {
	       return;
	   }
	   break;
    case EditorState.MiddleOfText:
	   if (Editor.current_action.toString() == "EditText") 
		   Editor.current_action.set_current_text(Editor.current_text.text);
	   else if (Editor.current_action.toString() == "AddSegments") 
		   Editor.current_action.buildSegmentXML();

    case EditorState.ReadyForText:
	   Editor.current_text = null;
	   var clicked_points = CollisionManager
	   .   get_point_collides(Editor.mouse_position);
	   for (var k = 0; k < clicked_points.length; k++)                        {
	       if (clicked_points[k].type_id == SymbolSegment.type_id)            {
		      Editor.current_text = clicked_points[k];
		      break;
	                                                                          }}
	   if (Editor.current_text == null)                                       {
	       var s = new SymbolSegment(Editor.mouse_position);
	       Editor.add_action(new ActionSegments(new Array(s), true,Editor.AddSegments));
	       Editor.add_segment(s);
	       Editor.current_text = s;			                                   } 
	   else Editor.add_action(new EditText(Editor.current_text));
	   RenderManager.render_layer(2);
	   Editor.state = EditorState.MiddleOfText;
	   break;
    }
}

Editor.onMove = function(e) {
    if (ResizeTo.check_down == true) {
    	ResizeTo.onMove(e);
    } 
    else if (ResizeTo.check_down == false) {
   if (Editor.using_mobile) {
       for (var i = 0; i < e.changedTouches.length; i++) {
      var touch = e.changedTouches[i];
      if (Editor.touchID == touch.identifier) {
          //<<<<<Editor.hand++;
          Editor.mouse_position_prev = Editor.mouse_position;
          Editor.mouse_position = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
          break;
      }
       }
       touches = e.touches;
       if (touches.length == 2) {
      //<<<<<finger left
      Editor.mouse_position_first_prev = Editor.mouse_position_first;
      Editor.mouse_position_first = new Vector2(touches[0].clientX - Editor.div_position[0], touches[0].clientY - Editor.div_position[1]);
      //<<<<<finger right
      Editor.mouse_position_second_prev = Editor.mouse_position_second;
      Editor.mouse_position_second = new Vector2(touches[1].clientX - Editor.div_position[0], touches[1].clientY - Editor.div_position[1]);
      //<<<<< set scale for zoom two finger
      if (Editor.mouse_position_second.y > Editor.mouse_position_first.y) {
          Editor.tempy = 2;
      } else {
          Editor.tempy = 1;
      }
      if (Editor.mouse_position_second.x > Editor.mouse_position_first.x) {
          Editor.tempx = 2;
      } else {
          Editor.tempx = 1;
      }
       }
       else if (touches.length == 4) {
      if(touchable) {
          for(var i = 0; i < touches.length; i++) {
              var touch = touches[i];
         if (Editor.touchID1 == touch.identifier) {
             //<<<<<finger left
             Substitute.mouse_position_third_prev = Substitute.mouse_position_third;
             Substitute.mouse_position_third = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
         }
         if (Editor.touchID2 == touch.identifier) {
             //<<<<<finger right
             Substitute.mouse_position_fourth_prev = Substitute.mouse_position_fourth;
             Substitute.mouse_position_fourth = new Vector2(touch.clientX - Editor.div_position[0], touch.clientY - Editor.div_position[1]);
         }
          }
      }
       }
   } else {
       //<<<<<Editor.hand++;
       Editor.mouse_position_prev = Editor.mouse_position;
       Editor.mouse_position = new Vector2(e.pageX - Editor.div_position[0], e.pageY - Editor.div_position[1]);
   }
    }
    //<<<<<=========================
    var mouse_delta = Vector2.Subtract(Editor.mouse_position, Editor.mouse_position_prev);
    if (Editor.mouse1_down == true) {
   switch (Editor.state) {
   case EditorState.ReadyToStrokeSelect:
       // we don't care here
       break;
   case EditorState.StrokeSelecting:
       Gestures.SelectMouse_s2();
       break;
   case EditorState.RectangleSelecting:
       if (Gestures.isResizeDraft == false) {
      if (Editor.current_stroke != null) {
          if (xTouchHold.tick < 1){ //sn
         xTouchHold.stop(); //sn
         if (Editor.using_mobile && e.changedTouches) {
             Editor.current_stroke.add_point(Editor.mouse_position);
             //<<<<<Editor.hand = 0;
         } else if (!Editor.using_mobile) Editor.current_stroke.add_point(Editor.mouse_position);
          }
          else{
         Editor.current_stroke.finish_stroke(Editor.current_stroke.world_mins, Editor.current_stroke.scale);
         var tag = document.getElementsByTagName("g");
         //tag[tag.length - 1].setAttribute("visibility", "hidden");
         Editor.remove_segment(Editor.current_stroke);
         document.getElementById("svgId").removeChild(tag[tag.length - 1]);
         Editor.undo_stack.pop();
         Editor.current_stroke = null;
         xTouchHold.stop();
          }
      }
      if (Editor.current_stroke == null) {
          xTouchHold.selectS1a();
      }
       } else {
      xTouchHold.tick = -1;
      xTouchHold.stop();
      Gestures.onMove(e);
       }
       break;
   case EditorState.SegmentsSelected:
       Gestures.SelectDrag();
   //<<<<< (A)
   case EditorState.MovingSegments:
       Gestures.SelectDrag();
       //console.log(">>>>>>>>ddo");
       //Space.selectShift();
       break;
   case EditorState.ReplaceSub:
       if (Substitute.selected == true) {
      Substitute.MoveSeg(Editor.mouse_position_prev, Editor.mouse_position);
       } else {
      return;
       }
       break;
   case EditorState.MiddleOfStroke:
       if (Editor.using_mobile) {
      if (Editor.mouse_position_second.x > 0 && Editor.mouse_position_second.y > 0){
          if (Editor.mouse_position_second.x == Editor.mouse_position_second_prev.x
         && Editor.mouse_position_second.y == Editor.mouse_position_second_prev.y)
         return;
          Editor.current_stroke.add_point(Editor.mouse_position_second);
      }
      else {
          if (Editor.mouse_position_first.x == Editor.mouse_position_first_prev.x
         && Editor.mouse_position_first.y == Editor.mouse_position_first_prev.y)
         return;
          Editor.current_stroke.add_point(Editor.mouse_position_first);
      }
       } else if (!Editor.using_mobile) Editor.current_stroke.add_point(Editor.mouse_position);
       break;
   case EditorState.MultyRectangleSelecting:
       if (touches.length == 2){
      //<<<<< (F)
      if (Editor.button_states[Buttons.Key].touched)
          return;
      var mouse_delta_s = Vector2.Subtract(Editor.mouse_position_first, Editor.mouse_position_first_prev);
      var mouse_delta_e = Vector2.Subtract(Editor.mouse_position_second, Editor.mouse_position_second_prev);
      Gestures.SelectMulti_s2(mouse_delta_s, mouse_delta_e);
       }
       else if (touches.length == 4){
      //<<<<< (J)
      var mouse_delta_s = Vector2.Subtract(Substitute.mouse_position_third, Substitute.mouse_position_third_prev);
      var mouse_delta_e = Vector2.Subtract(Substitute.mouse_position_fourth, Substitute.mouse_position_fourth_prev);
      Gestures.SelectMulti_s2(mouse_delta_s, mouse_delta_e);
       }
       break;
   //<<<<< (C)
   case EditorState.Zoom:
       var m_pos_first = Editor.mouse_position_first;
       m_pos_first_pre = Editor.mouse_position_first_prev;
       m_pos_seccond = Editor.mouse_position_second;
       m_pos_sencond_pre = Editor.mouse_position_second_prev;
       Gestures.fnZoom(m_pos_first, m_pos_first_pre, m_pos_seccond, m_pos_sencond_pre, true, Editor.zoom2);
       break;
   case EditorState.Flottom:
       if (touches.length == 2) {
      if (Flottom.accept == true) {
          Flottom.SetBounding();
      }
       }
       break;
   }
    }
}

/*****************************************************************************
*
*****************************************************************************/
Editor.onEnd = function(e) {
if (Editor.using_mobile) {
   touches = e.touches;
   for (var i = 0; i < e.changedTouches.length; i++) {
      var touch = e.changedTouches[i];
      if (Editor.touchID == touch.identifier) Editor.touchID = -1;
      if (Editor.touchI1 == touch.identifier) Editor.touchID1 = -1;
      if (Editor.touchI2 == touch.identifier) Editor.touchID2 = -1;   }    }
Gestures.restoreNode();
if (Keyboard.isKeyboard) {   Keyboard.onUp();    }
if (ResizeTo.check_down == true) {   ResizeTo.onUp();    } 
else if (ResizeTo.check_down == false) {
if (e.button == 0 || e.type == "touchend") {
   HistorySegments.select_active = false;
   Editor.mouse1_down = false;
   Editor.EndPoint = Editor.mouse_position;
   Gestures.touch_step = false;

   switch (Editor.state)                                                    {
      case EditorState.StrokeSelecting:       break; //a2-hoarding
      case EditorState.RectangleSelecting:
         if (Gestures.isResizeDraft == true) { Gestures.onUp();  }
         if (Editor.selected_segments.length > 0)                           {           
            Editor.start_rect_selection = Editor.end_rect_selection = null;
            RenderManager.selection_box.style.visibility = "hidden"; //a-8 hoarding
            Editor.state = EditorState.SegmentsSelected;
            Editor.set_field = RenderManager.setField();                    }
         else                                                               {
            Editor.state = EditorState.ReadyToRectangleSelect;
            if (Editor.current_stroke == null)                              {
               Editor.start_rect_selection = Editor.end_rect_selection = null;
               RenderManager.selection_box.style.visibility = "hidden"; //a-8 hoarding
               RenderManager.render();                                      }
            else {
            	Gestures.EndStroke();
            }
         } //<<<<< (9)
         xTouchHold.tick = -1;
         xTouchHold.stop();
      break;
      case EditorState.SegmentsSelected:
         Editor.set_field = RenderManager.setField();
         Gestures.doubleclick();
      break;

      case EditorState.MovingSegments:      //<<<<<Editor.hand = 0;
         Insert.action();
         Fractions.ShowLog();
         //Space.Endrender();
         Gestures.restoreNode();
         var select_segment = new Array();
         delete Editor.segments_dralf;
         Editor.segments_dralf = new Array();
         delete Editor.segments_v;
         Editor.segments_v = new Array();
         segments_selected = new Array();
         Gestures.state = 3;
         Editor.set_field = RenderManager.setField();
         if (Editor.selected_segments.length > 0) {
            Editor.state = EditorState.SegmentsSelected;
            for (var k = 0; k < Editor.selected_segments.length; k++) {
               var set_id = Editor.selected_segments[k].set_id;
               var index = Editor.FindIndexSplitSegment(set_id);
               if (Editor.selected_segments[k].isDraff == true)
                  Editor.segments_dralf.push(Editor.selected_segments[k]);
               else if (Gestures.isBlockSegment(Editor.selected_segments[k], 1))
                  Editor.segments_v.push(Editor.selected_segments[k]);
               else
                  segments_selected.push(Editor.selected_segments[k]);
               if (index != -1) { //a1-hoarding
                  Gestures.updateSplit(Editor.selected_segments[k], index);
                  var bBool = Editor.selected_segments[k]
                  .  Checkfinish_stroke(Editor.control_point_radius);
                  var temp = Editor.segmentSplits[index].flag;
                  var indexParent;
                  if (bBool == false && temp == false)                       {
                     indexParent = Editor.FindIndexSplitSegment(Editor
                     .  segmentSplits[index].parentIds);
                     var indexOf = Editor.FindIndexSegment(Editor
                     .  segmentSplits[indexParent].set_id, Editor.selected_segments);
                     if (indexParent != -1 && indexOf == -1)                 {
                        var indexChildren = Editor.FindIndexSegment(set_id
                        ,  Editor.segmentSplits[indexParent].childrenSplit);
                        Editor.segmentSplits[indexParent].childrenSplit
                        .  splice(indexChildren, 1);
                        select_segment.push(Editor.selected_segments[k]);
                        Editor.DeleteSegmentSplit(index);                   }} //<<<<< (10)
                  //if (Gestures.PosOutSize(Segment.top, Segment.left, Segment.width, Segment.height) == true) {
                  if (Gestures.deletes()) { //Editor.DeleteSegmentSplit(index);
                     var obj = document.getElementById(String(set_id));
                     if (obj != null) {
                     //var divSplit = document.getElementById("segmentSplit");
                     //divSplit.removeChild(obj);
                        obj.style.visibility = "hidden";
                        indexParent = Editor.FindIndexSplitSegment(set_id);
                        if (indexParent != -1) {
                           for (var t = 0; t < Editor.segmentSplits[indexParent]
                           .  childrenSplit.length; t++){
                              var segmentChild = Editor.segmentSplits[indexParent]
                              .  childrenSplit[t];
                              segmentChild.element.style.visibility = "hidden"; }}}}}} // end for k
            console.log("chieu dai " + Editor.selected_segments_transform.length);
            Editor.current_action.add_new_transforms(Editor
            .  selected_segments_transform);
            if (Gestures.check_count_move <= 1)  Editor.undo_stack.pop();
            if (segments_selected.length > 0)
               Gestures.DeleteSegments(segments_selected, -1);
            else { }    //Editor.undo_stack.pop();
            if (Editor.segments_dralf.length > 0) 
               Gestures.DeleteSegments(Editor.segments_dralf, -1);
            if (Editor.segments_v.length > 0)
               Gestures.DeleteSegments(Editor.segments_v, -1);
            if (Editor.zoom1 == true)                 {
               Gestures.state = 0;
               if (Editor.current_stroke.finish_stroke( Editor.current_stroke
               .  world_mins, Editor.current_stroke.scale))
                  RecognitionManager.enqueueSegment(Editor.current_stroke);
               else         Editor.segments.pop();
               Editor.current_stroke = null;          }
            RenderManager.render();      
         }   // end   if (Editor.selected_segments.length > 0)
         MagnifyingGlass.node_box.style.display = "none";
         if (MagnifyingGlass.manage_svg != null) {
            $(MagnifyingGlass.manage_svg).remove();
            MagnifyingGlass.manage_svg = null;
            MagnifyingGlass.manage_g = null;      }
         Gestures.doubleclick();
      break;  // end case EditorState.MovingSegments:

      case EditorState.MiddleOfStroke:
         Editor.state = EditorState.ReadyToStroke;
         Gestures.EndBoxStroke();
      break;
      case EditorState.MultyRectangleSelecting:
         if (Editor.selected_segments.length > 0)             { //a3-hoarding
            Editor.set_field = RenderManager.setField();
            Editor.state = EditorState.SegmentsSelected;      }
         else
            Editor.state = EditorState.ReadyToRectangleSelect;
         Editor.start_rect_selection = Editor.end_rect_selection = null;
         RenderManager.render();
         ////<<<<<Editor.hand = 1;
         //<<<<< (11)
         if (Substitute.segments_first.length > 0 && Editor.selected_segments
         .  length > 0) {
             Substitute.SaveInforBox2();
             RenderManager.unsetField(Editor.set_field);
             delete Editor.set_field;
             Editor.set_field = new Array();
             delete Editor.arr_seg_select;
             Editor.arr_seg_select = new Array();      }
      break;

      case EditorState.Zoom:
         for (var k = 0; k < Editor.selected_segments.length; k++) {
            //Editor.selected_segments[k].renewPoint();
            Editor.selected_segments[k].freeze_transform();           }
         Editor.current_action.add_new_transforms(Editor.selected_segments);
         if (Editor.selected_segments.length > 0) {  //a4-hoarding
            Editor.set_field = RenderManager.setField();
            Editor.state = EditorState.SegmentsSelected;               }
         else
            Editor.state = EditorState.ReadyToRectangleSelect;
         RenderManager.render();
         Editor.resize_offset = new Vector2(0, 0);
         //<<<<<Editor.hand = 0;
      break;
      case EditorState.ReadyToStroke:
         Editor.start_rect_selection = Editor.end_rect_selection = null;
         RenderManager.render();
         //<<<<<Editor.hand = 0;
      break;
      case EditorState.ReadyToStrokeSelect:
         Editor.clearButtonOverlays();
         //Editor.button_states[Buttons.Command].setSelected(true);
         //Editor.button_states[Buttons.Stroke].setSelected(false);
         Editor.state = EditorState.SegmentsSelected;
         Editor.selection_method = "Rectangle";
         RenderManager.render();
         break;
          //<<<<< (13)

      case EditorState.ReplaceSub:
         if (Substitute.Replace() == true)                             {
            Substitute.SearchSegments(Substitute.segments_second
            ,  Substitute.segments_first);
            Substitute.saveCopySegments(Substitute.segments_first
            ,  Substitute.segments_second);
            Editor.clear_selected_segments();
            Editor.state = EditorState.ReadyToRectangleSelect;         }
         else                                                          {
            Editor.current_action.add_new_transforms(Editor
            .  selected_segments_transform);
            Editor.drag  = false;
            var action = Editor.undo_stack.pop();
            action.Undo();
            Editor.action_list.push(new Undo());
            // khoi tao lai
            Substitute.initialize();
            Flottom.initialize();
            Editor.clear_selected_segments();
            Editor.state = EditorState.ReadyToRectangleSelect;
            Gestures.restoreNode(); //a5-hoarding
            RenderManager.render();                                    }
      break;
      //<<<<< (14)

      case EditorState.Flottom:
         if (Flottom.accept == true && touches.length == 0) {
            if (Flottom.Exp.current.status)
               Flottom.Exp.current.endRender();
            else                                            {
               Flottom.Restore();
               Flottom.Exp.init();
               Editor.undo_stack.pop();
               Editor.undo_stack.pop();
               Flottom.showLabel("Not valid!");             } } //a6-hoarding
      break;
   } // end switch
    try                                                               {
      if (touches.length == 0 && Editor.state != EditorState.Flottom) {
         if (Substitute.segments_first.length > 0 && Substitute
         .  segments_second.length > 0) 
            Editor.state = EditorState.ReplaceSub;
         if (Substitute.segments_first.length > 0 && Substitute
         .  segments_second.length == 0)                              {
            Substitute.initialize();
            RenderManager.render();                                   }
         Substitute.selection_rec.style.visibility = "hidden";        } } 
   catch (err) { return;                                              }
   Editor.segments = Gestures.SortSetId(Editor.segments);
   Gestures.check_count_move = 0;
   } // end if (e.button == 0 || e.type == "touchend")
}    // end else if (ResizeTo.check_down == false)
   Editor.Exercises.action();
   xTouchHold.tick = -1;
}

Editor.preventBackspace = function(e) {
    if (e.keyCode == 8) {
   if (navigator.userAgent.indexOf("Opera") == -1) {
       e.preventDefault();
       if (navigator.userAgent.indexOf("Firefox") == -1) Editor.onKeyPress(e);
   }
    }

    if (e.keyCode == 46) Editor.deleteTool();
}

Editor.onKeyPress = function(e) {
    switch (Editor.state) {
    case EditorState.MiddleOfText:
   if (Editor.current_text != null) {
       if (e.keyCode == 8) // backspace
       Editor.current_text.popCharacter();
       else {
      Editor.current_text.addCharacter(String.fromCharCode(e.which));
       }

       RenderManager.render_layer(2);
   }

   break;
    }
}

//<<<<< goi trang thai ve
Editor.selectPenTool = function() {
    Gestures.flag_copy = false;
    Editor.change_step = true;
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    delete Editor.arr_seg_select;
    Editor.arr_seg_select = new Array();
    Editor.clearButtonOverlays();
    
    Editor.check_box = true;
    Editor.clear_selected_segments();
    Editor.current_stroke = null;
    switch (Editor.state) {
	   case EditorState.MiddleOfText:
	   if (Editor.current_action.toString() == "EditText") 
		   Editor.current_action.set_current_text(Editor.current_text.text);
	   else if (Editor.current_action.toString() == "AddSegments") 
		   Editor.current_action.buildSegmentXML();
	   Editor.current_text = null;
	   RenderManager.render_layer(2);
	   break;
    }
    Editor.state = EditorState.ReadyToStroke;
    RenderManager.render();
    Editor.selection_method = "Pen";
    RenderManager.clear_canvas();
    AutoGroup.isCheckPen = true;
}

//<<<<< goi trang thai nut stroke (debug)
Editor.strokeSelectionTool = function() {
    return;
    Editor.change_step = false;
    if (Editor.button_states[Buttons.Stroke].enabled == false) return;
    Gestures.flag_copy = false;
    Editor.arr_seg_select = new Array();
    Editor.clearButtonOverlays();
    Editor.button_states[Buttons.Stroke].setSelected(true);
    if (Editor.selected_segments.length == 0) {
   
    }
    switch (Editor.state) {
	   case EditorState.MiddleOfText:
	   if (Editor.current_action.toString() == "EditText") 
		   Editor.current_action.set_current_text(Editor.current_text.text);
	   else if (Editor.current_action.toString() == "AddSegments") 
		   Editor.current_action.buildSegmentXML();
	   Editor.current_text = null;
	   RenderManager.render_layer(2);
	   break;
	}
    if (Editor.selected_segments.length == 0) 
       Editor.state = EditorState.ReadyToStrokeSelect;
    else
       Editor.state = EditorState.SegmentsSelected;
    RenderManager.render();
    Editor.selection_method = "Stroke";
    if (AutoGroup.isCheckPen) AutoGroup.Groups();
    AutoGroup.isCheckPen = false;
    SysEquations.SaveExpressions();
}

//<<<<< goi trang thai box thuc hien gestures
Editor.rectangleSelectionTool = function() {
    Substitute.initialize();
    Flottom.initialize();
    Editor.change_step = false;
    Editor.check_box = false;
    Gestures.flag_copy = false;
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    delete Editor.arr_seg_select;
    Editor.arr_seg_select = new Array();
    Editor.clearButtonOverlays();

    switch (Editor.state) {
	   case EditorState.MiddleOfText:
	   if      (Editor.current_action.toString() == "EditText")    Editor.current_action.set_current_text(Editor.current_text.text);
	   else if (Editor.current_action.toString() == "AddSegments") Editor.current_action.buildSegmentXML();
	   Editor.current_text = null;
	   RenderManager.render_layer(2);
	   break;
    }
    if (Editor.selected_segments.length == 0) {
    	Editor.state = EditorState.ReadyToRectangleSelect;
    } else
    	Editor.state = EditorState.SegmentsSelected;
    
    RenderManager.render();
    Editor.selection_method = "Rectangle";
    
    if (AutoGroup.isCheckPen) AutoGroup.Groups();
    AutoGroup.isCheckPen = false;
    SysEquations.SaveExpressions();
}

/*******************************************************************************
* Editor.align()
********************************************************************************
* submit characters & positions (not stroke points) for phrase recognition & 
* maxima correctness check.  align() is actually a really long procedure that 
* was functionized into 5 helper functions:  
*    initEAattributes(), initEAresets(), parseAlignResult(), 
*    fiddleTex(), fenceAndLatexThing()
********************************************************************************
* notes for conversion to rex adapter:
********************************************************************************
* pseudo-code summary:
* 1. SE.BuildTupe( SE.Expressions ); // array-of-arrays [[eq1 symbols][eq2 symbols]]
* 2. sb.append(    SE.string      ); // xml version of array-of-arrays
* 3. $.ajax( ... align_server_url + sb, success: function( in_data, textStat
* 4. ,   xmlhttp)                                                           {
* 5.    result            = parseAlignResult( xmlhttp... )
* 6.    arr_latex         = reformatTex( result )
* 7.    fenceAndLatexThing( result )
* 8.    HS.TableList(       arr_latex, result )
* 9.    wrapCorxLight(      color )
* 10.   updateMathFont(     arr_latex )                                      })
*
* 3 ways to do rex:  singly "1", concatenated calls "beads", bulk (pent only)
* - singly: call recognizer for 1 equation
* - bead:   for syq, call rex singly, then chain the latex results together
*   mys .phraseOf(s, bead) { loop mys.phraseOf(s,1); concat } // loops Cordova.exec
*   pent.phraseOf(s, bead) { loop pent.    "       ; concat } // loops ajax()
* - bulk:   call rex once on an entire syq.  myscript does not support this
*   pent.phraseOf(s, bulk) { loop pentIF; concat; ajax steps.jsp }. single ajax call
*       (equivalently)     { BuildTupe-XML; ajax(steps.jsp?segments...) }
*
* latex = xxx.phraseOf( xxx.rexIF(sym[]), quantity )
* - xxx     = mys or pet
* - q       = single, bead, bulk
* - rexIF() = the string-ified version of the array of symbols. "IF" = input format" 
*   each recognizer has its own format, so the code body of rexIF() will 
*   depend on the recognizer object. BuildTupe-BuildXML implements this, but we need a version of it for 
*   a single equation.
* - phraseOf calls $ajax() or Cordova.exec(), then calls result handler
*
*a sb = ..<sl> ... <s "_plus" /> ... </sl> ... (missing points for Authoring!?!)
*  sb is used in a 2-stage recognizer, and to save the points for authoring.
*******************************************************************************/
Editor.align = function(select_id,idActiveMath)                               {
   if (Editor.segments.length == 0
   ||  HistorySegments.is_finish
   ||  HistorySegments.getPermision()
   ||  HistorySegments.list_segments.length == 0
   ||  HistorySegments.index == -1)  return;
   
   if(HistorySegments.index == 0 && HistorySegments.list_segments.length >1)  {
      alert("Step #1 cannot be changed.");
      return;                                                                 }
   
   Editor.ajaxLoader("visible");
   Editor.initEAattributes();
   Editor.initEAresets();
   
   if(HistorySegments.index == HistorySegments.list_segments.length -1
	   && HistorySegments.isBlankStep(HistorySegments.index))                 {
	   HistorySegments.DeleteBlankStep(HistorySegments.index);
	   HistorySegments.index --;
   }
   if(!HistorySegments.recorrectD){
      SysEquations.BuildTupe(SysEquations.Expressions);
      
      /***** the big call *********/
      // reset aligned & texs 
      if(rex != undefined)                                                    {
        rex.aligned.splice(0, rex.aligned.length); 
        rex.texs.splice(0, rex.texs.length); // clear memory for the Submit
        rex.syq= "";
        rex.ajaxError = false;                                                }
      
      rex.fraz();
   }
   if(!rex.ajaxError) {
      if (Editor.isSkippable(Editor.SkipValues.Corx)) 
           Editor.postCorx();
      else Editor.preCorx();
   }
   /****************************/
   
   if(!HistorySegments.recorrectD)                                            {
      /*
      var arr_latex = new Array;
       for (ith = 0; ith < rex.aligned.length; ith++){   
          arr_latex = arr_latex.concat(Editor.reformatTex( 
                rex.aligned[ith].tex_nodes ).arr_latex);
       }
       Editor.updateMathFont(arr_latex);
       */
      if(rex.texs)
         Editor.updateMathFont( rex.texs );
      else Editor.updateMathFont(Exercises.PhraseFormats[HistorySegments.index].arr_latex);
     
      if (SysEquations.Flag)
         Exercises.userInputPostion = Exercises.userInputPostion + 1;
                                                                               }
   Editor.button_states[Buttons.Command].setTouched(false);
   Editor.clearButtonOverlays();

}
/**************
* intent:  parse for latex, set globals HS & $(tex_result)
* desc:
*    calls parseAlignResult(), reformatTex(), fenceAndLatexThing()
*    I don't think the fenceAnd..() is used
* input:     see #doc-corx.jsp
*    only xmlhttp is used, other is forced upon by jquery.ajax
*    xmlhttp.responseText = see #doc-steps.jsp, <AR> <SL $3xy=0$> <SL $4x=1$> </AR>
*    xmhhttp is jqXHR object
*    textStatus = (see jquery docs)
*    in_data = data returned from server,formatted according to dataType
*            = xmlhttp.responseText (I think)
* input (full version from doc-steps.jsp 150121):
*     <AR>            <maxima> $3x-2x$,$..$ </maxima>
*     <SL guid=0..f TexString="$2x+3y=8$"  variable=x,y> <image>..</SL>
*     <SL guid=5..a TexString="$x6+4y=14$" variable=x,y> <image>..</SL> /AR>
* output:   see #doc-corx.jsp
*    rex.aligned.syq -- see cross-files.txt for definitive format
*    sets global properties HistorySegment.currMaxima & $("tex_result")
*

*a hoarding:
   ignorance of $ & ^ in regex:
   var 
   var L = HSprelatex[N].length - 1;
   if ( HSprelatex[0].search(/\$/) === 0 ) HSprelatex[0].substr(1,N);
   if ( HSprelatex[N].search(/\$/) === L ) HSprelatex[N].substr(0,L); 
**************/
// renamed "result" variable to "rex.aligned"
Editor.postAlign = function( ith, in_data, textStatus, xmlhttp )               {
rex.aligned[ith] = Editor.parseAlignResult( xmlhttp.responseText );
var xxx = Editor.reformatTex( rex.aligned[ith].tex_nodes ); 
rex.aligned[ith].syq = xxx.arr_latex;

return rex.aligned[ith];
}
/******************************************************************************
 * correct format of latex built from an array
 ******************************************************************************/
Editor.correctLatexFormat = function (latex)                                  {
   var str = latex;	
   //2x+3y=8 --> $2x+3y=8$
   if(!str.startsWith("$"))
      str = "$"+str+"$";
   //$$2x+3y=8$$$$6x+4y=14$$ -->$2x+3y=8$$6x+4y=14$
   else if(str.startsWith("$$"))
      str = str.replace(/\$\$/g, "\$" );
  
   //$2x+3y=8$$6x+4y=14$ --> $2x+3y=8$,$6x+4y=14$
   str = str.replace(/\$\$/g, "\$,\$" );
   return str;                                                                }
/**************
* cal corx.jsp for step-correctness
**************/
Editor.preCorx = function()                                                   {
var previousLatex, currentLatex;
if(HistorySegments.recorrectD){
	previousLatex = Editor.r2s(Exercises
			.PhraseFormats[HistorySegments.index-1].arr_latex,"$$","$");
	currentLatex = Editor.r2s( Exercises
			.PhraseFormats[HistorySegments.index  ].arr_latex,"$$","$");
}
else
	if(HistorySegments.index == HistorySegments.list_segments.length -1)      {
		previousLatex = Editor.r2s(Exercises
				.PhraseFormats[HistorySegments.index].arr_latex,"$$","$");
		currentLatex = rex.syq;                                               }
	else if(HistorySegments.index < HistorySegments.list_segments.length -1)  {
		previousLatex = Editor.r2s(Exercises
				.PhraseFormats[HistorySegments.index-1].arr_latex,"$$","$");
		currentLatex = rex.syq;                                               }

previousLatex = Editor.correctLatexFormat(previousLatex);
currentLatex = Editor.correctLatexFormat(currentLatex);

previousLatex = previousLatex.replace( /\u00B1/g , "\\pm" );//g fixed the pm issue
currentLatex = currentLatex.replace( /\u00B1/g , "\\pm" );//g fixed the pm issue

rex.corx_input  = "?qstring=" 
+ encodeURIComponent( "<steps guid = \"" + guid() + "\"> "
+  "<Exercise idExp = \"NaN\" stepExp=\"0\" hint=\"false\" title=\"\" "
+  "idActiveMath=\"\" userInputPostion=\"-1\" />"
+  "<step order=\"old\" fraz=\"" 
+  previousLatex.replace(">","\\>").replace("<","\\<") 
+  "\" variable=\"" + SysEquations.s_variable + "\" />"
+  "<step order=\"new\" fraz=\""
+  currentLatex.replace(">","\\>").replace("<","\\<") 
+  "\" variable=\"" + SysEquations.s_variable + "\" />" + "</steps>" );

$.get( "web/ours/jsp/corx.jsp" + rex.corx_input
,  function( in_data, textStatus, xmlhttp ) { 
   if(isAjaxSessionTimeOut(xmlhttp)) return; 
   Editor.postCorx( xmlhttp ); } )
.  fail( function( jqXHR, textStatus, errorThrown ) { 
      Editor.copeAjaxError( jqXHR, textStatus, errorThrown ); 
   }); // end error function
}
/**************
* intent: parse CAS result from corx.jsp for step-correctness
**************/
Editor.postCorx = function( xmlhttp )                                         {
   var param2 = null; 
   // it was hardcoded in ajax returns
   //<CorxResponse result="false" message="placeholder"><ExerciseStep istrue="hardcode" isfinish="hardcode" message="null" /></CorxResponse>

   if(xmlhttp != undefined){
      var    r = new Object();
      r.xmldoc = new DOMParser().parseFromString(xmlhttp.responseText
      ,  "text/xml");
      var CRtag = r.xmldoc.getElementsByTagName("CorxResponse")[0];
      r.result = CRtag.attributes["result"].value;
      HistorySegments.check_step = (r.result == "true");
      param2 = CRtag.attributes["message"].value;
   }else HistorySegments.check_step = false;
   // g fix issues related abs function
   if(!HistorySegments.check_step){
      try {
         var message = r.xmldoc.getElementsByTagName("ExerciseStep")[0].attributes["message"].value;
         if(message != "null") alert(message);
      }catch(e){}
   }
   /////
   var arr_latex = new Array;
   if(!HistorySegments.recorrectD)
      /*
	   for (ith = 0; ith < rex.aligned.length; ith++)
		   arr_latex = arr_latex.concat(Editor.reformatTex( rex.aligned[ith]
		   .   tex_nodes ).arr_latex);
		   */
      arr_latex = rex.texs;//g fix for loading step having partial instead of 2
   else
	  arr_latex = arr_latex.concat(Exercises.PhraseFormats[HistorySegments
      .  index].arr_latex);   
   
   HistorySegments.stringXml.clear();

   //Editor.wrapCorxLight(HistorySegments.check_step ? "green":"red");
   
   if( HistorySegments.index >= HistorySegments.list_segments.length-1 
   && HistorySegments.recorrectM == 0)
	  HistorySegments.StepTo++;
   //proc_skipped
   var proc_skipped = HistorySegments.list_segments[HistorySegments.index].skipValues;
   if(!proc_skipped) proc_skipped = "";
   
   if( Editor.isSkippable(Editor.SkipValues.Corx))                            {
      if(proc_skipped.indexOf(Editor.SkipValues.Corx) == -1)                    
         proc_skipped += Editor.SkipValues.Corx;                              }
   else                                                                       {
      var re = new RegExp(Editor.SkipValues.Corx,"g");
      proc_skipped = proc_skipped.replace(re,'');                             }
   
   HistorySegments.TableList( arr_latex, param2, proc_skipped);
  
   var root = new StringBuilder();
   root.append("<root>")
   .    append(HistorySegments.stringXml)
   .    append("<color>")
   .    append( HistorySegments.check_step ? "green":"red" )
   .    append("</color>")
   .    append("</root>"); 
   
   HistorySegments.sendData(String(root), Editor.am_correction );
   HistorySegments.check_delete = false;
   
   if (Editor.am_correction && HistorySegments.is_finish)
      Editor.inserPoint();
   // recall E.align for checking the result flag of 
   // the step next to the seleted one
   if(HistorySegments.recorrectM == 1)                                         {
	   if(Exercises.PhraseFormats[HistorySegments.index+1].arr_latex.length==0)
		   HistorySegments.recorrectM = 0;
	   else                                                                    {
		   HistorySegments.recorrectD = true;
		   HistorySegments.index++;
		   Editor.align();                      	                          }}
   else if(HistorySegments.recorrectM == -1)                                   {
	  HistorySegments.index--;
	  HistorySegments.recorrectM = 0;                                          }

   if(HistorySegments.recorrectM == 0
	 && HistorySegments.index == HistorySegments.list_segments.length - 1
     && Exercises.PhraseFormats[HistorySegments.index].arr_latex.length != 0)
	   HistorySegments.writeBlankStep();
   
   Editor.ajaxLoader("hidden");
   //return r.result;                                                            
   }

/**************
* intent:  concatenate and array into a string
* input:   r = array to string, cap = pad the ends of string, separator
* output:  strung up array 
* example  r2s( ['3x','4y'], '$$', '$' ) returns '$3x$$4y$'
**************/
Editor.r2s = function ( r, separator, cap ) {
   if ( r.length < 0 ) return false;
   var s = cap + r[0];
   for (var i=1; i < r.length; i++) s += separator + r[i];
   s = s + cap;
   return s; }

/**************
* 
**************/
Editor.copeAjaxError = function(jqXHR, textStatus, errorThrown)               {
   Editor.ajaxLoader("hidden"); 
   alert( "ajax error:  textStatus = " + textStatus + "\nerrorThrown = " 
   +       errorThrown + "\njqXHR.responseText = " + jqXHR.responseText );    
   console.log("ajax error:  textStatus = " + textStatus + "\nerrorThrown = " 
		   +       errorThrown + "\njqXHR.responseText = " + jqXHR.responseText );}
/**************
*  used in Editor.align()
**************/
/* use isAjaxSessionTimeOut in session-check.js
needRelogin = function ( xmlhttp )                                    {
if ( String(xmlhttp.getResponseHeader("content-type")).search("text/html") == 0)                                         {
   window.location.href = Editor.login_server_url;
   return true;                                                      }}
*/
/**************
* 
**************/
Editor.initEAattributes = function( select_id, idActiveMath ) {
    
if (select_id != undefined && !isNaN(select_id))  
   Exercises.id_select = select_id;
if (idActiveMath != undefined) 
   Exercises.id_activeMath = idActiveMath;
if (Editor.state != EditorState.ReadyToStroke && Editor.state 
!=  EditorState.MiddleOfStroke)                             {
   if (Editor.selected_segments.length == 0) 
      Editor.state =  EditorState.ReadyToRectangleSelect;
   else   Editor.state = EditorState.SegmentsSelected;      }
if (Editor.selection_method == "Pen") 
   Editor.selection_method = "Rectangle";
if (Editor.selection_method == "Rectangle")                 {
   Editor.rectangleSelectionTool();
   Editor.state = EditorState.ReadyToRectangleSelect;       }
else if (Editor.selection_method == "Stroke")               {
   Editor.strokeSelectionTool();
   Editor.state = EditorState.ReadyToStrokeSelect;          }}

/*************
* 
*************/
Editor.initEAresets = function( )                                             {
   Gestures.flag_copy = false;
   RenderManager.unsetField(Editor.set_field);
   delete Editor.set_field;
   Editor.set_field = new Array();
   delete Editor.arr_seg_select;
   Editor.arr_seg_select = new Array();
   Editor.clear_selected_segments();
   Gestures.restoreNode();
   //Editor.check_rectangle = true;
   Gestures.check_count_move = 0;                                             }

/**************
* INTENT: strip "$" from latex?
* INPUT:  tex_nodes  = [ [$2x+3y=8$] [$x6+4y=14$] ]
* OUTPUT: currMaxima = [ [$2x+3y=8$] [$x6+4y=14$] ]
*         arr_latex  = [ [ 2x+3y=8 ] [ x6+4y=14 ] ]
*         syq = <syq step="4" variable="x,y" latex="$y(x+2)(x-3)$,$(y+6)(2x)$" />
*         .     <syq step="5" variable="x,y" latex="$(x+2)y(x-3)$,$2x(y+6)$"   />
*         usually the Step attribute doesn't matter since most manipulation 
*         is bidirectional, but sometimes it does, as in square rooting an 
*         equation

* leaf function
* not sure why we currMaxima is the same as input
* format Latex string with "$" and remove spaces
**************/
//sn-140822-3step:  added syq string
Editor.reformatTex = function( tex_nodes ) { 
   var arr_latex = new Array;
   var syq = "?"; 
   Editor.hint = false;
   var currMaxima = new Array();
   if (tex_nodes.length != 0)                                            {
      var tex_math = new StringBuilder();
      for (var i = 0; i < tex_nodes.length; i++)                         {
         tex_math.append("$");
         // redundant-start.  already done in parseAlignResults's result.tex_results[]
         var tex_string = tex_nodes[i].attributes["TexString"].value;
         var variable = "";
         try { variable = tex_nodes[i].attributes["variable"].value; }
         catch (e) {}
       // redundant-end
         
         if (variable = "") 
            SysEquations.s_variable = variable;
         tex_string = tex_string.replace(/\s{1,}/gm, ""); //trim
         tex_string = tex_string.match(/(\$.*\$)/g)[0]; //lay chuoi latex
         tex_string = tex_string.replace(/\$/gm, ""); //khu het dau $
         tex_math.append(tex_string);
         arr_latex.push(tex_string);
         tex_math.append("$");
         currMaxima[i] = "$" + tex_string + "$";
         syq += "<syq " 
		 +      "step=\""      + (i+1)        + "\" " 
		 +      "latex=\""     + arr_latex[i] + "\" " 
		 +      "variables=\"" + SysEquations.s_variable     + "\" " 
		 +      "/>"; //sn-140822 3steps
       }}
   return { currMaxima : currMaxima, arr_latex : arr_latex, syq : syq };              } //sn-140822 3steps: added syq to return value
         
/**************
* INTENT:  parse latex recognition & Maxima result string from
* Editor.align_server_url into results object "r"
*
* INPUT:   in_data string
* SL = SegmentList, AR = AlignResponse
* <AR result="1" error="">
* <exerciseStep message=null istrue=false isfinish=false/>
* <SL guid=0..f TexString="$2x+3y=8$"  variable=x,y> <image>..</SL>
* <SL guid=5..a TexString="$x6+4y=14$" variable=x,y> <image>..</SL></AR>
*
* OUTPUT:  "r"
* r.tex_results[0] = $2x+3y=8$
* r.tex_results[1] = $x6+4y=14$
* ...
*
* this is a leaf function
*a stringToBoolean comes from:
*  Expression.java isResultStep = (latex.compareTo(latexStep)==0) ? T : F
*  -> MA.java  ...append(" istrue=\"").append(expression.isResultStep())..;
*  -> istrue -> stringToBoolean
**************/

Editor.parseAlignResult = function ( in_data ) {
   var r = new Object(); var phrase = "";
   r.xmldoc = new DOMParser().parseFromString(in_data, "text/xml");
   r.rst_nodes = r.xmldoc.getElementsByTagName("AlignResponse");
   r.tex_nodes = r.xmldoc.getElementsByTagName("SegmentList");
   r.exer_nodes = r.xmldoc.getElementsByTagName("exerciseStep");//edit by ddo 12052012 --> was : var exer_nodes = xmldoc.getElementsByTagName("exerciseStep");
   r.am_nodes = r.xmldoc.getElementsByTagName("activemath");
   r.image_nodes = r.xmldoc.getElementsByTagName("image");
   r.segment_nodes = r.xmldoc.getElementsByTagName("Segment");
   r.maxima_nodes = r.xmldoc.getElementsByTagName("maxima");
   r.tex_result = r.tex_nodes[0].attributes["TexString"].value;
/*
   r.tex_results = new Array(); //sn-3steps
   r.texs        = new Array(); // array of jsons
   for ( var i=0; i < r.tex_nodes.length; i++) { 
      // phrase = Classifier.translateFraz( r.tex_nodes[0].attributes["TexString"].value );
      r.tex_results[i]         = r.tex_nodes[0].attributes["TexString"].value;
      r.texs[i] = { "phrase"   : r.tex_nodes[0].attributes["TexString"].value
      ,             "variable" : r.tex_nodes[0].attributes["variable" ].value }; }
*/
   if (Editor.am_correction)                                                  {
      r.description = r.am_nodes[0].attributes["description"]
      .   value;
      console.log("description Activemath " + r.description);
      r.hint = r.am_nodes[0].attributes["hint"].value;
      console.log("description hint " + r.hint);
      document.getElementById("description").innerHTML = r.description
      .   toString();
      r.mess = r.am_nodes[0].attributes["message"].value; //message
      document.getElementById("lhint").innerHTML = r.hint.toString() 
      +   String(r.mess);
      r.isfinishAc = r.am_nodes[0].attributes["isfinish"].value;
      Exercises.title = String(r.am_nodes[0].attributes["title"]
      .   value);
      stringToBoolean = r.am_nodes[0].attributes["istrue"].value;
      if (r.isfinishAc == "true") HistorySegments.is_finish = true;           }
   else                                                                       {
      r.stringToBoolean = r.exer_nodes[0].attributes["istrue"].value; //a
      if (String(r.exer_nodes[0].attributes["isfinish"].value) == "true") 
         HistorySegments.is_finish = true;                                    }
   return r;                                                                  }

/******************************************************************************
*
******************************************************************************/
Editor.updateMathFont = function( texs )                                      {
   var p = Exercise.latex2mathjax( texs );
   var mathfont = document.getElementById( "mathfont" );
   mathfont.innerHTML = p;
   Exercise.current.content=p;
   Exercise.recent[0].content=p;
   localStorage.setItem(Exercise.C_RECENT,JSON.stringify(Exercise.recent));
   MathJax.Hub.Queue( [ "Typeset", MathJax.Hub,  mathfont ] );                }

/*****************************************************************************
* Editor.showStepInk()
******************************************************************************
* compose the string to display the exercise.  
* string is stored in db column exercises.stroke
* string is of the form:
*    <segments> 
*      <group symbols="x"> <symbol /> <scale /> <minPos>1,2-3.4</minPos> 
*                          <points> 0,0 ... (- ...|2,2) </points> </group> 
*      <group symbols="x"> <symbol /> <scale /> <minPos>1,2-3.4</minPos> 
*                          <points> 0,0 ... (- ...|2,2) </points> </group> 
*    <segments>
* The body is the tricky part where we need to consider multi-stroke characters 
* and beware of the edge case of a single character exercise.  If set_id 
* stays the same across 2 strokes, then we have multi-stroke char, so we need 
* to compare previous_set_id, current set_id, and next_set_id.  next_set_id 
* tells us to put in </points> and move on to the next stroke.
*a "\" is a legitimate tex character so we need to preserve it by double escapes
*****************************************************************************/
Editor.showStepInk = function()                                               {
if(document.getElementById("author").parentNode.style.display == "none"
   || Editor.segments.length == 0) return; 
var str=" ";

var stroke, previous_set_id, set_id, next_set_id;
var pointsCur, pointsMid, points;
var minPosCur, minPosMid, minPos;
var segments = Editor.segments; // a convenience

segments.sort(function(a,b){return a.set_id - b.set_id});

for (var i=0; i< segments.length; i++)                                        {
   previous_set_id            = (i != 0) ? segments[i-1].set_id : -1;
   set_id                     =              segments[i].set_id ;
   next_set_id = (i < segments.length-1) ? segments[i+1].set_id : -1;
   stroke = segments[i];

   pointsCur = stroke.polyline.attributes[0].value;
   pointsCur = pointsCur.replace(/\s$/,"");
   pointsCur = pointsCur.replace("points=","");
   pointsCur = pointsCur.replace(/\s/g,"|");

   minPosCur = stroke.translation.x + "," + stroke.translation.y;

   if (previous_set_id != set_id) {   // start new character
      minPosMid = minPosCur;
      pointsMid = pointsCur;      }   
   else                           {   // continue multi-stroke char
      pointsMid = pointsMid + "-" + pointsCur;
      minPosMid = minPosMid + "-" + minPosCur;                                }
   minPos = "<minPos>" + minPosMid + "</minPos>";
   points = "<points>" + pointsMid + "</points>";
   if (next_set_id  != set_id)         // close character
      str = str 
      +   "<group symbol=\"" + stroke.symbol + "\">" 
      +   "<symbols>" + stroke.symbol + "</symbols>" 
      +   "<scale>"+stroke.scale.x+"</scale>"
      +   points + minPos + "</group>";
} // end for
//tex_result = tex_result.replace(/\\/g,"\\\\"); //a
if(HistorySegments.list_segments.length == 0){
   // reset aligned & texs 
   if(rex != undefined)                                                       {
     rex.aligned.splice(0, rex.aligned.length); 
     rex.texs.splice(0, rex.texs.length); // clear memory for the Submit
     rex.syq= "";
     rex.ajaxError = false;                                                   }
   SysEquations.SaveExpressions();//g 
   SysEquations.BuildTupe(SysEquations.Expressions);
   rex.fraz();
}
str = "<segments>"+str+"</segments>\n\n  \n\nphrase="+rex.syq.replace(/\$,\$/g,"\$\$\$");

var newWin = open('','_blank');
newWin.document.write($("<div>").text(str).html());
}


// Chen diem thuong
Editor.inserPoint = function(){
    var score = {exerid:Exercises.id_default};
    var score_url = "./score-coax.jsp";
    $.ajax({
   url: score_url,
   type: "POST",
   data:score,
   success: function(in_data, textStatus, xmlhttp) {
       in_data = xmlhttp.responseText;
   },
   error: function(jqXHR, textStatus, errorThrown) {
       alert("error");
       Editor.inserPoint();
}
    });
}

//<<<<< goi group thu congs
Editor.groupTool = function(groupSymbol)                                      {
if (Editor.selected_segments.length < 2) return;
 
if(groupSymbol == undefined) 
   ask4text("Editor.groupTool", "Enter symbol for these strokes:",
            "Length of symbol must be between 1 and 5.", 1, 5);
else if(groupSymbol != undefined && groupSymbol.length>0)                     {
    Editor.check_group = true;
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    AutoGroup.GroupSegments(Editor.selected_segments, groupSymbol, true); 
    GroupSegments.DisplaySymbol();                                            }
}
//<<<<< khong dung
Editor.deleteTool = function() {
    return;
    if (Editor.button_states[Buttons.Delete].enabled == false) return;
    else
    //Editor.check_rectangle = true;
    var action = new ActionSegments(Editor.selected_segments, true,Editor.DeleteSegments);
    action.Apply();
    Editor.add_action(action);
    Editor.clear_selected_segments();
    RenderManager.render();
    if (Editor.selection_method == "Stroke") Editor.state = EditorState.ReadyToStrokeSelect;
    else if (Editor.selection_method == "Rectangle") Editor.state = EditorState.ReadyToRectangleSelect;
}

Editor.typeTool = function() {
    Editor.selected_segments.length = 0;
    Editor.current_stroke = null;
    switch (Editor.state) {
    case EditorState.SegmentsSelected:
   Editor.clear_selected_segments();
   break;
    case EditorState.MiddleOfText:
   if (Editor.current_action.toString() == "EditText") Editor.current_action.set_current_text(Editor.current_text.text);
   Editor.current_text = null;
   break;
    }
    Editor.state = EditorState.ReadyForText;
    RenderManager.render();
}

//<<<<< thuc hien viec thay doi symbols cho stroke
Editor.relabel = function() {
    //if (Editor.button_states[Buttons.Label].enabled == false) return;
    if (Editor.selected_segments.length == 0) return;
    if (Editor.state == EditorState.SegmentsSelected) {
   CorrectionMenu.show();
   Editor.clearButtonOverlays();
   for (var k = 0; k < Editor.button_states.length; k++)
   Editor.button_states[k].setEnabled(false);
    }
}

// clears all the data and sends action list to server for storage
Editor.clear = function() {
    // get ri of last one if it' a bugger
    if (Editor.action_list.length > 0) {
   var prev_action = Editor.action_list.pop();
   if (prev_action.shouldKeep() == true) Editor.action_list.push(prev_action);
    }
    // save data
    var sb = new StringBuilder();
    sb.append("?actionList=<ActionList>");
    for (var k = 0; k < Editor.action_list.length; k++) {
   sb.append(Editor.action_list[k].toXML());
    }
    sb.append("</ActionList>");
    $.get(
    Editor.data_server_url + sb.toString(), function(data, textStatus, xmlhttp) {
   window.location.href = Editor.editor_root + "index.xhtml";
    });
}

Editor.getInkML = function() {
    // alert( "getInkML" );
    var inkml = "<ink xmlns=\"http://www.w3.org/2003/InkML\">";
    var segments = new Array();
    var segarray = Editor.segments.slice(0);
    segarray.sort(function(o1, o2) {
   return o1.instance_id - o2.instance_id
    });
    for (var i = 0; i < segarray.length; i++) {
   var stroke = segarray[i];
   var strokeid = stroke.instance_id;
   var segid = stroke.set_id;
   // translation for absolute positioning
   var tx = stroke.translation.x;
   var ty = stroke.translation.y;
   var sx = stroke.scale.x;
   var sy = stroke.scale.y;
   // add to proper segment
   if (segments[segid] == null) segments[segid] = new Array();
   segments[segid].push(strokeid);
   // add stroke data to inkml
   inkml += "<trace id=\"" + strokeid + "\">";
   var strokedata = new Array();
   for (var j = 0; j < stroke.points.length; j++) {
       strokedata.push(((stroke.points[j].x * sx) + tx) + " " + ((stroke.points[j].y * sy) + ty));
   }
   inkml += strokedata.join(", ");
   inkml += "</trace>";
    }
    for (var i = 0; i < segments.length; i++) {
   if (segments[i] == null) continue;
   var strokeids = segments[i];
   inkml += "<traceGroup xml:id=\"TG" + i + "\">";
   // label
   inkml += "<annotation type=\"truth\">" + RecognitionManager.getRecognition(i).symbols[0] + "</annotation>"

   for (var j = 0; j < strokeids.length; j++) {
       inkml += "<traceView traceDataRef=\"" + strokeids[j] + "\" />";
   }

   inkml += "</traceGroup>";
    }
    inkml += "</ink>";
    if (Editor.using_mobile) {
   // ask for filename
   var fname = prompt("Enter filename (leave blank for random).");
   if (fname == null) return; // "cancel"
   // save to server
   $.ajax({
       url: Editor.inkml_save_server_url + "?fname=" + fname + "&s=" + escape(inkml),
       success: function(in_data, textStatus, xmlhttp) {
      alert("Saved: " + in_data.split("!")[1]);
       },
       error: function(jqXHR, textStatus, errorThrown) {
      if (jqXHR.status == 0) {
          alert("Error: server offline.");
      } else {
          alert("Error: " + textStatus + "/" + errorThrown);
      }
       }
   });
    } else {
   // save locally
   var datauri = "data:text/inkml," + escape(inkml); // yes, this is an invalid mime type
   window.open(datauri);
    }
}

Editor.prevent_default = function(event) {
    //console.log("default prevented");
    event.preventDefault();
}

//<<<<<dich chuyen cac segments ra giua man hinh
Editor.getSize = function(segments) {
    var mins, maxs;
    mins = new Vector2(0, 0);
    maxs = new Vector2(0, 0);
    for (var i = 0; i < segments.length; i++) {
   var seg = segments[i];
   if (i == 0) {
       mins = new Vector2(seg.worldMinPosition().x, seg.worldMinPosition().y);
       maxs = new Vector2(seg.worldMaxPosition().x, seg.worldMaxPosition().y);
   } else {
       mins.x = Math.min(seg.worldMinPosition().x, mins.x);
       mins.y = Math.min(seg.worldMinPosition().y, mins.y);
       maxs.x = Math.max(seg.worldMaxPosition().x, maxs.x);
       maxs.y = Math.max(seg.worldMaxPosition().y, maxs.y);
   }
    }
    return [mins, maxs, Vector2.Subtract(maxs, mins)];
}

Editor.translateCenter = function(sements){
    if (sements == undefined){
   return;
    }
    if (sements.length == 0){
   return
    }
    Editor.clear_selected_segments();
    var obj_size = Editor.getSize(sements);
    var mins = obj_size[0];
    var maxs = obj_size[1];
    var center_obj = new Vector2.Add(mins, maxs);
    center_obj.x = center_obj.x / 2;
    center_obj.y = center_obj.y / 2;

    var center_windows_x = ResizeTo.width_canvas / 2;

    var center_windows_y = ResizeTo.height_canvas / 2;
    
    var trans = new Vector2(-(center_obj.x - center_windows_x), -(center_obj.y - center_windows_y));
    for (var i = 0; i < sements.length; i++) {
   var seg = sements[i];
   seg.translate(trans);
   seg.render();
    }
    var obj_size = Editor.getSize(sements);
    mins = obj_size[0];
    maxs = obj_size[1];
    if (obj_size[2].x > ResizeTo.width_canvas){
   var anchor = new Vector2((maxs.x + mins.x) / 2, (maxs.y + mins.y) / 2);
   var scale = new Vector2(ResizeTo.width_canvas/(obj_size[2].x + 100), ResizeTo.width_canvas/(obj_size[2].x + 100));
   for (var i = 0; i < sements.length; i++) {
       var seg = sements[i];
       seg.resize(anchor, scale);
       seg.freeze_transform();
       seg.render();
   }
    }
    //Editor.check_rectangle = true;
    //Editor.arr_seg_select = new Array();
    Editor.rectangleSelectionTool();
}

Editor.transCenter = function(in_segments){
    if(in_segments.length == 0)
   return;
    //Editor.clear_selected_segments();
    var group = new Group();
    group.AddList(in_segments);
    var minSeg = group.minGroup(); //.x;
    var maxSeg = group.maxGroup(); //.x;
    var xSeg = (window.innerWidth - (maxSeg - minSeg)) / 2;
    var ySeg = 100;
    var y = group.minY();
    var trans = new Vector2(xSeg - minSeg - 30, ySeg - y); //Editor.canvas_div
    Editor.Scroll = trans;
    Space.render(group.segments, trans);    
    Editor.clear_selected_segments();
    for (var k = 0; k < Editor.segments.length; k++) {
   var seg = Editor.segments[k];
   seg.render();
   seg.world_mins = seg.worldMinPosition();
   seg.world_maxs = seg.worldMaxPosition();
    }
    //RenderManager.render();
}

//<<<<< align auto khi xay ra gestures fence
//Editor.alignAuto = function(currentid) {
Editor.ShapePrefix = "[";
Editor.ShapeSuffix = "]";
Editor.alignAuto = function(segment) {
delete SysEquations.Expressions;
SysEquations.Expressions = new Array();
SysEquations.Expressions.push(Gestures.segments_set);

SysEquations.BuildTupe(SysEquations.Expressions);

// reset aligned & texs 
if(rex != undefined)                                                       {
  rex.aligned.splice(0, rex.aligned.length); 
  rex.texs.splice(0, rex.texs.length); // clear memory for the Submit
  rex.syq= "";
  rex.ajaxError = false;                                                   }

rex.fraz();
if(!rex.ajaxError){
   var tex_math = rex.syq.replace(/\$/gm, "");
   Gestures.UpdateCoverItem(segment.set_id, 0, tex_math);
   Editor.selected_segments.push(segment);
   Editor.groupTool(Editor.ShapePrefix+tex_math+Editor.ShapeSuffix);
}


 /*
   var coverIds = null;
   var sb = null;
   var flag = true;
   coverIds = new Array();
   sb = new StringBuilder();
   sb.append("?segments=<Expressions guid = \"" + guid() + "\">");
   sb.append("<SegmentList guid = \"" + guid() + "\">");
   for (var n = 0; n < arrCoverItems.length; n++) {
      var tCover = null;
      var parentCover = null;
      tCover = arrCoverItems[n];
      parentCover = parseInt(tCover.item4.toString());
      if (currentid == parentCover && Editor.isExistsSetId(tCover.item1.set_id) == false) {
          var tupleid = null;
          tupleid = new Tuple(currentid, tCover.item1.set_id);
          coverIds.push(tupleid);
          Editor.buildElementSegment(sb, tCover);
          flag = true;
      }
   }
   sb.append("<maxima variable=\"").append("\">");
   sb.append("</maxima>");
   sb.append("</SegmentList>");
   sb.append("</Expressions>");
   if (flag == true) {
      $.ajax({
         url: Editor.align_server_url + sb.toString(),
         success: function(in_data, textStatus, xmlhttp) {
        
            in_data = xmlhttp.responseText
            // parse response here
            var new_dimensions = new Array();
            // parse response xml
            var xmldoc = new DOMParser().parseFromString(in_data, "text/xml");
            var segment_nodes = xmldoc.getElementsByTagName("Segment");
            var tex_nodes = xmldoc.getElementsByTagName("SegmentList");
            if (tex_nodes.length != 0) {
                var tex_string = tex_nodes[0].attributes["TexString"].value;
                tex_string = tex_string.replace(/\s{1,}/gm, ""); //trim
                tex_string = tex_string.match(/(\$.*\$)/g)[0]; //lay chuoi latex
                tex_string = tex_string.replace(/\$/gm, ""); //khu het dau $
                var tex_math = tex_string;
                document.getElementById("tex_result").innerHTML = "$" + tex_math + "$";
                Gestures.UpdateCoverItem(currentid, 0, tex_math);
            }

            for (var k = 0; k < segment_nodes.length; k++) {
               var attributes = segment_nodes[k].attributes;
               var t = new Tuple();
               t.item1 = parseInt(attributes.getNamedItem("id").value);
               t.item2 = parseVector2(attributes.getNamedItem("min").value);
               t.item3 = parseVector2(attributes.getNamedItem("max").value)
               new_dimensions.push(t);
               for (var l = 0; l < coverIds.length; l++) {
                  var tId = null;
                  var parentid = null;
                  var id = null;
                  tId = coverIds[l];
                  parentid = parseInt(tId.item1);
                  id = parseInt(tId.item2);
                  if (t.item1 == id) {
                      Editor.updateMinMaxCoverItem(parentid, id, t.item2.toString(), t.item3.toString());
                  }
               }
            }
         },
        error: function(jqXHR, textStatus, errorThrown) {}
    });
   }
   */
}

//<<<<<sb kieu StringBuilder, tCover kieu Tuple(recognition_result, mins, maxs);
Editor.buildElementSegment = function(sb, tCover, latex) {
    sb.append("<Segment symbol=\"");
    if (tCover.item1.symbols.length == 0) sb.append("x\" min=\"");
    else
    sb.append(tCover.item1.symbols[0]).append("\" min=\"");

    sb.append(new Vector2(Math.floor(tCover.item2.x), Math.floor(tCover.item2.y)).toString()).append("\" max=\"");
    sb.append(new Vector2(Math.floor(tCover.item3.x), Math.floor(tCover.item3.y)).toString()).append("\" id=\"");
    sb.append(tCover.item1.set_id);
    if (latex != null || latex != undefined) {
   latex = latex.replace(/\+/gm, "%2B");
   sb.append("\" latex=\"").append(latex);
    }
    sb.append("\"/>");
    return sb.toString();
}

//<<<<< cap nhat min-max cua stroke da fence khi zoom hoac fence tiep
Editor.updateMinMaxCoverItem = function(parentid, id, mins, maxs) {
    for (var i = 0; i < arrCoverItems.length; i++) {
   var t = null;
   var parentCover = null;
   var idCover = null;

   t = arrCoverItems[i];
   parentCover = parseInt(t.item4.toString());
   idCover = parseInt(t.item1.set_id);

   if (parentCover == parentid && idCover == id) {
       var tuple = null;
       var arrMins = null;
       var arrMaxs = null;

       arrMins = mins.split(",");
       arrMaxs = maxs.split(",");

       t.item2.x = parseInt(arrMins[0]);
       t.item2.y = parseInt(arrMins[1]);
       t.item3.x = parseInt(arrMaxs[0]);
       t.item3.y = parseInt(arrMaxs[1]);

       if (parentid == 0) {
      return t;
       }
   }
    }
    return null;
}

Editor.IsExistsCoverItem = function(currentid) {
    var test = arrCoverItems;
    for (var i = 0; i < arrCoverItems.length; i++) {
   var t = null;
   var id = null;
   t = arrCoverItems[i];
   id = parseInt(t.item1.set_id);
   if (id == currentid) {
       return true;
   }
    }
    return false;
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

//<<<<<kiem tra mot id duoc gui di align co  ton tai trong mag Editor.segmentSplits.
Editor.isExistsSetId = function(set_id) {
    var id = null;

    id = parseInt(set_id);
    for (var i = 0; i < Editor.segmentSplits.length; i++) {
   var idSeek = null;

   idSeek = parseInt(Editor.segmentSplits[i].set_id);
   if (idSeek == id) {
       return true;
   }
    }
    return false;
}
//<<<<<kiem tra mot item co phai da tung la cha trong array cover
Editor.wereParentInCovers = function(currentid) {
    for (var i = arrCoverItems.length; i > 0; i--) {
   var idCover = null;

   idCover = arrCoverItems[i].item4;
   if (idCover == currentid) {
       return true;
   }
    }
    return false;
}

//setting he thong tai day.
Editor.Settings = function() {
    //if (Editor.button_states[Buttons.Settings].enabled == false) return;
    //Editor.selectPenTool();
    SettingsMenu.show();
    //Editor.clearButtonOverlays();
    //for (var k = 0; k < Editor.button_states.length; k++)
   //Editor.button_states[k].setEnabled(false);
}
/******************************************************************************
 * Skip corx
 */
var openSkipCorxHintTrigger = "";
function openSkipCorxHint(trigger){
   if(!openSkipCorxHintTrigger) openSkipCorxHintTrigger = trigger;
   if(openSkipCorxHintTrigger == trigger)
      $('#popup-SkipCorxUI').popup('open');
} 
/******************************************************************************/
function SkipCorxUIDisplay(){
   if (Editor.isSkippable(Editor.SkipValues.Corx)){
       $("#SkipCorxUI").css("display","block");
       //resetCorxLight(true); //a: corx - setting on/off doesnt impact corx light
   }else{ 
       $("#SkipCorxUI").css("display","none");
       //resetCorxLight(false); //a
   }
}
/*
function resetCorxLight( corxSkipped ){
   if(corxSkipped){
      _.each($(".rformula"),function(item) {
         if(item.getAttribute( "real_corx_color") == null){
               item.setAttribute( "real_corx_color", item.style.background);
         }
         item.style.background = SkipCorxLight_background;
      });   
   }
   else{
      _.each($(".rformula"),function(item, index) {
         //the first step doesnt have rformula, so rformula's index = step's index +1
         var proc_skipped = HistorySegments.list_segments[index+1].skipValues;
         if(proc_skipped.indexOf(Editor.SkipValues.Corx) == -1
            && proc_skipped.indexOf(Editor.SkipValues.Light) == -1   
            && item.getAttribute( "real_corx_color") != null){
            item.style.background = item.getAttribute("real_corx_color");
            item.removeAttribute("real_corx_color");
         }
      });  
   }
}*/
Editor.isSkippable = function(arg){
   if(arg == Editor.SkipValues.Corx)
      return Editor.SettingSkip.indexOf(Editor.SkipValues.Corx) != -1
      ||     Editor.ExerciseSkip.indexOf(Editor.SkipValues.Corx) != -1;
   return false;
}
/*******************************************************************************
* onImageLoad() -- being replaced by mathjax
********************************************************************************
*
This method is complicated so let me explain what's going on:
FileReader's readAsDataURL method and apparently Image's .src property are
Asynchrynous, so we need to fire an event to do work instead of doing it sequentially.
When the file is read as a data url, the first method is called which sets the data url
as the Image's source.  That doesn't happen immediately, so another event is made
for when the image's src is finished being set.  When this happens, then we forward
the image to the render manager and the collision manager.
*

Editor.onImageLoad = function(e) {
    var file_list = e.target.files;
    var file = file_list[0];
    if (file) {
   var r = new FileReader();
   r.onload = function(e) {
       var loaded_image = new Image();

       // render image to canvas, get back the dataurl, send dataurl to server,
       // get back list of connected components in xml, add to managers
       var added_segments = new Array();
       loaded_image.onload = function(e) {
      var canvas = document.createElement("canvas");
      canvas.width = loaded_image.width;
      canvas.height = loaded_image.height;

      var context = canvas.getContext("2d");
      context.drawImage(loaded_image, 0, 0);

      // a string here
      var dataUrl = canvas.toDataURL();

      // now we build our request
      // we pass our image in as a parameter 
      var vals = dataUrl.split(",");
      var parameter = "?image=" + vals[0] + "," + encodeURIComponent(vals[1]);

      //var segment_group = new SegmentGroup();

      $.ajax({
          type: "GET",
          url: Editor.connected_components_server_url + parameter,
          dataType: "xml",
          success: function(data, textStatus, xmlhttp) {
         Editor.clear_selected_segments();
         var set_id = Segment.count++;
         var xml_document = xmlhttp.responseXML;
         var root_node = xml_document.firstChild;
*
         Expects a response in this format
         <ConnectedComponents>
         <Component x="10" y="20">
         data:image/PNG;base64,ASOIUROIJDLAKJSDLFJOEURABRDLJFKLDSetc
         </Component>
         <Component...
         </ConnectedComponents>
*
         if (root_node.nodeName != "ConnectedComponents") {
             alert(xmlhttp.responseText);
         } else {
             //var image_node = root_node.firstChild;
             var image_nodes = root_node.getElementsByTagName("Image");

             var image_list = new Array(image_nodes.length);
             var position_list = new Array(image_nodes.length);

             // change our state
             Editor.selection_method = "Stroke";
             Editor.state = EditorState.SegmentsSelected;

             for (var k = 0; k < image_nodes.length; k++) {
            var position = image_nodes[k].getAttribute("position").split(',');
            var img_data = image_nodes[k].textContent;

            image_list[k] = new Image();
            image_list[k].name = String(k);
            position_list[k] = [parseInt(position[0]), parseInt(position[1])];
            image_list[k].onload = function(e) {
                var my_k = parseInt(this.name);
                // create inverse image
                var temp_canvas = document.createElement("canvas");
                temp_canvas.width = this.width;
                temp_canvas.height = this.height;
                var temp_context = temp_canvas.getContext("2d");
                temp_context.drawImage(this, 0, 0);
                var inverse_image_data = temp_context.getImageData(0, 0, this.width, this.height);
                var pix = inverse_image_data.data;

                var rgb = RGB.parseRGB(Editor.selected_segment_color);
                for (var i = 0, n = pix.length; i < n; i += 4) {
               var brightness = (pix[i] * 0.299 + pix[i + 1] * 0.587 + pix[i + 2] * 0.114) / 255.0;
               if (brightness < 0.5) {
                   pix[i] = rgb.red;
                   pix[i + 1] = rgb.green;
                   pix[i + 2] = rgb.blue;
               }
                }
                temp_context.putImageData(inverse_image_data, 0, 0);
                var inverse_image = new Image();
                inverse_image.name = this.name;
                inverse_image.src = temp_canvas.toDataURL();

                // once it loads, add the image blob to they system
                inverse_image.onload = function() {
               var my_k = parseInt(this.name);
               var b = new ImageBlob(image_list[my_k], this, loaded_image.width, loaded_image.height, position_list[my_k][0], position_list[my_k][1]);

               //RenderManager.add_segment(b, 1);
               Editor.add_segment(b);
               Editor.add_selected_segment(b, Editor.selected_segments);
               added_segments.push(b);
               if (added_segments.length == image_nodes.length) Editor.current_action.buildSegmentXML();
               RenderManager.render();
                }
            }
            image_list[k].src = img_data;
             }
         }
          }
      });

      //RenderManager.add_segment(segment_group, -1);
      //CollisionManager.add_segment(segment_group);
       }

       //console.log("eh oh!");
       Editor.add_action(new ActionSegments(added_segments, true,Editor.AddSegments));

       // set the result of the image load to the image object
       loaded_image.src = e.target.result;
       // reset the form so we can reload the same image twice if desired
       document.getElementById("image_form").reset();
   }
   r.readAsDataURL(file);

    } else {
   // file not loaded
    }
}
*******************************************************************************
// start - pre-setLight
*******************************************************************************

         if (Editor.mod_history)                                              {
            if (HistorySegments.check_step)                                   {
               Exercises.NodeMaxima = Exercises.NotificationMaxima( "green"
               ,    HistorySegments.height_node);
               var root = new StringBuilder();
               root.append("<root>");
               root.append(HistorySegments.stringXml).append("<color>")
               .    append("green").append("</color>");
               root.append("</root>");                                         }
               else                                                            {
                  Exercises.NodeMaxima = Exercises.NotificationMaxima("red"
                  ,    HistorySegments.height_node);
                  var root = new StringBuilder();
                  root.append("<root>");
                  root.append(HistorySegments.stringXml).append("<color>")
                  .   append("red").append("</color>");
                  root.append("</root>");                                      }
                  HistorySegments.sendData(String(root), true);                }
         else                                                                  {

            if (parseInt(rst_nodes[0].attributes["result"].value) == 1)    {
               Exercises.NodeMaxima = Exercises.NotificationMaxima("green"
               ,  HistorySegments.height_node);
               if (HistorySegments.recorrectM == 1)                            {
                  HistorySegments.check_delete = false;
                  HistorySegments.UpdateReAlign("green", HistorySegments.index);
                  Exercises.from_step = HistorySegments.index;
                  var id_his = HistorySegments.in_id;
                  LogXML.GroupLog(SettingsMenu.user, Exercises.id_default
                  ,      Exercises.id_select, id_his, Exercises.from_step
                  ,    ++Exercises.to_step, 2, laxtex, image_nodes);           }
                   var root = new StringBuilder();
                   root.append("<root>");
                   root.append(HistorySegments.stringXml).append("<color>")
                   .    append("green").append("</color>");
                   root.append("</root>");                                     }
               else                                                            {
                  Exercises.NodeMaxima = Exercises.NotificationMaxima("red"
                  ,  HistorySegments.height_node);
                  if (HistorySegments.recorrectM == 1)                         {
                     HistorySegments.check_delete = false;
                     HistorySegments.UpdateReAlign("red", HistorySegments.index);
                     Exercises.from_step = HistorySegments.index;
                     var id_his = HistorySegments.in_id;
                     LogXML.GroupLog(SettingsMenu.user, Exercises.id_default
                     ,      Exercises.id_select, id_his, Exercises.from_step
                     ,    ++Exercises.to_step, 2, laxtex, image_nodes);        }
                  var root = new StringBuilder();
                  root.append("<root>");
                  root.append(HistorySegments.stringXml).append("<color>")
                  .   append("red").append("</color>");
                  root.append("</root>");                                      } // end else


*/
