## Chapter 2: Courses & Advanced Pricing Management

### 2.1 Understanding the Course Architecture
ABCD Edu Hub provides a dual-level course system:
1. **Global Course Catalog**: Pre-curated, accredited courses provided by the Super Admin / Central Head Office (such as DCA, ADCA, Tally Prime, Python Programming, DIT, etc.) complete with accredited syllabus, standardized duration, and recommended pricing.
2. **Local Franchise Overrides**: As a Franchise Admin, you have full authority to override fees, set custom payment plans (installment vs lumpsum), display promotional discounts, or hide courses that your center does not currently teach.

---

### 2.2 Enabling & Disabling Courses for Your Center
By default, global courses are available in your catalog. You can choose which courses appear on your public website and admission application form.

#### Step-by-Step Instructions:
1. Navigate to **Courses** (`/admin/courses`) from the left sidebar.
2. The Course List displays all available courses with their Course Code, Title, Duration, Level, and Current Active Status.
3. Locate the course you wish to toggle (use the **Search Bar** or category filter at the top).
4. Click the **Active Switch** (Toggle Button) in the course row or action menu:
   - **Active (Green)**: The course is published on your public website (`/courses`) and appears in the student online admission dropdown.
   - **Inactive (Gray/Off)**: The course is immediately hidden from your public website and admission forms. Existing enrolled students remain unaffected.

---

### 2.3 How to Change Course Pricing & Payment Plans (Step-by-Step)

Setting competitive and transparent pricing is critical for student enrollment. ABCD Edu Hub provides an itemized fee builder for each course.

#### Step 1: Open the Course Pricing Modal
1. Go to **Courses** (`/admin/courses`).
2. Locate the course you want to modify (e.g., *Advanced Diploma in Computer Applications - ADCA*).
3. Click the **Edit / Pricing Button** (represented by the Edit Pencil or Indian Rupee icon).
4. The **"Course Pricing & Fee Configuration"** dialog will appear.

#### Step 2: Configure Primary Pricing & Display Badges
In the pricing dialog, configure the following fields:
- **Total Course Fee (₹)**: Enter the overall fee for the entire course duration (e.g., `6000`).
- **Display Price (Text)**: Enter how you want the price presented to visitors on your public site (e.g., `₹5,499 (All-Inclusive)` or `₹999/month`).
- **Discount Text / Badge**: Enter an optional marketing badge that displays over the course card on your landing page (e.g., `15% Early Bird Discount`, `Festive Offer`, or `Scholarship Eligible`).
- **Show Fee on Website (Toggle)**: 
  - If enabled, prospective students see the fee publicly before applying.
  - If disabled, the public page displays *"Contact Center for Fee Details"*, encouraging students to submit an inquiry.

#### Step 3: Configure Itemized Fee Breakdown
To ensure accounting clarity and generate accurate student fee receipts, you can break down the total course fee into specific heads:
- **Admission Fee (₹)**: One-time admission charge collected upon joining (e.g., `1000`).
- **Registration Fee (₹)**: University/Board registration and kit charge (e.g., `500`).
- **Exam Fee (₹)**: Examination and assessment fee (e.g., `500`).
- **Tuition / Regular Course Fee (₹)**: The remaining core instructional fee (e.g., `4000`).

> [!TIP]
> **Automatic Sum Validation**: Ensure the sum of Admission Fee + Registration Fee + Exam Fee + Regular Fee aligns with the Total Course Fee so student ledger calculations remain balanced.

#### Step 4: Configure Installment Plans (EMI)
If your center allows students to pay in monthly installments:
1. Turn on the switch: **"Enable Installment-Based Payments"**.
2. **Installment Amount (₹)**: Specify the recurring amount due each cycle (e.g., `1500`).
3. **Total Installments**: Specify how many installments the student must pay (e.g., `4` installments).
4. When students are enrolled under this course, the system automatically creates scheduled installment dues in the **Fees Management** ledger.

#### Step 5: Save & Deploy Changes
1. Click **"Save Pricing & Configurations"**.
2. A success notification will appear: *"Course pricing updated successfully"*.
3. The new fee structure immediately reflects on:
   - Your public center course showcase page (`/courses`).
   - The online admission form fee breakdown.
   - Newly enrolled student invoices and fee receipts.

---

### 2.4 Managing Custom Courses & Syllabus Topics
If your center offers specialized proprietary workshops or regional programs not found in the global catalog:
1. Click **"+ Add Custom Course"** at the top right of the Courses screen.
2. Enter the **Course Title**, unique **Course Code** (e.g., `PY-101`), **Category**, **Difficulty Level** (Beginner, Intermediate, Advanced), and **Duration** (e.g., `6 Months / 120 Hours`).
3. Upload or select a **Course Cover Image**.
4. **Build the Syllabus**:
   - Click **"+ Add Topic/Module"**.
   - Enter the Module Title (e.g., *Module 1: Fundamentals of Python & OOP*).
   - Add sub-bullet points for specific lessons (e.g., *Variables & Data Types*, *Functions & Lambda*, *File Handling*).
5. Click **"Publish Course"**.
