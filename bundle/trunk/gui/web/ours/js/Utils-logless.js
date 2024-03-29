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
	this.x = in_x;
	this.y = in_y;
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