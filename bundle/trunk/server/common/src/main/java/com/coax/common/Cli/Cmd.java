package com.coax.common.Cli;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;

/**
 * đươc sử dụng để gọi các command line liên quan tới cit và dracule.
 *
 * @author cz
 */
public class Cmd {

    protected static org.apache.commons.logging.Log log = org.apache.commons.logging.LogFactory.getLog(Cmd.class);
    private static String citpath = "";
    private static String citfence = "";
    private static String draculaPath = "";
    private static String workingPath = "";
    private static String activemathPath = "";
    private final static String ccitcmd = "citcmd";
    private final static String campath= "activemathpath";
    private final static String cdraculapath = "draculapath";
    private final static String cworkpath = "workpath";
    private final static String cconfigCmd = "configCmd.xml";
    private static String ccitfence = "citfence";

    /**
     * @return file thưc thi của cit và thư mục data của cit.
     */
    public static String getCitpath() {
        if ("".equals(citpath)) {

            setCitpath(GetXmlCofig(cconfigCmd, ccitcmd));
        }
        return citpath;
    }

    private static void setCitpath(String citpath) {
        log.info("duong dan cit path:" + citpath);
        Cmd.citpath = citpath;
    }

    /**
     * @return thu muc chứa các file thực thi của dracule.
     */
    public static String getDraculaPath() {
        if ("".equals(draculaPath)) {
            setDraculaPath(GetXmlCofig(cconfigCmd, cdraculapath));
        }
        return draculaPath;
    }

    private static void setDraculaPath(String draculaPath) {
        log.info("duong dan cit draculae:" + draculaPath);
        Cmd.draculaPath = draculaPath;
    }

    /**
     * @return thư mục làm việc của dracule.
     */
    public static String getWorkingPath() {
        if ("".equals(workingPath)) {
            setWorkingPath(GetXmlCofig(cconfigCmd, cworkpath));
        }
        return workingPath;
    }

    private static void setWorkingPath(String workingPath) {
        log.info("thu muc lam viec:" + workingPath);
        Cmd.workingPath = workingPath;
    }

