function SysEquations(){
    
}

SysEquations.initialize = function(){
    SysEquations.seg_sort_x = new Array();
    SysEquations.data_obj = new Array();
    SysEquations.seg_obj = new Array();
    SysEquations.Expressions = new Array();
    SysEquations.TupeExpres = new Array();
    SysEquations.seg_exp = new Array();
    SysEquations.Flag = false;
    SysEquations.string = new StringBuilder();
    SysEquations.from_x;
    SysEquations.to_x;
}

SysEquations.Obj = function(from_x, to_x, center_y){
    this.from_x = from_x;
    this.to_x = to_x;
    this.center_y = center_y;
}

SysEquations.Draw_Line = function(from_x, to_x, center_y, style_color, line_width){
    var context = Editor.contexts[0];
    context.strokeStyle = style_color;
    context.lineWidth = line_width;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(from_x, center_y);
    context.lineTo(to_x, center_y);
    context.stroke();
    context.closePath();
}

SysEquations.re_Draw_line = function(){
    if (SysEquations.data_obj.length > 0 && Editor.selection_method != "Pen"){
	for (var i = 0; i < SysEquations.data_obj.length; i++){
	    SysEquations.Draw_Line(SysEquations.data_obj[i].from_x, SysEquations.data_obj[i].to_x, SysEquations.data_obj[i].center_y, "#FFFFFF", 1.5);
	}
    }
}

SysEquations.Action = function(){
    if (Editor.segments.length > 0) {
	SysEquations.getSymbol();
	if (SysEquations.seg_obj.length > 1) {
	    RenderManager.clear_canvas();
	    for (var i = 0; i < SysEquations.seg_obj.length; i++) {
		if (i > 0 && SysEquations.seg_obj[i - 1].set_id != SysEquations.seg_obj[i].set_id) {
		    var center = (SysEquations.seg_obj[i].worldMinPosition().y - SysEquations.seg_obj[i - 1].worldMaxPosition().y) / 2;
		    center = center + SysEquations.seg_obj[i - 1].worldMaxPosition().y;
		    SysEquations.data_obj.push(new SysEquations.Obj(SysEquations.from_x - 20, SysEquations.to_x + 20, center));
		    SysEquations.Draw_Line(SysEquations.from_x - 20, SysEquations.to_x + 20, center, "#FFFFFF", 1.5);
		}
	    }
	    if (SysEquations.data_obj.length > 0)
		return true;
	}
    }
    else {
	SysEquations.initialize();
	RenderManager.clear_canvas();
    }
    return false;
}

SysEquations.getSymbol = function(){
    delete SysEquations.seg_sort_x;
    SysEquations.seg_sort_x = new Array();
    delete SysEquations.data_obj;
    SysEquations.data_obj = new Array();
    delete SysEquations.seg_obj;
    SysEquations.seg_obj = new Array();
    SysEquations.seg_sort_x = Gestures.Sort(Editor.segments);
    SysEquations.from_x = SysEquations.seg_sort_x[0].worldMinPosition().x;
    SysEquations.to_x = SysEquations.seg_sort_x[SysEquations.seg_sort_x.length - 1].worldMaxPosition().x;

    Editor.segments = Fractions.Sort(Editor.segments);
    for (var i = 0; i < Editor.segments.length; i++) {
	/*var recognition_result = RecognitionManager.getRecognition(Editor.segments[i].set_id);
	if (recognition_result != null){
	    if (recognition_result.symbols[0] == "_equal") {
		SysEquations.seg_obj.push(Editor.segments[i]);
	    }
	}*/
	if(Editor.segments[i].symbol == "_equal"){
	    SysEquations.seg_obj.push(Editor.segments[i]);
	}
    }
}

