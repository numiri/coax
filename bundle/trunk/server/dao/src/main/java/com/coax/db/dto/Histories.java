package com.coax.db.dto;
// Generated Mar 7, 2012 11:25:22 PM by Hibernate Tools 3.4.0.CR1


import java.util.Date;

/**
 * Historys generated by hbm2java
 */
/**
 * @author phuctq
 *Historys lưu thông tin các bước giải của sinh viên hay học sinh.Lớp được sinh bởi tool Hibernate
 */
public class Histories  implements java.io.Serializable {

	/**
	 * Field : id
	 */
	public final static String c_id         ="id";
	/**
	 * Field :exerciseId ;//
	 */
	public final static String c_exerciseId   ="exerciseId";
	/**
	 * Field :userId
	 */
	public final static String c_userId     ="userId";
    /**
     * Field :stepFrom
     */
    public final static String c_stepFrom   ="stepFrom";
    /**
     * Field :stepTo
     */
    public final static String c_stepTo     ="stepTo";
    /**
     * Field :result
     */
    public final static String c_result     = "result";
    /**
     * Field : stroke
     */
    public final static String c_stroke    = "stroke";    
    /**
     * Field : xmlRequet
     */
    public final static String  c_formula = "formula";
    /**
     * Field : status
     */
    public final static String c_status     = "status";
    /**
     * Field : action
     */
    public final static String c_action     ="action";    
    /**
     * Field :created_on
     */
    public final static String  c_created_on = "created_on";
    /**
     * Field :selectId
     */
    public final static String  c_sessionId = "sessionId";
    /**
     * Field : parentID
     */
    public final static String  c_parentID = "parentID";
    public final static String  c_image = "image";
    public final static String  c_version = "version";
    public final static String  c_isdelete = "isdelete";
    public final static String  c_proc_skipped = "proc_skipped";

    private String formula ="";
    private long id = 1;//formula
    private long exerciseId = 1;
    private Short stepFrom = 1;
    private short stepTo = 0;
    private boolean result = false;
    private String stroke = "";
    private Boolean status = false;
    private Short action =1;
    private Date createdOn;
    private long sessionId = 1;
    private long userId;
    private long parentID;
    private String image = "";
    private int version=0;
    private short isdelete;
    private String proc_skipped = "";
    
    public  short getIsDelete() { return this.isdelete; }
    public  void  setIsDelete( short isdelete ) { this.isdelete = isdelete; }
     
     /**
     * @param parentID :parentID nhận giá trị -1 khi dòng đó được xóa,hay sửa và mang giá trị mặc định của id tương ứng
     */
    public void setparentID(long parentID){
    	 this.parentID = parentID;
     }
     
     public long getParentID(){
    	 return this.parentID;
     }
     
     /**
     * @param userId :Lưu thông tin id của bảng Users.
     */
    public void setUserId(long userId){
    	 this.userId = userId;
     }
     
    public long getUserId() { return this.userId; }
    
     /**
     * @param selectId : Lưu id của bài tập được chọn
     */
    public void setSessionId(long sessionId){
    	 this.sessionId = sessionId;
     }
     
     public long getSessionId(){
    	 return this.sessionId;
     }
     
     /**
     * @param formula :Lưu giá trị latex được trả về
     */
    public void setformula(String formula){
    	 this.formula = formula.replaceAll("\"","'");
     }
     
     public String getformula(){
    	 return this.formula;
     }
     
     public Histories() {
    	 
     }

	
    public Histories(long id, long selectId, short stepTo, boolean result, String stroke, Date createdOn) {
        this.id = id;
        this.exerciseId = selectId;
        this.stepTo = stepTo;
        this.result = result;
        this.stroke = stroke;
        this.createdOn = createdOn;
    }
    public Histories(long id, long selectId, Short stepFrom, short stepTo, boolean result, String stroke, Boolean status, Short action, Date createdOn) {
       this.id = id;
       this.exerciseId = selectId;
       this.stepFrom = stepFrom;
       this.stepTo = stepTo;
       this.result = result;
       this.stroke = stroke;
       this.status = status;
       this.action = action;
       this.createdOn = createdOn;
    }
   
