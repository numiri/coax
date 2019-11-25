//day la phan chinh sua cua hpham
//test coi nao
//dddd
// var keyboardXml = "web/ours/xml/keyboard.xml";
var keyboardNode = document.getElementById("keyboard");
Keyboard.isKeyboard = false;
Keyboard.currentId = null;
Keyboard.currentIndex = null;

Keyboard.ArrExpression = new Array();
Keyboard.data_segment = new Array();
Keyboard.symbols = new Array("_dash","y","y_lower","frac","_equal");

function Keyboard() {

}

//Tinh chieu cao trung binh cua segment
Keyboard.getAvgHeight = function()
{
    var avg = 0;
    var count = 0;
    var height = 0;
    var isFour = 0;
    var isPlus = 0;
    var group;
    var isFive = 0;
    var segments = Editor.segments;
    segments = Gestures.SortSetId(segments);
    for(var k = 0;k < segments.length;k++){
	var seg = segments[k];
	
	if(Keyboard.symbols.contains(seg.symbol))
	    continue;
	if(Editor.FindIndexSegment(seg.set_id,Editor.segmentSplits)!=-1 ||
	   Gestures.IsSegmentsBelongDralf(seg) == true || seg.symbol == "dots" || seg.symbol== ".")
	    continue;
	 var size = seg.worldMaxPosition().y - seg.worldMinPosition().y;
          if(seg.symbol == "5"){
	    isFive ++;
	    if(isFive == 1){
		group = new Group();
		group.Add(seg);
	    }
	    if(isFive == 2 || k == segments.length-1){
		group.Add(seg);
		height = height + group.maxY() - group.minY();
		isFive = 0;
		count ++;
	    }	    
	}
	else if(isFive == 1){
	    height = height + group.maxY() - group.minY();
	    height = height + size;
	    isFive = 0;
	    count ++;
	}
	else
	if(seg.symbol == "_plus"){
	    isPlus ++;
	    if(isPlus == 1){
		group = new Group();
		group.Add(seg);
	    }
	    if(isPlus == 2){
		group.Add(seg);
		height = height + group.maxY() - group.minY();
		isPlus = 0;
		count ++;
	    }
	}
	else
	    if(seg.symbol == "4"){
	    isFour ++;
	    if(isFour == 1){
		group = new Group();
		group.Add(seg);
	    }
	    if(isFour == 2 || k == segments.length-1){
		group.Add(seg);
		height = height + group.maxY() - group.minY();
		isFour = 0;
		count ++;
	    }	    
	}
	else if(isFour == 1){
	    height = height + group.maxY() - group.minY();
	    height = height + size;
	    isFour = 0;
	    count ++;
	}
	else{
	    height = height + size;
	    count ++;
	}
    }
    if(count > 0)
	avg = height/count;
    return avg;
}

