function Flottom(){
    
}

Flottom.ObjBox = function(segments, top, left, width, height, trans){
    this.segments = segments;
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    this.trans = trans;
}

Flottom.initialize = function(){
    Flottom.accept = false;
    Flottom.index_bounding = 0;    
    Flottom.select_bb1 = null;
    Flottom.select_bb2 = null;
    Flottom.selected_temp = new Array();
    Flottom.box = new Array();
    Flottom.seg_concat = new Array();
    Flottom.GroupFracs = new Array();
    Flottom.Groups = new Array();
}

//<<<<< kiem tra bb1 va bb2
Flottom.Check = function(pos1, pos2){
    Substitute.bounding_1.style.visibility = "visible";
    Substitute.bounding_2.style.visibility = "visible";
    Editor.drag = true;
    Editor.clear_selected_segments();
    //Editor.check_rectangle = true;
    //Gestures.flag_copy = false;
    //Editor.arr_seg_select = new Array();
    RenderManager.unsetField(Editor.set_field);
    delete Editor.set_field;
    Editor.set_field = new Array();
    delete Editor.arr_seg_select;
    Editor.arr_seg_select = new Array();
    RenderManager.render();
    //var click_result1 = CollisionManager.get_point_collides_bb(pos1);
    //var click_result2 = CollisionManager.get_point_collides_bb(pos2);
    if ((Substitute.getSelected(Substitute.segments_first, pos1)
	&& Substitute.getSelected(Substitute.segments_second, pos2))
	|| (Substitute.getSelected(Substitute.segments_first, pos2)
	&& Substitute.getSelected(Substitute.segments_second, pos1))){
	delete Flottom.box;
	Flottom.box = new Array();
	var trans1 = new HistorySegments(Substitute.segments_first, false,Editor.TransformSegments);
	Flottom.box.push(new Flottom.ObjBox(Substitute.segments_first, Substitute.bounding_1.offsetTop,
	Substitute.bounding_1.offsetLeft, Substitute.bounding_1.offsetWidth, Substitute.bounding_1.offsetHeight, trans1));
	var trans2 = new HistorySegments(Substitute.segments_second, false,Editor.TransformSegments);
	Flottom.box.push(new Flottom.ObjBox(Substitute.segments_second, Substitute.bounding_2.offsetTop, Substitute.bounding_2.offsetLeft, Substitute.bounding_2.offsetWidth, Substitute.bounding_2.offsetHeight, trans2));
	// tron hai mang
	Gestures.transFormFlottom(false);
	Flottom.accept = true;
	//var seg = click_result1.pop();
	var seg;
	if (Substitute.getSelected(Substitute.segments_first, pos1)){
	    seg = Substitute.segments_first[0];
	}
	else if (Substitute.getSelected(Substitute.segments_second, pos1)){
	    seg = Substitute.segments_second[0];
	}
	var setid = seg.set_id;
	Flottom.GetBounding(setid);
	if (Flottom.index_bounding == 1){
	    Flottom.select_bb1 = Flottom.Add(Substitute.segments_second, Editor.selected_segments);
	    Flottom.select_bb2 = Flottom.Add(Substitute.segments_first, Flottom.selected_temp);	    
	}
	else if (Flottom.index_bounding == 2){
	    Flottom.select_bb1 = Flottom.Add(Substitute.segments_first, Flottom.selected_temp);
	    Flottom.select_bb2 = Flottom.Add(Substitute.segments_second, Editor.selected_segments);
	}
    }
    else {
	Substitute.initialize();
        Editor.state = EditorState.ReadyToRectangleSelect;
	RenderManager.render();
    }
}

//<<<<< kiem tra tao bounding
Flottom.GetBounding = function(click_result){
    Flottom.index_bounding = 0;
    for (var i = 0; i < Substitute.segments_first.length; i++){
	if (Substitute.segments_first[i].set_id == click_result){
	    Flottom.index_bounding = 1;
	    return;
	}	
    }
    for (var k = 0; k < Substitute.segments_second.length; k++){
	if (Substitute.segments_second[k].set_id == click_result){
	    Flottom.index_bounding = 2;
	    return;
	}
    }
    return ;
}

//<<<<< render qua trinh di chuyen flottom
Flottom.RenderSeg = function(pos_prev, pos_curr, seg, index) {
    var translation = Vector2.Subtract(pos_curr, pos_prev);
    for (var k = 0; k < seg.length; k++) {
        seg[k].translate(translation);
    }
    if (index == 1)
	Flottom.select_bb1.translate(translation);
    else if (index == 2)
	Flottom.select_bb2.translate(translation);
    RenderManager.render();
}

