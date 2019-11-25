package com.coax.common.Cli;

import java.io.IOException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import uk.ac.ed.ph.snuggletex.DOMOutputOptions;
import uk.ac.ed.ph.snuggletex.SnuggleEngine;
import uk.ac.ed.ph.snuggletex.SnuggleInput;
import uk.ac.ed.ph.snuggletex.SnuggleSession;
import uk.ac.ed.ph.snuggletex.XMLStringOutputOptions;
import uk.ac.ed.ph.snuggletex.definitions.W3CConstants;
import uk.ac.ed.ph.snuggletex.internal.DOMBuildingController;
import uk.ac.ed.ph.snuggletex.internal.LaTeXTokeniser;
import uk.ac.ed.ph.snuggletex.internal.SnuggleInputReader;
import uk.ac.ed.ph.snuggletex.internal.TokenFixer;
import uk.ac.ed.ph.snuggletex.internal.util.DumpMode;
import uk.ac.ed.ph.snuggletex.internal.util.ObjectDumper;
import uk.ac.ed.ph.snuggletex.internal.util.XMLUtilities;
import uk.ac.ed.ph.snuggletex.tokens.ArgumentContainerToken;
import uk.ac.ed.ph.snuggletex.upconversion.MathMLUpConverter;
import uk.ac.ed.ph.snuggletex.upconversion.UpConversionOptionDefinitions;
import uk.ac.ed.ph.snuggletex.upconversion.UpConversionOptions;
import uk.ac.ed.ph.snuggletex.upconversion.UpConvertingPostProcessor;
import uk.ac.ed.ph.snuggletex.upconversion.internal.UpConversionPackageDefinitions;
import uk.ac.ed.ph.snuggletex.utilities.MathMLUtilities;

public class Latex2Maxima {

