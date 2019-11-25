/*
 * To change this template; choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dto;

/**
 *
 * @author cz
 */
public class Bonus {

    public final static String c_id  = "id";
    public final static String c_userid = "userid";
    public final static String c_exerid = "exerid";
    public final static String c_bulbs = "bulbs";
    public final static String c_golds = "golds";
    public final static String c_foods = "foods";
    public final static String c_redoreduction = "redo_reduction";
    public final static String c_isused = "isused";
    
    
    private int id=0;
    private int userid=0;
    private int exerid=0;
    private int bulbs=0;
    private int golds=0;
    private int foods=0;
    private int isused;//-1 chua su dung, 0 trang thai trung gian, 1 da su dung
    private float redoReduction;//hpham 120929 truong nay de dem so lan giai mot bai toan.

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
     * @return the userid
     */
    public int getUserid() {
        return userid;
    }

    /**
     * @param userid the userid to set
     */
    public void setUserid(int userid) {
        this.userid = userid;
    }

    /**
     * @return the exerid
     */
    public int getExerid() {
        return exerid;
    }

    /**
     * @param exerid the exerid to set
     */
    public void setExerid(int exerid) {
        this.exerid = exerid;
    }

    /**
     * @return the bulbs
     */
    public int getBulbs() {
        return bulbs;
    }

    /**
     * @param bulbs the bulbs to set
     */
    public void setBulbs(int bulbs) {
        this.bulbs = bulbs;
    }

    /**
     * @return the golds
     */
    public int getGolds() {
        return golds;
    }

    /**
     * @param golds the golds to set
     */
    public void setGolds(int golds) {
        this.golds = golds;
    }

    /**
     * @return the foods
     */
    public int getFoods() {
        return foods;
    }

    /**
     * @param foods the foods to set
     */
    public void setFoods(int foods) {
        this.foods = foods;
    }

    /**
     * @return the isused
     */
    public int isIsused() {
        return isused;
    }

    /**
     * @param isused the isused to set
     */
    public void setIsused(int isused) {
        this.isused = isused;
    }
    
       public String jsonObject(){
		StringBuilder sBuilder = new StringBuilder();
		sBuilder.append("{\"" + Bonus.c_id + "\":").append(this.getId()).append(",");
		sBuilder.append("\"" + Bonus.c_userid + "\":").append(this.getUserid()).append(",");
		sBuilder.append("\"" + Bonus.c_exerid + "\":").append(this.getExerid()).append(",");
		sBuilder.append("\"" + Bonus.c_bulbs + "\":").append(this.getBulbs()).append(",");		
		sBuilder.append("\"" + Bonus.c_golds + "\":").append(this.getBulbs()).append(",");
		sBuilder.append("\"" + Bonus.c_foods + "\":").append(this.getFoods());
		sBuilder.append("}");
		return sBuilder.toString();
	}

    /**
     * @return the redoReduction
     */
    public float getRedoReduction() {
        return redoReduction;
    }

    /**
     * @param redoReduction the redoReduction to set
     */
    public void setRedoReduction(float redoReduction) {
        this.redoReduction = redoReduction;
    }

    @Override
    public String toString() {
        return this.getBulbs() +"\t" + this.getRedoReduction() +"\t" + this.getExerid() +"\t" + this.getUserid();
    }
    
    

}
