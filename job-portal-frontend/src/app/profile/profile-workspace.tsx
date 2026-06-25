"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyState, Panel, StatusMessage } from "@/components/app-shell";
import { PrimaryButton, SecondaryButton, TextField } from "@/components/form-controls";
import { api, type DashboardData, type NotificationItem, type User } from "@/lib/api-client";

export function ProfileWorkspace() {
  const [profile, setProfile] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", avatarUrl: "", resumeUrl: "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
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
      const [profileResponse, notificationResponse, dashboardResponse] = await Promise.all([
        api.getProfile(),
        api.notifications({ page: 1, limit: 10 }),
        api.dashboard(),
      ]);
      setProfile(profileResponse.data);
      setNotifications(Array.isArray(notificationResponse.data) ? notificationResponse.data : []);
      setDashboard(dashboardResponse.data);
      setForm({
        firstName: profileResponse.data.firstName ?? "",
        lastName: profileResponse.data.lastName ?? "",
        avatarUrl: profileResponse.data.avatarUrl ?? "",
        resumeUrl: profileResponse.data.resumeUrl ?? "",
      });
    });
  }

  useEffect(() => {
    void load();
  }, []);

  function updateProfile(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.updateProfile(form);
      await load();
    }, "Profile updated.");
  }

  function changePassword(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.changePassword(password);
      setPassword({ currentPassword: "", newPassword: "" });
    }, "Password changed.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-6">
        {message && <StatusMessage kind="success" message={message} />}
        {error && <StatusMessage kind="error" message={error} />}

        <Panel title="Current session" description="Uses GET /users/profile, GET /notifications, and GET /dashboard.">
          {profile ? (
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-3">
                <span className="font-semibold">Name</span>
                <p>{profile.firstName} {profile.lastName}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <span className="font-semibold">Role</span>
                <p>{profile.role}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <span className="font-semibold">Email</span>
                <p>{profile.email}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <span className="font-semibold">User id</span>
                <p className="break-all">{profile.id}</p>
              </div>
            </div>
          ) : (
            <EmptyState text="Login first, then reload profile data." />
          )}
        </Panel>

        <Panel title="Dashboard data" description="Role-specific backend dashboard response.">
          <pre className="max-h-80 overflow-auto rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-50">
            {dashboard ? JSON.stringify(dashboard, null, 2) : "No dashboard data loaded."}
          </pre>
        </Panel>

        <Panel title="Notifications" description="Mark individual or all notifications as read.">
          <div className="mb-4 flex justify-end">
            <SecondaryButton onClick={() => void run(async () => {
              await api.markAllNotificationsRead();
              await load();
            }, "All notifications marked read.")}>
              Mark all read
            </SecondaryButton>
          </div>
          <div className="grid gap-3">
            {notifications.length === 0 && <EmptyState text="No notifications found." />}
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{notification.type}</p>
                  </div>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.markNotificationRead(notification.id);
                    await load();
                  }, "Notification marked read.")}>
                    {notification.isRead ? "Read" : "Mark read"}
                  </SecondaryButton>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 content-start">
        <Panel title="Update profile">
          <form onSubmit={updateProfile} className="grid gap-4">
            <TextField label="First name" value={form.firstName} onChange={(firstName) => setForm({ ...form, firstName })} />
            <TextField label="Last name" value={form.lastName} onChange={(lastName) => setForm({ ...form, lastName })} />
            <TextField label="Avatar URL" value={form.avatarUrl} onChange={(avatarUrl) => setForm({ ...form, avatarUrl })} />
            <TextField label="Resume URL" value={form.resumeUrl} onChange={(resumeUrl) => setForm({ ...form, resumeUrl })} />
            <PrimaryButton>Save profile</PrimaryButton>
          </form>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <SecondaryButton onClick={() => void run(async () => {
              await api.updateAvatar(form.avatarUrl);
              await load();
            }, "Avatar updated.")}>
              Save avatar only
            </SecondaryButton>
            <SecondaryButton onClick={() => void run(async () => {
              await api.updateResume(form.resumeUrl);
              await load();
            }, "Resume updated.")}>
              Save resume only
            </SecondaryButton>
          </div>
        </Panel>

        <Panel title="Change password">
          <form onSubmit={changePassword} className="grid gap-4">
            <TextField label="Current password" type="password" value={password.currentPassword} onChange={(currentPassword) => setPassword({ ...password, currentPassword })} />
            <TextField label="New password" type="password" value={password.newPassword} onChange={(newPassword) => setPassword({ ...password, newPassword })} />
            <PrimaryButton>Change password</PrimaryButton>
          </form>
        </Panel>
      </div>
    </div>
  );
}