Keyboard.initialize = function() {
    Keyboard.time_current;
    Keyboard.time_on = 0;
    Keyboard.opacity = 0;
    Keyboard.height = 0;
    Keyboard.top = 90;
    
    // node div
    Keyboard.panel = document.getElementById("panelkey");
    Keyboard.button = document.getElementById("kboard");
    Keyboard.panel.style.height = Keyboard.height + "%";
    Keyboard.panel.style.top = Keyboard.top + "%"
    Keyboard.panel.style.opacity = Keyboard.opacity/10;
    Keyboard.panel.style.display = "none";
    
    // tess mouse
    Keyboard.button.addEventListener("mousedown", function(e){
	if (!Editor.using_mobile) {
	    
	    Editor.checkScroll = false;
	    RenderManager.unsetField(Editor.set_field);
	    delete Editor.set_field;
	    Editor.set_field = new Array();
	    delete Editor.arr_seg_select;
	    Editor.arr_seg_select = new Array();
	    Editor.clearButtonOverlays();
	    Editor.state = EditorState.ReadyToRectangleSelect;
	    Editor.selection_method = "Rectangle";
	    for (var i = 0; i < Editor.selected_segments.length; i++){
		var seg = Editor.selected_segments[i];
		seg.render();
	    }
	    Editor.clear_selected_segments();
	    RenderManager.render();
	    
	    if (Keyboard.panel.style.display == "none") {
		Keyboard.panel.style.display = "block";
		Keyboard.stopTimer();
		Keyboard.buttonDown();
	    }
	}
	Editor.button_states[Buttons.Key].setTouched(true);
    }, false);
    Keyboard.button.addEventListener("mouseup", function(e){
	if (!Editor.using_mobile) {
	    Keyboard.stopTimer();
	    Keyboard.buttonUp();
	}
	Editor.button_states[Buttons.Key].setTouched(false);
    }, false);
    
    // action on divece of moblie
    Keyboard.button.addEventListener("touchstart", function(e){
	event.preventDefault();
	if (Editor.using_mobile){
	    
	    Editor.checkScroll = false;
	    RenderManager.unsetField(Editor.set_field);
	    delete Editor.set_field;
	    Editor.set_field = new Array();
	    delete Editor.arr_seg_select;
	    Editor.arr_seg_select = new Array();
	    Editor.clearButtonOverlays();
	    Editor.state = EditorState.ReadyToRectangleSelect;
	    Editor.selection_method = "Rectangle";
	    for (var i = 0; i < Editor.selected_segments.length; i++){
		var seg = Editor.selected_segments[i];
		seg.render();
	    }
	    Editor.clear_selected_segments();
	    RenderManager.render();
	    
	    if (Keyboard.panel.style.display == "none") {
		Keyboard.panel.style.display = "block";
		Keyboard.stopTimer();
		Keyboard.buttonDown();
	    }
	}
	Editor.button_states[Buttons.Key].setTouched(true);
    }, false);
    Keyboard.button.addEventListener("touchend", function(e){
	if (Editor.using_mobile){
	    Keyboard.stopTimer();
	    Keyboard.buttonUp();
	}
	Editor.button_states[Buttons.Key].setTouched(false);
    }, false);
    
    Keyboard.keyboard = document.getElementById("keyboard");
    Keyboard.buildKeyboard();
}

Keyboard.buildKeyboard = function() {
    var cdiv = "div";
    var width = null;
    var xmldoc = loadFileXml(Editor.keyboard);
    var segments = xmldoc.getElementsByTagName("segments");
    for (var i = 0; i < segments.length; i++) {
	var symbol = segments[i].getElementsByTagName("group")[0].getAttribute("symbol")
	var divtag = document.createElement(cdiv);
	var percent_witdh = 100/segments.length;
	divtag.innerHTML = symbol;
	divtag.setAttribute("id", "key" + i);
	divtag.setAttribute("index", i);
	divtag.style.width = percent_witdh + "%";
	divtag.style.marginLeft = percent_witdh * i + "%";
	divtag.style.textAlign = "center";
	divtag.style.display = "table-cell";
	divtag.style.verticalAlign = "middle";
	divtag.style.borderLeft = "1px solid #CAFF70";
	if (i == segments.length - 1)
	    divtag.style.borderRight = "1px solid #CAFF70";
	divtag.style.cursor = "pointer";
	if (Editor.using_mobile)
	    divtag.addEventListener("touchstart", Keyboard.SelectSymbol, false);
	else
	    divtag.addEventListener("mousedown", Keyboard.SelectSymbol, false);
	Keyboard.keyboard.appendChild(divtag);
    }
}

Keyboard.SelectSymbol = function(e) {
    Keyboard.currentId = e.currentTarget.id;
    Keyboard.currentIndex = Keyboard.currentId;
    Keyboard.currentIndex = Keyboard.currentIndex.replace("key", "");
    Keyboard.currentIndex = parseInt(Keyboard.currentIndex);
    Keyboard.isKeyboard = true;
    document.getElementById(Keyboard.currentId).style.background = "red";

}

