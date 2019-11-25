/*
Print object 
    for (test = 0;test<arrSegs.length;test++) {
    
    for(var key in arrSegs[test]) {
        rcl.debug(key + ': \n' + arrSegs[test][key]);
    }
    }
*/
function MyScript() {

}
MyScript.selectExercise = false;
MyScript.prev = null;
MyScript.current = null;
MyScript.Sys = null; //SysEquations = Sys
MyScript.Index = 0; //Index is Sys
MyScript.endSys = false;
MyScript.latexs = "";
MyScript.tex_math = null;
MyScript.initMyScript = function() {
MyScript.prev = new Array();
MyScript.current = new Array();
MyScript.Sys = new Array();
MyScript.Index = 0;
//MyScript.endSys = true;//ddo 131011
MyScript.latexs = "";
MyScript.tex_math = new StringBuilder();
}


MyScript.Autogroup = function()                                                {
    //alert("autogroup");
    var segs = Editor.segments;
    MyScript.getLatext(segs);                                                  }


// ham xu ly nhung dau tru viet lien tiep nhau 
MyScript.dashs = function(in_segs)                                             {
    try                                                                        {
        rcl.debug("MyScript.dashs " + in_segs.length);
        var dashs = new Array();
        in_segs = Gestures.SortInstance_id(in_segs);

        for (var k = 0; k < in_segs.length; k++)                               {
            seg = in_segs[k];
            if (seg.autoGroup == false &&
                (seg.symbol == "-" || seg.symbol == "_dash"))                  {
                dashs.push(seg);
                if (dashs.length == 2)                                         {
                    in_segs[k - 1].autoGroup = true;
                    dashs[0] = dashs[1];
                    dashs.pop();
                                                                               }}
             else                                                              {
                dashs = new Array();
                                                                               }}}
    catch (e)                                                                  {
        console.error("MyScript.dashs exception " + e);                            }
}
//end by ptran 03/10/2012
MyScript.getRenderMathJax = function(latexs)                                   {
    var latext = " \\begin{align} ";
    for (var i = 0; i < latexs.length; i++)                                    {
        var s = latexs[i];
        latext = latext + s.replace("$", "");
        if (i < latexs.length - 1) latext = latext + " \\\\ ";
                                                                               }
    latext = latext + " \\end{align}";
    //console.log("select latex " + latext); rm by ddo 131113
    //UpdateMath(String(latext));
    Editor.updateMathFont(String(latext)); 
}

MyScript.SysEquations = function(tupe)                                         {
    var arr = MyScript.current;
    console.log("MyScript.SysEquations, arr= " + arr);
    MyScript.initMyScript();
    console.log("MyScript.SysEquations, arr= " + arr);
    if (arr == null || arr == undefined)                                       {
        for (var i = 0; i < SysEquations.Expressions.length; i++)              {
            MyScript.prev.push("");
                                                                               }}
    else                                                                       {
        for (var i = 0; i < arr.length; i++)                                   {
            MyScript.prev.push(arr[i]);
                                                                               }}
    MyScript.latexs = " \\begin{align} ";
    //var tex_math = new StringBuilder();
    //MyScript.tex_math = new StringBuilder();
    MyScript.Index = 0;
    //debugger;
    
    
    MyScript.Sys = SysEquations.Expressions;
    var l = 0;
    MyScript.Index++;
    
    MyScript.current = new Array();
    
   
        if (SysEquations.Expressions.length==1){
            MyScript.endSys=true;
        }
        else{
            MyScript.endSys=false;
        }
        var segs = MyScript.Sys[l];
        
        
        
        MyScript.renderMathJax(segs);                       
    
    
}

MyScript.SysEqua = function(i)                                                 { 
    console.log(i +"/ MyScript.Sys.length=" +  MyScript.Sys.length);

    console.log("SysEquations.Expressions.length= "+ SysEquations.Expressions.length);
    MyScript.Index++;
    if (MyScript.Sys.length==MyScript.Index){
        MyScript.endSys=true;
    }
    

    if (i < MyScript.Sys.length)                                               {
        var segs = MyScript.Sys[i];
        console.log("Calling  MyScript.renderMathJax(segs); segs= "+segs );
        MyScript.renderMathJax(segs);                                          }
    
}
MyScript.renderMathJax = function(mySegments)                                  {
    var latext = "";
    var j = 0;
    arrSegs = new Array();
    var segs = Gestures.Sort(mySegments);
    var sbLatex = new StringBuilder();
    sbLatex.append("<SegmentList>");
    for (var k = 0; k < segs.length; k++)                                      {
        segs[k].autoGroup = true;
        sbLatex.append(segs[k].toXML());                                       }
    sbLatex.append("</SegmentList>");
    arrSegs = segs;
    var resultLatexXML = "";
    try                                                                        {
        //callNativePlugin('getLatexFull@' + sbLatex.toString());
        Cordova.exec( MyScript.getLatexFull
                ,   nativePluginErrorHandler ,"callMyScriptPlugin"
                ,   "latexOf", [sbLatex.toString()] ); //a
    }
    catch (e)                                                                  {
        alert("Can't call MyScript");
                                                                               }
    return latext;
}

