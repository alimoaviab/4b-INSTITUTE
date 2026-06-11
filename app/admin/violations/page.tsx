"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ViolationsPage() {
  const router = useRouter();
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const res = await fetch("/api/admin/violations");
      if (!res.ok) {
        if (res.status === 401) router.push("/admin/login");
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setViolations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge className="bg-amber-500">Medium</Badge>;
      case "low": return <Badge variant="outline" className="text-slate-500">Low</Badge>;
      default: return <Badge>{severity}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Violations</h1>
          <p className="text-slate-500 mt-1">Monitor anti-cheating alerts and security events</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Violations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : violations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No violations recorded.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell className="whitespace-nowrap">{new Date(v.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">{v.studentId}</TableCell>
                      <TableCell className="capitalize">{v.type.replace("_", " ")}</TableCell>
                      <TableCell>{getSeverityBadge(v.severity)}</TableCell>
                      <TableCell className="text-sm text-slate-500">{v.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}