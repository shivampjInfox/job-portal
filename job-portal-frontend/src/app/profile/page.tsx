import { PageShell } from "@/components/app-shell";
import { ProfileWorkspace } from "./profile-workspace";

export default function ProfilePage() {
  return (
    <PageShell
      eyebrow="Session"
      title="Profile, notifications, and dashboard"
      description="Manage the logged-in account and inspect role-specific dashboard and notification data."
    >
      <ProfileWorkspace />
    </PageShell>
  );
}
