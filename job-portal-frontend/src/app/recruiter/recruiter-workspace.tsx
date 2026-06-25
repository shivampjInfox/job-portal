"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyState, Panel, StatusMessage } from "@/components/app-shell";
import { PrimaryButton, SecondaryButton, SelectField, TextArea, TextField } from "@/components/form-controls";
import { JobCard } from "@/components/job-card";
import { api, type Application, type Company, type Job, type ApplicationStatus } from "@/lib/api-client";

export function RecruiterWorkspace() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companyForm, setCompanyForm] = useState({ name: "", description: "", website: "", logoUrl: "", location: "", size: "startup" });
  const [jobForm, setJobForm] = useState({ title: "", description: "", type: "full_time", location: "", isRemote: "true", salaryMin: "", salaryMax: "", expiresAt: "", companyId: "", categoryId: "", skillIds: "" });
  const [appLookup, setAppLookup] = useState({ jobId: "", applicationId: "", status: "reviewing" as ApplicationStatus });
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
      const [companyResponse, jobResponse] = await Promise.all([
        api.myCompanies(),
        api.listJobs({ page: 1, limit: 50 }),
      ]);
      setCompanies(Array.isArray(companyResponse.data) ? companyResponse.data : []);
      setJobs(Array.isArray(jobResponse.data) ? jobResponse.data : []);
    });
  }

  useEffect(() => {
    void load();
  }, []);

  function createCompany(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.createCompany({
        ...companyForm,
        size: companyForm.size as Company["size"],
      });
      setCompanyForm({ name: "", description: "", website: "", logoUrl: "", location: "", size: "startup" });
      await load();
    }, "Company created.");
  }

  function createJob(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.createJob({
        title: jobForm.title,
        description: jobForm.description,
        type: jobForm.type as Job["type"],
        location: jobForm.location || undefined,
        isRemote: jobForm.isRemote === "true",
        salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : undefined,
        salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : undefined,
        expiresAt: jobForm.expiresAt || undefined,
        companyId: jobForm.companyId,
        categoryId: jobForm.categoryId || undefined,
        skillIds: jobForm.skillIds.split(",").map((id) => id.trim()).filter(Boolean),
      });
      await load();
    }, "Job created.");
  }

  function loadApplications(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const response = await api.jobApplications(appLookup.jobId);
      setApplications(Array.isArray(response.data) ? response.data : []);
    }, "Applications loaded.");
  }

  return (
    <div className="grid gap-6">
      {message && <StatusMessage kind="success" message={message} />}
      {error && <StatusMessage kind="error" message={error} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Create company" description="Uses POST /companies.">
          <form onSubmit={createCompany} className="grid gap-4">
            <TextField label="Name" value={companyForm.name} onChange={(name) => setCompanyForm({ ...companyForm, name })} required />
            <TextField label="Website" value={companyForm.website} onChange={(website) => setCompanyForm({ ...companyForm, website })} />
            <TextField label="Logo URL" value={companyForm.logoUrl} onChange={(logoUrl) => setCompanyForm({ ...companyForm, logoUrl })} />
            <TextField label="Location" value={companyForm.location} onChange={(location) => setCompanyForm({ ...companyForm, location })} />
            <SelectField label="Size" value={companyForm.size} onChange={(size) => setCompanyForm({ ...companyForm, size })} options={[["startup", "Startup"], ["small", "Small"], ["medium", "Medium"], ["large", "Large"], ["enterprise", "Enterprise"]]} />
            <TextArea label="Description" value={companyForm.description} onChange={(description) => setCompanyForm({ ...companyForm, description })} />
            <PrimaryButton>Create company</PrimaryButton>
          </form>
        </Panel>

        <Panel title="Create job" description="Uses POST /jobs.">
          <form onSubmit={createJob} className="grid gap-4">
            <TextField label="Company ID" value={jobForm.companyId} onChange={(companyId) => setJobForm({ ...jobForm, companyId })} required />
            <TextField label="Title" value={jobForm.title} onChange={(title) => setJobForm({ ...jobForm, title })} required />
            <TextArea label="Description" value={jobForm.description} onChange={(description) => setJobForm({ ...jobForm, description })} />
            <SelectField label="Type" value={jobForm.type} onChange={(type) => setJobForm({ ...jobForm, type })} options={[["full_time", "Full time"], ["part_time", "Part time"], ["contract", "Contract"], ["internship", "Internship"]]} />
            <SelectField label="Remote" value={jobForm.isRemote} onChange={(isRemote) => setJobForm({ ...jobForm, isRemote })} options={[["true", "Remote"], ["false", "On-site"]]} />
            <TextField label="Location" value={jobForm.location} onChange={(location) => setJobForm({ ...jobForm, location })} />
            <TextField label="Salary min" value={jobForm.salaryMin} onChange={(salaryMin) => setJobForm({ ...jobForm, salaryMin })} />
            <TextField label="Salary max" value={jobForm.salaryMax} onChange={(salaryMax) => setJobForm({ ...jobForm, salaryMax })} />
            <TextField label="Expires at ISO" value={jobForm.expiresAt} onChange={(expiresAt) => setJobForm({ ...jobForm, expiresAt })} />
            <TextField label="Category ID" value={jobForm.categoryId} onChange={(categoryId) => setJobForm({ ...jobForm, categoryId })} />
            <TextField label="Skill IDs, comma separated" value={jobForm.skillIds} onChange={(skillIds) => setJobForm({ ...jobForm, skillIds })} />
            <PrimaryButton>Create job</PrimaryButton>
          </form>
        </Panel>
      </div>

      <Panel title="My companies" description="Uses GET /companies/my-companies, PATCH /companies/:id, and DELETE /companies/:id.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.length === 0 && <EmptyState text="No recruiter companies loaded." />}
          {companies.map((company) => (
            <div key={company.id} className="rounded-md border border-slate-200 p-4">
              <h3 className="font-semibold">{company.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{company.location ?? "No location"}</p>
              <p className="mt-3 break-all font-mono text-xs text-slate-400">{company.id}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <SecondaryButton onClick={() => void run(async () => {
                  await api.updateCompany(company.id, { name: `${company.name} Updated` });
                  await load();
                }, "Company updated.")}>
                  Quick update
                </SecondaryButton>
                <SecondaryButton onClick={() => void run(async () => {
                  await api.deleteCompany(company.id);
                  await load();
                }, "Company deleted.")}>
                  Delete
                </SecondaryButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Job management" description="Uses PATCH publish/close/update and DELETE job endpoints.">
        <div className="grid gap-4">
          {jobs.length === 0 && <EmptyState text="No jobs loaded." />}
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              actions={
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.publishJob(job.id);
                    await load();
                  }, "Job published.")}>
                    Publish
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.closeJob(job.id);
                    await load();
                  }, "Job closed.")}>
                    Close
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.updateJob(job.id, { title: `${job.title} Updated` });
                    await load();
                  }, "Job updated.")}>
                    Quick update
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.deleteJob(job.id);
                    await load();
                  }, "Job deleted.")}>
                    Delete
                  </SecondaryButton>
                </div>
              }
            />
          ))}
        </div>
      </Panel>

      <Panel title="Applicants" description="Uses GET /applications/job/:jobId and PATCH /applications/:id/status.">
        <form onSubmit={loadApplications} className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <TextField label="Job ID" value={appLookup.jobId} onChange={(jobId) => setAppLookup({ ...appLookup, jobId })} required />
          <div className="flex items-end">
            <PrimaryButton>Load applicants</PrimaryButton>
          </div>
        </form>

        <div className="grid gap-3">
          {applications.length === 0 && <EmptyState text="No applicants loaded for this job." />}
          {applications.map((application) => (
            <div key={application.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-semibold">{application.applicant?.firstName ?? "Applicant"} {application.applicant?.lastName ?? ""}</h3>
                  <p className="mt-1 text-sm text-slate-500">Status: {application.status}</p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-400">{application.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["reviewing", "shortlisted", "rejected", "hired"] as ApplicationStatus[]).map((status) => (
                    <SecondaryButton key={status} onClick={() => void run(async () => {
                      await api.updateApplicationStatus(application.id, status);
                      const response = await api.jobApplications(appLookup.jobId);
                      setApplications(Array.isArray(response.data) ? response.data : []);
                    }, `Application marked ${status}.`)}>
                      {status}
                    </SecondaryButton>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
