/*=======================  Graphing section  ==================================
*
* -------
* dynamic:  click Graph button, choose the free variable, then click Redraw
* -------
*
* E.graph()
*   -> E.getLatex()
*     -> rex
*     -> createBoardJsxGrap 
*       -> initialVarList() 
*         -> parseLatex.js::Calc( phrase ).  this parses the phrase for token operators 
*            & operands, classifies letters as "param", numbers as "number", ...
*            The result is put in Editor.Equation data structure
*            then we scan this structure & look for all the letters.
*
* user selects "x":
* E.varParamMath is modified by checkChangeVar()
* <input checkbox onchange = E.checkChangeVar() .. 'x' .. >
**
* click Redraw:
* -> E.Redraw(){ E.board.create( 'functiongraph', [func(expr,vars)] ... ) }
* eg. where expr = x*x, vars = "x"
* 
* ------
* static
* ------
*
* ultimately, the variable list is stored in the <input> checkboxes & radio buttons
*
* Editor = { ...
*          , EquationLatex : 3x-2b
*          , Equation      : '3*x-2*b'
*          , varParamMath = [ { name:'x', type:'var'  , value:1 }          //a
*               ^           , { name:'b', type:'param', value:1 } ...  ]     }
*               |
*a initially, x & b are both type 'param', then when user reassigns x on gui, 
*  then checkChangeVar() changes type to 'var' for 'x'
*
* calc =   { valid : true                                                  //b
*          , expr:'3*x-2*b'
*          , rpn_expr : [ ['var','b'], ['num','3'], [2,'*'], ... }          }
*
*b parsed w/ .../theirs/.../parseLatex.js
*  note that all letter tokens in rpn_exp are 'var', none are 'param'
*
=============================================================================*/

//<<<Create board object of JsxGraph 
Editor.createBoardJsxGrap = function(id){
   if(Editor.boardMath!=undefined)   {JXG.JSXGraph.freeBoard(Editor.boardMath)}
   Editor.boardMath = JXG.JSXGraph.initBoard(id, { originX: 100, originY: 100, unitX: 25, unitY: 10, axis: true });   
   Editor.initialVarList();
} 

var func = function(fun,variables)                                            {
   fun = fun.replace( /\$/g, "" );
   return eval( "g = function(" + variables + "){ with(Math) return " 
   +      mathjs(fun) + " }" );                                               }

//proccess check change for checkbox variables group
Editor.checkChangeVar=function(name){   
   var chk='#var_'+name;
   if($(chk)!=undefined){   
      $("#slidermath").hide();
      $('#lblParamValue').hide();
      var isChecked = $(chk).attr("checked");
      $.each(Editor.VarParamMath,function( index, value ){
         if(Editor.VarParamMath[index].name === name){
            if(isChecked){Editor.VarParamMath[index].type='var';}
            else {Editor.VarParamMath[index].type='param';}
         }
      });
      //<<create radio list parameters 
      Editor.initialParamList();
   }
}

//process cho event check change of radio's Parameters
Editor.changeParameter=function(name){
   var paramEle;
   $(Editor.VarParamMath).each(function( index, value ){if(Editor.VarParamMath[index].name === name){paramEle = Editor.VarParamMath[index];}});
   $('#lblParamValue').html(paramEle.name+': '+paramEle.value.toString());
   $("#slidermath").show();
   $('#lblParamValue').show();
   $("#slidermath").slider({range: "min",value: paramEle.value,min: -10,max: 10,slide: function (event, ui) { paramEle.value = ui.value;$('#lblParamValue').html(paramEle.name+': '+paramEle.value.toString());}});
}

