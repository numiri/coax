/*******************************************************************************
*                            History.js 
********************************************************************************
*
* this file handles the user's steps during an exercise.  it should really be 
* renamed as "Steps.js"
********************************************************************************

**********
vocabulary
**********

1. exterior step - the last step in the History chain
2. interior step - steps preceding the final step
3. NED - near-end delete & append.  for N steps, near-end is N-1
4. NEDA - NED & submit.  NED puts cursor at final step.  
   edit on canvas & submit will append new step
   with auto-append, append is automatic

*************
key variables
*************

1.  cursor - the step the user is currently on
2.  index  - numbers the cursor
3.  list_segments, current_list - store strokes
4.  HS.recorrectD:  
    this used to be called "checkauto".  a better name for it would be 
    interior_delete_recorrect since it's only triggered on DeleteStep(), but we 
    we like short names.  When user deletes an interior step, a step not at the 
    end of History, this variable is set to true, which triggers the 
    mod-current-step portion of HS.TableList() and forces a Maxima recheck of 
    the step after cursor
5.  HS.recorrectM:
    was countalign - tracks the number of times we go through ActionsReAlign(),
    which is where we check for correctness of steps N vs N+1.
    remember that correctness of N vs N-1 is always checked.
    0 - enter main if-else logic of TableList
    1 - avoid  "     "       "          "
6.  mod_history
    renamed to am_correction (or namedUserANDisConnected), as in connected to 
    ActiveMath or Freeciv as of 13-07-08, it's always false & all the code 
    conditioned upon it are skipped according to Formula.js, it's false when 
    user=anonymous or mode=standalone, equivalently, FALSE when 
    namedUserANDisConnected
7.  check_step
    based on align(){..setLight..}, I think this holds the correctness result 
    from ActiveMath checks
8.  check_delete

***************
data structures
***************

in an exercise, to hold everything, we need a 4-dimensional array[i][j][k][l]
i:  a step, also a syq because a step contains all equations of a system.
j:  an equation w/n a step
k:  a stroke w/n an equation
l:  a single (x,y) point of a stroke

strokes:  
strokes are stored 4 times -- needs improvement.
1. HS.list_segments[steps].segments[strokes].  does not separate equations w/n a syq
   HS.ls = array of "HistorySegments"
3. single step data structures:
   HS.current_seg[stroke].points[] = array of points, w/o equation separation.
   ie. it lumps all strokes of a syq into a single array.
   AddList( list_seg ) holds the a single history step
3. SysEquations.Expressions        = array of points for the current step
   SysEquations.Expressions[i]     = array of points for the i-th equation of a syq
   SysEquations.Expressions[i][j]  = points for the j-th stroke of the i-th step
   SysEquations.Expressions[i][j].points[k] = 1 (x,y) coordinate of the k-th point of the j-th stroke of the i-th step.  
   SysEquations.Expressions[i][j].polyline.outerHTML = string of all points for the j-th stroke
   this is different from HS.current_seg in that it separated the equations in a syq.
3. HS.current_list.childNodes[steps].innerHTML & outerHTML 
   contains all steps for the current exercise.
   (inner & outer html contains all strokes for a step.  
   this is a double redundancy)
3. Editor.segments[] = like HS.current_seg[], it's an array of strokes of a single step, 
   w/o separating each line of a syq
4. the dom

5. Exercises = holds the recognized phrases for each step (no strokes)
   there are Exercises within exercises :-(
   Exercises . PhraseFormats[ Exercises ] 
                         [ Exercises =  arr_latex + arr_url ] =
       "     .     "     [ array of arr_latex[] + arr_url[] ] =
   Exercises . PhraseFormats[0].arr_latex[]  = syq for 1st step
             .                 .arr_url  []
       "     .     "        [1].arr_latex[]  = syq for 2nd step
             .                 .arr_url  []

But these structures do not hold visibility info. (Permanent stroke bug)
HS.CreateNode():  
   div_group=g.childNodes[0].style.visibility = ""
   div_svg=svg.childNodes[0].style.visibility = ""

*************
key functions
*************

TableList():  directs the logic whether to add a step, or edit an existing one
              probably the most important function here.
DeleteStep(): a key action here is to initiate a recorrect with Maxima
UpdateList():
CreateSvg():

**********
call stack:  action = Submit
**********

submit mod step & recorrect
EE.align -> H.TableList -> ... -> wrapRealign -> ActionsRealign
 ^   ^                                             |
 |  |                                             |
 |  +---------------------------------------------+
 |
DeleteStep()


DeleteStep() -> EE.align -> ... (same as above)
   user clicks "x" to delete a step (with & without selecting that step first)
   call stack begins with DeleteNode() because that was "x"'s event listener

on Submit (new vs mod step):
1. EE.align()        -> ajax steps.jsp -> MA.java.Execute 
   -> MA.BuildAlignResponse{ Utils.Combine(this.getPathdata() ...) }
   <AR result="1" error="">
      <exerciseStep message="null"  istrue="false" isfinish="false"/>
   <SL guid="..." TexString="$..$" variable="x"> ...img... </SL></AR>
2. EE:align()        -> ajax "success" -> HS.TableList( arr_latex, image_nodes, ...)
3. H.js::TableList() -> $("#recExpr").appendChild( Exercises
   .                    getImages(url=image_nodes))
4. H.js::getImages() -> tagImage.setAttribute("src", image_nodes[i].textContent)
(MA = MultiAlign.java)

on clicking a step in the history list
1. ActionHistory() ->

new flow:
on submit at newest step, create blank step & set index there
no change: on submit at interior, no change.
on NED, skip recorrect because final step is now blank
*******************************************************************************/

/*****************************************************************************/
HistorySegments = function(in_segments, flag, nameSegment, skipVals) {
/*****************************************************************************/
    this.segments = new Array();
    this.backup_scale = new Array();
    this.backup_translation = new Array();
    this.points_his = new Array();
    this.list_points = new Array();
    this.scalezoom = new Array();
    this.new_scale = new Array();
    this.new_translation = new Array();
    this.previous_set = new Array();

    for (var k = 0; k < in_segments.length; k++) {
        var segment = in_segments[k];
        this.segments.push(segment);
        this.backup_scale.push(segment.scale.clone());
        this.backup_translation.push(segment.translation.clone());
        this.previous_set.push(segment.set_id);    }

    this.frames = 0.0;
    this.start_time = 0;
    this.undoing = true;
    this.should_keep = false;
    this.status = flag;
    this.nameSegment = nameSegment;
    this.id = -1;
    this.permision_edit = true;
    
    this.skipValues = (skipVals) ? skipVals : "";
}

