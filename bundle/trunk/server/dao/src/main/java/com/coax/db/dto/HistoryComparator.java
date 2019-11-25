/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dto;

import java.util.Comparator;

/**
 *
 * @author ag
 */
public class HistoryComparator implements  Comparator<Histories>{

    public int compare(Histories o1, Histories o2) {
       return  new Long(o1.getId()).compareTo(o2.getId());
    }
    
}
