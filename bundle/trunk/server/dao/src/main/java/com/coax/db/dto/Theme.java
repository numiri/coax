/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dto;

/**
 *
 * @author phuctq
 */
public class Theme {    
        public final static String c_Id = "id";	
	public final static String c_name = "name";
        public final static String c_background = "background";
        public final static String c_strokeColor = "strokeColor";
        private int id = -1;
        private String name = "";
        private String background = "";
        private String strokeColor = "";
        public Theme(){}

    /**
     * @return the id
     */
    public int getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(int id) {
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
     * @return the background
     */
    public String getBackground() {
        return background;
    }

    /**
     * @param background the background to set
     */
    public void setBackground(String background) {
        this.background = background;
    }

    /**
     * @return the strokeColor
     */
    public String getStrokeColor() {
        return strokeColor;
    }

    /**
     * @param strokeColor the strokeColor to set
     */
    public void setStrokeColor(String strokeColor) {
        this.strokeColor = strokeColor;
    }
    
    /**
     * @return :Đối tượng được định nghĩa kiểu json để thực hiện cho web.Dùng javascript xử lý
     */
    public String jsonObject(){
	StringBuilder sBuilder = new StringBuilder();
	sBuilder.append("{ \""+ Theme.c_Id + "\":\"" + this.getId() +"\",");
        sBuilder.append(" \""+ Theme.c_name + "\":\"" + this.getName() +"\",");
        sBuilder.append(" \""+ Theme.c_background + "\":\"" + this.getBackground() +"\",");
        sBuilder.append(" \""+ Theme.c_strokeColor + "\":\"" + this.getStrokeColor()+"\"");
        sBuilder.append("}");
        return sBuilder.toString();
    }
    
    public String formXML(){
        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("<Theme id=\""+ this.getId() + "\" " );
	sBuilder.append(Theme.c_name + "=\"" + this.getName()+ "\"" + " "+ Theme.c_background + " =\"" + this.background +"\" ");
	sBuilder.append(Theme.c_strokeColor + " =\"" + this.strokeColor + "\">\r");
	sBuilder.append( "\t</Theme>");
        return sBuilder.toString();
    }
}
