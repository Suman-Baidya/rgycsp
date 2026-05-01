"use client";

import { useState } from "react";
import { loginApplicant } from "@/app/actions/applicant-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download, LogOut, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import AdmissionPDFView from "./AdmissionPDFView"; // We will create this

export default function ApplicantDashboard({ workspaceId, workspaceName, settings }: any) {
  const [appNo, setAppNo] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await loginApplicant(workspaceId, appNo, password);
    if (res.success) {
      setApplication(res.data);
      toast.success("Logged in successfully");
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setApplication(null);
    setAppNo("");
    setPassword("");
  };

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md shadow-xl border-primary/10">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-black">Track Application</CardTitle>
            <CardDescription>Enter your application credentials to check status or download your form.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 text-left">
                <Label>Application Number</Label>
                <Input 
                  value={appNo} 
                  onChange={e => setAppNo(e.target.value)} 
                  placeholder="e.g. APP-20231012-A1B2" 
                  required 
                />
              </div>
              <div className="space-y-2 text-left">
                <Label>Password</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Login to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {application.fullName}</h1>
          <p className="text-muted-foreground">Application: {application.applicationNo}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="md:col-span-1 shadow-md border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-lg">Current Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
            {application.status === "PENDING" && (
              <>
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-yellow-600">Pending Review</h3>
                <p className="text-center text-sm text-muted-foreground">Please visit the institute with your documents for verification.</p>
              </>
            )}
            {application.status === "APPROVED" && (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-green-600">Approved</h3>
                <p className="text-center text-sm text-muted-foreground">Congratulations! You have been enrolled.</p>
              </>
            )}
            {application.status === "REJECTED" && (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-red-600">Rejected</h3>
                {application.rejectionReason && (
                  <div className="bg-red-50 p-3 rounded text-sm text-red-800 text-center border border-red-100">
                    <strong>Reason:</strong> {application.rejectionReason}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Details & PDF Card */}
        <Card className="md:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Course Applied For</span>
                <span className="font-semibold">{application.course?.title || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Submission Date</span>
                <span className="font-semibold">{new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Mobile</span>
                <span className="font-semibold">{application.mobile}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Date of Birth</span>
                <span className="font-semibold">{application.dob ? new Date(application.dob).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Next Steps
              </h4>
              <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
                <li>Download your application form below.</li>
                <li>Print the application form on an A4 size paper.</li>
                <li>Visit the institute with the printed form, your original Identity Proof, and passport size photographs.</li>
                <li>Submit the admission fees to confirm your enrollment.</li>
              </ul>
            </div>

            <div className="pt-4 flex">
               <AdmissionPDFView application={application} workspaceName={workspaceName} settings={settings} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
