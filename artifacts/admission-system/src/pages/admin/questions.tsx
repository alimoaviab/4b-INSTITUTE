import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useListQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion, useListTests
} from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, CheckCircle2, AlignLeft, AlignJustify, ToggleLeft, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListQuestionsQueryKey } from "@workspace/api-client-react";

type QuestionType = "mcq" | "short" | "long" | "yes_no";

const TYPE_CONFIG: Record<QuestionType, { label: string; color: string; icon: React.ReactNode }> = {
  mcq: { label: "MCQ", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <ListChecks className="w-3 h-3" /> },
  short: { label: "Short Answer", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <AlignLeft className="w-3 h-3" /> },
  long: { label: "Long Answer", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <AlignJustify className="w-3 h-3" /> },
  yes_no: { label: "Yes / No", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <ToggleLeft className="w-3 h-3" /> },
};

const questionSchema = z.object({
  testId: z.coerce.number().min(1, "Test is required"),
  questionType: z.enum(["mcq", "short", "long", "yes_no"]),
  subject: z.string().min(1, "Subject is required"),
  questionText: z.string().min(5, "Question text required"),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctOption: z.string().optional(),
  marks: z.coerce.number().min(1).default(1),
});

type FormValues = z.infer<typeof questionSchema>;

export default function AdminQuestions() {
  const [testFilter, setTestFilter] = useState<number | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testsRes } = useListTests();
  const { data, isLoading } = useListQuestions({ testId: testFilter, limit: 1000 });

  const createMut = useCreateQuestion();
  const updateMut = useUpdateQuestion();
  const deleteMut = useDeleteQuestion();

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      testId: 0,
      questionType: "mcq",
      subject: "",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      marks: 1,
    },
  });

  const questionType = form.watch("questionType") as QuestionType;

  const buildPayload = (values: FormValues) => {
    const base = {
      testId: values.testId,
      questionType: values.questionType,
      subject: values.subject,
      questionText: values.questionText,
      marks: values.marks,
    };
    if (values.questionType === "mcq") {
      return { ...base, optionA: values.optionA, optionB: values.optionB, optionC: values.optionC, optionD: values.optionD, correctOption: values.correctOption };
    }
    if (values.questionType === "yes_no") {
      return { ...base, optionA: "Yes", optionB: "No", correctOption: values.correctOption };
    }
    return { ...base, optionA: null, optionB: null, optionC: null, optionD: null, correctOption: null };
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = buildPayload(values);
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: payload as any });
        toast({ title: "Question updated" });
      } else {
        await createMut.mutateAsync({ data: payload as any });
        toast({ title: "Question added" });
      }
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      testId: testFilter || (testsRes?.length ? testsRes[0].id : 0),
      questionType: "mcq",
      subject: "",
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      marks: 1,
    });
    setIsFormOpen(true);
  };

  const openEdit = (q: any) => {
    setEditingId(q.id);
    form.reset({
      testId: q.testId,
      questionType: q.questionType || "mcq",
      subject: q.subject,
      questionText: q.questionText,
      optionA: q.optionA || "",
      optionB: q.optionB || "",
      optionC: q.optionC || "",
      optionD: q.optionD || "",
      correctOption: q.correctOption || "A",
      marks: q.marks,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this question?")) {
      try {
        await deleteMut.mutateAsync({ id });
        toast({ title: "Question deleted" });
        queryClient.invalidateQueries({ queryKey: getListQuestionsQueryKey() });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    }
  };

  const renderQuestionPreview = (q: any) => {
    const type: QuestionType = q.questionType || "mcq";
    if (type === "mcq") {
      return (
        <div className="grid grid-cols-2 gap-1 mt-2 text-sm text-slate-600">
          <div className={q.correctOption === "A" ? "text-emerald-600 font-semibold flex items-center gap-1" : ""}>
            {q.correctOption === "A" && <CheckCircle2 className="w-3 h-3" />}A. {q.optionA}
          </div>
          <div className={q.correctOption === "B" ? "text-emerald-600 font-semibold flex items-center gap-1" : ""}>
            {q.correctOption === "B" && <CheckCircle2 className="w-3 h-3" />}B. {q.optionB}
          </div>
          <div className={q.correctOption === "C" ? "text-emerald-600 font-semibold flex items-center gap-1" : ""}>
            {q.correctOption === "C" && <CheckCircle2 className="w-3 h-3" />}C. {q.optionC}
          </div>
          <div className={q.correctOption === "D" ? "text-emerald-600 font-semibold flex items-center gap-1" : ""}>
            {q.correctOption === "D" && <CheckCircle2 className="w-3 h-3" />}D. {q.optionD}
          </div>
        </div>
      );
    }
    if (type === "yes_no") {
      return (
        <div className="flex gap-3 mt-2 text-sm">
          <span className={q.correctOption === "A" ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-500"}>
            {q.correctOption === "A" && <CheckCircle2 className="w-3 h-3 inline" />} ✅ Yes
          </span>
          <span className={q.correctOption === "B" ? "text-rose-600 font-semibold flex items-center gap-1" : "text-slate-500"}>
            {q.correctOption === "B" && <CheckCircle2 className="w-3 h-3 inline" />} ❌ No
          </span>
        </div>
      );
    }
    if (type === "short") {
      return <div className="mt-2 text-sm text-slate-400 italic">Short written answer</div>;
    }
    if (type === "long") {
      return <div className="mt-2 text-sm text-slate-400 italic">Detailed written answer</div>;
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Question Bank</h1>
          <p className="text-slate-500 mt-1">
            {data?.total ?? 0} questions total — all shown on this page
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="w-[260px]">
            <Select
              value={testFilter?.toString() || "all"}
              onValueChange={(val) => setTestFilter(val === "all" ? undefined : parseInt(val, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {testsRes?.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-10 font-semibold text-slate-600">#</TableHead>
                  <TableHead className="font-semibold text-slate-600">Question</TableHead>
                  <TableHead className="font-semibold text-slate-600">Type</TableHead>
                  <TableHead className="font-semibold text-slate-600">Subject</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center w-16">Marks</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600 w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">Loading questions...</TableCell>
                  </TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">No questions yet. Click "Add Question" to start.</TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((q, idx) => {
                    const type: QuestionType = (q as any).questionType || "mcq";
                    const cfg = TYPE_CONFIG[type];
                    return (
                      <TableRow key={q.id} className="align-top">
                        <TableCell className="text-slate-400 text-xs pt-4">{idx + 1}</TableCell>
                        <TableCell className="max-w-xl">
                          <div className="font-medium text-slate-900">{q.questionText}</div>
                          {renderQuestionPreview(q)}
                        </TableCell>
                        <TableCell className="pt-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 pt-4">{q.subject}</TableCell>
                        <TableCell className="text-center font-semibold text-slate-900 pt-4">{q.marks}</TableCell>
                        <TableCell className="text-right pt-3">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => openEdit(q)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(q.id)}>
                              <Trash2 className="h-4 w-4" />
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
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Question" : "Add Question"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Row 1: Test + Subject */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="testId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v, 10))} value={field.value?.toString()}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select test" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {testsRes?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl><Input placeholder="e.g. Mathematics" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Row 2: Question Type + Marks */}
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="questionType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="mcq">
                          <span className="flex items-center gap-2"><ListChecks className="w-4 h-4 text-blue-500" /> MCQ (4 Options)</span>
                        </SelectItem>
                        <SelectItem value="short">
                          <span className="flex items-center gap-2"><AlignLeft className="w-4 h-4 text-emerald-500" /> Short Answer</span>
                        </SelectItem>
                        <SelectItem value="long">
                          <span className="flex items-center gap-2"><AlignJustify className="w-4 h-4 text-purple-500" /> Long Answer</span>
                        </SelectItem>
                        <SelectItem value="yes_no">
                          <span className="flex items-center gap-2"><ToggleLeft className="w-4 h-4 text-amber-500" /> Yes / No</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="marks" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks</FormLabel>
                    <FormControl><Input type="number" min={1} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Question Text */}
              <FormField control={form.control} name="questionText" render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    {questionType === "long" ? (
                      <Textarea rows={3} placeholder="Enter your question..." {...field} />
                    ) : (
                      <Input placeholder="Enter your question..." {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* MCQ Options */}
              {questionType === "mcq" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="optionA" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option A</FormLabel>
                        <FormControl><Input placeholder="Option A" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="optionB" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option B</FormLabel>
                        <FormControl><Input placeholder="Option B" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="optionC" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option C</FormLabel>
                        <FormControl><Input placeholder="Option C" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="optionD" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option D</FormLabel>
                        <FormControl><Input placeholder="Option D" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="correctOption" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Option</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "A"}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="A">A — {form.watch("optionA") || "Option A"}</SelectItem>
                          <SelectItem value="B">B — {form.watch("optionB") || "Option B"}</SelectItem>
                          <SelectItem value="C">C — {form.watch("optionC") || "Option C"}</SelectItem>
                          <SelectItem value="D">D — {form.watch("optionD") || "Option D"}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {/* Yes / No Correct Answer */}
              {questionType === "yes_no" && (
                <FormField control={form.control} name="correctOption" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "A"}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="A">✅ Yes</SelectItem>
                        <SelectItem value="B">❌ No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {/* Short / Long info */}
              {(questionType === "short" || questionType === "long") && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
                  {questionType === "short"
                    ? "Student will type a short written answer (1–3 sentences). No options needed."
                    : "Student will type a detailed written answer (paragraph). No options needed."}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                  {editingId ? "Save Changes" : "Add Question"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
