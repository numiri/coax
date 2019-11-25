
package com.coax.db.dao;
import com.coax.db.dto.Shared;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;


public class SharedDAO extends IData<Shared>{
    public SharedDAO(){
        
    }
    @Override
    public String getJson(List<Shared> list) {
        String sJson = "[";
        int flag = 0;
        for(int i = 0;i<list.size();i++){
            Shared item = (Shared)list.get(i);
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
    protected Object OnSubmit(Shared item, int t) {
        Subconfig fig = Subconfig.getInstance();
	fig.init();
	this.sToreprocedure = "{ CALL CRUDShared(?,?,?,?,?) }";
	Object result = -1;
	try {
		CallableStatement cs = (CallableStatement)fig.connec.prepareCall(this.sToreprocedure);			
		cs.registerOutParameter(1, java.sql.Types.BIGINT);
		if(t != 0)
                    cs.setLong("p_" + Shared.c_id , item.getId());
                cs.setLong("p_" + Shared.c_groupId, item.getGroupId());
                cs.setLong("p_" + Shared.c_folderId, item.getFolderId());
                cs.setBoolean("p_" + Shared.c_isFolder, item.isIsFolder());
                cs.setInt("p_t",t);
                cs.execute();
                result =(long)cs.getLong("p_" + Shared.c_id);
                item.setId(cs.getLong("p_" + Shared.c_id));
                System.out.print(item.toString());
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
                        result = 0;
		}
		fig.close();
		return result;
    }

    @Override
    protected Shared getItem(ResultSet rs) {
        Shared item = new Shared();
	try {
            item.setId(rs.getLong(Shared.c_id));
            item.setGroupId(rs.getLong(Shared.c_groupId));
            item.setFolderId(rs.getLong(Shared.c_folderId));
            
            item.setGroupName(rs.getString(Shared.c_groupName)); 
            item.setUserName(rs.getString(Shared.c_userName));			
            item.setUserId(rs.getLong(Shared.c_userId));
            item.setExerciseId(rs.getLong(Shared.c_exerciseId));
	} catch (SQLException e) {
			// TODO Auto-generated catch block
            e.printStackTrace();
	}
	return item;
    }

    @Override
    public List<Shared> getAll() {
        //getAllShared
       // String procedure = "{call getAllShared(?)}";
        //String []param = String{"p_groupId"};
       // Object []obj = Object{};
        String mySql = "{ call getAllShared()}";
	return this.getAll(mySql);
    }
}
