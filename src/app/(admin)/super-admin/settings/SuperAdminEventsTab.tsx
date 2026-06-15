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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const res = await deleteEvent(id);
      if (res.success) {
        toast.success("Event deleted");
        loadData();
      } else {
        toast.error(res.error || "Failed to delete event");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-8 pb-12 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events Management</h2>
          <p className="text-muted-foreground text-sm">Manage platform events, guests, schedules, and galleries.</p>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl gap-2 font-bold bg-primary text-white shadow-lg shadow-primary/20 h-11 px-6">
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Calendar className="w-16 h-16 text-slate-200 dark:text-zinc-800 mx-auto" />
            <h3 className="text-xl font-bold">No events found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">Start by creating your first event to showcase on the global events page.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
              <TableRow>
                <TableHead className="font-bold py-4">Event Name</TableHead>
                <TableHead className="font-bold">Date & Time</TableHead>
                <TableHead className="font-bold">Host Name</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const isPast = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
                return (
                  <TableRow key={event.id} className="group">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 max-w-[200px] sm:max-w-[300px] truncate" title={event.title}>{event.title}</span>
                        <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{event.category || "General"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-primary/60" /> {new Date(event.date).toLocaleDateString('en-GB')}
                        </span>
                        {event.time && <span className="text-xs text-muted-foreground ml-5">{event.time}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-lg max-w-[150px] sm:max-w-[200px] truncate inline-block align-middle" title={event.hostName || "Global Event"}>
                        {event.hostName || "Global Event"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {event.isActive ? (
                          <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 font-bold border-0">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="opacity-80 font-bold border-0">Inactive</Badge>
                        )}
                        {isPast ? (
                          <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-500 font-bold border-0">Past</Badge>
                        ) : (
                          <Badge variant="default" className="bg-blue-500/10 text-blue-600 font-bold border-0">Upcoming</Badge>
                        )}
                        {event.isFeatured && <Badge variant="default" className="bg-amber-500/10 text-amber-600 font-bold border-0">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="h-9 w-9 text-blue-500 hover:bg-blue-500/10 rounded-xl"><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="h-9 w-9 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 className="h-4 w-4" /></Button>
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
        {/* Full-screen sleek modal */}
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 overflow-hidden rounded-[2rem] flex flex-col bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl">
          <DialogTitle className="sr-only">{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
          
          {/* Header */}
          <div className="flex-none flex items-center justify-between p-4 sm:px-8 sm:py-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 z-10 gap-2">
            <div className="flex flex-col">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">{editingId ? "Edit Event" : "Create Event"}</h2>
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Setup your event details step by step.</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-medium h-10 sm:h-11 px-3 sm:px-4">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="rounded-xl font-bold bg-primary text-white h-10 sm:h-11 px-4 sm:px-8 shadow-md shadow-primary/20">
                {isSaving ? "Saving..." : (editingId ? "Save Changes" : "Create Event")}
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-none bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 p-6 overflow-y-auto hidden md:block space-y-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-4 text-left p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                      isActive 
                        ? "bg-primary/5 border border-primary/20" 
                        : "hover:bg-slate-50 dark:hover:bg-zinc-800/50 border border-transparent"
                    )}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                      isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                    )}>
                      <tab.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-sm", isActive ? "text-primary" : "text-slate-700 dark:text-slate-300")}>{tab.label}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{tab.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Mobile Tab Selector */}
            <div className="md:hidden flex-none bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 p-3 sm:p-4 flex overflow-x-auto gap-2 no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2",
                    activeTab === tab.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 relative bg-slate-50/50 dark:bg-zinc-950/50">
              <div className="max-w-3xl mx-auto">
                
                {activeTab === "basic" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 sm:space-y-8">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Essential Information</h3>
                        <p className="text-sm text-muted-foreground mb-6">The core details that identify your event.</p>
                        
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Event Title <span className="text-red-500">*</span></Label>
                            <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-5 text-lg font-medium focus-visible:ring-primary/20" placeholder="e.g. Annual Tech Summit 2026" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Date <span className="text-red-500">*</span></Label>
                              <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 pl-12 pr-5 font-medium" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Time</Label>
                              <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 pl-12 pr-5 font-medium" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Location / Venue</Label>
                              <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 pl-12 pr-5 font-medium" placeholder="e.g. Grand Auditorium" />
                              </div>
                            </div>
                            <div className="space-y-2 relative">
                              <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Category</Label>
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
                                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-5 font-medium">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-xl">
                                    {Array.from(new Set(events.map(e => e.category).filter(Boolean))).map((cat: any) => (
                                      <SelectItem key={cat} value={cat} className="rounded-lg cursor-pointer font-medium">{cat}</SelectItem>
                                    ))}
                                    <SelectItem value="CREATE_NEW" className="rounded-lg cursor-pointer text-primary font-bold bg-primary/5 mt-1 border-t border-primary/10">
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
                                    className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-5 font-medium flex-1"
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
                                    className="h-14 px-4 rounded-2xl text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Host Name</Label>
                            <Input value={formData.hostName} onChange={e => setFormData({...formData, hostName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-5 font-medium" placeholder="e.g. Google, John Doe, Main Institute" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between cursor-pointer group" onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg">Public Status</span>
                          <span className="text-xs text-muted-foreground">Visible on public pages</span>
                        </div>
                        <Switch checked={formData.isActive} />
                      </div>
                      <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between cursor-pointer group" onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-amber-500">Featured Event</span>
                          <span className="text-xs text-muted-foreground">Show as big hero banner</span>
                        </div>
                        <Switch checked={formData.isFeatured} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "media" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 sm:space-y-8">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Media & Bio</h3>
                        <p className="text-sm text-muted-foreground mb-6">Visuals and detailed description to attract attendees.</p>

                        <div className="space-y-8">
                          <div className="space-y-3">
                            <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Main Banner Image</Label>
                            <div className="rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-zinc-800 p-2 bg-slate-50 dark:bg-zinc-950">
                              <ImageUpload 
                                value={formData.image || ""} 
                                onChange={(url) => setFormData({...formData, image: url})} 
                                label="Upload Event Banner" 
                                folder="events/banners" 
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-xs uppercase font-bold text-slate-500 ml-1">YouTube Video URL</Label>
                            <div className="relative">
                              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <Input value={formData.videoUrl || ""} onChange={e => setFormData({...formData, videoUrl: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 pl-12 pr-5 font-medium" placeholder="https://youtube.com/watch?v=..." />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Detailed Description</Label>
                            <Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[250px] rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 p-6 font-medium leading-relaxed resize-y focus-visible:ring-primary/20" placeholder="Write a compelling, detailed description for this event..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "guests" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">Special Guests</h3>
                        <p className="text-sm text-muted-foreground">VIPs, speakers, and performers.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, guests: [...formData.guests, { name: "", role: "", image: "" }]})} className="rounded-xl font-bold bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800">
                        <Plus className="h-4 w-4 mr-2" /> Add Guest
                      </Button>
                    </div>

                    {formData.guests.map((guest: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-6 relative group transition-all hover:border-primary/30 hover:shadow-md">
                        <Button variant="ghost" size="icon" className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all border border-red-100 shadow-md z-10" onClick={() => setFormData({...formData, guests: formData.guests.filter((_:any, i:number) => i !== idx)})}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        
                        <div className="w-full md:w-40 aspect-square shrink-0 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
                          <ImageUpload 
                            value={guest.image || ""} 
                            onChange={(url) => { const n = [...formData.guests]; n[idx].image = url; setFormData({...formData, guests: n}); }} 
                            label="Photo" 
                            folder="events/guests" 
                          />
                        </div>
                        
                        <div className="flex-1 space-y-4 flex flex-col justify-center">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Guest Name</Label>
                            <Input value={guest.name} onChange={e => { const n = [...formData.guests]; n[idx].name = e.target.value; setFormData({...formData, guests: n}); }} className="h-14 rounded-2xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-5 font-bold text-lg" placeholder="e.g. Dr. Jane Smith" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-slate-500 ml-1">Role / Title</Label>
                            <Input value={guest.role} onChange={e => { const n = [...formData.guests]; n[idx].role = e.target.value; setFormData({...formData, guests: n}); }} className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 px-5 font-medium" placeholder="e.g. Keynote Speaker" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.guests.length === 0 && (
                      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 p-16 text-center">
                        <Users className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                        <h4 className="text-lg font-bold mb-2">No Guests Added</h4>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Make your event stand out by adding special guests and speakers.</p>
                        <Button onClick={() => setFormData({...formData, guests: [...formData.guests, { name: "", role: "", image: "" }]})} variant="outline" className="rounded-xl border-slate-200 font-bold">
                          <Plus className="h-4 w-4 mr-2" /> Add First Guest
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">Event Itinerary</h3>
                        <p className="text-sm text-muted-foreground">Map out the timeline for your attendees.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, programDetails: [...formData.programDetails, { time: "", activity: "", speaker: "" }]})} className="rounded-xl font-bold bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800">
                        <Plus className="h-4 w-4 mr-2" /> Add Slot
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 relative">
                      {formData.programDetails.length > 0 && <div className="absolute left-[38px] top-10 bottom-10 w-0.5 bg-slate-100 dark:bg-zinc-800 hidden md:block" />}
                      
                      {formData.programDetails.map((slot: any, idx: number) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 relative z-10 group">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 flex items-center justify-center font-black text-sm text-slate-500 shrink-0 hidden md:flex mt-1">
                            {idx + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 transition-all hover:border-primary/20 hover:shadow-sm">
                            <Input value={slot.time} onChange={e => { const n = [...formData.programDetails]; n[idx].time = e.target.value; setFormData({...formData, programDetails: n}); }} className="md:col-span-3 h-12 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 font-bold" placeholder="e.g. 09:00 AM" />
                            <Input value={slot.activity} onChange={e => { const n = [...formData.programDetails]; n[idx].activity = e.target.value; setFormData({...formData, programDetails: n}); }} className="md:col-span-5 h-12 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 font-medium" placeholder="Activity (e.g. Registration)" />
                            <Input value={slot.speaker} onChange={e => { const n = [...formData.programDetails]; n[idx].speaker = e.target.value; setFormData({...formData, programDetails: n}); }} className="md:col-span-3 h-12 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 text-sm" placeholder="Speaker (Optional)" />
                            <div className="md:col-span-1 flex items-center justify-center">
                              <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl w-10 h-10" onClick={() => setFormData({...formData, programDetails: formData.programDetails.filter((_:any, i:number) => i !== idx)})}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.programDetails.length === 0 && (
                        <div className="text-center py-12">
                          <ListTodo className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                          <h4 className="text-lg font-bold mb-2">No Schedule Planned</h4>
                          <p className="text-sm text-muted-foreground mb-6">Add time slots to build an itinerary.</p>
                          <Button onClick={() => setFormData({...formData, programDetails: [...formData.programDetails, { time: "", activity: "", speaker: "" }]})} variant="outline" className="rounded-xl border-slate-200 font-bold">
                            <Plus className="h-4 w-4 mr-2" /> Add First Time Slot
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "gallery" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">Photo Gallery</h3>
                        <p className="text-sm text-muted-foreground">Showcase beautiful memories.</p>
                      </div>
                      <Button onClick={() => setFormData({...formData, galleryImages: [...formData.galleryImages, ""]})} className="rounded-xl font-bold bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-slate-50 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800">
                        <Plus className="h-4 w-4 mr-2" /> Add Image Slot
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {formData.galleryImages.map((img: string, idx: number) => (
                          <div key={idx} className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-2 transition-all hover:border-primary/30 hover:shadow-md">
                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/90 text-red-500 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm" onClick={() => setFormData({...formData, galleryImages: formData.galleryImages.filter((_:any, i:number) => i !== idx)})}>
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
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                          <Images className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
                          <h4 className="text-lg font-bold mb-2">No Images Yet</h4>
                          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Upload engaging photos to make this event stand out.</p>
                          <Button onClick={() => setFormData({...formData, galleryImages: [...formData.galleryImages, ""]})} variant="outline" className="rounded-xl border-slate-200 font-bold">
                            <Plus className="h-4 w-4 mr-2" /> Add First Image
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
    </div>
  );
}
