package com.coax.common.Cli;

import java.util.LinkedList;

class Expression {

    PreLatex maxima;
    String ContentDat;
    String guid;
    LinkedList<Latex> latexs;
    String latex;
    String pngpath;
    String variable;
    LinkedList<String> symbols;
    boolean hasEqual;
    boolean hasAnyEqual;
    String latexStep;
    String message;
    String messageTrue;
    boolean finish;
    private String messageFinish;

    public String getLatexStep() {
        return latexStep;
    }

    public void setLatexStep(String latexStep) {
        this.latexStep = latexStep;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessageTrue() {
        return messageTrue;
    }

    public void setMessageTrue(String messageTrue) {
        this.messageTrue = messageTrue;
    }

    public boolean isResultStep() {
        String latex = this.getLatex();
        String latexStep = this.getLatexStep();
        if (latex == null
                || latexStep == null) {
            return false;
        } else {
            latex = latex.trim();
            latex = latex.replace("$", "");
            latex = latex.replaceAll("\\s+", "");

            latexStep = latexStep.trim();
            latexStep = latexStep.replace("$", "");
            latexStep = latexStep.replaceAll("\\s+", "");

            if (latex.compareTo(latexStep) == 0) {
                return true;
            } else {
                return false;
            }
        }

    }

    public String Message() {
        if (isResultStep()) {
            return getMessageTrue();
        } else {
            return getMessage();
        }
    }

    public Expression(PreLatex maxima, String contentDat, String guid,
            LinkedList<Latex> latexs, String latex, String pngpath,
            String variable, LinkedList<String> symbols, boolean hasEqual,
            boolean hasAnyEqual) {
        super();
        this.maxima = maxima;
        ContentDat = contentDat;
        this.guid = guid;
        this.latexs = latexs;
        this.latex = latex;
        this.pngpath = pngpath;
        this.variable = variable;
        this.symbols = symbols;
        this.hasEqual = hasEqual;
        this.hasAnyEqual = hasAnyEqual;
    }

    public boolean isHasAnyEqual() {
        return hasAnyEqual;
    }

    public void setHasAnyEqual(boolean hasAnyEqual) {
        this.hasAnyEqual = hasAnyEqual;
    }

    public boolean isHasEqual() {
        return hasEqual;
    }

    public void setHasEqual(boolean hasEqual) {
        this.hasEqual = hasEqual;
    }

    public LinkedList<String> getSymbols() {
        return symbols;
    }

    public void setSymbols(LinkedList<String> symbols) {
        this.symbols = symbols;
    }

    public String getVariable() {
        return variable;
    }

    public void setVariable(String variable) {
        this.variable = variable;
    }

    public String getPngpath() {
        return pngpath;
    }

    public void setPngpath(String pngpath) {
        this.pngpath = pngpath;
    }

    public Expression(String guid, PreLatex maxima, LinkedList<Latex> latexs,
            String contentDat, String variable, boolean hasEqual,
            boolean hasAnyEqual) {
        super();
        this.guid = guid;
        this.maxima = maxima;
        this.latexs = latexs;
        ContentDat = contentDat;
        this.variable = variable;
        this.hasEqual = hasEqual;
        this.hasAnyEqual = hasAnyEqual;
    }

    public String getLatex() {
        return latex;
    }

    public void setLatex(String latex) {
        this.latex = latex;
    }

    public LinkedList<Latex> getLatexs() {
        return latexs;
    }

    public void setLatexs(LinkedList<Latex> latexs) {
        this.latexs = latexs;
    }

    public Expression(String guid, PreLatex maxima, String contentDat) {
        super();
        this.guid = guid;
        this.maxima = maxima;
        this.ContentDat = contentDat;
    }

    public Expression(String guid, PreLatex maxima, LinkedList<Latex> latexs,
            String contentDat) {
        super();
        this.guid = guid;
        this.maxima = maxima;
        this.latexs = latexs;
        ContentDat = contentDat;
    }

    public PreLatex getMaxima() {
        return maxima;
    }

    public void setMaxima(PreLatex maxima) {
        this.maxima = maxima;
    }

    public String getContentDat() {
        return ContentDat;
    }

    public void setContentDat(String contentDat) {
        ContentDat = contentDat;
    }

    public String getGuid() {
        return guid;
    }

    public void setGuid(String guid) {
        this.guid = guid;
    }

    /**
     * @return the finish
     */
    public boolean isFinish() {
        if (!getMessageFinish().equals("") && isResultStep() == true) {
           return true;
        } else {
           return false;
        }
    }

    /**
     * @return the messageFinish
     */
    public String getMessageFinish() {
        return messageFinish;
    }

    /**
     * @param messageFinish the messageFinish to set
     */
    public void setMessageFinish(String messageFinish) {
        this.messageFinish = messageFinish;
    }
}
