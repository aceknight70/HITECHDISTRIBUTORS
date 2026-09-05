import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update activeManagerTab type
content = content.replace(
  'const [activeManagerTab, setActiveManagerTab] = useState<"menu" | "ally" | "tenant" | "manage-staff" | "sheets">("menu");',
  'const [activeManagerTab, setActiveManagerTab] = useState<"menu" | "ally" | "tenant" | "manage-staff" | "sheets" | "store-settings">("menu");'
);

// Add Store Settings button in menu
const menuButton = `
                        <button onClick={() => setActiveManagerTab("store-settings")} className="p-4 bg-[var(--dk2)] border border-[var(--border)] rounded-xl flex flex-col gap-2 items-center text-center hover:bg-slate-800 transition-colors">
                          <Settings className="w-6 h-6 text-emerald-400" />
                          <div>
                            <h4 className="font-bold text-[11px] text-white uppercase">Store Settings</h4>
                            <p className="text-[9px] text-[var(--mu)] mt-0.5">Manage Bank Details</p>
                          </div>
                        </button>
`;
content = content.replace(
  '                        {/* Directory moved to Manage Staff */}',
  menuButton
);

// Add Store Settings view
const storeSettingsView = `
                    {activeManagerTab === "store-settings" && (
                      <div className="p-4 bg-[var(--dk2)] rounded-xl border border-[var(--border)] flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                          <h4 className="font-bold text-[13px] text-white uppercase">Store Settings</h4>
                          <button onClick={() => setActiveManagerTab("menu")} className="text-[10px] font-bold text-[var(--yl)] uppercase hover:underline">← Back</button>
                        </div>
                        <div className="flex flex-col gap-3">
                          <h5 className="font-bold text-xs text-[var(--yl)] uppercase">Bank Details</h5>
                          <p className="text-[10px] text-[var(--mu)] leading-relaxed">Update the store's bank details for receipts and payments.</p>
                          <input
                            type="text"
                            value={bankInfo}
                            onChange={(e) => { setBankInfo(e.target.value); localStorage.setItem("ht_bank_info", e.target.value); }}
                            className="bg-slate-950 border border-slate-800 text-xs text-[var(--cr)] rounded-lg p-2 outline-none font-mono"
                          />
                        </div>
                      </div>
                    )}
`;

content = content.replace(
  '{activeManagerTab === "manage-staff" && (<ManagerManageStaff onBack={() => setActiveManagerTab("menu")} />)}',
  '{activeManagerTab === "manage-staff" && (<ManagerManageStaff onBack={() => setActiveManagerTab("menu")} />)}\n' + storeSettingsView
);

// Remove bank info from Staff Corner
// Search for: {/* Bank account details editor */}
const bankInfoEditorStart = content.indexOf('{/* Bank account details editor */}');
if (bankInfoEditorStart !== -1) {
  const bankInfoEditorEnd = content.indexOf('{/* Starting Page Photo Customizer */}');
  if (bankInfoEditorEnd !== -1) {
    content = content.slice(0, bankInfoEditorStart) + content.slice(bankInfoEditorEnd);
  }
}

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed bank details in App.tsx');
