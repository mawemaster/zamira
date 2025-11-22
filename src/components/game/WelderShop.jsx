
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShoppingBag, Coins, Sparkles, Info, Check, 
  Zap, Shield, TrendingUp, Clock, Star, Wand2, Heart, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CATEGORY_ICONS = {
  potion: "🧪",
  crystal: "💎",
  amulet: "🔮",
  scroll: "📜",
  essence: "✨",
  artifact: "⚡"
};

const RARITY_COLORS = {
  common: { bg: "from-gray-700 to-gray-800", border: "border-gray-500", text: "text-gray-300", glow: "shadow-gray-500/50" },
  uncommon: { bg: "from-green-700 to-green-800", border: "border-green-500", text: "text-green-300", glow: "shadow-green-500/50" },
  rare: { bg: "from-blue-700 to-blue-800", border: "border-blue-500", text: "text-blue-300", glow: "shadow-blue-500/50" },
  epic: { bg: "from-purple-700 to-purple-800", border: "border-purple-500", text: "text-purple-300", glow: "shadow-purple-500/50" },
  legendary: { bg: "from-yellow-600 to-yellow-700", border: "border-yellow-500", text: "text-yellow-300", glow: "shadow-yellow-500/50" },
  mythical: { bg: "from-pink-600 to-pink-700", border: "border-pink-500", text: "text-pink-300", glow: "shadow-pink-500/50" }
};

