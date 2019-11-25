HistorySegments = function(in_segments, flag, nameSegment) {
    this.segments = new Array();
    this.backup_scale = new Array();
    this.backup_translation = new Array();
    this.points_his = new Array();
    this.list_points = new Array();
    this.scalezoom = new Array();

    this.new_scale = new Array();
    this.new_translation = new Array();
    this.previous_set = new Array();

    for (var k = 0; k < in_segments.length; k++) {
        var segment = in_segments[k];
        this.segments.push(segment);
        this.backup_scale.push(segment.scale.clone());
        this.backup_translation.push(segment.translation.clone());
        this.previous_set.push(segment.set_id);
    }

    this.frames = 0.0;
    this.start_time = 0;
    this.undoing = true;
    this.should_keep = false;
    this.status = flag;
    this.nameSegment = nameSegment;
    this.id = -1;
    this.permision_edit = true;
}

HistorySegments.prototype = {

    Flag: function() {
        return this.status;
    },

    //<<<<<get points
    HisPoints: function() {
        var temp_points = new Array();
        for (var i = 0; i < this.segments.length; i++) {
            var seg = this.segments[i];
            var points = seg.points;
            for (var k = 0; k < points.length; k++) {
                var x = points[k].x;
                var y = points[k].y;
                var characters;
                if (k == 0) characters = "M";
                else
                    characters = "L";
                var newpoint = new Vector2(x, y);
                var str = characters + newpoint.toString();
                temp_points.push(points[k]);
            }
            var sb = new StringBuilder();
            for (var l = 0; l < temp_points.length; l++) {
                sb.append(temp_points[l] + " ");
            }
            //console.log("Tess " + sb.toString());
            var temp_points = new Array();
            this.points_his.push(sb);
            this.list_points.push(this.points_his);
            this.points_his = new Array();

            var sb = new StringBuilder();
            sb.append("translate(");
            sb.append(seg.translation.x * 0.2 + "," + seg.translation.y * 0.2);
            sb.append(") scale(");
            sb.append(seg.scale.x * 0.2 + "," + seg.scale.y * 0.2);
            sb.append(")");
            this.scalezoom.push(sb.toString());
        }
    },

    //<<<<< save positions for each history
    add_new_transforms: function(in_segments) {
        if (in_segments.length != this.segments.length) {
            //console.log("add_new_transforms!");
            segment.render();
        }

        this.should_keep = true;

        for (var k = 0; k < in_segments.length; k++) {
            var segment = in_segments[k];
            this.new_scale.push(segment.scale.clone());
            this.new_translation.push(segment.translation.clone());
        }
    },

    //<<<<< restore positions of history selected
    rescale: function(elapsed, utc_ms) {
        var current_time = (new Date()).getTime();
        var delta = (current_time - utc_ms) / 1000.0;
        if (elapsed == 0.0) HistorySegments.current = this;
        var fraction = elapsed / HistorySegments.animation_length;
        if (fraction > 1.0) fraction = 1.0;
        if (this.undoing) {
            for (var j = 0; j < this.segments.length; j++) {
                var segment = this.segments[j];
                segment.scale.Set(Vector2.Add(this.new_scale[j], Vector2.Multiply(fraction, Vector2.Subtract(this.backup_scale[j], this.new_scale[j]))));
                segment.translation.Set(Vector2.Add(this.new_translation[j], Vector2.Multiply(fraction, Vector2.Subtract(this.backup_translation[j], this.new_translation[j]))));
                segment.update_extents();
                segment.render();
                
                var node = document.getElementById(String(segment.set_id));
                Gestures.doCircle(node, segment, segment.set_id);
                Gestures.updateSplit(segment, Editor.FindIndexSplitSegment(segment.set_id));
            }
        } else {
            for (var j = 0; j < this.segments.length; j++) {
                var segment = this.segments[j];
                segment.scale.Set(Vector2.Add(this.backup_scale[j], Vector2.Multiply(fraction, Vector2.Subtract(this.new_scale[j], this.backup_scale[j]))));
                segment.translation.Set(Vector2.Add(this.backup_translation[j], Vector2.Multiply(fraction, Vector2.Subtract(this.new_translation[j], this.backup_translation[j]))));
                segment.update_extents();
                segment.render();
                
                var node = document.getElementById(String(segment.set_id));
                Gestures.doCircle(node, segment, segment.set_id);
                Gestures.updateSplit(segment, Editor.FindIndexSplitSegment(segment.set_id));
            }
        }
        // set dirty flag
        for (var j = 0; j < this.segments.length; j++) {
            this.segments[j].dirty_flag = true;
        }
        Editor.update_selected_bb();
        RenderManager.render();
        this.frames++;
        if (fraction == 1.0) {
            // bail out
            var total_time = ((current_time - this.start_time) / 1000.0);
            HistorySegments.status = false;
            return;
        }
        var total_delta = ((new Date()).getTime() - utc_ms) / 1000.0;
        if (this.nameSegment == Editor.TransformSegments) {
            var sb = new StringBuilder();
            sb.append("HistorySegments.current.rescale(").append(String(elapsed + total_delta)).append(',').append((new Date()).getTime()).append(");");
            setTimeout(sb.toString());
        } else {
            var w = Editor.canvases[0].width;
            Editor.canvases[0].width = 1;
            Editor.canvases[0].width = w;
            SysEquations.SaveExpressions();
        }
    },

    //<<<<< show infor of history selected
    ShowElement: function() {
        for (var k = 0; k < this.segments.length; k++) {
            var segment = this.segments[k];
            if (segment.element != null) {
                segment.element.style.visibility = "visible";
                Editor.add_segment(segment);
                segment.set_id = this.previous_set[k];
            }
        }
        RenderManager.render();
    },

    UndoHistory: function() {
        this.framerate = 0.0;
        this.frames = 0.0;
        this.start_time = (new Date()).getTime();
        this.undoing = true;
        this.rescale(0.0, this.start_time);
        Gestures.restoreNode();
    },

    Undo: function() {
        console.log("undo " + this.nameSegment);
        this.framerate = 0.0;
        this.frames = 0.0;
        this.start_time = (new Date()).getTime();
        this.undoing = true;
        //this.UndoTransFence();
        this.rescale(0.0, this.start_time);

    },

    ResotreFlotom: function() {
        for (var k = 0; k < this.segments.length; k++) {
            var trans = Vector2.Subtract(this.backup_translation[k], this.new_translation[k]);
            var scale = this.backup_scale[k];
            this.segments[k].scale.Set(scale);
            this.segments[k].translate(trans);
            this.segments[k].update_extents();
        }
        Editor.update_selected_bb();
        RenderManager.render();
    },

    shouldKeep: function() {
        return this.should_keep;
        for (var k = 0; k < this.segments.length; k++) {
            var segment = this.segments[k];
            if (segment.scale.equals(this.backup_scale[k]) == false) return true;
            if (segment.translation.equals(this.backup_translation[k]) == false) return true;
        }
        return false;
    },

    Apply: function() {
        console.log("redo " + this.nameSegment);
        this.framerate = 0.0;
        this.frames = 0.0;
        this.start_time = (new Date()).getTime();
        this.undoing = false;
        this.rescale(0.0, this.start_time);

    //this.UndoTransFence();
    },

    toXML: function() {
        var sb = new StringBuilder();
        sb.append("<Action type=\"transform_segments\">").appendLine();
        for (var k = 0; k < this.segments.length; k++) {
            var segment = this.segments[k];
            sb.append("\t").append("<Transform instanceID=\"").append(String(segment.instance_id)).append("\" ");
            sb.append("scale=\"").append(this.new_scale[k].toString()).append("\" translation=\"").append(this.new_translation[k].toString()).append("\"/>");
            sb.appendLine();
        }
        sb.append("</Action>");
        return sb.toString();
    },

    toString: function() {
        return this.nameSegment;
    },
};

