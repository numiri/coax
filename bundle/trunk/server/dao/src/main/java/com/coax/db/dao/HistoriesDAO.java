package com.coax.db.dao;

import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanListHandler;

import com.coax.db.dto.Histories;
import com.coax.db.dto.HistoryComparator;
import com.google.gson.Gson;

public class HistoriesDAO extends IData<Histories> {

public static Bacon bacon;
public static QueryRunner run;

public HistoriesDAO() {
    bacon = new Bacon(); 
    run = new QueryRunner( bacon.ds ); }

/******************************************************************************
*
******************************************************************************/
@Override
protected Object OnSubmit(Histories item, int t) {
//if( t == 3 ) { updateHistories( item ); return item.getId(); }
this.sToreprocedure = "{ CALL CRUDHistory (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) }";
Subconfig fig = Subconfig.getInstance();
fig.init();
Object result = -1;
try {
    CallableStatement cs = (CallableStatement) fig.connec.prepareCall(this.sToreprocedure);
    cs.registerOutParameter(1, java.sql.Types.BIGINT);
    if (t != 0) cs.setLong("p_" + Histories.c_id, item.getId());
    cs.setLong("p_" + Histories.c_exerciseId, item.getExerciseId());
    cs.setLong("p_" + Histories.c_userId, item.getUserId());
    cs.setInt("p_" + Histories.c_stepFrom, item.getStepFrom());
    cs.setInt("p_" + Histories.c_stepTo, item.getStepTo());
    cs.setString("p_" + Histories.c_stroke, item.getstroke());
    cs.setString("p_" + Histories.c_formula, item.getformula());
    cs.setShort("p_" + Histories.c_action, item.getAction());
    cs.setLong("p_" + Histories.c_sessionId, item.getSessionId());
    cs.setLong("p_" + Histories.c_parentID, item.getParentID());
    cs.setInt("p_" + Histories.c_version, item.getVersion());
    cs.setString("p_" + Histories.c_image, item.getImage());
    cs.setBoolean("p_" + Histories.c_result, item.getResult());
    cs.setShort("p_" + Histories.c_isdelete, item.getIsDelete() );
    cs.setString("p_" + Histories.c_proc_skipped, item.getProc_skipped());
    cs.setShort("p_t", (short) t);
    cs.execute();
    result = (long) cs.getLong("p_" + Histories.c_id);
    item.setVersion(cs.getInt("p_"+Histories.c_version));
}
catch (SQLException e) { e.printStackTrace(); }
fig.close();
return result;
}
/******************************************************************************
*
******************************************************************************/
    public static String  getHistoryByUserId(long userid){
        HistoriesDAO historiesDAO = new HistoriesDAO();
        List<Histories> all = historiesDAO.getAll();
        LinkedList<HashMap<String,Object>> results = new LinkedList<HashMap<String, Object>>();
        
        for (Histories item : all) {
            if(item.getUserId()==userid)
            {
                Map<String,Object> a = new HashMap<String,Object>();  
                a.put("userid", userid);
                a.put("exerciseid", item.getExerciseId());
                a.put("version", item.getVersion());
                if(!results.contains(a)){
                    results.addLast((HashMap<String, Object>) a);
                }
            }
        }
        Gson gson = new Gson();
        String json = gson.toJson(results);
        return json;
    }
    /******************************************************************************
    *
    ******************************************************************************/
    @Override
    protected Histories getItem(ResultSet rs) {
        Histories item = new Histories();
        try {
            item.setAction(rs.getShort(Histories.c_action));
            item.setCreatedOn(rs.getDate(Histories.c_created_on));
            item.setstroke(rs.getString(Histories.c_stroke));
            item.setId(rs.getLong(Histories.c_id));
            item.setResult(rs.getBoolean(Histories.c_result));
            item.setExerciseId(rs.getLong(Histories.c_exerciseId));
            item.setUserId(rs.getLong(Histories.c_userId));
            item.setSessionId(rs.getLong(Histories.c_sessionId));
            item.setStepFrom(rs.getShort(Histories.c_stepFrom));
            item.setStepTo(rs.getShort(Histories.c_stepTo));
            item.setformula(rs.getString(Histories.c_formula));
            item.setparentID(rs.getLong(Histories.c_parentID));
            item.setVersion(rs.getInt(Histories.c_version));
            item.setProc_skipped(rs.getString(Histories.c_proc_skipped));
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return item;
    }
    /******************************************************************************
    *
    ******************************************************************************/
    @Override
    public List<Histories> getAll() {
        String mySql = "{ call getHistories()}";
        return this.getAll(mySql);
    }
    /******************************************************************************
    * Lay danh sach history theo userId va bai tap
    ******************************************************************************/
    public List<Histories> getHistories(Histories item) {
        String procedure = "{ call getHistoriesItem(?,?,?) }";
        String[] params = {"p_userId", "p_exerciseId", "p_sessionId"};
        Object[] obj = {item.getUserId(), item.getExerciseId(), item.getSessionId()};
        return this.getItem(procedure, params, obj);
    }

    public List<Histories> GetHistoryByUserid(int userid) {
        String procedure = "{ call getHistoryByUserid(?) }";
        String[] params = {"userid"};
        Object[] obj = {userid};
        return this.getItem(procedure, params, obj);
    }
    
    public static Histories GetHistoryById(long id){
        HistoriesDAO historiesDAO = new HistoriesDAO();
        List<Histories> all = historiesDAO.getAll();
        for (Histories item : all) {
            if(item.getId()==id)
            {
                return item;
            }
        }
        return null;
    }
    
    public static String GetHistoryRestore(int userid, int exerciseid,int version)      {
    	List<Object[]> resultList = new ArrayList<Object[]>();
    	String json = "";
    	try                                                                          {
    	   resultList = (List<Object[]>) run.query( ""
    	   +   "select * from histories "
    	   +   "where  userid=? and exerciseid=? and version=? and isdelete=0 "
    	   +   "order  by stepTo"
    	   ,   new BeanListHandler( Histories.class )
    	   ,   new Object[] { userid, exerciseid, version } );
    	   Gson gson = new Gson();
    	   json = gson.toJson(resultList);                                            }
    	catch (SQLException e) { e.printStackTrace(); }
    	return json;                                                                  }

    /**
     * lay history theo userid de phuc hoi.
     *
     * @param userid
     * @return
     */
    public List<Histories> GetHistoryByUseridMemory(int userid) {
        List<Histories> list = this.getAll();
        List<Histories> results = new LinkedList<Histories>();
        LinkedList<Histories> results2 = new LinkedList<Histories>();

        for (Histories item : list) {
            if (item.getUserId() == userid) {
                results.add(item);
            }
        }

        Histories max = Collections.max(results, new HistoryComparator());
        for (Histories item : results) {
            if (item.getSessionId() == max.getSessionId()) {
                results2.add(0, item);
            }
        }
        
        Collections.sort(results2, new HistoryComparator());
        
        return results2;
    }

    /**
     * chua duoc dung.
     *
     * @param userid
     * @return
     */
    public static String GetHistoryByUseridToJson(int userid) {
        HistoriesDAO dao = new HistoriesDAO();
        List<Histories> list = dao.GetHistoryByUserid(userid);
        Map<String, Object> modelMap = new HashMap<String, Object>();
        modelMap.put("histories", list);
        Gson gson = new Gson();
        String json = gson.toJson(list);
        return json;
    }

    public static String GetHistoryByUseridMemoryToJson(int userid) {
        HistoriesDAO dao = new HistoriesDAO();
        List<Histories> list = dao.GetHistoryByUseridMemory(userid);
        Map<String, Object> modelMap = new HashMap<String, Object>();
        modelMap.put("histories", list);
        Gson gson = new Gson();
        String json = gson.toJson(list);
        return json;
    }

    /*
     *  Lay thong tin kieu json
     */
    public String getJson(List<Histories> list) {
        String sJson = "[";
        int flag = 0;
        for (int i = 0; i < list.size(); i++) {
            Histories item = (Histories) list.get(i);
            if (i > 0) {
                sJson = sJson + ",";
            }
            sJson = sJson + item.jsonObject();
            flag = 1;
        }

        sJson = sJson + "]";
        if (flag == 0) {
            sJson = "";
        }
        return sJson;
    }
/******************
* deleteHistory() - delete history and  returns the number of rows updated
******************/
public int deleteHistory( int exerciseid , int version )                      {
   int update = 0;
   try                                                                        {
   update = run.update( "delete from histories where exerciseid = ? and version=?"
   ,  exerciseid, version );
   return update;                                                             }
   catch (SQLException e) { e.printStackTrace(); return update;             } }

}