/******************************************************************************
* create list radio for parameters
******************************************************************************/
Editor.initialParamList = function(){
var strParamlist ='';
//In here we have list variable in equation 
if(Editor.VarParamMath.length>0)                                              {
   for(var i=0;i<Editor.VarParamMath.length;i++){
      var ele = Editor.VarParamMath[i];
      if(ele.type==='param')
         strParamlist += '<input type="radio" onchange=Editor.changeParameter(\"'+ele.name+'\") name="paramlist" value=\"'+ele.name+'\">'+ele.name+'</br>';
      } }
if(strParamlist!='')
   strParamlist = "<fieldset style='border:1px solid black; padding-left:5px;'><legend>Parameters:</legend>"+strParamlist+"</fieldset>" ;
$('#paramlist').html(strParamlist);                                           }

/******************************************************************************
* create checkboxes to choose params & vars
arrVar = [

******************************************************************************/
Editor.initialVarList = function(){
Editor.VarParamMath= [];
if(!Editor.EquationLatex!=undefined && Editor.EquationLatex!=''){       
   //1.clone value of Editor.EquationLatex
   var strEquation =Editor.EquationLatex;
   //2.parse latex to equation of math
   var calc = new Calc(strEquation,'');
   //Editor.Equation = calc.expr;
   Editor.Equation = Editor.EquationLatex;
   //3.find param and variable in equation
   var arrVar = calc.rpn_expr;
     if (arrVar != undefined && arrVar.length > 0){
      //start find variables and parameters in equation
      for(var i =0 ; i <arrVar.length;i++){
         var ele = arrVar[i];
         if(ele!=undefined && ele.length == 2){
            if(ele[0] === 'var'){
               //check existed before
               var addedvar=false;
               $.map(Editor.VarParamMath, function(elementOfArray, indexInArray) { if (elementOfArray.name == ele[1]){addedvar = true; }});
               if (!addedvar)
                   //push var to Editor.VarParamMath
                  Editor.VarParamMath.push({name:ele[1],type:'param',value:1});
            } } } }
   var strVarlist ='';
   var strParamlist='';
   //In here we have list variable in equation 
   if(Editor.VarParamMath.length>0){
      for(var i=0;i<Editor.VarParamMath.length;i++){
         var ele = Editor.VarParamMath[i];
         strVarlist   += '<input type="checkbox" onchange=Editor.checkChangeVar("'+ele.name+'") id="var_'+ele.name+'" name="var_'+ele.name+'" value="'+ele.name+'">'+ele.name+'</br>';
         strParamlist += '<input type="radio"    onchange=Editor.changeParameter(\"'+ele.name+'\") name="paramlist" value=\"'+ele.name+'\">'+ele.name+'</br>';
      } }
   if(strVarlist!=''){ 
      strVarlist = "<fieldset style='border:1px solid black; padding-left:5px;'><legend>Variables:</legend>"+strVarlist+"</fieldset>" ;
      strParamlist = "<fieldset style='border:1px solid black; padding-left:5px;'><legend>Parameters:</legend>"+strParamlist+"</fieldset>" ;
      //append to div with id =varlist
      $('#varlist').html(strVarlist);
      //append to div with id=paramlist
      $('#paramlist').html(strParamlist);   } }
else { alert('Equation invalid');   } }

/******************************************************************************
* draw the equation
******************************************************************************/
Editor.Redraw=function(){ 
var variables ='';
var parameters='';
var f;
//1.find variables 
if(Editor.VarParamMath.length>0){
   for(var i=0;i<Editor.VarParamMath.length;i++){
      var ele = Editor.VarParamMath[i];
      if(ele.type==='var'){
         if(variables!='') variables+=','+ele.name;
         else              variables+=ele.name;              }}}
if( variables == '' )                                                         {
   alert("Variable must be defined");return;                                  }
//2.find parameters 
if(Editor.VarParamMath.length>0){
   for(var i=0;i<Editor.VarParamMath.length;i++){
      var ele = Editor.VarParamMath[i];
      if(ele.type==='param'){
       if( parameters!='' ) parameters += ',"' + ele.name + '":' + ele.value;
       else                 parameters += '"'  + ele.name + '":' + ele.value;       }}}
if(variables!='' && Editor.Equation!=''){
   var expr = '';
   if(parameters!=''){
      var scope=$.parseJSON('{'+parameters+'}');
      expr = Parser.parse(Editor.Equation).simplify(scope).toString();  
      // fix the issue of ln & --
      var position = expr.indexOf("--");
      if(position>-1){
         expr = [expr.slice(0, position), "+", expr.slice(position+2)].join('');
      }
      position = expr.indexOf("ln");
      if(position>-1){
         var startpoint = position+2;
         var res = expr.charAt(startpoint+1);
         if(res != '('){
            expr = [expr.slice(0, startpoint), "(", expr.slice(startpoint)].join('');
            startpoint += 1; 
            for (; startpoint < expr.length; startpoint++) {
                if("+_*/)".indexOf(expr.charAt(startpoint)) != -1){
                   expr = [expr.slice(0, startpoint), ")", expr.slice(startpoint)].join('');
                   break;
                }
            }
         }
      }

   }
   else{expr=Editor.Equation;}
   try{
   var graph = Editor.boardMath.create('functiongraph', [func(expr,variables)]);
    }catch(err){alert('Equation invalid!'); }}}