HistorySegments.animation_length = 0.25;
HistorySegments.list_segments = new Array();
HistorySegments.list_step_wrong = new Array();
HistorySegments.current_seg = new Array();
HistorySegments.preLatex = null;
HistorySegments.status = false;
HistorySegments.index = -1;
HistorySegments.block;
HistorySegments.current;
HistorySegments.current_index = -1;
HistorySegments.currMaxima = null;
HistorySegments.sum_height = 0;
HistorySegments.active = false;
HistorySegments.height_node = 0;
HistorySegments.myScroll;
HistorySegments.select_active = false;
HistorySegments.background_avtive = "ghostWhite";
HistorySegments.checkauto = false;
HistorySegments.countalign = 0;
HistorySegments.step = 0;
HistorySegments.count_child = 0;
HistorySegments.check_step = false;
HistorySegments.check_delete = false;
HistorySegments.in_id = -1;
HistorySegments.set_action = false;
HistorySegments.is_finish = false;
HistorySegments.stringXml = new StringBuilder();

HistorySegments.AddList = function(list_seg) {
    var list = new HistorySegments(list_seg);
    list.add_new_transforms(list_seg);
    HistorySegments.list_segments.push(list);
}

HistorySegments.EditHistory = function(list_seg, index) {
    var list = new HistorySegments(list_seg);
    list.add_new_transforms(list_seg);
    HistorySegments.list_segments.splice(index, 1, list);
}

HistorySegments.ActionHistory = function(index) {
    if (HistorySegments.list_segments.length > 0) {
        delete HistorySegments.current_seg;
        HistorySegments.current_seg = new Array();
        HistorySegments.current_seg = Editor.segments.clone();
        var action = new ActionSegments(HistorySegments.SegmentList(), true, Editor.DeleteSegments);
        action.Apply();
        if (HistorySegments.status == true) Editor.add_action(action);
        Editor.clear_selected_segments();
        RenderManager.render();
        //console.log("chieu dai bo " + HistorySegments.list_segments.length);
        // Show history segments
        HistorySegments.list_segments[index].ShowElement();
        HistorySegments.list_segments[index].UndoHistory();
        // Show images exercises
        var node_images = Exercises.ListImages[index];
        HistorySegments.SelectImages(node_images.arr_url, node_images.arr_latex, node_images.status);
        //HistorySegments.SelectImages(node_images.url, node_images.latex, node_images.status, node_images.isformula);
        if (index >= 1 && index < HistorySegments.list_segments.length - 1) {
            if (CopyPasteSegments.isCheck) {
                //HistorySegments.currMaxima  = HistorySegments.getLatex(Exercises.ListImages[index].arr_latex);
                HistorySegments.getMaxima(Exercises.ListImages[index].arr_latex);
            } else {
                //HistorySegments.currMaxima  = HistorySegments.getLatex(Exercises.ListImages[index - 1].arr_latex);
                HistorySegments.getMaxima(Exercises.ListImages[index - 1].arr_latex);
            }
        }
        Editor.translateCenter(HistorySegments.list_segments[index].segments);
    }
}

HistorySegments.getLatex = function(arr) {
    var text_latex = new StringBuilder();
    for (var i = 0; i < arr.length; i++) {
        text_latex.append("$");
        text_latex.append(arr[i]);
        text_latex.append("$");
    }
    return text_latex.toString();
}

HistorySegments.getMaxima = function(arr) {
    delete HistorySegments.currMaxima;
    HistorySegments.currMaxima = new Array();
    for (var i = 0; i < arr.length; i++) {
        var text_latex = new StringBuilder();
        text_latex.append("$");
        text_latex.append(arr[i]);
        text_latex.append("$");
        HistorySegments.currMaxima.push(text_latex.toString());
    }
    return HistorySegments.currMaxima;
}

HistorySegments.SelectImages = function(url, laxtex, status) {
    Exercises.getImages(url);
    var nodediv = document.getElementById("exer");
    var nodecent = document.getElementById("recExpr");
    var nodeimages = document.getElementById("exer_image0");
    HistorySegments.Default(nodecent.offsetHeight, nodediv.offsetHeight, nodeimages.offsetHeight, status, url);

    document.getElementById("tex_result").innerHTML = HistorySegments.getLatex(laxtex);
    nodediv.style.paddingBottom = 0 + "px";
    HistorySegments.countalign = 0;
}

