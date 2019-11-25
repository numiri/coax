package com.coax.db.dto;
import java.sql.*;

public class ChildrenHistorys {
	
	public final static String c_id         ="id";	
    public final static String c_stepFrom   ="stepFrom";
    public final static String c_stepTo     ="stepTo";
    public final static String c_latex     = "latex";
    public final static String c_fileXML    = "fileXML";    
    public final static String c_historyId    = "historyId";
    public final static String c_action     ="action";    
    public final static String  c_create_on = "create_on";
    
    private long id         = 1;	
    private Short stepFrom   = 1;
    private Short stepTo     = 1;
    private String latex     = "";
    private String fileXML    = "";    
    private long historyId    = 1;
    private Short action     = 1;    
    private Date  create_on = null;
    
    public void setCreate_on(Date create_on){
    	this.create_on = create_on;
    }
    
    public Date getCreate_on(){
    	return this.create_on;
    }
    public void setAction(Short action){
    	this.action = action;
    }
    
    public Short getAction(){
    	return this.action;
    }
    
    public void setHistoryId(long historyId){
    	this.historyId = historyId;
    }
    
    public long getHistoryId(){
    	return this.historyId;
    }
    
    public void setFileXml(String filexml){
    	this.fileXML = filexml;
    }
    public String getFileXml(){
    	return this.fileXML;
    }
    public void setId(long id){
    	this.id = id;
    }
    
    public long getId(){
    	return this.id;
    }
    
    public void setStepFrom(Short stepFrom){
    	this.stepFrom = stepFrom;
    }
    
    public Short getStepFrom(){
    	return this.stepFrom;
    }
    
    public void setLatex(String latex){
    	this.latex = latex;
    }
    
    public String getLatex(){
    	return this.latex;
    }
    
    public String jsonObject(){
    	StringBuilder sBuilder = new StringBuilder();
    	return sBuilder.toString();
    }
    
}
