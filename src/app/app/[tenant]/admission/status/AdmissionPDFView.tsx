"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function AdmissionPDFView({ application, workspaceName, settings }: any) {
  
  const handlePrint = () => {
    // We create a new window with a printable HTML document
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Form - ${application.applicationNo}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            font-size: 14px;
          }
          .a4-container {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: white;
            box-sizing: border-box;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            max-height: 80px;
          }
          .inst-name {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0 5px;
            text-transform: uppercase;
          }
          .inst-contact {
            font-size: 12px;
            color: #666;
          }
          .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            background: #f0f0f0;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            text-transform: uppercase;
          }
          .row {
            display: flex;
            margin-bottom: 10px;
          }
          .col {
            flex: 1;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
          }
          .value {
            border-bottom: 1px dotted #ccc;
            display: inline-block;
            width: calc(100% - 160px);
            padding-left: 5px;
          }
          .section-title {
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          .photo-box {
            position: absolute;
            top: 25mm;
            right: 20mm;
            width: 35mm;
            height: 45mm;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .photo-box img {
            max-width: 100%;
            max-height: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
          }
          .sign-box {
            text-align: center;
            width: 200px;
          }
          .sign-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 5px;
          }
          @media print {
            body { padding: 0; background: none; }
            .a4-container { width: 100%; height: auto; box-shadow: none; padding: 0; }
            @page { size: A4; margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="a4-container">
          <div class="header">
            ${settings?.logoUrl ? `<img src="${settings.logoUrl}" class="logo" />` : ''}
            <div class="inst-name">${workspaceName}</div>
            <div class="inst-contact">
              ${settings?.address ? `${settings.address} <br/>` : ''}
              ${settings?.contactPhone ? `Phone: ${settings.contactPhone}` : ''} 
              ${settings?.contactEmail ? ` | Email: ${settings.contactEmail}` : ''}
            </div>
          </div>
          
          <div class="title">Admission Application Form</div>

          ${application.photoUrl ? `
            <div style="position: absolute; top: 140px; right: 40px; width: 120px; height: 160px; border: 1px solid #ccc; text-align: center;">
              <img src="${application.photoUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </div>
          ` : ''}

          <div style="width: 75%;">
            <div class="row">
              <span class="label">Application No:</span>
              <span class="value" style="font-weight: bold;">${application.applicationNo}</span>
            </div>
            <div class="row">
              <span class="label">Course Applied For:</span>
              <span class="value font-bold">${application.course?.title || "N/A"}</span>
            </div>
          </div>

          <div class="section-title">1. Personal Information</div>
          <div class="row"><span class="label">Full Name:</span><span class="value">${application.fullName}</span></div>
          <div class="row"><span class="label">Guardian Name:</span><span class="value">${application.guardianName || 'N/A'}</span></div>
          <div class="row">
            <div class="col"><span class="label">Date of Birth:</span><span class="value" style="width: calc(100% - 160px);">${application.dob ? new Date(application.dob).toLocaleDateString() : 'N/A'}</span></div>
            <div class="col"><span class="label" style="width:80px">Gender:</span><span class="value" style="width: calc(100% - 90px);">${application.gender || 'N/A'}</span></div>
          </div>
          <div class="row">
            <div class="col"><span class="label">Religion:</span><span class="value" style="width: calc(100% - 160px);">${application.religion || 'N/A'}</span></div>
            <div class="col"><span class="label" style="width:80px">Caste:</span><span class="value" style="width: calc(100% - 90px);">${application.caste || 'N/A'}</span></div>
          </div>

          <div class="section-title">2. Contact & Address</div>
          <div class="row"><span class="label">Mobile Number:</span><span class="value">${application.mobile}</span></div>
          <div class="row"><span class="label">WhatsApp Number:</span><span class="value">${application.whatsapp || 'N/A'}</span></div>
          <div class="row"><span class="label">Email ID:</span><span class="value">${application.email || 'N/A'}</span></div>
          
          <div style="margin-top: 10px; border: 1px solid #ccc; padding: 10px;">
            <div style="font-weight:bold; margin-bottom:5px;">Permanent Address:</div>
            ${application.address?.vill ? `Village/Street: ${application.address.vill}<br/>` : ''}
            ${application.address?.po ? `P.O: ${application.address.po}, ` : ''}
            ${application.address?.ps ? `P.S: ${application.address.ps}<br/>` : ''}
            ${application.address?.dist ? `District: ${application.address.dist}, ` : ''}
            ${application.address?.state ? `State: ${application.address.state}<br/>` : ''}
            ${application.address?.pin ? `PIN: ${application.address.pin}` : ''}
          </div>

          <div class="section-title">3. Educational Qualification</div>
          <table>
            <thead>
              <tr>
                <th>Qualification</th>
                <th>Board/University</th>
                <th>Passing Year</th>
                <th>Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${application.qualification?.name || 'N/A'}</td>
                <td>${application.qualification?.board || 'N/A'}</td>
                <td>${application.qualification?.year || 'N/A'}</td>
                <td>${application.qualification?.percentage || 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">4. Declaration</div>
          <p style="text-align: justify; font-size: 12px; line-height: 1.5;">
            I hereby declare that all the information provided by me in this application is true and correct to the best of my knowledge and belief. I understand that any misrepresentation of facts may lead to the cancellation of my admission. I agree to abide by the rules and regulations of the institute.
          </p>

          <div class="signatures">
            <div class="sign-box">
              <div style="height: 50px;"></div>
              <div class="sign-line">Date & Place</div>
            </div>
            <div class="sign-box">
              ${application.signatureUrl ? `<img src="${application.signatureUrl}" style="max-height: 50px; max-width: 100%;" />` : '<div style="height: 50px;"></div>'}
              <div class="sign-line">Signature of Applicant</div>
            </div>
          </div>
          
          <div style="margin-top: 40px; font-size: 10px; text-align: center; color: #666; border-top: 1px dashed #ccc; padding-top: 10px;">
            For Office Use Only<br/>
            Application Status: ${application.status} | Verified By: ___________________ | Batch Assigned: ___________________
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Button onClick={handlePrint} className="gap-2 bg-primary">
      <Printer className="w-4 h-4" /> Print / Download A4 Form
    </Button>
  );
}
