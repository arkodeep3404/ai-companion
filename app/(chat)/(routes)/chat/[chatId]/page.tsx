import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

import { ChatClient } from "./components/client";
import getCurrentUser from "@/lib/getCurrentUser";
import { cookies } from "next/headers";

interface ChatIdPageProps {
  params: {
    chatId: string;
  };
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
  const token = cookies().get("companion_auth")?.value!;
  const currentUser = getCurrentUser(token);
  const userId = currentUser.id;

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.chatId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId,
        },
      },
    },
  });

  if (!companion) {
    return redirect("/");
  }

  return <ChatClient companion={companion} />;
};

export default ChatIdPage;
