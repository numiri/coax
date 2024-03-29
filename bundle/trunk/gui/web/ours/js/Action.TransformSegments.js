TransformSegments.animation_length = 0.25;

function TransformSegments(in_segments, flag) {
       this.segments = new Array();
       //	this.backup_temp_scale = new Array();
       //	this.backup_temp_traslation = new Array();
       this.backup_scale = new Array();
       this.backup_translation = new Array();

       //	this.new_temp_scale = new Array();
       //	this.new_temp_translation = new Array();
       this.new_scale = new Array();
       this.new_translation = new Array();

       for (var k = 0; k < in_segments.length; k++) {
              var segment = in_segments[k];
              //if(segment.symbol !="V" && segment.symbol !="v" && segment.symbol !="^"){
              this.segments.push(segment);
              //		this.backup_temp_scale.push(segment.temp_scale.clone());
              //		this.backup_temp_translation.push(segment.temp_translation.clone());                 
              this.backup_scale.push(segment.scale.clone());
              this.backup_translation.push(segment.translation.clone());
              //}
       }
       this.frames = 0.0;
       this.start_time = 0;
       this.undoing = true;

       this.should_keep = false;
       this.status = flag;
}
TransformSegments.current;
TransformSegments.prototype = {
       
       Flag : function() {
              return this.status;
       },
       
       // need to call this to get the new values for each transform
       add_new_transforms : function(in_segments) {
              if (in_segments.length != this.segments.length) {
                     // alert("ERROR in add_new_transforms");
                     //console.log("Checking add_new_transforms");
                     segment.render();
              }
       
              this.should_keep = true;
       
              for (var k = 0; k < in_segments.length; k++) {
                     var segment = in_segments[k];
                     //		this.new_temp_scale.push(segment.temp_scale.clone());
                     //		this.new_temp_translation.push(segment.temp_translation.clone());
                     this.new_scale.push(segment.scale.clone());
                     this.new_translation.push(segment.translation.clone());
              }
       },
       
       rescale : function(elapsed, utc_ms) {
              var current_time = (new Date()).getTime();
              var delta = (current_time - utc_ms) / 1000.0; // time since last frame in seconds
       
              if (elapsed == 0.0) TransformSegments.current = this;
              var fraction = elapsed / TransformSegments.animation_length;
              if (fraction > 1.0) fraction = 1.0;
       
              if (this.undoing) {
                     for (var j = 0; j < this.segments.length; j++) {
                            var segment = this.segments[j];
                            segment.scale.Set(Vector2.Add(this.new_scale[j], Vector2.Multiply(fraction, Vector2.Subtract(this.backup_scale[j], this.new_scale[j]))));
                            segment.translation.Set(Vector2.Add(this.new_translation[j], Vector2.Multiply(fraction, Vector2.Subtract(this.backup_translation[j], this.new_translation[j]))));
                            segment.update_extents();
                            segment.render();
                     }
              } else {
                     for (var j = 0; j < this.segments.length; j++) {
                            var segment = this.segments[j];
                            segment.scale.Set(Vector2.Add(this.backup_scale[j], Vector2.Multiply(fraction, Vector2.Subtract(this.new_scale[j], this.backup_scale[j]))));
                            segment.translation.Set(Vector2.Add(this.backup_translation[j], Vector2.Multiply(fraction, Vector2.Subtract(this.new_translation[j], this.backup_translation[j]))));
                            segment.update_extents();
                            segment.render();
                     }
              }
       
              // set dirty flag
       
              for (var j = 0; j < this.segments.length; j++) {
                     this.segments[j].dirty_flag = true;
                     segment.render();
              }
       
              Editor.update_selected_bb();
              RenderManager.render();
              ////console.log(" Trans fraction: " + fraction);
              this.frames++;
       
              if (fraction == 1.0) {
                     // bail out
                     TransformSegments.current = null;
                     var total_time = ((current_time - this.start_time) / 1000.0);
                     ////console.log("total time: " + total_time);
                     ////console.log("mean framerate: " + (this.frames / total_time));
                     return;
              }
       
              var total_delta = ((new Date()).getTime() - utc_ms) / 1000.0;
              var sb = new StringBuilder();
              sb.append("TransformSegments.current.rescale(").append(String(elapsed + total_delta)).append(',').append((new Date()).getTime()).append(");");
              setTimeout(sb.toString());
       },
       
       Undo : function() {
              this.framerate = 0.0;
              this.frames = 0.0;
              this.start_time = (new Date()).getTime();
              this.undoing = true;
              //this.UndoTransFence();
              this.rescale(0.0, this.start_time);
       },
       
       ResotreFlotom : function() {
              for (var k = 0; k < this.segments.length; k++) {
                     var trans = Vector2.Subtract(this.backup_translation[k], this.new_translation[k]);
                     var scale = this.backup_scale[k];
                     this.segments[k].scale.Set(scale);
                     this.segments[k].translate(trans);
                     this.segments[k].update_extents();
              }
              Editor.update_selected_bb();
              RenderManager.render();
       },
       
       shouldKeep : function() {
              return this.should_keep;
              for (var k = 0; k < this.segments.length; k++) {
                     var segment = this.segments[k];
                     if (segment.scale.equals(this.backup_scale[k]) == false) return true;
                     if (segment.translation.equals(this.backup_translation[k]) == false) return true;
              }
              return false;
       },
              
       Apply : function() {
              this.framerate = 0.0;
              this.frames = 0.0;
              this.start_time = (new Date()).getTime();
              this.undoing = false;
              this.rescale(0.0, this.start_time);
              //this.UndoTransFence();
       },
       
       toXML : function() {
              var sb = new StringBuilder();
              sb.append("<Action type=\"transform_segments\">").appendLine();
              for (var k = 0; k < this.segments.length; k++) {
                     var segment = this.segments[k];
                     sb.append("\t").append("<Transform instanceID=\"").append(String(segment.instance_id)).append("\" ");
                     sb.append("scale=\"").append(this.new_scale[k].toString()).append("\" translation=\"").append(this.new_translation[k].toString()).append("\"/>");
                     sb.appendLine();
       
              }
              sb.append("</Action>");
              return sb.toString();
       },
       
       toString : function() {
              return "TransformSegments";
       },

};