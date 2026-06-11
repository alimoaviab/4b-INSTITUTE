"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/applications?search=${search}&status=${statusFilter}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/admin/login");
        throw new Error("Failed to fetch applications");
      }
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Application marked as ${status}`);
      if (selectedApp) setSelectedApp({ ...selectedApp, status });
      fetchApplications();
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-emerald-500">Approved</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "submitted": return <Badge className="bg-blue-500">Submitted</Badge>;
      default: return <Badge variant="outline" className="text-slate-500">Draft</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Applications</h1>
          <p className="text-slate-500 mt-1">Review and manage student admission applications</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 max-w-sm items-center gap-2">
              <Input
                placeholder="Search by name..."
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
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No applications found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell className="font-medium">{app.fullName || "N/A"}</TableCell>
                      <TableCell>{app.programSelection || "N/A"}</TableCell>
                      <TableCell>{app.percentage ? `${app.percentage}%` : "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-lg font-bold">{selectedApp.fullName}</h3>
                    <p className="text-sm text-slate-500">{selectedApp.email} | {selectedApp.phone}</p>
                  </div>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Father's Name</p>
                    <p className="font-medium">{selectedApp.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Date of Birth</p>
                    <p className="font-medium">{selectedApp.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">City / Province</p>
                    <p className="font-medium">{selectedApp.city}, {selectedApp.province}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Program Applied</p>
                    <p className="font-medium">{selectedApp.programSelection}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Academic Record</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Previous Class</p>
                      <p className="font-medium">{selectedApp.previousClass}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Board</p>
                      <p className="font-medium">{selectedApp.board}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Marks</p>
                      <p className="font-medium">{selectedApp.obtainedMarks} / {selectedApp.totalMarks} ({selectedApp.percentage}%)</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Passing Year</p>
                      <p className="font-medium">{selectedApp.passingYear}</p>
                    </div>
                  </div>
                </div>

                {selectedApp.status === "submitted" && (
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(selectedApp._id, "rejected")}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateStatus(selectedApp._id, "approved")}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}