"use client"

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface IdCardTemplateProps {
  fullName: string;
  enrollmentNo: string;
  courseName: string;
  bloodGroup: string;
  phone: string;
  validUntil: string;
  photoUrl: string;
  signatureUrl: string;
  workspaceName: string;
  workspaceLogo: string;
  centerCode: string;
}

export function IdCardTemplate({
  fullName,
  enrollmentNo,
  courseName,
  bloodGroup,
  phone,
  validUntil,
  photoUrl,
  signatureUrl,
  workspaceName,
  workspaceLogo,
  centerCode,
}: IdCardTemplateProps) {
  return (
    <div className="w-[85.6mm] h-[54mm] bg-white rounded-lg shadow-sm border overflow-hidden flex relative" style={{ boxSizing: 'border-box' }}>
      {/* Front Side */}
      <div className="w-[54mm] h-[85.6mm] flex flex-col relative bg-gradient-to-b from-blue-50 to-white" style={{ transform: 'rotate(-90deg) translate(-54mm, 0)', transformOrigin: 'top left' }}>
        {/* Header */}
        <div className="bg-blue-900 text-white p-2 text-center flex flex-col items-center">
          {workspaceLogo ? (
            <img src={workspaceLogo} alt="Logo" className="h-6 object-contain mb-1" />
          ) : (
            <div className="text-[10px] font-bold truncate w-full">{workspaceName}</div>
          )}
          <div className="text-[6px] opacity-80 uppercase tracking-widest">Student ID Card</div>
        </div>

        {/* Body */}
        <div className="flex-1 p-2 flex flex-col items-center pt-3 relative">
          <div className="w-16 h-20 bg-slate-100 border-2 border-white shadow-md rounded-md overflow-hidden mb-2 relative z-10">
            {photoUrl ? (
              <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">Photo</div>
            )}
          </div>
          
          <div className="text-center w-full relative z-10">
            <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">{fullName}</h2>
            <div className="text-[8px] font-bold text-blue-600 truncate mt-0.5">{courseName}</div>
            
            <div className="mt-2 text-left space-y-0.5 px-2">
              <div className="flex text-[7px]">
                <span className="w-12 font-bold text-slate-500">ID No</span>
                <span className="font-bold text-slate-900">: {enrollmentNo}</span>
              </div>
              <div className="flex text-[7px]">
                <span className="w-12 font-bold text-slate-500">Center</span>
                <span className="font-bold text-slate-900">: {centerCode}</span>
              </div>
              <div className="flex text-[7px]">
                <span className="w-12 font-bold text-slate-500">Phone</span>
                <span className="font-bold text-slate-900">: {phone}</span>
              </div>
              <div className="flex text-[7px]">
                <span className="w-12 font-bold text-slate-500">Blood Grp</span>
                <span className="font-bold text-red-600">: {bloodGroup}</span>
              </div>
              <div className="flex text-[7px]">
                <span className="w-12 font-bold text-slate-500">Valid Till</span>
                <span className="font-bold text-slate-900">: {validUntil}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-2 right-2 opacity-80">
           <QRCodeSVG value={enrollmentNo} size={24} />
          </div>
          <div className="absolute bottom-2 left-2 w-16 text-center">
            {signatureUrl ? (
              <img src={signatureUrl} alt="Signature" className="h-6 w-full object-contain" />
            ) : (
              <div className="h-6 border-b border-dashed border-slate-300 w-full mb-1"></div>
            )}
            <div className="text-[5px] text-slate-500">Authorized Signatory</div>
          </div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />
      </div>
    </div>
  );
}
