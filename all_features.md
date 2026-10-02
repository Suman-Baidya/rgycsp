# ABCD Educational Portal — Features & Checking Status
*Audit Date: October 2026 | Platform Architecture: Next.js 16+ Multi-Tenant Educational SaaS*

> **Status Legend:**
> - `[x]` **Implemented & Live:** Fully functional in the web application (database schema, server actions, UI, and business logic complete).
> - `[ ]` **Planned / In-Progress:** Requires dedicated feature implementation or upcoming phase.

---

## Executive Summary & Investor Value Proposition

### 1. Vision & Market Opportunity
The **ABCD Educational Portal** is a cloud-native, multi-tenant operating system designed specifically for vocational, computer, and skill-development training networks. It solves the massive operational fragmentation across distributed educational franchises by unifying the entire academic and financial lifecycle into a single, high-performance platform.

### 2. Business Model & Monetization Architecture
- **Prepaid Registration Credit Engine:** Franchise centers prepay into a platform wallet. Per-student course registrations automatically debit wallet balances, providing predictable, upfront SaaS cash flow for the platform operator.
- **Physical Merchandise & Collateral Marketplace:** In-app B2B supply chain procurement for physical books, branded student bags, badges, course materials, and certificates.
- **B2B Regional Expansion Engine (State Managers):** Automated affiliate commission payouts incentivizing high-performing center operators to recruit and mentor regional franchise networks.
- **Turnkey Subdomain Marketing:** Every onboarded franchise instantly receives an SEO-optimized landing page, course catalog, lead capture inbox, and localized admission system.

### 3. Anti-Counterfeiting & Academic Governance (The Trust Moat)
- **24/7 Public QR Code Verification:** Instant employer validation for Student ID Cards, Admit Cards, Semester Marksheets, and Course Certificates.
- **Automated Issuance Pipeline:** Flexible background signing delay timers with manual Super Admin override to prevent accidental releases.
- **Strict Academic Prerequisite Gates:** Guarantees course duration compliance and prerequisite semester marksheet approvals before final certificates can be unlocked.
- **Pro-Rated Tenure/Semester Fee Advisory:** Non-blocking fee intelligence that evaluates overdue EMI installments up to the exact exam date without stranding students.

---

## 1. Students Module

### 1.1. Student Admission
- [x] **Online Admission (Main Landing Page):** Apply via the primary site landing page (`/admission`) and track admission status in real-time (`/admission/status`).
- [x] **Online Admission (Franchise Landing Page):** Apply through a franchise-specific sub-domain/subdirectory (`/app/[tenant]/admission`) with center auto-tagging.
- [x] **Custom Admission Form:** Dynamic admission form fields, mandatory toggles, and disclosures configured per franchise by Franchise Admin (`admission-config.ts`).
- [x] **Direct Admission:** Manual one-by-one student admission directly from Franchise Admin dashboard (`ManualEnrollmentTab.tsx`).
- [x] **Bulk Import:** Batch upload of student admission records using standard CSV files with validation, preview, and error reporting (`CsvBulkImport.tsx`).

### 1.2. Enrollment & Registration System
- [x] **Unique Enrollment Number:** Generated once per student upon first entry (e.g. `RGY000001`); acts as the permanent username for student portal authentication.
- [x] **Course Registration Number:** Generated whenever an enrolled student registers for a specific course (e.g. `RGY/2026/0001`).
- [x] **Relationship Model:** One Student = Single permanent Enrollment ID; can hold multiple Course Registration Numbers across concurrent or sequential courses.
- [x] **Enrollment Scope:** Tracks permanent student biodata (name, DOB, gender, blood group, guardian details, address, permanent photo/signature).
- [x] **Registration Scope:** Tracks course-specific items (Course ID Card, Admit Card, Batch, Routine, Examinations, and Marksheets).
- [x] **Admin Views:** Super Admin and Franchise Admin operational student lists group and filter records by **Course & Registration Number** rather than raw enrollment.

### 1.3. Student Payment Cycle
- [x] **Fee Configuration:** Franchise Admin configures fee structures, tuition amounts, and payment plans directly on the Courses page.
- [x] **Flexible Billing:** Supports one-time lump-sum payments or EMI/monthly installments with automated invoice ledger.
- [x] **Dues & Notifications:** Automated tracking and smart reminder notifications for overdue or pending fee payments.
- [x] **Pro-rated Semester/Tenure Fee Dues Advisory:** Custom advisory alert during Admit Card and exam generation calculating elapsed months/tenure from student admission date to exam date (e.g. 6 months for Semester 1) to identify pending EMI installments up to the exam date without blocking exam entry.

