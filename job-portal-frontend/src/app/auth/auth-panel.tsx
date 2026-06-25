"use client";

import { FormEvent, useState } from "react";
import { Panel, StatusMessage } from "@/components/app-shell";
import { PrimaryButton, TextField } from "@/components/form-controls";
import { api } from "@/lib/api-client";

const initialRegister = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export function AuthPanel() {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [candidate, setCandidate] = useState(initialRegister);
  const [recruiter, setRecruiter] = useState(initialRegister);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(action: () => Promise<unknown>, success: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function submitLogin(event: FormEvent) {
    event.preventDefault();
    void handleSubmit(() => api.login(login), "Logged in. Protected pages can now use your session.");
  }

  function submitCandidate(event: FormEvent) {
    event.preventDefault();
    void handleSubmit(
      () => api.registerCandidate(candidate),
      "Candidate account created. Login with those credentials.",
    );
  }

  function submitRecruiter(event: FormEvent) {
    event.preventDefault();
    void handleSubmit(
      () => api.registerRecruiter(recruiter),
      "Recruiter account created. Login with those credentials.",
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel title="Login" description="Creates the backend access_token cookie.">
        <form onSubmit={submitLogin} className="grid gap-4">
          <TextField label="Email" value={login.email} onChange={(email) => setLogin({ ...login, email })} required />
          <TextField label="Password" type="password" value={login.password} onChange={(password) => setLogin({ ...login, password })} required />
          <PrimaryButton disabled={loading}>Login</PrimaryButton>
        </form>
      </Panel>

      <RegisterForm
        title="Register candidate"
        description="Candidate users can apply, save jobs, and track applications."
        value={candidate}
        onChange={setCandidate}
        onSubmit={submitCandidate}
        loading={loading}
      />

      <RegisterForm
        title="Register recruiter"
        description="Recruiters can create companies, post jobs, and manage applicants."
        value={recruiter}
        onChange={setRecruiter}
        onSubmit={submitRecruiter}
        loading={loading}
      />

      <div className="lg:col-span-3">
        {message && <StatusMessage kind="success" message={message} />}
        {error && <StatusMessage kind="error" message={error} />}
      </div>
    </div>
  );
}

function RegisterForm({
  title,
  description,
  value,
  onChange,
  onSubmit,
  loading,
}: {
  title: string;
  description: string;
  value: typeof initialRegister;
  onChange: (value: typeof initialRegister) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
}) {
  return (
    <Panel title={title} description={description}>
      <form onSubmit={onSubmit} className="grid gap-4">
        <TextField label="First name" value={value.firstName} onChange={(firstName) => onChange({ ...value, firstName })} required />
        <TextField label="Last name" value={value.lastName} onChange={(lastName) => onChange({ ...value, lastName })} required />
        <TextField label="Email" value={value.email} onChange={(email) => onChange({ ...value, email })} required />
        <TextField label="Password" type="password" value={value.password} onChange={(password) => onChange({ ...value, password })} required />
        <PrimaryButton disabled={loading}>Create account</PrimaryButton>
      </form>
    </Panel>
  );
}
