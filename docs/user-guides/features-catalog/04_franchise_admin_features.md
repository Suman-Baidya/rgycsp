## Chapter 4: Franchise & Study Center Operations Suite

### 4.1 Overview
The **Franchise Administration Suite** (`/admin`) provides branch directors, school principals, and center managers with a turnkey operational dashboard to manage daily academics, admissions, and finances without relying on Head Office for routine tasks.

---

### 4.2 Core Franchise Operations

#### 1. Dynamic Course Management & Advanced Pricing Engine
- **Global Catalog vs Local Overrides**: Franchise centers can adopt central accredited courses or create their own proprietary local certifications.
- **Granular Fee Builder**: Break down course costs into itemized components:
  - *Total Course Fee*
  - *Admission Fee* (One-time joining fee)
  - *Registration Fee* (Board registration & kit)
  - *Exam Fee* (Assessment & evaluation)
  - *Regular Tuition Fee*
- **Display Pricing & Promotional Badges**: Set custom marketing tags displayed on course cards (e.g., `Early Bird Offer: 20% Off`, `Festive Discount`, `Scholarship Eligible`).
- **Installment & EMI Management**: Configure monthly installment payment plans (*Installment Amount* and *Total Installments*). Enrolled students have scheduled installments generated automatically in their fee ledgers.
- **Show/Hide Fee Toggle**: Choose whether fees are displayed publicly on the website or shown as *"Contact Center for Pricing"* to generate offline inquiries.

#### 2. Admission Form Configuration Engine
Every franchise center has its own high-conversion public admission portal (`/admission`) with a customizable form builder:
- **Intake Control**: Enable or close online admissions with a single toggle.
- **Student Guidelines & Acknowledgments**: Customize applicant instructions and post-submission success messages.
- **Toggle Standard Demographic Fields**: Turn on/off fields according to local requirements:
  - *Date of Birth*, *Gender*, *Blood Group*, *Religion*, *Caste / Category*
  - *WhatsApp Number*, *Father's Name*, *Mother's Name*, *Guardian Emergency Phone*
  - *Previous Educational Qualification*
- **Custom Dynamic Questions**: Add custom inputs (*Text*, *Number*, *Date*, *Dropdown Selection*, *Textarea*) with mandatory response flags.
- **Mandatory Document Upload Checklist**: Require students to upload digital photographs, Aadhaar/ID proof, and previous marksheets before submission.
- **Admission PDF Legal Declaration**: Customize the legally binding declaration text printed on the student's physical admission application form.

#### 3. Admissions Processing & One-Click Enrollment
- **Admissions Inbox**: Real-time pulsing badge alerts center staff to incoming applications.
- **Dossier Inspection**: Review submitted biographical details, inspect uploaded photos, and verify ID documents.
- **One-Click Approval & Batch Placement**: Select a classroom batch, confirm the official admission date, and approve the application.
- **Automated Accreditation Enrollment Numbering**: Generates standardized enrollment numbers (`{CenterCode}-{Year}-{Serial}`) and provisions the student portal account instantly.
- **Official Admission Application PDF**: Download or print clean, formatted enrollment forms complete with center headers, photo box, and signature lines.

#### 4. Student Directory & Complete Academic Lifecycle
- **Unified Student Database**: Search, filter by batch, course, or enrollment status (`Active`, `Completed`, `Suspended`).
- **Manual Walk-In Student Admission**: Front-desk staff can register walk-in offline students in under 2 minutes.
- **Admission Date Modification with Year Recalculation**: Adjusting an admission date across calendar years automatically updates the registration number year segment with an audit confirmation.
- **Instant PVC ID Card Generator**: Generates high-resolution front-and-back student ID cards with accredited center branding and live **Verification QR Codes**.
- **Accredited Certificate & Marksheet Issuance**: Issue formal completion diplomas and detailed marks transcripts with grades, percentages, and anti-counterfeit QR codes.
- **Instant Examination Admit Card / Hall Ticket Generation**:
  - One-click Admit Card generation for eligible enrolled learners.
  - Automatically validates that the student meets the minimum required attendance threshold (e.g., >= 75%) before issuing.
  - Formatted with student photo, enrollment number, exam center address, schedule, and entry verification QR code.
- **Single Page vs Double Page Printing Layout**:
  - **Single Page Mode**: Generates individual documents on dedicated pages for direct desktop printing.
  - **Double Page / Press Print Mode (18x12 Inch Offset Layout)**: Places two documents side-by-side on standard 18x12 inch offset sheets for high-volume commercial printing and cutting.
