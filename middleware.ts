import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that require an admin session
  const isAdminPath = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  // Paths that require a student session
  const isStudentPath = pathname.startsWith("/student");

  if (isAdminPath || isStudentPath) {
    const session = request.cookies.get("session")?.value;
    
    if (!session) {
      const redirectUrl = new URL(isAdminPath ? "/admin/login" : "/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    const payload = await decrypt(session);

    if (!payload) {
      const redirectUrl = new URL(isAdminPath ? "/admin/login" : "/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based check
    if (isAdminPath && payload.role !== "admin" && payload.role !== "superadmin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (isStudentPath && payload.role !== "student") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