SysEquations.SaveExpressions = function(){
    delete SysEquations.Expressions;
    SysEquations.Expressions = new Array();
    if (SysEquations.Action()){
	//console.log("he phuong trinh");
	var seg = Fractions.Sort(Editor.segments);
	Fractions.UpdateStatus(Editor.segments);
	var s = new Array();
	var count = 0;	
	
	for (var i = 0; i < SysEquations.data_obj.length; i++){
	    s = new Array();
	    for(var k = count;k < seg.length;k++){
		if(seg[k].status)
		    continue;
		if (seg[k].worldMaxPosition().y < SysEquations.data_obj[i].center_y){
		    s.push(seg[k]);
		    seg[k].status = true;
		    count ++;
		}
	    }
	    s = Gestures.SortSetId(s);
	    SysEquations.Expressions.push(s);
	}
	//xet nhung cai con lai chua duoc dua vao
	s = new Array();
	for(var k = count;k < seg.length;k++){
	    if(!seg[k].status){
		s.push(seg[k]);
	    }
	}
	s = Gestures.SortSetId(s);
	SysEquations.Expressions.push(s);
	
	//SysEquations.Expressions.push(seg.filter(SysEquations.Filter));
    }
    else {
	//console.log("mot phuong trinh");
       var s = new Array();
       Gestures.SortSetId(Editor.segments);
       for (var i = 0; i < Editor.segments.length; i++){
          s.push(Editor.segments[i]);
       }
       // do not push Editor.segments to SysEquations.Expressions
       // because any change in S.E will affect directly to E.s
       SysEquations.Expressions.push(s);
    }
}
/* Loc mang theo dieu kien
SysEquations.Filter = function(element, index, array) {  
    return (element.worldMaxPosition().y > SysEquations.data_obj[SysEquations.data_obj.length - 1].center_y);  }  
*/

