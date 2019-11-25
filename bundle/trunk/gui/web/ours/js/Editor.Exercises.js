AddNode = function(in_stroke, equations){
    this.in_stroke = in_stroke;
    this.equations = equations;
    this.scale = new Vector2(0.6, 0.6);
    this.trans = new Vector2(0, 0);
    this.min = new Vector2(-1 ,-1);
    this.max = new Vector2(-1, -1);
    this.in_exercises = new Array();
    Box.selected = new Box(document.getElementById("box"));
};

AddNode.prototype = {
    //<<<<< tao node cha svg
    createSvg: function(){
        this.nodeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.nodeSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.nodeSvg.setAttribute("style", "position: absolute; left: 0px;");  // was "top: 0px"
        this.nodeSvg.setAttribute("width", "100%");
        this.nodeSvg.setAttribute("height", "100%");
        this.nodeSvg.setAttribute("class", "pen_stroke");
        this.nodeSvg.appendChild(this.createGroup());
        return this.nodeSvg;
    },
    
    //<<<<< tao the group chua the g cua stroke bai tap
    createGroup: function(){
	var height_content = document.getElementById("recExpr").offsetHeight;
	var obj_size = this.getSize(this.in_stroke);
        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var sb = new StringBuilder();
	sb.append("translate(").append(0).append(',').append(0).append(") ");
        sb.append("scale(").append(1).append(',').append(1).append(") ");
        
	var trans_y = (height_content - obj_size[2].y / (1/this.scale.x)) / 2;
	
	Exercises.top = obj_size[2].y / (1/this.scale.x);

	this.trans.x = -(obj_size[0].x / (1/this.scale.x)) + 10;
	//this.trans.y = (-(obj_size[0].y / (1/this.scale.x))) + trans_y;
	this.trans.y = -(obj_size[0].y / (1/this.scale.x));
	sb.append("translate(").append(this.trans.x).append(',').append(this.trans.y).append(") ");
        sb.append("scale(").append(this.scale.x).append(',').append(this.scale.y).append(") ");
        this.group.setAttribute("id", "group_exer");
	this.group.setAttribute("transform", sb.toString());
        this.group.setAttribute("style", "fill:none;stroke-linecap:round;");
        return this.group;
    },
    
    getSize: function(segments) {
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
    },
    
    //<<<<< dua root svg vao phan bai tap khi chon mot bai tap
    addCanvas: function(){
        this.renderMinMax();
        Editor.Exercises.content.appendChild(this.createSvg());
    },
    
    //<<<<< tinh min-max stroke
    renderMinMax: function(){
        for (var i = 0; i < this.in_stroke.length; i++){
            if (i == 0){
                this.min = new Vector2(this.in_stroke[i].worldMinPosition().x, this.in_stroke[i].worldMinPosition().y);
                this.max = new Vector2(this.in_stroke[i].worldMaxPosition().x, this.in_stroke[i].worldMaxPosition().y);
            }
            else {
                this.min.x = Math.min(this.in_stroke[i].worldMinPosition().x, this.min.x);
                this.min.y = Math.min(this.in_stroke[i].worldMinPosition().y, this.min.y);
                this.max.x = Math.max(this.in_stroke[i].worldMaxPosition().x, this.max.x);
                this.max.y = Math.max(this.in_stroke[i].worldMaxPosition().y, this.max.y);
            }
            
        }
        /*this.trans.x = -(this.scale.x * this.min.x) + 15;
        var temp_y = Editor.Exercises.content.offsetHeight;
        var temp_scale_y = (this.max.y - this.min.y);
        if (temp_y > temp_scale_y) {
            this.trans.y = ((temp_scale_y/2) * this.scale.y) - 15;
        }*/
    },
    
    //<<<<< dua tung tung stroke vao the group
    addElement: function(){
        var k = 0;
	for (var l = 0; l < this.equations.length; l++){
	    var exp = this.equations[l];
	    for (var i = 0; i < exp.length; i++) {
		var elem = exp[i].element.cloneNode(true);
		var stroke_temp = Editor.get_segment_by_id(exp[i].set_id);
		var recognition_result = RecognitionManager.getRecognition(exp[i].set_id);
		if (stroke_temp.length == 1) {
		    k++;
		    this.getOperator(k, exp[i], elem, exp[i].worldMinPosition(), exp[i].worldMaxPosition(), recognition_result.symbols);
		} else {
		    if (i > 0) {
			if (!stroke_temp.contains(exp[i - 1])) {
			    k++;
			}
		    }
		    var get_min_max = this.calBounding(stroke_temp);
		    this.getOperator(k, exp[i], elem, get_min_max[0], get_min_max[1], recognition_result.symbols);
		}
		this.group.appendChild(elem);
	    }
	}
        
    },
    
    // lay tung toan tu dua vao bai tap
    getOperator: function(id, operator, element, min_bb, max_bb, symbols){
        var obj = new SaveOperator(id, operator, element, min_bb, max_bb, symbols);
        this.in_exercises.push(obj);
    },
    
    // tinh vung bao phu stroke of group
    calBounding: function(stroke){
        var save = new Array();
        var min = new Vector2(0, 0);
        var max = new Vector2(0, 0);
        for (var i = 0; i < stroke.length; i++){
            if (i == 0) {
                min = new Vector2(stroke[i].worldMinPosition().x, stroke[i].worldMinPosition().y);
                max = new Vector2(stroke[i].worldMaxPosition().x, stroke[i].worldMaxPosition().y);
            } else {
                min.x = Math.min(min.x, stroke[i].worldMinPosition().x);
                min.y = Math.min(min.y, stroke[i].worldMinPosition().y);
                max.x = Math.max(max.x, stroke[i].worldMaxPosition().x);
                max.y = Math.max(max.y, stroke[i].worldMaxPosition().y);
            }
        }
        save.push(min, max);
        return save;
    },
    
    //<<<<< mau stroke bai tap khong chon;
    renderNone: function(stroke){
        for (var i = 0; i < stroke.length; i++){
            stroke[i].element.firstChild.setAttribute("style", "stroke:" + Editor.segment_color + ";stroke-width:" + Editor.stroke_width);
        }
    }
};

