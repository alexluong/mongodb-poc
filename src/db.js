import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required");
  process.exit(1);
}

export function createDBClient() {
  let db;
  return {
    db() {
      return db;
    },
    async connect() {
      const uri = process.env.MONGODB_URI;
      const client = new MongoClient(uri);
      await client.connect();
      db = client.db();
      console.log("Connected to MongoDB");
    },
  };
}
