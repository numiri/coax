<!-- DO NOT DELETE this comment until <link href=.../ours/js/jqueryui-borrowed.css> 
     is moved into index.jsp.   currently, it breaks the toolbar icon 
     if it lives in index.jsp, so for now it is lives in Utils.js ask4text( ). -->
<%@ include file="web/ours/jsp/session-check.jsp"%>
<!DOCTYPE html>
<html>
<head>
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />

<!-- <link  href="web/theirs/jquery/css/jquery-ui-1.10.3.custom-widget.css" rel="stylesheet"> -->
<link  href="web/theirs/jquery/css/jquery.mobile-1.3.2.css" rel="stylesheet">
<link  href="web/theirs/jquery/css/jqm-icon-pack-fa.css" rel="stylesheet">
<link  href="web/theirs/jquery/css/styles.css" rel="stylesheet">
<link  href="web/ours/css/override-lnf.css" rel="stylesheet">
<link  href="web/theirs/d3/d3-context-menu.css" rel="stylesheet">
<script type="text/javascript" src="web/ours/js/Classifier.js"></script>
<script type="text/javascript" src="web/ours/js/Editor.js"></script>
<script type="text/javascript" src="web/ours/js/Config.js"></script>
<script type="text/javascript" src="web/ours/js/Editor.Constants.js"></script>

<script src="web/theirs/jquery/jquery-1.8.3.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery.mobile-1.3.2.min.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery.spin.js" type="text/javascript"></script>

<script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"> </script>
<!-- get all mathjax file at once from network: <script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"> </script> -->
<!-- <script type="text/javascript" src="web/theirs/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML"> </script>
<script type="text/javascript" src="web/theirs/mathjax/config/TeX-AMS-MML_HTMLorMML.js?rev=2.5.1"> </script>
<script type="text/javascript" src="web/theirs/mathjax/jax/input/TeX/config.js?rev=2.5.1"> </script>
<script type="text/javascript" src="web/theirs/mathjax/jax/output/HTML-CSS/config.js?rev=2.5.1"> </script>
<script type="text/javascript" src="web/theirs/mathjax/extensions/tex2jax.js?rev=2.5.1"> </script>
<script type="text/javascript" src="web/theirs/mathjax/extensions/MathMenu.js?rev=2.5.1"> </script>
<script type="text/javascript" src="web/theirs/mathjax/extensions/MathZoom.js?rev=2.5.1"> </script>
-->
<script src="web/theirs/d3/d3.v4.min.js"></script>
<script src="web/theirs/d3/d3-context-menu.js"></script>
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    extensions: ["tex2jax.js"],
    jax: ["input/TeX","output/HTML-CSS"],
    tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}  });

  //a sn-130524 this is necessary otherwise the call in 
  //  History.js::TableList() to MathJax.Hub.Queue( "typeset"...) hangs
  //  curiously, it nevers seems called though it is needed
  //b Hide and show the box (so it doesn't flicker as much)
  //c Use a closure to hide the local variables from the global namespace
  //d Get the element jax when MathJax has produced it.

  MathJax.Hub.Queue(function () { console.log( "mathjax done" ); }); //a
  (function () { //c
   var QUEUE = MathJax.Hub.queue;  // shorthand for the queue
   var math = null, box = null;    // the element jax for the math output, and the box it's in
   var HIDEBOX=function(){ if (box!=null){ box.style.visibility="hidden"  }} //c
   var SHOWBOX=function(){ if (box!=null){ box.style.visibility="visible" }}

   QUEUE.Push(function () { //d
     math = MathJax.Hub.getAllJax("MathOutput")[0];
     box = document.getElementById("boxMath");
     SHOWBOX(); }); // box is initially hidden so the braces don't show

   //  The onchange event handler that typesets the math entered by the user
   window.UpdateMath = function (TeX) {    //console.log("updateMath " + TeX);
     QUEUE.Push(HIDEBOX,["Text",math,"\\displaystyle{"+TeX+"}"],SHOWBOX);
     var  myValue = document.getElementById("MathOutput"); } //b
  })();
