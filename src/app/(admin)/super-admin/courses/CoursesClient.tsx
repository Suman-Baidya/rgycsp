"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, Tags } from "lucide-react";
import { getGlobalCourses, deleteGlobalCourse, updateGlobalCourse } from "@/app/actions/globalCourse";
import { getGlobalCourseGroups } from "@/app/actions/globalCourseGroup";
import { toast } from "sonner";
import AdminCourseFormModal from "./AdminCourseFormModal";
import ManageGroupsModal from "./ManageGroupsModal";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";

export default function CoursesClient({ initialData, initialGroups = [] }: { initialData: any, initialGroups?: any[] }) {
  const [courses, setCourses] = useState(initialData.courses);
  const [total, setTotal] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseGroups, setCourseGroups] = useState<any[]>(initialGroups);

  const fetchGroups = useCallback(async () => {
    const res = await getGlobalCourseGroups();
    if (res.success && res.groups) {
      setCourseGroups(res.groups);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getGlobalCourses(search, group, page, 10);
      setCourses(res.courses);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }, [search, group, page]);

  const isMounted = React.useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchGroups(); // always get freshest groups on load
      return;
    }
    const timeout = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timeout);
  }, [search, group, page, fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await deleteGlobalCourse(id);
      if (res.success) {
        toast.success("Course deleted successfully");
        fetchCourses();
      } else {
        toast.error(res.error || "Failed to delete course");
      }
    } catch (e) {
      toast.error("Failed to delete course");
    }
  };

  const handleToggleActive = async (course: any) => {
    try {
      const res = await updateGlobalCourse(course.id, { isActive: !course.isActive });
      if (res.success) {
        toast.success(`Course ${!course.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchCourses();
      } else {
        toast.error(res.error || "Failed to update course status");
      }
    } catch (e) {
      toast.error("Failed to update course status");
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      <AdminPageHeader 
        title="Global Courses" 
        description="Manage platform-wide courses and syllabus catalog."
      >
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsManageGroupsOpen(true)} variant="outline" className="h-11 px-6 rounded-xl gap-2 font-bold border-2">
            <Tags className="h-4 w-4" />
            Manage Categories
          </Button>
          <Button onClick={openAddModal} className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-white">
            <Plus className="h-5 w-5" />
            Add Course
          </Button>
        </div>
      </AdminPageHeader>

      <Card className="rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/60 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search courses by name..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 h-12 rounded-2xl border-2 border-slate-200 focus-visible:border-primary"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={group} onValueChange={(val) => { setGroup(val as string); setPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-200 capitalize">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Categories</SelectItem>
                {courseGroups.filter(g => g.isActive).map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Top Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-b border-border/50 flex items-center justify-between bg-white dark:bg-slate-950">
            <span className="text-sm font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" size="sm"
                disabled={page === 1 || isLoading} 
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border-2 h-9 px-3 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button 
                variant="outline" size="sm"
                disabled={page === totalPages || isLoading} 
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border-2 h-9 px-3 flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/80 text-muted-foreground font-bold border-b">
                <tr>
                  <th className="px-6 py-4 rounded-tl-[2rem]">Banner</th>
                  <th className="px-6 py-4">Course Info</th>
                  <th className="px-6 py-4">Group</th>
                  <th className="px-6 py-4">Duration & Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right rounded-tr-[2rem]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">Loading courses...</td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">No courses found matching your criteria.</td>
                  </tr>
                ) : (
                  courses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="h-12 w-20 relative rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border">
                          {course.banner ? (
                            <Image src={course.banner} alt={course.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground text-base max-w-[250px] truncate">{course.name}</p>
                        <p className="text-xs text-muted-foreground">Short: {course.short || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary uppercase">
                          {course.groupId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-foreground">{course.duration}</p>
                        <p className="text-xs text-muted-foreground">{course.priceDisplay}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={course.isActive} 
                            onCheckedChange={() => handleToggleActive(course)}
                          />
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${course.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {course.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(course)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-sm font-semibold text-slate-500">
                Showing {courses.length} courses (Total: {total})
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" size="sm"
                  disabled={page === 1 || isLoading} 
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-lg border-2 h-9 px-3 flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button 
                  variant="outline" size="sm"
                  disabled={page === totalPages || isLoading} 
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-lg border-2 h-9 px-3 flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminCourseFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        course={editingCourse}
        onSuccess={fetchCourses}
        groups={courseGroups}
      />

      <ManageGroupsModal
        isOpen={isManageGroupsOpen}
        onClose={() => setIsManageGroupsOpen(false)}
        onUpdate={() => { fetchGroups(); fetchCourses(); }}
      />
    </div>
  );
}
// refresh
