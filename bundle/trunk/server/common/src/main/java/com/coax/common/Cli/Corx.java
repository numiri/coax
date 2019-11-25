/*
mods 1605xx: 
1. replace pm with individual latex's for + and -
2. code clean up: vietnamese comments, hoarding

*******
compile
*******

from Cli dir:
javac -g -cp "/home/snguyen/coax-src/coax/trunk/server/common/src/main/java:/home/snguyen/big/app/tomcat6/lib/*" ActiveMathInfo.java

dump steps.get(0).frazs.get(0)

dependency: 
Fraz -> Step ----+----> Corx
                 |
ActiveMathInfo --+

*************
main sequence - also see #doc-corx.java
*************

******
static - see #doc-corx.java
******

**********
historical
**********

On Submit, the browser sends stroke points to MA.java for both recognition & 
correctness check.  While this only requires one trip to the server, breaking 
the request into to 2 parts (rex & corx) makes the code much simpler because 
we can take advantage of the symmetry between the 2 steps.

Saving an extra trip only works if the recognizer & corx engine (maxima) 
runs on the same server.  The MultiAlign code does not work with the rex 
engines from Microsoft & MyScript, where rex & corx run on different servers.  
The code would be simpler if it were to send the strokes for recognition 
first, retrieve fraz, then send the 2 step's frazs to corx for correctness.

helper classes:
Expressions = {PreLatex maxima, LL<Latex> latexs, LL<String> symbols, variable, hasEqual,..}
              maxima is the older step, symbols is the newer step that is recognized into "latex"
              this treats both steps asymetrically, causing bloated code :-(
PreLatex    = {String Latex, String Variable, int Resutl, hasEqual}
            = the previous step's phrase
Latex       = {id, content=latex,symbol}. used in BuildSolveString().
              this is low level & deals w/ symbols
this.expressions = List<Expression> = parseQstring()
                   now replaced with List<Step> = this.steps
*/

package com.coax.common.Cli;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.activemath.webapp.user.User;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;

import uk.ac.ed.ph.jacomax.MaximaTimeoutException;

/*****************************************************************************
*
*****************************************************************************/

