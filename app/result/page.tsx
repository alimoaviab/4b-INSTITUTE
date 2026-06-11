"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react";

export default function ResultPage() {
  const score = 85;
  const totalQuestions = 50;
  const correct = 42;
  const incorrect = 8;
  const passed = score >= 60;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Test Results</h1>
          <p className="text-slate-500 mt-1">Your performance summary</p>
        </div>

        <Card className="border-2">
          <CardHeader className={`text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <Award className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold">
              {passed ? 'Congratulations!' : 'Test Not Passed'}
            </CardTitle>
            <p className={`text-lg mt-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
              Your Score: {score}%
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-slate-900">{correct}</div>
                <div className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Correct
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{incorrect}</div>
                <div className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Incorrect
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">68:45</div>
                <div className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Time Taken
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { subject: 'Mathematics', score: 90, total: 15 },
              { subject: 'English', score: 85, total: 15 },
              { subject: 'General Knowledge', score: 80, total: 10 },
              { subject: 'Science', score: 82, total: 10 },
            ].map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-900">{item.subject}</span>
                  <span className="text-slate-600">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.score >= 80 ? 'bg-green-600' : item.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          {passed && (
            <p className="text-sm text-slate-600">
              You have qualified for the next round. Check your email for further instructions.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="outline">Download Result</Button>
            <Button>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
