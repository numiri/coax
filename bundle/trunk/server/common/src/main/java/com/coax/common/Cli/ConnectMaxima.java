package com.coax.common.Cli;

import java.io.IOException;
import java.util.List;

import antlr.StringUtils;
import uk.ac.ed.ph.jacomax.JacomaxSimpleConfigurator;
import uk.ac.ed.ph.jacomax.MaximaConfiguration;
import uk.ac.ed.ph.jacomax.MaximaInteractiveProcess;
import uk.ac.ed.ph.jacomax.MaximaProcessLauncher;
import uk.ac.ed.ph.jacomax.MaximaTimeoutException;
/**
 * TODO Put here a description of what this class does.
 * 
 * @author phamvan. Created Nov 21, 2011.
 */
public class ConnectMaxima {

	/**
	 *  xử lý chuỗi kết quả của maxima.
	 *
	 * @param rst nội dung chuỗi maxima.
	 * @return chuỗi kết quả.
	 */
/*****************************************************************************
* intent: 
* input : 
* output: 
*****************************************************************************/
private static String ExpectOutputMaxima(String rst) {
System.out.println("NOI DUNG OUPUT MAXIMA:" + rst);
String temp="(%o1)";
String temp2 = "(%i2)";
int start = rst.indexOf(temp);
int end = rst.indexOf(temp2);
if(start!=-1) {
   rst = rst.substring(start  + temp.length() , end);
   rst = rst.trim(); }
System.out.println("rst:" + rst);
return rst;  }
	
/*****************************************************************************
* intent: execute maxima command
* input : step1 = solve(..x..), step2 = solve(..x..)
* output: 1 or 0
* strategy: see #doc-ConnectMaxima.java

*a  output: outs[1] = (%o2):  "{x=...}"
*   ,       outs[2] = (%o4):  "{x=...}"

*
Corx.CompareMaxima( step1, step2 ) 
-> CM.Solve() -> CM.ExecuteMaxima( display2d:false; step1; step2 ) returns [x=...]
              -> CM.AbsCompare( [x=...] ) -> ExecuteMaxima( assume(pos,neg); solve(..x..) )
*****************************************************************************/

public static String SolveX( String step1, String variable1,
                             String step2, String variable2) 
                             throws MaximaTimeoutException, IOException       {
   String   out1  = null; String out2 = null; 
   String[] outs  = new String[3]; String[] ifCommand = new String[2];
   String[] steps = new String[3]; String[] rst       = new String[2];
   //cv.InitLogger(logger, "ConnectMaxima"+cv.TimeForName()+".txt");
   steps[1] = "display2d:false; " + step1 + ";";
   steps[2] = "display2d:false; " + step2 + ";";
   outs = ExecuteMaxima( steps ); //a
   out1 = LineOut( 2, outs[1] );
   out2 = LineOut( 4, outs[2] );
   ifCommand[1] = "if( " + out1 + " = " + out2 + " ) then 1 else 0;";

   //if abs function exist
   if ( outs[1].indexOf("abs(") >= 1 || outs[2].indexOf("abs(") >= 1 ) 
        rst[1] = AbsCompare( out1, variable1, out2, variable2 );
   else rst[1] = LineOut( 1, ExecuteMaxima( ifCommand )[1] );
   return rst[1];                                                             }

/*****************************************************************************
* Solve() is superceded by SolveX().  Solve() is kept here because it is still
* intertwined w/ Align.java & MultiAlign.java, possibly during a syq.  I don't
* have the time to test SolveX() w/ syq.
*****************************************************************************/

public static String  Solve(String inputmaxima) throws MaximaTimeoutException {
		String rst = null;
		
		System.out.println("Maxima nhan duoc:" + inputmaxima);
		//cv.InitLogger(logger, "ConnectMaxima"+cv.TimeForName()+".txt");
		MaximaConfiguration configuration = JacomaxSimpleConfigurator
				.configure();
		MaximaProcessLauncher launcher = new MaximaProcessLauncher(
				configuration);
		MaximaInteractiveProcess process = launcher.launchInteractiveProcess();
			
			rst = process.executeCall(inputmaxima);
			process.executeCall("quit();");
			process.terminate();
			process = null;
			configuration = null;
			launcher=null;

		return ExpectOutputMaxima(rst) ;
	}

/*****************************************************************************
* intent: compare solutions of step1 & step 2 when the solutions contains "abs"
* input : solutions sets of 2 steps{ x=..a., x=..b.. }, { x=..c., x=..d.. }
* output: 1 or 0
* notes : since Maxima has trouble w/ comparing sets having "abs", eg.
*              is( { abs(m), -abs(m) } = { m, -m } ) returns false
*         but Maxima works if we precede it w/ the command 
*              assume(m>0) ..compare..; assume(m<0) ..compare..
*         ideally we just want the compare to work using 
*              declare( m, real )
*         but this fails
*         We will only compare the case for abs_arg is positive, because 
*         what matters is that it takes on some value, not that the value 
*         needs to be positive or negative.
*
*         So we compose & run maxima command
*           set1: solve( step1 ); set2: solve( step2 )
*           if set1 or set2 have "abs":
*             assume( abs-arg > 0 ); display2d:false; 
*             r1p: map(ratsimp,set1); r2p: map(ratsimp,set2)
*             if ( r1p = r2p ) then 1 else 0; kill(all);
*
*a need kill(all), otherwise we are assume(xxx > 0 ) AND assume(xxx < 0 )
*  simultaneously, which results in "inconsistant".  We don't really need 
*  the second kill(all), but put it there for code appearance & symmetry.
*
* abbreviations: spn = solve-positive-negative, rpn = result-pos-neg
*
*b
weird, output capture is out-of-order:  ...(%o4)...(%o0)...(%i1)...
(%o1)                               [a > 0]
(%o2)       {x = (sqrt(b^2-4*a*c)-b)/(2*a),x = -(sqrt(b^2-4*a*c)+b)/(2*a)}}
(%o3)       {x = (sqrt(b^2-4*a*c)-b)/(2*a),x = -(sqrt(b^2-4*a*c)+b)/(2*a)}}
(%o4)                              (%o0)                                done
(%i1) 
*c desired command is 
*  assume(pos); display2d:false; 
*  r1p: map(ratsimp,step1); r2p: map(ratsimp,step2); 
*  if( r1p=r2p ) then 1 else 0; kill(all);
*****************************************************************************/
public static String AbsCompare(String step1, String variable1, 
                                 String step2, String variable2) 
       throws MaximaTimeoutException, IOException {
String[] spn = new String[3]; String[] rpn = new String[3];
   spn[1] = "assume("+buildAssumption(step1, variable1, step2, variable2)+"); display2d:false; " 
   +        "r1p: map( ratsimp, " + step1.toString() + " ); "
   +        "r2p: map( ratsimp, " + step2.toString() + " ); "
   +        "if( r1p = r2p ) then 1 else 0; kill(all);"; //a
   rpn = ExecuteMaxima( spn ); 
   rpn[1]  = LineOut( 5, rpn[1] ); //b
   
   System.out.println("AbsCompare step1:"+step1);
   System.out.println("AbsCompare step2:"+step2);
   
return rpn[1];                                                                }
/**
 * @throws Exception 
 * ***************************************************************************/
private static String buildAssumption(String step1, String variable1,
                                      String step2, String variable2)
                                            throws IOException                {
   String asptn = "";  
   List<String> lst1 = Utils.getFunctionArgument("abs",'(',')', step1, false);
   String[] vars1 = variable1.split(",");
   for (String arg : lst1)                                                    {
      existingVariableinAbsArg(arg, vars1);
      asptn += arg + ">0,";                                                   }

   List<String> lst2 = Utils.getFunctionArgument("abs",'(',')', step2, false);
   String[] vars2 = variable2.split(",");
   for (String arg : lst2)                                                   { 
      existingVariableinAbsArg(arg, vars2);
      if(!lst1.contains(arg)) asptn += arg + ">0,";                           }

   if(asptn.endsWith(","))asptn = asptn.substring(0, asptn.length()-1);
   return asptn;                                                              }
/*****************************************************************************/
/*
"We cannot check the correctness of your step because it leads to complicated abs( ) situations -- abs(..abs..), abs(..variable..) argument"
 */
private static void existingVariableinAbsArg(String argument, String[] vars)
      throws IOException                                                      {
String exception = "Sorry, we cannot check your correctness because it presents a case which we cannot handle: (a) nested abs(..abs(..)..)  or (b) abs(..x..) contains a variable... at the moment.";  
for (String var : vars)                                                       {
   if(argument.indexOf(var)!=-1 || argument.indexOf("abs")!=-1 )
      throw new IOException(exception);                                      }}
/*****************************************************************************/

/*
public static String AbsCompare_expire160701(String step1, String step2) throws MaximaTimeoutException {
String rst = ""; String[] spn = new String[3]; String[] rpn = new String[3];
String prefixP = "assume( a >   0 ); display2d:false; r1p: map( ratsimp, ";
String prefixN = "assume( a <=  0 ); display2d:false; r1n: map( ratsimp, ";
String midfixP = " ); r2p: map( ratsimp, ";
String midfixN = " ); r2n: map( ratsimp, ";
spn[1] = prefixP + step1.toString() + midfixP + step2.toString() + " ); ";
spn[2] = prefixN + step1.toString() + midfixN + step2.toString() + " ); ";
spn[1] = spn[1] +  "if( r1p = r2p ) then 1 else 0; kill(all);"; //a
spn[2] = spn[2] +  "if( r1n = r2n ) then 1 else 0; kill(all);"; //c
Align.WriteLog( "AbsCompare", "\nspn[1] = "+spn[1]+"\n"+"spn[2] = "+ spn[2] ); 
Align.WriteLog( "AbsCompare", "\nrpn[1] = "+rpn[1]+"\n"+"rpn[2] = "+ rpn[2] ); 

rpn = ExecuteMaxima( spn ); 

rpn[1]  = LineOut( 5, rpn[1] ); //b
rpn[2]  = LineOut( 5, rpn[2] );
rst  = (    rpn[1].equals("1") && rpn[2].equals("1")    ) ? "1" : "0";
return rst;  }
*/
/*****************************************************************************
* intent: 
* input : 
*****************************************************************************/
public static String[] ExecuteMaxima(String[] commands) throws MaximaTimeoutException {
String[] outs = new String[3];
try {
   MaximaConfiguration configuration = JacomaxSimpleConfigurator.configure();
   MaximaProcessLauncher launcher = new MaximaProcessLauncher(configuration);
   MaximaInteractiveProcess process = launcher.launchInteractiveProcess();
   for( int i=1; i<= commands.length -1; i++ )                              {
      Align.WriteLog( "ExecuteMaxima", "input "  + i + "\n" + commands[i] );
      if(commands[i] != null) outs[i] = process.executeCall( commands[i] );
      Align.WriteLog( "ExecuteMaxima", "output " + i + "\n" + outs[i] );  }
   process.executeCall("quit();");
   process.terminate();
   process = null;
   configuration = null;
   launcher=null;
} catch (Exception e) { Align.WriteLog( "AbsCompare", ""); 
    e.printStackTrace(); }
return outs;
}
/*****************************************************************************
* intent: 
* input : 
* output: 
*****************************************************************************/
/*
public static String  Solve_preSN(String inputmaxima) throws MaximaTimeoutException {
   String rst = null;
   Align.WriteLog( "Solve", "Maxima nhan duoc:" + inputmaxima);
   //cv.InitLogger(logger, "ConnectMaxima"+cv.TimeForName()+".txt");
   MaximaConfiguration configuration = JacomaxSimpleConfigurator.configure();
   MaximaProcessLauncher launcher = new MaximaProcessLauncher(configuration);
   MaximaInteractiveProcess process = launcher.launchInteractiveProcess();
   rst = process.executeCall(inputmaxima);
   Align.WriteLog( "Solve", "Maxima result: " + rst );
   process.executeCall("quit();");
   process.terminate();
   process = null;
   configuration = null;
   launcher=null;
   return ExpectOutputMaxima(rst) ;
}
*/
/*****************************************************************************
* intent: parse maxima output at line x
* input : line #, maxima response.  eg line = 2, maxima response is 
*    (%i1) display2d: false
*    (%o1) false
*    (%i2) solve(...)
*    (%o2) [ x = ... ]
*    (%i3) <waiting for next command>
* output: [ x = ... ] (the output we want spans from (%o2) -> (%i3)
*****************************************************************************/
/*
private static String LineOut_expired( int line, String rst ) {
String output = "";
int prompt = 4 + Integer.toString( line ).length(); // length of = "(%i#)"
int start = rst.indexOf( "(%o" + Integer.toString( line   ) + ")" ) + prompt; 
int end   = rst.indexOf( "(%i" + Integer.toString( line+1 ) + ")" );
if( start != -1 )  output = rst.substring( start, end ).trim();
return output;  }
*/
private static String LineOut( int line, String rst ) {
String output = "", prompt = "", tail = ""; int start, nextprompt; 
prompt = "(%o" + Integer.toString( line   ) + ")"; // "(%i#)"
start = rst.indexOf( prompt ) + prompt.length();
tail  = rst.substring( start, rst.length() );
nextprompt  = tail.indexOf( "(%" );
if( start != -1 )  output = tail.substring( 0, nextprompt ).trim();
return output;  }

}
/*****************************************************************************
* intent: extract desired maxima output
* input : maxima output, eg.
*         (%i1) assume( a >  0 ); display2d: false; r1p: setify(solve(..); if(..) then 1 else 0;
*         (%o1)                               [a > 0]
*         (%o2) false
*         (%o3) {x = (sqrt(b^2-4*a*c)-b)/(2*a),x = -(sqrt(b^2-4*a*c)+b)/(2*a)}
*         (%o4) [redundant]
*         (%o5) false
*         (%o6) {x = (sqrt(b^2-4*a*c)-b)/(2*a),x = -(sqrt(b^2-4*a*c)+b)/(2*a)}
*         (%o7) 1
*         (%i8) 
* output: last line of input, eg. "1"
*****************************************************************************/
/*
public static String clipMaximaDisplay2d( String input ) {
   String[] tokens =                     input.split( "\\(\\%o[0-9]\\)\\s" );
   String[] last   = tokens[ tokens.length-1 ].split( "\\(\\%i[0-9]\\)" );
   return [ tokens[3], tokens[6], last[0].trim() ]
   return last[0].trim(); }
}

   Align.WriteLog( "clipMaximaDisplay2d", "tokens = " + tokens.length );
   for (int i=0; i<= tokens.length - 1; i++ ) Align.WriteLog( "clipMaximaDisplay2d"
   ,   i + " = " + tokens[i] );
   Align.WriteLog( "clipMaximaDisplay2d", "last token = " + last[0].trim() );
*/
