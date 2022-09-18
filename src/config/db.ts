import {MongoClient} from "mongodb";
// localhost setup
const mongoDb = "mongodb://admin:G4vmqy@localhost"
const client = new MongoClient(mongoDb)

export default client.db("bab");

client.connect((error, result) => {
    if (error) {
        console.error(error)
    } else {
        console.log("Mongo DB connection establish at", mongoDb)
    }
})
