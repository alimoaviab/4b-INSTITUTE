import React, { useRef, useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, RefreshCw, UserCheck, ShieldAlert } from "lucide-react";
import { useCheckStudentRecord, useSubmitVerificationAttempt } from "@workspace/api-client-react";

export default function VerifyPage() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [rollNumber, setRollNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [step, setStep] = useState<"capture" | "verify">("capture");

  const checkRecordMutation = useCheckStudentRecord();
  const verifyMutation = useSubmitVerificationAttempt();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Failed to access camera. Please ensure you have granted permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(base64Image);
      }
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setError(null);
  };

  const handleVerify = async () => {
    if (!rollNumber || !cnic || !capturedImage) {
      setError("Please fill in all fields and capture an image.");
      return;
    }

    try {
      setError(null);
      // 1. Check record
      const checkResult = await checkRecordMutation.mutateAsync({
        data: { rollNumber, cnic }
      });

      if (!checkResult.found || !checkResult.studentId) {
        setError("Student record not found. Please check your credentials.");
        return;
      }

      // 2. Submit verification (simulating face match)
      const faceMatchScore = Math.floor(Math.random() * (99 - 85 + 1) + 85); // Random 85-99
      const verifyResult = await verifyMutation.mutateAsync({
        data: {
          studentId: checkResult.studentId,
          capturedImageBase64: capturedImage,
          faceMatchScore,
          deviceInfo: navigator.userAgent,
          ipAddress: "127.0.0.1"
        }
      });

      if (verifyResult.success) {
        localStorage.setItem("student_id", String(checkResult.studentId));
        if (verifyResult.sessionToken) {
           localStorage.setItem("session_token", verifyResult.sessionToken);
        }
        setLocation("/student/profile");
      } else {
        setError(verifyResult.message || "Verification failed.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during verification.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2 relative">
                <div className="absolute right-4 top-4">
                  <a href="/admin/login">
                    <Button variant="ghost" size="sm">Admin</Button>
                  </a>
                </div>
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Student Verification</CardTitle>
          <CardDescription>
            Position your face clearly in the frame and enter your credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!stream && <span className="text-slate-400 text-sm">Initializing camera...</span>}
              </>
            ) : (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-center">
            {!capturedImage ? (
              <Button onClick={captureImage} variant="secondary" className="w-full" disabled={!stream}>
                <Camera className="w-4 h-4 mr-2" />
                Capture Face
              </Button>
            ) : (
              <Button onClick={retakeImage} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                placeholder="e.g. FA23-BCS-001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC (Without dashes)</Label>
              <Input
                id="cnic"
                placeholder="e.g. 3520212345678"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full text-lg h-12" 
            size="lg" 
            onClick={handleVerify}
            disabled={checkRecordMutation.isPending || verifyMutation.isPending}
          >
            {(checkRecordMutation.isPending || verifyMutation.isPending) ? "Verifying..." : "Verify & Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
