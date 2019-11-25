package com.coax.common.Cli;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.activemath.webapp.user.User;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;

import com.coax.activemath.CoaxActiveMath;

/**
 * dracule system-equaltion.
 *
 * @author cz
 *
 */
public class MultiAlign extends Align {

    private static final long serialVersionUID = 1L;
//    String data = "<Expressions guid=\"sss\"><exercise  idExp = \"1\" stepExp = \"0\" latexstep =\"(x+2)(x-3)\" message=\"sai roi lam lai\" messagetrue=\"rat tot.\" finish=\"\"/><SegmentList min=\"360,98\" max=\"805,165\" id=\"99\" guid=\"add\"><Segment symbol=\"_lparen\" min=\"367,98\" max=\"378,144\" id=\"36\"/><Segment symbol=\"x_lower\" min=\"413,107\" max=\"452,139\" id=\"39\"/><Segment symbol=\"_plus\" min=\"469,108\" max=\"502,136\" id=\"42\"/><Segment symbol=\"2\" min=\"527,97\" max=\"552,137\" id=\"44\"/><Segment symbol=\"_rparen\" min=\"557,73\" max=\"574,152\" id=\"46\"/><Segment symbol=\"_lparen\" min=\"593,92\" max=\"604,138\" id=\"48\"/><Segment symbol=\"x_lower\" min=\"615,97\" max=\"663,130\" id=\"51\"/><Segment symbol=\"_dash\" min=\"689,115\" max=\"710,115\" id=\"53\"/><Segment symbol=\"3\" min=\"735,89\" max=\"758,130\" id=\"55\"/><Segment symbol=\"_rparen\" min=\"778,76\" max=\"795,155\" id=\"57\"/><maxima variable=\"x\">$(x%2B2)(x-3)$</maxima></SegmentList></Expressions>";
    List<Expression> expressions;
    String guid;
    LinkedList<Probability> probabilities;
    boolean AutoAlign = false;
    private javax.servlet.http.HttpSession session;
    private ActiveMathInfo amInfo;
    private User useram = null;
    private String userMode = "";
    /*hpham them co cho phan native app*/
    boolean App = false;
    private String error = "";

    public boolean isApp() {
        return App;
    }

    public void setApp(boolean isApp) {
        this.App = isApp;
    }
    /*het phan cho native app*/

    protected boolean isAutoAlign() {
        return AutoAlign;
    }

    protected void setAutoAlign(boolean autoAlign) {
        AutoAlign = autoAlign;
    }

    protected String getGuid() {
        return guid;
    }

    protected void setGuid(String guid) {
        this.guid = guid;
    }

    protected List<Expression> getExpressions() {
        return expressions;
    }

    protected void setExpressions(List<Expression> expressions) {
        this.expressions = expressions;
    }

    protected LinkedList<Probability> ProbabilityInit() {
        LinkedList<Probability> lst = new LinkedList<Probability>();
        lst.add(new Probability("x", 1));
        lst.add(new Probability("y", 0.9));
        lst.add(new Probability("a", 0.8));
        lst.add(new Probability("b", 0.7));
        lst.add(new Probability("b", 0.6));
        return lst;
    }
/*g
    @Override
    public void Execute(String xml, String ipclient) {
        System.out.println("gia tri xml>>>" + xml);
        // ipclient = "741";
        logname = ipclient;
        // xml = data;
        //Utils.WriteFileTxt("quangphucTestXML ", xml);
        this.expressions = BuildDatFile(xml);
        this.probabilities = ProbabilityInit();
        Align.WriteLog("Execute", "start" + this.guid);
        LinkedList<String> pathLatexs = new LinkedList<String>();
        LinkedList<PreLatex> maximas = new LinkedList<PreLatex>();
        LinkedList<String> pathPngs = new LinkedList<String>();
        String variable = GetVariable(false);
        String variableMaxima = GetVariable(true);
        Align.WriteLog("Execute", "Bien cua new latex:" + variable);
        Align.WriteLog("Execute", "Bien cua old latex:" + variableMaxima);

        System.out.println("Bien cua new latex:" + variable);
        System.out.println("Bien cua old latex:" + variableMaxima);
        for (int i = 0; i < expressions.size(); i++) {
            Expression expression = expressions.get(i);
            expression.setVariable(variable);
            expression.getMaxima().setVariable(variableMaxima);
            String content = expression.getContentDat();
            String guid = expression.getGuid();
            logname = ipclient;

            String datfile = guid + ".dat";
            String bstfile = guid + ".bst";
            String texfile = guid + ".tex";
            String dviFile = guid + ".dvi";
            String pngFile = guid + ".png";
            String pngTransFile = guid + "trans.png";
            pngTransFile = pngFile;
            this.expressions.get(i).setPngpath(pngTransFile);

            pathLatexs.add(texfile);
            pathPngs.add(pngTransFile);

            if (expression.getMaxima() != null) {
                maximas.add(expression.getMaxima());
            }

            if (this.isApp() == false) {
                CreateDatFile(datfile, content);
                CreatebstFile(datfile, bstfile, texfile, dviFile, pngFile,
                        pngTransFile, expression.latexs);
            }

        }
        Align.WriteLog("Execute", "Chuoi xml:" + xml);

        if (this.AutoAlign) {
            // xu ly cho auto align
            try {

                String fullpathtex = Utils.Combine(this.getPathdata(),
                        pathLatexs.get(0));
                System.out.println("maxima size:" + maximas.size());
                boolean result = false;
                if (maximas.size() == 1) {

                    result = Align.Compare(fullpathtex, maximas);
                }

                String latex = Align.GetLatexFromFile(fullpathtex);
                String fullpathpng = pathPngs.get(0);

                this.setXmlToClient(BuildAlignResponse(latex, expressions
                        .get(0).getGuid(), fullpathpng, result));
                try {
                    this.finalize();
                } catch (Throwable exception) {
                    WriteLogException("Execute", exception);
                    WriteLog("E3-Execute", exception.getMessage());
                    exception.printStackTrace();

                }

            } catch (IOException e) {
                WriteLogException("Execute2", e);
                WriteLog("E4-Execute", e.getMessage());
                e.printStackTrace();
            }
        } else {
            boolean result = false;
            if (maximas.size() > 0) {
                System.out.println("GIA TRI DAU VAO CUA COMPARE CURRENT:" + pathLatexs);
                System.out.println("GIA TRI DAU VAO CUA COMPARE PRE:" + maximas);
                System.out.println();
                result = Compare(pathLatexs, maximas);
            }
            try {
                this.setXmlToClient(BuildAlignResponse(result));
                Align.WriteLog("Compare", this.guid + "end");
            } catch (IOException e) {
                // TODO Auto-generated catch block
                WriteLogException("Execute3", e);
                WriteLog("E-Execute", e.getMessage());
                Align.WriteLog("Compare", this.guid + "end");
                e.printStackTrace();
            }

            try {
                this.finalize();
            } catch (Throwable exception) {
                WriteLogException("Execute4", exception);
                WriteLog("E2-Execute", exception.getMessage());
                exception.printStackTrace();
            }

        }
    }
*/
    private void WriteLogException(String message, Throwable exception) {
        this.setError(this.getError() + "\r\n" + message + ":" + exception.getMessage());
        String _error = this.BuildError(this.getError());
        this.setXmlToClient(_error);
    }
/*g
    private void WriteLogException(String message, String error) {
        this.setError(this.getError() + "\r\n" + message + ":" + error);
        String _error = this.BuildError(this.getError());
        this.setXmlToClient(_error);
    }

    private void WriteLogException(String message, IOException exception) {
        this.setError(this.getError() + "\r\n" + message + ":" + exception.getMessage());

        String _error = this.BuildError(this.getError());
        this.setXmlToClient(_error);
    }
*/
    /**
     * bo sung thong bien latex trong Expression object.
     *
     * @param guid
     * @param latex
     */
    private void UpdateExpressList(String guid, String latex) {
        for (int i = 0; i < this.expressions.size(); i++) {
            Expression item = this.expressions.get(i);
            if (item.getGuid().compareTo(guid.trim()) == 0) {
                this.expressions.get(i).setLatex(latex);
            }
        }
    }

