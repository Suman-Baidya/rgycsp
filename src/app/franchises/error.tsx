"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function FranchisesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Franchises page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-destructive" />
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        Something went wrong!
      </h2>
      
      <p className="text-muted-foreground max-w-[500px] mb-8">
        We encountered an issue loading the franchises information. The rest of the site is still running normally.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">
            Return to Main Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
