## Chapter 6: Document Designer System

### 6.1 Central Credential Standardization
To maintain academic credibility, certificates and ID cards issued across all franchises must adhere to strict, unified visual and legal standards. The **Document Designer** (`/super-admin/documents`) gives the Super Admin complete control over template layouts and dynamic data bindings.

---

### 6.2 Supported Document Templates
1. **Accredited Course Certificates**: High-resolution, ornamental landscape documents awarded upon curriculum completion.
2. **Student PVC ID Cards**: Compact portrait credit-card format (CR80 standard: 85.6mm x 53.98mm) featuring dual-sided layouts.
3. **Student Registration Cards**: Official enrollment proof cards with central board registration seals.
4. **Academic Marksheets & Transcripts**: Detailed semester scorecards displaying theory, practical, and viva marks.

---

### 6.3 Configuring Dynamic Data Placeholders
When designing templates, you insert dynamic tokens that automatically resolve to the specific student's verified records upon generation:

| Dynamic Placeholder Token | Output Data Rendered |
| :--- | :--- |
| `{student_name}` | Full Legal Name of the Student |
| `{enrollment_no}` | Unique National Enrollment Number (e.g., `WB002-2026-0042`) |
| `{father_name}` | Father's / Guardian's Name |
| `{course_title}` | Full Title of the Accredited Course |
| `{course_duration}` | Standard Duration (e.g., *12 Months / 360 Hours*) |
| `{center_name}` | Affiliated Franchise Center Name |
| `{center_code}` | Unique Center Accreditation Code (e.g., `WB-002`) |
| `{grade_awarded}` | Final Examination Grade (e.g., `A+`, `A`, `Distinction`) |
| `{issue_date}` | Date Document Was Formally Issued |
| `{student_photo}` | High-Resolution Passport Photo of the Student |
| `{qr_code}` | Dynamic Anti-Counterfeit Verification QR Code |

---

### 6.4 Designing & Customizing a Certificate (Step-by-Step)
1. Go to **Documents** (`/super-admin/documents`).
2. Select the **"Certificate Template"** tab.
3. **Header & Borders**:
   - Upload high-resolution central board crest and national accreditation logos.
   - Choose ornate geometric guilloche security borders to prevent physical forgery.
   - Set the background watermark opacity (recommended: 8% to 12%).
4. **Typography & Styling**:
   - Configure regal display fonts for student names (e.g., *Cinzel*, *Great Vibes*, or *Playfair Display*).
   - Configure clean serif or sans-serif body typography for legal accreditation text.
5. **Anti-Counterfeit QR Code Placement**:
   - Position the dynamic QR code in the bottom-right or bottom-left corner.
   - Configure the verification redirect destination: `https://abcdeduhub.com/verify/certificate/{certificateNo}`.
6. **Authorized Signatures & Official Seals**:
   - Upload transparent PNG images of the **President / Chairman's Signature** and **Controller of Examinations' Signature**.
   - Position the central embossed golden seal.
7. **Test with Sample Data**:
   - Click **"Preview with Sample Data"** to verify text alignment, character overflow, and image rendering.
8. Click **"Save & Set as Active Template"**. The new design instantly applies to all future certificate print jobs nationwide.
