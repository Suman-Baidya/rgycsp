## Chapter 13: Profile, Security & Troubleshooting

### 13.1 Managing Your Franchise Administrator Profile
Access your administrative account settings by navigating to **Profile** (`/admin/profile`) in the left sidebar:
- **Personal Details**: Update your administrator display name, contact phone number, and official correspondence email.
- **Center Details Summary**: View your affiliated Center Code, Subdomain, and Franchise Approval Status.

---

### 13.2 Account Security & Passwords
1. **Changing Your Password**:
   - In the Profile menu, scroll to the **"Change Password"** section.
   - Enter your **Current Password**, followed by your **New Password** (minimum 8 characters with a combination of letters, numbers, and symbols).
   - Confirm the new password and click **"Update Password"**.
2. **Passkey / Biometric Authentication (WebAuthn)**:
   - ABCD Edu Hub supports passwordless biometric login (Fingerprint / Face ID / Windows Hello / Apple Touch ID).
   - Click **"Register New Passkey"**, follow your device's biometric prompt, and enable ultra-secure, one-touch login for subsequent sessions.

---

### 13.3 Frequently Asked Questions & Operational Troubleshooting

#### Q1: A student cannot log in to their Student Portal. What should I check?
- **Step 1**: Confirm their username. In ABCD Edu Hub, a student's username is their official **Enrollment Number** (e.g., `WB002-2026-0042`), not their email.
- **Step 2**: Check their student status in the **Student Directory** (`/admin/students`). Ensure their status is set to `Active`, not `Suspended`.
- **Step 3**: Reset their password directly from the student's row in the directory by clicking **"Reset Password"** and providing them with a temporary credential.

#### Q2: An image or payment slip fails to upload.
- **Format**: Ensure the file is a standard image (`JPEG`, `PNG`, `WebP`) or `PDF`.
- **File Size**: Uploads should generally remain below **5 MB** for student photos and payment slips to ensure rapid loading.
- **Connection**: Check that your internet connection is stable before retrying.

#### Q3: Why did a student's enrollment number change after editing their profile?
- If you edit a student's **Admission Date** and move it across different calendar years (e.g., from *December 2025* to *January 2026*), the system's accreditation logic automatically updates the year segment of the registration number to maintain legal compliance. The system displays a confirmation prompt prior to applying this change.

#### Q4: How long does a Token Wallet recharge take to reflect in my balance?
- Wallet top-up requests are typically verified and approved by the Super Admin Head Office within **15 to 30 minutes** during normal business hours after your bank transfer/UPI payment is reconciled.

#### Q5: Who do I contact for urgent central support?
- For technical assistance, central accreditation inquiries, or portal support, reach out to your designated State Manager or open a support ticket via the central platform helpline:
  - **Support Email**: `support@abcdeduhub.com`
  - **Central Helpline**: Available in your Super Admin affiliation agreement.