- **Credential Management**: Reset student portal passwords with one click.

#### 5. Fees Management & Financial Accounting
- **Real-Time Financial Metrics**: Instant visibility into *Total Course Revenue*, *Total Collections Received*, and *Total Outstanding Dues*.
- **Offline Payment Recording**: Record cash, cheque, bank transfer, or counter UPI payments with automatic balance updates.
- **Instant Fee Receipt Generation**: Print formal printed receipts complete with receipt numbers, figures-and-words breakdown, and authorized cashier signatures.
- **Online Student UPI Payment Slip Verification**: Students can pay installments online and upload UPI transaction screenshots. Staff inspects the slip, matches the UTR, and approves or rejects with a single click.
- **Defaulters Tracking & Automated Reminders**: Filter students with overdue installments and trigger automated payment reminder notifications.

#### 6. Daily Batch Attendance & Smart QR Code Scanner
- **Dual Attendance Modes (Manual Register + Smart QR Scanner)**:
  - **Manual Batch Register**: Rapid classroom register with 4-state tracking (*Present (P)*, *Absent (A)*, *Late (L)*, *Excused (E)*) and *"Mark All Present"* productivity shortcut.
  - **Smart Contactless QR Scanner**: Staff can launch the built-in device camera or USB barcode reader to scan student PVC ID cards or phone screens for instant, touchless attendance check-in.
- **Theory vs Practical Attendance**: Distinguish between classroom theory lectures and hands-on computer lab sessions.
- **Attendance Percentage Analytics**: Generates monthly attendance summaries and automatically flags students below mandatory examination thresholds (e.g., < 75%).

#### 7. Dual Examination System (Offline & Online CBT)
- **Offline Examination Paper Builder**:
  - Curate custom test papers from the question bank (MCQ, True/False, Practical, Subjective).
  - Generates ready-to-print question paper PDFs complete with center logo, roll number blanks, instructions, and time limits.
- **Online Examination Engine (Computer-Based Testing)**:
  - Conduct digital exams with real-time countdown timers, auto-shuffled questions, and instant automated grading.
  - Auto-compiles final scores directly into semester marksheets and transcripts.

#### 8. Staff Management & Granular Role Delegation
- **Team Roles**: Create *Manager*, *Faculty*, and *Front-Desk Staff* accounts.
- **Granular Permission Checkboxes**: Delegate specific operational modules (*Admissions*, *Fees Manage*, *Attendance*, *Courses*, *Exam Zone*, *Landing Page*, *Wallet*) without exposing master center ownership.

#### 9. Public Website Builder & Digital Front Door
- **Brand Identity**: Upload custom Center Logo, Favicon, and Watermark.
- **Hero Banner**: Configure marketing headlines, sub-headlines, and call-to-action buttons.
- **Notice Board**: Post official circulars with automatic expiration dates and urgent flashing tickers.
- **Photo Gallery**: Showcase computer labs, classrooms, student awards, and annual events.
- **Contact & Map**: Embed Google Maps, phone helplines, address, and direct WhatsApp chat links.

#### 10. Center Token Wallet
- View real-time token balances and detailed credit/debit transaction logs.
- Submit wallet top-up requests with uploaded payment screenshots directly to Head Office.

#### 11. Visitor Intelligence & 3-Stage Course Admission Funnel
- **Live Branch Analytics (`/admin/analytics`)**: Dedicated portal tracking total hits, unique student visitors, dwell time, bounce rate, and lead conversion percentage.
- **3-Stage Course Admission Funnel**: Tracks the full student journey:
  - *Stage 1: Course Showcase Discovery* (Course views and syllabus exploration)
  - *Stage 2: Admission Form Draft* (Pre-lead capture, contact initiation, and abandoned form recovery)
  - *Stage 3: Completed Official Enrollment* (Approved applications with active student fee ledgers)
- **Hourly Peak Traffic Heatmap**: 24-hour IST distribution revealing peak student browsing hours to optimize WhatsApp broadcasts and counselor availability.
- **Traffic Channels & Device Distribution**: Tracks WhatsApp shares, Google search queries, Instagram/Facebook referrals, and Mobile vs Desktop ratios.
- **Inquiry Management & Instant Recovery**: Capture incomplete inquiries and initiate direct one-click WhatsApp outreach.
- **One-Click Excel Export**: Download full analytics reports (`.xlsx`) for local marketing audits and batch planning.
