import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Backpack, Sparkles, Loader2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import SkinCard from "../components/profile/SkinCard";
import SkinDetailModal from "../components/profile/SkinDetailModal";
import { toast } from "sonner";

export default function InventarioPage() {
  const [user, setUser] = useState(null);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [showSkinModal, setShowSkinModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: allSkins = [] } = useQuery({
    queryKey: ['all-skins'],
    queryFn: async () => {
      const skins = await base44.entities.Skin.filter({ is_available: true });
      return skins || [];
    }
  });

  const { data: userSkins = [] } = useQuery({
    queryKey: ['user-skins', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const skins = await base44.entities.UserSkin.filter({ user_id: user.id });
      return skins || [];
    },
    enabled: !!user?.id
  });

  const { data: userItems = [] } = useQuery({
    queryKey: ['user-items', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const items = await base44.entities.InventoryItem.filter({ user_id: user.id });
      return items || [];
    },
    enabled: !!user?.id
  });

  const buySkinMutation = useMutation({
    mutationFn: async (skinId) => {
      const skin = allSkins.find(s => s.id === skinId);
      if (!skin) throw new Error("Skin não encontrada");
      
      if (user.ouros < skin.price_ouros) {
        throw new Error("Ouros insuficientes");
      }

      await base44.auth.updateMe({
        ouros: user.ouros - skin.price_ouros
      });

      await base44.entities.UserSkin.create({
        user_id: user.id,
        skin_id: skinId,
        is_equipped: false,
        acquired_date: new Date().toISOString()
      });

      return skin;
    },
    onSuccess: (skin) => {
      queryClient.invalidateQueries({ queryKey: ['user-skins'] });
      toast.success(`Você adquiriu ${skin.name}! ✨`);
      setShowSkinModal(false);
      loadUser();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao comprar skin");
    }
  });

  const equipSkinMutation = useMutation({
    mutationFn: async (skinId) => {
      const allUserSkins = await base44.entities.UserSkin.filter({ user_id: user.id });
      
      for (const skin of allUserSkins) {
        if (skin.is_equipped) {
          await base44.entities.UserSkin.update(skin.id, { is_equipped: false });
        }
      }

      const userSkin = userSkins.find(us => us.skin_id === skinId);
      if (userSkin) {
        await base44.entities.UserSkin.update(userSkin.id, { is_equipped: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-skins'] });
      toast.success("Skin equipada com sucesso! ✨");
      setShowSkinModal(false);
    }
  });

  const handleSkinClick = (skin) => {
    setSelectedSkin(skin);
    setShowSkinModal(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const ownedSkinIds = new Set(userSkins.map(us => us.skin_id));
  const equippedSkin = userSkins.find(us => us.is_equipped);
  const ownedSkins = allSkins.filter(skin => ownedSkinIds.has(skin.id));
  const availableSkins = allSkins.filter(skin => !ownedSkinIds.has(skin.id));

  const selectedSkinOwned = selectedSkin ? ownedSkinIds.has(selectedSkin.id) : false;
  const selectedSkinEquipped = selectedSkin && equippedSkin ? equippedSkin.skin_id === selectedSkin.id : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] p-3 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Backpack className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white">Meu Inventário</h1>
              <p className="text-sm md:text-base text-gray-400">
                {ownedSkins.length + userItems.length} itens místicos coletados
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="skins" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 mb-4 md:mb-6">
            <TabsTrigger value="skins" className="text-xs md:text-sm">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Minhas Skins
            </TabsTrigger>
            <TabsTrigger value="loja" className="text-xs md:text-sm">
              <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Loja de Skins
            </TabsTrigger>
            <TabsTrigger value="items" className="text-xs md:text-sm">
              <Backpack className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Outros Itens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skins">
            {ownedSkins.length === 0 ? (
              <Card className="bg-slate-900/50 border-purple-500/30 p-8 md:p-12 text-center">
                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-500/50 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-purple-300 mb-2">
                  Nenhuma Skin Ainda
                </h3>
                <p className="text-sm md:text-base text-gray-400 mb-4">
                  Visite a loja e adquira skins místicas para personalizar seu perfil
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {ownedSkins.map((skin) => (
                  <SkinCard
                    key={skin.id}
                    skin={skin}
                    owned={true}
                    equipped={equippedSkin?.skin_id === skin.id}
                    onClick={() => handleSkinClick(skin)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="loja">
            <div className="mb-4 md:mb-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-3 md:p-4">
              <h3 className="text-base md:text-lg font-bold text-purple-300 mb-2">✨ Loja Mística de Skins</h3>
              <p className="text-xs md:text-sm text-gray-400">
                Adquira skins exclusivas para personalizar seu perfil místico
              </p>
            </div>

            {availableSkins.length === 0 ? (
              <Card className="bg-slate-900/50 border-purple-500/30 p-8 md:p-12 text-center">
                <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-sm md:text-base text-gray-400">
                  Você já possui todas as skins disponíveis! 🎉
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {availableSkins.map((skin) => (
                  <SkinCard
                    key={skin.id}
                    skin={skin}
                    owned={false}
                    equipped={false}
                    onClick={() => handleSkinClick(skin)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="items">
            {userItems.length === 0 ? (
              <Card className="bg-slate-900/50 border-purple-500/30 p-8 md:p-12 text-center">
                <Backpack className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-sm md:text-base text-gray-400">
                  Seu inventário está vazio
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {userItems.map((item) => (
                  <Card key={item.id} className="bg-slate-900/50 border-purple-500/30 p-3 md:p-4 text-center">
                    <div className="text-3xl md:text-4xl mb-2">{item.icon || '🎁'}</div>
                    <p className="text-white font-bold text-xs md:text-sm truncate">{item.name}</p>
                    <p className="text-gray-400 text-[10px] md:text-xs">x{item.quantity || 1}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <SkinDetailModal
        skin={selectedSkin}
        owned={selectedSkinOwned}
        equipped={selectedSkinEquipped}
        isOpen={showSkinModal}
        onClose={() => {
          setShowSkinModal(false);
          setSelectedSkin(null);
        }}
        onBuy={() => buySkinMutation.mutate(selectedSkin.id)}
        onEquip={() => equipSkinMutation.mutate(selectedSkin.id)}
        buying={buySkinMutation.isPending}
        equipping={equipSkinMutation.isPending}
        userOuros={user?.ouros || 0}
      />
    </div>
  );
}