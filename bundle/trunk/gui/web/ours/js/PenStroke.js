// implements Segment
// points are stored in local space
/*
* lec & ric definition:
*                       bounding box
* worldMinPosition -->  +---+
* = left corner =lec    |   |
*                       +---+ <-- worldMaxPosition
*                                 = right corner = ric
*/
PenStroke.count = 0;
PenStroke.type_id = 2;

function PenStroke(in_x, in_y, in_line_width) {
	// identifiers to build unique id
	this.instance_id = Segment.count++;
	this.type_id = PenStroke.type_id;
	this.set_id = Segment.set_count++;
	// line width
	this.line_width = in_line_width;
	this.line_half_width = this.line_width / 2;
	this.collision_radius = this.line_width / 2.0 * 2.25;
	this.squared_collision_radius = this.collision_radius * this.collision_radius*Editor.AuraThickness;
	// layer information
	this.layer = 0;
	this.savePoints = new Array(); //Luu lai cac diem da duoc ve
	this.points = new Array();
	this.points.push(new Vector2(in_x, in_y));
	this.savePoints.push(new Vector2(in_x, in_y));
	//this.pointsZoom = new Array();
	// transform information
	this.scale = new Vector2(1.0, 1.0);
	this.translation = new Vector2(0.0, 0.0);
	this.temp_scale = new Vector2(1.0, 1.0);//(1.0, 1.0);
	this.temp_translation = new Vector2(0.0, 0.0);
	// used to determine extents
	this.size = new Vector2(0.0, 0.0);
	this.world_mins = new Vector2(in_x, in_y);
	this.world_maxs = new Vector2(in_x, in_y);
	this.color = Editor.segment_color;
	this.stroke_width = Editor.stroke_width;
	// if true we need to update the SVG transform
	this.dirty_flag = false;
	this.element = null;
}

