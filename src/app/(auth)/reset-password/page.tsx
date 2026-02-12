import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams?: {
    token?: string;
  };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams?.token || "";

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ marginBottom: "0.5rem" }}>Reset Password</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Enter your reset token and choose a new password
          </p>
        </div>

        <ResetPasswordForm initialToken={token} />
      </div>
    </div>
  );
}
