//<<<<< obj tinh min-max nhung stroke dang duoc chon
BoundingBox = function (corner_a, corner_b, render_corner_a, render_corner_b) {
	// set up logical mins for resizing
	this.mins = new Vector2(0, 0);
	this.maxs = new Vector2(0, 0);
	if (corner_a.x < corner_b.x) {
		this.mins.x = corner_a.x;
		this.maxs.x = corner_b.x;
	} else {
		this.mins.x = corner_b.x;
		this.maxs.x = corner_a.x;
	}

	if (corner_a.y < corner_b.y) {
		this.mins.y = corner_a.y;
		this.maxs.y = corner_b.y;
	} else {
		this.mins.y = corner_b.y;
		this.maxs.y = corner_a.y;
	}
	// set up rendering mins
	this.render_mins = new Vector2(0, 0);
	this.render_maxs = new Vector2(0, 0);

	if (render_corner_a.x < render_corner_b.x) {
		this.render_mins.x = render_corner_a.x;
		this.render_maxs.x = render_corner_b.x;
	} else {
		this.render_mins.x = render_corner_b.x;
		this.render_maxs.x = render_corner_a.x;
	}

	if (render_corner_a.y < render_corner_b.y) {
		this.render_mins.y = render_corner_a.y;
		this.render_maxs.y = render_corner_b.y;
	} else {
		this.render_mins.y = render_corner_b.y;
		this.render_maxs.y = render_corner_a.y;
	}
};

BoundingBox.prototype = {
	//<<<<< copy box dang ton tai de bat dau thuc hien zoom
	clone : function() {
		return new BoundingBox(this.mins, this.maxs, this.render_mins, this.render_maxs);
	},
	//<<<<< xax dinh diem ngon tay trong vung box dang ton tai
	point_collides : function(in_point) {
		if (in_point.x < this.render_mins.x) return false;
		if (in_point.x > this.render_maxs.x) return false;
		if (in_point.y < this.render_mins.y) return false;
		if (in_point.y > this.render_maxs.y) return false;
		return true;
	},
	
	//<<<<< tinh lai min-max trong qua trinh zoom
	translate : function(in_offset) {
		this.mins.Add(in_offset);
		this.maxs.Add(in_offset);
	
		this.render_mins.Add(in_offset);
		this.render_maxs.Add(in_offset);
	} ,
	
	//<<<<< khong dung
	hand_click : function(mins, hand, maxs, values) {
		var xx = (maxs.x - mins.x) / 2;
		var yy = (maxs.y - mins.y) / 2;
		return 2;
		if (hand.x <= xx + values || hand.x >= xx - values) {
			return 2;
		}
		if (hand.y <= yy + values || hand.y >= yy - values) {
			return 0;
		}
		if (hand.y < yy - values && hand.x > xx + values) return 1;
		if (hand.y > yy + values && hand.x > xx + values) return 3;
		return 2;
	},
	
	//<<<<< khong dung
	checkpoint : function(p1, p2) {
		var t = p1.x - p2.x;
		if (t >= -10 && t <= 10) {
			return -1;
		}
		return 1;
	},
	
	//<<<<< kich thuoc box
	sizeBox: function(){
		return Vector2.Subtract(this.maxs, this.mins);
	},
	
	//<<<<< diem giua box
	getCenterBox: function() {
		var temp = Vector2.Add(this.mins, this.maxs);
		var center = new Vector2(temp.x / 2, temp.y / 2);
		return [center.x, center.y, center];
	},

};

//<<<<< khong dung
point_line_segment_distance = function(A, B, C) {
	var AB = Vector2.Subtract(B, A);
	var t = Vector2.Dot(Vector2.Subtract(C, A), AB) / Vector2.Dot(AB, AB);

	if (t > 1) t = 1;
	if (t < 0) t = 0;

	var D = Vector2.Add(A, Vector2.Multiply(t, AB));

	var result = Vector2.Distance(D, C);

	return result;
}