Insert = function(segments, segments_selected, selected_bb, x, y, v, interior, extend){
    this.segments = segments;
    this.segments_selected = segments_selected;
    this.x = x;
    this.y = y;
    this.v = v;
    this.selected_bb = selected_bb;
    this.left_side = new Array();
    this.right_side = new Array();
    this.main_side = new Array();
    this.obj_side = new Array();
    this.sqrt = new Array();
    this.frac = new Array();
    this.left_trans = 0;
    this.right_trans = 0;
    this.interior = interior;
    this.extend = extend;
};

Insert.current = null;
Insert.index_side = -1;
Insert.input_segments = new Array();

Insert.prototype = {
    checkSide: function(){
        for (var i = 0; i < this.segments.length; i++){
            var mins, maxs, center, obj_size;
            var seg = this.segments[i];
            obj_size = this.getSizeStroke(seg.set_id);
            mins = obj_size[0];
            maxs = obj_size[1];
            center = this.getCenterSide(mins, maxs);
            if (seg.symbol == "sqrt" && this.x > mins.x && this.selected_bb.mins.x < maxs.x){
                this.sqrt.push(seg);
            }
            else if (this.selected_bb.mins.x < maxs.x && this.selected_bb.maxs.x > mins.x
                     && this.selected_bb.mins.y < maxs.y && this.selected_bb.maxs.y > mins.y){
                if (center[0] < this.x) {
                    var distance = this.x - maxs.x;
                    this.obj_side.push(new Array(seg, distance));
                } else if (center[0] > this.x) {
                    var distance = mins.x - this.x;
                    this.obj_side.push(new Array(seg, distance));
                }
            }
	    else if (this.extend){
		if (this.selected_bb.mins.x < maxs.x + 25 && this.selected_bb.maxs.x + 25 > mins.x
		    && this.selected_bb.mins.y < maxs.y && this.selected_bb.maxs.y > mins.y) {
		    if (center[0] < this.x) {
			var distance = this.x - maxs.x;
			this.obj_side.push(new Array(seg, distance));
		    } else if (center[0] > this.x) {
			var distance = mins.x - this.x;
			this.obj_side.push(new Array(seg, distance));
		    }
		}
	    }
        }
    },
    
    getLeftRight: function(){
	var temp_main_side = new Array();
	if (Insert.index_side == -1 && this.obj_side.length > 0){
	    temp_main_side = this.segments.clone();
	}
	else {
	    temp_main_side = this.main_side.clone();
	}
	for (var i = 0; i < temp_main_side.length; i++){
	    var mins, maxs, center, obj_size;
	    var seg = temp_main_side[i];
	    
	    if (this.left_side.contains(seg)){
                continue;
            }
            if (this.right_side.contains(seg)){
                continue;
            }
	    
	    obj_size = this.getSizeStroke(seg.set_id);
            mins = obj_size[0];
            maxs = obj_size[1];
            center = this.getCenterSide(mins, maxs);
            if (seg.symbol == "sqrt" && this.x > mins.x && this.selected_bb.mins.x < maxs.x){
                //this.sqrt.push(seg);
            }
	    else {
		if (center[0] < this.x) {
                    this.left_side.push(seg);
                    if (this.selected_bb.mins.x < maxs.x + 10) {
                        var temp_left_trans = maxs.x + 10 - this.selected_bb.mins.x;
                        if (temp_left_trans > this.left_trans){
                            this.left_trans = temp_left_trans
                        }
                    }
                } else if (center[0] > this.x) {
                    this.right_side.push(seg);
                    if (this.selected_bb.maxs.x + 10 > mins.x) {
                        var temp_right_trans = this.selected_bb.maxs.x + 10 - mins.x;
                        if (temp_right_trans > this.right_trans){
                            this.right_trans = temp_right_trans;
                        }
                    }
                }
	    }
	}
    },
    
    getCenterSide: function(mins, maxs) {
        var temp = Vector2.Add(mins, maxs);
        var center = new Vector2(temp.x / 2, temp.y / 2);
        return [center.x, center.y, center];
    },
    
    getSizeStroke: function(currentId) {
        var templist = this.strokeIterationsId(currentId);
        var mins, maxs;
        for (var i = 0; i < templist.length; i++) {
            var seg = templist[i];
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
        return [mins, maxs, Vector2.Subtract(maxs, mins), templist];
    },
    
    getSize: function(list_side){
        var mins, maxs, size;
        mins = new Vector2(0, 0);
        maxs = new Vector2(0, 0);
        for (var i = 0; i < list_side.length; i++){
            var seg = list_side[i];
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
    },
    
    strokeIterationsId: function(currentId) {
        var templist = new Array();
        for (var i = 0; i < this.segments.length; i++) {
            var seg = this.segments[i];
            if (seg.set_id == currentId) {
                templist.push(seg);
            }
        }
        return templist;
    },
    
    getNearestStroke: function(){
       var min;
       var index = -1;
       for (var i = 0; i < this.obj_side.length; i++){
           var seg = this.obj_side[i][0];
           if (i == 0){
          min = this.obj_side[i][1];
          index = 0;
           }
           else if (this.obj_side[i][1] < min){
          min = this.obj_side[i][1];
          index = i;
           }
       }
       return index;
    },
    
    getIndexSide: function(){
	var index = this.getNearestStroke();
	if (index == -1){
	    return -1;
	}
	else {
	    var seg_nearest = this.obj_side[index][0];
	    for (var k = GroupExp.data_frac.length - 1; k >= 0; k--) {
		for (var i = 0; i < GroupExp.data_frac[k].numerator.length; i++) {
		    var seg = GroupExp.data_frac[k].numerator[i];
		    if (seg.set_id == seg_nearest.set_id){
			return [k, 1];
		    }
		}
		for (var m = 0; m < GroupExp.data_frac[k].denominator.length; m++) {
		    var seg = GroupExp.data_frac[k].denominator[m];
		    if (seg.set_id == seg_nearest.set_id){
			return [k, 2];
		    }
		}
	    }
	}
	return -1;
    },
    
    getMainSide: function(){
	var index = this.getIndexSide();
	Insert.index_side = index;
	if (index == -1){
	    return;
	}
	else {
	    if (index[1] == 1){
		for (var i = 0; i < GroupExp.data_frac[index[0]].numerator.length; i++) {
		    var seg = GroupExp.data_frac[index[0]].numerator[i];
		    this.main_side.push(seg);
		}
	    }
	    else if (index[1] == 2){
		for (var i = 0; i < GroupExp.data_frac[index[0]].denominator.length; i++) {
		    var seg = GroupExp.data_frac[index[0]].denominator[i];
		    this.main_side.push(seg);
		}
	    }
	}
    },
    
    setZoom: function(segments, scale){
      if (segments.length == 0){
          return;
      }
      for (var i = 0; i < segments.length;i++){
         var seg = segments[i];
         var mins, maxs, obj_size, anchor;
         obj_size = this.getSizeStroke(seg.set_id);
         mins = obj_size[0];
         maxs = obj_size[1];
         anchor = new Vector2((maxs.x + mins.x) / 2, (maxs.y + mins.y) / 2);
         seg.resize(anchor, scale);
         seg.freeze_transform();
         seg.render();//g added
         this.updateEditorSegments(seg);//g added
      }
    },
    
    getOutSqrt: function(seg, seg_sqrt){
	return [seg, seg_sqrt];
    },
    
    getInsert: function(){
	if (!this.interior && !this.extend){
	    return;
	}
	else if (this.interior && !this.extend
		&& this.left_trans == 0 && this.right_trans == 0){
	    return;
	}
	if (this.segments_selected.length == 1){
	    if (this.segments_selected[0].symbol == "sqrt"){
		return;
	    }
	    if (this.segments_selected[0].symbol == "-"
		|| this.segments_selected[0].symbol == "dash"
		|| this.segments_selected[0].symbol == "_dash"
		|| this.segments_selected[0].symbol == "frac"){
		if (this.segments_selected[0].worldMaxPosition().x - this.segments_selected[0].worldMinPosition().x > 25){
		    return;
		}
	    }
	}
	var transform_left = new Vector2(-this.left_trans, 0);
	var transform_right = new Vector2(this.right_trans, 0);
	this.main_side = new Array();
	if (this.left_trans != 0){
		for (var i = 0; i < this.left_side.length; i++){
			var seg = this.left_side[i];
//g rm			var mins, maxs, obj_size;
//g rm			obj_size = this.getSizeStroke(seg.set_id);
//g rm			mins = obj_size[0];
//g rm			maxs = obj_size[1];
			this.main_side.push(seg);
			seg.translate(transform_left);
			seg.render();
//g start: update Editor.segments with this seg 
			this.updateEditorSegments(seg);
//g end	
        }
    }
	if (this.right_trans != 0){
		for (var i = 0; i < this.right_side.length; i++){
			var seg = this.right_side[i];
//g rm			var mins, maxs, obj_size;
//g rm			obj_size = this.getSizeStroke(seg.set_id);
//g rm			mins = obj_size[0];
//g rm			maxs = obj_size[1];
			this.main_side.push(seg);
			seg.translate(transform_right);
			seg.render();
//g start: update Editor.segments with this seg 
			this.updateEditorSegments(seg);
//g end	
			
        }
    }
	for (var i = 0; i < this.sqrt.length;i++){
	    var seg = this.sqrt[i];
            var mins, maxs, obj_size, anchor, scale;
	    var temp_left = new Array();
	    var temp_right = new Array();
            obj_size = this.getSizeStroke(seg.set_id);
            mins = obj_size[0];
            maxs = obj_size[1];
            if (mins.y < this.y && maxs.y > this.y){
               seg.translate(transform_left);
               seg.render();
               this.updateEditorSegments(seg);//g added
               anchor = new Vector2(mins.x - this.left_trans, mins.y);
		scale = new Vector2((obj_size[2].x + (this.left_trans + this.right_trans)) / obj_size[2].x, 1);
		if (this.right_trans == 0 && this.left_trans != 0) {
		    if (this.selected_bb.mins.x < maxs.x) {
			var temp_distance = this.selected_bb.sizeBox().x - this.left_trans;
			scale = new Vector2((obj_size[2].x + (this.left_trans + temp_distance)) / obj_size[2].x, 1);
		    }
		}
		seg.resize(anchor, scale);
		seg.freeze_transform();
		if (Insert.index_side != -1){
		    for (var k = 0; k < GroupExp.data_sqrt.length; k++) {
			var seg_temp_sqrt = GroupExp.data_sqrt[k].sqrt;
			if (seg.set_id == seg_temp_sqrt[0].set_id) {
			    for (var l = 0; l < GroupExp.data_sqrt[k].left_sqrt.length; l++) {
				var seg_left = GroupExp.data_sqrt[k].left_sqrt[l];
				if (seg_left.worldMaxPosition().x + 10 >= seg.worldMinPosition().x) {
				    temp_left = GroupExp.data_sqrt[k].left_sqrt.clone();
				    var maxs_trans = this.getSizeStroke(temp_left[temp_left.length - 1].set_id);
				    for (var m = 0; m < temp_left.length; m++) {
				       var seg_trans = temp_left[m];
		               seg_trans.translate(new Vector2(-(maxs_trans[1].x + 10 - seg.worldMinPosition().x), 0));
		               seg_trans.render();
		               this.updateEditorSegments(seg_trans);//g added
				    }
				}
			    }
			    for (var l = 0; l < GroupExp.data_sqrt[k].right_sqrt.length; l++) {
				var seg_right = GroupExp.data_sqrt[k].right_sqrt[l];
				if (seg_right.worldMinPosition().x - 10 <= seg.worldMaxPosition().x) {
				    temp_right = GroupExp.data_sqrt[k].right_sqrt.clone();
				    var maxs_trans = this.getSizeStroke(temp_right[0].set_id);
				    for (var m = 0; m < temp_right.length; m++) {
		               var seg_trans = temp_right[m];
		               seg_trans.translate(new Vector2(seg.worldMaxPosition().x - maxs_trans[0].x + 10, 0));
		               seg_trans.render();
		               this.updateEditorSegments(seg_trans);//g added
				    }
				}
			    }
			}
		    }
		}
            }
        }

	if (Insert.index_side != -1){
/*//g rm	   
	    var temp_main_size = GroupExp.data_frac[Insert.index_side[0]].numerator.concat(this.segments_selected);
	    temp_main_size = temp_main_size.concat(GroupExp.data_frac[Insert.index_side[0]].denominator);
	    this.main_side = temp_main_size.clone();
*/	    
	   this.main_side = this.main_side.concat(this.segments_selected);
	    var temp_size_main = this.getSize(this.main_side);
	    var temp_size_frac = this.getSize(GroupExp.data_frac[Insert.index_side[0]].frac);
	    var center_size_main = this.getCenterSide(temp_size_main[0], temp_size_main[1]);
	    var center_size_frac = this.getCenterSide(temp_size_frac[0], temp_size_frac[1]);
	    for (var i = 0; i < this.main_side.length; i++) {
//g start
	       /*
	       var seg = this.main_side[i];
	       seg.translate(new Vector2(center_size_frac[0] - center_size_main[0], 0));
	       seg.render();
	       this.updateEditorSegments(seg);//g added
	       */
	       var list = GroupExp.selected.filter(function(v) {
	          return v.instance_id === seg.instance_id;});
	       if(list.length == 0)
//g end   
	          GroupExp.selected.push(seg);
	    }
	    GroupExp.selected = GroupExp.selected.concat(GroupExp.data_frac[Insert.index_side[0]].frac);
	    this.selected_bb.translate(new Vector2(center_size_frac[0] - center_size_main[0], 0));
	    if (temp_size_main[2].x > temp_size_frac[2].x){
	       this.setZoom(GroupExp.data_frac[Insert.index_side[0]].frac, new Vector2(temp_size_main[2].x /temp_size_frac[2].x, temp_size_main[2].x /temp_size_frac[2].x));
	    }
	    Insert.index_side = -1;//g added
	}
	
    },
//g start    
    updateEditorSegments: function(seg){
       for (var j = 0; j < Editor.segments.length; j++) {
          var originSeg = Editor.segments[j];
          if(originSeg.instance_id == seg.instance_id){
             originSeg.translation = seg.translation;
             originSeg.world_mins  = seg.world_mins;
             originSeg.scale       = seg.scale;
             originSeg.points      = seg.points;
             
             break;
          }
       }
    },
//g end    
    render: function(){
        this.checkSide();
	this.getMainSide();
	this.getLeftRight();
	this.getInsert();
    }
};

Insert.getInput = function(){
    delete Insert.input_segments;
    Insert.input_segments = new Array();
    SysEquations.SaveExpressions();
    if (SysEquations.Expressions.length == 1){
	Insert.input_segments = SysEquations.Expressions[0];
    }
    else {
	for (var i = 0; i < SysEquations.Expressions.length; i++){
	    var sys_exp = SysEquations.Expressions[i];
	    for (var k = 0; k < sys_exp.length; k++){
		var seg = sys_exp[k];
		if (seg.set_id == Editor.selected_segments[0].set_id){
		    Insert.input_segments = SysEquations.Expressions[i];
		    return;
		}
	    }
	}
    }
}

Insert.action = function(){
    Insert.getInput();
    delete GroupExp.data_frac;
    GroupExp.data_frac = new Array();
    delete GroupExp.data_sqrt;
    GroupExp.data_sqrt = new Array();
    GroupExp.landmark_left_sqrt = 0;
    GroupExp.landmark_right_sqrt = window.innerWidth;
    GroupExp.list_main = GroupExp.detachment(Insert.input_segments, Editor.selected_segments).clone();
    GroupExp.getData();
    GroupExp.count_index = 0;
    var temp_selected_bb = Editor.selected_bb;
    var center = temp_selected_bb.getCenterBox();
    center[2] = new Vector2(Editor.mouse_position.x, center[1]);
    Insert.current = new Insert(GroupExp.list_main, Editor.selected_segments, temp_selected_bb, Editor.mouse_position.x, center[1], center[2]
				, Editor.interior, Editor.extend);
    Insert.current.render();
    
    while (Insert.index_side != -1){
       Insert.index_side = -1;
       GroupExp.selected_bb = GroupExp.getSize(GroupExp.selected);
       delete GroupExp.data_frac;
       GroupExp.data_frac = new Array();
       delete GroupExp.data_sqrt;
       GroupExp.data_sqrt = new Array();
       GroupExp.list_main = GroupExp.detachment(Insert.input_segments, GroupExp.selected).clone();
       GroupExp.getData();
       GroupExp.count_index = 0;
       var temp_selected_bb = GroupExp.selected_bb;
       var center = temp_selected_bb.getCenterBox();
       Insert.current = new Insert(GroupExp.list_main, GroupExp.selected, temp_selected_bb, center[0], center[1], center[2]
                    , Editor.interior, Editor.extend);
       Insert.current.render();
    }
    
//    Insert.index_side = -1;//g rm
    delete GroupExp.selected;
    GroupExp.selected = new Array();
};

//<<<<< Obj Expression
GroupExp = function(){
    this.frac;
    this.numerator;
    this.denominator;
    //==========
    this.sqrt;
    this.in_sqrt;
    this.distance_left;
    this.left_sqrt;
    this.right_sqrt;
};

GroupExp.prototype = {
    setFrac: function(frac, numerator, denominator){
	this.frac = frac;
	this.numerator = numerator;
	this.denominator = denominator;
    },
    setSqrt: function(sqrt, in_sqrt, distance_left, left_sqrt, right_sqrt){
	this.sqrt = sqrt;
	this.in_sqrt = in_sqrt;
	this.distance_left = distance_left;
	this.left_sqrt = left_sqrt;
	this.right_sqrt = right_sqrt;
    },
};

GroupExp.list_main = new Array();
GroupExp.data_frac = new Array();
GroupExp.data_sqrt = new Array();
GroupExp.landmark_left_sqrt = 0;
GroupExp.landmark_right_sqrt = window.innerWidth;
GroupExp.selected = new Array();
GroupExp.selected_bb = null;
GroupExp.count_index = 0;

GroupExp.detachment = function(segments, selected_segmets){
    var list_detach = new Array();
    for (var i = 0; i < segments.length; i++){
        var seg = segments[i];
        if (selected_segmets.contains(seg)){
            continue;
        }
        list_detach.push(seg);
    }
    return list_detach;
};

GroupExp.analysis = function(segments, selected_segmets){
    var temp_segments = segments.clone();
    var landmark = 0;
    for (var i = 0; i < temp_segments.length; i++){
        var seg = temp_segments[i];
        if (seg.worldMinPosition().x > landmark){
            if (seg.symbol == "_dash" || seg.symbol == "dash"
                || seg.symbol == "-" || seg.symbol == "frac") {
                var obj_temp_frac = GroupExp.getFrac(temp_segments, seg);
                if (obj_temp_frac[0].length == 0 && obj_temp_frac[1].length == 0){
                    //continue;
                }
                else {
                    landmark = seg.worldMaxPosition().x;
                    var temp_current_exp = new GroupExp();
		    temp_current_exp.setFrac(new Array(seg), obj_temp_frac[0], obj_temp_frac[1]);
                    GroupExp.data_frac.push(temp_current_exp);
                }
            }
        }
	if (seg.symbol == "sqrt"){
	    var obj_temp_sqrt = GroupExp.getSqrt(temp_segments, seg);
	    var temp_current_exp = new GroupExp();
	    temp_current_exp.setSqrt(new Array(seg), obj_temp_sqrt[0], obj_temp_sqrt[1], obj_temp_sqrt[2], obj_temp_sqrt[3]);
	    if (!GroupExp.data_sqrt.contains(temp_current_exp)){
		GroupExp.data_sqrt.push(temp_current_exp);
	    }
	}
    }
    return [GroupExp.data_frac, GroupExp.data_sqrt];
};

GroupExp.getData = function(){
    if (GroupExp.data_frac.length == 0){
	var temp_data = GroupExp.analysis(Gestures.Sort(GroupExp.list_main));
	if (temp_data[0].length > 0){
	    GroupExp.getData();
	}
    }
    else {
        var i = GroupExp.count_index;
        var temp_data = GroupExp.data_frac.clone();
        for (i; i < temp_data.length; i++){
            GroupExp.analysis(temp_data[i].numerator);
            GroupExp.analysis(temp_data[i].denominator);
            GroupExp.count_index++;
        }
        if (temp_data.length < GroupExp.data_frac.length){
            GroupExp.getData();
        }
    }
};

GroupExp.getFrac = function(segments, seg_frac){
    var temp_numerator = new Array();
    var temp_denominator = new Array();
    for (var i = 0; i < segments.length; i++){
        var seg = segments[i];
        if (seg.worldMinPosition().x > seg_frac.worldMinPosition().x - 5
            && seg.worldMaxPosition().x < seg_frac.worldMaxPosition().x + 5){
            if (seg.worldMaxPosition().y < seg_frac.worldMinPosition().y){
                temp_numerator.push(seg);
            }
            if (seg.worldMinPosition().y > seg_frac.worldMaxPosition().y){
                temp_denominator.push(seg);
            }
        }
    }
    return [temp_numerator, temp_denominator];
};

GroupExp.getSqrt = function(segments, seg_sqrt){
    var left = 0;
    var count = 0;
    var temp_in_sqrt = new Array();
    var temp_left_sqrt = new Array();
    var temp_right_sqrt = new Array();
    for (var i = 0; i < segments.length; i++){
        var seg = segments[i];
        if (seg.worldMinPosition().x > seg_sqrt.worldMinPosition().x
	    && seg.worldMaxPosition().x <= seg_sqrt.worldMaxPosition().x
	    && seg.worldMinPosition().y > seg_sqrt.worldMinPosition().y
	    && seg.worldMaxPosition().y <= seg_sqrt.worldMaxPosition().y){
	    var temp_left = seg.worldMinPosition().x - seg_sqrt.worldMinPosition().x;
	    if (count == 0){
		left = temp_left;
	    }
	    if (temp_left < left){
		left = temp_left;
	    }
	    temp_in_sqrt.push(seg);
	    count++;
	}
	if (seg.worldMaxPosition().x <= seg_sqrt.worldMinPosition().x
	    && seg.worldMinPosition().x > GroupExp.landmark_left_sqrt){
	    temp_left_sqrt.push(seg);
	    GroupExp.landmark_left_sqrt = seg.worldMinPosition().x;
	}
	if (seg.worldMinPosition().x >= seg_sqrt.worldMaxPosition().x){
	    //&& seg.worldMaxPosition().x < GroupExp.landmark_right_sqrt){
	    if (GroupExp.lockRightSqrt(seg.set_id)){
		temp_right_sqrt.push(seg);
	    }
	    //GroupExp.landmark_right_sqrt = seg.worldMaxPosition().x;
	}
    }
    return [temp_in_sqrt, left, temp_left_sqrt, temp_right_sqrt];
};

GroupExp.lockRightSqrt = function(set_id){
    for (var k = 0; k < GroupExp.data_sqrt.length; k++) {
	var root_sqrt = GroupExp.data_sqrt[k].right_sqrt;
	for (l = 0; l < root_sqrt.length; l++) {
	    var seg = root_sqrt[l];
	    if (seg.set_id == set_id){
		return false;
	    }
	}
    }
    return true;
}

GroupExp.getSize = function(segments) {
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
    return new BoundingBox(mins, maxs, new Vector2(0, 0), new Vector2(0, 0));
};