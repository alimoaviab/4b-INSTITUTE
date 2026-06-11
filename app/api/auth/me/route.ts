import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { parseToken } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const adminId = parseToken(token);

    if (!adminId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const adminsCollection = await getCollection("admins");
    const admin = await adminsCollection.findOne({ id: adminId });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
