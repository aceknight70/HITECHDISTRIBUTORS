import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  AlertTriangle,
  Lock,
  RefreshCw,
  Tag,
  PlusCircle,
  ListChecks,
} from "lucide-react";
import * as db from "../lib/supabase";

interface CustomerQuestionLogProps {
  person: db.HiTechSession;
  onBack: () => void;
}

type LogTab = "quick-add" | "to-label" | "my-log";

function getWeekStartMondayIso(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CustomerQuestionLog({ person, onBack }: CustomerQuestionLogProps) {
  const [activeTab, setActiveTab] = useState<LogTab>("quick-add");

  // Shared entries loaded strictly from Supabase hitech_question_log
  const [entries, setEntries] = useState<db.HiTechQuestionLogEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");

  // Quick Add state
  const [questionText, setQuestionText] = useState<string>("");
  const [source, setSource] = useState<db.QuestionLogSource>("Store");
  const [recalled, setRecalled] = useState<boolean>(false);
  const [askedOn, setAskedOn] = useState<string>(() => db.getLocalTodayIsoDate());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [savingQuickAdd, setSavingQuickAdd] = useState<boolean>(false);
  const [quickAddError, setQuickAddError] = useState<string>("");
  const [quickAddSuccess, setQuickAddSuccess] = useState<string>("");

  // Label screen state (used for both To Label items and Needs Fix items from My Log)
  const [editingEntry, setEditingEntry] = useState<db.HiTechQuestionLogEntry | null>(null);
  const [editReturnTab, setEditReturnTab] = useState<LogTab>("to-label");
  const [labelIntent, setLabelIntent] = useState<db.QuestionLogIntent | null>(null);
  const [labelSentiment, setLabelSentiment] = useState<db.QuestionLogSentiment | null>(null);
  const [labelPiiPresent, setLabelPiiPresent] = useState<boolean | null>(null);
  const [labelPiiKind, setLabelPiiKind] = useState<db.QuestionLogPiiKind | null>(null);
  const [labelConfidence, setLabelConfidence] = useState<db.QuestionLogConfidence | null>(null);
  const [labelTrickyReasons, setLabelTrickyReasons] = useState<string[]>([]);
  const [labelTrickyNote, setLabelTrickyNote] = useState<string>("");
  const [labelStoreHadAnswer, setLabelStoreHadAnswer] = useState<db.QuestionLogStoreHadAnswer | null>(null);
  const [labelMissingItems, setLabelMissingItems] = useState<string[]>([]);
  const [savingLabels, setSavingLabels] = useState<boolean>(false);
  const [labelError, setLabelError] = useState<string>("");

  const loadEntries = async () => {
    setLoadingEntries(true);
    setLoadError("");
    try {
      const data = await db.fetchStaffQuestionLogs(person.code);
      setEntries(data);
    } catch (err: any) {
      setLoadError(db.formatDbErrorMessage(err, "Could not load customer question log entries."));
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [person.code]);

  // Derived lists and counters
  const todayIso = db.getLocalTodayIsoDate();
  const weekStartIso = getWeekStartMondayIso();

  const todayCount = useMemo(() => {
    return entries.filter((e) => {
      if (e.asked_on === todayIso) return true;
      if (e.logged_at) {
        const d = new Date(e.logged_at);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}` === todayIso;
      }
      return false;
    }).length;
  }, [entries, todayIso]);

  const unlabeledOldestFirst = useMemo(() => {
    return entries
      .filter((e) => e.status === "unlabeled")
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.logged_at).getTime();
        const tb = new Date(b.logged_at).getTime();
        if (ta !== tb) return ta - tb;
        return (a.entry_no || 0) - (b.entry_no || 0);
      });
  }, [entries]);

  const myLogNewestFirst = useMemo(() => {
    return entries
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.logged_at).getTime();
        const tb = new Date(b.logged_at).getTime();
        if (tb !== ta) return tb - ta;
        return (b.entry_no || 0) - (a.entry_no || 0);
      });
  }, [entries]);

  const thisWeekCount = useMemo(() => {
    return entries.filter((e) => {
      const d = new Date(e.logged_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const loggedDay = `${yyyy}-${mm}-${dd}`;
      return e.asked_on >= weekStartIso || loggedDay >= weekStartIso;
    }).length;
  }, [entries, weekStartIso]);

  const totalLabeledCount = useMemo(() => {
    return entries.filter((e) => e.status === "labeled").length;
  }, [entries]);

  const isMemoryProminentSource = source === "Walk-in" || source === "Phone";

  const handleSaveQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setQuickAddError("");
    setQuickAddSuccess("");

    const trimmed = questionText.trim();
    if (!trimmed) {
      setQuickAddError("Please paste or type the customer's question first.");
      return;
    }

    if (db.containsRawPii(trimmed)) {
      setQuickAddError(db.QUESTION_LOG_PII_WARNING);
      return;
    }

    setSavingQuickAdd(true);
    try {
      const inserted = await db.createQuestionLogEntry({
        logged_by_staff_id: person.code,
        logged_by_name: person.name,
        asked_on: askedOn || db.getLocalTodayIsoDate(),
        source,
        recalled,
        question_text: trimmed,
      });

      const updated = [inserted, ...entries];
      setEntries(updated);
      const newTodayCount = updated.filter((item) => {
        if (item.asked_on === todayIso) return true;
        const d = new Date(item.logged_at);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}` === todayIso;
      }).length;

      setQuestionText("");
      setRecalled(false);
      setQuickAddSuccess(`Saved. ${newTodayCount} ${newTodayCount === 1 ? "entry" : "entries"} today.`);
    } catch (err: any) {
      // Keep text on screen and display exact plain error message with Retry option
      setQuickAddError(db.formatDbErrorMessage(err, "Could not save question entry."));
    } finally {
      setSavingQuickAdd(false);
    }
  };

  const openLabelScreen = (entry: db.HiTechQuestionLogEntry, returnTo: LogTab) => {
    setEditingEntry(entry);
    setEditReturnTab(returnTo);
    setLabelIntent((entry.intent as db.QuestionLogIntent) || null);
    setLabelSentiment((entry.sentiment as db.QuestionLogSentiment) || null);
    setLabelPiiPresent(typeof entry.pii_present === "boolean" ? entry.pii_present : null);
    setLabelPiiKind((entry.pii_kind as db.QuestionLogPiiKind) || null);
    setLabelConfidence((entry.confidence as db.QuestionLogConfidence) || null);
    setLabelTrickyReasons(Array.isArray(entry.tricky_reasons) ? entry.tricky_reasons : []);
    setLabelTrickyNote(entry.tricky_note || "");
    setLabelStoreHadAnswer((entry.store_had_answer as db.QuestionLogStoreHadAnswer) || null);
    setLabelMissingItems(Array.isArray(entry.missing_items) ? entry.missing_items : []);
    setLabelError("");
  };

  const toggleMultiItem = (list: string[], value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSaveLabels = async () => {
    if (!editingEntry) return;
    setLabelError("");

    if (!labelIntent) {
      setLabelError("Please tap an Intent.");
      return;
    }
    if (!labelSentiment) {
      setLabelError("Please tap a Sentiment.");
      return;
    }
    if (labelPiiPresent === null) {
      setLabelError("Please answer: Personal details in this question?");
      return;
    }
    if (labelPiiPresent === true && !labelPiiKind) {
      setLabelError("Please pick which kind of personal details are in this question.");
      return;
    }
    if (!labelConfidence) {
      setLabelError("Please tap Clear or Tricky.");
      return;
    }
    if (!labelStoreHadAnswer) {
      setLabelError("Please answer: Did the store already have the answer?");
      return;
    }

    if (db.containsRawPii(editingEntry.question_text) || db.containsRawPii(labelTrickyNote)) {
      setLabelError(db.QUESTION_LOG_PII_WARNING);
      return;
    }

    setSavingLabels(true);
    try {
      const updated = await db.updateQuestionLogLabels(editingEntry.id, {
        intent: labelIntent,
        sentiment: labelSentiment,
        pii_present: labelPiiPresent,
        pii_kind: labelPiiPresent ? labelPiiKind : null,
        confidence: labelConfidence,
        tricky_reasons: labelConfidence === "Tricky" ? labelTrickyReasons : [],
        tricky_note: labelConfidence === "Tricky" ? labelTrickyNote.trim().slice(0, 140) || null : null,
        store_had_answer: labelStoreHadAnswer,
        missing_items: labelStoreHadAnswer === "No" ? labelMissingItems : [],
        resetReviewToPending: db.isQuestionLogNeedsFix(editingEntry.review_status),
      });

      setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingEntry(null);
      setActiveTab(editReturnTab);
    } catch (err: any) {
      setLabelError(db.formatDbErrorMessage(err, "Could not save labels."));
    } finally {
      setSavingLabels(false);
    }
  };

  const handleTabSwitch = (tab: LogTab) => {
    setEditingEntry(null);
    setLabelError("");
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-[2400] w-full h-[100dvh] max-h-[100dvh] overflow-y-auto bg-[#0b1324] text-white flex flex-col font-sans select-text">
      <div className="w-full max-w-[460px] mx-auto flex flex-col min-h-full bg-[#0f172a] border-x border-[#1e293b] shadow-2xl">
        {/* Header - Shown on EVERY Question Log screen */}
        <header className="sticky top-0 z-20 bg-[#0f172a] border-b-2 border-[#dc2626] px-4 pt-3 pb-3 shadow-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase leading-tight">
                HiTech Distributors
              </h1>
              <p className="text-xs font-bold text-[#dc2626] tracking-wide uppercase">
                Customer Question Log
              </p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] border border-slate-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Staff Room</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-300 font-mono mb-2.5 flex items-center justify-between">
            <span>
              Staff: <strong className="text-white">{person.name}</strong> ({person.code})
            </span>
            <button
              type="button"
              onClick={loadEntries}
              className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] underline cursor-pointer"
              title="Refresh entries"
            >
              <RefreshCw className={`w-3 h-3 ${loadingEntries ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </div>

          {/* 3 Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleTabSwitch("quick-add")}
              className={`py-2.5 px-2 rounded-lg text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                activeTab === "quick-add" && !editingEntry
                  ? "bg-[#dc2626] text-white border-[#dc2626]"
                  : "bg-[#16233b] text-slate-200 border-slate-700 hover:bg-[#1e293b]"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Quick Add</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("to-label")}
              className={`py-2.5 px-2 rounded-lg text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                activeTab === "to-label" || (editingEntry && editReturnTab === "to-label")
                  ? "bg-[#dc2626] text-white border-[#dc2626]"
                  : "bg-[#16233b] text-slate-200 border-slate-700 hover:bg-[#1e293b]"
              }`}
            >
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>To Label</span>
              {unlabeledOldestFirst.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white text-black" style={{ color: "#000000" }}>
                  {unlabeledOldestFirst.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("my-log")}
              className={`py-2.5 px-2 rounded-lg text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                activeTab === "my-log" || (editingEntry && editReturnTab === "my-log")
                  ? "bg-[#dc2626] text-white border-[#dc2626]"
                  : "bg-[#16233b] text-slate-200 border-slate-700 hover:bg-[#1e293b]"
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 shrink-0" />
              <span>My Log</span>
            </button>
          </div>
        </header>

        {/* Global load error banner */}
        {loadError && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-[#7f1d1d] border border-[#dc2626] text-white text-xs flex items-center justify-between gap-2">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={loadEntries}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-bold uppercase text-[11px] shrink-0 cursor-pointer"
              style={{ color: "#000000" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="p-4 flex-1 flex flex-col gap-4 pb-10">
          {/* LABEL SCREEN (when editing an unlabeled or needs-fix entry) */}
          {editingEntry ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setLabelError("");
                  }}
                  className="px-3 py-2 rounded-lg bg-[#16233b] border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to list</span>
                </button>
                <span className="text-xs font-mono text-slate-300">
                  {editingEntry.entry_no ? `Entry #${editingEntry.entry_no}` : "Question"} • {editingEntry.source}
                </span>
              </div>

              {/* Read-only Question Text */}
              <div className="p-4 rounded-xl bg-white text-black border-2 border-slate-300 shadow-sm" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-600" style={{ color: "#dc2626" }}>
                    Customer Question (Read-Only)
                  </span>
                  <span className="text-[11px] font-mono text-black">{editingEntry.asked_on}</span>
                </div>
                <p className="text-sm font-semibold text-black leading-relaxed whitespace-pre-wrap break-words">
                  {editingEntry.question_text}
                </p>
                {editingEntry.recalled && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[#0f172a] text-white text-[10px] font-bold uppercase">
                    From memory
                  </span>
                )}
              </div>

              {db.isQuestionLogNeedsFix(editingEntry.review_status) && (
                <div className="p-3 rounded-xl bg-[#7f1d1d] border border-[#dc2626] text-white text-xs">
                  <p className="font-black uppercase tracking-wide mb-1 text-white">Manager Note (Needs Fix)</p>
                  <p className="text-white">{editingEntry.review_note || "Please review and update your labels."}</p>
                </div>
              )}

              {/* 1. Intent */}
              <section className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700">
                <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2.5">
                  1. Intent (Pick 1)
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {db.QUESTION_LOG_INTENTS.map((intentOption) => {
                    const selected = labelIntent === intentOption;
                    return (
                      <button
                        key={intentOption}
                        type="button"
                        onClick={() => setLabelIntent(intentOption)}
                        style={{
                          backgroundColor: selected ? "#dc2626" : "#ffffff",
                          color: selected ? "#ffffff" : "#000000",
                        }}
                        className={`py-3 px-3 rounded-xl text-sm font-bold border-2 text-center transition-colors cursor-pointer ${
                          selected
                            ? "bg-[#dc2626] border-white text-white shadow"
                            : "bg-white border-slate-300 text-black hover:bg-slate-100"
                        } ${intentOption === "Product Enquiry" ? "col-span-2" : ""}`}
                      >
                        {intentOption}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2. Sentiment */}
              <section className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700">
                <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2.5">
                  2. Sentiment
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {db.QUESTION_LOG_SENTIMENTS.map((sentimentOption) => {
                    const selected = labelSentiment === sentimentOption;
                    return (
                      <button
                        key={sentimentOption}
                        type="button"
                        onClick={() => setLabelSentiment(sentimentOption)}
                        style={{
                          backgroundColor: selected ? "#dc2626" : "#ffffff",
                          color: selected ? "#ffffff" : "#000000",
                        }}
                        className={`py-3 px-2 rounded-xl text-sm font-bold border-2 text-center transition-colors cursor-pointer ${
                          selected
                            ? "bg-[#dc2626] border-white text-white shadow"
                            : "bg-white border-slate-300 text-black hover:bg-slate-100"
                        }`}
                      >
                        {sentimentOption}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 3. Personal details in this question? */}
              <section className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700">
                <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2.5">
                  3. Personal details in this question?
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "No", val: false },
                    { label: "Yes", val: true },
                  ].map((opt) => {
                    const selected = labelPiiPresent === opt.val;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setLabelPiiPresent(opt.val);
                          if (!opt.val) setLabelPiiKind(null);
                        }}
                        style={{
                          backgroundColor: selected ? "#dc2626" : "#ffffff",
                          color: selected ? "#ffffff" : "#000000",
                        }}
                        className={`py-3 px-3 rounded-xl text-sm font-bold border-2 text-center transition-colors cursor-pointer ${
                          selected
                            ? "bg-[#dc2626] border-white text-white shadow"
                            : "bg-white border-slate-300 text-black hover:bg-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {labelPiiPresent === true && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs font-bold text-white mb-2">Which kind?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {db.QUESTION_LOG_PII_KINDS.map((kind) => {
                        const selected = labelPiiKind === kind;
                        return (
                          <button
                            key={kind}
                            type="button"
                            onClick={() => setLabelPiiKind(kind)}
                            style={{
                              backgroundColor: selected ? "#dc2626" : "#ffffff",
                              color: selected ? "#ffffff" : "#000000",
                            }}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 text-center transition-colors cursor-pointer ${
                              selected
                                ? "bg-[#dc2626] border-white text-white"
                                : "bg-white border-slate-300 text-black hover:bg-slate-100"
                            }`}
                          >
                            {kind}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* 4. How sure are you? */}
              <section className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700">
                <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2.5">
                  4. How sure are you?
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {db.QUESTION_LOG_CONFIDENCES.map((conf) => {
                    const selected = labelConfidence === conf;
                    return (
                      <button
                        key={conf}
                        type="button"
                        onClick={() => {
                          setLabelConfidence(conf);
                          if (conf === "Clear") {
                            setLabelTrickyReasons([]);
                            setLabelTrickyNote("");
                          }
                        }}
                        style={{
                          backgroundColor: selected ? "#dc2626" : "#ffffff",
                          color: selected ? "#ffffff" : "#000000",
                        }}
                        className={`py-3 px-3 rounded-xl text-sm font-bold border-2 text-center transition-colors cursor-pointer ${
                          selected
                            ? "bg-[#dc2626] border-white text-white shadow"
                            : "bg-white border-slate-300 text-black hover:bg-slate-100"
                        }`}
                      >
                        {conf}
                      </button>
                    );
                  })}
                </div>

                {labelConfidence === "Tricky" && (
                  <div className="mt-3 pt-3 border-t border-slate-700 flex flex-col gap-2.5">
                    <p className="text-xs font-bold text-white">Why was it tricky? (Tap all that apply)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {db.QUESTION_LOG_TRICKY_REASONS.map((reason) => {
                        const selected = labelTrickyReasons.includes(reason);
                        return (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => toggleMultiItem(labelTrickyReasons, reason, setLabelTrickyReasons)}
                            style={{
                              backgroundColor: selected ? "#dc2626" : "#ffffff",
                              color: selected ? "#ffffff" : "#000000",
                            }}
                            className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border-2 text-center transition-colors cursor-pointer ${
                              selected
                                ? "bg-[#dc2626] border-white text-white"
                                : "bg-white border-slate-300 text-black hover:bg-slate-100"
                            }`}
                          >
                            {reason}
                          </button>
                        );
                      })}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white mb-1">
                        Short note (optional, max 140 chars)
                      </label>
                      <input
                        type="text"
                        maxLength={140}
                        value={labelTrickyNote}
                        onChange={(e) => setLabelTrickyNote(e.target.value)}
                        placeholder="Optional one-line explanation"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#dc2626]"
                        style={{ backgroundColor: "#ffffff", color: "#000000" }}
                      />
                      <p className="text-[10px] text-white text-right mt-0.5">
                        {labelTrickyNote.length}/140
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* 5. Did the store already have the answer? */}
              <section className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700">
                <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2.5">
                  5. Did the store already have the answer?
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {db.QUESTION_LOG_STORE_HAD_ANSWER.map((ans) => {
                    const selected = labelStoreHadAnswer === ans;
                    return (
                      <button
                        key={ans}
                        type="button"
                        onClick={() => {
                          setLabelStoreHadAnswer(ans);
                          if (ans !== "No") {
                            setLabelMissingItems([]);
                          }
                        }}
                        style={{
                          backgroundColor: selected ? "#dc2626" : "#ffffff",
                          color: selected ? "#ffffff" : "#000000",
                        }}
                        className={`py-3 px-2 rounded-xl text-sm font-bold border-2 text-center transition-colors cursor-pointer ${
                          selected
                            ? "bg-[#dc2626] border-white text-white shadow"
                            : "bg-white border-slate-300 text-black hover:bg-slate-100"
                        }`}
                      >
                        {ans}
                      </button>
                    );
                  })}
                </div>

                {labelStoreHadAnswer === "No" && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs font-bold text-white mb-2">
                      What was missing? (Tap all that apply)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {db.QUESTION_LOG_MISSING_ITEMS.map((item) => {
                        const selected = labelMissingItems.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleMultiItem(labelMissingItems, item, setLabelMissingItems)}
                            style={{
                              backgroundColor: selected ? "#dc2626" : "#ffffff",
                              color: selected ? "#ffffff" : "#000000",
                            }}
                            className={`py-2.5 px-2.5 rounded-xl text-xs font-bold border-2 text-center transition-colors cursor-pointer ${
                              selected
                                ? "bg-[#dc2626] border-white text-white"
                                : "bg-white border-slate-300 text-black hover:bg-slate-100"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {labelError && (
                <div className="p-3 rounded-xl bg-[#7f1d1d] border-2 border-[#dc2626] text-white text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{labelError}</p>
                    {labelError !== db.QUESTION_LOG_PII_WARNING && (
                      <button
                        type="button"
                        onClick={handleSaveLabels}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-white text-black font-extrabold text-[11px] uppercase cursor-pointer"
                        style={{ color: "#000000" }}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={savingLabels}
                onClick={handleSaveLabels}
                className="w-full py-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 text-white font-black text-base uppercase tracking-wider shadow-lg cursor-pointer transition-colors"
              >
                {savingLabels ? "Saving Labels..." : "Save Labels"}
              </button>
            </div>
          ) : activeTab === "quick-add" ? (
            /* TAB 1: QUICK ADD */
            <form onSubmit={handleSaveQuickAdd} className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-[#16233b] border border-slate-700 flex flex-col gap-2">
                <label
                  htmlFor="ql-question-input"
                  className="text-sm font-black text-white tracking-wide"
                >
                  Paste the customer&apos;s exact words
                </label>
                <textarea
                  id="ql-question-input"
                  rows={5}
                  value={questionText}
                  onChange={(e) => {
                    setQuestionText(e.target.value);
                    if (quickAddError) setQuickAddError("");
                    if (quickAddSuccess) setQuickAddSuccess("");
                  }}
                  placeholder="Paste or type what the customer asked..."
                  className="w-full rounded-xl border-2 border-slate-300 p-3.5 text-base leading-relaxed outline-none focus:border-[#dc2626] resize-y"
                  style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                />
                <p className="text-xs text-slate-200 leading-snug">
                  Replace names, phone numbers, emails or addresses with{" "}
                  <span className="font-mono font-bold text-white">[NAME], [PHONE], [EMAIL], [ADDRESS]</span>.
                </p>
              </div>

              {/* Source tap buttons */}
              <div className="p-4 rounded-xl bg-[#16233b] border border-slate-700">
                <p className="text-xs font-black uppercase tracking-wider text-white mb-2.5">
                  Where did the customer ask?
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {db.QUESTION_LOG_SOURCES.map((src) => {
                    const active = source === src;
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => {
                          setSource(src);
                          if (quickAddSuccess) setQuickAddSuccess("");
                        }}
                        style={{
                          backgroundColor: active ? "#dc2626" : "#ffffff",
                          color: active ? "#ffffff" : "#000000",
                        }}
                        className={`py-3 px-2 rounded-xl text-xs font-extrabold border-2 text-center transition-colors cursor-pointer ${
                          active
                            ? "bg-[#dc2626] border-white text-white shadow"
                            : "bg-white border-slate-300 text-black hover:bg-slate-100"
                        }`}
                      >
                        {src}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checkbox: From memory, not exact words — Prominent when source is Walk-in or Phone */}
              <label
                className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-colors ${
                  isMemoryProminentSource
                    ? "bg-[#1e293b] border-[#dc2626] shadow-md"
                    : "bg-[#16233b] border-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={recalled}
                  onChange={(e) => setRecalled(e.target.checked)}
                  className="w-5 h-5 accent-[#dc2626] cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold text-white block">
                    From memory, not exact words
                  </span>
                  {isMemoryProminentSource && (
                    <span className="text-[11px] text-slate-200 block mt-0.5">
                      Recommended to tick for {source} enquiries if typed from memory.
                    </span>
                  )}
                </div>
              </label>

              {/* Date asked */}
              <div className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <Calendar className="w-4 h-4 text-[#dc2626]" />
                    <span>
                      Date asked:{" "}
                      <strong className="text-white font-mono">
                        {askedOn === todayIso ? `Today (${askedOn})` : askedOn}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker((prev) => !prev)}
                    className="text-xs font-bold text-white underline hover:text-[#dc2626] cursor-pointer"
                  >
                    {showDatePicker ? "done" : "change"}
                  </button>
                </div>

                {showDatePicker && (
                  <input
                    type="date"
                    value={askedOn}
                    max={todayIso}
                    onChange={(e) => setAskedOn(e.target.value || todayIso)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono outline-none"
                    style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                  />
                )}
              </div>

              {quickAddError && (
                <div className="p-3.5 rounded-xl bg-[#7f1d1d] border-2 border-[#dc2626] text-white text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{quickAddError}</p>
                    {quickAddError !== db.QUESTION_LOG_PII_WARNING && (
                      <button
                        type="button"
                        onClick={() => handleSaveQuickAdd()}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-white text-black font-extrabold text-[11px] uppercase cursor-pointer"
                        style={{ color: "#000000" }}
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quickAddSuccess && (
                <div
                  className="p-3.5 rounded-xl bg-white text-black border-2 border-[#16233b] text-sm font-black flex items-center gap-2 shadow"
                  style={{ backgroundColor: "#ffffff", color: "#000000" }}
                >
                  <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{quickAddSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingQuickAdd}
                className="w-full py-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 text-white font-black text-base uppercase tracking-wider shadow-lg cursor-pointer transition-colors"
              >
                {savingQuickAdd ? "Saving..." : "Save"}
              </button>
            </form>
          ) : activeTab === "to-label" ? (
            /* TAB 2: TO LABEL (oldest first) */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Unlabeled Queue (Oldest First)
                </h2>
                <span className="text-xs font-mono text-slate-300">
                  {unlabeledOldestFirst.length} waiting
                </span>
              </div>

              {loadingEntries ? (
                <div className="p-6 rounded-xl bg-[#16233b] border border-slate-700 text-center text-xs text-slate-300">
                  Loading your unlabeled questions...
                </div>
              ) : unlabeledOldestFirst.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#16233b] border border-slate-700 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                  <p className="text-sm font-bold text-white">All caught up!</p>
                  <p className="text-xs text-slate-300">
                    No unlabeled questions waiting right now.
                  </p>
                </div>
              ) : (
                unlabeledOldestFirst.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => openLabelScreen(entry, "to-label")}
                    style={{ backgroundColor: "#ffffff", color: "#000000" }}
                    className="w-full text-left p-4 rounded-xl bg-white text-black border-2 border-slate-300 hover:border-[#dc2626] transition-colors flex flex-col gap-2 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-[#0f172a] text-white uppercase">
                        {entry.source}
                      </span>
                      <span className="font-mono text-black">{entry.asked_on}</span>
                    </div>
                    <p className="text-sm font-semibold text-black line-clamp-3 leading-snug">
                      {entry.question_text}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {entry.recalled && (
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-black text-[10px] font-bold">
                            From memory
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-black text-red-600 uppercase">
                        Tap to Label →
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* TAB 3: MY LOG (newest first) */
            <div className="flex flex-col gap-3">
              {/* Summary Bar: this week's count + total labeled */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white">
                    This Week
                  </p>
                  <p className="text-2xl font-black text-white mt-0.5">{thisWeekCount}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#16233b] border border-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Total Labeled
                  </p>
                  <p className="text-2xl font-black text-white mt-0.5">{totalLabeledCount}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-white">
                  All My Entries (Newest First)
                </h2>
                <span className="text-xs font-mono text-white">{myLogNewestFirst.length} total</span>
              </div>

              {loadingEntries ? (
                <div className="p-6 rounded-xl bg-[#16233b] border border-slate-700 text-center text-xs text-white">
                  Loading your log...
                </div>
              ) : myLogNewestFirst.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#16233b] border border-slate-700 text-center flex flex-col items-center gap-2">
                  <ClipboardList className="w-8 h-8 text-white" />
                  <p className="text-sm font-bold text-white">No entries yet</p>
                  <p className="text-xs text-white">
                    Use Quick Add to save your first customer question.
                  </p>
                </div>
              ) : (
                myLogNewestFirst.map((entry) => {
                  const needsFix = db.isQuestionLogNeedsFix(entry.review_status);
                  const reviewed = db.isQuestionLogReviewed(entry.review_status);
                  const reviewLabel = needsFix
                    ? "needs fix"
                    : reviewed
                    ? "reviewed"
                    : "pending";

                  return (
                    <div
                      key={entry.id}
                      style={{ backgroundColor: "#ffffff", color: "#000000" }}
                      className="p-4 rounded-xl bg-white text-black border-2 border-slate-300 flex flex-col gap-2 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-bold">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#0f172a] text-white uppercase">
                            {entry.source}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded uppercase ${
                              entry.status === "labeled"
                                ? "bg-slate-200 text-black"
                                : "bg-[#dc2626] text-white"
                            }`}
                          >
                            {entry.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded uppercase ${
                              needsFix
                                ? "bg-[#dc2626] text-white"
                                : reviewed
                                ? "bg-[#0f172a] text-white"
                                : "bg-slate-100 text-black border border-slate-300"
                            }`}
                          >
                            {reviewLabel}
                          </span>
                          {entry.recalled && (
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-black">
                              From memory
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-black">{entry.asked_on}</span>
                      </div>

                      <p className="text-sm font-semibold text-black leading-snug whitespace-pre-wrap break-words">
                        {entry.question_text}
                      </p>

                      {entry.status === "labeled" && (
                        <div className="text-xs text-black flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-slate-200">
                          <span>
                            <strong>Intent:</strong> {entry.intent || "—"}
                          </span>
                          <span>
                            <strong>Sentiment:</strong> {entry.sentiment || "—"}
                          </span>
                          <span>
                            <strong>Sure:</strong> {entry.confidence || "—"}
                          </span>
                        </div>
                      )}

                      {needsFix && (
                        <div className="p-2.5 rounded-lg bg-[#fef2f2] border border-[#dc2626] text-black text-xs flex flex-col gap-2">
                          <div>
                            <span className="font-black text-red-600 uppercase block">
                              Manager Review Note:
                            </span>
                            <span className="font-medium text-black">
                              {entry.review_note || "Please update these labels."}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openLabelScreen(entry, "my-log")}
                            className="w-full py-2.5 px-3 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-xs uppercase tracking-wide cursor-pointer"
                          >
                            Edit Labels &amp; Re-save
                          </button>
                        </div>
                      )}

                      {reviewed && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-black pt-0.5">
                          <Lock className="w-3.5 h-3.5 text-black" />
                          <span>Reviewed &amp; locked</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