Editor.Exercises = function(in_stroke, equations){
    this.in_stroke = in_stroke;
    this.equations = equations;
    this.node = null;
    this.exercises_current = new Array();
    this.group_exercises = new Array();
    this.flag = true;
};

Editor.Exercises.prototype = {
    // dua stroke bai tap vao
    importExercises: function(){
        this.node = new AddNode(this.in_stroke, this.equations);
        this.node.constructor = this.node;
        this.node.addCanvas();
        this.node.addElement();
        Editor.Exercises.initialize();
        Editor.initContextMenuStroke();
    },
    
    // xuat toan tu ra editor khi move
    exportsExercises: function(vec_position){
        this.group_exercises = new Array();
        var getId = new Array();
        var temp_stroke = new Array();
        var mins_bb = new Vector2(-1, -1);
        var maxs_bb = new Vector2(-1, -1);
        var count = 0;
        for (var i = 0; i < this.exercises_current.length; i++){
            if(getId.contains(this.exercises_current[i].id)){
                continue;
            }
            this.group_exercises = new Array();
            var getId = new Array();
            var result = Editor.Exercises.getId(this.exercises_current[i].id, this.exercises_current);
            for (var k = 0; k < result.length; k++){
                var stroke = result[k].operator;
                var point = stroke.points;
                for (var l = 0; l < point.length; l++) {
                    var temp_point = Vector2.Add(stroke.world_mins, point[l]);
                    if (l == 0) {
                        var exer = new PenStroke(temp_point.x, temp_point.y, 6);
                        Editor.add_segment(exer);
                        this.group_exercises.push(exer);
                    }
                    exer.add_point(temp_point);
                }
                exer.finish_stroke(exer.world_mins, exer.scale);
                var recognition_result = result[k].symbols;
                getId.push(result[k].id);
                temp_stroke.push(exer);
                if (count == 0){
                    mins_bb = exer.worldMinPosition();
                    maxs_bb = exer.worldMaxPosition();
                }
                else {
                    mins_bb.x = Math.min(mins_bb.x, exer.worldMinPosition().x);
                    mins_bb.y = Math.min(mins_bb.y, exer.worldMinPosition().y);
                    maxs_bb.x = Math.max(maxs_bb.x, exer.worldMaxPosition().x);
                    maxs_bb.y = Math.max(maxs_bb.y, exer.worldMaxPosition().y);
                }
                count++
            }
            var g = new Group();
            g.AddList(Formula.Copy(this.group_exercises, recognition_result, new Array(1), false));
        }
        
	var avg = Keyboard.getAvgHeight();
        var g_size_y = maxs_bb.y - mins_bb.y;
        
	var trans = new Vector2.Add(mins_bb, maxs_bb);
	trans = new Vector2(trans.x / 2, trans.y / 2);
	trans = Vector2.Subtract(vec_position, trans);
	
	if (avg > 0) {
            var scale = g_size_y / avg;
            if (temp_stroke.length == 1){
                var recognition_result = RecognitionManager.getRecognition(temp_stroke[0].set_id);
                if (recognition_result.symbols[0] == "-" || recognition_result.symbols[0] == "_dash"){
                    scale = 2;
                }
            }
	    scale = new Vector2(1 / scale, 1 / scale);
	    var anchor = new Vector2((maxs_bb.x + mins_bb.x) / 2, (maxs_bb.y + mins_bb.y) / 2);
	    for (var i = 0; i < temp_stroke.length; i++){
		var seg = temp_stroke[i];
		seg.resize(anchor, scale);
		seg.freeze_transform();
		seg.render();
	    }
        }
        
	for (var i = 0; i < temp_stroke.length; i++){
            temp_stroke[i].translate(trans);
            temp_stroke[i].render();
        }
	
        var action = new ActionSegments(temp_stroke, true, Editor.CopySegments);
        Editor.add_action(action);
        Editor.Exercises.current.node.renderNone(Editor.Exercises.current.exercises_current);
        Box.selected = new Box(document.getElementById("box"));
        this.exercises_current = new Array();
        //RenderManager.render();
    },
    
    // lay gia tri toan tu thoa man khi click
    getVaule: function(exercises){
        this.exercises_current = exercises;
        return this.exercises_current;
    },
};

