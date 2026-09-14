# ABCD Edu Hub — Super Administrator Complete Operational Manual

## Chapter 1: Platform Architecture & Central Command Center

### 1.1 Executive Overview
The **ABCD Edu Hub Super Administration Portal** (`/super-admin`) is the central nerve center of the entire multi-tenant educational ecosystem. While individual franchise administrators manage their local classrooms and daily fee collections, the Super Administrator (Head Office) possesses macro-level authority over:
- Institutional accreditation and franchise licensing.
- Central student registry verification and certification standards.
- Accredited global curriculum development.
- Central token economy, wallet top-ups, and financial settlements.
- Template design for official certificates, marks transcripts, and PVC ID cards.
- Global user authentication, security enforcement, and regional State Coordinator networks.

---

### 1.2 System Hierarchy & Organizational Roles
The platform operates on a strict multi-tier hierarchy:

```
[ Super Administrator ] (Head Office / Central Board)
         │
         ├── [ Super Admin Manager ] (HQ Department Heads with delegated permissions)
         │
         ├── [ State Managers ] (Regional Coordinators overseeing specific States)
         │
         └── [ Franchise Administrators ] (Study Center Owners / Directors)
                  │
                  ├── [ Center Managers & Staff ] (Receptionists, Faculty, Instructors)
                  │
                  └── [ Students ] (Learners enrolled across physical & digital cohorts)
```

---

### 1.3 Navigating the Central Command Center
The Super Admin dashboard (`/super-admin`) provides instant executive intelligence:
- **Active Franchises Metric**: Total operational study centers vs pending franchise applications.
- **Total Student Enrollment**: Aggregate count of verified learners across all franchise branches.
- **Central Token Circulation**: Total internal tokens minted, circulating in franchise wallets, and consumed for automated tasks.
- **Central Financial Flow**: Real-time revenue from franchise licensing, product kit orders, and token recharge approvals.
- **Pending Action Alerts**: Real-time notification counters indicating:
  - Pending Franchise Affiliation Applications
  - Pending Wallet Recharge Requests (awaiting bank/UPI payment verification)
  - Pending Central Document Verification Requests
  - Pending Franchise Wholesale Merchandise Orders

---

### 1.4 Dual-Routing Mechanics (Subdomain vs Subdirectory)
As the platform architect, the Super Admin oversees two concurrent routing modes:
1. **Subdomain Mode**:
   - `https://{center-subdomain}.abcdeduhub.com`
   - Automatically isolated via Next.js proxy middleware to the franchise workspace.
2. **Subdirectory Mode**:
   - `https://abcdeduhub.com/app/{center-subdomain}`
   - Fallback mode ensuring seamless compatibility across enterprise proxies and development environments.
3. **Global Super Admin Portal**:
   - Always accessible at `https://abcdeduhub.com/super-admin`.