/******************************************************************************
* INTENT: convert symbols -> xml string to send to server for phrase rex.
*         we must create an intermediary object "SE.TupeExpres" which holds 
*         the recognized symbols.  this object is passed to BuildXML() which 
*         converts it into an XML string
* INPUT:  object "express" containing stroke points, and recognized symbols, 
*         not phrases
* OUTPUT: none.  the real work is done in BuildXML()
******************************************************************************/
SysEquations.BuildTupe = function(express) {
   delete SysEquations.TupeExpres;
   SysEquations.TupeExpres = new Array();
/*g:
   for (var i = 0; i < express.length; i++){
      var data = new Array();
      var set_segments = new Array();
      express[i].push(null);
      var set_index = 0;
  
      for (var k = 0; k < express[i].length; k++) {
         var seg = express[i][k];
         if (set_segments.length == 0) set_segments.push(seg);
         else if (seg == null || seg.set_id != set_segments[0].set_id) {
            var mins = set_segments[0].worldMinPosition();
            var maxs = set_segments[0].worldMaxPosition();
            for (var j = 1; j < set_segments.length; j++) {
                var seg_min = set_segments[j].worldMinPosition();
                //console.log("seg_min:" + seg_min);
                var seg_max = set_segments[j].worldMaxPosition();
                //console.log("seg_max: " + seg_max);
                if (seg_min.x < mins.x) mins.x = seg_min.x;
                if (seg_min.y < mins.y) mins.y = seg_min.y;

                if (seg_max.x > maxs.x) maxs.x = seg_max.x;
                if (seg_max.y > maxs.y) maxs.y = seg_max.y;
            }
     
            // flatten min-max for dash (height)
            if (set_segments[0].symbol == "-"
                || set_segments[0].symbol == "_dash"
                || set_segments[0].symbol == "frac"){
                if (maxs.y - mins.y > 1) {
               var user_drawn_height = maxs.y - mins.y;
               maxs.y = maxs.y - (user_drawn_height / 2);
               mins.y = mins.y + (user_drawn_height / 2);
                }
                console.log("user drawn height for dash:" + (maxs.y - mins.y));
            }
     
            var recognition_result = RecognitionManager.getRecognition(set_segments[0].set_id);
            if (recognition_result != null) {
                var flag_id = true;
                for (var l = 0; l < Editor.segmentSplits.length; l++) {
               if (recognition_result.set_id == Editor.segmentSplits[l].set_id) flag_id = false;
                }
                if (flag_id == true) {
               var test = recognition_result;
               var tuple = new Tuple(recognition_result, mins, maxs);
               data.push(tuple);
                }
            }
            set_segments.length = 0;
            set_segments.push(seg);
         } else
            set_segments.push(seg);
      }
      SysEquations.TupeExpres.push(data);
      express[i].pop();
      express[i] = Gestures.Sort(express[i]);
   }
*/
   for (var i = 0; i < express.length; i++){
      var data = new Array();
      var setIds = [];
      for (var k = 0; k < express[i].length; k++) {
         if(setIds.indexOf(express[i][k].set_id)==-1){
            setIds.push(express[i][k].set_id);
         }
      }
      if(setIds.length>0)
         SysEquations.BuildTupleinDetail(express[i], setIds, data);
      
      Gestures.Sort(express[i]);
      SysEquations.TupeExpres.push(data);
   }   
   SysEquations.BuildXML(SysEquations.TupeExpres);
}
SysEquations.BuildTupleinDetail = function(src_segments, setIds, data) {
   for (var k = 0; k < setIds.length; k++) {
      var set_id = setIds[k];
      var recognition_result = RecognitionManager.getRecognition(set_id);
      if(recognition_result == null) continue;
      
      var symbol = recognition_result.symbols[0];
      if(Editor.shapeSymbols.indexOf(symbol)>-1){ 
         SysEquations.BuildParenthesesTuple(src_segments, recognition_result.instance_ids[0], data);
         for(var l=0;l<src_segments.length;l++){
            if(src_segments[l].instance_id == recognition_result.instance_ids[0]){
               src_segments.splice(l,1);
               break;
            }
         }
      }
      else{
         var flag_id = true;
         for (var l = 0; l < Editor.segmentSplits.length; l++) {
            if (recognition_result.set_id == Editor.segmentSplits[l].set_id){ 
               flag_id = false;
               break;
            }
         }
         
         if (flag_id) {
            if(!(symbol.startsWith(Editor.ShapePrefix) 
                  && symbol.endsWith(Editor.ShapeSuffix))
               || Editor.draculae_validSymbols.indexOf(symbol)>-1){
               SysEquations.BuildSegmentSetTuple(recognition_result, data);
            }
            else {
               var unfound = true;
               for(var n=Editor.undo_stack.length-1; n>-1; n--){
                  if( Editor.undo_stack[n].constructor == GroupSegments
                  &&  Editor.undo_stack[n].new_set_id  == set_id){
                     unfound = false;
                     var newSetIds = [];
                     for (var m = 0; m < Editor.undo_stack[n].previous_set.length; m++) {
                        if(newSetIds.indexOf(Editor.undo_stack[n].previous_set[m])==-1){
                           newSetIds.push(Editor.undo_stack[n].previous_set[m]);
                        }
                     }
                     if(newSetIds.length>0)
                        SysEquations.BuildTupleinDetail(src_segments, newSetIds, data);
                        
                     break;
                  }
               }
               // new load, cannot ungroup shape
               if(unfound && (symbol.startsWith(Editor.ShapePrefix) 
                     && symbol.endsWith(Editor.ShapeSuffix))){
                  var newReg = new RecognitionResult();
                  newReg.certainties = recognition_result.certainties;
                  newReg.instance_ids = recognition_result.instance_ids;
                  newReg.results = recognition_result.results;
                  newReg.set_id = recognition_result.set_id;
                  
                  newReg.symbols.push(symbol.substr(Editor.ShapePrefix.length,
                        symbol.length-Editor.ShapeSuffix.length));

                  SysEquations.BuildSegmentSetTuple(newReg, data);
               }
            }//else symbol
         }//if flag_id
      }// else shape
   }//for setIds
}
SysEquations.BuildSegmentSetTuple = function (recognition, data){
   var mins = null, maxs = null;
   for(var j = 0; j < Editor.segments.length; j++) {
      var seg = Editor.segments[j]; 
      if(recognition.instance_ids.indexOf(seg.instance_id) >-1){
         
         if(mins == null && maxs == null){
            mins = seg.worldMinPosition();
            maxs = seg.worldMaxPosition();
         }
         else{
            var seg_min = seg.worldMinPosition();
            var seg_max = seg.worldMaxPosition();
            
            if (seg_min.x < mins.x) mins.x = seg_min.x;
            if (seg_min.y < mins.y) mins.y = seg_min.y;

            if (seg_max.x > maxs.x) maxs.x = seg_max.x;
            if (seg_max.y > maxs.y) maxs.y = seg_max.y;
         }
      }
   }

   var tuple = new Tuple(recognition, mins, maxs);
   data.push(tuple);   
}
SysEquations.BuildParenthesesTuple = function(src_segments, instance_id, data){
   var segList = Editor.segments.filter(
         function(s) {return s.instance_id === instance_id;});
   if(segList.length>0){
      var seg_min = segList[0].worldMinPosition();
      var seg_max = segList[0].worldMaxPosition();
      var depth = (seg_max.y - seg_min.y)/3;
      var equation = 0;//

      var arrPstrk = [];
      var pstrk = new PenStroke();
      pstrk.scale = segList[0].scale;
      pstrk.temp_scale = segList[0].temp_scale;
      pstrk.set_id = Segment.set_count++;
      pstrk.points = [];
      pstrk.points.push(new Vector2(seg_min.x+depth,seg_min.y));
      pstrk.points.push(new Vector2(seg_min.x,seg_min.y));
      pstrk.points.push(new Vector2(seg_min.x,seg_max.y));
      pstrk.points.push(new Vector2(seg_min.x+depth,seg_max.y));
      pstrk.world_mins = new Vector2(seg_min.x,seg_min.y);
      pstrk.world_maxs = new Vector2(seg_min.x+depth,seg_max.y);
      pstrk.translation = pstrk.lec();
      pstrk.symbol = "[";
      arrPstrk.push(pstrk);
      src_segments.push(pstrk);
      
      pstrk = new PenStroke();
      pstrk.scale = segList[0].scale;
      pstrk.temp_scale = segList[0].temp_scale;
      pstrk.set_id = Segment.set_count++;
      pstrk.points = [];
      pstrk.points.push(new Vector2(seg_max.x-depth,seg_min.y));
      pstrk.points.push(new Vector2(seg_max.x,seg_min.y));
      pstrk.points.push(new Vector2(seg_max.x,seg_max.y));
      pstrk.points.push(new Vector2(seg_max.x-depth,seg_max.y));
      pstrk.world_mins = new Vector2(seg_max.x-depth,seg_min.y);
      pstrk.world_maxs = new Vector2(seg_max.x,seg_max.y);
      pstrk.translation = pstrk.lec();
      pstrk.symbol = "]";
      arrPstrk.push(pstrk);
      src_segments.push(pstrk);
      
      for(var i=0;i<arrPstrk.length;i++){
         var parenthesis = new RecognitionResult();
         parenthesis.instance_ids.push(arrPstrk[i].instance_id);
         parenthesis.symbols.push(arrPstrk[i].symbol);
         parenthesis.set_id = arrPstrk[i].set_id;
         data.push(new Tuple(parenthesis, arrPstrk[i].world_mins, arrPstrk[i].world_maxs));
      }
   }
}
/******************************************************************************
* INTENT: 
* INPUT:  
* OUTPUT: 

   for (var i = 0; i < SyqEquations.Expressions[h].length; i++) { // foreach stroke.  was express.length
       strokes.push( Editor.concatPoints( SysEquations.Expressions[h][i] ) ); }
   var request = JSON.stringify(strokes);
*
Khoa's original (expire 150205)
var strokes=[];
for (var i = 0; i < Editor.segments.length; i++)								{
	  var strokeData={};
	  var points=[];
	  var translateX=0;
	  var translateY=0;
	 
	 var sts = Editor.segments[i];	
	 strokeData.Points=sts.points.toString();
	 strokeData.TranslateX=sts.translation.x;
	 strokeData.TranslateY=sts.translation.y;
	 strokes.push(strokeData);													}   
    var request = JSON.stringify(strokes);	
//End

*a we cannot save memory by creating strokeData outside the loop.  we must 
*  create a new strokeData object inside the loop, otherwise, we just re-point 
*  the same strokeData pointers to different variables & push the same pointer
*  onto the array.  This mistake took half a day :-(
******************************************************************************/
SysEquations.jsonizeFraz = function( fraz )                                   {
   var ray = []; var out = "";
   for (var i = 0; i < fraz.length; i++) { // foreach stroke.  was express.length
      var strokeData = {}; //a
      if(fraz[i].scale.x != 1 || fraz[i].scale.y != 1){
         var scaledpoints = new Array();
         for (var j = 0; j < fraz[i].points.length; j++) {
            var point = fraz[i].points[j].transform(fraz[i].scale, fraz[i].translation)
                              .transform(fraz[i].temp_scale, fraz[i].temp_translation);
            scaledpoints.push(Vector2.Subtract(point,fraz[i].lec()));
            /*
            scaledpoints.push(new Vector2(fraz[i].points[j].x*fraz[i].scale.x, 
                                          fraz[i].points[i].y*fraz[i].scale.y));
                                          */
         }
         strokeData.Points  = scaledpoints.toString();
      }else 
         strokeData.Points  = fraz[i].points.toString(); // segments[i].points is all the points in the stroke
      strokeData.TranslateX = fraz[i].translation.x;
      strokeData.TranslateY = fraz[i].translation.y; 
      ray.push( strokeData ); }
   out = JSON.stringify( ray )
   return out;                                                                }
