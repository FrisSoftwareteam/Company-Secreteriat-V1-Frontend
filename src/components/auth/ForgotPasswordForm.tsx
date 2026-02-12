"use client";

import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") || ""),
    };

    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process request.");
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <p className="notice">
        If the email exists, a password reset link has been sent. Check your inbox and spam folder.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      {error ? <p className="notice">{error}</p> : null}
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}

