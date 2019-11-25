/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dao;

import com.coax.db.dto.Score;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.mysql.jdbc.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author cz
 */
public class ScoreDAO extends IData<Score> {
    
    @Override
    public String getJson(List<Score> list) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
    @Override
    protected Object OnSubmit(Score item, int t) {
        this.sToreprocedure = "{ CALL CRUDScore (?,?,?,?,?) }";//hpham 120929 them de dem so lan giai 1 bai toan.
        Subconfig fig = Subconfig.getInstance();
        fig.init();
        Object result = -1;
        try {
            CallableStatement cs = (CallableStatement) fig.connec.prepareCall(this.sToreprocedure);
            cs.registerOutParameter(1, java.sql.Types.BIGINT);
            if (t != 0) {
                cs.setInt(1, item.getUserid());
            }
            cs.setInt("_" + Score.c_userid, item.getUserid());
            cs.setInt("_" + Score.c_exerid, item.getExerid());
            cs.setInt(Score.c_status, item.getStatus());
            cs.setInt(Score.c_redo_counts, item.getRedoCounts());//hpham 120929 them de so lan giai bai toan
            cs.setInt("action", t);
            cs.execute();
            result = cs.getLong("_" + Score.c_userid);
            System.out.println("id " + cs.getLong("_" + Score.c_userid));
            
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        fig.close();
        return result;
    }
    
    @Override
    protected Score getItem(ResultSet rs) {
        Score item = new Score();
        try {
            
            item.setExerid(rs.getInt(Score.c_exerid));
            item.setUserid(rs.getInt(Score.c_userid));
            item.setStatus(rs.getInt(Score.c_status));
            item.setRedoCounts(rs.getInt(Score.c_redo_counts));//hpham 120929 doc so lan giai bai toan.
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return item;
    }
    
    @Override
    public List<Score> getAll() {
        String mySql = "{ call getScore() }";
        return this.getAll(mySql);
    }
    
    public static Score GetScoreByUserIdExerid(int userid, int exerid) {
        ScoreDAO dao = new ScoreDAO();
        List<Score> list = dao.getAll();
        System.out.printf("exerid: %d,userid: %d\r\n", exerid, userid);
        for (Score item : list) {
            System.out.printf("exerid: %d,userid: %d\r\n", item.getExerid(), item.getUserid());
            
            if (item.getUserid() == userid && item.getExerid() == exerid) {
                return item;
            }
        }
        
        return null;
        
    }

    /**
     * update hoac create score
     *
     * @param userid
     * @param exerid
     * @return
     */
    public static long CRUScoreByUserIdExerid(int userid, int exerid) {
        ScoreDAO dao = new ScoreDAO();
        List<Score> list = dao.getAll();
        Long result = -1L;
        
        for (Score item : list) {
            
            if (item.getUserid() == userid && item.getExerid() == exerid) {
                item.setStatus(-1);
                result = (Long) dao.updateOnSubmint(item);
                return result;
            }
        }
        Score score = new Score(userid, exerid, -1, 0);
        result = (Long) dao.insertOnSubmit(score);
        return result;
    }

    /**
     * cap nhat lai trang thai cua score sau moi lan user lay diem thuong.
     * @param json 
     */
    public static void UpdateFromJson(String json) {
        Gson gson = new Gson();
        List<Score> scores = new LinkedList<Score>();
        java.lang.reflect.Type collectionType = new TypeToken<List<Score>>() {
        }.getType();
        scores = gson.fromJson(json, collectionType);
        ScoreDAO dao = new ScoreDAO();
        for (Score item : scores) {
            Score score = ScoreDAO.GetScoreByUserIdExerid(item.getUserid(),item.getExerid());
            //hpham set trang thai tai day.
            score.setStatus(1);
            dao.updateOnSubmint(score);
        }
    }
    
    public static List<Score> GetScoreByUserid(int userid) {
        ScoreDAO dao = new ScoreDAO();
        List<Score> list = dao.getAll();
        List<Score> scores = new LinkedList<Score>();
        for (Score item : list) {
            if (item.getUserid() == userid && item.getStatus() == -1) {
                scores.add(item);
            }
        }
        return scores;
    }
}
