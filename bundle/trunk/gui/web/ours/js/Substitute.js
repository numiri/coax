function Substitute(){
    this.groups = new Array();    
}

Substitute.prototype = {
    Add : function(group) {
	if (this.groups.contains(group)) return;
	this.groups.push(group);
    },

    AddList : function(groups) {
	for (var k = 0; k < groups.length; k++) {
	    this.Add(groups[k]);
	}
    },
};

function Substitute (){

}

Substitute.symbols = new Array("y","y_lower","b","b_lower");
Substitute.initialize = function(){
    // Positions
    Substitute.mouse_position_third_prev = new Vector2(-1, -1);
    Substitute.mouse_position_third = new Vector2(-1, -1);
    Substitute.mouse_position_fourth_prev = new Vector2(-1, -1);
    Substitute.mouse_position_fourth = new Vector2(-1, -1);
    // Save Segments
    Substitute.segments_first = new Array();
    Substitute.segments_second = new Array();
    // Node div
    Substitute.selection_rec = document.getElementById("selection_sub");
    Substitute.selection_rec.style.visibility = "hidden";
    
    Substitute.bounding_1 = document.getElementById("bounding_sub1");
    Substitute.bounding_1.style.visibility = "hidden";
    
    Substitute.bounding_2 = document.getElementById("bounding_sub2");
    Substitute.bounding_2.style.visibility = "hidden";
    
    // Segments
    Substitute.selected = false;
    Substitute.original_bb = null;
    Substitute.Expression = new Array();//luu bieu thuc gom cac nhom
    Substitute.Groups = new Array();//luu chu cac segments de thay the
    Substitute.copySegments = new Array();
}
//ham kiem tra 2 chuoi co bang nhau hay khong
Substitute.strcmp = function(str1,str2){
    if(str1 == str2)
	return true;
    return false;
}
//ham so sanh 2 danh segment co bang nhau khong
Substitute.Comparison = function(seg1,seg2){
    if(seg1.length == seg2.length){
	for(var k = 0;k< seg1.length;k++){
	    if(seg1[k].set_id != seg2[k].set_id)
		return false;
	}
	return true;
    }    
    return false;
}
Substitute.IndexGroupsReplace = function(segs){
    var index = -1;
    for(var k = 0;k < Substitute.Groups.length;k++){	
	var group = Substitute.Groups[k];
	if(Substitute.Comparison(group.segments,segs))
	    return k;
    }
    return index;
}

Substitute.isExitsGroup = function(groups,in_seg){
    for(var k = 0;k < groups.length;k++){    
	var group = groups[k];
	if(group.segments.contains(in_seg))
	    return true;
    }
    return false;
}

Substitute.isExitsSource = function(source,in_seg){
    for(var k = 0;k < source.length;k++){    	
	if(source[k].set_id == in_seg.set_id)
	    return true;
    }
    return false;
}

Substitute.Zoomy = function(in_segmens){
    var g = new Group();
    for(var k = 0;k < in_segmens.length; k++){
	var seg = in_segmens[k];
	console.log("substitute symbol : " + seg.symbol);
	if(Substitute.symbols.contains(seg.symbol)){
	    g.Add(seg);
	}
    }
    if(g.segments.length == 0)
	return;
    var height = g.maxY() - g.minY();
    var sizeY = 3.5 * height / 10 ;
    var avg = sizeY + height;
    var scale = height / avg;
    var offset = new Vector2(3 , 0);    
    Gestures.ZoomFence(g.segments, true, scale);
    Space.fnZoom(g.segments,offset,0);
}

