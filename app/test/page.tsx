"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, Flag, CheckCircle, Video, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function TestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState(45 * 60); // Default 45 mins
  
  // Test State
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answer
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [violations, setViolations] = useState<string[]>([]);
  const [lockedUpToIdx, setLockedUpToIdx] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const name = localStorage.getItem("studentName");
        const roll = localStorage.getItem("rollNumber");
        const score = localStorage.getItem("testScore");
        
        if (!name || !roll) {
          router.push("/student/verify");
          return;
        }

        if (score !== null) {
          router.push("/student/portal");
          return;
        }
        
        setStudentName(name);
        setRollNumber(roll);

        const res = await fetch("/api/student/test-data");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/student/verify");
            return;
          }
          throw new Error("Failed to fetch test data");
        }
        const data = await res.json();
        setTestData(data.test);
        setQuestions(data.questions);
        
        const savedTime = localStorage.getItem("testTimeLeft");
        if (savedTime) {
          setTimeLeft(parseInt(savedTime, 10));
        } else {
          setTimeLeft(data.test.durationMinutes * 60);
        }

        const savedAnswers = localStorage.getItem("testAnswers");
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
        
        setLoading(false);
      } catch (err) {
        toast.error("Failed to load test. Please try again.");
      }
    };
    
    fetchTest();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      initCamera();
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => console.log("Fullscreen request denied", err));
      }
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [loading]);

  // Proctoring: Visibility Change (Tab Switching)
  useEffect(() => {
    if (loading) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordViolation("Tab switched or browser minimized");
      }
    };
    const handleBlur = () => recordViolation("Window lost focus");
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
  }, [loading]);

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
    if (loading || submitting) return;
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
  }, [timeLeft, loading, submitting]);

  const currentQ = questions[currentQuestionIdx];

  const handleAnswerSelect = (value: string) => {
    if (currentQuestionIdx <= lockedUpToIdx) return;
    if (!currentQ) return;
    
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    localStorage.setItem("testAnswers", JSON.stringify(newAnswers));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestionIdx]: !prev[currentQuestionIdx]
    }));
  };

  const handleFinalSubmit = useCallback(async (autoSubmit = false) => {
    if (!autoSubmit && !confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/submit-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: testData?.id,
          answers,
          autoSubmit,
          violations
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit test");
      }

      localStorage.setItem("testSubmitted", "true");
      localStorage.setItem("testScore", data.score.toString());
      localStorage.setItem("testPercentage", data.percentage.toString());
      localStorage.setItem("testPassed", data.isPassed ? "true" : "false");
      
      if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.log(err));
      }

      router.push("/result");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit. Check connection.");
      setSubmitting(false);
    }
  }, [answers, router, testData, violations]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center text-blue-600">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Preparing Your Test...</h2>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl text-red-600 font-bold">No questions found for this test.</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{testData?.title || "Entrance Test"}</h1>
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

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            <Card className="border-gray-200 shadow-md bg-white w-full">
              <CardHeader className="bg-blue-600 text-white rounded-t-xl px-6 py-4 flex flex-row justify-between items-center">
                <CardTitle className="text-lg font-medium">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </CardTitle>
                <div className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">Marks: {currentQ?.marks || 1}</div>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8">
                <p className="text-lg text-gray-800 mb-8 font-medium">
                    {currentQ?.text}
                </p>
                
                <RadioGroup 
                    value={answers[currentQ?.id] || ""} 
                    onValueChange={handleAnswerSelect}
                    className="space-y-4"
                >
                  {currentQ?.options?.map((option: string, idx: number) => (
                      <div 
                        key={idx}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            answers[currentQ?.id] === option 
                                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white'
                        }`}
                      >
                        <RadioGroupItem value={option} id={`option-${idx}`} className="border-gray-400 text-blue-600 data-[state=checked]:border-blue-600 w-5 h-5" />
                        <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-gray-700 text-base font-medium pt-0.5">
                          {option}
                        </Label>
                      </div>
                  ))}
                </RadioGroup>
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6 flex flex-wrap justify-between items-center gap-4 rounded-b-xl">
                <Button 
                    variant="outline" 
                    onClick={toggleMarkForReview}
                    className={`flex items-center gap-2 transition-colors ${markedForReview[currentQuestionIdx] ? 'border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                >
                    <Flag className="w-4 h-4" />
                    {markedForReview[currentQuestionIdx] ? 'Unmark Review' : 'Mark for Review'}
                </Button>
                
                <div className="flex gap-3">
                    <Button 
                        onClick={() => {
                          if (currentQuestionIdx > lockedUpToIdx) {
                            setLockedUpToIdx(currentQuestionIdx);
                          }
                          setCurrentQuestionIdx(currentQuestionIdx + 1);
                        }} 
                        disabled={currentQuestionIdx === questions.length - 1}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-32 shadow-sm"
                    >
                        Save & Next →
                    </Button>
                </div>
              </CardFooter>
            </Card>
          </main>
      </div>

      <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col h-screen shadow-lg z-20 overflow-y-auto">
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
                     <span>Violations detected. Session flagged.</span>
                 </div>
             )}
          </div>

          <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Question Palette</h3>
              
              <div className="grid grid-cols-5 gap-2 overflow-y-auto flex-1 content-start pr-1 pb-4">
                {questions.map((q, idx) => {
                  const qNum = idx + 1;
                  const isAnswered = !!answers[q.id];
                  const isMarked = markedForReview[idx];
                  const isCurrent = currentQuestionIdx === idx;
                  const isLocked = idx <= lockedUpToIdx;

                  let btnClass = "bg-white border-gray-300 text-gray-600 hover:bg-gray-100";
                  if (isCurrent) btnClass = "ring-2 ring-blue-600 ring-offset-1 border-blue-600 bg-blue-50 text-blue-700 font-bold";
                  else if (isLocked) btnClass = "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed";
                  else if (isMarked) btnClass = "bg-orange-100 border-orange-400 text-orange-700";
                  else if (isAnswered) btnClass = "bg-green-100 border-green-400 text-green-700";

                  return (
                    <button
                      key={q.id}
                      onClick={() => { if (!isLocked) setCurrentQuestionIdx(idx); }}
                      disabled={isLocked}
                      className={`w-10 h-10 rounded border text-sm font-semibold transition-all ${btnClass}`}
                      title={isLocked ? "This question is locked" : `Question ${qNum}`}
                    >
                      {isLocked ? <Lock className="w-4 h-4 mx-auto" /> : qNum}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2 space-y-2 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 border border-green-400"></div> Answered</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white border border-gray-300"></div> Not Answered</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-200 border border-gray-300 flex items-center justify-center"><Lock className="w-2 h-2 text-gray-500" /></div> Locked</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded ring-2 ring-blue-600 bg-blue-50"></div> Current Question</div>
              </div>
              
              <div className="mt-6">
                <Button 
                    onClick={() => handleFinalSubmit(false)}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-md"
                >
                    {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    {submitting ? "Submitting..." : "Submit Test"}
                </Button>
              </div>
          </div>
      </div>
    </div>
  );
}
