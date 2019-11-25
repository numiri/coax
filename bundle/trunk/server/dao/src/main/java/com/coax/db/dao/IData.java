package com.coax.db.dao;
import java.util.*;
import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author phuctq
 *Class nÃ y khai bÃ¡o cÃ¡c hÃ m áº£o cho cÃ¡c lá»›p káº¿ thá»«a tá»›i nÃ³.Thá»±c hiÃªn Insert,Update,delete,getItem,getAll.
 * @param <T>
 */
public abstract class IData<T> {

	/**
	 * TÃªn cá»§a 1 procedure Ä‘á»ƒ thá»±c hiá»‡n insert,update,delete
	 */
	public  String sToreprocedure = "";
	/**
	 * HÃ m khá»Ÿi táº¡o
	 */
	public IData(){

	}

        public String m_mySql = "";
        public void setMySql(String mysql){
            this.m_mySql = mysql;
        }
        
	/**
	 * @param item :Truyá»�n vÃ o danh sÃ¡ch Ä‘á»‘i tÆ°á»Ÿng.
	 * @return: HÃ m tráº£ vá»� kiá»ƒu  json Ä‘á»ƒ thá»±c hiá»‡n á»Ÿ client
	 */
	public abstract String getJson(List<T> list);

	/**
	 * @param item :Truyá»�n vÃ o 1 Ä‘á»‘i tÆ°á»£ng .VÃ­ dá»¥ : Users
	 * @param t :Truyá»�n vÃ o giÃ¡ trá»‹(0,1,2): tÆ°Æ¡ng á»©ng vá»›i: 0 lÃ  insert,1 lÃ  update,2 lÃ  delete
	 * @return :Tráº£ vá»� -1 hay 1 hay lÃ  id cá»§a Ä‘á»‘i tÆ°á»£ng
	 */
	protected abstract Object OnSubmit(T item,int t);

    /**
     * @param item: Truyá»�n vÃ o má»™t Ä‘á»‘i tÆ°á»£ng.Ä�á»ƒ ghi xuá»‘ng cÆ¡ sá»Ÿ dá»¯ liá»‡u
     * @return : tráº£ vá»� id cá»§a dÃ²ng vá»«a Ä‘Æ°á»£c ghi xuá»‘ng
     */
    public Object insertOnSubmit(T item){
    	return this.OnSubmit(item, 0);
    }

    /**
     * @param item.Cáº­p nháº­t láº¡i dÃ²ng Ä‘Æ°á»£c sá»­a tÆ°Æ¡ng á»©ng vá»›i Ä‘á»‘i tÆ°á»£ng
     * @return.
     */
    public Object updateOnSubmint(T item){
    	return this.OnSubmit(item, 1);
    }

public Object updateOnSubmint(T item, int t){ return this.OnSubmit(item, t); }

    /**
     * @param item.HÃ m xÃ³a Ä‘i 1 dÃ²ng trong cá»Ÿ sá»Ÿ dá»¯ liá»‡u
     * @return
     */
    public Object deleteOnSubmint(T item){
    	return this.OnSubmit(item, 2);
    }
  /**
     * @param Object id.HÃ m xÃ³a Ä‘i 1 dÃ²ng trong cá»Ÿ sá»Ÿ dá»¯ liá»‡u
     * @return
     */
    public Object deleteItem(Object id){
        Object result = 0;
        Subconfig fig = Subconfig.getInstance();
	fig.init();
            try {
                PreparedStatement cs = fig.connec.prepareStatement(this.m_mySql);
                cs.setObject(1, id);
                int i = cs.executeUpdate();
                if(i <=0){
                    result = 0;
                }
                else{
                    result = id;
                }
                cs.close();
            } catch (SQLException ex) {
                Logger.getLogger(IData.class.getName()).log(Level.SEVERE, null, ex);
            }
        fig.close();
        return result;
    }
    /**
     * @param rs.Ä�á»‘i sá»‘ truyá»�n vÃ o 1 dÃ²ng dá»¯ liá»‡u
     * @return tráº£ vá»� 1 Ä‘á»‘i tÆ°á»£ng tÆ°Æ¡ng á»©ng vá»›i dÃ²ng dá»¯ liá»‡u Ä‘Ã³.VÃ­ dá»¥ : Users,Historys ...
     */
    protected abstract T getItem(ResultSet rs);

