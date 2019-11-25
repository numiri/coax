function Gestures() {

}
var recyclebin = document.getElementById("recyclebin");
//sn added:  var touchhold = new TouchHold(); 
Gestures.count_point = 0;
Gestures.current_stroke_flag = false;
Gestures.touch_step = false;
Gestures.state = 3;
Gestures.dralf = "draft";
Gestures.DralfIds = new Array();
Gestures.segments_frac = new Array();
//Gestures.flag_copy = false;
Gestures.copy_before = true;
//phan cua resize draft
Gestures.draftStartX = 0;
Gestures.draftStartY = 0;
Gestures.draftCurrX = 0;
Gestures.draftCurrY = 0;
Gestures.isResizeDraft = false;
Gestures.offsetDraft = 11;
Gestures.btnResize = "btnResize";
Gestures.segments_set = new Array();
Gestures.indexchildrenSplit = -1;
Gestures.scale_offset = new Vector2(0, 0);
//===== All Funtions Gestures Copy =====
Gestures.copy_segments = new Array();
 
Gestures.checkIsExistsSegment = function(in_segments, set_id, symbol) {
    if (in_segments.length == 0) return false;
    for (var k = 0; k < in_segments.length; k++) {
	if (in_segments[k].set_id == set_id && in_segments[k].symbol == symbol) return true; // && in_segments[k].symbol == symbol
    }
    return false;
}

//ham kiem tra chu V hay ^ hay Dralf
Gestures.isBlockSegment = function(in_seg, flag) {
    var s_bol = in_seg.symbol;
    if (flag == 0){
	return false;
    }
    if (s_bol == "V" || s_bol == "v" || s_bol == "^") {
	return true;
    }
    return false;
}

//Begin by ptran ngay 9/1/2012
//Ham nay dung chung tranForm
Gestures.transFormFlottom = function(bBool) {
    delete Editor.selected_segments_transform
    Editor.selected_segments_transform = new Array();
    delete Editor.selected_segments_not_transform;
    Editor.selected_segments_not_transform = new Array();
    for (var k = 0; k < Editor.segments.length; k++) {
	//if (!Gestures.isBlockSegment(Editor.segments[k])
	    //&& Gestures.IsSegmentsBelongDralf(Editor.segments[k]) == false) {
	if (!Gestures.isBlockSegment(Editor.segments[k], 1)) {
	    Editor.selected_segments_transform.push(Editor.segments[k]);
	} else {
	    Editor.selected_segments_not_transform.push(Editor.segments[k])
	}
    }
    Editor.add_action(new HistorySegments(Editor.selected_segments_transform, bBool,Editor.TransformSegments));
}

//End 9/1/2012
//ham kiem tra hinh tron,trai tim Gesture
Gestures.isSegmentHeart = function(in_seg) {
    var symbol = in_seg.symbol;
    if (symbol == "_heart" || symbol == "_circle" || symbol == "_square" || symbol == "_trapezium") {
	return true;
    }
    return false;
}

Gestures.lastTouch = 0;
Gestures.doubleclick = function() {
    var now = new Date().getTime();
    var delta = now - Gestures.lastTouch;
    if (delta < Editor.timer_doubleclick * 3 && delta > Editor.timer_doubleclick
	&& Editor.segments.length > 0) {
	if (Editor.selected_segments.length > 0 /*&& Editor.selected_segments.length < 20 */) {//g modified for bug 202
	    if (Editor.selected_bb != null){
		var click_result = CollisionManager.get_point_collides(Editor.mouse_position);
		if (Editor.selected_bb.point_collides(Editor.mouse_position)) {
		    Gestures.copyMove(Editor.selected_segments);
		    document.getElementById(Gestures.dralf).style.visibility = "hidden";
		    document.getElementById(Gestures.btnResize).style.visibility = "hidden";
		}
		Gestures.lastTouch = 0;
	    }
	}
    } else
    Gestures.lastTouch = now;
    Space.countMove = 0;
}

//<<<<< tinh min-max-size nhung stroke duoc copy
Gestures.copyMove = function(segment_select) {
    var groups = new Group();
    for (var k = 0; k < segment_select.length; k++) {
	groups.Add(segment_select[k]);
    }
    var mins = groups.minGroup();
    var maxs = groups.maxGroup() + 20;
    var kc = maxs - mins;
    var segment_selects = Gestures.SortSetId(segment_select);
    var i = 0,
	j = 0;
    var groupsCopy = new Group();
    while (i < segment_selects.length) {
	var seg = segment_selects[i];
	var group = new Group();
	group.Add(seg);
	j = i + 1;
	while (j < segment_selects.length && segment_selects[j].set_id == seg.set_id) {
	    group.Add(segment_selects[j]);
	    j++;
	}
	if (group.segments.length > 0) groupsCopy.AddList(Gestures.Copy(group.segments, kc));
	i = j;
    }
    //Editor.undo_stack.pop();
    if (groupsCopy.segments.length > 0) {
	//var action = new CopySegments(groupsCopy.segments, true); //segHeart //Gestures.copy_segments
	var action = new ActionSegments(groupsCopy.segments, true,Editor.CopySegments); //segHeart //Gestures.copy_segments
	action.Apply();
	Editor.add_action(action);

        //start: highlight cloned segments
        Editor.clear_selected_segments();
        //Editor.check_rectangle = true;
        Gestures.restoreNode();
	
	RenderManager.unsetField(Editor.set_field);
	delete Editor.set_field;
	Editor.set_field = new Array();
	delete Editor.arr_seg_select;
	Editor.arr_seg_select = new Array();
	
        //Editor.arr_seg_select = new Array();
        /*for (var m = 0; m < RenderManager.segment_set_divs.length; m++) {
	    var sss_div = RenderManager.segment_set_divs[m];
	    sss_div.style.visibility = "hidden";
	}*/
	for (var k = 0; k < groupsCopy.segments.length; k++) {
	    var seg = groupsCopy.segments[k];
	    Editor.add_selected_segment(seg, Editor.selected_segments);
	    seg.render_selected();
	    //Editor.arr_seg_select.push(seg.instance_id);
	}
        Editor.state = EditorState.SegmentsSelected;
        //end: highlight cloned segments
      
    }
    RenderManager.render();
}

