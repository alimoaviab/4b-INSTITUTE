import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetActiveTest, useStartTestSession, useSaveAnswer, useSubmitTest } from "@workspace/api-client-react";
import { Clock, AlertTriangle, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function TestPage() {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { option: string, marked: boolean }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [questionTimers, setQuestionTimers] = useState<Record<number, number>>({});
  const [lockedAnswers, setLockedAnswers] = useState<Record<number, boolean>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIdxRef = useRef<number>(0);

  const studentId = localStorage.getItem("student_id");
  useEffect(() => {
    currentIdxRef.current = currentIdx;
  }, [currentIdx]);
  const { data: activeTest } = useGetActiveTest({ query: { queryKey: ["activeTest"], enabled: !!studentId } });
  const startSessionMutation = useStartTestSession();
  const saveAnswerMutation = useSaveAnswer();
  const submitTestMutation = useSubmitTest();

  useEffect(() => {
    // Enter fullscreen
    document.documentElement.requestFullscreen().catch(() => {});
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error("Camera access denied", err);
      });

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTest && studentId && !session) {
      startSessionMutation.mutateAsync({
        data: { studentId: parseInt(studentId, 10), testId: activeTest.id }
      }).then(res => {
        setSession(res);
        setQuestions(res.questions || []);
        
        // Initialize answers state from existing
        const ansMap: Record<number, any> = {};
        const lockedMap: Record<number, boolean> = {};
        res.answers?.forEach((a: any) => {
          ansMap[a.questionId] = { option: a.selectedOption, marked: a.markedForReview };
          if (a.selectedOption) {
            lockedMap[a.questionId] = false;
          }
        });
        setAnswers(ansMap);
        setLockedAnswers(lockedMap);

        // Timer logic
        const start = new Date(res.startedAt).getTime();
        const durationMs = activeTest.durationMinutes * 60 * 1000;
        const end = start + durationMs;
        const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
        const questionDuration = Math.max(1, Math.floor(totalSeconds / Math.max(1, res.questions?.length || 1)));

        const initialQuestionTimers: Record<number, number> = {};
        res.questions?.forEach((question: any) => {
          initialQuestionTimers[question.id] = questionDuration;
        });
        setQuestionTimers(initialQuestionTimers);
        setTimeLeft(totalSeconds);

        const updateTimer = () => {
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((end - now) / 1000));
          setTimeLeft(remaining);

          setQuestionTimers(prev => {
            const currentQuestion = res.questions?.[currentIdxRef.current]?.id;
            if (!currentQuestion) return prev;
            const currentLeft = Math.max(0, (prev[currentQuestion] ?? questionDuration) - 1);
            const updatedTimers = { ...prev, [currentQuestion]: currentLeft };

            if (currentLeft <= 0) {
              if (currentIdxRef.current === (res.questions?.length || 1) - 1) {
                handleAutoSubmit();
              } else {
                setCurrentIdx(idx => Math.min((res.questions?.length || 1) - 1, idx + 1));
              }
            }

            return updatedTimers;
          });

          if (remaining === 0) {
            handleAutoSubmit();
          }
        };
        
        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
      });
    }
  }, [activeTest, studentId]);

  const handleAutoSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!session?.id) return;
    try {
      await submitTestMutation.mutateAsync({ id: session.id, data: { autoSubmit: true } });
      setLocation("/result");
    } catch (e) {
      setLocation("/student/dashboard");
    }
  };

  const handleManualSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!session?.id) return;
    try {
      await submitTestMutation.mutateAsync({ id: session.id, data: { autoSubmit: false } });
      setLocation("/result");
    } catch (e) {
      setLocation("/student/dashboard");
    }
  };

  const handleSelectOption = (questionId: number, option: string) => {
    if (lockedAnswers[questionId]) return;
    setAnswers(prev => ({ ...prev, [questionId]: { option, marked: prev[questionId]?.marked ?? false } }));
    if (!session?.id) return;
    saveAnswerMutation.mutate({
      id: session.id,
      data: { questionId, selectedOption: option as any, markedForReview: answers[questionId]?.marked ?? false }
    });
  };

  const handleConfirmAnswer = (questionId: number) => {
    setLockedAnswers(prev => ({ ...prev, [questionId]: true }));
    const selectedOption = answers[questionId]?.option;
    if (!selectedOption || !session?.id) return;
    saveAnswerMutation.mutate({
      id: session.id,
      data: { questionId, selectedOption: selectedOption as any, markedForReview: answers[questionId]?.marked ?? false }
    });
  };

  const toggleMarkReview = (questionId: number) => {
    if (lockedAnswers[questionId]) return;
    const isMarked = !answers[questionId]?.marked;
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], marked: isMarked } }));
    if (answers[questionId]?.option && session?.id) {
      saveAnswerMutation.mutate({
        id: session.id,
        data: { questionId, selectedOption: answers[questionId].option as any, markedForReview: isMarked }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!session || questions.length === 0) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Initializing Test...</div>;
  }

  const currentQ = questions[currentIdx];
  const currentAns = answers[currentQ.id];
  const currentQuestionTime = questionTimers[currentQ.id] ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{activeTest?.title}</h1>
          <p className="text-sm text-slate-500">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg bg-slate-100 text-slate-700">
            <Clock className="w-5 h-5" />
            {formatTime(currentQuestionTime)}
          </div>
          <Button onClick={() => setShowConfirm(true)} variant="default">Submit Test</Button>
          <div className="w-32 h-18 bg-black rounded overflow-hidden border border-slate-300">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          <Card className="max-w-4xl mx-auto shadow-sm">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-medium text-slate-900 leading-relaxed">
                  <span className="text-primary mr-2 font-bold">{currentIdx + 1}.</span>
                  {currentQ.questionText}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={currentAns?.marked ? "bg-orange-100 text-orange-700 border-orange-200" : ""}
                  onClick={() => toggleMarkReview(currentQ.id)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {currentAns?.marked ? "Marked for Review" : "Mark for Review"}
                </Button>
              </div>

              <div className="space-y-3 mt-8">
                {['A', 'B', 'C', 'D'].map(opt => {
                  const optText = currentQ[`option${opt}` as keyof typeof currentQ];
                  const isSelected = currentAns?.option === opt;
                  const isLocked = lockedAnswers[currentQ.id];
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, opt)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 rounded-lg transition-all flex items-center ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                      } ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-semibold text-sm ${
                        isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt}
                      </div>
                      <span className="text-slate-700 text-lg">{optText as string}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="max-w-4xl mx-auto mt-6 flex flex-col gap-4 md:flex-row justify-between">
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button 
                variant={lockedAnswers[currentQ.id] ? "secondary" : "outline"}
                onClick={() => handleConfirmAnswer(currentQ.id)}
                disabled={!currentAns?.option || lockedAnswers[currentQ.id]}
              >
                {lockedAnswers[currentQ.id] ? "Answer Locked" : "Confirm Answer"}
              </Button>
            </div>
            <Button 
              onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
              disabled={currentIdx === questions.length - 1}
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Palette Sidebar */}
        <div className="w-80 bg-white border-l shadow-sm flex flex-col">
          <div className="p-4 border-b font-semibold text-slate-800">Question Palette</div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                let btnClass = "bg-slate-100 text-slate-600 border-transparent"; // unanswered
                if (idx === currentIdx) {
                  btnClass = "bg-primary text-white border-primary shadow-md"; // current
                } else if (ans?.marked) {
                  btnClass = "bg-orange-500 text-white border-orange-500"; // marked
                } else if (ans?.option) {
                  btnClass = "bg-blue-100 text-primary border-blue-200"; // answered
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 w-full rounded-md border font-medium text-sm flex items-center justify-center transition-colors ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t bg-slate-50 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary rounded" /> Current</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded" /> Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded" /> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-100 rounded" /> Not Visited / Unanswered</div>
          </div>
        </div>
      </main>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? You will not be able to change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleManualSubmit} disabled={submitTestMutation.isPending}>
              {submitTestMutation.isPending ? "Submitting..." : "Yes, Submit Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
