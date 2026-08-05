import { SiteLayout } from "@/components/layout/site-layout";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { FeaturedJobsSection } from "@/components/home/featured-jobs-section";
import { TopCompaniesSection } from "@/components/home/top-companies-section";
import { StatsSection } from "@/components/home/stats-section";
import { SuccessStoriesSection } from "@/components/home/success-stories-section";
import { CareerTipsSection } from "@/components/home/career-tips-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { NewsletterSection, CTASection } from "@/components/home/newsletter-section";

export default function HomePage() {
  return (
    <SiteLayout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedJobsSection />
      <TopCompaniesSection />
      <StatsSection />
      <SuccessStoriesSection />
      <CareerTipsSection />
      <TestimonialsSection />
      <NewsletterSection />
      <CTASection />
    </SiteLayout>
  );
}
