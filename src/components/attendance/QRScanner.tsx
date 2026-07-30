"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import { toast } from "sonner";
import { markAttendanceByQR } from "@/app/actions/attendance";
import { CheckCircle2, Camera, RefreshCw, AlertTriangle, Loader2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QRScanner({ workspaceId, type = "THEORY" }: { workspaceId: string, type?: "THEORY" | "PRACTICAL" }) {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isScannerOn, setIsScannerOn] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessing = useRef(false);
  const isInitializingRef = useRef(false);
  const stopPromiseRef = useRef<Promise<void> | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  // 1. Fetch cameras when scanner is turned on for the first time
  useEffect(() => {
    let mounted = true;

    if (isScannerOn && !activeCameraId) {
      const initCameras = async () => {
        setIsStarting(true);
        setHasPermissionError(false);
        try {
          const devices = await Html5Qrcode.getCameras();
          if (mounted && devices && devices.length > 0) {
            setCameras(devices);
            const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear'));
            setActiveCameraId(backCamera ? backCamera.id : devices[0].id);
          } else {
            throw new Error("No cameras found");
          }
        } catch (err) {
          console.warn("Camera access denied or failed", err);
          if (mounted) {
            setHasPermissionError(true);
            setIsScannerOn(false);
            setIsStarting(false);
          }
        }
      };
      initCameras();
    }
    
    return () => {
      mounted = false;
    };
  }, [isScannerOn, activeCameraId]);

  // 2. Start scanning when scanner is ON and we have a camera
  useEffect(() => {
    let mounted = true;

    // If scanner is off or no camera is selected, ensure it is stopped.
    if (!isScannerOn || !activeCameraId) {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            stopPromiseRef.current = html5QrCodeRef.current.stop().then(() => {
              try { html5QrCodeRef.current?.clear(); } catch(e) {}
            }).catch(() => {});
          } else {
            try { html5QrCodeRef.current.clear(); } catch(e) {}
          }
        } catch(e) {}
      }
      return;
    }
    
    const startScanner = async () => {
      if (isInitializingRef.current) return;
      isInitializingRef.current = true;
      
      setIsStarting(true);
      
      try {
        // Wait for any pending stop operations from cleanup
        if (stopPromiseRef.current) {
          await stopPromiseRef.current;
          stopPromiseRef.current = null;
        }

        if (html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
          } catch (e) {
            // Ignore stop errors
          }
        }
        
        // Hard reset the DOM container to prevent duplicate video feeds in React Strict Mode
        const container = document.getElementById("qr-reader-container");
        if (container) {
          container.innerHTML = "";
        }

        html5QrCodeRef.current = new Html5Qrcode("qr-reader-container");
      
        const onScanSuccess = async (decodedText: string) => {
          if (isProcessing.current || decodedText === lastScannedRef.current) return;
          
          isProcessing.current = true;
          lastScannedRef.current = decodedText;
          
          const result = await markAttendanceByQR(workspaceId, decodedText);
          
          if (result.success) {
            setSuccessMessage(`Marked ${result.studentName} as Present for ${result.className}!`);
            toast.success(`Marked ${result.studentName} as Present for ${result.className}!`);
          } else {
            toast.error(result.error || "Failed to mark attendance.");
            setSuccessMessage(null);
          }

          setTimeout(() => {
            isProcessing.current = false;
            lastScannedRef.current = null;
            setSuccessMessage(null);
          }, 3000);
        };

        await html5QrCodeRef.current.start(
          activeCameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          onScanSuccess,
          () => {} // Ignore scan failures
        );
        
        if (mounted) setIsStarting(false);
      } catch (err: any) {
        console.warn("Camera start failed:", err);
        if (mounted) {
          setHasPermissionError(true);
          setIsScannerOn(false);
          setIsStarting(false);
          toast.error("Failed to start camera feed.");
        }
      } finally {
        isInitializingRef.current = false;
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            stopPromiseRef.current = html5QrCodeRef.current.stop().then(() => {
              try { html5QrCodeRef.current?.clear(); } catch(e) {}
            }).catch(() => {});
          } else {
            try { html5QrCodeRef.current.clear(); } catch(e) {}
          }
        } catch(e) {}
      }
    };
  }, [activeCameraId, workspaceId, type, isScannerOn]);

  const handleToggleScanner = () => {
    if (isStarting) return;
    setIsScannerOn(!isScannerOn);
  };

  const handleSwitchCamera = () => {
    if (cameras.length <= 1 || !activeCameraId) return;
    const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setActiveCameraId(cameras[nextIndex].id);
  };



  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm p-6 w-full space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
               <Camera className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-bold text-lg tracking-tight">Smart Scanner</h3>
               <p className="text-xs text-slate-500 font-medium">Position the ID card in frame.</p>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
             <button
               onClick={handleToggleScanner}
               disabled={isStarting}
               className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
                 isStarting ? "opacity-50 cursor-not-allowed " : ""
               }${
                 isScannerOn 
                   ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20" 
                   : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
               }`}
             >
               {isScannerOn ? (
                 <>
                   <PowerOff className="w-4 h-4" />
                   Stop
                 </>
               ) : (
                 <>
                   <Power className="w-4 h-4" />
                   Start Scanner
                 </>
               )}
             </button>

             {cameras.length > 1 && isScannerOn && (
               <button 
                 onClick={handleSwitchCamera}
                 disabled={isStarting}
                 className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                 title="Switch Camera"
               >
                 <RefreshCw className={`w-5 h-5 ${isStarting ? 'animate-spin opacity-50' : ''}`} />
               </button>
             )}
           </div>
        </div>

        {/* Camera Container */}
        <div className="relative w-full overflow-hidden rounded-2xl border-4 border-slate-100 dark:border-slate-800 bg-slate-900 flex items-center justify-center min-h-[300px]">
          {hasPermissionError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-900 p-6 text-center">
               <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
               <p className="text-sm font-bold text-white">Camera Access Denied</p>
               <p className="text-xs mt-2 text-slate-400 max-w-xs mx-auto">
                 Please click the <strong className="text-white">lock icon 🔒</strong> in your browser's address bar, allow camera access, and then click Try Again.
               </p>
               <Button 
                 onClick={() => {
                   setHasPermissionError(false);
                   setIsScannerOn(true); // Retry immediately
                 }} 
                 variant="outline" 
                 className="mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
               >
                 Try Again
               </Button>
            </div>
          ) : !isScannerOn ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-900">
               <Power className="w-12 h-12 mb-4 opacity-50" />
               <p className="text-sm font-medium">Scanner is off</p>
               <p className="text-xs mt-1 opacity-75">Click Start Scanner to begin</p>
            </div>
          ) : isStarting ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-slate-900/80 backdrop-blur-sm">
               <Loader2 className="w-8 h-8 animate-spin mb-2" />
               <p className="text-sm font-medium">Starting camera...</p>
            </div>
          ) : null}
          
          <div id="qr-reader-container" className="w-full h-full" style={{ display: isScannerOn ? 'block' : 'none' }} />
        </div>

        {successMessage && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <span className="font-bold text-sm">{successMessage}</span>
          </div>
        )}
      </div>
      
      {/* Remove default html5-qrcode styles if any bleed through */}
      <style jsx global>{`
        #qr-reader-container video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem;
        }
      `}</style>
    </div>
  );
}
