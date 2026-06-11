"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, ShieldAlert, Flag, CheckCircle, Video } from "lucide-react";
import { toast } from "sonner";

export default function TestPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 50;
  
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  
  // Test State
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [violations, setViolations] = useState<string[]>([]);
  const [lockedUpTo, setLockedUpTo] = useState(0); // Questions up to this number are locked
  
  const videoRef = useRef<HTMLVideoElement>(null);

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
    
    // Load saved test state if exists
    const savedAnswers = localStorage.getItem("testAnswers");
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    
    const savedTime = localStorage.getItem("testTimeLeft");
    if (savedTime) setTimeLeft(parseInt(savedTime, 10));

    // Initialize Camera
    initCamera();

    // Set full screen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log("Fullscreen request denied", err));
    }

    return () => {
      // Cleanup camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [router]);

  // Proctoring: Visibility Change (Tab Switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordViolation("Tab switched or browser minimized");
      }
    };
    
    const handleBlur = () => {
        recordViolation("Window lost focus");
    };

    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        toast.error("Right click is disabled during the test.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const recordViolation = (reason: string) => {
    const timeString = new Date().toLocaleTimeString();
    const violation = `${timeString} - ${reason}`;
    setViolations(prev => {
        const newViolations = [...prev, violation];
        localStorage.setItem("testViolations", JSON.stringify(newViolations));
        return newViolations;
    });
    toast.error(`Violation Warning: ${reason}`);
  };

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      recordViolation("Camera access disabled or blocked");
    }
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        localStorage.setItem("testTimeLeft", newTime.toString());
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (value: string) => {
    // Don't allow changing locked questions
    if (currentQuestion <= lockedUpTo) return;
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    localStorage.setItem("testAnswers", JSON.stringify(newAnswers));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion]: !prev[currentQuestion]
    }));
  };

  const handleFinalSubmit = useCallback((autoSubmit = false) => {
    if (!autoSubmit && !confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
      return;
    }
    
    // Save submission records
    localStorage.setItem("testSubmitted", "true");
    
    // Calculate score (mock)
    const score = Object.keys(answers).length * 2; // Each answer gets 2 marks for demo
    localStorage.setItem("testScore", score.toString());
    
    // Exit full screen
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }

    router.push("/result");
  }, [answers, router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate Mock Question Data
  const getQuestionText = (num: number) => {
      return `Question ${num}: This is a sample question statement for question number ${num}. Please choose the most appropriate answer from the options below.`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Left Area: Main Test */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Entrance Test</h1>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-blue-600">{studentName}</span> | Roll#: {rollNumber}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg border-2 ${timeLeft < 300 ? 'border-red-500 text-red-600 bg-red-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono tracking-wider">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </header>

          {/* Main Question Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            <Card className="border-gray-200 shadow-md bg-white w-full">
              <CardHeader className="bg-blue-600 text-white rounded-t-xl px-6 py-4 flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-medium">
                  Question {currentQuestion} of {totalQuestions}
                </CardTitle>
                <div className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">Marks: 2.0</div>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8">
                <p className="text-lg text-gray-800 mb-8 font-medium">
                    {getQuestionText(currentQuestion)}
                </p>
                
                <RadioGroup 
                    value={answers[currentQuestion] || ""} 
                    onValueChange={handleAnswerSelect}
                    className="space-y-4"
                >
                  {['A', 'B', 'C', 'D'].map((option, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            answers[currentQuestion] === option 
                                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white'
                        }`}
                      >
                        <RadioGroupItem value={option} id={`option-${option}`} className="border-gray-400 text-blue-600 data-[state=checked]:border-blue-600 w-5 h-5" />
                        <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer text-gray-700 text-base font-medium pt-0.5">
                          {option}. Sample option description for choice {option}
                        </Label>
                      </div>
                  ))}
                </RadioGroup>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6 flex flex-wrap justify-between items-center gap-4 rounded-b-xl">
                <Button 
                    variant="outline" 
                    onClick={toggleMarkForReview}
                    className={`flex items-center gap-2 transition-colors ${markedForReview[currentQuestion] ? 'border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                >
                    <Flag className="w-4 h-4" />
                    {markedForReview[currentQuestion] ? 'Unmark Review' : 'Mark for Review'}
                </Button>
                
                <div className="flex gap-3">
                    <Button 
                        onClick={() => {
                          // Lock current question when moving to next
                          if (currentQuestion > lockedUpTo) {
                            setLockedUpTo(currentQuestion);
                          }
                          setCurrentQuestion(currentQuestion + 1);
                        }} 
                        disabled={currentQuestion === totalQuestions}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-32 shadow-sm"
                    >
                        Save & Next →
                    </Button>
                </div>
              </CardFooter>
            </Card>
          </main>
      </div>

      {/* Right Area: Sidebar */}
      <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col h-screen shadow-lg z-20 overflow-y-auto">
          {/* Proctoring Camera Window */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Video className="w-4 h-4" /> Proctoring</span>
                 {violations.length > 0 && (
                     <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">{violations.length} Violations</span>
                 )}
             </div>
             <div className="relative bg-black rounded-lg overflow-hidden aspect-video border-2 border-gray-300 shadow-inner flex items-center justify-center">
                 <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> Live
                 </div>
             </div>
             {violations.length > 0 && (
                 <div className="mt-2 flex items-center gap-2 text-xs text-red-600 font-medium p-2 bg-red-50 rounded border border-red-100">
                     <AlertTriangle className="w-4 h-4 shrink-0" />
                     <span>Violations detected. Your session is flagged.</span>
                 </div>
             )}
          </div>

          {/* Question Palette */}
          <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Question Palette</h3>
              
              <div className="grid grid-cols-5 gap-2 overflow-y-auto flex-1 content-start pr-1 pb-4">
                {Array.from({ length: totalQuestions }, (_, i) => {
                  const qNum = i + 1;
                  const isAnswered = !!answers[qNum];
                  const isMarked = markedForReview[qNum];
                  const isCurrent = currentQuestion === qNum;
                  
                  const isLocked = qNum <= lockedUpTo;

                  let btnClass = "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"; // Default
                  
                  if (isCurrent) {
                      btnClass = "ring-2 ring-blue-600 ring-offset-1 border-blue-600 bg-blue-50 text-blue-700 font-bold";
                  } else if (isLocked) {
                      btnClass = "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed";
                  } else if (isMarked) {
                      btnClass = "bg-orange-100 border-orange-400 text-orange-700";
                  } else if (isAnswered) {
                      btnClass = "bg-green-100 border-green-400 text-green-700";
                  }

                  return (
                    <button
                      key={qNum}
                      onClick={() => {
                        if (!isLocked) setCurrentQuestion(qNum);
                      }}
                      disabled={isLocked}
                      className={`w-10 h-10 rounded border text-sm font-semibold transition-all ${btnClass}`}
                      title={isLocked ? "This question is locked" : `Question ${qNum}`}
                    >
                      {isLocked ? "🔒" : qNum}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="border-t border-gray-200 pt-4 mt-2 space-y-2 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-400"></div> Answered</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white border border-gray-300"></div> Not Answered</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-200 border border-gray-300"></div> 🔒 Locked</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded ring-2 ring-blue-600 bg-blue-50"></div> Current Question</div>
              </div>
              
              <div className="mt-6">
                <Button 
                    onClick={() => handleFinalSubmit(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-md"
                >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Test
                </Button>
              </div>
          </div>
      </div>
    </div>
  );
}
