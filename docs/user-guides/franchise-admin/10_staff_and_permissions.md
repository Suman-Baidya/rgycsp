## Chapter 10: Staff Management & Granular Permissions

### 10.1 Role-Based Access Control
Franchise owners and center directors often work alongside front-desk receptionists, counselors, lab instructors, and senior managers. The **Staff & Roles Module** (`/admin/staff`) allows you to delegate daily tasks securely without exposing your sensitive financial or administrative controls.

---

### 10.2 Role Hierarchy & Permissions

The system provides three primary workspace role tiers:

1. **Franchise Admin (Owner / Director)**:
   - Full, unrestricted access across all modules, banking/wallet recharges, staff management, and legal settings.
2. **Manager (Center Coordinator)**:
   - High-level access to supervise operations, approve admissions, and review staff registers.
3. **Staff (Faculty, Receptionists, Counselors)**:
   - Customized access based strictly on individual permission checkboxes granted by the Franchise Admin.

---

### 10.3 Granular Permission Checkboxes
When assigning permissions to a staff member, you can toggle any combination of the following:

| Permission | What the Staff Member Can Access |
| :--- | :--- |
| **Admissions** (`admissions`) | Review incoming online applications, download admission forms, and enroll students. |
| **Fees Manage** (`fees`) | Record offline fee payments, print receipts, and verify online payment slips. |
| **Attendance** (`attendance`) | Take daily batch attendance registers and view attendance reports. |
| **Students** (`students`) | View the student directory, search profiles, and print ID cards. |
| **Courses** (`courses`) | View course syllabus and schedule information. |
| **Exam Zone** (`exam-gen`) | Create question papers and schedule exams. |
| **Store & Products** (`products`) | Manage inventory and fulfill store merchandise orders. |
| **Landing Page** (`settings`) | Post announcements to the Notice Board and upload photos to the Gallery. |
| **Wallet** (`wallet`) | View token transactions (admin-only approval for recharges). |

> [!CAUTION]
> Staff members cannot access the **Staff & Roles** page itself, preventing employees from escalating their own privileges or viewing other staff passwords.

---

### 10.4 Step-by-Step: Adding a New Staff Member
1. Navigate to **Staff & Roles** (`/admin/staff`).
2. Click **"+ Add Staff Member"**.
3. Fill in the staff member's credentials:
   - **Full Name**: (e.g., *Pooja Sharma*).
   - **Email Address**: Used as their login username.
   - **Mobile Number**: For contact and verification.
   - **Designation**: (e.g., *Front Desk Receptionist* or *Senior Lab Instructor*).
   - **Password**: Set an initial secure password.
4. Under **"Permissions & Access"**, check the specific modules the employee is authorized to handle (e.g., *Admissions*, *Attendance*, and *Fees Manage*).
5. Click **"Create Staff Member"**.
6. Provide the employee with their login link (`https://{your-subdomain}.abcdeduhub.com/login` or `/app/{tenant}/login`) and initial password.