### 1.4. Course Material & Learning Resources
- [x] **Student Dashboard Access:** Instant delivery of digital curriculum and syllabus materials to the enrolled student's workspace (`/student/courses`).
- [x] **Multi-Format Media:** Full support for rich curriculum text, downloadable PDF modules, embedded video lectures, and external reference links.
- [x] **Syllabus & Progress Tracking:** Real-time visibility into completed modules, topic checklists, and syllabus progress.
- [x] **Automatic ID Cards:** Dynamic generation of digital student ID cards with student photo, barcode, center code, and course name immediately upon registration.
- [x] **QR Code Attendance:** Integrated dynamic QR code on ID cards linking to online verification and attendance scanning.

### 1.5. Examination
- [x] **Hybrid Assessment:** Franchise Admin can conduct exams online, offline, or in a hybrid format via the Exam Generator module (`/admin/exam-generator`).
- [x] **Offline Exam Tools:** Printable attendance sheets, room allocation rosters, and candidate signature verification sheets.
- [x] **Admit Card Generator:** One-click generation, preview, and distribution of student examination hall tickets with seat numbers and rules.
- [x] **Online Exam Engine:** Question paper authoring (MCQs, descriptive) with automated scheduling, timer controls, and instant submission (`student-exam.ts`).
- [x] **Marks Entry:** Franchise Admin marks entry portal for offline and subjective exam results with automated grade and percentage calculation (`StudentsResultTab.tsx`).

### 1.6. Certificates & Marksheets
- [x] **Semester Marksheets:** Automated generation of semester-wise grade/marks reports upon exam evaluation.
- [x] **Final Certification:** Course completion certificates unlocked once all required semester/module exams are cleared.
- [x] **Document Release Workflow:** Secure access provided to students only after explicit verification and sign-off by the Franchise Admin.
- [x] **Public Verification:** 24/7 online verification engine on landing page (`StudentFeaturesGrid.tsx` & `verifications.ts`) for external employers by Registration or Certificate Number.

### 1.7. Re-Admission & Upgrades
- [x] **Seamless Re-Enrollment:** Direct re-admission into new courses for existing students without re-entering personal profile data.
- [x] **Smart Course Combobox:** Real-time search by title, code (e.g. DCA, Tally), duration, or category with duplicate enrollment prevention.
- [x] **Auto-Populated Billing:** Automatically pulls student profile using the permanent Enrollment Number; course fee and payment plans auto-populate.
- [x] **New Registration Lifecycle:** Issues a fresh Course Registration Number and updated ID card while retaining historical completed course records.
- [x] **Unified Dashboard:** Centralized view across past, completed, and currently active courses with a header course-switcher dropdown.

### 1.8. Student Dashboard Overview & Class Scheduling
- [x] **My Courses:** Active syllabus progress, course materials, assignments, and recommendations for subsequent courses (`/student/courses`).
- [x] **Weekly Class & Lab Routine:** Theory batch routine and weekly recurring practical computer lab schedule (`/student/attendance`).
- [x] **Exams:** Upcoming exam timetable, direct admit card downloads, and past result archives (`/student/exams`).
- [x] **Fees & Invoices:** Integrated payment ledger, payment history, installment schedules, and downloadable tax invoices (`/student/fees`).
- [x] **Notice Board:** Real-time centralized alerts for holidays, exam dates, schedules, and circulars from the center (`/student/notices`).
- [x] **Profile & Security:** Management of personal information, contact info, photo updates, and password resets (`/student/profile`).
- [x] **One-Time Extra Class Booking & Approval:** Student self-service request system for single-session extra lab/theory classes on specific dates & time slots with Franchise Admin review/approval (computer/slot booking) or direct ad-hoc booking by Franchise Admin.
- [x] **Extra Class Attendance Integration:** Dedicated attendance recording (via QR code scan or manual admin toggle) specifically marked for one-time extra classes, seamlessly aggregating into total student attendance.

---

## 2. Franchise Admin Module

### 2.1. Franchise Onboarding & Setup
- [x] **Online Application:** Prospective center owners submit applications directly through the main platform (`/franchises/apply`) and track review status (`/franchises/status`).
- [x] **Direct Provisioning:** Super Admin can manually initialize and approve new franchises instantly.
- [x] **Bulk Franchise Upload:** Super Admin batch onboarding via CSV file (`workspaces-import.ts`).
- [x] **Credentialed Access:** Secure login authentication using Email ID or Center ID.
- [x] **Onboarding Asset Kit:** Digital issuance of Franchise License/Certificate, Franchise Admin ID Card, admin console, and dedicated landing page.

