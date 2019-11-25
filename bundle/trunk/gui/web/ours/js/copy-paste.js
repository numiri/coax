// JavaScript Document

function SegmentsCopy(in_segment,min,set_id){
    this.segment = in_segment;//luu segment duoc chon
    this.min = min; //luu vi tri segment
    this.set_id = set_id;
}

function CopyPasteSegments() {
    
}

CopyPasteSegments.listSegment = new Array();
CopyPasteSegments.flag = false;

CopyPasteSegments.Copys = function(){
    if(Editor.selected_segments.length == 0)
	return;
    CopyPasteSegments.flag = false;
    delete CopyPasteSegments.listSegment;
    CopyPasteSegments.listSegment = new Array();
    var group = new Group();
    var segment_selects = Gestures.SortSetId(Editor.selected_segments);    
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var min = bb.mins;
    var tranx = new Vector2(130 - min.x,0);
    CopyPasteSegments.listSegment = CopyPasteSegments.saveListGroup(segment_selects,tranx,false);    
}

CopyPasteSegments.saveListGroup = function(select_seg,tran,status){
    var listGroup = new Array();
    if(select_seg.length == 0)
	return listGroup;
    var segment_selects = Gestures.SortSetId(select_seg);    
    var i = 0,j = 0;
    while (i < segment_selects.length) {
	var segselect = segment_selects[i];
	if (Gestures.isBlockSegment(segselect, 1) == true){
	    continue;
	}
	var group = new Group();
	j = i;
	while (j < segment_selects.length && segment_selects[j].set_id == segselect.set_id) {
	    var seg = segment_selects[j];
	    var pMin = seg.worldMinPosition();	    
	    pMin = Vector2.Add(pMin,tran);	    
	    var segcopy = new SegmentsCopy(seg,pMin,segselect.set_id);	    
	    group.Add(segcopy);
	    j++;
	}
	i = j;
	if(group.segments.length > 0){
	    listGroup.push(group);
	}
    }
    return listGroup;
}

CopyPasteSegments.Paste = function(trans){
    if (!CopyPasteSegments.flag){
	return;
    }
    var groupsCopy = new Group();
    for(var k = 0;k < CopyPasteSegments.listSegment.length;k++){
	groupsCopy.AddList(CopyPasteSegments.Copy(CopyPasteSegments.listSegment[k].segments));
    }
    if (groupsCopy.segments.length > 0) {
	Editor.undo_stack.pop();
	var action = new ActionSegments(groupsCopy.segments, true, Editor.CopySegments);
	action.Apply();
	Editor.add_action(action);
	if (trans != 0){
	    var center_group = Vector2.Add(groupsCopy.minPosition(), groupsCopy.maxPosition());
	    center_group = new Vector2(center_group.x / 2, center_group.y / 2);
	    var temp_copy = new Array();
	    for (var i = 0; i < groupsCopy.segments.length; i++){
		var temp_seg = groupsCopy.segments[i];
		var temp_trans = Vector2.Subtract(trans, center_group);
		temp_seg.translate(temp_trans);
		temp_seg.render_selected();
		temp_copy.push(temp_seg);
	    }
	    Editor.undo_stack.pop();
	    var action = new ActionSegments(temp_copy, true, Editor.CopySegments);
	    action.Apply();
	    Editor.add_action(action);
	}
	Editor.clear_selected_segments();
	for (var k = 0; k < groupsCopy.segments.length; k++) {
	    var seg = groupsCopy.segments[k];
	    Editor.add_selected_segment(seg, Editor.selected_segments);
	    seg.render_selected();
	}
    }    
    delete CopyPasteSegments.listSegment;
    CopyPasteSegments.listSegment = new Array();
    CopyPasteSegments.flag = false;
    
    Editor.button_states[Buttons.Command].setTouched(false);
    Editor.rectangleSelectionTool();
    Editor.change_step = false;
    RenderManager.render();
}

