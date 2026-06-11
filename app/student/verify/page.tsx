"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ShieldAlert } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [cnic, setCnic] = useState("");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied. Please allow camera access to continue.");
    }
  };

  const handleProceed = () => {
    if (!rollNumber || !cnic) {
      alert("Please enter both Roll Number and CNIC");
      return;
    }
    if (!cameraActive) {
      alert("Please enable camera verification");
      return;
    }
    // Save to localStorage for next page
    localStorage.setItem("rollNumber", rollNumber);
    localStorage.setItem("cnic", cnic);
    router.push("/student/register");
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
          <h1 className="text-3xl font-bold text-black">Identity Verification</h1>
          <p className="text-black mt-2">Please verify your identity to proceed</p>
        </div>

        {/* Camera Verification */}
        <Card className="border-blue-600 bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="aspect-video bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-blue-600">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-black mb-4">Camera not active</p>
                    <Button 
                      onClick={startCamera}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Enable Camera
                    </Button>
                  </div>
                )}
              </div>
              {cameraActive && (
                <div className="text-center text-green-600 font-medium">
                  ✓ Camera Active
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roll Number and CNIC Form */}
        <Card className="border-blue-600 bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-black font-medium">
                Roll Number *
              </Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="border-blue-600 text-black bg-white focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic" className="text-black font-medium">
                CNIC Number *
              </Label>
              <Input
                id="cnic"
                type="text"
                placeholder="XXXXX-XXXXXXX-X"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                maxLength={15}
                className="border-blue-600 text-black bg-white focus:ring-blue-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <div className="text-center">
          <Button
            onClick={handleProceed}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Proceed to Registration
          </Button>
        </div>
      </div>
    </div>
  );
}
