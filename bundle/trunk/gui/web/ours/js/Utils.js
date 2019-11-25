/// TUPLE
function Tuple(a,b,c,d,e,f,g,h)
{
	this.item1 = a;
	this.item2 = b;
	this.item3 = c;
	this.item4 = d;
	this.item5 = e;
	this.item6 = f;
	this.item7 = g;
	this.item8 = h;
}


/// RGB

function RGB(in_red, in_green, in_blue)
{
	this.red = in_red;
	this.green = in_green;
	this.blue = in_blue;
}

//Segment Split
function SegmentSplit(mins,maxs, setId, segment, status, flag, points, centerPoint,left,right,center) {
	this.mins = mins; //luu diem
	this.maxs = maxs; //luu diem
	this.points = points;
	this.set_id = setId;
	this.segment = segment; //luu segment
	this.status = status;
	this.flag = flag;
	this.centerPoint = centerPoint;
	this.left = left;
	this.right = right;
	this.center = center;
	this.childrenSplit = new Array();
	this.parentIds = -1;
}

// expects string in the format: #XXXXXX for hex color
RGB.parseRGB = function(in_hex_string)
{
	if(in_hex_string.length != 7)
	{
		return new RGB(255,0,255);
	}
	else
	{
		var red = parseInt(in_hex_string.substring(1, 3), 16);
		var green = parseInt(in_hex_string.substring(3, 5), 16);
		var blue = parseInt(in_hex_string.substring(5, 7), 16);

		if(isNaN(red) || isNaN(green) || isNaN(blue))
			return new RGB(255, 0, 255);
		return new RGB(red, green, blue);
	}
}

/// Vector2

// simple vector 2 objecct

var Vector2 = function(in_x, in_y){
	this.x = Math.round(in_x);
	this.y = Math.round(in_y);
};

Vector2.prototype = {

	Set : function(in_vector)
	{
		this.x = in_vector.x;
		this.y = in_vector.y;
	},

	magnitude : function()
	{
		return Math.sqrt(this.x * this.x + this.y*this.y);
	},

	normalize : function()
	{
		var mag = this.magnitude();
		this.x /= mag;
		this.y /= mag;
		return this;
	},

	toString : function()
	{
		return  this.x + "," + this.y;
	},

	transform : function(in_scale, in_translation)
	{
		return new Vector2(this.x * in_scale.x + in_translation.x, this.y * in_scale.y + in_translation.y);
	},

	clone  : function()
	{
		return new Vector2(this.x, this.y);
	},

	Add : function(a)
	{
		this.x += a.x;
		this.y += a.y;
	},

	Subtract : function(a)
	{
		this.x -= a.x;
		this.y -= a.y;
	},

	equals : function(a)
	{
		return this.x == a.x && this.y == a.y;
	},
};

Vector2.Dot = function(a, b)
{
	return a.x * b .x + a.y * b.y;
}

Vector2.Pointwise = function(a, b)
{
	return new Vector2(a.x * b.x, a.y * b.y);
}

Vector2.SquareDistance = function(a,b)
{
	var diff_x = a.x - b.x;
	var diff_y = a.y - b.y;
	return diff_x * diff_x + diff_y * diff_y;
}

Vector2.Distance = function(a,b)
{

	return Math.sqrt(Vector2.SquareDistance(a,b));
}

Vector2.Subtract = function(a, b)
{
	return new Vector2(a.x - b.x, a.y - b.y);
}

Vector2.Add = function(a, b)
{
	return new Vector2(a.x + b.x, a.y + b.y);
}

parseVector2 = function(in_string)
{
	var strings = in_string.split(',');
	var x = parseFloat(strings[0]);
	var y = parseFloat(strings[1]);
	return new Vector2(x,y);
}

Vector2.Multiply = function(f, v)
{
	return new Vector2(v.x * f, v.y * f);
}

Vector2.Equals = function(a,b)
{
	return a.x == b.x && a.y == b.y;
}

/// StringBuilder

 // Initializes a new instance of the StringBuilder class

// and appends the given value if supplied

var StringBuilder = function(value)
{
    this.strings = new Array("");
    this.append(value);
};

