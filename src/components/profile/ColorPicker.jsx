import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const COLORS = [
  "#FF6B6B", "#FFA500", "#FFD700", "#98D8C8", "#87CEEB", "#4169E1",
  "#9370DB", "#BA55D3", "#FF1493", "#FF69B4", "#E91E63", "#F06292",
  "#9C27B0", "#7B1FA2", "#673AB7", "#512DA8", "#3F51B5", "#1976D2",
  "#0288D1", "#0097A7", "#00796B", "#388E3C", "#689F38", "#AFB42B",
  "#F57C00", "#E64A19", "#5D4037", "#616161", "#455A64", "#000000",
  "#FFFFFF", "#B0B0B0", "#808080", "#404040", "#FFF8DC", "#F0E68C"
];

export default function ColorPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-6 md:grid-cols-9 gap-3 p-4 bg-slate-800/50 rounded-lg border border-purple-900/30 max-h-80 overflow-y-auto">
      {COLORS.map((color) => (
        <motion.button
          key={color}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(color)}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition ${
            selected === color ? "border-white shadow-lg" : "border-transparent"
          }`}
          style={{ backgroundColor: color }}
        >
          {selected === color && (
            <Check className="w-5 h-5 text-white drop-shadow-lg" style={{
              filter: color === "#FFFFFF" || color === "#FFF8DC" ? "invert(1)" : "none"
            }} />
          )}
        </motion.button>
      ))}
    </div>
  );
}