Keyboard.onUp = function(e) {
    var offsetCanvas = ResizeTo.height_canvas;
    var pos = new Vector2(0, 0);
    if (Editor.using_mobile) {
	if (Editor.Exercises.change_layout){
	    if (Editor.mouse_position_first.y < Editor.mouse_position_second.y) 
	    {
	    	pos = Editor.mouse_position_second;

	    }
	    else if (Editor.mouse_position_first.y < Editor.mouse_position_second.y) 
	    {
	    	pos = Editor.mouse_position_first;
	    }
	}
	else {
	    if (Editor.mouse_position_first.x > Editor.mouse_position_second.x) pos = Editor.mouse_position_second;
	    else if (Editor.mouse_position_first.x < Editor.mouse_position_second.x) pos = Editor.mouse_position_first;
		}
    	} else {
		pos = Editor.mouse_position;
    }
    if (offsetCanvas - 40 >= pos.y) {
	Keyboard.onDraw();
    }
    Keyboard.isKeyboard = false;
    document.getElementById(Keyboard.currentId).style.background = "#8FBC8F";

}
Keyboard.onDraw = function()
{
    var xmlDoc = loadFileXml(Editor.keyboard);
    LoadXML(xmlDoc, Keyboard.currentIndex, Keyboard.ArrExpression, Keyboard.data_segment);
}

Keyboard.buttonDown = function(){
	
    Keyboard.opacity += 2;
    Keyboard.panel.style.opacity = Keyboard.opacity/10;
    //Keyboard.top=97;
    console.log(Keyboard.top);
    Keyboard.height += 1;
    Keyboard.top -= 1;
    Keyboard.panel.style.top = Keyboard.calTop() + "%";
    
    Keyboard.panel.style.height = Keyboard.height + "%";
    Keyboard.height_keypanel = 8;
    console.log('keyboard.height: ' +Keyboard.height);
    
   /* if (Keyboard.height == 4)
	document.getElementById("infobar-wrapper").style.visibility = "hidden";*/
	
	if(Editor.is_iphone)
	{
		if(islandscape())
		{
		Keyboard.height_keypanel=6;	
		}
		else
		{
		Keyboard.height_keypanel=8;		
		}
		
	}
	
    if (Keyboard.height == Keyboard.height_keypanel) {
	Keyboard.stopTimer();
	Keyboard.opacity = 10;
	Keyboard.panel.style.opacity = Keyboard.opacity/10;
    } else {
	Keyboard.time_current = setTimeout("Keyboard.buttonDown();", 50);
    }
}
Keyboard.calTop =function()
{
	var content = document.getElementById("show-content");
	var height_4 = document.getElementById("footer").offsetHeight;
	var footer  =height_4*100/(content.offsetHeight );
	if(Editor.is_iphone){

		$('#panelkey #label').css('display','none');
		if(islandscape())
		{
			return	Keyboard.top = (94-footer);
		}
		else
		{
			return	Keyboard.top = (92-footer);
		}

	
	}
	else
	{
	return	Keyboard.top = (92-footer);
	}
}

Keyboard.buttonUp = function(){
    Keyboard.opacity -= 2;
    Keyboard.panel.style.opacity = Keyboard.opacity/10;
    Keyboard.height -= 1;
    Keyboard.top += 1;
    Keyboard.panel.style.height = Keyboard.height + "%"
    Keyboard.panel.style.top = Keyboard.top + "%";
/*  if (Keyboard.height == 1)
	document.getElementById("infobar-wrapper").style.visibility = "hidden";*/
    if (Keyboard.height == 0) {
	Keyboard.stopTimer();
	Keyboard.opacity = 0;
	Keyboard.panel.style.opacity = Keyboard.opacity/10;
	Keyboard.panel.style.display = "none";
	setTimeout(function(){
	    Editor.checkScroll = true;
	}, 500);
	
    } else {
	Keyboard.time_current = setTimeout("Keyboard.buttonUp();", 50);
    }
    Editor.clearButtonOverlays();
    Editor.button_states[Buttons.Key].setEnabled(true);
    Editor.button_states[Buttons.Key].setTouched(false);
}

Keyboard.stopTimer = function () {
    clearTimeout(Keyboard.time_current);
    Keyboard.time_on = 0;
}