//<<<<< render bb1 va bb2
Flottom.RengerBox = function(flag, in_bb, in_context_id){
    if (flag == true) {
	if (Flottom.index_bounding == 1) {
	    Substitute.bounding_2.style.top = in_bb.render_mins.y + "px";
	    Substitute.bounding_2.style.left = in_bb.render_mins.x + "px";
	    Substitute.bounding_2.style.width = (in_bb.render_maxs.x - in_bb.render_mins.x) + "px";
	    Substitute.bounding_2.style.height = (in_bb.render_maxs.y - in_bb.render_mins.y) + "px";
	    Substitute.bounding_2.style.visibility = "visible";
	} else if (Flottom.index_bounding == 2) {
	    Substitute.bounding_1.style.top = in_bb.render_mins.y + "px";
	    Substitute.bounding_1.style.left = in_bb.render_mins.x + "px";
	    Substitute.bounding_1.style.width = (in_bb.render_maxs.x - in_bb.render_mins.x) + "px";
	    Substitute.bounding_1.style.height = (in_bb.render_maxs.y - in_bb.render_mins.y) + "px";
	    Substitute.bounding_1.style.visibility = "visible";
	}
    }
}

Flottom.Add = function(seg, select){
    for (var k = 0; k < seg.length; k++) {
        Editor.add_selected_segment(seg[k], select);
    }
    return Editor.selected_bb;
}

//<<<<< khoi tao bb1 va bb2
Flottom.SetBounding = function(){
    if (Flottom.index_bounding == 1){
	Flottom.RenderSeg(Editor.mouse_position_first_prev, Editor.mouse_position_first, Substitute.segments_first, 2);
	Substitute.bounding_1.style.top = RenderManager.bounding_box.style.top;
	Substitute.bounding_1.style.left = RenderManager.bounding_box.style.left;
	Substitute.bounding_1.style.width = RenderManager.bounding_box.style.width;
	Substitute.bounding_1.style.height = RenderManager.bounding_box.style.height;
	Substitute.bounding_1.style.visibility = "visible";
	Flottom.RenderSeg(Editor.mouse_position_second_prev, Editor.mouse_position_second, Substitute.segments_second, 1);
    }
    else if (Flottom.index_bounding == 2){
	Flottom.RenderSeg(Editor.mouse_position_first_prev, Editor.mouse_position_first, Substitute.segments_second, 2);
	Substitute.bounding_2.style.top = RenderManager.bounding_box.style.top;
	Substitute.bounding_2.style.left = RenderManager.bounding_box.style.left;
	Substitute.bounding_2.style.width = RenderManager.bounding_box.style.width;
	Substitute.bounding_2.style.height = RenderManager.bounding_box.style.height;
	Substitute.bounding_2.style.visibility = "visible";
	Flottom.RenderSeg(Editor.mouse_position_second_prev, Editor.mouse_position_second, Substitute.segments_first, 1);
    }
}

///ptran begin write
Flottom.IndexFraction = function(group,select_seg1,select_seg2){    
    for (var i = 1; i < group.Fractions.length; i++) {
	var mau = group.Fractions[i].denominator;
	var tu = group.Fractions[i].numerator;
	if(Substitute.Comparison(mau,select_seg1) && Substitute.Comparison(tu,select_seg2)){
	    return i;
	}
	else if(Substitute.Comparison(mau,select_seg2) && Substitute.Comparison(tu,select_seg1)){
	    return i;
	}
    }
    return -1;
}

Flottom.ListSegment = function(point,segments){
    var arr = new Array();
    for(var k = 0; k < segments.length;k++){
	var seg = segments[k];
	if(point.x < seg.worldMinPosition().x){
	    arr.push(seg);
	}
    }
    return arr;
}

Flottom.ListSegmentFrac = function(group) {
    var arr = new Array();
    var gr = new Group();
    //var tu = frac1.numerator; //currFrac.denominator;//Stroke duoc dua len tu so
    if (group.Fractions.length > 0) {
	gr.AddList(group.Fractions[0].numerator);
	gr.AddList(group.Fractions[0].denominator);
	var segments = gr.segments;
	//Editor.FindIndexSegment
	for (var k = 0; k < group.segments.length; k++) {
	    var seg = group.segments[k];
	    if (seg.symbol == "frac") continue;
	    var index = Editor.FindIndexSegment(seg.set_id, segments);
	    if (index == -1) arr.push(seg);
	}
    }
    return arr;
}

