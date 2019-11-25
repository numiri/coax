package com.coax.db.dao;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.dbutils.QueryRunner;

import com.coax.db.dto.Exercises;
// snguyen-130326
import com.coax.db.dto.Folder;

public class ExerciseDAO extends IData<Exercises> {

/******************************************************************************
* init stuff
*******************************************************************************
* setup db connections.  the dataSource should probably go into Subconfig.java
******************************************************************************/

public Bacon bacon;
public QueryRunner run;
private String[] result = { "-1", "-1", "x", "x", "x", "x", "x", "xd", "x", "0"}; //b
private String mostCols = "id, userid, content, formula, stroke, variable, "
+                          "amid, created_on, friendly_id, skip_corx " ;

public ExerciseDAO()                                                          {
   bacon = new Bacon();
   run = new QueryRunner( bacon.ds );                                         }

/*****************************************************************************
* database functions
******************************************************************************
*
*a must initialize resultObject in order to compile
*b this is a crappy way of creating an array of strings, but this fails  
*  String[] result = Arrays.copyOf( resultObject, resultObject.length
*  ,   String[].class);
*c I hate to hard code the ordering of types as long-long-string-string-...
* 
*****************************************************************************/

/*  IData implementation:
    String sql = "select * from exercises where amid is null and userid = " 
    +             userid.toString();
    List<Exercises> exercises = this.getAll( sql );
    return exercises;                                                         }
*/


// "Nam" = non-activemath
/*
public List<Exercises> getNamExercisesByUser( Long userid )                   {
    List<Object[]> resultList = new ArrayList<Object[]>();
    try                                                                       {
       resultList = (List<Object[]>) run.query( ""
       +   "select " + mostCols 
       +   "from exercises where amid is null and userid = ?"
       ,   bacon.alHandler, userid ); }
    catch (SQLException e) { e.printStackTrace(); }
return rows2Exercises( resultList );                                          }
*/
/*
public List<Exercises> getNamExercisesByUser( Long userid )                   {
   
   UsersDAO userdao = new UsersDAO();
   boolean isAdmin = userdao.isAdministrator(userid);
   String query = "";
   if(isAdmin){
      query = "select * from exercises where amid is null";
   }
   else{
      FolderDAO folderdao = new FolderDAO();
      List<String> selectedFolderIds = folderdao.getAssignedFolderIds(userid);
      String selectedFlds = "";
      for (int i = 0; i < selectedFolderIds.size(); i++)
         selectedFlds += "," + selectedFolderIds.get(i);
      if (selectedFlds.startsWith(",")) selectedFlds = selectedFlds.substring(1);
      query = "select * from exercises where amid is null "
            + "and ( userid = " + userid + " ";
      if(!selectedFlds.equals("")){
         query += "or id in (select exerciseId from folder_exercise "
               +  "where folderId in ("+selectedFlds+")) ";
      }
      query += " )";
   }
   System.out.println("getNamExercisesByUser:\n "+query);
   List<Exercises> resultList = this.getAll(query);
   return resultList;
}
*/
public Exercises getExerciseModeById( Long id, String mode )                  {
    String namMode =  mode.equals("standalone") ? " and amid is NULL " : "";
    Object obj[] = {id};
    String mysql = "select * from exercises where id = ? "+namMode;
    System.out.println("getExerciseModeById with id = "+id+" mode="+mode+"\n"+mysql);
   List<Exercises> list = this.getItems(mysql, obj);
   if(list.size()>0) return (Exercises)list.get(0);                                        
   return null;                                                                }

// retrieve the max(id) exercise authored by this user
public Exercises getMaxidExerciseOf( String userid )                   {
   Object obj[] = {userid};
    String mysql = "select * from exercises where id = "
            +"(select max(id) from exercises where userid = ?)";
List<Exercises> list = this.getItems(mysql, obj);
return (Exercises)list.get(0);                                         }

/*****************
* insertExercise() - returns the number of rows inserted. isn't this always 1?
*****************/

public int insertExercise( Exercises item )                                   {
   int insert = 0;
   try                                                                        {
   insert = run.update( "" 
   + "insert into exercises "
   + "(userid,content,formula,stroke,variable,amid,friendly_id,skip_corx) "
   + "values (?, ?, ?, ?, ?, NULL, ?, ?)"
   , item.getUserid(),  item.getContent(), item.getFormula(), item.getStroke()
   , item.getVariable(),item.getFriendlyId(), item.getSkip_corx());    }
   catch (SQLException e) { e.printStackTrace();                              } 
   return insert;                                                             }

/******************
* updateExercises() - returns the number of rows updated
******************/

public int updateExercise( Exercises item )                                   {
   int update = 0;
   try                                                                        {
   update = run.update( "" 
   +  "update exercises set content = ?, formula = ?, "
   +  "       stroke = ?, variable = ?, amid = NULL, userid = ? ,"
   +  "       friendly_id= ?, skip_corx = ? "
   +  "where  id = ?" 
   ,  item.getContent(),         item.getFormula(), item.getStroke()
   ,  item.getVariable(),        item.getUserid(),  item.getFriendlyId()
   ,  item.getSkip_corx(),item.getId()); 
   return update;                                                             }
   catch (SQLException e) { e.printStackTrace(); return update;             } }
/****************/
public int updateExercise( Exercises item, long userid, boolean isAdmin )     {
   int update = 0;
   try                                                                        {
      String query = "";
      if(isAdmin)                                                             {
         update = run.update( "" 
         +  "update exercises set content = ?, formula = ?, "
         +  "       stroke = ?, variable = ?, amid = NULL, userid = ? ,"
         +  "       friendly_id= ?, skip_corx = ? "
         +  "where  id = ?" 
         ,  item.getContent(),   item.getFormula(), item.getStroke()
         ,  item.getVariable(),  item.getUserid(),  item.getFriendlyId()
         ,  item.getSkip_corx(), item.getId());                               }
      else{
         update = run.update( "" 
         +  "update exercises set content = ?, formula = ?, "
         +  "       stroke = ?, variable = ?, amid = NULL,"
         +  "       friendly_id= ?, skip_corx = ? "
         +  "where  id = ? and userid = ?" 
         ,  item.getContent(),  item.getFormula(), item.getStroke()
         ,  item.getVariable(), item.getFriendlyId()
         ,  item.getSkip_corx(),item.getId(),      item.getUserid());         }
   
   return update;                                                             }
   catch (SQLException e) { e.printStackTrace(); return -1;                 } }

/******************
* deleteExercises() - returns the number of rows deleted
******************/

public int deleteExercise( long xizid )                                       {
   int delete = 0;
   try                                                                        {
//g rm   delete = run.update( "delete from  select_exercise where exerciseId = ?", xizid ); 
   delete = run.update( "delete from exercises where id = ?", xizid );
   run.update( "delete from folder_exercise where exerciseId = ?", xizid );
   return delete;                                                             }
   catch (SQLException e) { e.printStackTrace(); return delete;             } }
/****************/
public int deleteExercise( long xizid, long userid, boolean isAdmin )         {
   int delete = 0;
   try                                                                        {
      if(isAdmin){
         delete = run.update("delete from exercises where id = ?", xizid );
      }
      else{
         delete = run.update("delete from exercises where id= ? and userid= ?"
               , xizid,  userid);
      }
      if(delete>0){
         run.update( "delete from folder_exercise where exerciseId = ?",xizid);
      }
   return delete;                                                             }
   catch (SQLException e) { e.printStackTrace(); return -1;                 } }


/*****************************************************************************
* utility functions that may belong in com/coax/common/Cli/Utils.java
* but I don't know how to fix the error when importing com.coax.common.Cli
*     .../com/coax/db/dao/ExerciseDAO.java:[225,9] cannot find symbol
*     symbol  : method isEmpty(java.lang.String)
******************************************************************************/

public boolean isSubstantive( String s )                                      {
   return ( s!=null  &&  s!=""  &&  s!="null" ) ? true : false;               }

public boolean isEmpty( String s )                                            {
   return ( s==null  ||  s==""  ||  s=="null" ) ? true : false;               }
/*
// assumes the ordering defined in mostCols atttribute of this class
public Exercises row2Exercises( Object[] row )                             {
    int i=0;
    for (i=0; i<=1; i++) result[i] = String.valueOf(          row[i] );
    for (i=2; i<=6; i++) result[i] = String.valueOf( (String) row[i] );
    result[7] = String.valueOf( (Timestamp) row[7] );
    result[8] = String.valueOf(row[8] );
    Exercises xiz = new Exercises( result[0],result[1],result[2],result[3] 
    ,                              result[4],result[5],result[6] );
    xiz.setFriendlyId(result[8]);
    return xiz;                                                               }
*/
// this is a multi-row version of row2Exercises().  We should really make that 
// function a 1-item case of this function & retrofit its callers
public List<Exercises> rows2Exercises( List<Object[]> rows )                  {
    int i=0; 
    List<Exercises> xizs = new ArrayList<Exercises>();
    for ( Object[] row : rows )                                               {
       for (i=0; i<=1; i++) result[i] = String.valueOf(row[i]);
       for (i=2; i<=6; i++) result[i] = (String) row[i];
       result[7] = String.valueOf( (Timestamp) row[7] );
       result[8] = (String) row[8];
       result[9] = String.valueOf(row[9]);
       Exercises xiz = new Exercises( result[0], result[1], result[2]
       ,                   result[3], result[4], result[5], result[6] 
       ,                   result[8], "1".equals(result[9]));
       xizs.add( xiz );                                                       }
    return xizs;                                                              }

/*****************************************************************************
* deprecated
*****************************************************************************/

