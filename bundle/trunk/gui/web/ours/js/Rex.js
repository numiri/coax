/******************************************************************************
* Rex Adapter
*
*d  for some reason, ajax increments h before going into ajax success function, so we must undo this.
*e  rex.texs is undefined, while rex.aligned is ok!?!
*   call stillRexingBeads()?
*******************************************************************************
* intent: Douglas Crockford's way of creating objects
*         http://javascript.crockford.com/prototypal.html
* usage:  new_object = Object.create( parent_object );
*
* abbreviation:
* fraz = math expression
* syq  = system of equation
* fraz1z = one expression
* salt   = alternate symbols allowed
* corx   = math correctness determined by computer algebra system (maxima)
* tex    = Latex x/y -> \frac{x}{y}
*
* -----------+-----------------------------+----------------
* mic vs pet | steps.jsp                   |   syq
* -----------+-----------------------------+----------------
* mic-engine | skip steps.jsp              | send 1 fraz
*            | invoke rex directly         |
*            |                             |
* pet-engine | use steps.jsp               | send all frazs
*            | MultiAlign.java invokes rex |
* -----------+-----------------------------+----------------
*
* see bottom of file for the actual invocation
*
**************
* file summary
**************
* if typeof ... {...}
* function Rex() { declare Rex functions symbol(), fraz(), ... }
* define Rex attributes ...
* if Editor.rex_engine = mic { Mic = Object.create(Rex); rex = Object.create(Mic); }
* if Editor.rex_engine = pet { Pet = Object.create(Rex); rex = Object.create(Pet); }
*
* define Mic functions: Mic.fraz{}, Mic.frazCorx{}, strokes2qstring{}
*
* if Editor.rex_engine = pet { Pet = Object.create(Rex); rex = Object.create(Pet);
*    define Pet functions
* } ends if pet

if( Editor.rex_engine == "pet" || Editor.rex_engine == 1 )   {
var Pet = Object.create( Rex );
var rex = Object.create( Pet );

rex.aligned is array of objects holding the scratch work for parsing
recoginition results.
rex.texs is array of latex strings for individual equations.
rex.aligned.syq is the concatenated latex strings for a System
rex.aligned & rex.texs memory should be wiped after each recognition so it can be reused for the next.
******************************************************************************/
if (typeof Object.create !== 'function') {
   Object.create = function (o) {
      function F() {}
      F.prototype = o;
      return new F();    };
}
/*****************************************************************************/
function Rex() {
var fraz             = function( strokes ) {}
var translateSymbol  = function( latex   ) {}
var buildQueryString = function( strokes  ) {}

// returns true if server is still doing recognition on the syq
// "done" indicates that for the current step, the entire syq has been
// recognized
/*
var stillRexingBeads = function()                                             {
   var done = true;
   for( var i=0; i<SysEquations.Expressions.length; i++ )                     {
      if( typeof rex.aligned.texs[i] == "string" )
         done = done && ( (rex.aligned.texs[i].length > 0) ? true : false );
      else done = false;                                                      }
   return !done;                                                              }
*/
} // end function Rex()

/**********
*a deprecated.  holds the parsed results from recognizer, for example,
*  rex.aligned[i].am_nodes holds active math info.
*b tex is the string that holds all latex, eg. tex = $ eq1 $$ eq2 $$ eq3 $
*c texs is an array of strings, each element is a latex of a single fraz
*  rex.texs[i] is the latex for the ith equation
*d holds the query string input into maxima
**********/
Rex.aligned = []; //a
Rex.texs    = []; //c
Rex.syq     = ""; //b
Rex.corx_input = ""; //d
Rex.ajaxError = false;
Rex.Salts = [];


/******************************************************************************
* create mathpix object
* Mathpix - MicroSoft's math input control
******************************************************************************/