Flottom.CreateGroup = function(){
    delete Flottom.Groups;
    Flottom.Groups = new Array();
    var i = 0,j = 0;
    var group;
    var l = Fractions.Groups.length;
    console.log("Gom nhom!!" + Fractions.Groups.length);
    while(i < l){
	if(i == 0)
	    group = new Group();
	var g = Fractions.Groups[i];
	if(Fractions.Groups[i].isExistsDash() || Fractions.Groups[i].isExistsPlus()){
	    if(group.segments.length > 0)
		Flottom.Groups.push(group);
	    group = new Group();
	    group.AddList(g.segments);
	    group.AddListFrac(g.Fractions);
	    Flottom.Groups.push(group);
	    group = new Group();    
	}
	else{
	    group.AddList(g.segments);
	    group.AddListFrac(g.Fractions);
	}
	j = i + 1;
	if(j < l && (g.isExistsLparen() || Fractions.Groups[j].isExistsLparen())){
	    while(j < l){
		group.AddList(Fractions.Groups[j].segments);
		group.AddListFrac(Fractions.Groups[j].Fractions);
		if(Fractions.Groups[j].isExistsRparen()){
		    console.log("end _rparen");
		    j++;
		    break;
		}
		console.log(" j =" +j);
		j++;
	    }	    
	    i = j;
	    Flottom.Groups.push(group);
	    group = new Group();
	    continue;
	}
	else if(i < l - 1 && !Fractions.Groups[i+1].isExists()){
	    group.AddList(Fractions.Groups[i+1].segments);
	    group.AddListFrac(Fractions.Groups[i+1].Fractions);	    
	    Flottom.Groups.push(group);
	    group = new Group();
	    i = i + 2;
	    continue;
	}
	
	if(i == l - 1){
	    Flottom.Groups.push(group); 
	}
	i++;
    }
    console.log("Tao nhom !!!");
    Substitute.printf(Flottom.Groups);
    console.log("End !!!");
}
Flottom.ChangeFrac = function(){    
    return Flottom.Fraction(Flottom.Groups,Substitute.segments_first,Substitute.segments_second);
}

