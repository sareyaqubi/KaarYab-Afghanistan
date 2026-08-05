import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PublicProfile } from "@/components/profile/public-profile";

export const metadata: Metadata = {
  title: "Applicant Profile — KaarYab Afghanistan",
};

export default async function PublicProfileRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense>
          <PublicProfile userId={id} />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
