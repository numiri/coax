package com.coax.db.dao;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import com.coax.db.dto.*;
public class LogDAO extends IData<Log> {
	
	public LogDAO(){
		
	}
	
	@Override
	protected Object OnSubmit(Log item, int t) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	protected Log getItem(ResultSet rs) {
		// TODO Auto-generated method stub
		Log item = new Log();
		try {
			item.setUserId(rs.getLong(0));
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return item;
	}

	@Override
	public List<Log> getAll() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getJson(List<Log> list) {
		// TODO Auto-generated method stub
		String sJson = "[";
		int flag = 0;
		for(int i = 0;i<list.size();i++){
			Log item = (Log)list.get(i);
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
