import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email" subtitle="We sent a verification code to your email. Enter it below to activate your account.">
      <VerifyEmailForm />
    </AuthShell>
  );
}