// Appends the given value to the end of this instance.
StringBuilder.prototype = {

	append : function (value)
	{
	    this.strings.push(value);
		return this;
	},

	appendLine : function()
	{
		this.strings.push("\n");
		return this;
	},

// Clears the string buffer



	clear : function ()
	{
	    this.strings.length = 1;
	},

// Converts this instance to a String.

	toString : function ()
	{
	    return this.strings.join("");
	},
};


/// Array

Array.prototype.contains = function(value)
{
	for(var k = 0; k < this.length; k++)
		if(value == this[k])
			return true;
	return false;
}

Array.prototype.searchIndex = function(value)
{
	for(var k = 0; k < this.length; k++)
		if(value == this[k])
			return k;
	return -1;
}

Array.prototype.clone = function()
{
	var result = new Array();
	for(var k = 0; k < this.length; k++)
	{
		result.push(this[k]);
	}
	return result;
}

/// Math class extentions

Math.sign = function(f)
{
	if(f > 0)
		return 1;
	if(f < 0)
		return -1;
	return 0;
}

function sendLogToServer(exerid, action, content) {
        try {
                var datalog = {
                        "exerid" : exerid,
                        "action" : action,
                        "error" : content
                };
                $.ajax({
                        url : Editor.log,
                        type : "POST",
                        data : datalog
                });
        } catch(e) {

        }
}

/** Helper method to find aboslute location of our parent div **/
function findPosition(in_obj)
{
	var left = 0;
	var top = 0;
	if(in_obj.offsetParent)
	{
		do
		{
			left += in_obj.offsetLeft;
			top += in_obj.offsetTop;
		}
		while(in_obj = in_obj.offsetParent);
	}

	return [left, top];
}

/*****************************************************************************
* get_cookie():     retrieve cookie value
*
* this function is duplicated in Login.js.  This file is the proper place for
* this sort of function, not Login.js.
*****************************************************************************/
function get_cookie(cookie_name)                                               {
var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
if (results) return (unescape(results[2]));
else         return null;                                                       }

function detect_iphone()
{
	if((navigator.userAgent.match(/iPhone/i))) {
		 return true;
	}
	return false;
}


 function islandscape(){
 	if(window.innerHeight > window.innerWidth){
   		return true;
	}
	return false;
  }

/*******
*
*********/

//Find min x in a stroke
Array.minX = function(array){
	var min = array[0].x;
	var len = array.length;
	for (var i = 1; i < len; i++)
		if (array[i].x < min)
			min = array[i].x;

	return min;
}

//Find min y in a stroke
Array.minY = function(array){
	var min = array[0].y;
	var len = array.length;
	for (var i = 1; i < len; i++)
		if (array[i].y < min)
			min = array[i].y;

	return min;
}

//Find max x in a stroke
Array.maxX = function(array){
	var max = array[0].x;
	var len = array.length;
	for (var i = 1; i < len; i++)
		if (array[i].x > max)
			max = array[i].x;

	return max;
}

//Find max y in a stroke
Array.maxY = function(array){
	var max = array[0].y;
	var len = array.length;
	for (var i = 1; i < len; i++)
		if (array[i].y > max)
			max = array[i].y;

	return max;
}

//Cut C1 in half, generating subcurves S1 and S2
Array.snip = function(array){
	var half_length = Math.ceil(array.length / 2);
	var s1 = array.splice(0, half_length);
	var p2 = {x: s1[half_length-1].x, y: s1[half_length-1].y};
	var s2 = array.splice(0);
	//Add last point of s3 to the first in s4
	s2.unshift(p2);

	return {sub1: s1, sub2: s2};
}