MyScript.getLatexFull = function(resultLatexXML)                               {
    //resultLatexXML = resultLatexXML.split("@")[1];
    console.log( "start getLatexFull()" + resultLatexXML ); //snguyen
    


    var latextFull = "";
    var seg = arrSegs;

    if (resultLatexXML == "" || resultLatexXML == undefined) return;
    console.log("resultLatexXML : " + resultLatexXML);
    var i, j;
    var resultLatex = "";
    var xmldoc = new DOMParser().parseFromString(resultLatexXML, "text/xml");
    var latext_List = xmldoc.getElementsByTagName("Result");
    var segmentsNodes = xmldoc.getElementsByTagName("segment");
    // get latex
    if (latext_List != null)                                                   {
        console.log("latext_List : " + latext_List.length);
        for (j = 0; j < latext_List.length; j++)                               {
            try                                                                {
                resultLatex = String(latext_List[j].attributes["latex"]
                                     .nodeValue);
                console.log("Result latex = " + resultLatex);                  }
            catch (e)                                                          {
                                                                               }}} 
    //replace symbol
    resultLatex = resultLatex.replace("dfrac", "frac");
    resultLatex = resultLatex.replace("\\left", "").replace("\\right", "");
    latexFull = resultLatex;
    console.log("resultLatex ddo : " + resultLatex);
    
        
    
    var arrSetId = new Array();
    if (segmentsNodes != null)                                                 {
        for (j = 0; j < segmentsNodes.length; j++)                             {
            var symbol = String(segmentsNodes[j].attributes["symbol"]
            .   nodeValue);
            var NumberSeg = String(segmentsNodes[j].attributes["NumberSeg"]
            .   nodeValue);
            var IndexS = String(segmentsNodes[j]
                                .attributes["index"]
                                .nodeValue);
            var number = parseInt(NumberSeg);
            var arr = IndexS.split(",");
            var t = -1;
            //console.log("IndexS="+IndexS +" | symbol="+ symbol+"| NumberSeg= " + NumberSeg);
            if (number == 1) {
                if (Editor.symbols.contains(symbol))                           {
                    try {
                        t = parseInt(arr[0]);                                  }
                    catch (e)                                                  {
                        t = -1;                                                }
                    if (t == -1) continue;
                    var recognition = null;
                    recognition = RecognitionManager.getRecognition(arrSegs[t]
                                                    .set_id);
                    recognition.symbols[0] = symbol;
                    arrSegs[t].symbol = symbol;                                }}}} 
    
    try                                                                        {
        var latext = " \\begin{align} ";
        var s = latexFull.replace("dfrac", "frac");
        s = s.replace("\\dfrac", "\\frac");
        MyScript.latexs = MyScript.latexs + s;
        MyScript.current.push(s);
        MyScript.tex_math.append("$" + s + "$");
        

        if (MyScript.endSys)                                                   {
            latext = latext + s;
            latext = latext + " \\end{align}";
            MyScript.latexs = MyScript.latexs + " \\end{align}";
            document.getElementById("tex_result").innerHTML = MyScript
                                                            .tex_math
                                                            .toString();
            try                                                                {
                //UpdateMath(String(latext));    
                console.log("UpdateMathFont :" + latext);  
                //alert(latext);                              
                 Editor.updateMathFont(MyScript.tex_math.toString());                        }
            catch (ex)                                                         {
                console.log("UpdateMath exception " + ex);
                sendLogToServer(Exercises.id_default, "mathjax : "
                                + MyScript.latexs, ex);
                                                                               }

            var sb = new StringBuilder();

            SysEquations.BuildTupe(SysEquations.Expressions);
            sb.append(SysEquations.string.toString());
            console.log("Calling MyScript.align(sb);");
            MyScript.align(sb);                                                }
        else                                                                   {
            MyScript.latexs = MyScript.latexs + " \\\\ ";
            console.log("Calling MyScript.SysEqua(MyScript.Index) | Index=" + MyScript.Index);
            MyScript.SysEqua(MyScript.Index);
                                                                               }}
    catch (e)                                                                  {
        alert("Mathjax Exception :  " + e);                                    }

} //end MyScript.getLatextFull

