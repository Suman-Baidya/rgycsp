# Multi-Tenant Student Admission System

This plan outlines the architecture and implementation steps for adding a comprehensive, configurable, step-by-step student admission system to the workspace platform.

## Goal Description
Implement a robust admission system that allows prospective students to apply for courses at specific workspaces. The system will feature:
1.  **Configurable Admission Forms**: Workspace admins can toggle certain fields on/off and configure form behavior.
2.  **Multi-Step Application UI**: A branded, step-by-step public form for students with file uploads (Photo, Signature, ID Proof).
3.  **Application Tracking**: After submission, students receive credentials (application ID / password) to track their status and download an A4 printable form.
4.  **Admin Approval Workflow**: Admins receive notifications of new applications, verify physical documents/payments, and approve the application, which converts the prospect into an enrolled `StudentProfile`.

> [!IMPORTANT]
> **User Review Required**
> *   **Authentication Flow**: The plan proposes creating a temporary "Applicant" login (using Application ID and a generated password) to check status, rather than a full `User` account immediately. A full `User` account is created upon *approval*. Please confirm if this is acceptable.
> *   **Database Changes**: We will add `AdmissionApplication`, `AdmissionConfig`, and update `Notification` schemas. This requires running a database migration.
> *   **PDF Generation**: We will use a library like `jspdf` or `html2pdf.js` on the client-side to generate the A4 printable form.

## Open Questions
> [!WARNING]
> Please provide feedback on the following:
> 1.  **File Storage**: We assume Cloudinary will be used for Photo, Signature, and ID Proof. Is this correct?
> 2.  **State Auto-select**: You mentioned "State (auto select by district)". Do you want to use an external API for Indian pin codes/districts, or should we bundle a static JSON file with district-to-state mappings?
> 3.  **Notification Method**: Should admin notifications be email-based, or an in-app notification system (bell icon in the dashboard)?

## Proposed Changes

### 1. Database Schema (`prisma/schema.prisma`)
*   **[MODIFY]** `prisma/schema.prisma`
    *   Add `AdmissionApplication` model (Fields: name, guardianName, dob, gender, religion, caste, address json, mobile, whatsapp, email, qualification json, courseId, photoUrl, signUrl, idProofUrl, status: PENDING/APPROVED/REJECTED, tempPassword).
    *   Add `AdmissionConfig` model (Fields: workspaceId, enabledFields json, instructions text).
    *   Add `Notification` model for admin alerts.

### 2. Form Configuration (Admin Dashboard)
*   **[NEW]** `src/app/app/[tenant]/admin/settings/admission/page.tsx`
    *   Admin UI to enable/disable specific form fields and write custom instructions.
*   **[NEW]** `src/app/api/workspaces/[tenant]/admission-config/route.ts`
    *   API to save and fetch form configurations.

### 3. Public Admission Form (Student Facing)
*   **[NEW]** `src/app/app/[tenant]/admission/page.tsx`
    *   Multi-step React Hook Form (Step 1: Personal Info, Step 2: Contact & Address, Step 3: Education & Course, Step 4: Document Uploads).
    *   Integrate Cloudinary upload widgets with size restrictions (100kb for photo/sign, 1mb for ID).
*   **[NEW]** `src/app/api/workspaces/[tenant]/admission/route.ts`
    *   POST endpoint to submit the application, generate a random password, and return the credentials.

### 4. Application Tracking & PDF Download
*   **[NEW]** `src/app/app/[tenant]/admission/status/page.tsx`
    *   Login portal using Application ID / Mobile + Password.
*   **[NEW]** `src/components/admission/AdmissionPDFView.tsx`
    *   A hidden or printable component styled perfectly for A4 size, containing workspace logo, brand, and student details.

### 5. Admin Approval Workflow
*   **[NEW]** `src/app/app/[tenant]/admin/students/applications/page.tsx`
    *   Data table showing pending, approved, and rejected applications.
*   **[NEW]** `src/app/app/[tenant]/admin/students/applications/[id]/page.tsx`
    *   Detailed view of a single application.
    *   "Approve" button that opens a modal to assign a `Batch` and formalize enrollment.
*   **[MODIFY]** `src/app/actions/student.ts` (or similar)
    *   Server action to transition an application to an enrolled `StudentProfile` and create the `User` account.

## Verification Plan

### Automated/Manual Verification
-   **Schema update**: Run `npx prisma generate` and `npx prisma db push` (or migrate dev).
-   **Form flow**: Fill out the admission form, upload dummy files, and verify the success screen shows the tracking credentials.
-   **PDF Test**: Verify the downloaded A4 form looks professional and includes all data.
-   **Approval**: Log in as admin, approve the application, assign a batch, and verify the student appears in the main `StudentProfile` table.
