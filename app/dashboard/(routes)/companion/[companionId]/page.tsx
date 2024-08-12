import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

import { CompanionForm } from "./components/companion-form";
import getCurrentUser from "@/lib/getCurrentUser";
import { cookies } from "next/headers";

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
}

const CompanionIdPage = async ({ params }: CompanionIdPageProps) => {
  const token = cookies().get("companion_auth")?.value!;
  const currentUser = await getCurrentUser(token);
  const userId = currentUser.id;

  const validSubscription = true; //await checkSubscription({ userId });

  if (!validSubscription) {
    return redirect("/dashboard");
  }

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId,
    },
  });

  const categories = await prismadb.category.findMany();

  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
