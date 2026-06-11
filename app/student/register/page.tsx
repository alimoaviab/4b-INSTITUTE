"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ShieldAlert, BookOpen, MapPin, CheckCircle, Camera, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    rollNumber: "",
    cnic: "",
    name: "",
    fatherName: "",
    gender: "",
    dateOfBirth: "",
    photo: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    district: "",
    province: "",
    schoolName: "",
    previousClass: "",
    board: "",
    passingYear: "",
    obtainedMarks: "",
    totalMarks: "",
    percentage: "",
    program: "",
    campus: "",
    guardianName: "",
    guardianContact: "",
  });

  useEffect(() => {
    // Get data from previous verification
    const savedRollNumber = localStorage.getItem("rollNumber");
    const savedCnic = localStorage.getItem("cnic");
    
    if (!savedRollNumber || !savedCnic) {
      router.push("/student/verify");
      return;
    }

    // Load drafts if available
    const draft = localStorage.getItem("registrationDraft");
    if (draft) {
      setFormData(JSON.parse(draft));
    } else {
      setFormData((prev) => ({
        ...prev,
        rollNumber: savedRollNumber,
        cnic: savedCnic,
      }));
    }
  }, [router]);

  // Auto save draft on change
  useEffect(() => {
    if (formData.rollNumber) {
      localStorage.setItem("registrationDraft", JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto calculate percentage
      if (field === 'obtainedMarks' || field === 'totalMarks') {
        const obtained = parseFloat(field === 'obtainedMarks' ? value : updated.obtainedMarks);
        const total = parseFloat(field === 'totalMarks' ? value : updated.totalMarks);
        if (obtained && total && total > 0) {
          updated.percentage = ((obtained / total) * 100).toFixed(2);
        } else {
          updated.percentage = "";
        }
      }
      
      return updated;
    });
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && (!formData.name || !formData.fatherName || !formData.gender || !formData.dateOfBirth)) {
      alert("Please fill all required personal details.");
      return;
    }
    if (step === 2 && (!formData.phone || !formData.email || !formData.city || !formData.province)) {
      alert("Please fill all required contact details.");
      return;
    }
    if (step === 3 && (!formData.schoolName || !formData.passingYear || !formData.percentage)) {
      alert("Please fill all required academic details.");
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinish = () => {
    if (!formData.program || !formData.campus) {
      alert("Please select a program and campus.");
      return;
    }
    // Save final registration data to localStorage
    Object.keys(formData).forEach(key => {
      localStorage.setItem(key, formData[key as keyof typeof formData]);
    });
    localStorage.setItem("studentName", formData.name);
    
    // Redirect to instructions
    router.push("/student/instructions");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-xl tracking-tight">
          <BookOpen className="w-6 h-6" />
          <span>University Admission Portal</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/admin/login")}
          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ShieldAlert className="w-4 h-4" />
          Admin Panel
        </Button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admission Registration</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Please complete all steps of the admission form carefully. Your progress is automatically saved.</p>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
          
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors duration-300 ${
                  i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle className="w-5 h-5" /> : i}
                </div>
                <span className={`text-xs font-semibold ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                  {i === 1 && 'Personal'}
                  {i === 2 && 'Contact'}
                  {i === 3 && 'Academic'}
                  {i === 4 && 'Details'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-gray-200 shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-blue-600 text-white p-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              {step === 1 && <><User className="w-5 h-5" /> Personal Details</>}
              {step === 2 && <><MapPin className="w-5 h-5" /> Contact Details</>}
              {step === 3 && <><BookOpen className="w-5 h-5" /> Academic Records</>}
              {step === 4 && <><CheckCircle className="w-5 h-5" /> Additional Information</>}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
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
                      <Label className="text-gray-700 font-semibold">Full Name *</Label>
                      <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. John Doe" className="border-gray-300 focus:ring-blue-600 focus:border-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Father Name *</Label>
                      <Input value={formData.fatherName} onChange={(e) => handleChange("fatherName", e.target.value)} placeholder="e.g. Robert Doe" className="border-gray-300 focus:ring-blue-600 focus:border-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Gender *</Label>
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
                      <Label className="text-gray-700 font-semibold">Date of Birth *</Label>
                      <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} className="border-gray-300 focus:ring-blue-600 focus:border-blue-600" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Phone Number *</Label>
                      <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="03XX-XXXXXXX" className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">WhatsApp Number</Label>
                      <Input value={formData.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} placeholder="03XX-XXXXXXX" className="border-gray-300" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 font-semibold">Email Address *</Label>
                      <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="student@example.com" className="border-gray-300" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 font-semibold">Complete Address</Label>
                      <Input value={formData.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="House No, Street, Area" className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">City *</Label>
                      <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">District</Label>
                      <Input value={formData.district} onChange={(e) => handleChange("district", e.target.value)} className="border-gray-300" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 font-semibold">Province *</Label>
                      <Select value={formData.province} onValueChange={(v) => handleChange("province", v)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sindh">Sindh</SelectItem>
                          <SelectItem value="punjab">Punjab</SelectItem>
                          <SelectItem value="balochistan">Balochistan</SelectItem>
                          <SelectItem value="kpk">Khyber Pakhtunkhwa</SelectItem>
                          <SelectItem value="gilgit">Gilgit Baltistan</SelectItem>
                          <SelectItem value="ajk">Azad Kashmir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 font-semibold">School / College Name *</Label>
                      <Input value={formData.schoolName} onChange={(e) => handleChange("schoolName", e.target.value)} className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Previous Class *</Label>
                      <Select value={formData.previousClass} onValueChange={(v) => handleChange("previousClass", v)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="matric">Matriculation</SelectItem>
                          <SelectItem value="intermediate">Intermediate / HSSC</SelectItem>
                          <SelectItem value="olevel">O-Levels</SelectItem>
                          <SelectItem value="alevel">A-Levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Board *</Label>
                      <Input value={formData.board} onChange={(e) => handleChange("board", e.target.value)} placeholder="e.g. Federal Board" className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Passing Year *</Label>
                      <Input type="number" value={formData.passingYear} onChange={(e) => handleChange("passingYear", e.target.value)} placeholder="YYYY" className="border-gray-300" />
                    </div>
                    <div className="space-y-2"></div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Obtained Marks *</Label>
                      <Input type="number" value={formData.obtainedMarks} onChange={(e) => handleChange("obtainedMarks", e.target.value)} className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Total Marks *</Label>
                      <Input type="number" value={formData.totalMarks} onChange={(e) => handleChange("totalMarks", e.target.value)} className="border-gray-300" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-700 font-semibold">Percentage</Label>
                      <Input value={formData.percentage ? formData.percentage + "%" : ""} disabled className="bg-blue-50 text-blue-700 font-bold border-blue-200" />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Program Selection *</Label>
                      <Select value={formData.program} onValueChange={(v) => handleChange("program", v)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bscs">BS Computer Science</SelectItem>
                          <SelectItem value="bsse">BS Software Engineering</SelectItem>
                          <SelectItem value="bba">Bachelor of Business Administration</SelectItem>
                          <SelectItem value="bsai">BS Artificial Intelligence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Campus Selection *</Label>
                      <Select value={formData.campus} onValueChange={(v) => handleChange("campus", v)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select campus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main Campus</SelectItem>
                          <SelectItem value="city">City Campus</SelectItem>
                          <SelectItem value="north">North Campus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Guardian Name</Label>
                      <Input value={formData.guardianName} onChange={(e) => handleChange("guardianName", e.target.value)} className="border-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-semibold">Guardian Contact Number</Label>
                      <Input value={formData.guardianContact} onChange={(e) => handleChange("guardianContact", e.target.value)} className="border-gray-300" />
                    </div>
                    
                    <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 mt-4">
                       <ShieldAlert className="w-6 h-6 text-blue-600 flex-shrink-0" />
                       <div className="text-sm text-blue-800">
                         <p className="font-bold mb-1">Declaration</p>
                         <p>I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may lead to the cancellation of my admission.</p>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t border-gray-100 p-6 flex justify-between items-center">
             <Button
                variant="outline"
                onClick={handlePrev}
                disabled={step === 1}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Previous Step
             </Button>
             
             {step < totalSteps ? (
               <Button
                 onClick={handleNext}
                 className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8"
               >
                 Save & Continue
               </Button>
             ) : (
               <Button
                 onClick={handleFinish}
                 className="bg-green-600 hover:bg-green-700 text-white font-medium px-8"
               >
                 Submit Registration
               </Button>
             )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