</script>
<style type="text/css">
.ui-block-a,.ui-block-b,.ui-block-c,.ui-block-d,.ui-block-e,.ui-block-f,.ui-block-g
	{
	margin: 0;
	padding: 0;
	border: 0;
	float: left;
	min-height: 1px;
}
/* grid e: 16/16/16/16/16/16 */
.ui-grid-d .ui-block-a,.ui-grid-d .ui-block-b,.ui-grid-d .ui-block-c,.ui-grid-d .ui-block-d,.ui-grid-d .ui-block-e .ui-block-f
	{
	width: 16.6%;
}

.ui-grid-d .ui-block-a {
	clear: left;
}

/* grid f: 14/14/14/14/14/14/14 */
.ui-grid-d .ui-block-a,.ui-grid-d .ui-block-b,.ui-grid-d .ui-block-c,.ui-grid-d .ui-block-d,.ui-grid-d .ui-block-e,.ui-grid-d .ui-block-f,.ui-grid-d .ui-block-g
	{
	width: 14%;
}

.ui-grid-d .ui-block-a {
	clear: left;
}

#browser {
    -webkit-user-select: none;
}
</style>
<link   rel="stylesheet" type="text/css" href="web/ours/css/tess.css">
</head>
<body>
	<div data-role="page" id="page-canvas" data-theme="a" data-add-back-btn="true">

		<div data-role="content" data-theme="d" style="height: 99.9%;background: transparent;">
			<div id="equation_editor_root" class="equation_editor" style="overflow: no-display; visibility: visible;">
				<div id="log"
					style="visibility: hidden; top: 0; position: absolute; width: 100%; height: 4%; color: red; background: #D3D3D3; margin:0">
					<div id="note"
						style="width: 5%; float: left; height: 100%; font-weight: bold; position: absolute;">Notification</div>
					<div id="lhint"
						style="visibility: hidden; width: 20%; float: left; height: 100%; font-weight: normal; position: absolute">Notification</div>
					<div id="description"
						style="width: 35%; float: left; height: 100%; font-weight: normal; position: absolute;"></div>
					<div id="selectexes"
						style="white-space: nowrap; width: 40%; float: left; height: 100%; position: absolute;">
						<!-- <label style="position: absolute; top: 0;">Exercises:</label> <select
							id="slctExercise"
							style="position: absolute; left: 12.5%; width: 30%; white-space: nowrap; border-radius: 2.5px 2.5px 2.5px 2.5px; background: PowderBlue;">
						</select> -->
					</div>
					<div id="logout"
						style="text-align: center; width: 5%; float: left; height: 100%; font-weight: normal; position: absolute;">
						Logout</div>
				</div>
				<div id="center"
					style="position: absolute; height: 98%; top:1px; width: 100%; border-top: none;">

					<div id="show-content"
						style="position: absolute; height: 100%; width: 100%; visibility: hidden;">
						<div id="centerpanel"
							style="position: relative; width: 100%; height: 38%; margin: 0px; background: none repeat scroll 0 0 windowframe;">
							<div id="exprHistory" ontouchstart="event.preventDefault();"
								style="left: 0; border-right: 1px solid windowframe; position: absolute; z-index: 0; height: 100%; width: 50%; overflow: hidden; background: none repeat scroll 0 0 windowframe;">
								<div style="color: white" id="history"></div>
							</div>
							<div id="recExpr"
								style="right: 0; border-left: 1px solid black; position: absolute; height: 100%; width: 50%; overflow: hidden;" ontouchstart="event.preventDefault();">
								<div id="instruction" style="height: 40px;">
                                    <p id="instruction-xiz-info" style="float: left;">Solve me</p>
                                    <img class="ui-icon" style="display:none;float:right;width:60px;height:37px;cursor:pointer;margin:1px;" 
                                    id="SkipCorxUI" src="web/ours/images/no-rex.png" onclick="openSkipCorxHint('click');" ontouchstart="openSkipCorxHint('touch')"/>