SaveOperator = function(id, operator, element, min_bb, max_bb, symbols){
    this.operator = operator;
    this.id = id;
    this.element = element;
    this.min_bb = min_bb;
    this.max_bb = max_bb;
    this.symbols = symbols;
}

//<<<<< kiem tra phan tu trung set_id
Editor.Exercises.getId = function(id, in_array) {
    var result = new Array();
    for (var k = 0; k < in_array.length; k++) {
        if (in_array[k].id == id) result.push(in_array[k]);
    }
    return result;
}

//<<<<< kiem tra diem click nam trong vung toan tu
Editor.Exercises.getCollidesInStroke = function(vec_click) {
    if (Editor.Exercises.current == null){
	return [];
    }
    var node = Editor.Exercises.current.node;
    var temp_tran = node.trans;
    var temp_scale = node.scale;
    exercises = node.in_exercises;
    var count = 0;
    var result = new Array();
    Box.selected = new Box(document.getElementById("box"));
    for (var k = 0; k < exercises.length; k++) {
        var min = Vector2.Add(Vector2.Pointwise(exercises[k].min_bb, temp_scale), new Vector2(temp_tran.x, temp_tran.y));
        var max = Vector2.Add(Vector2.Pointwise(exercises[k].max_bb, temp_scale), new Vector2(temp_tran.x, temp_tran.y));
	if (min.x <= vec_click.x && max.x >= vec_click.x && min.y <= vec_click.y && max.y >= vec_click.y) {
	    count++;
            if (count >= 2 && exercises[k - 1].id != exercises[k].id){
                node.renderNone(result);
                result = new Array();
            }
            Box.selected.renderCollides(0, min, max);
            exercises[k].element.firstChild.setAttribute("style", "stroke:" + Editor.selected_segment_color + ";stroke-width:" + Editor.selected_stroke_width);
            result.push(exercises[k]);
        }
    }
    return result;
}

