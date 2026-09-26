import EnquiriesClient from "./EnquiriesClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SuperAdminEnquiriesPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  return <EnquiriesClient initialHost={host} />;
}
