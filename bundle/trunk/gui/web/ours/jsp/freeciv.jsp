<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<%@ include file="session-check.jsp" %>
<%@ include file="paths.jsp" %>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>freeciv</title>

        <script src="js/jquery.js" type="javascript/text"></script>
        <script src=<%=c_path_jqueryjs%> type="javascript/text"></script>
    </head>
    <body>
	<div id="result">Click coax to tess for user the mode-connected to use activeMath<span id="mark"></span></div>
        <a href="./index.jsp" target="_blank">coax</a>
    </body>

    <!--<script type="text/javascript">
        var Notify = {};

        Notify.socket = null;

        Notify.connect = (function(host) {
            if ('WebSocket' in window) {
                Notify.socket = new WebSocket(host, "Notify");
            } 
            else if ('MozWebSocket' in window) {
                Notify.socket = new MozWebSocket(host, "Notify");
            } 
            else {
                console.log('Error: WebSocket is not supported by this browser.');
                return;
            }

            Notify.socket.onopen = function () {
                console.log('Info: WebSocket connection opened.');
                setInterval(function() {
                    Notify.socket.send("{'type':'ping of freeciv'}");
                }, 10000);
            };

    

        Notify.socket.onmessage = function (message) {
            //console.log(message.data);
            var obj = eval('('+message.data+')');
            if(obj.type=="end")
            {
                var mark = document.getElementById("mark").textContent;
                mark =  parseInt(mark) +1;
                document.getElementById("mark").textContent= mark;
            }
        };
    });
        
    Notify.initialize = function() {
        var location = document.location.toString()
                        .replace('freeciv.jsp', '')
		        .replace('http://', 'ws://')
				.replace('https://', 'wss://')
				+ "Notify";
        var href = window.location.host;
        var pathname = window.location.pathname;
        var start = pathname.lastIndexOf('/');
        var page =  pathname.substr(0, start);
        if(page.length==0)
            {
                page="";
            }
            
        href = "ws://"+href +"/" + page + '/Notify';
        console.log(location);
        Notify.connect(location);
    };
        
    Notify.initialize();
    </script>-->
</html>