/******************************************************************************
* INTENT: 
* INPUT:  
* OUTPUT: 
******************************************************************************/

SysEquations.BuildTupe1 = function(fraz) {
var data = new Array();
var set_segments = new Array();
fraz.push(null);
var set_index = 0;

for (var k = 0; k < fraz.length; k++) {
    var seg = fraz[k];
    if (set_segments.length == 0) set_segments.push(seg);
    else if (seg == null || seg.set_id != set_segments[0].set_id) {
        var mins = set_segments[0].worldMinPosition();
        var maxs = set_segments[0].worldMaxPosition();
   
     for (var j = 1; j < set_segments.length; j++) {
            var seg_min = set_segments[j].worldMinPosition();
            var seg_max = set_segments[j].worldMaxPosition();
            if (seg_min.x < mins.x) mins.x = seg_min.x;
            if (seg_min.y < mins.y) mins.y = seg_min.y;
            if (seg_max.x > maxs.x) maxs.x = seg_max.x;
            if (seg_max.y > maxs.y) maxs.y = seg_max.y;        }
                
        // flatten min-max for dash (height)
        if (set_segments[0].symbol == "-"
            || set_segments[0].symbol == "_dash"
            || set_segments[0].symbol == "frac"){
            if (maxs.y - mins.y > 1) {
                var user_drawn_height = maxs.y - mins.y;
                maxs.y = maxs.y - (user_drawn_height / 2);
                mins.y = mins.y + (user_drawn_height / 2);                  }
            console.log("user drawn height for dash:" + (maxs.y - mins.y)); }
                
        var recognition_result = RecognitionManager.getRecognition(set_segments[0].set_id);
        if (recognition_result != null) {
            var flag_id = true;
            for (var l = 0; l < Editor.segmentSplits.length; l++) 
                if (recognition_result.set_id == Editor.segmentSplits[l].set_id) flag_id = false;
            if (flag_id == true) {
                var test = recognition_result;
                var tuple = new Tuple(recognition_result, mins, maxs);
                data.push(tuple);                    }                }
        set_segments.length = 0;
        set_segments.push(seg); }
    else set_segments.push(seg); }
        
SysEquations.TupeExpres.push(data);
fraz.pop();
fraz = Gestures.Sort(fraz); }

