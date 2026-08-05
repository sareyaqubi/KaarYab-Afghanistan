"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth";
import type { Role } from "@/lib/types";
import { Logo } from "@/components/ui/logo";

interface RoleGateProps {
  roles?: Role[];
  children: ReactNode;
  fallbackHref?: string;
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Logo className="h-12 w-12 animate-pulse" />
      <div className="h-2.5 w-40 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

const emptySubscribe = () => () => {};

export function RoleGate({ roles, children, fallbackHref = "/" }: RoleGateProps) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!currentUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (roles && !roles.includes(currentUser.role)) {
      router.replace(fallbackHref);
    }
  }, [currentUser, roles, pathname, router, fallbackHref]);

  if (!hydrated) return <PageLoader />;
  if (!currentUser) return <PageLoader />;
  if (roles && !roles.includes(currentUser.role)) return <PageLoader />;

  return <>{children}</>;
}
