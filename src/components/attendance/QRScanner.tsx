"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import { toast } from "sonner";
import { markAttendanceByQR } from "@/app/actions/attendance";
import { CheckCircle2, Camera, RefreshCw, AlertTriangle, Loader2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col items-center max-w-md mx-auto w-full">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-5 w-full space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
           <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
               <Camera className="w-4 h-4" />
             </div>
             <div>
               <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Smart QR Scanner</h3>
               <p className="text-[11px] text-slate-500 font-medium">Position student QR pass in frame.</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <button
               onClick={handleToggleScanner}
               disabled={isStarting}
               className={cn(
                 "h-8 sm:h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all",
                 isStarting && "opacity-50 cursor-not-allowed",
                 isScannerOn 
                   ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40" 
                   : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
               )}
             >
               {isScannerOn ? (
                 <>
                   <PowerOff className="w-3.5 h-3.5" />
                   <span>Stop</span>
                 </>
               ) : (
                 <>
                   <Power className="w-3.5 h-3.5" />
                   <span>Start Scanner</span>
                 </>
               )}
             </button>

             {cameras.length > 1 && isScannerOn && (
               <button 
                 onClick={handleSwitchCamera}
                 disabled={isStarting}
                 className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                 title="Switch Camera"
               >
                 <RefreshCw className={cn("w-3.5 h-3.5", isStarting && "animate-spin opacity-50")} />
               </button>
             )}
           </div>
        </div>

        {/* Camera Container */}
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center min-h-[260px]">
          {hasPermissionError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 z-10 bg-slate-950 p-4 text-center">
               <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
               <p className="text-xs font-bold text-white">Camera Access Denied</p>
               <p className="text-[11px] mt-1 text-slate-400 max-w-xs mx-auto">
                 Please allow camera permissions in your browser bar and click retry.
               </p>
               <Button 
                 onClick={() => {
                   setHasPermissionError(false);
                   setIsScannerOn(true);
                 }} 
                 variant="outline" 
                 className="mt-4 h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
               >
                 Try Again
               </Button>
            </div>
          ) : !isScannerOn ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 bg-slate-950">
               <Power className="w-8 h-8 mb-2 opacity-40" />
               <p className="text-xs font-semibold text-slate-400">Scanner is off</p>
               <p className="text-[10px] mt-0.5 opacity-70 text-slate-500">Click Start Scanner to begin</p>
            </div>
          ) : isStarting ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-slate-950/80 backdrop-blur-sm">
               <Loader2 className="w-6 h-6 animate-spin mb-1.5 text-primary" />
               <p className="text-xs font-medium text-slate-300">Starting camera...</p>
            </div>
          ) : null}
          
          <div id="qr-reader-container" className="w-full h-full" style={{ display: isScannerOn ? 'block' : 'none' }} />
        </div>

        {successMessage && (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
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
