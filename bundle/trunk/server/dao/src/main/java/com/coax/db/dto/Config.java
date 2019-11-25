package com.coax.db.dto;
// Generated Mar 7, 2012 11:25:22 PM by Hibernate Tools 3.4.0.CR1


import java.util.Date;

/**
 * Config được sinh ra bởi hibernate.Các field thì được tạo thủ công
 */
public class Config  implements java.io.Serializable {


	/**
	 * Tương ứng với field trong cơ sở dữ liệu
	 */
	/**
	 * field :id
	 */
	public final static String c_Id = "Id";
	/**
	 * Field :name
	 */
	public final static String c_name = "name";
	/**
	 * Field :value
	 */
	public final static String c_value = "value";
	/**
	 * Field : description
	 */
	public final static String c_description = "description";
	/**
	 * Field :active
	 */
	public final static String c_active = "active";
	/**
	 * Field :created_on
	 */
	public final static String c_created_on = "created_on";
	
     private int id;
     private String name;
     private String value;
     private String description;
     private boolean active;
     private Date createdOn;

    public Config() {
    	
    }

	
    /**
     * @param id :truyền vào Id
     * @param value :Truyền vào giá trị
     * @param active:truyền vào active giá trị true hay false
     */
    public Config(int id, String value, boolean active) {
        this.id = id;
        this.value = value;
        this.active = active;
    }
    /**
     * @param id
     * @param name
     * @param value
     * @param description
     * @param active
     * @param createdOn
     */
    public Config(int id, String name, String value, String description, boolean active, Date createdOn) {
       this.id = id;
       this.name = name;
       this.value = value;
       this.description = description;
       this.active = active;
       this.createdOn = createdOn;
    }
   
    /**
     * @return :Trả về id của đối tượng
     */
    public int getId() {
        return this.id;
    }
    
    /**
     * @param id:truyền vào id của đối tượng khi thực hiện câu truy vấn.cho update,delete,select
     */
    public void setId(int id) {
        this.id = id;
    }
    /**
     * @return :Trả về tên của đối tượng
     */
    public String getName() {
        return this.name;
    }
    
    /**
     * @param name:Truyền vào 1 tên.Dùng để insert,update
     */
    public void setName(String name) {
        this.name = name;
    }
    /**
     * @return
     */
    public String isValue() {
        return this.value;
    }
    
    /**
     * @param value :truyền giá trị 1 hay 0 hay chiều cao,độ rộng của field vào để thực hiện insert hay update
     */
    public void setValue(String value) {
        this.value = value;
    }
    /**
     * @return:trả thông tin mô tả của dòng dữ liệu đó để làm gì
     */
    public String getDescription() {
        return this.description;
    }
    
    /**
     * @param description :truyền thông tin mô tả của dòng dữ liệu đó để làm gì
     */
    public void setDescription(String description) {
        this.description = description;
    }
    /**
     * @return
     */
    public boolean isActive() {
        return this.active;
    }
    
    /**
     * @param active :truyền vào true thì dòng dữ liệu này được chép qua bảng setting ngược lại thì không chép qua bảng setting
     */
    public void setActive(boolean active) {
        this.active = active;
    }
    /**
     * @return
     */
    public Date getCreatedOn() {
        return this.createdOn;
    }
    
    /**
     * @param createdOn:Ngày mà thêm mới record vào dữ liệu
     */
    public void setCreatedOn(Date createdOn) {
        this.createdOn = createdOn;
    }
    
    /**
     * @return :Đối tượng được định nghĩa kiểu json để thực hiện cho web.Dùng javascript xử lý
     */
    public String jsonObject(){
		StringBuilder sBuilder = new StringBuilder();
		sBuilder.append("{ \""+ Config.c_Id + "\":\"" + this.getId() +"\",");
		sBuilder.append(" \""+ Config.c_name + "\":\"" + this.name +"\",");
		sBuilder.append(" \""+ Config.c_description + "\":\"" + this.description +"\",");
		sBuilder.append(" \""+ Config.c_value + "\":\"" + this.isValue() +"\",");
		sBuilder.append(" \""+ Config.c_active + "\":\"" + this.isActive() +"\",");
		sBuilder.append(" \""+ Config.c_created_on + "\":\"" + this.createdOn +"\"");
		sBuilder.append("}");
		return sBuilder.toString();
	}
    
    /**
     * @return :Định dạng theo kiểu cấu trúc xml để gửi lên Client xử lý
     */
    public String getXml(){
    	StringBuilder sBuilder = new StringBuilder();
		sBuilder.append("<" + Config.c_Id + " >" + this.getId() + "</" + Config.c_Id + " >");
		sBuilder.append(" \""+ Config.c_name + "\":\"" + this.name +"\",");
		sBuilder.append(" \""+ Config.c_description + "\":\"" + this.description +"\",");
		sBuilder.append(" \""+ Config.c_value + "\":\"" + this.isValue() +"\",");
		sBuilder.append(" \""+ Config.c_active + "\":\"" + this.isActive() +"\",");
		sBuilder.append(" \""+ Config.c_created_on + "\":\"" + this.createdOn +"\"");
		sBuilder.append("}");
		return sBuilder.toString();
    }
}


