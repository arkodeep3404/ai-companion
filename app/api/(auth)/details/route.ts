import prismadb from "@/lib/prismadb";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const token =
    req.headers.get("token")! || cookies().get("companion_auth")?.value!;

  const decoded = (await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_SECRET) as any,
  )) as any;
  const userId = decoded.payload.jti;

  if (!userId) {
    return Response.json(
      {
        message: "userId not found. please login",
      },
      { status: 401 },
    );
  }

  const currentUser = await prismadb.user.findUnique({
    where: { id: userId },
  });

  if (currentUser) {
    return Response.json(
      {
        currentUser: currentUser,
      },
      { status: 200 },
    );
  } else {
    return Response.json(
      {
        message: "no user exists with given userId",
      },
      { status: 404 },
    );
  }
}

export async function POST(req: Request) {}