HistorySegments.TableList = function(laxtex, image_nodes, msg) {
    if (Editor.segments.length == 0) return;
    if (HistorySegments.index < HistorySegments.list_segments.length - 1 || HistorySegments.checkauto) {
        // node history
        if (HistorySegments.index == 0)
            return;
        if (HistorySegments.countalign == 0) {
            if(Editor.mod_history && !HistorySegments.list_segments[HistorySegments.index].permision_edit)
                return;
            var id_his = HistorySegments.list_segments[HistorySegments.index].id;
            HistorySegments.sum_height -= HistorySegments.current_list.childNodes[HistorySegments.index].clientHeight;
            var tagNode = document.getElementById("itemhis" + HistorySegments.index);
            tagNode.removeChild(tagNode.firstChild);
            HistorySegments.CreateNode(HistorySegments.index, tagNode);
            HistorySegments.EditHistory(HistorySegments.SegmentList(), HistorySegments.index);
            HistorySegments.sum_height += HistorySegments.current_list.childNodes[HistorySegments.index].clientHeight;

            tagNode.parentNode.style.height = HistorySegments.height_node + "px";
            var top = HistorySegments.height_node;
            top = top - (top - 25) / 2;
            tagNode.nextSibling.style.marginTop = -top + "px";

            // node exercises
            var url = image_nodes;
            document.getElementById("recExpr").appendChild(Exercises.getImages(url));
            var action_status;
            var to_step;
	    
            if (!HistorySegments.check_delete) {
                action_status = 2;
                to_step = ++Exercises.to_step;
                HistorySegments.list_segments[HistorySegments.index].id = id_his;
            } else if (HistorySegments.check_delete) {
                action_status = 3;
                to_step = Exercises.to_step;
                HistorySegments.list_segments[HistorySegments.index].id = id_his;
                id_his = HistorySegments.in_id;
            }
	    
            Exercises.from_step = HistorySegments.index;
            LogXML.GroupLog(SettingsMenu.user, Exercises.id_default, Exercises.id_select, id_his, Exercises.from_step, to_step, action_status, document.getElementById("tex_result").innerHTML, url);
	    
            if (Editor.mod_history) {
                HistorySegments.list_segments[HistorySegments.index].list_step_wrong = false;
                Fractions.stopTimer();
                if (HistorySegments.check_step) {
                    HistorySegments.step++;
                    HistorySegments.count_child = 0;
                    tagNode.parentNode.style.marginLeft = "0px";
                    tagNode.parentNode.firstChild.innerHTML = HistorySegments.step + ". ";
                    document.getElementById("note").innerHTML = msg;
                    HistorySegments.check_delete = true;
                    tagNode.nextSibling.removeEventListener("click", HistorySegments.DeleteNode, true);
                }
            }
	    
            $("#exer_image0").load(function() {
                HistorySegments.SetPositionImages(true, url, laxtex, false);
                tagNode.parentNode.removeChild(tagNode.parentNode.lastChild);
                tagNode.parentNode.appendChild(Exercises.NodeMaxima);
                //re-align
                HistorySegments.ActionsReAlign(HistorySegments.index, HistorySegments.checkauto);
            }).error(function() {
                //url = "";
                HistorySegments.SetPositionImages(false, url, laxtex, false);
                tagNode.parentNode.removeChild(tagNode.parentNode.lastChild);
                tagNode.parentNode.appendChild(Exercises.NodeMaxima);
                //re-align
                HistorySegments.ActionsReAlign(HistorySegments.index, HistorySegments.checkauto);
            });
        }
    } else if (HistorySegments.index >= HistorySegments.list_segments.length - 1 && HistorySegments.countalign == 0) {
        // node history
        var divNode = document.createElement("div");
        HistorySegments.CreateNode(HistorySegments.list_segments.length, divNode);
        var div_root = document.createElement("div");
        div_root.setAttribute("class", "swipeR");
        div_root.style.height = HistorySegments.height_node + "px";
        div_root.addEventListener("click", HistorySegments.GetIndex, true);
        var div_number = document.createElement("div");
        div_number.style.width = 30 + "px";
        div_number.style.position = "absolute";
        div_number.innerHTML = HistorySegments.list_segments.length + 1 + ". ";
        div_number.style.fontSize = 12 + "px";
        div_root.appendChild(div_number);
        div_root.appendChild(divNode);
	
        div_root.appendChild(HistorySegments.CreateButton(HistorySegments.height_node));

        if (HistorySegments.preLatex != HistorySegments.getLatex(laxtex)) {
            // history
            document.getElementById("history").appendChild(div_root);
            HistorySegments.preLatex = HistorySegments.getLatex(laxtex);
            HistorySegments.AddList(HistorySegments.SegmentList());
            HistorySegments.index = HistorySegments.list_segments.length;
	    
            var url = image_nodes;
            document.getElementById("recExpr").appendChild(Exercises.getImages(url));
            LogXML.GroupLog(SettingsMenu.user, Exercises.id_default, Exercises.id_select, -1, Exercises.from_step, ++Exercises.to_step, 1, HistorySegments.preLatex, url);
	    
            if (Editor.mod_history) {
                if (HistorySegments.list_segments.length == 1) {
                    HistorySegments.step++;
                } else if (HistorySegments.list_segments.length > 1) {
                    Fractions.stopTimer();
                    if (HistorySegments.check_step) {
                        //HistorySegments.setPermision();
                        HistorySegments.step++;
                        HistorySegments.count_child = 0;
                        div_number.innerHTML = HistorySegments.step + ". ";
                        document.getElementById("note").innerHTML = msg;
                        HistorySegments.list_segments[HistorySegments.index - 1].permision_edit = false;
                        var temp_node = document.getElementById("itemhis" + (HistorySegments.index - 1));
                        temp_node.nextSibling.removeEventListener("click", HistorySegments.DeleteNode, true);
                    } else {
                        HistorySegments.list_step_wrong.push(HistorySegments.index - 1);
                        HistorySegments.count_child++;
                        div_root.style.marginLeft = "20px";
                        div_number.innerHTML = (HistorySegments.step) + "." + HistorySegments.count_child;
                        document.getElementById("note").innerHTML = msg;
                    }
                }
            }
	    
            $("#exer_image0").load(function() {
                HistorySegments.SetPositionImages(true, url, laxtex, true);
                div_root.appendChild(Exercises.NodeMaxima);
            }).error(function() {
                //url = "";
                HistorySegments.SetPositionImages(false, url, laxtex, true);
                div_root.appendChild(Exercises.NodeMaxima);
            });
            // active node cuoi history
            for (var i = 0; i < HistorySegments.current_list.childNodes.length; i++) {
                if (i == HistorySegments.current_list.childNodes.length - 1) {
                    HistorySegments.current_list.childNodes[i].style.background = HistorySegments.background_avtive;
                    HistorySegments.current_list.childNodes[i].style.color = "blue";
                    HistorySegments.current_list.childNodes[i].style.fontSize = 16 + "px";
                    HistorySegments.index = i;
                } else {
                    HistorySegments.current_list.childNodes[i].style.background = "none";
                    HistorySegments.current_list.childNodes[i].childNodes[0].style.color = "white";
                    HistorySegments.current_list.childNodes[i].childNodes[0].style.fontSize = 12 + "px";
                }
            }
        }
        HistorySegments.check_delete = false;
    }
    HistorySegments.block.UndoHis();
    HistorySegments.status = true;
    HistorySegments.checkauto = false;
}

//HistorySegments.setPermision = function(){
//    for (var i = 0; i < HistorySegments.list_step_wrong.length;i++){
//	HistorySegments.list_segments[parseInt(HistorySegments.list_step_wrong[i])].permision_edit = false;
//    }
//    HistorySegments.list_step_wrong = new Array();
//}

HistorySegments.UpdateReAlign = function(bg, intid) {
    var tagNode = document.getElementById("itemhis" + parseInt(intid + 1));
    // for firefox 
    //tagNode.parentNode.lastChild.style.background = "-moz-linear-gradient(center top , " + bg + ", ghostWhite, " + bg + ")";
    // for webkit
    //tagNode.parentNode.lastChild.style.background = "-webkit-gradient(linear, left top, left bottom, color-stop(0%," + bg + "), color-stop(50%,ghostWhite), color-stop(100%," + bg + "))";
    tagNode.parentNode.lastChild.style.background = bg;
    HistorySegments.countalign = 0;
    if (intid >= 1) {
        //HistorySegments.currMaxima  = HistorySegments.getLatex(Exercises.ListImages[intid - 1].arr_latex);
        HistorySegments.getMaxima(Exercises.ListImages[intid - 1].arr_latex);
    }
    if (parseInt(intid) == 0) bg = "none";
}

