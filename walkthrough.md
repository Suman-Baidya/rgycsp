# Multi-Tenant Student Admission System

I have successfully implemented the complete, end-to-end student admission system for the workspaces. 

## Features Completed

### 1. Database & Schema
- Added `AdmissionApplication` model to store all applicant data.
- Added `AdmissionFormConfig` model so each workspace can customize their form.
- Added `Notification` model to alert admins when new applications arrive.

### 2. Admin Settings & Configuration
- **Path:** `/admin/students/admission-config`
- Workspace admins can now enable/disable the admission portal.
- Admins can customize the instructions shown at the top of the form, and the success message shown after submission.
- Admins can toggle optional fields like Guardian Name, Religion, Caste, WhatsApp, and Qualification. Mandatory fields (Name, Phone, Address, Photos) remain fixed.

### 3. Student Public Form
- **Path:** `/admission` (Add this to your navigation menu!)
- A branded, 4-step interactive form for prospective students.
- **PIN Code Auto-fill:** Integrated Indian Postal PIN Code API to automatically fetch District and State when the student enters their 6-digit PIN.
- **Cloudinary Integration:** Added secure file uploads for Photo, Signature, and ID proof. Images are neatly organized into folders named after the workspace.
- **Credentials:** Upon submission, the student is instantly given a unique Application Number (`APP-YYYYMMDD-XXXX`) and an auto-generated password.

### 4. Applicant Dashboard & PDF Generation
- **Path:** `/admission/status`
- Students can log in using their Application Number and Password.
- They can view their current status (Pending, Approved, Rejected).
- **A4 Print:** They can click "Print / Download A4 Form" to get a beautifully formatted, workspace-branded A4 PDF containing all their submitted details, photo, and signature. 

### 5. Admin Approval Workflow
- **Path:** `/admin/students/applications`
- Admins see a searchable, filterable list of all incoming applications.
- Admins can view the full application details, including uploaded documents.
- **Approval:** Admins can reject (with a reason) or approve an application.
- **Enrollment:** When an admin clicks "Approve & Enroll", the system automatically generates an Enrollment Number and creates a permanent `StudentProfile` record, officially adding them to the institute's roster.

## How to Test
1. Go to your workspace dashboard -> **Students** -> **Admission Config**. Enable the portal and save.
2. Go to your workspace landing page and navigate to `/admission` (or add it to your Navbar via Settings).
3. Fill out the form as a dummy student. Use a real PIN code (e.g. `700001`) to test the auto-fill.
4. Copy the credentials shown on the success screen.
5. Go to `/admission/status`, log in, and click the Print button to see the A4 format.
6. Go back to your admin dashboard -> **Students** -> **Admission Applications**, view the new application, and click **Approve & Enroll**.
7. Check your main Students list to see the newly enrolled student!
