# nibble-db
small database which uses nodejs fs module to store you data
### Prerequisites
you need to have node version 6 and above
### installing
```
npm install nibble-db
```
### Example
How to require and insert a record
```
const db = require("nibble-db");
let users = db.useCollection("users"); // will create and return collection called "users"
users.insert({"name":"Logan"});
users.insert({"name":"Batman"});
```
### Find the record(s)
how to quey the records,
```
users.find({}) //will return all the records for users collection
users.find({"name":"Batman"}) //will return the matched record
```

### update the record(s)
```
//will update the record, first param is query object and second params is property that items you want to add
users.update({name:"Logan"}, {"Property":"Marvel"}); 
```
