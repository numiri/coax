package com.coax.db.dao;
import java.sql.*;
import java.util.List;
import com.coax.db.dto.*;

public class StepsDAO extends IData<Steps> {
	
	public StepsDAO(){
		
	}

	@Override
	protected Object OnSubmit(Steps item, int t) {
		// TODO Auto-generated method stub
		Subconfig fig = Subconfig.getInstance();
		fig.init();		
		String s = "p_";
		this.sToreprocedure ="{CALL CRUDSteps (?,?,?,?,?,?)}";
		Object result = -1;
		try {
			CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
			cs.registerOutParameter(1, java.sql.Types.SMALLINT);
			if(t != 0)
				cs.setLong(s + Steps.c_Id, item.getId());
			cs.setLong(s + Steps.c_idExercise, item.getIdExercise());
			cs.setInt(s + Steps.c_step, item.getStep());
			cs.setString(s + Steps.c_latex, item.getLatex());
			cs.setString(s + Steps.c_message, item.getMessage());
			cs.setInt(s,t);
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
	protected Steps getItem(ResultSet rs) {
		// TODO Auto-generated method stub
		Steps item = new Steps();
		try {
			item.setCreated_on(rs.getDate(Steps.c_created_on));
			item.setId(rs.getLong(Steps.c_Id));
			item.setIdExercise(rs.getLong(Steps.c_idExercise));
			item.setLatex(rs.getString(Steps.c_latex));
			item.setMessage(rs.getString(Steps.c_message));
			item.setMessageTrue(rs.getString(Steps.c_messageTrue));
			item.setResult(rs.getBoolean(Steps.c_result));
			item.setStep(rs.getInt(Steps.c_step));
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return item;
	}

	@Override
	public List<Steps> getAll() {
		// TODO Auto-generated method stub
		String mySql = "{ call getSteps() } ";
		return this.getAll(mySql);
	}
	
	public List<Steps> getItem(Object []obj){	
		String mySql = "{ call getSteps()}";
		return this.getAll(mySql);
	}

	@Override
	public String getJson(List<Steps> list) {
		// TODO Auto-generated method stub
		String sJson = "[";
		int flag = 0;
		for(int i = 0;i<list.size();i++){
			Steps item = (Steps)list.get(i);
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
