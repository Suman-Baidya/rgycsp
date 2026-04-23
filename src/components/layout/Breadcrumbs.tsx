"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

const routeConfig: Record<string, string> = {
  "super-admin": "Overview",
  "workspaces": "Workspaces",
  "users": "User Directory",
  "token-economy": "Token Economy",
  "logs": "System Logs",
  "settings": "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span className="text-muted-foreground">System Dashboard</span>
      {paths.map((path, index) => {
        const label = routeConfig[path] || path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
        const isLast = index === paths.length - 1;
        const href = "/" + paths.slice(0, index + 1).join("/");

        // Skip "super-admin" if it's the first segment to avoid redundancy with "Overview"
        if (path === "super-admin" && paths.length > 1) return null;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-4 w-4 text-border" />
            {isLast ? (
              <span className="text-foreground font-semibold">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
