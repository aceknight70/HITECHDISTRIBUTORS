import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const targetAlly = `<div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">`;
const replacementAlly = `<div className="w-full h-[150px] bg-slate-950 p-2 border border-slate-800 rounded mb-4 overflow-hidden">
                          <h6 className="text-[9px] uppercase text-slate-500 font-bold mb-1">Referral Performance</h6>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hubAllies} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                              <XAxis dataKey="ally_name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', fontSize: '10px', color: '#f8fafc' }}/>
                              <Bar dataKey="referral_count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">`;

content = content.replace(targetAlly, replacementAlly);

const targetTenant = `<div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">`;
const replacementTenant = `<div className="w-full h-[150px] bg-slate-950 p-2 border border-slate-800 rounded mb-4 overflow-hidden">
                          <h6 className="text-[9px] uppercase text-slate-500 font-bold mb-1">Traffic Insights (Entries)</h6>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hubTenants} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                              <XAxis dataKey="tenant_name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', fontSize: '10px', color: '#f8fafc' }}/>
                              <Bar dataKey="referral_entries" fill="#10b981" stackId="a" />
                              <Bar dataKey="discovery_entries" fill="#3b82f6" stackId="a" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">`;

content = content.replace(targetTenant, replacementTenant);

fs.writeFileSync(file, content);
console.log("Injected charts");