    private LinkedList<Probability> findPLinkedList(String variable) {
        String[] items = variable.split(",");
        LinkedList<Probability> lst = new LinkedList<Probability>();
        for (int i = 0; i < items.length; i++) {
            String item = items[i].trim();
            System.out.println("gia tri cua bien khi moi item:" + item);
            for (int j = 0; j < this.probabilities.size(); j++) {
                Probability p = this.probabilities.get(j);
                if (p.getVariable().compareTo(item) == 0) {

                    lst.add(p);
                }
            }
        }

        return lst;
    }

    private String FindVariableNext(LinkedList<Probability> lst) {
        Collections.sort(lst, new ProbComparator());
        String rst = "";
        System.out.println("kich thuc cua xac xuat:" + lst.size());
        for (int i = 0; i < lst.size(); i++) {
            Probability item = lst.get(i);

            rst += item.getVariable() + ",";
        }
        Utils.RemoveLast(rst, ",");
        System.out.println("Sap xep theo sac xuat:^_^" + rst);
        return rst;
    }

    /**
     * tao ra ds expression chua cac thong tin de thuc hien viec phan tich hai
     * bieu thuc co tuong duong khong
     *
     * @param xml chuoi xml clien gui len
     * @return
     */
    protected List<Expression> BuildDatFile(String xml) {
        LinkedList<Expression> lst = new LinkedList<Expression>();
        SAXBuilder builder = new SAXBuilder();
        int count = 0;
        Document document = null;
        System.out.println("NOI DUNG XML: " + xml);

        try {
            String cSegmentList = "SegmentList";
            String cSegment = "Segment";
            String cMaxima = "maxima";
            String cguid = "guid";
            String cExercise = "Exercise";
            String cLatexstep = "latexExercise";
            String cMessage = "message";
            String cMessageTrue = "messagetrue";
            String cFinish = "finish";
            String cInputPostion = "userInputPostion";
            String cIdAm = "idActiveMath";
            String c_hint = "hint";
            String c_title = "title";
            String c_app = "app";
            String c_current = "current";

            document = builder.build(new ByteArrayInputStream(xml.getBytes()));
            Element root = document.getRootElement();
            this.guid = root.getAttributeValue("guid");

            //hpham 120919 kiem tra co fai tu native ap gui khong
            String isApp = root.getAttributeValue(c_app);
            if (isApp != null) {
                this.setApp(true);
            }

            List rowExers = root.getChildren(cExercise);

            String latexStep = "";
            String message = "";
            String messageTrue = "";
            String finish = "";
            String inputpostion = "";
            String idexerciseAm = "";
            String hint = "";
            String title = "";
            for (int i = 0; i < rowExers.size(); i++) {
                Element row = (Element) rowExers.get(i);
                latexStep = row.getAttributeValue(cLatexstep);
                message = row.getAttributeValue(cMessage);
                finish = row.getAttributeValue(cFinish);
                messageTrue = row.getAttributeValue(cMessageTrue);
                inputpostion = row.getAttributeValue(cInputPostion);
                idexerciseAm = row.getAttributeValue(cIdAm);
                hint = row.getAttributeValue(c_hint);
                title = row.getAttributeValue(c_title);
            }

            this.setAmInfo(new ActiveMathInfo("wooinvi", Integer
                    .parseInt(inputpostion), idexerciseAm.trim(), hint.trim(),
                    title));
            System.out.println("latexStep:### " + latexStep);
            System.out.println("message### " + message);
            System.out.println("messageTrue### " + messageTrue);

            @SuppressWarnings("rawtypes")
            List rows = root.getChildren(cSegmentList);
            count = rows.size();
            for (int i = 0; i < count; i++) {
                Element row = (Element) rows.get(i);

                @SuppressWarnings("rawtypes")
                List children = row.getChildren(cSegment);
                String contentDat = BuildStringSegment(children);
                boolean hasEqual = HasCompareOprator(children);
                String variable = FindVariable(children);
                String guid = row.getAttributeValue(cguid);
                @SuppressWarnings("rawtypes")
                List maximaItem = row.getChildren(cMaxima);

                System.out.println("KIch thuoc maxima: " + maximaItem.size());

                PreLatex maxima = BuildMaxima(maximaItem, this.isApp());
                LinkedList<Latex> latexs = GetLatexs(children);
                Expression expression = new Expression(guid, maxima, latexs,
                        contentDat, variable, hasEqual, false);
                /*hpham phan danh cho navtie app*/
                if (this.isApp() == true) {
                    String currentlatex = "";
                    for (int j = 0; j < maximaItem.size(); j++) {
                        Element row0 = (Element) maximaItem.get(j);
                        Element row1 = row0.getChild(c_current);
                        if (row1 != null) {
                            currentlatex = row1.getTextTrim();
                            currentlatex = currentlatex.replace("%2B", "+");
                        }
                    }
                    expression.setLatex(currentlatex);
                }
                //het phan danh cho native app
                expression.setLatexStep(latexStep);
                expression.setMessage(message);
                expression.setMessageTrue(messageTrue);

                if (finish != null) {
                    expression.setMessageFinish(finish);
                } else {
                    expression.setMessageFinish("");
                }
                lst.add(expression);
            }

        } catch (Exception e) {
            // TODO: handle exception
            WriteLogException("BuildDatFile", e);
            System.out.println(e);
        }
        return lst;
    }

