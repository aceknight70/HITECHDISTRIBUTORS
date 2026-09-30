import React, { useState, useEffect } from "react";
import { Clock, Users, Target, Shield, X, Settings, RefreshCw, Database, Store, DollarSign, Bell, CheckCircle, Plus, Trash2, Edit2 } from "lucide-react";
import * as db from "./lib/supabase";

export default function MasterSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"engines" | "timeline" | "targets" | "staff" | "tenants">("engines");

  // State
  const [timeline, setTimeline] = useState<any[]>([]);
  const [engines, setEngines] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [hubTenants, setHubTenants] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Master Tenant Form State
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [tenantFormData, setTenantFormData] = useState({
    name: "",
    category: "",
    code: "",
    commission_rate: 1.0,
    pixel_id: "",
    description: "",
    whatsapp: "",
    phone: "",
    email: ""
  });

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

      const tenants = await db.fetchHubTenants();
      setHubTenants(tenants);
      const comms = await db.fetchTenantCommissions();
      setCommissions(comms);
      const notifs = await db.fetchMasterTenantNotifications();
      setNotifications(notifs);
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
          { id: "tenants", label: "HubTenant & Ledgers", icon: <Store className="w-3.5 h-3.5" /> },
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

        {/* HUBTENANT & LEDGERS TAB */}
        {activeTab === "tenants" && (
          <div className="flex flex-col gap-5">
            {/* Header info */}
            <div className="p-3.5 bg-slate-900/60 border border-purple-900/50 rounded-xl">
              <h4 className="text-xs font-black uppercase text-purple-300 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>HubTenant System Oversight & Commission Ledger</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Field agents and small businesses renting storefronts. Monitor traffic, manage commission percentages, review manager notifications, and authorize payouts.
              </p>
            </div>

            {/* Notifications from Manager */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h5 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-400" /> Manager Tenant Notifications
                </h5>
                <span className="text-[10px] font-mono text-slate-500">
                  {notifications.filter(n => !n.acknowledged).length} Unread
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2 text-center">No notifications logged from managers.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-2.5 rounded-lg border text-xs flex justify-between items-center ${notif.acknowledged ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'}`}
                    >
                      <div>
                        <p className="font-bold text-white">
                          Manager created space: <strong className="text-emerald-400">{notif.tenant_name}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Assigned Code: {notif.referral_code} • {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      {!notif.acknowledged ? (
                        <button
                          onClick={async () => {
                            await db.acknowledgeMasterTenantNotification(notif.id);
                            setNotifications(await db.fetchMasterTenantNotifications());
                            showSaveStatus("Notification acknowledged!");
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Acknowledged
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Tenant Sales</span>
                <h4 className="text-lg font-black text-white mt-1 font-mono">
                  ₦{commissions.reduce((acc, c) => acc + (Number(c.sale_amount) || 0), 0).toLocaleString()}
                </h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Commission Liability</span>
                <h4 className="text-lg font-black text-emerald-400 mt-1 font-mono">
                  ₦{commissions.reduce((acc, c) => acc + (c.status !== 'Reversed' ? (Number(c.commission_amount) || 0) : 0), 0).toLocaleString()}
                </h4>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Merchants</span>
                <h4 className="text-lg font-black text-purple-400 mt-1 font-mono">
                  {hubTenants.filter(t => t.status === 'active').length} of {hubTenants.length}
                </h4>
              </div>
            </div>

            {/* Tenant Roster with Code Assignment & Commission Rate Controls */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" /> Tenant Roster & Code Assignment
                  </h5>
                  <p className="text-[10px] text-slate-400">Master is primary code assigner with full Add, Edit, and Removal controls</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTenant(null);
                    setTenantFormData({
                      name: "",
                      category: "",
                      code: "",
                      commission_rate: 1.0,
                      pixel_id: "",
                      description: "",
                      whatsapp: "",
                      phone: "",
                      email: ""
                    });
                    setIsAddingTenant(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign / Add Tenant</span>
                </button>
              </div>

              {/* Add / Edit Tenant Modal */}
              {isAddingTenant && (
                <div className="bg-slate-950 border-2 border-purple-500/80 p-4 rounded-xl flex flex-col gap-3 shadow-xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                    <h6 className="text-[11px] uppercase text-purple-300 font-bold flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>{editingTenant ? `Edit Tenant: ${editingTenant.tenant_name}` : "Assign New Tenant & Code (Master Authority)"}</span>
                    </h6>
                    <button onClick={() => { setIsAddingTenant(false); setEditingTenant(null); }} className="text-slate-400 hover:text-white">✕</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Tenant / Brand Name *</label>
                      <input
                        type="text"
                        value={tenantFormData.name}
                        onChange={e => setTenantFormData({ ...tenantFormData, name: e.target.value })}
                        placeholder="e.g. Martins or Favour Atigolo (Shama's Findings)"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Assigned Referral Code (Spoken-Friendly) *</label>
                      <input
                        type="text"
                        value={tenantFormData.code}
                        onChange={e => setTenantFormData({ ...tenantFormData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. MARTINSQW13 or SHAMASFINDINGS01"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono uppercase text-emerald-400 font-bold outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Category *</label>
                      <input
                        type="text"
                        value={tenantFormData.category}
                        onChange={e => setTenantFormData({ ...tenantFormData, category: e.target.value })}
                        placeholder="e.g. Solar & Inverters or Home Essentials"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Commission Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tenantFormData.commission_rate}
                        onChange={e => setTenantFormData({ ...tenantFormData, commission_rate: parseFloat(e.target.value) || 1.0 })}
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white font-mono outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Bio / Storefront Description</label>
                      <textarea
                        rows={2}
                        value={tenantFormData.description}
                        onChange={e => setTenantFormData({ ...tenantFormData, description: e.target.value })}
                        placeholder="Detailed background and summary of products offered..."
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">WhatsApp Number</label>
                      <input
                        type="text"
                        value={tenantFormData.whatsapp}
                        onChange={e => setTenantFormData({ ...tenantFormData, whatsapp: e.target.value })}
                        placeholder="e.g. +2347031489084"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Phone Number</label>
                      <input
                        type="text"
                        value={tenantFormData.phone}
                        onChange={e => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                        placeholder="e.g. +2348033221144"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Email Address</label>
                      <input
                        type="email"
                        value={tenantFormData.email}
                        onChange={e => setTenantFormData({ ...tenantFormData, email: e.target.value })}
                        placeholder="e.g. elishamaatigolo@gmail.com"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Meta Pixel ID (Optional)</label>
                      <input
                        type="text"
                        value={tenantFormData.pixel_id}
                        onChange={e => setTenantFormData({ ...tenantFormData, pixel_id: e.target.value })}
                        placeholder="e.g. 123456789012345"
                        className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setIsAddingTenant(false); setEditingTenant(null); }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!tenantFormData.name.trim()) return alert("Tenant name is required.");
                        const finalCode = tenantFormData.code.trim().toUpperCase() || tenantFormData.name.replace(/\s+/g, '').toUpperCase().slice(0, 10) + "01";
                        
                        const tenantObj = {
                          id: editingTenant ? editingTenant.id : ("tenant-" + Date.now()),
                          tenant_name: tenantFormData.name.trim(),
                          category: tenantFormData.category.trim() || "Partner Space",
                          description: tenantFormData.description.trim() || "HiTech Hublet Tenant",
                          photos: editingTenant?.photos || db.ensure30PhotoSlots(),
                          contact_info: {
                            whatsapp: tenantFormData.whatsapp.trim(),
                            phone: tenantFormData.phone.trim(),
                            email: tenantFormData.email.trim()
                          },
                          invoicing_enabled: true,
                          referral_code: finalCode,
                          assigned_by: "master",
                          commission_rate: Number(tenantFormData.commission_rate) || 1.0,
                          pixel_id: tenantFormData.pixel_id.trim(),
                          status: editingTenant?.status || "active",
                          date_added: editingTenant?.date_added || new Date().toISOString(),
                          referral_entries: editingTenant?.referral_entries || 0,
                          discovery_entries: editingTenant?.discovery_entries || 0
                        };

                        await db.saveHubTenant(tenantObj);
                        setHubTenants(await db.fetchHubTenants());
                        showSaveStatus(editingTenant ? `Updated ${tenantObj.tenant_name}!` : `Tenant ${tenantObj.tenant_name} onboarded with code ${finalCode}!`);
                        setIsAddingTenant(false);
                        setEditingTenant(null);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase shadow-md"
                    >
                      {editingTenant ? "Update Tenant" : "Assign Code & Save"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {hubTenants.length > 0 ? (
                  hubTenants.map(tenant => (
                    <div key={tenant.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs uppercase">{tenant.tenant_name}</span>
                          <span className={`w-2 h-2 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase font-mono">
                            {tenant.category}
                          </span>
                          {tenant.pixel_id && (
                            <span className="text-[8px] bg-blue-950 text-blue-400 px-1 py-0.5 rounded border border-blue-900 font-mono">
                              Pixel: {tenant.pixel_id}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-emerald-400 mt-0.5">
                          Code: <strong className="text-white">{tenant.referral_code}</strong> • Traffic: {tenant.referral_entries || 0} Ref / {tenant.discovery_entries || 0} Disc
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-1">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Rate:</span>
                          <input
                            type="number"
                            step="0.1"
                            defaultValue={tenant.commission_rate ?? 1.0}
                            onBlur={async (e) => {
                              const newRate = parseFloat(e.target.value) || 1.0;
                              await db.saveHubTenant({ ...tenant, commission_rate: newRate });
                              setHubTenants(await db.fetchHubTenants());
                              showSaveStatus(`Updated commission rate for ${tenant.tenant_name} to ${newRate}%`);
                            }}
                            className="w-14 bg-slate-950 text-white text-xs font-mono px-1 py-0.5 rounded border border-slate-700 outline-none text-right"
                          />
                          <span className="text-xs font-mono text-slate-400">%</span>
                        </div>

                        <button
                          onClick={() => {
                            setEditingTenant(tenant);
                            setTenantFormData({
                              name: tenant.tenant_name,
                              category: tenant.category || "",
                              code: tenant.referral_code,
                              commission_rate: tenant.commission_rate ?? 1.0,
                              pixel_id: tenant.pixel_id || "",
                              description: tenant.description || "",
                              whatsapp: tenant.contact_info?.whatsapp || "",
                              phone: tenant.contact_info?.phone || "",
                              email: tenant.contact_info?.email || ""
                            });
                            setIsAddingTenant(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                          title="Edit Tenant"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            const nextStatus = tenant.status === 'active' ? 'inactive' : 'active';
                            await db.saveHubTenant({ ...tenant, status: nextStatus });
                            setHubTenants(await db.fetchHubTenants());
                            showSaveStatus(`${tenant.tenant_name} set to ${nextStatus}`);
                          }}
                          className={`px-2.5 py-1.5 rounded text-[9px] font-bold uppercase transition-colors ${tenant.status === 'active' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}
                        >
                          {tenant.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to remove tenant "${tenant.tenant_name}" (${tenant.referral_code})?`)) {
                              await db.deleteHubTenant(tenant.id);
                              setHubTenants(await db.fetchHubTenants());
                              showSaveStatus(`Tenant ${tenant.tenant_name} removed.`);
                            }
                          }}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 rounded text-red-400"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-950 p-4">
                    <p className="text-xs text-slate-400 mb-2">No tenants found in local cache.</p>
                    <button
                      type="button"
                      onClick={async () => {
                        const loaded = await db.fetchHubTenants();
                        setHubTenants(loaded);
                        showSaveStatus("Restored official tenant spaces!");
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase cursor-pointer"
                    >
                      Restore Official Tenants
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Master Commission Ledger */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h5 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Point of Sale Commission Ledger
                </h5>
                <button
                  onClick={async () => setCommissions(await db.fetchTenantCommissions())}
                  className="text-[9px] text-slate-400 hover:text-white uppercase font-mono"
                >
                  ↻ Refresh
                </button>
              </div>

              {commissions.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-4 text-center bg-slate-950 rounded-lg border border-slate-800">
                  No sales commissions recorded yet. Whenever staff/customers apply a tenant promo code at checkout, the ledger automatically registers here.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {commissions.map(comm => (
                    <div key={comm.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{comm.tenant_name || "Merchant"}</span>
                          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-1.5 rounded border border-purple-900/50">
                            Inv: #{comm.invoice_reference}
                          </span>
                          <span className="text-[10px] text-slate-400">Cust: {comm.customer_name || "Direct Customer"}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Sale: ₦{Number(comm.sale_amount).toLocaleString()} @ {comm.commission_rate_applied}% = <strong className="text-emerald-400 font-mono text-sm">₦{Number(comm.commission_amount).toLocaleString()}</strong>
                          {comm.reversal_reason && <span className="text-red-400 ml-2">Reason: {comm.reversal_reason}</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${comm.status === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : comm.status === 'Reversed' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                          {comm.status}
                        </span>
                        {comm.status === 'Pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={async () => {
                                await db.updateCommissionStatus(comm.id, 'Paid');
                                setCommissions(await db.fetchTenantCommissions());
                                showSaveStatus("Commission marked as Paid!");
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-bold uppercase transition-colors cursor-pointer"
                            >
                              Pay
                            </button>
                            <button
                              onClick={async () => {
                                const reason = prompt("Enter reversal reason:") || "Order cancelled";
                                await db.updateCommissionStatus(comm.id, 'Reversed', reason, 'Master');
                                setCommissions(await db.fetchTenantCommissions());
                                showSaveStatus("Commission reversed.");
                              }}
                              className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 rounded text-[9px] font-bold uppercase border border-red-800 transition-colors cursor-pointer"
                            >
                              Reverse
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