/*****************************************************************************/
SysEquations.s_variable = "";
/*****************************************************************************/


/******************************************************************************
* INTENT: convert array of symbols & their coordinates to an XML string
*
* INPUT:  "tupe" object holding symbols
*
* OUTPUT: SysEquations.string
*
"?segments=
<Expressions guid = "b931a19c-2ac9-88cc-eb6a-edcda169be7d">
<Exercise idExp = "5" stepExp = "0" hint ="false" title="" idActiveMath="" userInputPostion ="-1"></Exercise>
<SegmentList guid = "f6c38a46-fbb7-0c4e-59d3-56a0b2219582">
<Segment symbol="_lparen" min="298,157" max="309,203" id="1"/>
<Segment symbol="x_lower" min="331,166" max="370,198" id="4"/>
<Segment symbol="_plus" min="400,167" max="433,195" id="7"/>
<Segment symbol="2" min="458,156" max="483,196" id="9"/>
<Segment symbol="_rparen" min="488,132" max="505,211" id="11"/>
<Segment symbol="_lparen" min="524,151" max="535,197" id="13"/>
<Segment symbol="x_lower" min="546,156" max="594,189" id="16"/>
<Segment symbol="_dash" min="620,174" max="641,174" id="18"/>
<Segment symbol="3" min="666,148" max="689,189" id="20"/>
<Segment symbol="_rparen" min="709,135" max="726,214" id="22"/>
<maxima variable="x">$(x%2B2)(x-3)$</maxima></SegmentList></Expressions>"
******************************************************************************/

