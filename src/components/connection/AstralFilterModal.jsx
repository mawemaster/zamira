import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function AstralFilterModal({ filters, onApply, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] border-yellow-500/30 text-white p-0 overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-yellow-500/30 p-6 text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">
            Filtro Astral
          </h2>
          <p className="text-gray-400 text-sm">
            Ajuste as lentes do Oráculo para encontrar as energias que você procura.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-6">
          {/* Distância */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-semibold">Distância</label>
              <span className="text-yellow-400 font-bold">{localFilters.maxDistance} km</span>
            </div>
            <Slider
              value={[localFilters.maxDistance]}
              onValueChange={(value) => setLocalFilters({ ...localFilters, maxDistance: value[0] })}
              max={200}
              min={10}
              step={10}
              className="[&_.slider-track]:bg-yellow-400 [&_.slider-range]:bg-yellow-500 [&_.slider-thumb]:bg-yellow-400"
            />
          </div>

          {/* Gênero */}
          <div>
            <label className="text-white font-semibold mb-2 block">Gênero</label>
            <Select
              value={localFilters.gender}
              onValueChange={(value) => setLocalFilters({ ...localFilters, gender: value })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="nao-binario">Não-binário</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orientação */}
          <div>
            <label className="text-white font-semibold mb-2 block">Orientação</label>
            <Select
              value={localFilters.orientation}
              onValueChange={(value) => setLocalFilters({ ...localFilters, orientation: value })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="heterossexual">Heterossexual</SelectItem>
                <SelectItem value="homossexual">Homossexual</SelectItem>
                <SelectItem value="bissexual">Bissexual</SelectItem>
                <SelectItem value="pansexual">Pansexual</SelectItem>
                <SelectItem value="assexual">Assexual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Elemento Dominante */}
          <div>
            <label className="text-white font-semibold mb-2 block">Elemento Dominante</label>
            <Select
              value={localFilters.element}
              onValueChange={(value) => setLocalFilters({ ...localFilters, element: value })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="fogo">🔥 Fogo</SelectItem>
                <SelectItem value="agua">💧 Água</SelectItem>
                <SelectItem value="ar">💨 Ar</SelectItem>
                <SelectItem value="terra">🌍 Terra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Identidade Espiritual */}
          <div>
            <label className="text-white font-semibold mb-2 block">Identidade Espiritual</label>
            <Select
              value={localFilters.spiritualIdentity}
              onValueChange={(value) => setLocalFilters({ ...localFilters, spiritualIdentity: value })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="wiccano">Wiccano</SelectItem>
                <SelectItem value="budista">Budista</SelectItem>
                <SelectItem value="espirita">Espírita</SelectItem>
                <SelectItem value="xamanico">Xamânico</SelectItem>
                <SelectItem value="mistico">Místico</SelectItem>
                <SelectItem value="livre">Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply Button */}
          <Button
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-6 text-lg rounded-xl shadow-lg"
          >
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}