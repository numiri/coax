//
ImageBlob.count = 0;
ImageBlob.type_id = 4; // unique per class

function ImageBlob(in_image, in_inverse_image, original_width, original_height, x, y) {
	// identifiers to build unique id
	this.instance_id = Segment.count++; // unique per object
	this.type_id = ImageBlob.type_id;
	this.set_id = Segment.set_count++;

	// the layer we are in, 0 is bottom N is top
	this.layer = 1;
	// a javascript image object
	this.image = (in_image);
	this.inverse_image = in_inverse_image;
	// transform info
	this.scale = new Vector2(1.0, 1.0);
	this.translation = new Vector2((Editor.canvas_width - original_width) / 2 + x, (Editor.canvas_height - original_height) / 2 + y);

	this.temp_scale = new Vector2(1.0, 1.0);
	this.temp_translation = new Vector2(0.0, 0.0);

	this.size = new Vector2(in_image.width, in_image.height);

	this.world_mins = this.translation.clone();
	this.world_maxs = Vector2.Add(this.translation, this.size);
}

ImageBlob.prototype = {
	render : function(in_context) {
		in_context.save();
	
		// build our transforms
		var total_translation = new Vector2(0, 0).transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		var total_scale = Vector2.Pointwise(this.scale, this.temp_scale);
	
		in_context.translate(total_translation.x, total_translation.y);
		in_context.scale(total_scale.x, total_scale.y);
	
		in_context.drawImage(this.image, 0, 0);
		in_context.restore();
	},
	
	render_selected : function(in_context) {
		in_context.save();
	
		// build our transforms
		var total_translation = new Vector2(0, 0).transform(this.scale, this.translation).transform(this.temp_scale, this.temp_translation);
		var total_scale = Vector2.Pointwise(this.scale, this.temp_scale);
	
		in_context.translate(total_translation.x, total_translation.y);
		in_context.scale(total_scale.x, total_scale.y);
	
		in_context.drawImage(this.inverse_image, 0, 0);
	
		in_context.restore();
	},
	
	// determine if the passed in point (screen space) collides with our geometery
	point_collides : function(in_position) {
		var mins = this.worldMinPosition();
		var maxs = this.worldMaxPosition();
	
		if (in_position.x < mins.x || in_position.x > maxs.x || in_position.y < mins.y || in_position.y > maxs.y) return false;
		return true;
	},
	
	line_collides : function(point_a, point_b) {
		if (this.point_collides(point_a) || this.point_collides(point_b)) return true;
		return false;
	},
	
	rectangle_collides : function(in_corner_a, in_corner_b) {
		var mins = new Vector2();
		var maxs = new Vector2();
		if (in_corner_a.x < in_corner_b.x) {
			mins.x = in_corner_a.x;
			maxs.x = in_corner_b.x;
		} else {
			mins.x = in_corner_b.x;
			maxs.x = in_corner_a.x;
		}
	
		if (in_corner_a.y < in_corner_b.y) {
			mins.y = in_corner_a.y;
			maxs.y = in_corner_b.y;
		} else {
			mins.y = in_corner_b.y;
			maxs.y = in_corner_a.y;
		}
	
		var my_mins = this.worldMinPosition();
		var my_maxs = this.worldMaxPosition();
	
		if (maxs.x < my_mins.x || mins.x > my_maxs.x) return false;
		if (maxs.y < my_mins.y || mins.y > my_maxs.y) return false;
	
		return true;
	},
	
	// translate by this amount
	translate : function(in_offset) {
		this.translation.Add(in_offset);
	
		this.update_extents();
	},
	update_extents : function() {
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
	
	worldMinPosition : function() {
		return this.world_mins.clone();
	},
	
	worldMaxPosition : function() {
		return this.world_maxs.clone();
	},
	
	worldMinDrawPosition : function() {
		return this.world_mins.clone();
	},
	
	worldMaxDrawPosition : function() {
		return this.world_maxs.clone();
	},
	
	resize : function(in_origin, in_scale) {
		this.temp_scale = new Vector2(in_scale.x, in_scale.y);
		this.temp_translation = Vector2.Subtract(in_origin, Vector2.Pointwise(in_origin, in_scale));
	
		this.update_extents();
	},
	
	freeze_transform : function() {
		// here we move the temp transform info to the final transform
		this.translation = Vector2.Add(this.temp_translation, Vector2.Pointwise(this.temp_scale, this.translation));
		this.scale = Vector2.Pointwise(this.scale, this.temp_scale);
	
		this.temp_scale = new Vector2(1, 1);
		this.temp_translation = new Vector2(0, 0);
	
		this.update_extents();
	},
	
	toXML : function() {
		var sb = new StringBuilder();
		//	sb.append("<Segment type=\"image_blob\" instanceID=\"").append(String(this.instance_id)).append("\"/>");
		sb.append("<Segment type=\"image_blob\" instanceID=\"");
		sb.append(String(this.instance_id));
		sb.append("\" scale=\"");
		sb.append(this.scale.toString());
		sb.append("\" translation=\"");
		sb.append(this.translation.toString());
		sb.append("\" image=\"");
		sb.append(this.image.src).append("\"/>");	
		return sb.toString();
	}
};
// just draw using the given context