   @Override
    public Object OnSubmit(Exercises item, int t) {
	    Subconfig fig = Subconfig.getInstance();
        fig.init();
        System.out.println( "OnSubmit()" );
        Object result = -1;
        String amid = ( item.getAmid().trim() == "" ) ? "null" : item.getAmid();
        try {
            CallableStatement cs = (CallableStatement) fig.connec.prepareCall( "{CALL CRUDexercise (?,?,?,?,?,?,?,?)}" );
            cs.registerOutParameter(1, java.sql.Types.BIGINT);
            if (t != 0) cs.setLong(1, item.getId());
            cs.setString(2, item.getContent());
            cs.setString(3, item.getFormula());
            cs.setString(4, item.getStroke());
            cs.setString(5, item.getVariable());
            cs.setString(6, amid);
            cs.setLong(7, item.getUserid());
            cs.setInt(8, t);
            if (cs.execute())   result = 1;
        } catch (SQLException e) {
            System.out.println("err " + e.toString());
            e.printStackTrace();        }
        fig.close();
        return result;
    }

    @Override
    protected Exercises getItem(ResultSet rs) {
        Exercises item = new Exercises();
        try {
            item.setContent(rs.getString(Exercises.c_content));
            item.setCreated_on(rs.getDate(Exercises.c_created_on));
            item.setId(rs.getLong(Exercises.c_id));
            item.setUserid(rs.getLong(Exercises.c_userid));
            item.setFormula(rs.getString(Exercises.c_formula));
            item.setStroke(rs.getString(Exercises.c_stroke));
            item.setVariable(rs.getString(Exercises.c_variable));
            item.setXiznum(rs.getString(Exercises.c_xiznum));
            item.setAmid(rs.getString(Exercises.c_amid));
            item.setFriendlyId(rs.getString(Exercises.c_frienlyid));
            item.setSkip_corx(rs.getBoolean(Exercises.c_skip_corx));
        } catch (SQLException e) { e.printStackTrace();      }
        return item;    }