if( Editor.rex_engine == "smash") {
   var Mathpix = Object.create( Rex );
   var rex = Object.create( Mathpix );
   rex.Salts = JSON.parse('['
+ '{"symbol":"c","salt":["C","c","(","["]},'
+ '{"symbol":"g","salt":["g","9"]},'
+ '{"symbol":"i","salt":["i","1","l","|",",","(","L","\u230A"]},'
+ '{"symbol":"j","salt":["j","1","l","|",",",")","\u230B","]"]},'
+ '{"symbol":"l","salt":["l","|","(","1","L","\u230A"]},'
+ '{"symbol":"o","salt":["o","0","O"]},'
+ '{"symbol":"s","salt":["S","s","5", "9","\u222B"]},'
+ '{"symbol":"t","salt":["[","t","+"]},'
+ '{"symbol":"/","salt":["/",",","|","\u2215"]}'
+ ']');
/**********/

Mathpix.fraz = function(){
if(!HistorySegments.recorrectD){
   rex.ajaxError  = true; //fail for the first fraz finishes running
   var canvasOb = document.getElementById("canvas_img_latex");
   canvasOb.setAttribute("width", $("#svgId").width());
   canvasOb.setAttribute("height", $("#svgId").height());

   svg = $("#svgId").clone().attr('id','svgClone');
   svg.css( "background-color", "white" );
   svg.find("polyline").each( function(){ $(this).css( "stroke", "red" ); });

   var ctx = canvasOb.getContext('2d');
   var data = (new XMLSerializer()).serializeToString(svg[0]);

   ctx.fillStyle = "white";
   ctx.fillRect(0, 0, canvasOb.width, canvasOb.height);
   ctx.drawSvg(data, 0, 0);

   var imgURI = canvasOb.toDataURL('image/jpeg')
   .   replace('image/jpeg', 'image/octet-stream');

   triggerDownload( imgURI );

   $.ajax({
       url: "https://api.mathpix.com/v3/latex",
       contentType: 'application/json',
       dataType: 'json',
       type: 'POST',
       headers: { app_id: 'tess'
       ,    app_key: '9b2ce6d004909039c9a5dfa9dc6fc339' },
       data: JSON.stringify({ url: imgURI}) // imgURI
       ,
       success: function(in_data, textStatus, xmlhttp) {
         if(in_data.latex){
           rex.texs = Mathpix.translateSymbol(in_data.latex);
           rex.syq    = Exercise.concatLatex( rex.texs );
           rex.ajaxError  = false;                     }
         else{
           alert(in_data.error);
           Editor.ajaxLoader("hidden");
           rex.ajaxError  = true;                      }},
       error: function(jqXHR, textStatus, errorThrown) {
         console.log('error');
Editor.ajaxLoader("hidden");
         rex.ajaxError  = true;           },
     async: false
   });

}} //if,fraz


function triggerDownload (imgURI) {
  var evt = new MouseEvent('click', { view: window, bubbles: false
  ,   cancelable: true });
  var a = document.createElement('a');
  a.setAttribute('download', 'latex.jpeg');
  a.setAttribute('href', imgURI);
  a.setAttribute('target', '_new');
  a.dispatchEvent(evt);                             }

/*****************************************************************************/
Mathpix.translateSymbol = function(str)                                       {
  var s = [];
  if(str.startsWith("\\left. \\begin{array} { l } "))                         {
     str = str.replace("\\left. \\begin{array} { l } ", '');
     str = str.replace("\\\\ \\end{array} \\right.",'');
     s = str.split("\\\\");
     for (var i = 0; i < s.length; i++)                                       {
        s[i] = s[i].trim();
        if(s[i].startsWith('{')) s[i] = "$"+s[i].substring(1, s[i].length);
        if(s[i].endsWith('}')) s[i] = s[i].substring(0, s[i].length-1) + "$";}}
  else { s[0]= "$"+str+"$"; }
  return s;                                                                   }
/*****************************************************************************/
Mathpix.buildQueryString = function(strokes)                               {
   var scg = 'SCG_INK\n' + strokes.length + '\n';
   _.each(strokes, function(stroke)                                        {
      scg += stroke.points.length + '\n';
      _.each(stroke.points, function(p)                                    {
         var point = p.transform(stroke.scale, stroke.translation)
         .transform(stroke.temp_scale, stroke.temp_translation);
         scg += point.x + ' ' + point.y + '\n';                       });});
   return scg;                                                             }
/*****************************************************************************/
Mathpix.buildQueryString = function(strokes)                                  {
var grpIds      = new Array();
var grpLineCnts = new Array();
var grpLines    = new Array();
_.each(strokes, function(stroke)                                              {
   var index = grpIds.indexOf(stroke.set_id);
   if(index == -1)                                                            {
      if(stroke.points.length>0){
         grpIds.push(stroke.set_id);
         grpLineCnts.push(stroke.points.length);
         var lines = "";
         _.each(stroke.points, function(p)                                    {
            var point = p.transform(stroke.scale, stroke.translation)
            .transform(stroke.temp_scale, stroke.temp_translation);
            lines += point.x + ' ' + point.y + '\n';                        });
         grpLines.push(lines);                                               }}
   else                                                                       {
      if(stroke.points.length>0)                                              {
         grpLineCnts[index] += 1 + stroke.points.length;
         var lines = grpLines[index] + "- -\n";
         _.each(stroke.points, function(p)                                    {
            var point = p.transform(stroke.scale, stroke.translation)
            .transform(stroke.temp_scale, stroke.temp_translation);
            lines += point.x + ' ' + point.y + '\n';                        });
         grpLines[index] = lines;                                            }}
});//_each strokes
var scg = 'SCG_INK\n' + grpIds.length + '\n';
for(var i=0; i<grpIds.length; i++)
   scg += grpLineCnts[i] + '\n' + grpLines[i];
return scg;                                                                   }
/*****************************************************************************/

} // end mathpix functions

