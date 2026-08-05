import type { CategoryInfo, ExperienceLevel, JobCategory, JobType } from "@/lib/types";

export const provinces = [
  "Kabul",
  "Herat",
  "Kandahar",
  "Balkh",
  "Nangarhar",
  "Bamyan",
  "Kunduz",
  "Ghazni",
  "Paktia",
  "Takhar",
  "Samangan",
  "Badakhshan",
];

export const categories: CategoryInfo[] = [
  { id: "remote", icon: "globe", jobs: 14, color: "#14b8a6" },
  { id: "on-site", icon: "building", jobs: 18, color: "#6366f1" },
  { id: "internship", icon: "sparkles", jobs: 9, color: "#ec4899" },
  { id: "scholarship", icon: "graduation-cap", jobs: 7, color: "#f59e0b" },
  { id: "fellowship", icon: "award", jobs: 5, color: "#8b5cf6" },
  { id: "volunteer", icon: "heart-handshake", jobs: 6, color: "#22c55e" },
  { id: "training", icon: "presentation", jobs: 8, color: "#0ea5e9" },
  { id: "course", icon: "book-open", jobs: 11, color: "#f43f5e" },
  { id: "freelance", icon: "briefcase", jobs: 10, color: "#06b6d4" },
  { id: "competition", icon: "trophy", jobs: 4, color: "#eab308" },
];

export const categoryLabels: Record<JobCategory, string> = {
  remote: "Remote Jobs",
  "on-site": "On-site Jobs",
  internship: "Internships",
  scholarship: "Scholarships",
  fellowship: "Fellowships",
  volunteer: "Volunteer",
  training: "Training",
  course: "Online Courses",
  freelance: "Freelance",
  competition: "Competitions",
};

export const jobTypeLabels: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
  temporary: "Temporary",
};

export const experienceLabels: Record<ExperienceLevel, string> = {
  entry: "Entry Level",
  junior: "Junior (1-2 yrs)",
  mid: "Mid (3-5 yrs)",
  senior: "Senior (5+ yrs)",
  lead: "Lead / Manager",
  any: "Any Level",
};

export const popularSkills = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "JavaScript",
  "Tailwind CSS",
  "PostgreSQL",
  "Docker",
  "Figma",
  "UI Design",
  "Data Science",
  "Machine Learning",
  "WordPress",
  "PHP",
  "Network Engineering",
  "Digital Marketing",
  "Content Writing",
  "Project Management",
  "Sales",
  "English",
  "Accounting",
  "Human Resources",
  "Graphic Design",
];

export const languages = ["Dari", "Pashto", "English", "Urdu", "Arabic", "Persian"];

export const salaryBrackets = [
  { label: "Under 15,000 AFN", min: 0, max: 15000 },
  { label: "15,000 – 30,000 AFN", min: 15000, max: 30000 },
  { label: "30,000 – 50,000 AFN", min: 30000, max: 50000 },
  { label: "50,000 – 80,000 AFN", min: 50000, max: 80000 },
  { label: "80,000 – 120,000 AFN", min: 80000, max: 120000 },
  { label: "Above 120,000 AFN", min: 120000, max: Number.POSITIVE_INFINITY },
];

export const categoryIcons: Record<string, string> = {
  globe: "Globe",
  building: "Building2",
  sparkles: "Sparkles",
  "graduation-cap": "GraduationCap",
  award: "Award",
  "heart-handshake": "HeartHandshake",
  presentation: "Presentation",
  "book-open": "BookOpen",
  briefcase: "Briefcase",
  trophy: "Trophy",
};
