module.exports = function(Collection){
    "use strict";
    const fs = require("fs");
    const path = require("path");
    const NOT_VALID = "provide a valid input";
    console.log(ROOT_PATH);
    let DB = function (name) {
        DB.init();
        this.name = name;
        let path = this.getPath();
        try {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        } catch (err) {
            throw err;
        }
    };
    
    DB.init = function(){
        if (!fs.existsSync(ROOT_PATH)){
            fs.mkdirSync(ROOT_PATH);            
        };        
    };

    DB.prototype.getPath = function (name) {
        return ROOT_PATH + "/" + (name || this.name);
    };
    
    DB.prototype.getName = function () {
        return this.name;
    };
    
    DB.prototype.use = function (name) {
        let path = this.getPath(name);
        return new DB(name);
    };
    
    DB.prototype.useCollection = function (name) {
        this[name] = new Collection(name, this.name + "." + name);
        return this[name];
    };
    
    DB.prototype.getCollectionName = function () {
        //return current collection name;
    };
    
    DB.prototype.getCollectionList = function(){
        // return list of collections
    };
    return DB;
}