var arrSegs; //add by ddo
var segs; //add by ddo
MyScript.getLatext = function(mySegments)                                      {

    try                                                                        {
        var temp = "";
        var j = 0;
        var k = 0;

        Editor.count_autoGroups = 0;
        if (mySegments == "undefined" || mySegments == null) return;

        //MyScript.frac(mySegments);
        MyScript.dashs(mySegments); 

        segs = mySegments; // edit by ddo  was : var segs = mySegments;

        if (segs.length == 0) return;
        //by ptran 03/10/2012
        segs = Gestures.SortInstance_id(mySegments); 
        j = 0;
        var i = -1; //segs
        for (j = segs.length - 1; j >= 0; j--)                                 {
            var seg = segs[j];
            if (seg.autoGroup == true)                                         {
                i = j;
                break;
                                                                               }} 
        for (j = i; j >= 0; j--)                                               {
            var seg = segs[j];
            seg.autoGroup = true;                                              }

        //end by ptran 03/10/2012
        //segs = Gestures.SortInstance_id(segs);//Gestures.SortInstance_id
        arrSegs = new Array(); //edit by ddo was : var arrSegs = new Array();
        var symbol = "";
        //xet truong hop chua co stroke nao duoc autogroup
        var countCheck = 0;
        for (j = 0; j < segs.length; j++)                                      {
            if (segs[j].autoGroup == false)                                    {
                countCheck++;
                arrSegs.push(segs[j]);
                if (countCheck == 2) break;                                    }} 


        if (arrSegs.length < 2)                                                {
            AutoGroup.Groups();
            return;                                                            }
        //tao cau truc XML goi cho myScript xu ly autoGroup 2 stroke
        var sbLatex = new StringBuilder();
        sbLatex.append("<SegmentList>");
        for (j = 0; j < arrSegs.length; j++)                                   {
            symbol = symbol + " , " + arrSegs[j].symbol;
            sbLatex.append(arrSegs[j].toXML());                                }
        sbLatex.append("</SegmentList>");                                      }
    catch (e)                                                                  {
        rcl.error("Build SegmentList exception " + e);                         }

    var resultLatex = "";
    var resultLatexXML = "";
    try                                                                        {
        //alert("---callNativePlugin ");
        //callNativePlugin('getLatex@' + sbLatex.toString());
        Cordova.exec( MyScript.processlatex
                ,   nativePluginErrorHandler ,"callMyScriptPlugin"
                ,   "latexOf", [sbLatex.toString()] );
        
        }
    catch (e)                                                                  {
        rcl.error("callNativePlugin exeption " + e);                            }
}

