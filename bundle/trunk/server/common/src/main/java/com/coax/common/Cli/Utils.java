package com.coax.common.Cli;

import com.icl.saxon.output.Outputter;
import com.sun.org.apache.xerces.internal.impl.dv.util.Base64;
import com.sun.org.apache.xerces.internal.impl.xpath.regex.Match;

import java.awt.image.BufferedImage;
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Stack;
import java.util.UUID;
import java.util.regex.Matcher;

import javax.imageio.ImageIO;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;

import org.activemath.config.Manager;

/**
 * lớp tiện ích, chứa các chức năng được sử dụng ở nhiều lớp khác nhau.
 *
 * @author Wooinvi. Created Nov 27, 2011.
 */
@SuppressWarnings("restriction")
public class Utils {

    /**
     * TODO Put here a description of this field.
     */
    private String currentdate1 = new SimpleDateFormat("-yy-MM-dd").format(new Date());

    /**
     * đọc file theo từng dòng.
     *
     * @param path đường dẫn của file cần đọc.
     * @return trả về nội dung của file.
     * @throws IOException nếu bị lỗi.
     */
    public static String ReadFile(String path) throws IOException {
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
            Utils.WriteLog("ReadFile", e.getMessage());
        }
        return "";
    }

    /**
     * ghi nội dung xuống file.
     *
     * @param path đường dẫn file lưu nội dung.
     * @param content nội dung sẽ được ghi xuồng file.
     * @param append true nếu có đính kèm nội dung file cũ, ngược lại sẽ ghi đè
     * file.
     * @return true nếu thành công, ngược lại false.
     */
    public static boolean WriteFile(String path, String content, boolean append) {
        boolean successfull = false;
        try {
            FileWriter fw = new FileWriter(path, append);
            fw.flush();
            fw.write(content);
            fw.close();
            successfull = true;
            return successfull;

        } catch (IOException exception) {
            Utils.WriteLog("ReadFile", exception.getMessage());
            return successfull;
        }
    }

    public static boolean WriteFileTxt(String filename, String content) {
        String filepath = Utils.Combine(Cmd.getWorkingPath(), filename + new SimpleDateFormat("-yy-MM-dd-HH-mm-ss").format(new Date()).toString() + ".txt");
        return WriteFile(filepath, content, false);
    }

    public static boolean WriteClient(String filename, String content) {
        String filepath = Utils.Combine(Cmd.getWorkingPath(), "logs");
        File f = new File(filepath);
        if (!f.exists()) {
            try {
                f.mkdirs();
                f.setExecutable(true);
                f.setReadable(true);
                f.setWritable(true);
            } catch (Exception e) {
                System.out.println("Loi khong tao duoc file:" + e.getMessage());
            }

        }
        filepath = Utils.Combine(filepath, filename);
        if (!f.exists()) {
            try {
                f.createNewFile();
                f.setExecutable(true);
                f.setReadable(true);
                f.setWritable(true);
            } catch (Exception e) {
                System.out.println("Loi khong tao duoc file:" + e.getMessage());
            }

        }
        return WriteFile(filepath, content, true);
    }

    /**
     * sinh guid.
     *
     * @return chuỗi guid.
     */
    public static String GetGUID() {
        UUID idOne = UUID.randomUUID();
        String guid = idOne.toString();
        return guid;
    }

    /**
     * Ghi lại log của chương trình.
     *
     * @param namefunction tên ham cần ghi lai log và nội dung tùy chon.
     * @param value nội dung tùy chọn.
     */
    public static void WriteLog(String namefunction, String value) {

        String path = Cmd.getWorkingPath();

        File f = new File(path);

        if (f.exists() == false) {

            f.mkdirs();
            f.setExecutable(true);
            f.setReadable(true);
            f.setWritable(true);
            System.out.println("tao thu muc neu chua ton tai"
                    + f.getAbsolutePath());
        }

        path = Utils.Combine(path, "log-exercise" + getCurrentdate() + ".txt");
        System.out.println("duong dan file log" + path);
        f = new File(path);
        if (f.exists() == false) {
            try {
                f.createNewFile();
                f.setReadable(true);
                f.setWritable(true);


            } catch (IOException e) {
                //   Utils.WriteLog("WriteLog", e.getMessage());
                // TODO Auto-generated catch block
            }
        }
        try {
            FileWriter fw = new FileWriter(f, true);
            BufferedWriter out = new BufferedWriter(fw);
            String currenttime = new SimpleDateFormat("HH:mm:ss").format(new Date());
            String content = currenttime + " [" + namefunction + "] " + value
                    + "\n";
            out.write(content);
            out.close();
            fw.close();
        } catch (IOException e) {
//            Utils.WriteLog("WriteLog", e.getMessage());
            // TODO Auto-generated catch block
        }

    }

    /**
     * Ghi lại log của chung trình.
     *
     * @param namefunction tên ham cần ghi lai log và nội dung tùy chon.
     * @param value nội dung tùy chọn.
     * @param logname
     */
    public static void WriteLog(String namefunction, String value,
            String logname) {

        String path = Cmd.getWorkingPath();
        File f = new File(path);

        if (f.exists() == false) {

            f.mkdirs();
            f.setExecutable(true);
            f.setReadable(true);
            f.setWritable(true);
            System.out.println("tao thu muc neu chua ton tai"
                    + f.getAbsolutePath());
        }

        path = path + File.separator + "log-" + logname + getCurrentdate() + ".txt";
        System.out.println("duong dan file log" + path);
        f = new File(path);

        if (f.exists() == false) {
            try {
                f.createNewFile();
                f.setExecutable(true);
                f.setReadable(true);
                f.setWritable(true);

            } catch (IOException e) {
                Utils.WriteLog("WriteLog", e.getMessage());
                // TODO Auto-generated catch block
            }
        }
        try {
            FileWriter fw = new FileWriter(f, true);
            BufferedWriter out = new BufferedWriter(fw);
            String currenttime = new SimpleDateFormat("HH:mm:ss").format(new Date());
            String content = currenttime + " [" + namefunction + "] " + value
                    + "\n";
            out.write(content);
            out.close();
            fw.close();
        } catch (IOException e) {
            Utils.WriteLog("WriteLog", e.getMessage());
            // TODO Auto-generated catch block
        }

    }

    /**
     * định dạng thời gian dành cho log.
     *
     * @return trả vê chuỗi yy-MM-dd-HH-mm-ss.
     */
    public static String TimeForLog() {
        return "["
                + new SimpleDateFormat("yy-MM-dd-HH-mm-ss").format(new Date())
                + "] ";
    }

    /**
     * mã hóa file ảnh thành base64.
     *
     * @param pathimage đường dẫn file ảnh cần mã hóa.
     * @return nôi dung file ảnh được đọc theo chuẩn base64.
     */
    @SuppressWarnings("restriction")
    public static String ImageToBinary(String pathimage) {
        BufferedImage image;
        try {
            Utils.WriteLog("ImageToBinary duong dan anh:", pathimage);
            image = ImageIO.read(new File(pathimage));
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            String encodedImage = Base64.encode(baos.toByteArray());
            return encodedImage;
        } catch (IOException exception) {
            // TODO Auto-generated catch-block stub.
            Utils.WriteLog("ImageToBinary(pathimage)", exception.getMessage());
        }
        return "";

    }

    public static String Combine(String path, String path2) {
        String rst = "";

        path = path.trim();
        path2 = path2.trim();

        boolean metacharacter = path.contains(":") || path.contains("<")
                || path.contains(">") || path.contains("|");

        if (metacharacter) {
            path = path.replace(":", "");
            path = path.replace("<", "");
            path = path.replace(">", "");
            path = path.replace("|", "");
        }

        metacharacter = path2.contains(":") || path2.contains("<")
                || path2.contains(">") || path2.contains("|");
        if (metacharacter) {
            path2 = path2.replace(":", "");
            path2 = path2.replace("<", "");
            path2 = path2.replace(">", "");
            path2 = path2.replace("|", "");
        }

        if (path.contains(File.separator) != true) {
            path = path.replaceAll(Matcher.quoteReplacement("\\"),
                    Matcher.quoteReplacement(File.separator));
            path = path.replaceAll(Matcher.quoteReplacement("/"),
                    Matcher.quoteReplacement(File.separator));
            path2 = path2.replaceAll(Matcher.quoteReplacement("\\"),
                    Matcher.quoteReplacement(File.separator));
            path2 = path2.replaceAll(Matcher.quoteReplacement("/"),
                    Matcher.quoteReplacement(File.separator));
        }

        if (path.endsWith(File.separator)) {
            path = path.substring(0, path.length() - 1);
        }

        if (path2.startsWith(File.separator)) {
            path2 = path2.substring(1, path2.length());
        }


        rst = path + File.separator + path2;
        return rst;
    }

    /**
     *
     * @return danh sách file có chứa yy-MM-dd.txt ngày hiện hành.
     */
    public static String[] SearchFile() {
        String path = Cmd.getWorkingPath();

        File f = new File(path);

        FilenameFilter ff = new FilenameFilter() {
            public boolean accept(File ff, String name) {
                return name.endsWith(Utils.getCurrentdate() + ".txt");

            }
        };
        return f.list(ff);

    }

    /**
     * tìm kiếm danh sách file theo một mẫu cho trước.
     *
     * @param path đường dẫn thư mục cần thực hiện tìm kiếm.
     * @param pattern mẫu để thực hiện tìm kiếm.
     * @return
     */
    public static String[] SearchFile(String path, final String pattern) {
        File f = new File(path);

        FilenameFilter ff = new FilenameFilter() {
            public boolean accept(File ff, String name) {
                return name.contains(pattern);
            }
        };
        return f.list(ff);
    }

    /**
     * xóa kí tự cuối cùng của chuỗi
     *
     * @param s chuỗi cần xóa kí tự cuối cùng.
     * @param remove kí tự cuối cần xóa.
     * @return trả về chuỗi đã xóa kí tự cuối theo yêu cầu.
     */
    public static String RemoveLast(String s, String remove) {
        s = s.trim();
        remove = remove.trim();
        System.out.println("gia tri cua chuoi nhap vao de remove" + s);
        if (s.compareTo(remove) == 0 || "".equals(s)) {
            return "";
        } else {
            int end = s.lastIndexOf(remove);
            if (end == s.length() - 1) {
                s = s.substring(0, s.length() - 1);
            }
        }
        return s;
    }

    /**
     * lấy các kí tự có ở cả hai chuỗi tạo thành một chuỗi.
     *
     * @param a chuỗi có dạng "a,b,c,..,z".
     * @param b chuỗi có dạng "a,b,c,..,z".
     * @return chuỗi.
     */
    public static String Intersec(String a, String b) {
        String[] as = a.split(",");
        String[] bs = b.split(",");
        String rst = "";
        for (int i = 0; i < as.length; i++) {
            String item = as[i];
            if (Utils.Contains(bs, item)) {
                if (rst.contains(item) == false) {
                    rst += item + ",";
                }
            }
        }
        return Utils.RemoveLast(rst, ",");
    }

    /**
     * @param a chuỗi có dạng "a,b,c,..,z".
     * @param b chuỗi có dạng "a,b,c,..,z".
     * @return chuỗi gồm các kí tự mà cả hai chuỗi không cùng chứa.
     */
    public static String Differen(String a, String b) {
        String[] as = a.split(",");
        String[] bs = b.split(",");
        String rst = "";
        for (int i = 0; i < as.length; i++) {
            String item = as[i];
            if (Utils.Contains(bs, item) == false) {
                if (rst.contains(item) == false) {
                    rst += item + ",";
                }
            }
        }

        rst = Utils.RemoveLast(rst, ",");

        for (int i = 0; i < bs.length; i++) {
            String item = bs[i];
            if (Utils.Contains(as, item) == false) {
                if (rst.contains(item) == false) {
                    rst += item + ",";
                }
            }
        }
        rst = Utils.RemoveLast(rst, ",");
        return rst;
    }

    /**
     * tìm một chuỗi có chưa trong một mảng.
     *
     * @param arrs một mảng kí tự
     * @param s kí tự mẫu để so sánh.
     * @return true nếu chuỗi có trong mảng, ngược lại false.
     */
    public static boolean Contains(String[] arrs, String s) {
        for (int i = 0; i < arrs.length; i++) {
            String item = arrs[i].trim();
            if (item.compareTo(s.trim()) == 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * xóa file theo môt một mẫu nào đó.
     *
     * @param path đường dẫn thư mục cần xóa file.
     * @param pattern mẫu để tìm file và xóa.
     */
    public static void DeleteFile(String path, String pattern) {
        String[] paths = SearchFile(path, pattern);

        for (int i = 0; i < paths.length; i++) {
            String item = Utils.Combine(path, paths[i]);

            File f = new File(item);
            f.delete();
        }
    }

    /**
     * tách chuỗi và xếp lại.
     *
     * @param s chuỗi cần sắp xếp lại.
     * @param separ kí tự spilit;
     * @return chuỗi đã xếp lại.s
     */
    public static String Sort(String s, String separ) {
        String[] items = s.split(separ);

        Arrays.sort(items);
        String rst = "";
        for (String item : items) {
            rst += item + ",";
        }
        rst = Utils.RemoveLast(rst, ",");
        return rst;
    }

    /**
     * Biến đổi latex tới openmath document.
     *
     * @param latex chuỗi latex
     * @return openmath document
     */
    public static String Latex2OpenMath(String latex) {
        String rst = "";
        try {
            // Construct data
            latex = latex.replaceAll(Matcher.quoteReplacement("$"), Matcher.quoteReplacement(""));
            latex = latex.trim();
            String data = URLEncoder.encode("formula", "UTF-8") + "=" + URLEncoder.encode(latex, "UTF-8");

            // Send data
            URL url = new URL("http://www.maths.tcd.ie/cgi-bin/wwwml2omdemo");
            URLConnection conn = url.openConnection();
            conn.setDoOutput(true);
            OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
            wr.write(data);
            wr.flush();

            // Get the response
            BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String line;
            while ((line = rd.readLine()) != null) {
                rst += line.toString();
            }
            wr.close();
            rd.close();
        } catch (Exception e) {
            // Utils.WriteLog("Latex2OpenMath", e.toString());
            return "";
        }
        String cOmbjOpen = "<OMOBJ>";
        String cOmbjClose = "</OMOBJ>";
        rst = filter(rst);
        int start = rst.indexOf(cOmbjOpen);
        int end = rst.indexOf(cOmbjClose) + cOmbjClose.length();
        try {
            rst = rst.substring(start, end);
        } catch (Exception e) {
            rst = "";
            // Utils.WriteLog("Latex2OpenMath(String latex)", e.toString());
        }
        System.out.println("GIA TRI CUA OMDOC: \r" + rst + "\r");
        Utils.WriteFileTxt("omdoc", rst);
        return rst;
    }

    /**
     * thay thế các kí tự meta.
     *
     * @param message thay thế các ký tự &lt;, &gt;&amp;,&quot;  thành <,>&,".
     * @return chuỗi đã thay thế các ký tự trên.
     */
    public static String filter(String message) {
        message = message.replaceAll(Matcher.quoteReplacement("&lt;"), Matcher.quoteReplacement("<"));
        message = message.replaceAll(Matcher.quoteReplacement("&gt;"), Matcher.quoteReplacement(">"));
        message = message.replaceAll(Matcher.quoteReplacement("&amp;"), Matcher.quoteReplacement("&"));
        message = message.replaceAll(Matcher.quoteReplacement("&quot;"), Matcher.quoteReplacement("\""));
        return message;
    }

    public static void InitActiveMath() {
        String m_InitActiveMathHome = "/usr/local/activemath-1.0.1/";
        //m_InitActiveMathHome = "C:\\Users\\phuctq\\Documents\\NetBeansProjects\\ActiveMathTess\\";
        WriteFileTxt("activemathpath", Cmd.getActivemathPath());
        int i = 0;
        while (Manager.isInitted() == false) {
            File active = new File(m_InitActiveMathHome);
            Manager.setActiveMathHome(active);
            Manager.init();
            i++;
            System.out.println("ham khoi tao  : " + Manager.isInitted() + " so lan khoi tao " + i);
        }
    }

    /**
     * @return the currentdate
     */
    public static String getCurrentdate() {
        return new SimpleDateFormat("-yy-MM-dd").format(new Date());
    }

    public static String getCurrentTime() {
        return "[" + new SimpleDateFormat("yy-MM-dd HH:mm:ss").format(new Date()) + "] ";
    }

    public static boolean DeleteFile(String filename) {
        String filepath = Utils.Combine(Cmd.getWorkingPath(), "logs");
        filepath = Utils.Combine(filepath, filename);
        File f = new File(filepath);
        if (f.exists()) {
            f.setExecutable(true);
            f.setReadable(true);
            f.setWritable(true);
            return f.delete();
        }
        return false;

    }
    
public boolean isSubstantive( String s )                                      {
return ( s!=null  &&  s!=""  &&  s!="null" ) ? true : false;                  }

public boolean isEmpty( String s )                                            {
return ( s==null  ||  s==""  ||  s=="null" ) ? true : false;                  }

/**
 * Tách tham số của hàm trong chuỗi
 *
 * @param func             tên hàm cần xử lý
 * @param openParenthesis
 * @param closeParenthesis
 * @param latex
 * @param nested           (flag) có hàm trong hàm
 * @return danh sách các tham số của hàm 
 */
public static List<String>getFunctionArgument(String func,char openParenthesis, 
                         char closeParenthesis, String latex, boolean nested) {

   List<String> lstArgs = new ArrayList<String>();
   int firstIndex = latex.indexOf(func);
   
   while (firstIndex > -1)                                                    {
      Stack<Character> st = new Stack<Character>();
      int beginIndex = firstIndex + func.length() + 1;
      int endIndex = -1;
      st.push(openParenthesis);
      for (int i = beginIndex; i < latex.length(); i++)                       {
         if (latex.charAt(i) == closeParenthesis)                             {
            st.pop();
            if (st.empty())                                                   {
               endIndex = i;
               break;                                                        }}
         else if (latex.charAt(i) == openParenthesis)                         {
            st.push(openParenthesis);                                        }}
      firstIndex = -1;
      if (endIndex > -1)                                                      {
         String arg = latex.substring(beginIndex, endIndex);
         if(!lstArgs.contains(arg)) lstArgs.add(arg);
         latex = latex.substring(endIndex + 1);
         firstIndex = latex.indexOf(func);                                   }}
   
   if (nested)                                                                {
      boolean onceMoreCheck = true;
      int startPoint = 0;
      while (onceMoreCheck)                                                   {
         onceMoreCheck = false;
         for (int i = startPoint; i < lstArgs.size(); i++)                    {
            String arg = lstArgs.get(i);
            if (arg.indexOf(func) > -1)                                       {
               List<String> lstChildFuncArgs = getFunctionArgument(func, 
                     openParenthesis, closeParenthesis, arg, nested);
               //lstArgs.remove(i);
               startPoint = i + 1;
               for (int j = 0; j < lstChildFuncArgs.size(); j++)              {
                  if(!lstArgs.contains(lstChildFuncArgs.get(j)))
                     lstArgs.add(startPoint+j, lstChildFuncArgs.get(j));      }
               onceMoreCheck = true;
               break;                                                      }}}}
   
   return lstArgs;
} // END getFunctionArgument

}