PenStroke.prototype = {
	//<<<<< khong dung
	update_extents : function() {
		return;
		this.prev_draw_min = this.worldMinDrawPosition();
		this.prev_draw_max = this.worldMaxDrawPosition();
		// because scale can be negative, this gives us opposing corners, not mins and maxs
		var corner_a = new Vector2(0, 0).transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		var corner_b = Vector2.Add(corner_a, Vector2.Pointwise(Vector2.Pointwise(this.size, this.scale), this.temp_scale));
		// figure out the actual mins and maxs based on absolute position
		if (corner_a.x < corner_b.x) {
			this.world_mins.x = corner_a.x;
			this.world_maxs.x = corner_b.x;
		} else {
			this.world_mins.x = corner_b.x;
			this.world_maxs.x = corner_a.x;
		}
		if (corner_a.y < corner_b.y) {
			this.world_mins.y = corner_a.y;
			this.world_maxs.y = corner_b.y;
		} else {
			this.world_mins.y = corner_b.y;
			this.world_maxs.y = corner_a.y;
		}	
	},
	//<<<<< min stroke
	worldMinPosition : function() {
		var min = new Vector2(0, 0).transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		var max = this.size.transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		return new Vector2(Math.min(min.x, max.x), Math.min(min.y, max.y));
	},
	
	///theo yeu cau cua a truc
	lec : function(){ return this.worldMinPosition(); },
	ric : function(){ return this.worldMaxPosition(); },
	
	//<<<<< min stroke + do day
	worldMinDrawPosition : function() {
		var result = this.worldMinPosition();
		result.x -= this.line_width;
		result.y -= this.line_width;
		return result;
	},

	//<<<<< max stroke
	worldMaxPosition : function() {
		var min = new Vector2(0, 0).transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		var max = this.size.transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		return new Vector2(Math.max(min.x, max.x), Math.max(min.y, max.y));
	},

	//<<<<< max stroke + do day
	worldMaxDrawPosition : function() {
		var result = this.worldMaxPosition();
		result.x += this.line_width;
		result.y += this.line_width;
		return result;
	},

	//<<<<< dua diem hien tai vao mang point trong qua trinh ve
	add_point : function(point_position) {
		// just add the point to the list, render the line, and update the mins
		if ((point_position.y <= ResizeTo.height_canvas && point_position.y >= 0 && point_position.x <= ResizeTo.width_canvas && point_position.x >= 0)
		    || Editor.state == 2) {
			this.points.push(point_position);
			this.savePoints.push(point_position);
			//this.pointsZoom.push(point_position);
			this.world_mins.x = Math.min(this.world_mins.x, point_position.x);
			this.world_mins.y = Math.min(this.world_mins.y, point_position.y);
			this.world_maxs.x = Math.max(this.world_maxs.x, point_position.x);
			this.world_maxs.y = Math.max(this.world_maxs.y, point_position.y);
			this.size = Vector2.Subtract(this.world_maxs, this.world_mins);
			// render
			var context = Editor.contexts[0];
			this.line_width = 3.5;
			if (Editor.state == 4 || Editor.state == 5) {
				if (Editor.set_color == true) {
					Editor.stroke_color = "#111111";
				} else if (Editor.set_color == false) {
					Editor.stroke_color = "white";
				}
			} else {
				if (Editor.set_color == true) {
					if (Editor.state == EditorState.MovingSegments) {
						Editor.stroke_color = "pink";
						this.line_width = 1.5;
					}
					else{
						Editor.stroke_color = "#111111";
					}
				} else if (Editor.set_color == false) {
					if (Editor.state == EditorState.MovingSegments) {
						Editor.stroke_color = "ghostWhite";
						this.line_width = 1.5;
					}
					else{
						Editor.stroke_color = "#111111";
					}
				}
			}
			context.strokeStyle = Editor.stroke_color;
			context.lineWidth = this.line_width;
			context.lineCap = "round";
			context.lineJoin = "round";
			var point_a = Vector2.Add(this.points[this.points.length - 2], this.translation);
			var point_b = Vector2.Add(this.points[this.points.length - 1], this.translation);
			context.beginPath();
			context.moveTo(point_a.x, point_a.y);
			context.lineTo(point_b.x, point_b.y);
			context.stroke();
			context.closePath();
		}
	},
	
	//cap nhat lai vi tri points khi segment di chuyen
	UpdatePoints : function(distance) {
		for (var k = 0; k < this.savePoints.length; k++) {
			this.savePoints[k] = Vector2.Add(this.savePoints[k], distance);
		}
		return this.savePoints;
	},

	//Ham kiem tra xem mot segment co thuoc trong duong tron cua segment phan tich ko
	Checkfinish_stroke : function(radius) {
		var bBool = false;
		var mins;
		var maxs;
		//Gestures.UpdateSegmentSplitChange();
		for (var k = 0; k < Editor.segmentSplits.length; k++) {
			if (Editor.segmentSplits[k].flag == true) {
				var kc = 0;
				var temp = false;
				var point = new Vector2(0, 0);
				var l = Editor.segmentSplits[k].points.length;
				if (l > 1) {
					mins = Editor.segmentSplits[k].points[0];
					maxs = Editor.segmentSplits[k].points[l - 1];
				} else
				break;
				//Ben trai
				if (Editor.segmentSplits[k].status == false) {
					kc = Math.abs(mins.y - radius);
				} else {
					kc = Math.abs(mins.y + radius)
				}
				point = new Vector2(mins.x, kc);
				//Left
				bBool = false;
				temp = Editor.segmentSplits[k].left;
				if (!temp) bBool = PenStroke.Check(radius, point, this.savePoints);
				if (bBool == true){
					Gestures.indexParentSplit = k;
					return true;
				}
				if (Editor.segmentSplits[k].status == false) {
					kc = Math.abs(maxs.y - radius);
				} else {
					kc = Math.abs(maxs.y + radius)
				}
				point = new Vector2(maxs.x, Math.abs(kc)); //tinh toa do tam
				//Right
				temp = Editor.segmentSplits[k].right;
				bBool = false;
				if (!temp) bBool = PenStroke.Check(radius, point, this.savePoints);
				if (bBool == true){
					Gestures.indexParentSplit = k;
					return true;
				}
				//center
				//chu V
				var center = Editor.segmentSplits[k].centerPoint;
				if (Editor.segmentSplits[k].status == false) {
					kc = Math.abs(center.y + radius);
				} else {
					kc = Math.abs(center.y - radius)
				}
				point = new Vector2(center.x, Math.abs(kc)); //tinh toa do tam			
				temp = Editor.segmentSplits[k].center;
				bBool = false;
				if (!temp) bBool = PenStroke.Check(radius, point, this.savePoints);
				if (bBool == true) {
					Gestures.indexParentSplit = k;
					return true;
				}
			}
		}
		return false;
	},

	//<<<<< ket thuc net ve
	finish_stroke : function(world_mins, world_scale, isValue) {
		if (Gestures.StrokeNotElementNS() == false || this.points.length < 2) {
			RenderManager.clear_canvas();
			return false;
		} else {
			// add svg and apply appropriate transform here
			var objSvg = null;
			if(Editor.svg == null)
				objSvg = document.getElementById("svgId");
			else
				objSvg = Editor.svg;
			// add svg and apply appropriate transform here
			var bBool = false;
			if(objSvg == null){
				objSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				objSvg.setAttribute("id", "svgId");
				objSvg.setAttribute("class", "pen_stroke");
				objSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
				objSvg.setAttribute("style", "position: absolute; left: 0px; top: 0px;");
				objSvg.setAttribute("width", "100%");
				objSvg.setAttribute("height", "100%");
				bBool = true;
			}		
			// build transform
			//this.translation = this.world_mins.clone();
			this.translation = world_mins;
			this.scale = world_scale;
			this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			var sb = new StringBuilder();
			//var sbx = new StringBuilder();
			//var sby = new StringBuilder();
			//sbx.append("toa do x: ");
			//sby.append("toa do y: ");
			sb.append("translate(").append(this.temp_translation.x).append(',').append(this.temp_translation.y).append(") ");
			sb.append("scale(").append(this.temp_scale.x).append(',').append(this.temp_scale.y).append(") ");
			sb.append("translate(").append(this.translation.x).append(',').append(this.translation.y).append(") ");
			sb.append("scale(").append(this.scale.x).append(',').append(this.scale.y).append(')');
			this.group.setAttribute("transform", sb.toString());
			this.group.setAttribute("style", "fill:none;stroke-linecap:round;");
			// build polyline
			this.polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			sb.clear();
			for (var k = 0; k < this.points.length; k++) {
				
				//var sss;
				this.points[k] = Vector2.Subtract(this.points[k], this.world_mins);
				//sss = this.points[k];
				if (this.points.length == 2 && (Editor.state == 2 || Editor.state == 3)) {
					if (k == 0) {
						this.points[k].x = 0.5;
						this.points[k].y = 0.5;
					}
				}
				sb.append(this.points[k].x).append(',').append(this.points[k].y).append(' ');
				//sbx.append(sss.x).append(',').append(' ');
				//sby.append(sss.y).append(',').append(' ');
			}
			//console.log("truoc: ");
			//console.log(sbx.toString());
			//console.log(sby.toString());
			this.polyline.setAttribute("points", sb.toString());
			this.polyline.setAttribute("style", "stroke:" + this.color + ";stroke-width:" + this.stroke_width);
			this.group.appendChild(this.polyline);
			objSvg.appendChild(this.group);
			if(bBool){
				objSvg.appendChild(Editor.createg());
				Editor.canvas_div.appendChild(objSvg);
			}
			//this.update_extents();
			this.root_svg = this.group;
			this.element = this.root_svg ;
			// clear the canvas
			if(isValue == null)
				RenderManager.clear_canvas();
		}
		return true;
	},

	//<<<<< thay doi mau va toa do
	private_render : function(in_color, in_width) {
		if (this.dirty_flag == false && this.color == in_color && this.stroke_width == in_width) return;
		
		
		this.dirty_flag = false;
		this.color = in_color;
		
		this.stroke_width = in_width;
		if (this.group != undefined) {
			var sb = new StringBuilder();
			sb.append("translate(").append(this.temp_translation.x).append(',').append(this.temp_translation.y).append(") ");
			sb.append("scale(").append(this.temp_scale.x).append(',').append(this.temp_scale.y).append(") ");
			sb.append("translate(").append(this.translation.x).append(',').append(this.translation.y).append(") ");
			sb.append("scale(").append(this.scale.x).append(',').append(this.scale.y).append(')');
			this.group.setAttribute("transform", sb.toString());
			// scale factor to give illusion of scale independent line width
			var mean_scale = (Math.abs(this.scale.x * this.temp_scale.x) + Math.abs(this.scale.y * this.temp_scale.y)) / 2.0;
			////console.log(this.stroke_width);
			this.polyline.setAttribute("style", "stroke:" + this.color + ";stroke-width:" + (this.stroke_width / mean_scale));
		}
	},

	// just draw using the given context
	render : function() {
		this.private_render(Editor.segment_color, Editor.stroke_width);
	},

	render_selected : function(in_context) {
		this.private_render(Editor.selected_segment_color, Editor.selected_stroke_width);
	},

	// determine if the passed in point (screen space) collides with our geometery
	//<<<<< tinh nguoc lai toa do point cua stroke so voi diem ngon tay
	point_collides : function(click_point) {
		var a = this.points[0].transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		if (Vector2.SquareDistance(click_point, a) < this.squared_collision_radius) return true;
		for (var k = 1; k < this.points.length; k++) {
			var b = this.points[k].transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
			if (Vector2.SquareDistance(click_point, b) < this.squared_collision_radius) return true; //ddo 130711 debug
			// from point 0 and point 1, do collision testing based on line width
			var ab = Vector2.Subtract(b, a);
			var ac = Vector2.Subtract(click_point, a);
			var t = Vector2.Dot(ac, ab) / Vector2.Dot(ab, ab);
			if (t > 0.0 && t < 1.0) {
				// calculate position of projected point
				var d = new Vector2(a.x + t * ab.x, a.y + t * ab.y);
				// if the project point and the click point are within the line radius, return true
				if (Vector2.SquareDistance(d, click_point) < this.squared_collision_radius) return true;
			}
			a = b;
		}
		return false;
	},

	//<<<<< kiem tra hai diem lien tuc net stroke (nut stroke debug)
	line_collides : function(point_a, point_b) {
		// compute closest pts between eacch line segment (modified page 149 of orange book)
		ClosestDistanceSegmentSegment = function(p1, q1, p2, q2) {
			Clamp = function(f, min, max) {
				if (f <= min) return min;
				if (f >= max) return max;
				return f;
			}
			var d1 = Vector2.Subtract(q1, p1);
			var d2 = Vector2.Subtract(q2, p2);
			var r = Vector2.Subtract(p1, p2);
			var a = Vector2.Dot(d1, d1);
			var e = Vector2.Dot(d2, d2);
			var f = Vector2.Dot(d2, r);
			var EPSILON = 0.0001;
			var s, t, c1, c2;
			if (a <= EPSILON && e <= EPSILON) {
				c1 = p1;
				c2 = p2;
				var c1c2 = Vector2.Subtract(c1, c2);
				return Vector2.Dot(c1c2, c1c2);
			}
			if (a <= EPSILON) {
				s = 0.0;
				t = f / e;
				t = Clamp(t, 0, 1);
			} else {
				var c = Vector2.Dot(d1, r);
				if (e <= EPSILON) {
					t = 0.0;
					s = Clamp(-c / a, 0, 1);
				} else {
					var b = Vector2.Dot(d1, d2);
					var denom = a * e - b * b;
					if (denom != 0) s = Clamp((b * f - c * e) / denom, 0, 1);
					else
					s = 0;
					t = (b * s + f) / e;
	
					if (t < 0) {
						t = 0;
						s = Clamp(-c / a, 0, 1);
					} else if (t > 1) {
						t = 1;
						s = Clamp((b - c) / a, 0, 1);
					}
				}
			}
			c1 = Vector2.Add(p1, Vector2.Multiply(s, d1));
			c2 = Vector2.Add(p2, Vector2.Multiply(t, d2));
			var c1c2 = Vector2.Subtract(c1, c2);
			return Vector2.Dot(c1c2, c1c2);
		}
		var a = point_a;
		var b = point_b;
		for (var k = 1; k < this.points.length; k++) {
			var c = this.points[k - 1].transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
			var d = this.points[k].transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
			var distance = ClosestDistanceSegmentSegment(a, b, c, d);
			if (ClosestDistanceSegmentSegment(a, b, c, d) <= this.line_width * 0.5) return true;
		}
		return false;
	},

	//<<<<< tinh nguoc diem point cua stroke nam trong vung 2 ngon tay
	rectangle_collides : function(in_corner_a, in_corner_b) {
		var rect_min = new Vector2();
		var rect_max = new Vector2();
		rect_min.x = Math.min(in_corner_a.x, in_corner_b.x);
		rect_min.y = Math.min(in_corner_a.y, in_corner_b.y);
		rect_max.x = Math.max(in_corner_a.x, in_corner_b.x);
		rect_max.y = Math.max(in_corner_a.y, in_corner_b.y);
		var stroke_min = this.worldMinPosition();
		var stroke_max = this.worldMaxPosition();
		// easy check to see we aren't colliding
		if (rect_max.x < stroke_min.x || rect_min.x > stroke_max.x) return false;
		if (rect_max.y < stroke_min.y || rect_min.y > stroke_max.y) return false;
		// now see if we double overlap
		if (stroke_min.x > rect_min.x && stroke_max.x < rect_max.x) return true;
		if (stroke_min.y > rect_min.y && stroke_max.y < rect_max.y) return true;
		for (var k = 0; k < this.points.length; k++) {
			var trans_point = this.points[k].transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
	
			if (trans_point.x >= rect_min.x && trans_point.x <= rect_max.x && trans_point.y >= rect_min.y && trans_point.y <= rect_max.y) return true;
		}
		return false;
	},

	// translate by this amount
	//<<<<< tinh vi tri stroke
	translate : function(in_offset) {
		this.translation.Add(in_offset);
		this.update_extents();
		this.dirty_flag = true;
	},
	
	//<<<<< tinh vi tri stroke + min + max + size
	resize : function(in_origin, in_scale) {
		this.temp_scale = new Vector2(in_scale.x, in_scale.y);
		this.temp_translation = Vector2.Subtract(in_origin, Vector2.Pointwise(in_origin, in_scale));
		this.update_extents();
		this.dirty_flag = true;
	},

	//<<<<< cap nhat point ket thuc zoom
	renewPoint: function (){
		var sbx = new StringBuilder();
		var sby = new StringBuilder();
		sbx.append("toa do x: ");
		sby.append("toa do y: ");
		for (var i = 0; i < this.points.length; i++){
			this.points[i] = Vector2.Pointwise(this.temp_scale, this.points[i]);
			//this.pointsZoom[i] = Vector2.Subtract(this.pointsZoom[i], this.world_mins);
			sbx.append(this.points[i].x).append(',').append(' ');
			sby.append(this.points[i].y).append(',').append(' ');
		}
		console.log("sau ");
		console.log(sbx.toString());
		console.log(sby.toString());
	},
	
	//<<<<< cap nhat ket thuc qua trinh resize
	freeze_transform : function() {
		// here we move the temp transform info to the final transform
		this.translation = Vector2.Add(this.temp_translation, Vector2.Pointwise(this.temp_scale, this.translation));
		this.scale = Vector2.Pointwise(this.scale, this.temp_scale);
		this.temp_scale = new Vector2(1, 1);
		this.temp_translation = new Vector2(0, 0);
		this.dirty_flag = true;
		this.update_extents();
	},

	//<<<<< build xml de recognize
	toXML : function() {
		var sb = new StringBuilder();
		sb.append("<Segment type=\"pen_stroke\" instanceID=\"");
		sb.append(String(this.instance_id));
		sb.append("\" scale=\"");
		sb.append(this.scale.toString());
		sb.append("\" translation=\"");
		sb.append(this.translation.toString());
		sb.append("\" points=\"");
		sb.append(this.points[0].toString());
		for (var k = 1; k < this.points.length; k++)
		sb.append("|").append(this.points[k].toString());
		sb.append("\"/>");
	
		return sb.toString();
	},
	
};

