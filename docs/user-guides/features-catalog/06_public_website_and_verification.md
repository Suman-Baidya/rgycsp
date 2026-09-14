## Chapter 6: Public Website Engine & Anti-Counterfeit Verification

### 6.1 Overview
In addition to internal management portals, ABCD Edu Hub delivers an external-facing digital front door for both the Central Board and each individual franchise center.

---

### 6.2 Public Franchise Website Engine
Every affiliated center is automatically provisioned with a modern, high-conversion public website:
- **Dedicated Web Address**: Accessible via custom subdomain (`https://wb-002.abcdeduhub.com`) or subdirectory path (`/app/wb-002`).
- **High-Conversion Hero Section**: Displays custom headlines, dynamic background image sliders, accreditation badges, and primary action buttons (*"Apply Online"*, *"Download Prospectus"*).
- **Interactive Course Showcase**: Prospective students can browse active courses, view detailed module syllabi, inspect duration, and view transparent course fees.
- **Digital Notice Board**: Official center circulars, holiday schedules, and examination timetables. Includes an **Urgent Announcement Ticker** running across the top of the screen.
- **Campus & Lab Photo Tour**: High-resolution gallery showcasing computer labs, theory classrooms, library, and student award ceremonies.
- **Interactive Location & Lead Generation**: Embedded interactive Google Map, telephone helplines, street address, and **Direct WhatsApp Chat** integration.

---

### 6.3 Central Anti-Counterfeit Verification Engine
In the educational sector, fake certificates and forged marksheets are a significant liability. ABCD Edu Hub provides an **Instant Public Verification Gateway** accessible by employers, background check agencies, universities, and government departments:

#### 1. Real-Time Student Verification (`/verify/student/{id}`)
- Scanning the QR code on any Student ID Card or entering the Enrollment Number displays the student's:
  - Official Verified Photograph.
  - Full Name & Enrolled Center.
  - Active Enrollment Status & Admission Year.
  - Enrolled Course Title.

#### 2. Tamper-Proof Certificate Authentication (`/verify/certificate/{id}`)
- Scanning the QR code on an official completion certificate routes the verifier to a cryptographic verification certificate page:
  - Certificate Serial Number & Issue Date.
  - Awarded Grade (e.g., *Grade A+ / Distinction*).
  - Central Board Accreditation Seal & Confirmation Statement.
  - Match Guarantee: If a physical paper certificate has been altered or photoshopped, the discrepancy is immediately revealed against the official cloud database record.
