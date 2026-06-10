import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from api-server
dotenv.config({ path: join(__dirname, 'artifacts/api-server/.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'admission_system';

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Database:', dbName);
console.log('URI:', uri ? uri.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
console.log('');

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  console.log('📡 Connecting to MongoDB Atlas...');
  await client.connect();
  console.log('✅ Successfully connected to MongoDB!');
  
  const db = client.db(dbName);
  
  // Test database operations
  console.log('\n📊 Database Info:');
  const collections = await db.listCollections().toArray();
  console.log(`Collections found: ${collections.length}`);
  
  if (collections.length > 0) {
    console.log('\nExisting collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
  }
  
  // Check admin collection
  const adminsCollection = db.collection('admins');
  const adminCount = await adminsCollection.countDocuments();
  console.log(`\n👤 Admin users: ${adminCount}`);
  
  if (adminCount > 0) {
    const admins = await adminsCollection.find({}, { projection: { email: 1, name: 1, role: 1 } }).toArray();
    console.log('Admin accounts:');
    admins.forEach(admin => console.log(`  - ${admin.email} (${admin.role})`));
  } else {
    console.log('⚠️  No admin users found. Will be created on first server start.');
  }
  
  console.log('\n✅ MongoDB is working correctly!');
  
} catch (error) {
  console.error('\n❌ MongoDB Connection Error:');
  console.error(error.message);
  
  if (error.message.includes('authentication')) {
    console.error('\n💡 Tip: Check your username and password in MONGODB_URI');
  } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
    console.error('\n💡 Tip: Check your internet connection or MongoDB Atlas network access settings');
  }
  
  process.exit(1);
} finally {
  await client.close();
  console.log('\n🔌 Connection closed.');
}
