package com.coax.common.Cli;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Wooinvi
 *
 */
public class Align implements Serializable {

    @SuppressWarnings("javadoc")
    public static String logname = "align";
    protected static org.apache.commons.logging.Log log = org.apache.commons.logging.LogFactory.getLog(Align.class);
    /**
     * thiet lap thoi gian ngu cho mot thread.
     */
//g    static int sleep = 100;
    /**
     * du lieu dung de test thu
     */
/*g    
    final String data = "<SegmentList>\r"
            + "<Segment symbol=\"2\" min=\"203,40\" max=\"359,149\" id=\"3\"/>\r"
            + "<Segment symbol=\"3\" min=\"506,38\" max=\"601,160\" id=\"12\"/>\r"
            + "<Segment symbol=\"_circle\" min=\"851,39\" max=\"992,178\" id=\"24\" latex=\"23\"/>\r"
            + "<Segment symbol=\"_plus\" min=\"418,43\" max=\"478,97\" id=\"26\"/>\r"
            + "<Segment symbol=\"_equal\" min=\"688,93\" max=\"762,122\" id=\"28\"/>\r"
            // + "<maxima variable=\"x\">" + "2x^2+3x-1=0" + "</maxima>"
            + "</SegmentList>";
           
    @SuppressWarnings("javadoc")
    final String data2 = "<SegmentList><Segment symbol=\"_circle\" min=\"668,47\" max=\"708,198\" id=\"131\" latex=\"3_{4}\"/><Segment symbol=\"_circle\" min=\"598,43\" max=\"644,211\" id=\"140\" latex=\"12\"/><maxima variable=\"x\">$x=3+y$</maxima><guid>628cb14c-8130-2488-556b-238218eca928</guid></SegmentList>";
    // "<SegmentList><Segment symbol=\"x_lower\" min=\"549,49\" max=\"578,70\" id=\"13\"/><Segment symbol=\"_plus\" min=\"604,22\" max=\"627,40\" id=\"14\"/><Segment symbol=\"_equal\" min=\"694,47\" max=\"717,58\" id=\"15\"/><Segment symbol=\"3\" min=\"742,40\" max=\"757,63\" id=\"16\"/><Segment symbol=\"y_lower\" min=\"651,42\" max=\"669,75\" id=\"17\"/><maxima variable=\"x\">$x+y=3$</maxima><guid>0af09f5f-5630-8ec7-511c-a846bdb42f11</guid></SegmentList>";
*/ 
    /**
     * duong dan thu muc du lieu
     */
    private String pathdata = "";
    private String xmlToClient;

    /**<Expressions guid = "375290b8-8f25-ed07-4b87-085f32ff2206"><Exercise idExp = "5" stepExp = "0"></Exercise><SegmentList guid = "4e7357ee-e7fa-cd0c-6b7f-5f781d9e0bee"><Segment symbol="2" min="597,100" max="642,172" id="1"/><Segment symbol="x_lower" min="668,123" max="729,170" id="4"/><Segment symbol="y_lower" min="757,118" max="782,207" id="6"/><maxima variable="x,y_lower"></maxima></SegmentList></Expressions>
     * @return chuỗi xml trả lại client.
     */
    public String getXmlToClient() {
        return this.xmlToClient;
    }

    /**
     *
     *
     * @param xmlToClient chuỗi xml trả lại client.
     */
    public void setXmlToClient(String xmlToClient) {
        this.xmlToClient = xmlToClient;
    }

