var select_Frac = null;
var ps = "";
var save_equals = null;
var select_poistion = null;
var flag_equal = 0;
Fractions.Sqrts = new Array();//chua can bac 2
Fractions.gestures = new Array();//chua cac gesture "hinh tron,trai tim"
Fractions.Groups = new Array();
Fractions.Time = null;

function Fractions(id_group){
    this.id_group = id_group;
    this.numerator = new Array();
    this.denominator = new Array();    
}

Fractions.prototype = {
    Getnumerator : function() {
	var symbol = "";
	for (var k = 0; k < this.numerator.length; k++) {
	    symbol = symbol + "" + this.numerator[k].symbol;
	}
	return symbol.replace("frac", "/").replace("_dash", "-");
    },

    Getdenominator : function() {
	var symbol = "";
	for (var k = 0; k < this.denominator.length; k++) {
	    symbol = symbol + "" + this.denominator[k].symbol;
	}
	return symbol.replace("frac", "/").replace("_dash", "-");
    },

    removeNumerator : function(seg) {
	var index = Editor.FindIndexSegment(seg.set_id, this.numerator);
	if (index != -1) {
	    for (var j = index; j < this.numerator.length - 1; j++) {
		this.numerator[j] = this.numerator[j + 1];
	    }
	    this.numerator.pop();
	}
    },

    removeDenominator : function(seg) {
	var index = Editor.FindIndexSegment(seg.set_id, this.denominator);
	if (index != -1) {
	    for (var j = index; j < this.denominator.length - 1; j++) {
		this.denominator[j] = this.denominator[j + 1];
	    }
	    this.denominator.pop();
	}
    },
    
    minX : function(in_seg) {
	var min = 0;
	for (var k = 0; k < in_seg.length; k++) {
	    if (k == 0) min = in_seg[k].worldMaxPosition().x;
	    if (min > in_seg[k].worldMaxPosition().x) {
		min = in_seg[k].worldMaxPosition().x;
	    }
	}
	return min;
    },

    maxX : function(in_seg) {
	var max = 0;
	for (var k = 0; k < in_seg.length; k++) {

	    if (max < in_seg[k].worldMaxPosition().x) {
		max = in_seg[k].worldMaxPosition().x;
	    }
	}
	return min;
    },

    Setnumerator : function(numerator) {
	if (this.numerator.contains(numerator)) return;
	this.numerator.push(numerator);
    },

    Setdenominator : function(denominator) {
	if (this.denominator.contains(denominator)) return;
	this.denominator.push(denominator);
    },

    toString : function() {
	return this.Getnumerator() + "/" + this.Getdenominator();
    },
};

Fractions.Sort = function(insegments) {
    for (var i = 0; i < insegments.length; i++) {	
	for (var j = 0; j < insegments.length; j++) {
	    if (insegments[i].worldMaxPosition().y < insegments[j].worldMaxPosition().y) {
		var temp = insegments[i];
		insegments[i] = insegments[j];
		insegments[j] = temp;
	    }
	}
    }
    return insegments;
}

Fractions.isFrac = function(in_segments,i){
    for(var k =0;k<in_segments.length;k++){
	var seg = in_segments[0];
	if(seg.symbol == "frac"){
	    i = k;
	    return true;	
	}
    }
    return false;
}

Fractions.SetDash = function(in_segments){
    for(var k =0;k<in_segments.length;k++){
	var seg =in_segments[k];
	if(seg.symbol == "frac"){
	    seg.symbol == "_dash";
	}
    }
}

