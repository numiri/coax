
package com.coax.db.dto;


public class Folder_Exercises {
    /**
	 * field :id
	 */
	public static String c_Id = "id";
	/**
	 * Field :folderId
	 */
        public static String folderidId = "folderId";
	/**
	 * Field :folderName
	 */
	public static String c_folderName = "folderName";
        /**
	 * Field :exerciseId
	 */
            public static String c_exerciseId = "exerciseId";
        /**
	 * Field :exerciseId
	 */
            public static String c_friendlyid="friendly_id";
	public static String c_exerciseName = "exerciseName";
        
        public static String c_xiznum = "xiznum";
        public static String c_variable = "variable";
        public static String c_amid = "amid";
        public static String c_latex ="latex";
    
        
        //xiznum,exercises.variable as variable, exercises.amid as amid
        
        private long id = 0;
        private long folderId = 0;
        private long exerciseId = 0;
        private String exerciseName = "";
        private String folderName = "";
        
        private String xiznum ="";
        private String variable ="";
        private String amid="";
        private String latex="";
        private String frienlyId="";
        
        public Folder_Exercises(){
             id = 0;
             folderId = 0;
             exerciseId = 0;
             exerciseName = "";
             folderName = "";
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

    /**
     * @return the exerciseId
     */
    public long getExerciseId() {
        return exerciseId;
    }

    /**
     * @param exerciseId the exerciseId to set
     */
    public void setExerciseId(long exerciseId) {
        this.exerciseId = exerciseId;
    }

    /**
     * @return the exerciseName
     */
    public String getExerciseName() {
        return exerciseName;
    }

    /**
     * @param exerciseName the exerciseName to set
     */
    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    /**
     * @return the folderName
     */
    public String getFolderName() {
        return folderName;
    }

    /**
     * @param folderName the folderName to set
     */
    public void setFolderName(String folderName) {
        this.folderName = folderName;
    }        
     //create json object
    public String jsonObject(){
        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("{ \""+ Folder_Exercises.c_Id + "\":\"" + this.getId() +"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_exerciseId + "\":\"" + this.getExerciseId() +"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_exerciseName + "\":\"" + this.getExerciseName() +"\",");
        sBuilder.append(" \""+ Folder_Exercises.folderidId + "\":\"" + this.getFolderId() +"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_xiznum + "\":\"" + this.getXiznum()+"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_variable + "\":\"" + this.getVariable() +"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_amid + "\":\"" + this.getAmid()+"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_latex + "\":\"" + this.getLatex()+"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_friendlyid + "\":\"" + this.getFrienlyId()+"\",");
        sBuilder.append(" \""+ Folder_Exercises.c_folderName + "\":\"" + this.getFolderName() +"\"");
        sBuilder.append("}");
        return sBuilder.toString();
    }

    /**
     * @return the xiznum
     */
    public String getXiznum() {
        return xiznum;
    }

    /**
     * @param xiznum the xiznum to set
     */
    public void setXiznum(String xiznum) {
        this.xiznum = xiznum;
    }

    /**
     * @return the variable
     */
    public String getVariable() {
        return variable;
    }

    /**
     * @param variable the variable to set
     */
    public void setVariable(String variable) {
        this.variable = variable;
    }

    /**
     * @return the amid
     */
    public String getAmid() {
        return amid;
    }

    /**
     * @param amid the amid to set
     */
    public void setAmid(String amid) {
        this.amid = amid;
    }

    /**
     * @return the latex
     */
    public String getLatex() {
        return latex;
    }

    /**
     * @param latex the latex to set
     */
    public void setLatex(String latex) {
        this.latex = latex;
    }

    /**
     * @return the frienlyId
     */
    public String getFrienlyId() {
        return frienlyId;
    }

    /**
     * @param frienlyId the frienlyId to set
     */
    public void setFrienlyId(String frienlyId) {
        this.frienlyId = frienlyId;
    }
}