    /**
     * thực thi các lênh liên quan tới draculas.
     *
     * @param xml chuỗi xml của client gửi lên.
     * @param ipclient địa chỉ ip của client.
     */
/*g    
    public void Execute(String xml, String ipclient) {

        LinkedList<Latex> latexs = new LinkedList<Latex>();
        LinkedList<PreLatex> maximas = new LinkedList<PreLatex>();

        // xml = this.data2;
        String content = BuildStringDatFile(xml, latexs, maximas);
        String guid = GetGuidClient(xml);
        WriteLog("this.Execute(tex2xmlfile, ipclient)", "xml nhan duoc" + xml);
        if (guid == null) {
            guid = Utils.GetGUID();
        }

        logname = ipclient;

        String datfile = guid + ".dat";
        String bstfile = guid + ".bst";
        String texfile = guid + ".tex";
        String dviFile = guid + ".dvi";
        String pngFile = guid + ".png";
        String pngTransFile = guid + "trans.png";

        CreateDatFile(datfile, content);
        String output = CreatebstFile(datfile, bstfile, texfile, dviFile,
                pngFile, pngTransFile, latexs);

        try {

            String fullpathtex = Utils.Combine(this.getPathdata(), texfile);

            if (maximas.size() > 0) {
                Align.Compare(fullpathtex, maximas);
            }

            String latex = Utils.ReadFile(fullpathtex);
            String fullpathpng = Utils.Combine(this.getPathdata(), pngTransFile);

            this.xmlToClient = BuildAlignResponse(latex, "", fullpathpng,
                    maximas);
            maximas.clear();
            try {
                this.finalize();
            } catch (Throwable exception) {
            	WriteLog("E-Align-Execute", exception.getMessage());
                exception.printStackTrace();
            }

        } catch (IOException e) {
        	WriteLog("E2-Align-Execute", e.getMessage());
            e.printStackTrace();
        }

    }

    private String BuildAlignResponse(String latex, String segmentlist,
            String pathimage, List<PreLatex> maximas) throws IOException {
        StringBuilder sb = null;
        String binary = null;
        String header = "data:image/png;base64,";

        binary = header + Utils.ImageToBinary(pathimage);
        System.out.println(binary);
        sb = new StringBuilder();
        sb.append("<AlignResponse xmlns:m=\"http://www.w3.org/1998/Math/MathML\" ><TexString>");
        sb.append(latex).append("</TexString>");
        sb.append(segmentlist);
        sb.append("<imagepath>" + binary + "</imagepath>");
        try {
            PreLatex maxima = maximas.get(0);
            if (maxima != null) {
                sb.append("<maxima  variable=\"" + maxima.getVariable().trim()
                        + "\">" + maxima.getLatex().trim() + "</maxima>");
                sb.append("<result>").append(maxima.getResutl()).append("</result>");
            }
        } catch (Exception e) {
            // TODO: handle exception
        	WriteLog("E-Align-BuildAlignResponse", e.getMessage());
            WriteLog(
                    "this.BuildAlignResponse(latex, segmentlist, mathml, maximas)",
                    e.getMessage());
        }

        sb.append("</AlignResponse>");

        return sb.toString();
    }
*/
    /**
     * tạo chuỗi xml gửi tới client.
     *
     * @param latex chuỗi latex trả về.
     * @param guid chuỗi guid để định danh.
     * @param pathimage đường dẫn file ảnh.
     * @param result kết quả so sánh hai biểu thức.
     * @return chuỗi xml tới client.
     * @throws IOException
     */
/*    
    protected String BuildAlignResponse(String latex, String guid,
            String pathimage, boolean result) throws IOException {

        StringBuilder sb = new StringBuilder();
        sb.append("<AlignResponse ").append(" result=\"");

        if (result) {
            sb.append("1\"");
        } else {
            sb.append("0\"");
        }
        sb.append(">");

        sb.append("<SegmentList  guid=\"").append(guid + "\" ").append("TexString=\"");
        sb.append(latex + "\">").append("<image>");

        String header = "data:image/png;base64,";
        pathimage = Utils.Combine(this.getPathdata(), pathimage);
        String binary = header + Utils.ImageToBinary(pathimage);
        System.out.println("Duong dan hinh:" + pathimage);
        sb.append(binary).append("</image>").append("</SegmentList>");

        sb.append("</AlignResponse>");

        System.out.println(sb.toString());
        return sb.toString();

    }
*/
    /**
     * tạo ra *.dat cho quá trình gọi dracula.
     *
     * @param namedat tên của file *.dat
     * @param content nội dung sẽ được ghi vào file dat.
     * @return
     */
    protected boolean CreateDatFile(String namedat, String content) {
        boolean bRst = false;
        String absolutepath = null;
        try {
            File file = new File(this.getPathdata());
            if (file.exists() == false) {
                file.mkdir();
            }
            absolutepath = Utils.Combine(this.getPathdata(), namedat);
            FileWriter fw = new FileWriter(absolutepath);
            fw.write(content);
            fw.close();
            try {
                Runtime.getRuntime().exec("chmod 777 " + absolutepath).waitFor();
                bRst = true;
            } catch (InterruptedException exception) {
                WriteLog(
                        "CreatebstFile(datfile, bstFile, texFile, dviFile, pngFile, latexs)",
                        exception.getMessage());
                exception.printStackTrace();
            }

        } catch (IOException e) {
        	WriteLog("E-Align-CreateDatFile", e.getMessage());
            e.printStackTrace();
            // WriteLog("CreateDatFile", e.getMessage());
        }
        return bRst;
    }

