import React, { useState } from "react";
import { Users, Plus, Key, RefreshCw, CheckCircle, AlertCircle, UserCheck, UserX } from "lucide-react";
import * as db from "../lib/supabase";
import AdminReAuthDialog from "./AdminReAuthDialog";

interface ManagerPeopleSectionProps {
  session: db.HiTechSession;
  onBack: () => void;
}

type PendingAction =
  | { type: "list" }
  | { type: "add"; name: string; code: string; role: string; pin: string }
  | { type: "reset_pin"; targetCode: string; newPin: string }
  | { type: "set_active"; targetCode: string; active: boolean };

export default function ManagerPeopleSection({ session, onBack }: ManagerPeopleSectionProps) {
  const isMaster = session.role.toLowerCase() === "master";

  const [people, setPeople] = useState<db.HiTechPersonRecord[]>([]);
  const [hasLoadedList, setHasLoadedList] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ ok: boolean; message: string } | null>(null);

  // Add Person Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCode, setAddCode] = useState("");
  const [addRole, setAddRole] = useState("staff");
  const [addPin, setAddPin] = useState("");
  const [addPinConfirm, setAddPinConfirm] = useState("");

  // Reset PIN modal state
  const [resetTargetCode, setResetTargetCode] = useState<string | null>(null);
  const [resetNewPin, setResetNewPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");

  // Re-authentication prompt state
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const visiblePeople = isMaster
    ? people
    : people.filter((p) => (p.role || "").toLowerCase() === "staff");

  const getReAuthTitle = (action: PendingAction | null): string => {
    if (!action) return "Confirm Action";
    switch (action.type) {
      case "list":
        return "Load People List";
      case "add":
        return `Add Person (${action.name})`;
      case "reset_pin":
        return `Reset PIN for ${action.targetCode}`;
      case "set_active":
        return `${action.active ? "Reactivate" : "Deactivate"} ${action.targetCode}`;
    }
  };

  const handleConfirmReAuth = async (adminCode: string, adminPin: string) => {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) return;

    setStatusNotice(null);

    if (action.type === "list") {
      const res = await db.hitechAdminListPeople(adminCode, adminPin);
      if (res.ok) {
        setPeople(Array.isArray(res.people) ? res.people : []);
        setHasLoadedList(true);
      }
      setStatusNotice({
        ok: Boolean(res.ok),
        message: res.message || (res.ok ? "People list loaded." : "Failed to load people list."),
      });
    } else if (action.type === "add") {
      const res = await db.hitechAdminAddPerson(
        adminCode,
        adminPin,
        action.name,
        action.code,
        action.role,
        action.pin
      );
      if (res.ok) {
        setShowAddForm(false);
        setAddName("");
        setAddCode("");
        setAddRole("staff");
        if (hasLoadedList) {
          setPeople((prev) => [
            ...prev.filter((p) => p.code.toUpperCase() !== action.code.toUpperCase()),
            {
              id: `temp-${Date.now()}`,
              code: action.code,
              name: action.name,
              role: action.role,
              active: true,
              last_login_at: null,
            },
          ]);
        }
      }
      setStatusNotice({
        ok: Boolean(res.ok),
        message: res.message || (res.ok ? "Person added." : "Failed to add person."),
      });
    } else if (action.type === "reset_pin") {
      const res = await db.hitechAdminResetPin(
        adminCode,
        adminPin,
        action.targetCode,
        action.newPin
      );
      if (res.ok) {
        setResetTargetCode(null);
      }
      setStatusNotice({
        ok: Boolean(res.ok),
        message: res.message || (res.ok ? "PIN reset successfully." : "Failed to reset PIN."),
      });
    } else if (action.type === "set_active") {
      const res = await db.hitechAdminSetActive(
        adminCode,
        adminPin,
        action.targetCode,
        action.active
      );
      if (res.ok) {
        setPeople((prev) =>
          prev.map((p) =>
            p.code.toUpperCase() === action.targetCode.toUpperCase()
              ? { ...p, active: action.active }
              : p
          )
        );
      }
      setStatusNotice({
        ok: Boolean(res.ok),
        message: res.message || (res.ok ? "Account status updated." : "Failed to update status."),
      });
    }
  };

  const handleStartAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    if (!addName.trim() || !addCode.trim() || !addPin.trim() || !addPinConfirm.trim()) {
      setStatusNotice({ ok: false, message: "Please fill in name, ID, role, and enter PIN twice." });
      return;
    }
    if (addPin.trim() !== addPinConfirm.trim()) {
      setStatusNotice({ ok: false, message: "PIN entries do not match." });
      return;
    }

    const roleToCreate = isMaster ? addRole : "staff";
    const pinToSend = addPin.trim();

    // Clear PIN fields from state before opening confirmation
    setAddPin("");
    setAddPinConfirm("");

    setPendingAction({
      type: "add",
      name: addName.trim(),
      code: addCode.trim().toUpperCase(),
      role: roleToCreate,
      pin: pinToSend,
    });
  };

  const handleStartResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetCode) return;
    setStatusNotice(null);

    if (!resetNewPin.trim() || !resetConfirmPin.trim()) {
      setStatusNotice({ ok: false, message: "Please enter the new PIN twice." });
      return;
    }
    if (resetNewPin.trim() !== resetConfirmPin.trim()) {
      setStatusNotice({ ok: false, message: "New PIN entries do not match." });
      return;
    }

    const pinToSend = resetNewPin.trim();
    const codeToTarget = resetTargetCode;

    // Clear PIN fields from state immediately
    setResetNewPin("");
    setResetConfirmPin("");

    setPendingAction({
      type: "reset_pin",
      targetCode: codeToTarget,
      newPin: pinToSend,
    });
  };

  return (
    <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-4 text-slate-100">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div>
          <h4 className="font-bold text-[13px] text-white uppercase flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>People &amp; Access Control</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {isMaster ? "Master view: Staff, Managers & Masters" : "Manager view: Staff accounts only"}
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[10px] font-bold text-[var(--yl)] uppercase hover:underline cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPendingAction({ type: "list" })}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{hasLoadedList ? "Refresh People List" : "Load People List"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setAddPin("");
            setAddPinConfirm("");
          }}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? "Close Add Form" : "Add Person"}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {statusNotice && (
        <div
          className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 border ${
            statusNotice.ok
              ? "bg-emerald-950/90 border-emerald-700 text-emerald-200"
              : "bg-red-950/90 border-red-700 text-red-200"
          }`}
        >
          {statusNotice.ok ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* Add Person Form */}
      {showAddForm && (
        <form
          onSubmit={handleStartAddPerson}
          className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex flex-col gap-3"
        >
          <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Add New {isMaster ? "Person" : "Staff Member"}
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Ruth"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                Staff / User ID *
              </label>
              <input
                type="text"
                value={addCode}
                onChange={(e) => setAddCode(e.target.value.toUpperCase())}
                placeholder="e.g. HTD-031"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono uppercase text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                Role *
              </label>
              <select
                value={isMaster ? addRole : "staff"}
                onChange={(e) => setAddRole(e.target.value)}
                disabled={!isMaster}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-80"
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              >
                <option value="staff">Staff</option>
                {isMaster && <option value="manager">Manager</option>}
                {isMaster && <option value="master">Master</option>}
              </select>
            </div>

            <div className="hidden sm:block" />

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                Initial PIN *
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={addPin}
                onChange={(e) => setAddPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                Confirm Initial PIN *
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={addPinConfirm}
                onChange={(e) => setAddPinConfirm(e.target.value)}
                placeholder="Re-enter PIN"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Add Person
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setAddPin("");
                setAddPinConfirm("");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reset PIN Inline Panel */}
      {resetTargetCode && (
        <form
          onSubmit={handleStartResetPin}
          className="p-4 bg-slate-900 border border-amber-700/70 rounded-xl flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Reset PIN for {resetTargetCode}</span>
            </h5>
            <button
              type="button"
              onClick={() => {
                setResetTargetCode(null);
                setResetNewPin("");
                setResetConfirmPin("");
              }}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                New PIN *
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={resetNewPin}
                onChange={(e) => setResetNewPin(e.target.value)}
                placeholder="Enter new PIN"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">
                Confirm New PIN *
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={resetConfirmPin}
                onChange={(e) => setResetConfirmPin(e.target.value)}
                placeholder="Re-enter new PIN"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Reset PIN
            </button>
            <button
              type="button"
              onClick={() => {
                setResetTargetCode(null);
                setResetNewPin("");
                setResetConfirmPin("");
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* People List */}
      {!hasLoadedList ? (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center">
          <p className="text-xs text-slate-300">
            Click <strong>Load People List</strong> and confirm your ID &amp; PIN to view accounts.
          </p>
        </div>
      ) : visiblePeople.length === 0 ? (
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center">
          <p className="text-xs text-slate-400">No people records found for your role view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {visiblePeople.map((person) => (
            <div
              key={person.id || person.code}
              className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-white uppercase">{person.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900 px-1.5 py-0.5 rounded">
                    {person.code}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-blue-300 bg-blue-950/60 border border-blue-900 px-1.5 py-0.5 rounded">
                    {person.role}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      person.active
                        ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
                        : "bg-red-950/50 text-red-400 border-red-800"
                    }`}
                  >
                    {person.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Last login:{" "}
                  {person.last_login_at
                    ? new Date(person.last_login_at).toLocaleString()
                    : "Never"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setResetTargetCode(person.code);
                    setResetNewPin("");
                    setResetConfirmPin("");
                  }}
                  className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/80 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>Reset PIN</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPendingAction({
                      type: "set_active",
                      targetCode: person.code,
                      active: !person.active,
                    })
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 border cursor-pointer ${
                    person.active
                      ? "bg-red-950/70 hover:bg-red-900 text-red-300 border-red-800"
                      : "bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-800"
                  }`}
                >
                  {person.active ? (
                    <>
                      <UserX className="w-3 h-3" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3 h-3" />
                      <span>Reactivate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminReAuthDialog
        isOpen={pendingAction !== null}
        title={getReAuthTitle(pendingAction)}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmReAuth}
      />
    </div>
  );
}