/******************************************************************************
* 
******************************************************************************/
HistorySegments.prototype = {

    Flag: function() { return this.status; },

    //<<<<<get points
    HisPoints: function() {
        var temp_points = new Array();
        for (var i = 0; i < this.segments.length; i++) {
            var seg = this.segments[i];
            var points = seg.points;
            for (var k = 0; k < points.length; k++) {
                var x = points[k].x;
                var y = points[k].y;
                var characters;
                if (k == 0) characters = "M";
                else        characters = "L";
                var newpoint = new Vector2(x, y);
                var str = characters + newpoint.toString();
                temp_points.push(points[k]);            }
            var sb = new StringBuilder();
            for (var l = 0; l < temp_points.length; l++) 
                sb.append(temp_points[l] + " ");
            var temp_points = new Array();
            this.points_his.push(sb);
            this.list_points.push(this.points_his);
            this.points_his = new Array();

            var sb = new StringBuilder();
            sb.append("translate(");
            sb.append(seg.translation.x * 0.2 + "," + seg.translation.y * 0.2);
            sb.append(") scale(");
            sb.append(seg.scale.x * 0.2 + "," + seg.scale.y * 0.2);
            sb.append(")");
            this.scalezoom.push(sb.toString());        }    },

    //<<<<< save positions for each history
    add_new_transforms: function(in_segments) {
//        if (in_segments.length != this.segments.length) segment.render(); //g segment is undefined
        this.should_keep = true; 
        if(Editor.current_action instanceof HistorySegments
        && Editor.current_action.toString() == "TransformSegments")
           Editor.add_action(Editor.current_action); 
        for (var k = 0; k < in_segments.length; k++) {
            var segment = in_segments[k];
            this.new_scale.push(segment.scale.clone());
            this.new_translation.push(segment.translation.clone());  }   },

    //<<<<< restore positions of history selected
    rescale: function(elapsed, utc_ms) {
        var current_time = (new Date()).getTime();
        var delta = (current_time - utc_ms) / 1000.0;
        if (elapsed == 0.0) HistorySegments.current = this;
        var fraction = elapsed / HistorySegments.animation_length;
        if (fraction > 1.0) fraction = 1.0;
        if (this.undoing) {
            for (var j = 0; j < this.segments.length; j++) {
                var segment = this.segments[j];
                segment.scale.Set(Vector2.Add(this.new_scale[j]
                , Vector2.Multiply(fraction, Vector2.Subtract(this.backup_scale[j]
                , this.new_scale[j]))));
                segment.translation.Set(Vector2.Add(this.new_translation[j]
                , Vector2.Multiply(fraction,Vector2.Subtract(this.backup_translation[j]
                , this.new_translation[j]))));
                segment.update_extents();
                segment.render();
                var node = document.getElementById(String(segment.set_id));
                Gestures.doCircle(node, segment, segment.set_id);
                Gestures.updateSplit(segment, 
                		Editor.FindIndexSplitSegment(segment.set_id));
            }
        } else {
            for (var j = 0; j < this.segments.length; j++) {
                var segment = this.segments[j];
                segment.scale.Set(Vector2.Add(this.backup_scale[j]
                , Vector2.Multiply(fraction, Vector2.Subtract(this.new_scale[j]
                , this.backup_scale[j]))));
                segment.translation.Set(Vector2.Add(this.backup_translation[j]
                , Vector2.Multiply(fraction, Vector2.Subtract(this.new_translation[j]
                , this.backup_translation[j]))));
                segment.update_extents();
                segment.render();
                var node = document.getElementById(String(segment.set_id));
                Gestures.doCircle(node, segment, segment.set_id);
                Gestures.updateSplit(segment
                		, Editor.FindIndexSplitSegment(segment.set_id));
            }
        }
        // set dirty flag
        for (var j = 0; j < this.segments.length; j++) {
            this.segments[j].dirty_flag = true;
        }
        Editor.update_selected_bb();
        RenderManager.render();
        this.frames++;
        if (fraction == 1.0) {
            // bail out
            var total_time = ((current_time - this.start_time) / 1000.0);
            HistorySegments.status = false;
            return;
        }
        var total_delta = ((new Date()).getTime() - utc_ms) / 1000.0;
        if (this.nameSegment == Editor.TransformSegments) {
            var sb = new StringBuilder();
            sb.append("HistorySegments.current.rescale(")
              .append(String(elapsed + total_delta)).append(',')
              .append((new Date()).getTime()).append(");");
            setTimeout(sb.toString());
        } else {
            var w = Editor.canvases[0].width;
            Editor.canvases[0].width = 1;
            Editor.canvases[0].width = w;
            SysEquations.SaveExpressions();
        }
    },

    //<<<<< show infor of history selected
    ShowElement: function() {
        for (var k = 0; k < this.segments.length; k++) {
            var segment = this.segments[k];
            if (segment.element != null) {
                segment.element.style.visibility = "visible";
                Editor.add_segment(segment);
                segment.set_id = this.previous_set[k];          }       }
        RenderManager.render();    },

    UndoHistory: function() {
        this.framerate = 0.0;
        this.frames = 0.0;
        this.start_time = (new Date()).getTime();
        this.undoing = true;
        this.rescale(0.0, this.start_time);
        Gestures.restoreNode();
    },

    Undo: function() {
        console.log("undo " + this.nameSegment);
        this.framerate = 0.0;
        this.frames = 0.0;
        this.start_time = (new Date()).getTime();
        this.undoing = true;
        //this.UndoTransFence();
        this.rescale(0.0, this.start_time);

    },

    ResotreFlotom: function() {
        for (var k = 0; k < this.segments.length; k++) {
            var trans = Vector2.Subtract(this.backup_translation[k]
            , this.new_translation[k]);
            var scale = this.backup_scale[k];
            this.segments[k].scale.Set(scale);
            this.segments[k].translate(trans);
            this.segments[k].update_extents();
        }
        Editor.update_selected_bb();
        RenderManager.render();
    },

    shouldKeep: function()                                                    {
        return this.should_keep;                                              },

    Apply: function() {
        this.framerate = 0.0;
        this.frames = 0.0;
        this.start_time = (new Date()).getTime();
        this.undoing = false;
        this.rescale(0.0, this.start_time);
    },

    toXML: function() {
        var sb = new StringBuilder();
        sb.append("<Action type=\"transform_segments\">").appendLine();
        for (var k = 0; k < this.segments.length; k++) {
            var segment = this.segments[k];
            sb.append("\t").append("<Transform instanceID=\"")
              .append(String(segment.instance_id)).append("\" ");
            sb.append("scale=\"").append(this.new_scale[k].toString())
              .append("\" translation=\"")
              .append(this.new_translation[k].toString()).append("\"/>");
            sb.appendLine();        }
        sb.append("</Action>");
        return sb.toString();    },

    toString: function() { return this.nameSegment;    },
};

/******************************************************************************
* 
******************************************************************************/
HistorySegments.animation_length = 0.25;
HistorySegments.list_segments = new Array();
HistorySegments.StepTo = 0;
HistorySegments.list_step_wrong = new Array();
HistorySegments.current_seg = new Array();
HistorySegments.preLatex = null;
HistorySegments.status = false;
HistorySegments.index = -1;
HistorySegments.block = null; //x
HistorySegments.current;
HistorySegments.current_index = -1;
HistorySegments.currMaxima = null;
HistorySegments.sum_height = 0;
HistorySegments.active = false;
HistorySegments.height_node = 0;
HistorySegments.myScroll;
HistorySegments.select_active = false;
HistorySegments.background_avtive = "ghostWhite";
HistorySegments.recorrectD = false;
HistorySegments.recorrectM = 0;
HistorySegments.step = 0;
HistorySegments.count_child = 0;
HistorySegments.check_step = false;
HistorySegments.check_delete = false;
HistorySegments.in_id = -1;
HistorySegments.version = -1;
HistorySegments.set_action = false;
HistorySegments.is_finish = false;
HistorySegments.stringXml = new StringBuilder();

