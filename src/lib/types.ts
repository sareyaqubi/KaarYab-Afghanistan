export type Role = "guest" | "applicant" | "employer" | "admin";
export type Lang = "en" | "fa" | "ps";
export type Theme = "light" | "dark";

export type JobCategory =
  | "remote"
  | "on-site"
  | "scholarship"
  | "internship"
  | "volunteer"
  | "training"
  | "course"
  | "freelance"
  | "competition"
  | "fellowship";

export type JobType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship"
  | "temporary";

export type ExperienceLevel = "entry" | "junior" | "mid" | "senior" | "lead" | "any";

export type ApplicationStatus =
  | "pending"
  | "viewed"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type InterviewMode = "online" | "offline" | "video" | "phone";

export interface Education {
  degree: string;
  field: string;
  school: string;
  from: string;
  to: string;
  current?: boolean;
}

export interface WorkExperience {
  role: string;
  company: string;
  from: string;
  to: string;
  current?: boolean;
  description?: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  year: string;
}

export interface Award {
  name: string;
  issuer: string;
  year: string;
}

export interface ApplicantProfile {
  headline?: string;
  bio?: string;
  photo?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
  availability?: "full-time" | "part-time" | "freelance" | "remote";
  skills: string[];
  languages: { name: string; level: string }[];
  education: Education[];
  experience: WorkExperience[];
  projects: Project[];
  certificates: Certificate[];
  awards: Award[];
  cvUrl?: string;
  coverLetter?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  verified: boolean;
  rememberMe?: boolean;
  applicantProfile?: ApplicantProfile;
  companyId?: string;
  badges: string[];
  reputation: number;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  website?: string;
  email?: string;
  phone?: string;
  location: string;
  province: string;
  industry: string;
  size: string;
  founded: string;
  verified: boolean;
  featured: boolean;
  gallery: string[];
  followers: string[];
  rating: number;
  ratingCount: number;
  stats: { jobsPosted: number; hires: number; responseTime: string };
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  category: JobCategory;
  type: JobType;
  experience: ExperienceLevel;
  location: string;
  province?: string;
  city?: string;
  country: string;
  remote: boolean;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  salaryPeriod: "monthly" | "hourly" | "yearly" | "one-time";
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  education?: string;
  workingHours?: string;
  skills: string[];
  languageRequirements?: string[];
  deadline: string;
  postedAt: string;
  positions: number;
  filledPositions: number;
  status: "open" | "filled" | "archived";
  featured: boolean;
  urgent: boolean;
  tags: string[];
  applications: number;
  views: number;
  saves: number;
  // engagement (per-user UI state)
  savedBy?: string[];
  reportedBy?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  companyId: string;
  status: ApplicationStatus;
  timeline: { status: ApplicationStatus; at: string; note?: string }[];
  submittedAt: string;
  cvUrl?: string;
  coverLetter?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  phone?: string;
  email?: string;
  message?: string;
  viewedAt?: string;
  interviewId?: string;
  notes?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  applicantId: string;
  companyId: string;
  mode: InterviewMode;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

export interface Review {
  id: string;
  companyId: string;
  authorId: string;
  authorName: string;
  role: string;
  rating: number;
  salaryAccuracy: number;
  management: number;
  communication: number;
  environment: number;
  culture: number;
  growth: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  createdAt: string;
  verified: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: "text" | "image" | "pdf" | "voice";
  createdAt: string;
  readBy: string[];
  fileName?: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // user ids
  messages: Message[];
  pinned?: boolean;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "application"
    | "application_viewed"
    | "interview"
    | "accepted"
    | "rejected"
    | "deadline"
    | "message"
    | "recommendation"
    | "saved_update"
    | "system"
    | "review"
    | "follower";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Report {
  id: string;
  jobId: string;
  reporterId: string;
  reason: string;
  detail?: string;
  createdAt: string;
  status: "open" | "reviewed" | "resolved";
}

export interface Follower {
  userId: string;
  companyId: string;
  followedAt: string;
}

export interface SavedJob {
  userId: string;
  jobId: string;
  savedAt: string;
}

export interface CategoryInfo {
  id: JobCategory;
  icon: string;
  jobs: number;
  color: string;
}