    private static String rawDump = null;
    @SuppressWarnings("unused")
    private static String fixedDump = null;

@SuppressWarnings("javadoc")
public static String ToMaxima(String inputlatex) throws Throwable {
        String maximaAnnotation = null;
        Element mathmlElement = null;
        Utils.WriteLog("ToMaxima", "input :" + inputlatex);
	inputlatex = inputlatex.replaceAll("\\\\left\\[","").replaceAll("\\\\right\\]","");
        inputlatex = inputlatex.replaceAll("\\["    ,"").replaceAll("\\]","");
        UpConversionOptions upConversionOptions = new UpConversionOptions();
        upConversionOptions.setSpecifiedOption(
                UpConversionOptionDefinitions.DO_CONTENT_MATHML_NAME, "true");
        upConversionOptions.setSpecifiedOption(
                UpConversionOptionDefinitions.DO_MAXIMA_NAME, "true");
        UpConvertingPostProcessor upconverter = new UpConvertingPostProcessor(
                upConversionOptions);

        Document resultDocument = null;

        resultDocument = runSnuggleProcessSuccessfully(inputlatex,
                upconverter);

        mathmlElement = Latex2Maxima.extractMathElement(resultDocument);
        maximaAnnotation = MathMLUtilities.extractAnnotationString(
                mathmlElement, MathMLUpConverter.MAXIMA_ANNOTATION_NAME);
        Utils.WriteLog("ToMaxima", "output: " + maximaAnnotation);
        //g fixed bug 216
        System.out.println(" ToMaxima inputlatex:" + inputlatex + " - output:" +maximaAnnotation);
        //maximaAnnotation = "((((c * o * s) * (x + 2)) / (2 * (l * n) * 2)) - (((t * a * n) * 3) / (2 * a)) - ((s * i * n) * x))";
        
        if(maximaAnnotation != null){
           maximaAnnotation = maximaAnnotation.replaceAll("\\(s \\* i \\* n\\) \\* ", "sin");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(c \\* o \\* s\\) \\* ", "cos");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(t \\* a \\* n\\) \\* ", "tan");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(s \\* e \\* c\\) \\* ", "sec");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(c \\* s \\* c\\) \\* ", "csc");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(c \\* o \\* t\\) \\* ", "cot");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(s \\* i \\* n \\* h\\) \\* ", "sinh");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(c \\* o \\* s \\* h\\) \\* ", "cosh");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(t \\* a \\* n \\* h\\) \\* ", "tanh");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(s \\* e \\* c \\* h\\) \\* ", "sech");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(c \\* s \\* c \\* h\\) \\* ", "csch");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(c \\* o \\* t \\* h\\) \\* ", "coth");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(l \\* o \\* g\\) \\* ", "log");
           maximaAnnotation = maximaAnnotation.replaceAll("\\(l \\* n\\) \\* ", "ln");
           
           String[] funcs = {"sin", "cos", "tan", "sec", "csc", "cot", "sinh", "cosh", "tanh", "sech", "csch", "coth", "log", "ln"}; 
           for (String func : funcs) {
              int fromIndex = 0;
              int index = -1;
              while((index = maximaAnnotation.indexOf(func, fromIndex)) != -1){
                 fromIndex = index + func.length();
                 boolean inserted = false;
                 if(maximaAnnotation.charAt(fromIndex)!='('){
                    inserted = true;
                    maximaAnnotation = maximaAnnotation.substring(0, fromIndex) + "(" 
                          + maximaAnnotation.substring(fromIndex, maximaAnnotation.length());
                    fromIndex += 1;
                    
                    index = maximaAnnotation.indexOf(")", fromIndex);
                    if(index != -1) {
                       maximaAnnotation = maximaAnnotation.substring(0, index) + ")" 
                             + maximaAnnotation.substring(index, maximaAnnotation.length());
                       fromIndex = index + 1;
                    }
                    else if(index == -1 && inserted){
                       maximaAnnotation += ")";
                       fromIndex = index + 1;
                    }
                 }
              }
           }
           System.out.println(" After convert:" +maximaAnnotation);
        }
        //-----------
        return maximaAnnotation;
}

    private static Element extractMathElement(Document document) {

        Node rootElement = document.getChildNodes().item(0);

        Element firstMathElement = null;
        NodeList childNodes = rootElement.getChildNodes();
        for (int i = 0, length = childNodes.getLength(); i < length; i++) {
            Node childNode = childNodes.item(i);
            if (MathMLUtilities.isMathMLElement(childNode, "math")) {
                if (firstMathElement != null) {
                    // logger.info(cv.TimeForLog()
                    // + "Found more than one <math/> children");
                }
                firstMathElement = (Element) childNode;
            } else if (childNode.getNodeType() == Node.ELEMENT_NODE) {
                // logger.info(cv.TimeForLog()
                // + "Found unexpected element under root");
            } else if (childNode.getNodeType() == Node.TEXT_NODE
                    && childNode.getNodeValue().matches("\\S")) {
                // logger.info(cv.TimeForLog() +
                // "Found non-whitespace text Node");
            }
        }
        if (firstMathElement == null) {
            // logger.info(cv.TimeForLog() + "No <math/> child found");
        }
        document.removeChild(rootElement);
        document.appendChild(firstMathElement);

        return firstMathElement;

    }

    private static SnuggleSession createSnuggleSession() {
        return new SnuggleEngine().createSession();
    }

    private static Document runSnuggleProcessSuccessfully(String inputLaTeX,
            UpConvertingPostProcessor upconverter) throws Throwable {
        SnuggleSession session = null;

        session = createSnuggleSession();
        SnuggleInputReader inputReader = new SnuggleInputReader(session,
                new SnuggleInput(inputLaTeX));

        LaTeXTokeniser tokeniser = new LaTeXTokeniser(session);
        ArgumentContainerToken outerToken = tokeniser.tokenise(inputReader);
        rawDump = ObjectDumper.dumpObject(outerToken, DumpMode.DEEP);
        TokenFixer fixer = new TokenFixer(session);
        fixer.fixTokenTree(outerToken);
        fixedDump = ObjectDumper.dumpObject(outerToken, DumpMode.DEEP);
        Document resultDocument = XMLUtilities.createNSAwareDocumentBuilder().newDocument();
        Element rootElement = resultDocument.createElementNS(
                W3CConstants.XHTML_NAMESPACE, "body");
        resultDocument.appendChild(rootElement);

        DOMOutputOptions domOptions = Latex2Maxima.createDOMOutputOptions(upconverter);
        DOMBuildingController domBuildingController = new DOMBuildingController(
                session, domOptions);
        domBuildingController.buildDOMSubtree(rootElement,
                outerToken.getContents());
        return resultDocument;
    }

    private static DOMOutputOptions createDOMOutputOptions(
            UpConvertingPostProcessor upconverter) {
        DOMOutputOptions result = new DOMOutputOptions();
        result.setMathVariantMapping(true);
        result.setPrefixingSnuggleXML(true);
        result.setDOMPostProcessors(upconverter);
        return result;
    }
}
