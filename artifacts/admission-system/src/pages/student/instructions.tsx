import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useGetActiveTest } from "@workspace/api-client-react";
import { CheckCircle2, AlertTriangle, Clock, Target, FileText } from "lucide-react";

export default function InstructionsPage() {
  const [, setLocation] = useLocation();
  const { data: test, isLoading } = useGetActiveTest();

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading...</div>;
  if (!test) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">No Active Test</h2>
          <p className="text-slate-500 mt-2">There is no entry test currently scheduled. Please check back later or contact administration.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="max-w-3xl w-full shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-slate-900">{test.title}</CardTitle>
          <CardDescription className="text-base mt-2">Read the instructions carefully before starting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-100 rounded-lg">
            <div className="text-center">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm text-slate-500">Duration</div>
              <div className="font-semibold text-slate-900">{test.durationMinutes} Mins</div>
            </div>
            <div className="text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm text-slate-500">Questions</div>
              <div className="font-semibold text-slate-900">{test.questionCount || 0}</div>
            </div>
            <div className="text-center">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-sm text-slate-500">Total Marks</div>
              <div className="font-semibold text-slate-900">{test.totalMarks}</div>
            </div>
            <div className="text-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm text-slate-500">Passing Marks</div>
              <div className="font-semibold text-emerald-600">{test.passingMarks}</div>
            </div>
          </div>

          <div className="prose max-w-none text-slate-700">
            <h3 className="text-lg font-semibold text-slate-900">Rules & Guidelines</h3>
            <ul className="list-disc pl-5 space-y-2 mt-4">
              <li>Do not refresh the page or navigate away once the test begins.</li>
              <li>Your webcam must remain active for proctoring throughout the test.</li>
              <li>Ensure you have a stable internet connection. If disconnected, your session state is saved, but the timer will continue.</li>
              <li>You can mark questions for review and revisit them before final submission.</li>
              <li>The test will automatically submit when the timer reaches zero.</li>
              <li>{test.instructions || "Any form of cheating or unfair means will result in immediate disqualification."}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 bg-slate-50 rounded-b-lg">
          <Button variant="outline" onClick={() => setLocation("/student/dashboard")}>Back to Dashboard</Button>
          <Button size="lg" className="text-lg px-8" onClick={() => setLocation("/test")}>Start Test Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
