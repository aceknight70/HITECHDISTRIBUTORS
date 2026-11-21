import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Lock,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import * as db from "../lib/supabase";

interface ManagerQuestionLogReviewProps {
  session: db.HiTechSession;
  onBack: () => void;
}

function getMondayIsoFromDateStr(dateStr?: string | null): string {
  const base = (dateStr || "").slice(0, 10);
  const parts = base.split("-").map(Number);
  const d =
    parts.length === 3 && !parts.some(Number.isNaN)
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date();
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = Array.isArray(val) ? val.join("; ") : String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

export default function ManagerQuestionLogReview({
  session,
  onBack,
}: ManagerQuestionLogReviewProps) {
  const isAuthorized = ["manager", "master"].includes((session.role || "").toLowerCase());

  const [entries, setEntries] = useState<db.HiTechQuestionLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [selectedStaff, setSelectedStaff] = useState<string>("ALL");
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [showAllMatching, setShowAllMatching] = useState<boolean>(false);

  // Per-entry action states
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>("");
  const [needsFixEntryId, setNeedsFixEntryId] = useState<string | null>(null);
  const [needsFixNote, setNeedsFixNote] = useState<string>("");

  const loadAll = async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError("");
    try {
      const data = await db.fetchAllQuestionLogs();
      setEntries(data);
    } catch (err: any) {
      setError(db.formatDbErrorMessage(err, "Could not load customer question log entries."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [isAuthorized]);

  const currentWeekMonday = useMemo(() => getMondayIsoFromDateStr(db.getLocalTodayIsoDate()), []);

  const staffOptions = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => {
      if (e.logged_by_staff_id) {
        map.set(e.logged_by_staff_id, e.logged_by_name || e.logged_by_staff_id);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  const weekOptions = useMemo(() => {
    const weeks = new Set<string>();
    weeks.add(currentWeekMonday);
    entries.forEach((e) => {
      weeks.add(getMondayIsoFromDateStr(e.asked_on || e.logged_at));
    });
    return Array.from(weeks).sort((a, b) => b.localeCompare(a));
  }, [entries, currentWeekMonday]);

  const staffFilteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (selectedStaff !== "ALL" && e.logged_by_staff_id !== selectedStaff) return false;
      return true;
    });
  }, [entries, selectedStaff]);

  const filteredEntries = useMemo(() => {
    return staffFilteredEntries
      .filter((e) => {
        if (selectedWeek !== "ALL") {
          const entryWeek = getMondayIsoFromDateStr(e.asked_on || e.logged_at);
          if (entryWeek !== selectedWeek) return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.logged_at).getTime();
        const tb = new Date(b.logged_at).getTime();
        if (tb !== ta) return tb - ta;
        return (b.entry_no || 0) - (a.entry_no || 0);
      });
  }, [staffFilteredEntries, selectedWeek]);

  // Last 20 entries by default
  const displayedEntries = useMemo(() => {
    return showAllMatching ? filteredEntries : filteredEntries.slice(0, 20);
  }, [filteredEntries, showAllMatching]);

  // Summary metrics
  const summaryStats = useMemo(() => {
    const entriesThisWeekCount = staffFilteredEntries.filter(
      (e) => getMondayIsoFromDateStr(e.asked_on || e.logged_at) === currentWeekMonday
    ).length;

    const labeled = filteredEntries.filter((e) => e.status === "labeled").length;
    const reviewed = filteredEntries.filter((e) => db.isQuestionLogReviewed(e.review_status)).length;
    const tricky = filteredEntries.filter((e) => e.confidence === "Tricky").length;
    const negativeSentiment = filteredEntries.filter((e) => e.sentiment === "Negative").length;
    const piiFlagged = filteredEntries.filter((e) => e.pii_present === true).length;
    const fromMemory = filteredEntries.filter((e) => e.recalled === true).length;

    const intentCounts: Record<string, number> = {};
    db.QUESTION_LOG_INTENTS.forEach((i) => {
      intentCounts[i] = 0;
    });
    filteredEntries.forEach((e) => {
      if (e.intent && intentCounts[e.intent] !== undefined) {
        intentCounts[e.intent] += 1;
      }
    });

    const missingCounts: Record<string, number> = {};
    db.QUESTION_LOG_MISSING_ITEMS.forEach((item) => {
      missingCounts[item] = 0;
    });
    filteredEntries.forEach((e) => {
      if (Array.isArray(e.missing_items)) {
        e.missing_items.forEach((item) => {
          if (missingCounts[item] !== undefined) {
            missingCounts[item] += 1;
          }
        });
      }
    });

    const trickyNotes = filteredEntries
      .filter((e) => (e.tricky_note || "").trim().length > 0)
      .slice()
      .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());

    return {
      entriesThisWeekCount,
      labeled,
      reviewed,
      tricky,
      negativeSentiment,
      piiFlagged,
      fromMemory,
      intentCounts,
      missingCounts,
      trickyNotes,
    };
  }, [staffFilteredEntries, filteredEntries, currentWeekMonday]);

  // Reviewed entries eligible for CSV export for the selected staff member
  const reviewedForExport = useMemo(() => {
    return staffFilteredEntries.filter((e) => db.isQuestionLogReviewed(e.review_status));
  }, [staffFilteredEntries]);

  const handleMarkReviewed = async (entry: db.HiTechQuestionLogEntry) => {
    setActionError("");
    setActionBusyId(entry.id);
    try {
      const updated = await db.reviewQuestionLogEntry(entry.id, {
        decision: "reviewed",
        reviewed_by: `${session.name} (${session.code})`,
      });
      setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      if (needsFixEntryId === entry.id) {
        setNeedsFixEntryId(null);
        setNeedsFixNote("");
      }
    } catch (err: any) {
      setActionError(db.formatDbErrorMessage(err, "Could not mark entry as reviewed."));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleSubmitNeedsFix = async (entry: db.HiTechQuestionLogEntry) => {
    setActionError("");
    const note = needsFixNote.trim();
    if (!note) {
      setActionError("Please enter a short note explaining what needs fixing.");
      return;
    }
    setActionBusyId(entry.id);
    try {
      const updated = await db.reviewQuestionLogEntry(entry.id, {
        decision: "needs_fix",
        reviewed_by: `${session.name} (${session.code})`,
        review_note: note,
      });
      setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setNeedsFixEntryId(null);
      setNeedsFixNote("");
    } catch (err: any) {
      setActionError(db.formatDbErrorMessage(err, "Could not save needs-fix status."));
    } finally {
      setActionBusyId(null);
    }
  };

  const handleExportCsv = () => {
    // All columns except id
    const headers = [
      "entry_no",
      "client_id",
      "logged_by_staff_id",
      "logged_by_name",
      "asked_on",
      "logged_at",
      "updated_at",
      "source",
      "recalled",
      "question_text",
      "status",
      "intent",
      "sentiment",
      "pii_present",
      "pii_kind",
      "confidence",
      "tricky_reasons",
      "tricky_note",
      "store_had_answer",
      "missing_items",
      "review_status",
      "reviewed_by",
      "reviewed_at",
      "review_note",
    ];

    const rows = reviewedForExport.map((e) =>
      [
        e.entry_no ?? "",
        e.client_id,
        e.logged_by_staff_id,
        e.logged_by_name,
        e.asked_on,
        e.logged_at,
        e.updated_at ?? "",
        e.source,
        e.recalled,
        e.question_text,
        e.status,
        e.intent ?? "",
        e.sentiment ?? "",
        e.pii_present ?? "",
        e.pii_kind ?? "",
        e.confidence ?? "",
        Array.isArray(e.tricky_reasons) ? e.tricky_reasons.join("; ") : "",
        e.tricky_note ?? "",
        e.store_had_answer ?? "",
        Array.isArray(e.missing_items) ? e.missing_items.join("; ") : "",
        e.review_status ?? "",
        e.reviewed_by ?? "",
        e.reviewed_at ?? "",
        e.review_note ?? "",
      ]
        .map(escapeCsvCell)
        .join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const staffSlug = selectedStaff === "ALL" ? "all-staff" : selectedStaff.toLowerCase();
    link.href = url;
    link.setAttribute(
      "download",
      `hitech-question-log-reviewed-${staffSlug}-${db.getLocalTodayIsoDate()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAuthorized) {
    return (
      <div className="p-5 rounded-xl bg-[#0f172a] border-2 border-[#dc2626] text-white flex flex-col items-center gap-3 text-center">
        <ShieldAlert className="w-8 h-8 text-[#dc2626]" />
        <h4 className="text-sm font-black uppercase">Manager / Master Access Only</h4>
        <p className="text-xs text-slate-300">
          Question Log Review is restricted to managers and masters.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-white text-[#0f172a] text-xs font-bold uppercase cursor-pointer"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#0f172a] rounded-xl border-2 border-[#1e293b] text-white flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div>
          <h4 className="font-black text-sm text-white uppercase tracking-wide">
            Question Log Review
          </h4>
          <p className="text-[11px] text-slate-300">
            Last 20 entries by default • Export CSV of reviewed entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAll}
            className="px-2.5 py-1.5 rounded-lg bg-[#16233b] hover:bg-[#1e293b] border border-slate-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Filters & Export CSV */}
      <div className="p-3 rounded-xl bg-[#16233b] border border-slate-700 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
              Staff Member
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => {
                setSelectedStaff(e.target.value);
                setShowAllMatching(false);
              }}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-bold outline-none"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            >
              <option value="ALL">All Staff ({entries.length})</option>
              {staffOptions.map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
              Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                setShowAllMatching(false);
              }}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-bold outline-none"
              style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
            >
              <option value="ALL">All Weeks</option>
              {weekOptions.map((wk) => (
                <option key={wk} value={wk}>
                  {wk === currentWeekMonday ? `This Week (${wk})` : `Week of ${wk}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          disabled={reviewedForExport.length === 0}
          onClick={handleExportCsv}
          className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-50 text-[#0f172a] font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Download className="w-4 h-4 text-[#dc2626]" />
          <span>
            Export Reviewed CSV ({reviewedForExport.length})
          </span>
        </button>
      </div>

      {/* Error banner */}
      {(error || actionError) && (
        <div className="p-3 rounded-xl bg-[#7f1d1d] border border-[#dc2626] text-white text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error || actionError}</span>
          </div>
          {error && (
            <button
              type="button"
              onClick={loadAll}
              className="px-2.5 py-1 rounded bg-white text-[#0f172a] font-black text-[10px] uppercase cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Summary Panel */}
      <div className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700 flex flex-col gap-3">
        <h5 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-700 pb-1.5">
          Summary
        </h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-700">
            <span className="text-[10px] uppercase text-slate-300 block">Entries This Week</span>
            <strong className="text-lg font-black text-white">{summaryStats.entriesThisWeekCount}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-700">
            <span className="text-[10px] uppercase text-slate-300 block">Labeled / Filtered</span>
            <strong className="text-lg font-black text-white">
              {summaryStats.labeled} / {filteredEntries.length}
            </strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-700">
            <span className="text-[10px] uppercase text-slate-300 block">Reviewed</span>
            <strong className="text-lg font-black text-white">{summaryStats.reviewed}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-700">
            <span className="text-[10px] uppercase text-slate-300 block">Tricky</span>
            <strong className="text-lg font-black text-[#dc2626]">{summaryStats.tricky}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-700">
            <span className="text-[10px] uppercase text-slate-300 block">Negative Sentiment</span>
            <strong className="text-lg font-black text-[#dc2626]">
              {summaryStats.negativeSentiment}
            </strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-700">
            <span className="text-[10px] uppercase text-slate-300 block">Personal Details Flagged</span>
            <strong className="text-lg font-black text-white">{summaryStats.piiFlagged}</strong>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0f172a] border border-slate-700 col-span-2 flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-300">Saved From Memory</span>
            <strong className="text-base font-black text-white">{summaryStats.fromMemory}</strong>
          </div>
        </div>

        {/* Count by Intent */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-[10px] font-bold uppercase text-slate-300 mb-1.5">Count by Intent</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {db.QUESTION_LOG_INTENTS.map((intent) => (
              <div
                key={intent}
                className="px-2.5 py-1.5 rounded bg-[#0f172a] border border-slate-700 flex items-center justify-between"
              >
                <span className="text-slate-200">{intent}</span>
                <strong className="text-white font-mono">{summaryStats.intentCounts[intent]}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What the store was missing panel */}
      <div className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700 flex flex-col gap-3">
        <h5 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-700 pb-1.5">
          What the store was missing
        </h5>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {db.QUESTION_LOG_MISSING_ITEMS.map((item) => (
            <div
              key={item}
              className="p-2 rounded bg-[#0f172a] border border-slate-700 text-center"
            >
              <span className="text-[10px] text-slate-300 block">{item}</span>
              <strong className="text-base font-black text-white">
                {summaryStats.missingCounts[item]}
              </strong>
            </div>
          ))}
        </div>

        {/* Tricky Notes newest first */}
        <div className="pt-2 border-t border-slate-700">
          <p className="text-[10px] font-bold uppercase text-slate-300 mb-1.5">
            Tricky Notes (Newest First)
          </p>
          {summaryStats.trickyNotes.length === 0 ? (
            <p className="text-xs text-slate-400">No tricky notes in this filter.</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
              {summaryStats.trickyNotes.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-white text-[#0f172a] border border-slate-300 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                    <span>{item.logged_by_name}</span>
                    <span>{item.asked_on}</span>
                  </div>
                  <p className="font-bold text-[#dc2626]">{item.tricky_note}</p>
                  <p className="text-[11px] text-slate-700 truncate mt-0.5">{item.question_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entries List (Last 20 by default) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-black uppercase tracking-wider text-white">
            Entries ({displayedEntries.length} of {filteredEntries.length})
          </h5>
          {filteredEntries.length > 20 && (
            <button
              type="button"
              onClick={() => setShowAllMatching((prev) => !prev)}
              className="text-xs font-bold text-white underline hover:text-[#dc2626] cursor-pointer"
            >
              {showAllMatching ? "Show last 20" : `Show all ${filteredEntries.length}`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-6 rounded-xl bg-[#16233b] border border-slate-700 text-center text-xs text-slate-300">
            Loading question log entries...
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#16233b] border border-slate-700 text-center text-xs text-slate-300">
            No customer question entries match this filter.
          </div>
        ) : (
          displayedEntries.map((entry) => {
            const isReviewed = db.isQuestionLogReviewed(entry.review_status);
            const isNeedsFix = db.isQuestionLogNeedsFix(entry.review_status);
            const isBusy = actionBusyId === entry.id;
            const showingFixBox = needsFixEntryId === entry.id;

            return (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-white text-[#0f172a] border-2 border-slate-300 flex flex-col gap-2.5 shadow-sm"
              >
                {/* Header badges */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-bold">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {entry.entry_no && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-[#0f172a] font-mono">
                        #{entry.entry_no}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-[#0f172a] text-white uppercase">
                      {entry.source}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded uppercase ${
                        isReviewed
                          ? "bg-[#0f172a] text-white"
                          : isNeedsFix
                          ? "bg-[#dc2626] text-white"
                          : "bg-slate-200 text-[#0f172a]"
                      }`}
                    >
                      {isReviewed ? "reviewed" : isNeedsFix ? "needs fix" : "pending"}
                    </span>
                    {entry.recalled && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-[#0f172a]">
                        From memory
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-600">{entry.asked_on}</span>
                </div>

                <div className="text-[11px] font-bold text-slate-700">
                  Logged by: <span className="text-[#0f172a]">{entry.logged_by_name}</span> ({entry.logged_by_staff_id})
                </div>

                {/* Question text */}
                <p className="text-sm font-semibold text-[#0f172a] bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap break-words leading-snug">
                  {entry.question_text}
                </p>

                {/* All Labels */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-[#0f172a] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-600 font-bold">Status:</span> {entry.status}
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Intent:</span> {entry.intent || "—"}
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Sentiment:</span> {entry.sentiment || "—"}
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Personal details:</span>{" "}
                    {entry.pii_present === true
                      ? `Yes (${entry.pii_kind || "Unspecified"})`
                      : entry.pii_present === false
                      ? "No"
                      : "—"}
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Confidence:</span>{" "}
                    {entry.confidence || "—"}
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold">Store had answer:</span>{" "}
                    {entry.store_had_answer || "—"}
                  </div>
                </div>

                {/* Tricky reasons & note */}
                {entry.confidence === "Tricky" && (
                  <div className="text-xs p-2.5 rounded-lg bg-[#fef2f2] border border-[#dc2626] text-[#0f172a]">
                    <p className="font-bold text-[#dc2626]">
                      Tricky reasons:{" "}
                      {Array.isArray(entry.tricky_reasons) && entry.tricky_reasons.length > 0
                        ? entry.tricky_reasons.join(", ")
                        : "None ticked"}
                    </p>
                    {entry.tricky_note && (
                      <p className="mt-1 font-medium">Note: {entry.tricky_note}</p>
                    )}
                  </div>
                )}

                {/* Missing items */}
                {entry.store_had_answer === "No" && (
                  <div className="text-xs p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-[#0f172a]">
                    <span className="font-bold">Missing from store: </span>
                    {Array.isArray(entry.missing_items) && entry.missing_items.length > 0
                      ? entry.missing_items.join(", ")
                      : "None ticked"}
                  </div>
                )}

                {/* Existing manager review note if needs fix or reviewed */}
                {entry.review_note && !isReviewed && (
                  <div className="text-xs p-2 rounded bg-[#fef2f2] border border-[#dc2626] text-[#0f172a]">
                    <strong className="text-[#dc2626]">Previous Fix Note: </strong>
                    {entry.review_note}
                  </div>
                )}

                {/* Actions: locked once reviewed */}
                {isReviewed ? (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5 text-[#0f172a]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Reviewed &amp; Locked</span>
                    </span>
                    {entry.reviewed_by && (
                      <span className="text-[11px] font-mono">{entry.reviewed_by}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleMarkReviewed(entry)}
                        className="py-2.5 px-3 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isBusy && !showingFixBox ? "Saving..." : "Mark reviewed"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          if (showingFixBox) {
                            setNeedsFixEntryId(null);
                            setNeedsFixNote("");
                          } else {
                            setNeedsFixEntryId(entry.id);
                            setNeedsFixNote(entry.review_note || "");
                          }
                          setActionError("");
                        }}
                        className="py-2.5 px-3 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white font-black text-xs uppercase cursor-pointer"
                      >
                        {showingFixBox ? "Cancel" : "Needs fix"}
                      </button>
                    </div>

                    {showingFixBox && (
                      <div className="p-2.5 rounded-lg bg-[#16233b] border border-slate-700 flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-white">
                          What needs fixing? (Required)
                        </label>
                        <input
                          type="text"
                          maxLength={200}
                          value={needsFixNote}
                          onChange={(e) => setNeedsFixNote(e.target.value)}
                          placeholder="Short note for staff member"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none"
                          style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                        />
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleSubmitNeedsFix(entry)}
                          className="py-2 px-3 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white font-black text-xs uppercase cursor-pointer"
                        >
                          {isBusy ? "Sending..." : "Send Needs Fix"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
