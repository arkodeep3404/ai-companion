import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import getCurrentUser from "@/lib/getCurrentUser";
import { checkSubscription } from "@/lib/subscription";
import { cookies } from "next/headers";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const token = cookies().get("companion_auth")?.value!;
  const currentUser = await getCurrentUser(token);
  const userId = currentUser.id;
  const isPro = await checkSubscription({ userId });

  return (
    <div className="h-full">
      <Navbar isPro={isPro} />
      <div className="fixed inset-y-0 mt-16 hidden h-full w-20 flex-col md:flex">
        <Sidebar isPro={isPro} />
      </div>
      <main className="h-full pt-16 md:pl-20">{children}</main>
    </div>
  );
};

export default RootLayout;
