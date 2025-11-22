import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Crown, Filter, Heart, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OraculoSettingsModal({ user, onClose, onSave }) {
  const [settings, setSettings] = useState({
    visible_in_oraculo: user?.visible_in_oraculo !== false,
    featured_profile: user?.featured_profile || false,
    show_age: user?.show_age !== false,
    show_location: user?.show_location !== false,
    max_distance: user?.max_distance || 50,
    gender_preference: user?.gender_preference || "todos",
    age_min: user?.age_min || 18,
    age_max: user?.age_max || 99,
    looking_for: user?.looking_for || [],
  });

  const handleSave = () => {
    onSave(settings);
  };

  const toggleLookingFor = (value) => {
    setSettings({
      ...settings,
      looking_for: settings.looking_for.includes(value)
        ? settings.looking_for.filter(v => v !== value)
        : [...settings.looking_for, value]
    });
  };

  const relationshipStatus = user?.relationship_status;
  const isInRelationship = ['namorando', 'casado', 'uniao-estavel'].includes(relationshipStatus);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Configurações do Oráculo
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Aviso se em Relacionamento */}
          {isInRelationship && (
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mb-4">
              <p className="text-yellow-200 text-xs">
                ⚠️ Seu perfil está oculto no Oráculo por estar em um relacionamento.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {/* Visibilidade no Oráculo */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {settings.visible_in_oraculo ? (
                    <Eye className="w-5 h-5 text-green-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <Label htmlFor="visible" className="text-white font-semibold">
                    Aparecer no Oráculo
                  </Label>
                </div>
                <Switch
                  id="visible"
                  checked={settings.visible_in_oraculo}
                  onCheckedChange={(checked) => setSettings({...settings, visible_in_oraculo: checked})}
                  disabled={isInRelationship}
                />
              </div>
              <p className="text-xs text-gray-400">
                Outros usuários poderão ver seu perfil
              </p>
            </div>

            {/* Perfil em Destaque */}
            <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg p-4 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <Label htmlFor="featured" className="text-white font-semibold">
                    Perfil em Destaque ✨
                  </Label>
                </div>
                <Switch
                  id="featured"
                  checked={settings.featured_profile}
                  onCheckedChange={(checked) => setSettings({...settings, featured_profile: checked})}
                  disabled={!settings.visible_in_oraculo || isInRelationship}
                />
              </div>
              <p className="text-xs text-yellow-200">
                Seu perfil aparecerá primeiro nas buscas
              </p>
            </div>

            {/* Privacidade */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                Privacidade
              </h3>
              
              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
                <Label htmlFor="show_age" className="text-sm text-gray-300">
                  Mostrar Idade
                </Label>
                <Switch
                  id="show_age"
                  checked={settings.show_age}
                  onCheckedChange={(checked) => setSettings({...settings, show_age: checked})}
                />
              </div>

              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
                <Label htmlFor="show_location" className="text-sm text-gray-300">
                  Mostrar Localização
                </Label>
                <Switch
                  id="show_location"
                  checked={settings.show_location}
                  onCheckedChange={(checked) => setSettings({...settings, show_location: checked})}
                />
              </div>
            </div>

            {/* Filtros de Busca */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                Preferências de Busca
              </h3>

              {/* Distância Máxima */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
                <Label className="text-sm text-gray-300 mb-2 block">
                  Distância Máxima: {settings.max_distance}km
                </Label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={settings.max_distance}
                  onChange={(e) => setSettings({...settings, max_distance: parseInt(e.target.value)})}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Preferência de Gênero */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
                <Label className="text-sm text-gray-300 mb-2 block">
                  Procurando por
                </Label>
                <Select
                  value={settings.gender_preference}
                  onValueChange={(value) => setSettings({...settings, gender_preference: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500/30">
                    <SelectItem value="todos" className="text-white">Todos</SelectItem>
                    <SelectItem value="masculino" className="text-white">Masculino</SelectItem>
                    <SelectItem value="feminino" className="text-white">Feminino</SelectItem>
                    <SelectItem value="nao-binario" className="text-white">Não-binário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Faixa Etária */}
              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/20">
                <Label className="text-sm text-gray-300 mb-2 block">
                  Faixa Etária: {settings.age_min} - {settings.age_max} anos
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Mínimo</Label>
                    <input
                      type="number"
                      min="18"
                      max="99"
                      value={settings.age_min}
                      onChange={(e) => setSettings({...settings, age_min: parseInt(e.target.value)})}
                      className="w-full bg-slate-700 border border-purple-500/30 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 mb-1 block">Máximo</Label>
                    <input
                      type="number"
                      min="18"
                      max="99"
                      value={settings.age_max}
                      onChange={(e) => setSettings({...settings, age_max: parseInt(e.target.value)})}
                      className="w-full bg-slate-700 border border-purple-500/30 rounded px-2 py-1 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* O que você busca */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                O que você busca?
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "amizade", label: "Amizade" },
                  { value: "namoro", label: "Namoro" },
                  { value: "relacionamento-serio", label: "Relacionamento Sério" },
                  { value: "conexoes-espirituais", label: "Conexões Espirituais" },
                  { value: "networking", label: "Networking" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleLookingFor(option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      settings.looking_for.includes(option.value)
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="mt-6 pt-4 border-t border-purple-500/20">
            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
            >
              Salvar Configurações
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}