/******************************************************************************
* 
******************************************************************************/
HistorySegments.AddList = function(segment) {
    var list = new HistorySegments(segment);
    list.add_new_transforms(segment);
    HistorySegments.list_segments.push(list); }

/******************************************************************************
* replace the i-th step of HS.list_segments with new strokes from args
******************************************************************************/
HistorySegments.InsertNewStrokesIntoHSls = function(segment, index) {
    var list = new HistorySegments(segment);
    list.add_new_transforms(segment);
    list.historiesId = HistorySegments.list_segments[index].historiesId;//g : beautify document 
    this.list_segments.splice(index, 1, list); }

/******************************************************************************
* execute this function when user clicks a History step
******************************************************************************/
HistorySegments.ActionHistory = function(index) {
if (this.list_segments.length > 0) {
    delete this.current_seg;
    this.current_seg = new Array();
    this.current_seg = Editor.segments.clone();
    var action = new ActionSegments(this.ReplacementStrokes(), true
    		, Editor.DeleteSegments);
    action.Apply();
    if (this.status == true) Editor.add_action(action);
    Editor.clear_selected_segments();
    RenderManager.render();
    // Show history segments
    this.list_segments[index].ShowElement();
    this.list_segments[index].UndoHistory();
    var phrase_formats = Exercises.PhraseFormats[index];
    Editor.updateMathFont( phrase_formats.arr_latex ); // sn-mathjax-1305: new
    document.getElementById("tex_result").innerHTML = HistorySegments 
    .  getLatex( phrase_formats.arr_latex ); //x
    if (index >= 1 && index < this.list_segments.length - 1)                  {
        if (CopyPasteSegments.isCheck) 
             this.getMaxima(Exercises.PhraseFormats[index].arr_latex);
        else this.getMaxima(Exercises.PhraseFormats[index - 1].arr_latex);    }
    Editor.translateCenter(this.list_segments[index].segments); } }

/******************************************************************************
* 
******************************************************************************/
HistorySegments.getLatex = function(arr) {
    var text_latex = new StringBuilder();
    for (var i = 0; i < arr.length; i++) {
        text_latex.append("$");
        text_latex.append(arr[i]);
        text_latex.append("$");    }
    return text_latex.toString();  }

/******************************************************************************
* 
******************************************************************************/
HistorySegments.getMaxima = function(arr) {
    delete this.currMaxima;
    this.currMaxima = new Array();
    for (var i = 0; i < arr.length; i++) {
        var text_latex = new StringBuilder();
        text_latex.append("$");
        text_latex.append(arr[i]);
        text_latex.append("$");
        this.currMaxima.push(text_latex.toString());    }
    return this.currMaxima; }

/******************************************************************************
* HistorySegments.TableList = function(laxtex, msg, proc_skipped) 
*
* this.recorrectM = 0; Nothing
* this.recorrectM = 1; Need to call EE.align() again for validating the step 
*                      next to the one that's just modified
* this.recorrectM =-1; Done calling EE.align() for "recorrectM = 1"
*                       when it's -1, the index need to decrease by 1	
*                       
* when exercise is loaded, index = -1, and we fall into the new step case
* new step:       this.recorrectD == false 
*                 and (
*                     this.index == -1 
*                     or this.index >= this.list_segments.length - 1 )
*                 )
* mod step:       this.index is between (0,this.list_segments.length-1) 
*                 (when modifying an existing step)
*                 or this.recorrectD == true && this.recorrectM = 0 
*                 (after deleting an existing step which is not the last one)
*                 or this.recorrectD == true && this.recorrectM = 1
*                 (after modifying an existing step which is not the last one))
* --------
* usually I don't document to this detail but this code is so convoluted
* TableList: 
* -> overwriteStep:  
*       set HS flags: recorrectD = T, check_delete = T, step++ count_child=0
*       CreateSvg() inside itemhis#, 
*       InsertNewStrokesIntoHSls:  insert points in svg,
*       stylize itemhis#
*       wrapRealign:  
*          writePhraseToExercises: create Exercises inside Exercises from latex
*          inside swipeR, replace Exercises.NodeMaxima
*          ..., ActionsRealign: sets postfix correctness
* -> writeNewStep:
*       createSwipeR & append to <..history>
*       AddList( strokes )
*       set HS params:  step++, count_child, permission_edit=F, check_delete=F
*       wrapRealign, setStepStyle
*       check_delete = false
* 
******************************************************************************/
HistorySegments.TableList = function( latex, msg, proc_skipped) {
if (Editor.segments.length == 0) return;

if ( !this.recorrectD && 
	(this.index == -1 || this.index >= this.list_segments.length - 1 ))        {
	this.writeNewStep( latex, msg, proc_skipped);
	this.recorrectM = 0;
} else                                                                        {
   if(Editor.mod_history && !this.list_segments[this.index]
   .   permision_edit) return;
   this.overwriteStep( latex, msg, proc_skipped );
   
   //increase recorrectM when clicking on submit button for modifying a step
   //recorrectM doesnt change its value for the second validation after a step deleted or modified
   //recorrectM can be either 0 or 1 when recorrectD = true
   if(!this.recorrectD) this.recorrectM = 1;                                  } 
this.block.UndoHis();
this.status = true;

if(this.recorrectD)                                                           {
	this.recorrectD = false;
	if (this.recorrectM == 1) this.recorrectM = -1;
	else this.recorrectM = 0;                                                 } }
/***************************
* build HistorySegments.stringXml for an update
* this.recorrectD = false --> action=2: changes made to an existing step
* this.recorrectD = true ---> action=4: change made to result flag of a step 
*                            when checking the correctness of steps n vs. n+1 
****************************/
HistorySegments.overwriteStep = function( latex, msg, proc_skipped )          {
   if ( (Editor.am_correction && !this.list_segments[this.index].permision_edit)
		   || HistorySegments.index <1
		   || HistorySegments.list_segments.length < 2
		   )
      return;

   if(HistorySegments.list_segments[HistorySegments.index]
   .   historiesId == undefined)                                              {
	   alert("Unable to edit this step. Please reload the exercise!");
	   return;                                                                }

   this.sum_height -= this.current_list.childNodes[this.index].clientHeight;
   var svgparent = $("#itemhis" + this.index)[0];
   // Do not need to re-draw when doing rechecking correctness 
   // after a step deletion or modification
   if(!this.recorrectD)                                                        {   
      svgparent.removeChild(svgparent.firstChild);
      this.CreateSvg( this.index, svgparent );
      this.InsertNewStrokesIntoHSls( this.ReplacementStrokes(), this.index );
      this.sum_height += this.current_list.childNodes[this.index].clientHeight;
      svgparent.parentNode.style.height = this.height_node + "px";
      svgparent.nextSibling.style.marginTop = -this.height_node + (this.height_node-25)/2 + "px";}
   
   LogXML.GroupLog(SettingsMenu.user, Exercises.id_default, Exercises.id_select, 
         HistorySegments.list_segments[HistorySegments.index].historiesId, 
         -1, -1, (this.recorrectD)? 4: 2, this.getLatex(latex), "no url", proc_skipped);

   if (Editor.am_correction) this.overwriteStepAM( svgparent, msg );
   this.wrapRealign( false, latex, svgparent, proc_skipped );                 }
