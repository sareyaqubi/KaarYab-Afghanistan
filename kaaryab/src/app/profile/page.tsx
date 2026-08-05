import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { RoleGate } from "@/components/auth/role-gate";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = {
  title: "My Profile — KaarYab Afghanistan",
};

export default function ProfilePage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense>
          <RoleGate roles={["applicant"]} fallbackHref="/dashboard">
            <ProfileEditor />
          </RoleGate>
        </Suspense>
      </div>
    </SiteLayout>
  );
}
