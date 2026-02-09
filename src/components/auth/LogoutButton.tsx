"use client";

import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { token, clearSession } = useAuth();

  const handleLogout = async () => {
    if (token) {
      try {
        await apiRequest("/api/auth/logout", { method: "POST" }, token);
      } catch {
        // no-op
      }
    }
    clearSession();
    router.push("/login");
  };

  return (
    <button className={`button ${className}`} type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}
