"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertCircle, ShieldAlert } from "lucide-react";

export default function TestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 50;
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  useEffect(() => {
    // Get student data
    const name = localStorage.getItem("studentName");
    const roll = localStorage.getItem("rollNumber");
    
    if (!name || !roll) {
      router.push("/student/verify");
      return;
    }
    
    setStudentName(name);
    setRollNumber(roll);
  }, [router]);

  const handleSubmit = () => {
    if (confirm("Are you sure you want to submit the test?")) {
      router.push("/result");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-black">Entrance Test</h1>
            <p className="text-black">
              Student: <span className="font-medium">{studentName}</span> | Roll#: <span className="font-medium">{rollNumber}</span>
            </p>
            <p className="text-black mt-1">Question {currentQuestion} of {totalQuestions}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-black">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-mono text-lg font-bold">45:30</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/admin/login")}
              className="flex items-center gap-2 bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin
            </Button>
            <Button 
              onClick={handleSubmit}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Test
            </Button>
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-blue-600 bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="text-lg font-medium">
              Question {currentQuestion}: What is the capital of Pakistan?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <RadioGroup defaultValue="option1" className="space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded border-2 border-blue-600 hover:bg-blue-50 bg-white">
                <RadioGroupItem value="option1" id="option1" className="border-blue-600 text-blue-600" />
                <Label htmlFor="option1" className="flex-1 cursor-pointer text-black">
                  A. Karachi
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded border-2 border-blue-600 hover:bg-blue-50 bg-white">
                <RadioGroupItem value="option2" id="option2" className="border-blue-600 text-blue-600" />
                <Label htmlFor="option2" className="flex-1 cursor-pointer text-black">
                  B. Islamabad
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded border-2 border-blue-600 hover:bg-blue-50 bg-white">
                <RadioGroupItem value="option3" id="option3" className="border-blue-600 text-blue-600" />
                <Label htmlFor="option3" className="flex-1 cursor-pointer text-black">
                  C. Lahore
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded border-2 border-blue-600 hover:bg-blue-50 bg-white">
                <RadioGroupItem value="option4" id="option4" className="border-blue-600 text-blue-600" />
                <Label htmlFor="option4" className="flex-1 cursor-pointer text-black">
                  D. Peshawar
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 border-2 border-blue-600 rounded text-black">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>Your camera is being monitored for verification</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            disabled={currentQuestion === 1}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            className="bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Previous
          </Button>
          <Button 
            onClick={() => setCurrentQuestion(currentQuestion + 1)} 
            disabled={currentQuestion === totalQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next
          </Button>
        </div>

        {/* Question Navigation Grid */}
        <Card className="border-blue-600 bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="text-base">Question Navigation</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 rounded border-2 text-sm font-medium ${
                    i + 1 === currentQuestion
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-black border-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => setCurrentQuestion(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
