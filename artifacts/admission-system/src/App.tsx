import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import NotFound from "@/pages/not-found";
import VerifyPage from "@/pages/student/verify";
import ProfilePage from "@/pages/student/profile";
import RegisterPage from "@/pages/student/register";
import InstructionsPage from "@/pages/student/instructions";
import TestPage from "@/pages/student/test";
import ResultPage from "@/pages/student/result";
import StudentDashboard from "@/pages/student/dashboard";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminStudents from "@/pages/admin/students";
import AdminApplications from "@/pages/admin/applications";
import AdminQuestions from "@/pages/admin/questions";
import AdminTests from "@/pages/admin/tests";
import AdminResults from "@/pages/admin/results";
import AdminInterviews from "@/pages/admin/interviews";
import AdminViolations from "@/pages/admin/violations";
import AdminVerificationLogs from "@/pages/admin/verification-logs";
import { AdminLayout } from "@/components/admin-layout";

const queryClient = new QueryClient();

// Setup base URL for production
if (import.meta.env.VITE_API_URL) {
  const { setBaseUrl } = await import("@workspace/api-client-react");
  setBaseUrl(import.meta.env.VITE_API_URL);
}

// Setup auth token for API client
setAuthTokenGetter(() => localStorage.getItem("admin_token"));

function AdminRoute({ component: Component }: { component: any }) {
  const [location, setLocation] = useLocation();
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token && location.startsWith("/admin") && location !== "/admin/login") {
      setLocation("/admin/login");
    }
  }, [token, location, setLocation]);

  if (!token && location !== "/admin/login") {
    return null;
  }

  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={VerifyPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/student/profile" component={ProfilePage} />
      <Route path="/instructions" component={InstructionsPage} />
      <Route path="/test" component={TestPage} />
      <Route path="/result" component={ResultPage} />
      <Route path="/student/dashboard" component={StudentDashboard} />

      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/students" component={() => <AdminRoute component={AdminStudents} />} />
      <Route path="/admin/applications" component={() => <AdminRoute component={AdminApplications} />} />
      <Route path="/admin/questions" component={() => <AdminRoute component={AdminQuestions} />} />
      <Route path="/admin/tests" component={() => <AdminRoute component={AdminTests} />} />
      <Route path="/admin/results" component={() => <AdminRoute component={AdminResults} />} />
      <Route path="/admin/interviews" component={() => <AdminRoute component={AdminInterviews} />} />
      <Route path="/admin/violations" component={() => <AdminRoute component={AdminViolations} />} />
      <Route path="/admin/verification-logs" component={() => <AdminRoute component={AdminVerificationLogs} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
