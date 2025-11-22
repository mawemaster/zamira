
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const WHITE_MAGICS = [
  {
    id: "aura_dourada",
    name: "Aura Dourada",
    emoji: "✨",
    description: "Envolve o perfil em luz dourada celestial",
    cost: 50,
    duration: 24,
    minLevel: 70
  },
  {
    id: "coroa_estrelas",
    name: "Coroa de Estrelas",
    emoji: "👑",
    description: "Uma coroa de estrelas cadentes sobre o avatar",
    cost: 75,
    duration: 48,
    minLevel: 70
  },
  {
    id: "portal_cosmico",
    name: "Portal Cósmico",
    emoji: "🌀",
    description: "Portal místico girando ao redor do perfil",
    cost: 100,
    duration: 72,
    minLevel: 80
  },
  {
    id: "jardim_encantado",
    name: "Jardim Encantado",
    emoji: "🌸",
    description: "Flores místicas flutuando pelo perfil",
    cost: 60,
    duration: 24,
    minLevel: 70
  },
  {
    id: "escudo_luz",
    name: "Escudo de Luz",
    emoji: "🛡️",
    description: "Proteção radiante ao redor do perfil",
    cost: 80,
    duration: 48,
    minLevel: 75
  },
  {
    id: "chuva_cristais",
    name: "Chuva de Cristais",
    emoji: "💎",
    description: "Cristais mágicos caindo suavemente",
    cost: 90,
    duration: 48,
    minLevel: 75
  }
];

const DARK_MAGICS = [
  {
    id: "aura_sombria",
    name: "Aura Sombria",
    emoji: "🌑",
    description: "Envolve o perfil em névoa escura",
    cost: 50,
    duration: 24,
    minLevel: 70
  },
  {
    id: "nevoa_mistica",
    name: "Névoa Mística",
    emoji: "🌫️",
    description: "Névoa roxa envolvente",
    cost: 60,
    duration: 24,
    minLevel: 70
  },
  {
    id: "eclipse_total",
    name: "Eclipse Total",
    emoji: "🌘",
    description: "Escuridão lunar ao redor do perfil",
    cost: 85,
    duration: 48,
    minLevel: 75
  },
  {
    id: "espelhos_negros",
    name: "Espelhos Negros",
    emoji: "🪞",
    description: "Reflexos distorcidos e sombrios",
    cost: 95,
    duration: 48,
    minLevel: 80
  },
  {
    id: "chamas_violetas",
    name: "Chamas Violetas",
    emoji: "🔥",
    description: "Fogo roxo místico dançando",
    cost: 110,
    duration: 72,
    minLevel: 85
  }
];

export default function ProfileMagicModal({ isOpen, onClose, profileUser, currentUser }) {
  const [selectedMagic, setSelectedMagic] = useState(null);
  const [message, setMessage] = useState("");
  const [isCasting, setIsCasting] = useState(false);

  if (!currentUser || !profileUser) return null;

  const handleCast = async () => {
    if (!selectedMagic) {
      toast.error("Selecione uma magia");
      return;
    }

    if ((currentUser.level || 0) < selectedMagic.minLevel) {
      toast.error(`Você precisa ser nível ${selectedMagic.minLevel}+`);
      return;
    }

    if ((currentUser.ouros || 0) < selectedMagic.cost) {
      toast.error("Ouros insuficientes");
      return;
    }

    setIsCasting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + selectedMagic.duration);

      await base44.entities.ProfileMagic.create({
        profile_user_id: profileUser.id,
        caster_id: currentUser.id,
        caster_name: currentUser.display_name || currentUser.full_name || 'Viajante',
        caster_avatar: currentUser.avatar_url || '',
        magic_type: selectedMagic.id,
        ouros_cost: selectedMagic.cost,
        duration_hours: selectedMagic.duration,
        expires_at: expiresAt.toISOString(),
        message: message.trim(),
        is_active: true
      });

      await base44.auth.updateMe({
        ouros: (currentUser.ouros || 0) - selectedMagic.cost
      });

      await base44.entities.Notification.create({
        user_id: profileUser.id,
        type: "announcement",
        title: "🔮 Magia Recebida!",
        message: `${currentUser.display_name || currentUser.full_name || 'Alguém'} encantou seu perfil com ${selectedMagic.name}!`,
        from_user_id: currentUser.id,
        from_user_name: currentUser.display_name || currentUser.full_name || 'Viajante',
        from_user_avatar: currentUser.avatar_url || ''
      });

      toast.success("✨ Magia lançada com sucesso!");
      onClose();
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao lançar magia");
    } finally {
      setIsCasting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-purple-400" />
                Encantar Perfil
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm">
                💫 Apenas viajantes <strong>nível 70+</strong> podem lançar magias em perfis
              </p>
              <p className="text-yellow-300 text-xs mt-1">
                Você está nível {currentUser.level || 1} | Ouros: {currentUser.ouros || 0}
              </p>
            </div>

            <Tabs defaultValue="white" className="mb-6">
              <TabsList className="w-full bg-slate-800/50 grid grid-cols-2">
                <TabsTrigger value="white">✨ Magias Brancas</TabsTrigger>
                <TabsTrigger value="dark">🌑 Magias Sombrias</TabsTrigger>
              </TabsList>

              <TabsContent value="white" className="space-y-3 mt-4">
                {WHITE_MAGICS.map(magic => (
                  <button
                    key={magic.id}
                    onClick={() => setSelectedMagic(magic)}
                    disabled={(currentUser.level || 0) < magic.minLevel}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedMagic?.id === magic.id
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-purple-900/30 bg-slate-800/30 hover:border-purple-700/50"
                    } ${(currentUser.level || 0) < magic.minLevel ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-bold flex items-center gap-2">
                          <span className="text-2xl">{magic.emoji}</span>
                          {magic.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{magic.description}</p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-yellow-400">💰 {magic.cost} Ouros</span>
                          <span className="text-blue-400">⏱️ {magic.duration}h</span>
                          <span className="text-purple-400">⭐ Nível {magic.minLevel}+</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </TabsContent>

              <TabsContent value="dark" className="space-y-3 mt-4">
                {DARK_MAGICS.map(magic => (
                  <button
                    key={magic.id}
                    onClick={() => setSelectedMagic(magic)}
                    disabled={(currentUser.level || 0) < magic.minLevel}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedMagic?.id === magic.id
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-purple-900/30 bg-slate-800/30 hover:border-purple-700/50"
                    } ${(currentUser.level || 0) < magic.minLevel ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-bold flex items-center gap-2">
                          <span className="text-2xl">{magic.emoji}</span>
                          {magic.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{magic.description}</p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-yellow-400">💰 {magic.cost} Ouros</span>
                          <span className="text-blue-400">⏱️ {magic.duration}h</span>
                          <span className="text-purple-400">⭐ Nível {magic.minLevel}+</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </TabsContent>
            </Tabs>

            {selectedMagic && (
              <div className="mb-4">
                <label className="text-sm text-gray-300 mb-2 block">Mensagem (opcional)</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Deixe uma mensagem mística..."
                  className="bg-slate-800 border-purple-900/30 text-white h-20"
                  maxLength={200}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-purple-900/30 text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCast}
                disabled={!selectedMagic || isCasting || (currentUser.level || 0) < 70}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isCasting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Lançando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Lançar Magia
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
