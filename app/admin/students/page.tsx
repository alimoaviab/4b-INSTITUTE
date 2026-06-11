"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, Download, UserPlus, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    rollNumber: "",
    cnic: "",
    name: "",
    fatherName: "",
    phone: "",
    email: "",
    program: "",
    isEligible: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/students?search=${search}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/admin/login");
        throw new Error("Failed to fetch students");
      }
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const resetForm = () => {
    setFormData({
      rollNumber: "",
      cnic: "",
      name: "",
      fatherName: "",
      phone: "",
      email: "",
      program: "",
      isEligible: true,
    });
    setEditingId(null);
  };

  const openEdit = (student: any) => {
    setFormData({
      rollNumber: student.rollNumber,
      cnic: student.cnic,
      name: student.name,
      fatherName: student.fatherName,
      phone: student.phone,
      email: student.email || "",
      program: student.program,
      isEligible: student.isEligible,
    });
    setEditingId(student._id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/students/${editingId}` : "/api/admin/students";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save student");
      }

      toast.success(editingId ? "Student updated successfully" : "Student created successfully");
      setIsDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Student deleted");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const exportCSV = () => {
    const headers = ["Roll Number", "CNIC", "Name", "Father Name", "Phone", "Program", "Eligible"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\\n"
      + students.map(s => `${s.rollNumber},${s.cnic},${s.name},${s.fatherName},${s.phone},${s.program},${s.isEligible}`).join("\\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Student Directory</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage student records, profiles, and eligibility</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={exportCSV} className="border-blue-200 text-blue-700 bg-white hover:bg-blue-50 hover:text-blue-800 flex-1 sm:flex-none shadow-sm">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow flex-1 sm:flex-none">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900">{editingId ? "Edit Student Details" : "Register New Student"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number *</Label>
                      <Input id="rollNumber" required value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} className="border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnic">CNIC / B-Form *</Label>
                      <Input id="cnic" placeholder="XXXXX-XXXXXXX-X" required value={formData.cnic} onChange={e => setFormData({...formData, cnic: e.target.value})} className="border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father Name *</Label>
                      <Input id="fatherName" required value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border-gray-300 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="program">Program *</Label>
                      <Input id="program" placeholder="e.g. BS Computer Science" required value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} className="border-gray-300 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 gap-2 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingId ? "Save Changes" : "Create Student"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-lg border-gray-200 bg-white overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <CardTitle className="text-xl font-bold hidden sm:block">All Students</CardTitle>
            <form onSubmit={handleSearch} className="flex flex-1 max-w-lg items-center gap-2">
              <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name, roll no, or CNIC..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                  />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                Search
              </Button>
              <Button type="button" variant="outline" className="shrink-0" title="Advanced Filters">
                  <Filter className="h-4 w-4" />
              </Button>
            </form>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-blue-600 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="font-medium animate-pulse">Loading directory...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center bg-gray-50">
                  <Search className="w-12 h-12 text-gray-300 mb-4" />
                  <span className="font-medium">No students found matching your criteria.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-bold text-gray-700">Roll Number</TableHead>
                        <TableHead className="font-bold text-gray-700">Name</TableHead>
                        <TableHead className="font-bold text-gray-700">CNIC</TableHead>
                        <TableHead className="font-bold text-gray-700">Program</TableHead>
                        <TableHead className="font-bold text-gray-700">Phone</TableHead>
                        <TableHead className="font-bold text-gray-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, idx) => (
                        <motion.tr 
                            key={student._id}
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            className="group hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-bold text-gray-900">{student.rollNumber}</TableCell>
                          <TableCell className="font-medium text-gray-700">{student.name}</TableCell>
                          <TableCell className="text-gray-600 font-mono text-sm">{student.cnic}</TableCell>
                          <TableCell>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {student.program}
                              </span>
                          </TableCell>
                          <TableCell className="text-gray-600">{student.phone}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(student)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(student._id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            )}
            
            {/* Pagination UI - Visual Only for Design requirement */}
            {!loading && students.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-6 bg-gray-50">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">{students.length}</span> of <span className="font-medium">{students.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <Button variant="outline" size="sm" className="rounded-l-md border-gray-300 bg-white" disabled>Previous</Button>
                                <Button variant="outline" size="sm" className="border-blue-600 bg-blue-50 text-blue-600 z-10" aria-current="page">1</Button>
                                <Button variant="outline" size="sm" className="rounded-r-md border-gray-300 bg-white" disabled>Next</Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
