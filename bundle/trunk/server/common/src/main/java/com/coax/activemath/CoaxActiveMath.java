package com.coax.activemath;



import com.coax.common.Cli.Utils;
import org.activemath.config.Manager;
import org.activemath.exercises.*;
import org.activemath.webapp.user.User;
import java.io.*;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.activemath.webapp.user.UserManager;
import org.activemath.webapp.user.UserManagerException;
import org.jdom.*;
import org.jdom.output.XMLOutputter;
import org.activemath.omdocjdom.OJConstants;

import org.jdom.input.SAXBuilder;


/**
 *
 * @author phuctq
 */
public class CoaxActiveMath {

    public static final String EXERCISE_CONTAINER = "exercise_state_container";
    /**
     *
     */
    protected static final Namespace omdocNamespace = Namespace.getNamespace("omdoc", "http://www.mathweb.org/omdoc");
    /**
     *
     */
    protected static final Namespace dublinCoreNamespace = Namespace.getNamespace("dc", "http://purl.org/DC");
    /**
     *
     */
    private InteractionManager _teacherAssistant;
    private Vector _userInputHistory;
    private String exerciseId = null;
    private String userInput = null;
    private int userInputPosition = 0;
    private boolean _isfinish = false;
    private String sLatex = "";//this.sLatex
    private String answerPrev = "";
    /**
     *
     */
    public CoaxActiveMath() {
        this._teacherAssistant = null;
        this.exerciseId = null;
        this.userInputPosition = 0;
        this.userInput = "";
        _isfinish = false;
        answerPrev = "";
    }

    /**
     * @return the _teacherAssistant
     */
    public InteractionManager getTeacherAssistant() {
        return this._teacherAssistant;
    }

    /**
     * @param teacherAssistant the _teacherAssistant to set
     */
    protected void setTeacherAssistant(InteractionManager teacherAssistant) {
        this._teacherAssistant = teacherAssistant;
    }

    /**
     * @return the _userInputHistory
     */
    public Vector getUserInputHistory() {
        return this._userInputHistory;
    }

    /**
     *
     * @param userInputHistory
     */
    protected void setUserInputHistory(Vector userInputHistory) {
        this._userInputHistory = userInputHistory;
    }

    /**
     * @return the exerciseId
     */
    public String getExerciseId() {
        return this.exerciseId;
    }

    /**
     *
     * @param exerciseId
     */
    public void setExerciseId(String exerciseId) {
        this.exerciseId = exerciseId;
    }

    /**
     * @return the userInput
     */
    public String getUserInput() {
        return this.userInput;
    }

    /**
     * Truyền vào một chuỗi dạng latex.$2+3$.Nếu bài toán load ban đầu thì latex
     * = ""
     *
     * @param latex
     */
    public void setUserInput(String latex) {
        sLatex = latex;
        if ("".equals(latex)) {
            this.userInput = "";
        } else {
            if ("hint".equals(latex)) {
                this.userInput = "<om:OMOBJ xmlns:om=\"http://www.openmath.org/OpenMath\"><om:OMS cd=\"org.activemath.exercises.user_requests\" name=\"hint\" /></om:OMOBJ>";
            } else {
                this.userInput = Utils.Latex2OpenMath(latex);
            }
        }

    }

    /**
     * @return the userInputPosition
     */
    public int getUserInputPosition() {
        return this.userInputPosition;
    }

    /**
     *
     * @param userInputPostion
     */
    public void setUserInputPostion(int userInputPostion) {
        this.userInputPosition = userInputPostion >= 0 ? userInputPostion : 0;
    }

