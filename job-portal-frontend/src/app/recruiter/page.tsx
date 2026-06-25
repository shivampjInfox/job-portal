import { PageShell } from "@/components/app-shell";
import { RecruiterWorkspace } from "./recruiter-workspace";

export default function RecruiterPage() {
  return (
    <PageShell
      eyebrow="Recruiter workspace"
      title="Companies, jobs, and applicants"
      description="Use recruiter endpoints to manage company profiles, job posts, publish/close jobs, and review candidates."
    >
      <RecruiterWorkspace />
    </PageShell>
  );
}