    /**
     * tao maxima objec chua cac thong tin prelatex
     *
     * @param maximaRows
     * @return tra ve null neu maximaRows =0
     */
    private PreLatex BuildMaxima(List maximaRows, boolean isapp) {
        String cVariable = "variable";
        String cPre = "prev";

        for (int i = 0; i < maximaRows.size(); i++) {
            Element row = (Element) maximaRows.get(i);
            String maxima = "";
            /*hpham phan danh cho native app*/
            if (isapp == true) {
                Element row1 = (Element) row.getChild(cPre);
                maxima = row1.getTextTrim();
                maxima = maxima.replace("%2B", "+");
                boolean hasEqual = maxima.contains("=");
                boolean hasAnyEqual = maxima.contains(">")
                        || maxima.contains("<");
                String variable = row.getAttributeValue(cVariable);
                System.out.println("Gia tri variable: " + variable);
                return new PreLatex(maxima, variable, hasEqual, hasAnyEqual);
            } /*het phan danh cho native app*/ else {
                maxima = row.getTextTrim();
                System.out.println("GIA TRI PREMAXIMA:" + maxima);
                maxima = maxima.replace("%2B", "+");
                boolean hasEqual = maxima.contains("=");
                boolean hasAnyEqual = maxima.contains(">")
                        || maxima.contains("<");
                String variable = row.getAttributeValue(cVariable);
                System.out.println("Gia tri variable: " + variable);
                return new PreLatex(maxima, variable, hasEqual, hasAnyEqual);
            }
        }
        return null;
    }

    /**
     * tra ve noi dung file *.dat de tien hanh ghi file gui toi dracula phan
     * tich.
     *
     * @param children
     * @return tra ve mot chuoi neu co, nguoc lai tra ""
     */
    private String BuildStringSegment(List children) {
        String rst = "";
        String cId = "id";
        String cSymbol = "symbol";
        String cMin = "min";
        String cMax = "max";

        int count = children.size();
        for (int i = 0; i < children.size(); i++) {
            Element row = (Element) children.get(i);
            int id = Integer.parseInt(row.getAttributeValue(cId));
            String symbol = row.getAttributeValue(cSymbol);
            String min = row.getAttributeValue(cMin);
            String max = row.getAttributeValue(cMax);

            String[] mins = min.split(",");
            String[] maxs = max.split(",");

            boolean minmax = Integer.parseInt(mins[0]) == Integer
                    .parseInt(maxs[0])
                    || Integer.parseInt(mins[1]) == Integer.parseInt(maxs[1]);

            if (minmax) {
                int maxx = Integer.parseInt(maxs[0]) + 1;
                int maxy = Integer.parseInt(maxs[1]) + 1;
                max = maxx + "," + maxy;
            }

            rst += "\t" + symbol + "\t\t <(" + min + "),(" + max
                    + ")>  FFES_id: " + id + "\n";

        }

        rst = "<-- FFES Version 0.2 Symbol/Bounding Box List --> "
                + "\r <-- Note: Origin is Top Left -->"
                + "\rNumber of Symbols: " + count + "\r" + rst;

        return rst;
    }

    /**
     * lay cac symbol co the lam bien trong mot bieu thuc gom (x,y,z).
     *
     * @param children
     * @return chuoi bien neu co, khong tra ve ""
     */
    private String FindVariable(List children) {
        String rst = "";
        String cSymbol = "symbol";

        String cx = "x_lower";
        String cx1 = "x";
        String cy = "y_lower";
        String cy1 = "y";
        String cz = "z_lower";
        String ca = "a_lower";
        String cb = "b_lower";
        String cc = "c_lower";

//        int count = children.size();
        for (int i = 0; i < children.size(); i++) {
            Element row = (Element) children.get(i);
            String symbol = row.getAttributeValue(cSymbol).trim();
            System.out.println("Gia tri cua symbol:" + symbol);
            boolean check = symbol.compareTo(cx) == 0 || symbol.compareTo(cx1) == 0
                    || symbol.compareTo(cy) == 0 || symbol.compareTo(cy1) == 0
                    || symbol.compareTo(cz) == 0 || symbol.compareTo(ca) == 0
                    || symbol.compareTo(cb) == 0 || symbol.compareTo(cc) == 0;

            if (check == true && rst.contains(symbol) == false) {
                if ("".equals(rst)) {
                    rst += symbol;
                } else {
                    rst += "," + symbol;
                }
                rst = rst.replace("_lower", "");
            }
        }
        System.out.println(">>>gia tri cua bien co the: " + rst);
        return rst;
    }