//*********
HistorySegments.overwriteStepAM = function( svgparent, msg ) {
//*********
    this.list_segments[this.index].list_step_wrong = false;
    Fractions.stopTimer();
    if (this.check_step)                                                      {
        this.step++;
        this.count_child = 0;
        svgparent.parentNode.firstChild.innerHTML = this.step + ". ";
        $("#note")[0].innerHTML = msg;
        svgparent.nextSibling.removeEventListener("click", this.DeleteStep
        ,  true);                                    
        svgparent.parentNode.style.marginLeft = "0px";
        this.check_delete = true;                                            }}

/***************************
* create History step:
* swipeR   = a single line of history.  class="swipeR", no ID
* itemhis    = itemhis#.  holds the svg for strokes.  made by HS.CreateSvg()
*              it contains many nodes, one node per stroke <g>
* linenumber = line numbering
***************************/
HistorySegments.writeNewStep = function( latex, msg, proc_skipped )           {
   var stub;
   if(latex.length == 0 || HistorySegments.index == -1) 
	    stub = this.createSwipeR(true);
   else stub = this.createSwipeR(false);

   var swipeR = stub.swipeR;
   $("#history")[0].appendChild(swipeR);
   this.preLatex = this.getLatex(latex);
   this.AddList(this.ReplacementStrokes());
   this.index = this.list_segments.length;
   LogXML.GroupLog(SettingsMenu.user, Exercises.id_default
   , Exercises.id_select, -1
   , HistorySegments.StepTo -1, HistorySegments.StepTo		
   , 1, this.preLatex, "no url", proc_skipped);

   if( Editor.am_correction) 
	   this.writeNewStepAM( swipeR, stub.linenumber, msg ); 
   
   this.wrapRealign( true, latex, swipeR, proc_skipped );
   this.setStepStyle(this.current_list.childNodes[this.current_list.childNodes.length-1]);
   
   this.check_delete = false;                                                 }
/*****************************************************************************
 * create a blank step by calling writeNewStep with an empty latex
 * then calling GexIndex to set the Selected style 
 ****************************************************************************/
HistorySegments.writeBlankStep = function()                                   {
	Editor.segments.splice(0, Editor.segments.length); 
	HistorySegments.writeNewStep("");
	HistorySegments.GetIndex(null);                                           }
/*****************************************************************************
 * assign strokes of the last step to the blank step
 ****************************************************************************/
HistorySegments.resetCanvasforBlankStep = function()                          {
	var index = HistorySegments.list_segments.length -2;
	HistorySegments.ActionHistory(index);	
	Editor.segments = HistorySegments.list_segments[index].segments.clone();  }
/*****************************************************************************
 * 
 ****************************************************************************/
HistorySegments.isBlankStep = function(index)                                 {
	if(index>-1 && index<Exercises.PhraseFormats.length
      && Exercises.PhraseFormats[index].arr_latex.length == 0)
		return true;
	return false;                                                             }
/***************************
 * 
 **************************/
HistorySegments.writeNewStepAM = function( swipeR, linenumber, msg ) {

   if (this.list_segments.length == 1) { this.step++; }
   else if (this.list_segments.length > 1)                            {
       Fractions.stopTimer();
       if (this.check_step)                                           {
           this.step++;
           this.count_child = 0;
           linenumber.innerHTML = this.step + ". ";
           $("#note")[0].innerHTML = msg;
           this.list_segments[this.index - 1].permision_edit = false;
           var temp_node = $("#itemhis" + (this.index - 1)[0]);
           temp_node.nextSibling.removeEventListener("click"
           ,    this.DeleteStep, true);                               }
       else                                                           {
           this.list_step_wrong.push(this.index - 1);
           this.count_child++;
           swipeR.style.marginLeft = "20px";
           linenumber.innerHTML = (this.step) + "." + this.count_child;
           $("#note")[0].innerHTML = msg;                            }}}

/**************************
 * set the selected step's color & font
 * this.current_list.childNodes.length = number of steps
**************************/
HistorySegments.setStepStyle = function (anchorNode)                          {
for (var i = 0; i < this.current_list.childNodes.length; i++)                 {
    var node = this.current_list.childNodes[i];
	if (node == anchorNode)                                                   {
	   node.style.background = this.background_avtive;
	   node.childNodes[0].style.color = "blue";
	   node.childNodes[0].style.fontSize = "16px";
       this.index = i;                                                        }
   else                                                                       {
	   node.style.background = "none";
	   node.childNodes[0].style.color = "white";
	   node.childNodes[0].style.fontSize = "12px";                            } } }
/**************************
* create & return the tags that displays a step:  swipeR, line number, 
* itemhis# (with strokes svg & g's).  it wraps the createSvg function to 
* append the strokes to itemhis#
**************************/
HistorySegments.createSwipeR = function(viewonly)                             {
   var itemhis = document.createElement( "div" );

   itemhis.setAttribute("id", "itemhis" + this.list_segments.length );
   itemhis.style.width = innerWidth * 40 / 100 + "px";
   itemhis.style.cursor = "pointer";
   itemhis.style.height = "100%";

   this.CreateSvg( this.list_segments.length, itemhis );
   var swipeR = document.createElement( "div" );
   swipeR.setAttribute( "class", "swipeR" );
   swipeR.style.height = this.height_node + "px";
   swipeR.addEventListener( "click", this.GetIndex, true );

   var linenumber = document.createElement( "div" );
   linenumber.style.width = 30 + "px";
   linenumber.style.position = "absolute";
   // add strokes to the history line
   var step_count = this.list_segments.length + 1;
   linenumber.innerHTML = step_count + ". ";
   linenumber.style.fontSize = 12 + "px";
   swipeR.appendChild( linenumber );
   swipeR.appendChild( itemhis    );
   if(!viewonly)
      swipeR.appendChild( this.CreateDeleteButton( this.height_node ) ); 
   return { swipeR:swipeR, linenumber:linenumber, itemhis:itemhis }; }

