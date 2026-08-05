"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  Application,
  ApplicationStatus,
  Company,
  Conversation,
  Interview,
  Job,
  Message,
  Notification,
  Report,
  Review,
  SavedJob,
} from "@/lib/types";
import { jobs as seedJobs } from "@/lib/data/jobs";
import { reviews as seedReviews } from "@/lib/data/reviews";
import { companies as seedCompanies } from "@/lib/data/companies";
import { load, save } from "@/lib/storage";
import { uid } from "@/lib/utils";

interface DB {
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  conversations: Conversation[];
  notifications: Notification[];
  savedJobs: SavedJob[];
  reviews: Review[];
  reports: Report[];
}

interface DataContextValue extends DB {
  addJob: (job: Omit<Job, "id" | "postedAt" | "views" | "applications" | "saves" | "filledPositions">) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  updateReport: (id: string, status: Report["status"]) => void;
  incrementViews: (id: string) => void;
  applyToJob: (input: {
    jobId: string;
    applicantId: string;
    employerId: string;
    cvUrl?: string;
    coverLetter?: string;
    portfolio?: string;
    github?: string;
    linkedin?: string;
    phone?: string;
    email?: string;
    message?: string;
  }) => Application | null;
  updateApplicationStatus: (id: string, status: ApplicationStatus, note?: string) => void;
  scheduleInterview: (input: Omit<Interview, "id" | "status" | "createdAt">) => Interview;
  saveJob: (userId: string, jobId: string) => void;
  unsaveJob: (userId: string, jobId: string) => void;
  isSaved: (userId: string, jobId: string) => boolean;
  sendMessage: (conversationId: string | null, from: string, to: string, text: string, type?: Message["type"], fileName?: string) => Conversation;
  markConversationRead: (conversationId: string, userId: string) => void;
  createConversation: (participants: string[]) => Conversation;
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markNotificationsRead: (userId: string) => void;
  markNotificationRead: (id: string) => void;
  addReview: (r: Omit<Review, "id" | "createdAt">) => void;
  reportJob: (jobId: string, reporterId: string, reason: string, detail?: string) => void;
  followCompany: (userId: string, companyId: string) => void;
  unfollowCompany: (userId: string, companyId: string) => void;
  follows: (userId: string, companyId: string) => boolean;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const DB_KEY = "kaaryab:db";

const seedDB: DB = {
  companies: seedCompanies,
  jobs: seedJobs,
  applications: [],
  interviews: [],
  conversations: [],
  notifications: [],
  savedJobs: [],
  reviews: seedReviews,
  reports: [],
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => {
    if (typeof window === "undefined") return seedDB;
    const stored = load<Partial<DB> | null>(DB_KEY, null);
    if (!stored) return seedDB;
    return {
      ...seedDB,
      ...stored,
      companies: stored.companies && stored.companies.length ? stored.companies : seedDB.companies,
      jobs: stored.jobs && stored.jobs.length ? stored.jobs : seedDB.jobs,
      reviews: stored.reviews && stored.reviews.length ? stored.reviews : seedDB.reviews,
    };
  });