Flottom.Fraction = function(groups,select_seg1,select_seg2){
    var arr = new Array();
    var j = -1;
    var index = -1;
    var l = groups.length;
    console.log("Danh sach cac Group!");
    for(var k = 0;k < groups.length;k++){
	var group = groups[k];
	group.printf();
	if(group.Fractions.length < 2)
	    continue;
	var i = Flottom.IndexFraction(group,select_seg1,select_seg2);
	if(i == -1)
	    continue;
	j = k;
	index = i;
	break;
    }
    var currFrac;
    var offset = new Vector2(0,0);
    console.log("j = " + j + " index " + index);
    if(j!= -1 && index != -1){
	var sGroup = groups[j];	
	currFrac = sGroup.Fractions[index];	
	if(sGroup.Fractions.length == 2){
	    var CurrGmins = sGroup.minPosition();
	    var CurrGmaxs = sGroup.maxPosition();	    
	    var frac1 = sGroup.Fractions[0];
	    var grs = new Group();
	    var tu = frac1.numerator; //currFrac.denominator;//Stroke duoc dua len tu so
	    var seg = frac1.id_group;
	    arr.push(currFrac.id_group);
	    grs.AddList(tu);//luu phan tu so o ben tren roi tinh toa do de move phan so o duoi len
	    var groupTemp = new Group();
	    groupTemp.AddList(tu);
	    groupTemp.AddList(Flottom.ListSegmentFrac(sGroup));
	    var currGFracDeno = new Group();
	    var mau = currFrac.denominator;//Stroke duoc dua len tu so
	    currGFracDeno.AddList(mau);//Luu mang cua mau so duoc chuyen len tu so
	    var currGFracNumerator = new Group();
	    currGFracNumerator.AddList(currFrac.numerator);//Luu Nhom cua mang tu so duoc chuyen xuong mau so
	    var max = seg.worldMaxPosition().y + 10;//worldMinPosition
	    var listSeg = Flottom.ListSegment(max,Editor.segments);//di chuyen ve ben phai khi segment dua len tren
	    var groupCurr = new Group();
	    if(currGFracDeno.minY()< CurrGmaxs.y && CurrGmins.y < currGFracDeno.maxY())
	    {
		var bBool = false;
		var sizeNum = currGFracNumerator.maxGroup() - currGFracNumerator.minGroup();
		var sizeDeno = currGFracDeno.maxGroup() - currGFracDeno.minGroup();
		var maxNume_x = currGFracNumerator.maxGroup();
		var maxDeno_x = currGFracDeno.maxGroup();
		var minNume_x = currGFracNumerator.minGroup();
		var minDeno_x = currGFracDeno.minGroup();
		if(currGFracDeno.maxY() < currGFracNumerator.minY()){		    
		    bBool = true;
		}
		var left = true;
		if(bBool)
		{
		    bBool = false;		    
		    if(currGFracDeno.minGroup() > CurrGmins.x){//di chuyen qua ben phai
			if(j < l - 1 && groups[j+1].maxGroup() < currGFracDeno.minGroup()){
			    console.log("di chuyen qua vung Flottom");
			    return false;
			}			
			offset = new Vector2(CurrGmaxs.x + 10 - currGFracDeno.minGroup(),grs.maxY()- currGFracDeno.maxY());
			Space.render(currGFracDeno.segments,offset);
			bBool = true;
			left = false;
		    }
		    else{//di chuyen qua ben trai
			offset = new Vector2(CurrGmins.x - 10 - currGFracDeno.maxGroup(),grs.maxY()- currGFracDeno.maxY());
			Space.render(currGFracDeno.segments,offset);
			bBool = true;
			left = true;
		    }
		    if(bBool){			
			offset = new Vector2(0,max - currGFracNumerator.minY());
			Space.render(currGFracNumerator.segments,offset);  			
			groupCurr.AddList(currGFracDeno.segments);
			groupCurr.AddList(currGFracNumerator.segments);
			groupCurr.Add(seg);
		    }
		    //groupCurr.Sort();
		    var maxSize = 0;
		    if(Editor.flottom){
			offset = new Vector2(currGFracDeno.maxGroup() - currGFracNumerator.maxGroup(),0);
			Space.render(currGFracNumerator.segments,offset);
			maxSize = sizeDeno > sizeNum ? sizeDeno : sizeNum;
			maxSize += 30;
			offset = new Vector2(maxSize - seg.size.x,0);
			Space.fnZoom(new Array(seg),offset,0);
			var max_x = maxDeno_x > maxNume_x ? maxDeno_x : maxNume_x;
			offset = new Vector2(max_x - seg.worldMaxPosition().x + 15,0);//worldMinPosition
			Space.render(new Array(seg),offset);
			if(minDeno_x <= minNume_x){
			    offset = new Vector2(- seg.worldMinPosition().x + minDeno_x  + 15,0);//worldMinPosition
			    Space.render(currGFracDeno.segments,offset);    
			}
			else{
			    offset = new Vector2(- seg.worldMinPosition().x + minNume_x  + 15,0);//worldMinPosition
			    Space.render(currGFracNumerator.segments,offset);
			}
			var y = grs.maxY() - (grs.maxY() - grs.minY())/3;
			var tran_x = 0;
			if(left){
			    tran_x = grs.minGroup() - seg.worldMaxPosition().x - 15;
			}
			else{
			    tran_x = grs.maxGroup() - seg.worldMinPosition().x + 15;
			}
			y = y - seg.worldMaxPosition().y;
			offset = new Vector2(tran_x,y);
			Space.render(groupCurr.segments,offset);
		    }
		    else{
			grs.AddList(currGFracDeno.segments);
			groupTemp.AddList(currGFracDeno.segments);
			offset = new Vector2(0, - groupTemp.maxY() + seg.worldMinPosition().y - 10);			
			Space.render(groupTemp.segments,offset);
			if(!groupTemp.isExistsFrac())
			    Space.updateArrsSegment(groupTemp.segments);
			maxSize = groupTemp.maxGroup() - groupTemp.minGroup() + 30;
			offset = new Vector2(maxSize - seg.size.x,0);
			Space.fnZoom(new Array(seg),offset,0);	
			offset = new Vector2( groupTemp.minGroup() - seg.worldMinPosition().x  - 15,0);	
			Space.render(new Array(seg),offset);
			offset = new Vector2(0, - grs.maxY() + seg.worldMinPosition().y - 10);
			Space.render(grs.segments,offset);
		    }
		    offset = new Vector2(currGFracDeno.maxGroup()- currGFracNumerator.maxGroup(),0);
		    Space.render(currGFracNumerator.segments,offset);
		    var actionDelete = Substitute.Deletes(arr);
		    //Editor.current_action.add_new_transforms(Flottom.seg_concat);
		    Editor.current_action.add_new_transforms(Editor.selected_segments_transform);
		    Editor.add_action(actionDelete);    
		    return true;
		}
	    }
	    return false;
	}
	else if(sGroup.Fractions.length == 3){
	    
	}
	return false;
    }
    return false;
}

