import { notFound } from "next/navigation";

// This file exists purely to trick the Next.js client-side router into treating
// /student/... as a valid route during client-side navigations (e.g. using <Link>).
// When running in Subdomain mode, clicking a link to /student/dashboard will match this
// route on the client, preventing an immediate 404. Then, Next.js fetches the server,
// which triggers proxy.ts middleware to rewrite the request to /app/[tenant]/student/dashboard,
// effectively bypassing this dummy page and loading the actual content.

export default function StudentSubdomainFallback() {
  notFound();
}
