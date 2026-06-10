import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetResultByStudent } from "@workspace/api-client-react";
import { CheckCircle, XCircle, Trophy, ArrowRight } from "lucide-react";

export default function ResultPage() {
  const [, setLocation] = useLocation();
  const studentId = localStorage.getItem("student_id");
  
  const { data: result, isLoading } = useGetResultByStudent(parseInt(studentId || "0", 10), {
    query: { queryKey: ["result", parseInt(studentId || "0", 10)], enabled: !!studentId }
  });

  if (!studentId) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading result...</div>;
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold">Result Not Found</h2>
            <p className="text-slate-500 my-4">We couldn't find a result for your session. It might still be processing.</p>
            <Button onClick={() => setLocation("/student/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPass = result.status === "pass";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl overflow-hidden border-none">
        <div className={`h-3 ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto mb-4">
            {isPass ? (
              <div className="bg-emerald-100 p-4 rounded-full inline-block">
                <CheckCircle className="w-16 h-16 text-emerald-600" />
              </div>
            ) : (
              <div className="bg-rose-100 p-4 rounded-full inline-block">
                <XCircle className="w-16 h-16 text-rose-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">
            {isPass ? "Congratulations!" : "Test Completed"}
          </CardTitle>
          <p className="text-slate-500 mt-2 font-medium text-lg">
            {result.studentName} <span className="text-slate-400">({result.rollNumber})</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <div className="text-center mb-6">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Final Score</div>
              <div className="text-5xl font-extrabold text-slate-900">
                {result.totalScore}<span className="text-2xl text-slate-400 font-medium">/{result.totalMarks}</span>
              </div>
              <div className="text-primary font-semibold mt-2 text-lg">{result.percentage.toFixed(1)}%</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <div className="text-xs text-slate-500 font-medium">Status</div>
                <div className={`font-bold text-lg ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPass ? 'PASSED' : 'FAILED'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Required</div>
                <div className="font-bold text-lg text-slate-700">{result.passingMarks} Marks</div>
              </div>
            </div>
          </div>

          {isPass && result.rank && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
              <Trophy className="w-6 h-6 text-amber-500" />
              <div>
                <span className="font-semibold block">Merit List Position</span>
                <span className="text-sm">You are currently ranked #{result.rank}</span>
              </div>
            </div>
          )}

          <Button 
            className="w-full h-12 text-lg mt-4" 
            onClick={() => setLocation("/student/dashboard")}
          >
            Continue to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
