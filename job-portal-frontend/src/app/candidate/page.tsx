import { PageShell } from "@/components/app-shell";
import { CandidateWorkspace } from "./candidate-workspace";

export default function CandidatePage() {
  return (
    <PageShell
      eyebrow="Candidate workspace"
      title="Find, save, and apply"
      description="Use candidate-only endpoints for applications and saved jobs after logging in as a candidate."
    >
      <CandidateWorkspace />
    </PageShell>
  );
}
