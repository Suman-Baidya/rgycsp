import { Button } from "@/components/ui/button";

export default async function AdmissionsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold">New Admission</h1>
           <p className="text-muted-foreground mt-1">Enroll a new student into the workspace.</p>
        </div>
        <Button>Import CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border bg-card p-6 rounded-xl">
         {/* Basic Form Structure */}
         <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Student Information</h3>
            <div className="flex flex-col gap-1.5 mt-2">
               <label className="text-sm font-medium">Full Name</label>
               <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="John Doe" />
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
               <label className="text-sm font-medium">Phone</label>
               <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="+91 XXXXX XXXXX" />
            </div>
         </div>
         <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-lg border-b pb-2">Enrollment Details</h3>
            <div className="flex flex-col gap-1.5 mt-2">
               <label className="text-sm font-medium">Assign to Course/Batch</label>
               <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Select a batch...</option>
               </select>
            </div>
            <div className="flex flex-col gap-1.5 mt-2">
               <label className="text-sm font-medium">Admission Fees (₹)</label>
               <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="1000" />
            </div>
         </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button size="lg" className="px-8">Confirm Admission</Button>
      </div>
    </div>
  );
}