Substitute.Zoom = function(segments, scale) {
    var min, max, size;
    Editor.clear_selected_segments();
    for (var i = 0; i < segments.length; i++) {
	Editor.add_selected_segment(segments[i], Editor.selected_segments);
    }
    Editor.resize_offset = new Vector2(0,0);
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    //anchor = new Vector2((bb.maxs.x + bb.mins.x) / 2, (bb.maxs.y + bb.mins.y) / 2);
    anchor = bb.mins;
    for (var k = 0; k < Editor.selected_segments.length; k++)
	Editor.selected_segments[k].resize(anchor, scale);
    Editor.update_selected_bb();
    for (var k = 0; k < Editor.selected_segments.length; k++){
	Editor.selected_segments[k].freeze_transform();
    }
    Editor.resize_offset = new Vector2(0, 0);
    for (var i = 0; i < Editor.segments.length; i++){
	Editor.segments[i].render();
    }
    min = Editor.selected_bb.mins;
    max = Editor.selected_bb.maxs;
    size = Editor.selected_bb.sizeBox();
    Editor.clear_selected_segments();
    RenderManager.render();
    return [min, max, size];
}

Substitute.saveListOut = function(segments, pos_out_y){
    return [segments, pos_out_y];
}

Substitute.saveCopySegments = function(source,dest){
    Substitute.Groups = Fractions.SortGroup(Substitute.Groups);
    Substitute.SetPosition();
    
    var index = Substitute.IndexGroupsReplace(dest);
    var g = new Group();        
    for(var k =0;k < source.length;k++){
	g.Add(source[k]);	
    }
    
    var groupsCopy = new Group();
    var pos_min_source = g.minPosition();
    var pos_max_source = g.maxPosition();
    var groupsDelete = new Group();
    var pos_min_desc;
    var pos_max_desc;
    
    var sqrt = new Array();
    var frac = new Array();
    var trans_list_group;
    var list_out_y = new Array();
    
    var size_source = Editor.selected_bb.sizeBox();
    var size_desc = new Vector2(0, 0);
    var rate = new Vector2(0, 0);
    var transform = new Vector2(0, 0);
    var obj_desc;
    var temp_list = new Array();
    
    for(var k = 0;k < Substitute.Groups.length;k++){
	groupsDelete.AddList(Substitute.Groups[k].segments);
	if(k == index){
	    pos_min_desc = Substitute.Groups[k].minPosition();
	    pos_max_desc = Substitute.Groups[k].maxPosition();	    
	    //continue;
	}
	
	var mins = Substitute.Groups[k].minPosition();
	var maxs = Substitute.Groups[k].maxPosition();
	var trans = Vector2.Subtract(mins,pos_min_source);
	var groups = CopyPasteSegments.saveListGroup(source,trans,false);
	var copy = new Group();
	
	//xet nhung segments dang sau segment can thay the
	sqrt = new Array();
	frac = new Array();
	trans_list_group = new Group();
	list_out_y = new Array();

	for (var l = 0; l < Editor.segments.length; l++) {
	    var seg = Editor.segments[l];
	    if (Substitute.isExitsSource(source, seg)) {
		continue;
	    }

	    if (!trans_list_group.segments.contains(seg)){
		if(mins.x < seg.worldMinPosition().x && maxs.y > seg.worldMinPosition().y
		    && mins.y < seg.worldMaxPosition().y){
		    trans_list_group.Add(seg);
		}
		else if (seg.symbol == "_dash" || seg.symbol == "-"){
		    if (mins.x < seg.worldMinPosition().x && maxs.y > seg.worldMinPosition().y - 25
			&& mins.y < seg.worldMaxPosition().y - 25) {
			trans_list_group.Add(seg);
		    }
		}
		else {
		    temp_list = new Array();
		    for (var n = 0; n < trans_list_group.segments.length; n++){
			if (seg.set_id == trans_list_group.segments[n].set_id){
			    temp_list.push(seg);
			}
		    }
		    for (var n = 0; n < temp_list.length; n++){
			trans_list_group.Add(temp_list[n]);
		    }
		}
	    }
	    if(seg.symbol == "sqrt"){
		if(Space.isCheckSqrt(seg,mins,maxs) && !sqrt.contains(seg)){
		    sqrt.push(seg);
		}
	    }
	    if(seg.symbol == "frac"){
		var t = Space.isExistsFrac(seg,mins,maxs);
		if(t !=0 && !frac.contains(seg)){
		    frac.push(seg);
		}
	    }
	    if (!list_out_y.contains(seg)){
		if(seg.worldMinPosition().y < mins.y && seg.worldMinPosition().y < maxs.y
		   && seg.worldMaxPosition().y > mins.y && seg.worldMaxPosition().y < maxs.y
		   && (seg.worldMaxPosition().y - seg.worldMinPosition().y) > (maxs.y - mins.y)){
		    var obj = Substitute.saveListOut(seg, maxs.y - seg.worldMaxPosition().y);
		    list_out_y.push(obj);
		}
	    }
	}
	
	for(var i = 0;i< groups.length; i++){	    
	    var arrSegments = new Array();
	    arrSegments = CopyPasteSegments.Copy(groups[i].segments);
	    copy.AddList(arrSegments);
	    groupsCopy.AddList(arrSegments);
	}
	
	size_desc = Vector2.Subtract(Substitute.Groups[k].maxPosition(), Substitute.Groups[k].minPosition());
	rate = new Vector2(size_source.x / size_desc.x, size_source.y / size_desc.y);
	obj_desc = Substitute.Zoom(copy.segments, new Vector2((1/rate.x + 1/rate.y)/2, 1 / rate.y));
	transform = new Vector2(obj_desc[2].x - size_desc.x, 0);
	
	if (trans_list_group.segments.length > 0) {
	    Space.render(trans_list_group.segments, transform);
	}
	if(sqrt.length > 0){
	    Space.fnZoom(sqrt, transform, 0);
	}
	if(frac.length > 0){
	    Space.fnZoom(frac, transform ,0);
	}
	for(var h = 0; h < list_out_y.length; h++){
	    if (list_out_y[h][1] <= 10){
		list_out_y[h][0].translate(new Vector2(0, list_out_y[h][1]));
		list_out_y[h][0].render();
	    }
	}
	if (k == Substitute.Groups.length - 1){
	    groupsDelete.AddList(source);
	}
    }
    var actionDelete = Substitute.Deletes(groupsDelete.segments);
    var isCheckSub = false;
    Editor.current_action.add_new_transforms(Editor.selected_segments_transform);
    if (groupsCopy.segments.length > 0) {	
	var action = new ActionSegments(groupsCopy.segments, false , Editor.CopySegments);
	action.Apply();
	Editor.add_action(action);
    }
    Editor.add_action(actionDelete);    
    Substitute.initialize();    
    Editor.clear_selected_segments();    
    //Editor.arr_seg_select = new Array();
    //Editor.check_rectangle = true;
    //Gestures.flag_copy = false;
    RenderManager.render();
}
Substitute.segInSegments = function(in_segs1,in_segs2){
    for(var k = 0 ; k < in_segs1.length ; k++){
	var j = 0;
	while(j< in_segs2.length){
	    if(in_segs1[k].set_id == in_segs2[j].set_id){
	        return true;
	    }
	    j++;
	}	
    }
    return false;
}
//ham tim cac segments se duoc thay the
Substitute.SearchSegments = function(segs,source){//Replace
	delete Substitute.Groups;
        Substitute.Groups = new Array();    
	var l = segs.length;
	var symbol = "";	
	for(var k =0; k <l; k++){
	    symbol = symbol + Fractions.Trim(segs[k].symbol);	    
	}	
	for(var k = 0;k < Substitute.Expression.length;k++){
	    var i = 0;
	    var segments = Substitute.Expression[k].segments;
	    if(segments.length < l)
		continue;
	    while(i< segments.length){
		var j = i;
		var str2 = "";
		var count = 0;
		var group = new Group();
		while(j< segments.length && count < l){
		    str2 = str2 + Fractions.Trim(segments[j].symbol);
		    //if(!Substitute.segInSegments(segments[j],source))
		    group.Add(segments[j]);
		    j++
		    count ++;
		}
		if(Substitute.strcmp(symbol,str2)){
		    if(!Substitute.segInSegments(group.segments,source))
			Substitute.Groups.push(group);
		    i = i + l;
		}
		else
		    i = i + 1;
	    }
	}
	//Substitute.printf(Substitute.Groups);	
}