public class Corx extends Align {

public void setUserMode(String userMode) { this.userMode = userMode; }
public void setUseram(User useram) { this.useram = useram; }
public void setSession(javax.servlet.http.HttpSession session) { this.session = session; }
private static final long serialVersionUID = 1L;
String data = "<Expressions guid=\"sss\"><exercise  idExp = \"1\" stepExp = \"0\" latexstep =\"(x+2)(x-3)\" message=\"sai roi lam lai\" messagetrue=\"rat tot.\" finish=\"\"/><SegmentList min=\"360,98\" max=\"805,165\" id=\"99\" guid=\"add\"><Segment symbol=\"_lparen\" min=\"367,98\" max=\"378,144\" id=\"36\"/><Segment symbol=\"x_lower\" min=\"413,107\" max=\"452,139\" id=\"39\"/><Segment symbol=\"_plus\" min=\"469,108\" max=\"502,136\" id=\"42\"/><Segment symbol=\"2\" min=\"527,97\" max=\"552,137\" id=\"44\"/><Segment symbol=\"_rparen\" min=\"557,73\" max=\"574,152\" id=\"46\"/><Segment symbol=\"_lparen\" min=\"593,92\" max=\"604,138\" id=\"48\"/><Segment symbol=\"x_lower\" min=\"615,97\" max=\"663,130\" id=\"51\"/><Segment symbol=\"_dash\" min=\"689,115\" max=\"710,115\" id=\"53\"/><Segment symbol=\"3\" min=\"735,89\" max=\"758,130\" id=\"55\"/><Segment symbol=\"_rparen\" min=\"778,76\" max=\"795,155\" id=\"57\"/><maxima variable=\"x\">$(x%2B2)(x-3)$</maxima></SegmentList></Expressions>";
List<Expression> expressions;
LinkedList<Step> steps;
//String expressionStep;
String guid;
//LinkedList<Probability> probabilities;
boolean AutoAlign = false;
private javax.servlet.http.HttpSession session;
private ActiveMathInfo amInfo;
private User useram = null;
private String userMode = "";
private String error = "";
// begin: web vs. native app flag
boolean App = false; 
public boolean isApp() { return App; }
public void setApp(boolean isApp) { this.App = isApp; }
// end  : web vs. native app flag
protected boolean isAutoAlign() { return AutoAlign; }
protected void setAutoAlign(boolean autoAlign) { AutoAlign = autoAlign; }
protected String getGuid() { return guid; }
protected void setGuid(String guid) { this.guid = guid; }
protected List<Expression> getExpressions() { return expressions; }
protected void setExpressions(List<Expression> expressions) { this.expressions = expressions; }

/****************************************************************************/
public void Execute(String xml, String ipclient) {
/****************************************************************************/
System.out.println("=========xml value>>>:\n" + xml + "\n====\n");
boolean result = false; String message = "null";
try                                                                           {
steps = parseQstring(xml); //sn-maxectomy was this.expressions = BuildDatFile(xml)
//expressionStep = parseExpressionStep( xml );
result = CompareMaxima( steps.get(0), steps.get(1) );                         }
catch(IOException e){ message = e.getMessage();                               }
catch (Exception e) { WriteLogException("Execute",e); e.printStackTrace();    }
String corxresponse = "<CorxResponse result=\"" +result+ "\" message=\"placeholder\" > "
+   "<ExerciseStep istrue=\"hardcode\" isfinish=\"hardcode\" message=\""+message+"\" /> "
+   "</CorxResponse>";
System.out.println( corxresponse );
this.setXmlToClient( corxresponse ); 
}
/******************************************************************************
* intent: Maxima wrapper
* input : step1 & step2 in maxima format (not latex)
* output: T/F reflecting correctness
******************************************************************************/
private boolean CompareMaxima( Step step1, Step step2 ) throws IOException    {
String solve2 = "", solve1 = "", solve = ""; boolean result=false;
try { 
LinkedList<Fraz> fraz1 = step1.frazs;
LinkedList<Fraz> fraz2 = step2.frazs; 
solve1 = BuildSolveString( fraz1 );
solve2 = BuildSolveString( fraz2 );
solve = "if( " + solve1 + " = " + solve2 + " ) then 1 else 0;";

boolean invalidSolve = solve.contains("()") || solve.contains("(null)") 
||                     solve.contains("[,");
boolean validlatex  = IsValidLatex( fraz1 ) && IsValidLatex( fraz2 );
boolean validMaxima = step1.IsValidFrazs() && step2.IsValidFrazs();

if (validlatex && validMaxima && this.IsStandAlone() && !invalidSolve)        {
    String rst = "";
    try { rst = ConnectMaxima.SolveX( solve1, fraz1.get(0).variable, 
                                      solve2, fraz2.get(0).variable ); }
    catch (MaximaTimeoutException ex) {
        //WriteLogException("CompareMaxima", ex + "-- maxima: " + solve.toString() + "---");
        Logger.getLogger(Corx.class.getName()).log(Level.SEVERE, null, ex);    } //sn-maxectomy:  Corx was MultiAlign
    result = (rst.trim().compareTo("1") == 0);                                }}
catch (IOException e){ throw e;                                               }
catch (Exception e  ){ System.err.println(e.getStackTrace());                 }
return result;                                                                }
/******************************************************************************
* intent: parse query string into Step[] (was BuildDatFile() )
* input :  "<steps guid = "48eea710-3cf0-...>        <step order="old" fraz="$2x+3y=8$$6x+4y=14$" var="x,y" /><step order="new" fraz="$23C+3y=8$$63C+49=14$" var="x,y" /></steps>"
* output:  [  Step: [ Fraz{..}, Fraz{..}, ...]
*          ,  Step: [ Fraz{..}, Fraz{..}, ...] ]
*          (we use array notation for linked lists)
* key   :
*  "<steps guid = "48eea710-3cf0-...>        <step order="old" fraz="$2x+3y=8$$6x+4y=14$" var="x,y" /><step order="new" fraz="$23C+3y=8$$63C+49=14$" var="x,y" /></steps>"
*      ^                                        ^                        ^
*      |                                        |        [0]=" "         |
*  document.content.elementData[0]   .content.elementData[1]           .attributes.elementData[1] = LL of Frazs
*                                                        [2]=<step new>
* #doc corx.jsp, #doc-Corx.java
******************************************************************************/
private LinkedList<Step> parseQstring(String xml) {

LinkedList<Step> steps = new LinkedList<Step>();
SAXBuilder builder = new SAXBuilder(); 
//int count = 0; String vars="";
try {
// root = <steps>
//b check for native apps
Document document = builder.build(new ByteArrayInputStream(xml.getBytes()));
Element root = document.getRootElement();
this.guid    = root.getAttributeValue("guid");
String isApp = root.getAttributeValue("app"); //b
if (isApp != null) this.setApp(true);
this.wrapSetAmInfo( root ); 
List<Element> rows = root.getChildren("step");
for (int i = 0; i <= 1; i++)  {
   String[] ltokens = rows.get(i).getAttribute("fraz").getValue().split(",");
   String[] vtokens = rows.get(i).getAttribute("variable").getValue().split("\\|");
   String order     = rows.get(i).getAttribute("order").getValue();
   LinkedList<Fraz> x = new LinkedList<Fraz>();
   Step step          = new Step( x, order );
   for (int j=0; j < ltokens.length; j++) {
      ltokens[j]      = ltokens[j].replace("%2B", "+");
      //vars = (vtokens.length==1) ? vtokens[0] : vtokens[j];
      Fraz fraz = new Fraz( ltokens[j], vtokens[0] );
      step.frazs.add( fraz  ); }
   steps.add( step );
   //d (below)
}
// replaces the code block:  ... Expression expression = new Expression(...)
// I don't know what thes attributes are, except that they pertain to Activemath
//this.expressionStep = "<ExerciseStep istrue=\"iamCorx\" isfinish=\"iamCorx\" message=\"iamCorx\" />";
} catch (Exception e) { System.out.println(e.getMessage()); e.printStackTrace(); }
return steps;
}

/*d hoarding
*  sn-maxectomy.  Since I don't understand what "this.expression" is used for, 
   I replaced with it by hard-coding this.expression as a String at the 
   bottom of this function
    List maximaItem = row.getChildren("maxima");       // <maxima>
    PreLatex maxima = BuildMaxima( maximaItem, this.isApp() );
    LinkedList<Latex> latexs = GetLatexs(children);
    Expression expression = new Expression(guid, maxima, latexs, contentDat
    ,  variable, hasEqual, false); 
    if (this.isApp() == true) {                       // hpham phan danh cho navtive app
        String currentlatex = "";
        for (int j = 0; j < maximaItem.size(); j++) {
            Element row0 = (Element) maximaItem.get(j);
            Element row1 = row0.getChild(c_current);
            if (row1 != null) {
                currentlatex = row1.getTextTrim();
                currentlatex = currentlatex.replace("%2B", "+"); }}
        expression.setLatex(currentlatex); } // end native app
*/

/*****************************************************************************
* intent: compose maxima expand/solve command for a single step
* input:  fraz = List<Fraz> where
* output: solve(  [..,   (3 * x) + 5 = y    ,..], [x,y] ) or 
*         expand( [..,trigexpand(cos(2*x)=0),..], [x,y] )
* notes:  this approach is centered around whether or not trig verbs are present
*            if trig then { soex = expand, trigopen & trigclose = parens }
*         the variable outer becomes "expand" or "solve"
*         the variable trigopen & trigclose becomes "" or trig fence
*           solve( [ .., <trigexpand(> frazS <)>       ,.. ],[ variables ] )
*              ^             ^                ^
*              |             |                |
*            soex           trigopen        trigclose                      
*            "solve" or     "" or           "" or ")"
*            "expand        "trigexpand("
* assume: all variables are contained in the first frazS
*         existence of comparison <=> is consistent across all frazs
******************************************************************************
* "expand" is required, otherwise
* differently ordering of the same solution sets will cause a comparison to
* be False. Witness: 
* (%i1) if( solve([ x^2-x-6=0 ],[x]) = solve([(x+2)*(x-3)=0 ],[x])) 
*       then 1 else 0; 
* (%o1) 0 
* (%i2) if( solve([ expand(x^2-x-6 ) = 0 ],[x]) = solve([ expand( (x+2)*(x-3) ) = 0 ],[x])) 
*       then 1 else 0; 
* (%o2) 1 
* (%i3) solve([ x^2-x-6=0 ],[x]); 
* (%o3) [x = 3, x = - 2]
* (%i4) solve([ (x+2)*(x-3)=0 ],[x]); 
* (%o4)
********
* for Systems,
* (%i2) solve( [a*x + b*y = c, d*x + e*y = f], [x,y] );  OR
* (%i2) solve( [a x + b y = c, d x + e y = f], [x,y] );
*               c e - b f      c d - a f
* (%o2) [[x = - ---------, y = ---------]]
*               b d - a e      b d - a e
* (?) bug: multiplication verb must be visible.  must insert "*" or space
*          snuggleTex & wrapper Latex2Maxima.ToMaxima() may take care of this
********
* trig:
* naively,
*    solve works:         (%i1) solve(  sin(2*x)=1 );     (%o1) x=[%pi/4]
*    but trigsolve fails: (%i2) trigsolve(  sin(2*x)=1 ); (%o2) trigsolve(sin(2 x) = 1)
* trig syq success                                                                             2         2
*    (%i44) expand( [trigexpand(sin(2*x)),trigexpand(cos(2*y))] ); (%o44) [2 cos(x) sin(x), cos (y) - sin (y)]
*    true:  if ( expand( [trigexpand(sin(2*x)), trigexpand(cos(2*y))] ) = expand( [trigexpand(sin(4*x-2*x)), trigexpand(cos(4*y-2*y))] ) ) then 1 else 0;
*    false: if ( expand( [trigexpand(sin(2*x)), trigexpand(cos(2*y))] ) = expand( [trigexpand(sin(4*x-x))  , trigexpand(cos(4*y-y))  ] ) ) then 1 else 0;
* conclusion:  trig strategy is 
*    if( expand( [ trigexpand(..), trigexpand(..) ] ) 
*    =   expand( [ trigexpand(..), trigexpand(..) ] ) ) then 1 else 0
********
* hard-code for testing syq:
* s1 = Latex2Maxima.ToMaxima("$2x+3y=8$$6x+4y=14$");   // empty
* s2 = Latex2Maxima.ToMaxima("$$2x+3y=8$$6x+4y=14$$"); // empty
* s3 = Latex2Maxima.ToMaxima("2x+3y=8");               // "((2 * x) + (3 * y)) = 8"
******************************************************************************/
private String BuildSolveString(LinkedList<Fraz> frazs)                       {
/*****************************************************************************/
String variable="", frazS = "", solve="", outer="", trigopen="", trigclose=""; 
boolean trig=false, hasEqual=false; //String s1="", s2="", s3=""; //g rm
boolean hasPM = false;//g fixed the pm issue
try {
for (Fraz item : frazs) { // search for trig & <=>
   frazS = item.fraz;
   if(frazS.indexOf("\\pm") != -1) hasPM = true; //g fixed the pm issue
      
   if (frazS.matches(".*[<=>].*")) hasEqual = true;
   if (frazS.contains("sin")   || frazS.contains("cos") || frazS
   .         contains("cotan") || frazS.contains("tan") ) 
   trig = true;                                                               }
trigopen  = (trig)              ? "trigexpand(" : "";
trigclose = (trig)              ? ")"           : "";
outer     = (trig || !hasEqual) ? "expand"      : "setify(solve"; //g pm issue
variable = Utils.Sort( frazs.get(0).variable, "," );
variable = ( variable==null || "".equals(variable) || frazs.get(0)
.  hasEqual == false ) ?  "" :  ",[" + variable + "]";
//g pm issue - begin
// plus-minus issue:  see #doc-Corx.java & #doc-ConnectMaxima.java
if(hasPM)                                                                     {
   List<LinkedList<Fraz>> lst = parseExpressionhasPM(frazs);
   for (int j = 0; j < lst.size(); j++)                                       {
      LinkedList<Fraz> linkedList = lst.get(j);
      String system = "";
      for (int i = 0; i < linkedList.size(); i++)
         system += trigopen + Latex2Maxima.ToMaxima(linkedList.get(i).fraz) + trigclose+",";
      system = system.substring( 0, system.length()-1 );
      if(j>0) solve += ",";
      solve += outer + "([" + system + "]" + variable + "))";                 }
   if(lst.size()>0)                                                           {
      if(frazs.size() == 1) solve = "union("+solve+")";
      else solve = "intersection("+solve+")";                                 }
   return solve;
}
//g pm issue - end
for (int i = 0; i <= frazs.size() - 1; i++)
   solve += trigopen + Latex2Maxima.ToMaxima(frazs.get(i).fraz) + trigclose+",";
solve = solve.substring( 0, solve.length()-1 );
solve = outer + "([" + solve + "]" + variable + ")";
if(outer.startsWith("setify")) solve += ")";//g pm issue
}catch(Throwable e) {System.out.println(e.toString());                        }
return solve;                                                                 }
/*****************************************************************************/
private List<LinkedList<Fraz>> parseExpressionhasPM(LinkedList<Fraz> frazs)   {
/*****************************************************************************/
   List<LinkedList<Fraz>> pmfrazs = new ArrayList<LinkedList<Fraz>>();
   for (int i = 0; i < frazs.size(); i++)                                     {
      LinkedList<Fraz> arrlst = new LinkedList<Fraz>();
      arrlst.add(frazs.get(i));
      boolean looping = true;
      
      while(looping)                                                          {
         LinkedList<Fraz> arrlst4minus = new LinkedList<Fraz>();
         looping = false;
         for (int j = 0; j < arrlst.size(); j++)                              {
            Fraz f = arrlst.get(j);
            String frazS = f.fraz;
            if(frazS.indexOf("\\pm") != -1)                                   {
               arrlst.remove(j);
               arrlst.add( j  , new Fraz(frazS.replaceFirst("\\\\pm", "+"), f.variable));
               arrlst4minus.add(new Fraz(frazS.replaceFirst("\\\\pm", "-"), f.variable));
               looping = true;                                               }}
         arrlst.addAll(arrlst4minus);                                         }
      pmfrazs.add(arrlst);                                                    }
   
   List<LinkedList<Fraz>> returnLst = new ArrayList<LinkedList<Fraz>>();
   for (int i = pmfrazs.size()-1; i>-1; i--)                                  {
      LinkedList<Fraz> arrlst = pmfrazs.get(i);
      List<LinkedList<Fraz>> tempLst = new ArrayList<LinkedList<Fraz>>();
      for (int j = 0; j < arrlst.size(); j++)                                 {
         LinkedList<Fraz> tmpFrazs = new LinkedList<Fraz>();
         tmpFrazs.add(arrlst.get(j));
         if(returnLst.size()>0)                                               {
            for (int k = 0; k < returnLst.size(); k++)                        {
               tmpFrazs.addAll(returnLst.get(k));
               tempLst.add(tmpFrazs);                                        }}
         else tempLst.add(tmpFrazs);                                          }
      returnLst.removeAll(returnLst);
      returnLst.addAll(tempLst);                                              }
   return returnLst;                                                          }
/*****************************************************************************/
/*
private String InstructionSolve(LinkedList<Fraz> frazs) {
//*****************************************************************************
boolean trig = false;
String rst = "", frazS = "";
for (Fraz item : frazs) {
   frazS = item.fraz;
   if (trig == false) {
      trig = frazS.contains("sin")   || frazS.contains("cos") || frazS
      .            contains("cotan") || frazS.contains("tan");
      if (trig == true) rst = "trigexpand(trigreduce(";    }}
return rst; }
*/
/******************************************************************************
*c there's only 1 <Exercise> tag, so no need for the loop.
******************************************************************************/
private void wrapSetAmInfo( Element root ) {
List rowExers = root.getChildren("Exercise");
// for (int i = 0; i < rowExers.size(); i++) { //c
    Element row          = (Element) rowExers.get(0); // was rowExers.get(i);
//    String latexStep     = row.getAttributeValue("latexExercise");
//    String message       = row.getAttributeValue("message");
//    String finish        = row.getAttributeValue("finish");
    String inputpostion  = row.getAttributeValue("userInputPostion");
    String idexerciseAm  = row.getAttributeValue("idActiveMath");
    String hint          = row.getAttributeValue("hint");
    String title         = row.getAttributeValue("title"); // }
amInfo = new ActiveMathInfo("sebastian", Integer.parseInt(inputpostion)
,   idexerciseAm.trim(), hint.trim(), title);                                }
/*******************************************************************************
* check validity before converting to Maxima
*******************************************************************************/
private boolean IsValidLatex( LinkedList<Fraz> frazs ) {
for (int i = 0; i < frazs.size(); i++) {
   String latex = frazs.get(i).fraz;
   if (latex.contains("\\hbox") || latex.contains("\\vbox") || latex
   .         contains("\\vtop")) {
      WriteLogException("IsValidLatex", "latex has hbox, vbox,vtop.");
      return false;       }   }
return true;                                                                  }

/*****************************************************************************/
// this is a dummy function, until I have time to write it.
/*
private String parseExpressionStep( String xml ) { return xml; }
*/
/*****************************************************************************/
private void WriteLogException(String message, Throwable exception) {
/*****************************************************************************/
//sn-maxectomy: added space character to _error, or else we get this: parsererror <AR error="..""">
    this.error = this.error.trim() + "\r\n" + message + ":" + exception.getMessage();
    String _error = " " + this.BuildError(this.error.trim());
    this.setXmlToClient(_error);    }
private void WriteLogException(String message, String error) {
    this.error = this.error.trim() + "\r\n" + message + ":" + error;
    String _error = " " + this.BuildError(this.error.trim());
    this.setXmlToClient(_error);    }
/*
private void WriteLogException(String message, IOException exception) {
    this.error = this.error.trim() + "\r\n" + message + ":" + exception.getMessage();
    String _error = " " + this.BuildError(this.error.trim());
    this.setXmlToClient(_error);    }
    */
private String BuildError(String error) {
    return "<AlignResponse error=\"" + error + "\"/>";    }
/*****************************************************************************/
public boolean IsStandAlone() {
/*****************************************************************************/
String usermode = this.userMode;
System.out.println("##############:" + usermode);
if ("".equals(usermode) || usermode.compareToIgnoreCase(com.coax.common.Cli
.  Mode.standalone.toString()) == 0) 
    return true;
return false;    }

}

/*****************************************************************************
private String InstructionSolve(LinkedList<String> maximas) {
*****************************************************************************
boolean trig = false;
String rst = "";
for (String item : maximas) {
   if (trig == false) {
      trig = item.contains("sin")   || item.contains("cos") || item
      .                    contains("cotan") || item.contains("tan");
      if (trig == true) rst = "trigexpand(trigreduce(";    }}
return rst; } */

/*****************************************************************************
* 
*****************************************************************************/
/*
import java.util.regex.Matcher;
import java.util.regex.Pattern;
private String absoluteArgument( String input ) {
String pattern = "abs\(*\)"; // need to count parentheses
Pattern r = Pattern.Compile( pattern );
Matcher m = r.matcher( input );
if( m.find() ){
   Utils.WriteLog( "ToMaxima", m.group(0) );
   Utils.WriteLog( "ToMaxima", m.group(1) );
   Utils.WriteLog( "ToMaxima", m.group(2) ); } }
*/
