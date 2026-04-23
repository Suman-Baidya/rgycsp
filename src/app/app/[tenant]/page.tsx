import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InstituteLandingPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) notFound();

  return (
    <div className="w-full">
      {/* Dynamic Header */}
      <header className="p-6 border-b flex justify-between items-center shadow-sm max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <div className="flex gap-4">
          <Link href={`/app/${tenant}/login`}>
            <Button variant="outline">Student Login</Button>
          </Link>
          <Button>Admissions</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold tracking-tight">Welcome to {workspace.name}</h2>
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
          The premiere destination for educational excellence. This dynamic landing page will be 
          configurable by the Workspace Admin toggling sections like About Us, Courses, and Testimonials.
        </p>
        <div className="mt-10 flex gap-4 justify-center items-center">
          <Button size="lg" className="px-8">Browse Courses</Button>
          <Button size="lg" variant="secondary" className="px-8">Contact Us</Button>
        </div>
      </section>
    </div>
  );
}
