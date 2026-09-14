## Chapter 7: Global User Management & Role Delegation

### 7.1 Global User Directory
The **Global User Directory** (`/super-admin/users`) is the central identity store for every individual registered on the ABCD Edu Hub network.

---

### 7.2 Platform Role Taxonomy
ABCD Edu Hub enforces strict Role-Based Access Control (RBAC):

| Role Identifier | Typical User Profile | Access Privileges |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Executive Director / Platform Owner | Full, unrestricted global authority across all databases, financials, and configurations. |
| `SUPER_ADMIN_MANAGER` | Head Office Department Heads | Customized access to specific Super Admin modules (e.g., Finance, Affiliations, or Curriculum). |
| `STATE_MANAGER` | Regional State Coordinator | Oversight of franchises, center growth, and student quotas within assigned geographic states. |
| `WORKSPACE_ADMIN` | Franchise Owner / Center Director | Complete management of their individual study center, courses, staff, and student admissions. |
| `WORKSPACE_MANAGER` | Center Operational Manager | Supervisory access within a single study center. |
| `STAFF` | Faculty, Receptionists, Counselors | Granular operational permissions granted by the franchise owner. |
| `STUDENT` | Enrolled Learner | Access to personal student portal, course materials, attendance, exam results, and ID card. |

---

### 7.3 Creating Super Admin Managers (Delegating HQ Operations)
As your educational network expands, you can delegate specific operational sections to Head Office team members without granting full master access:

1. Navigate to **Users** (`/super-admin/users`).
2. Click **"+ Add System User"**.
3. Enter the employee's Name, Official Email, and Mobile Number.
4. Select Role: `SUPER_ADMIN_MANAGER`.
5. Under **"System Permission Checklist"**, check the specific departmental sections the manager is authorized to handle:
   - **Wallet Economy**: Review and approve franchise token recharge requests.
   - **Franchises**: Review new franchise applications and onboard centers.
   - **Students**: Review and verify student registration cards and certificates.
   - **Courses**: Manage the global course catalog and syllabi.
   - **Documents**: Edit ID card and certificate templates.
   - **Products**: Manage wholesale store merchandise orders.
   - **State Managers**: Coordinate with regional directors.
   - **Settings**: Adjust global platform settings.
6. Click **"Create User"**.

> [!NOTE]
> `SUPER_ADMIN_MANAGER` accounts cannot access System Logs or modify master `SUPER_ADMIN` credentials, safeguarding administrative integrity.

---

### 7.4 Managing User Security & Password Resets
- **Global Search**: Search users by Email, Name, or Phone Number across all role tiers.
- **Account Suspension**: If a staff member or franchise owner violates conduct rules, toggle their account status to **Inactive / Suspended** to instantly terminate all active sessions.
- **Master Password Reset**: Click **"Reset Password"** on any user card to set a temporary credential or send an encrypted password reset link.
