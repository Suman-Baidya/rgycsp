## Chapter 6: Fee Management & Payment Tracking

### 6.1 The Fee Management Ecosystem
The **Fees Management Module** (`/admin/fees`) handles all student billing, offline cash collections, online UPI payment verifications, fee receipt printing, and installment tracking.

---

### 6.2 The Center Financial Dashboard
At the top of the Fees screen, key financial metrics provide instant visibility into center revenue:
- **Total Course Revenue**: Aggregate value of all enrolled student course fees.
- **Total Fees Collected**: Actual cash, UPI, and bank collections received to date.
- **Outstanding Balances**: Total pending student fee dues across all active batches.
- **Pending Payment Verifications**: Number of student-submitted online payment slips awaiting your manual review.

---

### 6.3 Recording Offline Fee Collections (Cash / UPI / Cheque)

When a student pays fees directly at your center's reception counter:

1. Navigate to **Fees Manage** (`/admin/fees`).
2. Click **"+ Collect Fee"** (or locate the student in the list and click *"Record Payment"*).
3. Select or search for the student by Name or Enrollment Number.
4. The dialog displays the student's **Total Fee**, **Amount Already Paid**, and **Current Pending Balance**.
5. Fill in the payment collection form:
   - **Amount Received (₹)**: Enter the payment amount collected.
   - **Payment Mode**: Select `Cash`, `UPI / QR Code`, `Bank Transfer / NEFT`, or `Cheque / DD`.
   - **Transaction Reference (Optional)**: Enter UPI Reference Number, Cheque Number, or bank slip ID.
   - **Payment Date**: Defaults to the current date.
   - **Fee Head / Remark**: Specify what the fee covers (e.g., *Installment 2 of 4*, *Exam Fee*, or *Full Course Payment*).
6. Click **"Submit & Generate Receipt"**.

---

### 6.4 Printing Official Student Fee Receipts
Immediately upon recording a payment, the system generates an official **Fee Receipt**:
- **Receipt Header**: Center name, affiliated board, center code, address, and contact details.
- **Receipt Details**: Unique Receipt Number, Date, Student Enrollment Number, Student Name, Course Name, and Batch.
- **Financial Table**:
  - Previous Paid: Amount accumulated prior to this transaction.
  - Current Payment: Amount received in this transaction (in figures and words).
  - Remaining Due: Current pending balance after this transaction.
- **Signatures**: Authorized center cashier/admin signature box with timestamp.
- Click **"Print Receipt"** to print on a standard desktop printer, POS thermal receipt printer, or save as a PDF to send to the student via WhatsApp or email.

---

### 6.5 Reviewing Online Student Payment Slips

Students can submit fee installment payments online via their Student Portal (`/student/dashboard/fees`) by transferring funds to your center's UPI QR code and uploading a screenshot of the transaction.

#### Verification Workflow:
1. When a student uploads a payment slip, the **Fees Manage** link in the sidebar displays a **pulsing red notification badge**.
2. Go to **Fees Manage** and click the **"Pending Verifications"** tab.
3. Each pending record displays:
   - Student Name & Enrollment Number
   - Claimed Amount (₹)
   - Payment Mode & Reference / UTR Number
   - Submitted Screenshot / Receipt Preview
4. Click **"Inspect Slip"** to enlarge the transaction screenshot. Verify:
   - Does the UTR / Transaction ID match your center bank statement or UPI app?
   - Is the timestamp recent?
   - Does the credited amount match the claimed amount?
5. **Take Action**:
   - **Approve Payment**: Click the green **"Approve"** button. The payment is permanently credited to the student's ledger, reducing their pending due balance, and an automated receipt is issued to their portal.
   - **Reject Payment**: If the screenshot is invalid, blurry, or funds were not received, click **"Reject"**, enter an explanatory reason (e.g., *UTR number not found in bank statement; please re-upload valid bank receipt*), and submit. The student is notified to rectify the issue.

---

### 6.6 Managing Overdue Fees & Defaulters
1. In the **Fees Manage** student list, filter by **"Pending Dues"**.
2. The system sorts students by the highest outstanding balance.
3. Click **"Send Fee Reminder"** to trigger a WhatsApp/Email notification reminding the student of their upcoming or overdue installment.
