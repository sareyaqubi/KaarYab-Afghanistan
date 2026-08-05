import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send you a secure reset link.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
