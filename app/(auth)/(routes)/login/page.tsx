"use client";

import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { toast } = useToast();

  async function setJWTToken() {
    try {
      const response = await axios.post("api/login", {
        token,
      });

      toast({ description: response.data.message });

      router.replace("/dashboard");
    } catch (error: any) {
      toast({ description: error.response.data.message });
    }
  }

  useEffect(() => {
    setJWTToken();
  }, []);

  return (
    <div>
      Loading ... <br /> Please wait for a bit
    </div>
  );
}
