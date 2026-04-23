import { Button } from "@/components/ui/button";

export default async function AIExamGeneratorPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
             Smart Exam Generator
           </h1>
           <p className="text-muted-foreground mt-1">Harness AI to instantly generate curriculum-aligned exams.</p>
        </div>
        <div className="flex gap-2 items-center bg-zinc-100 rounded-full px-4 py-2 border font-medium">
          ✧ 3 Tokens Cost
        </div>
      </div>

      <div className="border bg-card p-6 rounded-xl shadow-sm space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Exam Topic or Subject</label>
          <input 
             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
             placeholder="e.g. Advanced Trigonometry and Calculus" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Difficulty Level</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
               <option>Easy</option>
               <option>Medium</option>
               <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Number of Questions</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
               <option>10 Questions</option>
               <option>20 Questions</option>
               <option>50 Questions</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Additional Context (Syllabus, specific constraints)</label>
          <textarea 
             className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
             placeholder="Focus primarily on real-world application word problems..." 
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button size="lg" className="px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            ✧ Generate Exam
          </Button>
        </div>
      </div>

      {/* Placeholder for AI output result */}
      <div className="mt-8 border bg-card/50 p-8 rounded-xl min-h-[300px] flex items-center justify-center text-center border-dashed">
         <p className="text-muted-foreground">The generated exam structure will appear here.</p>
      </div>
    </div>
  );
}
