function CollisionManager() {

}

CollisionManager.initialize = function() {

}

//<<<<< xac dinh diem ngon tay nam trong vung stroke
CollisionManager.get_point_collides_bb = function(click_point) {
	var result = new Array();
	var already_examined = new Array();
	for (var k = 0; k < Editor.segments.length; k++) {
		var segment = Editor.segments[k]
		// do a check to make suer we don't do same check multiple times
		if (already_examined[segment.set_id] != true) {
			already_examined[segment.set_id] = true;
			// find extents of entire segment set
			var segment_set = Editor.get_segment_by_id(segment.set_id)
			var min = segment_set[0].worldMinPosition();
			var max = segment_set[0].worldMaxPosition();
			for (var j = 1; j < segment_set.length; j++) {
				var new_min = segment_set[j].worldMinPosition();
				var new_max = segment_set[j].worldMaxPosition();
				min.x = Math.min(new_min.x, min.x);
				min.y = Math.min(new_min.y, min.y);
				max.x = Math.max(new_max.x, max.x);
				max.y = Math.max(new_max.y, max.y);
			}
			// do collision check
			if (min.x <= click_point.x && max.x >= click_point.x && min.y <= click_point.y && max.y >= click_point.y) {
				result.push(Editor.segments[k]);
			}
		}
	}
	return result;
}
//
CollisionManager.getDash = function(){
	var result = new Array();
	var min = new Vector2(0, 0);
	var max = new Vector2(0, 0);
	for (var k = 0; k < Editor.segments.length; k++) {
		var seg = Editor.segments[k];
		if (seg.symbol == "_dash" || seg.symbol == "-" || seg.symbol == "frac" || seg.symbol =="plus"){
			min = new Vector2(seg.worldMinPosition().x - 7.5, seg.worldMinPosition().y - 15);
			max = new Vector2(seg.worldMaxPosition().x + 7.5, seg.worldMaxPosition().y + 15);
			if (Editor.mouse_position.x > min.x && Editor.mouse_position.y > min.y
			    && Editor.mouse_position.x < max.x && Editor.mouse_position.y < max.y){
				result.push(seg);
				break;
			}
		}
	}
	return result;
}

//<<<<< xac dinh diem ngon tay thuoc diem cua stroke
CollisionManager.get_point_collides = function(click_point) {
	var result = new Array();
	//disable collision if 3dtouch is ON
	if(Editor.OneTouch == false) return result;
	
	//var flag = false;
	for (var k = 0; k < Editor.segments.length; k++) {
		var seg = Editor.segments[k];
		if (seg.point_collides(click_point)){
			//if (seg.symbol == "_dash" || seg.symbol == "-"){
			//	flag = true;
			//}
			result.push(seg);
		}
	}
	//if (result.length == 0 || (result.length == 1 && flag)){
	//	result = new Array();
	//	result = CollisionManager.getDash();
	//}
	return result;
}

//<<<<< duong ve cua nut stroke debug(xac dinh diem ve cham voi stroke)
CollisionManager.get_line_collides = function(point_a, point_b) {
	var result = new Array();
	for (var k = 0; k < Editor.segments.length; k++) {
		var seg = Editor.segments[k];
		if (seg.line_collides(point_a, point_b)) result.push(seg);
	}
	return result;
}

//<<<<< xac dinh toa do hai ngon tay bao phu stroke
CollisionManager.get_rectangle_collides = function(corner_a, corner_b) {
	var result = new Array();
	for (var k = 0; k < Editor.segments.length; k++) {
		var seg = Editor.segments[k];
		if (seg.rectangle_collides(corner_a, corner_b)) result.push(seg);
	}
	return result;
}