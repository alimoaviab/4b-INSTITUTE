"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertCircle } from "lucide-react";

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Test Instructions</h1>
          <p className="text-slate-500 mt-1">Please read carefully before starting the test</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Time Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Total time: 90 minutes</li>
                <li>• Cannot pause or resume</li>
                <li>• Auto-submit when time expires</li>
                <li>• Time remaining will be displayed</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Important Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• No external help allowed</li>
                <li>• Keep face visible to camera</li>
                <li>• No switching between tabs</li>
                <li>• Violations will be recorded</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Test Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-600">
              <div>
                <h4 className="font-medium text-slate-900">Multiple Choice</h4>
                <p>Select the best answer from options</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">True/False</h4>
                <p>Mark statements as true or false</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Short Answer</h4>
                <p>Brief written responses required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" className="px-8">
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}