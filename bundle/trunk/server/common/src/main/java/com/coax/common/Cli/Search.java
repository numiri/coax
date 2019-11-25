package com.coax.common.Cli;
import java.io.IOException;

/**
 * tim kiếm nôi dung log của dracule.
 * @author cz
 *
 */
public class Search {
	
	/**
	 * tìm kiếm nội dung của log được ghi lại.
	 * @param guid chuỗi guid được sử dụng để tìm kiếm.
	 * @return kết quả tìm kiếm của log.
	 */
	public static String GetLogByGuid(String guid)
	{
		String []names = Utils.SearchFile();
		for (int i = 0; i < names.length; i++) {
			try {
				String logcontent = Utils.ReadFile(names[i]);
				int index = logcontent.indexOf("start"+guid);
				
				if(index >-1)
				{
					String rst = logcontent.substring(index);
					String end =guid+"end";
					int index2 = rst.indexOf(end);
					String	rstFinal = "";
					if(index2>-1)
					{
							rstFinal = rst.substring(0,index2 +end.length() );		
					}
					else
					{
						rstFinal = rst;	
					}
				
				rstFinal = rstFinal.replace("<","&lt;").replace(">", "&gt;");
				rstFinal = rstFinal.replace("\r", "<br>");
					return rstFinal;
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		return "khong tim thay guid nay";
		}
}
