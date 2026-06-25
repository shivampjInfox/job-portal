import { PageShell } from "@/components/app-shell";
import { CompaniesBrowser } from "./companies-browser";

export default function CompaniesPage() {
  return (
    <PageShell
      eyebrow="Company discovery"
      title="Browse companies"
      description="Explore companies from the public company endpoint."
    >
      <CompaniesBrowser />
    </PageShell>
  );
}