//<<<<< kiem tra vung hinh chu nhat bao phu toan tu
Editor.Exercises.getRectangleCollides = function(corner_a, corner_b) {
    var node = Editor.Exercises.current.node;
    var temp_tran = node.trans;
    var temp_scale = node.scale;
    exercises = node.in_exercises;
    var result = new Array();
    var rect_min = new Vector2();
    var rect_max = new Vector2();
    for (var k = 0; k < exercises.length; k++) {
        var exer = exercises[k];
        var min = Vector2.Add(Vector2.Pointwise(exer.min_bb, temp_scale), temp_tran);
        var max = Vector2.Add(Vector2.Pointwise(exer.max_bb, temp_scale), temp_tran);
	rect_min.x = Math.min(corner_a.x, corner_b.x);
	rect_min.y = Math.min(corner_a.y, corner_b.y);
	rect_max.x = Math.max(corner_a.x, corner_b.x);
	rect_max.y = Math.max(corner_a.y, corner_b.y);
        if (min.x > rect_min.x && max.x < rect_max.x && min.y > rect_min.y && max.y < rect_max.y){
            result.push(exer);
                exer.element.firstChild.setAttribute("style", "stroke:" + Editor.selected_segment_color + ";stroke-width:" + Editor.selected_stroke_width);
        }
        else {
            exer.element.firstChild.setAttribute("style", "stroke:" + Editor.segment_color + ";stroke-width:" + Editor.stroke_width);
        }
    }
    Editor.Exercises.renderBoxRec(result);
    return result;
}

Editor.Exercises.renderBoxRec = function(exercises){
    var node = Editor.Exercises.current.node;
    var temp_tran = node.trans;
    var temp_scale = node.scale;
    Box.selected = new Box(document.getElementById("box"));
    for (var i = 0; i < exercises.length; i++){
        var min = Vector2.Add(Vector2.Pointwise(exercises[i].min_bb, temp_scale), temp_tran);
        var max = Vector2.Add(Vector2.Pointwise(exercises[i].max_bb, temp_scale), temp_tran);
        Box.selected.renderCollides(i, min, max);
    }
}

//<<<<< khoi tao bien
Editor.Exercises.rootNode = null;
Editor.Exercises.current = null;
Editor.Exercises.content = document.getElementById("recExpr");
Editor.Exercises.change_layout = -1;
Editor.Exercises.touchable = 'createTouch' in document;
var pos = new Vector2(-1, -1);
var pos1 = new Vector2(-1, -1);

//<<<<< dang ky su kien 
Editor.Exercises.initialize = function(){
    if (Editor.Exercises.touchable){
        Editor.Exercises.content.addEventListener('touchstart', Editor.Exercises.onStart, false);
        Editor.Exercises.content.addEventListener('touchmove', Editor.Exercises.onMove, false);
    }
    else {
        Editor.Exercises.content.addEventListener("mousedown", Editor.Exercises.onStart, false );
        Editor.Exercises.content.addEventListener("mousemove", Editor.Exercises.onMove, false);
    }
}