    /**
     * thực hiện các lệnh của dracula.
     *
     * @param datfile tên file có dạng *.dat.
     * @param bstFile tên file có dạng *.bst.
     * @param texFile tên file có dạng *.tex.
     * @param dviFile tên file có dạng *.dvi.
     * @param pngFile tên file có dạng *.pngs.
     * @return
     */
    protected String CreatebstFile(String datfile, String bstFile,
            String texFile, String dviFile, String pngFile, String transPng,
            List<Latex> latexs) {
        String rst = "";

        String cmd = Cmd.getDraculaPath() + File.separatorChar + "GetTeX.x "
                + datfile + " -intFile  ";

        cmd = cmd + bstFile + " -o " + texFile;
        WriteLog("CreatebstFile", cmd);
        String cmd2 = Cmd.getDraculaPath() + File.separatorChar
                + "AlignSymbols.x " + bstFile;
        WriteLog("CreatebstFile", cmd2);

        String cmddvi = "latex " + texFile;
        String cmdtex2dvi = "texi2dvi -q -c " + texFile;

        WriteLog("CreatebstFile", cmdtex2dvi);
        WriteLog("CreatebstFile tao dvi", cmddvi);
        String cmdpng = "dvipng -T tight -x 1200 -z 9 -q " + dviFile + " -o "
                + pngFile;
        WriteLog("CreatebstFile", cmdpng);
        String cmdtransparent = "convert -transparent white  " + pngFile + " "
                + transPng;
        System.out.println(cmdtransparent);
        Align.WriteLog("CreatebstFile", cmdtransparent);
        /*
         * cmdCopy = "cp " + pngFile + " " + this.pathImage + " -f";
         * WriteLog("CreatebstFile", cmdCopy);
         */
        String cmdChmode = "chmod " + pngFile + " 755";
        WriteLog("CreatebstFile", cmdChmode);
        String cmdchmodtex = "chmod 777 " + texFile;
        WriteLog("CreatebstFile", cmdchmodtex);
        try {
            String fullpath = Utils.Combine(this.getPathdata(), texFile);
            System.out.println("Get tex" + cmd);
            Cmd.GetTeX(bstFile, texFile, datfile);

            System.out.println("kich thuoc latex: " + latexs.size());
            if (latexs.size() > 0) {
                String bstpath = Utils.Combine(this.getPathdata(), bstFile);
                FillCoordinates(rst, latexs, bstpath);
                ReplaceSymbolByLatex(latexs, fullpath);
                Cmd.Texi2Dvi(texFile);
            } else {
                Cmd.Latex2Dvi(texFile);
            }
            Cmd.Dvi2Png(dviFile, pngFile);

            Cmd.AlignSymbols(bstFile);
        } catch (IOException e) {
            WriteLog("CreatebstFile", e.getMessage());
            WriteLog("E-Align-CreatebstFile", e.getMessage());
            e.printStackTrace();
        }

        rst = rst.trim();
        System.out.println("Noi dung RST: " + rst);

        return rst;
    }

    private void ReplaceSymbolByLatex(List<Latex> latexs, String latexpath)
            throws IOException {
        String slatex = Utils.ReadFile(latexpath);
        System.out.println("Noi dung latex:dd" + slatex);
        for (Latex latex : latexs) {
            System.out.println("symbol: " + latex.getSymbol() + ": "
                    + latex.getContent());
            slatex = slatex.replaceFirst(
                    Matcher.quoteReplacement(latex.getSymbol()),
                    Matcher.quoteReplacement(latex.getContent()));
        }
        System.out.println("Latex truoc khi ghi:" + slatex);
        Utils.WriteFile(latexpath, slatex, false);
        slatex = Utils.ReadFile(latexpath);
        System.out.println("Noi dung latex2:" + slatex);
    }

/*g    
    private String CreateSem(String semfile, String bstfile) {
        String rst = "";
        Process p2 = null;

        String cmd = Cmd.getDraculaPath() + "GetSemantics.x " + semfile
                + " -o " + bstfile;
        // System.out.println("lenh tao sem:" + cmd);
        try {
            BufferedReader stdInput = null;
            String fullpath = null;
            String s = "";

            fullpath = Utils.Combine(this.getPathdata(), bstfile);
            p2 = Runtime.getRuntime().exec(cmd, null,
                    new File(this.getPathdata()));

            while (new File(fullpath).exists() == false) {
                try {
                    Thread.sleep(sleep);
                } catch (InterruptedException e) {
                    // Auto-generated catch block
                	WriteLog("E-CreateSem", e.getMessage());
                    e.printStackTrace();
                }
            }
            stdInput = new BufferedReader(new InputStreamReader(
                    p2.getInputStream()));

            while ((s = stdInput.readLine()) != null) {
                rst += s;
            }
            try {
                p2.waitFor();
            } catch (InterruptedException exception) {
                // TODO Auto-generated catch-block stub.
            	WriteLog("E2-Align-CreateSem", exception.getMessage());
                exception.printStackTrace();
            }
            p2.destroy();
        } catch (IOException e) {
            // Auto-generated catch block
        	WriteLog("E3-Align-CreateSem", e.getMessage());
            e.printStackTrace();
        }

        return rst;
    }
*/
    /**
     * làm đầy tọa độ của đối tượng latex.
     *
     * @param outputBst
     * @param latexs
     * @param fullpathbst
     */
    private void FillCoordinates(String outputBst, List<Latex> latexs,
            String fullpathbst) {
        System.out.println("truoc  sort");
        for (Latex item : latexs) {
            System.out.println(item.toString());
        }

        Collections.sort(latexs, new IdComparator());
        System.out.println("Sau sort");
        for (Latex item : latexs) {
            System.out.println(item.toString());
        }

        String[] elements = outputBst.split("\r");

        for (String item : elements) {
            System.out.println("item: " + item);
            int id = Integer.parseInt(item.substring(item.indexOf("FFES_id :") + 10));
            int index = Collections.binarySearch(latexs, new Latex(id, "", ""),
                    new IdComparator());
            System.out.println("gia tri tra ve bs: " + index);
            if (index >= 0) {
                String coors = null;
                Matcher p = Pattern.compile(
                        "(\\(\\d+, \\d+\\), \\(\\d+, \\d+\\))").matcher(item);
                p.find();
                coors = p.group();
                System.out.println("Gia tri coors: " + coors);
                Latex latex = latexs.get(index);
                latex.setCoordinates(coors);
            }
        }

        System.out.println("Sau sort update");
        for (Latex item : latexs) {
            System.out.println(item.toString());
        }

        try {
            String bst = Utils.ReadFile(fullpathbst);
            System.out.println("Noidng:" + bst);
            String bstTree = "III. Relation Lexed BST";
            int start = bst.indexOf(bstTree);
            System.out.println("bat dau cat chuoi: " + start);
            bst = bst.substring(start);
            System.out.println("Noi dung chuoi bst:" + bst);
            for (Latex item : latexs) {
                String coors = item.getCoordinates();
                int index = bst.indexOf(coors);
                System.out.println("Ket qua tim kiem trong bst: " + index);
                item.setIndex(index);
            }

            Collections.sort(latexs);
            System.out.println("sort index");
            for (Latex item : latexs) {
                System.out.println(item.toString());
            }

        } catch (IOException e) {
            // TODO Auto-generated catch block
        	WriteLog("E-Align-Fillcoordinates", e.getMessage());
            e.printStackTrace();
        }

    }