//ham phan tich ra phan so
Fractions.SetFrac = function(group) {
    var _dash = group._dashs;
    var segments = group.segments;
    for (var k = 0; k < _dash.length; k++) {
	_dash[k].status = false;
    }
    var flag = false;
    var tempSeg = null;
    for (var k = 0; k < _dash.length; k++) {
	var count = 0;
	var frac = new Fractions(_dash[k]);	
	var bBool = false;
	if (flag) {
	    if (_dash[k].worldMaxPosition().y > tempSeg.worldMaxPosition().y) {
		bBool =false;//kiem tra dieu kien tu
	    } else {
		bBool =true;//kiem tra dieu kien mau
	    }
	}
	for (var i = 0; i < segments.length; i++) {
	    var seg = segments[i];
	    if (_dash[k].set_id != seg.set_id &&
		_dash[k].worldMinPosition().x <= seg.worldMinPosition().x + seg.size.x / 2 &&
		_dash[k].worldMaxPosition().x >= seg.worldMaxPosition().x - seg.size.x / 2) {
		if (!flag) {
		    if (_dash[k].worldMinPosition().y >= segments[i].worldMaxPosition().y) {
			frac.Setnumerator(seg);
		    } else if (_dash[k].worldMaxPosition().y < segments[i].worldMinPosition().y) {
			frac.Setdenominator(seg);
		    }
		} else {
		    if(!bBool){
			if (_dash[k].worldMinPosition().y >= segments[i].worldMaxPosition().y
			    &&seg.worldMinPosition().y > tempSeg.worldMaxPosition().y) {			
			    frac.Setnumerator(seg);
			}		    
		    else if (_dash[k].worldMaxPosition().y < segments[i].worldMinPosition().y) {		    
			    frac.Setdenominator(seg);						
			}
		    }
		    else{
			if (_dash[k].worldMinPosition().y >= segments[i].worldMaxPosition().y
			    ) {			
			    frac.Setnumerator(seg);
			}		    
		    else if (_dash[k].worldMaxPosition().y < segments[i].worldMinPosition().y
			     &&seg.worldMaxPosition().y < tempSeg.worldMinPosition().y) {		    
			    frac.Setdenominator(seg);						
			}
		    }
		}
	    }
	}
	if (frac.denominator.length > 0 && frac.numerator.length > 0) {	 
	    if (!flag) {
		tempSeg = _dash[k];
	    }
	    _dash[k].symbol = "frac";
	    flag = true;
	    group.AddFrac(frac);
	    _dash[k].status = true;
	}
    }
    return group;
}
Fractions.UpdateStatus = function(in_segments,bBool) {
    var flag = false;
    if(bBool == true)
	flag = true;    
    for (var k = 0; k < in_segments.length; k++) {
	in_segments[k].status = flag;
    }
}

Fractions.SortGroup = function(groups){
   for(var i =0;i < groups.length;i++){
	for(var j = 0; j < groups.length; j++){
	    if(groups[i].minGroup()< groups[j].minGroup()){
		var temp = groups[i];
		groups[i] = groups[j];
		groups[j] = temp;
	    }
	}	
   }
   return groups;
}

Fractions.printf = function(in_segments){
//    for(var k = 0;k < in_segments.length;k++){
//	//console.log("symbol " + in_segments[k].symbol +" set_id "+in_segments[k].set_id) ;
//	Fractions.PointsPrintf(in_segments[k].points);	
//    }
}

Fractions.Trim = function(sString) {
        if (sString == null) {
            return "";
        }
        if (sString.length == undefined) {
            return "";
        }
        while (sString.length != 0) {
            if (sString.substring(0, 1) == ' ') {
                sString = sString.substring(1, sString.length);
            }
            else break;
        }
        while (sString.length != 0) {
            if (sString.substring(sString.length - 1, sString.length) == ' ') {
                sString = sString.substring(0, sString.length - 1);
            }
            else
                break;
        }
        return sString;
}

