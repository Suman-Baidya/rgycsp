"use client";

import React, { useState, useEffect } from "react";
import { submitExam } from "@/app/actions/student-exam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Timer, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function LiveExamClient({
  settings,
  tenant,
  exam,
  studentProfileId
}: {
  settings: any,
  tenant: string,
  exam: any,
  studentProfileId: string
}) {
  const router = useRouter();
  const primaryColor = settings?.primaryColor || "#0f172a";
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState((exam.duration || 60) * 60);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isSubmitting) handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitting]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleAutoSubmit = async () => {
    toast.error("Time is up! Auto-submitting exam...");
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Check if all questions are answered
    const unansweredCount = exam.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0 && timeLeft > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await submitExam(exam.id, exam.workspaceId, answers);
      if (res.success) {
        toast.success("Exam submitted successfully!");
        router.push(`/app/${tenant}/student/exams`);
        router.refresh();
      } else {
        toast.error(res.error);
        setIsSubmitting(false);
      }
    } catch (e: any) {
      toast.error(e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24">
      {/* Sticky Header with Timer */}
      <div className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-white/10 shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white truncate max-w-sm md:max-w-xl">{exam.title}</h1>
          <p className="text-sm font-bold text-slate-500">Answered: {Object.keys(answers).length} / {exam.questions.length}</p>
        </div>
        
        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg", timeLeft < 300 ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300")}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4 space-y-8">
        {exam.questions.map((q: any, index: number) => (
          <Card key={q.id} className="rounded-3xl border-2 border-slate-100 dark:border-white/5 shadow-sm overflow-hidden" id={`question-${index}`}>
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 border-b border-slate-100 dark:border-white/5 flex gap-4">
               <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white shrink-0" style={{ backgroundColor: primaryColor }}>
                 {index + 1}
               </div>
               <p className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed pt-1">
                 {q.questionText}
               </p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((optKey) => {
                  const optText = q[`option${optKey}`];
                  const isSelected = answers[q.id] === optKey;
                  
                  return (
                    <div 
                      key={optKey}
                      onClick={() => handleSelectOption(q.id, optKey)}
                      className={cn(
                        "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4",
                        isSelected 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-slate-100 dark:border-white/5 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-zinc-900"
                      )}
                      style={{ borderColor: isSelected ? primaryColor : undefined, backgroundColor: isSelected ? `${primaryColor}10` : undefined }}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                        isSelected ? "border-primary bg-primary" : "border-slate-300 dark:border-slate-600"
                      )}
                      style={{ 
                        borderColor: isSelected ? primaryColor : undefined, 
                        backgroundColor: isSelected ? primaryColor : undefined 
                      }}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        <span className="font-bold mr-2">{optKey}.</span>
                        {optText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="pt-8 flex justify-end">
          <Button 
            size="lg" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="rounded-2xl px-12 h-16 text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform gap-3"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      </div>
    </div>
  );
}
