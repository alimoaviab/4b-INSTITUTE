import { NextResponse } from "next/server";
import { adminsCollection, studentsCollection } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { pbkdf2Sync } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim();
    const password = body.password;

    console.log("Login attempt for:", email);

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check Admins first
    let user: any = await adminsCollection.findOne({ email });
    let isStudent = false;
    console.log("Admin user found:", !!user, "Salt in user:", !!user?.salt);

    // If not admin, check Students
    if (!user) {
      user = await studentsCollection.findOne({ email });
      isStudent = true;
      console.log("Student user found:", !!user);
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify Password
    // In our new architecture, password hash uses salt and pbkdf2
    if (user.salt) {
      const hash = pbkdf2Sync(password, user.salt, 1000, 64, "sha512").toString("hex");
      console.log("Hash matches:", hash === user.passwordHash);
      if (hash !== user.passwordHash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    } else {
      // Fallback for old plaintext passwords during migration
      console.log("Plaintext matches:", password === user.passwordHash);
      if (password !== user.passwordHash) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    // Create session (sets the cookie via cookies() API)
    await createSession({
      id: user._id.toString(),
      role: user.role || (isStudent ? "student" : "admin"),
      name: user.name,
      email: user.email
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || (isStudent ? "student" : "admin")
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
