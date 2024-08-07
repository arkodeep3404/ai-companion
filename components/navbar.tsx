"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";
import { Sparkles, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useProModal } from "@/hooks/use-pro-modal";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const font = Poppins({ weight: "600", subsets: ["latin"] });
interface NavbarProps {
  isPro: boolean;
}

export const Navbar = ({ isPro }: NavbarProps) => {
  const proModal = useProModal();
  const router = useRouter();
  const { toast } = useToast();

  async function logout() {
    const response = await axios.post("/api/logout");
    toast({ description: response.data.message });
    router.replace("/signin");
  }

  return (
    <div className="fixed z-50 flex h-16 w-full items-center justify-between border-b border-primary/10 bg-secondary px-4 py-2">
      <div className="flex items-center">
        <MobileSidebar isPro={isPro} />
        <Link href="/">
          <h1
            className={cn(
              "hidden text-xl font-bold text-primary md:block md:text-3xl",
              font.className,
            )}
          >
            companion.ai
          </h1>
        </Link>
      </div>
      <div className="flex items-center gap-x-3">
        <Button onClick={logout} size="sm" variant="premium">
          Logout
          <LogOut className="ml-2 h-4 w-4 fill-white text-white" />
        </Button>

        {!isPro && (
          <Button onClick={proModal.onOpen} size="sm" variant="premium">
            Upgrade
            <Sparkles className="ml-2 h-4 w-4 fill-white text-white" />
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
