"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, BookOpen, ShieldAlert, Camera } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    rollNumber: "",
    cnic: "",
    name: "",
    fatherName: "",
    gender: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    const savedRollNumber = localStorage.getItem("rollNumber");
    const savedCnic = localStorage.getItem("cnic");
    
    if (!savedRollNumber || !savedCnic) {
      router.push("/");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      rollNumber: savedRollNumber,
      cnic: savedCnic,
    }));
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.fatherName || !formData.gender || !formData.dateOfBirth) {
      alert("Please fill all required fields.");
      return;
    }
    
    Object.keys(formData).forEach(key => {
      localStorage.setItem(key, formData[key as keyof typeof formData]);
    });
    localStorage.setItem("studentName", formData.name);
    
    router.push("/student/instructions");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#ffffff" }}>
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-xl tracking-tight">
          <BookOpen className="w-6 h-6" />
          <span className="text-gray-900">University Admission Portal</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <ShieldAlert className="w-4 h-4" />
          Admin Panel
        </Button>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Personal Details</h1>
          <p className="text-gray-500">Please fill in your personal information to continue.</p>
        </div>

        <Card className="border-gray-200 shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-blue-600 text-white p-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5" /> Personal Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex justify-center mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 cursor-pointer bg-gray-50 transition-colors">
                   <Camera className="w-8 h-8 mb-2" />
                   <span className="text-xs font-medium">Upload Photo</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Roll Number</Label>
                <Input value={formData.rollNumber} disabled className="bg-gray-100 font-mono text-gray-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">CNIC / B-Form</Label>
                <Input value={formData.cnic} disabled className="bg-gray-100 font-mono text-gray-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => handleChange("name", e.target.value)} 
                  placeholder="e.g. Ahmed Ali"
                  style={{ backgroundColor: "#ffffff", color: "#111827" }}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Father Name <span className="text-red-500">*</span></Label>
                <Input 
                  value={formData.fatherName} 
                  onChange={(e) => handleChange("fatherName", e.target.value)} 
                  placeholder="e.g. Muhammad Ali"
                  style={{ backgroundColor: "#ffffff", color: "#111827" }}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Gender <span className="text-red-500">*</span></Label>
                <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Date of Birth <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  value={formData.dateOfBirth} 
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)} 
                  style={{ backgroundColor: "#ffffff", color: "#111827" }}
                  className="border-gray-300"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t border-gray-100 p-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8"
            >
              Save & Continue →
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