    private boolean HasCompareOprator(List<?> children) {
        String cSymbol = "symbol";
        String cEqual = "_equal";
        for (int i = 0; i < children.size(); i++) {
            Element row = (Element) children.get(i);
            String symbol = row.getAttributeValue(cSymbol).trim();
            if (symbol.compareTo(cEqual) == 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * danh sach chua cac thong Latex(id, latex, symbol) [x = - 2, x = 3]
     *
     * @param children danh sach phan tu cua xml duoc clien gui len.
     * @return
     */
    private LinkedList<Latex> GetLatexs(List<?> children) {
        String cId = "id";
        String cSymbol = "symbol";
        String cLatex = "latex";
        LinkedList<Latex> latexs = new LinkedList<Latex>();

        for (int i = 0; i < children.size(); i++) {
            Element row = (Element) children.get(i);
            int id = Integer.parseInt(row.getAttributeValue(cId));
            String symbol = row.getAttributeValue(cSymbol);
            if (row.getAttributeValue(cLatex) != null) {
                String latex = row.getAttributeValue(cLatex);
                latexs.add(new Latex(id, latex, symbol));
            }
        }
        return latexs;
    }

    /**
     * tao ra cau lenh gui toi maxima."expand" is required, otherwise
     * differently ordering of the same solution sets will cause a comparison to
     * be False. Witness: (%i1) if( solve([ x^2-x-6=0 ],[x]) = solve([
     * (x+2)*(x-3)=0 ],[x])) then 1 else 0; (%o1) 0 (%i2) if( solve([ expand(
     * x^2-x-6 ) = 0 ],[x]) = solve([ expand( (x+2)*(x-3) ) = 0 ],[x])) then 1
     * else 0; (%o2) 1 (%i3) solve([ x^2-x-6=0 ],[x]); (%o3) [x = 3, x = - 2]
     * (%i4) solve([ (x+2)*(x-3)=0 ],[x]); (%o4)
     *
     * @param maximas
     * @param newMaxima
     * @return tra e StringBuilder
     */
    private StringBuilder BuildSovleString(LinkedList<String> maximas,
            boolean newMaxima) {
        StringBuilder newSolve = new StringBuilder();
        String variable;
        Expression item = this.expressions.get(0);
        if (newMaxima) {
            variable = item.getVariable();
            variable = Utils.Sort(variable, ",");

        } else {
            variable = item.getMaxima().getVariable();
            variable = Utils.Sort(variable, ",");
        }

        System.out.println("Phuong trinh nay co dau bang?" + item.isHasEqual());
        System.out.println("Phuong trinh truoc co dau bang?"
                + item.getMaxima().isHasEqual());
        String solve = IntructionSolve(maximas);
        boolean bSolve = solve == "" || solve == null;
        if (newMaxima) {
            if (item.isHasEqual() == false) {
                if (bSolve) {
                    newSolve.append("expand([");
                } else {
                    newSolve.append("expand( " + solve + "[");
                }

            } else {
                if (bSolve) {
                    newSolve.append("solve([");
                } else {
                    newSolve.append("solve( " + solve + "[");
                }
            }
        } else {
            if (item.getMaxima().isHasEqual() == false) {
                if (bSolve) {
                    newSolve.append("expand([");
                } else {
                    newSolve.append("expand(" + solve + "[");
                }

            } else {
                if (bSolve) {
                    newSolve.append("solve([");
                } else {
                    newSolve.append("solve(" + solve + "[");
                }
            }
        }

        for (int i = 0; i < maximas.size(); i++) {
            if (newMaxima) {
                Align.WriteLog("Compare",
                        "Gia tri maxima moi:" + maximas.get(i));
            } else {
                Align.WriteLog("Compare", "Gia tri maxima cu:" + maximas.get(i));
            }
            if (i == maximas.size() - 1) {
                if (bSolve) {
                    newSolve.append("expand(").append(maximas.get(i))
                            .append(")]");

                } else {
                    newSolve.append("expand(").append(maximas.get(i))
                            .append(")]))");
                }
            } else {
                newSolve.append("expand(").append(maximas.get(i)).append("),");
            }
        }
        if (newMaxima) {
            if (variable == null || "".equals(variable)
                    || item.isHasEqual() == false) {
                newSolve.append(")");

            } else {
                newSolve.append(",[").append(variable).append("])");
            }

        } else {
            if (variable == null || "".equals(variable)
                    || item.getMaxima().isHasEqual() == false) {

                newSolve.append(")");

            } else {

                newSolve.append(",[").append(variable).append("])");

            }
        }
        return newSolve;
    }

    private String IntructionSolve(LinkedList<String> maximas) {
        boolean trigonometric = false;
        String rst = "";
        for (String item : maximas) {
            if (trigonometric == false) {
                trigonometric = item.contains("sin") || item.contains("cos")
                        || item.contains("cotan") || item.contains("tan");
                if (trigonometric == true) {
                    rst = "trigexpand(trigreduce(";
                }
            }
        }
        return rst;
    }

    /**
     * se thuc hien sosanh hai bieu thuc 6bb289
     *
     * @param pathtexs duong dan file *.tex
     * @param maximas dsach chua cac thong tin lien quan den prelatex
     * @return
     */
/*g    
    private boolean PmCompares(LinkedList<String> pathtexs,
            List<PreLatex> maximas) {
        String cPm = "\\pm";
        Expression item = this.expressions.get(0);

        String newLatex = item.getLatex();

        String preLatex = item.getMaxima().getLatex();

        boolean newPm = newLatex.contains(cPm);
        boolean prePm = preLatex.contains(cPm);
        System.out.print("KIEM TRA QUA TRINH CHAY PM");

        if (newPm && prePm) {
            String newLatexPlus = newLatex.replace(cPm, "+");
            String newLatexMinus = newLatex.replace(cPm, "-");

            String preLatexPlus = preLatex.replace(cPm, "+");
            String preLatexMinus = preLatex.replace(cPm, "-");

            LinkedList<String> preMaxima = GetPmMaxima(preLatexPlus);
            LinkedList<String> newMaxima = GetPmMaxima(newLatexPlus);

            // boolean plus = CompareMaxima(preMaxima, newMaxima);

            String combinePreLatex = "("
                    + Revert(GetPmMaxima(preLatexMinus).get(0)) + ")*("
                    + Revert(preMaxima.get(0)) + ")= 0";
            String combineNewLatex = "("
                    + Revert(GetPmMaxima(newLatexMinus).get(0)) + ")*("
                    + Revert(newMaxima.get(0)) + ")= 0";

            preMaxima.clear();
            preMaxima.add(combinePreLatex);

            newMaxima.clear();
            newMaxima.add(combineNewLatex);

            boolean minus = CompareMaxima(preMaxima, newMaxima);
//
//            combinePreLatex = "("
//             + Revert(GetPmMaxima(preLatexPlus).get(0)) + ")*("
//             + Revert(preMaxima.get(0)) + ")= 0";
//             combineNewLatex = "("
//             + Revert(GetPmMaxima(newLatexPlus).get(0)) + ")*("
//             + Revert(newMaxima.get(0)) + ")= 0";
//
//             newMaxima.clear();
//             preMaxima.clear();
//             preMaxima.add(combinePreLatex);
//             newMaxima.add(combineNewLatex);
//             boolean plus = CompareMaxima(preMaxima, newMaxima);
            return minus;
        } else if (prePm) {

            String preLatexPlus = preLatex.replace(cPm, "+");
            String preLatexMinus = preLatex.replace(cPm, "-");

            LinkedList<String> preMaxima = GetPmMaxima(preLatexPlus);
            LinkedList<String> newMaxima = GetPmMaxima(newLatex);

            boolean plus = CompareMaxima(preMaxima, newMaxima);

            preMaxima = GetPmMaxima(preLatexMinus);

            boolean minus = CompareMaxima(preMaxima, newMaxima);

            preMaxima.clear();
            String combineLatex = "("
                    + Revert(GetPmMaxima(preLatexPlus).get(0)) + ")*("
                    + Revert(GetPmMaxima(preLatexMinus).get(0)) + ")=0";

            preMaxima.add(combineLatex);
            boolean combine = CompareMaxima(preMaxima, newMaxima);
            return plus || minus || combine;
        } else if (newPm) {
            String newLatexPlus = newLatex.replace(cPm, "+");

            String newLatexMinus = newLatex.replace(cPm, "-");

            LinkedList<String> preMaxima = GetPmMaxima(preLatex);
            LinkedList<String> newMaxima = GetPmMaxima(newLatexPlus);

            boolean plus = CompareMaxima(preMaxima, newMaxima);

            newMaxima = GetPmMaxima(newLatexMinus);

            boolean minus = CompareMaxima(preMaxima, newMaxima);
            //preMaxima.clear();
            newMaxima.clear();
            String combineLatex = "("
                    + Revert(GetPmMaxima(newLatexPlus).get(0)) + ")*("
                    + Revert(GetPmMaxima(newLatexMinus).get(0)) + ")=0";

            newMaxima.add(combineLatex);
            boolean combine = CompareMaxima(preMaxima, newMaxima);
            return combine;
        }

        return false;
    }
*/
    /**
     * @return true neu co chua dau \\pm
     */
/*g    
    private boolean HasPmSign() {
        String cPm = "\\pm";
        for (int i = 0; i < this.expressions.size(); i++) {
            Expression item = this.expressions.get(i);
            String newLatex = item.getLatex();
            String oldLatex = item.getMaxima().getLatex();

            if (newLatex.contains(cPm) || oldLatex.contains(cPm)) {
                return true;
            }
        }
        return false;
    }
*/
    /**
     * kiểm tra hai biểu thức có tương đương với nhau không.
     *
     * @param pathtexs danh sách đư�?ng dẫn file *.tex
     * @param maximas danh sách các thông tin của biểu thức trước đó.
     * @return true nếu hai biểu thức tương đương, ngược lại false.
     */
/*g
    protected boolean Compare(LinkedList<String> pathtexs,
            List<PreLatex> maximas) {

        LinkedList<String> newMaximas = GetNewMaxima(pathtexs);
        LinkedList<String> oldMaximas = GetOldMaxima(maximas);

        if (this.expressions.size() == 1 && HasPmSign() == true) {
            System.out.println("Duong dan file hien hanh:" + pathtexs.get(0));
            //   String path = Utils.Combine(this.getPathdata(), pathtexs.get(0));
            return PmCompares(pathtexs, maximas);
        }

        return CompareMaxima(oldMaximas, newMaximas);
    }

    private boolean CompareMaxima(LinkedList<String> preMaxima,
            LinkedList<String> newMaxima) {
        StringBuilder newSolve = null;
        StringBuilder oldSolve = null;
        try {
            newSolve = BuildSovleString(preMaxima, true);

        } catch (Exception e) {
            System.err.println(e.getMessage());
            System.err.println(e.getStackTrace());
        }
        System.out.println("Gia tri cua new PRE MAXIMA: " + preMaxima);
        System.out.println("Gia tri cua new MAXIMA: " + newMaxima);
        oldSolve = BuildSovleString(newMaxima, false);
        StringBuilder solve = new StringBuilder();

        solve.append("if( ");
        solve.append(oldSolve.toString());
        solve.append(" = ");
        solve.append(newSolve);
        solve.append(") then 1 else 0;");

        boolean invalidSovle = solve.toString().contains("()")
                || solve.toString().contains("(null)") || solve.toString().contains("[,");

        Align.WriteLog("Compare", "Ham so sanh:" + solve.toString());

        Align.WriteLog("Compare", "snuggleTeX comparison:" + invalidSovle);

        boolean validlatex = IsValidLatex(true) && IsValidLatex(false);
        boolean validMaxima = IsValidMaxima(preMaxima)
                && IsValidMaxima(newMaxima);

        if (validlatex && validMaxima && this.IsStandAlone()
                && invalidSovle == false) {
            log.info("chuoi maxima so sanh: " + solve.toString());
            String rst = "";
            try {
                //rst = ConnectMaxima.Solve(solve.toString());
               String newVars = Utils.Sort(this.expressions.get(0).getVariable(), ",");
               String oldVars = Utils.Sort(this.expressions.get(0).getMaxima().getVariable(), ",");
               rst = ConnectMaxima.SolveX(oldSolve.toString(),oldVars,newSolve.toString(),newVars);
            } catch (MaximaTimeoutException ex) {
                WriteLogException("CompareMaxima", ex + "-- maxima: " + solve.toString() + "---");
                Logger.getLogger(MultiAlign.class.getName()).log(Level.SEVERE, null, ex);
            }
            catch(IOException e){
               
            }
            catch(Exception e){
               
            }
            Align.WriteLog("Compare", "ket qua maxima:" + rst);
            if (rst.trim().compareTo("1") == 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }

    }
*/
    /**
     * lay danh sach maxima cua newlatex
     *
     * @param pathtexs duong dan file *.tex duoc sinh ra bang Dracula
     * @return tra ve danh sach chuoi maxima cua newlatex.
     */
    protected LinkedList<String> GetNewMaxima(LinkedList<String> pathtexs) {
        LinkedList<String> newMaximas = new LinkedList<String>();
        for (int i = 0; i < pathtexs.size(); i++) {
            String path = Utils.Combine(this.getPathdata(), pathtexs.get(i));
            int end = pathtexs.get(i).indexOf(".");
            String guid = pathtexs.get(i).substring(0, end);
            String newLatex = "";
            if (this.isApp() == true) {
                newLatex = this.expressions.get(i).getLatex();
            } else {
                newLatex = Align.GetLatexFromFile(path);
            }

            newLatex = ReplaceFractor(newLatex);
            newLatex = ReplaceSymbolLatex(newLatex);
            System.out.println("Gia tri newlatex:" + newLatex);
            if (this.isApp() == false) {
                UpdateExpressList(guid, newLatex);
            }
/*g
            if (this.IsStandAlone() && !newLatex.contains("\\pm")) {
                String maxima = "";
                try {
                    maxima = Latex2Maxima.ToMaxima(newLatex);
                    if (maxima == null) {
                        WriteLogException("GetNewMaxima", "maxima null." + "\t --latex:" + newLatex + "--");
                    }
                    newMaximas.add(maxima + "");//hpham 120928 day neu tai day bi null co the gay ra loi cho toan bo chuong trinh.
                } catch (Throwable e) {
                    // TODO Auto-generated catch block
                    WriteLog("E-MAlign-GetNewMaxima", e.getMessage());
                    WriteLogException("GetNewMaxima", e.getMessage() + "\t --latex:" + newLatex + "--");
                }

             }
*/             
        }

        return newMaximas;
    }

    /**
     * lay maxima cua prelatex.
     *
     * @param maximas danh sach latex lien quan den prelatex
     * @return tra ve mot danh sach chuoi maxima.
     */
/*g    
    private LinkedList<String> GetOldMaxima(List<PreLatex> maximas) {
        LinkedList<String> oldMaximas = new LinkedList<String>();
        for (int i = 0; i < maximas.size(); i++) {
            System.out.println("Gia tri latex cu:" + maximas.get(i).getLatex());
            Align.WriteLog("GetOldMaxima", "Gia tri latex cu:"
                    + maximas.get(i).getLatex());
            String prelatex = maximas.get(i).getLatex();
            prelatex = ReplaceFractor(prelatex);
            prelatex = ReplaceSymbolLatex(prelatex);
            if (this.IsStandAlone()) {
                String maxima = "";
                try {
                    if (!prelatex.contains("\\pm")) {
                        maxima = Latex2Maxima.ToMaxima(prelatex);
                        if (maxima == null) {
                            WriteLogException("GetOldMaxima", "maxima: null.--latex:" + prelatex + "--");
                        }
                        oldMaximas.add(maxima + "");
                    } else {
                        oldMaximas.add("");
                    }
                } catch (Throwable e) {
                    // TODO Auto-generated catch block
                    WriteLog("E-MAlign-GetOldMaxima", e.getMessage());
                    WriteLogException("GetOldMaxima", e);

                    e.printStackTrace();
                }

            }
        }
        return oldMaximas;
    }

    private LinkedList<String> GetPmMaxima(String latex) {
        LinkedList<String> oldMaximas = new LinkedList<String>();
        String prelatex = latex;
        prelatex = ReplaceSymbolLatex(prelatex);
        if (this.IsStandAlone()) {
            String maxima;
            try {
                if (!"".equals(prelatex)) {
                    maxima = Latex2Maxima.ToMaxima(prelatex);
                    System.out.println("gia tri maxima:" + maxima);
                    oldMaximas.add(maxima);
                    System.out.println("gia tri khi doi dau: " + Revert(maxima));
                } else {
                    oldMaximas.add("");
                }
            } catch (Throwable e) {
                // TODO Auto-generated catch block
                WriteLog("E-MAlign-GetPmMaxima", e.getMessage());
                WriteLogException("GetPmMaxima", e.getMessage() + "\t--latex: " + prelatex + "--");
                e.printStackTrace();
            }

        }

        return oldMaximas;
    }
*/
    /**
     * kiem tra danh sach chuoi latex hop le khong khi gui toi snuggetex de phan
     * tich toi maxima.
     *
     * @param oldlatex true neu lien quan den prelatex, false neu lien quan den
     * latex hien tai(newLatex).
     * @return tra ve true neu hop le, nguoc lai false.
     */
/*g    
    private boolean IsValidLatex(boolean oldlatex) {
        for (int i = 0; i < this.expressions.size(); i++) {
            Expression item = this.expressions.get(i);
            String latex = "";
            if (oldlatex) {
                latex = item.getMaxima().getLatex();
            } else {
                latex = item.getLatex();
            }

            if (ValidateLatex(latex)) {
                WriteLogException("IsValidLatex", "latex have contains hbox, vbox,vtop.");
                return false;
            }
        }
        return true;
    }
*/
    /**
     * Kiem tra danh sach chuoi maxima do snuggtex phan tich co the gui toi
     * maxima kiem tra duoc khong.
     *
     * @param maximas
     * @return true neu hop le, nguoc lai false.
     */
/*g    
    private boolean IsValidMaxima(LinkedList<String> maximas) {
        for (int i = 0; i < maximas.size(); i++) {
            String maxima = maximas.get(i);
            if (ValidateMaxima(maxima)) {
                return false;
            }
        }
        return true;
    }
*/
    /**
     * kiem tra mot chuoi latex co the gui den snuggtex phan tich duoc khong.
     *
     * @param latex mot chuoi latex.
     * @return tra ve false neu duoc nguoc lai true.
     */
/*g    
    private static boolean ValidateLatex(String latex) {
        String cHbox = "\\hbox";
        String cVbox = "\\vbox";
        String cVtop = "\\vtop";
        boolean result = latex.contains(cHbox) || latex.contains(cVbox)
                || latex.contains(cVtop);
        return result;
    }
*/
    /**
     * kiem tra mot chuoi maxima co the gui den chuong trinh maxima duoc khong
     *
     * @param maxima
     * @return false neu duoc, true neu khong duoc.
     */
/*g    
    private static boolean ValidateMaxima(String maxima) {
        String cOperator = "operator";
        String cNull = "null";
        String cEmpty = "";

        System.out.println("ValidateMaxima >>gia tri maxima:" + maxima + "*");
        if (maxima == null) {
            return true;
        }
        boolean result = maxima.contains(cOperator) || maxima.contains(cNull)
                || maxima.trim().equals(cEmpty) ? true : false;
        return result;
    }
*/
    /**
     * ket hop cac chuoi bien cua chuong trinh thanh mot chuoi chua nhieu bien
     * nhat co the chuoi1(x,y) chuoi2(y,z) => ket qua bien(x,y,z)
     *
     * @param maxima true neu lien quan toi prelate, false neu la latex hien
     * tai(new latex).
     * @return tra ve chuoi bien.
     */
    protected String GetVariable(boolean maxima) {
        String rst = "";
        LinkedList<String> variableList = new LinkedList<String>();
        for (int i = 0; i < this.expressions.size(); i++) {
            String variable = "";
            Expression item = this.expressions.get(i);

            if (maxima) {
                if (item.getMaxima() != null) {
                    variable = item.getMaxima().getVariable();
                    //System.out.println("variable prelatex" + variable);
                    if(variable != null && !variable.trim().isEmpty() ) //g added
                       variableList.add(variable);
                }
            } else {
                variable = item.getVariable();
                //System.out.println("variable newlatex" + variable);
                if(variable != null && !variable.trim().isEmpty() ) //g added
                	variableList.add(variable);
            }

            if (!"".equals(variable)) {
                rst += variable + ",";
            }
        }
        rst = Utils.RemoveLast(rst, ",");
        int size = variableList.size();

        if (this.expressions.size() > 1) {
            String intersec = "";
            String variable = "";
            for (int i = 0; i < size; i++) {
                System.out.println("gia tri cua bien i:" + i);
                if (i == 0 && size >= 2) {
                    System.out.println("gia tri:" + variableList.get(0) + ",#"
                            + variableList.get(1));
                    intersec = Utils.Intersec(variableList.get(0),
                            variableList.get(1));
                    i++;
                } else {
                    intersec = Utils.Intersec(intersec, variableList.get(i));
                }

            }
            intersec = intersec.trim();
            System.out.println("Gia tri cua intersec: " + intersec);
            if ("".equals(intersec)) {

                for (int i = 0; i < size; i++) {
                    String item = variableList.get(i);
                    variable += item.substring(0, 1) + ",";
                }
                return Utils.RemoveLast(variable, ",");
            } else {
                String temp = intersec.replace(",", "");
                if (temp.length() < this.expressions.size()) {
                    String diff = Utils.Differen(variableList.get(0),
                            variableList.get(1));
                    System.out.println("cac phan tu chi co o moi phuong trinh"
                            + diff);
                    LinkedList<Probability> lstProies = findPLinkedList(diff);
                    System.out.println("kich thuoc listPro" + lstProies.size());
                    String variablenext = FindVariableNext(lstProies);
                    System.out.println("Bien tiep theo:" + variablenext);
                    if (!"".equals(variablenext)) {
                        variablenext = variablenext.substring(0, 1);
                        intersec += "," + variable;
                        intersec = Utils.RemoveLast(intersec, ",");
                    }
                }
                System.out.println("bien tiep theo" + intersec);
                return intersec;
            }

        } else {
            String[] variables = rst.split(",");
            String variable = variables[0];
            return variable;
        }

    }

    private String ReplaceSymbolLatex(String latex) {
        latex = latex.trim();

        if ("".equals(latex) || latex == null) {
            return "";
        } else {
            return latex.replace("\\cos", "{cos}")
                        .replace("\\sin","{sin}")
                        .replace("\\tan","{tan}")
                        .replace("\\sec","{sec}")
                        .replace("\\csc","{csc}")
                        .replace("\\cot","{cot}")
                        .replace("\\sinh","{sinh}")
                        .replace("\\cosh","{cosh}")
                        .replace("\\tanh","{tanh}")
                        .replace("\\sech","{sech}")
                        .replace("\\csch","{csch}")
                        .replace("\\coth","{coth}")
                        .replace("\\log","{log}")
                        .replace("\\ln","{ln}");
        }
    }
    
/*g
    private String Revert(String maxima) {
        String cEqual = "=";
        try {
            if (maxima.contains("=") && maxima != null && maxima != "null") {
                String[] maximas = maxima.split(cEqual);
                String right = maximas[1];
                System.err.println("gia tri cua ve phai:############### "
                        + right);
                if (maximas.length == 1) {
                    return "(" + maximas[0] + ")";
                } else {
                    return "(" + maximas[0] + " - (" + maximas[1] + "))";
                }
            }
        } catch (Exception e) {
            // TODO: handle exception
            WriteLog("E-Revert", e.getMessage());
            //WriteLogException("Revert", e);
            return maxima;
        }
        return maxima;
    }
*/
    private static String ReplaceFractor(String latex) {

        latex = latex.replaceAll("\\s+", "").replace("$", "");
        String rst = latex;
        String pattern = "(?:\\+|-|\\(|^)+"// bat dau 0-1 trong cac ki tu tren
                + "\\d+\\\\frac\\{\\d+\\}\\{\\d+\\}" + "(?:\\+|-|\\)|$)+";// ket
        // thuc
        // bang
        // 0-1
        // ki
        // t
        // tren
        String pattern2 = "\\d+\\\\frac\\{\\d+\\}\\{\\d+\\}";
        Matcher m = Pattern.compile(pattern).matcher(latex);
        while (m.find()) {
            String des = m.group();

            Matcher m2 = Pattern.compile(pattern2).matcher(des);

            if (m2.find()) {
                System.out.println("group:" + m2.group());
                String temp = m2.group().replace("\\\\frac", "+\\\\frac");

                if (des.indexOf("(") >= 0 && des.lastIndexOf(")") >= 0) {
                    temp = temp.replace("\\frac", "+\\\\frac");
                } else if (des.length() != m2.group().length()) {
                    temp = "(" + temp.replace("\\frac", "+\\\\frac") + ")";
                } else {
                    temp = temp.replace("\\frac", "+\\\\frac");
                }

                des = des
                        .replaceFirst(pattern2, Matcher.quoteReplacement(temp));

            }

            rst = rst.replaceFirst(pattern, des);
            System.out.println(rst);
        }
        return "$" + rst + "$";
    }

    /**
     * tạo ra chuỗi xml gửi tới client.
     *
     * @param result là kết quả của hàm compare();
     * @return chuỗi xml.
     * @throws IOException bị lỗi.
     */
    protected String BuildAlignResponse(boolean result) throws IOException {
        StringBuilder sb = new StringBuilder();

        sb.append("<AlignResponse ").append(" result=\"");

        if (result) {
            sb.append("1\"");
        } else {
            sb.append("0\"");
        }
        sb.append(" error=\"").append(this.getError().trim()).append("\"" + ">");
        if (this.expressions.size() > 0) {
            Expression expression = this.expressions.get(0);
            sb.append("<exerciseStep message=\"");
            sb.append(expression.Message()).append("\" ").append(" istrue=\"")
                    .append(expression.isResultStep()).append("\"");
            sb.append(" isfinish=\"").append(expression.isFinish())
                    .append("\"");
            sb.append("/>");
        }
        for (int i = 0; i < this.expressions.size(); i++) {
            Expression item = this.expressions.get(i);
            sb.append("<SegmentList  guid=\"").append(item.getGuid())
                    .append("\" ").append("TexString=\"");

            sb.append(item.getLatex()).append("\"").append(" variable=\"")
                    .append(item.getVariable()).append("\">");
            if (this.IsStandAlone() == false) {
                System.out
                        .println("HPHAM Chay connected:$$$$$$$$$$$$$$$$$$$$$$$$$$$"
                        + item.getLatex());
                sb.append(ActiveMathXml(item.getLatex()));
            }

            sb.append("<image>");

            String header = "data:image/png;base64,";
//x            String pathimage = Utils.Combine(this.getPathdata(),
//x                    item.getPngpath());
            String pathimage = ""; //x
            String binary = "";
            /*hpham 1209191440 phan danh cho native app */
            if (this.isApp() == false) {
                binary = header + Utils.ImageToBinary(pathimage);
            }
            /*het phan danh cho native app*/
            sb.append(binary).append("</image>").append("<imgp>")
                    .append(pathimage).append("</imgp>")
                    .append("</SegmentList>");
            // cv.DeleteFile(Cmd.getWorkingPath(), item.getGuid());
        }
        sb.append("</AlignResponse>");

        System.out.println("\n\n==================\n"+sb.toString());
        return sb.toString();
    }

    /**
     * thong bao loi cho client.
     *
     * @param error
     * @return
     */
    private String BuildError(String error) {
        StringBuilder sb = new StringBuilder();
        sb.append("<AlignResponse ").append(" error=\"");
        sb.append(error).append("\"");
        sb.append("/>");
        return sb.toString();
    }
/*g
    private String ActiveMathXml(String latex, boolean session) {
        String m_exerciseId = getSession().getAttribute("amexerciseid")
                .toString();
        String username = getSession().getAttribute("username").toString();
        String inputpostion = getSession().getAttribute("inputpostion")
                .toString();

        User user = new User(username);
        CoaxActiveMath coaxAc = new CoaxActiveMath();
        coaxAc.setExerciseId(m_exerciseId);
        coaxAc.setUserInput(latex);
        coaxAc.setUserInputPostion(Integer.parseInt(inputpostion));
        String xml = coaxAc.action(user, "OpenMath");

        WriteLog("ActiveMathXml(String latex)", xml);

        return xml;
    }
*/
    private String ActiveMathXml(String latex) {
        ActiveMathInfo aminfo = this.getAmInfo();
        String m_exerciseId = aminfo.getAmExerciseId();
        String username = aminfo.getUserAm();
        int inputpostion = aminfo.getInputPostion();
        String title = aminfo.getTitle();
        Utils.WriteFileTxt("ativemathinfo", aminfo.toString() + "\r" + latex);
        Utils.InitActiveMath();
        User user = null;
        if (this.useram == null) {
            System.out.println("username " + username);
            user = new User(username);
            this.setUseram(user);
        } else {
            user = this.getUseram();
        }
        if (user == null) {
            System.out.println("User chua duoc khoi tao : " + username);
            user = new User(username);
            this.setUseram(user);
        } else {
            System.out.println("user da duoc khoi tao : " + username);
        }
        CoaxActiveMath coaxAc = new CoaxActiveMath();
        coaxAc.setExerciseId(m_exerciseId);
        if (inputpostion == -1) {
            coaxAc.setUserInput("");
            title = "";
        } else {
            if (this.amInfo.isCheckHint() == true) {
                coaxAc.setUserInput("hint");
            } else {
                coaxAc.setUserInput(latex);
            }
        }
        coaxAc.setAnswerPrev(title);
        coaxAc.setUserInputPostion(inputpostion);
        System.out.println("da chay qua setUserInputPostion");
        String xml = coaxAc.action(user, "OpenMath");
        WriteLog("ActiveMathXml(String latex)", xml);
        Utils.WriteFileTxt("xmlactive", xml);
        System.out.println("chuoi xml " + xml);
        return xml;
    }

    /**
     * @return the session
     */
    public javax.servlet.http.HttpSession getSession() {
        return session;
    }

    /**
     * @param session the session to set
     */
    public void setSession(javax.servlet.http.HttpSession session) {
        this.session = session;
    }

    /**
     * @return lưu ca�?c thông tin liên quan tơ�?i activemath.
     */
    public ActiveMathInfo getAmInfo() {
        return amInfo;
    }

    /**
     * @param amInfo lưu ca�?c thông tin liên quan tơ�?i activemath.
     */
    public void setAmInfo(ActiveMathInfo amInfo) {
        this.amInfo = amInfo;
    }

    /**
     * @return the useram
     */
    public User getUseram() {
        return useram;
    }

    /**
     * @param useram the useram to set
     */
    public void setUseram(User useram) {
        this.useram = useram;
    }

    /**
     * @return the userMode
     */
    public String getUserMode() {
        return userMode;
    }

    /**
     * @param userMode the userMode to set
     */
    public void setUserMode(String userMode) {
        this.userMode = userMode;
    }

    public boolean IsStandAlone() {

        String usermode = this.getUserMode();
        System.out.println("##############:" + usermode);
        if ("".equals(usermode)
                || usermode
                .compareToIgnoreCase(com.coax.common.Cli.Mode.standalone
                .toString()) == 0) {
            return true;
        }
        return false;
    }

    /**
     * @return the error
     */
    public String getError() {
        return error.trim();
    }

    /**
     * @param error the error to set
     */
    public void setError(String error) {
        this.error = error.trim();
    }
}
