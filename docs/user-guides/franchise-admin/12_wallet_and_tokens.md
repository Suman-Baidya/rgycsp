## Chapter 12: Wallet & Token Economy

### 12.1 Understanding the Token Economy
ABCD Edu Hub employs an internal **Token / Credit Economy** rather than charging repetitive third-party payment gateway fees for every micro-action. 

#### What Tokens Are Used For:
- **AI Exam Generation**: Generating intelligent question papers, MCQs, and assessment rubrics using AI models.
- **Automated Document Issuance**: Creating high-resolution, secure student certificates and PVC ID cards with encrypted verification QR codes.
- **Verification API Services**: Processing external student certificate verifications and background checks.

---

### 12.2 Viewing Your Wallet Balance & Ledger
- **Header Widget**: Your current available token balance is displayed at the top-right corner of the administrative header at all times.
- **Wallet Dashboard (`/admin/wallet`)**:
  - Displays your total available token balance.
  - Summarizes lifetime tokens purchased and lifetime tokens utilized.
  - Displays a transparent **Transaction History Table** documenting every credit (top-ups) and debit (service usage) with timestamps and reference IDs.

---

### 12.3 How to Recharge Your Token Wallet (Step-by-Step)

When your wallet balance runs low, you can request a top-up directly through your dashboard:

#### Step 1: Open the Recharge Request Form
1. Navigate to **Wallet** (`/admin/wallet`) in the sidebar, or click your wallet balance in the top header.
2. Click the **"Recharge Wallet / Top-Up Tokens"** button.

#### Step 2: Choose a Token Package & View Central Payment Details
1. Select a pre-configured token bundle (e.g., *Starter Pack: 1,000 Tokens*, *Growth Pack: 5,000 Tokens*, or *Enterprise Pack: 15,000 Tokens*), or enter a custom amount.
2. The modal displays the official Super Admin / Head Office payment credentials:
   - **Central UPI ID & Dynamic QR Code**: Scan using any UPI app (Google Pay, PhonePe, Paytm, BHIM).
   - **Official Bank Account Details**: Account Name, Account Number, IFSC Code, and Bank Branch.

#### Step 3: Complete Payment & Submit Proof
1. Complete the payment using your preferred banking or UPI application.
2. Return to the dashboard recharge form and enter:
   - **Amount Paid (₹)**: Exact figure transferred.
   - **Transaction Reference Number (UTR / Bank Ref)**: The 12-digit UPI reference ID or bank transaction ID.
   - **Payment Screenshot**: Upload a clear screenshot of the completed payment confirmation screen from your UPI or banking app.
3. Click **"Submit Recharge Request"**.

#### Step 4: Verification & Token Credit
1. Your request immediately enters `PENDING APPROVAL` status in your wallet history.
2. The Super Admin receives an alert at Head Office.
3. Once the transaction is reconciled against the bank statement, the Super Admin approves the request.
4. The tokens are instantly minted directly into your institute's wallet, and your header balance updates immediately.