/***************************
*  call Maxima & set traffic light color for the new step
*a cannot use "this" as HistorySegments.  "this" has different scope 
*  inside function declaration.
***************************/
HistorySegments.wrapRealign = function(isNewStep,latex,node,proc_skipped){
var sNodeMaxima = document.createElement("div");
sNodeMaxima.setAttribute("class", "rformula"); 
sNodeMaxima.style.background = HistorySegments.check_step?"green":"red"; 
sNodeMaxima.style.marginRight = 40 + "px"; 
//
if(!proc_skipped) proc_skipped = "";
if(isNewStep) HistorySegments.list_segments[HistorySegments.list_segments.length-1].skipValues = proc_skipped;
else HistorySegments.list_segments[HistorySegments.index].skipValues = proc_skipped;   

if( Editor.ExerciseSkip.indexOf(Editor.SkipValues.Corx) != -1
 || proc_skipped.indexOf(Editor.SkipValues.Corx) != -1
 || proc_skipped.indexOf(Editor.SkipValues.Light) != -1)                     {
   sNodeMaxima.setAttribute( "real_corx_color", sNodeMaxima.style.background);
   sNodeMaxima.style.background = SkipCorxLight_background;
}
//cannot toggle corx light when exercise has skip_corx or step's proc_skipped has corx
if( Editor.ExerciseSkip.indexOf(Editor.SkipValues.Corx) == -1
 && proc_skipped.indexOf(Editor.SkipValues.Corx) == -1)                       {
sNodeMaxima.addEventListener( "click"
,  function() { HistorySegments.toggleCorxLight( sNodeMaxima ); } );          }
try{
   HistorySegments.writePhraseToExercises( true, latex, isNewStep);
   if(!isNewStep)                                                             {
	  node.parentNode.removeChild( node.parentNode.lastChild );
	  node.parentNode.appendChild(sNodeMaxima);
	  node.parentNode.lastChild.style.marginTop = (parseFloat(node
	  .nextSibling.style.marginTop.replace(/[^-\d\.]/g, ''))+ 5) + "px";      }
   else                                                                       {
      if(latex.length != 0 && HistorySegments.list_segments.length > 1) 
         node.appendChild(sNodeMaxima); 
      if(node.childNodes[3] != undefined)
         node.childNodes[3].style.marginTop = (-this.height_node
        		                       + (this.height_node - 15) / 2) + "px"; }
}catch(e){ console.log("HistorySegments.wrapRealign Error "+e.message);       }   }

/***************************
* intent: show & hide  corx light chameleon style.
* input:  colornode = traffic light element
***************************/
HistorySegments.toggleCorxLight = function( colornode )                       {
//double-check: cannot toggle corx light when exercise requests to skip corx process
if(Editor.ExerciseSkip.indexOf(Editor.SkipValues.Corx) != -1) return;                                  
var skipLight = false;    
var original_bgrColor = colornode.style.background;
if(   colornode.style.background == SkipCorxLight_background ) 
      colornode.style.background = colornode.getAttribute("real_corx_color");
else{ skipLight = true;
      colornode.setAttribute( "real_corx_color", colornode.style.background );
      colornode.style.background = SkipCorxLight_background;                  } 

var proc_skipped = HistorySegments.list_segments[HistorySegments.index].skipValues;
if(!proc_skipped) proc_skipped = "";

if( skipLight && proc_skipped.indexOf(Editor.SkipValues.Light) == -1)
   proc_skipped += Editor.SkipValues.Light;
else{
   var re = new RegExp(Editor.SkipValues.Light,"g");
   proc_skipped = proc_skipped.replace(re,'');
}

HistorySegments.list_segments[HistorySegments.index].skipValues = proc_skipped;   
var param = { 
     'action': 'updateSkipValues',
     'id'    : HistorySegments.list_segments[HistorySegments.index].historiesId,
     'proc'  : proc_skipped };

$.ajax({ type: "POST", dataType: "JSON", url: Editor.url_exercises
   ,  data: param
   ,  success:function(in_data)                                               {
      if(in_data != '1'){
         alert("Unable to toggle the light for now.");
         colornode.style.background = original_bgrColor;                     }}//success
   ,  error:  function(jqXHR, textStatus, errorThrown)                        {
      colornode.style.background = original_bgrColor;
      if(isAjaxSessionTimeOut(jqXHR)){ sleep(5000);return;}
      Editor.copeAjaxError( jqXHR, textStatus, errorThrown );                 }//error             
   });
}

/******************************************************************************
* append/overwrite latex to a new Exercises (was SetPositionImages)
*
* only called from wrapRealign()
*
* inputs:  
* urls & texs are arrays for a SINGLE step in a syq
* urls   = ARRAY of image data, as HTMLCollection[image]
* texs   = ARRAY of latex for the current current or newest step
* flag   = false when editing a previous step
*        = true on open exercise, submit, delete
* status = 
******************************************************************************/
HistorySegments.writePhraseToExercises = function( status, texs, flag)        { 
   var step = new Exercises( texs, status);
    if (!flag) Exercises.PhraseFormats.splice(HistorySegments.index, 1, step);
    else Exercises.PhraseFormats.push( step );                                }
/******************************************************************************
* 
******************************************************************************/
HistorySegments.CreateDeleteButton = function(top) {
    top = top - (top - 25) / 2;

    var div = document.createElement("div");
    div.setAttribute("class", "myapp-delete");
    div.setAttribute("visibility", "visible"); //x
    div.style.marginTop = -top + "px";
    div.style.cursor = "pointer";
    div.innerHTML = "x";
    if (Editor.using_mobile){
        div.addEventListener("touchstart", this.DeleteStep, true);
        if (this.list_segments.length == 0)
            div.removeEventListener("touchstart", this.DeleteStep, true);    }
    else {
        div.addEventListener("click", this.DeleteStep, true);
        if (this.list_segments.length == 0)
            div.removeEventListener("click", this.DeleteStep, true);    }    
    return div; }

/******************************************************************************
* 
******************************************************************************/
HistorySegments.delWrong = function(block){
    var count = 0;
    var sb = new StringBuilder();
    for (var i = 0; i < this.list_step_wrong.length; i++){
        if (this.list_step_wrong[i] != block){
            $("#itemhis" + this.list_step_wrong[i]).parent().remove();
            sb.append(this.list_segments[this.list_step_wrong[i] - count].id);
            if (i < this.list_step_wrong.length - 1)
                sb.append(";");
            this.list_segments.splice(this.list_step_wrong[i] - count, 1);
            Exercises.PhraseFormats.splice(this.list_step_wrong[i] - count, 1);
            count++;        }    }
    Exercises.from_step = this.index;
    this.in_id = String(sb);
    LogXML.GroupLog(SettingsMenu.user, Exercises.id_default, Exercises.id_select
    , this.in_id, Exercises.from_step, Exercises.to_step, 3, new Array(), "");
    var root = new StringBuilder();
    root.append("<root>");
    root.append(this.stringXml).append("<color>").append("").append("</color>");
    root.append("</root>");
    this.sendData(String(root), false);
    delete this.list_step_wrong;
    this.list_step_wrong = new Array(); }

