import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListStudents, useCreateStudent, useUpdateStudent, 
  useBlockStudent, useDeleteStudent 
} from "@workspace/api-client-react";
import { Search, MoreVertical, Plus, Upload, UserX, UserCheck, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListStudentsQueryKey } from "@workspace/api-client-react";

const studentSchema = z.object({
  rollNumber: z.string().min(1, "Required"),
  cnic: z.string().min(13, "Min 13 chars"),
  name: z.string().min(2, "Required"),
  fatherName: z.string().min(2, "Required"),
  phone: z.string().min(10, "Required"),
  program: z.string().min(2, "Required"),
  isEligible: z.boolean().default(true)
});

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListStudents({ search, page, limit: 10 });
  const createMut = useCreateStudent();
  const updateMut = useUpdateStudent();
  const blockMut = useBlockStudent();
  const deleteMut = useDeleteStudent();

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { rollNumber: "", cnic: "", name: "", fatherName: "", phone: "", program: "", isEligible: true }
  });

  const onSubmit = async (values: z.infer<typeof studentSchema>) => {
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, data: values });
        toast({ title: "Student updated successfully" });
      } else {
        await createMut.mutateAsync({ data: values });
        toast({ title: "Student created successfully" });
      }
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset({ rollNumber: "", cnic: "", name: "", fatherName: "", phone: "", program: "", isEligible: true });
    setIsFormOpen(true);
  };

  const openEdit = (student: any) => {
    setEditingId(student.id);
    form.reset({
      rollNumber: student.rollNumber,
      cnic: student.cnic,
      name: student.name,
      fatherName: student.fatherName,
      phone: student.phone,
      program: student.program,
      isEligible: student.isEligible
    });
    setIsFormOpen(true);
  };

  const handleBlockToggle = async (id: number, currentBlockStatus: boolean) => {
    try {
      await blockMut.mutateAsync({ id, data: { isBlocked: !currentBlockStatus, blockReason: !currentBlockStatus ? "Admin action" : "" } });
      toast({ title: currentBlockStatus ? "Student unblocked" : "Student blocked" });
      queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteMut.mutateAsync({ id });
        toast({ title: "Student deleted" });
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Directory</h1>
          <p className="text-slate-500 mt-1">Manage pre-uploaded student records.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" /> Bulk Import</Button>
          <Button className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Add Student</Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center max-w-sm">
            <Search className="w-4 h-4 mr-2 text-slate-400" />
            <Input 
              placeholder="Search by name, roll no or CNIC..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border-slate-200"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Roll No</TableHead>
                  <TableHead className="font-semibold text-slate-600">Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">CNIC</TableHead>
                  <TableHead className="font-semibold text-slate-600">Program</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No students found.</TableCell></TableRow>
                ) : (
                  data?.data?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium text-slate-900">{student.rollNumber}</TableCell>
                      <TableCell>
                        <div className="text-slate-900 font-medium">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.phone}</div>
                      </TableCell>
                      <TableCell className="text-slate-600">{student.cnic}</TableCell>
                      <TableCell className="text-slate-600">{student.program}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {student.isBlocked ? (
                            <Badge variant="destructive" className="font-normal text-xs">Blocked</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-normal text-xs">Active</Badge>
                          )}
                          {!student.isEligible && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 font-normal text-xs">Ineligible</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreVertical className="h-4 w-4 text-slate-500" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEdit(student)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlockToggle(student.id, student.isBlocked)}>
                              {student.isBlocked ? <><UserCheck className="w-4 h-4 mr-2" /> Unblock</> : <><UserX className="w-4 h-4 mr-2" /> Block</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(student.id)} className="text-rose-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {data && data.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-500">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rollNumber" render={({ field }) => (
                  <FormItem><FormLabel>Roll No</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="cnic" render={({ field }) => (
                  <FormItem><FormLabel>CNIC</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="fatherName" render={({ field }) => (
                  <FormItem><FormLabel>Father Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="program" render={({ field }) => (
                <FormItem><FormLabel>Program</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
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
