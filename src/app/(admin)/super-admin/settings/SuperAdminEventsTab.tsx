"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Trash2, Edit2, CheckCircle2, Image as ImageIcon, Video, Users, ListTodo, Images, LayoutDashboard, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { getAllEvents, createEvent, updateEvent, deleteEvent } from "@/app/actions/events";
import { getWorkspaces } from "@/app/actions/workspaces";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "basic", label: "Basic Info", icon: LayoutDashboard, desc: "Title, Date" },
  { id: "media", label: "Media & Bio", icon: Video, desc: "Banner, Video" },
  { id: "guests", label: "Special Guests", icon: Users, desc: "Speakers" },
  { id: "schedule", label: "Itinerary", icon: ListTodo, desc: "Event Timeline" },
  { id: "gallery", label: "Photo Gallery", icon: Images, desc: "Event Memories" },
];

export function SuperAdminEventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    location: "",
    image: "",
    videoUrl: "",
    category: "",
    hostName: "",
    isActive: true,
    isFeatured: false,
    guests: [],
    programDetails: [],
    galleryImages: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, workspacesRes] = await Promise.all([
        getAllEvents(),
        getWorkspaces()
      ]);
      
      if (eventsRes.success) setEvents(eventsRes.events || []);
      if (workspacesRes.success) setWorkspaces(workspacesRes.data || []);
      
    } catch (error) {
      toast.error("Failed to load events data");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setActiveTab("basic");
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      location: "",
      image: "",
      videoUrl: "",
      category: "",
      hostName: "",
      isActive: true,
      isFeatured: false,
      guests: [],
      programDetails: [],
      galleryImages: []
    });
    setIsCreatingCategory(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setActiveTab("basic");
    let parsedGuests = [];
    let parsedProgram = [];
    let parsedGallery = [];

    try { parsedGuests = typeof event.guests === 'string' ? JSON.parse(event.guests) : (event.guests || []); } catch(e){}
    try { parsedProgram = typeof event.programDetails === 'string' ? JSON.parse(event.programDetails) : (event.programDetails || []); } catch(e){}
    try { parsedGallery = typeof event.galleryImages === 'string' ? JSON.parse(event.galleryImages) : (event.galleryImages || []); } catch(e){}

    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time || "",
      location: event.location || "",
      image: event.image || "",
      videoUrl: event.videoUrl || "",
      category: event.category || "",
      hostName: event.hostName || "",
      isActive: event.isActive ?? true,
      isFeatured: event.isFeatured ?? false,
      guests: parsedGuests,
      programDetails: parsedProgram,
      galleryImages: parsedGallery
    });
    setIsCreatingCategory(false);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Title and date are required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        guests: formData.guests,
        programDetails: formData.programDetails,
        galleryImages: formData.galleryImages,
      };

      if (editingId) {
        const res = await updateEvent(editingId, payload);
        if (res.success) {
          toast.success("Event updated successfully");
          loadData();
          setIsDialogOpen(false);
        } else {
          toast.error(res.error || "Failed to update event");
        }
      } else {
        const res = await createEvent(payload);
        if (res.success) {
          toast.success("Event created successfully");
          loadData();
          setIsDialogOpen(false);
        } else {
          toast.error(res.error || "Failed to create event");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (event: any) => {
    setEventToDelete(event);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      const res = await deleteEvent(eventToDelete.id);
      if (res.success) {
        toast.success("Event deleted");
        loadData();
      } else {
        toast.error(res.error || "Failed to delete event");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setEventToDelete(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Events Management</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Manage platform events, guests, schedules, and photo galleries.</p>
        </div>
        <Button onClick={openCreateDialog} className="h-8 sm:h-9 px-3.5 gap-1.5 rounded-lg text-xs font-semibold bg-primary text-white shadow-xs hover:bg-primary/90 transition-all">
          <Plus className="h-3.5 w-3.5" /> Create Event
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div></div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No events found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">Start by creating your first event to showcase on the global events page.</p>
            <Button onClick={openCreateDialog} variant="outline" className="h-8 text-xs rounded-lg font-semibold mt-2">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Event
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-2.5 px-3 sm:px-4">Event Name</TableHead>
                <TableHead className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-2.5 px-3">Date & Time</TableHead>
                <TableHead className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-2.5 px-3">Host Name</TableHead>
                <TableHead className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-2.5 px-3">Status</TableHead>
                <TableHead className="text-right text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-2.5 px-3 sm:px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {events.map((event) => {
                const isPast = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
                return (
                  <TableRow key={event.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all border-none">
                    <TableCell className="py-2.5 sm:py-3 px-3 sm:px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white max-w-[200px] sm:max-w-[300px] truncate" title={event.title}>{event.title}</span>
                        <span className="text-[10px] font-medium text-slate-500 mt-0.5 truncate max-w-[200px]">{event.category || "General"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 sm:py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary/60" /> {new Date(event.date).toLocaleDateString('en-GB')}
                        </span>
                        {event.time && <span className="text-[10px] text-muted-foreground ml-5">{event.time}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 sm:py-3 px-3">
                      <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md max-w-[150px] sm:max-w-[200px] truncate inline-block align-middle" title={event.hostName || "Global Event"}>
                        {event.hostName || "Global Event"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 sm:py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {event.isActive ? (
                          <Badge variant="default" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-emerald-500/10 text-emerald-600">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none opacity-80">Inactive</Badge>
                        )}
                        {isPast ? (
                          <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-slate-100 dark:bg-slate-800 text-slate-500">Past</Badge>
                        ) : (
                          <Badge variant="default" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-blue-500/10 text-blue-600">Upcoming</Badge>
                        )}
                        {event.isFeatured && (
                          <Badge variant="default" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-amber-500/10 text-amber-600">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-2.5 sm:py-3 px-3 sm:px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(event)} className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[88vh] p-0 overflow-hidden rounded-2xl flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogTitle className="sr-only">{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
          
          {/* Header */}
          <div className="flex-none flex items-center justify-between p-3.5 sm:px-5 sm:py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 gap-2">
            <div className="flex flex-col">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">{editingId ? "Edit Event" : "Create Event"}</h2>
              <span className="text-xs text-muted-foreground hidden sm:block">Setup your event details step by step.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-medium">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-white shadow-xs">
                {isSaving ? "Saving..." : (editingId ? "Save Changes" : "Create Event")}
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-52 flex-none bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 overflow-y-auto hidden md:block space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 text-left p-2.5 rounded-lg transition-all text-xs font-medium relative overflow-hidden",
                      isActive 
                        ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-md transition-colors shrink-0",
                      isActive ? "bg-primary text-white shadow-xs" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}>
                      <tab.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{tab.label}</span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{tab.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Tab Selector */}
            <div className="md:hidden flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 flex overflow-x-auto gap-1.5 no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5",
                    activeTab === tab.id ? "bg-primary text-white font-semibold" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 relative bg-slate-50/50 dark:bg-slate-950/50">
              <div className="max-w-2xl mx-auto space-y-4">
                
                {activeTab === "basic" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">Essential Information</h3>
                        <p className="text-xs text-muted-foreground mb-4">The core details that identify your event.</p>
                        
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Event Title <span className="text-rose-500">*</span></Label>
                            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium" placeholder="e.g. Annual Tech Summit 2026" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Date <span className="text-rose-500">*</span></Label>
                              <div className="relative">
                                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Time</Label>
                              <div className="relative">
                                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Location / Venue</Label>
                              <div className="relative">
                                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium" placeholder="e.g. Grand Auditorium" />
                              </div>
                            </div>
                            <div className="space-y-1 relative">
                              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Category</Label>
                              {!isCreatingCategory ? (
                                <Select 
                                  value={formData.category} 
                                  onValueChange={(val) => {
                                    if (val === "CREATE_NEW") {
                                      setIsCreatingCategory(true);
                                      setFormData({ ...formData, category: "" });
                                    } else {
                                      setFormData({ ...formData, category: val });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                                    {Array.from(new Set(events.map(e => e.category).filter(Boolean))).map((cat: any) => (
                                      <SelectItem key={cat} value={cat} className="text-xs rounded-lg cursor-pointer font-medium">{cat}</SelectItem>
                                    ))}
                                    <SelectItem value="CREATE_NEW" className="text-xs rounded-lg cursor-pointer text-primary font-bold bg-primary/5 mt-1 border-t border-primary/10">
                                      + Create New Category
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Input 
                                    autoFocus
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Enter new category name..."
                                    className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium flex-1"
                                  />
                                  <Button 
                                    type="button"
                                    variant="ghost" 
                                    onClick={() => {
                                      setIsCreatingCategory(false);
                                      if (!Array.from(new Set(events.map(e => e.category).filter(Boolean))).includes(formData.category)) {
                                        setFormData({ ...formData, category: "" });
                                      }
                                    }}
                                    className="h-8 sm:h-9 px-2.5 rounded-lg text-xs text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Host Name</Label>
                            <Input value={formData.hostName} onChange={e => setFormData({...formData, hostName: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium" placeholder="e.g. Main Institute, John Doe" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer group" onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">Public Status</span>
                          <span className="text-[10px] text-muted-foreground">Visible on public pages</span>
                        </div>
                        <Switch checked={formData.isActive} className="scale-75" />
                      </div>
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between cursor-pointer group" onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-amber-500">Featured Event</span>
                          <span className="text-[10px] text-muted-foreground">Show as big hero banner</span>
                        </div>
                        <Switch checked={formData.isFeatured} className="scale-75" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">Media & Bio</h3>
                        <p className="text-xs text-muted-foreground mb-4">Visuals and detailed description to attract attendees.</p>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Main Banner Image</Label>
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950">
                              <ImageUpload 
                                value={formData.image || ""} 
                                onChange={(url) => setFormData({...formData, image: url})} 
                                label="Upload Event Banner" 
                                folder="events/banners" 
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">YouTube Video URL</Label>
                            <div className="relative">
                              <Video className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                              <Input value={formData.videoUrl || ""} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 pl-8 pr-3 font-medium" placeholder="https://youtube.com/watch?v=..." />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Detailed Description</Label>
                            <Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[140px] text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-3 font-normal leading-relaxed resize-y" placeholder="Write a compelling, detailed description for this event..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "guests" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Special Guests</h3>
                        <p className="text-xs text-muted-foreground">VIPs, speakers, and performers.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, guests: [...formData.guests, { name: "", role: "", image: "" }]})} variant="outline" className="h-8 px-3 rounded-lg text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Guest
                      </Button>
                    </div>

                    {formData.guests.map((guest: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3.5 relative group">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" onClick={() => setFormData({...formData, guests: formData.guests.filter((_:any, i:number) => i !== idx)})}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        
                        <div className="w-full sm:w-28 aspect-square shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                          <ImageUpload 
                            value={guest.image || ""} 
                            onChange={(url) => { const n = [...formData.guests]; n[idx].image = url; setFormData({...formData, guests: n}); }} 
                            label="Photo" 
                            folder="events/guests" 
                          />
                        </div>
                        
                        <div className="flex-1 space-y-2.5 flex flex-col justify-center pr-8 sm:pr-0">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Guest Name</Label>
                            <Input value={guest.name} onChange={e => { const n = [...formData.guests]; n[idx].name = e.target.value; setFormData({...formData, guests: n}); }} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-semibold" placeholder="e.g. Dr. Jane Smith" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Role / Title</Label>
                            <Input value={guest.role} onChange={e => { const n = [...formData.guests]; n[idx].role = e.target.value; setFormData({...formData, guests: n}); }} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-3 font-medium" placeholder="e.g. Keynote Speaker" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.guests.length === 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                        <Users className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">No Guests Added</h4>
                        <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">Make your event stand out by adding special guests and speakers.</p>
                        <Button onClick={() => setFormData({...formData, guests: [...formData.guests, { name: "", role: "", image: "" }]})} variant="outline" className="h-8 text-xs rounded-lg font-semibold">
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add First Guest
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                     <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Event Itinerary</h3>
                        <p className="text-xs text-muted-foreground">Map out the timeline for your attendees.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, programDetails: [...formData.programDetails, { time: "", activity: "", speaker: "" }]})} variant="outline" className="h-8 px-3 rounded-lg text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Slot
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
                      {formData.programDetails.map((slot: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-slate-50/70 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300 shrink-0">
                            {idx + 1}
                          </span>
                          <Input value={slot.time} onChange={e => { const n = [...formData.programDetails]; n[idx].time = e.target.value; setFormData({...formData, programDetails: n}); }} className="w-28 sm:w-32 h-8 text-xs rounded-md bg-white dark:bg-slate-900 border-slate-200 font-semibold shrink-0" placeholder="09:00 AM" />
                          <Input value={slot.activity} onChange={e => { const n = [...formData.programDetails]; n[idx].activity = e.target.value; setFormData({...formData, programDetails: n}); }} className="flex-1 h-8 text-xs rounded-md bg-white dark:bg-slate-900 border-slate-200 font-medium min-w-0" placeholder="Activity (e.g. Registration)" />
                          <Input value={slot.speaker} onChange={e => { const n = [...formData.programDetails]; n[idx].speaker = e.target.value; setFormData({...formData, programDetails: n}); }} className="w-28 sm:w-36 h-8 text-xs rounded-md bg-white dark:bg-slate-900 border-slate-200 text-xs hidden sm:block shrink-0" placeholder="Speaker" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md shrink-0" onClick={() => setFormData({...formData, programDetails: formData.programDetails.filter((_:any, i:number) => i !== idx)})}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}

                      {formData.programDetails.length === 0 && (
                        <div className="text-center py-8">
                          <ListTodo className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">No Schedule Planned</h4>
                          <p className="text-xs text-muted-foreground mb-3">Add time slots to build an itinerary.</p>
                          <Button onClick={() => setFormData({...formData, programDetails: [...formData.programDetails, { time: "", activity: "", speaker: "" }]})} variant="outline" className="h-8 text-xs rounded-lg font-semibold">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add First Time Slot
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "gallery" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Photo Gallery</h3>
                        <p className="text-xs text-muted-foreground">Showcase beautiful memories.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, galleryImages: [...formData.galleryImages, ""]})} variant="outline" className="h-8 px-3 rounded-lg text-xs font-semibold">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Image Slot
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {formData.galleryImages.map((img: string, idx: number) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
                            <Button variant="ghost" size="icon" className="absolute top-3 right-3 z-10 h-7 w-7 rounded-lg bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-xs" onClick={() => setFormData({...formData, galleryImages: formData.galleryImages.filter((_:any, i:number) => i !== idx)})}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <ImageUpload 
                              value={img} 
                              onChange={(url) => { const n = [...formData.galleryImages]; n[idx] = url; setFormData({...formData, galleryImages: n}); }} 
                              label={`Gallery Image ${idx + 1}`} 
                              folder="events/gallery" 
                            />
                          </div>
                        ))}
                      </div>

                      {formData.galleryImages.length === 0 && (
                        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <Images className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">No Images Yet</h4>
                          <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">Upload engaging photos to make this event stand out.</p>
                          <Button onClick={() => setFormData({...formData, galleryImages: [...formData.galleryImages, ""]})} variant="outline" className="h-8 text-xs rounded-lg font-semibold">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add First Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog 
        open={!!eventToDelete} 
        onOpenChange={(open) => !open && setEventToDelete(null)}
        title="Delete Event"
        description={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{eventToDelete?.title}</strong>? This action cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        destructive={true}
      />
    </div>
  );
}
