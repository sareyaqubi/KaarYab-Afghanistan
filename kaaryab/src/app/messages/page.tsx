import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { RoleGate } from "@/components/auth/role-gate";
import { MessagesPage } from "@/components/messages/messages-page";

export const metadata: Metadata = {
  title: "Messages — KaarYab Afghanistan",
};

export default function MessagesRoute() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Suspense>
          <RoleGate roles={["applicant", "employer", "admin"]}>
            <MessagesPage />
          </RoleGate>
        </Suspense>
      </div>
    </SiteLayout>
  );
}
