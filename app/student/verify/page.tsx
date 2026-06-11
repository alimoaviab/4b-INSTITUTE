"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ShieldAlert, CheckCircle } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied. Please allow camera access in browser settings.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleProceed = () => {
    if (!rollNumber || !cnic) {
      alert("Please enter both Roll Number and CNIC");
      return;
    }
    if (!cameraActive) {
      alert("Please enable camera verification");
      return;
    }
    
    // Save to localStorage
    localStorage.setItem("rollNumber", rollNumber);
    localStorage.setItem("cnic", cnic);
    
    // Stop camera before navigation
    stopCamera();
    
    router.push("/student/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with Admin Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Identity Verification</h1>
            <p className="text-gray-600 mt-1">Please verify your identity to proceed</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>
        </div>

        {/* Camera Verification Card */}
        <Card className="border-2 border-blue-600 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-6 h-6" />
              Camera Verification
              {cameraActive && (
                <span className="ml-auto flex items-center gap-1 text-sm bg-green-500 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden border-4 border-blue-200 shadow-inner">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-6">
                  <div className="bg-blue-600 p-6 rounded-full mb-4">
                    <Camera className="w-16 h-16" />
                  </div>
                  <p className="text-xl font-semibold mb-2">Camera Not Active</p>
                  <p className="text-gray-300 text-center mb-6">
                    Click the button below to enable your camera
                  </p>
                  <Button 
                    onClick={startCamera}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    Enable Camera
                  </Button>
                </div>
              )}
            </div>
            
            {cameraActive && (
              <div className="mt-4 flex justify-center">
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Stop Camera
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Information Card */}
        <Card className="border-2 border-blue-600 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="text-lg">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-gray-900 font-semibold text-base">
                Roll Number <span className="text-red-600">*</span>
              </Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="border-2 border-blue-600 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic" className="text-gray-900 font-semibold text-base">
                CNIC Number <span className="text-red-600">*</span>
              </Label>
              <Input
                id="cnic"
                type="text"
                placeholder="XXXXX-XXXXXXX-X"
                value={cnic}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d-]/g, '');
                  if (value.length <= 15) {
                    setCnic(value);
                  }
                }}
                maxLength={15}
                className="border-2 border-blue-600 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 h-12 text-base"
              />
              <p className="text-sm text-gray-500">Format: 42101-1234567-8</p>
            </div>
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 text-lg font-semibold shadow-lg"
          disabled={!rollNumber || !cnic || !cameraActive}
        >
          Proceed to Registration →
        </Button>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
          <p className="text-gray-700 text-sm">
            <strong>Note:</strong> Camera verification is mandatory. Please ensure your face is clearly visible.
          </p>
        </div>
      </div>
    </div>
  );
}