/******************************************************************************
* pay special attention to "recorrectD".  when user deletes an interior step, 
* we need to recheck the next step for correctness (ignore the blank step).  
* Set recorrectD = true so we fall into the "mod of the next step" 
* portion of TableList().
* It will call EE.align() for a check to the result flag of the next step
* the "3" in the 2nd argument & xml string is redundant, but convenient.  
* 2nd argument is used in exercises.jsp to decide what action to take, 
* while xml "3" is sent to XmlDAO.java

// for example, in a 3 step list, we delete a step
// case interior delete: 
//           index = 1 < length = 2 (note this is the post-delete length)
//           cursor is still interior after delete,  
//           fall into if condition. 
//           set recorrectD to T and call EE.align for rechecking next step correctness
//
// case exterior exterior:
//           index = 2 < length = 2
//           cursor is       exterior after delete: 
//           leave recorrect alone. 
******************************************************************************/
HistorySegments.DeleteStep = function(e) {
Editor.ajaxLoader("visible");

// fix for ipad not calling GetIndex when clicking on delete icon
// on some browser:  suppose step 2 is selected, and we click Delete on step 4,
// browser may not trigger parent event to get index for step 4, and step 2 
// will be deleted.  we see this on ipad Safari, but may occur on other browsers.
// this also fixes bug #212.
var obj = e.target.parentElement;
for (var i = 0; i < HistorySegments.current_list.childNodes.length; i++)       {
   if (HistorySegments.current_list.childNodes[i] == obj)                      {
      HistorySegments.index = i; 
      break;                                                                 } }

var deleteXml = "<root>"
+  "<segments status=\"3\" userId=\"0\" exerId=\"0\" selectId=\"0\" "
+  "historyId = \"" + HistorySegments.list_segments[HistorySegments.index]
.  historiesId + "\" latex=\"$0$\" fromStep=\"0\" toStep=\"0\" "
+  "version=\"1\" > "
+  "<group symbol=\"0\"><points>|0,0,|0,0|></points></group> "
+  "<group symbol=\"0\"><points>|0,0,|0,0|></points></group> "
+  "</segments> <color>green</color> </root>";
HistorySegments.set_action = true;
HistorySegments.sendData( deleteXml, 3 );


var stridnode = e.currentTarget.previousSibling.id;
var index;
stridnode = stridnode.replace("itemhis", "");
HistorySegments.current_index = parseInt(stridnode);
HistorySegments.setStepStyle(HistorySegments.current_list
		                     .childNodes[HistorySegments.current_index]);

index = HistorySegments.current_index;
HistorySegments.sum_height -= HistorySegments.current_list
.  childNodes[HistorySegments.current_index].clientHeight;
$(this).parent().remove();

if (Editor.am_correction) this.DeleteStepAM(); 

HistorySegments.UpdateList();
HistorySegments.SetDefault();
if(HistorySegments.isBlankStep(HistorySegments.index))
 HistorySegments.resetCanvasforBlankStep();
else
 HistorySegments.ActionHistory(HistorySegments.index);

HistorySegments.select_active = true;

Editor.ajaxLoader("hidden");

if (index > 0 && index < HistorySegments.list_segments.length
  && !HistorySegments.isBlankStep(index) )                                     {
    HistorySegments.index = index;
    var phrase_formats = Exercises.PhraseFormats[index - 1];
    HistorySegments.getMaxima(phrase_formats.arr_latex);
    HistorySegments.check_delete = true;
    
    if (Editor.am_correction) return; 
    
    HistorySegments.recorrectD = true;    
    Editor.align();        
                                                                               }
}
/******************************************************************************
 * 
 ******************************************************************************/
HistorySegments.DeleteBlankStep = function(index) {
	if(HistorySegments.isBlankStep(index)){
		HistorySegments.list_segments.splice(index, 1);
		Exercises.PhraseFormats.splice(index, 1);
		$("#itemhis"+index).parent().remove();		
	}
}

/******************************************************************************
 * 
 ******************************************************************************/
HistorySegments.DeleteStepAM = function() {
   Exercises.from_step = HistorySegments.index;
   HistorySegments.in_id = HistorySegments.list_segments[index].id;
   LogXML.GroupLog(SettingsMenu.user, Exercises.id_default, Exercises.id_select
		   , HistorySegments.in_id, Exercises.from_step, Exercises.to_step, 3, new Array(), "");
   var root = new StringBuilder();
   root.append("<root>");
   root.append(HistorySegments.stringXml).append("<color>")
       .append("").append("</color>");
   root.append("</root>");
   if ( HistorySegments.list_segments[HistorySegments.list_segments.length - 1]
   .  permision_edit) 
       HistorySegments.sendData(String(root), false);
   var temp_index = HistorySegments.list_step_wrong.searchIndex(index);
   if (temp_index != -1){
       HistorySegments.count_child--;
       HistorySegments.list_step_wrong.splice( temp_index, HistorySegments
       .   list_step_wrong.length - temp_index);    } }

/******************************************************************************
* 
******************************************************************************/
HistorySegments.UpdateList = function() { 
var index = HistorySegments.current_index;
HistorySegments.in_id = HistorySegments.list_segments[index].id;
HistorySegments.list_segments.splice(index, 1);
Exercises.PhraseFormats.splice(index, 1);

var temp_count;

for (var i = index; i < HistorySegments.list_segments.length; i++) {
	HistorySegments.current_list.childNodes[i].childNodes[0].innerHTML = i + 1 + ". ";
	HistorySegments.current_list.childNodes[i].childNodes[1].setAttribute("id", "itemhis" 
    +   i);
    /* keep it here for Editor.am_correction 
    if (Editor.am_correction && this.list_segments[i].permision_edit){
        temp_count++;
        this.current_list.childNodes[i].childNodes[0].innerHTML = (this.step) 
    +   "." + temp_count;
        this.list_step_wrong.push(i);
        .  list_step_wrong[temp_count - 1]].id);
    }
    */
}
if (HistorySegments.index >= HistorySegments.list_segments.length 
		&& HistorySegments.list_segments.length > 0) {
	HistorySegments.index--;
	HistorySegments.current_index--;                                          }
if (HistorySegments.index == HistorySegments.current_index 
		&& HistorySegments.index <= HistorySegments.list_segments.length - 1) {
	HistorySegments.current_list.childNodes[HistorySegments.index]
	.style.background = HistorySegments.background_avtive;
    this.current_list.childNodes[this.index].childNodes[0].style.color = "blue";
    this.current_list.childNodes[this.index].childNodes[0].style.fontSize = "16px";
    HistorySegments.SetDefault();
    HistorySegments.ActionHistory(this.index);                                }

HistorySegments.current_index = -1;
if (HistorySegments.list_segments.length == 0)  Exercise.clearall();
if (Editor.segments.length == 0) 
	if(ExercisesMenu.select_exercise != undefined)
		ExercisesMenu.select_exercise.selectedIndex = 0;                      }

/*****************************************************************************/
HistorySegments.ObjSeg = function(seg)                                        { 
/*****************************************************************************/
    var tmax = 0, tmin = 0, lleft = 0;
    if(seg.length != 0)                                                       {
       tmin = seg[0].worldMinDrawPosition().y;
       tmax = seg[0].worldMaxDrawPosition().y;
       lleft = seg[0].translation.x;
       for (var i = 1; i < seg.length; i++)                                   {
          if (tmin > seg[i].worldMinDrawPosition().y) tmin = seg[i].worldMinDrawPosition().y;
          if (tmax < seg[i].worldMaxDrawPosition().y) tmax = seg[i].worldMaxDrawPosition().y;
          if (lleft > seg[i].translation.x) lleft = seg[i].translation.x;     }}
    this.left = lleft;
    this.top = tmin;
    this.height = tmax - tmin;                                                }

