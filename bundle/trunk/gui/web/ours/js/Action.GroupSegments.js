GroupSegments = function(in_segments, in_new_set_id, flag) {
   this.segments = new Array();
   this.previous_set = new Array();
   this.new_set_id = in_new_set_id;
   this.status = flag;

   for (var k = 0; k < in_segments.length; k++) {
      var segment = in_segments[k];
      this.segments.push(segment);
      this.previous_set.push(segment.set_id);
   }
}
GroupSegments.prototype.buildSegmentXML = function() { } //do nothing but need this because Action.Segments has this prototype
/******************************************************************************
*
******************************************************************************/
GroupSegments.prototype.Undo = function() {
for (var k = 0; k < this.segments.length; k++) {
   var recognition = RecognitionManager.getRecognition(this.previous_set[k]);
   var symbol = recognition != null ? recognition.symbols[0]: "";
   this.segments[k].set_id = this.previous_set[k];
   this.segments[k].symbol = symbol;
   Editor.add_selected_segment(this.segments[k],Editor.selected_segments);
   Editor.arr_seg_select.push(this.segments[k].instance_id);                   }
GroupSegments.DisplaySymbol();                                                       }
/******************************************************************************
*
******************************************************************************/
GroupSegments.DisplaySymbol = function()                             {
   Editor.state = EditorState.RectangleSelecting;
   RenderManager.bounding_box.style.background = "GhostWhite";
   RenderManager.bounding_box.style.border = "1px dashed #333333";
   RenderManager.render(); 
   Editor.set_field = RenderManager.setField();                                }
/******************************************************************************
*
******************************************************************************/
GroupSegments.prototype.Apply = function() {
var symbol = RecognitionManager.getRecognition(this.new_set_id).symbols[0];
for (var k = 0; k < this.segments.length; k++) {
   this.segments[k].set_id = this.new_set_id;
   this.segments[k].symbol = symbol;
   Editor.add_selected_segment(this.segments[k],Editor.selected_segments);
   Editor.arr_seg_select.push(this.segments[k].instance_id);                   } 
GroupSegments.DisplaySymbol();
}
/******************************************************************************
*
******************************************************************************/
GroupSegments.prototype.toXML = function() {
   var sb = new StringBuilder();
   sb.append("<Action type=\"group_segments\" ");
   sb.append("newSetID=\"");
   sb.append(String(this.new_set_id));
   sb.append("\" instanceIDs=\"");
   sb.append(String(this.segments[0].instance_id));
   for (var k = 1; k < this.segments.length; k++) {
      sb.append(',');
      sb.append(String(this.segments[k].instance_id));
   }
   sb.append("\"/>");
   return sb.toString();
}


GroupSegments.prototype.shouldKeep = function() {
   return true;
}

GroupSegments.prototype.toString = function() {
   return "GroupSegments";
}

GroupSegments.prototype.Flag = function() {
   return this.status;
}
