import { MongoClient, type Collection, type Db } from "mongodb";

const rawUri = process.env.MONGODB_URI ?? process.env.DATABASE_URL;
if (!rawUri) {
  throw new Error(
    "MONGODB_URI or DATABASE_URL must be set. Did you forget to provision MongoDB?",
  );
}

const databaseName = process.env.MONGODB_DB ?? "admission_system";

const client = new MongoClient(rawUri);
await client.connect();

export const db: Db = client.db(databaseName);

export const adminsCollection: Collection = db.collection("admins");
export const studentsCollection: Collection = db.collection("students");
export const applicationsCollection: Collection = db.collection("applications");
export const testsCollection: Collection = db.collection("tests");
export const questionsCollection: Collection = db.collection("questions");
export const testSessionsCollection: Collection = db.collection("test_sessions");
export const answersCollection: Collection = db.collection("answers");
export const resultsCollection: Collection = db.collection("results");
export const verificationLogsCollection: Collection = db.collection("verification_logs");
export const interviewsCollection: Collection = db.collection("interviews");
export const violationsCollection: Collection = db.collection("violations");
export const activityLogCollection: Collection = db.collection("activity_log");

export async function getNextId(collectionName: string): Promise<number> {
  const countersCollection = db.collection<{ _id: string; seq: number }>("counters");
  const result = await countersCollection.findOneAndUpdate(
    { _id: collectionName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  return result?.seq ?? 1;
}

export function omitMongoId<T extends { _id?: unknown }>(doc: T | null): Omit<T, "_id"> | null {
  if (!doc) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = doc;
  return rest as Omit<T, "_id">;
}

export function omitMongoIds<T extends { _id?: unknown }>(docs: T[]): Array<Omit<T, "_id">> {
  return docs.map((doc) => omitMongoId(doc) as Omit<T, "_id">);
}