export default function WelderShop({ user, onClose, preloadedProducts }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['mysticalProducts'],
    queryFn: async () => {
      // Se já temos produtos pré-carregados, usa eles
      if (preloadedProducts) {
        console.log("✅ Usando produtos pré-carregados:", preloadedProducts.length);
        return preloadedProducts;
      }
      
      const allProducts = await base44.entities.MysticalProduct.filter({ is_active: true });
      console.log("Produtos carregados:", allProducts);
      return allProducts;
    },
    initialData: preloadedProducts || [],
    staleTime: 60000, // Cache por 1 minuto
  });

  const purchaseMutation = useMutation({
    mutationFn: async (product) => {
      if (user.ouros < product.price_ouros) {
        throw new Error("Ouros insuficientes!");
      }

      await base44.auth.updateMe({
        ouros: user.ouros - product.price_ouros
      });

      await base44.entities.InventoryItem.create({
        user_id: user.id,
        item_name: product.name,
        item_type: "mystical",
        item_rarity: product.rarity,
        quantity: 1,
        description: product.description,
        icon: product.icon,
        image_url: product.image_url,
        power: product.effect_value,
        collected_at: "Loja de Zamira"
      });

      if (product.effect_type === 'remove_spell' || 
          product.effect_type === 'inventory_expansion' ||
          product.effect_type === 'teleport_token') {
        await applyInstantEffect(product);
      } else {
        const expiresAt = product.effect_duration_hours > 0 
          ? new Date(Date.now() + product.effect_duration_hours * 3600000).toISOString()
          : null;

        await base44.entities.UserEffect.create({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          effect_type: product.effect_type,
          effect_value: product.effect_value,
          activated_at: new Date().toISOString(),
          expires_at: expiresAt,
          is_active: true
        });
      }

      return product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['userEffects'] });
      toast.success(`${product.name} adquirido com sucesso! ✨`);
      setSelectedProduct(null);
      if (window.playSuccessSound) window.playSuccessSound();
    },
    onError: (error) => {
      toast.error(error.message);
      if (window.playErrorSound) window.playErrorSound();
    }
  });

  const applyInstantEffect = async (product) => {
    if (product.effect_type === 'inventory_expansion') {
      await base44.entities.Notification.create({
        user_id: user.id,
        type: "announcement",
        title: "Inventário Expandido! 🎒",
        message: `Seu inventário foi expandido em +${product.effect_value} espaços!`
      });
    }
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const getEffectDescription = (product) => {
    const effects = {
      xp_boost: `🚀 Aumenta ganho de XP em ${product.effect_value}% por ${product.effect_duration_hours}h`,
      remove_spell: "🔮 Remove todos os feitiços de suas publicações instantaneamente",
      tinder_boost: `💕 Aumenta visibilidade no Tinder Místico em ${product.effect_value}% por ${product.effect_duration_hours}h`,
      duel_boost: `⚔️ Aumenta chances de vitória em duelos em ${product.effect_value}% por ${product.effect_duration_hours}h`,
      protection: `🛡️ Protege contra feitiços negativos por ${product.effect_duration_hours}h`,
      quest_accelerator: `⏰ Acelera progresso de missões em ${product.effect_value}% por ${product.effect_duration_hours}h`,
      gold_multiplier: `💰 Multiplica ganho de ouros por ${product.effect_value}x durante ${product.effect_duration_hours}h`,
      voice_amplifier: `🎤 Aumenta alcance de mensagens de voz por ${product.effect_duration_hours}h`,
      post_highlight: `✨ Destaca suas publicações no topo por ${product.effect_duration_hours}h`,
      connection_magnet: `🧲 Atrai ${product.effect_value} conexões compatíveis automaticamente`,
      lunar_power: `🌙 Potencializa rituais lunares em ${product.effect_value}% por ${product.effect_duration_hours}h`,
      arena_advantage: `🏆 Bônus permanente de ${product.effect_value}% em todas as batalhas`,
      daily_blessing: `☀️ Recebe bênção diária extra por ${product.effect_duration_hours}h`,
      inventory_expansion: `🎒 Expande seu inventário permanentemente em +${product.effect_value} espaços`,
      teleport_token: "🌀 Permite teletransportar para qualquer local no universo", // Corrected original description
      mystical_vision: `👁️ Revela todos os segredos do mapa por ${product.effect_duration_hours}h`,
      energy_recovery: "💚 Recupera energia vital instantaneamente",
      reputation_boost: `⭐ Aumenta reputação em ${product.effect_value}% por ${product.effect_duration_hours}h`
    };
    return effects[product.effect_type] || "✨ Efeito mágico especial";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-full overflow-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 border-4 border-yellow-700/50"
        >
          {/* Content Container */}
          <div className="h-full overflow-y-auto p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-600 to-amber-700 flex items-center justify-center border-4 border-yellow-500/30 shadow-xl">
                  <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-yellow-200" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-yellow-200 font-serif">
                    Loja de Zamira
                  </h2>
                  <p className="text-amber-300 text-xs md:text-sm">Produtos Místicos do Vendedor Welder</p>
                </div>
              </div>

              {/* Saldo e Botão Fechar */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-slate-900/50 px-3 py-2 md:px-4 md:py-2 rounded-xl border-2 border-yellow-600/30 flex items-center gap-2">
                  <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span className="text-yellow-300 font-bold text-sm md:text-lg">{user.ouros || 0}</span>
                  <span className="text-yellow-500 text-xs md:text-sm">Ouros</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🔴 Fechando loja');
                    onClose();
                  }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-yellow-300" />
                </button>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${
                    selectedCategory === "all" 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-black/30 text-yellow-300 hover:bg-black/40'
                  }`}
                >
                  Todos
                </button>
                {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
                  <button
                    key={category}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(category);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${
                      selectedCategory === category 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-black/30 text-yellow-300 hover:bg-black/40'
                    }`}
                  >
                    <span className="mr-1">{icon}</span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Produtos - Mostra imediatamente se pré-carregado */}
            {isLoading && !preloadedProducts ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse mx-auto mb-4" />
                <p className="text-amber-300">Carregando produtos místicos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-amber-700 mx-auto mb-4" />
                <p className="text-amber-300">Nenhum produto disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 pb-6">
                {filteredProducts.map((product) => {
                  const rarity = RARITY_COLORS[product.rarity] || RARITY_COLORS.common;
                  return (
                    <motion.button
                      key={product.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                      className={`relative bg-gradient-to-br ${rarity.bg} rounded-xl p-3 border-2 ${rarity.border} hover:shadow-2xl transition-all`}
                    >
                      {/* Imagem */}
                      {product.image_url ? (
                        <div className="relative mb-2 aspect-square rounded-lg overflow-hidden bg-black/30">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-black/30 rounded-lg flex items-center justify-center text-4xl md:text-5xl mb-2">
                          {product.icon || CATEGORY_ICONS[product.category]}
                        </div>
                      )}
                      
                      {/* Raridade */}
                      <Badge className={`absolute top-1 right-1 ${rarity.text} bg-black/70 border ${rarity.border} capitalize text-[10px] px-1.5 py-0.5`}>
                        {product.rarity}
                      </Badge>

                      {/* Nome */}
                      <h3 className="text-white font-bold text-xs md:text-sm mb-2 line-clamp-2 text-center leading-tight">
                        {product.name}
                      </h3>

                      {/* Preço */}
                      <div className="flex items-center justify-center gap-1 bg-black/30 py-1.5 px-2 rounded-lg">
                        <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                        <span className="text-yellow-300 font-bold text-xs md:text-sm">{product.price_ouros}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal de Detalhes (Fullscreen) */}
          <AnimatePresence>
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(null);
                }}
              >
                <div className="h-full overflow-y-auto">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="min-h-full bg-gradient-to-br from-amber-950 to-amber-900 p-6"
                  >
                    {/* Botão Voltar */}
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="mb-4 flex items-center gap-2 text-amber-300 hover:text-amber-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="text-sm font-semibold">Voltar</span>
                    </button>

                    {/* Imagem Grande */}
                    <div className="text-center mb-6">
                      {selectedProduct.image_url ? (
                        <img 
                          src={selectedProduct.image_url} 
                          alt={selectedProduct.name}
                          className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-2xl shadow-2xl object-cover mb-4"
                        />
                      ) : (
                        <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-2xl bg-black/30 flex items-center justify-center text-8xl md:text-9xl mb-4">
                          {selectedProduct.icon || CATEGORY_ICONS[selectedProduct.category]}
                        </div>
                      )}
                      
                      <h3 className="text-3xl md:text-4xl font-bold text-yellow-200 mb-2 font-serif">
                        {selectedProduct.name}
                      </h3>
                      <Badge className={`${RARITY_COLORS[selectedProduct.rarity].text} bg-black/50 border ${RARITY_COLORS[selectedProduct.rarity].border} capitalize text-sm px-3 py-1`}>
                        {selectedProduct.rarity}
                      </Badge>
                    </div>

                    {/* Descrição */}
                    <div className="bg-black/30 rounded-xl p-4 md:p-6 mb-6 max-w-2xl mx-auto">
                      <p className="text-amber-200 text-sm md:text-base leading-relaxed text-center">
                        {selectedProduct.description}
                      </p>
                    </div>

                    {/* O que este produto faz */}
                    <div className="max-w-2xl mx-auto mb-6">
                      <h4 className="text-yellow-300 font-bold text-lg mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        O que este produto faz:
                      </h4>
                      <div className="bg-purple-900/30 border-2 border-purple-500/30 rounded-xl p-4">
                        <p className="text-white font-semibold text-base md:text-lg">
                          {getEffectDescription(selectedProduct)}
                        </p>
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="space-y-3 mb-6 max-w-2xl mx-auto">
                      {selectedProduct.effect_duration_hours > 0 && (
                        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg">
                          <Clock className="w-6 h-6 text-blue-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-amber-400">Duração</p>
                            <p className="text-white font-semibold">
                              {selectedProduct.effect_duration_hours} horas
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg">
                        <Coins className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-amber-400">Preço</p>
                          <p className="text-yellow-300 font-bold text-xl">
                            {selectedProduct.price_ouros} Ouros
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão de Compra */}
                    <div className="max-w-2xl mx-auto">
                      <Button
                        onClick={() => purchaseMutation.mutate(selectedProduct)}
                        disabled={purchaseMutation.isPending || user.ouros < selectedProduct.price_ouros}
                        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 disabled:opacity-50"
                      >
                        {purchaseMutation.isPending ? (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            Comprando...
                          </>
                        ) : user.ouros < selectedProduct.price_ouros ? (
                          "❌ Ouros Insuficientes"
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Comprar Agora
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
