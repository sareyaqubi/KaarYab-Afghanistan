import type { Company, Job } from "@/lib/types";
import { daysUntil } from "@/lib/utils";

/**
 * Smart ranking system.
 * Scores opportunities by: featured status, urgency, employer rating,
 * verification, salary, popularity (saves/applications/views), freshness,
 * and deadline proximity. Higher score = better rank.
 */
export function jobScore(job: Job, company?: Company): number {
  let score = 0;

  if (job.status === "open") score += 100;
  if (job.featured) score += 40;
  if (job.urgent) score += 15;

  if (company?.verified) score += 12;
  if (company) score += (company.rating - 3) * 8;

  const avgSalary = (job.salaryMin + job.salaryMax) / 2;
  score += Math.log10(Math.max(1, avgSalary + 1)) * 8;

  score += Math.log10(job.saves + 1) * 6;
  score += Math.log10(job.applications + 1) * 5;
  score += Math.log10(job.views + 1) * 2;

  const daysSincePost = (Date.now() - new Date(job.postedAt).getTime()) / 86400000;
  score += Math.max(0, 30 - daysSincePost);

  const daysLeft = daysUntil(job.deadline);
  if (daysLeft > 0) score += Math.min(20, daysLeft);

  return score;
}

export function rankJobs(jobs: Job[], companiesById: Map<string, Company>): Job[] {
  return [...jobs].sort((a, b) => {
    const scoreA = jobScore(a, companiesById.get(a.companyId));
    const scoreB = jobScore(b, companiesById.get(b.companyId));
    return scoreB - scoreA;
  });
}
