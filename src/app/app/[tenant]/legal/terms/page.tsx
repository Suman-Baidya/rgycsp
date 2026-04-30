import { WorkspaceLegalPage } from "@/components/layout/WorkspaceLegalPage";

export default async function TermsOfServicePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const defaultContent = `
# Terms of Service

By accessing or using our educational platform, you agree to comply with and be bound by the following terms and conditions.

## 1. Acceptance of Terms
Please read these terms carefully before using the platform. Your continued use constitutes acceptance of these terms.

## 2. User Conduct
Users are expected to maintain academic integrity and respect fellow students and faculty members.

## 3. Course Access
Enrollment grants a non-exclusive license to access course materials for the duration of the program.

## 4. Limitation of Liability
The institute is not liable for any indirect or consequential damages arising from the use of our services.
  `;

  return (
    <WorkspaceLegalPage 
      tenant={tenant}
      type="legal-terms"
      title="Terms of Service"
      defaultContent={defaultContent}
    />
  );
}