MyScript.changeSymbols = function(symbol, latexFull)                           {
    var s_symbol;
    try                                                                        {
        s_symbol = symbol;
        switch (symbol) {
        case "+":                                                              {
                s_symbol = "_plus";
                break;                                                         }
        case "=":                                                              {
                s_symbol = "_equal";
                break;                                                         }
        case "‚":                                                              {
                var index = latexFull.indexOf("sqrt");
                s_symbol = index >= 0 ? "sqrt" : symbol;
                break;                                                         }
        case "¬":                                                              {
                s_symbol = "pm";
                break;                                                         }}}
    catch (e)                                                                  {
        alert("MyScript.changeSymbols exception " + e);                        }
    return s_symbol;

}
MyScript.processlatex = function(resultLatexXML)                               {

//resultLatexXML = resultLatexXML.split("@")[1];//only napl use for compatible with previous version.


    try                                                                        {

        rcl.info("Length arrSegs in MyScript.processlatex " + arrSegs.length);
        if (resultLatexXML == "") return;
        var xmldoc = new DOMParser()
                        .parseFromString(resultLatexXML, "text/xml");
        var latext_List = xmldoc.getElementsByTagName("Result");
        var segmentsNodes = xmldoc.getElementsByTagName("segment");
        var i = 0;
        if (latext_List != null)                                               {
            for (i = 0; i < latext_List.length; i++)                           {
                resultLatex = String(latext_List[i]
                                     .attributes["latex"]
                                     .nodeValue);
                                                                               }}
        var bCheckIsSetId = true;
        var s_bol = "";
        if (segmentsNodes != null)                                             {
            for (i = 0; i < segmentsNodes.length; i++)                         {
                symbol = String(segmentsNodes[i]
                                .attributes["symbol"]
                                .nodeValue);
                symbol = MyScript.changeSymbols(symbol, resultLatex);
                s_bol = symbol;
                var NumberSeg = String(segmentsNodes[i]
                                       .attributes["NumberSeg"]
                                       .nodeValue);
                var IndexS = String(segmentsNodes[i]
                                    .attributes["index"]
                                    .nodeValue);
                var number = parseInt(NumberSeg);
                var arr = IndexS.split(",");
                rcl.info("symbol : " + symbol
                         + " numberSeg : " + NumberSeg + " IndexS:"
                         + IndexS + " latex " + resultLatex);

                var t = 0;
                arrSegs[0].autoGroup = true;

                if (number >= 2)                                               {
                    symbol = MyScript.changeSymbols(resultLatex, resultLatex);

                    if (!Editor.autoGroupSymbols.contains(symbol))             {
                        continue;                                              }

                    if (!AutoGroupCheck.shouldGroup(arrSegs[0],arrSegs[1]
                                                    , symbol))                 {
                        continue;                                              }
                    if (symbol == "-" || symbol == "_dash")                    {
                        continue;                                              }

                    var g = new AutoGroup(0);
                    bCheckIsSetId = true;
                    var setId = 0;

                    for (j = 0; j < arr.length; j++)                           {
                        t = parseInt(arr[j]);
                        arrSegs[t].autoGroup = true;
                      if (j > 0)                                               {
                      if (bCheckIsSetId)                                       {
                        if (setId != arrSegs[t].set_id) bCheckIsSetId = false;
                                                                               }}

                        arrSegs[t].flag = true;

                        setId = arrSegs[t].set_id;

                        g.Add(arrSegs[t]);
                        
                        }
                        if (g.segments.length >= 2 && !bCheckIsSetId)          {
                        g.AddSymbols(new Array(symbol, s_bol)); 

        //rm by ddo 130826 Formula.Copy(g.segments, g.symbols, g.certainties, true);

                        Formula.Copy(g.segments, g.symbols, g.cer, true);      }}
                    else if (number == 1)                                      {
                    var index = resultLatex.indexOf("sqrt");
                    var recognition = null;
                    // RecognitionManager.getRecognition(arrSegs[t].set_id);
                    var temp = null;
                    if (index > -1)                                            {
                        if (arrSegs[0].lec().x < arrSegs[1].lec().x)           {
                            temp = arrSegs[0];                                 }
                        else                                                   {
                            temp = arrSegs[1];                                 }
                        recognition = RecognitionManager
                                        .getRecognition(temp.set_id);
                        recognition.symbols[0] = "sqrt";
                        temp.symbol = "sqrt";                                  }}}} 

        //AutoGroup.Groups();                                                    }
    }catch (e)                                                              {
        alert("MyScript.processlatex exception :" + e);                        }
}

