package com.coax.db.dao;
import com.coax.db.dto.*;

import java.sql.*;
import java.util.List;
/**
 * @author phuctq
 * Thực hiện các lệnh với csdl
 *
 */
public class ConfigDAO extends IData<Config>{
	
	public ConfigDAO(){
		
	}

	@Override
	protected Object OnSubmit(Config item, int t) {
		// TODO Auto-generated method stub		
		this.sToreprocedure = "{ CALL CRUConfig (?,?,?,?,?,?)";
		Subconfig fig = Subconfig.getInstance();
		fig.init();		
		Object result = -1;
		try {
			CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
			cs.registerOutParameter(1, java.sql.Types.BIGINT);
			if(t != 1)
				cs.setInt(Config.c_Id,item.getId());			
			cs.setString(Config.c_name, item.getName());
			cs.setString(Config.c_value, item.isValue());
			cs.setString(Config.c_description, item.getDescription());
			cs.setBoolean(Config.c_active, item.isActive());
			cs.setInt(6, t);
			cs.execute();
			result =(int)cs.getInt(Config.c_Id);
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		fig.close();
		return result;
	}

	@Override
	protected Config getItem(ResultSet rs) {
		// TODO Auto-generated method stub
		Config item = new Config();
		try {
			item.setActive(rs.getBoolean(Config.c_active));
			item.setCreatedOn(rs.getDate(Config.c_created_on));
			item.setDescription(rs.getString(Config.c_description));
			item.setId(rs.getInt(Config.c_Id));
			item.setName(rs.getString(Config.c_name));
			item.setValue(rs.getString(Config.c_value));
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return item;
	}

	@Override
	public List<Config> getAll() {
		// TODO Auto-generated method stub
		String mySql = "{ call GetConfig()}";		
		return this.getAll(mySql);
	}

	@Override
	public String getJson(List<Config> list) {
		// TODO Auto-generated method stub
		String sJson = "[";
		int flag = 0;
		for(int i = 0;i<list.size();i++){
			Config item = (Config)list.get(i);
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
