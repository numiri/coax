//importScripts('../js/jquery.js')
var obj;
self.onmessage = function(e) {
    var global;
    try {
	global = window
    } catch (e) {
	global = self
    }
    return;
    //self.postMessage(String(global.location));
    //return;
/*obj = e.data;
    if (obj == undefined)
	return;
    var current = {
	str: null,
	instance_id: null,
	set_id: null,
	index: null
    };
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    current.str = xmlhttp.responseText;
	    current.instance_id = obj.instance_id;
	    current.set_id = obj.set_id;
	    current.index = obj.index;
	    self.postMessage(current);
	    //self.postMessage("sdfsdf");
	}
    }
    xmlhttp.open("GET", obj.str, true);
    xmlhttp.send();*/
}