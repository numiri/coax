
package com.coax.db.dto;


public class Group_Users {
    public final static String c_id ="id";
    public final static String c_groupId ="groupId";
    public final static String c_name ="name";
    public final static String c_userId ="userId";
    public final static String c_username ="username";
    private long id = 0;
    private long groupId = 0;
    private long userId = 0;
    private String name ="";
    private String userName ="";
    public Group_Users(){
         id = 0;
         groupId = 0;
         userId = 0;
         name ="";
         userName ="";
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
    //create json object
    public String jsonObject(){
        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("{ \""+ Group_Users.c_id + "\":\"" + this.getId() +"\",");
        sBuilder.append(" \""+ Group_Users.c_name + "\":\"" + this.getName() +"\",");
        sBuilder.append(" \""+ Group_Users.c_username + "\":\"" + this.getUserName() +"\",");
        sBuilder.append(" \""+ Group_Users.c_groupId + "\":\"" + this.getGroupId() +"\",");
        sBuilder.append(" \""+ Group_Users.c_userId + "\":\"" + this.getUserId() +"\"");
        sBuilder.append("}");
        return sBuilder.toString();
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
}
