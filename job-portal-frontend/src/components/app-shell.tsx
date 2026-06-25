import Link from "next/link";

const navItems = [
  ["Jobs", "/jobs"],
  ["Companies", "/companies"],
  ["Candidate", "/candidate"],
  ["Recruiter", "/recruiter"],
  ["Admin", "/admin"],
  ["Profile", "/profile"],
  ["API", "/api-workspace"],
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-slate-950 text-sm font-bold text-white">
            JP
          </span>
          <span className="text-lg font-semibold tracking-normal">JobPath</span>
        </Link>

        <div className="flex flex-wrap gap-2 text-sm font-medium text-slate-600">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <AppHeader />
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          {eyebrow && (
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-4xl font-semibold tracking-normal sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {description}
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}

export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function StatusMessage({
  message,
  kind = "info",
}: {
  message: string;
  kind?: "info" | "success" | "error";
}) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return (
    <div className={`rounded-md border px-3 py-2 text-sm font-medium ${classes[kind]}`}>
      {message}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}
