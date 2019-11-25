function isAjaxSessionTimeOut( xmlhttp )                                      {
   if ( String(xmlhttp.getResponseHeader("content-type"))
         .search("text/html") == 0
         && xmlhttp.responseText.includes("<title>Login</title>"))            {
      alert("Session timed out. The page needs to be reloaded.");
      var href = window.location.href;
      var index = href.indexOf("#");
      if(index>-1) href = href = href.substr(0,index);
      window.location.href = href;
      return true;                                                           }}