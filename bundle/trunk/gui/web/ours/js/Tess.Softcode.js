/*
Main JS for tutorial: "Getting Started with HTML5 Local Databases"
Written by Ben Lister (darkcrimson.com) revised 12 May 2010
Tutorial: http://blog.darkcrimson.com/2010/05/local-databases/

Licensed under the MIT License:
http://www.opensource.org/licenses/mit-license.php
*/
var idsetting = 0;
$(function() {
    initDatabase();
});

$("#submit").click(function() {
    if ($('#studentname').val() != "") {
	if (idsetting == 0) {
	    prePopulate();
	    selectAll();
	} else {
	    updateSetting();
	}
    }
});

function initDatabase() {
    try {
	if (!window.openDatabase) {
	    alert('Local Databases are not supported by your browser. Please use a Webkit browser for this demo');
	} else {
	    var shortName = 'DEMODB';
	    var version = '1.0';
	    var displayName = 'DEMODB Test';
	    var maxSize = 100000; // in bytes
	    DEMODB = openDatabase(shortName, version, displayName, maxSize);
	    createTables();
	    selectAll();
	}
    } catch (e) {
	if (e == 2) {
	    // Version mismatch.
	    //console.log("Invalid database version.");
	} else {
	    //console.log("Unknown error " + e + ".");
	}
	return;
    }
}



/***
 **** CREATE TABLE **
 ***/

function createTables() {
    DEMODB.transaction(

    function(transaction) {
	transaction.executeSql('CREATE TABLE IF NOT EXISTS page_settings(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL,zoom BIT NOT NULL, select_s3 BIT NOT NULL, favcar TEXT);', [], nullDataHandler, errorHandler);
    });
    //prePopulate();
}


/***
 **** INSERT INTO TABLE **
 ***/

function prePopulate() {
    DEMODB.transaction(

    function(transaction) {
	//Starter data when page is initialized
	var username = document.getElementById('studentname').value;
	var zoom = document.getElementById('rzoom').checked;
	var select = document.getElementById('rselect').checked;
	var data = [username, zoom, select, 'abc'];
	transaction.executeSql("INSERT INTO page_settings( username, zoom,select_s3, favcar) VALUES ( ?, ?, ?, ?)", [data[0], data[1], data[2], data[3]]);
	document.getElementById('studentname').value = "";
    });
}

/***
 **** UPDATE TABLE **
 ***/

function updateSetting() {
    DEMODB.transaction(

    function(transaction) {
	var username;
	if ($('#studentname').val() != '') {
	    username = document.getElementById('studentname').value;
	} else {
	    username = 'user';
	}

	//var zoom = document.getElementById('rzoom').checked;
	//var select = document.getElementById('rselect').checked;
	var zoom = document.getElementById('rzoom').checked;
	var select = document.getElementById('rselect').checked;
	transaction.executeSql("UPDATE page_settings SET username=?, zoom=?, select_s3=?, favcar=? WHERE id = " + idsetting, [username, zoom, select, "nil"]);
    });
    selectAll();
}

/*function selectAll() {
    DEMODB.transaction(

    function(transaction) {

	transaction.executeSql("SELECT * FROM page_settings;", [], dataSelectHandler, errorHandler);

    });
}*/

function dataSelectHandler(transaction, results) {

    // Handle the results
    for (var i = 0; i < results.rows.length; i++) {
	var row = results.rows.item(i);

	idsetting = row['id'];
	document.getElementById('studentname').value = row['username'];

	//Editor.isZoom = row['zoom'];
	if (row['zoom'] == false || row['zoom'] == 'false' || row['zoom'] == 0) {
	    Editor.isZoom = false;
	    document.getElementById('rzoom').checked = false;
	} else {
	    //console.log("isZoom true");
	    Editor.isZoom = true;
	    document.getElementById('rzoom').checked = true;
	}

	if (row['select_s3'] == true || row['select_s3'] == 'true' || row['select_s3'] == 1) {
	    Editor.isSelectS3 = true;
	    document.getElementById('rselect').checked = true;
	} else {
	    //console.log("isSelectS3 true");
	    Editor.isSelectS3 = false;
	    document.getElementById('rselect').checked = false;
	}

	//console.log("Your Name " + row['username'] + ",isSelect:" + Editor.isSelectS3 + ".isZoom: " + Editor.isZoom);
    }
    SettingsMenu.hide();

}

/***
 **** Save 'default' data into DB table **
 ***/

function errorHandler(transaction, error) {
    if (error.code == 1) {
	// DB Table already exists
    } else {
	// Error is a human-readable string.
	//console.log('Oops.  Error was ' + error.message + ' (Code ' + error.code + ')');
    }
    return false;
}


function nullDataHandler() {
    //console.log("SQL Query Succeeded");
}

/***
 **** SELECT DATA **
 ***/

function selectAll() {
    DEMODB.transaction(

    function(transaction) {
	transaction.executeSql("SELECT * FROM page_settings;", [], dataSelectHandler, errorHandler);
    });
}

/***
 **** DELETE DB TABLE **
 ***/

function dropTables() {
    DEMODB.transaction(

    function(transaction) {
	transaction.executeSql("DROP TABLE page_settings;", [], nullDataHandler, errorHandler);
    });
    //console.log("Table 'page_settings' has been dropped.");
    location.reload();
}