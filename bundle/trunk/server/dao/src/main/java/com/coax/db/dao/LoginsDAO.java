package com.coax.db.dao;
import com.coax.db.dto.*;

import java.sql.*;
import java.util.List;
public class LoginsDAO extends IData<Logins> {
	
	public LoginsDAO(){
		
	}

	@Override
	protected Object OnSubmit(Logins item, int t) {
		// TODO Auto-generated method stub
		Subconfig fig = Subconfig.getInstance();
		fig.init();
		this.sToreprocedure = "{ CALL CRUDLogins(?,?,?,?,?,?) }";
		Object result = -1;
		try {
			CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
			cs.registerOutParameter(1, java.sql.Types.SMALLINT);
			if(t != 0)
				cs.setLong("p_" + Logins.c_id , item.getId());			
			cs.setString("p_" + Logins.c_ip, item.getIp());
			cs.setLong("p_" + Logins.c_userId, item.getUserId());
			cs.setString("p_" + Logins.c_device, item.getDevice());
			cs.setString("p_" + Logins.c_token, item.getToken());
			cs.setInt("p_t",t);
			cs.execute();
			result =(int)cs.getShort("p_" + Logins.c_id);
			System.out.print(item.toString());
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		fig.close();
		return result;
	}

	@Override
	protected Logins getItem(ResultSet rs) {
		// TODO Auto-generated method stub
		Logins item = new Logins();
		try {
			item.setDevice(rs.getString(Logins.c_device));
			item.setId(rs.getLong(Logins.c_id));
			item.setIp(rs.getString(Logins.c_ip));
			item.setLastLogin(rs.getDate(Logins.c_lastLogin));
			item.setToken(rs.getString(Logins.c_token));
			item.setUserId(rs.getLong(Logins.c_userId));
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return item;
	}

	@Override
	public List<Logins> getAll() {
		// TODO Auto-generated method stub
		String mySql = "{ call getLogins()}";		
		return this.getAll(mySql);
	}

	@Override
	public String getJson(List<Logins> list) {
		// TODO Auto-generated method stub
		String sJson = "[";
		int flag = 0;
		for(int i = 0;i<list.size();i++){
			Logins item = (Logins)list.get(i);
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