/******************************************************************************
* create mic object
* Mic - MicroSoft's math input control
******************************************************************************/

if( Editor.rex_engine == "mic" || Editor.rex_engine == 2 ) {
   var Mic = Object.create( Rex );
   var rex = Object.create( Mic );
   rex.Salts = JSON.parse('['
+ '{"symbol":"c","salt":["C","c","(","["]},'
+ '{"symbol":"g","salt":["g","9"]},'
+ '{"symbol":"i","salt":["i","1","l","|",",","(","L","\u230A"]},'
+ '{"symbol":"j","salt":["j","1","l","|",",",")","\u230B","]"]},'
+ '{"symbol":"l","salt":["l","|","(","1","L","\u230A"]},'
+ '{"symbol":"o","salt":["o","0","O"]},'
+ '{"symbol":"s","salt":["S","s","5", "9","\u222B"]},'
+ '{"symbol":"t","salt":["[","t","+"]},'
+ '{"symbol":"/","salt":["/",",","|","\u2215"]}'
+ ']');
/* 1z = onesies, recognizing 1 equation at a time (vs bulk)
*
* though Mic seems to be able to bulk-recognize, the result seems poor.  It's
* better at a single equation, so we use the onesies stitch method.
*
*a 1 Submit runs calls rex.fraz w/o, goes thru for(h) loop, w/o calling ajax,
*  so rex.aligned looks like [ undefined, object ], so rex.aligned[0] is
*  meaningless and rex.aligned[1] holds the rex result. we must remove [0] element.
*  the 1st loop stack trace is rex.fraz -> Mic.fraz -> Mic.frazCorx
*  the 2nd loop stack trace is
*    jq.ajaxTransport.send.callback -> done() -> jq.Callback.self.fireWith
*    -> jq.Callback.fire -> $ajax.success (Rex.js 144)
******************************************************************************/
Mic.fraz   = function()                                                       {
if(!HistorySegments.recorrectD)                                               {
for ( var h = 0; h < SysEquations.Expressions.length; h++ )                   {
     $.ajax({ url : Editor.align_server_url
     ,  contentType: 'application/json; charset=utf-8'
     ,  async: false
     ,  type: 'POST'
     ,  data: Mic.buildQueryString(SysEquations.Expressions[h])
     ,  success:  function(in_data, textStatus, xmlhttp)                     {
           rex.aligned[h] = Editor.postAlign(h, in_data, textStatus, xmlhttp);
           rex.texs[h]    = Mic.translateSymbol( rex.aligned[h].tex_result );
           rex.ajaxError  = false;
           rex.syq        = Exercise.concatLatex( rex.texs );                }
     ,  error:  function( jqXHR, textStatus, errorThrown )                   {
        rex.ajaxError = true;
        Editor.copeAjaxError( jqXHR, textStatus, errorThrown );            }});  // end ajax
}//for

if( typeof(rex.aligned[0]) === "undefined" )                                  { //a
   rex.aligned.splice(0,h);
   rex.texs   .splice(0,h);
   h = 0;                                                                    }}
}//end of Mic.fraz
/*****************************************************************************/
Mic.translateSymbol = function( latex )                                       {
   latex = latex.replace( /\\left/g  , "" ); // left( , left[
   latex = latex.replace( /\\right/g , "" ); // right), right]
   latex = latex.replace( /\\\mathrm/g , "" );
   latex = latex.replace( /\u00B1/g , "\\pm" );
   if( Editor.xiz_level == "k8" )                                             {
      latex = latex.replace( /\\alpha/g , "2" );
      latex = latex.replace( /\\partial/g , "2" );                            }
   return latex;                                                              }
/*****************************************************************************/
Mic.buildQueryString = function( strokes  )                                   {
   return SysEquations.jsonizeFraz( strokes );                                }
/*****************************************************************************/
} // end Mic functions
/*****************************************************************************/

