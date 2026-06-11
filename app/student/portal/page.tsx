"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, User, FileText, Award, Calendar, Bell, Download, LogOut, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentPortal() {
  const router = useRouter();
  
  const [studentData, setStudentData] = useState<any>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const roll = localStorage.getItem("rollNumber");
    if (!roll) {
      router.push("/student/verify");
      return;
    }
    
    // Load student data
    setStudentData({
        name: localStorage.getItem("studentName") || "Student",
        rollNumber: roll,
        program: localStorage.getItem("program") || "Not Selected",
        email: localStorage.getItem("email") || "Not Provided",
        phone: localStorage.getItem("phone") || "Not Provided"
    });
    
    const savedScore = localStorage.getItem("testScore");
    if (savedScore) {
        setScore(parseInt(savedScore, 10));
    }
  }, [router]);

  const testStatus = score !== null ? "Completed" : "Pending";
  const passed = score !== null && score >= 50;
  
  const interviewStatus = passed ? "Scheduled" : "Not Applicable";
  const applicationStatus = score !== null ? "Under Review" : "Incomplete";

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-lg tracking-tight">
                <BookOpen className="w-6 h-6" />
                <span>Admission Portal</span>
            </div>
        </div>
        <div className="p-4 flex-1 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-blue-700 bg-blue-50 hover:bg-blue-100">
                <User className="w-5 h-5 mr-3" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                <FileText className="w-5 h-5 mr-3" /> Profile Details
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                <Bell className="w-5 h-5 mr-3" /> Notifications <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
            </Button>
        </div>
        <div className="p-4 border-t border-gray-200">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-5 h-5 mr-3" /> Logout
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <header className="flex justify-between items-end mb-8">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome back, {studentData.name}</h1>
                  <p className="text-gray-500">Roll Number: {studentData.rollNumber} | Program: {studentData.program?.toUpperCase() || 'N/A'}</p>
              </div>
              <Avatar className="w-12 h-12 border-2 border-blue-600 shadow-sm">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                      {studentData.name ? studentData.name.substring(0, 2).toUpperCase() : "ST"}
                  </AvatarFallback>
              </Avatar>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Application Status */}
              <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Application Status
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{applicationStatus}</div>
                      <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium bg-amber-50 inline-flex px-2 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5" /> Awaiting final decision
                      </div>
                  </CardContent>
              </Card>

              {/* Test Status */}
              <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <Award className="w-4 h-4" /> Entry Test
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{testStatus}</div>
                      {score !== null ? (
                          <div className={`flex items-center gap-1.5 text-sm font-medium inline-flex px-2 py-0.5 rounded ${passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />} 
                            {passed ? 'Passed (' + score + '%)' : 'Failed (' + score + '%)'}
                          </div>
                      ) : (
                          <div className="text-sm text-gray-500">Not attempted yet</div>
                      )}
                  </CardContent>
              </Card>

              {/* Interview Status */}
              <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Interview
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{interviewStatus}</div>
                      {passed && (
                          <div className="text-sm text-blue-600 font-medium bg-blue-50 inline-flex px-2 py-0.5 rounded">
                              Aug 15, 2026 - 10:00 AM
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Actions */}
              <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                      <CardDescription>Download important documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start hover:bg-gray-50 h-12">
                          <Download className="w-4 h-4 mr-3 text-blue-600" />
                          <span className="font-medium text-gray-700">Download Admission Slip</span>
                      </Button>
                      <Button variant="outline" disabled={score === null} className="w-full justify-start hover:bg-gray-50 h-12">
                          <Award className="w-4 h-4 mr-3 text-green-600" />
                          <span className="font-medium text-gray-700">Download Test Result Card</span>
                      </Button>
                      <Button variant="outline" disabled={!passed} className="w-full justify-start hover:bg-gray-50 h-12">
                          <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                          <span className="font-medium text-gray-700">Download Interview Call Letter</span>
                      </Button>
                  </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                      <CardTitle className="text-lg">Recent Updates</CardTitle>
                      <CardDescription>Important notifications regarding your admission</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                          
                          {passed && (
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                      <Calendar className="w-4 h-4" />
                                  </div>
                                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                                      <div className="flex items-center justify-between space-x-2 mb-1">
                                          <div className="font-bold text-gray-900 text-sm">Interview Scheduled</div>
                                          <time className="text-xs font-medium text-amber-500">Just Now</time>
                                      </div>
                                      <div className="text-sm text-gray-500">Your admission interview has been scheduled. Download your call letter for details.</div>
                                  </div>
                              </div>
                          )}

                          {score !== null && (
                              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                      <Award className="w-4 h-4" />
                                  </div>
                                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                                      <div className="flex items-center justify-between space-x-2 mb-1">
                                          <div className="font-bold text-gray-900 text-sm">Test Completed</div>
                                          <time className="text-xs font-medium text-gray-500">Today</time>
                                      </div>
                                      <div className="text-sm text-gray-500">You have successfully completed the entry test.</div>
                                  </div>
                              </div>
                          )}

                          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-100 text-gray-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                  <User className="w-4 h-4" />
                              </div>
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                                  <div className="flex items-center justify-between space-x-2 mb-1">
                                      <div className="font-bold text-gray-900 text-sm">Registration Success</div>
                                      <time className="text-xs font-medium text-gray-500">Yesterday</time>
                                  </div>
                                  <div className="text-sm text-gray-500">Your registration for {studentData.program?.toUpperCase() || 'the program'} was successful.</div>
                              </div>
                          </div>

                      </div>
                  </CardContent>
              </Card>
          </div>
      </main>
    </div>
  );
}