    /**
     * thực thi lệnh Start_recognizer của cit.
     *
     * @param dataPoints một chuỗi có dạng "12,1|23,2...|45,5"(các điểm của một
     * kí tự cần nhận dạng);
     * @return kí tự nhận dạng.
     */
    public static String Recognizer(String dataPoints,boolean fence) {
        String rst = "";
        try {

            dataPoints = dataPoints.replace('|', '-');
            dataPoints = dataPoints.replaceFirst("(0,\\d+-)", "");
            dataPoints = dataPoints.replaceFirst("(\\d+,0-)", "");
            String cmand="";
            if(fence)
            {
                cmand = getCitfence() + " " + dataPoints;
            }else
            {
                cmand = getCitpath() + " " + dataPoints;
            }
            
            
            System.out.println("CMD" + cmand + "end CMD");
            Utils.WriteLog("Recognizer", "lenh cit:" + dataPoints);
            log.info("lenh cit:" + cmand);

            Process p = Runtime.getRuntime().exec(cmand);
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(
                    p.getInputStream()));
            String s = "";
            while ((s = stdInput.readLine()) != null) {
                rst += s;
            }
        } catch (IOException e) {

            e.printStackTrace();
        }
        return rst;
    }

    /**
     * thực thi lệnh getTex của dracule tạo ra *.tex, *.bst.
     *
     * @param bstFile tên file có dạng *.bst.
     * @param texFile tên file có dang *.tex.
     * @param datfile tên file có dang *.dat.
     * @return true nếu thành công, false nếu phát sinh exception.
     */
    public static boolean GetTeX(String bstFile, String texFile, String datfile) {
        String cmd = getDraculaPath() + File.separatorChar + "GetTeX.x "
                + datfile + " -intFile  ";
        cmd = cmd + bstFile + " -o " + texFile;
        System.out.println("Comand GetTex" + cmd);
        String cmdchmodtex = "chmod 777 " + texFile;
        String chmodbst = "chmod 777 " + bstFile;
        log.info("lenh gettex" + cmd);
        ExecProcess(cmd, new File(getWorkingPath()));
        ExecProcess(chmodbst, new File(getWorkingPath()));
        return ExecProcess(cmdchmodtex, new File(getWorkingPath()));
    }

    /**
     * thực thi lệnh AlignSymbols.x để tranlate tọa độ của symbol.
     *
     * @param bstFile tên file có dạng *.bst.
     * @return true nếu thành công, false nếu phát sinh exception.
     */
    public static boolean AlignSymbols(String bstFile) {
        String cmd2 = getDraculaPath() + File.separatorChar + "AlignSymbols.x "
                + bstFile;
        log.info("lenh AlignSymbols" + cmd2);
        return ExecProcess(cmd2, new File(getWorkingPath()));
    }

    /**
     * gọi command line in java.
     *
     * @param cmd lệnh truyền cho command line.
     * @param workingdir đường dẫn thư mục command line se chạy.
     * @return true nếu thành công, false nếu phát sinh exception.
     */
    private static boolean ExecProcess(String cmd, File workingdir) {
        Process p;
        try {
            p = Runtime.getRuntime().exec(cmd, null, workingdir);
            Utils.WriteLog("ExecProcess", cmd);

            log.info(workingdir);
            log.info("duong dan thu muc lam viec:"
                    + workingdir.getAbsolutePath());
            try {
                p.waitFor();
            } catch (InterruptedException exception1) {
                // TODO Auto-generated catch-block stub.
            	Utils.WriteFileTxt("ExecProcess", "leh:" + cmd + exception1.getMessage());
                Utils.WriteLog("ExecProcess", cmd + "\t" + exception1.getMessage());
                exception1.printStackTrace();
            }
            p.destroy();
            return true;
        } catch (IOException exception) {
            // TODO Auto-generated catch-block stub.
        	Utils.WriteFileTxt("ExecProcess", "leh2:" + cmd + exception.getMessage());
            exception.printStackTrace();
            return false;

        }

    }

    /**
     * xuất một file .tex thành *.dvi file.
     *
     * @param texFile tên file có dạng *.tex.
     * @return true nếu thành công, false nếu phát sinh exception.
     */
    public static boolean Latex2Dvi(String texFile) {
        String cmddvi = "latex " + texFile;
        log.info("latex toi dvi:" + cmddvi);
        return ExecProcess(cmddvi, new File(getWorkingPath()));
    }

    /**
     * xuất một file .tex thành *.dvi file.
     *
     * @param texFile tên file có dạng *.tex.
     * @return true nếu thành công, false nếu phát sinh exception.
     */
    public static boolean Texi2Dvi(String texFile) {
        String cmddvi = "texi2dvi -q -c " + texFile;
        log.info("texi toi dvi:" + cmddvi);

        return ExecProcess(cmddvi, new File(getWorkingPath()));
    }

    /**
     * xuất file *.dvi thành *.png.
     *
     * @param dviFile tên file có dạng *.dvi.
     * @param pngFile tên file có dạng *.png.
     * @return true nếu thành công, false nếu phát sinh exception.
     */
    public static boolean Dvi2Png(String dviFile, String pngFile) {
        String cmddvi = "dvipng -T tight -x 1200 -z 9 -q " + dviFile + " -o "
                + pngFile;
        log.info("lenh tao png tu dvi:" + cmddvi);
        String chmod = "chmod 777 " + pngFile;
        ExecProcess(cmddvi, new File(getWorkingPath()));
        return ExecProcess(chmod, new File(getWorkingPath()));

    }

    /**
     * xuất một ảnh thành ảnh trong suốt lưu ra một file khác.
     *
     * @param pngFile tên file ảnh gốc.
     * @param transPng tên file ảnh trong suốt.
     * @return true nếu thành công, false nếu exception xảy ra.
     */
    public static boolean PngTransparent(String pngFile, String transPng) {
        String cmdtrans = "convert -transparent white  " + Utils.Combine(getWorkingPath(), pngFile) + " "
                + Utils.Combine(getWorkingPath(), transPng);
        log.info("lenh tao png trong suot" + cmdtrans);
        Utils.WriteLog("PngTransparent", cmdtrans);
        Utils.WriteLog("Thu muc lam viec: ", getWorkingPath());

        String username = System.getProperty("user.name");
        Utils.WriteLog("User name: ", username + " " + System.getProperty("user.dir"));
        String chmod = "chmod 777 " + transPng;
        ExecProcess(cmdtrans, new File(System.getProperty("user.dir")));
        return ExecProcess(chmod, new File(getWorkingPath()));
    }

    /**
     * đọc file xml lấy giá trị của 1 node.
     *
     * @param xmlfile đường dẫn file xml.
     * @param nodename tên node cần lấy giá trị.
     * @return giá trị của node.
     */
    static String GetXmlCofig(String xmlfile, String nodename) {
        SAXBuilder builder = new SAXBuilder();
        String rst = "";
        String path = Cmd.class.getProtectionDomain().getCodeSource().getLocation().getPath();
        System.out.println("Duong dan day du:" + path);
        int lastindex = path.lastIndexOf(File.separator);
        if (lastindex != -1) {
            path = path.substring(0, lastindex);
            System.out.println("Duong dan da cat:" + path);
            lastindex = path.lastIndexOf(File.separator);
            if (lastindex != -1) {
                path = path.substring(0, lastindex);
            }

            System.out.println("Duong dan ket hop:" + path);
        }
        path = Utils.Combine(path, xmlfile);
        Document document;
        try {
            String xmlcontent = ReadFile(path);
            System.out.println(xmlcontent);
            document = builder.build(new ByteArrayInputStream(xmlcontent.getBytes()));
            Element root = document.getRootElement();

            @SuppressWarnings("rawtypes")
            List rows = root.getChildren(nodename);
            if (rows.size() > 0) {
                Element row = (Element) rows.get(0);
                rst = row.getTextTrim();
            }

        } catch (JDOMException e) {
            // TODO Auto-generated catch block
        } catch (IOException e) {
            // TODO Auto-generated catch block
        }
        return rst;

    }

    public static String GetDateTime() {
        return new SimpleDateFormat("yy-MM-dd hh:mm:ss").format(new Date()) + "day chi la mot thu nghiem.";
    }

    /**
     * đọc nội dung của một file.
     *
     * @param path đường dẫn tuyệt đối của một file.
     * @return nội dung của file tồn tại.
     * @throws IOException
     */
    private static String ReadFile(String path) throws IOException {
        try {
            FileReader fr = new FileReader(path);
            BufferedReader br = new BufferedReader(fr);

            StringBuffer sb = new StringBuffer();
            String eachLine = br.readLine();

            while (eachLine != null) {
                sb.append(eachLine);
                sb.append("\r");
                eachLine = br.readLine();
            }
            return sb.toString();
        } catch (FileNotFoundException e) {
            // TODO Auto-generated catch block
            log.error(e);
        }
        return "";
    }

    /**
     * @return the citfence
     */
    public static String getCitfence() {
        if ("".equals(citfence)) {

           setCitfence(GetXmlCofig(cconfigCmd, ccitfence));
        }
        return citfence;
    }

    /**
     * @param aCitfence the citfence to set
     */
    public static void setCitfence(String aCitfence) {
        citfence = aCitfence;
    }

    /**
     * @return đường dẫn thư mục activemath.
     */
    public static String getActivemathPath() {
        if ("".equals(activemathPath)) {
            setActivemathPath(GetXmlCofig(cconfigCmd, campath));
        }
        return activemathPath;
    }

    /**
     * @param aActivemathPath đường dẫn thư mục activemath.
     */
    public static void setActivemathPath(String aActivemathPath) {
        activemathPath = aActivemathPath;
    }
}
