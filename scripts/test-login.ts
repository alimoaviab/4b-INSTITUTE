import { MongoClient } from "mongodb";
import crypto from "crypto";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "admission_system";

async function test() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const adminsCollection = db.collection("admins");

  const email = "fatimajaved821@gmail.com";
  const user = await adminsCollection.findOne({ email });
  console.log("User found:", user ? "Yes" : "No");

  if (user) {
    console.log("User doc:", { ...user, passwordHash: "***" });
    const password = "admin123";
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, "sha512").toString("hex");
    console.log("Match:", hash === user.passwordHash);
  }

  await client.close();
}

test().catch(console.error);
