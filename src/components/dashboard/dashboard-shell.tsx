"use client";

import { useAuth } from "@/providers/auth";
import { ApplicantDashboard } from "@/components/dashboard/applicant-dashboard";
import { EmployerDashboard } from "@/components/dashboard/employer-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export function DashboardShell() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  if (currentUser.role === "applicant") {
    return <ApplicantDashboard />;
  }

  if (currentUser.role === "employer") {
    return <EmployerDashboard />;
  }

  return <AdminDashboard />;
}