    @Override
    public List<Exercises> getAll() {
        String mySql = "{ call getExercises() }";
        return this.getAll(mySql);
    }

    public String buildJson( List<Exercises> list, String[] columns ) {
        String sJson = "[";
        int flag = 0;
        for (int i = 0; i < list.size(); i++) {
            Exercises item = (Exercises) list.get(i);
            if (i > 0)    sJson = sJson + ",";
            sJson = sJson + item.jsonObject1( columns );
            flag = 1;                         }
        sJson = sJson + "]";
        if (flag == 0)  sJson = "";
        return sJson;
    }

    @Override
    public String getJson( List<Exercises> list ) {
        String sJson = "[";
        int flag = 0;
        for (int i = 0; i < list.size(); i++) {
            Exercises item = (Exercises) list.get(i);
            if (i > 0)    sJson = sJson + ",";
            sJson = sJson + item.jsonObject();
            flag = 1;                         }
        sJson = sJson + "]";
        if (flag == 0)  sJson = "";
        return sJson;
    }    

    public static List<Exercises> getByUserMode(String usermode) {
        ExerciseDAO dao = new ExerciseDAO();
        Collection<Exercises> exercises = dao.getAll();
        List<Exercises> results = new LinkedList<Exercises>();
        if (usermode.compareToIgnoreCase(Mode.standalone.toString()) == 0) {
            for (Exercises item : exercises) {
                if ( item.getAmid() == null )          results.add(item); } }
        if (usermode.compareToIgnoreCase(Mode.connected.toString()) == 0) {
            for (Exercises item : exercises) {
                if (!item.getAmid().trim().equals(""))  results.add(item);  } }
        return results;
    }

}


