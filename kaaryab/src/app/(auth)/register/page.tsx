import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Join thousands of Afghans building their careers with KaarYab.">
      <RegisterForm />
    </AuthShell>
  );
}
