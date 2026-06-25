"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyState, Panel, StatusMessage } from "@/components/app-shell";
import { PrimaryButton, SelectField, TextField } from "@/components/form-controls";
import { JobCard } from "@/components/job-card";
import { api, type Job } from "@/lib/api-client";

export function JobsBrowser() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "published",
    type: "",
    isRemote: "",
    page: "1",
    limit: "10",
  });
  const [error, setError] = useState<string | null>(null);

  async function loadJobs() {
    setError(null);
    try {
      const response = await api.listJobs();
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load jobs");
    }
  }

  useEffect(() => {
    void loadJobs();
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void loadJobs();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Panel title="Search jobs" description="Uses GET /jobs with pagination and filters.">
        <form onSubmit={submit} className="grid gap-4">
          <TextField label="Search" value={filters.search} onChange={(search) => setFilters({ ...filters, search })} />
          <SelectField
            label="Status"
            value={filters.status}
            onChange={(status) => setFilters({ ...filters, status })}
            options={[
              ["", "Any"],
              ["published", "Published"],
              ["draft", "Draft"],
              ["closed", "Closed"],
            ]}
          />
          <SelectField
            label="Type"
            value={filters.type}
            onChange={(type) => setFilters({ ...filters, type })}
            options={[
              ["", "Any"],
              ["full_time", "Full time"],
              ["part_time", "Part time"],
              ["contract", "Contract"],
              ["internship", "Internship"],
            ]}
          />
          <SelectField
            label="Remote"
            value={filters.isRemote}
            onChange={(isRemote) => setFilters({ ...filters, isRemote })}
            options={[
              ["", "Any"],
              ["true", "Remote"],
              ["false", "On-site"],
            ]}
          />
          <PrimaryButton>Search</PrimaryButton>
        </form>
      </Panel>

      <div className="grid gap-4">
        {error && <StatusMessage kind="error" message={error} />}
        {jobs.length === 0 && <EmptyState text="No jobs loaded yet. Search or check that the backend is running." />}
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
