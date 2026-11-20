import React, { useState } from "react";
import { ShieldCheck, X, RefreshCw } from "lucide-react";

interface AdminReAuthDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: (adminCode: string, adminPin: string) => Promise<void> | void;
}

export default function AdminReAuthDialog({
  isOpen,
  title,
  description,
  onCancel,
  onConfirm,
}: AdminReAuthDialogProps) {
  const [adminCode, setAdminCode] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetCredentials = () => {
    setAdminCode("");
    setAdminPin("");
    setLocalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode.trim() || !adminPin.trim()) {
      setLocalError("Please enter your ID and PIN.");
      return;
    }

    const codeToSend = adminCode.trim();
    const pinToSend = adminPin.trim();

    // Clear credentials from state immediately before/as the call executes
    resetCredentials();
    setSubmitting(true);
    try {
      await onConfirm(codeToSend, pinToSend);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-slate-100 shadow-2xl relative">
        <button
          type="button"
          onClick={() => {
            resetCredentials();
            onCancel();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 cursor-pointer"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Confirm Your Identity</span>
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-300 mt-1 mb-4">
          {description || "Re-enter your own Staff ID and PIN to authorize this action."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Your ID
            </label>
            <input
              type="text"
              autoComplete="off"
              value={adminCode}
              onChange={(e) => {
                setAdminCode(e.target.value);
                setLocalError("");
              }}
              placeholder="e.g. HTD-003"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Your PIN
            </label>
            <input
              type="password"
              autoComplete="off"
              value={adminPin}
              onChange={(e) => {
                setAdminPin(e.target.value);
                setLocalError("");
              }}
              placeholder="Enter your PIN"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            />
          </div>

          {localError && (
            <p className="text-xs text-red-400 font-mono">{localError}</p>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Confirm &amp; Continue</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                resetCredentials();
                onCancel();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
