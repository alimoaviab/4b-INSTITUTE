"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("adminToken");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, error.error || "Request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi<{ token: string; admin: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => fetchApi<any>("/auth/me"),

  // Students
  getStudents: () => fetchApi<any[]>("/students"),
  
  getStudent: (id: number) => fetchApi<any>(`/students/${id}`),

  // Applications
  getApplications: () => fetchApi<any[]>("/applications"),
  
  updateApplicationStatus: (id: number, status: string) =>
    fetchApi<any>(`/applications/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Questions
  getQuestions: () => fetchApi<any[]>("/questions"),
  
  createQuestion: (data: any) =>
    fetchApi<any>("/questions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateQuestion: (id: number, data: any) =>
    fetchApi<any>(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteQuestion: (id: number) =>
    fetchApi<void>(`/questions/${id}`, {
      method: "DELETE",
    }),

  // Tests
  getTests: () => fetchApi<any[]>("/tests"),
  
  createTest: (data: any) =>
    fetchApi<any>("/tests", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Results
  getResults: () => fetchApi<any[]>("/results"),
  
  getResult: (id: number) => fetchApi<any>(`/results/${id}`),

  // Interviews
  getInterviews: () => fetchApi<any[]>("/interviews"),
  
  scheduleInterview: (data: any) =>
    fetchApi<any>("/interviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateInterview: (id: number, data: any) =>
    fetchApi<any>(`/interviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Violations
  getViolations: () => fetchApi<any[]>("/violations"),

  // Verification Logs
  getVerificationLogs: () => fetchApi<any[]>("/verification"),

  // Dashboard
  getDashboardStats: () => fetchApi<any>("/dashboard/stats"),
};
