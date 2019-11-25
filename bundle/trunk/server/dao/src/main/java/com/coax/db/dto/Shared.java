
package com.coax.db.dto;

public class Shared {
    public final static String c_id ="id";
    public final static String c_folderId ="folderId";
    public final static String c_groupId ="groupId";
    public final static String c_folderName ="folderName";
    public final static String c_groupName ="groupName";
    public final static String c_isFolder ="isFolder";
    public final static String c_userId ="userId";
	public final static String c_userName ="userName";
    public final static String c_exerciseId ="exerciseId";
	private String userName="";
    private String groupName ="";
    private String folderName ="";
    private long id = 0;
    private long groupId = 0;
    private long folderId = 0;
    private long userId = -1;
    private long exerciseId = -1;
    private boolean isFolder = true;
    public Shared(){
        id = 0;
        groupId = 0;
        folderId = 0;
        isFolder = true;
        userId = -1;
        exerciseId = -1;
    }

    public void setUserId(long userId){
        this.userId = userId;
    }
    public long getUserId(){
        return this.userId;
    }
    
    public void setExerciseId(long exerciseId){
        this.exerciseId = exerciseId;
    }
    
    public long getExerciseId(){
        return this.exerciseId;
    }
    
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
     * @return the groupId
     */
    public long getGroupId() {
        return groupId;
    }

    /**
     * @param groupId the groupId to set
     */
    public void setGroupId(long groupId) {
        this.groupId = groupId;
    }

    /**
     * @return the folderId
     */
    public long getFolderId() {
        return folderId;
    }

    /**
     * @param folderId the folderId to set
     */
    public void setFolderId(long folderId) {
        this.folderId = folderId;
    }
    
     //create json object
    public String jsonObject(){
        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("{ \""+ Shared.c_id + "\":\"" + this.getId() +"\",");
        sBuilder.append(" \""+ Shared.c_folderId + "\":\"" + this.getFolderId() +"\",");
        sBuilder.append(" \""+ Shared.c_groupId + "\":\"" + this.getGroupId() +"\",");
        sBuilder.append(" \""+ Shared.c_isFolder + "\":\"" + this.isIsFolder() +"\",");
        sBuilder.append(" \""+ Shared.c_userId + "\":\"" + this.getUserId() +"\",");
        sBuilder.append(" \""+ Shared.c_exerciseId + "\":\"" + this.getExerciseId() +"\",");
        sBuilder.append(" \""+ Shared.c_groupName + "\":\"" + this.getGroupName() +"\",");
		sBuilder.append(" \""+ Shared.c_userName + "\":\"" + this.getUserName() +"\","); 
        sBuilder.append(" \""+ Shared.c_folderName + "\":\"" + this.getFolderName() +"\"");
        sBuilder.append("}");
        return sBuilder.toString();
    }

    /**
     * @return the groupName
     */
    public String getGroupName() {
        return groupName;
    }

    /**
     * @param groupName the groupName to set
     */
    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    /**
     * @return the folderName
     */
    public String getFolderName() {
        return folderName;
    }
	
	 /**
     * @return the userName
     */
    public String getUserName() {
        return userName;
    }
	
	/**
     * @param userName the userName to set
     */
    public void setUserName(String userName) {
        this.userName = userName;
    }
	
	
	

    /**
     * @param folderName the folderName to set
     */
    public void setFolderName(String folderName) {
        this.folderName = folderName;
    }

    /**
     * @return the isFolder
     */
    public boolean isIsFolder() {
        return isFolder;
    }

    /**
     * @param isFolder the isFolder to set
     */
    public void setIsFolder(boolean isFolder) {
        this.isFolder = isFolder;
    }
    
}