/******************************************************************************
* CREATE cid object
******************************************************************************/
if( Editor.rex_engine == "midra" ||  Editor.rex_engine == "cid"  )            {
   var Cid = Object.create( Rex );
   var rex = Object.create( Cid );
   rex.Salts = JSON.parse('['
   +  '{"symbol":"c","salt":["C","c","(","["]},'
   +  '{"symbol":"g","salt":["g","9"]},'
   +  '{"symbol":"i","salt":["i","1","l","|",",","(","L"]},'
   +  '{"symbol":"j","salt":["j","1","l","|",",",")","]"]},'
   +  '{"symbol":"l","salt":["l","|","(","1","L"]},'
   +  '{"symbol":"o","salt":["o","0","O"]},'
   +  '{"symbol":"s","salt":["S","s","5", "9"]},'
   +  '{"symbol":"t","salt":["t","+"]},'
   +  '{"symbol":"/","salt":["/",",","|"]}'
   +  ']');
/*****************************************************************************/
Cid.fraz = function()                                                         {
   if(!HistorySegments.recorrectD)
      $.ajax({ async: false
      ,  url:Editor.align_server_url
         +  SysEquations.string.replace(/\+/g,"_plus")
      ,  success: function( in_data, textStatus, xmlhttp )                    {
         var result = Editor.parseAlignResult( xmlhttp.responseText );
         for ( var ith = 0; ith < result.tex_nodes.length; ith++ )            {
           rex.aligned[ith] = new Object();
           rex.aligned[ith].tex_nodes = [result.tex_nodes[ith]];              }
         var xxx = Editor.reformatTex( result.tex_nodes );
         rex.ajaxError = false;
         rex.texs = xxx.currMaxima;
         rex.syq = Exercise.concatLatex(xxx.currMaxima);                      }
      ,  error: function( jqXHR, textStatus, errorThrown )                    {
          rex.ajaxError = true;
          Editor.copeAjaxError(  jqXHR, textStatus, errorThrown );            }
}); } //ajax, function
/*****************************************************************************/
} // end Cid functions
/*****************************************************************************/

