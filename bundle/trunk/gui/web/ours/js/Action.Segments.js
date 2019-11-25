//dung cho AddSegment,CopySegment,DataSegment,DeleteSegment
var ActionSegments = function(in_segments, flag,nameSegment) {
   this.segments = in_segments;
   this.segment_xmls = new Array();
   this.status = flag;
   this.nameSegment = nameSegment;
   this.set_id_changes = new Array();
};

ActionSegments.prototype = {
   
   buildSegmentXML : function() {
      this.segment_xmls.length = 0;
      for (var k = 0; k < this.segments.length; k++) {
         this.segment_xmls.push(this.segments[k].toXML());
      }
   },
 
   Undo : function() {
      if(this.nameSegment == Editor.DeleteSegments){
         for (var k = 0; k < this.segments.length; k++) {
            var segment = this.segments[k];
            if (segment.element != null) {
               if (!Gestures.isBlockSegment(segment, 0)) {
                  segment.element.style.visibility = "visible";
                  Editor.add_segment(segment);
               }
               if (segment.isDraff && !Gestures.isEnableDralf()) {
                  document.getElementById(Gestures.dralf).style.visibility = "visible";
                  document.getElementById(Gestures.btnResize).style.visibility = "visible";
               }
            }
         }
         RenderManager.render();
      }
      else{
         for (var k = 0; k < this.segments.length; k++) {
            Editor.remove_selected_segment(this.segments[k]);
            if (this.segments[k].element != null) {
               this.segments[k].element.style.visibility = "hidden";
               if (Gestures.isBlockSegment(this.segments[k], 1)) {
                  var parentSpit = document.getElementById(String(this.segments[k].set_id));
                  if (parentSpit != null){
                     parentSpit.style.visibility = "hidden";
                  }
               }
            }
            Editor.remove_segment(this.segments[k]);
         }
      if(this.toString() == Editor.AddSegments){
         // Change all of the collided strokes back to their original sets.
         for (var k = 0; k < this.set_id_changes.length; k++) {
            var change = this.set_id_changes[k];
            for (var j = 0; j < Editor.segments.length; j++) {
               if (Editor.segments[j].instance_id == change.instance_id) {
                    Editor.segments[j].set_id = change.old_set_id;
                    var recognition = RecognitionManager.getRecognition(change
                    .   old_set_id);
                    var symbol = recognition!=null? recognition.symbols[0]: "";
                    Editor.segments[j].symbol = symbol;
                    break;  }}}}
         Editor.update_selected_bb();
      }
      console.log("undo " + this.nameSegment);
   },
 
   shouldKeep : function() {
      // discard empty text segment
      if(this.nameSegment == Editor.DeleteSegments){
         if(this.segments.length == 0)
            return false;
         return true;
      }
      if (this.segments.length == 1) {
         if (this.segments[0].type_id == SymbolSegment.type_id) 
            if (this.segments[0].text == "") return false;
      }
      // discard length 1 pen strokes (ie, dots)
      if (this.segments.length == 1) {
         if (this.segments[0].type_id == PenStroke.type_id) 
            if (this.segments[0].points.length == 1) return false;
      }     
      return true;
   },

   Apply : function() {
      if(this.nameSegment == Editor.DeleteSegments){
         for (var k = 0; k < this.segments.length; k++) {
            if (this.segments[k].element != null) {
               this.segments[k].element.style.visibility = "hidden";
               Editor.remove_segment(this.segments[k]);
            }
         }
      }
      else{
         for (var k = 0; k < this.segments.length; k++)                       {
            if (this.segments[k] == null) continue;
            Editor.add_segment(this.segments[k]);
            if(this.segments[k].element != null)
               this.segments[k].element.style.visibility = "visible";
            if (this.segments[k].isDraff && !Gestures.isEnableDralf())        {
               document.getElementById(Gestures.dralf).style.visibility = "visible";
               document.getElementById(Gestures.btnResize).style.visibility = "visible";
            }
            if (Gestures.isBlockSegment(this.segments[k], 1))                 {
               var parentSpit = document.getElementById(String(this.segments[k].set_id));
               if (parentSpit!=null && parentSpit.style.visibility=="hidden")
                  parentSpit.style.visibility = "visible";                    }}
         if(this.toString() == Editor.AddSegments)                            {
            // Change all of the collided strokes to be in the same set.
            for (var k = 0; k < this.set_id_changes.length; k++)              {
                var change = this.set_id_changes[k];
                for (var j = 0; j < Editor.segments.length; j++)              {
                if (Editor.segments[j].instance_id == change.instance_id)     {
                    Editor.segments[j].set_id = this.segments[0].set_id;
                    Editor.segments[j].symbol = this.segments[0].symbol;
                    break;                                                    }}}}
      }
      console.log("redo " + this.nameSegment);
   },
 
   toXML : function() {
      var sb = new StringBuilder();
      sb.append("<Action type=\"" + this.nameSegment + "\">").appendLine();
      for (var k = 0; k < this.segments.length; k++) {
         sb.append("\t").append(this.segment_xmls[k]).appendLine();
      }
      sb.append("</Action>");
      return sb.toString();
   },
 
   toString : function() {
      return this.nameSegment;
   },
   
   Flag : function() {
      return this.status;
   },
   
   UndoHis : function() {
      for (var k = 0; k < this.segments.length; k++) {
         var segment = this.segments[k];
         //if (segment.symbol != "V" && segment.symbol != "v" && segment.symbol != "^") {
         if (segment.element != null) {
            segment.element.style.visibility = "visible";
            Editor.add_segment(segment);
         }
         //}
      }
      RenderManager.render();
   },
};
