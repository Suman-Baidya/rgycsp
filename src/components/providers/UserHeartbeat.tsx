"use client";

import { useEffect } from "react";
import { updateUserHeartbeat } from "@/app/actions/heartbeat";
import { useSession } from "next-auth/react";

export function UserHeartbeat() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    // Initial heartbeat
    updateUserHeartbeat();

    // Set interval for every 3 minutes
    const interval = setInterval(() => {
      updateUserHeartbeat();
    }, 1000 * 60 * 3);

    return () => clearInterval(interval);
  }, [session]);

  return null;
}
