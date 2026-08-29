import React, { useState, useEffect } from "react";
import { Users, FileText, CheckCircle, Clock, Plus, X } from "lucide-react";
import * as db from "../lib/supabase";

export default function ManagerManageStaff({ onBack }: { onBack: () => void }) {
  const [staff, setStaff] = useState<db.MasterStaff[]>([]);
  const [logs, setLogs] = useState<db.StaffWeeklyLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add new staff form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const stf = await db.fetchMasterStaff();
      const lgs = await db.fetchWeeklyLogs();
      
      // Fallback staff (seeded as requested)
      if (stf && stf.length > 0) {
        setStaff(stf);
      } else {
        const defaultStaff: db.MasterStaff[] = [
          { id: "s1", staff_name: "LUCY", role: "Sales Manager", interest_level: "Engaged", notes: "" },
          { id: "s2", staff_name: "Sophie", role: "Sales Rep", interest_level: "Minimal", notes: "" },
          { id: "s3", staff_name: "Joan", role: "Sales Rep", interest_level: "Minimal", notes: "" },
          { id: "s4", staff_name: "Rosemary", role: "Sales Rep", interest_level: "Minimal", notes: "" },
          { id: "s5", staff_name: "Ruth", role: "Inventory", interest_level: "Engaged", notes: "" }
        ];
        setStaff(defaultStaff);
      }
      
      // Seed Ruth's log if empty
      if (lgs && lgs.length > 0) {
        setLogs(lgs);
      } else {
        const dummyLog: db.StaffWeeklyLog = {
          id: "log1",
          staff_id: "s5", // Ruth
          date_submitted: "2026-08-29",
          base_catalog_updates: 10,
          base_ad_posts: 8,
          edu_link: "https://tiktok.com/@hitech/123",
          edu_views: "1.2k",
          ent_link: "https://ig.com/p/456",
          ent_views: "800",
          conv_note: "Involved in customer 1056 Buying online",
          approval_status: "Pending"
        };
        setLogs([dummyLog]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (logId: string) => {
    if (logId.startsWith("log")) {
      // It's a seeded dummy log, update local state only
      setLogs(logs.map(l => l.id === logId ? { ...l, approval_status: "Approved", approved_by: "Manager", approved_at: new Date().toISOString() } : l));
    } else {
      const res = await db.approveWeeklyLog(logId, "Manager");
      if (res && res.length > 0) {
        setLogs(logs.map(l => l.id === logId ? res[0] : l));
      }
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole) return;
    
    const newStaff: db.MasterStaff = {
      staff_name: newName,
      role: newRole,
      interest_level: "Minimal",
      notes: ""
    };
    
    const res = await db.upsertMasterStaff(newStaff);
    if (res && res.length > 0) {
      setStaff([...staff, res[0]]);
    } else {
      // Local fallback
      setStaff([...staff, { ...newStaff, id: Date.now().toString() }]);
    }
    setNewName("");
    setNewRole("");
    setShowAddForm(false);
  };

  return (
    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="font-bold text-[13px] text-white uppercase flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" /> Manage Staff
        </h4>
        <button onClick={onBack} className="text-[10px] font-bold text-[var(--yl)] uppercase hover:underline">← Back</button>
      </div>

      {/* Roster Section */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">Staff Roster</h5>
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs rounded text-white flex items-center gap-1 uppercase font-bold"
          >
            {showAddForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />} Add Staff
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddStaff} className="p-3 bg-slate-900 border border-slate-700 border-dashed rounded flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Staff Name" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="p-2 text-xs bg-slate-950 border border-slate-800 rounded outline-none text-white focus:border-emerald-500"
            />
            <input 
              type="text" 
              placeholder="Role (e.g. Sales Rep)" 
              value={newRole} 
              onChange={e => setNewRole(e.target.value)} 
              className="p-2 text-xs bg-slate-950 border border-slate-800 rounded outline-none text-white focus:border-emerald-500"
            />
            <button type="submit" className="py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded text-xs font-bold uppercase tracking-wider">Save Staff</button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {staff.map(member => {
            // Find their latest log
            const theirLogs = logs.filter(l => l.staff_id === member.id);
            const latestLog = theirLogs[0]; // assuming already sorted descending by date
            
            return (
              <div key={member.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h6 className="text-xs font-bold text-white uppercase">{member.staff_name}</h6>
                    <p className="text-[10px] text-emerald-400 font-mono uppercase">{member.role}</p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                    member.interest_level === "Engaged" ? "bg-emerald-950/40 text-emerald-400 border-emerald-800" :
                    member.interest_level === "Minimal" ? "bg-blue-950/40 text-blue-400 border-blue-800" :
                    "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {member.interest_level}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Latest Log:</span>
                  {latestLog ? (
                    <span className={`text-[9px] font-bold uppercase flex items-center gap-1 ${latestLog.approval_status === "Approved" ? "text-emerald-500" : "text-amber-400"}`}>
                      {latestLog.approval_status === "Approved" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {latestLog.approval_status}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600 font-bold uppercase">No Logs</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Logs Section */}
      <div className="flex flex-col gap-3 mt-4 border-t border-slate-800 pt-4">
        <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">Weekly Log Review</h5>
        
        {loading && <p className="text-xs text-slate-500">Loading logs...</p>}
        {!loading && logs.length === 0 && <p className="text-xs text-slate-500 italic">No logs submitted yet.</p>}

        <div className="flex flex-col gap-3">
          {logs.map(log => {
            const member = staff.find(s => s.id === log.staff_id);
            const name = member ? member.staff_name : "Unknown Staff";
            const isApproved = log.approval_status === "Approved";

            return (
              <div key={log.id} className={`p-4 rounded-xl border flex flex-col gap-3 ${isApproved ? "bg-slate-900/40 border-emerald-900/30" : "bg-slate-900 border-slate-700"}`}>
                <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                  <div>
                    <h6 className="text-xs font-bold text-white uppercase">{name}</h6>
                    <p className="text-[10px] text-slate-400 font-mono">Submitted: {log.date_submitted}</p>
                  </div>
                  
                  {isApproved ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 px-2 py-1 rounded text-[9px] font-bold uppercase">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                      <p className="text-[8px] text-slate-500 mt-1 uppercase tracking-widest">By {log.approved_by}</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleApprove(log.id!)}
                      className="bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-400 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
                    >
                      Mark Approved
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="flex flex-col">
                    <span className="text-blue-400 font-bold mb-0.5">1. Base Task</span>
                    <span className="text-slate-300">{log.base_catalog_updates} catalog updates completed</span>
                    <span className="text-slate-300">{log.base_ad_posts} ad posts created and sent</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-emerald-400 font-bold mb-0.5">2. Educational Engine</span>
                    <a href={log.edu_link} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline truncate max-w-full">{log.edu_link || "No link"}</a>
                    <span className="text-slate-400">Views/Engagements: {log.edu_views || "N/A"}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-purple-400 font-bold mb-0.5">3. Entertainment Engine</span>
                    <a href={log.ent_link} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline truncate max-w-full">{log.ent_link || "No link"}</a>
                    <span className="text-slate-400">Views/Engagements: {log.ent_views || "N/A"}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-amber-400 font-bold mb-0.5">4. Customer Conversion Engine</span>
                    <span className="text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">{log.conv_note || "N/A"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
