import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export default async function middleware(request: NextRequest) {
  const token = cookies().get("companion_auth")?.value!;
  const url = request.nextUrl;
  const response = NextResponse.next();

  if (token) {
    try {
      const decoded = (await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET) as any,
      )) as any;
      response.headers.set("userId", decoded.payload.jti);
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        {
          message: "something went wrong. please try again",
        },
        { status: 500 },
      );
    }
  }

  if (
    token &&
    (url.pathname.startsWith("/signup") ||
      url.pathname.startsWith("/signin") ||
      url.pathname.startsWith("/login"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return response;
}