//Kiem tra tat ca cac diem cua segment co thuoc duong tron hay ko?
PenStroke.Check = function(radius, point, points, t) {
	var kc = 0;
	var count = 0;
	var temp = 10; //cho phep sai so mot so diem nam ngoai duong tron
	if (t != undefined) {
		temp = 2 * points.length / 3;
	} else {
		temp = points.length / 6;
	}
	////console.log("1 so diem ngoai " + temp);
	for (var i = 0; i < points.length; i++) {
		kc = Math.sqrt((point.x - points[i].x) * (point.x - points[i].x) + (point.y - points[i].y) * (point.y - points[i].y));
		//kiem tra ko thuoc duong tron ko
		if (kc > radius) {
			count++;
		}
		////console.log("kc "+ i + " = (" + kc + ") point :"+ points[i]);
	}
	////console.log("count " + count);
	if (count > temp) return false;
	return true;
}

// kiem tra day toa do points bang nhau cho ky tu dots
PenStroke.isCheckpoint = function() {
	var firstpointx = Editor.current_stroke.points[0].x;
	var firstpointy = Editor.current_stroke.points[0].y;
	for (var i = 2; i < Editor.current_stroke.points.length; i++) {
		if (firstpointx == Editor.current_stroke.points[i].x && firstpointy == Editor.current_stroke.points[i].y) {
			return false;
		} else {
			return true;
		}
	}
	return true;
}