/******************************************************************************
* Reset setting of the equation
******************************************************************************/
Editor.Reset=function()                                                       {
   Editor.createBoardJsxGrap("jxbox");
   $("#slidermath").hide();
   $('#lblParamValue').hide();                                                }

/*******************************************************************************
*
*******************************************************************************/
Editor.getLatex = function( select_id, idActiveMath )                         {
//g 216: 
   // There is no need to make a call to rex.fraz() since the latex was already parsed
   // if graphing latest strokes is needed, 
   // there must be a line "SysEquations.BuildTupe(SysEquations.Expressions);" 
   // to update SysEquations.Expressions before calling fraz
   
   //rex.fraz();
   //Editor.EquationLatex = rex.texs[0];
   var index = HistorySegments.index;
   if( index == HistorySegments.list_segments.length -1) index -= 1;

   Editor.EquationLatex = Exercises.PhraseFormats[index].arr_latex[0];
   // parsing latex 
   // this part below is needed for parsing ax, bx, ab since mathjs will not separate those to get tokens
   var parse_latex_url = Editor.oursjsp + "parse-latex.jsp?f="+encodeURIComponent(Editor.EquationLatex);
   $.ajax({ async: false, cache: false, url: parse_latex_url
      , success: function(in_data)                                            {
         if(in_data != "null") Editor.EquationLatex = in_data;                }
      , error: function (xhr, status, error)                                  {
         console.log(error.toString());                                    }});
//end of 216 fix   
   Editor.createBoardJsxGrap('jxbox');
   // need code lines for setting pre-defined variable 
   //Editor.Redraw();
   Editor.button_states[Buttons.Command].setTouched(false);
   Editor.clearButtonOverlays();                                              }

/******************************************************************************
*
******************************************************************************/
Editor.isRedraw=function(arrpoint){
   if(Editor.BackupEquation.length>0){
      for(var i=0 ; i < Editor.BackupEquation.length;i++)   {
         var arrCompare = Editor.BackupEquation[i];
         if(arrpoint[0].length == arrCompare.points[0].length){
            var isExist =false;            
            for(var j=0 ; j < arrpoint[0].length;j++){
               if(arrpoint[0][j]!= undefined && arrCompare.points[0][j]!=undefined && arrpoint[0][j].points.length == arrCompare.points[0][j].points.length){
                  isExist = true;
               }
               else{isExist = false;}
            }if(isExist){return i;}
         }
      }
   }
   return -1;
}

/******************************************************************************
*
******************************************************************************/

Editor.toggleGraph = function ()                                              {
if( !$("#recMath").is(":visible") )                                           {
      $("#recMath").show(); $("#recExpr").hide();                             }
else{ $("#recMath").hide(); $("#recExpr").show();}                            }

Editor.graph = function ()                                                    {
if( !$("#recMath").is(":visible") 
      && Exercises.PhraseFormats[HistorySegments.index] != undefined)         {
      $("#recMath").show(); $("#recExpr").hide(); Editor.getLatex();          }
else{ $("#recMath").hide(); $("#recExpr").show();}                            }

