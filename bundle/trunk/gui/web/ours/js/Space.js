function SQRT(){
    this.segments = new Array();
    this.count = 0;
}

SQRT.prototype = {
    Add : function(in_segment) {
	if (this.segments.contains(in_segment)) return;
	this.segments.push(in_segment);
	this.count = this.segments.length;
    },

    AddList : function(in_segments) {
	for (var k = 0; k < in_segments.length; k++) {
	    this.Add(in_segments[k]);
	}
    },

    Process : function() {
	Space.processSqrt(this.segments);
    },
    
    toString : function() {
	var s = "";
	for (var k = 0; k < this.segments.length; k++) {
	    s = s + " " + this.segments[k].symbol;
	}
	return s;
    }
};

Space.isCheck = false;
Space.translation = new Array();
Space.arrLefts = new Array();
Space.arrRights = new Array();
Space.saveSelect = new Array();

Space.sqrts = new Array();
Space.seg_in_sqrts = new Array();//nhung segment nam trong canis bac 2
Space.frac = new Array();
Space.segment_in_frac = new Array(); //nhung segment thuoc dang phan so
Space.trans = new Vector2(0, 0);
Space.arrs = new Array();
Space.segment_frac = null;//luu segment khi co segment di chuyen toi trong phan vi cua phan so
Space.InSegment = new Array();
Space.sqrtExists = new Array();
Space.isCheckInSqrt = false;
Space.countMove = 0;
Space.isCheckHeart = false;
Space.isCheckV = false;
Space.arrFracs = new Array();
function Space() {

}

Space.InitArr = function(){
    delete Space.sqrts;
    Space.sqrts = new Array();
    delete Space.nextSelect;
    Space.nextSelect = new Array();
    delete Space.frontSelect;
    Space.frontSelect = new Array();
    delete Space.frac;
    Space.frac = new Array();
    delete Space.trans;
    Space.trans = new Vector2(0, 0);
    delete Space.InSegment;
    Space.InSegment = new Array();
    delete Space.translation;
    Space.translation = new Array();
    delete Space.arrFracs;
    Space.arrFracs = new Array();
}

Space.printf = function() {
    Space.InitArr();
    Space.countMove = 0;
    var l = Editor.selected_segments.length;
    if (l == 0) return;
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var min = bb.mins;
    var max = bb.maxs;    
    Space.trans = new Vector2(max.x - min.x, 0);
    Space.InSegments();
    if(Editor.selected_segments.length == 1){
	if(Gestures.isBlockSegment(Editor.selected_segments[0], 1)){
	    Space.isCheckV = true;
	    return;
	}
    }
    Space.isCheckV = false;
    for (var i = 0; i < Editor.segments.length; i++) {
        var seg = Editor.segments[i];
        //luu cac segment co dau can trong danh sach segment	
        if (seg.symbol == "sqrt") {
            Space.sqrts.push(seg);            
        }       
        //luu cac segment dang phan so
        if (seg.symbol == "frac" || seg.symbol == "Frac") {
            Space.frac.push(seg);	    
        }
    }    
    Space.isCheckInSqrt = false;
    for(var k =0;k < Space.sqrts.length;k++){
        if(Space.isCheckSqrt(Space.sqrts[0],min,max)){
            Space.isCheckInSqrt = true;
            break;
        }
    }
    for (var k = 0; k < Fractions.Groups.length; k++) {
	var group = Fractions.Groups[k];	
	if (group.Fractions.length == 0) continue;
        for (var i = 0; i < group.Fractions.length; i++) {
            Space.arrFracs.push(group.Fractions[i]);            
        }
    }
    Space.segment_frac = null;
    for(var k = 0;k < Space.frac.length;k++){
        if(Space.frac[k].worldMinPosition().x <= min.x && Space.frac[k].worldMaxPosition().x>= max.x){
            Space.segment_frac = Space.frac[k];
            break;
        }
    }
}


Space.isCheckSelect = function(in_segment) {
    for (var k = 0; k < Editor.selected_segments.length; k++) {
        if (in_segment.set_id == Editor.selected_segments[k].set_id)
        return true;
    }
    return false;
}

Space.InSegments = function() {
    delete Space.InSegment;
    Space.InSegment = new Array();  
    for (var i = 0; i < Editor.segments.length; i++) {
        var seg = Editor.segments[i];
        if (Space.isCheckSelect(seg) == false && Gestures.isBlockSegment(seg, 1) == false && seg.symbol != undefined) {
            Space.InSegment.push(seg);
        }
    }
    Space.InSegment = Gestures.Sort(Space.InSegment);
   // return segments;
}

Space.render = function(in_segments, trans) {
    if(in_segments.length == 0)
        return;
    Editor.clear_selected_segments();
    in_segments = Gestures.Sort(in_segments);
    for (var k = 0; k < in_segments.length; k++) {
        Editor.add_selected_segment(in_segments[k], Editor.selected_segments);
    }
    //Editor.check_rectangle = true;
    for (var k = 0; k < Editor.selected_segments.length; k++) {
        Editor.selected_segments[k].translate(trans);
        //Editor.arr_seg_select.push(Editor.selected_segments[k].instance_id);
    }
    Editor.selected_bb.translate(trans);        
    RenderManager.render();
}

