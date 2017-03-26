(function () {
    "use strict";
    const fs = require("fs");
    const ROOT_PATH = __dirname + "/userData";
    const NOT_VALID = "provide a valid input";


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
        validateInput(obj);
        if(isEmptyObject(obj)) throw NOT_VALID;
        let date = new Date();
        let uniqueKey = Symbol(date.getTime()).toString();
        let path = this.getPath();
        Object.assign(obj, {
            "_id": uniqueKey
        });
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
        validateInput(query);
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
        validateInput(query);
        validateInput(obj);
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

    function isObjectLiteral(_obj) {
        return (Object.getPrototypeOf(Object.getPrototypeOf(_obj)) === null);
    }

    function isEmptyObject(obj){
        return Object.keys(obj).length===0;
    }
    
    function validateInput(obj) {
        if (!obj || !isObjectLiteral(obj)){
          throw NOT_VALID;   
        }
    }

    module.exports = (function create() {
        if (!fs.existsSync(ROOT_PATH)) fs.mkdirSync(ROOT_PATH);
        return new DB("default");
    }());

}())
