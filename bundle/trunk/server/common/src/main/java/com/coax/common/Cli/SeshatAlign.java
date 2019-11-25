package com.coax.common.Cli;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

public class SeshatAlign {
   public static String run(String action, String fileinput, String fileoutput, String instanceIDs) {
      String latex = "";
      String errormsg = "";
      try {
         Runtime rt = Runtime.getRuntime();
         String cmd = "seshat -c /usr/local/seshat/Config/CONFIG -i "+fileinput+" -o "+fileinput;
         System.out.println(cmd);
         Process pr = rt.exec(cmd);
         BufferedReader stdIn = new BufferedReader(new InputStreamReader(pr.getInputStream()));
         BufferedReader stdError = new BufferedReader(new InputStreamReader(pr.getErrorStream()));
         String line=null;
         while((line=stdIn.readLine()) != null) {
            latex = line;
         }
         while ((line = stdError.readLine()) != null) {
            errormsg += line;
         }
         
         int exitVal = pr.waitFor();
         System.out.println("Exited with error code "+exitVal);
         
         File f = new File(fileinput);
         f.delete();
         f = new File(fileoutput);
         f.delete();

      } catch(Exception e) {
         errormsg = e.getMessage();
         e.printStackTrace();
     }
     String result = "";
     if("classifier".equals(action))
        result = "<RecognitionResults instanceIDs=\""+instanceIDs+"\"><Result symbol=\""+latex+"\" certainty=\"1\" /></RecognitionResults>";  
     else if("align".equals(action))
        result =  "<AlignResponse result=\"0\" error=\""+errormsg+"\"><exerciseStep message=\"\" istrue=\"true\" isfinish=\"false\"/><SegmentList TexString=\"$"+latex+"$\" /></AlignResponse>";
     return result;
  }
}
