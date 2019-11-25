/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package com.coax.activemath;

import com.coax.common.Cli.Utils;
import org.jdom.Namespace;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.activemath.config.Manager;
import org.activemath.webapp.user.User;
import org.activemath.webapp.user.UserManager;
import org.activemath.webapp.user.UserManagerException;

/**
 *
 * @author phuctq
 */
public class NewMain {

    protected static final Namespace openmathNamespace = Namespace.getNamespace("om", "http://www.openmath.org/OpenMath");
    static String m_exerciseId1 = "mbase://Exercises_Pool/theory_fertigkeiten_differentiale/exercise_fertigkeiten_differentialrechnung_1a";
    static String m_InitActiveMathHome1 = "C:\\Users\\phuctq\\Documents\\NetBeansProjects\\ActiveMathTess\\";
    /**
     * @param args the command line arguments
     */
    protected static final Namespace dublinCoreNamespace = Namespace.getNamespace("dc", "http://purl.org/DC");
    protected static final Namespace omdocNamespace = Namespace.getNamespace("omd", "http://www.mathweb.org/omdoc");

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        // TODO code application logic here
        /*
         * m_exerciseId =
         * "mbase://wooinvi-demotest/my_first_theory/exercise_wooinvi1335020600936";
         * File active = new File(m_InitActiveMathHome);
         * Manager.setActiveMathHome(active); // Manager.init(); User user = new
         * User("hpham"); try { UserManager userManager =
         * UserManager.getInstance(); user = userManager.login("hpham"); } catch
         * (UserManagerException ex) {
         * //Logger.getLogger(ActiveMathTess.class.getName()).log(Level.SEVERE,
         * null, ex); } TessActiveMath(user,"",0);//khi loa bai tap lan dau tien
         * thi latex de gia tri "" TessActiveMath(user,"3*x = 9",0);//buoc giai
         * dau tien
         */
         test();
    }

    public static void test() {
        
        String m_exerciseId = "mbase://hpham/my_first_theory/exercise_Do Phu Duc1330931518932";
        m_exerciseId = "mbase://wooinvi-demotest/my_first_theory/exercise_wooinvi1335020600936";
        Utils.InitActiveMath();
        User user = new User("wooinvi");//
        /*
          try {
              UserManager userManager = UserManager.getInstance(); user =
               userManager.login("wooinvi"); 
              System.out.println("user name " + user.getFullName());
          } 
          catch (UserManagerException ex) {          
          }
         */
        TessActiveMath(user,"","",0);//khi loa bai tap lan dau tien thi latex de gia tri ""
        TessActiveMath(user, "3*x = 9","", 0);//buoc giai dau tien
        TessActiveMath(user, "x = 91","", 1);
        TessActiveMath(user, "x = 9","" ,2);
        //TessActiveMath(user, "x = 9","" ,3);
        //TessActiveMath(user, "x = 3","" ,4);
        //TessActiveMath(user, "x = 3","" ,5);
       //TessActiveMath(user, "x = 3","" ,6);
       //TessActiveMath(user, " 3*x = 9", 1);// 3*x = 9
    }
    private static String sAnswer = "";
    private static void TessActiveMath(User user, String latex,String m_exerciseId ,  int userInputPostion) {
        m_exerciseId = "mbase://wooinvi-demo-Book/my_first_theory/exercise_wooinvi1335020600936";
        m_exerciseId = "mbase://wooinvi-demotest/my_first_theory/exercise_wooinvi1335020600936";
        CoaxActiveMath coaxAc = new CoaxActiveMath();
        coaxAc.setExerciseId(m_exerciseId);
        coaxAc.setUserInput(latex);//sAnswer =
        coaxAc.setAnswerPrev(sAnswer);
        coaxAc.setUserInputPostion(userInputPostion);
        String xml = coaxAc.action(user, "OpenMath");
        sAnswer = coaxAc.getAnswerPrev();
        System.out.println(" xml " + xml);
        Utils.WriteLog("TessActiveMath(User user, String latex,String m_exerciseId ,  int userInputPostion)", xml);
    }
}