    /**
     * Bước kế tiếp giải bài tập
     *
     * @param _teacherAssistant :truyền vào lớp InteractionManager.đối tượng này
     * cần sống trong suốt quá trình khi giải bài toàn
     * @param userInput :truyền vào userInput dạng cấu trúc omdoc.khi load bài
     * tập lần đầu tiên thì userInput truyền vào null hay rỗng
     * @param userInputSyntax : OpenMath hay ActiveMath
     * @param user :tên user khi đăng nhập
     * @param exerciseId :Mã bài tập
     * @param _userInputHistory :truyền vào mã vector
     * @param userInputPosition :truyền vào từng bước giải của học sinh khi
     * giải.Mỗi lần giải bài toán có thể tăng lên từng bước kể cả sai
     * @return
     */
    protected String getNextStep(InteractionManager _teacherAssistant, String userInput, String userInputSyntax,
            User user, String exerciseId, Vector _userInputHistory, int userInputPosition) {
        if (userInputPosition < _userInputHistory.size()) {
            _userInputHistory.setSize(userInputPosition);
        }
        if (userInputPosition > _userInputHistory.size()) {
            userInputPosition = _userInputHistory.size();
        }

        System.out.println("==========================================================");
        System.out.println("============userInputPos" + userInputPosition + "=============================");

        if (userInput.equals("") || userInput == null) {
        } else {
            InteractionManager.UserInputHistoryEntry userInputHistoryEntry =
                    new InteractionManager.UserInputHistoryEntry();
            List omobjList;//getElementList(userInput) ;//
            omobjList = CasParser.linearToOpenMath(userInput, userInputSyntax);//Dua cau tra loi ve dinh danh List
            userInputHistoryEntry.setAnswer(omobjList);
            System.out.println("userInput : " + userInput);
            _userInputHistory.add(userInputHistoryEntry);
            userInputPosition = _userInputHistory.size();
        }
        //     _userInputHistory.add(userInputHistoryEntry);
        Element exerciseStepResult = new Element("omdoc",
                OJConstants.OMDOC_NAMESPACE);
        exerciseStepResult.setAttribute("lang", user.getLanguage(),
                Namespace.XML_NAMESPACE);
        _teacherAssistant.run(_userInputHistory.listIterator(),
                exerciseStepResult);

        exerciseStepResult.setAttribute("id", exerciseId);
        List contents = _teacherAssistant.getLastStepFeedbackContent();
        XMLOutputter output = new XMLOutputter();
        String testXmlResult = "";
        testXmlResult = output.outputString(exerciseStepResult);
        System.out.println("result :" + testXmlResult);
        if (contents != null) {
            System.out.println("ket qua : " + output.outputString(contents));
        }
        Utils.WriteLog("exerciseStepResult >>>>>>>>>>>>>>>>>>>>>: ", testXmlResult);
        System.out.println("==========================================================");
        System.out.println("==========================================================");
        Element root = htmlformat(exerciseStepResult);
        ActiveMath active = getAMresponse(root, _teacherAssistant.isExerciseFinished());
        System.out.println("html >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        System.out.println("xml " + active.ObjXml());
        System.out.println("hint : " + _teacherAssistant.hasSpecialAction("hint"));
        System.out.println("ket thuc " + _teacherAssistant.isExerciseFinished());
        this._isfinish = _teacherAssistant.isExerciseFinished();
        System.out.println("==========================================================");
        return active.ObjXml();
    }

    /**
     *
     * @param user
     * @param userInputSyntax
     * @return
     */
    protected String getNextStep(User user, String userInputSyntax) {
        if (this.userInputPosition < this._userInputHistory.size()) {
            this._userInputHistory.setSize(this.userInputPosition);
        }
        if (this.userInputPosition > this._userInputHistory.size()) {
            this.userInputPosition = this._userInputHistory.size();
        }
        System.out.println("==========================================================");
        System.out.println("============ userInputPos" + userInputPosition + "=============================");
        Utils.WriteLog("getNetStep(user) ", userInputSyntax + " " + exerciseId);

        System.out.println("userInput : " + userInput);
        if (userInput.equals("") || userInput == null) {
        } else {
            InteractionManager.UserInputHistoryEntry userInputHistoryEntry =
                    new InteractionManager.UserInputHistoryEntry();
            List omobjList;//getElementList(userInput) ;//
            omobjList = CasParser.linearToOpenMath(userInput, userInputSyntax);//Dua cau tra loi ve dinh danh List
            userInputHistoryEntry.setAnswer(omobjList);
            this._userInputHistory.add(userInputHistoryEntry);
            this.userInputPosition = this._userInputHistory.size();
        }
        //     _userInputHistory.add(userInputHistoryEntry);
        Element exerciseStepResult = new Element("omdoc",
                OJConstants.OMDOC_NAMESPACE);
        exerciseStepResult.setAttribute("lang", user.getLanguage(),
                Namespace.XML_NAMESPACE);
        this._teacherAssistant.run(this._userInputHistory.listIterator(),
                exerciseStepResult);

        //sn: returns result like 
        // <omd:omdoc xmlns:omd="http://www.mathweb.org/omdoc" xml:lang="en" id="mbase://wooinvi-demo-Book/my_first_theory/exercise_wooinvi1335020600936"><metadata xmlns="http://www.mathweb.org/omdoc"><Title xmlns="http://purl.org/DC" inherit="nothing" xml:lang="en">exercise_wooinvi1335020600936_1</Title></metadata><omdoc:interaction xmlns:omdoc="http://www.mathweb.org/omdoc"><omdoc:feedback><metadata xmlns="http://www.mathweb.org/omdoc"><Title xmlns="http://purl.org/DC" inherit="nothing" xml:lang="en">exercise_wooinvi1335020600936_1</Title></metadata><CMP xmlns="http://www.mathweb.org/omdoc" xml:lang="en">Giai phuong trinh bac nhat don gian x- 2 = -2x+7.</CMP><CMP xmlns="http://www.mathweb.org/omdoc" xml:lang="x-all"><OMOBJ xmlns="http://www.openmath.org/OpenMath" version="2.0"><omdoc:with style="exercise-answer"><blank xmlns="http://www.mathweb.org/omdoc" position="1" size="5" /></omdoc:with></OMOBJ></CMP></omdoc:feedback></omdoc:interaction></omd:omdoc>
        // this string is stored in exerciseStepResult

        exerciseStepResult.setAttribute("id", exerciseId);
        // List contents = this._teacherAssistant.getLastStepFeedbackContent();
        XMLOutputter output = new XMLOutputter();
        System.out.println("result :" + output.outputString(exerciseStepResult));
        //if (contents != null) {
        //  System.out.println("ket qua : " + output.outputString(contents));
        //}
        System.out.println("==========================================================");
        System.out.println("==========================================================");
        //xml <p>giai phuong trinh </p>
        String sTitle =  getTitleElement(exerciseStepResult);
        Element root = htmlformat(exerciseStepResult); //sn: transform the omdoc string to html format, remove tags like <span>.  we do not use xslt for this.
        ActiveMath active = getAMresponse(root, this._teacherAssistant.isExerciseFinished());
        active.setTitle(sTitle);
        boolean istrue = this.getAnswerPrev().equals(sTitle);
        active.setIstrue(!istrue);
        this.setAnswerPrev(sTitle);
        System.out.println("html >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        System.out.println("xml " + active.ObjXml());
        System.out.println("hint : " + this._teacherAssistant.hasSpecialAction("hint"));
        System.out.println("ket thuc " + this._teacherAssistant.isExerciseFinished());
        System.out.println("==========================================================");
        this._isfinish = _teacherAssistant.isExerciseFinished();
        return active.ObjXml();
    }

    private String getTitleElement(Element element){
        String s = "";
        List list = element.getChildren();
        for(int i = 0;i<list.size();i++){
            Element row = (Element)list.get(i);            
            if(row.getName().trim().equals("metadata")){
                List children = row.getChildren();
                for(int j = 0;j<children.size();j++){
                    Element child = (Element)children.get(j);
                    if(child.getName().trim().equals("Title")){
                        s = child.getText();                        
                    }
                }
            }
        }
        return s;
    }
    
    /**
     * Trả v�? một Element <root><p></p></root>
     *
     * @param element :truyền vào exerciseStepResult khi bước giải đó có thể
     * hoàn thành hay không
     * @return
     */
   private static Element htmlformat(Element element){
        org.activemath.presentation.Formatter formatter = new org.activemath.presentation.Formatter("html", "en");
        byte[] fragment = formatter.formatItem(element);
        String transformationResult = "";
        if (fragment != null){
            try {
                transformationResult = new String(fragment, "UTF-8");
                transformationResult = transformationResult.replaceAll("<br xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">","");
                String temp = "<root>" + transformationResult +"</root>";
               // Element rootTemp = getElement(temp);
               // System.out.println(" roottemp " + new XMLOutputter().outputString(rootTemp));
                System.out.println("transformation : " + transformationResult);
                int start = transformationResult.indexOf("<table");
                int end = transformationResult.indexOf("</table>") + 8;//</table></span>
                int len = transformationResult.length();
                String sString = "";
                while(start > 0 && start < end){
                    len = transformationResult.length();
                    sString = "";
                    sString = transformationResult.substring(0,start);
                    if(end < len)
                        sString = sString + transformationResult.substring(end,len);                    
                    transformationResult = sString;
                    start = transformationResult.indexOf("<table");
                    end = transformationResult.indexOf("</table>") + 8;//</table></span>
                }
                start = transformationResult.indexOf("<nobr");
                end = transformationResult.indexOf("</nobr>") + 7;//</table></span>
                                
                while(start > 0 && start < end){
                    len = transformationResult.length();
                    sString = "";
                    sString = transformationResult.substring(0,start);
                    if(end < len)
                        sString = sString + transformationResult.substring(end,len);                    
                    transformationResult = sString;
                    start = transformationResult.indexOf("<nobr");
                    end = transformationResult.indexOf("</nobr>") + 7;//</table></span>
                }
                System.out.println("transformationResult " + transformationResult);
                if(!transformationResult.equals("")){
                    transformationResult = transformationResult.replaceAll("<br xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">","");
                    transformationResult =  "<root>" + transformationResult + "</root>";
                    Element root = getElement(transformationResult);
                    return root;
                }                
            } catch (UnsupportedEncodingException ex) {
                System.out.println("err htmlformat " + ex.getMessage());
            }
        }
        return null;
    }

    /**
     *
     * @param input
     * @return
     */
    private static Element getElement(String input) {
        SAXBuilder builder = new SAXBuilder();
        Element element = null;
        Document document = null;
        try {
            document = builder.build(new ByteArrayInputStream(input.getBytes()));
            element = document.getRootElement();
        } catch (JDOMException ex) {
            ////   Logger.getLogger(ActiveMathTess.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            // Logger.getLogger(ActiveMathTess.class.getName()).log(Level.SEVERE, null, ex);
        }

        return element;
    }

    /*
     * private static String getuserInput1() { String s = ""; s = "<om:OMOBJ
     * xmlns:om=\"http://www.openmath.org/OpenMath\"><om:OMA><om:OMS
     * cd=\"relation1\" name=\"eq\" /><om:OMV name=\"x\" /><om:OMA><om:OMS
     * cd=\"arith1\" name=\"divide\"
     * /><om:OMI>9</om:OMI><om:OMI>3</om:OMI></om:OMA></om:OMA></om:OMOBJ>";
     * return s; }
     */
    /**
     * Trả v�? đối tượng ActiveMath 
     *   <activemath description="Giai phuong trinh
     *   bac nhat don gian x- 2 = -2x+7." isfinish="false" title=""
     *   hint=""></activemath>
     *
     * "response" refers to user actions of 
     * 1.  select an exercise (uses the Submit mechanism)
     * 2.  Hint request
     * 3.  Submit work
     * 
     * @param element
     * @param isFinish
     * @return
     */
    protected ActiveMath getAMresponse(Element element, boolean isFinish) {
        ActiveMath active = new ActiveMath();
        String stitle = "";
        String shint = "";
        Boolean sisFinish = isFinish;
        String sDesrciption = "";        
        Element obj = null;
        List children = element.getChildren();
        String objElement = "";        
        for(int i = 0;i< children.size();i++){
            Element row = (Element)children.get(i);
            String sText = row.getTextTrim();
            String sName = row.getName();
            String s = "";           
            boolean bBool = false;
            for(int j = 0;j < row.getChildren().size();j++){
                Element el =(Element)row.getChildren().get(j);
                s = el.getTextTrim();
                bBool = true;
            }
            String sString = "";
            if(bBool)
                sString = s;
            else
                sString = sText;
            if(!sString.equals("")){
                objElement += "<"+ sName + ">" + sString + "</" + sName + ">";                
            }
        }
        
        objElement ="<root>" + objElement + "</root>" ;                
        element = getElement(objElement);
        System.out.println("dinh dang xml " + new XMLOutputter().outputString(element));
        if(element != null){
            List list = element.getChildren();
            int count = list.size();
            if(count == 1){
                obj =(Element) list.get(0);
                sDesrciption = obj.getTextTrim();
            }
            else if(count >= 2){
                obj =(Element) list.get(0);
                shint = obj.getTextTrim();
                obj =(Element) list.get(1);
                sDesrciption = obj.getTextTrim();    
            }
        }
        active.setDescription(sDesrciption);
        if(this.sLatex.equals("hint")){
            active.setHint(shint);
        }
        else{
            active.setMessage(shint);
        }
        
        active.setIsfinish(isFinish);
        
        return active;
    }

    /**
     * Trả về đối tượng ActiveMath
     *
     * @param element
     * @param hint
     * @param isFinish
     * @return
     */
    protected ActiveMath getActiveMath(Element element, boolean hint, boolean isFinish) {
        ActiveMath active = new ActiveMath();
        String stitle = "";
        String shint = "";
        Boolean sisFinish = isFinish;
        String sDesrciption = "";
        Element interaction = element.getChild("interaction", omdocNamespace);
        int i = 0, j = 0;
        if (interaction != null) {
            System.out.println(interaction.getName());
            List list = interaction.getChildren("feedback", omdocNamespace);
            List children = null;
            Element obj = null;
            int len = list.size();
            Element chil = null;
            if (len == 1) {
                obj = (Element) list.get(0);
                children = obj.getChildren();
                for (i = 0; i < children.size(); i++) {
                    chil = (Element) children.get(i);
                    if ("metadata".equals(chil.getName())) {
                        //lay title
                        Element titleEl = chil.getChild("Title", dublinCoreNamespace);
                        if (titleEl != null && isFinish) {
                            stitle = titleEl.getText();
                        }
                    } else if ("CMP".equals(chil.getName())) {
                        sDesrciption = chil.getText();
                        break;
                    }
                }
            } else if (len == 2) {
                obj = (Element) list.get(0);
                children = obj.getChildren();
                for (i = 0; i < children.size(); i++) {
                    chil = (Element) children.get(i);
                    if ("CMP".equals(chil.getName())) {
                        if (hint) {
                            shint = chil.getText();
                            break;
                        } else {
                            sDesrciption = chil.getText();
                        }
                    }
                }
                obj = (Element) list.get(1);
                children = obj.getChildren();
                for (i = 0; i < children.size(); i++) {
                    chil = (Element) children.get(i);
                    if ("CMP".equals(chil.getName())) {
                        sDesrciption = chil.getText();
                        break;
                    }
                }
            }
        }

        active.setDescription(sDesrciption);
        active.setHint(shint);
        active.setIsfinish(isFinish);
        active.setTitle(stitle);
        return active;
    }

    /**
     *
     * @param user
     * @param userInputSyntax
     * @return
     */
    public String action(User user, String userInputSyntax) {
        String sResult = "";
        try {
            this.InitExercise(user);
        } catch (IOException ex) {
            Logger.getLogger(CoaxActiveMath.class.getName()).log(Level.SEVERE, null, ex);
        }
        try {
            sResult = this.getNextStep(user, userInputSyntax);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        if (this._isfinish) {
            destroyExercise(user);
        }
        return sResult;
    }

    protected void destroyExercise(User user) {
        ExerciseStateContainer ec = (ExerciseStateContainer) user.attachedObject(EXERCISE_CONTAINER);
        if (ec == null) {
        } else {
            ec.removeExercise(this.exerciseId);
        }
    }

    /**
     *
     * @param user
     * @throws IOException
     */
    protected void InitExercise(User user) throws IOException {
        ExerciseStateContainer ec = (ExerciseStateContainer) user.attachedObject(EXERCISE_CONTAINER);
        if (ec == null) {
            int maxExerciseNumber = 1;
            if (Manager.getProperty("exercises.number") != null) {
                try {
                    maxExerciseNumber = Integer.parseInt(Manager.getProperty("exercises.number"));
                } catch (NumberFormatException e) {
                }
            }//end Manager
            ec = new ExerciseStateContainer(maxExerciseNumber);
            user.attachObject(EXERCISE_CONTAINER, ec);
        }//end ec
        ExerciseState state = null;
        if (ec.hasExercise(exerciseId)) {
            state = ec.getExercise(exerciseId);
        }//end if ec.hasExercise

        if (state == null) {
            state = new ExerciseState(exerciseId, null, user);
            ec.addExercise(exerciseId, state);
        }//end if state        
        setTeacherAssistant(state.getInteractionManager());
        setUserInputHistory(state.getUserInputHistory());
    }//end function InitExercise

    /**
     * @return the answerPrev
     */
    public String getAnswerPrev() {
        return answerPrev;
    }

    /**
     * @param answerPrev the answerPrev to set
     */
    public void setAnswerPrev(String answerPrev) {
        this.answerPrev = answerPrev;
    }
}
class ExerciseStateContainer {

    private int maxNr;
    private Map exercises;
    protected static Logger log = Logger.getLogger(ExerciseStateContainer.class.getName());

    protected ExerciseStateContainer(int maxNr) {
        this.maxNr = maxNr;
        exercises = new HashMap(maxNr);
        log.info("creating ExerciseStateContainer, capacity: " + maxNr);
    }

    protected void addExercise(String exerciseId, ExerciseState state) {
        if (maxNr > 1) {
            if (exercises.size() >= maxNr) {
                removeTheEarliestState();
            }
        } else {
            exercises.clear();
            log.info("removing exercise from container");
        }
        log.info("adding exercise " + exerciseId);
        exercises.put(exerciseId, state);
    }

    protected ExerciseState getExercise(String exerciseId) {
        ExerciseState state = null;
        if (hasExercise(exerciseId)) {
            state = (ExerciseState) exercises.get(exerciseId);
            state.access();
        }
        log.info("getting exercise " + exerciseId + " from container");
        return state;
    }

    protected boolean hasExercise(String exerciseId) {
        return exercises.containsKey(exerciseId);
    }

    protected void removeExercise(String exerciseId) {
        exercises.remove(exerciseId);
        log.info("removing exercise " + exerciseId + " from container");
    }

    private void removeTheEarliestState() {
        String keyToRemove = "";

        /*
         * init earliest that the first state is earlier
         */
        long earliest = System.currentTimeMillis();

        Iterator it = exercises.keySet().iterator();
        while (it.hasNext()) {
            String key = (String) it.next();
            ExerciseState state = (ExerciseState) exercises.get(key);
            if (state.lastAccess() < earliest) {
                earliest = state.lastAccess();
                keyToRemove = key;
            }
        }
        exercises.remove(keyToRemove);
        log.info("container is full, removing exercise "
                + keyToRemove
                + " last modification: "
                + java.text.DateFormat.getDateInstance(
                java.text.DateFormat.MEDIUM).format(new Date(earliest)));
    }
}

/**
 * Current state of an exercise
 *
 * @author Jan
 *
 */
class ExerciseState {

    private long accessTime;
    private String exerciseId;
    private InteractionManager manager;
    private Vector history;
    private String strategy = null;

    protected ExerciseState(String exerciseId, String strategy, User user)
            throws IOException {
        this.exerciseId = exerciseId;
        this.accessTime = System.currentTimeMillis();
        this.manager = new InteractionManager(user);
        this.history = new Vector();
        this.strategy = strategy;

        if (null == strategy) {
            manager.selectExercise(exerciseId);
        } else {
            manager.selectExercise(exerciseId, strategy);
        }
    }

    protected void access() {
        this.accessTime = System.currentTimeMillis();
    }

    protected long lastAccess() {
        return this.accessTime;
    }

    protected InteractionManager getInteractionManager() {
        return this.manager;
    }

    protected Vector getUserInputHistory() {
        return this.history;
    }

    protected String getExerciseId() {
        return this.exerciseId;
    }

    protected String getStrategy() {
        return this.strategy;
    }
}

/*
 * Settings for Emacs. Local variables: c-basic-offset: 4 tab-width: 4
 * indent-tabs-mode: nil End:
 */
