## Chapter 5: Student Directory & Academic Lifecycle

### 5.1 The Student Directory
The **Student Directory** (`/admin/students`) is the core database of all learners enrolled at your franchise. From this single interface, you can manage daily academic records, edit student profiles, generate ID cards, and issue accredited certificates.

---

### 5.2 Searching, Filtering & Directory Tools
- **Global Search Bar**: Search instantly across Student Full Name, Enrollment Number, Mobile Number, or Email.
- **Batch Filter Dropdown**: Filter students by specific morning/evening batches.
- **Course Filter Dropdown**: View learners enrolled in specific courses (e.g., *ADCA*, *Tally Prime*, *Python*).
- **Status Filter**: View `Active`, `Completed`, or `Suspended` learners.

---

### 5.3 Manual Walk-in Student Registration (Offline Admission)
For students who walk into your physical center and register offline without using the website:
1. Navigate to **Students** (`/admin/students`).
2. Click the **"+ Add Student"** button at the top-right corner.
3. Complete the registration form:
   - **Personal Details**: Student Name, Date of Birth, Gender, Mobile Number, Email, Address.
   - **Course Selection**: Select the course from your active catalog.
   - **Batch Assignment**: Choose their scheduled classroom batch.
   - **Admission Date**: Set their official start date.
   - **Photo Upload**: Upload a clear passport photo (or capture via webcam).
   - **Initial Fee Payment**: Record any immediate admission or registration fee collected in cash or UPI.
4. Click **"Save & Create Student"**.
5. The system immediately generates an official enrollment number and creates their portal login credentials.

---

### 5.4 Viewing & Editing Student Profiles
Clicking on any student in the directory opens their comprehensive profile modal:
- **Academic Summary**: Enrolled course title, course code, duration, batch name, and progress percentage.
- **Biographical Information**: Full address, parents' names, emergency contacts.
- **Attendance Percentage**: Calculated from daily attendance records.
- **Financial Status**: Total fee, amount paid to date, and pending balance.

#### Editing Student Information:
1. In the student profile or row action menu, click the **"Edit Student"** button.
2. Update biographical fields, address, phone number, or photo.
3. Click **"Save Changes"**.

> [!IMPORTANT]
> **Changing the Admission Date & Automatic Enrollment Year Recalculation**:
> The system embeds the admission year into the student's unique accreditation registration number (e.g., `WB002-2025-0012` vs `WB002-2026-0012`). If you modify a student's **Admission Date** from one calendar year to another, a confirmation prompt will appear:
> *"Changing the admission date will automatically modify the student's registration number year from 2025 to 2026. Are you sure?"*
> Confirming will update the registration number across all ID cards, certificates, marksheets, and student logins.

---

### 5.5 Generating & Printing Official Student ID Cards
Every enrolled student is entitled to a high-resolution, branded ID Card containing their photograph, course details, center affiliation, and an anti-counterfeit QR code.

#### How to Generate:
1. In the Student Directory, click the **ID Card Icon** (or select *"Print ID Card"* from the action dropdown).
2. The **ID Card Generator** modal will render a live preview of the front and back of the card:
   - **Front**: Institute header, student photo, student name, enrollment number, course name, batch, valid through date, and student signature box.
   - **Back**: Center address, emergency contact numbers, authorized signature, center seal, and a dynamic **Verification QR Code**.
3. **Verification QR Code**: Anyone scanning this QR code with a smartphone camera is securely redirected to the official verification page (`/verify/student/{enrollmentNo}`) to verify the student's authenticity in real-time.
4. Click **"Print ID Card"** or **"Download PDF"** for high-resolution printing onto standard PVC ID card stock.

---

### 5.6 Issuing Certificates & Marksheets
When a student completes their course curriculum and passes their assessments, you can issue formal accreditation documents.

#### Issuing a Certificate:
1. Locate the student and select **"Generate Certificate"**.
2. Fill in the certification details:
   - **Grade Awarded**: Select `A+` (Distinction), `A`, `B`, or `Pass`.
   - **Completion Date**: Official course completion date.
   - **Certificate Serial Number**: Automatically sequential or custom board number.
3. Click **"Preview Certificate"** to view the ornate certificate template complete with the authorized center seal, central board logo, and verifiable QR code.
4. Click **"Issue & Print Certificate"** to generate the final high-resolution PDF.

#### Issuing a Marksheet:
1. Select **"Generate Marksheet"**.
2. Enter the marks obtained in theoretical and practical modules according to the course syllabus.
3. The system calculates the aggregate percentage, division, and grade.
4. Print the official Marksheet on institute letterhead or export to PDF.

---

### 5.7 Student Portal Access & Password Management
Each student has their own personal **Student Portal** (`/student/dashboard`):
- **Username**: The student's Enrollment Number (e.g., `WB002-2026-0042`).
- **Initial Password**: Defaults to the student's registered mobile number or date of birth (or set during manual registration).
- **Resetting Student Password**: If a student forgets their login password, locate their record in the Student Directory, click **"Reset Password"**, enter a new temporary password, and share it with the student.
