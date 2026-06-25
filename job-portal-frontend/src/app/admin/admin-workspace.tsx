"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyState, Panel, StatusMessage } from "@/components/app-shell";
import { PrimaryButton, SecondaryButton, SelectField, TextField } from "@/components/form-controls";
import { api, type Category, type Company, type Skill, type User, type UserRole } from "@/lib/api-client";

export function AdminWorkspace() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [userForm, setUserForm] = useState({ email: "", password: "", firstName: "", lastName: "", role: "candidate" as UserRole });
  const [categoryForm, setCategoryForm] = useState({ name: "", icon: "" });
  const [skillForm, setSkillForm] = useState({ name: "" });
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
      const [userResponse, categoryResponse, skillResponse, companyResponse] = await Promise.all([
        api.listUsers(),
        api.listCategories(),
        api.listSkills(),
        api.listCompanies({ page: 1, limit: 100 }),
      ]);
      setUsers(Array.isArray(userResponse.data) ? userResponse.data : []);
      setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
      setSkills(Array.isArray(skillResponse.data) ? skillResponse.data : []);
      setCompanies(Array.isArray(companyResponse.data) ? companyResponse.data : []);
    });
  }

  useEffect(() => {
    void load();
  }, []);

  function createUser(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.createUser(userForm);
      setUserForm({ email: "", password: "", firstName: "", lastName: "", role: "candidate" });
      await load();
    }, "User created.");
  }

  function createCategory(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.createCategory({ name: categoryForm.name, icon: categoryForm.icon || undefined });
      setCategoryForm({ name: "", icon: "" });
      await load();
    }, "Category created.");
  }

  function createSkill(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      await api.createSkill(skillForm);
      setSkillForm({ name: "" });
      await load();
    }, "Skill created.");
  }

  return (
    <div className="grid gap-6">
      {message && <StatusMessage kind="success" message={message} />}
      {error && <StatusMessage kind="error" message={error} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Create user" description="Uses POST /users.">
          <form onSubmit={createUser} className="grid gap-4">
            <TextField label="First name" value={userForm.firstName} onChange={(firstName) => setUserForm({ ...userForm, firstName })} required />
            <TextField label="Last name" value={userForm.lastName} onChange={(lastName) => setUserForm({ ...userForm, lastName })} required />
            <TextField label="Email" value={userForm.email} onChange={(email) => setUserForm({ ...userForm, email })} required />
            <TextField label="Password" type="password" value={userForm.password} onChange={(password) => setUserForm({ ...userForm, password })} required />
            <SelectField label="Role" value={userForm.role} onChange={(role) => setUserForm({ ...userForm, role: role as UserRole })} options={[["candidate", "Candidate"], ["recruiter", "Recruiter"], ["admin", "Admin"]]} />
            <PrimaryButton>Create user</PrimaryButton>
          </form>
        </Panel>

        <Panel title="Create category" description="Uses POST /categories.">
          <form onSubmit={createCategory} className="grid gap-4">
            <TextField label="Name" value={categoryForm.name} onChange={(name) => setCategoryForm({ ...categoryForm, name })} required />
            <TextField label="Icon" value={categoryForm.icon} onChange={(icon) => setCategoryForm({ ...categoryForm, icon })} />
            <PrimaryButton>Create category</PrimaryButton>
          </form>
        </Panel>

        <Panel title="Create skill" description="Uses POST /skills.">
          <form onSubmit={createSkill} className="grid gap-4">
            <TextField label="Name" value={skillForm.name} onChange={(name) => setSkillForm({ name })} required />
            <PrimaryButton>Create skill</PrimaryButton>
          </form>
        </Panel>
      </div>

      <Panel title="Users" description="Uses GET /users, PATCH /users/:id, GET /users/:id, and DELETE /users/:id.">
        <div className="grid gap-3">
          {users.length === 0 && <EmptyState text="No users loaded. Login as admin first." />}
          {users.map((user) => (
            <div key={user.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-slate-500">{user.email} . {user.role}</p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-400">{user.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.getUser(user.id);
                  }, "User fetched successfully.")}>
                    Fetch
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.updateUser(user.id, { firstName: `${user.firstName} Updated` });
                    await load();
                  }, "User updated.")}>
                    Quick update
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.deleteUser(user.id);
                    await load();
                  }, "User deleted.")}>
                    Delete
                  </SecondaryButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Categories" description="Uses GET/PATCH/DELETE category endpoints.">
          <div className="grid gap-3">
            {categories.length === 0 && <EmptyState text="No categories loaded." />}
            {categories.map((category) => (
              <div key={category.id} className="rounded-md border border-slate-200 p-3">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="mt-1 break-all font-mono text-xs text-slate-400">{category.id}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.updateCategory(category.id, { name: `${category.name} Updated` });
                    await load();
                  }, "Category updated.")}>
                    Update
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.deleteCategory(category.id);
                    await load();
                  }, "Category deleted.")}>
                    Delete
                  </SecondaryButton>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Skills" description="Uses GET/PATCH/DELETE skill endpoints.">
          <div className="grid gap-3">
            {skills.length === 0 && <EmptyState text="No skills loaded." />}
            {skills.map((skill) => (
              <div key={skill.id} className="rounded-md border border-slate-200 p-3">
                <h3 className="font-semibold">{skill.name}</h3>
                <p className="mt-1 break-all font-mono text-xs text-slate-400">{skill.id}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.updateSkill(skill.id, { name: `${skill.name} Updated` });
                    await load();
                  }, "Skill updated.")}>
                    Update
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void run(async () => {
                    await api.deleteSkill(skill.id);
                    await load();
                  }, "Skill deleted.")}>
                    Delete
                  </SecondaryButton>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Company verification" description="Uses PATCH /companies/:id/verify.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.length === 0 && <EmptyState text="No companies loaded." />}
          {companies.map((company) => (
            <div key={company.id} className="rounded-md border border-slate-200 p-4">
              <h3 className="font-semibold">{company.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{company.isVerified ? "Verified" : "Not verified"}</p>
              <p className="mt-2 break-all font-mono text-xs text-slate-400">{company.id}</p>
              <div className="mt-3">
                <SecondaryButton onClick={() => void run(async () => {
                  await api.verifyCompany(company.id);
                  await load();
                }, "Company verified.")}>
                  Verify
                </SecondaryButton>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
