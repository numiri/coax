/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.common.Cli;

/**
 * Store infomation activemath.
 *
 * @author wooinv
 */
public class ActiveMathInfo {

    private String userAm;
    private int InputPostion;
    private String amExerciseId;
    private String hint;
    private boolean checkHint;
    private String title = "";
    public ActiveMathInfo(String useram, int inputpostion, String amexerciseid) {
        this.InputPostion = inputpostion;
        this.amExerciseId = amexerciseid;
        this.userAm = useram;
    }
    
    public ActiveMathInfo(String useram, int inputpostion, String amexerciseid,String hint) {
        this.InputPostion = inputpostion;
        this.amExerciseId = amexerciseid;
        this.userAm = useram;
        this.hint = hint;
    }

    public ActiveMathInfo(String useram, int inputpostion, String amexerciseid,String hint,String title) {
        this.InputPostion = inputpostion;
        this.amExerciseId = amexerciseid;
        this.userAm = useram;
        this.hint = hint;
        this.title = title;
    }
    /**
     * @return the userAm User activemath.
     */
    public String getUserAm() {
        return userAm;
    }

    /**
     * @param userAm User activemath.
     */
    public void setUserAm(String userAm) {
        this.userAm = userAm;
    }

    /**
     * @return activemath.
     */
    public int getInputPostion() {
        return InputPostion;
    }

    /**
     * @param activemath.
     */
    public void setInputPostion(int InputPostion) {
        this.InputPostion = InputPostion;
    }

    /**
     * @return id activemath.
     */
    public String getAmExerciseId() {
        return amExerciseId;
    }

    /**
     * @param amExerciseId activemath.
     */
    public void setAmExerciseId(String amExerciseId) {
        this.amExerciseId = amExerciseId;
    }

    @Override
    public String toString() {
        return "user AM: " + this.userAm + "\r idam: " + this.amExerciseId + "\r position: " + this.InputPostion;
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
     * @return the checkHint
     */
    public boolean isCheckHint() {
        if (this.getHint().trim().equals("true")) {
            this.setCheckHint(true);
        } else {
            this.setCheckHint(false);
        }
        return checkHint;
    }

    /**
     * @param checkHint the checkHint to set
     */
    private void setCheckHint(boolean checkHint) {
        this.checkHint = checkHint;
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
}
