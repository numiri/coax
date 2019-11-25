/******************************************************************************
* Bacon.java (data-BAse-CONnection)
*******************************************************************************
* jdbc wrappers from Apache's dbUtils library.  info on dbUtils is here:
* http://commons.apache.org/proper/commons-dbutils/
******************************************************************************/

package com.coax.db.dao;

import java.sql.*;
import java.util.Properties;
import java.util.InvalidPropertiesFormatException;
import java.io.*;
import java.util.regex.Matcher;
import javax.sql.DataSource; // snguyen-130326
import org.apache.commons.dbcp.BasicDataSource;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.DbUtils;
import org.apache.commons.dbutils.handlers.ArrayListHandler;

public class Bacon                                                            {

// these variables need to be static
// otherwise, we get compile error
//    "non-static variable ... cannot be referenced from a static context"
// but dbcp's Javadoc says setUrl() methods are nonstatic !?!
//
// Ex.  Driver = com.mysql.jdbc.Driver
//      Url = jdbc:mysql://localhost:3306/ + dbcoax

private static String Username = "";
private static String password = "";
private static String Url = "";
private static String Dbname = "";
private static String Driver = "";
public  DataSource ds;

/******************************************************************************
* constructor
******************************************************************************/

public Bacon()                                                                {
   readXmlConfig();
   ds   = setupDataSource();                                                  }

/******************************************************************************
* handle( ResultSet ) - executes sql & returns the 1ST row as an Object array
******************************************************************************/

public static DataSource setupDataSource()                                    {
   BasicDataSource ds = new BasicDataSource();
   ds.setDriverClassName( Driver );
   ds.setUsername( Username );
   ds.setPassword( password );
   ds.setUrl( Url + Dbname );
   ds.setMaxActive(10);
   ds.setMaxIdle(5);
   ds.setInitialSize(5);
   ds.setValidationQuery("SELECT 1");
   return ds;                                                                 }

ResultSetHandler<Object[]> rsHandler = new ResultSetHandler<Object[]>()       {
public Object[] handle(ResultSet rs) throws SQLException                      {
   if (!rs.next())  return null;
   ResultSetMetaData meta = rs.getMetaData();
   int cols = meta.getColumnCount();
   Object[] result = new Object[cols];
   for (int i = 0; i < cols; i++) result[i] = rs.getObject(i + 1);
   return result;                                                          } };

ResultSetHandler alHandler = new ArrayListHandler();
QueryRunner run = new QueryRunner( ds );

/*****************************************************************************
* these 2 function readXmlConfig() & getPath() duplicates Subconfig.java.  
* eventually Subconfig.java will be phased out.  Assume a hardcoded function 
* name "config.xml"
******************************************************************************/

private void readXmlConfig() {
    String value;
    String key;
    Properties prop = new Properties();
    String path = Subconfig.class.getProtectionDomain().getCodeSource().getLocation().getPath();
    path = this.getPath(path);
    path = path + File.separator + "config.xml";

    try {   // + File.separatorChar
       prop.loadFromXML( new FileInputStream( path ));               }
    catch (InvalidPropertiesFormatException e) { e.printStackTrace();         }
    catch (FileNotFoundException            e) { e.printStackTrace();         }
    catch (IOException                      e) { e.printStackTrace();         }

    key = "Driver";   Driver   = prop.getProperty(key);
    key = "Username"; Username = prop.getProperty(key);
    key = "password"; password = prop.getProperty(key);
    key = "Url";      Url      = prop.getProperty(key);
    key = "DbCoax";   Dbname   = prop.getProperty(key);                       }

    /**
     * @param path.Truyền vào 1 đường dẫn.
     * @return Trả về 1 đường dẫn lùi lại 2 cấp so với khi truyền vào
     */
    public  String getPath(String path){ 
    	path = path.replaceAll(Matcher.quoteReplacement("\\"), Matcher.quoteReplacement(File.separator));
        path = path.replaceAll(Matcher.quoteReplacement("/"),  Matcher.quoteReplacement(File.separator));
        if(path.contains("!"))        {
        int indexOfExclaim = path.indexOf("!") ;
        String sExclamation = path.substring(indexOfExclaim,path.length());
        System.out.println(sExclamation);
        path = path.replaceAll(Matcher.quoteReplacement(sExclamation), Matcher.quoteReplacement(""));
            int lastindex = path.lastIndexOf(File.separator);
        if (lastindex != -1) {
            path = path.substring(0, lastindex);        }
        }
        int lastindex = path.lastIndexOf(File.separator);
        if (lastindex != -1) {
            path = path.substring(0, lastindex);
            lastindex = path.lastIndexOf(File.separator);
            if (lastindex != -1) {
                path = path.substring(0, lastindex);            }      }     
    	return path;    }

}
