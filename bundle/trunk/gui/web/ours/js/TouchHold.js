function xTouchHold() { }
//xTouchHold = function(){}
xTouchHold.tick = -1;
xTouchHold.timer;
xTouchHold.stop = function() { clearTimeout(xTouchHold.timer); }

xTouchHold.start = function()                                                   {
    xTouchHold.timer = setTimeout("xTouchHold.start()", 1000);
    xTouchHold.tick++;
    if (xTouchHold.tick == 1)                                                   {
        RenderManager.selection_box.style.visibility = "hidden";
        Editor.start_rect_selection = Editor.mouse_position.clone();
        Editor.end_rect_selection  = Editor.mouse_position.clone();
        xTouchHold.action("visible");
        setTimeout("xTouchHold.action('hidden')", 1000);                       }}

xTouchHold.action = function(show)                                              {
    document.getElementById("touchhold").style.visibility = show;
    document.getElementById("touchhold").style.left = (Editor.mouse_position.x - 50) + "px";
    document.getElementById("touchhold").style.top = (Editor.mouse_position.y - 50) + "px";
    if (show == "hidden") { xTouchHold.stop(); }                                }

xTouchHold.selectS1a = function() {
    var mouse_delta = Vector2.Subtract(Editor.mouse_position, Editor.mouse_position_prev);
    Editor.end_rect_selection.Add(mouse_delta);
    var rect_selected = CollisionManager.get_rectangle_collides(Editor.start_rect_selection, Editor.end_rect_selection);
    Editor.clear_selected_segments();
    Editor.arr_seg_select = new Array();
    // add segment set to seleced list
    for (var k = 0; k < rect_selected.length; k++) {
        var segment_set = Editor.get_segment_by_id(rect_selected[k].set_id);
        for (var j = 0; j < segment_set.length; j++) {
            Editor.add_selected_segment(segment_set[j], Editor.selected_segments);
            // add list instance_id
            Editor.arr_seg_select.push(segment_set[j].instance_id);           }}
    if (rect_selected.length > 0)                                              {
        RenderManager.bounding_box.style.background = "GhostWhite";
        RenderManager.bounding_box.style.border = "1px dashed #333333";        }
        //Editor.button_states[Buttons.Group].setEnabled(true);
        //Editor.button_states[Buttons.Label].setEnabled(true);
    else { }        
        //Editor.button_states[Buttons.Group].setEnabled(false);
        //Editor.button_states[Buttons.Label].setEnabled(false);
    RenderManager.render();                                                    }
