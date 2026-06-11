"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert, AlertTriangle, BookOpen, Clock, FileText, CheckCircle } from "lucide-react";

export default function InstructionsPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    if (agreed) {
      router.push("/test");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-xl tracking-tight">
          <BookOpen className="w-6 h-6" />
          <span>University Admission Portal</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
          Admin Panel
        </Button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Entry Test Instructions</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Please read the following instructions carefully before starting your admission test.</p>
        </div>

        <Card className="border-blue-600 shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-blue-600 text-white p-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Examination Guidelines
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Test Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
                <FileText className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Total Questions</span>
                <span className="text-xl font-bold text-gray-900">50</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Total Marks</span>
                <span className="text-xl font-bold text-gray-900">100</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Passing Marks</span>
                <span className="text-xl font-bold text-gray-900">50%</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Duration</span>
                <span className="text-xl font-bold text-gray-900">45 Mins</span>
              </div>
            </div>

            {/* Rules and Regulations */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Rules & Regulations</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="min-w-6 mt-0.5"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                  <span>Ensure you have a stable internet connection before starting the test. The test timer will not stop if you disconnect.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="min-w-6 mt-0.5"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                  <span>The test consists of multiple-choice questions (MCQs). Each question has four options with only one correct answer.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="min-w-6 mt-0.5"><CheckCircle className="w-5 h-5 text-green-500" /></div>
                  <span>There is <strong>NO negative marking</strong> for incorrect answers.</span>
                </li>
              </ul>
            </div>

            {/* Anti-Cheating Protocol */}
            <div className="bg-red-50 p-5 rounded-lg border border-red-200 space-y-3">
              <h3 className="text-red-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Strict Anti-Cheating & Proctoring Protocol
              </h3>
              <ul className="space-y-2 text-red-700 text-sm list-disc pl-5">
                <li>Your face will be continuously monitored via webcam. Ensure your face is fully visible in a well-lit environment.</li>
                <li><strong>Do NOT switch tabs or minimize the browser.</strong> The system will automatically detect and record violations.</li>
                <li>Multiple violations may lead to automatic submission and cancellation of your test.</li>
                <li>Presence of any other person in the camera frame is strictly prohibited.</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center space-x-2">
                <Checkbox 
                  id="agree" 
                  checked={agreed} 
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label 
                  htmlFor="agree" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 cursor-pointer"
                >
                  I have read and agree to all rules and regulations.
                </label>
             </div>
             
             <Button
               onClick={handleProceed}
               disabled={!agreed}
               className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8"
             >
               Start Test
             </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