/******************************************************************************
* CREATE pet object
******************************************************************************/
if( Editor.rex_engine == "mipet" || Editor.rex_engine == "pet" || Editor
.          rex_engine == 1)                                                  {
   var Pet = Object.create( Rex );
   var rex = Object.create( Pet );
   rex.Salts = JSON.parse('['
   +  '{"symbol":"c","salt":["C","c","(","["]},'
   +  '{"symbol":"g","salt":["g","9"]},'
   +  '{"symbol":"i","salt":["i","1","l","|",",","(","L"]},'
   +  '{"symbol":"j","salt":["j","1","l","|",",",")","]"]},'
   +  '{"symbol":"l","salt":["l","|","(","1","L"]},'
   +  '{"symbol":"o","salt":["o","0","O"]},'
   +  '{"symbol":"s","salt":["S","s","5", "9"]},'
   +  '{"symbol":"t","salt":["t","+"]},'
   +  '{"symbol":"/","salt":["/",",","|"]}'
   +  ']');
/*****************************************************************************/
Pet.fraz = function()                                                         {
  if(!HistorySegments.recorrectD){
    for ( var ith = 0; ith < SysEquations.Expressions.length; ith++ )
      $.ajax({ async: false
       ,  url: Editor.align_server_url + Pet.buildQueryString(ith)
       ,  success: function( in_data, textStatus, xmlhttp )                   {
          // parse response xml
           var rsp_xml = in_data;
           var rsp_segments = rsp_xml.getElementsByTagName("Segment");
           var rsp_texs     = rsp_xml.getElementsByTagName("TexString");

           if(rsp_segments.length == 0)                                       {
               alert("DRACULAE Error: " + in_data);
               preCorxRunable = false;                                        }
           if ( rsp_texs.length != 0 )                                        {
               // get just the math, removing spaces
               rex.texs[ith] = rsp_texs[ 0 ].textContent.split("$")
               .  slice(1,-1).join("").replace(/\n*/g,"").replace(/\s/g, '');
               rex.texs[ith] = Pet.translateSymbol(rex.texs[ith]);
               rex.texs[ith] = Editor.correctLatexFormat(rex.texs[ith]);
               var segnode = document.createElement("SegmentList");
               segnode.setAttribute("TexString",rex.texs[ith]);
               rex.aligned[ith] = new Object();
               rex.aligned[ith].tex_nodes = [segnode];
               rex.syq = Exercise.concatLatex( rex.texs );
               rex.ajaxError = false;
               }}//success
       ,  error:   function( jqXHR, textStatus, errorThrown )                 {
           rex.ajaxError = true;
           Editor.copeAjaxError(  jqXHR, textStatus, errorThrown );           }
       }); //ajax
}} //end if, function
/******************************************************************************
* assume: Editor.classifier_server_url = "web/ours/jsp/recognizer.jsp";
* usage : url = Editor.classifier_url + Pet.strokes2qstring( strokes ); 
******************************************************************************/
Pet.buildQueryString = function( ith)                                         {
   var sb = new StringBuilder();
   sb.append("<SegmentList>");
   var t;
   for (var k = 0; k < SysEquations.TupeExpres[ith].length; k++)              {
     t = SysEquations.TupeExpres[ith][k];
     Editor.buildElementSegment(sb,t);                                        }
   sb.append("</SegmentList>");
return "?segments="+ sb.toString().replace(/\+/g,"_plus");                    }
/*****************************************************************************/
Pet.translateSymbol = function(str)                                           {
   str = str.replace(/_lparen/g,"(").replace(/_rparen/g,")")
   .  replace(/_lower/g,"").replace(/_upper/g,"")
   .  replace(/_plus/g,"+").replace(/_dash/g,"-")
   .  replace(/_equal/g,"=");
   return str;                                                                }
/*****************************************************************************/
} // end Pet functions
/*****************************************************************************/

