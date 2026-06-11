"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Entrance Test</h1>
            <p className="text-slate-500">Question {currentQuestion} of {totalQuestions}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">45:30</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/admin/login")}
              className="flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Panel
            </Button>
            <Button variant="destructive" size="sm">
              Submit Test
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Question {currentQuestion}: What is the capital of Pakistan?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="option1" className="space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded border hover:bg-slate-50">
                <RadioGroupItem value="option1" id="option1" />
                <Label htmlFor="option1" className="flex-1 cursor-pointer">
                  A. Karachi
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded border hover:bg-slate-50">
                <RadioGroupItem value="option2" id="option2" />
                <Label htmlFor="option2" className="flex-1 cursor-pointer">
                  B. Islamabad
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded border hover:bg-slate-50">
                <RadioGroupItem value="option3" id="option3" />
                <Label htmlFor="option3" className="flex-1 cursor-pointer">
                  C. Lahore
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded border hover:bg-slate-50">
                <RadioGroupItem value="option4" id="option4" />
                <Label htmlFor="option4" className="flex-1 cursor-pointer">
                  D. Peshawar
                </Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              <AlertCircle className="w-4 h-4" />
              <span>Your camera is being monitored for verification</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" disabled={currentQuestion === 1}>
            Previous
          </Button>
          <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={currentQuestion === totalQuestions}>
            Next
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 rounded border text-sm font-medium ${
                    i + 1 === currentQuestion
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-slate-50"
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
