import { PageShell } from "@/components/app-shell";
import { JobsBrowser } from "./jobs-browser";

export default function JobsPage() {
  return (
    <PageShell
      eyebrow="Job discovery"
      title="Browse jobs"
      description="Search and filter jobs from the backend. Candidate actions are available in the candidate workspace."
    >
      <JobsBrowser />
    </PageShell>
  );
}
