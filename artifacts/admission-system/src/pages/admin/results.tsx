import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useListResults, useGetMeritList, useListTests
} from "@workspace/api-client-react";
import { Download, Trophy } from "lucide-react";
import { format } from "date-fns";

export default function AdminResults() {
  const [testFilter, setTestFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);

  const { data: testsRes } = useListTests();
  const { data: resultsData, isLoading: resultsLoading } = useListResults({ testId: testFilter, page, limit: 10 });
  const { data: meritData, isLoading: meritLoading } = useGetMeritList({ testId: testFilter, limit: 100 });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Results & Merit List</h1>
          <p className="text-slate-500 mt-1">View test scores and rank students.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[200px]">
            <Select value={testFilter?.toString() || "all"} onValueChange={(val) => { setTestFilter(val === "all" ? undefined : parseInt(val, 10)); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {testsRes?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="merit" className="text-amber-600 data-[state=active]:text-amber-700 data-[state=active]:bg-amber-50"><Trophy className="w-4 h-4 mr-2" /> Merit List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-600 pl-6">Student</TableHead>
                    <TableHead className="font-semibold text-slate-600">Date</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-center">Score</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-center">Percentage</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultsLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : resultsData?.data?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No results found.</TableCell></TableRow>
                  ) : (
                    resultsData?.data?.map((res) => (
                      <TableRow key={res.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium text-slate-900">{res.studentName}</div>
                          <div className="text-xs text-slate-500">{res.rollNumber}</div>
                        </TableCell>
                        <TableCell className="text-slate-600">{format(new Date(res.createdAt), 'MMM d, yyyy p')}</TableCell>
                        <TableCell className="text-center font-medium text-slate-900">{res.totalScore} / {res.totalMarks}</TableCell>
                        <TableCell className="text-center font-medium text-slate-700">{res.percentage.toFixed(1)}%</TableCell>
                        <TableCell>
                          {res.status === 'pass' 
                            ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none font-normal">Passed</Badge>
                            : <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-none font-normal">Failed</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {resultsData && resultsData.total > 0 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-slate-500">Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, resultsData.total)} of {resultsData.total}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 10 >= resultsData.total}>Next</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="merit">
          <Card className="shadow-sm border-t-4 border-t-amber-500">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-amber-50/50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-600 pl-6 w-20 text-center">Rank</TableHead>
                    <TableHead className="font-semibold text-slate-600">Student</TableHead>
                    <TableHead className="font-semibold text-slate-600">Program</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-center">Score</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-center">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meritLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                  ) : meritData?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No merit list available.</TableCell></TableRow>
                  ) : (
                    meritData?.map((res, i) => (
                      <TableRow key={i} className={i < 3 ? "bg-amber-50/30" : ""}>
                        <TableCell className="pl-6 text-center">
                          {i === 0 ? <Trophy className="w-5 h-5 text-amber-500 mx-auto" /> : 
                           i === 1 ? <Trophy className="w-5 h-5 text-slate-400 mx-auto" /> :
                           i === 2 ? <Trophy className="w-5 h-5 text-amber-700 mx-auto" /> : 
                           <span className="font-medium text-slate-500">{res.rank}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{res.studentName}</div>
                          <div className="text-xs text-slate-500">{res.rollNumber}</div>
                        </TableCell>
                        <TableCell className="text-slate-600">{res.program}</TableCell>
                        <TableCell className="text-center font-medium text-slate-900">{res.totalScore}</TableCell>
                        <TableCell className="text-center font-bold text-primary">{res.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
