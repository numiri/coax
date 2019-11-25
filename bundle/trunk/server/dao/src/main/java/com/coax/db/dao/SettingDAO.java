package com.coax.db.dao;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import com.coax.db.dto.*;
public class SettingDAO extends IData<Settings> {
	public SettingDAO(){}

	@Override
	protected Object OnSubmit(Settings item, int t) {
		Subconfig fig = Subconfig.getInstance();
		fig.init();		
		this.sToreprocedure ="{CALL CRUDSetting (?,?,?,?,?,?)}";
		int result = -1;
		try {
			CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
			cs.registerOutParameter(1, java.sql.Types.SMALLINT);
			//if(t != 0)
			cs.setLong("p_" + Settings.c_Id, item.getId());
			cs.setLong("p_" + Settings.c_userId, item.getUserId());
			cs.setInt("p_" + Settings.c_configId, item.getConfigId());
			cs.setString("p_" + Settings.c_name, item.getName());
			cs.setString("p_" + Settings.c_value, item.isValue());			
			cs.setInt("p_t",t);
			if(cs.execute())
				result = 1;
			System.out.println("insert " + item.toString() +" tham so " + this.sToreprocedure);
		} catch (SQLException e) {
			System.out.println("err " + e.toString());
			e.printStackTrace();
		}
		fig.close();
		return result;
	}
	/*
	
	DROP PROCEDURE IF EXISTS CRUDSetting;
	delimiter //
	create DEFINER='root'@'localhost' 
	PROCEDURE CRUDSetting (
	   INOUT p_Id BIGINT ,
      IN p_userId BIGINT,
      IN p_configId INTEGER ,
      IN p_name VARCHAR(50) ,
      IN p_value VARCHAR(6),
      IN p_t int)
	begin
	   case  
	   when p_t = 0 then
	      INSERT INTO settings(userId,configId,name,value) VALUES (p_userId, p_configId, p_name, p_value);
         set p_Id = @@identity;
	   when p_t = 1 then  
         UPDATE settings SET value =  p_value WHERE name =  p_name and userId =  p_userId;
         
         INSERT INTO settings(userId,configId,name,value) 
         SELECT p_userId, id, name, p_value from default_settings 
         WHERE name = p_name and NOT EXISTS (SELECT * FROM settings WHERE name = p_name and userId = p_userId);   
      else
         DELETE FROM settings WHERE id =  p_Id ;
	   end case;
	end //
	delimiter ;
	 */
	@Override
	protected Settings getItem(ResultSet rs) {
		// TODO Auto-generated method stub
		Settings item = new Settings();
		try {
			item.setConfigId(rs.getInt(Settings.c_configId));
			item.setCreatedOn(rs.getDate(Settings.c_createdOn));
			item.setId(rs.getLong(Settings.c_Id));
			item.setName(rs.getString(Settings.c_name));
			item.setUserId(rs.getLong(Settings.c_userId));
			item.setValue(rs.getString(Settings.c_value));
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return item;
	}

	@Override
	public List<Settings> getAll() {
		// TODO Auto-generated method stub
		return null;
	}

        public Settings find(String name,List<Settings> list){     
            for(int i = 0;i< list.size();i++){
                Settings item =(Settings)list.get(i);
                if(item.getName().equals(name))
                    return item;
            }
            return null;
        }
	@Override
	public String getJson(List<Settings> list) {
		// TODO Auto-generated method stub
		String sJson = "[";
		int flag = 0;
		for(int i = 0;i<list.size();i++){
			Settings item = (Settings)list.get(i);
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
	
}

