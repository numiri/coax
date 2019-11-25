// MovetoResize funtions==========================================
ResizeTo = function() {

}

//ResizeTo.rate_change_screen = window.innerHeight * 0.92 * 0.6;
ResizeTo.rate_change_screen = 0;
ResizeTo.bodyOuterWidth =  $("body").outerWidth();

ResizeTo.Setup = function() {
    document.getElementById("btn-resize").addEventListener("touchstart", ResizeTo.onDown, false);
    document.getElementById("btn-resize").addEventListener("mousedown", ResizeTo.onDown, false);
    ResizeTo.check_down = false;
    ResizeTo.start = new Vector2(-1, -1);
    ResizeTo.current = new Vector2(-1, -1);
    // Set default canvas
    ResizeTo.height_canvas = innerHeight * 0.92 * 0.6;
    ResizeTo.width_canvas = innerWidth * 1;
    ResizeTo.positionRecyclebin();
}
/********/
ResizeTo.positionRecyclebin = function()                                      {
   var top = $("body").outerHeight() - $("#footer").outerHeight()
                        - $("#recyclebin").outerHeight()
                        - $("#equation_canvas").position().top - 5;

   $("#recyclebin").css('top',top + 'px');                                    }
/********/
ResizeTo.onDown = function(e) {
    if (e.type == "mousedown") {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.pageX, e.pageY);
    } else if (e.type == "touchstart") {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
    } else
        return;
    RenderManager.render();
    ResizeTo.check_down = true;
    
    if (Editor.Exercises.current != null){
	if (Editor.Exercises.current.exercises_current.length > 0){
	    Editor.Exercises.current.node.renderNone(Editor.Exercises.current.exercises_current);
	    Box.selected = new Box($("#box")[0]);
            delete Editor.Exercises.current.exercises_current;
	    Editor.Exercises.current.exercises_current = new Array();
	}
    }
}

ResizeTo.onMove = function(e) {
    if (e.type == "mousemove" && !Editor.using_mobile) {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.pageX, e.pageY);
    } else if (e.type == "touchmove" && Editor.using_mobile) {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
    } else
        return;

    ResizeTo.Action(ResizeTo.start, ResizeTo.current);
}

ResizeTo.onUp = function() {
    ResizeTo.check_down = false;
    ResizeTo.Action(ResizeTo.start, ResizeTo.current);
    setTimeout(function() {
        HistorySegments.myScroll.refresh();
    }, 100);
    Editor.translateCenter(Editor.segments);
    Editor.Exercises.renderPosition();
}

ResizeTo.Action = function(start, current) {
    var nodecent = $("#centerpanel")[0];
    var nodecavas = $("#equation_canvas")[0];
    var content = $("#show-content")[0];
    var height_his = nodecent.offsetHeight;
    var trans = Vector2.Subtract(current, start);
    var change = height_his + (trans.y);
    //ResizeTo.UpdatePanelImages(change);
    var height_4 = document.getElementById("footer").offsetHeight;
   // debugger;
    var footer  =height_4*100/(content.offsetHeight );
    
    change = change * 100 / (content.offsetHeight);
    //debugger;
    console.log("footer %:" + footer +": " + content.offsetHeight);
    nodecent.style.height = change + "%";
    var total_editor = 98;
    if($.browser.webkit)
    {
        total_editor = 100;
    }
    nodecavas.style.height = (total_editor - footer- change) + "%";
    ResizeTo.rate_change_screen = total_editor - footer - change;
    ResizeTo.UpdatePanelCanvas(total_editor- footer - change);
    ResizeTo.change();
    setTimeout(function() {
        HistorySegments.myScroll.refresh();
    }, 50);
}

ResizeTo.UpdatePanelCanvas = function(heightcanvas) {
    // update canvas
    var nodecanvas = document.getElementById("pen-canvas");
    var content = document.getElementById("show-content");
    heightcanvas = content.offsetHeight * heightcanvas / 100;
    ResizeTo.height_canvas = heightcanvas;
    if(nodecanvas)
    nodecanvas.setAttribute("height", heightcanvas);
    Editor.div_position = findPosition(Editor.canvas_div);
    ResizeTo.positionRecyclebin();
}

ResizeTo.UpdatePanelImages = function(heightcenter) {
    // update images
    var nodediv = $("#exer")[0];
    var nodeimages = $("#exer_image")[0];
    if (nodeimages != null) {
        nodediv.style.marginTop = (heightcenter - nodediv.offsetHeight) / 2 + "px";
    }
}

ResizeTo.Layout = function(pos) {
    var nodecontent = document.getElementById("show-content");
    var nodetoobar = document.getElementById("toolbar");
    var nodelog = document.getElementById("log");
    if (pos == "left") {
        //nodelog.style.paddingLeft = 5 + "px";
        document.getElementById("note").style.left = 0;
        document.getElementById("lhint").style.left = "6%";
        document.getElementById("description").style.left = "20%";
        document.getElementById("selectexes").style.left = "50%";
        document.getElementById("logout").style.left = "90%";
        nodecontent.style.left = 0;
        nodecontent.style.right = null;
        /*nodetoobar.style.right = 0;
        nodetoobar.style.left = null;*/
        //nodetoobar.style.marginLeft = 95.1 + "%";
        var first = $("#undo").parent();
        var last = $("#command").parent();
        first.appendTo(first.parent());
        last.prependTo(last.parent());
        
        Editor.Exercises.change_layout = "left";
    } else if (pos == "right") {
        //nodelog.style.paddingLeft = 6 + "%";
        document.getElementById("note").style.left = "5.5%";
        document.getElementById("lhint").style.left = "11%";
        document.getElementById("description").style.left = "25%";
        document.getElementById("selectexes").style.left = "55%";
        document.getElementById("logout").style.left = "95%";
        nodecontent.style.right = 0;
        nodecontent.style.left = null;
      /*   nodetoobar.style.left = 0;
        nodetoobar.style.right = null;*/
        //nodetoobar.style.marginLeft = 0;
        var first = $("#command").parent();
        var last = $("#undo").parent();
        first.appendTo(first.parent());
        last.prependTo(last.parent());
        Editor.Exercises.change_layout = "right";        
    }
    Editor.div_position = findPosition(Editor.canvas_div);
    Editor.actionLayout("visible");
    return;
}

ResizeTo.change = function(){
    var width_1 = document.getElementById("show-content").offsetWidth;
    var heigh_content = document.getElementById("show-content").offsetHeight;
    var height_1 = document.getElementById("log").offsetHeight;
    var height_2 = document.getElementById("centerpanel").offsetHeight;
    var height_3 = document.getElementById("resize-to").offsetHeight;
    var height_sum = height_2 + height_3 - height_1/4;
    var top = height_sum - 12.5;
    var left = width_1/2 - 25;
    $("#btn-resize")[0].style.top = top + "px";
    $("#btn-resize")[0].style.left = left + "px";
}