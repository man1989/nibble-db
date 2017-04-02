const db = require("./db.js");
let users = db.useCollection("users"); // will create and return collection called "users"
users.insert({"name":"Logan"});
users.insert({"name":"Batman"});

console.log(users.find({})) //will return all the records for users collection

console.log(users.find({"name":"Batman"})); //will return the matched record
