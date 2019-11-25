
package com.coax.db.dto;
import java.util.Date;

public class Folder {
    /**
	 * field :id
	 */
	public static String c_Id = "id";
	/**
	 * Field :name
	 */
	public static String c_name = "name";
	/**
	 * Field :parent
	 */
	public static String c_parent = "parentId";
	/**
	 * Field : description
	 */
	public static String c_description = "description";
	/**
	 * Field :rowId
	 */
        public static String c_rowGuid = "rowGuid";
        /**
	 * Field :rowId
	 */
        public static String c_userId = "userId";
        /**
	 * Field :rowId
	 */
        public static String c_isDelete = "isDelete";//isFolder
        
        protected long id;
        protected String name;
        protected long parent ;
        protected String description;
        protected boolean isDelete;
        protected String rowGuid;
        protected long userId;

    /**
     * @return the id
     */
    public long getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(long id) {
        this.id = id;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the parent
     */
    public long getParent() {
        return parent;
    }

    /**
     * @param parent the parent to set
     */
    public void setParent(long parent) {
        this.parent = parent;
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
     * @return the isDelete
     */
    public boolean isIsDelete() {
        return isDelete;
    }

    /**
     * @param isDelete the isDelete to set
     */
    public void setIsDelete(boolean isDelete) {
        this.isDelete = isDelete;
    }

    /**
     * @return the rowGuid
     */
    public String getRowGuid() {
        return rowGuid;
    }

    /**
     * @param rowGuid the rowGuid to set
     */
    public void setRowGuid(String rowGuid) {
        this.rowGuid = rowGuid;
    }

    /**
     * @return the userId
     */
    public long getUserId() {
        return userId;
    }

    /**
     * @param userId the userId to set
     */
    public void setUserId(long userId) {
        this.userId = userId;
    }
    
    public Folder(){
        id = 0;
        name ="";
        parent = 0;
        description ="";
        isDelete = false;
        rowGuid = java.util.UUID.randomUUID().toString();
        userId = 0;
    }
     /**
     * @return :Đối tượng được định nghĩa kiểu json để thực hiện cho web.Dùng javascript xử lý
     */
    public String jsonObject(){
		StringBuilder sBuilder = new StringBuilder();
		sBuilder.append("{ \""+ Folder.c_Id + "\":\"" + this.getId() +"\",");
		sBuilder.append(" \""+ Folder.c_name + "\":\"" + this.getName() +"\",");
		sBuilder.append(" \""+ Folder.c_description + "\":\"" + this.getDescription() +"\",");
		sBuilder.append(" \""+ Folder.c_parent + "\":\"" + this.getParent() +"\",");
		sBuilder.append(" \""+ Folder.c_rowGuid + "\":\"" + this.getRowGuid() +"\",");
		sBuilder.append(" \""+ Folder.c_userId + "\":\"" + this.getUserId() +"\"");
		sBuilder.append("}");
		return sBuilder.toString();
    }
}