//chinh sua ham Create Group
Fractions.CreateGroup = function(bStatus) {    
    Fractions.Groups = new Array();    
    if(Editor.selected_segments.length ==0){
	Editor.segments = Gestures.SortSetId(Editor.segments);
	return false;
    }
    var bFrac = false;
    Gestures.segments_frac = Gestures.Sort(Gestures.segments_frac);//sap xep tang dan thao chieu x
    var segments = Editor.segments;    
    segments = Gestures.Sort(segments);//sap xep tang dan thao chieu x
    Fractions.Sqrts = Gestures.Sort(Fractions.Sqrts);//sap xep tang dan thao chieu x
    Fractions.UpdateStatus(segments);
    Fractions.UpdateStatus(Gestures.segments_frac);
    Fractions.SetDash(segments);
    Fractions.SetDash(Gestures.segments_frac);
    for(var k = 0; k < Fractions.gestures.length;k++){
	var group = new Group();
	var seg_gesture =Fractions.gestures[k];
	for (var i = 0; i < segments.length; i++) {
	    var seg = segments[i];
	    if(seg.status)
		continue;
	    if(seg.set_id == seg_gesture.set_id){
		group.Add(seg);
		seg.status = true;
	    }
	}
	if(group.segments.length > 0){
	    Fractions.Groups.push(group);	   
	}
	    
    }
    for (var k = 0; k < Gestures.segments_frac.length; k++) {
        var seg_frac = Gestures.segments_frac[k];
        if (seg_frac.status ) continue;
        var group = new Group();//
	var count = 0;	
	var _equal = new Array();
	var m_tuSo = new Array();
	var m_mauSo = new Array();
        for (var i = 0; i < segments.length; i++) {
            var seg = segments[i];
	    if(Gestures.isBlockSegment(seg, 1) ||  seg.symbol == undefined){
		seg.status = true;
		continue;
	    }
	    if(seg.status)
                continue;
            if(seg.symbol == "_equal"){
		_equal.push(seg);
		seg.status = true;		
		if(_equal.length == 2){
		    var groupPlus = new Group();//
		    if(_equal[0].set_id ==_equal[1].set_id){
			 groupPlus.Add(_equal[0]);
			 groupPlus.Add(_equal[1]);
			 Fractions.Groups.push(groupPlus);			 			  
		    }
		   _equal = new Array();
		}
		 continue;
	    }
	    var mFrac = 0;
	    if(seg.set_id != seg_frac.set_id){
		mFrac = Space.isExistsFrac(seg_frac,seg.worldMinPosition(),seg.worldMaxPosition());
	    }
	    if(mFrac == 1){
		m_tuSo.push(seg);
		seg.status = true;
		group.Add(seg);
	    }
	    else if(mFrac == 2){
		m_mauSo.push(seg);
		seg.status = true;
		group.Add(seg);
	    }
	    if(seg.set_id == seg_frac.set_id){
		group.Add(seg_frac);
		seg.status = true;
	    }
        }
	if(m_tuSo.length > 0 && m_mauSo.length >0){
	    seg_frac.symbol = "frac";	   
	    seg_frac.status = true;	    
	}	
	if(group.segments.length > 0){
	    Fractions.Groups.push(group);
	}
    }
    for(var k =0;k < Fractions.Sqrts.length; k++){
	var seg_sqrt = Fractions.Sqrts[k];
	if(seg_sqrt.status)
	    continue;
	var group = new Group();//
	for (var i = 0; i < segments.length; i++){
	    var seg =	segments[i];
	    if(Gestures.isBlockSegment(seg, 1)){
	        seg.status = true;
	        continue;
	    }
	    if(seg.set_id == seg_sqrt.set_id || seg.status == true){
		seg.status = true;
		continue;
	    }
	    var min = seg.worldMinPosition();
	    var max = seg.worldMaxPosition();
	    if(Space.isCheckSqrt(seg_sqrt,min,max)){
		group.Add(seg);
		seg.status = true;
	    }
        }
	if(group.segments.length > 0){
	    group.Add(seg_sqrt);
	    Fractions.Groups.push(group);	    
	}
    }
    
    var bGroup = true;
    var tempGroup = new Array();    
    var _plus = new Array();
    for(var k = 0;k < segments.length;k++){
	var seg = segments[k];
	if(Gestures.isBlockSegment(seg, 1)){
	    seg.status = true;
	    continue;
	}
	if(seg.status)
	    continue;
	if(seg.symbol == "_plus"){
		_plus.push(seg);
		seg.status = true;		
		if(_plus.length == 2){
		    var groupPlus = new Group();//
		    if(_plus[0].set_id ==_plus[1].set_id){
			 groupPlus.Add(_plus[0]);
			 groupPlus.Add(_plus[1]);
			 Fractions.Groups.push(groupPlus);			 			 
		    }
		    _plus = new Array();
		}
	    //continue;
	}
    }
    for (var i = 0; i < segments.length; i++){	
	if(segments[i].status == false ){
	    tempGroup.push(segments[i]);
	    bGroup = false;
	}
	else {
	    if(bGroup == false){
		tempGroup.push(segments[i]);
		bGroup = true;
	    }
	}
    }
    bGroup = true;
    for (var i = 0; i < tempGroup.length; i++) {
	var group ;
	if(i ==0){
	    group = new Group();//
	}	
	 if(tempGroup[i].status == false){	    	    
	    bGroup = false;	    
	    group.Add(tempGroup[i]);	    
	 }
	 else if(!bGroup){
	    if(group.segments.length > 0)	    
		Fractions.Groups.push(group);
	    group = new Group();//
	 }
	 if (i == tempGroup.length -1){
	    if(tempGroup[i].status == false){
		if(group.segments.length > 0)	    
		    Fractions.Groups.push(group);
	    }
	 }
    }
    Fractions.Groups = Fractions.SortGroup(Fractions.Groups);
    save_equals = null;
    var tk =0;
    while(tk < Fractions.Groups.length){
	var group = Fractions.Groups[tk];	
	group.removeSegment();
	if(!group.isUndefined()){
	    Fractions.removeGroup(tk);
	}
	else{	    
	    group.Sort();			
	    group = Fractions.SetFrac(group);	
	    if(group.isExistsEqual()){
	        save_equals = group.segments;	    
	    }
	    group.PrintfFraction();
	    tk++;
	}
	if(group.isExistsFrac())
	    bFrac = true;
    }
    Editor.segments = Gestures.SortSetId(Editor.segments);
    if(bStatus == undefined){
	Fractions.Equal();
	Fractions.Printfs();
    }
    return bFrac;
}

