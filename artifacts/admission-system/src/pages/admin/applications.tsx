import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Application } from "@workspace/api-client-react";
import { 
  useListApplications, useUpdateApplication 
} from "@workspace/api-client-react";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListApplicationsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";

export default function AdminApplications() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const { data, isLoading } = useListApplications({ 
    search, 
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    page, 
    limit: 10 
  });
  
  const updateMut = useUpdateApplication();

  const handleUpdateStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      await updateMut.mutateAsync({ id, data: { status } });
      toast({ title: `Application ${status}` });
      queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-normal">Approved</Badge>;
      case 'rejected': return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none font-normal">Rejected</Badge>;
      case 'pending': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-normal">Pending</Badge>;
      default: return <Badge variant="outline" className="font-normal text-slate-500">Draft</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Applications</h1>
        <p className="text-slate-500 mt-1">Review and process student admission applications.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4 flex flex-row items-center gap-4">
          <div className="flex items-center flex-1 max-w-sm">
            <Search className="w-4 h-4 mr-2 text-slate-400" />
            <Input 
              placeholder="Search by name or roll no..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border-slate-200"
            />
          </div>
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Applicant</TableHead>
                  <TableHead className="font-semibold text-slate-600">Program</TableHead>
                  <TableHead className="font-semibold text-slate-600">Academic Score</TableHead>
                  <TableHead className="font-semibold text-slate-600">Applied On</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No applications found.</TableCell></TableRow>
                ) : (
                  data?.data?.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{app.fullName}</div>
                        <div className="text-xs text-slate-500">{app.rollNumber} • {app.phone}</div>
                      </TableCell>
                      <TableCell className="text-slate-700">{app.programSelection}</TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{app.percentage?.toFixed(1)}%</div>
                        <div className="text-xs text-slate-500">{app.obtainedMarks}/{app.totalMarks}</div>
                      </TableCell>
                      <TableCell className="text-slate-600">{format(new Date(app.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === 'pending' && (
                            <>
                              <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleUpdateStatus(app.id, 'approved')}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="h-8 w-8 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleUpdateStatus(app.id, 'rejected')}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500" onClick={() => { setSelectedApplication(app); setShowViewModal(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
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

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Review the selected application details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Applicant</h3>
                <p className="text-base font-medium text-slate-900">{selectedApplication?.fullName ?? "—"}</p>
                <p className="text-sm text-slate-500">Roll#: {selectedApplication?.rollNumber ?? "—"}</p>
                <p className="text-sm text-slate-500">Phone: {selectedApplication?.phone ?? "—"}</p>
                <p className="text-sm text-slate-500">Email: {selectedApplication?.email ?? "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Program</h3>
                <p className="text-base font-medium text-slate-900">{selectedApplication?.programSelection ?? "—"}</p>
                <p className="text-sm text-slate-500">Campus: {selectedApplication?.campusSelection ?? "—"}</p>
                <p className="text-sm text-slate-500">Status: {selectedApplication?.status ?? "—"}</p>
                <p className="text-sm text-slate-500">Submitted: {selectedApplication?.createdAt ? format(new Date(selectedApplication.createdAt), 'PPP') : "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Academic</h3>
                <p className="text-base font-medium text-slate-900">{selectedApplication?.percentage?.toFixed(1) ?? "—"}%</p>
                <p className="text-sm text-slate-500">Marks: {selectedApplication?.obtainedMarks ?? "—"}/{selectedApplication?.totalMarks ?? "—"}</p>
                <p className="text-sm text-slate-500">Previous School: {selectedApplication?.schoolCollegeName ?? "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Guardian</h3>
                <p className="text-sm text-slate-500">Father: {selectedApplication?.fatherName ?? "—"}</p>
                <p className="text-sm text-slate-500">Guardian: {selectedApplication?.guardianName ?? "—"}</p>
                <p className="text-sm text-slate-500">Guardian Contact: {selectedApplication?.guardianContact ?? "—"}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Address</h3>
              <p className="text-sm text-slate-500">{selectedApplication?.address ?? "—"}</p>
              <p className="text-sm text-slate-500">{selectedApplication?.city ?? ""}{selectedApplication?.district ? `, ${selectedApplication.district}` : ""}</p>
              <p className="text-sm text-slate-500">{selectedApplication?.province ?? ""}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