Substitute.printf = function(groups){    
    for(var k =0;k < groups.length;k++){
	//console.log("thay the k = " +k);
	var group = groups[k];
	group.printf();
    }
}

Substitute.CreateExpression = function(){
    delete Substitute.Expression;
    Substitute.Expression = new Array();
    var sGroup = null;
    var bBool = false;
    for(var k = 0;k < Fractions.Groups.length;k++){
	var group = Fractions.Groups[k];
	if( k == 0){
	    sGroup = new Group();
	    sGroup.AddList(group.segments);
	    sGroup.Fractions = group.Fractions;
	    bBool = group.isExistsFrac();	
	}
	else{
	    if(group.isExistsFrac()){
		Substitute.Expression.push(sGroup);
		sGroup = new Group();
		sGroup.AddList(group.segments);
		sGroup.Fractions = group.Fractions;
		bBool = true;
	    }
	    else{
		if(bBool){
		    Substitute.Expression.push(sGroup);
		    sGroup = new Group();
		    sGroup.AddList(group.segments);
		    sGroup.Fractions = group.Fractions;
		}
		else{
		    sGroup.AddList(group.segments);
                    sGroup.Fractions = group.Fractions;
		}
		bBool = false;
	    }
	}
	if(k == Fractions.Groups.length -1){
            Substitute.Expression.push(sGroup);
        }
    }
    Substitute.printf(Substitute.Expression);
}