### 2.2. Franchise Configuration & Customization
- [x] **Workspace Settings:** Configurable center branding, theme colors, typography, and administrative contacts (`/admin/settings`).
- [x] **Dynamic Subdomain Landing Page:** Modular section customization (Hero, About, Courses, Contact, FAQ, Gallery) for localized student marketing.
- [x] **Course Catalog Selection:** Ability to enable or disable courses authorized by Super Admin for local offering.
- [x] **Pricing Control:** Localized adjustment of course pricing and fee breakdown (cannot invent unapproved courses).
- [x] **Custom Admission Forms:** Tailor fields, requirements, and disclosures for incoming online candidates.

### 2.3. Staff & Role-Based Permissions
- [x] **Team Management:** Add instructors, counselors, and administrative staff using email invites (`/admin/staff`).
- [x] **Granular Access Control:** Define view/edit permissions on a per-page or per-feature basis (e.g., Attendance only, Billing only).
- [x] **Dedicated Staff Portals:** Separate login panels and filtered sidebars for faculty and administrative assistants.

### 2.4. Wallet & Billing Engine
- [x] **Prepaid Wallet Architecture:** Franchise maintains a prepaid platform balance to pay Super Admin per-student registration fees (`/admin/wallet`).
- [x] **Registration Deductions:** Automated wallet balance deductions triggered upon finalizing each student course registration.
- [x] **Decoupled Student Fees:** Tuition payments collected from students are kept independent of the platform wallet balance.

### 2.5. Student Registration Lifecycle
- [x] **Admission Approval:** Screening queue for approving prospective student forms submitted online or entered at the desk.
- [x] **Enrollment vs. Registration:** Initial approval generates the student Enrollment Number; course commitment triggers Registration.
- [x] **Balance Checks:** Hard block on course registration if the franchise wallet balance has insufficient funds.
- [x] **Editable Windows:** Field updates permitted on student profiles up until final exam lock and certificate dispatch.
- [x] **Prerequisite Gating:** Enforces mandatory checks (complete student profile, assigned batch, funded wallet) before registration activates.

### 2.6. Student & Batch Management
- [x] **Central Student Records:** Single pane of glass to view, filter, and edit active registrations (`/admin/students`).
- [x] **Interactive Attendance System:** Batch-wise attendance marking for theory and laboratory/practical sessions (`/admin/attendance`).
- [x] **Batch & Timetable Manager:** Theory class distribution, section grouping, and instructor scheduling (`batches.ts`).
- [x] **Ad-hoc Extra Class Dispatcher:** Center admin interface to schedule extra single-session practical or theory slots for specific students with seat capacity limits (`ExtraClassesTab.tsx`).

### 2.7. Examination Administration
- [x] **Exam Zone Control:** Setup of question banks, answer keys, and timers for digital exams (`/admin/exam-generator`).
- [x] **Offline Logistics:** Seating arrangements, verification rosters, and paper management.
- [x] **Admit Card Publishing:** Automated generation of student hall tickets with exam regulations.
- [x] **Grade Book:** Marksheet entry grid for theory, viva, and practical marks; validates inputs before report generation.

### 2.8. Certificate & Marksheet Pipeline
- [x] **Marks Validation:** Mandatory completion of marks entry before marksheet rendering is allowed.
- [x] **Sequential Approval:** Course certificates require prior passing and release of all semester marksheets.
- [x] **Super Admin Certificate Automation & Manual Override:** Franchise submits certificate issuance request to Super Admin. If Super Admin enables auto-issuance, the certificate automatically issues upon expiration of the configured delay timer (e.g., 60 minutes or X days). Super Admin can click "Issue Now" to immediately release before the timer expires. If automation is disabled, it strictly requires manual Super Admin review and sign-off.
- [x] **Timeline Rules:** Validates document generation eligibility based on admission date, course duration, and term end dates.
- [x] **High-Resolution Export:** Formats all certificates and transcripts into print-ready PDF formats.
- [x] **Two-Tier Verification:** Super Admin issues the base document template, Franchise Admin reviews/signs, and student receives final file.

### 2.9. Store & Inventory Procurement
- [x] **Portal Store:** In-app store for franchises to purchase physical books, branded student bags, badges, and uniforms (`/admin/products`).
- [x] **Logistics & Order Tracking:** Real-time dispatch, tracking number, and delivery status updates (`product-order.ts`).

