import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="text-center py-12">
            <CardTitle className="text-3xl font-bold text-slate-900">INSTITUTE OF 4B INFORMATION TECHNOLOGY</CardTitle>
            <CardDescription className="mt-4">
              The application form page has been removed. Please contact the institute for admission details.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 pb-12 px-8 text-center">
            <p className="text-slate-600 mb-6">
              This section is no longer available. If you need assistance, please reach out to administration or use the dashboard links.
            </p>
            <Button onClick={() => setLocation("/student/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
