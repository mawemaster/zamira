import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Backpack, X, Sparkles, Shield, Wand2, Gem, 
  Zap, Heart, Star, Package, Info, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RARITY_COLORS = {
  common: { bg: "bg-gray-600", border: "border-gray-500", text: "text-gray-300", glow: "shadow-gray-500/50" },
  uncommon: { bg: "bg-green-600", border: "border-green-500", text: "text-green-300", glow: "shadow-green-500/50" },
  rare: { bg: "bg-blue-600", border: "border-blue-500", text: "text-blue-300", glow: "shadow-blue-500/50" },
  epic: { bg: "bg-purple-600", border: "border-purple-500", text: "text-purple-300", glow: "shadow-purple-500/50" },
  legendary: { bg: "bg-yellow-600", border: "border-yellow-500", text: "text-yellow-300", glow: "shadow-yellow-500/50" },
  mythical: { bg: "bg-pink-600", border: "border-pink-500", text: "text-pink-300", glow: "shadow-pink-500/50" }
};

const TYPE_ICONS = {
  consumable: Heart,
  equipment: Shield,
  quest: Star,
  material: Package,
  mystical: Wand2,
  potion: Zap,
  crystal: Gem,
  artifact: Sparkles
};

export default function InventorySystem({ user, isOpen, onClose }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory', user?.id],
    queryFn: () => base44.entities.InventoryItem.filter({ user_id: user.id }, "-created_date", 100),
    enabled: !!user && isOpen,
    initialData: [],
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => base44.entities.InventoryItem.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setSelectedItem(null);
    },
  });

  const useItemMutation = useMutation({
    mutationFn: async (item) => {
      if (item.quantity > 1) {
        await base44.entities.InventoryItem.update(item.id, {
          quantity: item.quantity - 1
        });
      } else {
        await base44.entities.InventoryItem.delete(item.id);
      }
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setSelectedItem(null);
    },
  });

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = [];
    }
    acc[item.item_type].push(item);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center">
                <Backpack className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Inventário Místico</h2>
                <p className="text-sm text-gray-400">{items.length} itens coletados</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Grid de Itens */}
          {isLoading ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Carregando inventário...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">Inventário Vazio</p>
              <p className="text-gray-500 text-sm">Explore Zamira para coletar itens místicos!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([type, typeItems]) => {
                const TypeIcon = TYPE_ICONS[type] || Package;
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <TypeIcon className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-300 capitalize">
                        {type === 'consumable' ? 'Consumíveis' :
                         type === 'equipment' ? 'Equipamentos' :
                         type === 'quest' ? 'Missão' :
                         type === 'material' ? 'Materiais' :
                         type === 'mystical' ? 'Místicos' :
                         type === 'potion' ? 'Poções' :
                         type === 'crystal' ? 'Cristais' :
                         type === 'artifact' ? 'Artefatos' : type}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {typeItems.length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {typeItems.map((item) => {
                        const rarity = RARITY_COLORS[item.item_rarity] || RARITY_COLORS.common;
                        return (
                          <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedItem(item)}
                            className={`relative aspect-square rounded-xl ${rarity.bg} ${rarity.border} border-2 p-2 flex flex-col items-center justify-center transition-all hover:shadow-lg ${rarity.glow}`}
                          >
                            <span className="text-3xl mb-1">{item.icon || '📦'}</span>
                            {item.quantity > 1 && (
                              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold bg-white text-black">
                                {item.quantity}
                              </Badge>
                            )}
                            <p className="text-[10px] text-white font-semibold text-center line-clamp-1">
                              {item.item_name}
                            </p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal de Detalhes do Item */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setSelectedItem(null)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/30"
                >
                  <div className="text-center mb-4">
                    <div className={`w-24 h-24 mx-auto rounded-2xl ${RARITY_COLORS[selectedItem.item_rarity].bg} flex items-center justify-center text-6xl mb-4 shadow-xl ${RARITY_COLORS[selectedItem.item_rarity].glow}`}>
                      {selectedItem.icon || '📦'}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{selectedItem.item_name}</h3>
                    <Badge className={`${RARITY_COLORS[selectedItem.item_rarity].bg} ${RARITY_COLORS[selectedItem.item_rarity].text} capitalize`}>
                      {selectedItem.item_rarity}
                    </Badge>
                  </div>

                  {selectedItem.description && (
                    <p className="text-gray-300 text-sm mb-4 text-center">
                      {selectedItem.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white capitalize">{selectedItem.item_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Quantidade:</span>
                      <span className="text-white">{selectedItem.quantity}x</span>
                    </div>
                    {selectedItem.power > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Poder:</span>
                        <span className="text-purple-400 font-bold">+{selectedItem.power}</span>
                      </div>
                    )}
                    {selectedItem.collected_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Coletado em:</span>
                        <span className="text-white">{selectedItem.collected_at}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {selectedItem.item_type === 'consumable' && (
                      <Button
                        onClick={() => useItemMutation.mutate(selectedItem)}
                        disabled={useItemMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Usar
                      </Button>
                    )}
                    <Button
                      onClick={() => deleteItemMutation.mutate(selectedItem.id)}
                      disabled={deleteItemMutation.isPending}
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Descartar
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}