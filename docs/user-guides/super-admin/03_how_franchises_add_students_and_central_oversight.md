## Chapter 3: How Franchises Add Students & Central Student Oversight

### 3.1 Understanding the Student Enrollment Pipeline
As Super Admin, you must understand how students enter the platform so you can audit franchise compliance, verify registration cards, and uphold educational accreditation standards.

Franchises enroll students using one of two primary methods:

```
[ METHOD 1: Public Online Portal ]                [ METHOD 2: Offline Front-Desk ]
Student visits center website                      Student walks into physical center
             │                                                      │
Submits Online Admission Form                       Staff clicks "+ Add Student"
(Uploads Photo, ID Proof, Marksheet)                Enters Biographical & Course Details
             │                                                      │
Lands in Center "Admissions Inbox"                  Records Immediate Offline Cash/UPI
             │                                                      │
Center Admin Reviews & Approves                     Immediate Enrollment Number Generated
             │                                                      │
Enters Batch, Assigns Schedule                      Student Portal Account Provisioned
             └──────────────────────┬───────────────────────────────┘
                                    │
                  [ ENROLLED IN GLOBAL STUDENT REGISTRY ]
                 Visible to Super Admin for Verification
```

---

### 3.2 Method 1: Franchise Online Admission Processing (Detailed)
1. **Public Intake**: Prospective students access `https://{center-subdomain}.abcdeduhub.com/admission`.
2. **Form Submission**: The student selects an active course, fills in biographical details, answers any custom questions configured by the franchise, and uploads:
   - Recent Passport Size Photograph.
   - Government ID Proof (Aadhaar / Voter ID).
   - Educational Marksheet.
3. **Application Review**: The franchise administrator reviews the dossier in `/admin/admissions`.
4. **Approval & Batch Allocation**: The center clicks **"Approve Application"**, selects an existing classroom batch (e.g., *Batch 2026-A*), confirms the official admission date, and finalizes enrollment.
5. **Accreditation Numbering**: The system automatically allocates an official Enrollment Number formatted as:
   $$\text{Enrollment No.} = \text{Center Code} + \text{"-"} + \text{Admission Year} + \text{"-"} + \text{Sequential Roll}$$
   *(Example: `WB002-2026-0042`)*.

---

### 3.3 Method 2: Franchise Manual Walk-in Registration (Detailed)
1. When a walk-in student registers in person, the center administrator navigates to **Students** (`/admin/students`) and clicks **"+ Add Student"**.
2. Staff manually inputs the student's full name, phone number, email, date of birth, and assigned course.
3. Staff captures or uploads the student's passport photo and records the initial offline admission fee.
4. Upon clicking **"Save"**, the student's portal account is immediately active.

---

### 3.4 The Global Student Directory (`/super-admin/students`)
The Super Admin has comprehensive oversight of every student enrolled across all affiliated franchises:

#### Powerful Global Search & Filtering:
- **Search Anything**: Search across 100,000+ students instantly by Full Name, Enrollment Number, Mobile Number, or Email.
- **Filter by Franchise**: Isolate students belonging to a specific center (e.g., filter only `WB-002`).
- **Filter by Course**: View all students enrolled nationwide in accredited programs (e.g., *ADCA* or *DCA*).
- **Filter by State / Region**: Filter learners by territory.

---

### 3.5 Central Registration Card Verification & Approval
To prevent unauthorized or fraudulent student registrations:
1. In **Global Students** (`/super-admin/students`), click the **"Registration Approvals"** tab.
2. Centers that submit student registrations for state/central board registration cards appear here.
3. Inspect the student's:
   - Full Name spelling (must match government ID).
   - Uploaded Passport Photo (must meet formal identification clarity standards).
   - Father's / Mother's name and Date of Birth.
   - Verified Enrollment Number.
4. **Click "Approve Registration Card"**:
   - The student's record is marked `Registration Card Approved`.
   - The franchise center and the student are immediately unlocked to download and print the formal **Accredited Student Registration Card** bearing the central board seal.

---

### 3.6 Central Certificate & Marksheet Audit
When a franchise requests a certificate for a student (or if the franchise lacks autonomous document authority):
1. Head Office inspects the student's attendance record and examination marks.
2. Super Admin clicks **"Approve Certificate Issuance"**.
3. A tamper-proof QR code is embedded on the certificate, linking to the central verification server (`/verify/certificate/{certificateNo}`).
