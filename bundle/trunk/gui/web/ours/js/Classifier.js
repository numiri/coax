function Classifier() { }
Classifier.buildUrl = function(in_segments,should_segment)                    {
//Shape recognizer    
if(Editor.change_step && Editor.check_box)                                    {
   var sb = new StringBuilder();
   sb.append(Editor.gestures_server);
   sb.append("?segmentList=<SegmentList>");
   for (var k = 0; k < in_segments.length; k++)
      sb.append(in_segments[k].toXML());
   sb.append("</SegmentList>");
   return sb.toString();                                                      }   // End of shape recognizer

var url = Editor.classifier_server_url;
if ( Editor.rex_engine == "mic" || Editor.rex_engine == "midra" )             {
   var strokeArr = new Array();
   for (var k = 0; k < in_segments.length; k++)                               {
      var strokeData={};
      strokeData.Points     = in_segments[k].points.toString();
      strokeData.TranslateX = in_segments[k].translation.x;
      strokeData.TranslateY = in_segments[k].translation.y;
      strokeData.InstanceId = in_segments[k].instance_id;
      strokeArr.push(strokeData);                                             }//end for
   url += "?request=" + JSON.stringify(strokeArr);                            }//end if mic
else if ( Editor.rex_engine == "pet" || Editor.rex_engine == "cid")           {
   var sb = new StringBuilder();
   sb.append("?segmentList=<SegmentList>");
   for (var k = 0; k < in_segments.length; k++)
      sb.append(in_segments[k].toXML());
   sb.append("</SegmentList>");
   sb.append("&segment=");
   sb.append(should_segment ? "true" : "false");
   url += sb.toString();                                                      }//end if cid and pet	
else if ( Editor.rex_engine == "seshat" || Editor.rex_engine == "smash" )     {
   url += "?action=classifier&id="+in_segments[0].instance_id+"&input="
   +  encodeURI( (rex.buildQueryString(in_segments)).replace(/\.5/g,"") );
                          }//end if seshat   
return url;
}
Classifier.prototype = {

/******************************************************************************
*
* input: should_segment = boolean (used only for pet & cid)
*        in_segments[0]   .  element   .   children[0]
*       (PenStroke object)  (<g> node)    (<polyline> node)
*
*              |------------------- element: g -----------------------|
*                     |--------- <polyline> node ----------------|
*
*       [ {.., {.., [ innerHTML="<polyline points="1,1 4,6, 0,2.." ]  }, ..} ]
*
*                   |---------------- children[] ------------------|
*         |-------------------------- PenStroke ---------------------------|
*       |---------------------------- in_segment ----------------------------|
*
* method:
* for mic:
*   url = http://...?request=[ { Points:"0,0,0,0,66,1", TranslateX:267
*   , TranslateY:122, InstanceId:1 }, { Points:...,InstanceID:1 } ]
* for pet/cid
*   url = web/ours/jsp/recognizer.jsp
*   ? segmentList = <SegmentList>
*   <Segment type="pen_stroke" instanceID="0" scale="1,1" translation="223,182" 
*   points="0,3|..."/> <Segment ... />
*   </SegmentList>
*   & segment=false"
*
*a seshat is particularly bad w/ frac, so we do it manually here.
******************************************************************************/

classify : function(in_segments, should_segment)                              {
if(in_segments.length == 0) return;
if( Classifier.manuallyClassify( in_segments ) == 1 ) return;

var seg0      = in_segments[0];
var current_set_id = seg0.set_id;
var isflat    = Stroke.isFlat( in_segments[in_segments.length-1].element
.               children[0].getAttribute("points") );

$.get( Classifier.buildUrl(in_segments,should_segment)
,  function(data, textStatus, xmlhttp)                                        {
  if((in_segments.length==1 && seg0.symbol==undefined)|| in_segments.length>1){
      data = xmlhttp.responseText;
      // build each recognition result from the xml
      var xmldoc = new DOMParser().parseFromString(data, "text/xml");
      var result_list = xmldoc.getElementsByTagName("RecognitionResults");
      var symbol;
      for (var k = 0; k < result_list.length; k++)                            {
         var recognition = new RecognitionResult();
         recognition.fromXML(result_list[k],current_set_id);
         symbol = recognition.symbols[0];
         symbol = Classifier.changeSymbol(symbol, recognition.symbols[1], in_segments );
         if( in_segments.length == 1 && isflat ) symbol = "frac"; //a

         recognition.symbols[0] = symbol;
         if (in_segments.length == 1)
            RecognitionManager.result_table.push(recognition);         
   
         for (var i = 0; i < in_segments.length; i++)                         {
            in_segments[i].symbol = symbol;
            Gestures.TouchEnd(in_segments[i], symbol, recognition);
            in_segments[i].status = false; //flag
            in_segments[i].flag = false; //isDraff
            in_segments[i].isDraff = false;                                  }}//for result_list
      RenderManager.render();

      if(in_segments.length>1)
        AutoGroup.GroupSegments(in_segments,symbol);
   
      //Editor.segments.sort(function(a,b){return a.instance_id - b.instance_id});
      Gestures.Sort(Editor.segments);//sort by position
   
      if(AutoGroup.Symbols4Grouping.indexOf(symbol)>-1){
        var current_index = -1; var instid = in_segments[in_segments.length-1].instance_id;
        for (var i = 0; i < Editor.segments.length; i++)
           if(Editor.segments[i].instance_id == instid)                      {
              current_index = i;
              break;
           }
        if(current_index>0 || symbol == 'frac')
           AutoGroup.Groups(current_index,symbol);
      }
   }
})
.  fail( function( jqXHR, textStatus, errorThrown )                           { 
   Editor.copeAjaxError( jqXHR, textStatus, errorThrown );                 });}//classify
}// end of Classifier.prototype

