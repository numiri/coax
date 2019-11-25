/******************************************************************************
* suppose the user writes "a x"
* we want to group the 2 strokes "\" and "/" but we must keep them separate.  
* if we collect all points from the 2 strokes into a single, the browser will
* erroneously draw an additional line "__" as follows
*
* \  /  
*  \/   The way to group 2 strokes is to keep them separate and set their
*  /\   set_id attributes to the same value.
* /__\  
* In order to remove __ of X above, we need to add an '-' between points of 
* 2 strokes \ and /
* 
* here are the data structures before & after grouping
*
* before
* E.segments[1]      = (PenStroke) { instance_id=1, set_id=1, ... }
* RM.result_table[13] = (RR)      { instance_ids[] = [ 1 ], set_id=1, symbols="-" }
* E.segments[2]      = (PenStroke) { instance_id=2, set_id=2, ... }
*
* after
* E.segments[1]      = (PenStroke) { instance_id=1, set_id=2, ... }
* E.segments[2]      = (PenStroke) { instance_id=2, set_id=2, ... }
* RM.result_table[13] = (RR)      { instance_ids[] = [ 1 ], set_id=2, symbols="+" }
******************************************************************************
Sample (x+2)(x-3)
******************************************************************************
Classifier.js postRecognition:   $.get(recognition.jsp?.. 
,   function(..){...};

Formula.Copy() is important cuz I think it's where the grouping is written into the data structure
RecognitionManager.result_table -- I think this is where all the stroke groupings are kept:
RM.r_t[0].symbols = [ l_paren  ]
RM.r_t[1].symbols = [ x, x    ]
RM.r_t[2].symbols = [ + , +   ]
RM.r_t[3].symbols = [ 2      ]
RM.r_t[4].symbols = [ r_paren  ]
RM.r_t[5].symbols = [ l_paren  ]
RM.r_t[6].symbols = [ x, x    ]
...


don't confuse AG.Groups() with AG.Group()
* the singular form tests for various symbols I,sin,... and does Formula.Copy()
* the plural   calls the singular

==================
Events.Gestures.js
==================
Gestures.EndPenStroke = function() {
...
      } else {
     Gestures.state = 3;
     AutoGroup.count++;
   
     AutoGroup.resetSetID4CollidedSegments(Editor.current_stroke);
     RecognitionManager.enqueueSegment(Editor.current_stroke);
...     
}

===================
Editor.Constants.js:  Editor.AutoGroupPen = true;
===================

==========
   dots 
==========

6    = defined in E.Constants::dot_width
18   = 3 * dot_width
bbox = bounding box of dot-candidate

Summary:  if bbox < 6 then symbol is "dot", else use rex singly & 2-strokes

Details:
if stroke < 6  then assign "dot" symbol and send 2 strokes 
|-> for rex ... AG.GroupingByRex().
else stroke > 6   classify(in_segs, false):
|-> (a) if 6 < bbox < 6*3 then  AG.GroupingByRex(2 strokes); return;
|         (strokes are sorted in drawing order)
|-> (b) $.get( dot-candidate )                                {
           AG.Groups(index,"dot") -> GroupByRex(2-strokes)    }

only one post-rex logic runs, either (a) or (b) but not both.
(a) accepts the recognizer's grouping decision
(b) run our own heuristic.  AG.Groups() considers stroke position.

---

Below is the long version of the sequence above:
Editor.onEnd with Editor.current_stroke and Editor.state = EditorState.ReadyToRectangleSelect
--> Gestures.EndStroke: ending of the drawing action 
    |--> Gestures.EndPenStroke 
         |---> Editor.current_stroke.finish_stroke()
         |---> if      Editor.current_stroke.size.x,y <= Editor.dot_width --> assign symbol "dots" without calling to recognizer. 
                |--> AutoGroup.Groups(Editor.segments.length-1, "dots"); (strokes are sorted in drawing order) 
                      |--> AutoGroup.GroupingByRex to group i,j,:
         |---> else
                |--> assign Gestures.state = 3; 
                |--> AutoGroup.resetSetID4CollidedSegments(Editor.current_stroke); (set the same set_id to strokes that collide E.current_stroke )
                |--> RecognitionManager.enqueueSegment
                     |--> get "in_segs" (segments have the same set_id as Editor.current_stroke
                     |--> Editor.classifier.classify(in_segs, false);
                          |--> checking tittle again if seg0.size.x < Editor.dot_width*3 (s) (strokes are sorted in drawing order) by calling AutoGroup.GroupingByRex
                          |--> ajax call to Recognizer to get the symbol
                               Succeed: if(in_segs.length>1) AutoGroup.GroupSegments(in_segs,symbol); (grouping collided strokes)
                                        Gestures.Sort(Editor.segments);//sort by position
                                        if symbol is one of AutoGroup.Symbols4Grouping or "frac" 
                                          |--> AutoGroup.Groups(.. symbol);
                                               |--> AutoGroup.GroupingBySymbols
                                               |--> AutoGroup.GroupingByRex
   
=============
"5" (bug 233)
=============

1. draw "1"
2. draw "b"
3. draw "-" for "5".  strokes known to cross
4. recognizer returns symbol "b" for the curvy stroke of "5"
5. sort changes order of stroke to 1-frac-b

old code:  does not change set_id for the last re-sorted stroke "b".  
           has 3 set id's.  so recognizer sees 3 stroke.
new code:  "b" and frac has the same set id, so recognition is on both strokes 
           b & frac simultaneously.  sort order is changed because frac has 
          the left most position

 | -+--   (note that the hyphen stroke is left of the "b" stroke)
/|  |     re-sorted order is 1-hyphen-b
 |  +--+  these 3 strokes has 2 set ids.  b & hyphen has the same set id
 |     |
 |  ---+

 |  +--   note that the "b" stroke is left of hyphen
/|  |     sort order is 1-b-hyphen.  this has 3 set ids
 |  +--+
 |     |
 | ----+

Each time we draw a stroke, we resort by x-position and re-assign set id's 
as appropriate.  If we assign 2 strokes the same set-id, we take the newest 
stroke's set id as the combined set id.

see AG.resetSetID4CollidedSegments()   
   
*/

AutoGroup.count = 0;
function AutoGroup(index){
   this.index = index;//luu vi tri cua segments   
   this.segments = new Array();
   this.symbols = new Array();
   this.cer = new Array();
}

AutoGroup.prototype.initialize = function(){//initialize
   this.segments = new Array();
   this.symbols = new Array();
   this.cer = new Array();
}

AutoGroup.prototype.Add = function(in_segment){
   if(this.segments.contains(in_segment))
      return;
   this.segments.push(in_segment);
   this.cer.push(1);
}

AutoGroup.prototype.AddSymbol = function(symbol){
   for(var k =0;k< this.segments.length;k++){
      this.symbols.push(symbol);
   }
}

/*
* This function use for myscript autogroup
* 
*/
AutoGroup.prototype.AddSymbols = function(symbols){
   for(var k = 0;k< symbols.length;k++){
      this.symbols.push(symbols[k]);
   }
}


AutoGroup.removeAction = function(index){
   if(index >-1){
      for(var k = index;k < Editor.undo_stack.length - 1;k++){
         Editor.undo_stack[k] = Editor.undo_stack[k+1];
      }
      Editor.undo_stack.pop();
   }
}

AutoGroup.FindAction = function(set_id){
   for(var k = 0;k < Editor.undo_stack.length;k++){
      var action = Editor.undo_stack[k];
      if(action.toString() == "AddSegments"){         
         for(var j = 0;j < action.segments.length;j++){
            if(action.segments[j].set_id == set_id)
               return k;
         }
      }
   }
   return -1;
}

AutoGroup.FindActionCopy = function(set_id){
   for(var k = 0;k < Editor.undo_stack.length;k++){
      var action = Editor.undo_stack[k];
      if(action.toString() == "CopySegments"){         
         for(var j = 0;j < action.segments.length;j++){
            if(action.segments[j].set_id == set_id)
               return k;
         }
      }
   }
   return -1;
}
/******************************************************************************
*
*a preparing a new action
*b add symbol to RecognitionManager.result_table
******************************************************************************/
AutoGroup.GroupSegments = function(segments, symbol, newAction)               {
   var ag = new AutoGroup(0);
   var action = null;
   if(newAction) action = new GroupSegments(segments, -1, true); //a
   var set_id_changes = [];
   for (var i = 0; i < segments.length; i++)       ag.Add(segments[i]);
   ag.AddSymbol(symbol);
   Formula.Copy(ag.segments, ag.symbols, ag.cer, false); //b
   if( action!=null )                                                          {
      action.new_set_id = ag.segments[0].set_id;
      Editor.add_action(action);                                              }}

