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
import { getAllEvents, deleteEvent } from "@/app/actions/events";
import { getWorkspaces } from "@/app/actions/workspaces";
import { EventEditorDialog } from "@/components/events/EventEditorDialog";
import { cn } from "@/lib/utils";

export function SuperAdminEventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setIsDialogOpen(true);
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setIsDialogOpen(true);
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

      <EventEditorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={events.find((e) => e.id === editingId) || null}
        onSaveSuccess={loadData}
        isSuperAdmin={true}
        workspaces={workspaces}
        allEvents={events}
      />
      
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