//<<<<< tra lai trang thai ban dau khi thuc hien khong thanh cong
Flottom.Restore = function(){
    Flottom.accept = false;
    Editor.clear_selected_segments();
    for (var i = 0; i < Flottom.box.length; i++){
	Flottom.box[i].trans.add_new_transforms(Flottom.box[i].segments);
	Flottom.box[i].trans.ResotreFlotom();
	switch (i) {
	    case 0:
		Substitute.bounding_1.style.top = Flottom.box[i].top + "px";
		Substitute.bounding_1.style.left = Flottom.box[i].left + "px";
		Substitute.bounding_1.style.width = Flottom.box[i].width + "px";
		Substitute.bounding_1.style.height = Flottom.box[i].height + "px";
		break;
	    case 1:
		Substitute.bounding_2.style.top = Flottom.box[i].top + "px";
		Substitute.bounding_2.style.left = Flottom.box[i].left + "px";
		Substitute.bounding_2.style.width = Flottom.box[i].width + "px";
		Substitute.bounding_2.style.height = Flottom.box[i].height + "px";
		break;
	}
    }
    Flottom.index_bounding = 0;
    Flottom.select_bb1 = null;
    Flottom.select_bb2 = null;
    delete Flottom.selected_temp;
    Flottom.selected_temp = new Array();
    delete Flottom.box;
    Flottom.box = new Array();
    RenderManager.render();
}

//<<<<< sdang start: 08/18/2012
Flottom.Exp = function(segments, seg_down, seg_up){
    this.segments = segments;
    this.seg_down = seg_down;
    this.seg_up = seg_up;
    
    this.frac_exp = new Array();
    this.frac_small = null;
    this.frac_big = null;
    
    this.size_source = null;
    this.size_des = null;
    
    this.obj_symbol = new Array();
    this.status = false;
}

