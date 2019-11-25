package com.coax.db.dao;
import java.sql.*;
import java.io.*;
import java.util.InvalidPropertiesFormatException;
import java.util.Properties;
import java.util.regex.Matcher;
import javax.sql.DataSource; // snguyen-130326
import org.apache.commons.dbcp.BasicDataSource;

/*  tracing the path to config xml files:
1.  browser hits http://<ip:port>/coax-web-sdang/login.jsp ->
2.  sdang/action/dologin.jsp ->
3.  WEB-INF/lib/coax-db.jar :: UsersDAO.java -> 
4a. Subconfig.java -> readXMLConfig { Subconfig.class...getPath() -> 
4b. this function steps up 2 levels to sdang/config.xml.  
    the file name "config.xml" is hard-coded here }
*/

//
// Here are the dbcp-specific classes.
// Note that they are only used in the setupDataSource
// method. In normal use, your classes interact
// only with the standard JDBC API
//

/**
 * @author phuctq.
 *Class này thực hiện chức năng đóng mở cở sở dữ liệu,kết nối tới cơ sở dữ liệu đọc file cấu hình config.xml
 */
public class Subconfig {

    private static Subconfig instance = null;
    private String password = "";
    private String username = "";
    private String dbName = "dbcoax";
    private String driver = "com.mysql.jdbc.Driver";//org.apache.derby.jdbc.EmbeddedDriver ;//org.apache.derby.jdbc.ClientDriver
    private String url = "jdbc:mysql://localhost:3306";//access ; @"jdbc:mysql://localhost:8080 mysql" ////localhost:1527/
    //    private String dbName = "E:\\active-math\\activemath-1.0.1-bin\\activemath-1.0.1\\data\\db\\derby-am-core-db;create=true";//"C:\\Users\\phuctq\\workspace\\activemath-cox\\data\\db\\derby-am-core-db";//Users\\phuctq\\workspace\\phuc-tess-Active-math\\data\\db\\derby-am-core-db
    //    private String driver = "org.apache.derby.jdbc.ClientDriver";//org.apache.derby.jdbc.EmbeddedDriver ;//org.apache.derby.jdbc.ClientDriver
    //    private String url = "jdbc:derby://localhost:1527/";//access ; @"jdbc:mysql://localhost:8080 mysql" ////localhost:1527/
    private String m_Path = "";

    public void setPath(String path) { this.m_Path = path; }
    /**
     * Khi mở dữ liệu thành công thì connec khác null.Thực hiện các hàm liên quan đến cơ sở dữ liệu
     */
    public Connection connec = null;

    private Subconfig() { m_Path = ""; }

    /* (non-Javadoc)
     * @see java.lang.Object#toString() In thông tin của 1 đối tượng
     */
    public String toString() {
        String s = "";
        s = s + "{ " + " url : " + this.url + ", driver :" + this.driver;
        s = s + ", databaName :" + this.dbName + ", username :" + this.username + ", password :" + this.password + " }";
        return s;
    }

    /**
     * @return Hàm khởi tạo 1 đối tượng 
     */
    public static Subconfig getInstance() {

        if (instance == null) {
            instance = new Subconfig();
        }
        return instance;
    }

    /**
     * @param driver .Truyền vào drive để sử dụng khi làm việc với database.Ví dụ :com.mysql.jdbc.Driver 
     */
    public void setDriver(String driver) {
        this.driver = driver;
    }

    /**
     * @param url.Truyền vào địa chỉ của database(localhost hay 192.168.1.10) ví dụ :jdbc:mysql://localhost:3306/
     */
    public void setUrl(String url) {
        this.url = url;
    }

    /**
     * @param userName :Truyền với userName của cơ sở dữ liệu.Ví dụ :root
     */
    public void setUserName(String userName) {
        this.username = userName;
    }

    /**
     * @param passWord.Truyền vào pass của cơ sở dữ liệu.Ví dụ :1234
     */
    public void setPassWord(String passWord) {
        this.password = passWord;
    }

    /**
     * @param dataBaseName.Tên 1 database.Ví dụ :dbcoax
     */
    public void setdataBaseName(String dataBaseName) {
        this.dbName = dataBaseName;
    }

    /**
     * @return.
     */
    public String getDriver() {
        return this.driver;
    }

    public String getUrl() {
        return this.url;
    }

    public String getUserName() {
        return this.username;
    }

    public String getPassWord() {
        return this.password;
    }

    public String getdataBaseName() {
        return this.dbName;
    }

