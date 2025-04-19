# nibble-db
small database which uses nodejs fs module to store your data
### Prerequisites
you need to have node version 6 and above
### installing
```
npm install nibble-db
```
### Example
How to require and insert a record
```
import { DB } from "../index";

(async () => {
    type User = {
        id: string
        firstName: string
        lastName: string
        age?: number
    }
    const serviceDb = await DB.create("service");
    const userCollection = await serviceDb.useCollection<User>("user");
    
    await userCollection.insert({ 
        id: "1",
        firstName: "Clark",
        lastName: "Kent"
    });

    await userCollection.insert({ 
        id: "1",
        firstName: "Lois",
        lastName: "Lane"
    });
})()
```
### Find the record(s)
how to quey the records,
```
const results = await userCollection.find({
    id: "1"
});
```

### update the record(s)
```
//will update the record, first param is query object and second params is property that items you want to add
await users.update({id:"1"}, { firstName: "Jonathan"}); 
```
