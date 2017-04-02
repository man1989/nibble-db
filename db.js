"use strict";
const fs = require("fs");
const util = require('./util.js');
const ROOT_PATH = __dirname + "/userData";
const NOT_VALID = "provide a valid input";
const Collection = require('./collection.js');

let DB = function (name) {
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

DB.prototype.getCollectionName = function (name) {
    if (this[name]) return this[name].name;
};

DB.prototype.getCollectionList = () => {
    // return list of collections
};

module.exports = (function create() {
    if (!fs.existsSync(ROOT_PATH)) fs.mkdirSync(ROOT_PATH);
    return new DB("default");
}());
