"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { getPracticalConfig, getWeeklySchedules, assignStudentToSlot, updateStudentSchedule, removeStudentFromSlot, createPracticalSlot, deletePracticalSlot, updatePracticalConfig } from "@/app/actions/practical-classes";
import { toast } from "sonner";
import { Plus, Users, Clock, Settings, X, GripVertical, Trash2, AlertTriangle, Save, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PracticalClassesTab({ workspaceId }: { workspaceId: string }) {
  const [config, setConfig] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  
  const scheduleMap = useMemo(() => {
    const map = new Map<string, any[]>();
    schedules.forEach(s => {
      const key = `${s.dayOfWeek}-${s.slotId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [schedules]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Configuration Modal
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [capacity, setCapacity] = useState(30);
  const [offDays, setOffDays] = useState<number[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Current Batch
  const [isViewingCurrentBatch, setIsViewingCurrentBatch] = useState(false);
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const activeSlots = config?.slots?.filter((slot: any) => {
    const start = parseTime(slot.startTime);
    let end = parseTime(slot.endTime);
    
    // Handle slots that span past midnight (e.g., 23:00 to 01:00)
    if (end < start) {
      end += 24 * 60;
    }
    
    let current = currentMinutes;
    // If the slot spans midnight and the current time is past midnight (but before the slot ends),
    // adjust the current time to fall within the shifted range.
    if (end > 24 * 60 && current < start) {
      current += 24 * 60;
    }
    
    return current >= start && current <= end;
  }) || [];
  
  const activeSlotIds = activeSlots.map((s: any) => s.id);
  const activeSchedules = schedules.filter(s => s.dayOfWeek === currentDay && activeSlotIds.includes(s.slotId));
  const displaySlot = activeSlots.length > 0 ? activeSlots[0] : null;

  // Student Assignment
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [enrollmentNo, setEnrollmentNo] = useState("");

  // Add Slot
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");

  // Custom Delete Confirm Modal
  const [deleteConfirmScheduleId, setDeleteConfirmScheduleId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [configRes, schedulesRes] = await Promise.all([
      getPracticalConfig(workspaceId),
      getWeeklySchedules(workspaceId)
    ]);
    
    if (configRes.success) {
      setConfig(configRes.config);
      setCapacity(configRes.config.capacityPerSlot || 30);
      let parsedOffDays = [];
      try {
        parsedOffDays = typeof configRes.config.offDays === 'string' ? JSON.parse(configRes.config.offDays) : configRes.config.offDays;
        if (!Array.isArray(parsedOffDays)) parsedOffDays = [];
      } catch (e) {
        parsedOffDays = [];
      }
      setOffDays(parsedOffDays);
    }
    if (schedulesRes.success) setSchedules(schedulesRes.schedules);
    setIsLoading(false);
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    const res = await updatePracticalConfig(workspaceId, {
      capacityPerSlot: capacity,
      offDays
    });
    if (res.success) {
      toast.success("Configuration updated!");
      setIsConfiguring(false);
      fetchData();
    } else {
      toast.error(res.error);
    }
    setIsSavingConfig(false);
  };

  const toggleOffDay = (dayIndex: number) => {
    if (offDays.includes(dayIndex)) {
      setOffDays(offDays.filter(d => d !== dayIndex));
    } else {
      setOffDays([...offDays, dayIndex]);
    }
  };

  const handleAddStudent = async () => {
    if (!enrollmentNo || selectedDay === null || !selectedSlot) return;
    const res = await assignStudentToSlot(workspaceId, enrollmentNo, selectedSlot, selectedDay);
    if (res.success) {
      toast.success("Student added successfully");
      setIsAddingStudent(false);
      setEnrollmentNo("");
      fetchData(); // refresh
    } else {
      toast.error(res.error);
    }
  };

  const handleConfirmRemoveStudent = async () => {
    if (!deleteConfirmScheduleId) return;
    const res = await removeStudentFromSlot(deleteConfirmScheduleId, workspaceId);
    if (res.success) {
      toast.success("Student removed successfully");
      setDeleteConfirmScheduleId(null);
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlotStart || !newSlotEnd) return;
    const res = await createPracticalSlot(workspaceId, {
      startTime: newSlotStart,
      endTime: newSlotEnd,
      order: config?.slots?.length || 0
    });
    if (res.success) {
      toast.success("Slot added successfully");
      setIsAddingSlot(false);
      setNewSlotStart("");
      setNewSlotEnd("");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this time slot? This will remove all scheduled students for this time block.")) return;
    const res = await deletePracticalSlot(slotId, workspaceId);
    if (res.success) {
      toast.success("Slot deleted successfully");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, scheduleId: string) => {
    e.dataTransfer.setData("scheduleId", scheduleId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e: React.DragEvent, targetDay: number, targetSlot: string) => {
    e.preventDefault();
    if (offDays.includes(targetDay)) {
      toast.error("Cannot move to an off-day.");
      return;
    }

    const scheduleId = e.dataTransfer.getData("scheduleId");
    if (!scheduleId) return;

    const res = await updateStudentSchedule(scheduleId, workspaceId, targetSlot, targetDay);
    if (res.success) {
      toast.success("Student moved successfully");
      fetchData();
    } else {
      toast.error(res.error);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading schedule...</div>;
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const slots = config?.slots || [];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Practical Schedule Configuration</h3>
          <p className="text-sm text-slate-500 font-medium">Manage your weekly routine for practical classes</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Button onClick={() => setIsViewingCurrentBatch(true)} variant="outline" className="h-12 px-6 font-bold rounded-xl flex-1 sm:flex-none border-2 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20">
            <Users className="w-4 h-4 mr-2" /> Current Batch
          </Button>
          <Button onClick={() => setIsConfiguring(true)} variant="outline" className="h-12 px-6 font-bold rounded-xl flex-1 sm:flex-none border-2">
            <Settings className="w-4 h-4 mr-2" /> Configure
          </Button>
          <Button onClick={() => setIsAddingSlot(true)} className="h-12 px-6 font-bold rounded-xl flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <Clock className="w-4 h-4 mr-2" /> Add Time Slot
          </Button>
        </div>
      </div>

      {/* Weekly Grid (Transposed: Days = Columns, Slots = Rows) */}
      {slots.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No time slots yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first time slot to start organizing your weekly practical classes.</p>
          <Button onClick={() => setIsAddingSlot(true)} className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 shadow-lg shadow-indigo-500/25">
            Create Time Slot
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/40">
          
          {/* Top Scroll Navigation & Search */}
          <div className="flex items-center justify-between p-2 px-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <div className="relative w-64 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search student by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setSearchQuery("") }}
                className="pl-9 pr-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 rounded-xl"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {searchQuery.trim() !== "" && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Search Results</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                    {(() => {
                      const lowerQuery = searchQuery.toLowerCase().trim();
                      const matchedSchedules = schedules.filter(s => s.student?.fullName?.toLowerCase().includes(lowerQuery));
                      
                      if (matchedSchedules.length === 0) {
                        return (
                          <div className="p-8 text-center text-sm text-slate-500 font-medium">
                            No students found matching "{searchQuery}"
                          </div>
                        );
                      }
                      
                      const studentGroups = matchedSchedules.reduce((acc, schedule) => {
                        const studentId = schedule.student?.id || schedule.studentId;
                        if (!acc[studentId]) {
                          acc[studentId] = { name: schedule.student?.fullName || "Unknown", schedules: [] };
                        }
                        acc[studentId].schedules.push(schedule);
                        return acc;
                      }, {} as Record<string, any>);

                      return Object.values(studentGroups).map((group: any) => (
                        <div key={group.name} className="mb-2 last:mb-0 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">{group.name}</div>
                          <div className="space-y-2">
                            {group.schedules.map((s: any) => {
                              const slot = config?.slots?.find((slot: any) => slot.id === s.slotId);
                              return (
                                <div key={s.id} className="text-xs flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{DAYS[s.dayOfWeek]}</span>
                                  </div>
                                  <span className="font-medium text-slate-600 dark:text-slate-300">
                                    {slot ? `${slot.startTime} - ${slot.endTime}` : 'Unknown time'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={scrollLeft} className="h-8 w-8 p-0 rounded-full border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={scrollRight} className="h-8 w-8 p-0 rounded-full border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar" ref={scrollContainerRef}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-30 shadow-sm">
                <tr className="bg-slate-50 dark:bg-slate-800/90 backdrop-blur-sm">
                  <th className="p-4 border-b border-r border-slate-200 dark:border-slate-800 text-sm font-bold w-48 sticky left-0 top-0 bg-slate-50 dark:bg-slate-800 z-40 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2 text-slate-500 uppercase tracking-widest text-[10px]">
                      Days
                    </div>
                  </th>
                  {slots.map((slot: any) => (
                    <th key={slot.id} className="group p-4 border-b border-r border-slate-200 dark:border-slate-800 text-center relative min-w-[280px]">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{slot.startTime} - {slot.endTime}</span>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          Capacity: {capacity}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 opacity-0 group-hover:opacity-100 bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-md transition-all duration-200"
                        title="Delete Time Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dayIndex) => {
                  const isOffDay = offDays.includes(dayIndex);
                  return (
                    <tr key={dayIndex}>
                      {/* Row Header (Day) */}
                      <td className={cn(
                        "p-4 border-b border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] align-middle",
                        isOffDay ? "bg-slate-100 dark:bg-slate-800/80" : ""
                      )}>
                        <div className="flex flex-col">
                          <span className={cn(
                            "font-black text-base",
                            isOffDay ? "text-slate-400" : "text-slate-900 dark:text-white"
                          )}>
                            {day}
                          </span>
                          {isOffDay && (
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 opacity-70 bg-slate-200 dark:bg-slate-700/50 py-0.5 px-2 rounded-full inline-block w-fit">
                              Off Day
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Time Slot Cells */}
                      {slots.map((slot: any) => {
                        const cellSchedules = scheduleMap.get(`${dayIndex}-${slot.id}`) || [];
                        const isFull = cellSchedules.length >= capacity;

                        if (isOffDay) {
                          return (
                            <td 
                              key={slot.id} 
                              className="p-2 border-b border-r border-slate-200 dark:border-slate-800 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] bg-slate-50 dark:bg-slate-800/30 opacity-60"
                            >
                              <div className="flex items-center justify-center h-full min-h-[120px] text-slate-300 dark:text-slate-700">
                                <X className="w-8 h-8 opacity-20" />
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td 
                            key={slot.id}
                            className="p-3 border-b border-r border-slate-200 dark:border-slate-800 align-top bg-white dark:bg-slate-900 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, dayIndex, slot.id)}
                          >
                            <div className="flex flex-col gap-2 min-h-[120px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Enrolled: {cellSchedules.length}/{capacity}
                                </span>
                              </div>
                              
                              {cellSchedules.map((schedule, idx) => (
                                <div 
                                  key={schedule.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, schedule.id)}
                                  className="group flex items-center justify-between p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold cursor-move border border-red-100 dark:border-red-500/20 hover:shadow-sm transition-all"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <GripVertical className="w-3.5 h-3.5 opacity-40 shrink-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="w-4 h-4 flex items-center justify-center shrink-0 text-red-500 dark:text-red-400 text-[10px] font-black">
                                      {idx + 1}.
                                    </span>
                                    <span className="truncate">{schedule.student.fullName}</span>
                                  </div>
                                  <button 
                                    onClick={() => setDeleteConfirmScheduleId(schedule.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors shrink-0"
                                    title="Remove Student"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              
                              {!isFull && (
                                <button 
                                  onClick={() => {
                                    setSelectedDay(dayIndex);
                                    setSelectedSlot(slot.id);
                                    setIsAddingStudent(true);
                                  }}
                                  className="mt-auto w-full flex items-center justify-center p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 border-dotted hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Student
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Scroll Navigation */}
          <div className="flex items-center justify-end p-2 px-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 hidden md:flex">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={scrollLeft} className="h-8 w-8 p-0 rounded-full border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={scrollRight} className="h-8 w-8 p-0 rounded-full border-slate-300 hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal - Premium Design */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white dark:bg-slate-950">
          <div className="relative pt-10 pb-8 px-8 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-xl border border-white/20 mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Configuration</h2>
              <p className="text-slate-300 font-medium text-sm mt-1">
                Set global limits and weekly off-days.
              </p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Capacity Per Time Slot</label>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Students per slot:</span>
                <Input 
                  type="number"
                  min={1}
                  max={100}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  className="h-14 flex-1 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-black text-2xl text-center focus-visible:ring-slate-800 focus-visible:border-slate-800 transition-all px-4"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Weekly Off-Days</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {DAYS.map((day, idx) => {
                  const isOff = offDays.includes(idx);
                  return (
                    <label 
                      key={idx} 
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all",
                        isOff 
                          ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400" 
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      )}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                        checked={isOff}
                        onChange={() => toggleOffDay(idx)}
                      />
                      <span className="font-bold text-xs truncate">{day}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsConfiguring(false)}
                className="flex-1 h-14 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="flex-1 h-14 rounded-2xl font-black bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
              >
                {isSavingConfig ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Modal - Premium Redesign */}
      <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white dark:bg-slate-950">
          <div className="relative pt-10 pb-8 px-8 bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-xl border border-white/20 mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Assign Student</h2>
              <p className="text-emerald-50 font-medium text-sm mt-1">
                Add a student to {selectedDay !== null && DAYS[selectedDay]}'s practical class.
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Enrollment Number</label>
              <Input 
                autoFocus
                placeholder="e.g. WB-001-2026-..." 
                value={enrollmentNo}
                onChange={e => setEnrollmentNo(e.target.value)}
                className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-lg focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all px-5"
              />
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-500/20 text-center">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                You can drag and drop this student to a different time slot later.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingStudent(false)}
                className="flex-1 h-14 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent}
                disabled={!enrollmentNo}
                className="flex-1 h-14 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Slot Modal - Premium Redesign */}
      <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white dark:bg-slate-950">
          <div className="relative pt-10 pb-8 px-8 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-xl border border-white/20 mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Create Time Slot</h2>
              <p className="text-indigo-100 font-medium text-sm mt-1">
                Define a new practical schedule block
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Start Time</label>
                <Input 
                  type="time" 
                  value={newSlotStart}
                  onChange={e => setNewSlotStart(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-lg focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">End Time</label>
                <Input 
                  type="time" 
                  value={newSlotEnd}
                  onChange={e => setNewSlotEnd(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-lg focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-center"
                />
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/20 text-center">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                This will create a new row in your weekly grid for all 7 days.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingSlot(false)}
                className="flex-1 h-14 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddSlot}
                disabled={!newSlotStart || !newSlotEnd}
                className="flex-1 h-14 rounded-2xl font-black bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
              >
                Save Slot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmScheduleId} onOpenChange={(open) => !open && setDeleteConfirmScheduleId(null)}>
        <DialogContent className="sm:max-w-sm rounded-[2rem] p-0 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-2xl bg-white dark:bg-slate-950">
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Remove Student?</h2>
            <p className="text-slate-500 font-medium text-sm">
              Are you sure you want to remove this student from the time slot? They will lose their reservation.
            </p>
            <div className="flex w-full gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmScheduleId(null)}
                className="flex-1 h-12 rounded-xl font-bold"
              >
                Keep
              </Button>
              <Button 
                onClick={handleConfirmRemoveStudent}
                className="flex-1 h-12 rounded-xl font-black bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
              >
                Remove
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Current Batch Modal */}
      <Dialog open={isViewingCurrentBatch} onOpenChange={setIsViewingCurrentBatch}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-0 rounded-[2rem] shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
                  <Users className="w-8 h-8 opacity-80" />
                  Current Batch
                </h2>
                <p className="text-emerald-50 font-medium">
                  {DAYS[currentDay]} • {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {displaySlot && (
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Active Slot</div>
                  <div className="text-xl font-black bg-white/20 px-4 py-1.5 rounded-xl border border-white/20">
                    {displaySlot.startTime} - {displaySlot.endTime}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8">
            {offDays.includes(currentDay) ? (
              <div className="text-center py-12">
                <X className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">Today is an Off-Day</h3>
                <p className="text-slate-500 mt-2">No practical classes are scheduled for today.</p>
              </div>
            ) : !displaySlot ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">No Active Slot Right Now</h3>
                <p className="text-slate-500 mt-2">There are no practical batches running at this exact time.</p>
              </div>
            ) : activeSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-700 dark:text-slate-200">No Students Enrolled</h3>
                <p className="text-slate-500 mt-2">This slot is active, but no students are currently assigned to it.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg">Enrolled Students</h3>
                  <span className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    Total: {activeSchedules.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {activeSchedules.map((schedule, idx) => (
                    <div key={schedule.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-lg text-sm font-black">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{schedule.student.fullName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
