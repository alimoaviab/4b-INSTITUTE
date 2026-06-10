import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListTests, useCreateTest, useUpdateTest, useDeleteTest 
} from "@workspace/api-client-react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListTestsQueryKey } from "@workspace/api-client-react";

const testSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(5),
  totalMarks: z.coerce.number().min(1),
  passingMarks: z.coerce.number().min(1),
  instructions: z.string().optional(),
  isActive: z.boolean().default(false)
});

export default function AdminTests() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListTests();
  const createMut = useCreateTest();
  const updateMut = useUpdateTest();
  const deleteMut = useDeleteTest();

  const form = useForm<z.infer<typeof testSchema>>({
    resolver: zodResolver(testSchema),
    defaultValues: { title: "", description: "", durationMinutes: 60, totalMarks: 100, passingMarks: 50, instructions: "", isActive: false }
  });

  const onSubmit = async (values: z.infer<typeof testSchema>) => {
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: values });
        toast({ title: "Test updated" });
      } else {
        await createMut.mutateAsync({ data: values });
        toast({ title: "Test created" });
      }
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: getListTestsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ title: "", description: "", durationMinutes: 60, totalMarks: 100, passingMarks: 50, instructions: "", isActive: false });
    setIsFormOpen(true);
  };

  const openEdit = (test: any) => {
    setEditingId(test.id);
    form.reset(test);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this test config?")) {
      try {
        await deleteMut.mutateAsync({ id });
        toast({ title: "Test deleted" });
        queryClient.invalidateQueries({ queryKey: getListTestsQueryKey() });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await updateMut.mutateAsync({ id, data: { isActive: !currentActive } });
      toast({ title: "Test status updated" });
      queryClient.invalidateQueries({ queryKey: getListTestsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Test Configurations</h1>
          <p className="text-slate-500 mt-1">Setup and manage entry tests.</p>
        </div>
        <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Create Test</Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600 pl-6">Test Title</TableHead>
                <TableHead className="font-semibold text-slate-600">Duration</TableHead>
                <TableHead className="font-semibold text-slate-600">Marks (Pass/Total)</TableHead>
                <TableHead className="font-semibold text-slate-600">Questions</TableHead>
                <TableHead className="font-semibold text-slate-600">Active</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : data?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No tests configured.</TableCell></TableRow>
              ) : (
                data?.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="pl-6 font-medium text-slate-900">{test.title}</TableCell>
                    <TableCell className="text-slate-600">{test.durationMinutes} mins</TableCell>
                    <TableCell className="text-slate-600">{test.passingMarks} / {test.totalMarks}</TableCell>
                    <TableCell className="text-slate-600">{test.questionCount || 0}</TableCell>
                    <TableCell>
                      <Switch checked={test.isActive} onCheckedChange={() => handleToggleActive(test.id, test.isActive)} />
                      {test.isActive && <Badge className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-normal">Active</Badge>}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => openEdit(test)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(test.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Test" : "Create Test"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                  <FormItem><FormLabel>Duration (mins)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="totalMarks" render={({ field }) => (
                  <FormItem><FormLabel>Total Marks</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="passingMarks" render={({ field }) => (
                  <FormItem><FormLabel>Passing Marks</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="instructions" render={({ field }) => (
                <FormItem><FormLabel>Instructions</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Test</FormLabel>
                    <FormDescription>Set this as the current active test for students.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