var errorMsgCAS = "";
MyScript.align = function(sb) {
console.log("Begin MyScript.align");
console.log(" Submit : " + sb.toString());
try                                                                            {
    var geturl;
    if (SysEquations.Flag == true)                                             {
    Exercises.userInputPostion = Exercises.userInputPostion + 1;
    Editor.ajaxLoader("visible");
    geturl = $.ajax({
        url: Editor.align_server_url + sb.toString(),
        success: function(in_data, textStatus, xmlhttp)                        {
            if (String(geturl.getResponseHeader("content-type"))
                .search("text/html") == 0) {
                // window.location.href = Editor.login_server_url;
                //return;
                                                                               }
            console.log(" indata " + xmlhttp.responseText);
            in_data = xmlhttp.responseText;
            if (in_data == "" || in_data == undefined)                         {
                Editor.ajaxLoader("hidden");
                return;                                                        }
            var new_dimensions = new Array();
            var parents = new Array();
            var arr_latex = new Array();
            var xmldoc = new DOMParser().parseFromString(in_data, "text/xml");
            var rst_nodes = xmldoc.getElementsByTagName("AlignResponse");

            errorMsgCAS = rst_nodes[0].attributes["error"].nodeValue;
            if (errorMsgCAS != "")                                             {
                //alert("CAS Exception" + errorMsgCAS);
                Editor.ajaxLoader("hidden");                                   }
            var tex_nodes = xmldoc.getElementsByTagName("SegmentList");
            var exer_nodes = xmldoc.getElementsByTagName("exerciseStep"); 
            var active_nodes = xmldoc.getElementsByTagName("activemath");
            var image_nodes = new Array('data:image/png;base64');
            var segment_nodes = xmldoc.getElementsByTagName("Segment");
            var maxima_nodes = xmldoc.getElementsByTagName("maxima");
             console.log("active_nodes.length =" + active_nodes.length );
            
            //if (active_nodes != null && Editor.mod_history)
            if (active_nodes.length > 0  && Editor.mod_history)  //ddo 131011
            {
                console.log("khac null " + exer_nodes.length);
                //for (var iAc = 0; iAc < exer_nodes.length; iAc++) {
                var description = active_nodes[0]
                                .attributes["description"]
                                .nodeValue;
                console.log("description Activemath " + description);
                var hint = active_nodes[0].attributes["hint"].nodeValue;
                console.log("description hint " + hint);
                document.getElementById("description").innerHTML = description
                                                                    .toString();
                var mess = active_nodes[0].attributes["message"].nodeValue; 
                //if(hint !="")
                document.getElementById("lhint").innerHTML = hint.toString()
                                                            + String(mess);
                var isfinishAc = active_nodes[0].attributes["isfinish"].nodeValue;
                Exercises.title = String(active_nodes[0]
                                .attributes["title"]
                                .nodeValue);
                if (isfinishAc == "true") {
                    //HistorySegments.is_finish = true;
                }
                //}
            }
            Editor.hint = false;
            var tmpMaxima = new Array();
            if (tex_nodes.length != 0)                                         {
                var tex_math = new StringBuilder();
                for (var i = 0; i < tex_nodes.length; i++)                     {
                    tex_math.append("$");
                    var tex_string = tex_nodes[i]
                                        .attributes["TexString"]
                                        .nodeValue;
                    var variable = "";
                    try { variable = tex_nodes[i].attributes["variable"].nodeValue; }
                    catch (e)                                                  {}
                    SysEquations.s_variable = variable;
                    tex_string = tex_string.replace(/\s{1,}/gm, ""); //trim
                    tex_string = tex_string.match(/(\$.*\$)/g)[0]; //lay chuoi latex
                    tex_string = tex_string.replace(/\$/gm, ""); //khu het dau $
                    tex_math.append(tex_string);
                    //arr_latex.push(tex_string);
                    tex_math.append("$");
                    tmpMaxima[i] = "$" + tex_string + "$";
                                                                               }
                arr_latex = MyScript.current;                                  }
            //<<<<<<<<< Make gestures fence
            for (var k = 0; k < segment_nodes.length; k++)                     {
                var attributes = segment_nodes[k].attributes;
                var t = new Tuple();
                t.item1 = parseInt(attributes.getNamedItem("id").value);
                t.item2 = parseVector2(attributes.getNamedItem("min").value);
                t.item3 = parseVector2(attributes.getNamedItem("max").value)
                new_dimensions.push(t);
                for (var l = 0; l < coverIds.length; l++)                      {
                    var tId = null;
                    var parentid = null;
                    var id = null;
                    tId = coverIds[l];
                    parentid = parseInt(tId.item1);
                    id = parseInt(tId.item2);
                    if (t.item1 == id)                                         {
                        var rst = Editor.updateMinMaxCoverItem(parentid, id
                                    , t.item2.toString()
                                    , t.item3.toString());
                        if (rst != null)                                       {
                            parents.push(rst);                                 }}}}

            for (var i = 0; i < parents.length; i++)                           {
                var t = parents[i];                                            }
            //thay the latex tien hanh tai day tuong uong voi cac ki tu xuat
            //hien trong latex tra ve _heart = latex tuong ung.
            var laxtex = document.getElementById("tex_result").innerHTML;
            for (var i = 0; i < parents.length; i++)                           {
                var sLaxtex = null;
                var t = null;
                var sSymbolText = null;
                t = parents[i];
                sLaxtex = t.item5;
                var sSymbolText = t.item1.symbols[0];
                laxtex = laxtex.replace(sSymbolText, sLaxtex);                 }
            //laxtex = laxtex.replace(/\s{1,}/gm, "");
            //document.getElementById("tex_result").innerHTML = laxtex;
            //<<<<<<<<< End
/*
        var result = Editor.parseAlignResult( xmlhttp.responseText );
         HistorySegments.check_step = (result.stringToBoolean == "true") ? true : false;
*/

            console.log("begin history process ");
            //var stringToBoolean = exer_nodes[0].attributes["istrue"].nodeValue;
             var stringToBoolean = rst_nodes[0].attributes["result"].nodeValue;
            HistorySegments.check_step = (stringToBoolean == "1") ? true : false;
            if (String(exer_nodes[0]
                       .attributes["isfinish"]
                       .nodeValue) == "true") {
                HistorySegments.is_finish = true;                              }
            HistorySegments.TableList(arr_latex
                            , image_nodes
                            , exer_nodes[0].attributes["message"].nodeValue);
            //if (rst_nodes.length > 0) {
            HistorySegments.currMaxima = tmpMaxima;
            console.log("HistorySegments.height_node "
                        + HistorySegments.height_node);
            //continue  ddo131122 ......
            try{
            if (Editor.mod_history)                                            {
                console.debug("HistorySegments.check_step = " + HistorySegments.check_step);
                if (HistorySegments.check_step)                                {
                    Exercises.NodeMaxima = Exercises.NotificationMaxima("green"
                                        , HistorySegments.height_node);
                    console.debug("ok1");
                    var root = new StringBuilder();
                    root.append("<root>");
                    root.append(HistorySegments.stringXml)
                        .append("<color>").append("green")
                        .append("</color>");
                    root.append("</root>");                                    }
                else                                                           {
                    console.debug("ok2");
                    Exercises.NodeMaxima = Exercises.NotificationMaxima("red"
                                        , HistorySegments.height_node);
                    var root = new StringBuilder();
                    root.append("<root>");
                    root.append(HistorySegments.stringXml)
                        .append("<color>")
                        .append("red")
                        .append("</color>");
                    root.append("</root>");
                                                                               }
                //console.log("Calling HistorySegments.sendData");
                //HistorySegments.sendData(String(root), true);                  
                                                                                }
                else                                                           {
                if (parseInt(rst_nodes[0].attributes["result"].nodeValue) == 1){
                    Exercises.NodeMaxima = Exercises.NotificationMaxima("green"
                                            , HistorySegments.height_node);
                    console.debug("ok3");
                    if (HistorySegments.countalign == 1)                       {
                        HistorySegments.check_delete = false;
                        HistorySegments.UpdateReAlign("green",
                                                    HistorySegments.index);
                        Exercises.from_step = HistorySegments.index;
                        var id_his = HistorySegments.in_id;
                        LogXML.GroupLog(SettingsMenu.user, Exercises.id_default
                        ,  Exercises.id_select, id_his, Exercises.from_step
                        ,  ++Exercises.to_step, 2, laxtex, image_nodes);       }
                    var root = new StringBuilder();
                    root.append("<root>");
                    root.append(HistorySegments.stringXml)
                        .append("<color>").append("green")
                        .append("</color>");
                    root.append("</root>");                                    }
                    else                                                       {
                    console.debug("ok4");
                    Exercises.NodeMaxima = Exercises.NotificationMaxima("red"
                                        , HistorySegments.height_node);
                    if (HistorySegments.countalign == 1)                       {
                        HistorySegments.check_delete = false;
                        HistorySegments.UpdateReAlign("red"
                                                      , HistorySegments.index);
                        Exercises.from_step = HistorySegments.index;
                        var id_his = HistorySegments.in_id;
                        LogXML.GroupLog(SettingsMenu.user, Exercises.id_default
                        , Exercises.id_select, id_his, Exercises.from_step
						, ++Exercises.to_step, 2, laxtex, image_nodes);        }
                    var root = new StringBuilder();
                    root.append("<root>");
                    root.append(HistorySegments.stringXml)
                        .append("<color>").append("red")
                        .append("</color>");
                    root.append("</root>");                                    }
                HistorySegments.sendData(String(root), false);
                HistorySegments.check_delete = false;                          }
            //}
        }catch(e){
            console.debug("Exception myScript.js --> if (Editor.mod_history)" + e);}

            HistorySegments.set_action = false;
            Editor.ajaxLoader("hidden");
                                                                               },
        error: function(jqXHR, textStatus, errorThrown)                        {
            alert("errorThrown :" + errorThrown);
            Editor.ajaxLoader("hidden");
                                                                               },
        cache: false                                                           });
            Editor.button_states[Buttons.Command].setTouched(false);           }}
        catch (err)                                                            {
        alert("---errorMsgCAS:" + errorMsgCAS);
        Editor.ajaxLoader("hidden");                                           }
}

