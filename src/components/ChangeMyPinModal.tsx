import React, { useState } from "react";
import { Key, X, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import * as db from "../lib/supabase";

interface ChangeMyPinModalProps {
  personCode: string;
  personName: string;
  onClose: () => void;
}

export default function ChangeMyPinModal({ personCode, personName, onClose }: ChangeMyPinModalProps) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const clearPins = () => {
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!oldPin.trim() || !newPin.trim() || !confirmPin.trim()) {
      setFeedback({ ok: false, message: "Please fill in your old PIN and enter the new PIN twice." });
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setFeedback({ ok: false, message: "New PIN entries do not match." });
      return;
    }

    setSubmitting(true);
    const oldVal = oldPin;
    const newVal = newPin;
    clearPins();

    try {
      const res = await db.hitechChangePin(personCode, oldVal, newVal);
      setFeedback({
        ok: Boolean(res.ok),
        message: res.message || (res.ok ? "PIN updated successfully." : "Unable to update PIN."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-slate-100 shadow-2xl relative">
        <button
          type="button"
          onClick={() => {
            clearPins();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
          <Key className="w-4 h-4" />
          <span>Change My PIN</span>
        </div>
        <h3 className="text-base font-bold text-white">
          {personName} <span className="text-xs font-mono text-slate-400">({personCode})</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Enter your current PIN and your new PIN twice.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Current PIN
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="Enter current PIN"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              New PIN
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Enter new PIN"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Confirm New PIN
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Re-enter new PIN"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 border ${
                feedback.ok
                  ? "bg-emerald-950/90 border-emerald-700 text-emerald-200"
                  : "bg-red-950/90 border-red-700 text-red-200"
              }`}
            >
              {feedback.ok ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update PIN</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                clearPins();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