Space.changetrans = function(in_segment,trans){
    Editor.clear_selected_segments();    
    Editor.add_selected_segment(in_segment, Editor.selected_segments);    
    Editor.selected_segments[0].translate(trans);
    Editor.selected_bb.translate(trans);
    RenderManager.render();    
}
//Kiem tra segment co thuoc can bac 2 ko
Space.isCheckSqrt = function(sqrt,min,max){    
        if (sqrt.worldMinPosition().x < min.x &&
            sqrt.worldMaxPosition().x >= min.x &&
            sqrt.worldMaxPosition().y > min.y
            && max.y > sqrt.worldMinPosition().y
            ) {
            return true;            
        }
        return false;
}



Space.SortSqrt = function(sqrts){
    var l = sqrts.length;
    for (var i = 0; i < l; i++) {	
	for (var j = 0; j < l; j++) {
	    if (sqrts[i].count < sqrts[j].count) {
		var temp = sqrts[i];
		sqrts[i] = sqrts[j];
		sqrts[j] = temp;
	    }
	}
    }
    return sqrts;
}
Space.CreateGroupSqrt = function(in_segments){
    var arrSqrt = new Array();
    var sqrt = null;
    var l = in_segments.length;
    for(var k = 1; k < l ; k++){
        var seg = in_segments[k];
        if(seg.symbol =="sqrt"){
            var j = k+1;
            sqrt = new SQRT();
            sqrt.Add(seg);
            while(j<l ){
                var in_seg = in_segments[j];
                if(Space.isCheckSqrt(seg,in_seg.worldMinPosition(),in_seg.worldMaxPosition())){
                    sqrt.Add(in_seg);
                }
                j++;
            }
            arrSqrt.push(sqrt);
        }
    }
    sqrt = new SQRT();
    sqrt.AddList(in_segments);
    arrSqrt.push(sqrt);
    arrSqrt = Space.SortSqrt(arrSqrt);
    for(var k =0;k < arrSqrt.length;k++){
         console.log(arrSqrt[k].toString());
         arrSqrt[k].Process();
    }
}


Space.processSqrt = function(in_segments) {    
    if (in_segments.length < 2) return;
    Fractions.UpdateStatus(in_segments);    
    var sqrt = in_segments[0];
    var max = sqrt.worldMaxPosition();
    var min = sqrt.worldMinPosition();
    //Space.transSqrt(in_segments);
    var trans;
    var arrGroup = new Array();
    var arr = new Array();
     var i = 1,j = 0;
        while(i < in_segments.length){
            var seg = in_segments[i];
            if(seg.status){
                i++;
                continue;
            }           
            if(seg.symbol =="sqrt"){//Space.isCheckSqrt
                 j = i+1;            
                var seg = in_segments[i];
                seg.status = true;
                var group = new Group();
                group.Add(seg);              
                while(j < in_segments.length &&
                    Space.isCheckSqrt(seg,in_segments[j].worldMinPosition(),in_segments[j].worldMaxPosition())){
                    group.Add(in_segments[j]);
                    in_segments[j].status = true;
                    j++;
                }
                arrGroup.push(group);               
                i = j;
            }            
            else
                i++;
    }        
    for (var k = 1; k < in_segments.length; k++) {
        var seg = in_segments[k];
        arr.push(seg);
        if (seg.status) {
            continue;
        }
        seg.status = true;
        var group = new Group();
        group.Add(seg);
        var j = k + 1;
        while (j < in_segments.length) {
            if (seg.set_id == in_segments[j].set_id) {
                group.Add(in_segments[j]);
                in_segments[j].status = true;
            }
            j++;
        }
        arrGroup.push(group);
        Space.changeTransGroup(group.segments);
    }
    arrGroup = Fractions.SortGroup(arrGroup);
    for (var k = 1; k < arrGroup.length; k++) {
        var group = arrGroup[k - 1];
        var group1 = arrGroup[k];
        var segments = group.segments;
        var x1 = group.maxGroup() + 10;
        var x2 = group1.minGroup();
        trans = new Vector2(x1 - x2, 0);
        Space.render(group1.segments, trans);
    }
    var groups = new Group();
    for (var k = 1; k < in_segments.length; k++){
         groups.Add(in_segments[k]);
    }    
    var temp = groups.maxGroup()- max.x ;    
    var arr1 = new Array();
    arr1.push(sqrt);
    trans = new Vector2(temp/4, 0);
    Space.render(arr, trans);
    var offset = new Vector2(temp , 0);    
    Space.fnZoom(arr1,offset, 0);
   // Space.transSqrt(in_segments);
    offset = new Vector2(30, 0);
    Space.fnZoom(arr1,offset, 0);
    trans = new Vector2(7, 0);
    Space.render(arr, trans);
    Fractions.UpdateStatus(in_segments,true);
}
//Ham trans cac segments thuoc nhom "cung set_id "
Space.changeTransGroup = function(in_segments) {
    if (in_segments.length < 2) return;
    in_segments = Gestures.Sort(in_segments);    
    if(Gestures.isSegmentHeart(in_segments[0])){
	return;
    }    
    if (in_segments.length == 2) {
        if(in_segments[0].symbol =="_plus"){
            Space.updatePlus(in_segments);
	    return;
        }
	else if(in_segments[0].symbol =="x_lower"){
            var seg = in_segments[0];
            var seg1 = in_segments[1];
            var x = seg.worldMaxPosition().x + 1;
            var x1 = seg1.worldMinPosition().x;
            var trans = new Vector2(x - x1, 0);
            Space.changetrans(seg1, trans);
	    return;
        }	
	return;
    }
    if (in_segments.length == 3 && in_segments[0].symbol == "pm"){
        return;
    }
    for (var k = 1; k < in_segments.length; k++) {	    
            var seg = in_segments[k - 1];	
            var seg1 = in_segments[k];
	    if(seg.symbol == "tan" &&  k == 1)
		continue;
            var x = seg.worldMaxPosition().x + 5;
            var x1 = seg1.worldMinPosition().x;
            var trans = new Vector2(x - x1, 0);
            Space.changetrans(seg1, trans);
    }
}

