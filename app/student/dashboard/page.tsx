"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, Muhammad Ahmed</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Application</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">Submitted</div>
              <p className="text-xs text-slate-500 mt-1">Under review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Test Status</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">Scheduled</div>
              <p className="text-xs text-slate-500 mt-1">15 Dec 2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Documents</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">5/5</div>
              <p className="text-xs text-slate-500 mt-1">All uploaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Interview</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">Pending</div>
              <p className="text-xs text-slate-500 mt-1">Not scheduled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Complete Identity Verification</h4>
                  <p className="text-xs text-slate-500 mt-1">Required before test</p>
                </div>
                <Button size="sm" variant="outline">Start</Button>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Entrance Test</h4>
                  <p className="text-xs text-slate-500 mt-1">Scheduled for Dec 15, 2024</p>
                </div>
                <Button size="sm" variant="outline">Details</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Application Submitted</h4>
                    <p className="text-xs text-slate-500">Dec 1, 2024</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Under Review</h4>
                    <p className="text-xs text-slate-500">Current Status</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-400">Test Phase</h4>
                    <p className="text-xs text-slate-500">Upcoming</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col">
                <FileText className="w-6 h-6 mb-2" />
                <span className="text-sm">View Application</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">Test Schedule</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <CheckCircle className="w-6 h-6 mb-2" />
                <span className="text-sm">View Results</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col">
                <AlertCircle className="w-6 h-6 mb-2" />
                <span className="text-sm">Get Help</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
