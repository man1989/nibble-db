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
        firstName: "Manish",
        lastName: "Kumar"
    });

    await userCollection.insert({ 
        id: "2",
        firstName: "Manish",
        lastName: "Kumar"
    });

    let results = await userCollection.find({
        _id: "1c3afb7b-4a57-4dae-a632-4c8cc02e3932"
    })
    
    console.log("results: ", results);

    await userCollection.delete({
        id: "1"
    });
    
    results = await userCollection.find({});

    console.log("results: ", results);
})()