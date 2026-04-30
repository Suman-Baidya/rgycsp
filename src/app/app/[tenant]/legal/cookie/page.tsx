import { WorkspaceLegalPage } from "@/components/layout/WorkspaceLegalPage";

export default async function CookiePolicyPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const defaultContent = `
# Cookie Policy

This policy explains how we use cookies and similar technologies to recognize you when you visit our institute's platform.

## 1. What are Cookies?
Cookies are small data files placed on your device to help the platform function efficiently and provide a personalized experience.

## 2. Essential Cookies
These are strictly necessary for the operation of our platform, such as for authentication and security.

## 3. Analytics Cookies
We use these to understand how visitors interact with our platform, helping us improve our educational services.

## 4. Managing Cookies
You can control or delete cookies through your browser settings. However, disabling essential cookies may affect platform functionality.
  `;

  return (
    <WorkspaceLegalPage 
      tenant={tenant}
      type="legal-cookie"
      title="Cookie Policy"
      defaultContent={defaultContent}
    />
  );
}
