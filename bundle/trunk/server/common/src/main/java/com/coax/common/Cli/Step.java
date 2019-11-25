/******************************************************************************
* intent: describes a single step, which has { order, Fraz[] }
*
* Formerly called Expression.java
* if the exercise is syq, it has a list of latexs
******************************************************************************/
package com.coax.common.Cli;
import java.util.LinkedList;
public class Step {

/*****************************************************************************
* data
*****************************************************************************/
public LinkedList<Fraz> frazs = null;
public String order = "";
boolean hasEqual = false;
boolean hasAnyEqual = false;

/*****************************************************************************
* constructors
*****************************************************************************/
// public void Step( ) { this.order = 0; }
// public void Step( String xml ) {}
public Step( LinkedList<Fraz> frazs, String order ) {
   this.frazs = frazs; this.order= order;     }

    //symbol  : constructor Step(java.util.LinkedList<com.coax.common.Cli.Fraz>,int)

/*****************************************************************************
* intent:  aggragate frazs into a list of strings, ignoring variables
*****************************************************************************/
public String condenseFrazs2S()           {
String condensed = null;
for ( int i=0; i < this.frazs.size(); i++ )
    condensed = condensed + this.frazs.get(i).fraz;
return condensed;                                                              }

/*******************************************************************************
*
     * Kiem tra danh sach chuoi maxima do snuggtex phan tich co the gui toi
     * maxima kiem tra duoc khong.
     *
     * @param maximas
     * @return true neu hop le, nguoc lai false.
*******************************************************************************/

public boolean IsValidFrazs() {
    for (int i = 0; i < frazs.size(); i++)         {
        String fraz = frazs.get(i).fraz;
        if (ValidateFraz(fraz)) return false;    }
    return true;                                     }
private static boolean ValidateFraz(String fraz) {
    String cEmpty = "";
    System.out.println("ValidateFraz >>gia tri fraz:" + fraz + "*");
    if (fraz == null) {            return true;        }
    boolean result = fraz.contains("operator") || fraz.contains("null")
            || fraz.trim().equals(cEmpty) ? true : false;
    return result;
}

}
/*
LinkedList<Latex> latexs;     LinkedList<String> symbols;
String variable;  String latex;
PreLatex maxima;  String ContentDat;   String guid;     String pngpath;      
boolean hasEqual; boolean hasAnyEqual; String latexStep;
String message;   String messageTrue;  boolean finish;
private String messageFinish;

public boolean isResultStep() {
String latex = this.getLatex();
String latexStep = this.getLatexStep();
if (latex == null || latexStep == null) { return false; } 
else {
    latex = latex.trim().replace("$", "").replaceAll("\\s+", "");
    latexStep = latexStep.trim().replace("$", "").replaceAll("\\s+", "");
    if (latex.compareTo(latexStep) == 0) return true;
    else                                 return false;        }}

public String Message() {
    if (isResultStep()) return getMessageTrue();
    else                return getMessage(); }

public boolean isFinish() {
if (!getMessageFinish().equals("") && isResultStep() == true) return true; 
else                                                          return false; }

public Expression(PreLatex maxima, String contentDat, String guid,
        LinkedList<Latex> latexs, String latex, String pngpath,
        String variable, LinkedList<String> symbols, boolean hasEqual,
        boolean hasAnyEqual) {
    super();
    this.latexs = latexs;           this.guid = guid;
    this.pngpath = pngpath;         this.latex = latex;
    this.variable = variable;       this.symbols = symbols;
    this.hasEqual = hasEqual;       this.maxima = maxima;
    this.hasAnyEqual = hasAnyEqual; ContentDat = contentDat; }

public Expression(String guid, PreLatex maxima, LinkedList<Latex> latexs,
        String contentDat, String variable, boolean hasEqual,
        boolean hasAnyEqual) {
    super();
    this.guid = guid;
    this.variable = variable;       this.latexs = latexs;
    this.hasEqual = hasEqual;       this.maxima = maxima;
    this.hasAnyEqual = hasAnyEqual; ContentDat = contentDat;
}
public Expression(String guid, PreLatex maxima, String contentDat) {
    super();                        this.guid = guid;
    this.ContentDat = contentDat;   this.maxima = maxima;
}
public Expression(String guid, PreLatex maxima, LinkedList<Latex> latexs,
        String contentDat) {
    super();
    this.guid = guid;
    this.maxima = maxima;
    this.latexs = latexs;
    ContentDat = contentDat;
}
public String getMessageFinish() { return messageFinish; }
public void setMessageFinish(String messageFinish) { this.messageFinish = messageFinish; }
public String getLatexStep() { return latexStep; }
public void setLatexStep(String latexStep) { this.latexStep = latexStep; }
public String getMessage() { return message; }
public void setMessage(String message) { this.message = message; }
public String getMessageTrue() { return messageTrue; }
public void setMessageTrue(String messageTrue) { this.messageTrue = messageTrue; }
public boolean isHasAnyEqual() { return hasAnyEqual; }
public void setHasAnyEqual(boolean hasAnyEqual) { this.hasAnyEqual = hasAnyEqual; }
public boolean isHasEqual() { return hasEqual; }
public void setHasEqual(boolean hasEqual) { this.hasEqual = hasEqual; }
public LinkedList<String> getSymbols() { return symbols; }
public void setSymbols(LinkedList<String> symbols) { this.symbols = symbols; }
public String getVariable() { return variable; }
public void setVariable(String variable) { this.variable = variable; }
public String getPngpath() { return pngpath; }
public void setPngpath(String pngpath) { this.pngpath = pngpath; }
public String getLatex() { return latex; }
public void setLatex(String latex) { this.latex = latex; }
public LinkedList<Latex> getLatexs() { return latexs; }
public void setLatexs(LinkedList<Latex> latexs) { this.latexs = latexs; }
public PreLatex getMaxima() { return maxima; }
public void setMaxima(PreLatex maxima) { this.maxima = maxima; }
public String getContentDat() { return ContentDat; }
public void setContentDat(String contentDat) { ContentDat = contentDat; }
public String getGuid() { return guid; }
public void setGuid(String guid) { this.guid = guid; }

}
*/