CopyPasteSegments.Copy = function(segment_select) {
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    delete Editor.arr_seg_select;
    Editor.arr_seg_select = new Array();
    var l = segment_select.length;
    var maxs;    
    var kc = 0;
    var arrSelect = new Array();
    var arrCopy = new Array();
    var in_set_id = -1;
    var segHeart = new Array();
    var isCheckHeart = false;
    var symbols = new Array();
    var cers = new Array();
    var heartSeg = null;
    var set_ids = new Array();
    var groups;
    delete Gestures.copy_segments;
    Gestures.copy_segments = new Array();
    for (var k = 0; k < segment_select.length; k++) {
	var seg = segment_select[k].segment;
	if (!set_ids.contains(seg.set_id)) {
	    set_ids.push(seg.set_id);
	}
	var s_bol = seg.symbol;
	var c_scale = seg.scale;
	var bHeart = Gestures.isSegmentHeart(seg);
	if (!isCheckHeart && bHeart == true) {
	    isCheckHeart = true;
	}
	if (Gestures.isBlockSegment(seg, 1) == true) {} else {
	    var mins = segment_select[k].min;
	    var tran_y = mins.y;
	    var tran_x = mins.x;
	    var points = seg.points;
	    Editor.current_stroke = new PenStroke(points[0].x + tran_x, points[0].y + tran_y, 6);
	    Editor.add_segment(Editor.current_stroke);	    
	    for (var i = 0; i < points.length; i++) {		
		Editor.current_stroke.add_point(Vector2.Add(points[i],mins));
	    }
	    if (!Gestures.checkIsExistsSegment(arrSelect, seg.set_id, seg.symbol)) {
		if (arrCopy.length > 0) {
		    groups = Formula.Copy(arrCopy, symbols, cers);
		    if (in_set_id == -1 && isCheckHeart) {
			heartSeg = groups[0];
			if (Gestures.isSegmentHeart(heartSeg)) {
			    in_set_id = 1;
			}
			for (var j = 1; j < groups.length; j++) {
			    segHeart.push(groups[j]);
			}
		    } else {
			for (var j = 0; j < groups.length; j++) {
			    segHeart.push(groups[j]);
			}
		    }
		}
		arrSelect = new Array();
		arrCopy = new Array();
		symbols = new Array();
		cers = new Array();
		var mean_scale = (Math.abs(c_scale.x * Editor.current_stroke.temp_scale.x) + Math.abs(c_scale.y * Editor.current_stroke.temp_scale.y)) / 2.0;
		Editor.current_stroke.stroke_width = Editor.current_stroke.stroke_width / mean_scale;
		if (Editor.current_stroke.finish_stroke(mins, c_scale)) {
		    arrCopy.push(Editor.current_stroke);
		    s_bol = s_bol.replace("frac", "_dash"); //_dash
		    symbols.push(s_bol);
		    cers.push(seg.scale);
		    Gestures.copy_segments.push(Editor.current_stroke);
		} else {
		    Editor.segments.pop();
		}
		arrSelect.push(seg);
	    } else {
		var mean_scale = (Math.abs(c_scale.x * Editor.current_stroke.temp_scale.x) + Math.abs(c_scale.y * Editor.current_stroke.temp_scale.y)) / 2.0;
		Editor.current_stroke.stroke_width = Editor.current_stroke.stroke_width / mean_scale;
		if (Editor.current_stroke.finish_stroke(mins, c_scale)) {
		    arrCopy.push(Editor.current_stroke);
		    s_bol = s_bol.replace("frac", "_dash"); //_dash
		    symbols.push(s_bol);
		    cers.push(seg.scale);
		    Gestures.copy_segments.push(Editor.current_stroke);
		} else {
		    Editor.segments.pop();
		}
		arrSelect.push(seg);
	    }
	    Editor.current_stroke = null;
	}
    }
    groups = Formula.Copy(arrCopy, symbols, cers);
    for (var j = 0; j < groups.length; j++) {
	segHeart.push(groups[j]);
    }
    if (isCheckHeart == true) {
	Formula.GroupCopy(heartSeg, segHeart);
	var recog = RecognitionManager.getRecognition(set_ids[0]);
	var latext = "";
	for (var k = 0; k < arrCoverItems.length; k++) {
	    var tple = arrCoverItems[k];
	    if (tple.item1 == recog) {
		latext = tple.item5;
		break;
	    }
	}
	recog = RecognitionManager.getRecognition(heartSeg.set_id);
	var tuple = new Tuple(recog, heartSeg.world_mins, heartSeg.world_maxs, 0, latext);
	arrCoverItems.push(tuple);
	segHeart.push(heartSeg);
    }
    return Gestures.copy_segments;
}
