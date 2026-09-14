# ABCD Edu Hub — Franchise Admin Complete Operational Guide

## Chapter 1: Platform Overview & System Navigation

### 1.1 Welcome to ABCD Edu Hub
Welcome to the **ABCD Edu Hub Franchise Management System**. As a Franchise / Study Center Administrator, this platform provides an end-to-end cloud environment to operate your entire educational institute: managing admissions, customizing your public website, enrolling students, tracking attendance, setting course fees, issuing certificates and ID cards, managing staff, and handling finances.

---

### 1.2 Multi-Tenant Routing Modes
Your institute's portal operates in one of two routing modes configured for your center:

1. **Subdirectory Mode**:
   - Web Address: `https://abcdeduhub.com/app/{your-center-subdomain}/admin`
   - Example: `https://abcdeduhub.com/app/wb-002/admin`
2. **Subdomain Mode** (Custom Domain or Branded Subdomain):
   - Web Address: `https://{your-center-subdomain}.abcdeduhub.com/admin`
   - Example: `https://wb-002.abcdeduhub.com/admin`

> [!NOTE]
> Regardless of routing mode, your login credentials, dashboard functions, student data, and administrative tools function identically. The system automatically preserves your center's identity across all URLs.

---

### 1.3 Navigating the Franchise Admin Dashboard

The Franchise Admin dashboard is engineered for high productivity with responsive desktop and mobile layouts.

#### Desktop Sidebar
On desktop displays (1024px and wider), the left sidebar provides instant access to all administrative modules:
- **Institute Badge**: Displays your center's logo, status, and role badge (Franchise Admin or State Manager).
- **Overview (`/admin`)**: Your central dashboard with real-time statistics, revenue metrics, and quick action shortcuts.
- **Wallet (`/admin/wallet`)**: Your institute's internal token wallet for AI services and platform actions.
- **Staff & Roles (`/admin/staff`)**: Team member management and granular feature permissions.
- **Students (`/admin/students`)**: Enrolled student database, ID cards, certificates, marksheets, and batch assignments.
- **Fees Manage (`/admin/fees`)**: Fee ledger, pending payment verification, offline receipt generation, and fee installments.
- **Admissions (`/admin/admissions`)**: New student intake applications and admission form customization.
- **Attendance (`/admin/attendance`)**: Daily batch attendance registers and monthly percentage reports.
- **Courses (`/admin/courses`)**: Global course catalog, local course pricing overrides, and syllabus viewer.
- **Products & Store (`/admin/products`)**: Center merchandise, study kits, books, and uniforms.
- **Exam Zone (`/admin/exam-generator`)**: Examination scheduling, question bank, and question paper generator.
- **Landing Page (`/admin/settings`)**: Public website builder (hero banners, notices, photo gallery, testimonials, contact details).
- **Profile (`/admin/profile`)**: Account credentials, security passkeys, and center admin profile.
- **Logout**: Securely signs out of your administrative session.

#### Mobile Native Navigation
On smartphones and tablets:
- The bottom bar provides one-tap access to your top four modules (**Overview**, **Wallet**, **Staff**, **Students**).
- A **"More"** button slides up a native bottom drawer containing all secondary modules, settings, and logout.
- **Pulsing Notification Badges** appear in red over "Admissions" and "Fees Manage" whenever pending student applications or payment verification requests require your attention.

#### Top Navigation Bar
The top header remains visible on every page:
- **Center Code & Name**: Confirms your active franchise identity (e.g., `WB-002 - Kolkata Main Center`).
- **Wallet Token Balance**: Displays your real-time available token credits with a direct link to recharge.
- **Theme Switcher**: Seamlessly toggles between Light Mode and Dark Mode according to your preference.
- **Quick Action FAB (Floating Action Button)**: Floating in the bottom-right corner, allowing you to quickly register a student, record a payment, or create a notice from any screen.
