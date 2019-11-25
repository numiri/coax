/*
5 layers:

0 pen strokes
1 equation image blobs
2 typed text
3 math recognition layer
4 tools layer
*/

function RenderManager() {
	
}

RenderManager.initialize = function(in_width, in_height, in_layers) {
	RenderManager.width = in_width;
	RenderManager.height = in_height;
	RenderManager.layer_count = in_layers;
	RenderManager.segments = new Array();
	RenderManager.bounding_box = document.getElementById("bounding_box");
	RenderManager.bounding_box.style.visibility = "hidden";
	RenderManager.selection_box = document.getElementById("selection_rectangle");
	RenderManager.selection_box.style.visibility = "hidden";
	//  build a set of divs we can use for segment sets
	RenderManager.segment_drag = document.getElementById("segment_drag");
	RenderManager.segment_drag.style.visibility = "hidden";
	RenderManager.segment_set_divs = new Array();
	for (var k = 0; k < RenderManager.segment_set_divs.length; k++) {
		var div = document.createElement('div');
		div.className = 'segment_set';
		div.style.visibility = 'hidden';
		div.setAttribute("ontouchstart", "event.preventDefault();");
		div.setAttribute("ontouchmove", "event.preventDefault();");
		Editor.canvas_div.appendChild(div);
		RenderManager.segment_set_divs.push(div);
	}
}

// render the helper grahics (bounding box, segments ets, rectangle select etc)
//<<<<< render toan bo
RenderManager.render_tools_layer = function() {
	if (Editor.selected_bb != null) {
		RenderManager.render_bb(Editor.selected_bb, 4);
		// Make Flottom
		Flottom.RengerBox(Flottom.accept, Flottom.select_bb1, 4);
	} else {
		RenderManager.bounding_box.style.visibility = "hidden";
		RenderManager.segment_drag.style.visibility = "hidden";
	}
	switch (Editor.state) {
	case EditorState.StrokeSelecting:
	case EditorState.RectangleSelecting:
	case EditorState.SegmentsSelected:
	case EditorState.MovingSegments:
	case EditorState.ReadyToStrokeSelect:
	case EditorState.ReadyToRectangleSelect:
	case EditorState.Zoom:
	case EditorState.Resizing:
	case EditorState.Relabeling:
	case EditorState.Settings:
	case EditorState.ReplaceSub:
	case EditorState.Flottom:
		RenderManager.render_set_field(4);
		break;
	default:
		RenderManager.unrender_set_field();
		break;
	}
	// render selection rectangle
	if (Editor.start_rect_selection != null && Editor.end_rect_selection != null) {
		RenderManager.render_selection_box(Editor.start_rect_selection, Editor.end_rect_selection, 4);
	} else {
		RenderManager.selection_box.style.visibility = "hidden";
		RenderManager.selection_box.style.border = "2px solid red";
	}
	// render stroke select
	if (Editor.state == EditorState.StrokeSelecting) {
		// render
		var context = Editor.contexts[0];
		context.strokeStyle = Editor.stroke_select_color;
		context.lineWidth = Editor.stroke_select_width;
		context.lineCap = "round";
		context.lineJoin = "round";
		var point_a = Editor.previous_stroke_position;
		var point_b = Editor.mouse_position;
		context.beginPath();
		context.moveTo(point_a.x, point_a.y);
		context.lineTo(point_b.x, point_b.y);
		context.stroke();
		context.closePath();
	}
}