Space.updateArrsSegment = function(in_segments){    
    if(in_segments.length >= 1){        
        //in_segments = Gestures.Sort(in_segments);     
        Fractions.UpdateStatus(in_segments);
        var arrGroup = new Array();
        var i = 0;
        while(i < in_segments.length){
            var seg = in_segments[i];
            if(seg.status){
                i++;
                continue;
            }
            if(seg.symbol == "sqrt"){//Space.isCheckSqrt
                var j = i + 1;    
                seg.status = true;
                var group = new Group();
                group.Add(seg);
                while(j < in_segments.length &&
                    Space.isCheckSqrt(seg,in_segments[j].worldMinPosition(),in_segments[j].worldMaxPosition())){
                    group.Add(in_segments[j]);
                    in_segments[j].status = true;
                    j++;
                }
                arrGroup.push(group);
                Space.CreateGroupSqrt(group.segments);
                i = j;
            }            
            else
                i++;
        }
        
        for(var k = 0;k < in_segments.length;k++){
            var seg = in_segments[k];
            if(seg.status){                
                continue;
            }
            seg.status = true;
            var group = new Group();
            group.Add(seg);
            var j = k + 1;
            while(j< in_segments.length){
                if(seg.set_id == in_segments[j].set_id){
                    group.Add(in_segments[j]);
                    in_segments[j].status = true;
                }
                j++;
            }
            arrGroup.push(group);        
            Space.changeTransGroup(group.segments);
        }
        //Space.render
        arrGroup = Fractions.SortGroup(arrGroup);
        for(var k = 1;k < arrGroup.length;k++){
            var group = arrGroup[k -1];
            var group1 = arrGroup[k];
            var segments = group.segments;
            var x1 = group.maxGroup() + 10;
            var x2 = group1.minGroup();
            var trans = new Vector2(x1 - x2,0);
            Space.render(group1.segments,trans);
        }       
    }
}

Space.updateEqual = function(in_segments){
    if(in_segments.length == 2){        
        in_segments = Gestures.Sort(in_segments);
        for(var k = 1;k < in_segments.length;k++){
            var seg = in_segments[k-1];                       
            var seg1 = in_segments[k];
            var x1 = seg.worldMinPosition().x;
            var x2 = seg1.worldMinPosition().x;
            var trans = new Vector2(x1 - x2,0);
            Space.changetrans(seg1,trans);
        }
    }
}

Space.updatePlus = function(in_segments){
    if(in_segments.length == 2){        
        in_segments = Gestures.Sort(in_segments);
        for(var k = 1;k < in_segments.length;k++){
            var seg = in_segments[k-1];                      
            var seg1 = in_segments[k];
            var x1 = seg.worldMinPosition().x + seg.worldMaxPosition().x ;
            var x2 = seg1.worldMaxPosition().x;
            var trans = new Vector2(x1/2 - x2,0);
            Space.changetrans(seg1,trans);
        }
    }
}


Space.Group = function(group,t){    
    switch(t){
        case 0://dang phan so
            {
                for (var i = 0; i < group.Fractions.length; i++) {
                    var tu = group.Fractions[i].numerator;
		    var mau =group.Fractions[i].denominator;
		    var arr = new Array(group.Fractions[i].id_group);
		    var gNume = new Group();
		    gNume.AddList(tu);
		    var gDeno = new Group();
		    gDeno.AddList(mau);
		    Space.processFrac(arr,gNume,gDeno);
                }
                break;
            }
        case 1:{//xu ly dau bang
            Space.updateEqual(group.segments);
            break;
        }
        case 2:{//xu ly dau cong
            Space.updatePlus(group.segments);
            break;
        }
        case -1:{//
            Space.updateArrsSegment(group.segments);
            break;
        }
        default :{
             //Space.updateArrsSegment(group.segments);
            break;
        }
    }
}

/*****************************************************************************
* intent: determine if the stroke is a numerator (tu) or denominator (mau)
* input:  frac = fraction bar stroke, min-max is the box of the candidate stroke
* output: 1 for numerator, 2 for denominator
* note:   the fraction bar must reach pass the candidate box by size/4.  
*         is this buffer necessary?
*         this only works for a single stroke candidate, not multistroke 
*         candidates
*****************************************************************************/
Space.isExistsFrac = function(frac, min, max){
    var temp = 0;
    var size = (max.x - min.x);
    if(frac.worldMinPosition().x <= (min.x + size/4) && frac.worldMaxPosition().x >= (max.x - size/4)
       && frac.size.x > size)
    {
	if(frac.worldMinPosition().y >= max.y){
	    temp = 1;//tu
	}
	else if (frac.worldMaxPosition().y <= min.y){
	    temp = 2;//mau
	}
    }
    return temp;
}

