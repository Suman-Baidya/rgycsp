"use client";

import React, { useState } from "react";
import { Plus, Search, MoreVertical, BookOpen, Layers, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createCourse, createBatch } from "@/app/actions/courses";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

export default function CourseList({ 
  workspaceId, 
  initialCourses 
}: { 
  workspaceId: string; 
  initialCourses: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseOpen, setCourseOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [courseData, setCourseData] = useState({
    name: "",
    code: "",
    description: "",
    price: "",
  });

  const [batchName, setBatchName] = useState("");

  const filteredCourses = initialCourses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createCourse(workspaceId, courseData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Course created successfully!");
      setCourseOpen(false);
      router.refresh();
      setCourseData({ name: "", code: "", description: "", price: "" });
    } else {
      toast.error(result.error || "Failed to create course");
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createBatch(workspaceId, selectedCourseId, batchName);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Batch created successfully!");
      setBatchOpen(false);
      router.refresh();
      setBatchName("");
    } else {
      toast.error(result.error || "Failed to create batch");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses or codes..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
          <DialogTrigger render={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Course
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCourseSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Name</Label>
                  <Input required value={courseData.name} onChange={e => setCourseData({...courseData, name: e.target.value})} placeholder="e.g. Mathematics" />
                </div>
                <div className="space-y-2">
                  <Label>Course Code</Label>
                  <Input required value={courseData.code} onChange={e => setCourseData({...courseData, code: e.target.value})} placeholder="e.g. MATH101" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} placeholder="Brief overview of the course curriculum..." rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Base Price (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input type="number" className="pl-7" value={courseData.price} onChange={e => setCourseData({...courseData, price: e.target.value})} placeholder="0.00" />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="flex flex-col border-border/50 hover:border-primary/20 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono tracking-tight uppercase">
                  {course.code}
                </Badge>
              </div>
              <CardTitle className="mt-4 text-lg">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                {course.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> Batches</span>
                  <span className="text-foreground">{course.batches.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {course.batches.map((batch: any) => (
                    <Badge key={batch.id} variant="secondary" className="text-[10px] py-0 px-2 h-5 font-normal">
                      {batch.name}
                    </Badge>
                  ))}
                  {course.batches.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">No batches yet</span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-border/40 bg-zinc-50/50 dark:bg-white/[0.01] rounded-b-xl flex justify-between items-center">
              <div className="flex items-center gap-1 text-primary font-bold">
                <Tag className="h-3.5 w-3.5" />
                <span className="text-sm">₹{course.feeAmount.toLocaleString()}</span>
              </div>
              <Dialog open={batchOpen && selectedCourseId === course.id} onOpenChange={(val) => {
                setBatchOpen(val);
                if(val) setSelectedCourseId(course.id);
              }}>
                <DialogTrigger render={
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary">
                    <Plus className="h-3 w-3" /> Add Batch
                  </Button>
                } />
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Add Batch to {course.title}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBatchSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Batch Name</Label>
                      <Input required value={batchName} onChange={e => setBatchName(e.target.value)} placeholder="e.g. Morning Batch A" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
                      {isSubmitting ? "Adding..." : "Create Batch"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground gap-3">
          <BookOpen className="h-10 w-10 opacity-20" />
          <p>No courses found. Create your first course to begin!</p>
          <Button variant="outline" size="sm" onClick={() => setCourseOpen(true)}>Add Course</Button>
        </div>
      )}
    </div>
  );
}