Gestures.Copy = function(segment_select, distance) {
    //Gestures.flag_copy = true;
    //Editor.arr_seg_select = new Array();
    var l = segment_select.length;
    var maxs;
    if (l > 1) {
	segment_select = Gestures.Sort(segment_select);
    }
    var kc = 20;
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
    kc = distance;
    delete Gestures.copy_segments;
    Gestures.copy_segments = new Array();
    for (var k = 0; k < segment_select.length; k++) {
	//Editor.arr_seg_select.push(segment_select[k].instance_id);
	var seg = segment_select[k];
	if (!set_ids.contains(seg.set_id)) {
	    set_ids.push(seg.set_id);
	}
	var s_bol = seg.symbol;
	console.log("sym " + seg.set_id);
	var c_scale = seg.scale;
	var bHeart = Gestures.isSegmentHeart(seg);
	if (!isCheckHeart && bHeart == true) {
	    isCheckHeart = true;
	}
	if (Gestures.isBlockSegment(seg, 1) == true) {} else {
	    var tran_y = seg.worldMinPosition().y;
	    var tran_x = seg.worldMinPosition().x;
	    tran_x = tran_x + kc;
	    var mins = new Vector2(tran_x, tran_y);
	    var points = seg.points;
	    Editor.current_stroke = new PenStroke(points[0].x, points[0].y, 6);
	    Editor.add_segment(Editor.current_stroke);
	    //Gestures.copy_segments.push(Editor.current_stroke);
	    for (var i = 0; i < points.length; i++) {
		Editor.current_stroke.add_point(points[i]);
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

//===== End =====
//<<<<< kiem tra nhung segment khong thuc hien align
Gestures.isSelected = function(){
    for(var k =0;k< Editor.selected_segments.length;k++){
	var seg =Editor.selected_segments[k];
	if(!Gestures.isBlockSegment(seg, 1) && !Gestures.IsSegmentsBelongDralf(seg))
	    return true;
    }
    return false;
}

//===== All Funtions Gestures Delete - Remove =====
//<<<<< (K)
Gestures.DeleteSegments = function(segments_selected, flag) {
    //if (Gestures.PosOutSize(Segment.top, Segment.left, Segment.width, Segment.height) == true) {
    if (Gestures.deletes()){
	RenderManager.bounding_box.style.background = "GhostWhite";
	recyclebin.style.opacity = 1;
	if (Editor.selected_segments_transform.length > 0 && flag == -1)
	    Editor.current_action.status = false;
	//Editor.check_rectangle = true;
	RenderManager.unsetField(Editor.set_field);
	delete Editor.set_field;
	Editor.set_field = new Array();
	delete Editor.arr_seg_select;
	Editor.arr_seg_select = new Array();
	var action = new ActionSegments(segments_selected, false, Editor.DeleteSegments);
	action.Apply();
	Editor.add_action(action);
	Editor.clear_selected_segments();
	if (Editor.selection_method == "Rectangle") {
	    Editor.state = EditorState.ReadyToRectangleSelect;
	}
	//else if (Editor.selection_method == "Stroke") {
	    //Editor.state = EditorState.ReadyToStrokeSelect;
	//}
	RenderManager.render();
	if (flag != -1) {
	    Editor.undo_stack.pop();
	    //Gestures.ManualDeletesDralf(segments_selected);
	}
	else if (Editor.segments_dralf.length > 0){
	    //Gestures.ManualDeletesDralf(Editor.segments_dralf);
	}
	SysEquations.SaveExpressions();
    }
}

Gestures.deletes = function(){
//   if (Editor.mouse_position.x < 65 && Editor.mouse_position.y > ResizeTo.height_canvas - 80){
   if (Editor.mouse_position.x < 65 && Editor.mouse_position.y > $("#recyclebin").position().top){//g  
      return true;
   }
   return false;
}
//<<<<< kiem tra nhung segments khi di chuyen ra ngoai vung editor
Gestures.PosOutSize = function(top, left, width, height) {
    if (top > ResizeTo.height_canvas - height || left > ResizeTo.width_canvas - width || top < 0 || left < 0) return true;
    else
    return false;
}
//===== End =====

//===== All Funtions Gestures Splits =====
//<<<<< present action (undo-redo )
//<<<<< di chuyen duong tron khi action
Gestures.doCircle = function(parentNodeCricle, in_segment, segmentIds){
    if (parentNodeCricle == null)
	return;
    if (parentNodeCricle.style.visibility == "hidden"){
	parentNodeCricle.style.visibility = "visible";
	indexParent = Editor.FindIndexSplitSegment(segmentIds);
	if (indexParent != -1) {
	    for (var t = 0; t < Editor.segmentSplits[indexParent].childrenSplit.length; t++) {
		var segmentChild = Editor.segmentSplits[indexParent].childrenSplit[t];
		segmentChild.element.style.visibility = "visible";
	    }
	}
    }
    var segment_mins = in_segment.worldMinPosition();
    var segment_maxs = in_segment.worldMaxPosition();
    var segment_draw_mins = in_segment.worldMinDrawPosition();
    var segment_draw_maxs = in_segment.worldMaxDrawPosition();
    var splitBox = new BoundingBox(segment_mins, segment_maxs, segment_draw_mins, segment_draw_maxs);
    RenderManager.renderSplit(parentNodeCricle, splitBox, 4);
}

//<<<<< cap nhat Split sau khi action
Gestures.updateSplit = function(inSegment, index){
    if (index == -1){
	return;
    }
    var distance = new Vector2(0, 0);
    distance = Vector2.Subtract(inSegment.worldMinPosition(), Editor.segmentSplits[index].mins);
    Editor.segmentSplits[index].mins = inSegment.worldMinPosition();
    Editor.segmentSplits[index].points = inSegment.UpdatePoints(distance);
    Editor.segmentSplits[index].centerPoint = new Vector2.Add(Editor.segmentSplits[index].centerPoint, distance);
}

//<<<<< di chuyen children Split
Gestures.moveChildrenSplit = function(segmentIds, translation){
    var indexParent = Editor.FindIndexSplitSegment(String(segmentIds));
    if (indexParent == -1){
	return;
    }
    for (var h = 0; h < Editor.segmentSplits[indexParent].childrenSplit.length; h++) {
	var segChildren = Editor.segmentSplits[indexParent].childrenSplit[h];
	if (Editor.FindIndexSegment(segChildren.set_id, Editor.selected_segments) != -1){
	    continue;
	}
	segChildren.translate(translation);
	segChildren.render();
    }
}

Gestures.Split = function(segments, symbol) {
    //Editor.undo_stack.pop();
    var bBool = false;
    segments.symbol = symbol;
    if (symbol == "^") {
	Gestures.SaveSplit(Editor.segments[Editor.segments.length - 1], true, true, 2);
	bBool = true;
    } else if (symbol == "V" || symbol == "v") {
	Gestures.SaveSplit(Editor.segments[Editor.segments.length - 1], false, true, 1);
	bBool = true;
    }
	
    if (bBool) {
	Gestures.segmentInSplit(Editor.segmentSplits[Editor.segmentSplits.length - 1]);
	if (Gestures.checkSplitStatus(Editor.segmentSplits[Editor.segmentSplits.length - 1]) == false) {
	    var tag = document.getElementsByTagName("g");
	    //tag[tag.length - 1].setAttribute("visibility", "hidden");
	    var maxx = segments.worldMaxPosition().x;
	    Editor.remove_segment(segments);
	    document.getElementById("svgId").removeChild(tag[tag.length - 1]);
	    Editor.segmentSplits.pop();
	    Editor.undo_stack.pop();
	} else {
	    Editor.undo_stack[Editor.undo_stack.length - 1].status = true;
	    var l = Editor.segmentSplits.length;
	    if (l > 0) {
		var in_seg = Editor.segmentSplits[l - 1];
		Gestures.PrintfsList(in_seg);
	    }
	}
    }
}

Gestures.segmentInSplit = function(segment){
    try{
	var l = segment.points.length;
	if(l < 1)
	    return;
	var pLeft = segment.points[0];
	var pRight = segment.points[l-1];
	var pCenter = segment.centerPoint;
	var p1 = 0;
	var p2 = 0;
	if(pLeft.x < pRight.x){
	    p1 = pLeft.x;
	    p2 = pRight.x;
	}
	else{
	    p2 = pLeft.x;
	    p1 = pRight.x;
	}
	var setListId = new Array();
	var group = new Group();
	var mins = segment.mins;
	var maxs = segment.maxs;
	var distance = 50;
	var temp = 0;
	for(var k = 0;k < Editor.segments.length -1;k++){
	    var seg = Editor.segments[k];
	    var size = seg.size;	    
	    if(seg.worldMinPosition().x > p1 - size.x/2 && seg.worldMaxPosition().x < p2 + size.x/2){
		var bBool = false;
		if(seg.worldMinPosition().y > mins.y){
		    if(maxs.y + distance >= seg.worldMinPosition().y){
			bBool = true;
			temp = 1;
		    }
		}
		else if(seg.worldMinPosition().y < mins.y){
		    if(mins.y - distance <= seg.worldMaxPosition().y){
			bBool = true;
			temp = 2;
		    }
		}		
		if(!setListId.contains(seg.set_id) && bBool){
		    ////console.log("symbol " + seg.symbol);
		    setListId.push(seg.set_id);
		    group.Add(seg);
		}
	    }
	}
	if(temp == 1){
	    //cong
	    var left = Math.abs(group.minY() - pLeft.y);
	    var center = Math.abs(group.minY() - pCenter.y);
	    if(left < center){
		segment.left = true;
		segment.right = true;
		segment.center = false;
	    }
	    else{
		segment.left = false;
		segment.right = false;
		segment.center = true;
	    }
	}
	else if(temp == 2){
	    var left = Math.abs(group.maxY() - pLeft.y);
	    var center = Math.abs(group.maxY() - pCenter.y);
	    if(left < center){
		segment.left = true;
		segment.right = true;
		segment.center = false;
	    }
	    else{
		segment.left = false;
		segment.right = false;
		segment.center = true;
	    }
	}
	else{
	    segment.left = false;
		segment.right = false;
		segment.center = false;
	}
    }
    catch(e){}
}

Gestures.SaveSplit = function(in_segment, status, flag, t) {
    var minPoint = in_segment.worldMinPosition();
    var maxs = in_segment.worldMaxPosition();
    var y = 0;
    if (t == 1) { //chu v
	y = in_segment.worldMaxPosition().y;
    } else if (t == 2) {
	y = in_segment.worldMinPosition().y;
    } else {
	y = 0;
    }
    
    var center = Gestures.Point(y, in_segment.savePoints);
    var seg = new SegmentSplit(minPoint, maxs, in_segment.set_id, in_segment, status, flag, in_segment.savePoints, center, false, false, false);
    Editor.AddSegmentSplit(seg);
}

Gestures.checkSplitStatus = function(in_segmentSplit) {
    var bBool = true;
    if (in_segmentSplit.left == false && in_segmentSplit.right == false && in_segmentSplit.center == false) {
	return false;
    }
    if (in_segmentSplit.center == true) {
	if (in_segmentSplit.left == true || in_segmentSplit.right == true) {
	    return false;
	}
    } else {
	if (in_segmentSplit.left == false || in_segmentSplit.right == false) {
	    return false;
	}
    }
    return bBool;
}

Gestures.PrintfsList = function(in_segmentSplit) {
    var divSplit = document.getElementById("segmentSplit");    
    var symbol = in_segmentSplit.segment.symbol;
    var in_segment = in_segmentSplit.segment;
    if (symbol == "V" || symbol == "v" || symbol == "^") {
	var obj = document.getElementById(String(in_segment.set_id));
	var div = document.createElement('div');
	div.className = "segmentSplit";
	div.setAttribute("id", in_segment.set_id);
	div.setAttribute("ontouchstart", "event.preventDefault();");

	Gestures.doCircle(div, in_segment, in_segment.set_id);
	Gestures.Circle(div, in_segmentSplit);
	divSplit.appendChild(div);
    }
}

//ve duong trong
Gestures.Circle = function(tagHtml, in_segmentSplit) {
    //Tao ra cac the div co chua hinh tron
    var divLeft = document.createElement('div');
    var divRight = document.createElement('div');
    var divCenter = document.createElement('div');
    var l = in_segmentSplit.points.length;
    var left = in_segmentSplit.points[0];
    var center = in_segmentSplit.centerPoint;
    var right = in_segmentSplit.points[l - 1];
    var min = in_segmentSplit.mins;
    var max = in_segmentSplit.maxs;
    divLeft.className = "bb_handle";
    divRight.className = "bb_handle";
    divCenter.className = "bb_handle";
    divLeft.setAttribute("ontouchstart", "event.preventDefault();");
    divRight.setAttribute("ontouchstart", "event.preventDefault();");
    divCenter.setAttribute("ontouchstart", "event.preventDefault();");
    var t = Editor.control_point_radius;
    if (in_segmentSplit.status) { //chu ^	
	divLeft.style.left = -1 * t / 2 + "px";
	divLeft.style.bottom = -1 * t + (max.y - left.y) + "px";
	divRight.style.right = -1 * t / 2 + "px";
	divRight.style.bottom = -1 * t + (max.y - right.y) + "px";
	divCenter.style.top = -1 * t + "px";
	divCenter.style.left = -1 * t / 2 + (center.x - min.x) + "px";

    } else { //chu V	
	divLeft.style.top = -1 * t + (left.y - min.y) + "px";
	divLeft.style.left = -1 * t / 2 + "px";
	divRight.style.top = -1 * t + (right.y - min.y) + "px";
	divRight.style.right = -1 * t / 2 + "px";
	divCenter.style.bottom = -1 * t + "px";
	divCenter.style.left = -1 * t / 2 + (center.x - min.x) + "px";
    }
    if (!in_segmentSplit.left) tagHtml.appendChild(divLeft);
    if (!in_segmentSplit.center) tagHtml.appendChild(divCenter);
    if (!in_segmentSplit.right) tagHtml.appendChild(divRight);
}

Gestures.Point = function(y, points) {
    if (y == 0) {
	return new Vector2(0, 0);
    }
    for (var k = 0; k < points.length; k++) {
	if (points[k].y == y) {
	    return points[k];
	}
    }
    return new Vector2(0, 0);
}

//===== End =====

//===== All Funtions Gestures Fence =====
//<<<<< group segment khi fence
/*//g rm
Gestures.GroupFence = function(segments) {
    var set_id = Segment.set_count++;
    Editor.add_action(new GroupSegments(Editor.selected_segments, segments.set_id, false));
    var to_classify = new Array();
    for (var k = 0; k < Editor.selected_segments.length; k++) {
	var old_set_id = Editor.selected_segments[k].set_id;
	if (to_classify.contains(old_set_id) == false) to_classify.push(old_set_id);
	Editor.selected_segments[k].set_id = segments.set_id;
    }
    for (var i = 1; i < Editor.segments.length; i++) {
	var value = Editor.segments[i];
	for (var j = i - 1; j >= 0 && Editor.segments[j].set_id > value.set_id; j--)
	Editor.segments[j + 1] = Editor.segments[j];
	Editor.segments[j + 1] = value;
    }
    Editor.clear_selected_segments();
}
*/
//<<<<< sap xep lai segment theo toa do de tinh min-max
Gestures.Sort = function(insegments) {
    for (var i = 0; i < insegments.length; i++) {
	for (var j = 0; j < insegments.length; j++) {
	    if (insegments[i].worldMinPosition().x < insegments[j].worldMinPosition().x) {
		var temp = insegments[i];
		insegments[i] = insegments[j];
		insegments[j] = temp;
	    }
	}
    }
    return insegments;
}

//<<<<< sap xep lai segment theo set_id de align
Gestures.SortSetId = function(insegments) {
    for (var i = 0; i < insegments.length; i++) {
	for (var j = 0; j < insegments.length; j++) {
	    if (insegments[i].set_id < insegments[j].set_id) {
		var temp = insegments[i];
		insegments[i] = insegments[j];
		insegments[j] = temp;
	    }
	}
    }
    return insegments;
}

//<<<<< thuc hien align fence
Gestures.AlignAuto = function(segment, recog) {
 Gestures.SaveCoverItems(Gestures.segments_set);
 var currentid = segment.set_id;
 Gestures.UpdateCoverItem(currentid, 1);
 var tuple = new Tuple(recog, segment.world_mins, segment.world_maxs, 0, "");
 arrCoverItems.push(tuple);
 
 Editor.alignAuto(segment);
}

//<<<<< save lai thong tin stroke vua fence
Gestures.SaveCoverItems = function(seg){
for (var i = 0; i < seg.length; i++){
	var mins = null;
	var maxs = null;
	var tuple = null;
	var symboltext = null;
	var recognition_result = RecognitionManager.getRecognition(seg[i].set_id);
	mins = seg[i].worldMinDrawPosition();
	maxs = seg[i].worldMaxDrawPosition();
	if(recognition_result != null){
	   symboltext = recognition_result.symbols[0];
	   if (symboltext.indexOf(" ") != -1 || 
	         Editor.shapeSymbols.indexOf(symboltext) >-1) {
	       Gestures.UpdateCoverItem(seg[i].set_id, -1);
	   } else {
	       tuple = new Tuple(recognition_result, mins, maxs, -1);
	       arrCoverItems.push(tuple);
	   }
	}
	//g: else do nothing?
}
}

//<<<<< kiem tra qua trinh fence co bao phu segment
Gestures.SegmentState = function(segment) {
   var Editor_list_symbol = new StringBuilder();
   Gestures.segments_set = new Array();
   var arrId = new Array();
   var rect_selected = CollisionManager.get_rectangle_collides(segment.world_mins, segment.world_maxs);
   for (var k = 0; k < rect_selected.length; k++) {
      if (arrId.contains(rect_selected[k].set_id) == true) continue;
      arrId.push(rect_selected[k].set_id);
      var segment_set = Editor.get_segment_by_id(rect_selected[k].set_id);
      var recognition_result = RecognitionManager.getRecognition(rect_selected[k].set_id);
      for (var j = 0; j < segment_set.length; j++) {
          if (segment_set[j].set_id != segment.set_id) {
             var sSymbolRec = null;
             Editor.add_selected_segment(segment_set[j], Editor.selected_segments);
             if (recognition_result != null) {
                 sSymbolRec = RecognitionManager.symbol_name_to_unicode[recognition_result.symbols[0]];
                 if (sSymbolRec == undefined) sSymbolRec = recognition_result.symbols[0];
             }
             Gestures.segments_set.push(segment_set[j]);
             Editor_list_symbol.append(" " + sSymbolRec);
          }
      }
   }
   return Editor_list_symbol;
}

// Set lai -1 cho cover item
// flag =1 update ; flag = -1(reset to -1); flag = 0(update latex cho parent);
//flag=2 remove phan tu cuoi cua arrcover
Gestures.UpdateCoverItem = function(parentid, flag, latex) {
    if (parseInt(flag) == 2) {
	for (var i = arrCoverItems.length - 1; i >= 0; i--) {
	    var t = arrCoverItems[i];
	    var parentCover = parseInt(t.item4.toString());
	    if (parentCover == -1) {
		arrCoverItems.splice(i, 1);
	    } else {
		break;
	    }
	}
    }
    if (parseInt(flag) == 1) {
	for (var i = 0; i < arrCoverItems.length; i++) {
	    var t = arrCoverItems[i];
	    var parentCover = parseInt(t.item4.toString());
	    if (parentCover == -1) {
		t.item4 = parentid;
	    }

	}
    }
    if (parseInt(flag) == 0) {
	for (var i = 0; i < arrCoverItems.length; i++) {
	    var t = arrCoverItems[i];
	    var parentCover = parseInt(t.item4.toString());
	    var id = t.item1.set_id;
	    if (parentCover == 0 && id == parentid) {
		t.item5 = latex;
	    }

	}
    }
    if (parseInt(flag) == -1) {
	for (var i = 0; i < arrCoverItems.length; i++) {
	    var t = arrCoverItems[i];
	    var parentCover = parseInt(t.item4.toString());
	    if (parentCover == parentid) {
		var tuple = null;
		tuple = new Tuple(t.item1, t.item2, t.item3, -1);
		//push them tuple de giai quyet van de undo, redo bi loi.
		arrCoverItems.push(tuple);
	    }
	}
    }
}

//<<<<< thuc hien zoom ty le gestures fence
Gestures.ZoomFence = function(segments, flag, rate, status_srcoll) {
    if (flag == false) {
	var rect_selected = CollisionManager.get_rectangle_collides(segments.world_mins, segments.world_maxs);
	rect_selected = Gestures.Sort(rect_selected);
	for (var i = 0; i < rect_selected.length; i++) {
	    Editor.add_selected_segment(rect_selected[i], Editor.selected_segments);
	}	
	Editor.add_action(new HistorySegments(rect_selected, false,Editor.TransformSegments));
    }
    else {
	Editor.clear_selected_segments();
	for(var i = 0;i< segments.length;i++)
	{
	    Editor.add_selected_segment(segments[i], Editor.selected_segments);
	}
    }
    // khoi tai
    Editor.resize_offset = new Vector2(0,0);
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    anchor = new Vector2((bb.maxs.x + bb.mins.x) / 2, (bb.maxs.y + bb.mins.y) / 2);
    var scale = new Vector2(1/rate, 1/rate);
    for (var k = 0; k < Editor.selected_segments.length; k++)
	Editor.selected_segments[k].resize(anchor, scale);
    Editor.update_selected_bb();
    // cap nhat
    var pos_x = Editor.selected_bb.mins.x + (Editor.selected_bb.maxs.x - Editor.selected_bb.mins.x)/2;
    var pos_y = Editor.selected_bb.mins.y + (Editor.selected_bb.maxs.y - Editor.selected_bb.mins.y)/2
    var pos_center_box = new Vector2(pos_x, pos_y);
    var mouse_pos_temp;
    if (Editor.using_mobile) {
	if (Editor.mouse_position_first.x > 0 && Editor.mouse_position_first.y > 0) mouse_pos_temp = Editor.mouse_position_first;
	else if (Editor.mouse_position_second.x > 0 && Editor.mouse_position_second.y > 0) mouse_pos_temp = Editor.mouse_position_second;
    } else {
	mouse_pos_temp = Editor.mouse_position;
    }
    var translation = Vector2.Subtract(mouse_pos_temp, pos_center_box);
    for (var k = 0; k < Editor.selected_segments.length; k++){
	Editor.selected_segments[k].freeze_transform();
	if (flag){
	    Editor.selected_segments[k].translate(translation);
	}
    }
    if(status_srcoll == true){
	
    }
    else if(!flag){
	Editor.current_action.add_new_transforms(Editor.selected_segments);
    }
    Editor.resize_offset = new Vector2(0, 0);
    //Editor.clear_selected_segments();
    for (var i = 0; i < Editor.segments.length; i++){
	Editor.segments[i].render();
    }
    Editor.clear_selected_segments();
    RenderManager.render();
}
//===== End =====

//===== All Funtions Gestures Pen Stroke =====
//<<<<< bat dau thuc hien net ve gestures fences, V, double
//<<<<< (E)
Gestures.ReadyBoxStroke = function(ges_stroke, status) {
    if (ges_stroke == true) {
	// build a new stroke object and save reference so we can add new points
	if (Editor.using_mobile){
	    if (status){
		if (Editor.mouse_position_second.x > 0 && Editor.mouse_position_second.y > 0){
		    Editor.current_stroke = new PenStroke(Editor.mouse_position_second.x, Editor.mouse_position_second.y, 6);
		    Editor.current_stroke.add_point(Editor.mouse_position_second);
		}
		else {
		    Editor.current_stroke = new PenStroke(Editor.mouse_position_first.x, Editor.mouse_position_first.y, 6);
		    Editor.current_stroke.add_point(Editor.mouse_position_first);
		}
	    }
	    else
		Editor.current_stroke = new PenStroke(Editor.mouse_position.x, Editor.mouse_position.y, 6);
	}
	else if (!Editor.using_mobile)
	    Editor.current_stroke = new PenStroke(Editor.mouse_position.x, Editor.mouse_position.y, 6);
	Editor.add_action(new ActionSegments(new Array(Editor.current_stroke), false,Editor.AddSegments));
	// add segment to managers (segments render automatically when added)
	Editor.add_segment(Editor.current_stroke);
    }
}

//<<<<< bat dau thu hien net ve stroke
//<<<<< (B)
Gestures.ReadyPenStroke = function(){
    Editor.current_stroke = new PenStroke(Editor.mouse_position.x, Editor.mouse_position.y, 6);
    Editor.add_action(new ActionSegments(new Array(Editor.current_stroke), true,Editor.AddSegments));
    // add segment to managers (segments render automatically when added)
    Editor.add_segment(Editor.current_stroke);
    Editor.current_stroke.add_point(Editor.mouse_position);
    Gestures.state = 3;
}

//<<<<< ket thuc qua trinh ve
Gestures.EndStroke = function(){
   /*g: Box is for Shape only so normal stroke will never have boxes
    var first_point = Editor.current_stroke.points[0];
    var last_point =  Editor.current_stroke.points[Editor.current_stroke.points.length - 1];
    var distance = Vector2.Distance(first_point, last_point);
    if (Gestures.SegmentState(Editor.current_stroke) != "" && Editor.fence
	&& distance < 10){
	Gestures.EndBoxStroke();
    }
    else */ 
    {
	Editor.clear_selected_segments();
	Gestures.EndPenStroke();
    }
}

//<<<<< ket thuc pen
Gestures.EndPenStroke = function()                                            {
   Editor.start_rect_selection = Editor.end_rect_selection = null;
   RenderManager.selection_box.style.visibility = "hidden";
   // cat bo do dai cua points cho ky tu dots
   if (Editor.current_stroke.points.length == 1 && Editor.check_pen == true) 
      Editor.current_stroke.add_point(Editor.mouse_position);

   if ((Editor.current_stroke.points.length >= 2 
   &&   Editor.current_stroke.points.length <= 8
   &&   PenStroke.isCheckpoint() == false)
	|| PenStroke.isCheckpoint() == undefined)
	   Editor.current_stroke.points.splice(2,Editor.current_stroke.points.length-2);

   if (Editor.current_stroke.finish_stroke(Editor.current_stroke.world_mins
   ,   Editor.current_stroke.scale))                                          {
      if (Gestures.IsSegmentsBelongDralf(Editor.current_stroke) == false)     {
         if (AutoGroup.count < 0) AutoGroup.count = 0;
         if (Editor.current_stroke.size.x <= Editor.dot_width
	      &&  Editor.current_stroke.size.y <= Editor.dot_width)                {
            Editor.current_stroke.symbol = "dots";

            Formula.Copy([Editor.current_stroke], ["dots"], [1]);
            var bBool = false;
            if(Editor.segments.length > 1)                                    {        
               var dotIndex = Editor.segments.length-1;
               bBool = AutoGroup.Groups(dotIndex, "dots");
               Editor.current_stroke.flag = false;
               Editor.segments[Editor.segments.length - 2].flag = false;      }
            
            if (!bBool)                                                       { 
               var tag = document.getElementsByTagName("g");
               RecognitionManager.removeRecognition(Editor.current_stroke.set_id);
               Editor.remove_segment(Editor.current_stroke);
               document.getElementById("svgId").removeChild(tag[tag.length - 1]);
               Editor.undo_stack.pop();
               Editor.action_list.pop();
               if(Editor.redo_stack_backup.length>0)                          {
                  if(Editor.redo_stack.length == 0)
                    Editor.redo_stack = Editor.redo_stack_backup.slice(0);
                  Editor.redo_stack_backup.length = 0;                        }}

         } else                                                               {
            Gestures.state = 3;
            AutoGroup.count++;
         
            AutoGroup.resetSetID4CollidedSegments(Editor.current_stroke);
            RecognitionManager.enqueueSegment(Editor.current_stroke);         }
      } else                                                                  {
         if (Editor.current_stroke.points.length == 2)                        {
            var tag = document.getElementsByTagName("g");
            Editor.remove_segment(Editor.current_stroke);
            document.getElementById("svgId").removeChild(tag[tag.length - 1]);
            Editor.undo_stack.pop();
            Editor.action_list.pop();
            if(Editor.redo_stack_backup.length>0)                             {
              if(Editor.redo_stack.length == 0)
                Editor.redo_stack = Editor.redo_stack_backup.slice(0);
              Editor.redo_stack_backup.length = 0;                            }}}
      } else Editor.segments.pop();

      Editor.current_stroke = null;
      Editor.current_action.buildSegmentXML();
}

//<<<<< ket thuc box
Gestures.EndBoxStroke = function(){
    if (Editor.fence == true && Editor.current_stroke != null) {
	if (Editor.current_stroke.points.length >= 10 && Editor.current_stroke.finish_stroke(Editor.current_stroke.world_mins, Editor.current_stroke.scale)) {
	    if (Gestures.IsSegmentsBelongDralf(Editor.current_stroke) == false) {
		Gestures.state = 1;
		Editor.current_stroke.Checkfinish_stroke(Editor.control_point_radius);
		RecognitionManager.enqueueSegment(Editor.current_stroke);
	    } else {
		//Editor.undo_stack.pop();
		if (Gestures.IsSegmentsBelongDralf(Editor.current_stroke)){
		    Editor.undo_stack[Editor.undo_stack.length - 1].status = true;
		    //console.log("in thu: " + Editor.undo_stack[Editor.undo_stack.length - 1].status);
		}
	    }
	} else {
	    Editor.segments.pop();
	    RenderManager.clear_canvas();
	    RenderManager.render();
	}
	Editor.current_stroke = null;
    }
}

//<<<<< kiem tra symbols de thuc hien gestures
//<<<<< (15)
Gestures.TouchEnd = function(segments, symbol, recog) {
    var zoom_out = 1 / 64;
    var zoom_in = -(1 / 64);
    
    // edit 100212
    if (Gestures.state == 3){
	// flatten min-max for dash (height)
	if (symbol == "-" || symbol == "_dash" || symbol == "frac") {
	    if (segments.worldMaxPosition().y - segments.worldMinPosition().y > 1
		&& segments.points.length >=4 && Editor.segments.contains(segments)) {
//g		var user_drawn_height = segments.worldMaxPosition().y - segments.worldMinPosition().y;
		var mins = segments.worldMinPosition();
		var maxs = segments.worldMaxPosition();
		mins.y = (mins.y + maxs.y)/2;
		segments.points.splice(1, segments.points.length - 2);
		segments.points.splice(0, 1, new Vector2(mins.x, mins.y));
		segments.points.splice(segments.points.length - 1, 1, new Vector2(maxs.x, mins.y));
		segments.world_mins = new Vector2(mins.x, mins.y);
		segments.world_maxs = new Vector2(maxs.x, mins.y);
		segments.size = Vector2.Subtract(segments.world_maxs, segments.world_mins);
		//var tag = document.getElementsByTagName("g");
		document.getElementById("svgId").removeChild(segments.element);
		segments.finish_stroke(segments.world_mins, segments.scale, "value");
	    }
	}
    }
    
    if (Gestures.state == 3 && segments.Checkfinish_stroke(Editor.control_point_radius)){
	Editor.segmentSplits[Gestures.indexParentSplit].childrenSplit.push(segments);
	Gestures.SaveSplit(segments, false, false);
	Editor.segmentSplits[Editor.segmentSplits.length - 1].parentIds = Editor.segmentSplits[Gestures.indexParentSplit].set_id;
	Gestures.indexParentSplit = -1;
    }
    if (Gestures.state == 0) {
	// gestures Zoom 1 finger
	var tag = document.getElementsByTagName("g");
	//tag[tag.length - 1].setAttribute("visibility", "hidden");
	Editor.remove_segment(segments);
	document.getElementById("svgId").removeChild(tag[tag.length - 1]);
	if (symbol == "_circle" || symbol == "_heart" || symbol == "_square" || symbol == "_trapezium") {
	    if (symbol == "_circle") {
		Gestures.fnZoom1Finger(Editor.zoom1, zoom_in);
	    } else if (symbol == "_heart" || symbol == "_square" || symbol == "_trapezium") {
		Gestures.fnZoom1Finger(Editor.zoom1, zoom_out);
	    }
	}

    } else if (Gestures.state == 1) {
	// gestures Fence
	if (Editor.shapeSymbols.indexOf(symbol)>-1) {
	   if(Gestures.SegmentState(segments) != ""){
	      Gestures.AlignAuto(segments, recog);
	      Gestures.ZoomFence(segments, false, 3);
	   }
	}
	// gestures Split
	else if (symbol == "V" || symbol == "v" || symbol == "^") {
	    Gestures.Split(segments, symbol);
	}
	// gestures Doudle
	else if (symbol == "_doudle" || symbol == "L"
		|| symbol == "l") {
	    var tag = document.getElementsByTagName("g");
	    Editor.remove_segment(segments);
	    document.getElementById("svgId").removeChild(tag[tag.length - 1]);
	    Editor.undo_stack.pop();
	    if (Gestures.isEnableDralf() == true) {
		Gestures.DeletesDralf();
		Gestures.showHidenDralf();
	    } else {
		Gestures.showHidenDralf();
	    }
	} else if (symbol == "_formula" || symbol == "f") {
	    var tag = document.getElementsByTagName("g");
	    Editor.remove_segment(segments);
	    document.getElementById("svgId").removeChild(tag[tag.length - 1]);
	    Editor.undo_stack.pop();
	    FormulaMenu.Show();
	}
	else if (symbol == "c" || symbol == "C"){
	    var tag = document.getElementsByTagName("g");
	    Editor.remove_segment(segments);
	    document.getElementById("svgId").removeChild(tag[tag.length - 1]);
	    Editor.undo_stack.pop();
	    if (CopyPasteSegments.listSegment.length > 0){
		CopyPasteSegments.flag = true;
	    }
	}
	else if (symbol == "p" || symbol == "P"){
	    var tag = document.getElementsByTagName("g");
	    Editor.remove_segment(segments);
	    var temp_center = Vector2.Add(segments.worldMinPosition(), segments.worldMaxPosition());
	    temp_center = new Vector2(temp_center.x / 2, temp_center.y / 2);
	    document.getElementById("svgId").removeChild(tag[tag.length - 1]);
	    Editor.undo_stack.pop();
	    CopyPasteSegments.Paste(temp_center);
	}
	else if (Editor.state != EditorState.SegmentsSelected && Editor.state != EditorState.MovingSegments){
	    Editor.clear_selected_segments();
	}
    }
}

//<<<<< kiem tra qua trinh ve de dua the g vao
Gestures.StrokeNotElementNS = function() {
    var state = true;
    if (Editor.state == EditorState.Zoom || Editor.state == EditorState.MultyRectangleSelecting) {
	state = false;
    }
    return state;
}
//===== End =====

//===== All Funtions Gestures-Touch 2 Fingers=====
Gestures.TouchId = new Array();

Gestures.touchid = function(intid, step){
    this.intid = intid;
    this.step = step;
}

//<<<<< thu hien 2 ngon tay
Gestures.MultiTouch = function() {
    xTouchHold.tick = -1;
    xTouchHold.stop();
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    delete Editor.arr_seg_select;
    Editor.arr_seg_select = new Array();
    if (Editor.change_step == false) {
	if (Editor.zoom2 == true && (Editor.state == EditorState.SegmentsSelected || Editor.state == EditorState.MovingSegments)) {
	   // Editor.add_action(new TransformSegments(Editor.selected_segments, true));
	    Editor.add_action(new HistorySegments(Editor.selected_segments, true,Editor.TransformSegments));
	    Editor.state = EditorState.Zoom;
	    Editor.resize_offset = new Vector2(0, 0);
	    Editor.original_bb = Editor.selected_bb.clone();
	    Gestures.count_trans = new Vector2(0, 0);
	    var node_trans = document.getElementById("gId");
	    
	    //RenderManager.unsetField(Editor.set_field);
	    //Editor.set_field = new Array();
	    //Editor.arr_seg_select = new Array();
	    
	    if (node_trans.childNodes.length == 0){
		Gestures.restoreNode();
		for (var i = 0; i < Editor.selected_segments.length; i++){
		    var seg = Editor.selected_segments[i];
		    Editor.arr_seg_select.push(seg.instance_id);
		    Gestures.copyNode(seg);
		}
	    }
	    /*for (var m = 0; m < RenderManager.segment_set_divs.length; m++) {
		var sss_div = RenderManager.segment_set_divs[m];
		sss_div.style.visibility = "hidden";
		sss_div.style.background = "none";
		sss_div.style.border = "1px solid green";
	    }*/
	} else {
	    Editor.start_rect_selection = Editor.mouse_position_first_prev.clone();
	    Editor.end_rect_selection = Editor.mouse_position_second_prev.clone();
	    Editor.state = EditorState.MultyRectangleSelecting;
	    if (Editor.select_s2 == false) Editor.start_rect_selection = Editor.end_rect_selection = null;
	}
	if (Editor.current_stroke != null) {
	    Editor.segments.pop();
	    RenderManager.clear_canvas();
	    Editor.current_stroke = null;
	}
    }
}
//===== End =====

//===== All Funtions Gestures Splits =====
//<<<<< kiem tra vung doudel
Gestures.isEnableDralf = function() {
    var id = null;
    var visibility = null;
    id = "#" + Gestures.dralf;
    visibility = $(id).css('visibility');
    if (visibility == "visible") {
	return true;
    } else {
	return false;
    }
}

//<<<<< an - hien vung doudle
Gestures.showHidenDralf = function() {
    var id = null;
    var visibility = null;
    var value = null;
    id = "#" + Gestures.dralf;
    visibility = $(id).css('visibility');
    value = visibility == "visible" ? "hidden" : "visible";
    document.getElementById(Gestures.btnResize).style.visibility = value;
    $(id).css({
	visibility: value
    });
    if (value == "visible") {
    var draft = document.getElementById(Gestures.dralf.toString());
    var btnResize = document.getElementById(Gestures.btnResize);
    var equation_canvas = document.getElementById("equation_canvas");
    var height_equation = equation_canvas.clientHeight;
    var width_equation = equation_canvas.clientWidth;
    var left = (draft.offsetLeft - Gestures.offsetDraft) * 100 / width_equation;
    var top = (draft.offsetHeight - Gestures.offsetDraft) * 100 / height_equation;
    btnResize.style.background = "red";
    btnResize.style.left = left + "%";
    btnResize.style.top = top + "%";
	btnResize.addEventListener("touchstart", function(e) {
	    Gestures.isResizeDraft = true;
	    if (e.type == "touchstart") {
		e.preventDefault();
		var btnResize = document.getElementById(Gestures.btnResize);
		btnResize.style.backgroundColor = "green";
		Gestures.draftStartX = e.targetTouches[0].pageX;
		Gestures.draftStartY = e.targetTouches[0].pageY;
	    }
	}, true);
	btnResize.addEventListener("mousedown", function(e) {
	    Gestures.isResizeDraft = true;
	    if (e.type == "mousedown") {
		e.preventDefault();
		var btnResize = document.getElementById(Gestures.btnResize);
		btnResize.style.backgroundColor = "green";
		Gestures.draftStartY = e.pageY;
		Gestures.draftStartX = e.pageX;
	    }
	}, true);
    } else {
	Gestures.onUp();
    }
}

//<<<<< nut resize vung doudle
Gestures.IsSegmentsBelongDralf = function(current_stroke) {
    var draft = null;
    var test = null;
    var ctx = null;
    var mins = null;
    var maxs = null;
    var btnResize = document.getElementById(Gestures.btnResize);
    btnResize.style.backgroundColor = "red";
    test = current_stroke;
    if (Gestures.isEnableDralf() == true && test != undefined) {
	draft = document.getElementById(Gestures.dralf.toString());
	ctx = draft.getContext("2d");
	mins = test.world_mins;
	maxs = test.world_maxs;

	if (mins.x > draft.offsetLeft && mins.y < draft.offsetHeight) {
	    var instance_id = current_stroke.instance_id;
	    current_stroke.isDraff = true;
	    if (Gestures.DralfIds.indexOf(instance_id) == -1) Gestures.DralfIds.push(current_stroke.instance_id);
	    return true;
	} else {
	    ////console.log("Khong thuoc");
	    return false;
	}
    } else {
	return false;
    }
}

Gestures.onMove = function(e) {
    var currentX = null;
    var currentY = null;

    if (e.type == "mousemove") {
	Gestures.draftCurrX = e.pageX;
	Gestures.draftCurrY = e.pageY;
    } else if (e.type == "touchmove") {
	Gestures.draftCurrX = e.targetTouches[0].pageX;
	Gestures.draftCurrY = e.targetTouches[0].pageY;
    } else
    return;

    Gestures.ResizeDraft(Gestures.draftStartX, Gestures.draftStartY, Gestures.draftCurrX, Gestures.draftCurrY);
}

Gestures.ResizeDraft = function(startX, startY, currentX, currentY) {
    var draft = document.getElementById(Gestures.dralf);
    var newHeight = draft.clientHeight + (currentY - startY);
    var btnResize = document.getElementById(Gestures.btnResize);
    var equation_canvas = document.getElementById("equation_canvas");
    var newWidth = draft.clientWidth - (currentX - startX);
    var height_equation = equation_canvas.clientHeight;
    var width_equation = equation_canvas.clientWidth;
    if (height_equation - 10 < newHeight) {
	newHeight = height_equation - 10;
    }

    if (width_equation - 10 < newWidth) {
	newWidth = width_equation - 10;
    }
    btnResize.style.display = "block";
    btnResize.style.background = "red";
    btnResize.style.backgroundColor = "green";
    var left = (draft.offsetLeft - Gestures.offsetDraft) * 100 / width_equation;
    var top = (draft.offsetHeight - Gestures.offsetDraft) * 100 / height_equation;
    btnResize.style.left = left + "%";
    btnResize.style.top = top + "%";
    draft.style.width = newWidth * 100 / width_equation + "%";
    draft.style.height = newHeight * 100 / height_equation + "%";
    Gestures.draftStartX = Gestures.draftCurrX;
    Gestures.draftStartY = Gestures.draftCurrY;
}

Gestures.onUp = function() {
    var btnResize = document.getElementById(Gestures.btnResize);
    btnResize.style.backgroundColor = "red";
    Gestures.isResizeDraft = false;
    Gestures.draftStartX = null;
    Gestures.draftStartY = null;
    Gestures.draftCurrX = null;
    Gestures.draftCurrY = null;
    Gestures.ResizeDraft(Gestures.draftStartX, Gestures.draftStartY, Gestures.draftCurrX, Gestures.draftCurrY);
}

//delete tung  phan tu trong vung nhap
Gestures.ManualDeletesDralf = function(segments_selected) {

    var flag = false;
    if (Gestures.isEnableDralf() == true) {
	for (var i = 0; i < segments_selected.length; i++) {
	    var instance = segments_selected[i].instance_id;
	    var index2 = Gestures.DralfIds.indexOf(instance);
	    if (index2 != -1) {
		flag = true;
		Gestures.DralfIds.splice(index2, 1);
	    }
	}
	if (Gestures.DralfIds.length == 0 && flag == true) {
	    Gestures.showHidenDralf();
	}
    }
}

Gestures.DeletesDralf = function() {
    for (var i = 0; i < Editor.segments.length; i++) {
	var instance = parseInt(Editor.segments[i].instance_id);
	for (var j = 0; j < Gestures.DralfIds.length; j++) {
	    var instance2 = parseInt(Gestures.DralfIds[j]);
	    if (instance2 == instance) {
		var position = Gestures.DralfIds.indexOf(instance2);
		Editor.add_selected_segment(Editor.segments[i], Editor.selected_segments);
		Gestures.DralfIds.splice(position, 1);
	    }
	}
    }
    var action = new ActionSegments(Editor.selected_segments, true,Editor.DeleteSegments);
    action.Apply();
    Editor.add_action(action);
    Editor.clear_selected_segments();
    if (Editor.selection_method == "Rectangle") {
	Editor.state = EditorState.ReadyToRectangleSelect;
    }
    //else if (Editor.selection_method == "Stroke") {
	//Editor.state = EditorState.ReadyToStrokeSelect;
    //}
    RenderManager.render();
    Editor.undo_stack.pop();
}
//===== End =====

//===== All Funtions Gestures Zoom=====
//Gestures.check_count_zoom = 0;
Gestures.fnZoom1Finger = function(flag, constant) {
    if (flag == true) {
	//Editor.add_action(new TransformSegments(Editor.selected_segments, true));
	Editor.add_action(new HistorySegments(Editor.selected_segments, true,Editor.TransformSegments));
	Editor.resize_offset = new Vector2(0, 0);
	Editor.original_bb = Editor.selected_bb.clone();
	var bb = Editor.original_bb;
	var offset = new Vector2(bb.maxs.x * constant, bb.maxs.y * constant);
	var anchor;
	offset.y *= 1.0;
	anchor = new Vector2((bb.maxs.x + bb.mins.x) / 2, (bb.maxs.y + bb.mins.y) / 2);
	Editor.resize_offset.Add(offset);
	var bb_size = Vector2.Subtract(bb.maxs, bb.mins);
	var scale = new Vector2((Editor.resize_offset.x / bb_size.x) + 1.0, (Editor.resize_offset.y / bb_size.y) + 1.0);
	if ((isNaN(scale.x) || isNaN(scale.y)) == false && (scale.x == 0.0 || scale.y == 0) == false) {
	    for (var k = 0; k < Editor.selected_segments.length; k++)
	    Editor.selected_segments[k].resize(anchor, scale);
	    Editor.update_selected_bb();
	    for (var k = 0; k < Editor.selected_segments.length; k++)
	    Editor.selected_segments[k].freeze_transform();
	    Editor.current_action.add_new_transforms(Editor.selected_segments);
	    Editor.resize_offset = new Vector2(0, 0);
	    RenderManager.render();
	}
    }
}

Gestures.fnZoom = function(first, first_prev, second, second_prev, state, flag) {
    if (flag == true) {
	/*Gestures.check_count_zoom++;
	if (Gestures.check_count_zoom == 10) {
	    var bounding = document.getElementById("bounding_box");
	    bounding.style.background = "GhostWhite";
	    bounding.style.border = "1px dashed #333333";
	}*/
	var offsetFirst = Vector2.Subtract(first, first_prev);
	var offsetSecond = Vector2.Subtract(second, second_prev);
	var bb = Editor.original_bb;
	var anchor;
	if (state == true) { //neu bang true la su kien zoom 2 ngon
	    if (Editor.tempx == 2) {
		offsetFirst.x *= -1;
	    } else {
		offsetSecond.x *= -1;
	    }
	    if (Editor.tempy == 2) {
		offsetFirst.y *= -1;
	    } else {
		offsetSecond.y *= -1;
	    }
	} else
	offsetFirst.y *= -1;
	anchor = new Vector2((bb.maxs.x + bb.mins.x) / 2, (bb.maxs.y + bb.mins.y) / 2);
	var bb_size = Vector2.Subtract(bb.maxs, bb.mins);
	if ((Editor.selected_bb.sizeBox().x > 7.5 && Editor.selected_bb.sizeBox().y > 7.5)){
	    Editor.resize_offset.Add(offsetFirst);
	    Editor.resize_offset.Add(offsetSecond);
	}
	else {
	    if (offsetFirst.x >= 0 && offsetFirst.y >= 0) {
		Editor.resize_offset.Add(offsetFirst);
	    }
	    if (offsetSecond.x >= 0 && offsetSecond.y >= 0) {
		Editor.resize_offset.Add(offsetSecond);
	    }
	}
	var rate = (Editor.resize_offset.x / bb_size.x + Editor.resize_offset.y / bb_size.y)/2
	var scale = new Vector2((rate) + 1.0, (rate) + 1.0);
	Gestures.scale_offset.Add(scale);
	//Editor.check_rectangle = true;
	if ((isNaN(Gestures.scale_offset.x) || isNaN(Gestures.scale_offset.y)) == false && (Gestures.scale_offset.x == 0.0 || Gestures.scale_offset.y == 0) == false) {
	    for (var k = 0; k < Editor.selected_segments.length; k++) {
		Editor.selected_segments[k].resize(anchor, Gestures.scale_offset);
	    }
	    Editor.update_selected_bb();
	    var node_trans = document.getElementById("gId");
	    var temp_scale = new Vector2(Gestures.scale_offset.x, Gestures.scale_offset.y);
	    Gestures.count_trans = Vector2.Subtract(anchor, Vector2.Pointwise(anchor, Gestures.scale_offset));
	    var sb = new StringBuilder();
	    sb.append("translate(").append(Gestures.count_trans.x).append(',').append(Gestures.count_trans.y).append(") ");
	    sb.append("scale(").append(temp_scale.x).append(',').append(temp_scale.y).append(") ");
	    node_trans.setAttribute("transform", sb.toString());
	    node_trans.setAttribute("style", "fill:none;stroke-linecap:round;");	    
	    RenderManager.render();
	}
	Gestures.scale_offset = new Vector2(0, 0);
    }
}

Gestures.fnEndZoom = function() {
    for (var k = 0; k < Editor.selected_segments.length; k++)
    Editor.selected_segments[k].freeze_transform();
    Editor.current_action.add_new_transforms(Editor.selected_segments);
    RenderManager.render();
    Editor.resize_offset = new Vector2(0, 0);
}
//===== End =====

//===== All Funtions Gestures Special=====
Gestures.check_count_move = 0;
Gestures.count_trans = new Vector2(0, 0);

//<<<<< kiem tra segments khi mousedown
Gestures.isClick = function(seg, click)                                       {
RenderManager.unsetField(Editor.set_field);
delete Editor.set_field;
Editor.set_field = new Array();
delete Editor.arr_seg_select;
Editor.arr_seg_select = new Array();
for (var k = 0; k < seg.length; k++) {
   if (seg[k].set_id == click.set_id)                                         {
      Editor.add_selected_segment(seg[k], Editor.selected_segments);
      Editor.arr_seg_select.push(seg[k].instance_id);
      Gestures.copyNode(seg[k]);                                              }
	else seg[k].render();

	if (!Gestures.isBlockSegment(seg[k], 0)) {
	    Editor.selected_segments_transform.push(seg[k]);
	} else {
	    Editor.selected_segments_not_transform.push(seg[k])                   }}
}

//<<<<< di chuyen transform the group (g)
Gestures.transFormMove = function(trans){
    var node_trans = document.getElementById("gId");
    var trans_x = Gestures.count_trans.x;
    var trans_y = Gestures.count_trans.y;
    trans_x += trans.x;
    trans_y += trans.y;
    Gestures.count_trans = new Vector2(trans_x, trans_y);
    var sb = new StringBuilder();
    sb.append("translate(").append(Gestures.count_trans.x).append(',').append(Gestures.count_trans.y).append(") ");
    sb.append("scale(").append(1).append(',').append(1).append(") ");
    node_trans.setAttribute("transform", sb.toString());
    node_trans.setAttribute("style", "fill:none;stroke-linecap:round;");
}

//<<<<< copy the g cua moi stroke duoc chon vao the group (g)
Gestures.copyNode = function(seg) {
    var node_des = document.getElementById("gId");
    var node_source = document.getElementById("svgId");
    seg.render_selected();
    var old_node = seg.element;
    var new_node = old_node.cloneNode(true);
    node_des.appendChild(new_node);
    seg.element.style.visibility = "hidden";
}

//<<<<< khoi phuc lai the g cua moi stroke duoc copy vao the group(g)
Gestures.restoreNode = function(){
    var setid = -1;
    var all_same_setid = true;
    var node_des = document.getElementById("svgId");
    var node_trans = document.getElementById("gId");
    if (node_trans == null)
	return;
    $("#gId").empty();
    Gestures.count_trans = new Vector2(0, 0);
    var sb = new StringBuilder();
    sb.append("translate(").append(0).append(',').append(0).append(") ");
    sb.append("scale(").append(1).append(',').append(1).append(") ");
    node_trans.setAttribute("transform", sb.toString());
    node_trans.setAttribute("style", "fill:none;stroke-linecap:round;");
    for (var k = 0; k < Editor.segments.length; k++) {
	var seg = Editor.segments[k];
	if (Editor.segment_selected(seg, Editor.selected_segments)) {
	    if (setid == -1) {
		setid = seg.set_id;
	    } else if (seg.set_id != setid) {
		all_same_setid = false;
	    }
	    seg.render_selected();
	    seg.element.style.visibility = "visible";
	} else {
	    if (Substitute.segments_first.length == 0)
		seg.render();
	}
    }
}

Gestures.selectActive = function(click_result) {
//	debugger;
    //Editor.check_rectangle = true;
    Gestures.ReadyBoxStroke(Editor.zoom1, false);
    //Gestures.state = 0;
    var segment = click_result.pop();
    delete Editor.selected_segments_transform;
    Editor.selected_segments_transform = new Array();
    delete Editor.selected_segments_not_transform;
    Editor.selected_segments_not_transform = new Array();
    Gestures.isClick(Editor.segments, segment);
    Editor.state = EditorState.SegmentsSelected;
    Editor.add_action(new HistorySegments(Editor.selected_segments_transform, true, Editor.TransformSegments));
}

//<<<<< select_s1
Gestures.SelectSingle = function() {
    Gestures.check_count_move = 0;
    Editor.drag = false;
    //Editor.crosshair = false;
    
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    delete Editor.arr_seg_select;
    Editor.arr_seg_select = new Array();
    
	//<<<<< (2a)
	if (Editor.selected_bb.point_collides(Editor.mouse_position)) {
	    //Editor.check_rectangle = true;
	    Gestures.ReadyBoxStroke(Editor.zoom1, false);
	    delete Editor.selected_segments_transform;
	    Editor.selected_segments_transform = new Array();
	    delete Editor.selected_segments_not_transform;
	    Editor.selected_segments_not_transform = new Array();
	    for (var k = 0; k < Editor.segments.length; k++) {
		//if (!Gestures.isBlockSegment(Editor.segments[k]) && !Gestures.IsSegmentsBelongDralf(Editor.segments[k])) {
		if (!Gestures.isBlockSegment(Editor.segments[k], 0)) {
		    Editor.selected_segments_transform.push(Editor.segments[k]);
		} else {
		    Editor.selected_segments_not_transform.push(Editor.segments[k])
		}
	    }
	    for (var k = 0; k < Editor.selected_segments.length; k++) {
		Editor.arr_seg_select.push(Editor.selected_segments[k].instance_id);
		Gestures.copyNode(Editor.selected_segments[k]);
	    }
	    Editor.add_action(new HistorySegments(Editor.selected_segments_transform, true,Editor.TransformSegments));	    
	    Editor.state = EditorState.MovingSegments;
	    RenderManager.render();
	}
	// reselect
	else {
	    Editor.clear_selected_segments();
	    var click_result1 = CollisionManager.get_point_collides(Editor.mouse_position);
	    var click_result2 = CollisionManager.get_point_collides_bb(Editor.mouse_position);
	    var click_result3 = CollisionManager.getDash();
	    // select single segment
	    //<<<<< (3)
	    if (click_result1.length > 0){// && click_result2.length > 0) {
		Gestures.selectActive(click_result1);
	    }
	    //else if (click_result3.length > 0){
		//Gestures.selectActive(click_result3);
	    //}
	    else {
		//<<<<< (B)
		Gestures.ReadyPenStroke();
		//Editor.check_rectangle = true;
		//if (Editor.selection_method == "Stroke") {
		    //Editor.previous_stroke_position = Editor.mouse_position.clone();
		    //Editor.state = EditorState.StrokeSelecting;
		//} else {
		    if (Editor.using_mobile) {
			Editor.start_rect_selection = Editor.end_rect_selection = null;
		    }
		    Editor.state = EditorState.RectangleSelecting;
		    
                    //sn start
                    xTouchHold.tick = -1;
                    xTouchHold.start(); 
		    // preS: TouchHold.tick = -1;
		    // preS: TouchHold.start();
                    //sn end
		//}
		
		//Editor.button_states[Buttons.Group].setEnabled(false);
		//Editor.button_states[Buttons.Label].setEnabled(false);
	    }
	    RenderManager.render();
	}
    Fractions.CreateGroup();
    Space.printf();
}

//<<<<< select move
Gestures.SelectDrag = function() {
    RenderManager.bounding_box.style.background = "GhostWhite";
    RenderManager.bounding_box.style.border = "1px dashed #333333";
    Editor.status_moveSub = false;
    Gestures.check_count_move++;
    if (Gestures.check_count_move >= 3) Editor.drag = true;
    else
    Editor.drag = false;
    if (Editor.state == EditorState.SegmentsSelected) {
	Editor.state = EditorState.MovingSegments;
    } else if (Editor.state == EditorState.MovingSegments) {
	/*if (Gestures.check_count_move <= 3){
	    for (var m = 0; m < RenderManager.segment_set_divs.length; m++) {
		var sss_div = RenderManager.segment_set_divs[m];
		sss_div.style.visibility = "hidden";
		sss_div.style.background = "none";
		sss_div.style.border = "1px solid green";
	    }
	}*/
	var translation = Vector2.Subtract(Editor.mouse_position, Editor.mouse_position_prev);
	//Editor.check_rectangle = true;
	if (Editor.zoom1 == true && Gestures.IsSegmentsBelongDralf(Editor.current_stroke) == false) {
	    Editor.current_stroke.add_point(Editor.mouse_position);
	}
	for (var k = 0; k < Editor.selected_segments.length; k++) {
	    Editor.selected_segments[k].translate(translation);
	    // add list instance_id
	    //Editor.arr_seg_select.push(Editor.selected_segments[k].instance_id);
	    var seg = Editor.selected_segments[k];
	    var obj = document.getElementById(String(seg.set_id));
	    if (obj != null) {
		var top = parseInt(String(obj.style.top).replace("px", "")) + translation.y;
		var left = parseInt(String(obj.style.left).replace("px", "")) + translation.x;
		obj.style.top = top + "px";
		obj.style.left = left + "px";
		Gestures.moveChildrenSplit(seg.set_id, translation);
	    }
	}
	Editor.selected_bb.translate(translation);
	Gestures.transFormMove(translation);
	RenderManager.render();
	
	var center = Editor.selected_bb.getCenterBox();
	MagnifyingGlass.current_side_stroke = new MagnifyingGlass(Editor.segments, Editor.selected_segments, center[0], center[1], center[2]);
	MagnifyingGlass.current_side_stroke.renderSideStroke();
    }
    if (Gestures.deletes()){
	RenderManager.bounding_box.style.background = "tomato";	
	recyclebin.style.opacity = 0.5;
    }
    else {
	RenderManager.bounding_box.style.background = "GhostWhite";
	recyclebin.style.opacity = 1;
    }
}

Gestures.DragMouseup = function() {
    Editor.status_moveSub = false;
    /*if (Editor.selected_segments.length == 0 || !Editor.drag || !Editor.crosshair) {
	RenderManager.render();
	return;
    }
    Editor.crosshair = false;*/
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var min = bb.mins;
    var max = bb.maxs;
    var t = (max.y - min.y) / 2;
    var translation = new Vector2(0, Editor.dragHeight - 30 - t);
    for (var k = 0; k < Editor.selected_segments.length; k++) {
	Editor.selected_segments[k].translate(translation);
	// add list instance_id
	//Editor.arr_seg_select.push(Editor.selected_segments[k].instance_id);
	//var seg = Editor.selected_segments[k];
    }
    Editor.selected_bb.translate(translation);
    RenderManager.render();
    Editor.drag = false;
}

//<<<<< kiem tra qua trinh select_s2
//<<<<< (D)
Gestures.Select_multi = function(position) {
    var click_result = CollisionManager.get_point_collides_bb(position);
    if (click_result.length > 0 && !Editor.change_step) {
	// nothing selected at the moment, add all below mouse click to selected
	// add the last guy in the list (probably most recently added) to selected set	    
	//RenderManager.bounding_box.style.background = "none";
	//RenderManager.bounding_box.style.border = "none";
	//Editor.check_rectangle = true;
	var segment = click_result.pop();
	for (var k = 0; k < Editor.segments.length; k++) {
	    if (Editor.segments[k].set_id == segment.set_id) {
		Editor.add_selected_segment(Editor.segments[k], Editor.selected_segments);
		Gestures.copyNode(Editor.segments[k]);
	    }
	}
	delete Editor.arr_seg_select;
	Editor.arr_seg_select = new Array();
	for (var k = 0; k < Editor.selected_segments.length; k++) {
	    // add list instance_id
	    Editor.arr_seg_select.push(Editor.selected_segments[k].instance_id);
	}
	return true;
    }
    return false;
}

Gestures.SelectMulti_s3 = function() {
    if (Editor.select_s3 == true) {
	var bBool1 = Gestures.Select_multi(Editor.mouse_position_first);
	var bBool2 = Gestures.Select_multi(Editor.mouse_position_second);
	if (bBool1 || bBool2) {
	    Editor.add_action(new HistorySegments(Editor.selected_segments, true, Editor.TransformSegments));
	    if (Editor.zoom2 == true) {
		Editor.state = EditorState.Zoom;
		Editor.resize_offset = new Vector2(0, 0);
		Editor.original_bb = Editor.selected_bb.clone();
	    } else {
		/*for (var m = 0; m < RenderManager.segment_set_divs.length; m++) {
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
		}*/
		Editor.state = EditorState.SegmentsSelected;
	    }
	    Editor.start_rect_selection = Editor.end_rect_selection = null;
	}
	RenderManager.render();
    }
}

Gestures.SelectMulti_s2 = function(mouse_s, mouse_e) {
    if (Editor.select_s2 == true) {
	//Editor.check_rectangle = true;
	Editor.start_rect_selection.Add(mouse_s);
	Editor.end_rect_selection.Add(mouse_e);
	// get list of segments colliding with selection rectangle
	var rect_selected = CollisionManager.get_rectangle_collides(Editor.start_rect_selection, Editor.end_rect_selection);
	Editor.clear_selected_segments();
	// add segment set to seleced list
	delete Editor.arr_seg_select;
	Editor.arr_seg_select = new Array();
	for (var k = 0; k < rect_selected.length; k++) {
	    var segment_set = Editor.get_segment_by_id(rect_selected[k].set_id);
	    for (var j = 0; j < segment_set.length; j++) {
		Editor.add_selected_segment(segment_set[j], Editor.selected_segments);
		// add list instance_id
		Editor.arr_seg_select.push(segment_set[j].instance_id);
	    }
	}
	if (rect_selected.length > 0) {
	    RenderManager.bounding_box.style.background = "GhostWhite";
	    RenderManager.bounding_box.style.border = "1px dashed #333333";
	    
	    //Editor.button_states[Buttons.Group].setEnabled(true);
	    //Editor.button_states[Buttons.Label].setEnabled(true);
	} else {
	    
	    //Editor.button_states[Buttons.Group].setEnabled(false);
	    //Editor.button_states[Buttons.Label].setEnabled(false);
	}
	RenderManager.render();
    }
}
//===== End =====

//===== All Funtions Gestures for Mouse=====
Gestures.SelectMouse_s2 = function() {
    // see what we stroked through between move events
    var stroke_result = CollisionManager.get_line_collides(Editor.mouse_position_prev, Editor.mouse_position);
    // for each segment in result add to selected segments set (if they aren't there already)
    if (stroke_result.length > 0) {
	
	//Editor.button_states[Buttons.Group].setEnabled(true);
	//Editor.button_states[Buttons.Label].setEnabled(true);
	//var initial_length = Editor.selected_segments.length;
	while (stroke_result.length > 0) {
	    var segment = stroke_result.pop();
	    Editor.add_selected_segment(segment, Editor.selected_segments);
	}
    }
    Editor.previous_stroke_position = Editor.mouse_position_prev.clone();
    RenderManager.render();
}

Gestures.SelectMouse_s3 = function(mouse_delta) {
    if (Editor.using_mobile == false) {
	Editor.end_rect_selection.Add(mouse_delta);
	// get list of segments colliding with selection rectangle
	var rect_selected = CollisionManager.get_rectangle_collides(Editor.start_rect_selection, Editor.end_rect_selection);
	Editor.clear_selected_segments();
	// add segment set to seleced list
	for (var k = 0; k < rect_selected.length; k++) {
	    var segment_set = Editor.get_segment_by_id(rect_selected[k].set_id);
	    for (var j = 0; j < segment_set.length; j++) {
		Editor.add_selected_segment(segment_set[j], Editor.selected_segments);
		// add list instance_id
		Editor.arr_seg_select.push(segment_set[j].instance_id);
	    }
	}
	if (rect_selected.length > 0) {
	    
	    //Editor.button_states[Buttons.Group].setEnabled(true);
	    //Editor.button_states[Buttons.Label].setEnabled(true);
	} else {
	    
	    //Editor.button_states[Buttons.Group].setEnabled(false);
	    //Editor.button_states[Buttons.Label].setEnabled(false);
	}
    } else {
	Editor.start_rect_selection = Editor.end_rect_selection = null;
	if (Editor.fence == true) {
	    Editor.current_stroke.add_point(Editor.mouse_position);
	}
    }
    RenderManager.render();
}

//===== End =====
