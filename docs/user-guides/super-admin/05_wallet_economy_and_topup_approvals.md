## Chapter 5: Central Financials, Wallet Top-Ups & Token Economy

### 5.1 Architecture of the Token Economy
ABCD Edu Hub avoids cumbersome payment gateway surcharges and delayed settlements by utilizing an internal **Token / Credit Economy**. 

#### Token Value & Utility:
- **1 Token = ₹1** (or custom exchange defined by Head Office).
- Franchises purchase token packages in bulk via direct UPI or Bank Transfer to Head Office.
- Tokens are automatically deducted from the franchise's wallet whenever the center uses central automated services:
  - AI Exam Paper Generation (e.g., *15 Tokens*).
  - High-Resolution PVC Student ID Card Issuance (e.g., *20 Tokens*).
  - Accredited Certificate with Anti-Counterfeit QR Code (e.g., *50 Tokens*).

---

### 5.2 Configuring Central Payment Credentials
Franchise owners see Head Office banking details when requesting a wallet top-up. Keep these up to date:
1. Navigate to **Wallet Economy** (`/super-admin/wallet`).
2. Click the **"Payment Methods Config"** tab.
3. Update the following fields:
   - **Central UPI ID**: (e.g., `abcdeduhub@okhdfcbank`).
   - **UPI QR Code Image**: Upload your central merchant QR code graphic.
   - **Bank Account Name**: (e.g., *ABCD Educational Trust Private Limited*).
   - **Bank Name & Branch**: (e.g., *HDFC Bank, Salt Lake Branch*).
   - **Account Number & IFSC Code**.
4. Click **"Save Payment Methods"**.

---

### 5.3 Reviewing & Approving Franchise Wallet Recharge Requests

When a franchise submits a top-up request, a pulsing badge appears on the Super Admin sidebar.

#### Step-by-Step Approval Workflow:
1. Go to **Wallet Economy** (`/super-admin/wallet`).
2. In the **"Pending Top-Up Requests"** table, review each submission:
   - **Franchise Name & Center Code** (e.g., *WB-002 Kolkata*).
   - **Amount Paid (₹)** and **Tokens Requested**.
   - **UTR / Bank Reference Number**.
   - **Date & Timestamp**.
3. Click the **"Inspect Slip"** icon to view the uploaded payment screenshot.
4. **Reconcile with Head Office Bank**:
   - Verify the 12-digit UTR in your business bank statement or merchant UPI app.
5. **Take Action**:
   - **Approve Request**: Click **"Approve Top-Up"**. The system executes an atomic transaction, mints the exact token amount into the franchise's wallet, and marks the transaction `COMPLETED`. The center can immediately resume operations.
   - **Reject Request**: If the payment reference is fake, duplicate, or not reflected in the bank, click **"Reject"** and enter a note (e.g., *UTR not reflected in HDFC statement; please re-upload valid bank transfer receipt*).

---

### 5.4 Manual Wallet Token Adjustments
If you need to grant promotional tokens, issue goodwill compensation, or deduct tokens:
1. In the **"Franchise Wallets"** directory, locate the target center.
2. Click **"Adjust Wallet Balance"**.
3. Select **Credit (+)** or **Debit (-)**.
4. Enter the token amount and an **Audit Reason** (e.g., *Annual Affiliation Bonus Credits*).
5. Confirm the transaction. The adjustment is permanently logged in the system audit trail.

---

### 5.5 Financial Analytics & Reporting
The **Wallet Analytics Tab** (`/super-admin/wallet`) aggregates network-wide metrics:
- Total Gross Token Sales (Weekly, Monthly, Lifetime).
- Most Active Franchises by Token Utilization.
- Central Service Usage Breakdown (Percentage spent on ID cards vs Certificates vs AI Exams).
