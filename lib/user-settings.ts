import { MAX_AI_REQUESTS_FREE_COUNTS } from "@/constants";
import prismadb from "./prismadb";
import getCurrentUser from "@/lib/getCurrentUser";
import { cookies } from "next/headers";

export const decreaseAiRequestsCount = async () => {
  const token = cookies().get("companion_auth")?.value!;
  const currentUser = getCurrentUser(token);
  const userId = currentUser.id;

  if (!userId) {
    return;
  }

  const userSettings = await prismadb.userSettings.findUnique({
    where: {
      userId,
    },
  });

  if (userSettings && userSettings.aiRequestsCount > 0) {
    await prismadb.userSettings.update({
      where: {
        userId,
      },
      data: {
        aiRequestsCount: userSettings.aiRequestsCount - 1,
      },
    });
  } else {
    console.log("WARNING: failed to decrease ai requests count.");
  }
};

export const checkAiRequestsCount = async () => {
  const token = cookies().get("companion_auth")?.value!;
  const currentUser = getCurrentUser(token);
  const userId = currentUser.id;

  if (!userId) {
    return false;
  }

  let userSettings = await prismadb.userSettings.findUnique({
    where: {
      userId,
    },
  });

  if (userSettings === null) {
    userSettings = await prismadb.userSettings.create({
      data: { userId: userId, aiRequestsCount: MAX_AI_REQUESTS_FREE_COUNTS },
    });
  }

  if (userSettings.aiRequestsCount > 0) {
    return true;
  } else {
    return false;
  }
};
