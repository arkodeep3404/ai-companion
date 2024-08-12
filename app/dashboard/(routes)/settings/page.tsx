import { SubscriptionButton } from "@/components/subscription-button";
import getCurrentUser from "@/lib/getCurrentUser";
import { checkSubscription } from "@/lib/subscription";
import { cookies } from "next/headers";

const SettingsPage = async () => {
  const token = cookies().get("companion_auth")?.value!;
  const currentUser = await getCurrentUser(token);
  const userId = currentUser.id;
  const isPro = await checkSubscription({ userId });

  return (
    <div className="h-full space-y-2 p-4">
      <h3 className="text-lg font-medium">Settings</h3>
      <div className="text-sm text-muted-foreground">
        {isPro
          ? "You are currently on a Pro plan."
          : "You are currently on a free plan."}
      </div>
      <SubscriptionButton isPro={isPro} />
    </div>
  );
};

export default SettingsPage;
