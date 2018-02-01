global.ROOT_PATH = __dirname + "/userData";
const util = require("./lib/util");
const Collection = require("./lib/collection")(util);
const DB = require("./lib/db")(Collection);

module.exports = new DB("default");