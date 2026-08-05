import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your KaarYab account to continue.">
      <LoginForm />
    </AuthShell>
  );
}
