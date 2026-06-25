"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyState, Panel, StatusMessage } from "@/components/app-shell";
import { PrimaryButton, TextField } from "@/components/form-controls";
import { api, type Company } from "@/lib/api-client";

export function CompaniesBrowser() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState({ page: "1", limit: "10" });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await api.listCompanies(pagination);
      setCompanies(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load companies");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Panel title="Pagination" description="Uses GET /companies.">
        <form onSubmit={submit} className="grid gap-4">
          <TextField label="Page" value={pagination.page} onChange={(page) => setPagination({ ...pagination, page })} />
          <TextField label="Limit" value={pagination.limit} onChange={(limit) => setPagination({ ...pagination, limit })} />
          <PrimaryButton>Load companies</PrimaryButton>
        </form>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        {error && <StatusMessage kind="error" message={error} />}
        {companies.length === 0 && <EmptyState text="No companies loaded." />}
        {companies.map((company) => (
          <article key={company.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{company.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{company.location ?? "Location not set"}</p>
              </div>
              <span className={`rounded-md px-2 py-1 text-xs font-bold ${company.isVerified ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {company.isVerified ? "Verified" : "Pending"}
              </span>
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
              {company.description ?? "No description provided."}
            </p>
            <p className="mt-4 break-all font-mono text-xs text-slate-400">{company.id}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
