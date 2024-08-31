// import { MemoryManager } from "@/lib/memory";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } },
) {
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

    if (!params.companionId) {
      return new NextResponse("Companion ID is required", { status: 400 });
    }

    // const memoryManager = await MemoryManager.getInstance();
    // const companionKey = {
    //   companionId: params.companionId,
    //   userId: user.id,
    //   modelName: "gpt-3.5-turbo",
    // };
    // await memoryManager.clearHistory(companionKey);

    // TODO: DELETE CHAT HISTORY FROM DYNAMO DB UPON COMPANION DELETION

    await prismadb.message.deleteMany({
      where: {
        companionId: params.companionId,
        userId: user.id,
      },
    });

    return NextResponse.json("Success");
  } catch (error) {
    console.log("[COMPANION_HISTORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