SysEquations.BuildXML = function(tupe) {
    var coverIds = null;
    SysEquations.string = new StringBuilder();
    var sb = new StringBuilder();
    var s_variable = "";
//    var stepHis = 0;
//    if (HistorySegments.index < HistorySegments.list_segments.length - 1){
//	stepHis = HistorySegments.countalign + HistorySegments.index;
//    }
//    else {
//	stepHis = HistorySegments.list_segments.length;
//    }
    sb.append("?segments=<Expressions guid = \"" + guid() + "\">");
    sb.append("<Exercise idExp = \"" + parseInt(ExercisesMenu.check_value) + "\" stepExp = \"" + HistorySegments.step
    + "\" hint =\""+ Editor.hint + "\" title=\"" + Exercises.title 
	+ "\" idActiveMath=\"" + Exercises.id_activeMath +  "\" userInputPostion =\"" + Exercises.userInputPostion  
	+ "\">");
    //sb.append("<Exercise idExp = \"" + 1 + "\" stepExp = \"" + HistorySegments.step + "\" stepHis = \"" + stepHis + "\" flagDel = \"" + HistorySegments.check_delete + "\">");
    sb.append("</Exercise>");
    //sb.append("<guid>").append(guid()).append("</guid>");
    var arr_symbol = new Array();
    for (var i = 0; i < tupe.length; i++) {
	sb.append("<SegmentList guid = \"" + guid() + "\">");
	coverIds = new Array();
	SysEquations.Flag = true;
	
	for (var k = 0; k < tupe[i].length; k++) {
	    var t = tupe[i][k];	    
	    
	    if (t.item1 == null) SysEquations.Flag = false;
	    else if (t.item1 != null) {
		var sSymbol = null;
		var parentid = null;

		parentid = parseInt(t.item1.set_id);
		sSymbol = t.item1.symbols[0].toString();
		//console.log("t.item1.set_id: " + t.item1.set_id);
		
//g: rm --> using SysEquations.s_variable until we have a field "variable" in histories table
/*		
		if (sSymbol == "x_lower" || sSymbol == "y_lower" || sSymbol == "y" || sSymbol == "x") {
		    if (!arr_symbol.contains(sSymbol)) {
			arr_symbol.push(sSymbol);
			if (s_variable == "") s_variable = sSymbol;
			else
			s_variable = s_variable + "," + sSymbol;
		    }
		}
*/		
		if (arrCoverItems.length > 0) {
		    var array = null;
		    if (Editor.shapeSymbols.indexOf(sSymbol)>-1) {
			for (var n = 0; n < arrCoverItems.length; n++) {
			    var tCover = null;
			    var parentCover = null;

			    tCover = arrCoverItems[n];
			    parentCover = parseInt(tCover.item4.toString());
			    if (parentCover == 0 && parentid == tCover.item1.set_id) {
				var tupleid = null;
				tupleid = new Tuple(0, parentid);
				coverIds.push(tupleid);
				Editor.buildElementSegment(sb, t, tCover.item5);
				SysEquations.Flag = true;
			    }
			}
		    } else /*if (Editor.IsExistsCoverItem(parentid) == false)*/
		    {
			Editor.buildElementSegment(sb, t);
			SysEquations.Flag = true;
		    }
		} else {
		    Editor.buildElementSegment(sb, t);
		    SysEquations.Flag = true;
		}
	    }
	}
	
	/*TODO: remove exercise
	var dropdown = document.getElementById("slctExercise");
	var index = ExercisesMenu.select_exercise.selectedIndex;
	//console.log("index: " + index);
	var option = dropdown.options[index];
	var variable = option.getAttribute("cvariable");
	var latex = option.getAttribute("latex");*/

	var index = Exercise.current.index;
	var variable = Exercise.current.variable;
	var latex = Exercise.current.latex;
	var tempmax = null;
	if(SysEquations.s_variable != ""){
	    s_variable = SysEquations.s_variable;
	}
	if (HistorySegments.currMaxima == null && index != 0 && tupe.length == 1) {
	    HistorySegments.currMaxima = latex;
	    HistorySegments.currMaxima = HistorySegments.currMaxima.replace(/\+/gm, "%2B");
	    sb.append("<maxima variable=\"").append(variable).append("\">");
	    sb.append(HistorySegments.currMaxima).append("</maxima>");
	}
	else if (tupe.length == 1){
	    if (HistorySegments.currMaxima != null){
		HistorySegments.currMaxima[i] = HistorySegments.currMaxima[i].replace(/\+/gm, "%2B");
		tempmax = HistorySegments.currMaxima[i];
	    }
	   
		sb.append("<maxima variable=\"").append(s_variable.replace("_lower","")).append("\">");
	   
	    sb.append(tempmax).append("</maxima>");	    
	}
	else {
	    if (HistorySegments.currMaxima != null && HistorySegments.currMaxima[i] != undefined){
		HistorySegments.currMaxima[i] = HistorySegments.currMaxima[i].replace(/\+/gm, "%2B");
		tempmax = HistorySegments.currMaxima[i];
	    }
	    sb.append("<maxima variable=\"").append(s_variable.replace("_lower","")).append("\">");
	    sb.append(tempmax).append("</maxima>");	
	}
	//sb.append("<guid>").append(guid()).append("</guid>");
	sb.append("</SegmentList>");
	
    }
    sb.append("</Expressions>");
    SysEquations.string = sb.toString();
}