  useEffect(() => {
    save(DB_KEY, db);
  }, [db]);

  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "createdAt">) => {
    setDb((prev) => ({
      ...prev,
      notifications: [
        { ...n, id: uid("n"), read: false, createdAt: new Date().toISOString() },
        ...prev.notifications,
      ].slice(0, 100),
    }));
  }, []);

  const addJob = useCallback<DataContextValue["addJob"]>((input) => {
    const job: Job = {
      ...input,
      id: uid("j"),
      postedAt: new Date().toISOString(),
      views: 0,
      applications: 0,
      saves: 0,
      filledPositions: 0,
      savedBy: [],
      reportedBy: [],
    };
    setDb((prev) => ({ ...prev, jobs: [job, ...prev.jobs] }));
    return job;
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setDb((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    }));
  }, []);

  const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
    setDb((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const updateReport = useCallback((id: string, status: Report["status"]) => {
    setDb((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  }, []);

  const incrementViews = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === id ? { ...j, views: j.views + 1 } : j)),
    }));
  }, []);

  const applyToJob = useCallback<DataContextValue["applyToJob"]>(
    (input) => {
      const job = db.jobs.find((j) => j.id === input.jobId);
      const companyId = job?.companyId ?? "";
      const app: Application = {
        id: uid("a"),
        jobId: input.jobId,
        applicantId: input.applicantId,
        employerId: input.employerId,
        companyId,
        status: "pending",
        timeline: [{ status: "pending", at: new Date().toISOString(), note: "Application submitted" }],
        submittedAt: new Date().toISOString(),
        cvUrl: input.cvUrl,
        coverLetter: input.coverLetter,
        portfolio: input.portfolio,
        github: input.github,
        linkedin: input.linkedin,
        phone: input.phone,
        email: input.email,
        message: input.message,
      };
      setDb((prev) => ({
        ...prev,
        applications: [app, ...prev.applications],
        jobs: prev.jobs.map((j) =>
          j.id === input.jobId ? { ...j, applications: j.applications + 1 } : j
        ),
      }));
      addNotification({
        userId: input.employerId,
        type: "application",
        title: "New application received",
        body: `A new application was submitted for your opportunity.`,
        link: "/employer/applications",
      });
      return app;
    },
    [addNotification, db.jobs]
  );

  const updateApplicationStatus = useCallback(
    (id: string, status: ApplicationStatus, note?: string) => {
      const existingApp = db.applications.find((a) => a.id === id);
      setDb((prev) => {
        const existing = prev.applications.find((a) => a.id === id);
        if (!existing) return prev;
        const updatedApp: Application = {
          ...existing,
          status,
          timeline: [
            ...existing.timeline,
            { status, at: new Date().toISOString(), note: note ?? `Status changed to ${status}` },
          ],
        };
        // Auto-fill positions when an application is accepted
        let jobs = prev.jobs;
        if (status === "accepted") {
          jobs = jobs.map((j) => {
            if (j.id !== existing.jobId) return j;
            const filled = Math.min(j.filledPositions + 1, j.positions);
            const next: Job = { ...j, filledPositions: filled };
            if (filled >= j.positions && next.status === "open") {
              next.status = "filled";
            }
            return next;
          });
        }
        return { ...prev, applications: prev.applications.map((a) => (a.id === id ? updatedApp : a)), jobs };
      });
      if (existingApp) {
        addNotification({
          userId: existingApp.applicantId,
          type: status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "system",
          title: `Application ${status}`,
          body: `Your application was marked as ${status}.`,
          link: "/applicant/applications",
        });
      }
    },
    [addNotification, db.applications]
  );

  const scheduleInterview = useCallback<DataContextValue["scheduleInterview"]>((input) => {
    const interview: Interview = {
      ...input,
      id: uid("iv"),
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      interviews: [interview, ...prev.interviews],
      applications: prev.applications.map((a) =>
        a.id === input.applicationId ? { ...a, status: "interview", interviewId: interview.id } : a
      ),
    }));
    addNotification({
      userId: input.applicantId,
      type: "interview",
      title: "Interview scheduled",
      body: `An interview has been scheduled for ${interview.date} at ${interview.time}.`,
      link: "/applicant/interviews",
    });
    return interview;
  }, [addNotification]);

  const saveJob = useCallback(
    (userId: string, jobId: string) => {
      setDb((prev) => {
        if (prev.savedJobs.some((s) => s.userId === userId && s.jobId === jobId)) return prev;
        return {
          ...prev,
          savedJobs: [...prev.savedJobs, { userId, jobId, savedAt: new Date().toISOString() }],
          jobs: prev.jobs.map((j) =>
            j.id === jobId ? { ...j, saves: j.saves + 1, savedBy: [...(j.savedBy ?? []), userId] } : j
          ),
        };
      });
    },
    []
  );

  const unsaveJob = useCallback((userId: string, jobId: string) => {
    setDb((prev) => ({
      ...prev,
      savedJobs: prev.savedJobs.filter((s) => !(s.userId === userId && s.jobId === jobId)),
      jobs: prev.jobs.map((j) =>
        j.id === jobId
          ? { ...j, saves: Math.max(0, j.saves - 1), savedBy: (j.savedBy ?? []).filter((u) => u !== userId) }
          : j
      ),
    }));
  }, []);

  const isSaved = useCallback(
    (userId: string, jobId: string) => db.savedJobs.some((s) => s.userId === userId && s.jobId === jobId),
    [db.savedJobs]
  );

  const createConversation = useCallback((participants: string[]) => {
    const id = uid("c");
    const conv: Conversation = {
      id,
      participants,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    setDb((prev) => ({ ...prev, conversations: [conv, ...prev.conversations] }));
    return conv;
  }, []);

  const sendMessage = useCallback(
    (conversationId: string | null, from: string, to: string, text: string, type: Message["type"] = "text", fileName?: string) => {
      let convId = conversationId;
      if (!convId) {
        const existing = db.conversations.find(
          (c) => c.participants.includes(from) && c.participants.includes(to)
        );
        convId = existing ? existing.id : uid("c");
      }
      const message: Message = {
        id: uid("m"),
        conversationId: convId,
        senderId: from,
        text,
        type,
        fileName,
        createdAt: new Date().toISOString(),
        readBy: [from],
      };
      setDb((prev) => {
        const exists = prev.conversations.some((c) => c.id === convId);
        const conversations = exists
          ? prev.conversations.map((c) =>
              c.id === convId ? { ...c, messages: [...c.messages, message], updatedAt: message.createdAt } : c
            )
          : [
              {
                id: convId,
                participants: [from, to],
                messages: [message],
                updatedAt: message.createdAt,
              } as Conversation,
              ...prev.conversations,
            ];
        return { ...prev, conversations };
      });
      addNotification({
        userId: to,
        type: "message",
        title: "New message",
        body: text.slice(0, 80),
        link: "/messages",
      });
      return { id: convId, participants: [from, to], messages: [message], updatedAt: message.createdAt };
    },
    [addNotification, db.conversations]
  );

  const markConversationRead = useCallback((conversationId: string, userId: string) => {
    setDb((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.senderId !== userId && !m.readBy.includes(userId)
              ? { ...m, readBy: [...m.readBy, userId] }
              : m
          ),
        };
      }),
    }));
  }, []);

  const markNotificationsRead = useCallback((userId: string) => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const addReview = useCallback((r: Omit<Review, "id" | "createdAt">) => {
    setDb((prev) => ({
      ...prev,
      reviews: [{ ...r, id: uid("r"), createdAt: new Date().toISOString() }, ...prev.reviews],
    }));
  }, []);

  const reportJob = useCallback((jobId: string, reporterId: string, reason: string, detail?: string) => {
    setDb((prev) => ({
      ...prev,
      reports: [...prev.reports, { id: uid("rp"), jobId, reporterId, reason, detail, createdAt: new Date().toISOString(), status: "open" }],
    }));
  }, []);

  const followCompany = useCallback((userId: string, companyId: string) => {
    setDb((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === companyId && !c.followers.includes(userId)
          ? { ...c, followers: [...c.followers, userId] }
          : c
      ),
    }));
  }, []);

  const unfollowCompany = useCallback((userId: string, companyId: string) => {
    setDb((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === companyId
          ? { ...c, followers: c.followers.filter((f) => f !== userId) }
          : c
      ),
    }));
  }, []);

  const follows = useCallback(
    (userId: string, companyId: string) => {
      return db.companies.find((c) => c.id === companyId)?.followers.includes(userId) ?? false;
    },
    [db.companies]
  );

  const resetDemo = useCallback(() => {
    setDb(seedDB);
    save(DB_KEY, null);
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...db,
        addJob,
        updateJob,
        updateCompany,
        updateReport,
        incrementViews,
        applyToJob,
        updateApplicationStatus,
        scheduleInterview,
        saveJob,
        unsaveJob,
        isSaved,
        sendMessage,
        markConversationRead,
        createConversation,
        addNotification,
        markNotificationsRead,
        markNotificationRead,
        addReview,
        reportJob,
        followCompany,
        unfollowCompany,
        follows,
        resetDemo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
