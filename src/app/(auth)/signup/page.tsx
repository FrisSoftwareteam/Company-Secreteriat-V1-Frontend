import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="auth-form-wrap">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Create Account</h1>
          <p>Get started with the Company Secretarial Portal</p>
        </div>

        <SignupForm />

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
