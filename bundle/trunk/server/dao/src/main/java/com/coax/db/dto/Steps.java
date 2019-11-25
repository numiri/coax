package com.coax.db.dto;
import java.sql.Date;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import java.util.*;
import java.io.*;
/**
 * @author phuctq
 *Chứa thông tin các bước giải của bài toán
 */
public class Steps {
	
	public Steps(){
		
	}
	
	/**
	 * Field :id
	 */
	public final static String c_Id = "id";
	/**
	 * Field :idExercise id của Exercise
	 */
	public final static String c_idExercise = "idExercise";
	/**
	 * Field :step bước giải
	 */
	public final static String c_step = "step";
	/**
	 * Field : latex chứa chuỗi latex
	 */
	public final static String c_latex = "latex";
	/**
	 * Field : mesage  hiện thị câu thông báo đã giải sai bước đó
	 */
	public final static String c_message = "message";
	/**
	 * Field : result
	 */
	public final static String c_result = "result";
	/**
	 * 
	 */
	public final static String c_created_on = "created_on";
	/**
	 * Field :mesageTrue  hiện thị câu thông báo đã giải đúng bước đó
	 */
	public final static String c_messageTrue = "messageTrue";
	public final static String c_finish = "finish";
	//messageTrue
	
	private long id = 1;
	private long idExercise = 1;
	private int step = 1;
	private  String latex = "";
	private  String message = "";
	private  boolean result = false;
	private  Date created_on = null;
	private  String messageTrue = "";
	private String finish = "";
	public void Setfinish(String finsh){
		this.finish = finsh;
	}
	
	public String getFinish(){
		return this.finish;
	}
	
	public void setId(long id){
		this.id = id;
	}
	
	public void setMessageTrue(String messageTrue){
		this.messageTrue = messageTrue;
	}
	
	public String getMessageTrue(){
		return this.messageTrue;
	}
	
	public void setIdExercise(long idExercise){
		this.idExercise = idExercise;
	}
	
	public void setStep(int step){
		this.step = step;
	}
	
	public void setLatex(String latex){
		this.latex = latex;
	}
	
	public void setMessage(String message){
		this.message = message;
	}
	
	public void setResult(boolean result){
		this.result = result;
	}
	
	public void setCreated_on(Date create_on){
		this.created_on = create_on;
	}
	
	public long getId(){
		return this.id;
	}
	
	public long getIdExercise(){
		return this.idExercise;
	}
	
	public int getStep(){
		return this.step;
	}
	
	public String getLatex(){
		return this.latex ;
	}
	
	public String getMessage(){
		return this.message;
	}
	
	public boolean getResult(){
		return this.result;
	}
	
	public Date getCreated_on(){
		return this.created_on;
	}
	
	public String toString(){
		String s ="";
		return s;
	}
	
	/**
	 * @return :Trả về định dạng kiểu xml
	 */
	public String formXML(){		
		StringBuilder sBuilder = new StringBuilder();
		sBuilder.append("\r\t<Exercise idExp=\""+ this.getIdExercise() + "\" " );
		sBuilder.append("stepExp=\""+this.step+"\"" + " latexExercise =\"" + this.getLatex() +"\" ");
		sBuilder.append(" " + Steps.c_finish + "=\"" + this.finish + "\" ");
		sBuilder.append(" message=\"" + this.getMessage() + "\" ");
		sBuilder.append("messagetrue=\"" + this.getMessageTrue() + "\">\r");
		sBuilder.append( "\t</Exercise>");
		return sBuilder.toString();
	}
	
	/**
	 * @return :Định dạng liểu json gửi về phía client xử lý
	 */
	public String jsonObject(){
		StringBuilder sBuilder = new StringBuilder();
		sBuilder.append("{ \""+ Steps.c_Id + "\":\"" + this.getId() +"\",");
		sBuilder.append(" \""+ Steps.c_idExercise + "\":\"" + this.idExercise +"\",");
		sBuilder.append(" \""+ Steps.c_latex + "\":\"" + this.latex +"\",");
		sBuilder.append(" \""+ Steps.c_message + "\":\"" + this.message +"\",");
		sBuilder.append(" \""+ Steps.c_messageTrue + "\":\"" + this.messageTrue +"\",");
		sBuilder.append(" \""+ Steps.c_step + "\":\"" + this.step +"\"");
		sBuilder.append("}");
		return sBuilder.toString();
	}
}
