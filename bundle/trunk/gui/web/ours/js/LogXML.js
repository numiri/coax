// JavaScript Document

function LogXML() {

}

LogXML.GroupLog = function(id_user, id_exer, id_select, id_history, from_step, to_step, status, latex, url_images, proc_skipped) {
    HistorySegments.set_action = true;
    HistorySegments.stringXml = new StringBuilder();
    var in_segments = Editor.segments;
    Fractions.UpdateStatus(in_segments);
    proc_skipped = (proc_skipped)? proc_skipped: "";
    var s = "<segments userId = \"" + id_user + "\" exerId = \"" + id_exer + "\" selectId = \"" + id_select + "\" ";
    s += "historyId = \"" + id_history + "\" " + "status = \"" + status + "\" " + "latex = \"" + latex + "\" ";
    s += "fromStep = \"" + from_step + "\" " + "toStep = \"" + to_step + "\" ";
    s += "version = \"" + HistorySegments.version + "\" ";
    s += "proc_skipped = \"" + proc_skipped+"\" ";
    s += ">";
    
    if (url_images.length == 0){
	//s = s + "images = \"" + "null" + "\">";
    }
    else {
    	/*
	for (var i = 0; i < url_images.length; i++) {
	    s = s + "images" + i + " = \"" + url_images[i].textContent + "\">";
	}*/
    }
    for (var k = 0; k < in_segments.length; k++) {
	var seg = in_segments[k];
	if (seg.status || seg.symbol == undefined || Gestures.isBlockSegment(seg, 1)) {
	    continue;
	}
	seg.status = true;
	var group = new Group();
	group.Add(seg);
	var j = k + 1;
	while (j < in_segments.length) {
	    if (seg.set_id == in_segments[j].set_id && !Gestures.isBlockSegment(in_segments[j], 1)
		&& in_segments[j].symbol != undefined) {
		group.Add(in_segments[j]);
		in_segments[j].status = true;
	    }
	    j++;
	}
	if(group.segments.length == 0)
	    continue;
	var symbol = group.segments[0].symbol;
	symbol = symbol.replace("_plus","+").replace("_dash","-").replace("_equal","=");
	symbol = symbol.replace("x_lower","x").replace("y_lower","y");
	s = s + "<group symbol = \"" + symbol + "\">";
	s = s + LogXML.PrintfGroup(group);//replace
	s = s + "<symbols>" + Fractions.Trim(group.segments[0].symbol);
	s = s + "</symbols><scale>"+seg.scale.x+"</scale>";
	s = s + "</group>";
	
    }
    s = s + "</segments>";
    return HistorySegments.stringXml.append(String(s));
}
//ham in cac point trong segments
LogXML.PrintfGroup = function(group){
    var segments = group.segments;
    var sPoint = "";
    var sMin = "";    
    var set_id = "";
    for(var k =0;k < segments.length;k++){
	if(k ==0){
	    sMin = segments[k].worldMinPosition();
	    sPoint = LogXML.PointsPrintf(segments[k].points);
	}
	else{
	    sPoint = sPoint + "-" + LogXML.PointsPrintf(segments[k].points);
	    sMin = sMin + "-" + segments[k].worldMinPosition();
	}
    }
    var s = "<points>" + sPoint + "</points>";
    s = s + "<minPos> " + sMin + "</minPos>";
	console.log(s);
    return s;
}
LogXML.PointsPrintf  = function(points){
    var s ="";
    for(var k = 0;k < points.length;k++){
	s = k == 0? "": s + "|";
	s = s + points[k];
    }
    return s;
}