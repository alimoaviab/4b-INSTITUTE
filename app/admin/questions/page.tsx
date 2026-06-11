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
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    type: "mcq",
    difficulty: "medium",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    tags: [] as string[]
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/questions?search=${search}&category=${categoryFilter}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/admin/login");
        throw new Error("Failed to fetch questions");
      }
      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const resetForm = () => {
    setFormData({
      category: "",
      subject: "",
      type: "mcq",
      difficulty: "medium",
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      tags: []
    });
    setEditingId(null);
  };

  const openEdit = (q: any) => {
    setFormData({
      category: q.category,
      subject: q.subject,
      type: q.type,
      difficulty: q.difficulty,
      text: q.text,
      options: q.options || ["", "", "", ""],
      correctAnswer: q.correctAnswer || "",
      marks: q.marks,
      tags: q.tags || []
    });
    setEditingId(q._id);
    setIsDialogOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions";
    const method = editingId ? "PUT" : "POST";

    // Clean up options if not mcq
    const payload = { ...formData };
    if (payload.type !== "mcq") {
      payload.options = [];
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save question");
      }

      toast.success(editingId ? "Question updated" : "Question added");
      setIsDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Question deleted");
      fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Question Bank</h1>
            <p className="text-slate-500 mt-1">Manage tests questions, subjects, and categories</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="hover-elevate">
                <Plus className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Question" : "Add New Question"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Input required placeholder="e.g. Science" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Input required placeholder="e.g. Physics" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True / False</SelectItem>
                        <SelectItem value="descriptive">Descriptive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(val) => setFormData({...formData, difficulty: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Question Text *</Label>
                    <Textarea required rows={4} value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} />
                  </div>

                  {formData.type === "mcq" && (
                    <div className="col-span-2 space-y-4 border p-4 rounded-md bg-slate-50">
                      <Label>Options</Label>
                      {formData.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-medium w-6">{String.fromCharCode(65 + i)}.</span>
                          <Input required value={opt} onChange={e => handleOptionChange(i, e.target.value)} />
                        </div>
                      ))}
                      <div className="space-y-2 pt-2">
                        <Label>Correct Option (A, B, C, or D) *</Label>
                        <Select required value={formData.correctAnswer} onValueChange={(val) => setFormData({...formData, correctAnswer: val})}>
                          <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Option A</SelectItem>
                            <SelectItem value="1">Option B</SelectItem>
                            <SelectItem value="2">Option C</SelectItem>
                            <SelectItem value="3">Option D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {formData.type === "true_false" && (
                    <div className="col-span-2 space-y-2 border p-4 rounded-md bg-slate-50">
                      <Label>Correct Answer *</Label>
                      <Select required value={formData.correctAnswer} onValueChange={(val) => setFormData({...formData, correctAnswer: val})}>
                        <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input type="number" min="1" required value={formData.marks} onChange={e => setFormData({...formData, marks: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit">{editingId ? "Save Changes" : "Create Question"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="py-4 border-b flex flex-col sm:flex-row sm:items-center gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 max-w-sm items-center gap-2">
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="w-full sm:w-[200px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading questions...</div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No questions found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((q) => (
                    <TableRow key={q._id}>
                      <TableCell className="font-medium truncate max-w-[300px]" title={q.text}>
                        {q.text}
                      </TableCell>
                      <TableCell className="capitalize">{q.type.replace("_", " ")}</TableCell>
                      <TableCell>{q.subject}</TableCell>
                      <TableCell>{q.marks}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q._id)}>
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