    /**
     * Xay dung segment list.
     *
     * @param outputBst
     * @return tra ve chuoi xml cho cleint
     */
    @SuppressWarnings("unused")
    private String BuilSegmentList(String outputBst) {
        StringBuilder sb = null;
        String[] elements = null;

        sb = new StringBuilder();
        System.out.println("OUt Put BST: " + outputBst);

        elements = outputBst.split("\r");
        sb.append("<SegmentList>");
        for (String item : elements) {
            String coors = null;
            String id = null;
            String[] arrCoor = null;
            String min = null;
            String max = null;

            sb.append("<Segment ").append("id=\"");

            id = item.substring(item.indexOf("FFES_id :") + 10);
            id = id.trim();

            sb.append(id + "\" ");

            Matcher p = Pattern.compile("(\\d+, \\d+\\), \\(\\d+, \\d+)").matcher(item);
            while (p.find()) {
                coors = p.group();
            }
            arrCoor = coors.split("\\), \\(");

            min = arrCoor[0].replace("(\\(", "");
            min = min.trim();
            sb.append("min=\"").append(min + "\" ");

            max = arrCoor[1].replace("(\\()", "");
            max = max.replace("(\\))", "");
            max = max.trim();
            sb.append("max=\"").append(max + "\" ");

            sb.append("/>");

        }
        sb.append("</SegmentList>");
        // System.out.println("Noi dung xml to client:" + sb.toString());
        return sb.toString();
    }

