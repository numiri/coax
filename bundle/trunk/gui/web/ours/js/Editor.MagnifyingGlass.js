MagnifyingGlass = function(segments, selected_seg, x, y, v) {
    this.segments = segments;
    this.selected_seg = selected_seg;
    this.list_side_strokes = new Array();
    this.x = x;
    this.y = y;
    this.v = v;
};

MagnifyingGlass.current_side_stroke;
MagnifyingGlass.node_box = document.getElementById("magnify_box");
MagnifyingGlass.radius = 160;
MagnifyingGlass.scale = 1/2;
MagnifyingGlass.manage_svg = null;
MagnifyingGlass.manage_g = null;
MagnifyingGlass.side_mins;
MagnifyingGlass.side_maxs;

MagnifyingGlass.init_box = function() {
    var radius = MagnifyingGlass.radius / 16;
    MagnifyingGlass.node_box.style.display = "none";
    MagnifyingGlass.node_box.style.width = MagnifyingGlass.radius + "px";
    MagnifyingGlass.node_box.style.height = MagnifyingGlass.radius + "px";
    MagnifyingGlass.node_box.style.top = -MagnifyingGlass.radius * (3/4) + "px";
    MagnifyingGlass.node_box.style.borderRadius = radius + "px";
    MagnifyingGlass.node_box.style.MozBorderRadius = radius + "px";
    MagnifyingGlass.node_box.style.WebkitBorderRadius = radius + "px";
    MagnifyingGlass.node_box.style.fontSize = MagnifyingGlass.radius * (MagnifyingGlass.scale / 2) + "px";
    MagnifyingGlass.node_box.style.color = "red";
    MagnifyingGlass.node_box.style.textAlign = "center";
    MagnifyingGlass.node_box.style.lineHeight = MagnifyingGlass.radius - 10 + "px";
    MagnifyingGlass.node_box.style.boxShadow = "0 0 10px #000000 inset";
    MagnifyingGlass.node_box.style.MozBoxShadow = "0 0 10px #000000 inset";
    MagnifyingGlass.node_box.style.WebkitBoxShadow = "0 0 20px #000000 inset";
    MagnifyingGlass.node_box.style.MozTransform = "scale(" + MagnifyingGlass.scale + ")";
    MagnifyingGlass.node_box.style.WebkitTransform = "scale(" + MagnifyingGlass.scale + ")";
    //MagnifyingGlass.node_box.style.background = "-moz-radial-gradient(center center , #FEFFFF 0%, #DDF1F9 35%, #A0D8EF 100%)";
    //MagnifyingGlass.node_box.style.background = "-webkit-radial-gradient(center, #FEFFFF 0%, #DDF1F9 35%, #A0D8EF 100%)";    
    MagnifyingGlass.node_box.style.background = "white";
    MagnifyingGlass.node_box.style.border = "1px solid #333333";
    MagnifyingGlass.node_box.style.WebkitMaskImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC)";

};

