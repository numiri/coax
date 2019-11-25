package com.coax.db.dao;

import com.coax.db.dto.*;

import java.io.UnsupportedEncodingException;
import java.sql.CallableStatement;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Base64;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class UsersDAO extends IData<Users> {

    public UsersDAO() {
    }

    @Override
    protected Object OnSubmit(Users item, int t) {
        // TODO Auto-generated method stub
        this.sToreprocedure = "{ CALL CRUDusers (?,?,?,?,?,?,?,?,?,?,?,?) }";
        Subconfig fig = Subconfig.getInstance();
        fig.init();
        Object result = -1;
        try {
            CallableStatement cs = (CallableStatement) fig.connec.prepareCall(this.sToreprocedure);
            cs.registerOutParameter(1, java.sql.Types.BIGINT);
            if (t != 0) {
                cs.setLong(1, item.getId());
            }
            cs.setInt("p_"+Users.c_usermode, item.getUserModeid());
            cs.setString(3, item.getName());
            Base64.Encoder enc= Base64.getEncoder();
            byte[] strenc = enc.encode(item.getPassword().getBytes("UTF-8"));
            cs.setString(4, new String(strenc,"UTF-8"));
            cs.setString(5, item.getEmail());
            cs.setString(6, item.getFullName());
            cs.setInt(7, item.getStatus());
            cs.setShort(8, item.getUserType());
            java.util.Date birth = item.getBirthDay();
            cs.setDate(9, new java.sql.Date(birth.getYear(), birth.getMonth(), birth.getDate()));
            cs.setString(10, item.getAddress());
            cs.setString(11, item.getPhone());
            cs.setInt(12, t);//cs.executeQuery();
            cs.execute();
            result = cs.getLong("p_id");
            System.out.println("id " + cs.getLong("p_id"));

        } catch (SQLException e) {
            e.printStackTrace();
        }
        catch (UnsupportedEncodingException e) {
           e.printStackTrace();
        }
        fig.close();
        return result;
    }

    @Override
    protected Users getItem(ResultSet rs) {
        // TODO Auto-generated method stub
        Users item = new Users();
        try {
            item.setAddress(rs.getString(Users.c_address));
            item.setBirthDay(rs.getDate(Users.c_birthDay));
            item.setCreatedOn(rs.getDate(Users.c_createdOn));
            item.setEmail(rs.getString(Users.c_email));
            item.setFullName(rs.getString(Users.c_fullName));
            item.setId(rs.getLong(Users.c_Id));
            item.setUserModeid(rs.getInt(Users.c_usermode));
            item.setName(rs.getString(Users.c_name));
            item.setPassword(rs.getString(Users.c_password));
            item.setPhone(rs.getString(Users.c_phone));
            item.setStatus(rs.getByte(Users.c_status));
            item.setUserType(rs.getShort(Users.c_userType));

        } catch (SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return item;
    }

    @Override
    public List<Users> getAll() {
        // TODO Auto-generated method stub
        String mySql = "{ call GetUsers() }";
        return this.getAll(mySql);
    }

    /**
     * @param username :Truyền vào username
     * @return :trả về true khi username đó tồn tại ngược lại là false khi ko
     * tồn tại
     */
    public boolean IsUserExists(String username) {
        List<Users> users = getAll();

        for (Users item : users) {
            if (item.getName().trim().compareToIgnoreCase(username) == 0) {
                return true;
            }
        }
        return false;

    }

    /**
     * @param email :Truyền vào email để kiểm tra có tồn tại hay không
     * @return :Nếu email đã tồn tại trả về true ngược lại trả và false
     */
    public boolean IsEmailExists(String email) {
        List<Users> users = getAll();
        email = email.trim();
        for (Users item : users) {
            if (item.getEmail().trim().compareTo(email) == 0) {
                return true;
            }
        }
        return false;

    }
    ///////////////

    /**
     * @param username : truyền vào username
     * @param password :truyền vào password
     * @return :Trả về đối tượng users
     */
    public Users login(String username, String password) {
      Users item = null;
      String procedure = "{ call login (?,?)}";
      String[] params = {"p_name", "p_password"};
      Base64.Encoder enc= Base64.getEncoder();
      try {
         byte[] strenc = enc.encode(password.getBytes("UTF-8"));
         Object[] obj = {username, new String(strenc,"UTF-8")};
         List<Users> list = this.getItem(procedure, params, obj);
         if (list.size() > 0) item = (Users) list.get(0);
      } catch (UnsupportedEncodingException e) {
         
      }
      return item;
    }

    public static Users LoginMd5(String username, String password) {
        UsersDAO dao = new UsersDAO();
        List<Users> list = dao.getAll();
        for (Users item : list) {
            String md5pass = Utils.getMD5(item.getPassword());
            if (md5pass.compareToIgnoreCase(password) == 0) {
                return item;
            }
          
        }
          return null;
    }

    @Override
    public String getJson(List<Users> list) {
        // TODO Auto-generated method stub
        String sJson = "[";
        int flag = 0;
        for (int i = 0; i < list.size(); i++) {
            Users item = (Users) list.get(i);
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
/***********************************************/
    public boolean isAdministrator(long userId)                               {
       boolean result = false;
       String sql = "select g.id from groups g, groups_users gu "
       + "where name='admins' and g.id=gu.groupId and gu.userId = " + userId;
       Subconfig fig = Subconfig.getInstance();
       fig.init();
       try                                                                    {
          Statement st = fig.connec.createStatement() ;
          ResultSet rs = st.executeQuery(sql);
          while(rs.next())                                                    {
             result = true;
             break;
          }//while
          st.close();
          rs.close();
       }catch (SQLException ex) {
          Logger.getLogger(IData.class.getName()).log(Level.SEVERE, null, ex);
       }
       fig.close();
       return result;                                                         }
/************************************************/

}