HistorySegments.ActionsReAlign = function(intid, flag) {
    if (Editor.mod_history)
        return;
    if (flag == false) {
        if (intid < HistorySegments.list_segments.length - 1) {
            //HistorySegments.currMaxima = HistorySegments.getLatex(Exercises.ListImages[intid + 1].arr_latex);
            HistorySegments.getMaxima(Exercises.ListImages[intid + 1].arr_latex);
            HistorySegments.countalign++;
            HistorySegments.in_id = HistorySegments.list_segments[intid + 1].id;
            if (HistorySegments.check_delete)
                HistorySegments.in_id = HistorySegments.list_segments[intid].id;
            HistorySegments.check_delete = true;
            Editor.align();
        }
    }
}

HistorySegments.CreateButton = function(top) {
    top = top - (top - 25) / 2;
    var div = document.createElement("div");
    div.setAttribute("class", "myapp-delete");
    div.style.marginTop = -top + "px";
    div.style.cursor = "pointer";
    //if (HistorySegments.list_segments.length > 0) {
    div.innerHTML = "X";
    if (Editor.using_mobile){
        div.addEventListener("touchstart", HistorySegments.DeleteNode, true);
    //}
        if (HistorySegments.list_segments.length == 0)
            div.removeEventListener("touchstart", HistorySegments.DeleteNode, true);
    }
    else {
        div.addEventListener("click", HistorySegments.DeleteNode, true);
    //}
        if (HistorySegments.list_segments.length == 0)
            div.removeEventListener("click", HistorySegments.DeleteNode, true);
    }
    
    return div;
}

HistorySegments.delWrong = function(block){
    var count = 0;
    var sb = new StringBuilder();
    for (var i = 0; i < HistorySegments.list_step_wrong.length; i++){
        if (HistorySegments.list_step_wrong[i] != block){
            $("#itemhis" + HistorySegments.list_step_wrong[i]).parent().remove();
            sb.append(HistorySegments.list_segments[HistorySegments.list_step_wrong[i] - count].id);
            if (i < HistorySegments.list_step_wrong.length - 1)
                sb.append(";");
            HistorySegments.list_segments.splice(HistorySegments.list_step_wrong[i] - count, 1);
            Exercises.ListImages.splice(HistorySegments.list_step_wrong[i] - count, 1);
            count++;
        }
    }
    Exercises.from_step = HistorySegments.index;
    HistorySegments.in_id = String(sb);
    LogXML.GroupLog(SettingsMenu.user, Exercises.id_default, Exercises.id_select, HistorySegments.in_id, Exercises.from_step, Exercises.to_step, 3, new Array(), "");
    var root = new StringBuilder();
    root.append("<root>");
    root.append(HistorySegments.stringXml).append("<color>").append("").append("</color>");
    root.append("</root>");
    HistorySegments.sendData(String(root), false);
    delete HistorySegments.list_step_wrong;
    HistorySegments.list_step_wrong = new Array();
}

HistorySegments.DeleteNode = function(e) {
    
    var stridnode = e.currentTarget.previousSibling.id;
    var index;
    stridnode = stridnode.replace("itemhis", "");
    HistorySegments.current_index = parseInt(stridnode);
    
    for (var i = 0; i < HistorySegments.current_list.childNodes.length; i++) {
        if (i == HistorySegments.current_index) {
            HistorySegments.current_list.childNodes[i].style.background = HistorySegments.background_avtive;
            HistorySegments.current_list.childNodes[i].style.color = "blue";
            HistorySegments.current_list.childNodes[i].style.fontSize = 16 + "px";
            HistorySegments.index = i;
        } else {
            HistorySegments.current_list.childNodes[i].style.background = "none";
            HistorySegments.current_list.childNodes[i].childNodes[0].style.color = "white";
            HistorySegments.current_list.childNodes[i].childNodes[0].style.fontSize = 12 + "px";
        }
    }
    HistorySegments.SetDefault();
    HistorySegments.ActionHistory(HistorySegments.index);
    HistorySegments.select_active = true;
    
    index = HistorySegments.current_index;
    HistorySegments.sum_height -= HistorySegments.current_list.childNodes[HistorySegments.current_index].clientHeight;
    $(this).parent().remove();
    
    if (Editor.mod_history){
        Exercises.from_step = HistorySegments.index;
        HistorySegments.in_id = HistorySegments.list_segments[index].id;
        LogXML.GroupLog(SettingsMenu.user, Exercises.id_default, Exercises.id_select, HistorySegments.in_id, Exercises.from_step, Exercises.to_step, 3, new Array(), "");
        var root = new StringBuilder();
        root.append("<root>");
        root.append(HistorySegments.stringXml).append("<color>").append("").append("</color>");
        root.append("</root>");
        if (HistorySegments.list_segments[HistorySegments.list_segments.length - 1].permision_edit) {
            HistorySegments.sendData(String(root), false);
        }
	
        var temp_index = HistorySegments.list_step_wrong.searchIndex(index);
        if (temp_index != -1){
            HistorySegments.count_child--;
            HistorySegments.list_step_wrong.splice(temp_index, HistorySegments.list_step_wrong.length - temp_index);
        }
    }
    
    HistorySegments.UpdateList(temp_index);
    if (index > 0 && index < HistorySegments.list_segments.length) {
        HistorySegments.index = index;
        var node_images = Exercises.ListImages[index - 1];
        HistorySegments.getMaxima(node_images.arr_latex);
        HistorySegments.checkauto = true;
        HistorySegments.check_delete = true;
        if (Editor.mod_history)
            return;
        Editor.align();
    }
    else if (index == HistorySegments.list_segments.length){
        HistorySegments.index = index;
        var node_images = Exercises.ListImages[index - 1];
        HistorySegments.getMaxima(node_images.arr_latex);
        HistorySegments.preLatex = HistorySegments.getLatex(node_images.arr_latex);
    }
}

HistorySegments.UpdateList = function(in_index) {
    var index = HistorySegments.current_index;
    HistorySegments.in_id = HistorySegments.list_segments[index].id;
    HistorySegments.list_segments.splice(index, 1);
    Exercises.ListImages.splice(index, 1);
    var temp_count = in_index;
    for (var i = index; i < HistorySegments.list_segments.length; i++) {
        HistorySegments.current_list.childNodes[i].childNodes[0].innerHTML = i + 1 + ". ";
        HistorySegments.current_list.childNodes[i].childNodes[1].setAttribute("id", "itemhis" + i);
        if (Editor.mod_history && HistorySegments.list_segments[i].permision_edit){
            temp_count++;
            HistorySegments.current_list.childNodes[i].childNodes[0].innerHTML = (HistorySegments.step) + "." + temp_count;
            //HistorySegments.list_step_wrong.splice(temp_count - 1, 1, i);
            HistorySegments.list_step_wrong.push(i);
            console.log("vi tri ton tai " + HistorySegments.list_step_wrong[temp_count - 1]);
            console.log("id ton tai " + HistorySegments.list_segments[HistorySegments.list_step_wrong[temp_count - 1]].id);
        }
    }
    if (HistorySegments.index >= HistorySegments.list_segments.length && HistorySegments.list_segments.length > 0) {
        HistorySegments.index--;
        HistorySegments.current_index--;
    }
    if (HistorySegments.index == HistorySegments.current_index && HistorySegments.index <= HistorySegments.list_segments.length - 1) {
        HistorySegments.current_list.childNodes[HistorySegments.index].style.background = HistorySegments.background_avtive;
        HistorySegments.current_list.childNodes[HistorySegments.index].childNodes[0].style.color = "blue";
        HistorySegments.current_list.childNodes[HistorySegments.index].childNodes[0].style.fontSize = 16 + "px";
        HistorySegments.SetDefault();
        HistorySegments.ActionHistory(HistorySegments.index);
    }
    HistorySegments.current_index = -1;
    if (HistorySegments.list_segments.length == 0) {
        Exercise.clearall();
    }
    if (Editor.segments.length == 0) ExercisesMenu.select_exercise.selectedIndex = 0;
}

