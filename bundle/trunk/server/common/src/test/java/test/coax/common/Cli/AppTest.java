package test.coax.common.Cli;

import com.coax.common.Cli.Cmd;
import com.coax.common.Cli.Latex2Maxima;
import com.coax.common.Cli.MultiAlign;
import com.coax.common.Cli.Utils;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Unit test for simple App.
 */
public class AppTest extends TestCase {
	/**
	 * Create the test case
	 * 
	 * @param testName
	 *            name of the test case
	 */
	public AppTest(String testName) {
		super(testName);
	}

	/**
	 * @return the suite of tests being tested
	 */
	public static Test suite() {
		return new TestSuite(AppTest.class);
	}

	/**
	 * Rigourous Test :-)
	 */
	public void testApp() {
		/*
		 * MultiAlign ma = new MultiAlign(); ma.Execute("", "192.168.1.126");
		 * String xml = ma.getXmlToClient(); assertEquals("aaaa", "<a></a>",
		 * xml);
		 */
		System.out.println(Cmd.GetDateTime());
		String path = "var/usr/share/    ";
		String path2 = "tex.txt";
		String cmd =  Utils.Combine(path, path2);
		System.out.println(cmd);
		path = "var/usr/share/";
		path2 = "/:t<>e|x.txt";
		cmd = Utils.Combine(path, path2);
		System.out.println(cmd);
		path = "var/usr/share";
		path2 = "/:t<>e|x.txt";
		cmd = Utils.Combine(path, path2);
		System.out.println(cmd);
		System.out.println(cmd);
		path = "var/usr/share";
		path2 = "/:t<>e|x.txt";
		cmd =  Utils.Combine(path, path2);
		System.out.println(cmd);
               String openmath = Utils.Latex2OpenMath("$2xy$");
               System.out.println(openmath);
               
               openmath = Utils.Latex2OpenMath("2xy$");
               System.out.println(openmath);
               
                       openmath = Utils.Latex2OpenMath("2xy");
               System.out.println(openmath);
                  openmath = Utils.Latex2OpenMath("");
               System.out.println(openmath);
               
               openmath = Utils.Latex2OpenMath("");
               System.out.println(openmath);
        
	}
}