### 2.10. State Manager / Affiliate Referral Engine
- [x] **B2B Referral System:** Financial incentives/commissions rewarded when an existing franchise onboards a new branch (`/admin/state-manager`).
- [x] **Commission Auditing:** Real-time commission ledger, milestones, and transparent calculation breakdowns.

### 2.11. Marketing & Lead Generation
- [x] **Campaign URL Builder:** Built-in UTM and campaign link generator for social media marketing tracking.
- [x] **Traffic Analytics:** Visitor conversion rates and visit metrics across franchise landing pages (`/admin/analytics`).
- [x] **Inquiry & CRM Inbox:** Contact forms and prospective lead management (`/admin/enquiries`).
- [x] **Data Export:** Instant download of leads, analytics, and inquiries in `.xlsx`/CSV format.

### 2.12. Events & Circulars
- [x] **Promotional Announcements:** Publicize upcoming workshops, guest lectures, and seminars on local landing pages.
- [x] **Internal Circulars:** Publish announcements displayed directly in enrolled student portals.
- [x] **Super Admin Feed:** Receive broadcast directives and notices sent down by Super Admin.

---

## 3. Super Admin Module

### 3.1. Franchise Lifecycle Administration
- [x] **Onboarding Engine:** Single-entry form, batch CSV ingestion, or review of incoming public applications (`/super-admin/franchises`).
- [x] **Franchise Entitlements:** Enable/disable features, set custom certificate permissions, and adjust territorial jurisdictions.
- [x] **State Manager Designation:** Promote top-performing franchise operators to regional state managers (`/super-admin/state-managers`).
- [x] **Subdomain Provisioning:** Automated DNS/subdomain mapping (e.g., `centername.portal.com`) and subdirectory routing (`/app/[tenant]`).

### 3.2. Global Course Curriculum
- [x] **Master Catalog:** Centralized creation of courses, syllabi, study materials, module structures, and term durations (`/super-admin/courses`).
- [x] **Governance:** Lock course metadata so franchises can only adjust retail pricing, not curriculum structure or nomenclature.

### 3.3. Content Management System (CMS)
- [x] **Corporate Landing Page:** Full content editing, banner management, branding, and legal disclosures for the primary domain (`/super-admin/settings`).
- [x] **Franchise Template Builder:** Global control over template layouts available to individual franchise landing pages.

### 3.4. Master Wallet & Financial Auditing
- [x] **Ledger Inspection:** Real-time visibility into all franchise balances, recharges, debits, and adjustments (`/super-admin/wallet` & `/super-admin/token-economy`).
- [x] **Payment Approval:** Manual verification flow for offline/UPI bank transfers with screenshot verification and one-click balance top-ups.

### 3.5. Dynamic Document Builder & Versioning
- [x] **Visual Template Designer:** Drag-and-drop / visual layout builder for certificates, diplomas, ID cards, and marksheets (`/super-admin/documents`).
- [x] **Academic Session Variants:** Configure temporal templates matching specific academic calendar years (e.g., 2024–2025 vs. 2025–2026).
- [x] **Automated Issuance Pipeline:** Global toggles for automated background signing and batch publishing with delay timers (`RegistrationConfig`).
- [x] **Print Output Standards:** Multiple download modes including standard web PDFs and high-resolution print outputs.

### 3.6. Global Leads & Central Marketing
- [x] **Master Lead Repository:** Aggregated tracking of prospective students and franchise inquiries across all channels (`/super-admin/enquiries`).
- [x] **Referral & Campaign Attribution:** Channel-by-channel breakdown of lead acquisition sources.
- [x] **Central Visitor Analytics:** Comprehensive site visitor metrics and regional engagement heatmaps (`/super-admin/analytics`).

### 3.7. Document Design Governance
- [x] **Template Switcher:** Manage multiple active design themes per document type.
- [x] **Conditional Activation:** Enable/disable specific layouts with variant pickers available during export.

### 3.8. Multi-Tenant User Management & Role Hierarchy
- [x] **Role Hierarchy & Delegated Super Admin Manager:** System-wide management for 5 user tiers:
  1. *Super Admin:* Root governance, platform configuration, emergency credential resets, master wallet token minting, and franchise deletion.
  2. *Super Admin Manager:* Delegated central administrative operations (franchise onboarding, student review, master course management, certificate approval, central inquiry CRM), with restricted access preventing root credential changes or master financial ledger adjustments.
  3. *Franchise Admin:* Center owner with full management over local students, batches, staff, fees, local admissions, and wallet recharges.
  4. *Franchise Staff / Faculty:* Instructors and administrative assistants with granular, role-based page permissions.
  5. *Student:* Enrolled learner with personal portal access, course curriculum, attendance records, exam tickets, and certificates.
