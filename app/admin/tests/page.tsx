"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function TestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    startTime: "",
    endTime: "",
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 50,
    negativeMarking: false,
    negativeMarksPerWrong: 0,
    randomizeQuestions: true,
    randomizeOptions: true,
    questionIds: [] as string[]
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, [statusFilter]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tests?search=${search}&status=${statusFilter}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/admin/login");
        throw new Error("Failed to fetch tests");
      }
      const data = await res.json();
      setTests(data);
    } catch (error) {
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTests();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "draft",
      startTime: "",
      endTime: "",
      durationMinutes: 60,
      totalMarks: 100,
      passingMarks: 50,
      negativeMarking: false,
      negativeMarksPerWrong: 0,
      randomizeQuestions: true,
      randomizeOptions: true,
      questionIds: []
    });
    setEditingId(null);
  };

  const openEdit = (t: any) => {
    setFormData({
      title: t.title,
      description: t.description || "",
      status: t.status,
      startTime: t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : "",
      endTime: t.endTime ? new Date(t.endTime).toISOString().slice(0, 16) : "",
      durationMinutes: t.durationMinutes,
      totalMarks: t.totalMarks,
      passingMarks: t.passingMarks,
      negativeMarking: t.negativeMarking,
      negativeMarksPerWrong: t.negativeMarksPerWrong,
      randomizeQuestions: t.randomizeQuestions,
      randomizeOptions: t.randomizeOptions,
      questionIds: t.questionIds || []
    });
    setEditingId(t._id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/tests/${editingId}` : "/api/admin/tests";
    const method = editingId ? "PUT" : "POST";

    const payload = { ...formData };
    if (!payload.startTime) delete (payload as any).startTime;
    if (!payload.endTime) delete (payload as any).endTime;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save test");
      }

      toast.success(editingId ? "Test updated" : "Test created");
      setIsDialogOpen(false);
      resetForm();
      fetchTests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const res = await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Test deleted");
      fetchTests();
    } catch (error) {
      toast.error("Failed to delete test");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-500">Published</Badge>;
      case "archived": return <Badge variant="secondary">Archived</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tests Configuration</h1>
            <p className="text-slate-500 mt-1">Create and schedule online examinations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="hover-elevate">
                <Plus className="mr-2 h-4 w-4" /> Create Test
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Test" : "Create New Test"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Test Title *</Label>
                    <Input required placeholder="e.g. Fall Admission Test 2024" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label>Description</Label>
                    <Input placeholder="Optional description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (Minutes) *</Label>
                    <Input type="number" required min="1" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Marks *</Label>
                    <Input type="number" required min="1" value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: parseInt(e.target.value)})} />
                  </div>

                  <div className="space-y-2">
                    <Label>Passing Marks *</Label>
                    <Input type="number" required min="1" value={formData.passingMarks} onChange={e => setFormData({...formData, passingMarks: parseInt(e.target.value)})} />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <Label className="cursor-pointer">Negative Marking</Label>
                      <Switch checked={formData.negativeMarking} onCheckedChange={checked => setFormData({...formData, negativeMarking: checked})} />
                    </div>
                    {formData.negativeMarking && (
                      <div className="flex items-center gap-2 border p-3 rounded-md">
                        <Label>Penalty</Label>
                        <Input type="number" step="0.1" className="h-8" value={formData.negativeMarksPerWrong} onChange={e => setFormData({...formData, negativeMarksPerWrong: parseFloat(e.target.value)})} />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <Label className="cursor-pointer">Randomize Questions</Label>
                      <Switch checked={formData.randomizeQuestions} onCheckedChange={checked => setFormData({...formData, randomizeQuestions: checked})} />
                    </div>
                    
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <Label className="cursor-pointer">Randomize Options</Label>
                      <Switch checked={formData.randomizeOptions} onCheckedChange={checked => setFormData({...formData, randomizeOptions: checked})} />
                    </div>
                  </div>
                  
                  <div className="col-span-2 pt-2">
                    <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-md border border-blue-100">
                      <strong>Note:</strong> To assign questions to this test, edit the test and select from the Question Bank. (Feature to select questions directly will be integrated next). Currently selected: {formData.questionIds.length} questions.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">{editingId ? "Save Changes" : "Create Test"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="py-4 border-b flex flex-col sm:flex-row sm:items-center gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 max-w-sm items-center gap-2">
              <Input
                placeholder="Search tests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="w-full sm:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading tests...</div>
            ) : tests.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No tests found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test._id}>
                      <TableCell className="font-medium">{test.title}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>{test.durationMinutes} mins</TableCell>
                      <TableCell>{test.totalMarks} (Pass: {test.passingMarks})</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {test.startTime ? new Date(test.startTime).toLocaleDateString() : "Not scheduled"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(test)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(test._id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}