Flottom.Exp.prototype = {
    analysis: function(){
	GroupExp.data_frac = new Array();
	GroupExp.data_sqrt = new Array();
	GroupExp.landmark_left_sqrt = 0;
	GroupExp.landmark_right_sqrt = window.innerWidth;
	GroupExp.list_main = GroupExp.detachment(this.segments, new Array()).clone();
	GroupExp.count_index = 0;
	GroupExp.getData();
	this.frac_exp = GroupExp.data_frac.clone();
	console.log("chieu dai frac: " + this.frac_exp.length);
    },
    
    existGroupFrac: function(){
	if (this.frac_exp.length == 0){
	    return [null, null];
	}
	var temp_source = this.seg_down.concat(this.seg_up);
	var frac_big = null;
	var frac_small = null;
	for (var i = this.frac_exp.length - 1; i >= 0; i--){
	    var obj_frac = this.frac_exp[i];
	    if (this.compareGroupFrac(obj_frac.numerator, this.seg_down)
		&& this.compareGroupFrac(obj_frac.denominator, this.seg_up)){
		frac_small = i;
		this.seg_up = obj_frac.numerator;
		this.seg_down = obj_frac.denominator;
		console.log("chieu dai frac small truoc: ");
	    }
	    else if (this.compareGroupFrac(obj_frac.numerator, this.seg_up)
		&& this.compareGroupFrac(obj_frac.denominator, this.seg_down)){
		frac_small = i;
		//break;
		console.log("chieu dai frac small sau: ");
	    }
	    if (this.compareGroupFrac(temp_source, obj_frac.denominator)
		&& frac_small != null){
		frac_big = i;
		console.log("chieu dai frac lon: ");
		break;
	    }
	    if (this.compareGroupFrac(temp_source, obj_frac.numerator)
		&& frac_small != null){
		console.log("chieu dai frac khong co: ");
		break;
	    }
	}
	return [frac_small, frac_big];
    },
    
    compareGroupFrac: function(source, des){
	for (var i = 0; i < source.length; i++){
	    var seg = source[i];
	    if (!des.contains(seg)){
		return false;
	    }
	}
	return true;
    },
    
    sortMins: function(insegments) {
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
    },
    
    sortMaxs: function(insegments) {
	for (var i = 0; i < insegments.length; i++) {
	    for (var j = 0; j < insegments.length; j++) {
		if (insegments[i].worldMaxPosition().x > insegments[j].worldMaxPosition().x) {
		    var temp = insegments[i];
		    insegments[i] = insegments[j];
		    insegments[j] = temp;
		}
	    }
	}
	return insegments;
    },
    
    getLeft: function(segments){
	var temp_seg = this.sortMins(segments);
	return temp_seg[0];
    },
    
    getRight: function(segments){
	var temp_seg = this.sortMaxs(segments);
	return temp_seg[0];
    },
    
    setSwitch: function(segments){
	var seg_right = this.getRight(segments);
	var seg_left = this.getLeft(segments);
	//var seg_dash = this.searchDash(segments);
	if (this.searchNummer(segments)) {
	    // case: is number
	    return 1;
	}
	else if (seg_left.symbol == "_lparen" && seg_right.symbol == "_rparen"){
	    // case: is number (.....)
	    return 2
	}
	else if (seg_left.symbol != "_lparen" && seg_right.symbol != "_rparen"){
	    // case: is not (.....) ===> add ();
	    return 3;
	}
	else if (seg_left.symbol == "_lparen" && seg_right.symbol != "_rparen"){
	    // case: is (..., is not ...) ===> add );
	    return 4;
	}
	else if (seg_left.symbol != "_lparen" && seg_right.symbol == "_rparen"){
	    // case: is ...), is not (... ===> add (;
	    return 5;
	}
	return 0;
    },
    
    searchNummer: function(segments){
	for(var i = 0; i < segments.length; i++){
	    var seg = segments[i];
	    if (isNaN(parseInt(seg.symbol))){
		return false;
	    }
	}
	return true;
    },
    
    startRender: function(){
	/*for (var m = 0; m < RenderManager.segment_set_divs.length; m++) {
	    var sss_div = RenderManager.segment_set_divs[m];
	    sss_div.style.visibility = "hidden";
	    sss_div.style.background = "none";
	    sss_div.style.border = "1px solid green";
	}
	Editor.arr_seg_select = new Array();*/
	
	RenderManager.unsetField(Editor.set_field);
	delete Editor.set_field;
	Editor.set_field = new Array();
	delete Editor.arr_seg_select;
	Editor.arr_seg_select = new Array();
	
	this.analysis();
	var exist_group_frac = this.existGroupFrac();
	if (exist_group_frac[0] == null
	    || exist_group_frac[1] == null){
	    this.status = false;
	}
	else {
	    this.frac_small = exist_group_frac[0];
	    this.frac_big = exist_group_frac[1];
	    this.status = true;
	}
	return this.status;
    },
    
    createStroke: function(step, flag){
	Flottom.Exp.is_create = true;
	if (flag == 0){
	    Flottom.Exp.flag = 0;
	}
	else {
	    Flottom.Exp.flag = 1;
	}
	var current_stroke = new Array();
	//var xmlDoc = loadFileXml(keyboardXml);
	//var segments = xmlDoc.getElementsByTagName("segments");
	var xml = this.getXml();
	switch (step) {
	    case 3:
		// left
		LoadXML(xml[0], xml[1], Formula.ArrExpression, Formula.data_segment);
		// right
		LoadXML(xml[0], xml[2], Formula.ArrExpression, Formula.data_segment);
	    break;
	    case 4:
		// right
		LoadXML(xml[0], xml[2], Formula.ArrExpression, Formula.data_segment);
	    break;
	    case 5:
		// left
		LoadXML(xml[0], xml[1], Formula.ArrExpression, Formula.data_segment);
	    break;
	}
    },
    
    zoom: function(strokes, status){
	var size, anchor;
	var size_seg = this.getSize(strokes);
	if (status == 0){
	    // tinh cho big
	    size = this.getSize(this.frac_exp[this.frac_big].numerator);
	    anchor = new Vector2((size[1].x + size[0].x) / 2, (size[1].y + size[0].y) / 2);
	}
	else {
	    // tinh cho down
	    size = this.getSize(this.seg_down);
	    anchor = new Vector2((size[1].x + size[0].x) / 2, (size[1].y + size[0].y) / 2);
	}
	var seg = strokes[0];
	var scale = size[2].y / size_seg[2].y;
	seg.resize(anchor, new Vector2(scale, scale));
	seg.freeze_transform();
	seg.render();
    },
    
    transfrom: function(strokes, status){
	var size;
	var size_seg = this.getSize(strokes);
	if (status == 0){
	    // tinh cho big
	    size = this.getSize(this.frac_exp[this.frac_big].numerator);
	}
	else {
	    // tinh cho down
	    size = this.getSize(this.seg_down);
	}
	var seg = strokes[0];
	var trans = Vector2.Add(size_seg[1], size_seg[0]);
	trans = new Vector2(trans.x / 2, trans.y / 2);
	if (seg.symbol == "(" || seg.symbol == "_lparen") {
	    var temp_vec = new Vector2(size[0].x - (size_seg[2].x / 2), size[0].y + (size[2].y / 2));
	    trans = Vector2.Subtract(temp_vec, trans);	    
	} else {
	    var temp_vec = new Vector2(size[1].x + (size_seg[2].x / 2), size[0].y + (size[2].y / 2));
	    trans = Vector2.Subtract(temp_vec, trans);
	}
	seg.translate(trans);
	seg.render();
    },
    
    getXml: function(){
	var xmlDoc = loadFileXml(keyboardXml);
	var segments = xmlDoc.getElementsByTagName("segments");
	var index_left;
	var index_right;
	for (var i = 0; i < segments.length; i++) {
	    var symbol = segments[i].getElementsByTagName("group")[0].getAttribute("symbol");
	    if (symbol == "(" || symbol == "l_paren"){
		index_left = i;
	    }
	    if (symbol == ")" || symbol == "r_paren"){
		index_right = i;
	    }
	    
	}
	return [xmlDoc, index_left, index_right];
    },
    
    action: function(){
	Flottom.Exp.current_stack = Editor.current_action;
	var size_up = this.getSize(this.seg_up);
	var size_down = this.getSize(this.seg_down);
	var size_big = this.getSize(this.frac_exp[this.frac_big].frac);
	var center_big = new Vector2.Add(size_big[1], size_big[0]);
	center_big = new Vector2(center_big.x / 2, center_big.y / 2);
	var size_big_num = this.getSize(this.frac_exp[this.frac_big].numerator);
	var size_small = this.getSize(this.frac_exp[this.frac_small].frac);
	var switch_down = this.setSwitch(this.seg_down);
	var switch_big = this.setSwitch(this.frac_exp[this.frac_big].numerator);
	if ((size_down[0].y + size_down[2].y / 2) < size_big_num[0].y){
	    return false;
	}
	else if (size_up[0].y < size_big[1].y || size_up[1].y > size_small[0].y){
	    return false;
	}
	//else if (size_up[0].x < size_big[0].x || size_up[1].x > size_big[1].x){
	    //return false;
	//;}
	else if (size_down[0].y  > size_big[1].y){
	    return false;
	}
	else if (size_down[1].y < size_big[0].y){
	    if (size_down[1].x  < size_big_num[0].x){
		//if (switch_big == 1 && switch_down == 1){
		    //return false;
		//}
		//else {
		    var undo_temp = Editor.undo_stack.pop();
		    Editor.undo_stack.pop();
		    Editor.undo_stack.push(undo_temp);
		    Flottom.Exp.current_stack.status = true;
		    Flottom.Exp.current_stack.add_new_transforms(Editor.selected_segments_transform);
		    //this.createStroke(switch_big, 0);
		    //this.createStroke(switch_down, 1);
		    if (switch_big != 1){
			this.createStroke(switch_big, 0);
		    }
		    if (switch_down != 1){
			this.createStroke(switch_down, 1);
		    }
		    if (switch_big == 1 && switch_down == 1){
			this.createStroke(switch_down, 1);
		    }
		    return true;
		//}
	    }
	    else if (size_down[0].x  > size_big_num[1].x){
		//if (switch_down == 1 && size_down[0].x < size_big[1].x - 5
		    //&& switch_big == 1){
		    //return false;
		//}
		//else {
		    var undo_temp = Editor.undo_stack.pop();
		    Editor.undo_stack.pop();
		    Editor.undo_stack.push(undo_temp);
		    Flottom.Exp.current_stack.status = true;
		    Flottom.Exp.current_stack.add_new_transforms(Editor.selected_segments_transform);
		    //this.createStroke(switch_big, 0);
		    //this.createStroke(switch_down, 1);
		    if (switch_big != 1){
			this.createStroke(switch_big, 0);
		    }
		    if (switch_down != 1){
			this.createStroke(switch_down, 1);
		    }
		    if (switch_big == 1 && switch_down == 1){
			this.createStroke(switch_down, 1);
		    }
		    return true;
		//}
	    }
	}
	else if (size_down[0].y  < size_big[0].y && size_down[1].y  > size_big[1].y){
	    if (size_down[1].x < size_big[0].x){
		if (switch_down == 1){
		    return false;
		}
		else {
		    var undo_temp = Editor.undo_stack.pop();
		    Editor.undo_stack.pop();
		    Editor.undo_stack.push(undo_temp);
		    Flottom.Exp.current_stack.status = true;
		    Flottom.Exp.current_stack.add_new_transforms(Editor.selected_segments_transform);
		    this.createStroke(switch_down, 1);
		    return true;
		}
	    }
	    else if (size_down[0].x > size_big[1].x){
		var undo_temp = Editor.undo_stack.pop();
		Editor.undo_stack.pop();
		Editor.undo_stack.push(undo_temp);
		Flottom.Exp.current_stack.status = true;
		Flottom.Exp.current_stack.add_new_transforms(Editor.selected_segments_transform);
		this.createStroke(switch_down, 1);
		return true;
	    }
	}
	return false;
    },
    
    endRender: function(){
	if (!this.action()){
	    //Flottom.Restore();
	    //delete Flottom.Exp.stroke_paren;
	    //Flottom.Exp.stroke_paren = new Array();
	    //Flottom.Exp.current = null;
	    //Flottom.Exp.is_create = false;
	    //Flottom.Exp.flag = -1;
	    //Flottom.Exp.current_stack = null;
	    Flottom.Restore();
	    Flottom.Exp.init();
	    Editor.undo_stack.pop();
	    Editor.undo_stack.pop();
	    Flottom.showLabel("Error!");
	}
	else {
	    
	    var temp_stroke = new Array();
	    for (var i = 0; i < Flottom.Exp.stroke_paren.length; i++){
		var seg_paren = Flottom.Exp.stroke_paren[i];
		this.zoom(seg_paren[0].segments, seg_paren[1]);
		this.transfrom(seg_paren[0].segments, seg_paren[1]);
		temp_stroke.push(seg_paren[0].segments[0]);
	    }
	    
	    if (temp_stroke.length > 0){
		var action = new ActionSegments(temp_stroke, true, Editor.FlottomSegments);
		action.Apply();
		Editor.add_action(action);
	    }
	    
	    Flottom.Exp.init();
	    Flottom.showLabel("Success!");
	}
    },
    
    getSize: function(segments){
	var mins = new Vector2(0, 0);
	var maxs = new Vector2(0, 0);
	var size = new Vector2(0, 0);
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
	size = Vector2.Subtract(maxs, mins);
	return [mins, maxs, size];
    },
};

