import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("userId");

    if (!userId) {
      return Response.json(
        {
          message: "userId not found. please login",
        },
        { status: 401 },
      );
    }

    const user = await prismadb.user.findUnique({ where: { id: userId } });

    if (!user) {
      return Response.json(
        {
          message: "user not found with given userId",
        },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const isPro = true; //await checkSubscription({ userId });

    if (!isPro) {
      return new NextResponse("Pro subscription required", { status: 403 });
    }

    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log("[COMPANION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