Space.processFrac = function(arr,in_numerator,in_denominator){
    for(var k = arr.length -1; k >=0 ; k--)
    {
            var zoom = new Array();
            zoom.push(arr[k]);
	    var x =  20;	    
	    var offset = new Vector2(x, 0);	                            
	    var in_Frac = new Group();
	    in_Frac.Add(zoom[0]);
	    var leftFrac = new Array();
	    var rightFrac = new Array();	  
	    Space.updateArrsSegment(in_numerator.segments);
	    Space.updateArrsSegment(in_denominator.segments);
	    var minSize = 0;
	    var maxSize = 0;
	    var minTu = in_numerator.minGroup();
	    var maxTu = in_numerator.maxGroup();
	    var minMau = in_denominator.minGroup();
	    var maxMau = in_denominator.maxGroup();
	    minSize = minTu > minMau ? minMau : minTu;	    
	    maxSize = maxTu < maxMau ? maxMau : maxTu;
	    minSize = minSize == 0 ? minMau + minTu : minSize;	    
	    var sizeNumerator = maxTu - minTu;
	    var sizeDenomirator = maxMau - minMau;
	    var sizeZoom = Math.abs(sizeDenomirator - sizeNumerator);	
	    Space.updateArrsSegment(in_Frac.segments);
	    var sizeFrac = in_Frac.maxGroup() - in_Frac.minGroup();
	    offset = new Vector2(maxSize - in_Frac.maxGroup() + 25 , 0);
	    Space.fnZoom(zoom,offset, 0);
	    offset = new Vector2(in_Frac.minGroup() - minSize  + 25 , 0);
	    Space.fnZoom(zoom,offset, 1);
    }
}

Space.changeZoomFrac = function(){
    if(Space.segment_frac!= null){
        var in_numerator = new Group();
	var in_denominator = new Group();
        var segments = Space.InSegment;
        for(var j = 0;j < segments.length;j++){
            var seg = segments[j];
            var mFrac = 0;
            if(Space.segment_frac.set_id == seg.set_id)
                continue;
            mFrac = Space.isExistsFrac(Space.segment_frac,seg.worldMinPosition(),seg.worldMaxPosition());
            if(mFrac == 1){
                in_numerator.Add(seg);
            }
            else
            if(mFrac == 2){
                in_denominator.Add(seg);
            }
        }
        var in_Frac = new Group();
        in_Frac.Add(Space.segment_frac);
        Space.updateArrsSegment(in_numerator.segments);
	Space.updateArrsSegment(in_denominator.segments);
        var offset;
	var minSize = 0;
	var maxSize = 0;
	var minTu = in_numerator.minGroup();
	var maxTu = in_numerator.maxGroup();
	var minMau = in_denominator.minGroup();
	var maxMau = in_denominator.maxGroup();
	minSize = minTu > minMau ? minMau : minTu;	    
	maxSize = maxTu < maxMau ? maxMau : maxTu;
	minSize = minSize == 0 ? minMau + minTu : minSize;	    
	var sizeNumerator = maxTu - minTu;
	var sizeDenomirator = maxMau - minMau;
	var sizeZoom = Math.abs(sizeDenomirator - sizeNumerator);	
	Space.updateArrsSegment(in_Frac.segments);
	var sizeFrac = in_Frac.maxGroup() - in_Frac.minGroup();	    
	offset = new Vector2(maxSize - in_Frac.maxGroup() + 25 , 0);
	Space.fnZoom(in_Frac.segments,offset, 0);        
	offset = new Vector2(in_Frac.minGroup() - minSize  + 25 , 0);
	Space.fnZoom(in_Frac.segments,offset, 1);
    }
}

