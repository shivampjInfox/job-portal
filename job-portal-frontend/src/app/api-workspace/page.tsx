import type { Metadata } from "next";
import { EndpointConsole } from "./endpoint-console";

export const metadata: Metadata = {
  title: "API Workspace | JobPath",
  description: "Run every Job Portal backend endpoint from the frontend.",
};

export default function ApiWorkspacePage() {
  return <EndpointConsole />;
}
