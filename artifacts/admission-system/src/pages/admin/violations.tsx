import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListViolations } from "@workspace/api-client-react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";

export default function AdminViolations() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListViolations({ page, limit: 10 });

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'high': return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none font-normal"><AlertTriangle className="w-3 h-3 mr-1"/> High</Badge>;
      case 'medium': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none font-normal"><AlertCircle className="w-3 h-3 mr-1"/> Medium</Badge>;
      case 'low': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none font-normal"><Info className="w-3 h-3 mr-1"/> Low</Badge>;
      default: return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Anti-Cheating Log</h1>
        <p className="text-slate-500 mt-1">Review flagged test violations and anomalies.</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600 pl-6 w-[120px]">Image</TableHead>
                <TableHead className="font-semibold text-slate-600">Student</TableHead>
                <TableHead className="font-semibold text-slate-600">Severity</TableHead>
                <TableHead className="font-semibold text-slate-600">Violation Type</TableHead>
                <TableHead className="font-semibold text-slate-600">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : data?.data?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No violations logged.</TableCell></TableRow>
              ) : (
                data?.data?.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="pl-6">
                      {v.capturedImageUrl ? (
                        <img src={v.capturedImageUrl} alt="Violation" className="w-16 h-12 object-cover rounded border" />
                      ) : (
                        <div className="w-16 h-12 bg-slate-100 rounded border flex items-center justify-center text-slate-400 text-xs">No img</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{v.studentName}</div>
                      <div className="text-xs text-slate-500">{v.rollNumber}</div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(v.severity)}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{v.type}</div>
                      {v.description && <div className="text-xs text-slate-500 max-w-xs truncate">{v.description}</div>}
                    </TableCell>
                    <TableCell className="text-slate-600">{format(new Date(v.createdAt), 'MMM d, h:mm a')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
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
