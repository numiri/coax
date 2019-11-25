package com.coax.common.Cli;

import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;



import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

public class RecognizerXml {

    // static String data =
    // "<SegmentList><Segment type=\"pen_stroke\" instanceID=\"0\" scale=\"1,1\" translation=\"8,-46\" points=\"280,140|289,138|434,0|21,151|0,150|0,148|0,145|2,140|3,139|12,139|17,139|32,139|42,139|51,139|58,139|74,140| 85,144|96,147|112,153|124,164|126,166|140,175| 147,179|152,182|156,185|179,208|186,212|192,214|198,214|198,213|198,210| 197,201|194,197|194,196|193,195|192,195|191,195|190,195|190,194\"/></SegmentList>";
    static String GetAttrPoints(String xml) {
        return GetValueByAtt(xml, "Segment", "points", "-");
    }

    static String GetAttrInstanceID(String xml) {
        String sPoint = GetValueByAtt(xml, "Segment", "instanceID", ",");
        return sPoint;
    }

    /**
     * trả về kết quả nhận dạng cit.
     *
     * @param inputParam chuỗi xml từ client gửi lên.
     * @param fence true nếu là kí tự thuộc fence, ngược lại false.
     * @return kí tự đã được nhận dang.
     */
    public String BuildXml(String inputParam, boolean fence) {
        // inputParam = data;
        System.out.println(inputParam);
        String cmd = CommandLine(inputParam, fence);
        cmd = cmd.substring(0, cmd.indexOf(','));
        String resultTag = "<RecognitionResults instanceIDs=\""
                + GetAttrInstanceID(inputParam) + "\">" + "<Result symbol=\""
                + cmd + "\" certainty =\"\"/></RecognitionResults>";
        System.out.println(resultTag);
        Utils.WriteLog("BuildXml", resultTag);
        return resultTag;
    }

    static String CommandLine(String inputParam, boolean fence) {
        String rst = "";
        Utils.WriteLog("CommandLine", inputParam);
        String dataPoints = GetAttrPoints(inputParam);
        rst = Cmd.Recognizer(dataPoints, fence);
        return rst;

    }

    static String GetValueByAtt(String xml, String elementName,
            String attrName, String separ) {
        SAXBuilder builder = new SAXBuilder();
        String rst = "";
        if ("".equals(separ)) {
            separ = " ";
        }
        Document document;
        try {
            document = builder.build(new ByteArrayInputStream(xml.getBytes()));

            Element root = document.getRootElement();

            List rows = root.getChildren(elementName);

            for (int i = 0; i < rows.size(); i++) {
                Element row = (Element) rows.get(i);
                String sAtrr = row.getAttributeValue(attrName);
                if ("".equals(rst)) {
                    rst += sAtrr;
                } else {
                    rst += separ + sAtrr;
                }
            }

        } catch (JDOMException exception) {
            // TODO Auto-generated catch-block stub.
            exception.printStackTrace();
        } catch (IOException exception) {
            // TODO Auto-generated catch-block stub.
            exception.printStackTrace();
        }
        return rst;
    }
}
