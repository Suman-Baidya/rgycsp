"use client";

import { useState, useMemo } from "react";
import { 
  Clock, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  AlertCircle, 
  Search, 
  Filter, 
  Check, 
  X, 
  GraduationCap, 
  Monitor, 
  BookOpen, 
  Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { reviewExtraClassRequest, adminScheduleExtraClass, markExtraClassAttendance } from "@/app/actions/extra-classes";
import { useRouter } from "next/navigation";

export default function ExtraClassesTab({
  workspaceId,
  initialBookings = [],
  students = []
}: {
  workspaceId: string;
  initialBookings: any[];
  students: any[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  // Scheduling Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:30");
  const [classType, setClassType] = useState<"PRACTICAL" | "THEORY">("PRACTICAL");
  const [topic, setTopic] = useState("");
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // Decline Dialog
  const [declineBookingId, setDeclineBookingId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const studentName = b.student?.fullName?.toLowerCase() || "";
      const enrollmentNo = b.student?.enrollmentNo?.toLowerCase() || "";
      const topicText = b.topic?.toLowerCase() || "";
      const q = search.toLowerCase().trim();

      const matchesSearch = !q || studentName.includes(q) || enrollmentNo.includes(q) || topicText.includes(q);
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students.slice(0, 15);
    const q = studentSearch.toLowerCase().trim();
    return students.filter(s => 
      s.fullName?.toLowerCase().includes(q) || 
      s.enrollmentNo?.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [students, studentSearch]);

  const handleApprove = async (bookingId: string) => {
    setIsProcessingId(bookingId);
    try {
      const res = await reviewExtraClassRequest(workspaceId, bookingId, "APPROVED");
      if (res.success) {
        toast.success("Extra class request approved successfully.");
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "APPROVED", approvedAt: new Date() } : b));
        router.refresh();
      } else {
        toast.error(res.error || "Failed to approve request.");
      }
    } catch (e: any) {
      toast.error(e?.message || "An unexpected error occurred.");
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleDecline = async () => {
    if (!declineBookingId) return;
    setIsProcessingId(declineBookingId);
    try {
      const res = await reviewExtraClassRequest(workspaceId, declineBookingId, "REJECTED", declineReason);
      if (res.success) {
        toast.success("Extra class request declined.");
        setBookings(prev => prev.map(b => b.id === declineBookingId ? { ...b, status: "REJECTED", rejectionReason: declineReason } : b));
        setDeclineBookingId(null);
        setDeclineReason("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to decline request.");
      }
    } catch (e: any) {
      toast.error(e?.message || "An unexpected error occurred.");
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleMarkAttendance = async (bookingId: string, status: "PRESENT" | "ABSENT") => {
    setIsProcessingId(bookingId);
    try {
      const res = await markExtraClassAttendance(workspaceId, bookingId, status);
      if (res.success) {
        toast.success(`Attendance marked as ${status}. Synced to student's record.`);
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "COMPLETED", attendanceMarked: true, attendanceStatus: status } : b));
        router.refresh();
      } else {
        toast.error(res.error || "Failed to mark attendance.");
      }
    } catch (e: any) {
      toast.error(e?.message || "An unexpected error occurred.");
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return toast.error("Please select a student.");
    if (!scheduleDate) return toast.error("Please select a date.");
    if (!startTime || !endTime) return toast.error("Please specify start and end time.");

    setIsSubmittingSchedule(true);
    try {
      const res = await adminScheduleExtraClass({
        workspaceId,
        studentProfileId: selectedStudentId,
        date: scheduleDate,
        startTime,
        endTime,
        type: classType,
        topic: topic.trim() || undefined
      });

      if (res.success) {
        toast.success("Extra class scheduled successfully!");
        setIsScheduleModalOpen(false);
        setSelectedStudentId("");
        setTopic("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to schedule class.");
      }
    } catch (e: any) {
      toast.error(e?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Search student or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {["ALL", "PENDING", "APPROVED", "COMPLETED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                    statusFilter === st
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  )}
                >
                  {st === "ALL" ? "All Bookings" : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule Extra Class
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredBookings.map((booking) => {
              const student = booking.student;
              const dateStr = new Date(booking.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });

              return (
                <div
                  key={booking.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 border-l-[3px] border-indigo-500"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                      <AvatarImage src={student?.photoUrl || ""} />
                      <AvatarFallback className="text-xs font-bold text-indigo-700">
                        {student?.fullName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {student?.fullName}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                            booking.type === "PRACTICAL"
                              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                          )}
                        >
                          {booking.type === "PRACTICAL" ? <Monitor className="w-2.5 h-2.5 mr-1 inline" /> : <BookOpen className="w-2.5 h-2.5 mr-1 inline" />}
                          {booking.type}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {student?.enrollmentNo} • {student?.course?.title || "Course"}
                      </p>
                    </div>
                  </div>

                  {/* Class Timing & Topic */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-5 w-full lg:w-auto bg-slate-50/70 dark:bg-slate-800/30 lg:bg-transparent p-2 md:p-0 rounded-lg text-xs">
                    <div className="text-left shrink-0">
                      <div className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>

                    <div className="text-left shrink-0 max-w-[150px] min-w-0">
                      <span className="font-medium text-xs text-slate-700 dark:text-slate-300 truncate block" title={booking.topic || "Practice session"}>
                        {booking.topic || "Practical session"}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                        {booking.requestedBy === "STUDENT" ? "Student Request" : "Center Assigned"}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="text-left shrink-0">
                      {booking.status === "PENDING" && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-none text-[9px] font-bold">
                          Pending Approval
                        </Badge>
                      )}
                      {booking.status === "APPROVED" && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-none text-[9px] font-bold">
                          Approved / Booked
                        </Badge>
                      )}
                      {booking.status === "COMPLETED" && (
                        <Badge className={cn(
                          "border-none text-[9px] font-bold",
                          booking.attendanceStatus === "PRESENT"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        )}>
                          {booking.attendanceStatus === "PRESENT" ? "Attended (Present)" : "Absent"}
                        </Badge>
                      )}
                      {booking.status === "REJECTED" && (
                        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-none text-[9px] font-bold" title={booking.rejectionReason}>
                          Declined
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
                    {booking.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking.id)}
                          disabled={isProcessingId === booking.id}
                          className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1"
                        >
                          {isProcessingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeclineBookingId(booking.id)}
                          disabled={isProcessingId === booking.id}
                          className="h-7 px-2 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30 rounded-lg gap-1"
                        >
                          <X className="w-3 h-3" /> Decline
                        </Button>
                      </>
                    )}

                    {booking.status === "APPROVED" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleMarkAttendance(booking.id, "PRESENT")}
                          disabled={isProcessingId === booking.id}
                          className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1"
                        >
                          {isProcessingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                          Mark Present
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAttendance(booking.id, "ABSENT")}
                          disabled={isProcessingId === booking.id}
                          className="h-7 px-2 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 rounded-lg"
                        >
                          Absent
                        </Button>
                      </>
                    )}

                    {booking.status === "COMPLETED" && (
                      <span className="text-[10px] text-slate-400 font-medium italic">
                        Attendance recorded
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredBookings.length === 0 && (
              <div className="p-8 text-center space-y-2">
                <Clock className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No extra classes found</p>
                <p className="text-[11px] text-slate-400">Student requests and scheduled ad-hoc classes will appear here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Ad-Hoc Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md p-4 sm:p-5 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Schedule One-Time Extra Class
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Assign an extra lab or theory slot to a student for a specific date and time.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleScheduleSubmit} className="space-y-3 pt-2">
            {/* Student Picker */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-500">Select Student *</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Type student name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
                />
              </div>

              <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg mt-1">
                {filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setStudentSearch(s.fullName);
                    }}
                    className={cn(
                      "w-full p-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors",
                      selectedStudentId === s.id && "bg-indigo-50/80 dark:bg-indigo-950/50 font-semibold text-indigo-600"
                    )}
                  >
                    <span>{s.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{s.enrollmentNo}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Date *</label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Class Type *</label>
                <select
                  value={classType}
                  onChange={(e) => setClassType(e.target.value as any)}
                  className="w-full h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-2"
                >
                  <option value="PRACTICAL">Practical Lab</option>
                  <option value="THEORY">Theory Class</option>
                </select>
              </div>
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Start Time *</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">End Time *</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
                />
              </div>
            </div>

            {/* Topic / Note */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-500">Topic / Notes (Optional)</label>
              <Input
                placeholder="e.g. Photoshop Layers makeup, Tally GST doubt clearing"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-8 text-xs font-semibold rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingSchedule || !selectedStudentId}
                className="h-8 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
              >
                {isSubmittingSchedule ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Confirm Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Decline Reason Dialog */}
      <Dialog open={!!declineBookingId} onOpenChange={(open) => !open && setDeclineBookingId(null)}>
        <DialogContent className="max-w-sm p-4 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Decline Request
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide a reason for declining this extra class request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="e.g. Lab full, instructor unavailable..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="h-8 text-xs rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeclineBookingId(null)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDecline}
              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