//<<<<< bat dau su kien
Editor.Exercises.onStart = function(e){
    if (Editor.Exercises.current == null)
        return;
    var left;
    if (Editor.Exercises.change_layout == "left"){
	left = document.getElementById("exprHistory").offsetWidth;
    }
    else if (Editor.Exercises.change_layout == "right"){
	left = document.getElementById("exprHistory").offsetWidth + document.getElementById("toolbar").offsetWidth;
    }
    var top = document.getElementById("log").offsetHeight;
    Editor.clear_selected_segments();
    Editor.Exercises.current.flag = true;
    Editor.rectangleSelectionTool();
    for (var i = 0; i < Editor.segments.length; i++){
        Editor.segments[i].render();
    }
    for (var m = 0; m < RenderManager.segment_set_divs.length; m++) {
        var sss_div = RenderManager.segment_set_divs[m];
        sss_div.style.visibility = "hidden";
        sss_div.style.background = "none";
        sss_div.style.border = "1px solid green";
    }
    if (Editor.using_mobile){
            pos = new Vector2(e.touches[0].clientX - left, e.touches[0].clientY - top);
    }
    else {
        pos = new Vector2(e.clientX - left, e.clientY - top);
    }
    if (Box.selected.clickCollides(pos)){
        return;
    }
    else {
        if (Editor.Exercises.current.exercises_current.length > 0){
            Editor.Exercises.current.node.renderNone(Editor.Exercises.current.exercises_current);
        }
        if (Editor.Exercises.current.getVaule(Editor.Exercises.getCollidesInStroke(pos)).length > 0){
            return;
        }
        else if (Editor.using_mobile){
            if (e.touches.length == 2 || e.changedTouches.length == 2){
                Editor.Exercises.current.flag = false;
                Editor.Exercises.current.getVaule(Editor.Exercises.getCollidesInStroke(new Vector2(-1, -1)));
                pos = new Vector2(e.touches[0].clientX - left, e.touches[0].clientY - top);
                pos1 = new Vector2(e.touches[1].clientX - left, e.touches[1].clientY - top);
                Box.selected.renderRec(pos, pos1, document.getElementById("select_rec"));
            }
        }
    }
}

//<<<<< thuc hien su kien
Editor.Exercises.onMove = function(e){
    if (Editor.Exercises.current == null)
        return
    if (Editor.using_mobile){
        if (Editor.Exercises.current.flag) {
            if (e.touches.length == 1 && Editor.Exercises.current.exercises_current.length == 0) {
                return;
            }
        }
        else if (e.touches.length == 2){
            Editor.Exercises.current.flag = false;
        }
    }
    else if (Editor.Exercises.current.exercises_current.length == 0 && !Editor.using_mobile)
        return;
    var left;
    if (Editor.Exercises.change_layout == "left"){
	left = document.getElementById("exprHistory").offsetWidth;
    }
    else if (Editor.Exercises.change_layout == "right"){
	left = document.getElementById("exprHistory").offsetWidth + document.getElementById("toolbar").offsetWidth;
    }
    var top = document.getElementById("log").offsetHeight;
    if (Editor.using_mobile){
        if (e.touches.length == 1){
            pos = new Vector2(e.touches[0].clientX - Editor.div_position[0], e.touches[0].clientY - Editor.div_position[1]);
        }
        else if (e.touches.length == 2) {
            pos = new Vector2(e.touches[0].clientX - left, e.touches[0].clientY - top);
            pos1 = new Vector2(e.touches[1].clientX - left, e.touches[1].clientY - top);
            Box.selected.renderRec(pos, pos1, document.getElementById("select_rec"));
            Editor.Exercises.current.flag = false;
        }
    }
    else {
        pos = new Vector2(e.clientX - Editor.div_position[0], e.clientY - Editor.div_position[1]);
    }
    Editor.mouse_position = pos;
}