Space.ZoomFrac = function(saveSelect) {    
    var arr = new Array();
    var in_segs = Editor.selected_segments;
    var l = in_segs.length;
    
    var t = 0;
    if (l == 0) return false;
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var min = bb.mins;
    var max = bb.maxs;
    var segments = Space.InSegment;
    var isCheckNumerator = false;
    if(segments.length == 0)
        return false;
    for (var k = 0; k < Space.frac.length; k++) {
        var seg = Space.frac[k];        
        if (seg.worldMinPosition().x >= min.x && max.x >= seg.worldMinPosition().x
            && seg.worldMaxPosition().x > max.x) {            
           if ((min.y >= seg.worldMaxPosition().y) || (max.y <= seg.worldMinPosition().y)) {
               arr.push(seg);
               if(max.y <= seg.worldMaxPosition().y){
                    isCheckNumerator = true;
               }
               t = 1;//ben trai
                break;
            }
        } else if (seg.worldMinPosition().x < min.x && seg.worldMaxPosition().x > min.x) {
            if ((min.y > seg.worldMaxPosition().y) || (max.y <= seg.worldMinPosition().y)) {
               arr.push(seg);
               if(max.y <= seg.worldMaxPosition().y){
                    isCheckNumerator = true;
               }
               t = 0;//ben phai
                break;
            }
        }
    }    
    if(arr.length > 0 ){        
	for(var k = arr.length -1; k >=0 ; k--){
            var zoom = new Array();
            zoom.push(arr[k]);
	    var x = max.x - min.x + 20;	    
	    var offset = new Vector2(x, 0);	                
            var in_numerator = new Group();
	    var in_denominator = new Group();
	    var in_Frac = new Group();
	    in_Frac.Add(zoom[0]);
	    var leftFrac = new Array();
	    var rightFrac = new Array();
            var groupsLeft = new Group();
            var groupsRight = new Group();//Space.arrFracs = new Array();
            var m_frac = null;
            for(var n = 0;n < Space.arrFracs.length; n++){
                if(arr[k].set_id == Space.arrFracs[n].id_group.set_id){
                    m_frac = Space.arrFracs[n];
                    break;
                }
            }
            if(m_frac != null){
                for(var ij = 0;ij < Editor.selected_segments.length;ij++){
                    var seg = Editor.selected_segments[ij];
                    m_frac.removeNumerator(seg);
                    m_frac.removeDenominator(seg);
                }
                in_numerator.AddList(m_frac.numerator);
                in_denominator.AddList(m_frac.denominator);
                
            }
            if(isCheckNumerator){
                in_numerator.AddList(Editor.selected_segments);
            }
            else{
                in_denominator.AddList(Editor.selected_segments);
            }
            for(var j = 0;j < segments.length;j++){
		if(segments[j].set_id == arr[k].set_id || Editor.FindIndexSegment(segments[j].set_id,in_numerator.segments) !=-1
                   || Editor.FindIndexSegment(segments[j].set_id,in_denominator.segments) !=-1)
		    continue;		
		    if(arr[k].worldMaxPosition().x < segments[j].worldMinPosition().x){//ben phai
			rightFrac.push(segments[j]);
                        groupsRight.Add(segments[j]);
		    }
		    else if(arr[k].worldMinPosition().x > segments[j].worldMaxPosition().x){//ben trai
			leftFrac.push(segments[j]);
                        groupsLeft.Add(segments[j]);
		    }
	    }
	    Space.fnZoom(zoom,offset, t);
            if(t == 0)
	    Space.render(rightFrac, new Vector2(x,0));            
            if(t == 1)
                Space.render(leftFrac, new Vector2(-x,0));
            if(Editor.interior){
                Space.updateArrsSegment(in_numerator.segments);
                Space.updateArrsSegment(in_denominator.segments);
            }
	    var minSize = 0;
	    var maxSize = 0;
	    var minTu = in_numerator.minGroup();
	    var maxTu = in_numerator.maxGroup();
	    var minMau = in_denominator.minGroup();
	    var maxMau = in_denominator.maxGroup();
	    minSize = minTu > minMau ? minMau : minTu;	    
	    maxSize = maxTu < maxMau ? maxMau : maxTu;
	    minSize = minSize == 0 ? minMau + minTu : minSize;	    
	    var sizeNumerator = maxTu - minTu;
	    var sizeDenomirator = maxMau - minMau;
	    var sizeZoom = Math.abs(sizeDenomirator - sizeNumerator);	
	    Space.updateArrsSegment(in_Frac.segments);
	    var sizeFrac = in_Frac.maxGroup() - in_Frac.minGroup();	    
	    offset = new Vector2(maxSize - in_Frac.maxGroup() + 25 , 0);
	    Space.fnZoom(zoom,offset, 0);
            if(t == 0)
            Space.render(rightFrac, offset);
            
	    offset = new Vector2(in_Frac.minGroup() - minSize  + 25 , 0);
	    Space.fnZoom(zoom,offset, 1);            
            if(t == 1)
            Space.render(leftFrac, offset);            
            if(Editor.interior){
                Space.updateArrsSegment(in_numerator.segments);
                Space.updateArrsSegment(in_denominator.segments);
            }
        }
	
        return true;
    }
    return false;
}



Space.ZoomSqrt = function(saveSelect) {
    
    var arr = new Array();
    var in_segs = Editor.selected_segments;
    var l = in_segs.length;
    if (l == 0) return false;
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var min = bb.mins;
    var max = bb.maxs;
    var height = Editor.SpaceHeight -(max.y - min.y);
    var segments = Space.InSegment;       
    if(segments.length == 0)
        return false;
    var mins = min;
    var maxs = max;
    mins.y = mins.y;// + height;
    maxs.y = maxs.y ;//+ height;
    for (var k = 0; k < Space.sqrts.length; k++) {
        var seg = Space.sqrts[k];        
        if (Space.isCheckSqrt(seg,mins,maxs)) {            
            arr.push(seg);           
        }
    }    
    if (arr.length > 0) {       
        if(Space.isCheckInSqrt){
            Space.isCheckInSqrt = false;
            return false;
        }	
        for(var k = arr.length -1; k >=0 ; k--){
            var zoom = new Array();
            zoom.push(arr[k]);
            var in_segments = new Array();            
            var x = max.x - min.x + 20;             
            var offset = new Vector2(x , 0);       
            var rightSqrt = new Array();
	   
            for(var j = 0;j < segments.length;j++){
                if(Space.isCheckSqrt(arr[k],segments[j].worldMinPosition(),segments[j].worldMaxPosition())){
                    in_segments.push(segments[j]);                    
                }
		else if(arr[k].worldMaxPosition().x < segments[j].worldMinPosition().x){
		    rightSqrt.push(segments[j]);
		}
            } 	   
            for(var j = 0; j < saveSelect.length;j++){
                in_segments.push(saveSelect[j]);
            }
	    Space.fnZoom(zoom,offset, 0);
            var trans = new Vector2(x/3,0);
            Space.render(in_segments,trans);
	    trans = new Vector2(x,0);
	    Space.render(rightSqrt,trans);
        }        
        return true;
    }
    return false;
}

Space.nextGroup = function(set_id,in_segments){
    var arr = new Array();
    for(var k =0;k<in_segments.length;k++){
        if(in_segments[k].set_id ==set_id)
            arr.push(in_segments[k]);
    }
    arr = Gestures.Sort(arr);
    return arr;
}


