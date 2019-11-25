/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dto;

/**
 *
 * @author cz
 */
public class Score {

    public final static String c_userid = "userid";
    public final static String c_exerid = "exerid";
    public final static String c_status = "status";
    public final static String c_redo_counts = "redo_counts";
    private int exerid;
    private int userid;
    private int status;
    private int redoCounts;

    public Score() {
    }

    public Score( int userid,int exerid, int status, int redocounts) {
        this.exerid = exerid;
        this.userid = userid;
        this.status = status;
       this.redoCounts = redocounts;
    }

    /**
     * @return the exerid
     */
    public int getExerid() {
        return exerid;
    }

    /**
     * @param exerid the exerid to set
     */
    public void setExerid(int exerid) {
        this.exerid = exerid;
    }

    /**
     * @return the userid
     */
    public int getUserid() {
        return userid;
    }

    /**
     * @param userid the userid to set
     */
    public void setUserid(int userid) {
        this.userid = userid;
    }

    /**
     * @return the status
     */
    public int getStatus() {
        return status;
    }

    /**
     * @param status the status to set
     */
    public void setStatus(int status) {
        this.status = status;
    }

    /**
     * @return the redoCounts
     */
    public int getRedoCounts() {
        return redoCounts;
    }

    /**
     * @param redoCounts the redoCounts to set
     */
    public void setRedoCounts(int redoCounts) {
        this.redoCounts = redoCounts;
    }
}
