import React, { useState, useEffect } from "react";
import { Clock, Users, Target, Shield, X, Settings, RefreshCw, Database } from "lucide-react";
import * as db from "./lib/supabase";

export default function MasterSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"engines" | "timeline" | "targets" | "staff">("engines");

  // State
  const [timeline, setTimeline] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const tl = await db.fetchMasterTimeline();
      const eng = await db.fetchMasterEngines();
      const targs = await db.fetchMasterTargets();
      const stf = await db.fetchMasterStaff();
      
      // Fallbacks if tables are empty (seed data)
      if (tl && tl.length > 0) setTimeline(tl);
      else setTimeline([{ id: Date.now().toString(), month: "September 2026", phase_label: "Conversion Engine", what_was_done: "Initial setup of Master Section", what_was_achieved: "Clear visibility established" }]);

      if (eng && eng.length > 0) setEngines(eng);
      else setEngines([
        { id: "e1", engine_name: "Entertainment Engine", status: "Not Started", running: "Staff + youngster content creation", notes: "Not yet running." },
        { id: "e2", engine_name: "Education Engine", status: "Building", running: "HiTech Shadow School, Gatekeepers, ESGMC direct mentoring", notes: "Planning phase" },
        { id: "e3", engine_name: "Trust Engine", status: "Building", running: "Readiness for Reach, SDG Allied Business, Response Academy", notes: "" },
        { id: "e4", engine_name: "Innovation Engine", status: "Active", running: "HubTenant (youth-innovator-created rented-space system)", notes: "" },
        { id: "e5", engine_name: "Conversion Engine", status: "Not Started", running: "Clear CTA, WA handoff, staff prompting, first-sale incentive", notes: "Current priority (September target)" },
        { id: "e6", engine_name: "Referral Engine", status: "Building", running: "HubTenant, HubAlly (cross-referrals)", notes: "Informal and formal relationships" },
        { id: "e7", engine_name: "Community Engine", status: "Weak/Unclear", running: "No structure defined yet", notes: "Flagged for future work" },
      ]);

      if (targs && targs.length > 0) setTargets(targs);
      else setTargets([{ id: "t1", engine_name: "Conversion Engine", target_description: "First customer enters via outlet and completes a purchase", progress_notes: "Need to train staff on prompting users", status: "Not Met" }]);

      if (stf && stf.length > 0) setStaffList(stf);
      else setStaffList([
        { id: "s1", staff_name: "Fortune", role: "ESGMC / Owner", interest_level: "Engaged", notes: "Leading digital transformation", _tempLog: "Built digital ecosystem, set up hublets" },
        { id: "s2", staff_name: "Osita", role: "Manager", interest_level: "Minimal", notes: "Needs to push Conversion Engine", _tempLog: "Managing physical store and staff" }
      ]);
    } catch (e) {
      console.error(e);
      setSaveStatus("Error loading from Supabase. Check RLS policies.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "efeiconic" || pin === "master26") {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Unauthorized access.");
    }
  };

  const showSaveStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(""), 3000);
  };

  // Updaters (auto-save to Supabase)
  const updateEngine = async (id: string, updates: any) => {
    const newE = engines.map(x => x.id === id ? { ...x, ...updates } : x);
    setEngines(newE);
    const target = newE.find(x => x.id === id);
    if (!target.id.startsWith("e")) {
       await db.upsertMasterEngine(target);
       showSaveStatus("Saved to Supabase!");
    } else {
       // Seed data, need to remove mock ID if we push to supabase
       const { id: _, running, ...dbObj } = target; 
       // We map 'running' to notes for now since the schema doesn't have it, or combine
       dbObj.notes = `Running: ${running || ''} | Notes: ${dbObj.notes || ''}`;
       const res = await db.upsertMasterEngine(dbObj);
       if (res && res.length > 0) {
         setEngines(engines.map(x => x.id === id ? res[0] : x));
       }
    }
  };

  const updateTimeline = async (id: string, updates: any) => {
    const newT = timeline.map(x => x.id === id ? { ...x, ...updates } : x);
    setTimeline(newT);
    const target = newT.find(x => x.id === id);
    if (!target.id.startsWith("t") && target.id.length > 20) {
       await db.upsertMasterTimeline(target);
       showSaveStatus("Saved timeline!");
    } else {
       const { id: _, ...dbObj } = target;
       const res = await db.upsertMasterTimeline(dbObj);
       if (res && res.length > 0) setTimeline(timeline.map(x => x.id === id ? res[0] : x));
    }
  };

  const updateTarget = async (id: string, updates: any) => {
    const newT = targets.map(x => x.id === id ? { ...x, ...updates } : x);
    setTargets(newT);
    const target = newT.find(x => x.id === id);
    if (!target.id.startsWith("t") && target.id.length > 20) {
       await db.upsertMasterTarget(target);
       showSaveStatus("Saved target!");
    } else {
       const { id: _, ...dbObj } = target;
       const res = await db.upsertMasterTarget(dbObj);
       if (res && res.length > 0) setTargets(targets.map(x => x.id === id ? res[0] : x));
    }
  };

  const updateStaff = async (id: string, updates: any) => {
    const newS = staffList.map(x => x.id === id ? { ...x, ...updates } : x);
    setStaffList(newS);
    const staff = newS.find(x => x.id === id);
    if (!staff.id.startsWith("s") && staff.id.length > 20) {
       await db.upsertMasterStaff({
         id: staff.id,
         staff_name: staff.staff_name,
         role: staff.role,
         interest_level: staff.interest_level,
         notes: staff.notes
       });
       showSaveStatus("Saved staff!");
    } else {
       const { id: _, _tempLog, ...dbObj } = staff;
       const res = await db.upsertMasterStaff(dbObj);
       if (res && res.length > 0) {
          // Keep tempLog
          res[0]._tempLog = staff._tempLog;
          setStaffList(staffList.map(x => x.id === id ? res[0] : x));
       }
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "Active" || status === "Met" || status === "Engaged") return "text-emerald-400 bg-emerald-950/40 border-emerald-800";
    if (status === "Building" || status === "In Progress" || status === "Minimal") return "text-blue-400 bg-blue-950/40 border-blue-800";
    if (status === "Not Started" || status === "Not Met" || status === "Not Participating") return "text-slate-400 bg-slate-800/40 border-slate-700";
    if (status === "Weak/Unclear") return "text-orange-400 bg-orange-950/40 border-orange-800";
    return "text-slate-400 border-slate-700";
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-center">
          <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <h3 className="text-purple-400 font-black tracking-widest uppercase mb-1">Master Access Tier</h3>
          <p className="text-[10px] text-slate-400 font-mono">Restricted to ESGMC / Efeiconic</p>
        </div>
        <form onSubmit={handleLogin} className="p-5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-4">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center">Enter Master PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-center text-purple-400 text-xl font-mono tracking-[0.5em] rounded-lg p-4 outline-none focus:border-purple-500 transition-colors"
            placeholder="••••"
          />
          {error && <p className="text-xs text-red-500 text-center uppercase tracking-widest font-bold">{error}</p>}
          <button type="submit" className="w-full py-4 bg-purple-700 hover:bg-purple-600 rounded-lg text-xs font-black text-white uppercase tracking-widest shadow-lg">
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="p-4 rounded-xl bg-slate-900 border border-purple-900/50 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Shield className="w-24 h-24 text-purple-400" />
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-purple-400 font-black text-lg tracking-widest uppercase flex items-center gap-2">
              <Database className="w-5 h-5" /> Master Hub
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Supabase Live Database</p>
          </div>
          <button onClick={fetchData} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
             <RefreshCw className={"w-4 h-4 text-slate-300 " + (loading ? "animate-spin" : "")} />
          </button>
        </div>
      </div>
      
      {saveStatus && (
        <div className="p-2 bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-bold text-center rounded">
          {saveStatus}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: "engines", label: "7 Engines", icon: <Settings className="w-3.5 h-3.5" /> },
          { id: "timeline", label: "Timeline", icon: <Clock className="w-3.5 h-3.5" /> },
          { id: "targets", label: "Targets", icon: <Target className="w-3.5 h-3.5" /> },
          { id: "staff", label: "Staff Eval", icon: <Users className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={"px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap transition-colors " + (activeTab === tab.id ? "bg-purple-600 text-white shadow-md" : "bg-slate-900 text-slate-400 border border-slate-800")}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {/* ENGINES */}
        {activeTab === "engines" && (
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
              <p className="text-xs text-slate-400 italic font-serif leading-relaxed">
                Track the actual status of the Seven Business Engines framework. Synced to Supabase.
              </p>
            </div>
            {engines.map(engine => (
              <div key={engine.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-black text-white uppercase tracking-wider text-xs">{engine.engine_name}</h4>
                  <select 
                    value={engine.status}
                    onChange={(e) => updateEngine(engine.id, { status: e.target.value })}
                    className={"text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded outline-none border " + getStatusColor(engine.status)}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Building">Building</option>
                    <option value="Active">Active</option>
                    <option value="Weak/Unclear">Weak/Unclear</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest">Master Notes</label>
                  <textarea 
                    value={engine.notes}
                    onBlur={(e) => updateEngine(engine.id, { notes: e.target.value })}
                    onChange={(e) => setEngines(engines.map(x => x.id === engine.id ? { ...x, notes: e.target.value } : x))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 min-h-[60px] outline-none focus:border-purple-500 placeholder-slate-700"
                    placeholder="Add specific notes or blockers..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                const newT = { id: Date.now().toString(), month: "", phase_label: "", what_was_done: "", what_was_achieved: "" };
                setTimeline([newT, ...timeline]);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 border-dashed rounded-lg text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              + Add New Month Entry
            </button>

            <div className="relative border-l-2 border-purple-900/30 ml-2 pl-4 flex flex-col gap-6 mt-4">
              {timeline.map(entry => (
                <div key={entry.id} className="relative bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
                  <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-slate-950" />
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Month (e.g. July 2026)" 
                      value={entry.month}
                      onBlur={(e) => updateTimeline(entry.id, { month: e.target.value })}
                      onChange={(e) => setTimeline(timeline.map(x => x.id === entry.id ? { ...x, month: e.target.value } : x))}
                      className="flex-1 bg-transparent border-b border-slate-700 text-sm font-black text-purple-400 uppercase tracking-wider outline-none focus:border-purple-400 pb-1"
                    />
                    <button 
                      onClick={async () => {
                        if (!entry.id.startsWith("t") && entry.id.length > 20) {
                          await db.deleteMasterTimelineEntry(entry.id);
                        }
                        setTimeline(timeline.filter(x => x.id !== entry.id));
                      }}
                      className="text-slate-600 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input 
                    type="text" 
                    placeholder="Phase Label (e.g. Build & Launch)" 
                    value={entry.phase_label}
                    onBlur={(e) => updateTimeline(entry.id, { phase_label: e.target.value })}
                    onChange={(e) => setTimeline(timeline.map(x => x.id === entry.id ? { ...x, phase_label: e.target.value } : x))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-bold text-slate-200 outline-none focus:border-purple-500 uppercase tracking-wider"
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest">What Was Done</label>
                    <textarea 
                      value={entry.what_was_done}
                      onBlur={(e) => updateTimeline(entry.id, { what_was_done: e.target.value })}
                      onChange={(e) => setTimeline(timeline.map(x => x.id === entry.id ? { ...x, what_was_done: e.target.value } : x))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 min-h-[60px] outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-slate-500 uppercase tracking-widest">What Was Achieved</label>
                    <textarea 
                      value={entry.what_was_achieved}
                      onBlur={(e) => updateTimeline(entry.id, { what_was_achieved: e.target.value })}
                      onChange={(e) => setTimeline(timeline.map(x => x.id === entry.id ? { ...x, what_was_achieved: e.target.value } : x))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-emerald-400 min-h-[60px] outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TARGETS */}
        {activeTab === "targets" && (
          <div className="flex flex-col gap-4">
             <button 
              onClick={() => {
                const newT = { id: Date.now().toString(), engine_name: "", target_description: "", progress_notes: "", status: "Not Met" };
                setTargets([newT, ...targets]);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 border-dashed rounded-lg text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              + Add Target Phase
            </button>

            {targets.map(target => (
              <div key={target.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 relative">
                <button 
                  onClick={async () => {
                    if (!target.id.startsWith("t") && target.id.length > 20) {
                      await db.deleteMasterTarget(target.id);
                    }
                    setTargets(targets.filter(x => x.id !== target.id));
                  }}
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <input 
                  type="text" 
                  placeholder="Engine / Phase" 
                  value={target.engine_name}
                  onBlur={(e) => updateTarget(target.id, { engine_name: e.target.value })}
                  onChange={(e) => setTargets(targets.map(x => x.id === target.id ? { ...x, engine_name: e.target.value } : x))}
                  className="w-11/12 bg-transparent border-b border-slate-700 text-sm font-black text-white uppercase tracking-wider outline-none focus:border-purple-400 pb-1"
                />

                <div className="flex justify-between items-center mt-2">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest">Status</label>
                  <select 
                    value={target.status}
                    onChange={(e) => updateTarget(target.id, { status: e.target.value })}
                    className={"text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded outline-none border " + getStatusColor(target.status)}
                  >
                    <option value="Not Met">Not Met</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Met">Met</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest">Target Goal</label>
                  <textarea 
                    value={target.target_description}
                    onBlur={(e) => updateTarget(target.id, { target_description: e.target.value })}
                    onChange={(e) => setTargets(targets.map(x => x.id === target.id ? { ...x, target_description: e.target.value } : x))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white min-h-[60px] outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest">Progress Notes</label>
                  <textarea 
                    value={target.progress_notes}
                    onBlur={(e) => updateTarget(target.id, { progress_notes: e.target.value })}
                    onChange={(e) => setTargets(targets.map(x => x.id === target.id ? { ...x, progress_notes: e.target.value } : x))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 min-h-[60px] outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STAFF EVAL */}
        {activeTab === "staff" && (
          <div className="flex flex-col gap-4">
             <button 
              onClick={() => {
                const newS = { id: Date.now().toString(), staff_name: "", role: "", _tempLog: "", interest_level: "Not Participating", notes: "" };
                setStaffList([...staffList, newS]);
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 border-dashed rounded-lg text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              + Add Staff Member
            </button>

            {staffList.map(staff => (
              <div key={staff.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 relative">
                <button 
                  onClick={async () => {
                    if (!staff.id.startsWith("s") && staff.id.length > 20) {
                      await db.deleteMasterStaff(staff.id);
                    }
                    setStaffList(staffList.filter(x => x.id !== staff.id));
                  }}
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex gap-2 w-11/12">
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={staff.staff_name}
                    onBlur={(e) => updateStaff(staff.id, { staff_name: e.target.value })}
                    onChange={(e) => setStaffList(staffList.map(x => x.id === staff.id ? { ...x, staff_name: e.target.value } : x))}
                    className="flex-1 bg-transparent border-b border-slate-700 text-sm font-black text-white outline-none focus:border-purple-400 pb-1"
                  />
                  <input 
                    type="text" 
                    placeholder="Role" 
                    value={staff.role}
                    onBlur={(e) => updateStaff(staff.id, { role: e.target.value })}
                    onChange={(e) => setStaffList(staffList.map(x => x.id === staff.id ? { ...x, role: e.target.value } : x))}
                    className="flex-1 bg-transparent border-b border-slate-700 text-xs text-blue-400 font-mono outline-none focus:border-purple-400 pb-1"
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest">Interest / Engagement</label>
                  <select 
                    value={staff.interest_level}
                    onChange={(e) => updateStaff(staff.id, { interest_level: e.target.value })}
                    className={"text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded outline-none border " + getStatusColor(staff.interest_level)}
                  >
                    <option value="Engaged">Engaged</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Not Participating">Not Participating</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest">Activity Log / Notes</label>
                  <textarea 
                    value={staff.notes}
                    onBlur={(e) => updateStaff(staff.id, { notes: e.target.value })}
                    onChange={(e) => setStaffList(staffList.map(x => x.id === staff.id ? { ...x, notes: e.target.value } : x))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono min-h-[60px] outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
