/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.activemath;

/**
 *
 * @author phuctq
 */
public class ExerciseItem {
    private String url = "";
    private String title = "";
    private String pageNum = "1";
    private String section = "";
    private boolean leaf = true;
    public ExerciseItem(){}

    /**
     * @return the url
     */
    public String getUrl() {
        return url;
    }

    /**
     * @param url the url to set
     */
    public void setUrl(String url) {
        this.url = url;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the pageNum
     */
    public String getPageNum() {
        return pageNum;
    }

    /**
     * @param pageNum the pageNum to set
     */
    public void setPageNum(String pageNum) {
        this.pageNum = pageNum;
    }

    /**
     * @return the section
     */
    public String getSection() {
        return section;
    }

    /**
     * @param section the section to set
     */
    public void setSection(String section) {
        this.section = section;
    }

    /**
     * @return the leaf
     */
    public boolean isLeaf() {
        return leaf;
    }

    /**
     * @param leaf the leaf to set
     */
    public void setLeaf(boolean leaf) {
        this.leaf = leaf;
    }
    
    public String jsonObject(){
        StringBuilder sBuilder = new StringBuilder();
        return sBuilder.toString();
    }
    
    public String toString(){
        StringBuilder sBuilder = new StringBuilder();
        sBuilder.append("\nurl : " + this.getUrl());
        sBuilder.append("\nTitle : " + this.getTitle());
        sBuilder.append("\nPageNumber : " + this.getPageNum());
        sBuilder.append("\nSecsion : " + this.getSection());
        sBuilder.append("\nLeaf : " + this.isLeaf());
        System.out.println(sBuilder.toString());
        return sBuilder.toString();
    }
}
