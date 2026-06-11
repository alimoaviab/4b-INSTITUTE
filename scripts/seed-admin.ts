import { MongoClient } from "mongodb";
import crypto from "crypto";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "admission_system";

async function main() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const adminsCollection = db.collection("admins");

  const email = "fatimajaved821@gmail.com";
  const password = "admin123";
  const name = "Fatima Javed";

  // Hash password
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

  // Check if admin exists
  const existing = await adminsCollection.findOne({ email });
  if (existing) {
    console.log("Admin already exists!");
    // Update password
    await adminsCollection.updateOne({ email }, {
      $set: {
        passwordHash: hash,
        salt: salt // Added salt field because api looks for it separately in login route
      }
    });
    console.log("Password reset successfully for existing admin.");
  } else {
    // Insert new admin
    await adminsCollection.insertOne({
      email,
      passwordHash: hash,
      salt: salt,
      role: "superadmin",
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Admin created successfully!");
  }

  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  await client.close();
  process.exit(0);
}

main().catch(console.error);