function crosses(strokeP1, strokeP2){
    var half_length = 0;
    var stroke1 = strokeP1.slice(0);
    var stroke2 = strokeP2.slice(0);

    if (stroke1.length == 0 || stroke2.length == 0) return false;

    if ((stroke1.length == 2) && (stroke2.length == 2)){ // 2 doan thang cat nhau
       // xet 2 diem doan 2 co nam cung phia voi doan 1
       var a1 = stroke1[0].x;
       var b1 = stroke1[0].y;
       var a2 = stroke1[1].x;
       var b2 = stroke1[1].y;

       var c1 = stroke2[0].x;
       var d1 = stroke2[0].y;
       var c2 = stroke2[1].x;
       var d2 = stroke2[1].y;

       if((a1 == c1 && b1 == d1) || (a2 == c1 && b2 == d1) || (a1 == c2 && b1 == d2) || (a2 == c2 && b2 == d2)){
          return true;
       }

       // linear equations 1: (a2 - a1)(y - b1) - (b2 - b1)(x - a1) = 0
       var temp1 = (a2 - a1)*(d1 - b1) - (b2 - b1)*(c1 - a1);
       if (temp1 == 0){ // the first point is located line 1
          if (((c1 >= a1) && (c1 <= a2)) || ((c1 <= a1) && (c1 >= a2)))      {
             return true;                                                    }}

       var temp2 = (a2 - a1)*(d2 - b1) - (b2 - b1)*(c2 - a1);
       if (temp2 == 0){ // the second point is located line 1
          if (((c2 >= a1) && (c2 <= a2)) || ((c2 <= a1) && (c2 >= a2))){
             return true;
          }

       }

       if((temp1 * temp2) < 0){
          // linear equations 2: (c2 - c1)(y - d1) - (d2 - d1)(x - c1) = 0
          temp1 = (c2 - c1)*(b1 - d1) - (d2 - d1)*(a1 - c1);
          if(temp1 == 0){ // the first point is located line 2
             if (((a1 <= c1) && (a1 >= c2)) || ((a1 >= c1) && (a1<= c2))){
                return true;
             }
          }

          temp2 = (c2 - c1)*(b2 - d1) - (d2 - d1)*(a2 - c1);
          if(temp2 == 0){ // the second point is located line 2
             if (((a2 <= c1) && (a2 >= c2)) || ((a2 >= c1) && (a2<= c2))){
                return true;
             }
          }

          return ((temp1 * temp2) < 0);
       }
       else{
          return false;
       }
    }
    else{

       var stroke1minX = Array.minX(stroke1);
       var stroke1minY = Array.minY(stroke1);
       var stroke1maxX = Array.maxX(stroke1);
       var stroke1maxY = Array.maxY(stroke1);

       var stroke2minX = Array.minX(stroke2);
       var stroke2minY = Array.minY(stroke2);
       var stroke2maxX = Array.maxX(stroke2);
       var stroke2maxY = Array.maxY(stroke2);

       // Do bound of 2 stroke cross (two square)
       if((stroke1maxX < stroke2maxX) && (stroke1maxX < stroke2minX))
          return false;

       if((stroke1maxX > stroke2maxX) && (stroke2maxX < stroke1minX))
          return false;

       if ((stroke1maxY < stroke2maxY) && (stroke1maxY < stroke2minY))
          return false;

       if ((stroke1maxY > stroke2maxY) && (stroke2maxY < stroke1minY))
          return false;

       if ((stroke1.length == 2) && (stroke2.length > 2)) { // Cat stroke2 in half, keep stroke1
         var cut1 = Array.snip(stroke2);
         var s3 = cut1.sub1;
         var s4 = cut1.sub2;

          return (crosses(stroke1, s3) || crosses(stroke1, s4));
       }
       else if ((stroke1.length > 2) && (stroke2.length == 2)) { // Cat stroke1 in half, keep stroke2
         var cut2 = Array.snip(stroke1);
         var s1 = cut2.sub1;
         var s2 = cut2.sub2;

          return (crosses(s1, stroke2) || crosses(s2, stroke2));
       }
       else if ((stroke1.length > 2) && (stroke2.length > 2)) { // stroke2 and stroke2 are bigger than two points
         var cut3 = Array.snip(stroke1);
         var s1 = cut3.sub1;
         var s2 = cut3.sub2;

         var cut4 = Array.snip(stroke2);
         var s3 = cut4.sub1;
         var s4 = cut4.sub2;

          return (crosses(s1, s3) || crosses(s1, s4) || crosses(s2, s3) || crosses(s2, s4));
       }
       else {return false;}
  }
}

