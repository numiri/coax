/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.common.Cli;

import com.hp.hpl.jena.graph.query.Util;

/**
 *
 * @author ag
 */
public class WriteLogClient {

    private String username;
    private String exerid;
    private String action;
    private String exception;
    private String ip;

    /**
     * @return the username
     */
    public String getUsername() {
        return username;
    }

    /**
     * @param username the username to set
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return the exerid
     */
    public String getExerid() {
        return exerid;
    }

    /**
     * @param exerid the exerid to set
     */
    public void setExerid(String exerid) {
        this.exerid = exerid;
    }

    /**
     * @return the action
     */
    public String getAction() {
        return action;
    }

    /**
     * @param action the action to set
     */
    public void setAction(String action) {
        this.action = action;
    }

    /**
     * @return the exception
     */
    public String getException() {
        return exception;
    }

    /**
     * @param exception the exception to set
     */
    public void setException(String exception) {
        this.exception = exception;
    }

    /**
     * @return the ip
     */
    public String getIp() {
        return ip;
    }

    /**
     * @param ip the ip to set
     */
    public void setIp(String ip) {
        this.ip = ip;
    }

    public void WriteLog() {
        String logname = "log-" + this.getUsername() + Utils.getCurrentdate() + ".txt";
        String content = Utils.getCurrentTime() + ":" + this.getExerid() + "-" + this.getAction() + "-" + this.getException() +"\r\n";
        Utils.WriteClient(logname, content);
    }
    
    public boolean DeleteLog()
    {
        String logname = "log-" + this.getUsername() + Utils.getCurrentdate() + ".txt";
       return Utils.DeleteFile(logname);
    }
}