/******************************************************************************
* intent: heuristics classification for frac and dots symbols (i,j,=,:)
* input : in_segments = ungrouped strokes
* output: 1 if stroke is what we're looking for (dots & fracs)
*         0 "     "   " NOT "   "      "     "
* method: we define rules for dots and fracs here.
*         not quite rex-free.  rex is called in GroupingByRex() for grouping, not for symbols
*         index  = the newest stroke written among Editor.segments (all of canvas)
*         inseg_tip = the newest stroke written among in_segments 
*           (current strokes needing grouping)
* bug   : cannot recognize group triple-frac Define symbole
*
*a if i,j,= dont need to do anything else cuz GroupingByRex() modified the data
******************************************************************************/

Classifier.manuallyClassify = function( in_segments )                         {
var seg0      = in_segments[0];
var index     = Editor.segments.length-1;
var inseg_tip = in_segments.length-1;
var isflat    = Stroke.isFlat( in_segments[inseg_tip].element.children[0]
.               getAttribute("points") );
var isdot     = seg0.size.x < Editor.dot_width * 3 && seg0
.                    size.y < Editor.dot_width * 3;

if( in_segments.length == 1 && (isdot || isflat) 
&&  index > 0 
&&  AutoGroup . isVerticalOverlap( seg0, Editor.segments[index-1] ) 
&&  AutoGroup . areVerticalAdjacencySegs( "ij:=",Editor.segments[inseg_tip], seg0 ) 
&&  AutoGroup . GroupingByRex( index, [2], [["i","j",":","="]] ) )
     return 1; //a
else return 0;                                                                }


/******************************************************************************
*
******************************************************************************/
Classifier.changeSymbol = function(symbol, symbol1, in_segments) {
var s_symbol = symbol;

// there's also changeSymbol() type code in classify()
// it's not here because it only relies on the stroke, not the resultant symbol

if ( Editor.rex_engine == "mic" ) {
   if( Editor.xiz_level == "k8" )
      switch (symbol) {
      case "partial":           s_symbol = "2";        break;
      case "alpha"  :           s_symbol = "2";        break; }
   if(symbol.startsWith("mathrm")) s_symbol = symbol.replace("mathrm",""); 
   switch (symbol)                                                           {
   case "left[":             s_symbol = "[";        break;    
   case "right]":            s_symbol = "]";        break;
   case "left(":             s_symbol = "(";        break;    
   case "right)":            s_symbol = ")";        break;
   case "forall":            s_symbol = "\u2200";   break;                   }}

if ( Editor.rex_engine == "pet" ) {
   if (symbol == "g" && symbol1 == "9") s_symbol = symbol1;
   if (symbol == "b" && symbol1 == "5") s_symbol = "5";
   if (symbol == "D" && symbol1 == "right_bracket") s_symbol = "right_bracket";
   switch (symbol)                                                            {
   case "_equal":
   case "equals":
   case "minus":
   case "zeta":              s_symbol = "_dash";   break;
   case "\u221A":
   case "root":              s_symbol = "sqrt";    break;
   case "right_parenthesis": s_symbol = "("; break; // case "right_bracket":
   case "left_parenthesis":  s_symbol = ")"; break;
   case "left(":             s_symbol = "("; break;
   case "right)":            s_symbol = ")"; break;
   case "d_lower":           s_symbol = "d";       break;
   case "e_lower":           s_symbol = "e";       break;                    }}
return s_symbol;
}

/******************************************************************************
*
******************************************************************************
Classifier.translateFraz = function( fraz ) {
var entry;
var dict = JSON.parse( Classifier.Dict );
for (entry in dict.mic)  fraz = fraz.replace( entry.from, entry.to ); }

******************************************************************************
*
******************************************************************************
Classifier.Dict = {
"mic" : [ { "from":"left(", "to":"(" }, { "from":"right", "to": ")" } ],
"pet" : [ ]
}
*/
