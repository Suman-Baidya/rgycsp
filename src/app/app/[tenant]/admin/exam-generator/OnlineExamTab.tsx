"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function OnlineExamTab() {
  return (
    <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 mt-6">
      <CardContent className="p-24 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Construction className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Online Examinations</h2>
          <p className="text-slate-500 max-w-md mx-auto">This feature is currently under development and will be coming soon!</p>
        </div>
      </CardContent>
    </Card>
  );
}