Space.fnZoom = function(in_segments,offset, t) {
    Editor.clear_selected_segments();
    if(in_segments.length == 0)
	return;
    for (var k = 0; k < in_segments.length; k++) {
        Editor.add_selected_segment(in_segments[k], Editor.selected_segments);	
    }    
    Editor.original_bb = Editor.selected_bb.clone();    
    var bb = Editor.original_bb;
    var anchor;
    switch (t) {
    case 0:
        {
            offset.y = 0.0;
            anchor = bb.mins;
            break;
        }
    case 1:
        {
            anchor = bb.maxs;          
            offset.y = 0.0;
            break;
        }
    case 2:// bottom edge
        anchor = new Vector2(bb.maxs.x, bb.mins.y);
        offset.x = 0.0;
        break;
    case 3:// top edge
	offset.x = 0.0;
	offset.y *= -1.0;
	anchor = new Vector2(bb.mins.x, bb.maxs.y);
	break;
    }
    Editor.resize_offset.Add(offset);    
    var bb_size = Vector2.Subtract(bb.maxs, bb.mins);
    var temp = 0;
    if(bb_size.y ==0){        
        temp = 0;
    }
    else{
        temp = Editor.resize_offset.y / bb_size.y;
    }    
    var scale = new Vector2((Editor.resize_offset.x / bb_size.x) + 1.0, temp + 1.0);    
    if ((isNaN(scale.x) || isNaN(scale.y)) == false && (scale.x == 0.0 || scale.y == 0) == false) {        
        for (var k = 0; k < Editor.selected_segments.length; k++){
             Editor.selected_segments[k].resize(anchor, scale);             
        }        
        Editor.update_selected_bb();
        RenderManager.render();
    }
    for (var k = 0; k < Editor.selected_segments.length; k++){
        Editor.selected_segments[k].freeze_transform();        
    }    
    RenderManager.render();
    Editor.resize_offset = new Vector2(0, 0);
}

//Cap nhap khi di chuyen segment o ben duoi thuoc pham vi toa do xmin va xmax
Space.Updatemouseup = function(){
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var min = bb.mins;
    var max = bb.maxs;
    var size = max.x - min.x;
    var segments = Space.InSegment;
    if(segments.length == 0)
        return;
    var arr = new Array();
    for (var k = 0; k < segments.length; k++) {
        var seg = segments[k];
            if(seg.symbol == "sqrt")
                continue;
        var arrGroup = Space.nextGroup(segments[k].set_id,segments);
        var lSegG = arrGroup.length -1;
        if(lSegG < 0)
            continue;
        var group = new Group();
        for(var i=0; i <= lSegG; i++){
            group.Add(arrGroup[i]);
        }
        //var seg = arrGroup[arrGroup.length - 1] ;//segments[k];
        if ((group.maxGroup() >= min.x && min.x >= group.minGroup())
             || (min.x <= group.minGroup() && group.maxGroup()<= max.x))
        {
            arr.push(group);
            break;
        }
    }
    if(arr.length > 0){
        var arrLeft = new Array();
        var arrRight = new Array();
        for (var k = 0; k < segments.length; k++) {
            var seg = segments[k];
            if (seg.worldMinPosition().x < arr[0].minGroup()) {
                arrLeft.push(seg);
            }
            if (seg.worldMinPosition().x > max.x) {
                arrRight.push(seg);
            }            
        }
        var x  = arr[0].maxGroup()- min.x - 5;
        var trans = new Vector2(x,0);
        var size = max.x - min.x + 5;
        Space.render(arrLeft, trans);
        trans = new Vector2(size,0);
        Space.render(arrRight, trans);
    }
}

Space.renderGroup = function(){    
    var arrGroup = new Array();
    var sGroup = null;
    var bBool = false;
    for(var k = 0;k < Fractions.Groups.length; k++){	
	var group = Fractions.Groups[k];
        if(k == 0){
            sGroup = new Group();
            sGroup.AddList(group.segments);//Fractions
            sGroup.Fractions = group.Fractions;
	    if(group.isExists()){
		bBool = true;
	    }
        }
        else{
            if(group.isExists()){
                arrGroup.push(sGroup);
                sGroup = new Group();
                sGroup.AddList(group.segments);
                sGroup.Fractions = group.Fractions;
                bBool = true;
            }
            else{
                if(bBool){
                    arrGroup.push(sGroup);
                    sGroup = new Group();
                    sGroup.AddList(group.segments);
                    sGroup.Fractions = group.Fractions;
                }
                else{
                    sGroup.AddList(group.segments);
                    sGroup.Fractions = group.Fractions;
                }
                bBool = false;
            }
        }
        if(k == Fractions.Groups.length -1){
            arrGroup.push(sGroup);
        }
    }
    
    for(var k = 0;k < Fractions.Groups.length; k++){
        var group = Fractions.Groups[k];
        var tGroup = -1;
	if(group.isHeart()){	    
	    continue;
	}
        if(group.Fractions.length <=1 && group.isExistsFrac()) {
            tGroup = 0;//xu ly phan so            
        }
        if(group.isExistsEqual()){
            tGroup = 1;//xu ly dau bang
        }
        if(group.isExistsPlus()){
            tGroup = 2;//Xu ly dau cong
        }
	if(!group.isExists()){
	    tGroup = -1;
	}	
        Space.Group(group,tGroup);
    }
    
    for(var k = 1;k < Fractions.Groups.length; k++){	
	var group = Fractions.Groups[k-1];
        var group1 = Fractions.Groups[k];
        var xGroupMax = group.maxGroup()+ 25;
        var xGroupMin = group1.minGroup();
        trans = new Vector2(xGroupMax - xGroupMin, 0);
        var segments = group1.segments;
        Space.render(segments, trans);        
    }
    
    for(var k = 1;k < Fractions.Groups.length; k++){	
	var group = Fractions.Groups[k-1];
        var group1 = Fractions.Groups[k];
	var xGroupMax = group.maxGroup()+ 10;
        var xGroupMin = group1.minGroup();
        trans = new Vector2(xGroupMax - xGroupMin, 0);
	if(!group.isExists() && group1.isExistsFrac()){
	    trans = new Vector2(xGroupMax - xGroupMin, 0);
	    var segments = group1.segments;
	    Space.render(segments, trans);     
	}
	else if(!group1.isExists() && group.isExistsFrac()){
	    trans = new Vector2(xGroupMax - xGroupMin, 0);
	    var segments = group1.segments;
	    Space.render(segments, trans);     
	}        
          
    }
    for(var k = 0;k < arrGroup.length;k++){    
        var group = arrGroup[k];		
        if(!group.isExists()){
           Space.Group(group,-1);
        }
    }
    return Fractions.Groups;
}