/******************************************************************************
*
******************************************************************************/
//get fraz (clone from Editor.align function)
/* Editor.getLatex_avo =function(select_id,idActiveMath)
{
if (HistorySegments.is_finish)       return;
if (HistorySegments.getPermision())  return;

Editor.initEAattributes();
Editor.initEAresets();

console.log("ActiveMathId align : " + Exercises.id_activeMath);
var sb = new StringBuilder();
SysEquations.BuildTupe(SysEquations.Expressions);
sb.append(SysEquations.string.toString());
console.log("XML " + sb.toString());
//start edit code
var arrCopy =SysEquations.Expressions.clone(true);
var databackupHistory ={points: arrCopy,latex:''};
var indexEquation = Editor.isRedraw(SysEquations.Expressions)
if(indexEquation>-1){
   var ele = Editor.BackupEquation[indexEquation];
   if(ele!=undefined)   {
      Editor.EquationLatex = ele.latex;
      if(Editor.EquationLatex !=undefined && Editor.EquationLatex.length>0){ 
         //check no input
         if(Editor.EquationLatex.indexOf('NoInput') > -1){
            alert('No input!');
            //notify No input and visible graph
            Editor.toggleGraph();
            Editor.ajaxLoader("hidden");          
            return;
         } 
         //init Board 
         Editor.createBoardJsxGrap('jxbox');      
         return;
       }
   }
}
var geturl;
if (SysEquations.Flag == true)                                                 {
   Exercises.userInputPostion = Exercises.userInputPostion + 1;
   Editor.ajaxLoader("visible");

   /*****************************
   * the heart of it all -- parse latex & correctness
   *****************************
   geturl = $.ajax({
      url: Editor.align_server_url + sb.toString(),
      success: function(in_data, textStatus, xmlhttp)                          {
   /*****************************
   *
   *****************************
         Editor.ajaxLoader("hidden");
         if ( String( geturl.getResponseHeader( "content-type" ) )
         .  search("text/html") == 0)                                          {
            window.location.href = Editor.login_server_url;
            return;                                                            }
         in_data = xmlhttp.responseText;

         var result = Editor.parseAlignResult( xmlhttp.responseText );
         HistorySegments.check_step = (result.stringToBoolean == "true") ? true : false;
         var xxx = Editor.reformatTex( result.tex_nodes ); 
         var arr_latex = xxx.arr_latex; 
         HistorySegments.currMaxima = xxx.currMaxima; 
         var latex = Editor.fenceAndLatexThing( result.segment_nodes );
         latex = latex.replace(/\s{1,}/gm, "");

       //set latex function for Graph
       if(arr_latex !=undefined && arr_latex.length>0)              {
         Editor.EquationLatex = arr_latex[0].replace('{','').replace('}','');
         //check no input
         if(Editor.EquationLatex.indexOf('NoInput') > -1)      {
            alert('No input!');
            //notify No input and visible graph
            Editor.toggleGraph();
            Editor.ajaxLoader("hidden");          
            return;                                       }
         //set latex for backingup
         databackupHistory.latex=Editor.EquationLatex;
         Editor.BackupEquation.push(databackupHistory);
         //init Board 
         Editor.createBoardJsxGrap('jxbox');            }
         document.getElementById("tex_result").innerHTML = latex;

         //debugger;
         // HistorySegments.TableList( arr_latex, result.exer_nodes[0]
         // .   attributes["message"].nodeValue );
      },                                                    // end success

      error: function(jqXHR, textStatus, errorThrown)                         {
         Editor.copeAjaxError( jqXHR, textStatus, errorThrown );              }
   });                                                          // end ajax
   Editor.button_states[Buttons.Command].setTouched(false);
}                                                // end if SysEquations.Flag
   Editor.button_states[Buttons.Command].setTouched(false);
   Editor.clearButtonOverlays();
}
*/