Flottom.showLabel = function(notifi){
    document.getElementById("touchhold").style.visibility = "visible";
    document.getElementById("touchhold").style.left = (ResizeTo.width_canvas - 100) / 2 + "px";
    document.getElementById("touchhold").style.top = (ResizeTo.height_canvas - 100) / 2 + "px";;
    document.getElementById("touchhold").style.border = "none";
    document.getElementById("touchhold").innerHTML = notifi;
    setTimeout(function() {
	document.getElementById("touchhold").style.visibility = "hidden";
	document.getElementById("touchhold").style.border = "2px solid #4444FF";
	document.getElementById("touchhold").innerHTML = "";
    }, 1500);
}

Flottom.Exp.init = function(){
    Substitute.initialize();
    Flottom.initialize();
    Editor.clear_selected_segments();
    Editor.state = EditorState.ReadyToRectangleSelect;
    Gestures.restoreNode();
    RenderManager.render();

    Flottom.Exp.stroke_paren = new Array();
    Flottom.Exp.current = null;
    Flottom.Exp.is_create = false;
    Flottom.Exp.flag = -1;
    Flottom.Exp.current_stack = null;
}

Flottom.Exp.stroke_paren = new Array();
Flottom.Exp.current = null;
Flottom.Exp.is_create = false;
Flottom.Exp.flag = -1;
Flottom.Exp.current_stack = null;
//<<<<<========================