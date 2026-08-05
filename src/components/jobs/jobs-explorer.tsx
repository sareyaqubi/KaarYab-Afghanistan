"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useData } from "@/providers/data";
import { useI18n } from "@/providers/i18n";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { categories, categoryLabels, experienceLabels, provinces, salaryBrackets } from "@/lib/data/constants";
import { rankJobs } from "@/lib/ranking";
import { cn } from "@/lib/utils";
import type { ExperienceLevel, JobCategory, JobType } from "@/lib/types";
import { jobTypeLabels } from "@/lib/data/constants";

type SortKey = "recommended" | "newest" | "salary" | "deadline" | "rating";

const PAGE_SIZE = 9;

interface JobsExplorerProps {
  scope: "all" | "remote" | "onsite";
}

export function JobsExplorer({ scope }: JobsExplorerProps) {
  const searchParams = useSearchParams();
  const { jobs, companies } = useData();
  const { t } = useI18n();

  const companiesById = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<JobCategory | "all">(
    (searchParams.get("category") as JobCategory) ?? "all"
  );
  const [type, setType] = useState<JobType | "all">("all");
  const [experience, setExperience] = useState<ExperienceLevel | "any">("any");
  const [companyId, setCompanyId] = useState<string>("all");
  const [province, setProvince] = useState<string>("all");
  const [salaryMin, setSalaryMin] = useState<number>(0);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [onlyRemote, setOnlyRemote] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => j.status !== "archived");

    if (scope === "remote") list = list.filter((j) => j.remote);
    if (scope === "onsite") list = list.filter((j) => !j.remote);
    if (onlyRemote) list = list.filter((j) => j.remote);
    if (category !== "all") list = list.filter((j) => j.category === category);
    if (type !== "all") list = list.filter((j) => j.type === type);
    if (experience !== "any") list = list.filter((j) => j.experience === experience || j.experience === "any");
    if (companyId !== "all") list = list.filter((j) => j.companyId === companyId);
    if (province !== "all") list = list.filter((j) => j.province === province);
    if (salaryMin > 0) list = list.filter((j) => j.salaryMax >= salaryMin);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((j) => {
        const company = companiesById.get(j.companyId);
        return (
          j.title.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q)) ||
          (company?.name.toLowerCase().includes(q) ?? false) ||
          j.description.toLowerCase().includes(q)
        );
      });
    }

    switch (sort) {
      case "newest":
        list = [...list].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
        break;
      case "salary":
        list = [...list].sort((a, b) => b.salaryMax - a.salaryMax);
        break;
      case "deadline":
        list = [...list].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      case "rating":
        list = [...list].sort(
          (a, b) =>
            (companiesById.get(b.companyId)?.rating ?? 0) - (companiesById.get(a.companyId)?.rating ?? 0)
        );
        break;
      default:
        list = rankJobs(list, companiesById);
    }
    return list;
  }, [jobs, scope, onlyRemote, category, type, experience, companyId, province, salaryMin, search, sort, companiesById]);

  const shown = filtered.slice(0, visibleCount);
  const hasActiveFilters =
    category !== "all" || type !== "all" || experience !== "any" || companyId !== "all" || province !== "all" || salaryMin > 0 || onlyRemote || search.trim() !== "";

  const clearAll = () => {
    setSearch("");
    setCategory("all");
    setType("all");
    setExperience("any");
    setCompanyId("all");
    setProvince("all");
    setSalaryMin(0);
    setOnlyRemote(false);
    setSort("recommended");
  };

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoading(false);
    }, 400);
  };

  const FilterControls = (
    <div className="space-y-5">
      <FilterGroup title={t("filters.search")}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("filters.search")}
            className="pl-9"
            aria-label={t("filters.search")}
          />
        </div>
      </FilterGroup>

      <FilterGroup title={t("filters.category")}>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            {t("filters.allCategories")}
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {categoryLabels[c.id]}
            </FilterChip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("filters.type")}>
        <Select value={type} onChange={(e) => setType(e.target.value as JobType | "all")}>
          <option value="all">{t("filters.allTypes")}</option>
          {(Object.keys(jobTypeLabels) as JobType[]).map((k) => (
            <option key={k} value={k}>
              {jobTypeLabels[k]}
            </option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup title={t("filters.experience")}>
        <Select value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel | "any")}>
          <option value="any">{t("filters.anyExperience")}</option>
          {(Object.keys(experienceLabels) as ExperienceLevel[]).map((k) => (
            <option key={k} value={k}>
              {experienceLabels[k]}
            </option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup title={t("filters.salary")}>
        <Select value={salaryMin} onChange={(e) => setSalaryMin(Number(e.target.value))}>
          <option value={0}>{t("filters.salary")}</option>
          {salaryBrackets.map((b) => (
            <option key={b.label} value={b.min}>
              {b.label}
            </option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup title={t("filters.company")}>
        <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="all">{t("filters.allCompanies")}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup title={t("filters.province")}>
        <Select value={province} onChange={(e) => setProvince(e.target.value)}>
          <option value="all">{t("filters.allProvinces")}</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </FilterGroup>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-card p-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={onlyRemote}
          onChange={(e) => setOnlyRemote(e.target.checked)}
          className="h-4 w-4 rounded accent-primary"
        />
        {t("filters.remoteOnly")}
      </label>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-rose-400/40 hover:text-rose-500"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("filters.clearAll")}
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {scope === "remote" ? t("nav.remoteJobs") : scope === "onsite" ? t("nav.onSiteJobs") : t("filters.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {t("filters.results")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 w-44">
            <option value="recommended">Recommended</option>
            <option value="newest">{t("filters.newest")}</option>
            <option value="salary">{t("filters.highestSalary")}</option>
            <option value="deadline">{t("filters.deadline")}</option>
            <option value="rating">{t("filters.rating")}</option>
          </Select>
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setMobileFilters(true)}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">{FilterControls}</div>
        </aside>

        {/* Results */}
        <div>
          {shown.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title={t("filters.noResults")}
              hint={t("filters.noResultsHint")}
              action={
                <Button variant="outline" size="sm" onClick={clearAll}>
                  {t("filters.reset")}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((job, i) => {
                const company = companiesById.get(job.companyId);
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    companyName={company?.name}
                    companyLogo={company?.logo}
                    companyRating={company?.rating}
                    index={i}
                  />
                );
              })}
            </div>
          )}

          {loading && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                  <Skeleton className="mt-4 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                </div>
              ))}
            </div>
          )}

          {shown.length < filtered.length && (
            <div className="mt-8 text-center">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? "Loading…" : "Load more opportunities"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setMobileFilters(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 h-full w-[320px] overflow-y-auto border-l border-border bg-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{t("filters.title")}</h3>
              <button
                onClick={() => setMobileFilters(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterControls}
            <Button variant="gradient" className="mt-5 w-full" onClick={() => setMobileFilters(false)}>
              Show {filtered.length} results
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