RenderManager.render = function() {
	var setid = -1;
	var all_same_setid = true;
	var infobar = document.getElementById("infobar");
	if (Editor.state == EditorState.MultyRectangleSelecting
	    || Editor.state == EditorState.RectangleSelecting
	    || Editor.state == EditorState.Flottom || Editor.state == EditorState.ReplaceSub
	    || Editor.button_states[Buttons.Command].touched){
		for (var k = 0; k < Editor.segments.length; k++) {
			var seg = Editor.segments[k];
			if (Editor.segment_selected(seg, Editor.selected_segments)) {
				if (setid == -1) {
					setid = seg.set_id;
				} else if (seg.set_id != setid) {
					all_same_setid = false;
				}
				$("#gId").empty();
				seg.render_selected();
				seg.element.style.visibility = "visible";
			} else {
				if (Editor.segment_selected(seg, Flottom.selected_temp)) {
					if (setid == -1) {
						setid = seg.set_id;
					} else if (seg.set_id != setid) {
						all_same_setid = false;
					}
					$("#gId").empty();
					seg.render_selected();
					seg.element.style.visibility = "visible";
				} else
				seg.render();
			}
		}
	}
	if (Substitute.segments_first.length > 0) Substitute.Render(Substitute.segments_first);
	if (Substitute.segments_second.length > 0) Substitute.Render(Substitute.segments_second);
	//info bar
	var infobartext = "";
	if (setid != -1) {
		if (all_same_setid) {
			var rec = RecognitionManager.getRecognition(setid);
			if (rec != null) {
				for (var i = 0; i < 5; i++) {
					infobartext += rec.symbols[i] + " (" + rec.certainties[i] + ")";
					if (i != 4) infobartext += ", ";
				}
			}
		}
	}
	//infobar.innerHTML = infobartext;rm by ddo 130611
	//info bar
	RenderManager.render_tools_layer();
	// change color segment
	/*if (Gestures.flag_copy == false
	    && Editor.state != EditorState.MovingSegments && Substitute.segments_first.length == 0
	    && Editor.state != EditorState.Zoom && Editor.state != EditorState.MultyRectangleSelecting) {
		for (var m = 0; m < RenderManager.segment_set_divs.length; m++) {
			var sss_div = RenderManager.segment_set_divs[m];
			sss_div.style.visibility = "hidden";
			sss_div.style.background = "none";
			sss_div.style.border = "1px solid green";
		}
		for (var l = 0; l < Editor.arr_seg_select.length; l++) {
			for (var k = 0; k < Editor.arr_seg_set_field.length; k++) {
				if (Editor.arr_seg_select[l] == Editor.arr_seg_set_field[k]) {
					var index_pos = Editor.arr_seg_set_field.indexOf(Editor.arr_seg_set_field[k]);
					var sss_div = RenderManager.segment_set_divs[index_pos];
					sss_div.style.visibility = "visible";
					sss_div.style.background = "pink";
					sss_div.style.border = "1px solid red";
				}
			}
		}
		//if (Editor.check_group == false) Editor.arr_seg_select = new Array();
		Editor.check_group = false;
	}*/
}

//<<<<< render hinh chu nhat cua hai ngon tay
RenderManager.render_selection_box = function(in_min, in_max, in_context_id) {
	var left = Math.min(in_min.x, in_max.x);
	var right = Math.max(in_min.x, in_max.x);
	var top = Math.min(in_min.y, in_max.y);
	var bottom = Math.max(in_min.y, in_max.y);
	RenderManager.selection_box.style.top = top + "px";
	RenderManager.selection_box.style.left = left + "px";
	RenderManager.selection_box.style.width = (right - left) + "px";
	RenderManager.selection_box.style.height = (bottom - top) + "px";
	RenderManager.selection_box.style.visibility = "visible";
}