<!--Open SkipCorxUI -->
<div data-role="popup" id="popup-SkipCorxUI" data-dismissible="true" style="width: 140px;background-color: #bbb;position: fixed;top: 2px;right: 50px;height: auto;" class="ui-popup ui-overlay-shadow ui-corner-all ui-body-a">
<span>This exercise turns off math recognition. <a target="nocorx" href="web/ours/html/help_no_corx.html" class="ui-link">more...</a></span>
</div>
<!--End of Open SkipCorxUI -->
                                    
                                </div>
								<div>
									<div style="background: none repeat scroll 0 0 windowframe;"
										id="exer" style="left: 0; position: absolute;"></div>
									<div id="select_rec" style="border: 1px solid blue;"></div>
									<div id="box" style="z-index: 15;"></div>
								</div>
							</div>

							<div id="recMath" style="right: 0; border-left: 1px solid black; position: absolute; height: 100%; width: 50%; overflow-y: scroll; -webkit-overflow-scrolling: touch; display:none;">
							 <!-- ontouchstart="event.preventDefault();" -->
								<div id="equationPanel" style="width:90%;padding: 5px 5px 5px 5px;">
									<div id="jxbox" class="jxgbox" style="height: 200px ;width:80%;"></div>
								</div>
								<div id="adjustPanel" style="width:90%;padding: 5px;">
								<div style="">
									<div id="parvarpanel" style="width:100%;">
										<div id="slidermath" ></div>
										<label id="lblParamValue"></label>
										<br>
										<div id="varlist" style="width:30%;float:left;margin-right:10px;"></div>
											<div align="center" id="commandpanel" style="width:30%;float:left;margin-top: 10px;">
												<button class="btn btn-success fullbutton" onclick="Editor.Redraw()">Redraw</button>
												<button class="btn btn-default fullbutton" onclick="Editor.Reset()">Reset</button>
											</div>
											<div id="paramlist" style="width:30%;float:left;margin-left:10px;"></div>
										</div>
									</div>
								</div>
							</div>
							<div style="clear: both;"></div>
						</div>
						<div ontouchstart="event.preventDefault();" id="resize-to"
							style="position: static; width: 100%; height: 2%;"></div>
						<div ontouchstart="event.preventDefault();" id="btn-resize">

						</div>


						<div id="equation_canvas" ontouchstart="event.preventDefault();"
							class="equation_canvas" tabindex="0"
							style="width: 100%; height:57%;">

							<!-- height: -webkit-calc(60% - 42px);height: -moz-calc(60% - 42px);
							height: calc(60% - 42px); -->
							<div id="segmentSplit"></div>
							<div id="segment_drag" ontouchstart="event.preventDefault();">
								<img src="web/ours/images/crosshair.png" width="20" height="20">
							</div>
							<div id="bounding_box" ontouchstart="event.preventDefault();">
								<div id="magnify_box">+</div>
							</div>
							<div id="recyclebin" ontouchstart="event.preventDefault();">
							</div>

							<!-- sn-mathjax-1305 -->
							<div id="mathfont"
								style="position: absolute; right: 5px; bottom: 10px;"></div>

							<div id="loader" ontouchstart="event.preventDefault();"></div>
							<div id="loaderx" ontouchstart="event.preventDefault();"></div>
							<div id="bounding_sub1" ontouchstart="event.preventDefault();"></div>
							<div id="bounding_sub2" ontouchstart="event.preventDefault();"></div>
							<!-- selection rectangle for box select -->
							<div id="selection_rectangle"
								ontouchstart="event.preventDefault();"></div>
							<div id="touchhold" ontouchstart="event.preventDefault();"></div>
							<div id="selection_sub" ontouchstart="event.preventDefault();"></div>
							<canvas id="draft"
								style="border: solid 1px red; float: right; visibility: hidden;"></canvas>
							<div class="bb_handle bb_draft" id="btnResize"
								style="left: -16px; bottom: -16px; z-index: 3147483648; visibility: hidden;">
							</div>
						</div>

						
					</div>

				</div>

                <span id="tex_result" style="position: absolute; vertical-align: middle; font-size: 10px; display: none;"></span>
				<div id="panelkey" style="z-index: 10000;">
					<div id="label"
						style="display: table; height: 100%; float: left; width: 6%; color: blue; position: relative;">
						<div style="display: table-cell; text-align: center; vertical-align: middle;">Keyboard</div>
					</div>
					<div id="keyboard"
						style="display: table; width: 94%; position: relative; margin-left: 6%; background: #8FBC8F; height: 100%;">

					</div>
				</div>

				<!--Setting-->
				<div id="settings_menu"
					style="display: none; position: absolute; height: 80%; width: 60%; left: 20%; top: 5%;">
					<div id="st_node_label"></div>
					<div id="st_close_button" class="button">X</div>
					<div id="st_inner">
						<div id="st_center">
							<!-- prototype for category list -->
							<div id="st_category_list">
								<!--<div class="category_row"></div>-->
							</div>
							<!-- prototype for category table -->
							<div id="st_symbol_grid" style="height: auto;">
								<!--<div class="symbol_cell"></div>-->
							</div>
						</div>
					</div>
				</div>
				<!--formula-->
				<div id="formula_menu"
					style="display: none; position: absolute; height: 80%; width: 60%; left: 20%; top: 5%;">
					<div id="st_node_label"></div>
					<div id="fm_close_button" class="button">X</div>
					<div id="fm_inner">
						</br>
						<div>
							<label>Chon bieu thuc</label> <input style="margin-left: 25px;"
								type="button" value="Submit" id="submitFm" />
						</div>
						<div>
							<input type="radio" name="formula" id="1"
								onclick="FormulaMenu.Check(this.value)" value="0"><label>a^-b^=(a+b)(a-b)</label></br>
							<input type="radio" name="formula" id="2"
								onclick="FormulaMenu.Check(this.value)" value="1"><label>sina^+cosa^=1</label></br>
							<input type="radio" name="formula" id="3"
								onclick="FormulaMenu.Check(this.value)" value="2"><label>(a+b)^</label></br>
						</div>
					</div>
				</div>
				<div id="relabel_menu"
					style="display: none; position: absolute; height: 80%; width: 60%; left: 20%; top: 5%;">
					<div id="rr_node_label"></div>
					<div id="rr_close_button" class="button">X</div>
					<div id="rr_inner">
						<!--<div id="rr_up_tree"></div>-->
						<div id="rr_center">
							<!-- prototype for category list -->
							<div id="rr_category_list">
								<!--<div class="category_row"></div>-->
							</div>
							<!-- prototype for category table -->
							<div id="rr_symbol_grid">
								<!--<div class="symbol_cell"></div>-->
							</div>
						</div>
					</div>
				</div>
			</div>
