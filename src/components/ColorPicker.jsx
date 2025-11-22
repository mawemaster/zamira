import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mysticColors = [
  { name: "Vermelho Rubi", hex: "#DC2626" },
  { name: "Rosa Quartzo", hex: "#F472B6" },
  { name: "Laranja Âmbar", hex: "#F97316" },
  { name: "Dourado Sábio", hex: "#F59E0B" },
  { name: "Amarelo Topázio", hex: "#EAB308" },
  { name: "Verde Esmeralda", hex: "#10B981" },
  { name: "Verde Jade", hex: "#059669" },
  { name: "Turquesa Místico", hex: "#14B8A6" },
  { name: "Azul Safira", hex: "#3B82F6" },
  { name: "Azul Celeste", hex: "#0EA5E9" },
  { name: "Índigo Profundo", hex: "#6366F1" },
  { name: "Púrpura Místico", hex: "#9333EA" },
  { name: "Violeta Ametista", hex: "#A855F7" },
  { name: "Magenta Cósmico", hex: "#D946EF" },
  { name: "Prata Lunar", hex: "#94A3B8" },
  { name: "Bronze Antigo", hex: "#92400E" },
  { name: "Cobre Alquímico", hex: "#B45309" },
  { name: "Branco Diamante", hex: "#F8FAFC" },
  { name: "Cinza Névoa", hex: "#64748B" },
  { name: "Preto Obsidiana", hex: "#0F172A" }
];

export default function ColorPicker({ currentColor, onColorSelect, onClose }) {
  const [selectedColor, setSelectedColor] = useState(currentColor || "#9333EA");

  const handleConfirm = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-purple-300 mb-1">
                Paleta de Intenções
              </h3>
              <p className="text-sm text-gray-400">
                Escolha a cor que representa sua aura
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Preview */}
          <div className="mb-6 p-6 rounded-lg border-2 transition-all" style={{ 
            backgroundColor: `${selectedColor}20`,
            borderColor: selectedColor 
          }}>
            <div className="flex items-center justify-center gap-4">
              <div 
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <p className="text-sm text-gray-400 mb-1">Cor Selecionada</p>
                <p className="text-2xl font-bold" style={{ color: selectedColor }}>
                  {selectedColor}
                </p>
              </div>
            </div>
          </div>

          {/* Paleta */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {mysticColors.map((color) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color.hex)}
                className={`group relative aspect-square rounded-lg transition-all hover:scale-110 ${
                  selectedColor === color.hex ? 'ring-4 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor === color.hex && (
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-white" />
                )}
              </button>
            ))}
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-purple-900/30 hover:bg-purple-900/20"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Confirmar
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}