"use client";

import React, { useState, useEffect } from "react";
import { 
  Fingerprint, 
  Smartphone, 
  Laptop, 
  Trash2, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { registerPasskeyDevice } from "@/lib/webauthn-client";
import { getUserPasskeys, deletePasskey } from "@/app/actions/webauthn";

interface PasskeyItem {
  id: string;
  name: string | null;
  deviceType: string | null;
  createdAt: Date | string;
  lastUsedAt: Date | string | null;
}

export function BiometricPasskeyManager({
  userRole = "Administrator",
}: {
  userRole?: string;
}) {
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPasskeys = async () => {
    try {
      setIsLoading(true);
      const res = await getUserPasskeys();
      if (Array.isArray(res)) {
        setPasskeys(res);
      } else if (res.success && Array.isArray(res.passkeys)) {
        setPasskeys(res.passkeys);
      } else {
        setPasskeys([]);
      }
    } catch (err) {
      console.error("Failed to load passkeys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await registerPasskeyDevice(deviceName.trim() || undefined);
      if (res.success) {
        toast.success("Biometric Passkey registered successfully!");
        setIsModalOpen(false);
        setDeviceName("");
        await fetchPasskeys();
      } else {
        toast.error(res.error || "Failed to register passkey.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Passkey registration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await deletePasskey(id);
      if (res.success) {
        toast.success("Passkey removed successfully.");
        setPasskeys((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(res.error || "Failed to remove passkey.");
      }
    } catch (err) {
      toast.error("Failed to remove passkey.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Biometric Passkeys & FaceID
                </CardTitle>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                  FIDO2 WebAuthn
                </Badge>
              </div>
              <CardDescription className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                Sign into your {userRole} portal using FaceID, Fingerprint, TouchID, or Windows Hello without typing passwords.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Enroll This Device</span>
          </Button>
        </CardHeader>

        <CardContent className="p-3.5 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              <span>Checking enrolled biometric devices...</span>
            </div>
          ) : passkeys.length === 0 ? (
            <div className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2.5 bg-slate-50/40 dark:bg-slate-800/20">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  No Biometric Passkey Enrolled Yet
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Enroll your laptop, desktop (Windows Hello / TouchID), or smartphone (FaceID / Fingerprint) to unlock 1-touch high-security login.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold mt-1 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 cursor-pointer"
              >
                Enroll This Device Now
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              {passkeys.map((key) => (
                <div
                  key={key.id}
                  className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      {key.name?.toLowerCase().includes("phone") || key.name?.toLowerCase().includes("mobile") ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {key.name || "Biometric Passkey Device"}
                        </h4>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[8.5px] font-bold px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                          Active
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        Enrolled: {new Date(key.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        {key.lastUsedAt && ` • Last used: ${new Date(key.lastUsedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleDelete(key.id)}
                    disabled={deletingId === key.id}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg shrink-0 cursor-pointer"
                    title="Remove passkey"
                  >
                    {deletingId === key.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Biometric credentials never leave your hardware. Verification occurs on your local cryptographic chip via FIDO2 / WebAuthn, ensuring full immunity against phishing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enroll Device Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Fingerprint className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Enroll Biometric Device
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Your browser will prompt for your system FaceID, TouchID, or Windows Hello.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegister} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="passkeyDeviceName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Device Name (Optional)
              </Label>
              <Input
                id="passkeyDeviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g. My Admin Laptop, Office PC, iPhone"
                className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isRegistering}
                className="h-8 sm:h-9 text-xs font-semibold rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRegistering}
                className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning Hardware...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Prompt Sensor</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