HistorySegments.getPermision = function(){
    if (Editor.mod_history){
        HistorySegments.checkauto = false;
        if (HistorySegments.list_segments.length > 1 && HistorySegments.index < HistorySegments.list_segments.length - 1
            && !HistorySegments.list_segments[HistorySegments.index].permision_edit){
            return true;
        }
    }
    return false;
}

HistorySegments.ObjSeg = function(seg) {
    var tmax, tmin, hheight, lleft;
    tmin = seg[0].worldMinDrawPosition().y;
    tmax = seg[0].worldMaxDrawPosition().y;
    lleft = seg[0].translation.x;
    for (var i = 1; i < seg.length; i++) {
        if (tmin > seg[i].worldMinDrawPosition().y) tmin = seg[i].worldMinDrawPosition().y;
        if (tmax < seg[i].worldMaxDrawPosition().y) tmax = seg[i].worldMaxDrawPosition().y;
        if (lleft > seg[i].translation.x) lleft = seg[i].translation.x;
    }
    this.left = lleft;
    this.top = tmin;
    this.height = tmax - tmin;
}

HistorySegments.CreateNode = function(idnode, divNode) {
    var obj = new HistorySegments.ObjSeg(HistorySegments.SegmentList());
    HistorySegments.height_node = obj.height * 0.2 + 10;
    if (HistorySegments.height_node < 30) HistorySegments.height_node = 30;

    var tran_left = -((obj.left * 0.2) - 30);
    var tran_top = -((obj.top * 0.2) - 5);

    divNode.setAttribute("id", "itemhis" + idnode);
    divNode.style.width = innerWidth * 40 / 100 + "px";
    divNode.style.cursor = "pointer";
    divNode.style.height = "100%";

    var arr_block = new Array();
    for (var i = 0; i < HistorySegments.current_seg.length; i++) {
        var seg = HistorySegments.current_seg[i];
        if (seg.symbol == undefined && Editor.FindIndexSegment(seg.set_id, Editor.segmentSplits) != -1 && Gestures.IsSegmentsBelongDralf(seg) == true) {
            arr_block.push(seg);
        }
    }
    //ActionSegments(HistorySegments.SegmentList(), true,Editor.DeleteSegments);
    HistorySegments.block = new ActionSegments(arr_block, true, Editor.DeleteSegments);
    HistorySegments.block.Apply();

    var list_point = new HistorySegments(HistorySegments.SegmentList());
    list_point.HisPoints();

    var div_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    div_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    div_svg.setAttribute("width", "100%");
    div_svg.setAttribute("height", "100%");
    divNode.appendChild(div_svg);

    var div_group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    div_group.setAttribute("transform", "matrix(1, 0, 0, 1, " + tran_left + ", " + tran_top + ") matrix(1, 0, 0, 1, 0, 0) matrix(1, 0, 0, 1, 0, 0)");
    div_svg.appendChild(div_group);

    var root_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    root_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    root_svg.setAttribute("style", "overflow: visible;");
    //div_group.appendChild(root_svg);

    for (var i = 0; i < list_point.list_points.length; i++) {
        /*
	var root_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	root_svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	root_svg.setAttribute("style", "overflow: visible;");
	div_group.appendChild(root_svg);
	*/
        var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute("transform", list_point.scalezoom[i]);
        group.setAttribute("style", "fill:none;stroke-linecap:round;");
        div_group.appendChild(group);

        var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        poly.setAttribute("points", list_point.list_points[i]);
        poly.setAttribute("style", "stroke: red; stroke-width: 5;");
        group.appendChild(poly);
    }
}

HistorySegments.SegmentList = function() {
delete HistorySegments.current_seg;
HistorySegments.current_seg = new Array();
HistorySegments.current_seg = Editor.segments.clone();
var arr_list = new Array();
for (var i = 0; i < HistorySegments.current_seg.length; i++) {
    var seg = HistorySegments.current_seg[i];
    if ( (Editor.FindIndexSegment(seg.set_id
    ,  Editor.segmentSplits) == -1 && seg.translation.x > 0 && seg.translation.y > 0)) 
       arr_list.push(seg);                                   }
return arr_list;                                             }

HistorySegments.Table = function() {
    HistorySegments.center_panel = document.getElementById("exprHistory");
    HistorySegments.current_list = document.getElementById("history");
    //HistorySegments.SwipeRightDelete();
    HistorySegments.LoadScroll("exprHistory");
/*if ((/webkit/i).test(navigator.appVersion)) {
	HistorySegments.background_avtive = "-webkit-gradient(linear, left top, left bottom, color-stop(0%,windowframe), color-stop(50%,ghostWhite), color-stop(100%,windowframe))";
    }
    else {
	HistorySegments.background_avtive = "-moz-linear-gradient(center top , windowframe, ghostWhite, windowframe) repeat scroll 0 0 transparent";
    }*/
}

HistorySegments.LoadScroll = function(containerID) {
    if (!containerID) containerID = "exprHistory";
    HistorySegments.myScroll = new iScroll(containerID, {
        checkDOMChanges: true,
        scrollbarClass: 'myScrollbar'
    });
}
HistorySegments.SwipeRightDelete = function() {
    YUI().use("node-base", "node-event-delegate", "transition", "event-move", function(Y) {
        var MIN_SWIPE = 50;
        Y.Node.one("#history").delegate("gesturemovestart", function(e) {
            var item = e.currentTarget,
            target = e.target,
            container = e.container,
            isDeleteButton = target.hasClass("myapp-delete");
            // Prevent Text Selection in IE
            item.once("selectstart", function(e) {
                e.preventDefault();
            });
            if (!isDeleteButton) {
                HistorySegments.active = false;
                container.all(".myapp-delete").addClass("myapp-hidden");
                item.setData("swipeStart", e.pageX);
                item.once("gesturemoveend", function(e) {
                    var swipeStart = item.getData("swipeStart"),
                    swipeEnd = e.pageX,
                    isSwipeRight = (swipeEnd - swipeStart) > MIN_SWIPE;
                    if (isSwipeRight) {
                        HistorySegments.active = true;
                        item.one(".myapp-delete").removeClass("myapp-hidden");
                        var string = item.get("childNodes").item(1).get("id");
                        string = string.replace("itemhis", "");
                        HistorySegments.current_index = parseInt(string);
                    }
                });
            } else {
                item = target.get("parentNode");
                if (item.get("id") != "kitkat" || confirm("Seriously? The KitKats?")) {
                    HistorySegments.sum_height -= HistorySegments.current_list.childNodes[HistorySegments.current_index].clientHeight;
                    item.transition({
                        duration: 0.3,
                        opacity: 0,
                        height: 0
                    }, function() {
                        this.remove();
                        HistorySegments.UpdateList();
                        HistorySegments.active = false;
                    });
                }
            }
        }, "div.swipeR", {
            preventDefault: true
        });
    });
}