/******************************************************************************
* creates <svg> & appends it to itemhis
*
* idnode:  the index of the new node
* itemhis: id=itemhis#, also the parent node of the new <svg>

*a 
itemhis.setAttribute("id", "itemhis" + idnode);
itemhis.style.width = innerWidth * 40 / 100 + "px";
itemhis.style.cursor = "pointer";
itemhis.style.height = "100%";

*b 
var root_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
root_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
root_svg.setAttribute("style", "overflow: visible;");

******************************************************************************/
HistorySegments.CreateSvg = function(idnode, itemhis)                         {
var obj = new HistorySegments.ObjSeg(HistorySegments.ReplacementStrokes());
HistorySegments.height_node = obj.height * 0.2 + 10;
if (HistorySegments.height_node < 30) 
	HistorySegments.height_node = 30;

var tran_left = -((obj.left * 0.2) - 30);
var tran_top = -((obj.top * 0.2) - 5);
//a transplanted to createSwipeR 130627:

var div_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
div_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
div_svg.setAttribute("width", "100%");
div_svg.setAttribute("height", "100%");
itemhis.appendChild(div_svg);

var div_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
div_group.setAttribute("transform", "matrix(1, 0, 0, 1, " + tran_left + ", " 
+   tran_top + ") matrix(1, 0, 0, 1, 0, 0) matrix(1, 0, 0, 1, 0, 0)" );
div_svg.appendChild(div_group);
//b removed unused code

// point the new array arr_block to the current step's strokes
var arr_block = new Array();
for (var i = 0; i < this.current_seg.length; i++) {
    var seg = this.current_seg[i];
    if ( seg.symbol == undefined && Editor.FindIndexSegment( seg.set_id
    ,  Editor.segmentSplits) != -1 && Gestures
    .  IsSegmentsBelongDralf(seg) == true)
        arr_block.push(seg);                                            }
this.block = new ActionSegments(arr_block, true, Editor.DeleteSegments);
this.block.Apply();
var list_point = new HistorySegments(this.ReplacementStrokes());
list_point.HisPoints();

// copy current steps strokes to new svg
for (var i = 0; i < list_point.list_points.length; i++)                       {
    var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute("transform", list_point.scalezoom[i]);
    group.setAttribute("style", "fill:none;stroke-linecap:round;");
    div_group.appendChild(group);
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute("points", list_point.list_points[i]);
    if(list_point.segments[i].scale.x != -1 || list_point.segments[i].scale.y != 1){
       var mean_scale = (Math.abs(list_point.segments[i].scale.x * list_point.segments[i].temp_scale.x) 
             + Math.abs(list_point.segments[i].scale.y * list_point.segments[i].temp_scale.y)) / 2.0;
       poly.setAttribute("style", "stroke:red;stroke-width:" + (5 / mean_scale));   
    }else
       poly.setAttribute("style", "stroke: red; stroke-width: 5;");
    group.appendChild(poly);                                                 }}

/******************************************************************************
*a permanent stroke bug.  code was:
*  if (seg.symbol != undefined && (Editor.FindIndexSegment(seg.set_id
*  ,  Editor.segmentSplits) == -1 && seg.translation.x > 0 && seg.translation.y > 0)) {
*     arr_list.push(seg); }
******************************************************************************/
HistorySegments.ReplacementStrokes = function() {
    delete this.current_seg;
    this.current_seg = new Array();
    this.current_seg = Editor.segments.clone();
    var arr_list = new Array();
    for (var i = 0; i < this.current_seg.length; i++) {
        var seg = this.current_seg[i];
        if ( (Editor.FindIndexSegment(seg.set_id //a
        ,  Editor.segmentSplits) == -1 && seg.translation.x > 0 && seg.translation.y > 0)) 
           arr_list.push(seg);     }
    return arr_list;               }

/******************************************************************************
* 
******************************************************************************/
HistorySegments.Table = function() {
    this.center_panel = $("#exprHistory")[0];
    this.current_list = $("#history")[0];
    this.LoadScroll("exprHistory");
}

/******************************************************************************
* 
******************************************************************************/
HistorySegments.LoadScroll = function(containerID) {
    if (!containerID) containerID = "exprHistory";
    this.myScroll = new iScroll(containerID, {
        checkDOMChanges: true,
        scrollbarClass: 'myScrollbar'    });       }

/******************************************************************************
* 
******************************************************************************/
HistorySegments.SwipeRightDelete = function() {
    YUI().use("node-base", "node-event-delegate", "transition", "event-move", function(Y) {
        var MIN_SWIPE = 50;
        Y.Node.one("#history").delegate("gesturemovestart", function(e) {
            var item = e.currentTarget,
            target = e.target,
            container = e.container,
            isDeleteButton = target.hasClass("myapp-delete");
            // Prevent Text Selection in IE
            item.once("selectstart", function(e) { e.preventDefault(); });
            if (!isDeleteButton) {
                this.active = false;
                container.all(".myapp-delete").addClass("myapp-hidden");
                item.setData("swipeStart", e.pageX);
                item.once("gesturemoveend", function(e) {
                    var swipeStart = item.getData("swipeStart"),
                    swipeEnd = e.pageX,
                    isSwipeRight = (swipeEnd - swipeStart) > MIN_SWIPE;
                    if (isSwipeRight) {
                        this.active = true;
                        item.one(".myapp-delete").removeClass("myapp-hidden");
                        var string = item.get("childNodes").item(1).get("id");
                        string = string.replace("itemhis", "");
                        this.current_index = parseInt(string);        } }); }
            else                                                              {
                item = target.get("parentNode");
                if (item.get("id") != "kitkat" || confirm("Seriously? The KitKats?")) {
                    this.sum_height -= this.current_list.childNodes[this.current_index].clientHeight;
                    item.transition({
                        duration: 0.3,
                        opacity: 0,
                        height: 0 }
                    ,  function() {
                        this.remove();
                        this.UpdateList();
                        this.active = false;     });            } }
        }, "div.swipeR", {
            preventDefault: true        });    });  }