Substitute.SaveInforBox1 =  function(){
    delete Substitute.segments_first;
    Substitute.segments_first = new Array();
    Substitute.segments_first = Substitute.CopySeg(Substitute.segments_first);
    if (Substitute.segments_first.length > 0) {
    Substitute.selection_rec.style.top = RenderManager.selection_box.style.top;
    Substitute.selection_rec.style.left = RenderManager.selection_box.style.left;
    Substitute.selection_rec.style.width = RenderManager.selection_box.style.width;
    Substitute.selection_rec.style.height = RenderManager.selection_box.style.height;
    Substitute.selection_rec.style.visibility = "visible";
    //======================================================
        Substitute.bounding_1.style.top = RenderManager.bounding_box.style.top;
        Substitute.bounding_1.style.left = RenderManager.bounding_box.style.left;
        Substitute.bounding_1.style.width = RenderManager.bounding_box.style.width;
        Substitute.bounding_1.style.height = RenderManager.bounding_box.style.height;
        Substitute.bounding_1.style.visibility = "visible";
    }
}

Substitute.SaveInforBox2 = function (){
    delete Substitute.segments_second;
    Substitute.segments_second = new Array();
    Substitute.segments_second = Substitute.CopySeg(Substitute.segments_second);
    
    Substitute.bounding_2.style.top = RenderManager.bounding_box.style.top;
    Substitute.bounding_2.style.left = RenderManager.bounding_box.style.left;
    Substitute.bounding_2.style.width = RenderManager.bounding_box.style.width;
    Substitute.bounding_2.style.height = RenderManager.bounding_box.style.height;
    Substitute.bounding_2.style.visibility = "visible";
    Substitute.original_bb = null;
    Substitute.original_bb = Editor.selected_bb.clone();
}

Substitute.CopySeg = function(seg){
    for (var i = 0; i < Editor.selected_segments.length; i++){
        seg.push(Editor.selected_segments[i]);
    }
    return seg;
}

