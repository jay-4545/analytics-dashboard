import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/(dashboard)/:path*",
    "/dashboard/:path*",
    "/analytics/:path*",
    "/users/:path*",
    "/revenue/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
