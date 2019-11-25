package com.coax.common.Cli;

import java.io.IOException;
import java.util.LinkedList;

public class CidAlign extends MultiAlign {

   /**
    * 
    */
   private static final long serialVersionUID = 1L;

   public void Execute(String xml, String ipclient) {
      logname = ipclient;
      this.expressions = BuildDatFile(xml);

      LinkedList<String> pathLatexs = new LinkedList<String>();
      LinkedList<String> pathPngs = new LinkedList<String>();
      String variableMaxima = GetVariable(true);
      for (int i = 0; i < expressions.size(); i++) {
          Expression expression = expressions.get(i);
          expression.getMaxima().setVariable(variableMaxima);
          String content = expression.getContentDat();
          String guid = expression.getGuid();

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

          if (this.isApp() == false) {
              CreateDatFile(datfile, content);
              CreatebstFile(datfile, bstfile, texfile, dviFile, pngFile,
                      pngTransFile, expression.latexs);
          }

      }
      if (this.AutoAlign) {
          //g: refer to MultiAlign.Execute for this part. 
         //    unable to test for now
      } else {
          if (pathLatexs.size() > 0) {
              GetNewMaxima(pathLatexs);
          }
          try {
              this.setXmlToClient(BuildAlignResponse(false));
          } catch (IOException e) {
              e.printStackTrace();
          }
          try {
              this.finalize();
          } catch (Throwable exception) {
              WriteLog("E2-Execute", exception.getMessage());
              exception.printStackTrace();
          }
      } 
   }

}