MagnifyingGlass.prototype = {
    //<<<<< tao svg
    createSvg: function() {
        this.nodeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.nodeSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.nodeSvg.setAttribute("width", "100%");
        this.nodeSvg.setAttribute("height", "100%");
        this.nodeSvg.setAttribute("id", "magnifying_svg");
        this.nodeSvg.setAttribute("class", "pen_stroke");
        this.nodeSvg.setAttribute("style", "position: absolute; left: 0px; top: 0px; z-index: 25;");
        this.checkIntersection();
        this.nodeSvg.appendChild(this.createGroup());
        return this.nodeSvg;
    },

    //<<<<< tao group
    createGroup: function(){
        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var sb = new StringBuilder();
        sb.append("translate(0, 0)");
        sb.append("scale(1)");
        this.group.setAttribute("id", "magnifying_g");
        this.group.setAttribute("transform", sb.toString());
        this.group.setAttribute("style", "fill:none;stroke-linecap:round;");
        MagnifyingGlass.side_mins = null;
        MagnifyingGlass.side_maxs = null;
        for (var i = 0; i < this.list_side_strokes.length; i++){
            var seg = this.list_side_strokes[i];
            if (i == 0){
                MagnifyingGlass.side_mins = seg.worldMinPosition();
                MagnifyingGlass.side_maxs = seg.worldMaxPosition();
            }
            else{
                MagnifyingGlass.side_mins.x = Math.min(MagnifyingGlass.side_mins.x, seg.worldMinPosition().x);
                MagnifyingGlass.side_mins.y = Math.min(MagnifyingGlass.side_mins.y, seg.worldMinPosition().y);
                MagnifyingGlass.side_maxs.x = Math.max(MagnifyingGlass.side_maxs.x, seg.worldMaxPosition().x);
                MagnifyingGlass.side_maxs.y = Math.max(MagnifyingGlass.side_maxs.y, seg.worldMaxPosition().y);
            }
            side_stroke = this.createSideStrokes(seg);
            this.group.appendChild(side_stroke);
        }
        
        return this.group;
    },
    
    //<<<<< tao side strokes
    createSideStrokes: function(side_stroke){
        var elem = side_stroke.element.cloneNode(true);
        return elem;
    },
    
    //<<<<< thay doi left-top cua group
    renderGroup: function(left, top){
        if (MagnifyingGlass.manage_g == null){
            return;
        }
        var sb = new StringBuilder();
        sb.append("translate(").append(left).append(",").append(top).append(")");
        sb.append("scale(1)");
        MagnifyingGlass.manage_g.setAttribute("transform", sb.toString());
        MagnifyingGlass.manage_g.setAttribute("style", "fill:none;stroke-linecap:round;");
    },
    
    //<<<<< kiem tra mang intersection sidestrokes for magnifying glass
    checkIntersection: function() {
        for (var i = 0; i < this.segments.length; i++) {
            if (!this.searchId(this.selected_seg, this.segments[i].set_id)) {
                continue;
            }
            this.list_side_strokes.push(this.segments[i]);
        }
    },

    //<<<<< loai bo segments id trung lap voi selected segments
    searchId: function(selected_segment, currentId) {
        if (selected_segment.length == 0) {
            return true;
        }
        for (var i = 0; i < selected_segment.length; i++) {
            if (selected_segment[i].set_id == currentId) {
                return false;
            }
        }
        return true;
    },

    //<<<<< thuc hien qua trinh magnifying glass
    renderSideStroke: function() {
        var left_box = (Segment.width - MagnifyingGlass.radius) / 2;
        var left_child = -(Segment.left + left_box);
        var top_child = -(Segment.top + (Segment.height - MagnifyingGlass.radius) / 2);
        MagnifyingGlass.node_box.style.display = "block";
        var temp_rate_left = Editor.selected_bb.getCenterBox();
        MagnifyingGlass.node_box.style.left = ((left_box) - (temp_rate_left[0] - Editor.mouse_position.x)) + "px";
        if (MagnifyingGlass.manage_g == null) {
            MagnifyingGlass.node_box.appendChild(this.createSvg());
            MagnifyingGlass.manage_svg = document.getElementById("magnifying_svg");
            MagnifyingGlass.manage_g = document.getElementById("magnifying_g");
        }
        if (MagnifyingGlass.manage_g != null) {
            if (MagnifyingGlass.side_mins == null && MagnifyingGlass.side_maxs == null){
                MagnifyingGlass.node_box.style.display = "none";
                return;
            }
            this.renderGroup(left_child - (Editor.mouse_position.x - this.x), top_child - (Editor.mouse_position.y - this.y));
            //this.renderGroup(left_child, top_child);
            if (Editor.selected_bb.render_mins.x >= MagnifyingGlass.side_maxs.x
                || Editor.selected_bb.render_maxs.x <= MagnifyingGlass.side_mins.x
                || Editor.selected_bb.render_mins.y >= MagnifyingGlass.side_maxs.y){
                //|| Editor.selected_bb.render_maxs.y <= MagnifyingGlass.side_mins.y){
                MagnifyingGlass.node_box.style.display = "none";
            }
            else {
                var render_zize = Vector2.Subtract(Editor.selected_bb.render_maxs, Editor.selected_bb.render_mins);
                if (render_zize.y < MagnifyingGlass.radius/2
                    && Editor.selected_bb.render_maxs.y <= MagnifyingGlass.side_mins.y){
                    MagnifyingGlass.node_box.style.display = "none";
                }
                else if (render_zize.y >= MagnifyingGlass.radius/2
                        && Editor.selected_bb.render_maxs.y - (render_zize.y - MagnifyingGlass.radius/2) <= MagnifyingGlass.side_mins.y){
                    MagnifyingGlass.node_box.style.display = "none";
                }
            }
        }
    },
};