HistorySegments.SetDefault = function() {
    //Editor.check_rectangle = true;
    Editor.clear_selected_segments();
    Editor.clearButtonOverlays();
    
    ////Editor.button_states[Buttons.Group].setEnabled(false);
    //Editor.button_states[Buttons.Label].setEnabled(false);
    /*if (Editor.selection_method == "Stroke") {
        Editor.button_states[Buttons.Stroke].setSelected(true);
        Editor.strokeSelectionTool();
        Editor.selection_method = "Stroke";*/
    //} else {
        Editor.button_states[Buttons.Command].setSelected(true);
        Editor.rectangleSelectionTool();
        Editor.selection_method = "Rectangle";
    //}
    RenderManager.render();
}

HistorySegments.GetIndex = function(e) {
    if (HistorySegments.active || !! HistorySegments.select_active) {
        return
    } else {
        HistorySegments.index = -1;
        for (var i = 0; i < HistorySegments.current_list.childNodes.length; i++) {
            if (HistorySegments.current_list.childNodes[i] == e.currentTarget) {
                e.currentTarget.style.background = HistorySegments.background_avtive;
                e.currentTarget.childNodes[0].style.color = "blue";
                e.currentTarget.childNodes[0].style.fontSize = 16 + "px";
                HistorySegments.index = i;
            } else {
                HistorySegments.current_list.childNodes[i].style.background = "none";
                HistorySegments.current_list.childNodes[i].childNodes[0].style.color = "white";
                HistorySegments.current_list.childNodes[i].childNodes[0].style.fontSize = 12 + "px";
            }
        }
        HistorySegments.SetDefault();
        HistorySegments.ActionHistory(HistorySegments.index);
        HistorySegments.select_active = true;
    }
}

HistorySegments.Default = function(heightcenter, heightdiv, heightimages, status, url) {
    var nodediv = document.getElementById("exer");
    var nodecent = document.getElementById("recExpr");
    var sum_height_images = 0;
    for (var i = 0; i < url.length; i++) {
        var nodeimages = document.getElementById("exer_image" + i);
        var min = Math.min(heightimages, nodeimages.offsetWidth);
        var max = Math.max(heightimages, nodeimages.offsetWidth);
        var rate = 1 + (nodeimages.offsetHeight / nodeimages.offsetWidth);
        var scale;
        if (((max - min) / 2) < 20) {
            scale = 25;
        } else {
            scale = ((max - min) / 2) * rate;
        }
        nodeimages.style.position = "absolute";
        nodeimages.style.width = scale + "px";
        nodeimages.style.left = "10px";
        nodeimages.style.top = (Exercises.top + sum_height_images + 10) + "px";
        sum_height_images = sum_height_images + nodeimages.offsetHeight + 1;
        if (i > 0){
            nodeimages.style.borderTop = "1px solid blue";
        }
        //nodeimages.style.paddingRight = "0.25%";
        //nodeimages.style.paddingTop = "0.25%";
        if (status == true) {
        //    nodediv.style.textAlign = "right";
        //    nodediv.style.marginTop = (((heightcenter - heightdiv - 10) / 2) + 2.5) + "px";
        //    //nodeimages.style.marginTop = 5 + "px";
        //    if (heightimages <= 5) nodediv.style.paddingBottom = 5 + "px";
        //    if (heightimages >= heightdiv && heightimages > 5) {
        //	nodediv.style.height = 100 + "%";
        //	nodediv.style.marginTop = (((heightcenter - heightimages) / 2) + 2.5) + "px";
        //    }
        } else if (status == false) {
            //nodediv.style.paddingBottom = 0 + "px";
            ////nodediv.style.height = 100 + "%";
            //nodediv.style.marginTop = (((heightcenter - 20) / 2)) + "px";
            //nodediv.style.textAlign = "center";
            nodediv.innerHTML = "Loadding error!";
        }
    }

    nodediv.style.visibility = "visible";
}

HistorySegments.SetPositionImages = function(status, url, laxtex, flag) {
    var nodediv = document.getElementById("exer");
    var nodeimages = document.getElementById("exer_image0");
    var nodecent = document.getElementById("recExpr");

    HistorySegments.Default(nodecent.offsetHeight, nodediv.offsetHeight, nodeimages.offsetHeight, status, url);

    if (flag == true) {
        var list_images = new Exercises(url, laxtex, status);
        Exercises.ListImages.push(list_images);

        // set Positions Scroll
        HistorySegments.sum_height += HistorySegments.current_list.childNodes[HistorySegments.list_segments.length - 1].clientHeight;
        var min = parseInt(HistorySegments.center_panel.clientHeight);
        var max = parseInt(HistorySegments.sum_height + (HistorySegments.list_segments.length));
        if (max > min) {
            var sb = new StringBuilder();
            sb = sb.append("translate3d(0px, ");
            sb.append(parseInt(min - max - 5));
            sb.append("px, 0px)");
            HistorySegments.current_list.style.WebkitTransform = sb;
        }

        if (HistorySegments.active) {
            HistorySegments.current_list.childNodes[HistorySegments.current_index].style.background = "none";
            HistorySegments.current_list.childNodes[HistorySegments.current_index].childNodes[0].style.color = "white";
            HistorySegments.current_list.childNodes[HistorySegments.current_index].childNodes[0].style.fontSize = 12 + "px";
            $(".myapp-delete").addClass("myapp-hidden");
            HistorySegments.active = false;
        }
    } else if (flag == false) {
        var list_images = new Exercises(url, laxtex, status);
        Exercises.ListImages.splice(HistorySegments.index, 1, list_images);
    }
}

var socket_client = {
    init : function(){
        var url = document.location.toString()
            .replace('index.jsp?mod=civ', '')
            .replace('http://', 'ws://')
            .replace('https://', 'wss://')
            + "Notify";
        console.log(url);
        socket_client.connect(url);
    },
    connect : function(url){
        this._ws = null;
        if ('WebSocket' in window) {
            this._ws = new WebSocket(url, "Notify");
        } 
        else if ('MozWebSocket' in window) {
            this._ws = new MozWebSocket(url, "Notify");
        } 
        else {
            console.log('Error: WebSocket is not supported by this browser.');
            return;
        }
        this._ws.onopen = this.onOpen;
	this._ws.onmessage = this.onMessage;
    },
    onOpen : function(){
        console.log('Info: WebSocket connection opened.');
        setInterval(function() {
            socket_client.sendMessage("{'type':'ping of coax'}");
        }, 10000);
    },
    onMessage : function(message){
        //console.log(message.data);
    },
    sendMessage : function(m){
        if (this._ws)
            this._ws.send(m);
    }
};