- [x] **Dedicated Management Views:** Dedicated user directories separated into Internal Staff, Franchise Operators, and Enrolled Students (`/super-admin/users`, `/super-admin/students`).

### 3.9. State Manager / Affiliate Governance
- [x] **Commission Policy Engine:** Set referral percentages, recurring reward rules, and minimum payout thresholds (`/super-admin/state-managers`).
- [x] **Payout Distribution:** Transparent tracking of commission disbursements and franchise expansion trees.

### 3.10. Central Supply Chain & Merchandise Store
- [x] **Inventory Catalog:** Add, update, and categorize student kits, books, hardware, and branded collateral (`/super-admin/products`).
- [x] **Order Fulfillment:** Inventory levels, invoice processing, order dispatch tracking, and proof-of-delivery updates.

---

## 4. Platform Security, Identity & Governance

### 4.1. Security & Identity
- [x] **Super Admin Impersonation:** Super Admin can securely impersonate any Franchise Admin or Student for rapid troubleshooting without requesting passwords (`impersonate.ts`).
- [x] **Biometric / WebAuthn Support:** Built-in Passkey and biometric credential authentication (`webauthn.ts`).
- [x] **NextAuth JWT & Role Guard:** Edge proxy route protection enforcing strict role boundaries (`src/proxy.ts`).

---

## 5. Dynamic Content Management, Navigation & Branding

### 5.1. Dynamic Navigation Menu Engine
- [x] **Header & Footer Menu Builder:** Dynamic creation, ordering, and URL assignment for navigation menus across both global and franchise sites (`site-settings.ts`).
- [x] **Tenant Context Isolation:** Franchise websites can override menu links or inherit global defaults.

### 5.2. Legal Pages CMS & Slug Engine
- [x] **Multi-Tenant Legal CMS:** Independent legal pages (Privacy Policy, Terms of Service, Cookie Policy, Refund Policy) for Global site (`/legal/[slug]`) and Franchise workspaces (`/app/[tenant]/legal/[slug]`).
- [x] **Markdown & Rich Content:** Rendered via markdown parser with custom slugs and revision timestamps.

### 5.3. Photo Gallery & Campus Showcase
- [x] **Franchise Campus Gallery:** Dedicated image management suite allowing franchise admins to upload and categorize lab photos, events, and classroom activities (`gallery.ts` & `/app/[tenant]/gallery`).

---

## 6. Geo-Discovery & Public Verification Suite

### 6.1. Nearest Center & Location Discovery
- [x] **Nearest Franchise Locator:** Public student center finder searching by PIN code, district, or GPS coordinates (`nearest-center.ts`).
- [x] **Instant Indian PIN Code Lookup:** Real-time integration with Indian Postal API auto-filling Post Office, District, and State upon entering a 6-digit PIN (`pincode.ts`).

### 6.2. Public Credential Verification Engine
- [x] **Application Status Verification:** Public modal lookup to check pending/approved online applications (`verifyApplicationStatus`).
- [x] **Student Registration Verification:** 24/7 public modal verification confirming student enrollment and validity by Registration Number (`verifyRegistration`).
- [x] **Certificate Verification:** Online authenticity verification for issued course certificates with QR code scanning (`verifyCertificate`).
- [x] **Marksheet Verification:** Real-time validation of semester marks and subject breakdowns (`verifyMarksheet`).
- [x] **Student ID & Admit Card Verification:** Instant authenticity check for ID Cards and examination Hall Tickets (`verifyStudentId`, `verifyAdmitCard`).

---

## 7. Architecture & User Experience

### 7.1. Hybrid Multi-Tenant Routing
- [x] **Dual Mode Execution:** Supports both **Subdirectory Mode** (`domain.com/app/[tenant]/...`) and **Subdomain Mode** (`[tenant].domain.com/...`) simultaneously with zero code duplication (`src/proxy.ts`).
- [x] **Automatic Mode Detection & Context Preservation:** Client and server utilities (`getTenantLink`, `getServerTenantLink`) maintaining context across page changes and redirects.

### 7.2. UI Design System & Theming
- [x] **Dark / Light Mode Support:** High-contrast dark mode and sleek light mode with local persistence and zero flicker.
- [x] **Compact Dashboard Standards:** Strict adherence to dashboard density rules (compact metric cards, table dividers, consistent action buttons, standardized pagination).
- [x] **Real-Time Web Push Notifications:** Push alerts and in-app bell drawer for crucial institutional events (`web-push.ts` & `notifications.ts`).