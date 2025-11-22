import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Heart, 
  Sparkles, 
  Eye,
  MessageCircle,
  Play,
  Coins,
  Lock,
  AlertTriangle,
  Check,
  X,
  Volume2,
  BookOpen,
  Target,
  Send,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import Dice3D from "../components/kamasutra/Dice3D";

const INTENTIONS = [
  { id: "sincronia", name: "Sincronia", icon: "🌬️", description: "Focar na respiração mútua" },
  { id: "olhar", name: "Olhar", icon: "👁️", description: "Manter a conexão visual" },
  { id: "energia", name: "Energia", icon: "⚡", description: "Sentir a aura do parceiro" },
  { id: "sussurros", name: "Sussurros", icon: "💬", description: "Comunicação verbal" },
  { id: "gratidao", name: "Gratidão", icon: "🎁", description: "Gratidão pela união" },
  { id: "fantasia", name: "Fantasia", icon: "🌙", description: "Cenário místico" }
];

export default function KamasutraPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedRitual, setSelectedRitual] = useState(null);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    loadUser();
    
    const verified = localStorage.getItem('kamasutra_age_verified');
    const warning = localStorage.getItem('kamasutra_warning_accepted');
    if (verified === 'true') setAgeVerified(true);
    if (warning === 'true') setWarningAccepted(true);
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: positions } = useQuery({
    queryKey: ['kamasutra-positions'],
    queryFn: () => base44.entities.KamasutraPosition.filter({ is_active: true }, "order", 100),
    enabled: !!user && ageVerified && warningAccepted,
    initialData: []
  });

  const { data: rituals } = useQuery({
    queryKey: ['kamasutra-rituals'],
    queryFn: () => base44.entities.KamasutraRitual.filter({ is_active: true }, "order", 100),
    enabled: !!user && ageVerified && warningAccepted,
    initialData: []
  });

  const { data: positionLikes } = useQuery({
    queryKey: ['kamasutra-likes', selectedPosition?.id],
    queryFn: () => base44.entities.KamasutraLike.filter({ position_id: selectedPosition.id }),
    enabled: !!selectedPosition,
    initialData: []
  });

  const { data: positionComments } = useQuery({
    queryKey: ['kamasutra-comments', selectedPosition?.id],
    queryFn: () => base44.entities.KamasutraComment.filter({ position_id: selectedPosition.id }, "-created_date", 50),
    enabled: !!selectedPosition,
    initialData: []
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const existingLike = positionLikes.find(l => l.user_id === user.id);
      if (existingLike) {
        await base44.entities.KamasutraLike.delete(existingLike.id);
      } else {
        await base44.entities.KamasutraLike.create({
          position_id: selectedPosition.id,
          user_id: user.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kamasutra-likes'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (commentData) => {
      await base44.entities.KamasutraComment.create(commentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kamasutra-comments'] });
      setNewComment("");
      toast.success("Experiência compartilhada!");
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    commentMutation.mutate({
      position_id: selectedPosition.id,
      position_name: selectedPosition.name,
      user_id: isAnonymous ? "" : user.id,
      user_name: isAnonymous ? "Anônimo" : (user.display_name || user.full_name),
      comment: newComment.trim(),
      is_anonymous: isAnonymous
    });
  };

  const handleAgeConfirm = () => {
    setAgeVerified(true);
    localStorage.setItem('kamasutra_age_verified', 'true');
  };

  const handleWarningAccept = () => {
    setWarningAccepted(true);
    localStorage.setItem('kamasutra_warning_accepted', 'true');
  };

  const rollDice = async () => {
    if (!user || !positions || positions.length === 0) return;
    
    const currentOuros = user.ouros || 0;
    if (currentOuros < 1) {
      toast.error("Você precisa de 1 Ouro para girar os Dados da Intenção 💰");
      return;
    }

    setIsRollingDice(true);
    
    await base44.auth.updateMe({ ouros: currentOuros - 1 });
    setUser({ ...user, ouros: currentOuros - 1 });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const randomPosition = positions[Math.floor(Math.random() * positions.length)];
    const randomIntention = INTENTIONS[Math.floor(Math.random() * INTENTIONS.length)];

    setDiceResult({
      position: randomPosition,
      intention: randomIntention
    });

    setIsRollingDice(false);
    toast.success("Os Dados da Intenção foram lançados! 🎲✨");
  };

  const playAudio = (ritual) => {
    if (!user?.is_pro_subscriber && ritual.is_premium) {
      toast.error("Este ritual é exclusivo para assinantes PRO 👑");
      return;
    }

    if (ritual.audio_url) {
      window.dispatchEvent(new CustomEvent('playGlobalAudio', {
        detail: {
          title: ritual.title,
          description: ritual.description,
          url: ritual.audio_url,
          duration: ritual.duration_minutes ? `${ritual.duration_minutes}min` : null
        }
      }));
      toast.success(`Reproduzindo: ${ritual.title} 🎧`);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950">
        <Sparkles className="w-12 h-12 text-rose-500 animate-pulse" />
      </div>
    );
  }

  if (!ageVerified) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-rose-900/50 to-purple-900/50 border-rose-500/30 p-6 md:p-8 max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Verificação de Idade</h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
              Este conteúdo é destinado apenas para maiores de 18 anos. Contém material de natureza adulta e sensível.
            </p>
            <p className="text-rose-300 font-semibold mb-6">Você confirma que tem 18 anos ou mais?</p>
            <div className="flex gap-3">
              <Button onClick={handleAgeConfirm} className="flex-1 bg-rose-600 hover:bg-rose-700">
                <Check className="w-4 h-4 mr-2" />
                Sim, tenho 18+
              </Button>
              <Button onClick={() => window.history.back()} variant="outline" className="flex-1 border-gray-600">
                <X className="w-4 h-4 mr-2" />
                Não
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!warningAccepted) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gradient-to-br from-rose-900/50 to-purple-900/50 border-rose-500/30 p-6 md:p-8 max-w-md text-center">
            <Eye className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Aviso Importante</h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
              Este santuário contém ilustrações artísticas de posições íntimas. O conteúdo é apresentado com respeito e propósito educacional/espiritual.
            </p>
            <p className="text-rose-300 text-sm mb-6">
              Abordamos a intimidade sob uma perspectiva sagrada e consciente.
            </p>
            <Button onClick={handleWarningAccept} className="w-full bg-rose-600 hover:bg-rose-700">
              <Heart className="w-4 h-4 mr-2" />
              Entendo e Aceito
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const userLiked = positionLikes.some(l => l.user_id === user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white p-4 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-rose-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Flame className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
            Santuário Kamasutra
          </h1>
          <p className="text-slate-300 text-sm md:text-base">União Sagrada • Intimidade Consciente • Energia Tântrica</p>
        </motion.div>

        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid grid-cols-3 bg-slate-900/50 mb-6">
            <TabsTrigger value="positions" className="text-xs md:text-sm">Posições</TabsTrigger>
            <TabsTrigger value="dice" className="text-xs md:text-sm">Dados da Intenção</TabsTrigger>
            <TabsTrigger value="rituals" className="text-xs md:text-sm">Rituais</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <Card className="bg-gradient-to-br from-slate-900/50 to-black border-rose-500/20 p-4 md:p-6 mb-6">
              <h3 className="text-lg md:text-xl font-bold text-rose-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                O Grimório das Posições Sagradas
              </h3>
              <p className="text-gray-400 text-sm">
                Cada posição é uma porta para conexão profunda. Explore com reverência e presença.
              </p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((position, index) => (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="bg-gradient-to-br from-slate-900/60 to-black border-rose-500/20 hover:border-rose-400/50 transition-all overflow-hidden group cursor-pointer"
                    onClick={() => setSelectedPosition(position)}
                  >
                    {position.image_url && (
                      <div className="aspect-video overflow-hidden flex items-center justify-center bg-[#120c1a]">
                        <img 
                          src={position.image_url} 
                          alt={position.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-sm md:text-base">{position.name}</h4>
                        {position.rune_symbol && (
                          <span className="text-2xl">{position.rune_symbol}</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs md:text-sm line-clamp-2 mb-3">
                        {position.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {position.difficulty && (
                          <Badge className={`text-xs ${
                            position.difficulty === 'iniciante' ? 'bg-green-600' :
                            position.difficulty === 'intermediário' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}>
                            {position.difficulty}
                          </Badge>
                        )}
                        {position.category && (
                          <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-300">
                            {position.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dice">
            <Card className="bg-gradient-to-br from-slate-900/50 to-black border-rose-500/20 p-4 md:p-6 mb-6">
              <h3 className="text-lg md:text-xl font-bold text-rose-300 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Os Dados da Intenção
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Deixe o universo guiar sua jornada íntima. Dois dados místicos revelam: 
                <strong className="text-rose-300"> O Corpo</strong> (posição) e 
                <strong className="text-purple-300"> A Alma</strong> (intenção).
              </p>
              <div className="flex items-center gap-2 text-yellow-400">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-semibold">Custo: 1 Ouro por lançamento</span>
              </div>
            </Card>

            <div className="max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-purple-900/30 to-rose-900/30 border-rose-500/30 p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {isRollingDice ? (
                    <motion.div
                      key="rolling"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <div className="flex justify-center mb-6">
                        <Dice3D isRolling={true} size={120} />
                      </div>
                      <p className="text-white font-bold text-lg mt-6">Os dados estão rolando...</p>
                      <p className="text-gray-400 text-sm">O universo está escolhendo para você</p>
                    </motion.div>
                  ) : diceResult ? (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      <Card className="bg-slate-800/50 border-rose-500/30 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{diceResult.position.rune_symbol || "🎴"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-rose-300 text-xs font-semibold">O CORPO</p>
                            <p className="text-white font-bold text-base">{diceResult.position.name}</p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">{diceResult.position.description}</p>
                        <Button
                          onClick={() => setSelectedPosition(diceResult.position)}
                          size="sm"
                          variant="outline"
                          className="w-full border-rose-500/30 text-rose-300"
                        >
                          Ver Detalhes
                        </Button>
                      </Card>

                      <Card className="bg-slate-800/50 border-purple-500/30 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">{diceResult.intention.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-purple-300 text-xs font-semibold">A ALMA</p>
                            <p className="text-white font-bold text-base">{diceResult.intention.name}</p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{diceResult.intention.description}</p>
                      </Card>

                      <Button onClick={rollDice} className="w-full bg-gradient-to-r from-rose-600 to-purple-600">
                        <Coins className="w-4 h-4 mr-2" />
                        Lançar Novamente (1 Ouro)
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                      <div className="flex justify-center mb-6">
                        <Dice3D isRolling={false} size={120} />
                      </div>
                      <p className="text-white font-bold mb-2">Pronto para a Magia?</p>
                      <p className="text-gray-400 text-sm mb-6">
                        Lance os dados e deixe o universo guiar sua conexão íntima
                      </p>
                      <Button
                        onClick={rollDice}
                        disabled={!user || (user.ouros || 0) < 1}
                        className="bg-gradient-to-r from-rose-600 to-purple-600"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Girar os Dados (1 Ouro)
                      </Button>
                      {user && (user.ouros || 0) < 1 && (
                        <p className="text-yellow-400 text-xs mt-3">Você precisa de pelo menos 1 Ouro</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/50 to-black border-purple-500/20 p-6 mt-6">
                <h4 className="text-lg font-bold text-purple-300 mb-4">As 6 Intenções da Alma</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTENTIONS.map(intention => (
                    <div key={intention.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-2xl">{intention.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{intention.name}</p>
                        <p className="text-gray-400 text-xs">{intention.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rituals">
            <Card className="bg-gradient-to-br from-slate-900/50 to-black border-rose-500/20 p-4 md:p-6 mb-6">
              <h3 className="text-lg md:text-xl font-bold text-rose-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Rituais de Sintonização
              </h3>
              <p className="text-gray-400 text-sm">
                Práticas guiadas para aprofundar a conexão antes, durante e depois da intimidade.
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rituals.map((ritual, index) => {
                const isPremium = ritual.is_premium;
                const canAccess = user?.is_pro_subscriber || !isPremium;

                return (
                  <motion.div
                    key={ritual.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`bg-gradient-to-br from-slate-900/60 to-black border-rose-500/20 p-4 md:p-6 ${!canAccess ? 'opacity-60' : ''}`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: ritual.color || '#8B5CF6' }}
                        >
                          <span className="text-2xl">{ritual.icon || "🧘"}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">{ritual.title}</h4>
                          {ritual.duration_minutes && (
                            <p className="text-gray-400 text-xs">{ritual.duration_minutes} minutos</p>
                          )}
                        </div>
                        {isPremium && (
                          <Badge className="bg-yellow-600 text-white text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            PRO
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-4">{ritual.description}</p>

                      {ritual.audio_url && (
                        <Button
                          onClick={() => playAudio(ritual)}
                          size="sm"
                          disabled={!canAccess}
                          className="w-full bg-purple-600"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Ouvir
                        </Button>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {selectedPosition && (
          <div 
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-3 md:p-4"
            onClick={() => setSelectedPosition(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card className="bg-gradient-to-br from-slate-900 to-black border-rose-500/30">
                {selectedPosition.image_url && (
                  <div className="aspect-video flex items-center justify-center bg-[#120c1a]">
                    <img 
                      src={selectedPosition.image_url} 
                      alt={selectedPosition.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{selectedPosition.name}</h2>
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                        {selectedPosition.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => likeMutation.mutate()}
                        disabled={likeMutation.isPending}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                          userLiked ? 'bg-rose-600' : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        <Heart className={`w-6 h-6 ${userLiked ? 'fill-white text-white' : 'text-gray-400'}`} />
                      </button>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">{positionLikes.length}</p>
                      </div>
                      <button
                        onClick={() => setSelectedPosition(null)}
                        className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                      >
                        <X className="w-6 h-6 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {selectedPosition.mystical_meaning && (
                    <Card className="bg-purple-900/20 border-purple-500/30 p-4 mb-4">
                      <p className="text-purple-300 font-semibold text-sm mb-2">Significado Místico:</p>
                      <p className="text-gray-300 text-sm">{selectedPosition.mystical_meaning}</p>
                    </Card>
                  )}

                  {selectedPosition.benefits && selectedPosition.benefits.length > 0 && (
                    <div className="mb-4">
                      <p className="text-rose-300 font-semibold mb-2">Benefícios:</p>
                      <ul className="space-y-1">
                        {selectedPosition.benefits.map((benefit, i) => (
                          <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                            <Heart className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPosition.chakras && selectedPosition.chakras.length > 0 && (
                    <div className="mb-6">
                      <p className="text-purple-300 font-semibold mb-2">Chakras Estimulados:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPosition.chakras.map((chakra, i) => (
                          <Badge key={i} className="bg-purple-600 text-xs">{chakra}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Card className="bg-slate-800/50 border-rose-500/30 p-4 mb-4">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-rose-400" />
                      Você já fez essa posição? Conte sua experiência
                    </h4>
                    
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Compartilhe sua experiência..."
                      className="bg-slate-900 border-rose-900/30 text-white mb-3 text-sm"
                      maxLength={500}
                    />

                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                      />
                      <label className="text-sm text-gray-400">Comentar anonimamente</label>
                    </div>

                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || commentMutation.isPending}
                      className="w-full bg-rose-600 hover:bg-rose-700"
                      size="sm"
                    >
                      {commentMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Compartilhar
                    </Button>
                  </Card>

                  {positionComments.length > 0 && (
                    <div>
                      <h4 className="text-white font-bold mb-3">Experiências Compartilhadas ({positionComments.length})</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {positionComments.map(comment => (
                          <Card key={comment.id} className="bg-slate-800/50 border-slate-700/30 p-3">
                            <p className="text-sm text-gray-400 mb-1 font-semibold">
                              {comment.user_name}
                            </p>
                            <p className="text-sm text-gray-300">{comment.comment}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}