//<<<< render minmax boundingbox duoc chon
RenderManager.render_bb = function(in_bb, in_context_id) {
	RenderManager.bounding_box.style.top = in_bb.render_mins.y + "px";
	RenderManager.bounding_box.style.left = in_bb.render_mins.x + "px";
	RenderManager.bounding_box.style.width = (in_bb.render_maxs.x - in_bb.render_mins.x) + "px";
	RenderManager.bounding_box.style.height = (in_bb.render_maxs.y - in_bb.render_mins.y) + "px";
	RenderManager.bounding_box.style.visibility = "visible";
	//RenderManager.segment_drag		
	if (Editor.drag && Editor.state == EditorState.ReplaceSub) {
		RenderManager.segment_drag.style.top = in_bb.render_mins.y + Editor.dragHeight + Editor.top - 25 + "px";
		var left = ((in_bb.render_maxs.x - in_bb.render_mins.x) - 20) / 2;
		left = left + in_bb.render_mins.x
		RenderManager.segment_drag.style.left = left + "px";
		if (Editor.status_moveSub || ((in_bb.render_maxs.x - in_bb.render_mins.x) < Editor.width && (in_bb.render_maxs.y - in_bb.render_mins.y) < Editor.height)) {
			RenderManager.segment_drag.style.visibility = "visible";
			Editor.crosshair = true;
		} else {
			RenderManager.segment_drag.style.visibility = "hidden";
			Editor.crosshair = false;
		}
	} else {
		RenderManager.segment_drag.style.visibility = "hidden";
	}
	Segment.top = in_bb.render_mins.y;
	Segment.left = in_bb.render_mins.x;
	Segment.width = in_bb.render_maxs.x - in_bb.render_mins.x;
	Segment.height = in_bb.render_maxs.y - in_bb.render_mins.y;
	
	return;
}

RenderManager.render_bb_control_point = function(in_x, in_y, in_context) {
	in_context.fillStyle = Editor.control_point_fill_color;
	in_context.strokeStyle = Editor.control_point_line_color;
	in_context.lineWidth = Editor.control_point_line_width;
	in_context.beginPath();
	in_context.arc(in_x, in_y, Editor.control_point_radius, 0, Math.PI * 2, true);
	in_context.closePath();
	in_context.fill();
	in_context.stroke();
}

//<<<<< tinh vi tri symbol hien tai tuong ung voi stroke
RenderManager.render_set_field = function(in_context_id) {
	if (Editor.state == EditorState.MovingSegments || Editor.state == EditorState.Zoom
	    || TouchHold.tick >= 1 || Exercise.selected || Editor.screen
	    || Editor.state == EditorState.MultyRectangleSelecting
	    || Editor.state == EditorState.Flottom || Editor.state == EditorState.ReplaceSub)
		return;
	var set_segments = new Array();
	delete Gestures.segments_frac;
	Gestures.segments_frac = new Array();
	delete Fractions.Sqrts;
	Fractions.Sqrts = new Array();
	delete Fractions.gestures;
	Fractions.gestures = new Array();
	delete Editor.arr_seg_set_field;
	Editor.arr_seg_set_field = new Array();
	// segments are in order by set id
	Gestures.SortSetId(Editor.segments);
	Editor.segments.push(null); // add null pointer so we can easily render last set in list
	var set_index = 0;
	for (var k = 0; k < Editor.segments.length; k++) {
		var seg = Editor.segments[k];
		if (set_segments.length == 0) {
			set_segments.push(seg);
			if (seg != null) {
				// add list instance_id current
				Editor.arr_seg_set_field.push(seg.instance_id);
			}
		} else if (seg == null || seg.set_id != set_segments[0].set_id) {
			var mins = set_segments[0].worldMinDrawPosition();
			var maxs = set_segments[0].worldMaxDrawPosition();
			for (var j = 1; j < set_segments.length; j++) {
				var seg_min = set_segments[j].worldMinDrawPosition();
				var seg_max = set_segments[j].worldMaxDrawPosition();
				if (seg_min.x < mins.x) mins.x = seg_min.x;
				if (seg_min.y < mins.y) mins.y = seg_min.y;
				if (seg_max.x > maxs.x) maxs.x = seg_max.x;
				if (seg_max.y > maxs.y) maxs.y = seg_max.y;
			}
			var rect_size = Vector2.Subtract(maxs, mins);
			// need to dynamically make these if we run out
			// incrase number of these divs
			if (RenderManager.segment_set_divs.length == set_index) {
				var div = document.createElement('div');
				div.className = 'segment_set';
				div.style.visibility = 'hidden';
				Editor.canvas_div.appendChild(div);
				RenderManager.segment_set_divs.push(div);
			}
			var top = 0;
			//if (Editor.drag)
			top = Editor.top;
			var ss_div = RenderManager.segment_set_divs[set_index];
			ss_div.style.left = mins.x + "px";
			ss_div.style.top = mins.y + top + "px";
			var sb = new StringBuilder();
			var h = rect_size.x / 2 - 25 + "px";
			sb.append("-25px 0px 0px ");
			sb.append(h);
			ss_div.style.width = "50px";
			ss_div.style.height = "25px";
			ss_div.style.margin = sb;
			set_index++;
			var recognition_result = RecognitionManager.getRecognition(set_segments[0].set_id);
			if (recognition_result != null) {
				var symbol = RecognitionManager.symbol_name_to_unicode[recognition_result.symbols[0]];
				if (symbol != undefined) ss_div.innerHTML = symbol;
				else {
					ss_div.innerHTML = recognition_result.symbols[0];
				}
				if (recognition_result.symbols[0] == "_dash" || recognition_result.symbols[0] == "_equal") { //_equal //
					if (!Gestures.segments_frac.contains(set_segments[0])) Gestures.segments_frac.push(set_segments[0]); //_plus
				}
				if (recognition_result.symbols[0] == "sqrt") {
					Fractions.Sqrts.push(set_segments[0]);
				}
				if (Gestures.isSegmentHeart(set_segments[0])) {
					Fractions.gestures.push(set_segments[0]);
				}
				ss_div.style.fontSize = "25px";
				ss_div.style.lineHeight = "25px";
				ss_div.style.whiteSpace = "nowrap";
			} else
			ss_div.innerHTML = "";
			// ready for next segment set
			set_segments.length = 0;
			set_segments.push(seg);
			if (seg != null) {
				// add list instance_id current
				Editor.arr_seg_set_field.push(seg.instance_id);
			}
		} else
		set_segments.push(seg);
	}
	Editor.segments.pop();
	/*for (var k = set_index; k < RenderManager.segment_set_divs.length; k++) {
		RenderManager.segment_set_divs[k].style.visibility = "hidden";
		RenderManager.segment_set_divs[k].innerHTML = "";
	}*/
}