<!--Phan OPENEXERCISE-->

<div data-role="popup" id="popup-exercise"   data-dismissible="true" class="ui-corner-all" style="width:100%;height:100%;" > 

  <div data-role="header" > <h1>Exercises</h1> </div><!-- /header --> 

  <div style="height:400px;overflow:auto;" id ="div-popup" 
       ontouchstart="return true;" data-role="content" role="main"> 
    <p style="color:black">Recent</p>
     <ul data-role="listview" data-inset="true" id="lst_recent" data-theme="c" 
         class="ui-listview ui-listview-inset ui-corner-all ui-shadow" > 
       <li>
         <fieldset class="ui-grid-a">
           <div class="ui-block-a title-l">  <b>Copy</b></div>
         </fieldset> </li> 
       <li>
           <fieldset class="ui-grid-a">
               <div class="ui-block-a title-l">  <b>Paste</b></div>
           </fieldset> </li> 
       <li>
           <fieldset class="ui-grid-a">
               <div class="ui-block-a title-l">  <b>Author</b></div>
           </fieldset> </li> 
       <li>
           <fieldset class="ui-grid-a">
               <div class="ui-block-a title-l"><b>Shared</b></div>
           </fieldset> </li> 
       <li>
           <fieldset class="ui-grid-a">
               <div class="ui-block-a title-l"><b>Group</b></div>
           </fieldset> </li> 
    </ul> 
    <p style="color:black">Folder</p>
    <ul data-role="listview" data-inset="true" > 
        <li><a href="#popupDialog" data-rel="popup" class="ui-link-inherit" 
               ontouchstart="ExercisesMenu.opentree('touch')" 
               onclick="ExercisesMenu.opentree('click')" data-position-to="window" 
               id="lnk-exercise"></a></li> </ul> 
<div style="display:none;">
                 <p>Active Math</p>
                <ul data-role="listview" data-inset="true"> 
                    <li><a href="#">Header Bars</a></li> 
                </ul> 

                <p>problem#</p>
                <fieldset class="ui-grid-a">
                            <div class="ui-block-a" style="width:80%"><input id="txt-problem" type="search" style="height: 38px;"></div>
                            <div class="ui-block-b title-r" style="width:20%"> 
                               <button ontouchstart="ExercisesMenu.problemSelect()" onclick="ExercisesMenu.problemSelect()">GO</button>
                            </div>     
                </fieldset>
