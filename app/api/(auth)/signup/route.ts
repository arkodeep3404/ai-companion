import prismadb from "@/lib/prismadb";
import zod from "zod";
import sendLoginEmail from "@/lib/sendEmail";
import { v4 } from "uuid";

const signupBody = zod.object({
  email: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
});

export async function POST(req: Request) {
  const parsedBody = await req.json();
  const { success } = signupBody.safeParse(parsedBody);

  if (!success) {
    return Response.json(
      {
        message: "incorrect inputs",
      },
      { status: 411 },
    );
  }

  const { firstName, lastName, email } = parsedBody;
  const origin = req.headers.get("origin") || "";

  const existingUser = await prismadb.user.findUnique({
    where: { email: email },
  });

  if (existingUser) {
    return Response.json(
      {
        message: "email already exists",
      },
      { status: 411 },
    );
  }

  const token = v4();

  const newUser = await prismadb.user.create({
    data: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      token: token,
    },
  });

  await sendLoginEmail(email, firstName, token, origin);

  return Response.json(
    {
      message: "user created. please check email to login.",
    },
    { status: 200 },
  );
}
