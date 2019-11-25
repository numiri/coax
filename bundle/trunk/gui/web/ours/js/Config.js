// JavaScript Document

function Config(_name, funct, command, status) {
    this.name = _name;
    this.command = command;
    this.status = status;
    this.funct = funct;
}

Config.prototype.change = function(_name, funct, command, status) {
    this.name = _name;
    this.command = command;
    this.status = status;
    this.funct = funct;
}

Config.prototype.getComman = function() {
    return this.command;
}
Config.prototype.getStatus = function() {
    return this.status;
}

ArrConfig.configs = new Array();

function ArrConfig() {

}

ArrConfig.Add = function(obj) {

    ArrConfig.configs.push(obj);
}

ArrConfig.Addarr = function() {
    ArrConfig.clear();
    var zoom1 = new Config("zoom1", "fnZoom1", "-t 1", true);
    ArrConfig.Add(zoom1);
    var zoom2 = new Config("zoom2", "fnZoom2", "-t 2", true);
    ArrConfig.Add(zoom2);
    var s2 = new Config("s2", "fnSelect2", "-l 2", true);
    ArrConfig.Add(s2);
    var s3 = new Config("s3", "fnSelect3", "-l 3", true);
    ArrConfig.Add(s3);
    var fence = new Config("fence", "fnPince", "-f 1", true);
    ArrConfig.Add(fence);
}

ArrConfig.clear = function() {
    while (ArrConfig.configs.length > 0) {
        ArrConfig.configs.pop();
    }
    ArrConfig.configs.length = 0;
}

ArrConfig.getStatus = function(command) {
    for (var i = 0; i < ArrConfig.configs.length; i++) {
        if (command == ArrConfig.configs[i].getComman()) {
            return ArrConfig.configs[i].getStatus();
        }
    }
    return false;
}