</div>
                <div data-role="popup" id="popupDialog" class="ui-corner-all" style="width:95%;height:100%;overflow:hidden;">
                    <div data-role="header" data-theme="a" class="ui-corner-top">
                        <h1>Select Exercise</h1>
                        
                    </div>

                    <div data-role="content"  style="overflow: auto;" >
                     <div data-role="popup" data-transition="fade" id="popupBasic">
						<p>This is a completely basic popup, no options set.<p>
					</div>

                    	<!-- tree exercise -->
                    	<div>
								<h1 style="width:49%;float:left;">Folder & Exercise</h1>
								<div ondrop="drop(event)" ondragover="allowDrop(event)" id="btn-undo-version" class="ui-btn-plain" data-role="button" style="width:49%;float:right;"  data-transition="slideup">Undo Version</div>
							<div class="context-menu-one box menu-1">
    <strong>swipe right</strong>
</div>
	<div id="recyclebinexer"  style="visibility:hidden ">
	</div>

						</div>
								<!-- <div id="treecontrol" style="display:none;">
								<a title="Collapse the entire tree below" href="#"> Collapse All</a>
								<a title="Expand the entire tree below" href="#"> Expand All</a>
								<a title="Toggle the tree below, opening closed branches, closing open branches" href="#">Toggle All</a>
								</div> -->
								<div ontouchstart="return true;" id="browser" style="border:0px;font-size:16px;clear:both; line-height: 16px; text-shadow:none;height:400px;" class="filetree">

								</div>
								<ul id="options" style="display: none;">
		<li style="width: 111px;"><a href="#new"><span class="ui-icon ui-icon-plusthick"></span>New</a></li>
		<li style="width: 111px;"><a href="#edit"><span class="ui-icon  ui-icon-pencil"></span>Edit</a></li>
		<li style="width: 111px;"><a href="#delete"><span class="ui-icon ui-icon-minusthick"></span>Delete</a></li>
		<li style="width: 111px;"><a href="#assign"><span class="ui-icon ui-icon-arrowthick-1-e"></span>Assign</a></li>
</ul>	

						<!-- /tree exercise -->
                    </div>
                </div>               
                            
            </div><!-- /ui-body wrapper -->	
        </div><!-- /page --> 
<style>
#popup-exercise-popup, #popupDialog-popup {width: 90% !important;}
</style>
        
<!--END Phan OPEN EXERCISE-->
<!--Open Help -->
<div data-role="popup" id="popup-help" data-dismissible="true" class="ui-corner-all" style="width:100%;height:100%;" > 
  <div data-role="header" > <h1>Help</h1> </div> 
  <div style="height:430px;">
    <object style="height:100%;" type="text/html" data="./web/ours/html/help.html"></object>
  </div>               
</div> 
<!--End of Open Help -->
<!--Open More -->
<div data-role="popup" id="popup-more" data-dismissible="true" style="width:70px;border-radius: 0;background-color:#89a0be;position: fixed;bottom: 43px;right: 0;height: auto;border: 0;padding-left: 5px;"> 
</div> 
<!--End of Open More -->
	</div>

	<div  id="footer" ontouchstart="event.preventDefault();"  data-tap-toggle="false" 
		data-role="footer" data-position="fixed" class="ui-bar"  style="text-align: center; font-size: 12px; padding-left: 0;width:100%;padding:0 !important; border:0; height:43px;"> <!-- start footer -->
			<div data-role="controlgroup" data-type="horizontal" 
								id="toolbar" style="padding-left: 0;padding-right: 0;margin:0">

			</div>
	</div><!-- end footer -->
	

</div>

  
	<!-- Phan setting -->
    <div data-role="page" id="page-setting" style="overflow:auto;"> 

            <div data-role="header" > 
            <a href="#" data-rel="back" data-theme="a" onclick="Editor.isResized();">Back</a>
                <h1>Settings</h1>
            </div><!-- /header --> 

            <div data-role="content" id="page-setting-content" >
             
            </div><!-- /ui-body wrapper --> 
    </div><!-- /page --> 

<script type="text/javascript" src="web/theirs/devicejs/device.min.js"></script> <!-- for win10 only -->