    /**
     * @return.Tráº£ vá»� danh sÃ¡ch cÃ¡c dÃ²ng.
     */
    public abstract List<T> getAll();
    /**
     * @param mySql: truyá»�n vÃ o 1 cÃ¢u truy váº¥n hay 1 procedure khÃ´ng cÃ³ tham sá»‘ :vÃ­ dá»¥ : select * from tableName hay { call GetUsers() }
     * @return :Tráº£ vá»� danh sÃ¡ch cÃ¡c dÃ²ng tÆ°Æ¡ng á»©ng vá»›i Ä‘á»‘i tÆ°á»£ng cáº§n sá»­ dá»¥ng
     */
    public List<T> getAll(String mySql){
    	Subconfig fig = Subconfig.getInstance();
    	fig.init();
    	ResultSet rs;
    	List<T> list = new ArrayList<T>();
        //Connection connec = fig.connec;//new Connection();// = Mo_ket_noi();
        try
        {
            Statement st = fig.connec.createStatement() ;//kq.createStatement();
            rs = st.executeQuery(mySql);
            while(rs.next()){
            	list.add(getItem(rs));
            }
            rs.close();
            st.close();
        }
        catch(SQLException ex){

        }
        fig.close();
    	return list;
    }

    //// Ham lay ve thong tin cua class.Truyen vao ten procedure va cac tham so
    /**
     * @param procedure :Truyá»�n vÃ o tÃªn cá»§a 1 procedure. VÃ­ dá»¥    : getLogins
     * @param params :Danh sÃ¡ch cÃ¡c tham sá»‘ cá»§a 1 procedure.VÃ­ dá»¥ :p_userName,p_password
     * @param obj :Danh sÃ¡ch giÃ¡ trá»‹ tÆ°Æ¡ng á»©ng vá»›i tham sá»‘ :VÃ­ dá»¥ :phuc,1234
     * @return :Tráº£ vá»� danh sÃ¡ch Ä‘á»‘i tÆ°Æ¡ng tÆ°ng á»©ng vá»›i cÃ¡c dÃ²ng cá»§a báº£ng dá»¯ liá»‡u Ä‘Æ°á»£c truy váº¥n trong database
     */
    public  List<T> getItem(String procedure ,String []params,Object []obj){
    	List<T> list = new ArrayList<T>();
    	Subconfig fig = Subconfig.getInstance();
		fig.init();
		ResultSet rs;
		CallableStatement cs;
		try {
			cs = (CallableStatement)fig.connec.prepareCall(procedure);
			for(int i = 0; i < obj.length ;i++){
				cs.setObject(params[i],obj[i]);
			}
			rs = cs.executeQuery();
			while(rs.next()){
            	list.add(getItem(rs));
            }
			cs.close();
			rs.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		fig.close();
    	return list;
    }
    // extension of getItem(String procedure ,String []params,Object []obj)
    // this will return null if there is any error.
    public List<T> getItem_Nullable(String procedure, String[] params, Object[] obj){
       List<T> list = null;
       Subconfig fig = Subconfig.getInstance();
       fig.init();
       ResultSet rs = null;
       CallableStatement cs = null;
       try {
          cs = (CallableStatement)fig.connec.prepareCall(procedure);
          for(int i = 0; i < obj.length ;i++){
             cs.setObject(params[i],obj[i]);
          }
          rs = cs.executeQuery();
          list = new ArrayList<T>();
          while(rs.next()){
                list.add(getItem(rs));
             }
       } catch (SQLException e) {
          System.out.println("IData getItem_Nullable "+e.toString());
       } finally{
          if(cs != null) try {cs.close();} catch (SQLException e) {}
          if(rs != null) try {rs.close();} catch (SQLException e) {}
       }
       fig.close();
       return list;
     }    

    public List<T> query(String mysql,Object ... params){
        List<T> list = new ArrayList<T>();
        Subconfig fig = Subconfig.getInstance();
        fig.init();
        ResultSet rs;		
        PreparedStatement st;
            try {
                st = fig.connec.prepareStatement(mysql);
                for(int i = 0;i < params.length;i++){
                    st.setObject(i+1, params[i]);
                }
                rs = st.executeQuery();
                while(rs.next()){
                     list.add(getItem(rs));
                 }
                 st.close();
                 rs.close();
            } catch (SQLException ex) {
                Logger.getLogger(IData.class.getName()).log(Level.SEVERE, null, ex);
            }
            fig.close();
        return list;
    }
    
      //// Ham lay ve thong tin cua class.Truyen vao ten procedure va cac tham so
    /**
     * @param mysql :Truyá»�n vÃ o tÃªn cá»§a 1 chuoi msql    : "select * from users where username=? and pass=?"     
     * @param obj :Danh sÃ¡ch giÃ¡ trá»‹ tÆ°Æ¡ng á»©ng vá»›i tham sá»‘ :VÃ­ dá»¥ :phuc,1234
     * @return :Tráº£ vá»� danh sÃ¡ch Ä‘á»‘i tÆ°Æ¡ng tÆ°ng á»©ng vá»›i cÃ¡c dÃ²ng cá»§a báº£ng dá»¯ liá»‡u Ä‘Æ°á»£c truy váº¥n trong database
     */
    public  List<T> getItems(String mysql ,Object []obj){
    	List<T> list = new ArrayList<T>();
    	Subconfig fig = Subconfig.getInstance();
		fig.init();
		ResultSet rs;
                PreparedStatement st;
		try {
                       st = fig.connec.prepareStatement(mysql);
			for(int i = 0; i < obj.length ;i++){			
                            st.setObject(i+1, obj[i]);
			}
                        rs = st.executeQuery();
			while(rs.next()){
                            list.add(getItem(rs));
                        }
                        st.close();
			rs.close();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		fig.close();
    	return list;
    }    
    /**prepareStatement
     * @param procedure : tÃªn procedure trong cÆ¡ sá»Ÿ dá»¯ liá»‡u
     * @param params    : Danh sÃ¡ch cÃ¡c tham sá»‘ tÆ°Æ¡ng á»©ng vá»›i procedure
     * @param obj		: Danh sÃ¡ch cÃ¡c giÃ¡ trá»‹ tÆ°Æ¡ng á»©ng vá»›i params.HÃ m nÃ y thá»±c hiá»‡n chá»©c nÄƒng cáº­p nháº­t láº¡i dá»¯ liá»‡u trong 1 record
     */
    public void executeUpdate(String procedure,String []params,Object []obj){
    	Subconfig fig = Subconfig.getInstance();
		fig.init();
		CallableStatement cs;
		try {
			cs = (CallableStatement)fig.connec.prepareCall(procedure);
			for(int i = 0; i < obj.length ;i++){
				cs.setObject(params[i],obj[i]);
			}
			cs.executeUpdate();
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
     /**
     * @param procedure : tÃªn procedure trong cÆ¡ sá»Ÿ dá»¯ liá»‡u
     * @param params    : Danh sÃ¡ch cÃ¡c tham sá»‘ tÆ°Æ¡ng á»©ng vá»›i procedure
     * @param obj		: Danh sÃ¡ch cÃ¡c giÃ¡ trá»‹ tÆ°Æ¡ng á»©ng vá»›i params.HÃ m nÃ y thá»±c hiá»‡n chá»©c nÄƒng cáº­p nháº­t láº¡i dá»¯ liá»‡u trong 1 record
     */
    public Object executeUpdate(String mysql,Object []obj,int t){//t = 0 insert,1 edit,2 delete
    	Subconfig fig = Subconfig.getInstance();
        this.m_mySql = mysql;
        fig.init();
        Object result = 0;
        try {
            PreparedStatement cs = fig.connec.prepareStatement(this.m_mySql);
            if(t == 0){
                cs = fig.connec.prepareStatement(this.m_mySql,PreparedStatement.RETURN_GENERATED_KEYS);
            }
            for(int i = 0; i < obj.length ;i++){
                cs.setObject(i+1, obj[i]);
            }
           result = (long)cs.executeUpdate();
           if(t == 0) {
               ResultSet keyResultSet = cs.getGeneratedKeys();
               if (keyResultSet.next()) {
                    result = (long) keyResultSet.getInt(1);      
                }
           }
           cs.close();
         } catch (SQLException e) {
            e.printStackTrace();
            result = -1;
      	}
        return result;
    }
        // insert delete update thanh cong tra ve 1 nguoc lai la 0
    public Object update(String mysql,Object ... params){
        Object result = 0;
        Subconfig fig = Subconfig.getInstance();
        this.m_mySql = mysql;
        int t =-1;
        String m = this.m_mySql.toLowerCase();
        m = m.trim();
        String insert = "insert".toLowerCase();
        if(m.indexOf(insert) > -1){
            t = 0;
        }
        fig.init();
        try {
          PreparedStatement cs = fig.connec.prepareStatement(this.m_mySql);
          if(t == 0){//lay id vua duoc insert
              cs = fig.connec.prepareStatement(this.m_mySql,PreparedStatement.RETURN_GENERATED_KEYS);
          }
           for(int i = 0; i < params.length ;i++){
                 cs.setObject(i+1, params[i]);
           }                 
           int k = cs.executeUpdate();
           if(t == 0 && k == 1){
               ResultSet keyResultSet = cs.getGeneratedKeys();
               if (keyResultSet.next()) {
                   result = (long) keyResultSet.getInt(1);      
               }
           }
           cs.close();
        } catch (SQLException ex) {
           Logger.getLogger(IData.class.getName()).log(Level.SEVERE, null, ex);
           result = -1;
        }
        fig.close();
        return result;
    }    
    
    public int delete(String mysql){        
        Subconfig fig = Subconfig.getInstance();
        int result = 0;
        fig.init();
        Statement st;
            try {
                st = fig.connec.createStatement();
                result = st.executeUpdate(mysql);
            } catch (SQLException ex) {
                result = 0;
            }        
        fig.close();
        return result;
    }
    
    
}
