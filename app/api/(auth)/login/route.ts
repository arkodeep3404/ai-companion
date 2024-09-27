import prismadb from "@/lib/prismadb";
import zod from "zod";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const signinBody = zod.object({
  token: zod.string(),
});

export async function POST(req: Request) {
  try {
    const parsedBody = await req.json();
    const { success } = signinBody.safeParse(parsedBody);

    if (!success) {
      return Response.json(
        {
          message: "incorrect token",
        },
        { status: 411 },
      );
    }

    const { token } = parsedBody;

    const user = await prismadb.user.findUnique({
      where: { token: token },
    });

    if (user) {
      const userId: any = user.id;

      const jwtToken = await new SignJWT({})
        .setProtectedHeader({ alg: "HS256" })
        .setJti(userId)
        .setExpirationTime("30d")
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

      cookies().set("companion_auth", jwtToken, {
        maxAge: 1000 * 60 * 60 * 60 * 24 * 30,
        expires: 1000 * 60 * 60 * 60 * 24 * 30,
      });

      return Response.json(
        {
          message: "cookie set successfully",
        },
        { status: 200 },
      );
    } else {
      return Response.json(
        {
          message: "no user exists",
        },
        { status: 404 },
      );
    }
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        message: "something went wrong. please try again",
      },
      { status: 400 },
    );
  }
}