<!--Start JsxGraph-->
<link   rel="stylesheet" type="text/css" href="web/ours/css/jsxgraph.css">
<script type="text/javascript"
	src="//cdnjs.cloudflare.com/ajax/libs/jsxgraph/0.99.5/jsxgraphcore.js"></script>
<!--<script src="web/theirs/math-parsers/jsxgraphcore.js" type="text/javascript"></script>-->
<script src="web/theirs/math-parsers/mathjs.js" type="text/javascript"></script>
<script src="web/theirs/math-parsers/parseLatex.js" type="text/javascript"></script>
<script src="web/theirs/math-parsers/parserExpression.js" type="text/javascript"></script>
<!--End JsxGraph-->

<script type="text/javascript" src="web/ours/js/Editor.MagnifyingGlass.js"></script>
<script type="text/javascript" src="web/ours/js/mglass.js"></script>
<link   rel="stylesheet" type="text/css" href="web/ours/css/mglass.css">
<link   rel="stylesheet" type="text/css" href="web/ours/css/filter.css">

<!-- Editor components  -->
<script type="text/javascript" src="web/ours/js/Rex.js"></script>
<script type="text/javascript" src="web/ours/js/Editor.Events.js"></script>
<script type="text/javascript" src="web/ours/js/Editor.Buttons.js"></script>
<script type="text/javascript" src="web/ours/js/Editor.Graph.js"></script>
<script type="text/javascript" src="web/ours/js/CorrectionMenu.js"></script>
<script type="text/javascript" src="web/ours/js/CorrectionMenu.SymbolTree.js"></script>
<script type="text/javascript" src="web/ours/js/RenderManager.js"></script>
<script type="text/javascript" src="web/ours/js/CollisionManager.js"></script>
<script type="text/javascript" src="web/ours/js/RecognitionManager.js"></script>
<script type="text/javascript" src="web/ours/js/BoundingBox.js"></script>
<!-- our Segment things -->
<script type="text/javascript" src="web/ours/js/Segment.js"></script>
<script type="text/javascript" src="web/ours/js/PenStroke.js"></script>
<script type="text/javascript" src="web/ours/js/ImageBlob.js"></script>
<script type="text/javascript" src="web/ours/js/SymbolSegment.js"></script>
<script type="text/javascript" src="web/ours/js/Action.GroupSegments.js"></script>
<script type="text/javascript" src="web/ours/js/Action.EditText.js"></script>
<script type="text/javascript" src="web/ours/js/Action.Undo.js"></script>
<script type="text/javascript" src="web/ours/js/Action.Redo.js"></script>

<!-- Misc tools -->
<script type="text/javascript" src="web/ours/js/Utils.js"></script>
<!--script Tess stuff-->
<script type="text/javascript" src="web/ours/js/TouchHold.js"></script>
<script type="text/javascript" src="web/ours/js/Formula.js"></script>
<script type="text/javascript" src="web/ours/js/copy-paste.js"></script>
<script type="text/javascript" src="web/ours/js/Events.Gestures.js"></script>
<script type="text/javascript" src="web/ours/js/Action.Segments.js"></script>
<script type="text/javascript" src="web/ours/js/History.js"></script>
<script type="text/javascript" src="web/ours/js/ResizeTo.js"></script>
<script type="text/javascript" src="web/ours/js/Fractions.js"></script>
<script type="text/javascript" src="web/ours/js/Space.js"></script>
<script type="text/javascript" src="web/ours/js/iscroll.js"></script>
<script type="text/javascript" src="web/ours/js/Setting.js"></script>
<script type="text/javascript" src="web/ours/js/AutoGroup.js"></script>
<script type="text/javascript" src="web/ours/js/Substitute.js"></script>
<script type="text/javascript" src="web/ours/js/Flottom.js"></script>
<script type="text/javascript" src="web/ours/js/Sys.Equations.js"></script>
<script type="text/javascript" src="web/ours/js/Keyboard.js"></script>
<script type="text/javascript" src="web/ours/js/Editor.Exercises.js"></script>
<script type="text/javascript" src="web/ours/js/LogXML.js"></script>
<script type="text/javascript" src="web/ours/js/Login.js"></script>
<script type="text/javascript" src="web/ours/js/Insert.js"></script>
<script src="web/theirs/underscorejs/underscore.js" type="text/javascript"></script>
<!-- <script src="web/theirs/hammer/hammer.js" type="text/javascript"></script> -->