Fractions.removeGroup = function(index){
    if(index >-1){
	for(var k = index;k < Fractions.Groups.length -1;k++){
	    Fractions.Groups[k] = Fractions.Groups[k+1];
	}
	Fractions.Groups.pop();
    }
}

Fractions.checkSetId = function(arr1, arr2) {
    arr1 = Gestures.Sort(arr1);
    arr2 = Gestures.Sort(arr2);
    for(var j = 0;j< arr2.length; j++)
	for (var k = 0; k < arr1.length; k++) {	   
	    if (arr1[k].set_id == arr2[j].set_id) {
		return true;
	    }
	}
    return false;
}

Fractions.Equal = function(){
    select_poistion = Editor.selected_segments;
    if(save_equals != null){	
	try{
	    var min = Fractions.MinPosition(save_equals);
	    var max = Fractions.MaxPosition(save_equals);	
	    var maxSelect = Fractions.MaxPosition(select_poistion);
	    flag_equal = 0;
	    if(maxSelect.x < min.x){	
	       flag_equal = 1;
	    }
	    else{
		var minSelect = Fractions.MinPosition(select_poistion);
		if(minSelect.x > max.x){
		    flag_equal = 2;//sau dau bang		
		}
	    }
	}
	catch(e){
	    
	}
    }
}

var indexGroup = -1;
Fractions.Printfs = function() {
    indexGroup = -1;
    for (var k = 0; k < Fractions.Groups.length; k++) {
	var group = Fractions.Groups[k];	
	if (group.Fractions.length == 0) continue;
	for (var i = 0; i < group.Fractions.length; i++) {
	    var tu = group.Fractions[i].numerator;
	    var mau = group.Fractions[i].denominator;	    
	    var set_id = group.Fractions[i].id_group.set_id;	    
	    var bBool = false;	   	    
	    if (tu.length == Editor.selected_segments.length ||
		mau.length == Editor.selected_segments.length || mau.length >= 1|| tu.length >=1) {
		var arrTu = tu;
		var arrSelect = Editor.selected_segments;
		var arrMau = mau;		
		var isCheckId = Fractions.checkSetId(arrTu,arrSelect);
		if(isCheckId){		   
		   ps ="tu";		 
		   bBool = true;
		    select_Frac = group.Fractions[i].id_group;
		    indexGroup = k;
		   break;
		}		
		isCheckId = Fractions.checkSetId(arrMau,arrSelect);		
		if(isCheckId){
		    ps ="mau";
		    bBool = true;
		    select_Frac = group.Fractions[i].id_group;
		    indexGroup = k;
		   break;
		}
	    }
	    if(bBool)
		break;
	}
    }
   Fractions.isCheckisExistsListFrac();
}

Fractions.MaxPosition = function(in_segments) {
    if (in_segments.length == 0 || in_segments == null) return new Vector2(0, 0);
    var x = in_segments[0].worldMaxPosition().x;
    var y = in_segments[0].worldMaxPosition().y;
    for (var k = 1; k < in_segments.length; k++) {
	if (x < in_segments[k].worldMaxPosition().x) {
	    x = in_segments[k].worldMaxPosition().x;
	}
	if (y < in_segments[k].worldMaxPosition().y) {
	    y = in_segments[k].worldMaxPosition().y;
	}
    }
    return new Vector2(x, y);
}