//<<<<< send history to server
HistorySegments.sendData = function(str_Xml, status) {
    if (!HistorySegments.set_action)
        return;
    $.ajax({
        type: "POST",
        dataType: "JSON",
        url: Editor.url_exercises,
        data: {
            action: String(str_Xml)
        },
        success: function(in_data) {
            var temp_data = eval(in_data);
            $.each(temp_data, function(in_dex, in_item) {
                if (status && HistorySegments.index >= HistorySegments.list_segments.length - 1){
                    HistorySegments.list_segments[HistorySegments.list_segments.length - 1].id = in_item.id;
                    if (Editor.mod_history && HistorySegments.check_step && HistorySegments.list_step_wrong.length > 0){
                        HistorySegments.delWrong(-1);
                        HistorySegments.index = HistorySegments.step - 1
                        HistorySegments.current_list.childNodes[HistorySegments.index].childNodes[1].setAttribute("id", "itemhis" + HistorySegments.index);
                    }
                }
                else if (Editor.mod_history){
                    if (HistorySegments.check_step && status
                        && HistorySegments.index < HistorySegments.list_segments.length - 1) {
                        HistorySegments.delWrong(HistorySegments.index);
                        HistorySegments.index = HistorySegments.step - 1;
                        HistorySegments.current_list.childNodes[HistorySegments.index].childNodes[1].setAttribute("id", "itemhis" + HistorySegments.index);
                    }
                    HistorySegments.check_delete = false;
                    HistorySegments.check_step = false;
                }
            });
            // tam thoi
            /*if (HistorySegments.check_step && HistorySegments.is_finish && status){
                socket_client.sendMessage("{'type': 'end', 'data' : 'successful'}");
                setInterval(function() {
                    window.close();
                }, 2500);
            }*/
        },
    });
}

HistorySegments.reciveData = function(id){
    return;
    Exercise.clearall();
    var sb = new StringBuilder();
    sb.append(Editor.url_history);
    sb.append("?userId=").append(id);
    $.ajax({
        type: "GET",
        dataType: "JSON",
        url: String(sb),
        success: function(in_data) {
            var history = eval(in_data);
            $.each(history, function(in_dex, in_item) {
                var list_latex = new Array();
                var list_image = new Array();
                if (in_dex == 0){
                    var xmldoc = new DOMParser().parseFromString(in_item.fileXML, "text/xml");
                    var seg_node = xmldoc.getElementsByTagName("segments");
                    delete Exercise.ArrExpression;
                    Exercise.ArrExpression = new Array();
                    delete Exercise.data_segment;
                    Exercise.data_segment = new Array();
                    LoadXML(xmldoc, 0, Exercise.ArrExpression, Exercise.data_segment);
                    Editor.transCenter(Editor.segments);
                    Editor.undo_stack.pop();
		
		
                    // node history
                    var divNode = document.createElement("div");
                    HistorySegments.CreateNode(HistorySegments.list_segments.length, divNode);
                    var div_root = document.createElement("div");
                    div_root.setAttribute("class", "swipeR");
                    div_root.style.height = HistorySegments.height_node + "px";
                    div_root.addEventListener("click", HistorySegments.GetIndex, true);
                    var div_number = document.createElement("div");
                    div_number.style.width = 25 + "px";
                    div_number.style.position = "absolute";
                    div_number.innerHTML = HistorySegments.list_segments.length + 1 + ". ";
                    div_number.style.fontSize = 12 + "px";
                    div_root.appendChild(div_number);
                    div_root.appendChild(divNode);
                    div_root.appendChild(HistorySegments.CreateButton(HistorySegments.height_node));
                    // history
                    document.getElementById("history").appendChild(div_root);
                    HistorySegments.preLatex = String(seg_node[0].attributes["latex"].nodeValue);
                    var count = 0;
                    for (var i = 1; i < HistorySegments.preLatex.length; i++){
                        count += i;
                        if (HistorySegments.preLatex[i] == "$"){
                            count++;
                            var img_node = xmldoc.getElementsByTagName("images" + count);
                        }
                    }
                    list_latex.push(HistorySegments.preLatex);
                    HistorySegments.AddList(HistorySegments.SegmentList());
                    HistorySegments.index = HistorySegments.list_segments.length;
		
                //var url = image_nodes;
                //HistorySegments.SetPositionImages(true, url, list_latex, true);
                //Exercises.NodeMaxima = Exercises.NotificationMaxima("green", HistorySegments.height_node);
                //div_root.appendChild(Exercises.NodeMaxima);
		
                //HistorySegments.block.UndoHis();
                //HistorySegments.status = true;
                //HistorySegments.checkauto = false;
                //HistorySegments.block.UndoHis();
                //HistorySegments.status = true;
                //HistorySegments.checkauto = false;
                }
            });
        }
    });
}

// Exercises funtions==========================================
Exercises = function(url, latex, status) {
    this.arr_url = new Array();
    this.arr_latex = new Array();
    this.status = status;

    for (var i = 0; i < latex.length; i++) {
        if (url.length > 0) this.arr_url.push(url[i]);
        else
            this.arr_url.push("");
        this.arr_latex.push(latex[i]);
    }
}

Exercises.ListImages = new Array();
Exercises.NodeMaxima = "";
Exercises.id_default = 0;
Exercises.id_select = 0;
Exercises.to_step = -1;
Exercises.from_step = 0;
Exercises.id_activeMath = "";
Exercises.title = "";
Exercises.userInputPostion = - 1;
Exercises.top = 0;
Exercises.getImages = function(image_nodes) {
    var nodediv = document.getElementById("exer");
    nodediv.setAttribute("style", "");
    if (nodediv.firstChild != null || nodediv.firstChild != undefined) {
        nodediv.innerHTML = "";
    }
    for (var i = 0; i < image_nodes.length; i++) {
        var tagImage = document.createElement("img");
        tagImage.setAttribute("id", "exer_image" + i);
        tagImage.setAttribute("src", image_nodes[i].textContent);
        //tagImage.style.marginLeft = 10 + "px";
        nodediv.appendChild(tagImage);
        nodediv.style.visibility = "hidden";
        //nodediv.style.background = "white";
        //nodediv.style.marginLeft = "-2.25%";
        //nodediv.style.marginRight = "-0.25%";
        /*if (image_nodes.length > 1 && i < image_nodes.length - 1) {
            var hr = document.createElement("hr");
            hr.style.color = "red";
            hr.style.background = "red"
            hr.style.height = 1 + "px";
            hr.style.border = "red";
            hr.style.marginLeft = "80%";
            nodediv.appendChild(hr);
        }*/
    }
    return nodediv;
}

