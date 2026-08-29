import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const target = `    return (
      <>
      <style>{\`
        :root {`;

const replacement = `    return (
      <>
      
      {/* FULLSCREEN TENANT MINI-SPACE */}
      <AnimatePresence>
        {activeTenantSpace && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden text-slate-200"
          >
            {/* Tenant Header */}
            <div className="flex-shrink-0 bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <img src={activeTenantSpace.photos[0] || ""} alt={activeTenantSpace.tenant_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">{activeTenantSpace.tenant_name}</h2>
                  <span className="text-[10px] text-emerald-400 font-mono">{activeTenantSpace.category}</span>
                </div>
              </div>
              <button onClick={() => setActiveTenantSpace(null)} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center border border-slate-700 text-slate-300 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tenant Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-hide relative pb-24">
              {/* Bio & Intro */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-800 pb-2">About Me</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{activeTenantSpace.description}</p>
              </div>
              
              {/* Photo Gallery */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5"/> Photo Gallery</h3>
                <div className="grid grid-cols-2 gap-2">
                  {activeTenantSpace.photos.map((photo, i) => (
                    <div key={i} className="aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                      <img src={photo} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                  {activeTenantSpace.photos.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-slate-500 text-xs italic bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
                      No photos uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bottom Actions Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent flex gap-3">
              <button 
                onClick={() => window.open(\`https://wa.me/\${activeTenantSpace.contact_info?.whatsapp?.replace(/\\D/g,'')}\`, '_blank')}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <MessageSquare className="w-4 h-4"/> Chat on WhatsApp
              </button>
              {activeTenantSpace.invoicing_enabled && (
                <button 
                  onClick={() => {
                    setInvoiceStatus("draft");
                    setCart([]);
                    setCurrentRoom("invoice");
                    setActiveTenantSpace(null);
                    setInStore(true);
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700"
                >
                  <FileText className="w-4 h-4"/> Invoice
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ALLY MINI-VIEW MODAL */}
      <AnimatePresence>
        {activeAllyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveAllyModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-40 bg-slate-800 relative">
                <img src={activeAllyModal.logo_or_photo} alt={activeAllyModal.ally_name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <button onClick={() => setActiveAllyModal(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4 -mt-10 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider drop-shadow-md">{activeAllyModal.ally_name}</h2>
                  <span className="text-[10px] text-blue-400 font-mono px-2 py-0.5 bg-blue-900/30 rounded border border-blue-800/50">{activeAllyModal.business_type}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-300 leading-relaxed">{activeAllyModal.description}</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    onClick={() => window.open(\`https://wa.me/\${activeAllyModal.contact_info?.whatsapp?.replace(/\\D/g,'')}\`, '_blank')}
                    className="w-full py-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4"/> Contact via WhatsApp
                  </button>
                  {activeAllyModal.external_link && activeAllyModal.external_link.trim() !== "" && (
                    <button 
                      onClick={() => window.open(activeAllyModal.external_link, '_blank')}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4"/> Visit Website
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{\`
        :root {`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Updated active views");
