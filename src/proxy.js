import { NextResponse } from "next/server";
import { auth } from "./lib/auth"; 
import { headers } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. STAGE ONE: Aggressive Path Interception
  const isBooking = pathname.startsWith("/appointments/book");
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/appointments");

  // If it's not a route we care about, skip processing immediately
  if (!isProtected && !isBooking) return NextResponse.next();

  // 2. STAGE TWO: Session Verification
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (authErr) {
    console.error("[proxy] Session authentication check crashed:", authErr.message);
  }

  // FORCE login if accessing protected files without a valid session
  if (!session) {
    return NextResponse.redirect(new URL("/Authentication_pages", request.url));
  }

  const userEmail = session.user?.email;
  if (!userEmail) return NextResponse.next();

  // 3. STAGE THREE: Database State Restriction Evaluation
  try {
    // encodeURIComponent handles matching special email strings safely
    const res = await fetch(`${BACKEND}/api/appointments/check-restriction/${encodeURIComponent(userEmail)}`, {
      cache: "no-store",
    });
    
    const data = await res.json();
    
    if (data && data.success) {
      const { status, until } = data;

      // Match against restricted rules
      if (status === "restricted" && isBooking) {
        const untilFormatted = until
          ? new Date(until).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            })
          : "";
        const url = new URL("/find-doctors", request.url);
        url.searchParams.set("restricted", "true");
        url.searchParams.set("until", untilFormatted);
        return NextResponse.redirect(url);
      }

      // Match against banned rules
      if (status === "banned") {
        return NextResponse.redirect(new URL("/banned", request.url));
      }
    }
  } catch (err) {
    console.error("[proxy] Backend restriction lookup failed completely:", err.message);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
  ],
};