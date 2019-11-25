/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.db.dao;

import com.coax.db.dto.Bonus;
import com.coax.db.dto.Config;
import com.coax.db.dto.Exercises;
import com.coax.db.dto.Score;
import com.google.gson.Gson;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.AbstractMap;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 *
 * @author cz
 */
public class BonusDAO extends IData<Bonus> {

    @Override
    public String getJson(List<Bonus> list) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected Object OnSubmit(Bonus item, int t) {
        this.sToreprocedure = "{ CALL CRUDBonus (?,?,?,?,?,?,?,?,?) }";//hpham them tham bien moi de tinh giam diem
        Subconfig fig = Subconfig.getInstance();
        fig.init();
        Object result = -1;
        try {
            CallableStatement cs = (CallableStatement) fig.connec.prepareCall(this.sToreprocedure);
            cs.registerOutParameter(1, java.sql.Types.BIGINT);
            if (t != 0) {
                cs.setInt(1, item.getId());
            }
            cs.setInt(Bonus.c_id, item.getId());
            cs.setInt(Bonus.c_userid, item.getUserid());
            cs.setInt(Bonus.c_exerid, item.getExerid());
            cs.setInt(Bonus.c_bulbs, item.getBulbs());
            cs.setInt(Bonus.c_foods, item.getFoods());
            cs.setInt(Bonus.c_golds, item.getGolds());
            cs.setInt(Bonus.c_isused, item.isIsused());
            cs.setFloat(Bonus.c_redoreduction, item.getRedoReduction());//hpham them truong moi de tinh giam diem
            cs.setInt("action", t);
            cs.execute();
            result = cs.getLong(Bonus.c_id);
            System.out.println("id " + cs.getLong(Bonus.c_id));

        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        fig.close();
        return result;
    }

    @Override
    protected Bonus getItem(ResultSet rs) {
        Bonus item = new Bonus();
        try {
            item.setId(rs.getInt(Bonus.c_id));
            item.setExerid(rs.getInt(Bonus.c_exerid));
            item.setBulbs(rs.getInt(Bonus.c_bulbs));
            item.setFoods(rs.getInt(Bonus.c_foods));
            item.setGolds(rs.getInt(Bonus.c_golds));
            item.setIsused(rs.getInt(Bonus.c_isused));
            item.setUserid(rs.getInt(Bonus.c_userid));
            item.setRedoReduction(rs.getFloat(Bonus.c_redoreduction));//hpham 120929 them truong moi de tinh giam diem.
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return item;
    }

    @Override
    public List<Bonus> getAll() {
        String mySql = "{ call getBonus() }";
        return this.getAll(mySql);
    }

    public static Bonus GetBonus(int userid, int exerid) {
        BonusDAO dao = new BonusDAO();
        List<Bonus> list = dao.getAll();
        for (Bonus item : list) {
            if (item.getUserid() == userid && item.getExerid() == exerid && item.isIsused() == -1) {
                return item;
            }
        }
        return null;
    }

    public static Bonus GetBonusById(int id) {
        BonusDAO dao = new BonusDAO();
        List<Bonus> list = dao.getAll();
        for (Bonus item : list) {
            if (item.getId() == id) {
                return item;
            }
        }
        return null;
    }

    public static String ListToJson(List<Bonus> list) {
        Map<String, Object> model = new HashMap<String, Object>();
        model.put("bonus", list);
        Gson g = new Gson();
        String json = g.toJson(model);
        return json;
    }
/**
 * tinh toan lai so bong den sau khi user giai lai bai toan.
 * @param userid
 * @return 
 */
    public static List<Bonus> ReCalculatedBonus(int userid) {
        List<Score> scores = ScoreDAO.GetScoreByUserid(userid);
        System.out.println(scores.size());
        List<Bonus> bonuses = new LinkedList<Bonus>();
        for (Score item : scores) {
            Bonus bonus = BonusDAO.GetBonus(userid, item.getExerid());
            if (bonus != null) {
                item.setStatus(0);//set ve trang thai da duoc doc tu freeciv
                int bulbs = bonus.getBulbs() - (int)( ( bonus.getBulbs()*bonus.getRedoReduction() * item.getRedoCounts())/100);//hpham tinh lai bulbs sau khi giai lai bai toan
                int golds = bonus.getGolds() - (int) ((bonus.getBulbs()*bonus.getRedoReduction() * item.getRedoCounts())/100);
                bulbs = bulbs > 0 ? bulbs : 0;//set lai neu bi am
                golds = golds > 0 ? golds : 0;//set lai neu bi am
                bonus.setGolds(golds);
                bonus.setBulbs(bulbs);
                bonuses.add(bonus);
                
                int redocounts = item.getRedoCounts() +1;
                item.setRedoCounts(redocounts);
                ScoreDAO dao = new ScoreDAO();
                dao.updateOnSubmint(item);//update lai trang thai cho score.
            }
        }
        return bonuses;
    }
}
