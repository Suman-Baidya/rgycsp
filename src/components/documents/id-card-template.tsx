"use client"

import { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface IdCardProps {
  instituteName: string;
  studentName: string;
  enrollmentNo: string;
  batchName: string;
  bloodGroup?: string;
  phone?: string;
  photoUrl?: string; // Eventually fetched from Cloudinary
}

export function IdCardTemplate({
  instituteName,
  studentName,
  enrollmentNo,
  batchName,
  bloodGroup = "O+",
  phone,
  photoUrl = "https://via.placeholder.com/150"
}: IdCardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button onClick={handlePrint} variant="outline" className="print:hidden">
        Print / Download PDF
      </Button>
      
      <div 
        ref={printRef}
        className="w-[2.125in] h-[3.375in] bg-white border-2 border-zinc-200 rounded-xl overflow-hidden shadow-lg flex flex-col print:shadow-none print:border-none relative"
      >
        {/* Card Header styling / branding */}
        <div className="h-16 bg-primary text-primary-foreground flex items-center justify-center text-center p-2">
          <h2 className="font-bold text-sm tracking-tight leading-tight">{instituteName}</h2>
        </div>
        
        {/* Photo Container */}
        <div className="flex justify-center -mt-6 z-10">
          <div className="w-20 h-24 bg-zinc-100 border-4 border-white rounded-md overflow-hidden shadow-sm">
            <img src={photoUrl} alt="Student" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Student Details */}
        <div className="flex-1 flex flex-col items-center mt-2 px-3 text-zinc-900">
          <h3 className="font-bold text-lg leading-none">{studentName}</h3>
          <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-1">{batchName}</p>
          
          <div className="w-full mt-4 space-y-1 align-left">
             <div className="flex justify-between text-[10px]">
               <span className="font-bold">ID NO:</span>
               <span>{enrollmentNo}</span>
             </div>
             <div className="flex justify-between text-[10px]">
               <span className="font-bold">DOB:</span>
               <span>21-Apr-2010</span>
             </div>
             <div className="flex justify-between text-[10px]">
               <span className="font-bold">BLOOD:</span>
               <span className="text-red-500 font-bold">{bloodGroup}</span>
             </div>
             <div className="flex justify-between text-[10px]">
               <span className="font-bold">PHONE:</span>
               <span>{phone || "N/A"}</span>
             </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="h-10 bg-zinc-100 mt-auto flex items-center justify-between px-3">
           <div className="text-[8px] text-zinc-500 pr-2">Valid for academic year 2026-27</div>
           {/* Placeholder for QR Code */}
           <div className="w-6 h-6 bg-zinc-300 rounded border border-zinc-400"></div>
        </div>
      </div>
    </div>
  );
}