Exercises.NotificationMaxima = function(bg, top) {
    var node = document.createElement("div");
    //node.style.height = 20 + "px";
    //node.style.width = 20 + "px";
    //node.style.border = "1px solid yellow";
    //node.style.borderRadius = "20px 20px 20px 20px";
    top = top - (top - 15) / 2;
    node.setAttribute("class", "rformula");
    node.style.marginTop = -top + "px";
    // for firefox 
    //node.style.background = "-moz-linear-gradient(center top , " + bg + ", ghostWhite, " + bg + ")";
    node.style.background = bg;
    // for webkit
    //node.style.background = "-webkit-gradient(linear, left top, left bottom, color-stop(0%," + bg + "), color-stop(50%,ghostWhite), color-stop(100%," + bg + "))";
    node.style.marginRight = 40 + "px";
    //node.style.marginTop = (document.getElementById("note").clientHeight - 20)/3 + "px";
    if (HistorySegments.list_segments.length == 1 || HistorySegments.index == 0) node.style.background = "none";
    return node;
}

// MovetoResize funtions==========================================
ResizeTo = function() {

}

//ResizeTo.rate_change_screen = window.innerHeight * 0.92 * 0.6;
ResizeTo.rate_change_screen = 0;

ResizeTo.Setup = function() {
    //document.getElementById("resize-to").addEventListener("touchstart", ResizeTo.onDown, true);
    //document.getElementById("resize-to").addEventListener("mousedown", ResizeTo.onDown, true);
    document.getElementById("btn-resize").addEventListener("touchstart", ResizeTo.onDown, false);
    document.getElementById("btn-resize").addEventListener("mousedown", ResizeTo.onDown, false);
    ResizeTo.check_down = false;
    ResizeTo.start = new Vector2(-1, -1);
    ResizeTo.current = new Vector2(-1, -1);
    // Set default canvas
    ResizeTo.height_canvas = innerHeight * 0.92 * 0.6;
    ResizeTo.width_canvas = innerWidth * 0.95;
    recyclebin.style.top = (ResizeTo.height_canvas - 75) + "px";
}

ResizeTo.onDown = function(e) {
    if (e.type == "mousedown") {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.pageX, e.pageY);
    } else if (e.type == "touchstart") {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
    } else
        return;
    RenderManager.render();
    ResizeTo.check_down = true;
    
    if (Editor.Exercises.current != null){
	if (Editor.Exercises.current.exercises_current.length > 0){
	    Editor.Exercises.current.node.renderNone(Editor.Exercises.current.exercises_current);
	    Box.selected = new Box(document.getElementById("box"));
            delete Editor.Exercises.current.exercises_current;
	    Editor.Exercises.current.exercises_current = new Array();
	}
    }
}

ResizeTo.onMove = function(e) {
    if (e.type == "mousemove" && !Editor.using_mobile) {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.pageX, e.pageY);
    } else if (e.type == "touchmove" && Editor.using_mobile) {
        ResizeTo.start = ResizeTo.current;
        ResizeTo.current = new Vector2(e.touches[0].clientX, e.touches[0].clientY);
    } else
        return;

    ResizeTo.Action(ResizeTo.start, ResizeTo.current);
}

ResizeTo.onUp = function() {
    ResizeTo.check_down = false;
    ResizeTo.Action(ResizeTo.start, ResizeTo.current);
    setTimeout(function() {
        HistorySegments.myScroll.refresh();
    }, 100);
    Editor.translateCenter(Editor.segments);
    Editor.Exercises.renderPosition();
}

ResizeTo.Action = function(start, current) {
    var nodecent = document.getElementById("centerpanel");
    var nodecavas = document.getElementById("equation_canvas");
    var content = document.getElementById("show-content");
    var height_his = nodecent.offsetHeight;
    var trans = Vector2.Subtract(current, start);
    var change = height_his + (trans.y);
    //ResizeTo.UpdatePanelImages(change);
    change = change * 100 / content.offsetHeight;
    nodecent.style.height = change + "%";
    nodecavas.style.height = (98 - change) + "%";
    ResizeTo.rate_change_screen = 98 - change;
    ResizeTo.UpdatePanelCanvas(98 - change);
    ResizeTo.change();
    setTimeout(function() {
        HistorySegments.myScroll.refresh();
    }, 50);
}

ResizeTo.UpdatePanelImages = function(heightcenter) {
    // update images
    var nodediv = document.getElementById("exer");
    var nodeimages = document.getElementById("exer_image");
    if (nodeimages != null) {
        nodediv.style.marginTop = (heightcenter - nodediv.offsetHeight) / 2 + "px";
    }
}

ResizeTo.UpdatePanelCanvas = function(heightcanvas) {
    // update canvas
    var nodecanvas = document.getElementById("pen-canvas");
    var content = document.getElementById("show-content");
    heightcanvas = content.offsetHeight * heightcanvas / 100;
    ResizeTo.height_canvas = heightcanvas;
    nodecanvas.setAttribute("height", heightcanvas);
    Editor.div_position = findPosition(Editor.canvas_div);
    recyclebin.style.top = (ResizeTo.height_canvas - 75) + "px";
}

ResizeTo.Layout = function(pos) {
    var nodecontent = document.getElementById("show-content");
    var nodetoobar = document.getElementById("toolbar");
    var nodelog = document.getElementById("log");
    if (pos == "left") {
        //nodelog.style.paddingLeft = 5 + "px";
        document.getElementById("note").style.left = 0;
        document.getElementById("lhint").style.left = "6%";
        document.getElementById("description").style.left = "20%";
        document.getElementById("selectexes").style.left = "50%";
        document.getElementById("logout").style.left = "90%";
        nodecontent.style.left = 0;
        nodecontent.style.right = null;
        nodetoobar.style.right = 0;
        nodetoobar.style.left = null;
        //nodetoobar.style.marginLeft = 95.1 + "%";
        Editor.Exercises.change_layout = "left";
    } else if (pos == "right") {
        //nodelog.style.paddingLeft = 6 + "%";
        document.getElementById("note").style.left = "5.5%";
        document.getElementById("lhint").style.left = "11%";
        document.getElementById("description").style.left = "25%";
        document.getElementById("selectexes").style.left = "55%";
        document.getElementById("logout").style.left = "95%";
        nodecontent.style.right = 0;
        nodecontent.style.left = null;
         nodetoobar.style.left = 0;
        nodetoobar.style.right = null;
        //nodetoobar.style.marginLeft = 0;
        Editor.Exercises.change_layout = "right";        
    }
    Editor.div_position = findPosition(Editor.canvas_div);
    Editor.actionLayout("visible");
    return;
}

ResizeTo.change = function(){
    var width_1 = document.getElementById("show-content").offsetWidth;
    var height_1 = document.getElementById("log").offsetHeight;
    var height_2 = document.getElementById("centerpanel").offsetHeight;
    var height_3 = document.getElementById("resize-to").offsetHeight;
    var height_sum = height_2 + height_3 - height_1/4;
    var top = height_sum - 12.5;
    var left = width_1/2 - 25;
    document.getElementById("btn-resize").style.top = top + "px";
    document.getElementById("btn-resize").style.left = left + "px";
}