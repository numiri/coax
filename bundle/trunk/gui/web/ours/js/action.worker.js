var worker = new Worker("js/worker.js");

var current = {
    str: null,
    instance_id: null,
    set_id: null,
    index: null
};

worker.onmessage = function(e) {
    var obj = e.data;
    alert(obj);
    //return;
    /*var str = obj.str;
    var instance_id = obj.instance_id;
    var set_id = obj.set_id;
    var index = obj.index;
    
    console.log("return string: " + obj.str);
    
    var xmldoc = new DOMParser().parseFromString(obj.str, "text/xml");
    var result_list = xmldoc.getElementsByTagName("RecognitionResults");
    var recognition = new RecognitionResult();
    
    recognition.fromXML(result_list[0]);
    recognition.instance_ids.push(instance_id);
    recognition.set_id = set_id;
    RecognitionManager.result_table.push(recognition);

    var symbol = recognition.symbols[0];
    
    Gestures.TouchEnd(Editor.segments[index], recognition.symbols[0], recognition);
    Editor.segments[index].symbol = symbol;
    Editor.segments[index].status = false;
    Editor.segments[index].flag = false;
    Editor.segments[index].isDraff = false;
    
    RenderManager.render();*/
};

function startWorker() {
    worker.postMessage(current);
};