"use client";

import React, { useState } from "react";
import { Plus, Search, MoreVertical, UserPlus, Phone, Mail, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStudent } from "@/app/actions/students";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function StudentList({ 
  workspaceId, 
  initialStudents,
  batches 
}: { 
  workspaceId: string; 
  initialStudents: any[];
  batches: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    enrollmentNo: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: "",
    parentName: "",
    parentPhone: "",
    batchId: "",
  });

  const filteredStudents = initialStudents.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createStudent(workspaceId, formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Student enrolled successfully!");
      setOpen(false);
      router.refresh();
      setFormData({
        fullName: "",
        enrollmentNo: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: "",
        parentName: "",
        parentPhone: "",
        batchId: "",
      });
    } else {
      toast.error(result.error || "Failed to enroll student");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students or enrollment no..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Enroll New Student
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enroll New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Student Name" />
                </div>
                <div className="space-y-2">
                  <Label>Enrollment No</Label>
                  <Input required value={formData.enrollmentNo} onChange={e => setFormData({...formData, enrollmentNo: e.target.value})} placeholder="STU-XXXX" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parent Name</Label>
                  <Input value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} placeholder="Father/Mother Name" />
                </div>
                <div className="space-y-2">
                  <Label>Parent Phone</Label>
                  <Input value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assign Batch</Label>
                <Select value={formData.batchId} onValueChange={val => setFormData({...formData, batchId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                    ))}
                    {batches.length === 0 && <SelectItem value="none" disabled>No batches found</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
                {isSubmitting ? "Enrolling..." : "Complete Enrollment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Enrollment No</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {student.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{student.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
                      {student.enrollmentNo}
                    </code>
                  </TableCell>
                  <TableCell>
                    {student.batch ? (
                      <Badge variant="secondary" className="font-normal">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {student.batch.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No Batch</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      {student.phone && (
                        <div className="flex items-center gap-1.5" title="Student Phone">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="text-xs">{student.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No students found. Enroll your first student to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