    /**
     * build chuoi du lieu de dua vao file dat.
     *
     * @param xml xml duoc lay tu client
     * @param latexs luu tru thong tin cua cac latex co bieu tuong la trai tim,
     * hinh tron..
     * @param maximas luu tri thong tin maxima
     * @param guids lay ra chuoi gui
     * @return tra ve mot chuoi
     */
/*g    
    private String BuildStringDatFile(String xml, List<Latex> latexs,
            List<PreLatex> maximas) {
        SAXBuilder builder = new SAXBuilder();
        String rst = "";
        int count = 0;
        Document document = null;
        System.out.println("NOI DUNG XML: " + xml);
        try {
            String sSegment = "Segment";
            String cId = "id";
            String cSymbol = "symbol";
            String cMin = "min";
            String cMax = "max";
            String cLatex = "latex";
            String cMaxima = "maxima";
            String cVariable = "variable";

            document = builder.build(new ByteArrayInputStream(xml.getBytes()));

            Element root = document.getRootElement();

            @SuppressWarnings("rawtypes")
            List rows = root.getChildren(sSegment);
            count = rows.size();
            // System.out.println("chieu dai cua root element:" + count);
            for (int i = 0; i < count; i++) {
                Element row = (Element) rows.get(i);
                int id = Integer.parseInt(row.getAttributeValue(cId));
                String symbol = row.getAttributeValue(cSymbol);
                if (row.getAttributeValue(cLatex) != null) {
                    String latex = row.getAttributeValue(cLatex);
                    latexs.add(new Latex(id, latex, symbol));
                }
                String min = row.getAttributeValue(cMin);
                String max = row.getAttributeValue(cMax);

                String[] mins = min.split(",");
                String[] maxs = max.split(",");

                boolean minmax = Integer.parseInt(mins[0]) == Integer.parseInt(maxs[0])
                        || Integer.parseInt(mins[1]) == Integer.parseInt(maxs[1]);

                if (minmax) {
                    int maxx = Integer.parseInt(maxs[0]) + 1;
                    int maxy = Integer.parseInt(maxs[1]) + 1;
                    max = maxx + "," + maxy;
                }

                rst += symbol + "\t<(" + min + "),(" + max + ")>  FFES_id: "
                        + id + "\r";
            }

            rows = root.getChildren(cMaxima);
            count = rows.size();
            for (int i = 0; i < count; i++) {
                Element row = (Element) rows.get(i);
                String maxima = row.getTextTrim();
                String variable = row.getAttributeValue(cVariable);
                // logger.info("dau vao maxima: " +maxima );
                maximas.add(new PreLatex(maxima, variable));
            }
        } catch (JDOMException exception) {
            WriteLog("E1-Align-BuildStringDatFile",
                    exception.getMessage());
            exception.printStackTrace();
        } catch (IOException exception) {
            // logger.error(cv.TimeForLog() + "BuildStringDatFile:" +
            // exception);
        	WriteLog("E2-Align-BuildStringDatFile",exception.getMessage());
            
            exception.printStackTrace();
        }

        rst = "<-- FFES Version 0.2 Symbol/Bounding Box List --> "
                + "\r <-- Note: Origin is Top Left -->"
                + "\rNumber of Symbols: " + count + "\r" + rst;
        System.out.println(rst);
        return rst;
    }
*/
/*g    
    private String GetGuidClient(String xml) {
        SAXBuilder builder = new SAXBuilder();
        String rst = null;
        Document document = null;
        try {
            String cGuid = "guid";
            document = builder.build(new ByteArrayInputStream(xml.getBytes()));
            Element root = document.getRootElement();
            @SuppressWarnings("rawtypes")
            List rows = root.getChildren(cGuid);
            for (int i = 0; i < rows.size(); i++) {
                Element row = (Element) rows.get(i);
                rst = row.getTextTrim();
                System.out.println("noi dung guid:" + rst);
            }
        } catch (JDOMException exception) {
            WriteLog("E-Align-GetGuidClient",
                    exception.getMessage());
            exception.printStackTrace();
        } catch (IOException exception) {
            // logger.error(cv.TimeForLog() + "BuildStringDatFile:" +
            // exception);
        	WriteLog("E2-Align-GetGuidClient",
                    exception.getMessage());
                    
            exception.printStackTrace();
        }
        System.out.println("guid client:" + rst);
        WriteLog("guid client", rst);

        return rst;
    }
*/
    /**
     *
     *
     * @return Returns đường dẫn thư mục làm việc.
     */
    public String getPathdata() {
        if (this.pathdata == "") {
            setPathdata(Cmd.getWorkingPath());
        }
        return this.pathdata;
    }

    /**
     *
     *
     * @param pathdata đường dẫn thư mục làm việc.
     */
    public void setPathdata(String pathdata) {
        this.pathdata = pathdata;
    }

    /**
     * đọc nội dung của file *.tex.
     *
     * @param fullpath đường dẫn file tex.
     * @return nội dung latex.
     */
    protected static String GetLatexFromFile(String fullpath) {
        String temp = "$";
        int start = -1;
        int end = -1;
        String latex = null;

        try {
            String content = Utils.ReadFile(fullpath);
            start = content.indexOf(temp);
            end = content.lastIndexOf(temp);

            if (start != -1) {
                latex = content.substring(start, end + temp.length());
                latex = latex.replaceAll("\\s+", "");
            }

        } catch (IOException exception) {
            WriteLog("E-Align-GetLaxFromFile", exception.getMessage());
            exception.printStackTrace();
        }
        return latex;
    }

