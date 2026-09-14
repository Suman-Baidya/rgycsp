# ABCD Edu Hub — Complete Platform Features & Capabilities Catalog

## Chapter 1: Executive Overview & Multi-Tenant Architecture

### 1.1 Product Mission & Executive Summary
**ABCD Edu Hub (RGYCSP Platform)** is an enterprise-grade, cloud-native educational management and multi-tenant franchise ecosystem. It is engineered specifically for educational boards, national vocational councils, coaching networks, computer academies, and multi-branch university systems.

The platform unifies three traditionally fragmented software domains into one seamless ecosystem:
1. **Central Board / Super Admin Command Center**: Centralized franchise licensing, accredited curriculum governance, student registration card verification, and a tokenized service economy.
2. **Autonomous Franchise / Study Center Portals**: Individual school/branch administration including public website customization, flexible course fee pricing, dynamic admission forms, fee collection ledgers, daily attendance registers, and staff management.
3. **Dedicated Student & Learner Portals**: Personal digital student workspaces for real-time syllabus tracking, attendance percentages, fee installment payments, PVC ID cards, and tamper-proof accredited certificates.

---

### 1.2 Enterprise Multi-Tenant Architecture
The platform is built on modern multi-tenancy principles ensuring complete isolation, sovereign branding, and unmatched scalability.

#### 1. Dual-Routing Architecture (Industry First)
Every franchise center operates simultaneously across two concurrent URL routing topologies:
- **Subdomain Mode**: `https://{center-code}.abcdeduhub.com`  
  *(Example: `https://wb-002.abcdeduhub.com`)*
- **Subdirectory Mode**: `https://abcdeduhub.com/app/{center-code}`  
  *(Example: `https://abcdeduhub.com/app/wb-002`)*
- **Next.js Edge Proxy**: Intelligent proxy routing detects headers and renders the center's isolated context without page reloads or domain conflicts.

#### 2. Strict Data Isolation & Sovereign Tenants
- Every database query enforces strict multi-tenant isolation through workspace keys.
- Franchise centers cannot view, modify, or access records belonging to peer centers.
- The Super Administrator retains global, read-write oversight across all network data.

#### 3. Dynamic Center Branding Engine
Every franchise center can completely transform their public digital appearance in real time:
- Custom Institute Logo, Favicon, and Certificate Watermark.
- Dynamic Color Palette (Primary brand color, Secondary accents, Dark/Light modes).
- Dynamic Google Fonts typography mapping.
- Custom Hero Banners, Sliders, and Promotional Call-to-Actions.

---

### 1.3 High-Level Technical Stack

| Tier | Technology Employed | Key Architectural Advantage |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router, Server Components)** | Ultra-fast initial page loads, SEO optimization, and zero-bundle server logic. |
| **Styling & Design System** | **Tailwind CSS + shadcn/ui** | Clean, accessible, modern aesthetic with native Light & Dark mode support. |
| **Backend & APIs** | **Next.js Server Actions & Route Handlers** | High-security type-safe mutations without exposed REST endpoints. |
| **Database ORM** | **Prisma ORM** | Strictly typed schemas and migration safety. |
| **Database Infrastructure** | **Neon Serverless PostgreSQL** | Cloud-native scaling with connection pooling and high concurrency. |
| **Authentication Engine** | **NextAuth.js v5 + WebAuthn Passkeys** | Hardware-level biometric authentication and bcrypt cryptographic security. |
| **AI Integration** | **Google Gemini Enterprise API** | AI-driven exam paper generation and automatic assessment workflows. |
| **Document Compilation** | **Python DOCX Engine** | Instant automated compilation of all operational manuals and client catalogs. |
