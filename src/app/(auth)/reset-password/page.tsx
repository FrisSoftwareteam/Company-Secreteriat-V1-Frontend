import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ marginBottom: "0.5rem" }}>Reset Password</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Enter your reset token and choose a new password
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}

