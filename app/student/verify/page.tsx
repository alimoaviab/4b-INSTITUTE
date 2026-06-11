"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("Requesting camera access...");
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });
      
      console.log("Camera access granted!", mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          console.log("Video playing");
        };
        
        setStream(mediaStream);
        setCameraActive(true);
        setError("");
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      
      let errorMessage = "Failed to access camera. ";
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage += "Please allow camera access in your browser settings.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMessage += "No camera found on your device.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMessage += "Camera is already in use by another application.";
      } else {
        errorMessage += err.message || "Unknown error occurred.";
      }
      
      setError(errorMessage);
      setCameraActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("Camera stopped");
      });
      setStream(null);
      setCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
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
      alert("Please enable camera verification first");
      return;
    }
    
    // Validate CNIC format (basic check)
    if (cnic.length < 13) {
      alert("Please enter a valid CNIC number");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Admin Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Identity Verification</h1>
            <p className="text-gray-600 mt-1">Please verify your identity to proceed with the test</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Panel
          </Button>
        </div>

        {/* Camera Verification Card */}
        <Card className="border-2 border-blue-600 shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Camera className="w-6 h-6" />
              Camera Verification
              {cameraActive && (
                <span className="ml-auto flex items-center gap-1 text-sm bg-green-500 px-3 py-1 rounded-full font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border-4 border-blue-200 shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className={`p-8 rounded-full mb-6 ${loading ? 'bg-yellow-600 animate-pulse' : 'bg-blue-600'}`}>
                    <Camera className="w-20 h-20" />
                  </div>
                  
                  {loading ? (
                    <>
                      <p className="text-2xl font-bold mb-2">Starting Camera...</p>
                      <p className="text-gray-300 text-center">Please allow camera access when prompted</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold mb-2">Camera Not Active</p>
                      <p className="text-gray-300 text-center mb-6 max-w-md">
                        Click the button below to activate your camera for identity verification
                      </p>
                      
                      {error && (
                        <div className="bg-red-500 border-2 border-red-300 rounded-lg p-4 mb-4 max-w-md">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-white">{error}</p>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={startCamera}
                        size="lg"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg font-semibold shadow-lg"
                      >
                        {loading ? "Starting..." : "Enable Camera"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {cameraActive && (
              <div className="mt-4 flex justify-center gap-3">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg px-4 py-2 text-green-700 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Camera is Active & Recording
                </div>
                <Button 
                  onClick={stopCamera}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-2 border-red-600 hover:bg-red-50 font-semibold"
                >
                  Stop Camera
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Information Card */}
        <Card className="border-2 border-blue-600 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white">
            <CardTitle className="text-xl">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-gray-900 font-bold text-base">
                Roll Number <span className="text-red-600">*</span>
              </Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="Enter your roll number (e.g., 2024001)"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="border-2 border-blue-600 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic" className="text-gray-900 font-bold text-base">
                CNIC Number <span className="text-red-600">*</span>
              </Label>
              <Input
                id="cnic"
                type="text"
                placeholder="42101-1234567-8"
                value={cnic}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, '');
                  
                  // Auto-format CNIC
                  if (value.length > 5) {
                    value = value.slice(0, 5) + '-' + value.slice(5);
                  }
                  if (value.length > 13) {
                    value = value.slice(0, 13) + '-' + value.slice(13);
                  }
                  if (value.length > 15) {
                    value = value.slice(0, 15);
                  }
                  
                  setCnic(value);
                }}
                maxLength={15}
                className="border-2 border-blue-600 text-gray-900 bg-white focus:ring-2 focus:ring-blue-600 h-14 text-lg font-mono"
              />
              <p className="text-sm text-gray-500 font-medium">Format: XXXXX-XXXXXXX-X (13 digits)</p>
            </div>
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-16 text-xl font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!rollNumber || !cnic || !cameraActive}
        >
          {!cameraActive ? "⚠️ Enable Camera First" : "Proceed to Registration →"}
        </Button>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 text-center shadow-md">
          <p className="text-gray-800 font-semibold">
            📸 <strong>Important:</strong> Camera verification is mandatory. Please ensure your face is clearly visible before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
}