Substitute.SelectSingle = function(pos, segment) {
    Gestures.check_count_move = 0;
    Editor.drag = false;
    Editor.clear_selected_segments();
    //Editor.check_rectangle = true;
    //Gestures.flag_copy = false;
    //Editor.arr_seg_select = new Array();
    var issearch = false;
    var click_result = CollisionManager.get_point_collides(pos);
    // select single segment
    if (Substitute.getSelected(segment, pos)) {
        Substitute.bounding_1.style.visibility = "hidden";
	issearch = true;
        //var rs = click_result.pop();
        for (var i = 0; i < segment.length; i++){
            //if (segment[i].set_id == rs.set_id) {
                //issearch = true;
            //}
            Editor.add_selected_segment(segment[i], Editor.selected_segments);
	    //Editor.arr_seg_select.push(Editor.segments[i].instance_id);
        }
        if (issearch == true){
	    delete Editor.selected_segments_transform;
            Editor.selected_segments_transform = new Array();
	    delete Editor.selected_segments_not_transform;
            Editor.selected_segments_not_transform = new Array();
            
	    for (var k = 0; k < Editor.segments.length; k++) {
		if (Editor.segments[k].symbol != "V" && Editor.segments[k].symbol != "v" && Editor.segments[k].symbol != "^" && Gestures.IsSegmentsBelongDralf(Editor.segments[k]) == false) {
		    Editor.selected_segments_transform.push(Editor.segments[k]);
		} else {
		    Editor.selected_segments_not_transform.push(Editor.segments[k])
		}
	    }
            Editor.add_action(new HistorySegments(Editor.selected_segments_transform, false,Editor.TransformSegments));
            return true;
        }
        //else{
	    
            /*Substitute.initialize();
            Editor.state = EditorState.ReadyToRectangleSelect;
	    Editor.start_rect_selection = Editor.end_rect_selection = null;
	    //Editor.check_rectangle = true;
	    //Gestures.flag_copy = false;
	    //Editor.arr_seg_select = new Array();
            Editor.clear_selected_segments();
            RenderManager.render();*/
	    //Editor.state = EditorState.Flottom;
            //return false;
        //}
    }
    else if (Substitute.getSelected(Substitute.segments_second, pos)){
	Editor.state = EditorState.Flottom;
        return false;
    }
    else{
        Substitute.initialize();
        Editor.state = EditorState.ReadyToRectangleSelect;
	Editor.start_rect_selection = Editor.end_rect_selection = null;
        RenderManager.render();
        return false;
    }
}

Substitute.MoveSeg = function(pos_prev, pos_curr) {
    Gestures.check_count_move++;
        if(Gestures.check_count_move >=3)
	Editor.drag  = true;
    else
	Editor.drag  = false;
    Editor.status_moveSub = true;
    var translation = Vector2.Subtract(pos_curr, pos_prev);
    //Editor.check_rectangle = true;
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
        }
    }
    Editor.selected_bb.translate(translation);
    RenderManager.render();
}

Substitute.Replace = function(){
    if (RenderManager.segment_drag.offsetTop > Substitute.bounding_2.offsetTop
        && RenderManager.segment_drag.offsetTop < Substitute.bounding_2.offsetTop + Substitute.bounding_2.offsetHeight
        && RenderManager.segment_drag.offsetLeft > Substitute.bounding_2.offsetLeft
        && RenderManager.segment_drag.offsetLeft < Substitute.bounding_2.offsetLeft + Substitute.bounding_2.offsetWidth){
        return true;
    }
    else {
        return false;
    }
}
Substitute.Deletes = function(in_segments){    
    var action = new ActionSegments(in_segments, false , Editor.DeleteSegments);//Editor.DeleteSegments
    action.Apply();
    return action;
}


Substitute.SetPosition = function(){
    Editor.drag = false;
    //Editor.check_rectangle = true;
    //Editor.arr_seg_select = new Array();
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var pos_y = bb.mins.y - Substitute.original_bb.mins.y;
    var pos_x = bb.mins.x - Substitute.original_bb.mins.x;
    var translation = new Vector2(-pos_x, -pos_y);
    for (var k = 0; k < Editor.selected_segments.length; k++) {
        Editor.selected_segments[k].translate(translation);
        // add list instance_id
        //Editor.arr_seg_select.push(Editor.selected_segments[k].instance_id);
        //var seg = Editor.selected_segments[k];
    }
    Editor.selected_bb.translate(translation);
    RenderManager.render();
}

Substitute.Render = function(seg){
    for (var i = 0; i < seg.length; i++){
        seg[i].render_selected();
    }
}

Substitute.getSelected = function(segments, position){
    var mins, maxs, size;
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
    if (position.x >= mins.x && position.y > mins.y
	&& position.x <= maxs.x && position.y <= maxs.y){
	return true;
    }
    return false;
}
