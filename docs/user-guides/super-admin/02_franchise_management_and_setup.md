## Chapter 2: Franchise Management & Center Setup

### 2.1 The Franchise Center Registry
The **Franchise Management Module** (`/super-admin/franchises`) allows the Super Admin to license, configure, supervise, and audit every affiliated institute on the network.

---

### 2.2 Reviewing Incoming Franchise Applications
Prospective institute owners can submit affiliation requests via the public landing page (`/franchise`):
1. In the sidebar, click **Franchises** (`/super-admin/franchises`).
2. The **"Pending Applications"** tab highlights new applicants waiting for approval.
3. Click **"View Application Details"** to inspect:
   - Applicant Name, Mobile, Email, and Proposed Center Address.
   - Existing Infrastructure (Number of Computers, Lab Area, Classroom Capacity, Internet Bandwidth).
   - Uploaded Center Photos, Owner ID Proof, and Trade License.
4. **Take Action**:
   - **Approve**: Clicking *Approve* promotes the application into an active franchise provisioning dialog.
   - **Reject**: Enter an explanatory reason (e.g., *Insufficient computer infrastructure for accredited courses*).

---

### 2.3 How to Manually Add a New Franchise Center (Step-by-Step)

If an institution signs an agreement offline or at Head Office:

#### Step 1: Open the Creation Dialog
1. Go to **Franchises** (`/super-admin/franchises`).
2. Click the green **"+ Add Franchise Center"** button at the top right.

#### Step 2: Configure Center Identity & Routing
- **Franchise / Center Name**: Enter the full official title (e.g., *ABCD Computer Institute - Kolkata Central*).
- **Center Code**: Enter a unique accredited alphanumeric code (e.g., `WB-002`).
  - *Why this matters*: The Center Code is embedded directly into student enrollment numbers (e.g., `WB002-2026-0001`) and printed on official certificates.
- **Subdomain Slug**: Enter the unique URL identifier (e.g., `wb-002` or `kolkata-central`).
  - The center's public website immediately becomes accessible at `https://wb-002.abcdeduhub.com` or `https://abcdeduhub.com/app/wb-002`.

#### Step 3: Configure Franchise Owner / Director Account
- **Director / Owner Full Name**: (e.g., *Suman Baidya*).
- **Owner Email Address**: Used as the master login username for the center.
- **Initial Password**: Set a temporary secure password (the owner will be prompted to change it upon first login).
- **Owner Phone Number**: Primary WhatsApp / emergency contact.

#### Step 4: Governance, Wallet & Regional Oversight
- **Initial Wallet Token Balance**: Grant welcome token credits (e.g., `500 Tokens`) so the center can immediately begin enrolling students and issuing PVC ID cards.
- **Assigned State Manager**: Select the regional coordinator overseeing this state/district (e.g., *West Bengal State Coordinator*).
- **Document Authority Toggle**:
  - **Enabled (Autonomous)**: The franchise can directly approve and print official certificates and marksheets once students pass exams.
  - **Disabled (Central Approval Required)**: The franchise can train students, but every certificate request must be reviewed and approved by the Super Admin Head Office before printing.
- Click **"Create & Provision Franchise"**.

---

### 2.4 One-Click Direct Portal Access ("Jump to Franchise")
As Super Admin, you never need to ask franchise owners for their passwords to troubleshoot issues:
1. In the Franchise list, locate any center.
2. Click the **"Action Menu"** (three dots) and select **"Open Center Portal"** (or click the external link icon).
3. The system instantly logs you into that center's administrative environment with master privileges, allowing you to review their course pricing, inspect student ledgers, or adjust landing page settings on their behalf.
4. An administrative banner at the top allows you to return to the Super Admin console with a single click.

---

### 2.5 Suspending or Modifying Franchise Centers
- **Status Toggle (Active / Suspended)**:
  - If a franchise violates accreditation standards or fails annual affiliation renewal, switch their status to **Suspended**.
  - *Effect*: Staff and students are immediately blocked from logging in, and their public website displays a central notice. Data remains preserved.
- **Bulk Import via CSV**:
  - For rapid onboarding of 50+ centers, click **"Import Franchises CSV"**, download the standardized template, populate the center codes, names, and owner emails, and upload the file.