/******************************************************************************
* 
******************************************************************************/
HistorySegments.SetDefault = function() {
    Editor.clear_selected_segments();
    Editor.clearButtonOverlays();
    Editor.button_states[Buttons.Command].setSelected(true);
    Editor.rectangleSelectionTool();
    Editor.selection_method = "Rectangle";
    RenderManager.render();
}
/******************************************************************************
* 
******************************************************************************/
HistorySegments.GetIndex = function(e)                                        {
if (e != null && (HistorySegments.active || HistorySegments.select_active)) return;
else                                                                          {
   var prevStep = HistorySegments.index;
   HistorySegments.index = -1;
   var obj;
   if(e == null) obj = HistorySegments.current_list.lastChild;
   else        obj = e.currentTarget;
   HistorySegments.setStepStyle(obj);
   HistorySegments.SetDefault();
   if(HistorySegments.isBlankStep(HistorySegments.index))
        HistorySegments.resetCanvasforBlankStep();
   else HistorySegments.ActionHistory(HistorySegments.index);
   HistorySegments.select_active = true;

   // bug fix #232: clear undo & redo when we move off a step
   if(prevStep != HistorySegments.index)                                      {
     if(Editor.redo_stack)                                                    {
       var totalRedo = Editor.redo_stack.length;
       var isExistDelRedo = false;
       for(var i = 0 ; i<totalRedo;i++)                                       {
         if(Editor.redo_stack[i] && (Editor.redo_stack[i].nameSegment != "DeleteSegments" || isExistDelRedo))
               Editor.redo_stack.splice(i,1);
         else  isExistDelRedo=true;                                          }}
     if(Editor.undo_stack)                                                    {
       var totalUndo = Editor.undo_stack.length;
       var isExistDelUndo = false;
       for(var i = 0 ; i<totalUndo;i++)                                       {
         if(Editor.undo_stack[i] && (Editor.undo_stack[i].nameSegment != "DeleteSegments" || isExistDelUndo))
            Editor.undo_stack.splice(i,1);
         else
            isExistDelUndo = true;                                           }}
       Editor.initContextMenuStroke();                                        }
   // bug fix #232 end.

   // hide the graph if it has being shown.
   if( $("#recMath").is(":visible"))                                          {
     $("#recMath").hide(); $("#recExpr").show();                            }}}

/*******************************************************************************
*                                  Exercises
*******************************************************************************/
// creates a step
// this constructor makes a single step but also holds all steps.  
// should be named createStep()
// purging image:  removing arr_url code below breaks step delete
Exercises = function( latex, status ) { //x
    this.arr_url = new Array();
    this.arr_latex = new Array();
    this.status = status;
    for (var i = 0; i < latex.length; i++) {
        this.arr_url.push(""); //x
        this.arr_latex.push(latex[i]);   }}

/******************************************************************************
* 
******************************************************************************/
Exercises.PhraseFormats = new Array();
Exercises.id_default = 0;
Exercises.id_select = 0;
Exercises.to_step = -1;
Exercises.from_step = 0;
Exercises.id_activeMath = "";
Exercises.title = "";
Exercises.userInputPostion = - 1;
Exercises.top = 0;

/*****************************************************************************/
HistorySegments.getPermision = function(){
/*****************************************************************************/
    if (Editor.am_correction){
        this.recorrectD = false;
        if (this.list_segments.length > 1 && this.index < this.list_segments.length - 1
            && !this.list_segments[this.index].permision_edit){
            return true;        }    }
    return false; }

/******************************************************************************
* setPermission() -- unused code, but keep it as sibling to getPermission()
******************************************************************************/
HistorySegments.setPermision = function(){
    for (var i = 0; i < HistorySegments.list_step_wrong.length;i++){
    HistorySegments.list_segments[parseInt(HistorySegments
    		.list_step_wrong[i])].permision_edit = false;    }
    HistorySegments.list_step_wrong = new Array();}

/******************************************************************************
*
******************************************************************************/
var socket_client = {
    init : function(){
        var url = document.location.toString()
            .replace('index.jsp?mod=civ', '')
            .replace('http://', 'ws://')
            .replace('https://', 'wss://')
            + "Notify";
        console.log(url);
        socket_client.connect(url);
    },
    connect : function(url){
        this._ws = null;
        if ('WebSocket' in window) {
            this._ws = new WebSocket(url, "Notify");        } 
        else if ('MozWebSocket' in window) {
            this._ws = new MozWebSocket(url, "Notify");        } 
        else {
            console.log('Error: WebSocket is not supported by this browser.');
            return;        }
        this._ws.onopen = this.onOpen;
    this._ws.onmessage = this.onMessage;    },
    onOpen : function(){
        console.log('Info: WebSocket connection opened.');
        setInterval(function() {
            socket_client.sendMessage("{'type':'ping of coax'}"); }
        , 10000);    },
    onMessage : function(message){ },
    sendMessage : function(m){ if (this._ws) this._ws.send(m);    }  };

/******************************************************************************
* calls exercises.jsp to write History to server on Submit or delete step
******************************************************************************/
HistorySegments.sendData = function(str_Xml, status) {
if (!this.set_action) return;
$.ajax({ type: "POST", dataType: "JSON", url: Editor.url_exercises
,  async: false
,  data: { action: String(str_Xml) }
,  success
:  function(in_data) {
   var temp_data = eval(in_data);
   HistorySegments.version = temp_data.version;
   Exercise.recent[0].version = HistorySegments.version;
   var result = _(data_open_tree.versions)
   .   find( function(item){ return item.version == HistorySegments
   .   version && item. exerciseid == Exercises.id_select; })
   if(!result)                                                                {
      localStorage.setItem(Exercise.C_RECENT,
    		  JSON.stringify(Exercise.recent));
      var version_last = {exerciseid:Exercises.id_default
    		  ,userid:SettingsMenu.user, version:HistorySegments.version};

      if(data_open_tree.versions != undefined)
       data_open_tree.versions.push(version_last);

      update_version('browser',{label:version_last.version
      ,  exerciseid: version_last.exerciseid, version:version_last.version});  }

   $.each(temp_data, function(in_dex, in_item) {
         if (status 
          && HistorySegments.index >= HistorySegments.list_segments.length - 1){
        	 
        	 HistorySegments.list_segments[HistorySegments.list_segments.length - 1].id = in_item.id;
            if (Editor.am_correction && HistorySegments.check_step 
            		&& HistorySegments.list_step_wrong.length > 0){
               this.delWrong(-1);
               HistorySegments.index = HistorySegments.step - 1
               this.current_list.childNodes[HistorySegments.index]
               .childNodes[1].setAttribute("id","itemhis"+HistorySegments.index); } }
         else if (Editor.am_correction){
            if (HistorySegments.check_step && status
               && HistorySegments.index < HistorySegments.list_segments.length - 1) {
               this.delWrong(this.index);
               HistorySegments.index = HistorySegments.step - 1;
               HistorySegments.current_list.childNodes[HistorySegments.index]
               .childNodes[1].setAttribute("id", "itemhis" + HistorySegments.index); }
            HistorySegments.check_delete = false;
            HistorySegments.check_step = false;            }});
            
	      if(HistorySegments.index!=undefined 
	    		  && HistorySegments.list_segments.length > HistorySegments.index
	    		  && HistorySegments.list_segments[HistorySegments.index].historiesId == undefined){
	    	  HistorySegments.list_segments[HistorySegments.index].historiesId=temp_data.historyId;
	      }}//success
	,  error:  function(jqXHR, textStatus, errorThrown)         {
	   if(isAjaxSessionTimeOut(jqXHR)){ sleep(5000);return;}
	    Editor.copeAjaxError( jqXHR, textStatus, errorThrown ); }//error             
	});
   this.set_action = false;
}
