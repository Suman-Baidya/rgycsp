"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Tags,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
} from "lucide-react";
import {
  getGlobalCourses,
  deleteGlobalCourse,
  updateGlobalCourse,
  getGlobalCourseStats,
} from "@/app/actions/globalCourse";
import { getGlobalCourseGroups } from "@/app/actions/globalCourseGroup";
import { toast } from "sonner";
import AdminCourseFormModal from "./AdminCourseFormModal";
import ManageGroupsModal from "./ManageGroupsModal";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

export default function CoursesClient({
  initialData,
  initialGroups = [],
  initialStats,
}: {
  initialData: any;
  initialGroups?: any[];
  initialStats?: {
    total: number;
    active: number;
    inactive: number;
    categories: number;
  };
}) {
  const [courses, setCourses] = useState(initialData.courses);
  const [total, setTotal] = useState(initialData.total);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [stats, setStats] = useState(
    initialStats || {
      total: initialData.total || 0,
      active: 0,
      inactive: 0,
      categories: initialGroups.length || 0,
    }
  );

  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageGroupsOpen, setIsManageGroupsOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [courseGroups, setCourseGroups] = useState<any[]>(initialGroups);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getGlobalCourseStats();
      if (res) setStats(res);
    } catch {
      // ignore
    }
  }, []);

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
      fetchGroups();
      fetchStats();
      return;
    }
    const timeout = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timeout);
  }, [search, group, page, fetchCourses, fetchGroups, fetchStats]);

  const handleDeleteClick = (course: any) => {
    setCourseToDelete(course);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      const res = await deleteGlobalCourse(courseToDelete.id);
      if (res.success) {
        toast.success("Course deleted successfully");
        fetchCourses();
        fetchStats();
      } else {
        toast.error(res.error || "Failed to delete course");
      }
    } catch (e) {
      toast.error("Failed to delete course");
    } finally {
      setCourseToDelete(null);
    }
  };

  const handleToggleActive = async (course: any) => {
    try {
      const res = await updateGlobalCourse(course.id, { isActive: !course.isActive });
      if (res.success) {
        toast.success(`Course ${!course.isActive ? "activated" : "deactivated"} successfully`);
        fetchCourses();
        fetchStats();
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
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader
        title="Global Courses"
        description="Manage platform-wide courses, syllabus catalogs, and category classifications."
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsManageGroupsOpen(true)}
            variant="outline"
            className="h-8 sm:h-9 px-3 rounded-lg gap-1.5 font-semibold text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Tags className="h-3.5 w-3.5" />
            Manage Categories
          </Button>
          <Button
            onClick={openAddModal}
            className="h-8 sm:h-9 px-3.5 rounded-lg gap-1.5 shadow-sm shadow-primary/20 bg-primary font-semibold text-xs text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Course
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Courses */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Total Courses
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stats.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <Layers className="w-3 h-3 text-blue-500" /> Catalog Scope:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Platform-wide</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Courses */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Active Courses
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stats.active.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Admissions:
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">Available</span>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Courses */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Inactive / Draft
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stats.inactive.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="text-[10px] text-slate-400">Visibility:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Archived/Hidden</span>
            </div>
          </CardContent>
        </Card>

        {/* Categories Count */}
        <Card
          onClick={() => setIsManageGroupsOpen(true)}
          className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 cursor-pointer hover:border-purple-500/30 transition-all"
        >
          <CardContent className="p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                <Tags className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Categories
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {courseGroups.length.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="text-[10px] text-slate-400">Action:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">Manage Categories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card & Toolbar */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-[300px] group">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <Input
                placeholder="Search courses by name or code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg h-8 sm:h-9 font-normal text-[11px] sm:text-xs transition-all focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <Select
                value={group}
                onValueChange={(val) => {
                  setGroup(val as string);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-8 sm:h-9 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter className="h-3 w-3 text-slate-400 shrink-0" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-200 dark:border-slate-700 shadow-md">
                  <SelectItem value="all" className="rounded-md text-xs">
                    All Categories
                  </SelectItem>
                  {courseGroups
                    .filter((g) => g.isActive)
                    .map((g) => (
                      <SelectItem key={g.value} value={g.value} className="rounded-md text-xs">
                        {g.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60 h-8 sm:h-9 shrink-0">
                <BookOpen className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total: <span className="text-slate-900 dark:text-white">{total}</span>
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[80px]">
                    Banner
                  </TableHead>
                  <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[220px]">
                    Course Info
                  </TableHead>
                  <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </TableHead>
                  <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Duration & Fee
                  </TableHead>
                  <TableHead className="py-2.5 px-3.5 sm:px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="py-2.5 px-3.5 sm:px-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-xs font-medium text-slate-500">
                      Loading courses...
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 sm:py-16">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-2.5">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        No Courses Found
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Try adjusting your search criteria or category filter.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course: any) => {
                    const borderColor = course.isActive ? "border-green-500" : "border-slate-300 dark:border-slate-700";

                    return (
                      <TableRow
                        key={course.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group relative border-l-[3px]"
                        style={{ borderLeftColor: course.isActive ? "#22c55e" : "#94a3b8" }}
                      >
                        <TableCell className="p-3 sm:p-3.5">
                          <div className="h-10 w-16 sm:h-11 sm:w-20 relative rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-sm shrink-0">
                            {course.banner ? (
                              <Image
                                src={course.banner}
                                alt={course.name}
                                fill
                                sizes="(max-width: 768px) 80px, 120px"
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="p-3 sm:p-3.5">
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                              {course.short || "COURSE"}
                            </span>
                            <span
                              className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 mt-0.5"
                              title={course.name}
                            >
                              {course.name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="p-3 sm:p-3.5">
                          <Badge className="bg-primary/10 text-primary border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider">
                            {course.groupId}
                          </Badge>
                        </TableCell>

                        <TableCell className="p-3 sm:p-3.5 whitespace-nowrap">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white">
                            {course.duration}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                            {course.priceDisplay || `₹${Number(course.price || 0).toLocaleString()}`}
                          </p>
                        </TableCell>

                        <TableCell className="p-3 sm:p-3.5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={course.isActive}
                              onCheckedChange={() => handleToggleActive(course)}
                              className="scale-90"
                            />
                            <Badge
                              className={cn(
                                "border-none rounded uppercase text-[9px] font-bold px-1.5 py-0.5 tracking-wider",
                                course.isActive
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              )}
                            >
                              {course.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="p-3 sm:p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(course)}
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                              title="Edit Course"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(course)}
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Standardized Pagination System */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-xs font-medium text-slate-500">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} courses
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-1">
                {(() => {
                  const getPageNumbers = () => {
                    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
                    if (page >= totalPages - 3)
                      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    return [1, "...", page - 1, page, page + 1, "...", totalPages];
                  };
                  return getPageNumbers().map((pNum, idx) => {
                    if (pNum === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">
                          ...
                        </span>
                      );
                    }
                    const num = pNum as number;
                    return (
                      <Button
                        key={`page-${num}`}
                        variant={page === num ? "default" : "ghost"}
                        onClick={() => setPage(num)}
                        disabled={isLoading}
                        className={cn(
                          "h-7 w-7 rounded-md font-semibold text-xs",
                          page === num ? "shadow-sm shadow-primary/20" : "text-slate-500"
                        )}
                      >
                        {num}
                      </Button>
                    );
                  });
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AdminCourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={editingCourse}
        onSuccess={() => {
          fetchCourses();
          fetchStats();
        }}
        groups={courseGroups}
      />

      <ManageGroupsModal
        isOpen={isManageGroupsOpen}
        onClose={() => setIsManageGroupsOpen(false)}
        onUpdate={() => {
          fetchGroups();
          fetchCourses();
          fetchStats();
        }}
      />

      <ConfirmDialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
        title="Delete Course"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-slate-900 dark:text-white">
              {courseToDelete?.name || courseToDelete?.title}
            </strong>
            ? This action cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete Course"
        destructive={true}
      />
    </div>
  );
}