    /**
     * so sanh hai biểu thức có tương đương với nhau không(có chứa pm).
     *
     * @param pahttex đường dẫn file *.tex.
     * @param maximas danh sách chứa thông tins của biểu thức trước đó.
     * @return true nếu hai biêu thức tương đương, ngược lại false.
     */
/*g    
    protected static boolean PmCompare(String pathtex, List<PreLatex> maximas) {

        String cHbox = "\\hbox";
        String cVbox = "\\vbox";
        String cVtop = "\\vtop";
        String cOperator = "operator";
        String cPm = "\\pm";
        boolean pmGx = false;
        boolean pmFx = false;
        String[] gxArray = new String[2];
        String[] fxArray = new String[2];

        System.out.println("Ham PM COMPare");

        StringBuilder solve = new StringBuilder();
        StringBuilder solve2 = new StringBuilder();
        PreLatex maxima = maximas.get(0);
        String newLatex = Align.GetLatexFromFile(pathtex);
        WriteLog("gia tri newLatex: ", newLatex);
        System.out.println("gia tri newLatex: " + newLatex);
        String maximaLatex = maxima.getLatex();

        Utils.WriteLog("gia tri maximaLatex: ", maximaLatex);

        if (newLatex.contains(cPm)) {

            try {
				gxArray[0] = Latex2Maxima.ToMaxima(newLatex.replace(cPm, "-").replace("\\cos", " \\cos ").replace("\\sin", " \\sin "));
			    gxArray[1] = Latex2Maxima.ToMaxima(newLatex.replace(cPm, "+").replace("\\cos", " \\cos ").replace("\\sin", " \\sin "));
	            System.out.println(newLatex);
	            pmGx = true;
			} catch (Throwable e) {
				// TODO Auto-generated catch block
				WriteLog("E-Align-PmCompare", e.getMessage());
				e.printStackTrace();
			}
            // gxArray[0]= newLatex ;
        
        }

        if (maxima.getLatex().contains(cPm)) {
            pmFx = true;
            
            try {
				fxArray[0] = Latex2Maxima.ToMaxima(maxima.getLatex().replace(cPm, "-").replace("\\cos", " \\cos ").replace("\\sin", " \\sin "));
				  fxArray[1] = Latex2Maxima.ToMaxima(maxima.getLatex().replace(cPm, "+").replace("\\cos", " \\cos ").replace("\\sin", " \\sin "));
			} catch (Throwable e) {
				// TODO Auto-generated catch block
				WriteLog("E2-Align-Compare",e.getMessage());
				e.printStackTrace();
			}
          
            System.out.println(maxima.getLatex());
        }

        for (int i = 0; i < fxArray.length; i++) {
            System.out.println("+" + fxArray[i] + ",gx: " + gxArray[i]);
        }
        boolean malaxvalid = false;
        boolean latexValid = false;
        boolean isOneFx = false;
        boolean isOneGx = false;
        if (pmGx == true) {
            if (gxArray[0] != null) {
                malaxvalid = gxArray[0].contains(cHbox)
                        || gxArray[0].contains(cVbox)
                        || gxArray[0].contains(cVtop);
            } else {
                malaxvalid = true;
            }
        } else {
            // System.out.println("pm newLatex: " + newLatex);

            try {
				gxArray[0] = Latex2Maxima.ToMaxima(newLatex.replace("\\cos",
				        " \\cos ").replace("\\sin", " \\sin "));
			} catch (Throwable e) {
				// TODO Auto-generated catch block
				WriteLog("E3-Align-Compare",e.getMessage());
				e.printStackTrace();
			}
            // System.out.println("Noi dung gxArray[0]" + gxArray[0]);
            if (gxArray[0] != null) {
                malaxvalid = gxArray[0].contains(cHbox)
                        || gxArray[0].contains(cVbox)
                        || gxArray[0].contains(cVtop);
                isOneGx = true;
            } else {
                malaxvalid = true;
            }
        }

        if (pmFx == true) {
            if (fxArray[0] != null) {
                latexValid = fxArray[0].contains(cHbox)
                        || fxArray[0].contains(cVbox)
                        || fxArray[0].contains(cVtop);
            } else {
                latexValid = true;
            }
        } else {
            System.out.println("pm getLatex: " + maxima.getLatex());
            if (maxima.getLatex() != "") {
                try {
					fxArray[0] = Latex2Maxima.ToMaxima(maxima.getLatex().replace("\\cos", " \\cos ").replace("\\sin", " \\sin "));
				} catch (Throwable e) {
					// TODO Auto-generated catch block
					WriteLog("E4-Align-Compare",e.getMessage());
					e.printStackTrace();
				}
                if (fxArray[0] == null) {
                    latexValid = fxArray[0].contains(cHbox)
                            || fxArray[0].contains(cVbox)
                            || fxArray[0].contains(cVtop);
                    isOneFx = true;
                } else {
                    latexValid = true;
                }
            } else {
                latexValid = true;
            }
        }

        if (latexValid == false && malaxvalid == false
                && maxima.getLatex() != "") {

            if (fxArray[0] != null && gxArray[0] != null
                    && fxArray[0].contains(cOperator) == false
                    && gxArray[0].contains(cOperator) == false) {

                if (maxima.getVariable() != "") {
                    if (pmFx && pmGx) {
                        solve.append("if ");
                        solve.append("solve( expand(" + fxArray[0] + "),["
                                + maxima.getVariable() + "])");
                        solve.append("=");
                        solve.append("solve(expand(" + gxArray[0] + "),["
                                + maxima.getVariable() + "]) ");
                        solve.append("then ");
                        solve.append("1 ");
                        solve.append("else ");
                        solve.append("0;");

                        solve2.append("if ");
                        solve2.append("solve( expand(" + fxArray[1] + "),["
                                + maxima.getVariable() + "])");
                        solve2.append("=");
                        solve2.append("solve(expand(" + gxArray[1] + "),["
                                + maxima.getVariable() + "]) ");
                        solve2.append("then ");
                        solve2.append("1 ");
                        solve2.append("else ");
                        solve2.append("0;");
                    } else {
                        if (isOneFx) {
                            solve.append("if ");
                            solve.append("solve( expand(" + fxArray[0] + "),["
                                    + maxima.getVariable() + "])");
                            solve.append("=");
                            solve.append("solve(expand(" + gxArray[0] + "),["
                                    + maxima.getVariable() + "]) ");
                            solve.append("then ");
                            solve.append("1 ");
                            solve.append("else ");
                            solve.append("0;");

                            solve2.append("if ");
                            solve2.append("solve( expand(" + fxArray[0] + "),["
                                    + maxima.getVariable() + "])");
                            solve2.append("=");
                            solve2.append("solve(expand(" + gxArray[1] + "),["
                                    + maxima.getVariable() + "]) ");
                            solve2.append("then ");
                            solve2.append("1 ");
                            solve2.append("else ");
                            solve2.append("0;");
                        }
                        if (isOneGx) {
                            solve.append("if ");
                            solve.append("solve( expand(" + gxArray[0] + "),["
                                    + maxima.getVariable() + "])");
                            solve.append("=");
                            solve.append("solve(expand(" + fxArray[0] + "),["
                                    + maxima.getVariable() + "]) ");
                            solve.append("then ");
                            solve.append("1 ");
                            solve.append("else ");
                            solve.append("0;");

                            solve2.append("if ");
                            solve2.append("solve( expand(" + gxArray[0] + "),["
                                    + maxima.getVariable() + "])");
                            solve2.append("=");
                            solve2.append("solve(expand(" + fxArray[1] + "),["
                                    + maxima.getVariable() + "]) ");
                            solve2.append("then ");
                            solve2.append("1 ");
                            solve2.append("else ");
                            solve2.append("0;");
                        }
                    }

                } else if (maxima.getVariable() == "") {
                    String cX = ""; // mod ddo was String cX = "+50000*y";
                    String cVariable = "";// modddo was String cVariable = "y";
                    if (pmFx && pmGx) {

                        solve.append("if ");
                        solve.append("(expand(" + fxArray[0] + cX + "),"
                                + cVariable + ")");// -modddo was solve.append
                        solve.append("=");
                        solve.append("(expand(" + gxArray[0] + cX + "),"
                                + cVariable + ")");// -modddo was solve.append
                        solve.append("then ");
                        solve.append("1 ");
                        solve.append("else ");
                        solve.append("0;");

                        solve2.append("if ");
                        solve2.append("(expand(" + fxArray[1] + cX + "),"
                                + cVariable + ")");// -modddo was solve.append
                        solve2.append("=");
                        solve2.append("(expand(" + gxArray[1] + cX + "),"
                                + cVariable + ")");// -modddo was solve.append
                        solve2.append("then ");
                        solve2.append("1 ");
                        solve2.append("else ");
                        solve2.append("0;");
                    } else {
                        if (isOneFx) {
                            solve.append("if ");
                            solve.append("(expand(" + fxArray[0] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve.append("=");
                            solve.append("(expand(" + gxArray[0] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve.append("then ");
                            solve.append("1 ");
                            solve.append("else ");
                            solve.append("0;");

                            solve2.append("if ");
                            solve2.append("(expand(" + fxArray[0] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve2.append("=");
                            solve2.append("(expand(" + gxArray[1] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve2.append("then ");
                            solve2.append("1 ");
                            solve2.append("else ");
                            solve2.append("0;");
                        }

                        if (isOneGx) {
                            solve.append("if ");
                            solve.append("(expand(" + fxArray[1] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve.append("=");
                            solve.append("(expand(" + gxArray[0] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve.append("then ");
                            solve.append("1 ");
                            solve.append("else ");
                            solve.append("0;");

                            solve2.append("if ");
                            solve2.append("(expand(" + fxArray[0] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve2.append("=");
                            solve2.append("(expand(" + gxArray[0] + cX + "),"
                                    + cVariable + ")");// -modddo was
                            // solve.append
                            solve2.append("then ");
                            solve2.append("1 ");
                            solve2.append("else ");
                            solve2.append("0;");
                        }
                    }
                }

                WriteLog("Compare", Utils.TimeForLog() + solve.toString());
                
                String rst="";
                String rst2="";
                        try {
                            rst = ConnectMaxima.Solve(solve.toString());
                            
                        } catch (MaximaTimeoutException ex) {
                            Logger.getLogger(Align.class.getName()).log(Level.SEVERE, null, ex);
                        }
                        try {
                            rst2 = ConnectMaxima.Solve(solve2.toString());
                        } catch (MaximaTimeoutException ex) {
                            
                            Logger.getLogger(Align.class.getName()).log(Level.SEVERE, null, ex);
                        }
                
                System.out.println("solve2: " + solve2.toString());
                if (rst.trim().compareTo("1") == 0
                        && rst2.trim().compareTo("1") == 0) {
                    maximas.get(0).setResutl(1);
                    return true;
                } else {
                    maximas.get(0).setResutl(0);
                    return false;
                }

            } else {

                maximas.get(0).setResutl(0);
                return false;
            }
        } else {
            if (maxima.getLatex() == "") {
                maximas.get(0).setResutl(1);
            } else {
                maximas.get(0).setResutl(0);
            }
            return false;
        }
    }
*/
    /**
     * so sanh hai biểu thức có tương đương với nhau không.
     *
     * @param pahttex đường dẫn file *.tex.
     * @param maximas danh sách chứa thông tins của biểu thức trước đó.
     * @return true nếu hai biêu thức tương đương, ngược lại false.
     */
/*g
    protected static boolean Compare(String pahttex, List<PreLatex> maximas) {
        String cHbox = "\\hbox";
        String cVbox = "\\vbox";
        String cVtop = "\\vtop";
        String cOperator = "operator";
        String cPm = "\\pm";

        String newLatex1 = "";
        String oldLatex1 = "";

        StringBuilder solve = new StringBuilder();
        PreLatex maxima = maximas.get(0);
        String newLatex = Align.GetLatexFromFile(pahttex);
        WriteLog("gia tri newLatex: ", newLatex);
        System.out.println("gia tri newLatex: " + newLatex);
        String maximaLatex = maxima.getLatex();

        Utils.WriteLog("gia tri maximaLatex: ", maximaLatex);

        if (newLatex.contains(cPm) || maxima.getLatex().contains(cPm)) {
            return PmCompare(pahttex, maximas);
        }

        newLatex = newLatex.replace("\\cos", " \\cos ").replace("\\sin",
                " \\sin ");
        String oldLatex = maxima.getLatex().replace("\\cos", " \\cos ").replace("\\sin", " \\sin ");
        System.out.println("Old Maxima" + oldLatex);
        System.out.println("New Maxima" + newLatex);
        String fx;
        String gx;
		try {
			fx = Latex2Maxima.ToMaxima(oldLatex);
			gx = Latex2Maxima.ToMaxima(newLatex);
		
        
        oldLatex1 = oldLatex1.replace("\\cos", " \\cos ").replace("\\sin",
                " \\sin ");
        newLatex1 = newLatex1.replace("\\cos", " \\cos ").replace("\\sin",
                " \\sin ");

        System.out.println("fx: " + fx);
        System.out.println("gx: " + gx);

        boolean malaxvalid = maximaLatex.contains(cHbox)
                || maximaLatex.contains(cVbox) || maximaLatex.contains(cVtop);

        boolean latexValid = newLatex.contains(cHbox)
                || newLatex.contains(cVbox) || newLatex.contains(cVtop);

        if (latexValid == false && malaxvalid == false
                &&  !"".equals(maxima.getLatex())) {
            WriteLog("gia tri fx: ", fx);
            WriteLog("gia tri gx: ", gx);

            if (fx != null && gx != null && fx.contains(cOperator) == false
                    && gx.contains(cOperator) == false) {

                if (    !"".equals(maxima.getVariable())) {

                    solve.append("if ");
                    solve.append("solve( expand(").append(fx).append("),[").append(maxima.getVariable()).append("])");
                    solve.append("=");
                    solve.append("solve(expand(").append(gx).append("),[").append(maxima.getVariable()).append("]) ");
                    solve.append("then ");
                    solve.append("1 ");
                    solve.append("else ");
                    solve.append("0;");
                } else if ("".equals(maxima.getVariable())) {

                    solve.append("if ");
                    solve.append("(expand(").append(fx).append("))");// modddo was
                    // solve.append("solve(expand("
                    // + fx + "),x)");
                    solve.append("=");
                    solve.append("(expand(").append(gx).append("))"); // moddd was
                    // solve.append("solve(expand("
                    // + gx + "),x)");
                    solve.append("then ");
                    solve.append("1 ");
                    solve.append("else ");
                    solve.append("0;");
                }

                WriteLog("Compare", Utils.TimeForLog() + solve.toString());
                String rst = ConnectMaxima.Solve(solve.toString());
                maximas.get(0).setLatex("$" + gx + "$");
                if (rst.trim().compareTo("1") == 0) {
                    maximas.get(0).setResutl(1);
                    return true;
                } else {
                    maximas.get(0).setResutl(0);
                    return false;
                }

            } else {

                maximas.get(0).setResutl(0);
                return false;
            }
        } else {
            if (maxima.getLatex().equals("")) {
                maximas.get(0).setResutl(1);
            } else {
                maximas.get(0).setResutl(0);
            }
            return false;
        }
		} catch (Throwable e) {
			WriteLog("E-Align-Compare", e.getMessage());
			e.printStackTrace();
			return false;
		}
    }
*/
    /**
     * ghi log cho align.
     *
     * @param namefunction tên hàm cần ghi log và các nội dung tùy chọn.
     * @param value nội dung của log.
     */
    protected static void WriteLog(String namefunction, String value) {
        Utils.WriteLog(namefunction, value, logname);
    }
}
