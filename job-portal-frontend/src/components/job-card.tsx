import type { Job } from "@/lib/api-client";

export function JobCard({
  job,
  actions,
}: {
  job: Job;
  actions?: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
              {job.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {job.company?.name ?? "Company"} . {job.location ?? "Location not set"}
            {job.isRemote ? " . Remote" : ""}
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-700">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {job.type}
        </span>
        {job.category?.name && (
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {job.category.name}
          </span>
        )}
        {job.skills?.map((skill) => (
          <span
            key={skill.id}
            className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            {skill.name}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="break-all font-mono text-xs text-slate-400">{job.id}</p>
        {actions}
      </div>
    </article>
  );
}

export function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Salary undisclosed";
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  return (min ?? max)?.toLocaleString();
}
