"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyState, Panel, StatusMessage } from "@/components/app-shell";
import { PrimaryButton, SecondaryButton, TextArea, TextField } from "@/components/form-controls";
import { JobCard } from "@/components/job-card";
import { api, type Application, type Job, type SavedJob } from "@/lib/api-client";

export function CandidateWorkspace() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [applyForm, setApplyForm] = useState({ jobId: "", coverLetter: "", resumeUrl: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>, success?: string) {
    setError(null);
    setMessage(null);
    try {
      await action();
      if (success) setMessage(success);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    }
  }

  async function load() {
    await run(async () => {
      const [jobResponse, applicationResponse, savedResponse] = await Promise.all([
        api.listJobs({ status: "published", page: 1, limit: 20 }),
        api.myApplications(),
        api.mySavedJobs(),
      ]);
      setJobs(Array.isArray(jobResponse.data) ? jobResponse.data : []);
      setApplications(Array.isArray(applicationResponse.data) ? applicationResponse.data : []);
      setSavedJobs(Array.isArray(savedResponse.data) ? savedResponse.data : []);
    });
  }

  useEffect(() => {
    void load();
  }, []);

  function submitApplication(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.apply({
        jobId: applyForm.jobId,
        coverLetter: applyForm.coverLetter || undefined,
        resumeUrl: applyForm.resumeUrl || undefined,
      });
      setApplyForm({ jobId: "", coverLetter: "", resumeUrl: "" });
      await load();
    }, "Application submitted.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-6">
        {message && <StatusMessage kind="success" message={message} />}
        {error && <StatusMessage kind="error" message={error} />}

        <Panel title="Available jobs" description="Apply or save jobs using protected candidate endpoints.">
          <div className="grid gap-4">
            {jobs.length === 0 && <EmptyState text="No published jobs loaded." />}
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <SecondaryButton onClick={() => setApplyForm({ ...applyForm, jobId: job.id })}>
                      Use for apply
                    </SecondaryButton>
                    <SecondaryButton onClick={() => void run(async () => {
                      await api.saveJob(job.id);
                      await load();
                    }, "Job saved.")}>
                      Save
                    </SecondaryButton>
                  </div>
                }
              />
            ))}
          </div>
        </Panel>

        <Panel title="My applications" description="Uses GET /applications/my and DELETE /applications/:id.">
          <div className="grid gap-3">
            {applications.length === 0 && <EmptyState text="No applications yet." />}
            {applications.map((application) => (
              <div key={application.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{application.job?.title ?? "Application"}</h3>
                    <p className="mt-1 text-sm text-slate-500">Status: {application.status}</p>
                    <p className="mt-2 break-all font-mono text-xs text-slate-400">{application.id}</p>
                  </div>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.withdrawApplication(application.id);
                    await load();
                  }, "Application withdrawn.")}>
                    Withdraw
                  </SecondaryButton>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 content-start">
        <Panel title="Apply to a job">
          <form onSubmit={submitApplication} className="grid gap-4">
            <TextField label="Job ID" value={applyForm.jobId} onChange={(jobId) => setApplyForm({ ...applyForm, jobId })} required />
            <TextField label="Resume URL" value={applyForm.resumeUrl} onChange={(resumeUrl) => setApplyForm({ ...applyForm, resumeUrl })} />
            <TextArea label="Cover letter" value={applyForm.coverLetter} onChange={(coverLetter) => setApplyForm({ ...applyForm, coverLetter })} />
            <PrimaryButton>Submit application</PrimaryButton>
          </form>
        </Panel>

        <Panel title="Saved jobs" description="Uses GET /saved-jobs and DELETE /saved-jobs/:id.">
          <div className="grid gap-3">
            {savedJobs.length === 0 && <EmptyState text="No saved jobs yet." />}
            {savedJobs.map((saved) => (
              <div key={saved.id} className="rounded-md border border-slate-200 p-3">
                <h3 className="font-semibold">{saved.job?.title ?? "Saved job"}</h3>
                <p className="mt-1 break-all font-mono text-xs text-slate-400">{saved.id}</p>
                <div className="mt-3">
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.removeSavedJob(saved.id);
                    await load();
                  }, "Saved job removed.")}>
                    Remove
                  </SecondaryButton>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
