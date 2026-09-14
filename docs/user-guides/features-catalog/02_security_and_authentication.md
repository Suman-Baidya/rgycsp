## Chapter 2: Security & Authentication Suite

### 2.1 Multi-Tier Authentication Engine
Security in ABCD Edu Hub is built on zero-trust principles, combining modern cryptographic standards with seamless hardware biometric capabilities.

---

### 2.2 Supported Authentication Methods

#### 1. Standard Cryptographic Credentials (Password-Based)
- **High-Entropy Hashing**: Passwords are encrypted using **bcrypt (salt rounds = 10)**, ensuring zero plain-text exposure even in database backups.
- **Intelligent Username Resolution**:
  - Super Admins log in using their Master Email or Admin ID.
  - Franchise Admins and Faculty log in using their registered center email.
  - Students log in using their unique, accredited **Enrollment Number** (e.g., `WB002-2026-0042`) or mobile number.
- **Brute-Force & Credential Stuffing Protection**: Built-in rate limiting and failed attempt monitoring prevent automated attacks.

#### 2. Hardware-Level Biometric Passkeys (W3C WebAuthn Standard)
ABCD Edu Hub is one of the few educational platforms equipped with native **Passwordless Biometric Passkeys**:
- **Supported Biometric Modalities**:
  - **Face ID** on Apple iPhones, iPads, and MacBooks.
  - **Fingerprint Recognition** on Android smartphones and laptops.
  - **Windows Hello** (Facial recognition, fingerprint sensors, hardware PIN) on Windows 10/11 PCs.
  - **Apple Touch ID** on macOS devices.
- **How It Works**:
  - Leverages device hardware cryptographic enclaves (Apple Secure Enclave, Android Titan chip, Windows TPM).
  - Biometric data never travels over the internet; the device cryptographically signs a challenge and grants instant entry in **under 1 second**.
- **Multi-Device Passkey Management**: Users can bind multiple devices (e.g., office PC and personal smartphone) and revoke lost devices anytime from their security profile.

---

### 2.3 Comprehensive Role-Based Access Control (RBAC)
Every user is compartmentalized within a strictly enforced role hierarchy:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPER ADMINISTRATOR                             │
│       (Global Master Authority across all Centers, Curriculums, & DB)  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────────────────────┐        ┌──────────────────────────────────┐
│       SUPER ADMIN MANAGER        │        │          STATE MANAGER           │
│ (HQ Departmental Delegation:     │        │ (Regional Coordinator overseeing │
│  Wallet, Affiliations, Students) │        │  Franchises within a State)      │
└──────────────────────────────────┘        └────────────────┬─────────────────┘
                                                             │
                                   ┌─────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      FRANCHISE ADMINISTRATOR                           │
│        (Autonomous Owner/Director of an Individual Study Center)       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────────────────────┐        ┌──────────────────────────────────┐
│      STAFF / FACULTY MEMBER      │        │             STUDENT              │
│ (Granularly Delegated Modules:   │        │ (Personal Learner Workspace:     │
│  Admissions, Fees, Attendance)   │        │  Syllabus, Dues, ID Card, Exams) │
└──────────────────────────────────┘        └──────────────────────────────────┘
```

---

### 2.4 Granular Permission Delegation Matrix

| Module / Feature | Super Admin | Super Admin Mgr | State Mgr | Franchise Admin | Staff (Delegated) | Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Global Franchise Management** | Full | Optional | Read/Regional | No | No | No |
| **Token Minting & Top-Up Approvals** | Full | Optional | No | Request Only | No | No |
| **Global Course Master & Syllabi** | Full | Optional | Read | Read / Override | View | View Enrolled |
| **Central Student Registry Verification** | Full | Optional | Read/Regional | Center Only | Center (If granted) | Self Profile |
| **Document Designer (Certificates/IDs)**| Full | Optional | No | Issue Only | Issue (If granted) | View / Download |
| **Local Admission Form Builder** | Full | No | No | Full | No | No |
| **Local Fee Collection & Receipts** | Audit | No | No | Full | Full (If granted) | Pay / View Ledger |
| **Daily Batch Attendance Register** | Audit | No | No | Full | Full (If granted) | View History |
| **Exam Zone & Question Generator** | Full | No | No | Full | Full (If granted) | Take Exams |
| **System Security & Audit Logs** | Full | No | No | No | No | No |

---

### 2.5 Session Management & Instant Account Actions
- **Secure HTTP-Only Cookies**: Tokens and session IDs are immune to cross-site scripting (XSS).
- **One-Click Account Suspension**: Super Admins or Franchise Owners can instantly toggle user accounts to `Suspended`, instantly terminating all active sessions.
- **Clean Logout Flow**: Wipes local storage tokens, purges active session cookies, and redirects safely to the home portal.
