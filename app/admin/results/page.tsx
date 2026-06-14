"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, CheckCircle, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [detailedAnswers, setDetailedAnswers] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchResults();
  }, [router]);

  const fetchResults = async (searchQuery = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/results?search=${searchQuery}`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();
      setResults(data);
    } catch (error) {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(search);
  };

  const viewDetails = async (result: any) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/results/${result._id}`);
      if (!res.ok) throw new Error("Failed to fetch details");
      const data = await res.json();
      setDetailedAnswers(data.detailedAnswers);
    } catch (error) {
      toast.error("Failed to load detailed answers");
      setIsDialogOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Results</h1>
          <p className="text-slate-500 mt-1">View test results and specific answers</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="py-4 border-b flex flex-col sm:flex-row sm:items-center gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 max-w-sm items-center gap-2">
              <Input
                placeholder="Search by student name or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading results...</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No results found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No / CNIC</TableHead>
                    <TableHead>Test Title</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell className="font-medium">
                        {r.student?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{r.student?.rollNumber}</div>
                        <div className="text-xs text-slate-500">{r.student?.cnic}</div>
                      </TableCell>
                      <TableCell>
                         <div className="text-sm">{r.test?.title || "Unknown Test"}</div>
                         <div className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">{r.obtainedMarks}</span> / {r.totalMarks}
                        <div className="text-xs text-slate-500">{Math.round(r.percentage)}%</div>
                      </TableCell>
                      <TableCell>
                        {r.isPassed ? (
                          <Badge className="bg-emerald-500">Pass</Badge>
                        ) : (
                          <Badge variant="destructive">Fail</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => viewDetails(r)}>
                          <Eye className="h-4 w-4 mr-2" /> View Answers
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detailed Answers Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" /> 
                Test Details: {selectedResult?.student?.name}
              </DialogTitle>
            </DialogHeader>
            
            {detailsLoading ? (
              <div className="py-12 text-center text-slate-500 animate-pulse">Loading detailed answers...</div>
            ) : (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border">
                   <div>
                     <p className="text-xs text-slate-500 uppercase font-semibold">Total Score</p>
                     <p className="text-lg font-bold text-slate-900">{selectedResult?.obtainedMarks} / {selectedResult?.totalMarks}</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 uppercase font-semibold">Percentage</p>
                     <p className="text-lg font-bold text-slate-900">{Math.round(selectedResult?.percentage || 0)}%</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 uppercase font-semibold">Status</p>
                     <p className={`text-lg font-bold ${selectedResult?.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selectedResult?.isPassed ? 'PASSED' : 'FAILED'}
                     </p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 uppercase font-semibold">Violations</p>
                     <p className="text-lg font-bold text-slate-900">{selectedResult?.attempt?.cheatingFlags || 0}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Answer Breakdown</h3>
                  {detailedAnswers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${ans.isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                       <div className="flex gap-3">
                         <div className="mt-0.5">
                           {ans.isCorrect ? (
                             <CheckCircle className="h-5 w-5 text-emerald-500" />
                           ) : (
                             <XCircle className="h-5 w-5 text-red-500" />
                           )}
                         </div>
                         <div className="flex-1 space-y-2">
                           <p className="font-medium text-slate-900"><span className="text-slate-500 mr-2">Q{idx + 1}.</span> {ans.text}</p>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-3">
                             <div className="bg-white p-2 rounded border shadow-sm">
                               <p className="text-xs text-slate-500 font-semibold mb-1">Student's Answer:</p>
                               <p className={`font-medium ${ans.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{ans.studentAnswer}</p>
                             </div>
                             
                             {!ans.isCorrect && (
                               <div className="bg-white p-2 rounded border shadow-sm">
                                 <p className="text-xs text-slate-500 font-semibold mb-1">Correct Answer:</p>
                                 <p className="font-medium text-emerald-700">{ans.correctAnswer}</p>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}