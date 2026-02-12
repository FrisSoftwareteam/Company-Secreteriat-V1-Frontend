"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { AuthUser, useAuth } from "@/components/providers/AuthProvider";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      loginAs: String(formData.get("loginAs") || ""),
      identifier: String(formData.get("identifier") || ""),
      password: String(formData.get("password") || ""),
    };

    try {
      const data = await apiRequest<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSession(data.token, data.user);
      router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label htmlFor="loginAs">Login as</label>
        <select id="loginAs" name="loginAs" defaultValue="USER" required>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="identifier">Username or Email</label>
        <input id="identifier" name="identifier" type="text" required />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <div style={{ marginTop: "-8px", textAlign: "right" }}>
        <Link href="/forgot-password" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          Forgot password?
        </Link>
      </div>
      {error ? <p className="notice">{error}</p> : null}
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
