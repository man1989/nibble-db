"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  DB: () => DB
});
module.exports = __toCommonJS(index_exports);

// lib/db.ts
var import_node_path2 = require("path");

// lib/collection.ts
var import_promises = require("fs/promises");
var import_node_path = require("path");
var import_uuid = require("uuid");

// lib/filter.ts
var traversable = {
  $and: true,
  $or: true,
  $nor: true
};
function _defaults(a2, b) {
  if (a2 && b) {
    for (var key in b) {
      if ("undefined" == typeof a2[key])
        a2[key] = b[key];
    }
  }
  return a2;
}
var Filtr = class {
  query;
  stack;
  constructor(query) {
    this.query = query;
    this.stack = parseQuery(query);
  }
  /**
  * ## .comparators
  *
  * Object containing all query compators.
  */
  static comparators = {
    $gt: function(a2, b) {
      return a2 > b;
    },
    $gte: function(a2, b) {
      return a2 >= b;
    },
    $lt: function(a2, b) {
      return a2 < b;
    },
    $lte: function(a2, b) {
      return a2 <= b;
    },
    $all: function(a2, b) {
      for (var i = 0; i < b.length; i++) {
        if (!~a2.indexOf(b[i])) return false;
      }
      return true;
    },
    $exists: function(a2, b) {
      return !!a2 == b;
    },
    $mod: function(a2, b) {
      return a2 % b[0] == b[1];
    },
    $eq: function(a2, b) {
      return a2 == b;
    },
    $ne: function(a2, b) {
      return a2 != b;
    },
    $in: function(a2, b) {
      return ~b.indexOf(a2) ? true : false;
    },
    $nin: function(a2, b) {
      return ~b.indexOf(a2) ? false : true;
    },
    $size: function(a2, b) {
      return a2.length && b ? a2.length == b : false;
    },
    $or: function(a2) {
      var res = false;
      for (var i = 0; i < a2.length; i++) {
        var fn = a2[i];
        if (fn) res = true;
      }
      return res;
    },
    $nor: function(a2) {
      var res = true;
      for (var i = 0; i < a2.length; i++) {
        var fn = a2[i];
        if (fn) res = false;
      }
      return res;
    },
    $and: function(a2) {
      var res = true;
      for (var i = 0; i < a2.length; i++) {
        var fn = a2[i];
        if (!fn) res = false;
      }
      return res;
    }
  };
  /**
   * # .getPathValue(path, object)
   *
   * This is a convience function offed by Filtr to allow
   * the retrieval of values in an object given a string path.
   *
   *     var obj = {
   *         prop1: {
   *             arr: ['a', 'b', 'c']
   *           , str: 'Hello'
   *         }
   *       , prop2: {
   *             arr: [ { nested: 'Universe' } ]
   *           , str: 'Hello again!'
   *         }
   *     }
   *
   * The following would be the results.
   *
   *     filtr.getPathValue('prop1.str', obj); // Hello
   *     filtr.getPathValue('prop1.att[2]', obj); // b
   *     filtr.getPathValue('prop2.arr[0].nested', obj); // Universe
   *
   * @param {String} path
   * @param {Object} object
   * @returns {Object} value or `undefined`
   */
  static getPathValue(path, obj) {
    var parsed = parsePath(path);
    return getPathValue(parsed, obj);
  }
  /**
   * # .setPathValue(path, value, object)
   *
   * This is a convience function offered by Filtr to allow
   * the defining of a value in an object at a given string path.
   *
   *     var obj = {
   *         prop1: {
   *             arr: ['a', 'b', 'c']
   *           , str: 'Hello'
   *         }
   *       , prop2: {
   *             arr: [ { nested: 'Universe' } ]
   *           , str: 'Hello again!'
   *         }
   *     }
   *
   * The following would be acceptable.
   *
   *     filtr.setPathValue('prop1.str', 'Hello Universe!', obj);
   *     filtr.setPathValue('prop1.arr[2]', 'B', obj);
   *     filtr.setPathValue('prop2.arr[0].nested.value', { hello: 'universe' }, obj);
   *
   * @param {String} path
   * @param {*} value
   * @param {Object} object
   * @api public
   */
  static setPathValue(path, val, obj) {
    var parsed = parsePath(path);
    setPathValue(parsed, val, obj);
  }
  /**
   * # .test(data, [options]);
   *
   * The primary testing mechanism for `Filtr` can be
   * configured to return any number of possible formats.
   *
   * ### Options
   *
   * * *type*: input modifier
   * * * `set`: (default) assert that the data provided is an array. test each item.
   * * * `single`: assert that the data provided is a single item. return boolean.
   * * *spec*: output modifer
   * * * `subset`: (default) return an array containing a subset of matched items
   * * * `boolean`: return an array of the original length with each item being a boolean when object passed or failed.
   * * * `index`: return an array of numbers matching the index of passed object in the original array
   *
   * @param {Array|Object} data to test. must be an array unless option `type: 'single'`.
   * @param {Object} options (optional)
   * @returns {Array|Boolean} result based on options
   */
  test(data, opts) {
    let defaults = {
      type: "set",
      // set || single
      spec: "subset"
      // subset || boolean || index
    }, options = _defaults(opts || {}, defaults), res = options.type == "single" ? false : [];
    let dataList = options.type == "single" ? [data] : data;
    for (var di = 0, dl = dataList.length; di < dl; di++) {
      var datum = dataList[di], pass = testFilter(datum, this.stack);
      if (options.type == "single") {
        res = pass;
      } else {
        res = res;
        switch (options.spec) {
          case "boolean":
            res.push(pass);
            break;
          case "index":
            if (pass) res.push(di);
            break;
          default:
            if (pass) res.push(datum);
            break;
        }
      }
    }
    return res;
  }
};
function parsePath(path) {
  var str = path.replace(/\[/g, ".["), parts = str.match(/(\\\.|[^.]+?)+/g);
  return (parts || []).map(function(value) {
    var re = /\[(\d+)\]$/, mArr = re.exec(value);
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value };
  });
}
function getPathValue(parsed, obj) {
  var tmp = obj, res;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ("undefined" !== typeof part.p)
        tmp = tmp[part.p];
      else if ("undefined" !== typeof part.i)
        tmp = tmp[part.i];
      if (i == l - 1) res = tmp;
    } else {
      res = void 0;
    }
  }
  return res;
}
function setPathValue(parsed, val, obj) {
  var tmp = obj;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if ("undefined" !== typeof tmp) {
      if (i == l - 1) {
        if ("undefined" !== typeof part.p)
          tmp[part.p] = val;
        else if ("undefined" !== typeof part.i)
          tmp[part.i] = val;
      } else {
        if ("undefined" !== typeof part.p && tmp[part.p])
          tmp = tmp[part.p];
        else if ("undefined" !== typeof part.i && tmp[part.i])
          tmp = tmp[part.i];
        else {
          var next = parsed[i + 1];
          if ("undefined" !== typeof part.p) {
            tmp[part.p] = {};
            tmp = tmp[part.p];
          } else if ("undefined" !== typeof part.i) {
            tmp[part.i] = [];
            tmp = tmp[part.i];
          }
        }
      }
    } else {
      if (i == l - 1) tmp = val;
      else if ("undefined" !== typeof part.p)
        tmp = {};
      else if ("undefined" !== typeof part.i)
        tmp = [];
    }
  }
}
function parseQuery(query) {
  let stack = [];
  for (let c in query) {
    const cmd = c;
    let qry = {};
    var params = query[cmd];
    if (cmd[0] == "$") {
      qry.test = parseFilter(query);
    } else {
      if ("string" == typeof params || "number" == typeof params || "boolean" == typeof params) {
        qry.test = parseFilter({ $eq: params });
        qry.path = parsePath(cmd);
      } else {
        qry.test = parseFilter(params);
        qry.path = parsePath(cmd);
      }
    }
    stack.push(qry);
  }
  return stack;
}
var a = Filtr.comparators;
function parseFilter(query) {
  var stack = [];
  for (let t in query) {
    const test = t;
    const tt = test;
    var fn = Filtr.comparators[tt], params = query[test], traverse = false;
    let st = [];
    let nq;
    if (traversable[test]) {
      traverse = true;
      for (var i = 0; i < params.length; i++) {
        nq = void 0;
        var p = params[i];
        if ("string" == typeof p || "number" == typeof p || "boolean" == typeof p) {
          traverse = false;
        } else {
          nq = parseQuery(p);
        }
        st.push(nq);
      }
    }
    stack.push({
      fn,
      params: traverse ? st : params,
      traverse
    });
  }
  return stack;
}
function testFilter(val, stack) {
  var pass = true;
  for (var si = 0, sl = stack.length; si < sl; si++) {
    var filter2 = stack[si], el = filter2.path ? getPathValue(filter2.path, val) : val;
    if (!_testFilter(el, filter2.test)) pass = false;
  }
  return pass;
}
function _testFilter(val, stack) {
  var res = true;
  for (var i = 0; i < stack.length; i++) {
    var test = stack[i], params = test.params;
    if (test.traverse) {
      var p = [];
      for (var ii = 0; ii < params.length; ii++)
        p.push(testFilter(val, params[ii]));
      params = p;
    }
    if (test.fn.length == 1) {
      if (!test.fn(params)) res = false;
    } else {
      if (!test.fn(val, params)) res = false;
    }
  }
  return res;
}
function filter(query) {
  return new Filtr(query);
}

