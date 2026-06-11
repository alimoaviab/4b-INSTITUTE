"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Award, ShieldAlert, ArrowRight, Download, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const totalQuestions = 50;
  
  useEffect(() => {
    const name = localStorage.getItem("studentName");
    const roll = localStorage.getItem("rollNumber");
    const savedScore = localStorage.getItem("testScore");
    
    if (name) setStudentName(name);
    if (roll) setRollNumber(roll);
    if (savedScore) {
        setScore(parseInt(savedScore, 10));
    } else {
        // If they bypass, give them 0 or redirect
        setScore(0);
    }
    
    // Simulate slight processing delay for dramatic effect
    setTimeout(() => {
        setLoading(false);
    }, 1500);
  }, []);

  const passed = score >= 50; // 50% passing marks
  const correct = score / 2; // Each q is 2 marks
  const incorrect = totalQuestions - correct;

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-semibold animate-pulse">Evaluating answers and generating result...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-xl tracking-tight">
          <Award className="w-6 h-6" />
          <span>Test Evaluation System</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <ShieldAlert className="w-4 h-4" />
          Admin
        </Button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Test Result Overview</h1>
          <p className="text-gray-500 mt-2">Candidate ID: {rollNumber} | {studentName}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-gray-200 shadow-xl bg-white overflow-hidden">
            <CardHeader className={`text-center py-10 ${passed ? 'bg-gradient-to-b from-green-50 to-white border-b border-green-100' : 'bg-gradient-to-b from-red-50 to-white border-b border-red-100'}`}>
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {passed ? <Award className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
              </motion.div>
              <CardTitle className="text-4xl font-extrabold text-gray-900 mb-2">
                {passed ? 'Congratulations!' : 'Not Qualified'}
              </CardTitle>
              <p className={`text-2xl font-black tracking-tight ${passed ? 'text-green-600' : 'text-red-600'}`}>
                Score: {score}%
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="pt-4 md:pt-0">
                  <div className="text-4xl font-bold text-gray-900">{correct}</div>
                  <div className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1.5 font-medium uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Correct Answers
                  </div>
                </div>
                <div className="pt-4 md:pt-0">
                  <div className="text-4xl font-bold text-gray-900">{incorrect}</div>
                  <div className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1.5 font-medium uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Incorrect Answers
                  </div>
                </div>
                <div className="pt-4 md:pt-0">
                  <div className="text-4xl font-bold text-gray-900">100</div>
                  <div className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1.5 font-medium uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-blue-500" />
                    Total Marks
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gray-50 border-t border-gray-100 p-6 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm font-medium">
                  {passed ? 'You are eligible for admission interviews.' : 'You did not meet the minimum criteria.'}
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-none border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Print Result
                </Button>
                <Button 
                  onClick={() => router.push("/student/portal")}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  <User className="w-4 h-4 mr-2" />
                  Go to Portal
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
