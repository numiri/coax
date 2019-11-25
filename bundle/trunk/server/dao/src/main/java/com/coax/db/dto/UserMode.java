/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dto;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author cz
 */
public class UserMode implements java.io.Serializable {

    public static final String c_id = "id";
    public static final String c_name = "name";
    public static final String c_description = "description";
    public static final String c_createdate = "createdate_on";
    private int id;
    private String name;
    private String description;
    private Date create_on;
    private boolean leaf = true;
    
    private List<UserMode> usermodes = new LinkedList<UserMode>();

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
     * @return the create_on
     */
    public Date getCreate_on() {
        return create_on;
    }

    /**
     * @param create_on the create_on to set
     */
    public void setCreate_on(Date create_on) {
        this.create_on = create_on;
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

    /**
     * @return the usermodes
     */
    public List<UserMode> getUsermodes() {
        return usermodes;
    }

    /**
     * @param usermodes the usermodes to set
     */
    public void setUsermodes(List<UserMode> usermodes) {
        this.usermodes = usermodes;
    }
}