/****
 * called from Gestures.EndPenStroke
 * set the same set_id to strokes that collide lastSeg 
 */
AutoGroup.resetSetID4CollidedSegments = function(lastSeg){
   var segLength = Editor.segments.length;
   if(segLength < 2) return;

   var stroke1 = [];
   for(var i=0; i<lastSeg.points.length; i++){     
      /*
      var newPoint = {x:lastSeg.translation.x + lastSeg.points[i].x, 
                      y:lastSeg.translation.y + lastSeg.points[i].y};
                      */
      var newPoint = lastSeg.points[i].transform(lastSeg.scale,lastSeg.translation);
      stroke1.push(newPoint);
   }

   var ids_in_set = new Array();
   ids_in_set.push(lastSeg.set_id);
   for(var j=0; j<segLength; j++){
      var stroke2 = [];
      var seg = Editor.segments[j];
      //unnecessary to check crossed for stroke when its set_id exists in the list
      if(ids_in_set.indexOf(seg.set_id) == -1){
        for(var k=0; k<seg.points.length; k++){
           var point = seg.points[k].transform(seg.scale,seg.translation);
           stroke2.push(point);
        }
        if(crosses(stroke1, stroke2)) ids_in_set.push(seg.set_id);
      }
   }//for
   ids_in_set.splice(0, 1);//remove the lastSeg id
   
   //assign new set_id to the strokes in set & get set_id_changes for undo grouping
   var set_id_changes = [];
   for(var l=0; l<segLength; l++){
     var seg = Editor.segments[l];
     if(ids_in_set.indexOf(seg.set_id) != -1){
       set_id_changes.push({
            instance_id: seg.instance_id,
            old_set_id : seg.set_id
         });
       seg.set_id = lastSeg.set_id;
     }
   }
   Editor.current_action.set_id_changes = set_id_changes;

}//end of resetSetID4CollidedSegments
/*****************************************************************************

******************************************************************************
AutoGroup.Groups = function()                                    {
var segments = new Array() = E.segments w/o Heart-Block-Dralf, sorted by worldMinPosition.x

.                                          |--Fracs--|
var groups = ( new AutoGroup() ) . Fractions( segments, new Array() )
loop groups[j,k]: (new AutoGroup(j)) . Group( groups[k].segments[j], groups[k].segments )

(new AutoGroup(0)).SetSin(segments); // unused line ?
loop Fracs:  Fracs[k].symbol = "_dash";                             }
*****************************************************************************/
AutoGroup.Groups = function(segIndex, trigger){
/*   
//Editor.segments = Gestures.Sort(Editor.segments);
if(!Editor.AutoGroupPen) return;
var segments = new Array();
for(var k = 0;k< Editor.segments.length ;k++){
   var seg = Editor.segments[k];      
   if(Gestures.isSegmentHeart(seg) || Gestures.isBlockSegment(seg, 1) || Gestures.IsSegmentsBelongDralf(seg))
     continue;                                        
   segments.push(seg); }
segments = Gestures.Sort(segments);
var auto = null;   
auto = new AutoGroup(0);
var Fracs = new Array();
var groups = auto.Fractions(segments,Fracs);

for(var k = 0;k < groups.length;k++){
//   var gr = groups[k]; var segs = gr.segments;
   for(var j = 1;j< groups[k].segments.length;j++){         
     var autoFrac = new AutoGroup(j);         
     autoFrac.Group(groups[k].segments[j],groups[k].segments);   }}   
auto = new AutoGroup(0);
auto.SetSin(segments);
for(var k = 0;k < Fracs.length; k++)  Fracs[k].symbol = "_dash"; 
*/
var strokeSizeArr = new Array();
var checkingSymbolsArr = new Array();
var b = false;
var targetSymbolsRefArr = new Array();
var targetSymbolsRef;

switch (trigger){
   case "frac":
     //--- case of plusminus symbol 
     if(segIndex>=2 // case: + + frac
     && ((Editor.segments[segIndex-2].symbol == "+"    && Editor.segments[segIndex-1].symbol == "+") 
      || (Editor.segments[segIndex-2].symbol == "frac" && Editor.segments[segIndex-1].symbol == undefined)
      || (Editor.segments[segIndex-2].symbol == "frac" && Editor.segments[segIndex+1].symbol == "|"))
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex],Editor.segments[segIndex-1])
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex],Editor.segments[segIndex-2])
     && AutoGroup.areVerticalAdjacencySegs("\u00B1",Editor.segments[segIndex],Editor.segments[segIndex-1],Editor.segments[segIndex-2])){
       b = AutoGroup.GroupingByRex(segIndex, [3], [["\u00B1"]]);}
     
     else if(segIndex>=1 && segIndex<Editor.segments.length-1 // case: + frac +, frac frac undef
     &&((Editor.segments[segIndex-1].symbol == "+"    && Editor.segments[segIndex+1].symbol == "+") 
     || (Editor.segments[segIndex-1].symbol == "frac" && Editor.segments[segIndex+1].symbol == undefined)
     || (Editor.segments[segIndex-1].symbol == "frac" && Editor.segments[segIndex+1].symbol == "|"))
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex],Editor.segments[segIndex-1])
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex],Editor.segments[segIndex+1])
     && AutoGroup.areVerticalAdjacencySegs("\u00B1",Editor.segments[segIndex-1],Editor.segments[segIndex],Editor.segments[segIndex+1])){
       b = AutoGroup.GroupingByRex(segIndex+1, [3], [["\u00B1"]]);}
      
     else if(segIndex<Editor.segments.length-2 // case: frac + +
     &&((Editor.segments[segIndex+1].symbol == "+"    && Editor.segments[segIndex+2].symbol == "+")
     || (Editor.segments[segIndex+1].symbol == "frac" && Editor.segments[segIndex+2].symbol == undefined)
     || (Editor.segments[segIndex+1].symbol == "frac" && Editor.segments[segIndex+2].symbol == "|"))
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex],Editor.segments[segIndex+1])
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex],Editor.segments[segIndex+2])
     && AutoGroup.areVerticalAdjacencySegs("\u00B1",Editor.segments[segIndex],Editor.segments[segIndex+1],Editor.segments[segIndex+2])){
        b = AutoGroup.GroupingByRex(segIndex+2, [3], [["\u00B1"]]);}

     //--- case of = symbol   
     else if(segIndex>=1 && Editor.segments[segIndex-1].symbol == "frac"
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex-1],Editor.segments[segIndex])
     && AutoGroup.areVerticalAdjacencySegs("=",Editor.segments[segIndex-1],Editor.segments[segIndex])){
        b = true; 
        AutoGroup.GroupSegments([Editor.segments[segIndex-1],Editor.segments[segIndex]],"=",true);}   
     
     else if(!b && segIndex<Editor.segments.length-1 && Editor.segments[segIndex+1].symbol == "frac"
     && AutoGroup.isVerticalOverlap(Editor.segments[segIndex],Editor.segments[segIndex+1])
     && AutoGroup.areVerticalAdjacencySegs("=",Editor.segments[segIndex],Editor.segments[segIndex+1])){
       b = true; 
       AutoGroup.GroupSegments([Editor.segments[segIndex],Editor.segments[segIndex+1]],"=", true);}
     //-----------
     break;
   case "dots":
   case ".":   
     b = AutoGroup.isTittle(segIndex);
     if(b){
       AutoGroup.GroupingByRex(segIndex, [2], [["i","j",":"]]);
     }
     break;
   case "n"://sin, tan
     if(segIndex>=3){
       strokeSizeArr.push(4);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"sin","tan"));
       targetSymbolsRefArr.push(targetSymbolsRef);
       
     }
     if(segIndex>=2){
       strokeSizeArr.push(3);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"sin"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     if(segIndex>=1){
       targetSymbolsRef = new Array();
       strokeSizeArr.push(2);//checking ln must do after checking sin
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"ln"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }     
     break;
   case "s"://cos
   case "S":
   case "5":   
     if(segIndex>=2){
       strokeSizeArr.push(3);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"cos"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     break;
   case "g":
   case "9":
     if(segIndex>=2){
         strokeSizeArr.push(3);
         targetSymbolsRef = new Array();
         checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"log"));   
         targetSymbolsRefArr.push(targetSymbolsRef);
     }
     if(segIndex>=1){
         strokeSizeArr.push(2);
         targetSymbolsRef = new Array();
         checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"lg"));   
         targetSymbolsRefArr.push(targetSymbolsRef);
     }
     break;   
   case "m"://lim
     if(segIndex>=3){
       strokeSizeArr.push(4);// lim with i has 2 strokes
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"lim"));   
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     if(segIndex>=2){
       strokeSizeArr.push(3);// lim with i has 1 stroke
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"lim"));   
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     break;
   case "+":
   case "t"://cot, d/dt
     if(segIndex>=3){
       strokeSizeArr.push(4);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"cot"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     if(segIndex>=4){
       strokeSizeArr.push(5);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"d/dt"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     break;
   case "h":/* sinh, cosh, tanh, coth, sech, csch */
     var oldSymbol = Editor.segments[segIndex-1].symbol;
     if(["sin", "cos", "tan", "cot", "sec", "csc"].indexOf(oldSymbol) != -1){
       var segments_in_set = [Editor.segments[segIndex-1],Editor.segments[segIndex]];
       for(var j=segIndex-2; j>=0; j--){
         if(Editor.segments[j].set_id == Editor.segments[segIndex-1].set_id)
            segments_in_set.splice(0,0,Editor.segments[j]);
       }
       
        AutoGroup.GroupSegments(segments_in_set,Editor.segments[segIndex-1].symbol+"h", true);
        b = true;
     }//if
     else{
       if(segIndex>=3){
         strokeSizeArr.push(4);
         targetSymbolsRef = new Array();
         checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"sinh","cosh","sech","csch"));
         targetSymbolsRefArr.push(targetSymbolsRef);
       }
       if(segIndex>=4){
         strokeSizeArr.push(5);
         targetSymbolsRef = new Array();
         checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"sinh","tanh"));
         targetSymbolsRefArr.push(targetSymbolsRef);
       }
     }
     break;
   case "c"://sec, csc
     if(segIndex>=2){     
       strokeSizeArr.push(3);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"sec","csc"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     break;
   case "x":// d/dx
     if(segIndex>=4){
       strokeSizeArr.push(5);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"d/dx"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     break;
   case "y":// d/dy
   case "z":// d/dz
     if(segIndex>=3){    
       strokeSizeArr.push(4);
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"d/dy","d/dz"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     if(segIndex>=4){    
       strokeSizeArr.push(5);// z has 2 strokes
       targetSymbolsRef = new Array();
       checkingSymbolsArr.push(AutoGroup.variantsOfStrings(targetSymbolsRef,"d/dz"));
       targetSymbolsRefArr.push(targetSymbolsRef);
     }
     
     break;
}//switch     

var maxStrokeSize = -1;
for(var i=0; i<strokeSizeArr.length; i++)
   maxStrokeSize = Math.max(maxStrokeSize,strokeSizeArr[i]);

if(maxStrokeSize>0){
   /* store position of strokes in the reverse direction */
   var origStrkPos = new Array();

   for(var i=maxStrokeSize; i>0; i--)
     origStrkPos.splice(0,0,new Vector2(
         Editor.segments[segIndex-i+1].world_mins.x,
          Editor.segments[segIndex-i+1].world_mins.y));

   b = AutoGroup.GroupingBySymbols(segIndex, strokeSizeArr, checkingSymbolsArr, targetSymbolsRefArr, origStrkPos);
}
return b;
}//AutoGroup.Groups
/***********/
AutoGroup.Symbols4Grouping = ["frac","dots",".","n","S","s","5","g","9","m","t","+","h","c","x","y","z"];
/*****/
AutoGroup.notifyGrouping = function(message){
   var s = $("#equation_canvas").find("#grouping_alert");
   if(s.length == 0){
     $("#equation_canvas").append("<span id='grouping_alert'></span>");
     $("#grouping_alert").css("background-color","#ffd");
     $("#grouping_alert").css("border","1px solid #999");
     $("#grouping_alert").css("border-radius","4px");
     $("#grouping_alert").css("box-shadow","0 0 20px rgba(0,0,0,0.5)");
     $("#grouping_alert").css("color","#222");
     $("#grouping_alert").css("font-size","14px");
     $("#grouping_alert").css("padding","9px");
     $("#grouping_alert").css("position","absolute");
     $("#grouping_alert").css("z-index","9999");
   }
   $("#grouping_alert").stop(true,true).text(message).fadeIn(0).fadeOut(5000);
}//notifyGrouping
/***
 * posSymbolsArray -> [salt of s], [salt of i], [salt of n] 
********/
AutoGroup.variantsOf = function(posSymbolsArray){ 
   var firstArr = posSymbolsArray[0];
   posSymbolsArray.splice(0,1);
   
   if(posSymbolsArray.length>0) {
     var posibilities = new Array();
     var nextArr = AutoGroup.variantsOf(posSymbolsArray);
     for (var i=0;i<firstArr.length; i++)
       for (var j=0;j<nextArr.length; j++)
         posibilities.push(firstArr[i]+nextArr[j]);
     return posibilities;
   }   
   else
     return firstArr;
}//AutoGroup.variantsOf
/*******/
AutoGroup.variantsOfStrings = function(){
   var arr = [];
   var targetSymbolsRef = arguments[0];
   var anchorIndex = 0;
   
   for (var i=1; i<arguments.length; i++){
     //get list of characters from the string
     var letterArr = [];
     for(var j=0; j<arguments[i].length; j++)
       letterArr.push(arguments[i].charAt(j));
     
     //get symbols arrays of the characters above
     var posSymbolsArray = [];
     for (var j=0;j<letterArr.length; j++){
       var result = rex.Salts.filter(function(v) {
         return v.symbol === letterArr[j];});
       
       if(result.length < 1)
         posSymbolsArray.push([letterArr[j]]);
       else
         posSymbolsArray.push(result[0].salt);
     }
     
     //get possibilities of a string
     var psb = AutoGroup.variantsOf(posSymbolsArray);
     var anchor = new Object;
     anchor.grpSymbol = arguments[i];
     anchor.start    = anchorIndex;
     anchor.end      = anchorIndex + psb.length;
     
     for(var j=0;j<psb.length;j++)
       arr.push(psb[j]);
     
     targetSymbolsRef.push(anchor);
     anchorIndex += psb.length;
     
   }//for arguments

   return arr;
}//variantsOfStrings
/***********
 * create a temporary stroke of 1 for Mipp to recognize trigonometric functions
 *************/
AutoGroup.getTmpStroke4Trig = function(ref){ 
var space = 20;
var pstrk = new PenStroke();
pstrk.translation.x = ref.world_maxs.x+space;
pstrk.translation.y = ref.world_mins.y;
pstrk.points = new Array();
pstrk.points.push(new Vector2(-7, ref.size.y/3));
pstrk.points.push(new Vector2(0,0));
pstrk.points.push(new Vector2(0,ref.size.y));
return pstrk;
}
/**********
 * 
 ****************/
AutoGroup.GroupingBySymbols = function(segIndex, strokeSizeArr, checkingSymbolsArr, targetSymbolsRefArr, origStrkPos, count){

var indexes = new Array();
var strokeSize = strokeSizeArr[0];
for(var i=strokeSize-1; i>=0; i--){
   indexes.push(segIndex-i);
}
strokeSizeArr.splice(0,1);

var checkingSymbols = checkingSymbolsArr[0];
checkingSymbolsArr.splice(0,1);

var targetSymbolsRef = targetSymbolsRefArr[0]; 
targetSymbolsRefArr.splice(0,1);

var newSymbol = ""; var grpAlert = ""; 
var segments_in_set = new Array();
for(var i=0; i<indexes.length; i++)
   //do nothing if invalid index
   if(indexes[i]<0 || indexes[i]>=Editor.segments.length) return false;
   else if(Editor.segments[indexes[i]].symbol == undefined){
     //add the data back
     strokeSizeArr.splice(0,0,strokeSize);
     checkingSymbolsArr.splice(0,0,checkingSymbols);
     targetSymbolsRefArr.splice(0,0,targetSymbolsRef);
     //call the function again after x seconds if the segment's symbol is invalid     
     if (count == undefined) count = -1;
     if(count++<5)
        setTimeout(AutoGroup.GroupingBySymbols(segIndex, strokeSizeArr, 
            checkingSymbolsArr, targetSymbolsRefArr, origStrkPos, count), 3000);
     return;
   }else{
     segments_in_set.push(Editor.segments[indexes[i]]);
     if(!(newSymbol.endsWith(segments_in_set[segments_in_set.length-1].symbol)
         && (newSymbol.endsWith("x")
            || newSymbol.endsWith("+") || newSymbol.endsWith("t") || newSymbol.endsWith("[") //t
            || newSymbol.endsWith("z")
            || newSymbol.endsWith("i")
            || newSymbol.endsWith("j")
            )
     )){
       newSymbol += segments_in_set[segments_in_set.length-1].symbol;
       grpAlert += " " + segments_in_set[segments_in_set.length-1].symbol;
     }
   }
//verify if stroke has been moved 
for(var i=segments_in_set.length-1; i>=0; i--){
   if(segments_in_set[i].world_mins.x != origStrkPos[segments_in_set.length-1-i].x
   && segments_in_set[i].world_mins.y != origStrkPos[segments_in_set.length-1-i].y){
     console.log("Segment was moved during grouping");
     return false;
   }
}
for(var j=0; j<checkingSymbols.length; j++)
   if(newSymbol == checkingSymbols[j]){
      //grouping segments
      var result = targetSymbolsRef.filter(function(v) {
       return v.start<=j && j<v.end;});
      if(result.length>0){
        newSymbol = result[0].grpSymbol;
      }
      AutoGroup.GroupSegments(segments_in_set,newSymbol, true);
      if(newSymbol != checkingSymbols[j])
        AutoGroup.notifyGrouping("\""+grpAlert+"\" --> \""+newSymbol+"\"");
      return true;
   }//if
if(strokeSizeArr.length>0) 
   return AutoGroup.GroupingBySymbols(segIndex, strokeSizeArr, 
       checkingSymbolsArr, targetSymbolsRefArr, origStrkPos);
else return false;

}//AutoGroup.GroupingBySymbols
/*********
 * Sample: = (trigger is "dash")
 * segIndex: 1;
 * strokeSizeArr: [[0,1],]
 * checkingSymbolsArr: [["=","i","j"]]
 * tmpStroke: undefined
 */
AutoGroup.GroupingByRex = function(segIndex, strokeSizeArr, checkingSymbolsArr, tmpStroke){
var indexes = new Array();
for(var i=strokeSizeArr[0]; i>0; i--)
   indexes.push(segIndex-i+1);
strokeSizeArr.splice(0,1);//remove the item

var checkingSymbols = checkingSymbolsArr[0];
checkingSymbolsArr.splice(0,1);

var segments_in_set = new Array();
for(var i=0; i<indexes.length; i++)
     if(indexes[i]<0 || indexes[i]>=Editor.segments.length) return false;
     else segments_in_set.push(Editor.segments[indexes[i]]);

//add tempstroke to the segment list
if(tmpStroke!= undefined)
   segments_in_set.push(tmpStroke);

//call Recognizer to verify the symbol grouping
$.get( Classifier.buildUrl(segments_in_set,false)
,  function(data, textStatus, xmlhttp) {   
   data = xmlhttp.responseText;
   // build recognition result from the xml
   var xmldoc = new DOMParser().parseFromString(data, "text/xml");
   var result_list = xmldoc.getElementsByTagName("RecognitionResults");
   if(result_list.length>0) {
      var recognition = new RecognitionResult();
      recognition.fromXML(result_list[0],Editor.segments[indexes[0]].set_id);
      var newSymbol = Classifier.changeSymbol(recognition.symbols[0], recognition.symbols[1]);

      //remove the tempstroke
      if(tmpStroke!= undefined){ 
         segments_in_set.splice(segments_in_set.length-1,1);
         if (newSymbol.endsWith("1")) newSymbol = newSymbol.replace("1","");
      }
      
      for(var j=0; j<checkingSymbols.length; j++)
         if(newSymbol == checkingSymbols[j]){
            AutoGroup.GroupSegments(segments_in_set,newSymbol, true);
            return true;
         }//if
   }//if result_list

   if(strokeSizeArr.length>0) 
      return AutoGroup.GroupingByRex(segIndex, strokeSizeArr, checkingSymbolsArr, tmpStroke);
   else return false;
});//function
}//AutoGroup.GroupingByRex
/*****
* 
******/
AutoGroup.isCheckSymbolIJ = function(in_segment){
   if(in_segment == undefined) return false;
   var symbolLst = rex.Salts.filter(function(v) {return v.symbol === "i";});
   if(symbolLst.length>0) {
     symbolLst = symbolLst[0].salt;
     for(var i=0; i<symbolLst.length; i++)
       if(in_segment.symbol == symbolLst[i]) return true;
   }
   symbolLst = rex.Salts.filter(function(v) {return v.symbol === "j";});
   if(symbolLst.length>0) {
     symbolLst = symbolLst[0].salt;
     for(var i=0; i<symbolLst.length; i++)
       if(in_segment.symbol == symbolLst[i]) return true;
   }
   return false;
}
/****
 * two segments vertically adjacent to each other
 ****/
AutoGroup.areVerticalAdjacencySegs = function(symbol,seg1,seg2,seg3 ){

   if(seg1 == undefined || seg1 == undefined) return false;
   var seg1_ric = seg1.ric();
   var seg2_ric = seg2.ric();
   var seg1_lec = seg1.lec();
   var seg2_lec = seg2.lec();
   
   if(symbol == 'ij:'){
      var height = Math.max(seg1_ric.y-seg1_lec.y, seg2_ric.y-seg2_lec.y);
      var distance = Math.min(Math.abs(seg1_lec.y-seg2_ric.y), Math.abs(seg2_lec.y-seg1_ric.y));
      if(height<Editor.dot_width*3){//dot
         if(distance<Editor.dot_width*10) return true;
         else return false;
      }
      else if(distance<height*2/3) return true; 
      else return false;
   }
   else{
      var distance = 0;
      var width = 0;
      if(seg3 != undefined){
         var seg3_ric = seg3.ric();
         var seg3_lec = seg3.lec();
         distance = Math.min(Math.abs(seg1_lec.y-seg2_ric.y), Math.abs(seg2_lec.y-seg1_ric.y),
                             Math.abs(seg1_lec.y-seg3_ric.y), Math.abs(seg3_lec.y-seg1_ric.y),
                             Math.abs(seg2_lec.y-seg3_ric.y), Math.abs(seg3_lec.y-seg2_ric.y));
         width = Math.max(seg1_ric.x-seg1_lec.x, seg2_ric.x-seg2_lec.x, seg3_ric.x-seg3_lec.x);
      }else{
         distance = Math.min(Math.abs(seg1_lec.y-seg2_ric.y), Math.abs(seg2_lec.y-seg1_ric.y));
         width = Math.max(seg1_ric.x-seg1_lec.x, seg2_ric.x-seg2_lec.x);
      }
      if(distance<width) return true; 
      else return false;
   }
   return false;
}
/******************************************************************************
* intent: test if one stroke completely covers the other in width
******************************************************************************/

AutoGroup.isVerticalOverlap = function(seg1,seg2)                            {
var line1MinX = seg1.lec().x;
var line1MaxX = seg1.ric().x;
var line2MinX = seg2.lec().x;
var line2MaxX = seg2.ric().x;
if( (line1MinX<=line2MinX && line1MaxX>=line2MaxX)  // stroke 1 is bigger
  ||(line1MinX>=line2MinX && line1MaxX<=line2MaxX)) // stroke 2 is bigger
  return true;
// 2/3 coverage counts as sufficient overlap:
var dis = AutoGroup.vOverlapDX( line1MinX, line1MaxX, line2MinX, line2MaxX );
if( dis / Math.min( seg1.size.x, seg2.size.x ) >=2/3 ) return true;
return false;                                                                }

/******************************************************************************
* intent: measure the horizontal overlap
* output: -1 if no overlap
*
*a case: 1st stroke is left most
*  line1:  p1L |----------------|        p1R
*  line2:  p2L   |---------------------| p2R
*
*b case: 2nd stroke is left most
*  line1:  p2L      |----------------|   p2R
*  line2:  p1L  |---------------------|  p1R
******************************************************************************/

AutoGroup.vOverlapDX = function(line1MinX,line1MaxX,line2MinX,line2MaxX)     {
if(line1MinX<=line1MaxX && line2MinX<=line2MaxX){ // sanity check
   var p1left,p1Right,p2left,p2Right;
   
   // sorting 2 1D lines by minX
   if(line1MinX<=line2MinX){ //a
     p1left = line1MinX; p1Right = line1MaxX;
     p2left = line2MinX; p2Right = line2MaxX;   }
   else{ //b
     p1left = line2MinX; p1Right = line2MaxX;
     p2left = line1MinX; p2Right = line1MaxX;   }
   if(p2left<p1Right) // overlap exists.  measure it
     return Math.min(p1Right-p2left,p2Right-p2left);
}
return  -1;                                                                  }

/******************************************************************************
* intent: 
******************************************************************************/
AutoGroup.isTittle = function(strokeIdx){
   // must be in a small box
   var tittle = Editor.segments[strokeIdx];
   if(tittle.size.x > Editor.dot_width
   || tittle.size.y > Editor.dot_width) return false;

   var ij = Editor.segments[strokeIdx-1];
   if(AutoGroup.isCheckSymbolIJ(ij) // previous stroke is i/j
   && ij.lec().y - tittle.ric().y >=0 // on top
   && ij.lec().y - tittle.ric().y < Editor.width){
     var dis = AutoGroup.vOverlapDX(tittle.lec().x, tittle.ric().x, 
            ij.lec().x - Editor.dot_width, ij.ric().x+Editor.dot_width);
     if(dis == 0) return true;
     else if(Math.min(tittle.size.x, ij.size.x) > 0
         && dis/Math.min(tittle.size.x, ij.size.x) >=2/3) return true;
   }
   //others
   return false;   
}//isTittle
/*******/
//*******************
/*
AutoGroup.prototype.Group = function(in_segment,segments){
   if(this.I(in_segment,segments)
   || this.J(in_segment,segments)
   || this.tan(in_segment,segments)
   || this.Pm(in_segment,segments)
   || this.Sin(in_segment,segments)
   || this.Lim(in_segment,segments)
   || this.Log(in_segment,segments)
   || this.Cos(in_segment,segments)
   || this.Equal(in_segment,segments)
   || this.Times(in_segment,segments)
   )
   {
      Formula.Copy(this.segments,this.symbols,this.cer,true);
      return true;
   }
   return false;
}
*/
/*****************************************************************************
AutoGroup.prototype.Fractions = function(segments,Fracs){
inputs: segments = E.segments = all strokes on canvas
      Fracs = empty Array object
output: 

variables:
segments  = almost a copy of E.segments (all groupable strokes, excludes heart/blocks/dralf)
segment[i].status = stroke is fraction-operand
tempGroup = 
bGroup   = single boolean flag for entire E.segments
         WHAT does bGroup do?  It depends on each stroke's "status" attribute which seems to be F for each of our 15 strokes.
group    = new Group()

arrFrac = all _dash strokes, (arrFrac or segments)[*].status = False
all strokes:  _dash's  numr+demr  remaining strokes  equal
           |-----|  |---+---|  |-------+-------|
                     |           |
                  groups[]      notFrac[]
abbr:  numr+demr = numerator & denominator

******************************************************************************

// build arrFrac as all _dash strokes:
var arrFrac, notFrac, groups = new Array(); var group;
for(var k = 0;k < segments.length;k++) if(segments[k].symbol=="_dash")  arrFrac.push(seg);
Fractions.UpdateStatus(segments); // bad code: UpdateStatus takes 2 args (segments[] & boolean)
Fractions.UpdateStatus(arrFrac);  // otherwise status flag is always F


// accumulate Fraction-operand strokes into Group(), setting stroke.status=T:
//   foreach _dash symbol, loop thru other non-dash strokes 
//   {  Group.Add( stroke ); stroke.status = T }

for (var k = 0; k < arrFrac.length; k++) {   var seg_frac = arrFrac[k];   if (seg_frac.status ) continue; // no effect
   group = new Group(); var _equal, m_tuSo, m_mauSo = new Array();
   for (var i = 0; i < segments.length; i++) {
     var seg = segments[i];      
     if(seg.status)          continue;  // no effect cuz status is always F
     if(seg.symbol == "_equal") continue;  // skip " = " strokes
     var mFrac = 0;
     if(seg.set_id != arrFrac[k].set_id) { //a
      mFrac = Space.isExistsFrac(arrFrac[k],seg.worldMinPosition(),seg.worldMaxPosition());}
     if     (mFrac == 1) {  m_tuSo.push(seg); seg.status = true; group.Add(seg); }
     else if (mFrac == 2) { m_mauSo.push(seg); seg.status = true; group.Add(seg); }
     if(seg.set_id == arrFrac[k].set_id)  group.Add(arrFrac[k]);   }
   // numerators & denominators only:
   if(m_tuSo.length > 0 && m_mauSo.length >0){
      arrFrac[k].symbol = "Frac";
      Fracs.push(arrFrac[k]);
      arrFrac[k].status = true;
      group.Sort();       
      group = Fractions.SetFrac(group);
      groups.push(group);   }
   else notFrac.push(group);                                  } // end for k

**
debugging:   exercise multiply, version = ..., write 1st stroke of "x":
E.segments[] = 15 strokes
notFrac & segments are 1-element arrays
**

// set status=F on each notFrac stroke
for (k=0; k<notFrac.length; k++) for (j=0; j<segs.length; j++) 
   notFrac[k].segments[j].status = false;

// build tempGroup
for (var i = 0; i < segments.length; i++){   
   if ( segments[i].status == false ) { tempGroup.push(segments[i]); bGroup = false; }
   else if (      bGroup == false ) { tempGroup.push(segments[i]); bGroup = true;  }}
bGroup = true;

**
loop tempGroup (rename to 'strokes')
first stroke:  group = new Group()
last  stroke:  groups.push(group) if strokes[i].status==F
strokes[i].status==F: group.Add(strokes[i])
**

for (var i = 0; i < tempGroup.length; i++) {   
   if(i ==0) group = new Group();
   if(tempGroup[i].status == false){           
    bGroup = false;      
    group.Add(tempGroup[i]);      }
   else if(!bGroup){
    if(group.segments.length > 0)   groups.push(group);
    group = new Group();   }
   if (i == tempGroup.length -1) && (tempGroup[i].status == false) && (group.segments.length > 0)
   .                         groups.push(group); }

groups = Fractions.SortGroup(groups);
return groups;  }
*****************************************************************************/
/*
AutoGroup.prototype.Fractions = function(segments,Fracs){
var arrFrac = new Array(), notFrac = new Array(), groups = new Array();
for(var k = 0;k < segments.length;k++)
   if (segments[k].symbol == "_dash")  arrFrac.push(segments[k]);
Fractions.UpdateStatus(segments);
Fractions.UpdateStatus(arrFrac);

var group;
for (var k = 0; k < arrFrac.length; k++) {
   var seg_frac = arrFrac[k];
   if (seg_frac.status ) continue;
   group = new Group();   
   var _equal = new Array(), m_tuSo = new Array(), m_mauSo = new Array();
   for (var i = 0; i < segments.length; i++) {
     var seg = segments[i];      
     if(seg.status)         continue;
     if(seg.symbol == "_equal"){ continue; }
     var mFrac = 0;
     if(seg.set_id != seg_frac.set_id) {
      mFrac = Space.isExistsFrac(seg_frac,seg.worldMinPosition(),seg.worldMaxPosition());}
     if(mFrac == 1) {
      m_tuSo.push(seg);
      seg.status = true;
      group.Add(seg);      }
     else if(mFrac == 2){
      m_mauSo.push(seg);
      seg.status = true;
      group.Add(seg);   }
     if(seg.set_id == seg_frac.set_id){ group.Add(seg_frac); } //seg.status = true;
   }
if(m_tuSo.length > 0 && m_mauSo.length >0){
   seg_frac.symbol = "Frac";
   Fracs.push(seg_frac);
   seg_frac.status = true;
   group.Sort();       
   group = Fractions.SetFrac(group);
   groups.push(group);   }
else notFrac.push(group);
} // end for k
var bGroup = false;
var tempGroup = new Array();
for(var k =0; k < notFrac.length;k++)   {
   var segs = notFrac[k].segments;
   for(var j = 0; j < segs.length; j++){ segs[j].status = false; } }

for (var i = 0; i < segments.length; i++){   
   if(segments[i].status == false ){
     tempGroup.push(segments[i]);
     bGroup = false;  }
   else {
     if(bGroup == false){
      tempGroup.push(segments[i]);
      bGroup = true;   }   } }
bGroup = true;   
for (var i = 0; i < tempGroup.length; i++) {   
   if(i ==0) group = new Group();
   if(tempGroup[i].status == false){           
    bGroup = false;      
    group.Add(tempGroup[i]);      }
   else if(!bGroup){
    if(group.segments.length > 0)      
     groups.push(group);
     group = new Group();   }
   if (i == tempGroup.length -1){
    if(tempGroup[i].status == false){
      if(group.segments.length > 0)      
       groups.push(group); } } }
groups = Fractions.SortGroup(groups);
return groups;
}
*/
//*****************************************************************************
/*
AutoGroup.isCheckSymbolN = function(in_segment){
   if(in_segment.symbol == "n_lower" || in_segment.symbol == "n" || in_segment.symbol == "N")
      return true;
   return false;
}

AutoGroup.isCheckSymbolC = function(in_segment){
   if(in_segment.symbol == "c_lower" || in_segment.symbol == "C_upper" ||
      in_segment.symbol == "C" || in_segment.symbol == "c")//C_upper
      return true;
   return false;
}

AutoGroup.isCheckSymbolT = function(in_segment){
   if(in_segment.symbol == "t")//C_upper
      return true;
   return false;
}

AutoGroup.isCheckSymbolO = function(in_segment){
   if(in_segment.symbol == "o_lower" || in_segment.symbol == "0" ||
      in_segment.symbol == "O" || in_segment.symbol == "o" || in_segment.symbol == "gamma"
      || in_segment.symbol == "beta" || in_segment.symbol == "6" || in_segment.symbol == "y_lower"
      || in_segment.symbol == "2")
      return true;
   return false;
}

AutoGroup.isCheckSymbol1 = function(in_segment){
   if(in_segment.symbol == "1" || in_segment.symbol == "_lparen")//_lparen
      return true;
   return false;
}

AutoGroup.isCheckSymbolrightParen = function(in_segment){
   if(in_segment.symbol == "_rparen" || in_segment.symbol == "j" || in_segment.symbol == "3"
      || in_segment.symbol == "right)" //sn-mic-150115: for mic rex
      || in_segment.symbol == "J" || in_segment.symbol == "right_bracket" || in_segment.symbol == "greater_than" )//_lparen right_bracket
      return true;
   return false;
}

AutoGroup.isCheckSymbolleftParen = function(in_segment){
   if( in_segment.symbol == "_lparen" || in_segment.symbol == "left_bracket" || in_segment.symbol == "3"
      || in_segment.symbol == "left(" //sn-mic-150115: for mic rex
      || in_segment.symbol == "a_lower")//_lparen left_bracket
      return true;
   return false;
}

AutoGroup.isCheckSymbolS = function(in_segment){
   if(in_segment.symbol == "s" || in_segment.symbol == "S" || in_segment.symbol == "5" || in_segment.symbol == "9"
      || in_segment.symbol == "3" || in_segment.symbol == "beta")//_lparen
      return true;
   return false;
}

//kiem tra symbol do la dau Dash
AutoGroup.isCheckSymbolDash = function(in_segment){
   if(in_segment.symbol == "_dash"
      || in_segment.symbol == "-"
      || in_segment.symbol == "frac")
      return true;
   return false;
}

AutoGroup.isCheckSymbolTimes = function(in_segment){
   if(in_segment.symbol == "times")
      return true;
   return false;
}

AutoGroup.isCheckSymbolGeq = function(in_segment){
   if(in_segment.symbol == "geq" || in_segment.symbol== "phi")//phi
      return true;
   return false;
}

AutoGroup.isCheckSymbolA = function(in_segment){
   if(in_segment.symbol == "a_lower")//phi
      return true;
   return false;
}

AutoGroup.isCheckSymbolL = function(in_segment){
   if(in_segment.symbol == "l" || in_segment.symbol == "L" || in_segment.symbol == "Sigma" )//phi
      return true;
   return false;
}

AutoGroup.isCheckSymbol4 = function(in_segment){
   if(in_segment.symbol == "4" || in_segment.symbol == "c_lower" || in_segment.symbol == "lt"
      || in_segment.symbol == "2" || in_segment.symbol == "sum"
      || in_segment.symbol == "1")//phi
      return true;
   return false;
}

AutoGroup.isCheckSymbol7 = function(in_segment){
   if(in_segment.symbol == "7")//phi
      return true;
   return false;
}

AutoGroup.isCheckSymbol5 = function(in_segment){
   if(in_segment.symbol == "5")//phi
      return true;
   return false;
}

AutoGroup.isCheckSymbolPlus = function(in_segment){
   if(in_segment.symbol == "_plus" || in_segment.symbol == "7" || in_segment.symbol == "F_upper")//F_upper
      return true;
   return false;
}

AutoGroup.isCheckSymbolM = function(in_segment){
   if(in_segment.symbol == "m" || in_segment.symbol == "M")//F_upper
      return true;
   return false;
}

AutoGroup.isCheckSymbolG = function(in_segment){
   if(in_segment.symbol == "g" || in_segment.symbol == "G")//F_upper
      return true;
   return false;
}

AutoGroup.prototype.Equal = function(in_segment,segments){
   var count = 0;   
   this.initialize();//g
   if(this.index - 1 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   var dash1 = null;
   var dash2 = null;   
   if((AutoGroup.isCheckSymbolDash(seg1)  && AutoGroup.isCheckSymbolDash(in_segment))){
      count = 1;
      dash2 = in_segment;
      dash1 = seg1;
   }
   if(count == 1){
      if(dash1.worldMinPosition().x < dash2.worldMaxPosition().x &&
         dash1.worldMaxPosition().x > dash2.worldMinPosition().x){
         var kc1 = Vector2.Distance(dash1.worldMinPosition(),dash1.worldMaxPosition());
         var kc2 = Vector2.Distance(dash2.worldMinPosition(),dash2.worldMaxPosition());         
         var xmin = dash1.worldMinPosition().x > dash2.worldMinPosition().x ? dash1.worldMinPosition().x : dash2.worldMinPosition().x;
         var xmax = dash1.worldMaxPosition().x < dash2.worldMaxPosition().x ? dash1.worldMaxPosition().x : dash2.worldMaxPosition().x;
         var kc3 = Vector2.Distance(new Vector2(xmin,0),new Vector2(xmax,0));
         var ymin = dash1.worldMinPosition().y > dash2.worldMinPosition().y ? dash1.worldMinPosition().y : dash2.worldMinPosition().y;
         var ymax = dash1.worldMaxPosition().y < dash2.worldMaxPosition().y ? dash1.worldMaxPosition().y : dash2.worldMaxPosition().y;
         var kc4 = Vector2.Distance(new Vector2(0,ymin),new Vector2(0,ymax));         
         var kc = kc1 < kc2 ? kc1 : kc2;
         var bBool = false;
         if(kc1 > kc2){
            if(kc2/kc1 > 2/3 && kc3/kc1 > 2/3)
               bBool = true;
         }
         else{
            if(kc1/kc2 > 2/3 && kc3/kc2 > 2/3)
               bBool = true;
         }
         if(bBool && kc4/kc < 2/3){
            this.Add(in_segment);
            this.Add(seg1);
            this.AddSymbol("_equal");
         }
         return true; 
      }
   }
   return false;
}

AutoGroup.prototype.Plus = function(in_segment,segments){
   var count = 0;   
   this.initialize();
   if(this.index - 1 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   var dash = null;
   var one = null;
   if(AutoGroup.isCheckSymbolDash(seg1)){
      count = 1;
      one = in_segment;
      dash = seg1;
   }
   else if(AutoGroup.isCheckSymbolDash(in_segment)){
      count = 1;
      one = seg1;
      dash =  in_segment;
   }
   if(count == 1){
      if(one.worldMinPosition().x > dash.worldMinPosition().x && one.worldMaxPosition().x < dash.worldMaxPosition().x
         && one.worldMinPosition().y < dash.worldMinPosition().y && one.worldMaxPosition().y > dash.worldMaxPosition().y){
         this.Add(in_segment);
         this.Add(seg1);
         this.AddSymbol("_plus");
         return true;
      }      
   }
   return false;
}

AutoGroup.prototype.Sin = function(in_segment,segments){   
   this.initialize();
   if(this.index - 2 < 0)
      return false;   
   var k = this.index;
   var j = this.index - 1;
   var i = this.index - 2;
   var seg1 = segments[j];
   var seg2 = segments[i];
   if(AutoGroup.isCheckSymbolN(in_segment) && AutoGroup.isCheckSymbolS(seg2)){      
      this.Add(seg2);
      this.Add(seg1);
      this.Add(in_segment);
      this.AddSymbol("sin");
      return true;
   }
   else if(this.index -3 >= 0){
      var t = this.index - 3;
      var seg3 = segments[t];
      if(AutoGroup.isCheckSymbolN(in_segment) && seg1.symbol == "i" && seg2.symbol == "i"
         && AutoGroup.isCheckSymbolS(seg3)){
         this.Add(seg3);
         this.Add(seg2);
         this.Add(seg1);
         this.Add(in_segment);
         this.AddSymbol("sin");
         return true;
      }
   }
   return false;
}

AutoGroup.prototype.Cos = function(in_segment,segments){   
   this.initialize();
   if(this.index - 2 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var i = this.index - 2;
   var seg1 = segments[j];
   var seg2 = segments[i];
   if(seg1.flag || in_segment.flag)
      return false;
   if(AutoGroup.isCheckSymbolO(seg1) && AutoGroup.isCheckSymbolC(seg2)
      && AutoGroup.isCheckSymbolS(in_segment)){
      this.Add(seg2);
      this.Add(seg1);
      this.Add(in_segment);
      this.AddSymbol("cos");
      return true;
   }
   else if(AutoGroup.isCheckSymbolO(seg1) && AutoGroup.isCheckSymbolC(seg2)
      && AutoGroup.isCheckSymbol5(in_segment)){
      this.Add(seg2);
      this.Add(seg1);
      this.Add(in_segment);
      this.AddSymbol("cos");
      return true;
   }
   return false;
}

AutoGroup.prototype.Lim = function(in_segment,segments){   
   this.initialize();
   if(this.index - 2 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var i = this.index - 2;
   var seg1 = segments[j];
   var seg2 = segments[i];
   if(AutoGroup.isCheckSymbolL(seg2) && AutoGroup.isCheckSymbolM(in_segment)){
      this.Add(seg2);
      this.Add(seg1);
      this.Add(in_segment);
      this.AddSymbol("lim");
      return true;
   }
   return false;
}

AutoGroup.prototype.Log = function(in_segment,segments){   
   this.initialize();
   if(this.index - 2 < 0 )
      return false;
   var k = this.index;
   var j = this.index - 1;
   var i = this.index - 2;
   var seg1 = segments[j];
   var seg2 = segments[i];
   if(seg1.flag || in_segment.flag)
      return false;
   if(AutoGroup.isCheckSymbolL(seg2) && AutoGroup.isCheckSymbolG(in_segment) && AutoGroup.isCheckSymbolO(seg1)){
      this.Add(seg2);
      this.Add(seg1);
      this.Add(in_segment);
      this.AddSymbol("log");
      return true;
   }
   return false;
}

AutoGroup.prototype.X = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0)
      return false;   
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   if(seg1.flag || in_segment.flag)
      return false;
   if(AutoGroup.isCheckSymbolrightParen(seg1) && (AutoGroup.isCheckSymbolC(in_segment) || AutoGroup.isCheckSymbolleftParen(in_segment))){
      if(seg1.worldMaxPosition().x < in_segment.worldMaxPosition().x){
         var x = in_segment.worldMinPosition().x - seg1.worldMaxPosition().x;
         if(x <=5 && in_segment.worldMinPosition().x > seg1.worldMinPosition().x){
            if((seg1.worldMinPosition().y < (in_segment.worldMinPosition().y + in_segment.worldMaxPosition().y)/2)
               && (in_segment.worldMinPosition().y < (seg1.worldMinPosition().y + seg1.worldMaxPosition().y)/2)){
               this.Add(seg1);
               this.Add(in_segment);
               this.AddSymbol("x_lower");
               return true;
            }
         }
      }
   }
   return false;
}

AutoGroup.prototype.Times = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   var times = null;
   var geq = null;
   if(AutoGroup.isCheckSymbolTimes(in_segment)){
      times = in_segment;
      geq = seg1;
   }
   else
   if(AutoGroup.isCheckSymbolTimes(seg1)){
      times = seg1;
      geq = in_segment;
   }
   if(times !=null && geq !=null){      
      if(times.worldMinPosition().y < geq.worldMaxPosition().y && geq.worldMinPosition().y < times.worldMaxPosition().y){
         this.Add(times);
         this.Add(geq);
         this.AddSymbol("x");
         return true;
      }
   }
   return false;
}

AutoGroup.prototype.NumberFour = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];   
   if(seg1.flag || in_segment.flag)
      return false;
   var l = null;
   var dash = null;
   
   if(AutoGroup.isCheckSymbolL(seg1) || AutoGroup.isCheckSymbol4(seg1)){
      l = seg1;
      dash = in_segment;
   }
   if(l == null || dash == null)
      return false;
   if(dash.worldMaxPosition().y > l.worldMinPosition().y && dash.worldMinPosition().y < l.worldMaxPosition().y
         && dash.worldMinPosition().x > l.worldMinPosition().x
         && l.worldMaxPosition().x >= dash.worldMinPosition().x)
   {
      this.Add(in_segment);
      this.Add(seg1);
      this.AddSymbol("4");
      return true;
   }
   return false;
}

AutoGroup.prototype.NumberFive = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0 || in_segment.status)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   if(seg1.flag || in_segment.flag)
      return false;
   var five = null;
   var dash = null;
   if(AutoGroup.isCheckSymbol5(seg1) && in_segment.symbol != "Frac"){
      five = seg1;//so 5
      dash = in_segment; // dau -
   }
   else
      if( AutoGroup.isCheckSymbol5(in_segment) && seg1.symbol != "Frac"){
         five = in_segment;//so 5
         dash = seg1; // dau -
      }
   if(five == null || dash ==null)
      return false;
   if(dash.worldMaxPosition().y > (five.worldMinPosition().y - five.size.y /6) && dash.worldMaxPosition().y < (five.worldMinPosition().y + five.worldMaxPosition().y)/3
         && dash.worldMaxPosition().x < five.worldMaxPosition().x + five.size/4 && (dash.worldMinPosition().x + dash.size.x/4) >= five.worldMinPosition().x){
      this.Add(in_segment);
      this.Add(seg1);
      this.AddSymbol("5");
      return true;
   }
   return false;
}

AutoGroup.prototype.NumberSeven = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0 || in_segment.status)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   var seven = null;
   var dash = null;
   if(seg1.flag || in_segment.flag)
      return false;
   if((AutoGroup.isCheckSymbol7(seg1))){ // && AutoGroup.isCheckSymbolDash(in_segment)
      seven = seg1;//so 5
      dash = in_segment; // dau -
   }
   if((AutoGroup.isCheckSymbol7(in_segment))){// && AutoGroup.isCheckSymbolDash(seg1) 
      seven = in_segment;//so 7
      dash = seg1; // dau -
   }
   if(seven == null || dash == null)
      return false;
   if(dash.worldMinPosition().y > seven.worldMinPosition().y &&
      dash.worldMaxPosition().y < seven.worldMaxPosition().y 
         && dash.worldMinPosition().x < seven.worldMaxPosition().x && (dash.worldMaxPosition().x + dash.size.x/4)> seven.worldMaxPosition().x){
      this.Add(in_segment);
      this.Add(seg1);
      this.AddSymbol("7");
      return true;
   }
   return false;
}

AutoGroup.isCheckSymbolI = function(in_segment){
   if(in_segment.symbol == "c_lower" || in_segment.symbol == "_lparen"
      || in_segment.symbol == "b_lower" || in_segment.symbol == "3" || in_segment.symbol == "_rparen"
      || in_segment.symbol == "2" || in_segment.symbol == "1" || in_segment.symbol == "8"
      || in_segment.symbol == "lim" || in_segment.symbol == "k_lower"
      || in_segment.symbol == "6" || in_segment.symbol == "y_lower" || in_segment.symbol == "b"){//_rparen
      return true;
   }
   return false;
}

AutoGroup.prototype.I = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   if(seg1.flag || in_segment.flag)
      return false;
   var iseg = null;
   var dash = null;
   var bBool = false;
   if(AutoGroup.isCheckSymbolI(in_segment) && seg1.symbol == "dots"){      
      dash  = seg1;//so 5
      iseg = in_segment; // dau -
      bBool = true;
   }
   else if((AutoGroup.isCheckSymbolI(seg1)) && in_segment.symbol == "dots"){
      iseg  = seg1;
      dash = in_segment;
      bBool = true;
   }   
   if(!bBool){
      
      return false;
   }   
   if(iseg.worldMinPosition().y >= dash.worldMaxPosition().y){
      var points = iseg.savePoints;
      var l = points.length - 1;
      var xBegin = points[0].x;
      var xEnd = 0;// points[0].x;
      if(l >= 0){
         xEnd = points[l].x;
      }
      if(xEnd > xBegin)
      {         
         if(Math.abs(xBegin - dash.worldMinPosition().x) > 10 ||
            (iseg.worldMinPosition().y - dash.worldMaxPosition().y) > 15){
            return false;
         }         
         this.Add(seg1);
         this.Add(in_segment);
         this.AddSymbol("i");
         return true;
      }
   }
   return false;
}

AutoGroup.prototype.J = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   var iseg = null;
   var dash = null;
   var bBool = false;
   if(seg1.flag || in_segment.flag)
      return false;
   if((AutoGroup.isCheckSymbolI(seg1))  && in_segment.symbol == "dots"){
      iseg  = seg1;
      dash = in_segment;
      bBool = true;
   }   
   else if((AutoGroup.isCheckSymbolI(in_segment)) && seg1.symbol == "dots"){ // && AutoGroup.isCheckSymbolDash(in_segment)
      dash  = seg1;//so 5
      iseg = in_segment; // dau -
      bBool = true;
   }
   if(!bBool || dash.savePoints.length > 15)
      return false;   
   if(iseg.worldMinPosition().y >= (dash.worldMaxPosition().y - dash.size.y) &&
      iseg.worldMinPosition().x < dash.worldMaxPosition().x){
      var points = iseg.savePoints;
      var l = points.length - 1;
      var xBegin = points[0].x;
      var xEnd = 0;// points[0].x;
      
      if(l >= 0){
         xEnd = points[l].x;
      }      
      if(xEnd <= xBegin)
      {
         if(Math.abs(xBegin - dash.worldMinPosition().x) > 10 ||
            (iseg.worldMinPosition().y - dash.worldMaxPosition().y) > 15){
            return false;
         }         
         this.Add(seg1);
         this.Add(in_segment);
         this.AddSymbol("j");
         return true;
      }
   }
   return false;
}

AutoGroup.prototype.F = function(in_segment,segments){
   this.initialize();
   if(this.index - 1 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var seg1 = segments[j];
   if(seg1.flag || in_segment.flag)
      return false;
   var l = null;
   var dash = null;
   if((AutoGroup.isCheckSymbolL(in_segment) || AutoGroup.isCheckSymbolleftParen(in_segment))
      && AutoGroup.isCheckSymbolDash(seg1)){
      l = in_segment;
      dash = seg1;
   }
   else if((AutoGroup.isCheckSymbolL(seg1) || AutoGroup.isCheckSymbolleftParen(seg1))
      && AutoGroup.isCheckSymbolDash(in_segment)){
      l = seg1;
      dash = in_segment;
   }
   
   if(l != null && dash != null){
      if(dash.worldMinPosition().y < l.worldMaxPosition().y &&
         dash.worldMaxPosition().y < l.worldMaxPosition().y
         && dash.worldMinPosition().x < l.worldMinPosition().x  &&
         l.worldMinPosition().x <= dash.worldMaxPosition().x && dash.worldMinPosition().y > l.worldMinPosition().y){
         this.Add(in_segment);
         this.Add(seg1);
         var points = in_segment.savePoints;
         var miny = in_segment.worldMinPosition().y;
         var maxy = in_segment.worldMaxPosition().y;
         var s_bol = "f";
         var p1 = Gestures.Point(miny,points);
         var p2 = Gestures.Point(maxy,points);
         if(p1.x < p2.x){
            s_bol = "t";
         }
         this.AddSymbol(s_bol);
         return true;
      }
   }
   return false;
}

AutoGroup.prototype.Pm = function(in_segment,segments){
   this.initialize();
   if(this.index - 2 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var i = this.index - 2;
   var seg1 = segments[j];
   var seg2 = segments[i];
   var plus1 = null;
   var plus2 = null;
   var dash = null;
   var bBool = false;   
   if(seg1.symbol == "_plus" && seg2.symbol == "_dash" && in_segment.symbol == "_plus")
   {
      bBool = true;
      plus2 = seg1;
      plus1 = in_segment;
      dash = seg2;
   }
   else if(seg1.symbol == "_dash" && seg2.symbol == "_plus" && in_segment.symbol == "_plus"){
      bBool = true;
      plus2 = seg2;
      plus1 = in_segment;
      dash = seg1;
   }
   if(bBool){
      if(plus1.worldMinPosition().x > dash.worldMinPosition().x  && plus1.worldMaxPosition().x < dash.worldMaxPosition().x
         && (plus1.worldMaxPosition().y < dash.worldMinPosition().y)){
         bBool = false;
         if(plus1.worldMaxPosition().y > plus2.worldMaxPosition().y){
            if((plus1.worldMaxPosition().y + plus1.size.y/2)> dash.worldMaxPosition().y){
               bBool = true;
            }
         }
         else{
            if((plus2.worldMaxPosition().y + plus2.size.y/2)> dash.worldMaxPosition().y){
               bBool = true;
            }
         }
         if(bBool){
            this.Add(seg2);
            this.Add(seg1);
            this.Add(in_segment);
            this.AddSymbol("pm");
         }
         return true;
      }
   }
   return false;
}

AutoGroup.prototype.tan = function(in_segment,segments){   
   this.initialize();
   if(this.index - 3 < 0)
      return false;
   var k = this.index;
   var j = this.index - 1;
   var i = this.index - 2;
   var n = this.index - 3;
   var seg1 = segments[j];//chu a
   var seg2 = segments[i];//dau cong
   var seg3 = segments[n]; // dau cong
   var bBool = false;   
   if(AutoGroup.isCheckSymbolA(seg1)  && AutoGroup.isCheckSymbolN(in_segment)){
      if((AutoGroup.isCheckSymbolPlus(seg2) && AutoGroup.isCheckSymbolPlus(seg3)) ||
         (AutoGroup.isCheckSymbolT(seg2) && AutoGroup.isCheckSymbolT(seg3))){//AutoGroup.isCheckSymbolT
         bBool = true;         
      }
      else{
         var dash = null;
         var one = null;
         var count = 0;
         if(AutoGroup.isCheckSymbolDash(seg2)){
            count = 1;
            one = seg3;
            dash = seg2;
         }
         else if(AutoGroup.isCheckSymbolDash(seg3)){
            count = 1;
            one = seg3;
            dash = seg2;
         }
         if(count == 1){            
            if(one.worldMinPosition().x > dash.worldMinPosition().x && one.worldMinPosition().x <= dash.worldMaxPosition().x
            && one.worldMinPosition().y < dash.worldMinPosition().y && one.worldMaxPosition().y > dash.worldMaxPosition().y){
               bBool = true;               
            }
         }
      }
      
      if(bBool){
         this.Add(seg3);
         this.Add(seg2);
         this.Add(seg1);
         this.Add(in_segment);
         this.AddSymbol("tan");
         return true; 
      }
   }   
   return false;
}

AutoGroup.prototype.SetSin = function(segments){   
   segments = Gestures.SortSetId(segments);
   var dots = new Array();
   for(var k =0;k < segments.length;k++){
      var seg = segments[k];
      if(seg.symbol == "dots"){
         dots.push(seg);
      }
   }
   var i = 0,j = 0;
   while(i< segments.length){
      var seg = segments[i];
      if(seg.symbol == "sin"){
         j = i + 1;
         var group = new Group();
         group.Add(seg);
         while(j < segments.length && segments[j].set_id == seg.set_id){
            group.Add(segments[j]);
            j++;
         }
         for(var k = 0; k < dots.length;k++){
            var segDots = dots[k];
            if(segDots.worldMinPosition().x > group.minGroup() && segDots.worldMaxPosition().x < group.maxGroup()){
               group.Add(segDots);
               this.initialize();
               for(var n = 0;n < group.segments.length; n++){
                  this.Add(group.segments[n]);
               }
               this.AddSymbol("sin");
               Formula.Copy(this.segments,this.symbols,this.cer,true);
            }
         }
         i = j;
      }
      else
         i++;
   }
}
*/
