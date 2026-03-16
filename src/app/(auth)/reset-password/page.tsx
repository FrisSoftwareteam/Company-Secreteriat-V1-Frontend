import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams?: {
    token?: string;
  };
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams?.token || "";

  return (
    <div className="auth-form-wrap">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1>Reset Password</h1>
          <p>Enter your reset token and choose a new password</p>
        </div>

        <ResetPasswordForm initialToken={token} />
      </div>
    </div>
  );
}
