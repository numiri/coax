package com.coax.db.dao;
import com.coax.db.dto.*;

import java.sql.*;
import java.util.List;

public class UserTypesDAO extends IData<UserTypes> {
	
	public UserTypesDAO(){
		
	}

	@Override
	protected Object OnSubmit(UserTypes item, int t) {
		// TODO Auto-generated method stub
		Subconfig fig = Subconfig.getInstance();
		fig.init();		
		this.sToreprocedure ="{CALL CRUDUser_types (?,?,?,?)}";
		Object result = -1;
		try {
			CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
			cs.registerOutParameter(1, java.sql.Types.SMALLINT);
			//if(t != 0)
			cs.setShort(1, item.getId());
			cs.setString(2, item.getType());
			cs.setString(3, item.getDescription());
			cs.setInt(4,t);
			if(cs.execute())
				result = 1;
			System.out.println("insert " + item.toString() +" tham so " + this.sToreprocedure);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			System.out.println("err " + e.toString());
			e.printStackTrace();
		}
		fig.close();
		return result;
	}

	@Override
	protected UserTypes getItem(ResultSet rs) {
		// TODO Auto-generated method stub
		UserTypes item = new UserTypes();
		try {
			item.setId(rs.getShort(UserTypes.c_Id));
			item.setType(rs.getString(UserTypes.c_type));
			item.setDescription(rs.getString(UserTypes.c_description));
			item.setCreatedOn(rs.getDate(UserTypes.c_CreateOn));
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return item;
	}

	@Override
	public List<UserTypes> getAll() {
		// TODO Auto-generated method stub
		String mySql = "{ call getUser_types() }";
		List<UserTypes> list = this.getAll(mySql);
		return list;
	}

	@Override
	public String getJson(List<UserTypes> list) {
		// TODO Auto-generated method stub
		String sJson = "[";
		int flag = 0;
		for(int i = 0;i<list.size();i++){
			UserTypes item = (UserTypes)list.get(i);
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
