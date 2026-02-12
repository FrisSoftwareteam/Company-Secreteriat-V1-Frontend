"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type ResetPasswordFormProps = {
  initialToken?: string;
};

export function ResetPasswordForm({ initialToken = "" }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const token = String(formData.get("token") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!token) {
      setError("Reset token is required.");
      setPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <p className="notice">
        Password updated successfully. Redirecting to sign in...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label htmlFor="token">Reset Token</label>
        <input id="token" name="token" type="text" defaultValue={initialToken} required />
      </div>
      <div className="form-field">
        <label htmlFor="password">New Password</label>
        <input id="password" name="password" type="password" minLength={8} required />
      </div>
      <div className="form-field">
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
      </div>
      {error ? <p className="notice">{error}</p> : null}
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Updating..." : "Update Password"}
      </button>
      <p style={{ margin: 0, textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
        <Link href="/login" style={{ fontWeight: 600 }}>
          Back to login
        </Link>
      </p>
    </form>
  );
}
