/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dao;

import com.coax.db.dto.Theme;
import com.mysql.jdbc.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author phuctq
 */
public class ThemesDAO  extends IData<Theme>  {
    public ThemesDAO(){
    }

    @Override
    public String getJson(List<Theme> list) {
        String sJson = "[";
	int flag = 0;
	for(int i = 0;i<list.size();i++){
            Theme item = (Theme)list.get(i);
            if(i > 0 )
		sJson = sJson + ",";
		sJson = sJson + item.jsonObject();
		flag = 1;
	}		
	sJson = sJson + "]";
	if(flag == 0)
            sJson ="";
	return sJson;
    }

    @Override
    protected Object OnSubmit(Theme item, int t) {
        Subconfig fig = Subconfig.getInstance();
	fig.init();
        this.sToreprocedure ="{CALL CRUDthemes (?,?,?,?,?)}";
        Object result = -1;
        try {
            CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);
            cs.registerOutParameter("p_" + Theme.c_Id, java.sql.Types.INTEGER);
            if(t != 0)
		cs.setLong("p_" + Theme.c_Id, item.getId());
		cs.setString("p_" + Theme.c_background, item.getBackground());
                cs.setString("p_" + Theme.c_name, item.getName());
                cs.setString("p_" + Theme.c_strokeColor, item.getStrokeColor());
                cs.setInt("p_t", t);
                if(cs.execute())
			result = 1;
	} catch (SQLException e) {
			// TODO Auto-generated catch block
			System.out.println("err " + e.toString());
			e.printStackTrace();
	}
	fig.close();
	return result;
    }

    @Override
    protected Theme getItem(ResultSet rs) {
        Theme item = new Theme();        
        try {
            
            item.setBackground(rs.getString(Theme.c_background));
            item.setId(rs.getInt(Theme.c_Id));
            item.setName(rs.getString(Theme.c_name));
            item.setStrokeColor(rs.getString(Theme.c_strokeColor));	
         } catch (SQLException ex) {
             System.out.println("Err ThemeDAO getItem " + ex.getMessage());
             ex.printStackTrace();             
        }
	return item;
    }

    @Override
    public List<Theme> getAll() {
        String mySql = "{ call getThemes() }";
	return this.getAll(mySql);
    }
    
    public List<Theme> getItem(int id){
        String []params = {"p_id"};
        Object []obj = {id};
        String procedure = "{call getItemThemes(?)}";
        return this.getItem(procedure, params, obj);
    }
    
    public String formXml(int id){
        String []params = {"p_id"};
        Object []obj = {id};
        String procedure ="{ call getItemThemes(?) }";
        List<Theme>list = this.getItem(procedure, params, obj);
        Theme item = new Theme();
        if(list.size()> 0){
            item =(Theme)list.get(0);
        }
        return item.formXML();
    }
}