    /**
     * Hàm này gọi để mở cở sở dữ liệu
     */
    public void connection() {
        Connection connec = null;
        try {
            @SuppressWarnings("unused")
            String myconnecString = this.url + this.dbName;
            Class.forName(this.driver).newInstance();
            //connec = DriverManager.getConnection(myconnecString, this.username, this.password);
            if (this.username == "" || this.password == "") {
                connec = DriverManager.getConnection(myconnecString);//, info
            } else {
                connec = DriverManager.getConnection(myconnecString, this.username, this.password);
            }
            System.out.println("ket noi thanh cong!");
        } catch (Exception ex) {
            connec = null;
            System.out.println("That bai " + ex.toString());
        }
        this.connec = connec;
        //return connec;
    }

    /**
     * Đóng cở sở dữ liệu khi không làm việc nữa
     */
    public void close() {
        if (this.connec != null) {
            try {
                this.connec.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }

    /**
     * Hàm gọi khởi tạo và mở cơ sở dữ liệu đồng thời đọc thông tin từ file config.xml
     */
    public void init() {
        this.readXMLConfig();
        //ham nay se doc tu XML len trong cau hinh config
        this.setUrl(this.url);//
        //this.setUrl("jdbc:mysql://localhost:3306/");//
        this.setdataBaseName(this.dbName);
        this.setDriver(this.driver);
        this.setUserName(this.username);
        this.setPassWord(this.password);//Heather1
        //this.setPassWord("1234");//Heather1
        this.connection();
    }

    /**
     * @param path.Truyền vào 1 đường dẫn.
     * @return Trả về 1 đường dẫn lùi lại 2 cấp so với khi truyền vào
     */
    public  String getPath(String path){ 
        
    	path = path.replaceAll(Matcher.quoteReplacement("\\"), Matcher.quoteReplacement(File.separator));
        // System.out.println("Replace \\:" + path);
        path = path.replaceAll(Matcher.quoteReplacement("/"),  Matcher.quoteReplacement(File.separator));
        // System.out.println("Replace /:" + path);        
           if(path.contains("!"))
        {
        int indexOfExclaim = path.indexOf("!") ;
        String sExclamation = path.substring(indexOfExclaim,path.length());
        System.out.println(sExclamation);
        path = path.replaceAll(Matcher.quoteReplacement(sExclamation), Matcher.quoteReplacement(""));
            int lastindex = path.lastIndexOf(File.separator);
        if (lastindex != -1) {
            path = path.substring(0, lastindex);
        }
        }
        int lastindex = path.lastIndexOf(File.separator);
        if (lastindex != -1) {
            path = path.substring(0, lastindex);
            // System.out.println("Duong dan dau cat 1:" + path);
            lastindex = path.lastIndexOf(File.separator);
            if (lastindex != -1) {
                path = path.substring(0, lastindex);
            }

        }     
    	return path;
    }

    /**
     * 
     */
    private void readXMLConfig() {
        Properties prop = new Properties();
        String path = Subconfig.class.getProtectionDomain().getCodeSource().getLocation().getPath();
        // System.out.println("Duong dan dau tien:" + path + "File.separator" + File.separator);
        /*
        path = path.replaceAll(Matcher.quoteReplacement("\\"), Matcher.quoteReplacement(File.separator));
        System.out.println("Replace \\:" + path);
        path = path.replaceAll(Matcher.quoteReplacement("/"), Matcher.quoteReplacement(File.separator));
        System.out.println("Replace /:" + path);        
        int lastindex = path.lastIndexOf(File.separator);

        if (lastindex != -1) {
            path = path.substring(0, lastindex);
            System.out.println("Duong dan dau cat 1:" + path);
            lastindex = path.lastIndexOf(File.separator);
            if (lastindex != -1) {
                path = path.substring(0, lastindex);
            }

        }
        */
        path = this.getPath(path);
        path = path + File.separator + "config.xml";
       // path = "/home/ddo" + File.separator + "config.xml";
        System.out.println("PATH" + path);
        try {
            prop.loadFromXML(new FileInputStream(this.m_Path=path));// + File.separatorChar
        } catch (InvalidPropertiesFormatException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        String key = "Driver";
        String value = prop.getProperty(key);
        this.driver = value;
        key = "Username";
        value = prop.getProperty(key);
        this.username = value;
        key = "password";
        value = prop.getProperty(key);
        this.password = value;
        key = "Url";
        value = prop.getProperty(key);
        this.url = value;
        key = "DbCoax";
        value = prop.getProperty(key);
        this.dbName = value;
    }
}
