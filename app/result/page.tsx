"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Award, ShieldAlert } from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  
  const score = 85;
  const totalQuestions = 50;
  const correct = 42;
  const incorrect = 8;
  const passed = score >= 60;

  useEffect(() => {
    const name = localStorage.getItem("studentName");
    const roll = localStorage.getItem("rollNumber");
    
    if (name) setStudentName(name);
    if (roll) setRollNumber(roll);
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Admin Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="flex items-center gap-2 bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Panel
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Test Results</h1>
          <p className="text-black mt-1">Your performance summary</p>
          {studentName && (
            <p className="text-black mt-2">
              <span className="font-medium">{studentName}</span> | Roll#: <span className="font-medium">{rollNumber}</span>
            </p>
          )}
        </div>

        {/* Main Result Card */}
        <Card className="border-2 border-blue-600 bg-white">
          <CardHeader className={`text-center ${passed ? 'bg-green-50 border-b-2 border-green-600' : 'bg-red-50 border-b-2 border-red-600'}`}>
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <Award className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold text-black">
              {passed ? 'Congratulations!' : 'Test Not Passed'}
            </CardTitle>
            <p className={`text-lg mt-2 font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
              Your Score: {score}%
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-black">{correct}</div>
                <div className="text-sm text-black mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Correct
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">{incorrect}</div>
                <div className="text-sm text-black mt-1 flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Incorrect
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">68:45</div>
                <div className="text-sm text-black mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Time Taken
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Performance */}
        <Card className="border-blue-600 bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {[
              { subject: 'Mathematics', score: 90, total: 15 },
              { subject: 'English', score: 85, total: 15 },
              { subject: 'General Knowledge', score: 80, total: 10 },
              { subject: 'Science', score: 82, total: 10 },
            ].map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-black">{item.subject}</span>
                  <span className="text-black">{item.score}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-3 border border-blue-600">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 80 ? 'bg-green-600' : item.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-3">
          {passed && (
            <p className="text-black font-medium">
              You have qualified for the next round. Check your email for further instructions.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline"
              className="bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Download Result
            </Button>
            <Button 
              onClick={() => router.push("/student/verify")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Take Another Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