    public long getId() {
        return this.id;
    }
    
    /**
     * @param id : id của historys
     */
    public void setId(long id) {
        this.id = id;
    }
    public long getExerciseId() {
        return this.exerciseId;
    }
    
    /**
     * @param selectId : Id của bảng select_exercise
     */
    public void setExerciseId(long selectId) {
        this.exerciseId = selectId;
    }
    public Short getStepFrom() {
        return this.stepFrom;
    }
    
    /**
     * @param stepFrom :Bước bắt đầu của bài tập
     */
    public void setStepFrom(Short stepFrom) {
        this.stepFrom = stepFrom;
    }
    public short getStepTo() {
        return this.stepTo;
    }
    
    /**
     * @param stepTo :đến bước thứ ...
     */
    public void setStepTo(short stepTo) {
        this.stepTo = stepTo;
    }
    
    /**
     * @return :Bước giải đó đúng là true,sai là false
     */
    public boolean getResult() {
        return this.result;
    }
    
    public void setResult(boolean result) {
        this.result = result;
    }
    public String getstroke() {
        return this.stroke;
    }
    
    /**
     * @param stroke : Lưu trữ định dạng xml của các points
     */
    public void setstroke(String stroke) {
        this.stroke = stroke.replaceAll("\"","'");
    }
    /**
     * @return :
     */
    public Boolean getStatus() {
        return this.status;
    }
    
    public void setStatus(Boolean status) {
        this.status = status;
    }
    public Short getAction() {
        return this.action;
    }
    
    /**
     * @param action : mang các giá trị 1,2,3.1 là thêm mới,2 là sửa,3 là delete
     */
    public void setAction(Short action) {
        this.action = action;
    }
    /**
     * @return
     */
    public Date getCreatedOn() {
        return this.createdOn;
    }
    
    public void setCreatedOn(Date createdOn) {
        this.createdOn = createdOn;
    }
    
    
    
    /**
     * @return :Tạo kiểu json trả về cho client xử lý
     */
    public String jsonObject(){
		StringBuilder sBuilder = new StringBuilder();
		sBuilder.append("{ \""+ Histories.c_id + "\":\"" + this.getId() +"\",");
		sBuilder.append(" \""+ Histories.c_stroke + "\":\"" + this.stroke.replaceAll("\"", "'") +"\",");
		sBuilder.append(" \""+ Histories.c_result + "\":\"" + this.result +"\",");
		sBuilder.append(" \""+ Histories.c_exerciseId + "\":\"" + this.exerciseId +"\",");		
		sBuilder.append(" \""+ Histories.c_stepFrom + "\":\"" + this.stepFrom +"\",");
		sBuilder.append(" \""+ Histories.c_stepTo + "\":\"" + this.stepTo +"\",");
		sBuilder.append(" \""+ Histories.c_image + "\":\"" + this.image +"\"");
                sBuilder.append(" \""+ Histories.c_version + "\":\"" + this.version +"\"");
		sBuilder.append(" \""+ Histories.c_sessionId + "\":\"" + this.sessionId +"\"");
		sBuilder.append(" \""+ Histories.c_created_on + "\":\"" + this.createdOn +"\"");//sessionId
		sBuilder.append("}");
		return sBuilder.toString();
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

    /**
     * @return the version
     */
    public int getVersion() {
        return version;
    }

    /**
     * @param version the version to set
     */
    public void setVersion(int version) {
        this.version = version;
    }
   public String getProc_skipped() {
      return proc_skipped;
   }
   public void setProc_skipped(String proc_skipped) {
      this.proc_skipped = proc_skipped;
   }
}
