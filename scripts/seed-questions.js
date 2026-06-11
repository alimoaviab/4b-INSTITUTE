const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb+srv://javad-it:Test-123@cluster0.yoe7dd1.mongodb.net/admission_system?retryWrites=true&w=majority&appName=Cluster0";
const dbName = process.env.MONGODB_DB || "admission_system";

const questions = [
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "easy",
    tags: ["basics", "hardware"],
    text: "CPU کا مکمل نام کیا ہے؟",
    options: ["Central Processing Unit", "Central Program Unit", "Computer Personal Unit", "Central Processor Utility"],
    correctAnswer: "Central Processing Unit",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "easy",
    tags: ["basics", "storage"],
    text: "RAM کا مکمل نام کیا ہے؟",
    options: ["Random Access Memory", "Read Access Memory", "Run Access Memory", "Random Available Memory"],
    correctAnswer: "Random Access Memory",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "easy",
    tags: ["basics", "software"],
    text: "Operating System کی مثال کون سی ہے؟",
    options: ["Windows", "Microsoft Word", "Google Chrome", "Photoshop"],
    correctAnswer: "Windows",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "medium",
    tags: ["networking"],
    text: "انٹرنیٹ پر ڈیٹا بھیجنے کے لیے کون سا پروٹوکول استعمال ہوتا ہے؟",
    options: ["HTTP", "FTP", "TCP/IP", "All of the above"],
    correctAnswer: "All of the above",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "easy",
    tags: ["basics", "input-output"],
    text: "کی بورڈ کس قسم کا ڈیوائس ہے؟",
    options: ["Input Device", "Output Device", "Storage Device", "Processing Device"],
    correctAnswer: "Input Device",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "medium",
    tags: ["programming"],
    text: "HTML کا مکمل نام کیا ہے؟",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
    correctAnswer: "Hyper Text Markup Language",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "medium",
    tags: ["storage"],
    text: "1 کلو بائٹ (KB) میں کتنے بائٹس ہوتے ہیں؟",
    options: ["1024 Bytes", "1000 Bytes", "512 Bytes", "2048 Bytes"],
    correctAnswer: "1024 Bytes",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "hard",
    tags: ["programming", "database"],
    text: "SQL کا مکمل نام کیا ہے؟",
    options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
    correctAnswer: "Structured Query Language",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "true_false",
    difficulty: "easy",
    tags: ["basics"],
    text: "مانیٹر ایک آؤٹ پٹ ڈیوائس ہے۔",
    options: ["True", "False"],
    correctAnswer: "True",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    category: "Computer Science",
    subject: "Computer",
    type: "mcq",
    difficulty: "medium",
    tags: ["networking", "security"],
    text: "Firewall کا بنیادی مقصد کیا ہے؟",
    options: ["نیٹ ورک کی حفاظت", "ڈیٹا اسٹور کرنا", "پرنٹنگ کرنا", "سافٹ ویئر انسٹال کرنا"],
    correctAnswer: "نیٹ ورک کی حفاظت",
    marks: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("questions");

  const result = await col.insertMany(questions);
  console.log(`✅ ${result.insertedCount} Computer questions added successfully!`);

  await client.close();
  process.exit(0);
}

main().catch(console.error);
