/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * 
 * intent:  to return the xml data, for example
 *     <activemath description="Giai phuong trinh bac nhat don gian x- 2 = -2x+7."  
 *     isfinish="false"  title="" hint=""></activemath>
 * 
 */
package com.coax.activemath;

import com.coax.common.Cli.Utils;

/**
 *
 * @author phuctq
 */
public class ActiveMath {
    
    public final static String c_hint = "hint";
    public final static String c_title = "title";
    public final static String c_description = "description";
    public final static String c_isfinish = "isfinish";
    public final static String c_step = "step";
    public final static String c_istrue = "istrue";
    public final static String c_message = "message";
    private int step = 0;
    private boolean istrue = true;
    private String hint = "";
    private String title = "";
    private String description = "";
    private String message = "";
    private boolean isfinish = false;
    public ActiveMath(){
        hint = "";
        title = "";
        description = "";
        isfinish = false;
        message = "";
    }

    /**
     * @return the hint
     */
    public String getHint() {
        return hint;
    }

    /**
     * @param hint the hint to set
     */
    public void setHint(String hint) {
        this.hint = hint;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the isfinish
     */
    public boolean isIsfinish() {
        return isfinish;
    }

    /**
     * @param isfinish the isfinish to set
     */
    public void setIsfinish(boolean isfinish) {
        this.isfinish = isfinish;
    }
    
    public String Objson(){
        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("{ \""+ ActiveMath.c_description + "\":\"" + this.description +"\",");
	sBuilder.append(" \""+ ActiveMath.c_hint + "\":\"" + this.hint.replaceAll("\"", "'") +"\",");		
	sBuilder.append(" \""+ ActiveMath.c_isfinish + "\":\"" + this.isfinish +"\",");
	sBuilder.append(" \""+ ActiveMath.c_title + "\":\"" + this.title +"\"");
	sBuilder.append("}");
        return sBuilder.toString();
    }
    
    public String ObjXml(){
        StringBuilder sBuilder = new StringBuilder();
	sBuilder.append("<activemath " + ActiveMath.c_description + "=\""+ this.description + "\" " );	
	sBuilder.append(" " + ActiveMath.c_isfinish + "=\"" + this.isfinish + "\" ");
	sBuilder.append(" " + ActiveMath.c_title + "=\"" + this.title.replaceAll("\"", "'") + "\" ");
        sBuilder.append(" " + ActiveMath.c_istrue + "=\"" + this.istrue + "\" ");
        sBuilder.append(" " + ActiveMath.c_step + "=\"" + this.getStep() + "\" ");
        sBuilder.append(" " + ActiveMath.c_message + "=\"" + this.getMessage().replaceAll("\"", "'") + "\" ");
	sBuilder.append("" + ActiveMath.c_hint + "=\"" + this.hint.replaceAll("\"", "'") + "\">");
	sBuilder.append( "</activemath>");
        return sBuilder.toString();
    }

    /**
     * @return the step
     */
    public int getStep() {
        return step;
    }

    /**
     * @param step the step to set
     */
    public void setStep(int step) {
        this.step = step;
    }

    /**
     * @return the istrue
     */
    public boolean getIstrue() {
        return istrue;
    }
    /**
     * @param istrue the istrue to set
     */
    public void setIstrue(boolean istrue) {
        this.istrue = istrue;
    }

    /**
     * @return the answer
     */
    public String getMessage() {
        return message;
    }

    /**
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }
}
