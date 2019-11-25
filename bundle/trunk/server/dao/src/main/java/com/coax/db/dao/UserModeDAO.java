/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dao;

import com.coax.db.dto.UserMode;
import com.google.gson.Gson;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 *
 * @author cz
 */
public class UserModeDAO extends IData<UserMode> {

    @Override
    public String getJson(List<UserMode> list) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected Object OnSubmit(UserMode item, int t) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected UserMode getItem(ResultSet rs) {
        UserMode item = new UserMode();
        try {
            item.setId(rs.getInt(UserMode.c_id));
            item.setCreate_on(rs.getDate(UserMode.c_createdate));

            item.setDescription(rs.getString(UserMode.c_description));
            item.setName(rs.getString(UserMode.c_name));

        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return item;
    }

    @Override
    public List<UserMode> getAll() {
        String mySql = "{ call getUserMode() }";
        return this.getAll(mySql);
    }

    public static UserMode getUserModeById(int id) {

        List<UserMode> list = getAlls();
        for (UserMode item : list) {
            if (item.getId() == id) {
                return item;
            }
        }
        return null;

    }

    public static String getAllToJson() {
        List<UserMode> list = getAlls();
        //hpham phan nay duoc dung de test tree extjs.
    /*    for (UserMode item : list) {
            if (item.getName().equals("standalone")) {
                UserMode mode = new UserMode();
                mode.setId(3);
                mode.setName("con1");
                item.getUsermodes().add(mode);
                mode.setId(4);
                mode.setName("con2");
                item.getUsermodes().add(mode);
                mode.setId(5);
                mode.setName("con3");
                item.getUsermodes().add(mode);
            }
        }
*/

        Map<String, Object> modelMap = new HashMap<String, Object>();
        //  modelMap.put("id", 0);
        //modelMap.put("name", "root");
        modelMap.put("rows", list);
        Gson gson = new Gson();
        String json = gson.toJson(modelMap);
        System.out.println(json);
        return json;
    }

    public static String getAllToJson(int id) {
        List<UserMode> list = new LinkedList<UserMode>();
        if(id==4)
        {
         UserMode mode = new UserMode();
        mode.setId(6);
        mode.setName("con1");
        list.add(mode);
        mode = new UserMode();
        mode.setId(7);
        mode.setName("connected");
        list.add(mode);
        mode = new UserMode();
        mode.setId(8);
        mode.setName("con3");
        list.add(mode);
        }
        else
            
        {
        UserMode mode = new UserMode();
        mode.setId(3);
        mode.setName("con1");
        list.add(mode);
        mode = new UserMode();
        mode.setId(4);
        mode.setName("connected");
        list.add(mode);
        mode = new UserMode();
        mode.setId(5);
        mode.setName("con3");
        list.add(mode);
        }
        return getAllToJson(list);
    }

    public static String getAllToJson(List<UserMode> list) {


        Gson gson = new Gson();
        String json = gson.toJson(list);
        System.out.println(json);
        return json;
    }

    public static List<UserMode> getAlls() {
        UserModeDAO dao = new UserModeDAO();
        List<UserMode> list = dao.getAll();
        return list;
    }
}
