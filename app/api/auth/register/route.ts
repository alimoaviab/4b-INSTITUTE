import { NextResponse } from "next/server";
import { studentsCollection } from "@/lib/db";
import { pbkdf2Sync, randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, cnic, phone } = body;

    if (!name || !email || !password || !cnic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await studentsCollection.findOne({ 
      $or: [{ email }, { cnic }] 
    });

    if (existingUser) {
      return NextResponse.json({ error: "User with this email or CNIC already exists" }, { status: 409 });
    }

    const salt = randomBytes(16).toString("hex");
    const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

    const newStudent = {
      name,
      email,
      cnic,
      phone: phone || "",
      passwordHash: hash,
      salt: salt,
      role: "student",
      isEligible: true, // Initially true, can be checked during verification
      verificationStatus: "pending", // Custom field for tracking the 8-step verification
      verificationStep: 1, // 1 to 8
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await studentsCollection.insertOne(newStudent);

    return NextResponse.json({ success: true, message: "Registration successful" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