Space.segments = function(){
    var arr = new Array();
    for(var k = 0;k < Editor.segments.length;k++){
	if(Gestures.isBlockSegment(Editor.segments[k], 1) || Editor.segments[k].symbol == undefined)
	    continue;
	arr.push(Editor.segments[k]);
    }
    return arr;
}

Space.Endrender = function() {
    Gestures.DragMouseup();
    Editor.drag  = false;
    //if (Editor.selected_segments_transform.length > 0) {
	//Editor.current_action.add_new_transforms(Editor.selected_segments_transform);
    //}
    if(Editor.selected_segments.length == 1){
	if(Gestures.isBlockSegment(Editor.selected_segments[0], 1)){
	    return;
	}
    }
    if(Space.countMove < 10)
	return;
    //if (Gestures.PosOutSize(Segment.top, Segment.left, Segment.width, Segment.height) == false)
    if (!Gestures.deletes())
    {
	if(Space.InSegment.length == 0 && Editor.interior){
            return;
	    var groupSelect = new Group();	
	    groupSelect.AddList(Editor.selected_segments);	
	    var minSeg = groupSelect.minGroup();//.x;
	    var maxSeg = groupSelect.maxGroup();//.x;
	    var xSeg = (innerWidth -(maxSeg - minSeg))/2;
	    trans = new Vector2(xSeg - minSeg - 30, 0);
	    var sements_space = Space.segments();
	    //Editor.add_action(new SpaceformSegments(sements_space));
	    Space.render(sements_space, trans);
	    //Editor.current_action.add_new_transforms(sements_space);            
	    return;
	}
	var trans;
	var saveSelect = new Array();
	for (var k = 0; k < Editor.selected_segments.length; k++) {
	    saveSelect.push(Editor.selected_segments[k]);
	}
	saveSelect = Gestures.Sort(saveSelect);    
	var bBool = false;    
	Space.Update();
	if(!Space.isCheckHeart)
	    if(Editor.extend) Space.ZoomSqrt(saveSelect);  
	if (Space.translation.length >= 2 && Editor.interior) {        
	    trans = Space.translation[0];        
	    trans.x = -trans.x;
	    //Space.arrs
	    if(Space.arrs.length > 0)
		Space.render(Space.arrs[0].segments, trans);
	    Space.render(Space.arrLefts, trans);        
	    trans = Space.translation[1];
	    trans.x = -trans.x;
	    if(Space.arrs.length > 1)
		Space.render(Space.arrs[1].segments, trans);
	    Space.render(Space.arrRights, trans);             
	    bBool = true;
	}
	
	trans = new Vector2(0, 0);
	Space.render(saveSelect, trans);
	if(!Space.isCheckHeart)
	    if(Editor.extend)
             Space.ZoomFrac(saveSelect);             
        //trans = new Vector2(1, 0);
        //Space.render(saveSelect, trans);
        //Space.changeZoomFrac();
	trans = new Vector2(0, 0);
	Space.render(saveSelect, trans);
        if(!Editor.interior){
            Space.InitArr();
            //return;
        }
	//for (var k = 0; k < Editor.selected_segments.length; k++) {    
            //Editor.arr_seg_select.push(Editor.selected_segments[k].instance_id);
        //}
	RenderManager.render();
        Space.InitArr();
        return;
	Fractions.CreateGroup(true);
	var groupArr = Space.renderGroup();	
	var lSeg = groupArr.length;
	if(lSeg > 0 && Editor.interior){
	    var minSeg = groupArr[0].minGroup();//.x;
	    var maxSeg = groupArr[lSeg -1].maxGroup();//.x;
	    var xSeg = (innerWidth -(maxSeg - minSeg))/2;
	    trans = new Vector2(xSeg - minSeg - 30, 0);
	    var sements_space = Space.segments();	    
	    Space.render(sements_space, trans);	   
	}
	trans = new Vector2(0, 0);
	Space.render(saveSelect, trans);
        //Editor.arr_seg_select = new Array();
	RenderManager.unsetField(Editor.set_field);
	delete Editor.set_field;
	Editor.set_field = new Array();
	delete Editor.arr_seg_select;
	Editor.arr_seg_select = new Array();

	Space.InitArr();
    }
}

