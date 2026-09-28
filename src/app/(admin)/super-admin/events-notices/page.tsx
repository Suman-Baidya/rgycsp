import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SuperAdminEventsNoticesClient } from "./SuperAdminEventsNoticesClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminEventsNoticesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER") {
    redirect("/");
  }

  return <SuperAdminEventsNoticesClient />;
}