/******************************************************************************
* CREATE seshat object
******************************************************************************/
if( Editor.rex_engine == "seshat"){
var seshat = Object.create( Rex );
var rex = Object.create( seshat );
rex.Salts = JSON.parse('['
+  '{"symbol":"c","salt":["C","c","(","["]},'
+  '{"symbol":"g","salt":["g","9"]},'
+  '{"symbol":"i","salt":["i","1","l","|",",","(","L"]},'
+  '{"symbol":"j","salt":["j","1","l","|",",",")","]"]},'
+  '{"symbol":"l","salt":["l","|","(","1","L"]},'
+  '{"symbol":"o","salt":["o","0","O"]},'
+  '{"symbol":"s","salt":["S","s","5", "9"]},'
+  '{"symbol":"t","salt":["t","+"]},'
+  '{"symbol":"/","salt":["/",",","|"]}'
+  ']');
/*****************************************************************************/
seshat.fraz = function()                                                      {
   if(!HistorySegments.recorrectD)                                            {
      for ( var h = 0; h < SysEquations.Expressions.length; h++ )             {
         var _init_data = {action : 'align'
         ,   input : seshat.buildQueryString(SysEquations.Expressions[h])  };
         $.ajax({ url : Editor.align_server_url
         ,  async: false
         ,  type: 'POST'
         ,  data: _init_data
         ,  success:  function(in_data, textStatus, xmlhttp)                  {
            rex.aligned[h] = Editor.postAlign(h,in_data, textStatus, xmlhttp);
            rex.texs[h]    = seshat.translateSymbol(rex.aligned[h].tex_result);
            rex.ajaxError  = false;
            rex.syq        = Exercise.concatLatex( rex.texs );                }
         ,  error:  function( jqXHR, textStatus, errorThrown )                {
            rex.ajaxError = true;
            Editor.copeAjaxError( jqXHR, textStatus, errorThrown );        }});
}}} //for, if, function
/*****************************************************************************/
   seshat.buildQueryString = function(strokes)                                {
      var scg = 'SCG_INK\n' + strokes.length + '\n';
      _.each(strokes, function(stroke)                                        {
         scg += stroke.points.length + '\n';
         _.each(stroke.points, function(p)                                    {
            var point = p.transform(stroke.scale, stroke.translation)
            .transform(stroke.temp_scale, stroke.temp_translation);
            scg += point.x + ' ' + point.y + '\n';                       });});
      return scg;                                                             }
/*****************************************************************************/
seshat.buildQueryString = function(strokes)                                   {
   var grpIds      = new Array();
   var grpLineCnts = new Array();
   var grpLines    = new Array();
   _.each(strokes, function(stroke)                                           {
      var index = grpIds.indexOf(stroke.set_id);
      if(index == -1)                                                         {
         if(stroke.points.length>0){
            grpIds.push(stroke.set_id);
            grpLineCnts.push(stroke.points.length);
            var lines = "";
            _.each(stroke.points, function(p)                                 {
               var point = p.transform(stroke.scale, stroke.translation)
               .transform(stroke.temp_scale, stroke.temp_translation);
               lines += point.x + ' ' + point.y + '\n';                     });
            grpLines.push(lines);                                            }}
      else                                                                    {
         if(stroke.points.length>0)                                           {
            grpLineCnts[index] += 1 + stroke.points.length;
            var lines = grpLines[index] + "- -\n";
            _.each(stroke.points, function(p)                                 {
               var point = p.transform(stroke.scale, stroke.translation)
               .transform(stroke.temp_scale, stroke.temp_translation);
               lines += point.x + ' ' + point.y + '\n';                     });
            grpLines[index] = lines;                                         }}
   });//_each strokes
   var scg = 'SCG_INK\n' + grpIds.length + '\n';
   for(var i=0; i<grpIds.length; i++)
      scg += grpLineCnts[i] + '\n' + grpLines[i];
   return scg;                                                                }
/*****************************************************************************/
seshat.translateSymbol = function(str)                                        {
   return str;                                                                }
/*****************************************************************************/
} // end seshat functions
/*****************************************************************************/
