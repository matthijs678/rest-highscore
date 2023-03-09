const { MongoClient } = require('mongodb');

const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString);
let db;
let conn;

client.connect()
.then((c) => {
  conn = c;
  db = conn.db("gamedata");
  console.log("database success");
})
.catch(console.error);

module.exports = {
  getDB: () => {
    return db;
  }
};
