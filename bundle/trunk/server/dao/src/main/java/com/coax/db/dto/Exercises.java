package com.coax.db.dto;
import java.sql.Date;
/**
 * @author phuctq
 *Lớp chứa thông tin của bài tập được tạo thủ công by Phúc.
 */
public class Exercises {
	
// this constructor initializes all attributes except id & created_on
public Exercises ( String c_id, String c_userid, String c_content
   ,  String c_formula, String c_stroke, String c_variable, String c_amid)    {
   if ( c_id != null )        id = Long.parseLong( c_id );
   if ( c_userid != null )    userid = Long.parseLong( c_userid );
   if ( c_content != null )   content = c_content;
   if ( c_formula != null )   formula = c_formula;
   if ( c_stroke != null )    stroke = c_stroke;
   if ( c_variable != null )  variable = c_variable;
   if ( c_amid != null )      amid = c_amid;                                  }

public Exercises ( String c_id, String c_userid, String c_content
   ,  String c_formula, String c_stroke, String c_variable, String c_amid
   ,  String c_frienlyid,  boolean c_skip_corx )                       {
   if ( c_id != null )        id = Long.parseLong( c_id );
   if ( c_userid != null )    userid = Long.parseLong( c_userid );
   if ( c_content != null )   content = c_content;
   if ( c_formula != null )   formula = c_formula;
   if ( c_stroke != null )    stroke = c_stroke;
   if ( c_variable != null )  variable = c_variable;
   if ( c_amid != null )      amid = c_amid;
   if ( c_frienlyid != null)  friendlyId = c_frienlyid;
                              skip_corx = c_skip_corx;                        }
// import java.text.SimpleDateFormat;
// if ( c_created_on != null ) created_on = new SimpleDateFormat( "MMMM d,  yyyy"
// ,  Locale.ENGLISH).parse(c_created_on);                                       }

public Exercises(){	}
public final static String c_id = "id";
public final static String c_userid = "userid";
public final static String c_content = "content";
public final static String c_formula = "formula";
public final static String c_created_on = "created_on";
public final static String c_stroke = "stroke";
public final static String c_variable = "variable";
public final static String c_amid = "amid";
public final static String c_xiznum = "xiznum";
public final static String c_frienlyid = "friendly_id";
public final static String c_skip_corx = "skip_corx";
private long id =1;//variable
private long userid = -1;//variable
private String content = "";
private String formula = "";
private Date created_on = null;
private String stroke = "";
private String variable = "";
private String amid = "";
private String xiznum = "";
private String friendlyId = "";
private boolean skip_corx = false;
public void setAmid(String amid){           this.amid = amid;                 }
public String getAmid(){                    return this.amid;                 }
public void setUserid(long userid){         this.userid = userid;             }
public long getUserid(){                    return this.userid;               }
public void setStroke(String stroke){       this.stroke = stroke;             }
public String getStroke(){                  return this.stroke;               }
public void setId(long id){                 this.id = id;                     }
public void setContent(String content){     this.content = content;           }
public void setFormula(String formula){     this.formula = formula;           }
public void setCreated_on(Date created_on){ this.created_on = created_on;     }
public long getId(){                        return this.id;                   }
public String getContent(){                 return this.content;              }
public String getFormula(){                 return this.formula;              }
public Date getCreated_on(){                return this.created_on;           }
public void setVariable(String variable){   this.variable = variable;         }
public String getVariable(){                return this.variable;             }
public String getXiznum() {                 return xiznum;                    }
public void setXiznum(String xiznum) {      this.xiznum = xiznum;             }
public String getFriendlyId() {             return friendlyId;                }
public void setFriendlyId(String friendlyId){this.friendlyId = friendlyId;    }
public boolean getSkip_corx() {      return skip_corx;          }
public void setSkip_corx(boolean skip_corx)                     {
   this.skip_corx = skip_corx;                                  }

/**
 * @return :Tạo kiểu json trả về cho client xử lý
*/

public String jsonObject()                                                    {
StringBuilder sBuilder = new StringBuilder();
sBuilder.append("{ \""+ Exercises.c_id + "\":\"" + this.getId() +"\",");
sBuilder.append(" \""+ Exercises.c_userid + "\":\"" + this.getUserid() +"\",");
sBuilder.append(" \""+ Exercises.c_content + "\":\"" + this.content +"\",");
sBuilder.append(" \""+ Exercises.c_formula + "\":\"" + this.formula +"\",");
sBuilder.append(" \""+ Exercises.c_stroke + "\":\"" + this.stroke.replaceAll("\"","'") + "\",");
sBuilder.append(" \""+ Exercises.c_variable + "\":\"" + this.variable + "\",");
sBuilder.append(" \""+ Exercises.c_xiznum + "\":\"" + this.xiznum + "\",");
sBuilder.append(" \""+ Exercises.c_frienlyid + "\":\"" + this.friendlyId + "\",");
sBuilder.append(" \""+ Exercises.c_created_on + "\":\"" + this.created_on +"\",");
sBuilder.append(" \""+ Exercises.c_amid + "\":\"" + this.amid + "\",");
sBuilder.append(" \""+ Exercises.c_skip_corx + "\":\"" + this.skip_corx + "\"");
sBuilder.append("}");
return sBuilder.toString();                                                   }

    



/*****************************************************************************
* returns a json string of this 1 exercise:  { "id":"123", "userid":"234",...}
* params:  
*    columns - an array of the column names to include, or "all" for all columns
*
*a. delete the final comma
*b. create enum for switch-case on a String in pre-1.7 Java
*****************************************************************************/

public enum ExercisesCol { id, userid, content, formula, stroke, variable
,   created_on, amid, friendly_id, skip_corx } //b

public String jsonObject1( String[] columns )                                  {
StringBuilder sb = new StringBuilder();
String[] allcols = new String[10];
allcols[0] = "id";         allcols[1] = "userid"; allcols[2] = "content";
allcols[3] = "formula";    allcols[4] = "stroke"; allcols[5] = "variable";
allcols[6] = "created_on"; allcols[7] = "amid";   allcols[8] = "friendly_id";
allcols[9] = "skip_corx";
/* if ( columns[0].equals("all") ) 
   String[] allcols = new String[]{"id","userid","content","formula","stroke","variable"
   ,          "created_on","amid"}; */
String[] columnSet = columns[0].equals("all") ? allcols : columns;
sb.append( "{" );
for ( String column : columnSet ) {
   switch( ExercisesCol.valueOf(column) ) {
      case id:      sb.append(" \""+ c_id + "\":\"" + getId() +"\","); break;
      case userid:  sb.append(" \""+ c_userid + "\":\"" + getUserid() +"\","); break;
      case content: sb.append(" \""+ c_content + "\":\"" + content +"\","); break;
      case formula: sb.append(" \""+ c_formula + "\":\"" + formula +"\","); break;
      case stroke:  sb.append(" \""+ c_stroke + "\":\"" + stroke + "\",");  break;
//      +             stroke.replaceAll("\"","'") + "\",");  break;
      case variable: sb.append(" \""+ c_variable + "\":\"" + variable + "\",");  break;
      case created_on: sb.append(" \""+ c_created_on + "\":\"" + created_on +"\","); break;
      case amid: sb.append(" \""+ c_amid + "\":\"" + amid + "\",");  break;
      case friendly_id: sb.append(" \""+ c_frienlyid + "\":\"" + friendlyId + "\",");  break;
      case skip_corx: sb.append(" \""+ c_skip_corx + "\":\"" + skip_corx + "\"");  break;
      } }
sb.deleteCharAt( sb.length()-1 ); //a
sb.append("}");
return sb.toString();                                                         }

/******************************************************************************
* converts NULL to "" to properly display on <input>.  otherwise, if "null" is 
* displayed, it the string n-u-l-l will be retrieved by the form to insert into 
* db.  
******************************************************************************/
public void null2empty()                                                      {
if ( getVariable()   == null ) setVariable("");
if ( getContent()    == null ) setContent("");
if ( getFormula()    == null ) setFormula("");
if ( getFriendlyId() == null ) setFriendlyId("");
if ( getStroke()     == null ) setStroke("");                                 }
}
