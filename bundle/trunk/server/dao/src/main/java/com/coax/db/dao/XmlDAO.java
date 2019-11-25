package com.coax.db.dao;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;
import org.xml.sax.InputSource;

import com.coax.db.dto.Histories;
import com.coax.db.dto.Settings;
import com.coax.db.dto.Steps;
import com.coax.db.dto.Theme;

/**
 * @author phuctq Class này thực hiện các cấu trúc xml.truyền vào 1 xml và trả
 * về 1 xml xử lý XML
 */
public class XmlDAO {

    public XmlDAO() {
    }

    /**
     * @param list :Truyền vào danh sách các đối tượng của setting.
     * @param name :Truyền vào tên của 1 field
     * @return :trả về giá trị true hay flase của field tương ứng.
     */
    private String findConfig(List<Settings> list, String name) {
        String s = "del";
        for (int i = 0; i < list.size(); i++) {
            Settings item = (Settings) list.get(i);
            if (item.getName().toLowerCase().trim().equals(name.toLowerCase().trim())) {
                s = item.isValue();
                if (item.isValue().trim().equals("1")) {
                    s = "true";
                } else if (item.isValue().trim().equals("0")) {
                    s = "";
                }
                break;
            }
        }
        return s;
    }

    /**
     * @param userId :Truyền userId
     * @return :Trả về danh sách setting theo định dạng xml
     */
    public String reasXml(long userId) {
     String sXmlFile = "";
     SettingDAO setting = new SettingDAO();
     String procedure = "{call getConfigUser(?)}";
     String[] params = {"p_UserId"};
     Object[] obj = {userId};
     List<Settings> list = setting.getItem_Nullable(procedure, params, obj);
     if(list!=null){
        System.out.println("\n\nXmlDao.getItem_Nullable: mysql procedure getConfigUser("+userId+") returns "+list.size()+" items");
        String path = XmlDAO.class.getProtectionDomain().getCodeSource().getLocation().getPath();
        Subconfig fig = Subconfig.getInstance();
        path = fig.getPath(path);
        path = path + File.separator + "settings_tree.xml";

        InputSource xml = new InputSource(path);//"settings_tree.xml"
        Document doc = null;
        SAXBuilder builder = new SAXBuilder();
        String sId = "id";
        String sDefault = "default";
        String sValue = "";
        try {
            doc = builder.build(xml);
            Element root = doc.getRootElement();
            Element system = root.getChildren().size() > 0 ? (Element) root.getChildren().get(0) : null;
            List rows = system.getChildren();
            Element row = (Element) rows.get(0);//button
            List symbolChilds = row.getChildren();
            Element children;
            int i = 0;
            String sName = "";
            for (i = 0; i < symbolChilds.size(); i++) {
                children = (Element) symbolChilds.get(i);
                sName = children.getAttributeValue(sId);
                sValue = this.findConfig(list, sName);
                children.setAttribute(sDefault, sValue);
            }
            /*
             * xet button Show/hide
             */
            row = (Element) rows.get(1);//hpham 1208211028 layout>menu>.. =>layout>..
            symbolChilds = row.getChildren();
            for (i = 0; i < symbolChilds.size(); i++) {
                children = (Element) symbolChilds.get(i);
                sName = children.getAttributeValue(sId);
                sValue = this.findConfig(list, sName);
                children.setAttribute(sDefault, sValue);
            }

            row = (Element) rows.get(2);//Gestures
            List rowChils = row.getChildren();
            for (i = 0; i < rowChils.size(); i++) {
                row = (Element) rowChils.get(i);
                symbolChilds = row.getChildren();
                for (int j = 0; j < symbolChilds.size(); j++) {
                    children = (Element) symbolChilds.get(j);
                    sName = children.getAttributeValue(sId);
                    sValue = this.findConfig(list, sName);
                    children.setAttribute(sDefault, sValue);
                }
            }
            if (rows.size() > 3) {
                row = (Element) rows.get(3);//Style
                rowChils = row.getChildren();
                for (i = 0; i < rowChils.size(); i++) {
                    row = (Element) rowChils.get(i);
                    sName = row.getAttributeValue(sId);
                    sValue = this.findConfig(list, sName);
                    String s = sValue;
                    if (sValue.equals("true")) {
                        s = "1";
                    } else if (sValue.equals("") || sValue.equals("del")) {
                        s = "0";
                    }
                    int t = Integer.parseInt(s);
                    String sbackground = "white";
                    if (t > 0) {
                        ThemesDAO themes = new ThemesDAO();
                        List<Theme> arrTheme = themes.getItem(t);
                        if (arrTheme.size() > 0) {
                            Theme itemTheme = (Theme) arrTheme.get(0);
                            sbackground = itemTheme.getBackground();
                            s = Integer.toString(itemTheme.getId());
                        }
                    }
                    row.setAttribute(sDefault, s);
                    row.setAttribute(Theme.c_background, sbackground);
                }
            }
            XMLOutputter outputter = new XMLOutputter();
            sXmlFile = outputter.outputString(doc);

        } catch (JDOMException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
     }//if(list!=null)
     return sXmlFile;
    }//end of reasXml

    /**
     * @param xml: truyền vào đinh dạng xml và thực hiện update setting
     */
    public void wirteSetting(String xml) {
        SAXBuilder builder = new SAXBuilder();
        Document document = null;
        String sId = "id";
        String sDefault = "default";
        try {
            document = builder.build(new ByteArrayInputStream(xml.getBytes()));
            Element root = document.getRootElement();//root
            List rows = root.getChildren();
            long userId = Long.parseLong(root.getAttributeValue(sId));

            for (int i = 0; i < rows.size(); i++) {
                Element row = (Element) rows.get(i);
                String sName = row.getAttributeValue(sId);
                String sValue = row.getAttributeValue(sDefault).trim();
                if (sValue.toLowerCase().equals("true".toLowerCase())) {
                    sValue = "1";
                } else if (sValue.toLowerCase().equals("false".toLowerCase())) {//false
                    sValue = "0";
                }
                long t = 1;
                SettingDAO setting = new SettingDAO();
                Settings item = new Settings();
                item.setId(t);
                item.setName(sName);
                item.setValue(sValue);
                item.setUserId(userId);
                item.setConfigId(1);
                setting.updateOnSubmint(item);

            }

        } catch (JDOMException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

/******************************************************************************
     * @param xml :Truyền vào định dạng xml. để ghi xuống historys trong cơ sở
     * dữ liệu
     * @return :trả về id của historys
******************************************************************************/

public Map<String,Object>  Histories(String xml) {
SAXBuilder builder = new SAXBuilder();
String sSegment = "segments";    String sUserId = "userId";
String slatex = "latex";         String sStatus = "status";
String sSelectId = "selectId";   String sExerId = "exerId";
String sVersion = "version";     String sFromStep = "fromStep";
String sToStep = "toStep";       String sImage = "image";
String shistoryId = "historyId"; String scolor = "color";
Document document = null;        long historyId = -1;
String sHis = "";                String image = "";
try {

document = builder.build(new ByteArrayInputStream(xml.getBytes()));
Element root = document.getRootElement();

HistoriesDAO history = new HistoriesDAO();
Histories item = new Histories();
item.setstroke(xml);

String xmlStroke = "";
//xet Segment va children of Segment
List rows = root.getChildren(sSegment);
for (int i = 0; i < rows.size(); i++) {
    Element row = (Element) rows.get(i);
    xmlStroke = "<" + sSegment + ">";
    List children = row.getChildren();
    XMLOutputter output = new XMLOutputter();
    for (int j = 0; j < children.size(); j++) {
        Element chil = (Element) children.get(j);
        xmlStroke = xmlStroke + output.outputString(chil);    }
    xmlStroke = xmlStroke + "</" + sSegment + ">";

    String userId = row.getAttributeValue(sUserId);
    String exerciseId = row.getAttributeValue(sExerId);
    String version = row.getAttributeValue(sVersion);
    String selectId = row.getAttributeValue(sSelectId);
    item.setSessionId(  Long.parseLong(selectId));
    item.setVersion(    Integer.parseInt(version));
    
    item.setAction(     Short.parseShort(row.getAttributeValue(sStatus)));
    item.setformula(    row.getAttributeValue(slatex));
    item.setExerciseId( Long.parseLong(exerciseId));
    item.setUserId(     Long.parseLong(userId));
    item.setStepFrom(   Short.parseShort(row.getAttributeValue(sFromStep)));
    item.setStepTo(     Short.parseShort(row.getAttributeValue(sToStep)));
    item.setId(         Long.parseLong(row.getAttributeValue(shistoryId))); 
    sHis = row.getAttributeValue(shistoryId);
    item.setVersion(Integer.parseInt(version));
    image = row.getAttributeValue(sImage);
    item.setProc_skipped(row.getAttributeValue("proc_skipped"));
}

List rowsColor = root.getChildren(scolor);
String colorText = "";
for (int j = 0; j < rowsColor.size(); j++) {
    Element rowColor = (Element) rowsColor.get(j);
    String color = rowColor.getText();

    if (color.toLowerCase().equals("red")) {
    	item.setResult(false);
    	colorText = "<color>red</color>";
    }
    else{
    	item.setResult(true);
    	colorText = "<color>green</color>";
    }
}

image = image == null ? "" : image;
xmlStroke = "<root>" + xmlStroke + colorText + "</root>";

item.setstroke(xmlStroke);
item.setImage(image);

//cat chuoi historyId khi gui len
String[] sArrHis = sHis.split(";");
if (item.getAction() == 3) {
    //item.setparentID(-1);
    //item.setAction( Short.parseShort("3") );
    historyId = (Long) history.updateOnSubmint(item, 3);
    /*
    for (int j = 0; j < sArrHis.length; j++) {
        historyId = Long.parseLong(sArrHis[j]);
        if (historyId != -1) {
            Short action = 3;
            item.setId(historyId);
            item.setAction(action);
            history.updateOnSubmint(item);        }
        }
     */   
}
else if (item.getAction() == 2) {
    historyId = Long.parseLong(sArrHis[0]);
    if (historyId != -1) {
        item.setId(historyId);
        historyId = (Long) history.updateOnSubmint(item); 
    }
}
// action = 4 for updating result (not formula & strokes because these 2 are not correct)
else if (item.getAction() == 4) {
    historyId = Long.parseLong(sArrHis[0]);
    if (historyId != -1) {
    	item.setId(historyId);
    	item.setAction((short) 2);
    	 historyId = (Long) history.updateOnSubmint(item,2);    	
    }
}
else {
    historyId = (Long) history.insertOnSubmit(item);
    System.out.println("item: version=" + item.getVersion() +" historyId="+historyId);
}} // end long try{..}

catch (JDOMException e) { e.printStackTrace(); } 
catch (IOException e) { e.printStackTrace();        }
        
Histories histories =     HistoriesDAO.GetHistoryById(historyId);
Map<String,Object> a = new HashMap<String,Object>();
a.put("historyId", historyId);
if(histories == null) a.put("version",0 );   
else a.put("version",histories.getVersion());
      
return a;    }

/******************************************************************************
     * @param xml :Truyền vào định dạng xml của bài tập.lọc lấy bước giải tương
     * ứng có trong cở sỡ dữ liệu
     * @return :Trả về định dạng xml tương ứng bước giải kế tiếp
******************************************************************************/
    public String BuildStringDatFile(String xml) {
        SAXBuilder builder = new SAXBuilder();
        int count = 0;
        Document document = null;
        String cExercise = "Exercise";
        String cSegmentList = "SegmentList";
        String sSegment = "Segment";
        String cMaxima = "maxima";
        String csymbol = "symbol";
        String cmin = "min";
        String cmax = "max";
        String cid = "id";
        String cvariable = "variable";
        long exerciseId = 0;
        int steps = 0;

        StringBuilder sBuilder = new StringBuilder();
        String sRootName = "";

        try {

            //cExercise.length();
            document = builder.build(new ByteArrayInputStream(xml.getBytes()));
            Element root = document.getRootElement();
            sRootName = root.getName();
            sBuilder.append("<" + sRootName + " guid = \"" + root.getAttributeValue("guid") + "\" >");
            @SuppressWarnings("rawtypes")
            List rows = root.getChildren(cExercise);
            count = rows.size();
            for (int i = 0; i < count; i++) {
                Element row = (Element) rows.get(i);
                exerciseId = Integer.parseInt(row.getAttributeValue("idExp"));
                steps = Integer.parseInt(row.getAttributeValue("stepExp"));
            }

            String[] params = {"p_idExercise", "p_step"};
            Object[] obj = {exerciseId, steps};
            String procedure = "{ call getStepItem(?,?) }";
            String sStepXml = "";

            StepsDAO execises = new StepsDAO();
            List<Steps> list = execises.getItem(procedure, params, obj);
            int listCount = list.size();

            String[] param = {"p_idExercise"};
            Object[] obj1 = {exerciseId};
            String procedures = "{ call getItembyIdexercise(?) }";
            List<Steps> lSteps = execises.getItem(procedures, param, obj1);
            for (int i = 0; i < listCount; i++) {
                Steps item = (Steps) list.get(i);
                if (steps == lSteps.size() - 1) {
                    item.Setfinish(Steps.c_finish);
                } else {
                    item.Setfinish("");
                }
                sStepXml = item.formXML();
            }
            if (sStepXml == "") {
                Steps _item = new Steps();
                sStepXml = _item.formXML();
            }
            sBuilder.append(sStepXml);
            rows = root.getChildren(cSegmentList);
            count = rows.size();
            for (int i = 0; i < count; i++) {
                Element row = (Element) rows.get(i);
                sBuilder.append("\r\t<" + cSegmentList + " guid=\"" 
                + row.getAttributeValue("guid") + "\" >");
                List children = row.getChildren();
                for (int j = 0; j < children.size(); j++) {
                    Element child = (Element) children.get(j);
                    //Segment
                    if (child.getName().equals(sSegment)) {
                        sBuilder.append("\r\t\t<" + sSegment + " " + csymbol + "=\"");
                        sBuilder.append(child.getAttributeValue(csymbol) + "\"  " + cmin + "=\"");
                        sBuilder.append(child.getAttributeValue(cmin) + "\"  " + cmax + "=\"");
                        sBuilder.append(child.getAttributeValue(cmax) + "\"  " + cid + "=\"");
                        sBuilder.append(child.getAttributeValue(cid) + "\" ");
                        sBuilder.append("/>");
                    } else {
                        sBuilder.append("\r\t\t<" + cMaxima + " " + cvariable + "=\"");
                        sBuilder.append(child.getAttributeValue(cvariable) + "\" >");
                        sBuilder.append(child.getText());
                        sBuilder.append("</" + cMaxima + ">");
                    }
                }
                sBuilder.append("\r\t</" + cSegmentList + ">\r");
            }

        } catch (JDOMException exception) {
            exception.printStackTrace();
        } catch (IOException exception) {
            exception.printStackTrace();
        }
        sBuilder.append("\r</" + sRootName + ">");
        return sBuilder.toString();
    }
}
