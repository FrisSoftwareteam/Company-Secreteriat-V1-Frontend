import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        <ForgotPasswordForm />

        <p className="auth-footer-text">
          Remember your password?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
