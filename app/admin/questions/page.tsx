"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestionsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Question Bank</h1>
          <p className="text-slate-500 mt-1">Manage test questions and question pools</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Question Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-slate-500 py-8">
              Question bank management features will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}