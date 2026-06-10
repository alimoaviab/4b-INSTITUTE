import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListVerificationLogs } from "@workspace/api-client-react";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AdminVerificationLogs() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useListVerificationLogs({ 
    success: statusFilter === "all" ? undefined : statusFilter === "success", 
    page, 
    limit: 10 
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Verification Logs</h1>
        <p className="text-slate-500 mt-1">Audit log of student face verification attempts.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="w-[200px]">
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attempts</SelectItem>
                <SelectItem value="success">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600 pl-6 w-[100px]">Photo</TableHead>
                  <TableHead className="font-semibold text-slate-600">Student</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center">Match Score</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600">Time / IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No logs found.</TableCell></TableRow>
                ) : (
                  data?.data?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="pl-6">
                        {log.capturedImageUrl ? (
                          <img src={log.capturedImageUrl} alt="Captured" className="w-12 h-12 object-cover rounded-full border shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 rounded-full border flex items-center justify-center text-slate-400 text-[10px]">No img</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{log.studentName || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{log.rollNumber || `ID: ${log.studentId}`}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={`font-medium ${log.faceMatchScore >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {log.faceMatchScore}%
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-normal"><CheckCircle2 className="w-3 h-3 mr-1"/> Success</Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none font-normal"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-900 text-sm">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</div>
                        <div className="text-xs text-slate-500 font-mono">{log.ipAddress || 'Unknown IP'}</div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {data && data.total > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-slate-500">Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
