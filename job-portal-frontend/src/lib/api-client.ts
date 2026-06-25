export type ApiEnvelope<T = unknown> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: unknown;
  errors?: string[] | null;
};

export type UserRole = "candidate" | "recruiter" | "admin";
export type JobType = "full_time" | "part_time" | "contract" | "internship";
export type JobStatus = "draft" | "published" | "closed";
export type CompanySize =
  | "startup"
  | "small"
  | "medium"
  | "large"
  | "enterprise";
export type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  resumeUrl?: string;
  isActive?: boolean;
};

export type Company = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  location?: string;
  size?: CompanySize;
  isVerified?: boolean;
};

export type Skill = {
  id: string;
  name: string;
  slug?: string;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  type: JobType;
  status: JobStatus;
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  expiresAt?: string;
  company?: Company;
  category?: Category;
  skills?: Skill[];
};

export type Application = {
  id: string;
  job?: Job;
  applicant?: User;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  appliedAt?: string;
};

export type SavedJob = {
  id: string;
  job?: Job;
  savedAt?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt?: string;
};

export type DashboardData = Record<string, unknown>;

const fallbackBaseUrl = "http://localhost:3001/api/v1";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? fallbackBaseUrl;
}

function makeUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
) {
  const url = new URL(`${getApiBaseUrl().replace(/\/$/, "")}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & {
    query?: Record<string, string | number | boolean | undefined>;
    body?: BodyInit | Record<string, unknown> | null;
  } = {},
) {
  const headers = new Headers(init.headers);
  let body = init.body as BodyInit | null | undefined;

  if (body && !(body instanceof FormData) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(makeUrl(path, init.query), {
    ...init,
    body,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T>)
    : ({
        success: response.ok,
        statusCode: response.status,
        message: response.statusText,
        data: (await response.text()) as T,
      } satisfies ApiEnvelope<T>);

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
}

export const api = {
  login: (body: { email: string; password: string }) =>
    apiRequest<{ message: string }>("/auth/login", { method: "POST", body }),
  registerCandidate: (body: RegisterBody) =>
    apiRequest("/auth/register/candidate", { method: "POST", body }),
  registerRecruiter: (body: RegisterBody) =>
    apiRequest("/auth/register/recruiter", { method: "POST", body }),
  me: () => apiRequest<User>("/auth/me"),

  createUser: (body: RegisterBody & { role?: UserRole }) =>
    apiRequest<User>("/users", { method: "POST", body }),
  listUsers: () => apiRequest<User[]>("/users"),
  getProfile: () => apiRequest<User>("/users/profile"),
  updateProfile: (body: Partial<User>) =>
    apiRequest<User>("/users/profile", { method: "PATCH", body }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiRequest("/users/profile/change-password", { method: "PATCH", body }),
  updateAvatar: (avatarUrl: string) =>
    apiRequest<User>("/users/profile/avatar", {
      method: "PATCH",
      body: { avatarUrl },
    }),
  updateResume: (resumeUrl: string) =>
    apiRequest<User>("/users/profile/resume", {
      method: "PATCH",
      body: { resumeUrl },
    }),
  getUser: (id: string) => apiRequest<User>(`/users/${id}`),
  updateUser: (id: string, body: Partial<User> & { password?: string }) =>
    apiRequest<User>(`/users/${id}`, { method: "PATCH", body }),
  deleteUser: (id: string) => apiRequest(`/users/${id}`, { method: "DELETE" }),

  listJobs: (query?: Record<string, string | number | boolean | undefined>) =>
    apiRequest<Job[]>("/jobs", { query }),
  getJob: (id: string) => apiRequest<Job>(`/jobs/${id}`),
  createJob: (body: JobBody) =>
    apiRequest<Job>("/jobs", { method: "POST", body }),
  updateJob: (id: string, body: Partial<JobBody>) =>
    apiRequest<Job>(`/jobs/${id}`, { method: "PATCH", body }),
  publishJob: (id: string) =>
    apiRequest<Job>(`/jobs/${id}/publish`, { method: "PATCH" }),
  closeJob: (id: string) =>
    apiRequest<Job>(`/jobs/${id}/close`, { method: "PATCH" }),
  deleteJob: (id: string) => apiRequest(`/jobs/${id}`, { method: "DELETE" }),

  listCompanies: (query?: Record<string, string | number | undefined>) =>
    apiRequest<Company[]>("/companies", { query }),
  myCompanies: () => apiRequest<Company[]>("/companies/my-companies"),
  getCompany: (id: string) => apiRequest<Company>(`/companies/${id}`),
  createCompany: (body: CompanyBody) =>
    apiRequest<Company>("/companies", { method: "POST", body }),
  updateCompany: (id: string, body: Partial<CompanyBody>) =>
    apiRequest<Company>(`/companies/${id}`, { method: "PATCH", body }),
  verifyCompany: (id: string) =>
    apiRequest<Company>(`/companies/${id}/verify`, { method: "PATCH" }),
  deleteCompany: (id: string) =>
    apiRequest(`/companies/${id}`, { method: "DELETE" }),

  listCategories: () => apiRequest<Category[]>("/categories"),
  createCategory: (body: { name: string; icon?: string }) =>
    apiRequest<Category>("/categories", { method: "POST", body }),
  updateCategory: (id: string, body: { name?: string; icon?: string }) =>
    apiRequest<Category>(`/categories/${id}`, { method: "PATCH", body }),
  deleteCategory: (id: string) =>
    apiRequest(`/categories/${id}`, { method: "DELETE" }),

  listSkills: () => apiRequest<Skill[]>("/skills"),
  createSkill: (body: { name: string }) =>
    apiRequest<Skill>("/skills", { method: "POST", body }),
  updateSkill: (id: string, body: { name?: string }) =>
    apiRequest<Skill>(`/skills/${id}`, { method: "PATCH", body }),
  deleteSkill: (id: string) =>
    apiRequest(`/skills/${id}`, { method: "DELETE" }),

  apply: (body: { jobId: string; coverLetter?: string; resumeUrl?: string }) =>
    apiRequest<Application>("/applications", { method: "POST", body }),
  myApplications: () => apiRequest<Application[]>("/applications/my"),
  jobApplications: (jobId: string) =>
    apiRequest<Application[]>(`/applications/job/${jobId}`),
  updateApplicationStatus: (id: string, status: ApplicationStatus) =>
    apiRequest<Application>(`/applications/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
  withdrawApplication: (id: string) =>
    apiRequest(`/applications/${id}`, { method: "DELETE" }),

  saveJob: (jobId: string) =>
    apiRequest<SavedJob>("/saved-jobs", { method: "POST", body: { jobId } }),
  mySavedJobs: () => apiRequest<SavedJob[]>("/saved-jobs"),
  removeSavedJob: (id: string) =>
    apiRequest(`/saved-jobs/${id}`, { method: "DELETE" }),

  notifications: (query?: { page?: number; limit?: number }) =>
    apiRequest<NotificationItem[]>("/notifications", { query }),
  markAllNotificationsRead: () =>
    apiRequest("/notifications/read-all", { method: "PATCH" }),
  markNotificationRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, { method: "PATCH" }),

  dashboard: () => apiRequest<DashboardData>("/dashboard"),
};

export type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type CompanyBody = {
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  location?: string;
  size?: CompanySize;
};

export type JobBody = {
  title: string;
  description: string;
  type?: JobType;
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  expiresAt?: string;
  companyId: string;
  categoryId?: string;
  skillIds?: string[];
};
