import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const target = `          {/* Floating Action Stack */}
          {inStore && (
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50">
              <button 
                onClick={() => setCurrentRoom("info")}
                className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                title="AI Support"
              >
                <Bot className="w-5 h-5" />
              </button>
              {hubAllies.filter(a => a.status === 'active').length > 0 && (
                <button 
                  onClick={() => setShowAllyDirectory(true)}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Partners"
                >
                  <Handshake className="w-5 h-5" />
                </button>
              )}
              {hubTenants.filter(t => t.status === 'active').length > 0 && (
                <button 
                  onClick={() => setShowTenantDirectory(true)}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] border-2 border-white/20 transition-transform hover:scale-105"
                  title="Mini-Stores"
                >
                  <Store className="w-5 h-5" />
                </button>
              )}
            </div>
          )}`;

const replacement = `          {/* Floating Action Stack */}
          {inStore && (
            <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50 pointer-events-none">
              <motion.button 
                drag
                dragMomentum={false}
                onClick={() => setCurrentRoom("info")}
                className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex flex-col items-center justify-center text-white shadow-[0_4px_15px_rgba(220,38,38,0.4)] border-2 border-white/20 cursor-grab active:cursor-grabbing pointer-events-auto"
                title="AI Support"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bot className="w-4 h-4" />
                <span className="text-[8px] font-black mt-[1px]">AI</span>
              </motion.button>
              {hubAllies.filter(a => a.status === 'active').length > 0 && (
                <motion.button 
                  drag
                  dragMomentum={false}
                  onClick={() => setShowAllyDirectory(true)}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] border-2 border-white/20 cursor-grab active:cursor-grabbing pointer-events-auto"
                  title="Partners"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Handshake className="w-5 h-5" />
                </motion.button>
              )}
              {hubTenants.filter(t => t.status === 'active').length > 0 && (
                <motion.button 
                  drag
                  dragMomentum={false}
                  onClick={() => setShowTenantDirectory(true)}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] border-2 border-white/20 cursor-grab active:cursor-grabbing pointer-events-auto"
                  title="Mini-Stores"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Store className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          )}`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Updated!");