// lib/util.ts
var NOT_VALID = "provide a valid input";
function isObjectLiteral(_obj) {
  return Object.getPrototypeOf(Object.getPrototypeOf(_obj)) === null;
}
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
function validateInput(obj) {
  if (!obj || !isObjectLiteral(obj)) {
    throw new Error(NOT_VALID);
  }
}

// lib/collection.ts
var NOT_VALID2 = "provide a valid input";
var Collection = class _Collection {
  fullName;
  rootPath = (0, import_node_path.join)(__dirname, "userData");
  constructor(fullName, rootPath) {
    this.fullName = fullName;
    this.rootPath = rootPath || this.rootPath;
  }
  static async create(rootPath, fullName) {
    let path = rootPath + "/" + fullName.split(".").join("/");
    path += ".ldb";
    try {
      await (0, import_promises.stat)(path);
    } catch (err) {
      await (0, import_promises.writeFile)(path, "");
    }
    return new _Collection(fullName, rootPath);
  }
  getPath() {
    let path = this.rootPath + "/" + this.fullName.split(".").join("/");
    path += ".ldb";
    return path;
  }
  async insert(obj) {
    if (isEmptyObject(obj)) throw NOT_VALID2;
    let uniqueKey = (0, import_uuid.v4)();
    let path = this.getPath();
    obj = Object.assign({
      "_id": uniqueKey
    }, obj);
    try {
      let fileData = await (0, import_promises.readFile)(path, "utf-8") || "[]";
      const data = JSON.parse(fileData);
      data.push(obj);
      fileData = JSON.stringify(data);
      return (0, import_promises.writeFile)(path, fileData);
    } catch (err) {
      throw err;
    }
  }
  async find(query) {
    let path = this.getPath();
    const filtered = filter(query);
    let fileData = await (0, import_promises.readFile)(path, "utf-8");
    try {
      let results = JSON.parse(fileData);
      const filteredRes = filtered.test(results, query);
      return filteredRes;
    } catch (err) {
    }
  }
  async update(query, obj) {
    validateInput(query);
    validateInput(obj);
    const filtered = filter(query);
    let fileData = await (0, import_promises.readFile)(this.getPath(), "utf-8");
    try {
      let results = JSON.parse(fileData);
      const updates = filtered.test(results, query);
      updates.forEach((row) => {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            row[key] = obj[key];
          }
        }
      });
      return (0, import_promises.writeFile)(this.getPath(), JSON.stringify(results));
    } catch (err) {
    }
  }
  async delete(query) {
    const filtered = filter(query);
    let fileData = await (0, import_promises.readFile)(this.getPath(), "utf-8");
    try {
      let results = JSON.parse(fileData);
      const filteredRes = filtered.test(results, query);
      const deletedData = results.filter((result) => {
        return filteredRes.findIndex((f) => f._id === result._id) === -1;
      });
      return (0, import_promises.writeFile)(this.getPath(), JSON.stringify(deletedData));
    } catch (err) {
    }
  }
};

