import prismadb from "@/lib/prismadb";
import zod from "zod";
import sendLoginEmail from "@/lib/sendEmail";
import { v4 } from "uuid";

const signinBody = zod.object({
  email: zod.string().email(),
});

export async function POST(req: Request) {
  const parsedBody = await req.json();
  const { success } = signinBody.safeParse(parsedBody);

  if (!success) {
    return Response.json(
      {
        message: "incorrect email",
      },
      { status: 411 },
    );
  }

  const origin = req.headers.get("origin") || "";
  const { email } = parsedBody;

  const token = v4();

  const user = await prismadb.user.update({
    where: { email: email },
    data: { token: token },
  });

  if (user) {
    await sendLoginEmail(email, user.firstName, token, origin);

    return Response.json(
      {
        message: "please check email to login.",
      },
      { status: 200 },
    );
  } else {
    return Response.json(
      {
        message: "no user exists with given email",
      },
      { status: 404 },
    );
  }
}