Fractions.MinPosition = function(in_segments) {
    if (in_segments.length == 0 || in_segments == null) return new Vector2(0, 0);
    var x = in_segments[0].worldMinPosition().x;
    var y = in_segments[0].worldMinPosition().y;
    for (var k = 1; k < in_segments.length; k++) {
	if (x > in_segments[k].worldMinPosition().x) {
	    x = in_segments[k].worldMinPosition().x;
	}
	if (y > in_segments[k].worldMinPosition().y) {
	    y = in_segments[k].worldMinPosition().y;
	}
    }
    return new Vector2(x, y);
}
var frac_second = null;
var isCheck = 0;
Fractions.isCheckisExistsListFrac = function() {
    var fracs_select = null;
    frac_second = null;
    if (indexGroup != -1) {
	fracs_select = Fractions.Groups[indexGroup]._dashs;	
    }
    if (fracs_select != null) {
	fracs_select = Fractions.Sort(fracs_select);
	if (fracs_select.length >= 2) {
	    var min = Fractions.MinPosition(fracs_select);
	    for (var k = 0; k < fracs_select.length; k++) {
		if (min.x == fracs_select[k].worldMinPosition().x && fracs_select[k].set_id != select_Frac.set_id) {
		    frac_second = fracs_select[k];
		    break;
		}
	    }
	}
    }
    isCheck = 0;
    if (frac_second != null) {	
	if (frac_second.worldMinPosition().y > select_Frac.worldMinPosition().y) {
	    isCheck = 1; //dieu kien tu
	} else {
	    isCheck = 2; //dieu kien mau
	}
    }    
}

Fractions.ShowLog = function() {
    var tag = document.getElementById("note");
    var select = Editor.selected_segments;
    select = Gestures.Sort(select);
    var max = Fractions.MaxPosition(select);
    var min = Fractions.MinPosition(select);
    var bBool = false;

    if (select.length > 0) {
	var l = select.length - 1;
	var minX = min.x + select[0].size.x / 2;
	var maxX = max.x - select[0].size.x / 2;
	if (select_Frac != null) {
	    if (ps == "tu" && select_Frac.worldMaxPosition().y < min.y) {
		if (select_Frac.worldMinPosition().x < minX && select_Frac.worldMaxPosition().x > maxX) {
		    if (isCheck == 1) {
			if (max.y < frac_second.worldMinPosition().y) {
			    tag.innerHTML = Editor.floppositeMoveTopMessage;			   
			} else {			   
			}
		    } else if (isCheck != 1) {
			tag.innerHTML =  Editor.floppositeMoveTopMessage;			
		    }
		    ps == "mau";
		    bBool = true;
		}
	    } else if (ps == "mau" && select_Frac.worldMinPosition().y > max.y) {
		if (select_Frac.worldMinPosition().x < minX && select_Frac.worldMaxPosition().x > maxX) {
		    if (isCheck == 2) {
			if (min.y > frac_second.worldMaxPosition().y) {
			    tag.innerHTML = Editor.floppositeMoveBottomMessage;
			} else {			  
			}
		    } else if (isCheck != 2) {
			tag.innerHTML = Editor.floppositeMoveBottomMessage;
		    }
		    ps == "tu";
		    bBool = true;
		}
	    }
	}
    }
    if (!bBool) {
	if (save_equals == null) return;
	var minEqual = Fractions.MinPosition(save_equals);
	var maxEqual = Fractions.MaxPosition(save_equals);
	if (flag_equal == 1) {
	    if (min.x > maxEqual.x) {
		tag.innerHTML = Editor.floppositeMoveRightMessage;		
	    }
	} else if (flag_equal == 2) {
	    if (max.x < minEqual.x) {
		tag.innerHTML = Editor.flottomMoveLeftMessage;
	    }
	}
    }
    Fractions.stopTimer();
}

Fractions.ClearText = function(){
    var tag = document.getElementById("note");
    tag.innerHTML = "Notification";
    clearTimeout(Fractions.Time);
    Fractions.doTimer();
}

// Flashing
var count = 0;
var t;
var timer_is_on = 0;
var tag = document.getElementById("note");
var flag = true;

Fractions.Flashing = function () {
    count = count + 1;
    if (flag == true){
	tag.innerHTML = "Notification";
	flag = false;
    }
    else {
	tag.innerHTML = "";
	flag = true;
    }
    t = setTimeout("Fractions.Flashing();", 500);
    if (count == 11){
	Fractions.stopTimer();
	Fractions.doTimer();
    }
}

Fractions.doTimer = function () {
    flag = true;
    count = 0;
    if (!timer_is_on) {
        timer_is_on = 1;
        Fractions.Flashing();
    }
}

Fractions.stopTimer = function () {
    clearTimeout(t);
    timer_is_on = 0;
    count = 0;
}