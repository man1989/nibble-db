"use strict";
const fs = require("fs");
const util = require('./util.js');
const ROOT_PATH = __dirname + "/userData";
const NOT_VALID = "provide a valid input";

let Collection = function (name, fullName) {
    this.name = name;
    this.fullName = fullName;
    let path = this.getPath();
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "");
    }
};

Collection.prototype.getPath = function () {
    let path = ROOT_PATH + "/" + this.fullName.split(".").join("/");
    path += ".ldb";
    return path;
};

Collection.prototype.insert = function (obj) {
    util.validateInput(obj);
    if(util.isEmptyObject(obj)) throw NOT_VALID;
    let date = new Date();
    let uniqueKey = Symbol(date.getTime()).toString();
    let path = this.getPath();
    obj = Object.assign({
        "_id": uniqueKey
    }, obj);
    try {
        let data = fs.readFileSync(path, "utf-8") || "[]";
        data = JSON.parse(data);
        data.push(obj);
        data = JSON.stringify(data);
        fs.writeFileSync(path, data);
    } catch (err) {
        throw err;
    }
};

Collection.prototype.find = function (query) {
    util.validateInput(query);
    let path = this.getPath();
    let key, value;
    Object.keys(query).forEach((k) => {
        key = k;
        value = query[k];
    });
    let data = fs.readFileSync(path);
    try {
        data = JSON.parse(data);
        if (key && value) {
            data = data.filter((row) => {
                let flag = true;
                for (let key in query) {
                    if (flag && query.hasOwnProperty(key) && (row[key] != query[key])) {
                        flag = false;
                        break;
                    }
                }
                return flag;
            });
        }
        return data;
    } catch (err) {}
};

Collection.prototype.update = function (query, obj) {
    util.validateInput(query);
    util.validateInput(obj);
    let data = this.find({});
    let updates = [];
    data.forEach((row) => {
        let flag = true;
        for (let key in query) {
            if (flag && query.hasOwnProperty(key) && (row[key] != query[key])) {
                flag = false;
                break;
            }
        }
        if (flag) updates.push(row);
    });

    updates.forEach((row) => {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                row[key] = obj[key];
            }
        }
    });

    try {
        let path = this.getPath();
        if (fs.existsSync(path)) {
            data = JSON.stringify(data);
            fs.writeFileSync(path, data);
        }
    } catch (err) {
        throw err;
    }
};

module.exports = Collection;
