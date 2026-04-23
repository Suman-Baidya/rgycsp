import { Button } from "@/components/ui/button";

export default async function AttendancePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold">Attendance Register</h1>
           <p className="text-muted-foreground mt-1">Mark daily attendance for students and staff.</p>
        </div>
        <div className="flex gap-4">
          <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <Button>Save Register</Button>
        </div>
      </div>

      <div className="border bg-card rounded-xl overflow-hidden min-h-[400px]">
        <table className="w-full text-left text-sm">
           <thead className="bg-secondary/50 border-b">
              <tr>
                 <th className="p-4 font-medium">Enrollment No</th>
                 <th className="p-4 font-medium">Student Name</th>
                 <th className="p-4 font-medium">Batch</th>
                 <th className="p-4 font-medium">Status</th>
                 <th className="p-4 font-medium">Remarks</th>
              </tr>
           </thead>
           <tbody>
              {/* Empty state for now */}
              <tr>
                 <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                    Select a batch to load students.
                 </td>
              </tr>
           </tbody>
        </table>
      </div>
    </div>
  );
}
