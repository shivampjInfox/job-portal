import { PageShell } from "@/components/app-shell";
import { AuthPanel } from "./auth-panel";

export default function AuthPage() {
  return (
    <PageShell
      eyebrow="Authentication"
      title="Login and registration"
      description="Use the backend auth endpoints for candidates and recruiters. Login creates an HTTP-only session cookie used by all protected requests."
    >
      <AuthPanel />
    </PageShell>
  );
}