Space.shift = function(in_segments, trans) {
    for (var k = 0; k < in_segments.length; k++) {
        in_segments[k].translate(trans);
    }
}

Space.Update = function() {
   
    if (Space.translation.length >= 2) {
        var trans = Space.translation[0];
        trans.x = -trans.x;
        if(Space.arrs.length > 0)
            Space.shift(Space.arrs[0].segments, trans);
        Space.shift(Space.arrLefts, trans);
        trans = Space.translation[1];
        trans.x = -trans.x;
        if(Space.arrs.length > 1)
            Space.shift(Space.arrs[1].segments, trans);
        Space.shift(Space.arrRights, trans);
    }
}

Space.selectShift = function() {
    var segments_select = Gestures.Sort(Editor.selected_segments);
    var l = segments_select.length;    
    Space.countMove ++ ;
    Space.isCheckHeart = false;
    if(Space.isCheckV)
	return;
    
    if (l == 0 || !Editor.interior) return;
    var temHeight = 0;//Editor.SpaceHeight;
    //if(Editor.crosshair)
	//temHeight = Editor.SpaceHeight;
    if (Space.isCheck) {
        Space.isCheck = false;
        Space.Update();
	delete Space.arrLefts;
        Space.arrLefts = new Array();
	delete Space.arrRights;
        Space.arrRights = new Array();
	delete Space.translation;
        Space.translation = new Array();
        
    }   
    Editor.original_bb = Editor.selected_bb.clone();
    var bb = Editor.original_bb;
    var min = bb.mins;
    var max = bb.maxs;
    var size = max.x - min.x;
    var segments = Space.InSegment;
    if(segments.length == 0)
        return;
    var arr = new Array();
    delete Space.sqrtExists;
    Space.sqrtExists = new Array();
    delete Space.translation;
    Space.translation = new Array();
    delete Space.arrs;
    Space.arrs = new Array();
    for (var k = 0; k < segments.length; k++) {
        var seg = segments[k];
            if(seg.symbol == "sqrt"){
                if(Space.isCheckSqrt(seg,min,max)){                
                   Space.sqrtExists.push(seg);                 
                }                
                continue;
            }
        var arrGroup = Space.nextGroup(segments[k].set_id,segments);
        var lSegG = arrGroup.length -1;
        if(lSegG < 0)
            continue;
        var group = new Group();
        for(var i=0; i <= lSegG; i++){
            group.Add(arrGroup[i]);
        }
        //var seg = arrGroup[arrGroup.length - 1] ;//segments[k];
        if (((group.maxGroup() >= min.x && min.x >= group.minGroup())||
             (min.x <= group.minGroup() && group.maxGroup()<= max.x))
            && min.y + temHeight < group.maxY()
            && max.y + temHeight > group.minY()) {
	    Space.isCheckHeart = group.isHeart();
            arr.push(group);
            break;
        }
    }    
    var translation = new Vector2(0, 0);        
    if (arr.length > 0) {      
        for (var k = 0; k < segments.length; k++) {
            var seg = segments[k];
            if(seg.symbol == "sqrt")
                continue;
            var arrGroup = Space.nextGroup(segments[k].set_id,segments);
            var lSegG = arrGroup.length -1;           
            var group = new Group();
            for(var i = 0; i <= lSegG; i++){
                group.Add(arrGroup[i]);
            }
            if (group.minGroup() > arr[0].maxGroup()) {
                if (group.minGroup() - size - 10 <= arr[0].maxGroup()
                && min.y + temHeight < group.maxY()
                && max.y + temHeight > group.minY()) {
                    arr.push(group);		    
                    break;
                }
            }
        }
    }
    
    if (arr.length >= 2) {
        Space.isCheck = true;
	delete Space.arrLefts;
        Space.arrLefts = new Array();
	delete Space.arrRights;
        Space.arrRights = new Array();        
        for (var k = 0; k < segments.length; k++) {
            var seg = segments[k];
            if(seg.worldMaxPosition().y > arr[0].minY() && seg.worldMinPosition().y < arr[0].maxY())
            if (seg.worldMaxPosition().x < arr[0].minGroup()) {
                Space.arrLefts.push(seg);
            }
            if (seg.worldMinPosition().x > arr[1].maxGroup()) {
                Space.arrRights.push(seg);
            }            
        }      
        var xmin = min.x - arr[0].maxGroup();
        translation = new Vector2(xmin -15, 0);
        Space.translation.push(translation);   
        Space.arrs.push(arr[0]);
        Space.shift(arr[0].segments, translation);
        Space.shift(Space.arrLefts, translation);        
        var temp = 1;       
        var x = max.x - min.x + temp;                                              
        Space.arrs.push(arr[1]);
        translation = new Vector2(x, 0);
        Space.shift(arr[1].segments, translation);
        Space.shift(Space.arrRights, translation);        
        Space.translation.push(translation);
    }    
}

 Space.penStroke = function(maxx) {
     //var maxx = segments.worldMaxPosition().x;
     var right = new Array();
     var left = new Array();
     for (var k = 0; k < Editor.segments.length; k++) {
	 var seg = Editor.segments[k];
	 if (seg.worldMinPosition().x > maxx) {
	     right.push(seg);
	 } else {
	     left.push(seg);
	 }
     }
     var trans = new Vector2(Editor.moveSpace, 0);
     Space.render(right, trans);
     trans = new Vector2(- Editor.moveSpace, 0);
     Space.render(left, trans);
     try {
	 Editor.clear_selected_segments();
     } catch (e) {}
 }