Editor.Exercises.renderPosition = function(){    
    if (Editor.Exercises.current == null){
	return;
    }
    
    Editor.Exercises.current.node.renderNone(Editor.Exercises.current.exercises_current);
    Box.selected = new Box(document.getElementById("box"));
    delete Editor.Exercises.current.exercises_current;
    Editor.Exercises.current.exercises_current = new Array();
    
    var node_group = document.getElementById("group_exer");
    var trans = Editor.Exercises.current.node.trans;
    var scale = Editor.Exercises.current.node.scale;
    var height_content = document.getElementById("recExpr").offsetHeight;
    var size_exer = Vector2.Subtract(Editor.Exercises.current.node.max, Editor.Exercises.current.node.min);
    var sb = new StringBuilder();
    sb.append("translate(").append(0).append(',').append(0).append(") ");
    sb.append("scale(").append(1).append(',').append(1).append(") ");

    var trans_y = (height_content - size_exer.y / (1 / scale.x)) / 2;
    //trans.y = (-(Editor.Exercises.current.node.min.y / (1 / scale.x))) + trans_y;
    sb.append("translate(").append(trans.x).append(',').append(trans.y).append(") ");
    sb.append("scale(").append(scale.x).append(',').append(scale.y).append(") ");    
    node_group.setAttribute("transform", sb.toString());
    node_group.setAttribute("style", "fill:none;stroke-linecap:round;");
    
    var exercises = Editor.Exercises.current.node.in_exercises;
    for (var k = 0; k < exercises.length; k++) {
        var exer = exercises[k];
        exer.element.firstChild.setAttribute("style", "stroke:" + Editor.segment_color + ";stroke-width:" + Editor.stroke_width);
    }
}

Editor.Exercises.action = function(){
    if (Editor.Exercises.current == null)
	return;
    if (Editor.Exercises.current.flag){
        if (Editor.Exercises.current.exercises_current.length == 0)
            return;
    }
    if (Editor.mouse_position.y > 0 && Editor.Exercises.current.flag){
	Editor.Exercises.current.exportsExercises(Editor.mouse_position);
    }
    else if (!Editor.Exercises.current.flag){
        if (document.getElementById("select_rec").style.visibility == "visible"){
	    Editor.Exercises.current.getVaule(Editor.Exercises.getRectangleCollides(pos, pos1));
            document.getElementById("select_rec").style.visibility = "hidden";
        }
    }
}

//<<<<< Box
Box = function(element){
    this.vec_min = new Vector2(-1, -1);
    this.vec_max = new Vector2(-1, -1);
    this.element = element;
    this.element.style.visibility = "hidden";
}

Box.start = null;
Box.end = null;
Box.selected = null;

Box.prototype = {
    //<<<<< tinh min - max trong vung box
    renderCollides: function(index, min, max){
        if (index == 0){
            this.vec_min = new Vector2(min.x, min.y);
            this.vec_max = new Vector2(max.x, max.y);
        }
        else{
            this.vec_min.x = Math.min(this.vec_min.x, min.x);
            this.vec_min.y = Math.min(this.vec_min.y, min.y);
            this.vec_max.x = Math.max(this.vec_max.x, max.x);
            this.vec_max.y = Math.max(this.vec_max.y, max.y);
        }
        this.renderStyle();
    },
    
    //<<<<< kiem tra diem click trong vung box
    clickCollides: function(click) {
        if (click.x < this.vec_min.x) return false;
        if (click.x > this.vec_max.x) return false;
        if (click.y < this.vec_min.y) return false;
        if (click.y > this.vec_max.y) return false;
        return true;
    },
    
    //<<<<< render css - style
    renderStyle: function(){
        this.element.style.top = (this.vec_min.y - Editor.stroke_width) + "px";
        this.element.style.left = (this.vec_min.x - Editor.stroke_width) + "px";
        this.element.style.width = (this.vec_max.x - this.vec_min.x + (Editor.stroke_width)) + "px";
        this.element.style.height = (this.vec_max.y - this.vec_min.y + (Editor.stroke_width)) + "px";
        this.element.style.visibility = "visible";
    },
    
    //<<<<< render hinh chu nhat
    renderRec: function(in_min, in_max, element) {
        var left = Math.min(in_min.x, in_max.x);
        var right = Math.max(in_min.x, in_max.x);
        var top = Math.min(in_min.y, in_max.y);
        var bottom = Math.max(in_min.y, in_max.y);
        element.style.top = top + "px";
        element.style.left = left + "px";
        element.style.width = (right - left) + "px";
        element.style.height = (bottom - top) + "px";
        element.style.visibility = "visible";
        Editor.Exercises.getRectangleCollides(in_min, in_max);
    }
};