ask4text = function(callbackfn, dlgTitle, msgReq, min, max)                   {
var dialogId = "modalDialogAsk4Text";

if(min == undefined || min == null) min = 1;
if(max == undefined || max == null) max = 50;

if(dlgTitle == undefined || dlgTitle == null)
   dlgTitle = "Enter something to the text field";

if(msgReq == undefined || msgReq == null)
   msgReq = "Text length must be between "+min+" and "+max+".";

while ($("#"+dialogId).length > 0) $("#"+dialogId).remove();

var div = "<div id='"+dialogId+"' title='"+dlgTitle+"' style='display:none;'>"
+ "<p id='tips' style='border:1px solid transparent;padding:0.3em;font-size:10pt;'>"+msgReq+"</p>"
+ "<link rel='stylesheet' type='text/css' href='" + Editor.ourscss + "jqueryui-borrowed.css'>"
+ "<input id='targetsymbol' type='text' value='' style='background-color:#f1f1f1;color:black;'/>"
+ "</div>"
$("body").append(div);

var dialog = $('#'+dialogId).dialog({
   autoOpen: false, width: 400, modal: true,
   buttons: {
      'Save': function() {
         var textinput = $( this ).find("#targetsymbol");
         if ( textinput.val().length > max
         ||   textinput.val().length < min ) {
            textinput.addClass( "ui-state-error" );

            $(this).find("#tips").addClass("ui-state-highlight");
            setTimeout(function() {
               dialog.find("#tips").removeClass( "ui-state-highlight");
            }, 2500 );
         } else {
            if(callbackfn != undefined)
               eval(callbackfn+"(\""+$(this).find("#targetsymbol").val()+"\")");
            $(this).dialog("close");
         }
      },
      Cancel: function() {
         $(this).dialog("close");
      }
   },
   open: function(event, ui){ $(this).find("#targetsymbol").focus();},
   close: function() {
      $(this).find("#targetsymbol").val("").removeClass("ui-state-error");
      $("#"+dialogId).remove();
   }
 });
 dialog.dialog('open');
}

/**************
* intent: used for stroke calculations
**************/

function Stroke() { }

/**************
* intent: determine if a bounding box is flat enough to be a "dash" symbol
*         used in mathpix "smash" rex because seshat is horrible with "dash"
* input : "1,1 5,4 ..."
* output: boolean
*a need max() and min() in case top # or bottom number is 0 or infinity
**************/

Stroke.isFlat = function( stroke )                                            {
   lec    = Stroke.diagonalPoint( "min", stroke );
   ric    = Stroke.diagonalPoint( "max", stroke );
   slope  = Math.min( 1000000             , ( ric.y - lec.y ) )  //a
   /        Math.min( 1000000, Math.max( 1, ( ric.x - lec.x ) ) );
   output = ( slope < Editor.flat_slope ) ? true : false;
return        output;                                                         }

/**************
* intent: get a bbox's diagonal end points
* input : direction = "min" or "max" specifying which point on the diagonal
*         ticks = string of points, eg.  "3,2 3,4 1,6".  requires trimmed string.
* output: for input of "3,2 3,4 1,6"
*         "min" returns { x:1, y:2 }.  "max" returns { x:3, y:6 }
* usage : x = "3,2 3,4 1,6";  diagonalPoint( "max", x );
*a forcing numerical sort.  alphabetic is default
**************/

Stroke.diagonalPoint = function( direction, ticks )                           {
   var aoo_points = {}, far_index = -1, xx = [], yy = [], far = {};
   aoo_points = pointstring2json( ticks.trim() );
   far_index = ( direction == "min" ) ? 0 : aoo_points.length - 1;
   xx    = aoo_points.map( function(point) { return point.x; });  // xx = all x-coordinates
   yy    = aoo_points.map( function(point) { return point.y; });
   far.x = xx.sort(        function(a, b)  { return a-b })[far_index]; //a
   far.y = yy.sort(        function(a, b)  { return a-b })[far_index];
return far;                                                                   }

/**************
* input : "3,2 3,4 1,6"
* output: [ {x:3, y:2}, {...}, {...} ]
**************/

function pointstring2json( pointstring )                                      {
var far = {x:-1,y:-1}, xx, yy, far_index, aos_points, aoo_points, xy;
aos_points = pointstring.trim().split(/\s+/);  // aos = array-of-strings, aoo = array-of-objects
aoo_points = aos_points.map( function(point)                                  {
   var p = { x: -1, y: -1 }; xy = point.split(",");
   p.x = xy[0]; p.y = xy[1];  return p;                                       });
return aoo_points;                                                            }

