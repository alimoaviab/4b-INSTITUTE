"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [rollNumber, setRollNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    // Get data from previous page
    const savedRollNumber = localStorage.getItem("rollNumber");
    const savedCnic = localStorage.getItem("cnic");
    
    if (!savedRollNumber || !savedCnic) {
      router.push("/student/verify");
      return;
    }
    
    setRollNumber(savedRollNumber);
    setCnic(savedCnic);
  }, [router]);

  const handleStartTest = () => {
    if (!name || !fatherName || !gender || !dateOfBirth) {
      alert("Please fill all required fields");
      return;
    }
    
    // Save registration data
    localStorage.setItem("studentName", name);
    localStorage.setItem("fatherName", fatherName);
    localStorage.setItem("gender", gender);
    localStorage.setItem("dateOfBirth", dateOfBirth);
    
    router.push("/test");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Admin Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="flex items-center gap-2 bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Panel
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Student Registration</h1>
          <p className="text-black mt-2">Complete your registration to start the test</p>
        </div>

        {/* Display Roll Number and CNIC */}
        <Card className="border-blue-600 bg-blue-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-black">
              <div>
                <span className="font-medium">Roll Number:</span> {rollNumber}
              </div>
              <div>
                <span className="font-medium">CNIC:</span> {cnic}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card className="border-blue-600 bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-blue-600 text-black bg-white focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherName" className="text-black font-medium">
                Father Name *
              </Label>
              <Input
                id="fatherName"
                type="text"
                placeholder="Enter father's name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="border-blue-600 text-black bg-white focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-medium">Gender *</Label>
              <RadioGroup value={gender} onValueChange={setGender}>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" className="border-blue-600 text-blue-600" />
                    <Label htmlFor="male" className="text-black cursor-pointer">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" className="border-blue-600 text-blue-600" />
                    <Label htmlFor="female" className="text-black cursor-pointer">
                      Female
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" className="border-blue-600 text-blue-600" />
                    <Label htmlFor="other" className="text-black cursor-pointer">
                      Other
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-black font-medium">
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="border-blue-600 text-black bg-white focus:ring-blue-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Start Test Button */}
        <div className="text-center">
          <Button
            onClick={handleStartTest}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}
