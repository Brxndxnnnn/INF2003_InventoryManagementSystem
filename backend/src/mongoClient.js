import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI not set in .env");
  process.exit(1);
}

let client;
let db;

export const connectMongo = async () => {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();

  db = client.db("usoimpnosql");

  console.log("Connected to MongoDB");

  // Create indexes
  const notifications = db.collection("notifications");

  await notifications.createIndex(
    { user_id: 1, read: 1, created_at: -1 },
    { name: "idx_user_read_createdAt" }
  );

  await notifications.createIndex(
    { created_at: 1 },
    {
      expireAfterSeconds: 60 * 60 * 24 * 7, // expires after 1 week
      name: "idx_ttl_createdAt_7d"
    }
  );

  return db;
};



export const getDb = () => {
  if (!db) {
    throw new Error("MongoDB not connected. Call connectMongo() first.");
  }
  return db;
};