RenderManager.unrender_set_field = function() {
	/*for (var k = 0; k < RenderManager.segment_set_divs.length; k++) {
		RenderManager.segment_set_divs[k].style.visibility = "hidden";
	}*/
}

RenderManager.unsetField = function(seg_selected){
	if (seg_selected.length == 0)
		return;
	for (var i = 0; i < seg_selected.length; i++){
		var unset = seg_selected[i];
		RenderManager.segment_set_divs[unset].style.visibility = "hidden";
	}
}

RenderManager.setField = function(){
	var set_field = new Array();
	for (var l = 0; l < Editor.arr_seg_select.length; l++) {
		for (var k = 0; k < Editor.arr_seg_set_field.length; k++) {
			if (Editor.arr_seg_select[l] == Editor.arr_seg_set_field[k]) {
				var index_pos = Editor.arr_seg_set_field.indexOf(Editor.arr_seg_set_field[k]);
				set_field.push(index_pos);
				var sss_div = RenderManager.segment_set_divs[index_pos];
				if( Editor.show_symbol ) //sn170706 
                                   sss_div.style.visibility = "visible";
				sss_div.style.background = "pink";
				sss_div.style.border = "1px solid red";
			}
		}
	}
	return set_field;
}

//<<<<< xoa bo net canvas vua ve xong
RenderManager.clear_canvas = function() {
	var w = Editor.canvases[0].width;
	Editor.canvases[0].width = 1;
	Editor.canvases[0].width = w;

	SysEquations.re_Draw_line();
}

// Funtions for Gestures Splits Do-Circle
RenderManager.renderSplit = function(tagHtml, in_bb, in_context_id) {
	tagHtml.style.top = in_bb.render_mins.y + "px";
	tagHtml.style.left = in_bb.render_mins.x + "px";
	tagHtml.style.width = (in_bb.render_maxs.x - in_bb.render_mins.x) + "px";
	tagHtml.style.height = (in_bb.render_maxs.y - in_bb.render_mins.y) + "px";
	tagHtml.style.visibility = "visible";
	return;
}
