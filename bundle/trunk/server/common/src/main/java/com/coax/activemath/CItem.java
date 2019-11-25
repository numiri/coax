/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.activemath;

/**
 *
 * @author phuctq
 */
public class CItem {
    private String id ="";
    private String title ="";
    private String description = "";//
    public CItem(){}
    /**
     * @return the id
     */
    public String getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(String id) {
        this.id = id;
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
    
}

