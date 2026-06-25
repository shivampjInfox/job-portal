import Link from "next/link";
import { AppHeader } from "@/components/app-shell";

const roleCards = [
  {
    title: "Candidate",
    href: "/candidate",
    text: "Search jobs, save roles, apply, withdraw applications, and track status changes.",
    actions: ["Browse jobs", "Saved jobs", "My applications"],
  },
  {
    title: "Recruiter",
    href: "/recruiter",
    text: "Create companies, post jobs, publish or close listings, and manage applicants.",
    actions: ["My companies", "Create jobs", "Review applicants"],
  },
  {
    title: "Admin",
    href: "/admin",
    text: "Manage users, categories, skills, and company verification from one workspace.",
    actions: ["Users", "Categories", "Skills"],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <AppHeader />
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">
            Complete job portal frontend
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl">
            One application for candidates, recruiters, and admins.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            This frontend now uses your NestJS endpoints for auth, jobs,
            companies, applications, saved jobs, notifications, dashboards,
            users, categories, and skills.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth"
              className="flex h-12 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Login or register
            </Link>
            <Link
              href="/jobs"
              className="flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse jobs
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {roleCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
                </div>
                <span className="rounded-md bg-slate-950 px-3 py-1 text-sm font-bold text-white">
                  Open
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {card.actions.map((action) => (
                  <span
                    key={action}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
