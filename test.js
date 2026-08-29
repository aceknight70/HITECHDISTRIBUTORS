import fs from "fs";
const file = "src/App.tsx";
let content = fs.readFileSync(file, "utf8");

const target = `  const handleBack = () => {
    if (roomHistory.length > 0) {
      const prevRoom = roomHistory[roomHistory.length - 1];
      setRoomHistory(prev => prev.slice(0, -1));
      _setCurrentRoom(prevRoom);
    } else {
      setInStore(false);
    }
  };`;

const replacement = `  const handleBack = () => {
    // Priority order for closing overlays/modals before navigating back
    if (activeAllyModal) {
      setActiveAllyModal(null);
      return;
    }
    if (activeTenantSpace) {
      setActiveTenantSpace(null);
      return;
    }
    if (showAllyDirectory) {
      setShowAllyDirectory(false);
      return;
    }
    if (showTenantDirectory) {
      setShowTenantDirectory(false);
      return;
    }
    if (selectedProduct) {
      setSelectedProduct(null);
      return;
    }
    if (compareSelectMode) {
      setCompareSelectMode(null);
      return;
    }
    if (showComparison) {
      setShowComparison(false);
      return;
    }
    
    // Normal back navigation
    if (roomHistory.length > 0) {
      const prevRoom = roomHistory[roomHistory.length - 1];
      setRoomHistory(prev => prev.slice(0, -1));
      _setCurrentRoom(prevRoom);
    } else {
      setInStore(false);
    }
  };`;
content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Updated handleBack");
