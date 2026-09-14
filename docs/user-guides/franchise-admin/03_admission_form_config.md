## Chapter 3: Admission Form Configuration

### 3.1 Overview of the Dynamic Admission Engine
Every ABCD Edu Hub franchise center is equipped with a high-conversion, public online admission portal (`/admission`). Rather than forcing a rigid, one-size-fits-all form, the platform provides an **Admission Form Configuration Engine** where you can customize:
- Which fields are enabled or disabled.
- Custom questions and data fields specific to your state or franchise.
- Required verification documents (photos, certificates, ID cards).
- Verification policies (email/mobile verification).
- Student instructions and legal declaration text printed on the official admission PDF.

---

### 3.2 Accessing the Admission Form Settings
1. Navigate to **Students** (`/admin/students`) or click **Admissions** in the sidebar.
2. In the top navigation tab bar, select **"Form Config"** (icon represented by the Settings gear).
3. The **"Admission Form Configuration"** panel will load.

---

### 3.3 Step-by-Step Configuration Guide

#### Step 1: Portal Accessibility & Security Toggles
- **Enable Online Admissions (Toggle)**:
  - *Enabled (On)*: Prospective students can visit `your-center.abcdeduhub.com/admission` and submit applications.
  - *Disabled (Off)*: Closes the online admission intake. The public page displays a polite notice: *"Online admissions are currently closed for the current intake. Please visit the center directly."*
- **Require Email Verification (Toggle)**:
  - When enabled, students must verify their email address before the application is marked valid, preventing bot submissions and spam.

#### Step 2: Student Instructions & Success Acknowledgement
- **Applicant Instructions (Textarea)**:
  - Enter custom guidelines that will appear at the very top of the student admission form.
  - *Example*: *"Please ensure your name matches your 10th Standard Admit Card. Upload a clear, passport-sized photo with a plain background. Registration fee is payable at the center upon verification."*
- **Submission Success Message (Textarea)**:
  - Enter the congratulatory message displayed on screen immediately after successful form submission.
  - *Example*: *"Thank you for applying to ABCD Edu Hub Kolkata Center! Your application reference number has been sent to your mobile. Please visit the center within 7 working days with your original documents for batch allocation."*

#### Step 3: Enabling / Disabling Standard Fields
Every institution collects different demographic details. You can selectively enable or disable optional standard fields by clicking on their respective toggle badges:
- Date of Birth (`dob`)
- Gender (`gender`)
- Blood Group (`bloodGroup`)
- Religion (`religion`)
- Caste / Category (`caste`)
- WhatsApp Contact Number (`whatsapp`)
- Father's Full Name (`fatherName`)
- Mother's Full Name (`motherName`)
- Guardian / Emergency Phone Number (`guardianPhone`)
- Previous Highest Qualification (`qualification`)

> [!NOTE]
> Fundamental contact fields (Student Full Name, Primary Mobile Number, Email Address, and Course Selection) are strictly required by the core system to create student user accounts and cannot be disabled.

#### Step 4: Creating Custom Form Fields (Custom Questions)
If you need to collect unique information (e.g., *"How did you hear about us?"*, *"Preferred Batch Timing"*, or *"Aadhaar Number"*):
1. Scroll to the **"Custom Dynamic Fields"** section.
2. Click **"+ Add Custom Field"**.
3. Fill in the field definition:
   - **Field Label**: The question or prompt shown to the student (e.g., *Preferred Batch Timing*).
   - **Field Type**: Choose from:
     - `Text` (Single-line answer)
     - `Number` (Numeric inputs like Roll Number or Aadhaar)
     - `Date` (Date selector)
     - `Dropdown / Select` (Multiple choice options)
     - `Textarea` (Multi-line remarks or address)
   - **Options (For Dropdowns)**: Enter comma-separated choices (e.g., `Morning (8 AM - 10 AM), Afternoon (2 PM - 4 PM), Evening (6 PM - 8 PM)`).
   - **Required Switch**: Turn on if the student cannot submit the form without answering this field.
4. Click the trash icon to remove any custom field you no longer require.

#### Step 5: Document Upload Checklist
Specify which files applicants must upload during submission:
- The default checklist includes:
  1. *Passport Size Photograph* (Mandatory for ID Card generation)
  2. *Government ID Proof (Aadhaar / Voter ID / School ID)*
  3. *Last Qualification Marksheet / Certificate*
- **To add a new required document**:
  - Type the document name in the input box (e.g., *Caste Certificate* or *Transfer Certificate*).
  - Click **"Add Document"**.
- **To remove a document**: Click the Delete (Trash) icon next to the document name.

#### Step 6: Customizing the Admission PDF Legal Declaration
Every submitted application generates an official, printable **Admission Application PDF Form**.
- In the **"Admission PDF Declaration"** box, specify the terms of enrollment.
- *Default Standard Legal Text*:
  > *"I hereby declare that all information provided in this application form is true and correct to the best of my knowledge. I agree to abide by the rules, code of conduct, and fee refund policies of the institute. Any misrepresentation will result in immediate disqualification."*
- You can freely customize this text to comply with your institute's local regulations, attendance thresholds, and refund policies.

#### Step 7: Saving & Verifying Live
1. Click the **"Save Configuration"** button at the top or bottom of the screen.
2. Wait for the green confirmation toast: *"Admission configuration saved successfully"*.
3. Open a new browser tab and visit your public admission page (`https://{your-subdomain}.abcdeduhub.com/admission` or `/app/{tenant}/admission`) to verify your new fields, instructions, and upload rules.
