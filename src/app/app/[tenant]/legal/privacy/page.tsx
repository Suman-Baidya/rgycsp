import { WorkspaceLegalPage } from "@/components/layout/WorkspaceLegalPage";

export default async function PrivacyPolicyPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const defaultContent = `
# Privacy Policy

We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.

## 1. Information Collection
We collect information that you provide directly to us, such as when you create an account, enroll in a course, or contact our support team.

## 2. Use of Information
Your data is used to provide, maintain, and improve our services, including processing enrollments and sending educational updates.

## 3. Data Security
We implement industry-standard security measures to protect your data from unauthorized access or disclosure.

## 4. Third-Party Services
We do not sell your personal data. We only share information with trusted partners necessary for service delivery.
  `;

  return (
    <WorkspaceLegalPage 
      tenant={tenant}
      type="legal-privacy"
      title="Privacy Policy"
      defaultContent={defaultContent}
    />
  );
}