// lib/db.ts
var import_promises2 = require("fs/promises");
var DB = class _DB {
  static _rootPath = (0, import_node_path2.join)(__dirname, "../.$$db$$");
  _collections = /* @__PURE__ */ new Map();
  _current = {};
  name;
  constructor(name) {
    this.name = name;
  }
  static getPath(name) {
    return this._rootPath + "/" + (name || this.name);
  }
  static async create(name, rootPath) {
    this._rootPath = rootPath || this._rootPath;
    try {
      await (0, import_promises2.stat)(this._rootPath);
    } catch (err) {
      await (0, import_promises2.mkdir)((0, import_node_path2.join)(this._rootPath, name), {
        recursive: true
      });
    }
    return new _DB(name);
  }
  getName() {
    return this.name;
  }
  static use(name) {
    let path = this.getPath(name);
    return new _DB(name);
  }
  async useCollection(name) {
    let collection = this._collections.get(name);
    if (!collection) {
      collection = await Collection.create(_DB._rootPath, this.name + "." + name);
      this._collections.set(name, collection);
    }
    this._current = collection;
    return collection;
  }
  removeCollection(name) {
    this._collections.delete(name);
  }
  getCollectionName() {
  }
  getCollectionList() {
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DB
});
/*!
 * define what comparators are traversable
 */
/*!
 * helper function for setting defaults
 */
/*!
 * Main exports
 */
/*!
 * Version number
 */
/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 *
 * @param {String} path
 * @returns {Object} parsed
 */
/*!
 * ## parseQuery(query)
 *
 * Given the query input, create a reusable definition
 * for how to test data again the query.
 *
 * @param {Object} query
 * @returns {Array} stack to be used with `Filtr.prototype.test`
 */
/*!
 * ## parseFilter (query)
 *
 * Given that the root object passed is a comparator definition,
 * return a consumable test definition.
 *
 * @param {Object} query
 * @returns {Array} stack for use as input with `testFilter`
 */
/*!
 * ## testFilter(value, stack)
 *
 * Given a well-formed stack from `parseFilter`, test
 * a given value again the stack.
 *
 * As the value is passed to a comparator, if that comparator
 * can interpret the value, false will be return. IE $gt: 'hello'
 *
 * @param {Object} value for consumption by comparator test
 * @param {Array} stack from `parseFilter`
 * @returns {Boolean} result
 * @api private
 */
//# sourceMappingURL=index.js.map