<!-- phan oe -->
<!-- <link rel="stylesheet"	href="http://code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css" /> -->
<link rel="stylesheet" href="web/theirs/jquery/css/jquery.css" />
<link rel="stylesheet" href="web/theirs/jquery/css/jqtree.css" />
<!-- <link rel="stylesheet" href="web/theirs/jquery/animate-custom.css"/> -->
<!-- <link rel="stylesheet" href="oiz/lib/screen.css" />		 -->

<!-- JQuery -->
<!-- <script src="http://code.jquery.com/ui/1.10.0/jquery-ui.js"></script> -->
<!-- <script src="web/theirs/jquery/jquery-1.11.0.min.js" type="text/javascript" ></script> -->
<!-- <script src="web/theirs/jquery/contextmenu/jquery.ui.position.js" type="text/javascript"></script> -->
<script src="web/theirs/jquery/jquery-ui-1.10.3.custom.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery.cookie.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery-ui-1.10.3.custom-widget.js"></script>
<script src="web/theirs/jquery/jquery-ui-1.10.3.custom.js"></script>
<script src="web/theirs/jquery/jquery-ui-1.10.3.custom-dialog.js"></script>
<script src="web/theirs/jquery/jquery.ui-contextmenu.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery.treeview.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery.treeview.edit.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery.ui.touch-punch.js" type="text/javascript"></script>
<!--<script src="web/ours/js/jbuild-shared.js" type="text/javascript" ></script>-->
<!-- <script src="web/theirs/jquery/jquery.reveal.js" type="text/javascript"></script> -->
<script src="web/theirs/quo/quo.js" type="text/javascript"></script>
<!-- 
<script src="web/theirs/jquery/jquery.contextMenu.js" type="text/javascript"></script>
<link  href="web/theirs/jquery/css/jquery.contextMenu.css" rel="stylesheet" type="text/css" />
 -->
<!--
<script src="web/theirs/jquery/contextmenu-2/contextMenu.js" type="text/javascript"></script>
<link  href="web/theirs/jquery/contextmenu-2/contextMenu.css" rel="stylesheet" type="text/css" /> 
-->
<script src="web/theirs/jquery/tree.jquery.js" type="text/javascript"></script>
<script src="web/theirs/jquery/jquery.contextMenu.js" type="text/javascript"></script>
<!-- <script src="web/theirs/jquery/contextmenu/prettify.js" type="text/javascript"></script> -->
<script type="text/javascript" src="web/ours/js/open-tree.js" ></script> 

<!-- day la phan mooltool -->
<script type="text/javascript" src="web/theirs/bootstrap-context/mootools-core.js"></script>
<script type="text/javascript" src="web/theirs/bootstrap-context/custom-event.js"></script>
<script type="text/javascript" src="web/theirs/bootstrap-context/Features.Touch.js"></script>
<script type="text/javascript" src="web/theirs/bootstrap-context/Mouse.js"></script>
<script type="text/javascript" src="web/theirs/bootstrap-context/Touchhold.js"></script>
<!-- END day la phan mooltool -->
	
<!-- <script type="text/javascript" src="web/ours/js/oex-panel.js" ></script> -->
<script src="web/ours/js/session-check.js"></script>   
<script type="text/javascript">
$(document).ready(
function() {
   Editor.initialize("equation_canvas", 'toolbar'); 
   //Login(); 
   SettingsMenu.initialize(<%=session.getAttribute("userid")%>, '<%=session.getAttribute("username")%>');
});
window.location.hash = "";
</script>

<!-- 3 libraries:  make mathpix picture export work on winxp.  for winxp only (not needed for other platforms) -->
<script type="text/javascript" src="http://canvg.github.io/canvg/rgbcolor.js"></script>
<script type="text/javascript" src="http://canvg.github.io/canvg/StackBlur.js"></script>
<script type="text/javascript" src="http://canvg.github.io/canvg/canvg.js"></script>

<canvas id="canvas_img_latex" width="1800px" height="1800px"></canvas> <!-- for mathpix rex only -->
</body>
</html>

