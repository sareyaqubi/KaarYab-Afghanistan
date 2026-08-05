import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { BlogPage } from "@/components/blog/blog-page";

export const metadata: Metadata = {
  title: "Blog & Career Resources — KaarYab Afghanistan",
  description:
    "Career guides, remote work tips, scholarship lists and resources written for Afghan job seekers.",
};

export default function BlogRoute() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Suspense>
          <BlogPage />
        </Suspense>
      </div>
    </SiteLayout>
  );
}
