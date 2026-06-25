"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { apiGroups, endpoints, type EndpointDefinition } from "@/lib/api-endpoints";

type ApiResult = {
  status: number | "network";
  ok: boolean;
  url: string;
  method: string;
  body: unknown;
};

const defaultBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

function toJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

function withoutEmptyValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value.trim() !== ""),
  );
}

function buildPath(path: string, params: Record<string, string>) {
  return Object.entries(params).reduce(
    (nextPath, [key, value]) => nextPath.replace(`:${key}`, encodeURIComponent(value)),
    path,
  );
}

function buildUrl(baseUrl: string, endpoint: EndpointDefinition, params: Record<string, string>, query: Record<string, string>) {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const resolvedPath = buildPath(endpoint.path, params);
  const url = new URL(`${cleanBase}${resolvedPath}`);

  Object.entries(withoutEmptyValues(query)).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export function EndpointConsole() {
  const [baseUrl, setBaseUrl] = useState(defaultBaseUrl);
  const [selectedGroup, setSelectedGroup] = useState("Auth");
  const [selectedId, setSelectedId] = useState("auth-login");
  const selectedEndpoint =
    endpoints.find((endpoint) => endpoint.id === selectedId) ?? endpoints[0];
  const [params, setParams] = useState<Record<string, string>>(
    selectedEndpoint.params ?? {},
  );
  const [query, setQuery] = useState<Record<string, string>>(
    selectedEndpoint.query ?? {},
  );
  const [body, setBody] = useState(toJson(selectedEndpoint.body));
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleEndpoints = useMemo(
    () => endpoints.filter((endpoint) => endpoint.group === selectedGroup),
    [selectedGroup],
  );

  function selectEndpoint(endpoint: EndpointDefinition) {
    setSelectedId(endpoint.id);
    setSelectedGroup(endpoint.group);
    setParams(endpoint.params ?? {});
    setQuery(endpoint.query ?? {});
    setBody(toJson(endpoint.body));
    setError(null);
    setResult(null);
  }

  async function sendRequest() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = buildUrl(baseUrl, selectedEndpoint, params, query);
      const hasBody = selectedEndpoint.method !== "GET" && selectedEndpoint.body;
      const init: RequestInit = {
        method: selectedEndpoint.method,
        credentials: "include",
        headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      };

      if (hasBody) {
        init.body = body.trim() ? body : "{}";
      }

      const response = await fetch(url, init);
      const contentType = response.headers.get("content-type") ?? "";
      const responseBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      setResult({
        status: response.status,
        ok: response.ok,
        url,
        method: selectedEndpoint.method,
        body: responseBody,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The request could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f5f7fb] text-slate-950 lg:grid-cols-[300px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <Link href="/" className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-slate-950 text-sm font-bold text-white">
            JP
          </span>
          <span className="font-semibold">JobPath API</span>
        </Link>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {apiGroups.map((group) => {
            const count = endpoints.filter((endpoint) => endpoint.group === group).length;
            return (
              <button
                key={group}
                onClick={() => {
                  const firstEndpoint = endpoints.find((endpoint) => endpoint.group === group);
                  if (firstEndpoint) {
                    selectEndpoint(firstEndpoint);
                  }
                }}
                className={`flex h-11 items-center justify-between rounded-md px-3 text-left text-sm font-semibold transition ${
                  selectedGroup === group
                    ? "bg-slate-950 text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{group}</span>
                <span className="text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-700">
                Backend coverage
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">
                Endpoint workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                All NestJS routes are available here with editable params, query
                fields, request bodies, and cookie-based session requests.
              </p>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700 lg:min-w-[380px]">
              API base URL
              <input
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                className="h-11 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 px-2 text-sm font-semibold text-slate-500">
                {selectedGroup} endpoints
              </div>
              <div className="space-y-2">
                {visibleEndpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => selectEndpoint(endpoint)}
                    className={`w-full rounded-md border p-3 text-left transition ${
                      selectedEndpoint.id === endpoint.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{endpoint.name}</span>
                      <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-bold text-white">
                        {endpoint.method}
                      </span>
                    </div>
                    <p className="mt-2 break-all text-xs text-slate-500">{endpoint.path}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">
                      {selectedEndpoint.method}
                    </span>
                    <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                      {selectedEndpoint.auth ?? "Public"}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold">{selectedEndpoint.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {selectedEndpoint.description}
                  </p>
                  <p className="mt-3 break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                    {selectedEndpoint.path}
                  </p>
                </div>

                <button
                  onClick={sendRequest}
                  disabled={loading}
                  className="flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? "Sending..." : "Send request"}
                </button>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <div className="space-y-5">
                  {Object.keys(params).length > 0 && (
                    <FieldGroup
                      title="Path params"
                      values={params}
                      onChange={setParams}
                    />
                  )}

                  {Object.keys(query).length > 0 && (
                    <FieldGroup title="Query params" values={query} onChange={setQuery} />
                  )}

                  {selectedEndpoint.method !== "GET" && selectedEndpoint.body && (
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        JSON body
                      </span>
                      <textarea
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        className="min-h-[280px] rounded-md border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-50 outline-none transition focus:border-blue-400"
                        spellCheck={false}
                      />
                    </label>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-slate-50">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">Response</h3>
                    {result && (
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-bold ${
                          result.ok
                            ? "bg-emerald-400 text-emerald-950"
                            : "bg-rose-400 text-rose-950"
                        }`}
                      >
                        {result.status}
                      </span>
                    )}
                  </div>

                  {error && (
                    <pre className="whitespace-pre-wrap rounded-md bg-rose-950/70 p-3 text-sm text-rose-100">
                      {error}
                    </pre>
                  )}

                  {!error && !result && (
                    <div className="rounded-md bg-white/5 p-4 text-sm leading-6 text-slate-300">
                      Send a request to see the backend response. Login first for
                      session-protected routes, then keep using the same browser tab.
                    </div>
                  )}

                  {result && (
                    <div className="space-y-3">
                      <div className="rounded-md bg-white/5 p-3 font-mono text-xs leading-5 text-slate-300">
                        <div>{result.method}</div>
                        <div className="break-all">{result.url}</div>
                      </div>
                      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-md bg-black/30 p-3 text-sm leading-6">
                        {typeof result.body === "string"
                          ? result.body
                          : JSON.stringify(result.body, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function FieldGroup({
  title,
  values,
  onChange,
}: {
  title: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}) {
  return (
    <fieldset className="grid gap-3 rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-700">{title}</legend>
      {Object.entries(values).map(([key, value]) => (
        <label key={key} className="grid gap-2 text-sm font-semibold text-slate-700">
          {key}
          <input
            value={value}
            onChange={(event) => onChange({ ...values, [key]: event.target.value })}
            className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-normal outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>
      ))}
    </fieldset>
  );
}
