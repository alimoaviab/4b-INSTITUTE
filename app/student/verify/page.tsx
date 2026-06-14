"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function VerifyPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [cnic, setCnic] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const startCamera = async () => {
    setLoading(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      toast.error("Failed to access camera. Please allow camera permissions.");
      setCameraActive(false);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleProceed = async () => {
    if (!rollNumber || !cnic) {
      toast.error("Please enter both Roll Number and CNIC");
      return;
    }
    if (!cameraActive) {
      toast.error("Please enable camera verification first");
      return;
    }
    
    // In this specific design, CNIC is requested "Without dashes" but we can accept both
    const cleanCnic = cnic.replace(/[^\d]/g, '');
    if (cleanCnic.length !== 13) {
      toast.error("Please enter a valid 13-digit CNIC number");
      return;
    }

    try {
      setFormLoading(true);
      const res = await fetch("/api/auth/verify-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, cnic: cleanCnic }) // Backend handles dashes depending on how they were registered, but verification might fail if exact string mismatch. We'll pass raw input.
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      localStorage.setItem("studentName", data.student.name);
      localStorage.setItem("rollNumber", data.student.rollNumber);
      
      stopCamera();
      
      if (data.hasCompletedTest) {
        if (data.testScore !== null) {
          localStorage.setItem("testScore", data.testScore.toString());
        }
        toast.info("You have already completed the exam.");
        router.push("/student/portal");
      } else {
        toast.success("Verification successful!");
        router.push("/student/instructions");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      
      <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative border border-slate-100">
        
        {/* Top blue border indicator */}
        <div className="h-1.5 w-full bg-[#2563EB]" />

        <div className="p-8">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#2563EB]">
              <UserCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Student Verification</h1>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm">
              Position your face clearly in the frame and enter your credentials.
            </p>
          </div>

          {/* Camera Section */}
          <div className="mb-6 space-y-4">
            <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <Camera className="w-12 h-12 mb-3 opacity-20" />
                  <span className="text-sm font-medium">Camera preview will appear here</span>
                </div>
              )}
            </div>

            <button 
              onClick={cameraActive ? stopCamera : startCamera}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium transition-colors border ${
                cameraActive 
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              {loading ? "Activating..." : cameraActive ? "Stop Camera" : "Capture Face"}
            </button>
          </div>

          {/* Form Inputs */}
          <div className="space-y-5 mb-8">
            <div className="space-y-1.5">
              <label htmlFor="rollNumber" className="text-[15px] font-semibold text-slate-800">
                Roll Number
              </label>
              <input
                id="rollNumber"
                type="text"
                placeholder="e.g. FA23-BCS-001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all text-[15px] text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cnic" className="text-[15px] font-semibold text-slate-800">
                CNIC (Without dashes)
              </label>
              <input
                id="cnic"
                type="text"
                placeholder="e.g. 3520212345678"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className="w-full h-12 bg-white border border-slate-300 rounded-xl px-4 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all text-[15px] text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleProceed}
            disabled={!rollNumber || !cnic || !cameraActive || formLoading}
            className="w-full h-14 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {formLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Verify & Continue"
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
}
