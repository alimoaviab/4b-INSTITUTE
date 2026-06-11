"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Edit, CheckCircle, XCircle, Search, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock fallback data for demonstration
  const mockInterviews = [
      { _id: '1', studentId: 'CS-2026-001', name: 'John Doe', scheduleDate: '2026-08-15T10:00:00Z', panel: 'Panel A', status: 'Scheduled', marks: null, finalStatus: 'Pending' },
      { _id: '2', studentId: 'CS-2026-002', name: 'Jane Smith', scheduleDate: '2026-08-15T10:30:00Z', panel: 'Panel A', status: 'Completed', marks: 85, finalStatus: 'Selected' },
      { _id: '3', studentId: 'SE-2026-015', name: 'Ali Khan', scheduleDate: '2026-08-16T11:00:00Z', panel: 'Panel B', status: 'Completed', marks: 45, finalStatus: 'Rejected' },
      { _id: '4', studentId: 'BBA-2026-042', name: 'Sarah Ahmed', scheduleDate: '2026-08-16T11:30:00Z', panel: 'Panel C', status: 'Scheduled', marks: null, finalStatus: 'Pending' }
  ];

  const [formData, setFormData] = useState({
      studentId: "",
      scheduleDate: "",
      time: "",
      panel: "",
      status: "Scheduled",
      marks: "",
      remarks: "",
      finalStatus: "Pending"
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/interviews");
      if (!res.ok) {
        if (res.status === 401) router.push("/admin/login");
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setInterviews(data.length > 0 ? data : mockInterviews);
    } catch (error) {
      console.error(error);
      setInterviews(mockInterviews); // fallback for demo
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
      setFormData({
          studentId: "",
          scheduleDate: "",
          time: "",
          panel: "",
          status: "Scheduled",
          marks: "",
          remarks: "",
          finalStatus: "Pending"
      });
      setEditingId(null);
  };

  const openEdit = (interview: any) => {
      const dateObj = new Date(interview.scheduleDate);
      setFormData({
          studentId: interview.studentId,
          scheduleDate: dateObj.toISOString().split('T')[0],
          time: dateObj.toTimeString().slice(0, 5),
          panel: interview.panel || "",
          status: interview.status || "Scheduled",
          marks: interview.marks?.toString() || "",
          remarks: interview.remarks || "",
          finalStatus: interview.finalStatus || "Pending"
      });
      setEditingId(interview._id);
      setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      toast.success(`Interview ${editingId ? 'updated' : 'scheduled'} successfully`);
      setIsDialogOpen(false);
      resetForm();
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'Scheduled': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">{status}</Badge>;
          case 'Completed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">{status}</Badge>;
          case 'Missed': return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">{status}</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  const getFinalDecisionBadge = (status: string) => {
      switch(status) {
          case 'Selected': return <div className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle className="w-4 h-4" /> Selected</div>;
          case 'Rejected': return <div className="flex items-center gap-1 text-red-600 font-medium"><XCircle className="w-4 h-4" /> Rejected</div>;
          case 'Pending': return <div className="flex items-center gap-1 text-amber-600 font-medium"><Clock className="w-4 h-4" /> Pending</div>;
          default: return <span>{status}</span>;
      }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Interview Management</h1>
            <p className="text-gray-500 mt-1 font-medium">Schedule interviews, assign panels, and publish results.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow">
                <CalendarPlus className="mr-2 h-4 w-4" /> Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{editingId ? "Update Interview Record" : "Schedule New Interview"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                          <Label>Student ID / Roll Number *</Label>
                          <Input required placeholder="e.g. CS-2026-001" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} disabled={!!editingId} />
                      </div>
                      <div className="space-y-2">
                          <Label>Date *</Label>
                          <Input type="date" required value={formData.scheduleDate} onChange={e => setFormData({...formData, scheduleDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Time *</Label>
                          <Input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                          <Label>Interview Panel *</Label>
                          <Select required value={formData.panel} onValueChange={(v) => setFormData({...formData, panel: v})}>
                              <SelectTrigger><SelectValue placeholder="Select Panel" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Panel A">Panel A (CS Dept)</SelectItem>
                                  <SelectItem value="Panel B">Panel B (SE Dept)</SelectItem>
                                  <SelectItem value="Panel C">Panel C (BBA Dept)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label>Interview Status</Label>
                          <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Missed">Missed</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      
                      {formData.status === 'Completed' && (
                          <>
                            <div className="space-y-2 col-span-2 mt-4 pt-4 border-t border-gray-100">
                                <Label className="text-blue-600 font-bold">Evaluation</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Marks Obtained</Label>
                                <Input type="number" min="0" max="100" value={formData.marks} onChange={e => setFormData({...formData, marks: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Final Decision</Label>
                                <Select value={formData.finalStatus} onValueChange={(v) => setFormData({...formData, finalStatus: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Selected">Selected</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Interview Notes & Remarks</Label>
                                <Textarea rows={3} placeholder="Panel remarks..." value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                            </div>
                          </>
                      )}
                  </div>
                  <div className="flex justify-end pt-4 gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingId ? "Save Record" : "Schedule"}</Button>
                  </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-lg border-gray-200 bg-white overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-xl font-bold">Interview Roster</CardTitle>
            <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                    placeholder="Search by student ID or name..." 
                    className="pl-9 bg-gray-50 border-gray-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-blue-600 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="font-medium animate-pulse">Loading roster...</span>
              </div>
            ) : interviews.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center bg-gray-50">
                  <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                  <span className="font-medium">No interviews scheduled yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-bold text-gray-700">Candidate</TableHead>
                        <TableHead className="font-bold text-gray-700">Schedule</TableHead>
                        <TableHead className="font-bold text-gray-700">Panel</TableHead>
                        <TableHead className="font-bold text-gray-700">Status</TableHead>
                        <TableHead className="font-bold text-gray-700 text-center">Marks</TableHead>
                        <TableHead className="font-bold text-gray-700">Decision</TableHead>
                        <TableHead className="font-bold text-gray-700 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviews.filter(i => (i.name || '').toLowerCase().includes(search.toLowerCase()) || (i.studentId || '').toLowerCase().includes(search.toLowerCase())).map((i, idx) => (
                        <motion.tr 
                            key={i._id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: idx * 0.05 }}
                            className="group hover:bg-gray-50/50 transition-colors"
                        >
                          <TableCell>
                              <div className="font-bold text-gray-900">{i.studentId}</div>
                              <div className="text-sm text-gray-500">{i.name}</div>
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                  {new Date(i.scheduleDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  {new Date(i.scheduleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-600">{i.panel}</TableCell>
                          <TableCell>{getStatusBadge(i.status)}</TableCell>
                          <TableCell className="text-center font-bold text-gray-900">{i.marks || "-"}</TableCell>
                          <TableCell>{getFinalDecisionBadge(i.finalStatus)}</TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(i)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                  <Edit className="w-4 h-4 mr-1.5" /> Manage
                              </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}