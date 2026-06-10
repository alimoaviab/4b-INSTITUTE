import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useListInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview
} from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListInterviewsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";

const interviewSchema = z.object({
  studentId: z.coerce.number().min(1, "Student ID required"),
  scheduledAt: z.string().min(1, "Date/Time required"),
  venue: z.string().optional(),
  notes: z.string().optional()
});

const interviewUpdateSchema = z.object({
  scheduledAt: z.string().optional(),
  venue: z.string().optional(),
  status: z.enum(["scheduled", "completed", "rejected"]).optional(),
  notes: z.string().optional(),
  remarks: z.string().optional()
});

export default function AdminInterviews() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListInterviews({ 
    status: statusFilter !== "all" ? (statusFilter as any) : undefined, 
    page, 
    limit: 10 
  });
  
  const createMut = useCreateInterview();
  const updateMut = useUpdateInterview();
  const deleteMut = useDeleteInterview();

  const createForm = useForm<z.infer<typeof interviewSchema>>({
    resolver: zodResolver(interviewSchema),
    defaultValues: { studentId: 0, scheduledAt: "", venue: "", notes: "" }
  });

  const editForm = useForm<z.infer<typeof interviewUpdateSchema>>({
    resolver: zodResolver(interviewUpdateSchema),
    defaultValues: { scheduledAt: "", venue: "", status: "scheduled", notes: "", remarks: "" }
  });

  const onCreateSubmit = async (values: z.infer<typeof interviewSchema>) => {
    try {
      await createMut.mutateAsync({ data: values });
      toast({ title: "Interview scheduled" });
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const onEditSubmit = async (values: z.infer<typeof interviewUpdateSchema>) => {
    try {
      await updateMut.mutateAsync({ id: editingItem.id, data: values });
      toast({ title: "Interview updated" });
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    editForm.reset({
      scheduledAt: item.scheduledAt ? item.scheduledAt.slice(0, 16) : "",
      venue: item.venue || "",
      status: item.status,
      notes: item.notes || "",
      remarks: item.remarks || ""
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this interview?")) {
      try {
        await deleteMut.mutateAsync({ id });
        toast({ title: "Interview deleted" });
        queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey() });
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-normal">Completed</Badge>;
      case 'rejected': return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none font-normal">Rejected</Badge>;
      default: return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-normal">Scheduled</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Interviews</h1>
          <p className="text-slate-500 mt-1">Schedule and manage applicant interviews.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4" /> Schedule Interview</Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="w-[200px]">
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Candidate</TableHead>
                  <TableHead className="font-semibold text-slate-600">Schedule</TableHead>
                  <TableHead className="font-semibold text-slate-600">Venue</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No interviews found.</TableCell></TableRow>
                ) : (
                  data?.data?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{item.studentName}</div>
                        <div className="text-xs text-slate-500">{item.rollNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-slate-900 font-medium">
                          <CalendarIcon className="w-3 h-3 mr-2 text-slate-400" />
                          {format(new Date(item.scheduledAt), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <Clock className="w-3 h-3 mr-2" />
                          {format(new Date(item.scheduledAt), 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{item.venue}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {data && data.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-500">Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField control={createForm.control} name="studentId" render={({ field }) => (
                <FormItem><FormLabel>Student ID</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={createForm.control} name="scheduledAt" render={({ field }) => (
                <FormItem><FormLabel>Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={createForm.control} name="venue" render={({ field }) => (
                <FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={createForm.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Internal Notes</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
              )} />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMut.isPending}>Schedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Interview</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="scheduledAt" render={({ field }) => (
                  <FormItem><FormLabel>Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={editForm.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <FormField control={editForm.control} name="venue" render={({ field }) => (
                <FormItem><FormLabel>Venue</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={editForm.control} name="remarks" render={({ field }) => (
                <FormItem><FormLabel>Interview Remarks</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
              )} />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateMut.isPending}>Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
