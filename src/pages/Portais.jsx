import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles,
  Calendar,
  Lightbulb,
  Flame,
  Moon,
  Star,
  Droplet,
  Heart,
  Brain,
  BookOpen,
  Zap,
  Wind,
  TrendingUp,
  Users,
  Search,
  Palette,
  Coins as CoinsIcon,
  Award,
  User as UserIcon,
  Settings,
  Book,
  Wand2,
  Eye,
  MessageSquare,
  CloudMoon,
  Volume2,
  Hexagon,
  Waves,
  Sparkle,
  Sun,
  Compass,
  Mic,
  Target,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import VocemModal from "../components/audio/VocemModal";
import EspheraModal from "../components/esphera/EspheraModal";
import { TAROT_CARDS, getRandomCard } from "../components/tarot/TarotCards";

const portals = [
  {
    id: "progresso",
    name: "Progresso",
    icon: TrendingUp,
    color: "from-indigo-600 to-purple-600",
    description: "Diário de Bordo da Alma - veja seu nível, XP e conquistas",
    status: "Ativo",
    category: "jornada",
    path: "Progresso"
  },
  {
    id: "distintivos",
    name: "Distintivos",
    icon: Award,
    color: "from-yellow-600 to-orange-600",
    description: "Sala de Conquistas - seus Selos Místicos",
    status: "Ativo",
    category: "jornada",
    path: "Distintivos"
  },
  {
    id: "planner",
    name: "Planner Lunar",
    icon: Calendar,
    color: "from-blue-600 to-cyan-600",
    description: "Organize sua vida com as fases da lua",
    status: "Ativo",
    category: "ferramentas",
    path: "PlannerLunar"
  },
  {
    id: "esphera",
    name: "Esphera AI",
    icon: Eye,
    color: "from-purple-600 to-pink-600",
    description: "Conselheira de Tarot com IA - perguntas ilimitadas",
    status: "Ativo",
    category: "ferramentas",
    isModal: true
  },
  {
    id: "mapa-astral",
    name: "Mapa Astral",
    icon: Compass,
    color: "from-indigo-600 to-purple-600",
    description: "Planetário da Alma - seu mapa completo",
    status: "Ativo",
    category: "ferramentas",
    path: "MapaAstral"
  },
  {
    id: "horoscopo",
    name: "Horóscopo",
    icon: Star,
    color: "from-yellow-600 to-orange-600",
    description: "Almanaque das Estrelas e Sintonia Astral",
    status: "Ativo",
    category: "ferramentas",
    path: "Horoscopo"
  },
  {
    id: "tiragem-diaria",
    name: "Tiragem Diária",
    icon: Sparkle,
    color: "from-pink-600 to-rose-600",
    description: "Ritual diário com uma carta de Tarot",
    status: "Ativo",
    category: "ferramentas",
    path: "TiragemDiaria"
  },
  {
    id: "pendulo",
    name: "Pêndulo Divinatório",
    icon: Droplet,
    color: "from-cyan-600 to-blue-600",
    description: "Oráculo do Pêndulo para perguntas sim/não",
    status: "Ativo",
    category: "ferramentas",
    path: "Pendulo"
  },
  {
    id: "mandala",
    name: "Mandala Criativa",
    icon: Hexagon,
    color: "from-pink-600 to-purple-600",
    description: "Ateliê da Alma - meditação ativa colorindo",
    status: "Ativo",
    category: "ferramentas",
    path: "MandalaCriativa"
  },
  {
    id: "diario-sonhos",
    name: "Diário dos Sonhos",
    icon: CloudMoon,
    color: "from-indigo-600 to-blue-600",
    description: "Registre e interprete seus sonhos",
    status: "Ativo",
    category: "ferramentas",
    path: "DiarioSonhos"
  },
  {
    id: "aura-digital",
    name: "Aura Digital",
    icon: Zap,
    color: "from-yellow-600 to-pink-600",
    description: "Revelador da Aura - visualize sua energia",
    status: "Ativo",
    category: "ferramentas",
    path: "AuraDigital"
  },
  {
    id: "ciclo-menstrual",
    name: "Ciclo Menstrual",
    icon: Waves,
    color: "from-pink-600 to-rose-600",
    description: "Acompanhe e entenda seu ciclo",
    status: "Ativo",
    category: "ferramentas",
    path: "CicloMenstrual"
  },
  {
    id: "kamasutra",
    name: "Santuário Kamasutra",
    icon: Flame,
    color: "from-rose-600 to-red-600",
    description: "União Sagrada • Intimidade Consciente (18+)",
    status: "Ativo",
    category: "ferramentas",
    path: "Kamasutra"
  },
  {
    id: "meditacoes",
    name: "Santuário do Silêncio",
    icon: Wind,
    color: "from-teal-600 to-green-600",
    description: "Biblioteca de frequências e sons curativos",
    status: "Ativo",
    category: "conhecimento",
    path: "SantuarioSilencio"
  },
  {
    id: "enciclopedia",
    name: "Enciclopédia",
    icon: BookOpen,
    color: "from-blue-600 to-indigo-600",
    description: "Grimório de referência místico",
    status: "Ativo",
    category: "conhecimento",
    path: "Enciclopedia"
  },
  {
    id: "quizzes",
    name: "Quizzes Místicos",
    icon: Brain,
    color: "from-purple-600 to-pink-600",
    description: "Teste seu conhecimento e ganhe Ouros + XP",
    status: "Ativo",
    category: "conhecimento",
    path: "QuizzesMisticos"
  },
  {
    id: "temas",
    name: "Alquimia Cromática",
    icon: Palette,
    color: "from-pink-600 to-purple-600",
    description: "Personalize as cores do portal",
    status: "Ativo",
    category: "personalizacao",
    path: "Temas"
  },
  {
    id: "favoritos",
    name: "Cofre de Tesouros",
    icon: Wand2,
    color: "from-rose-600 to-pink-600",
    description: "Tudo que você salvou no Zamira",
    status: "Ativo",
    category: "personalizacao",
    path: "CofreTesouros"
  },
  {
    id: "zamira-city",
    name: "Cidade de Zamira",
    icon: Users,
    color: "from-purple-600 to-blue-600",
    description: "Entre no metaverso místico e explore a cidade 3D",
    status: "Ativo",
    category: "conexao",
    path: "ZamiraCity"
  }
];

const categories = {
  jornada: { name: "Jornada do Viajante", icon: TrendingUp },
  ferramentas: { name: "Ferramentas Místicas", icon: Wand2 },
  conexao: { name: "Comunidade & Conexão", icon: Users },
  conhecimento: { name: "Conhecimento", icon: Book },
  personalizacao: { name: "Personalização", icon: Settings }
};

export default function PortaisPage() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showVocemModal, setShowVocemModal] = useState(false);
  const [showEspheraModal, setShowEspheraModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const handlePortalClick = (portal) => {
    if (portal.id === 'esphera') {
      setShowEspheraModal(true);
    } else if (portal.path) {
      navigate(createPageUrl(portal.path));
    }
  };

  const handlePlayAudio = (audio) => {
    window.dispatchEvent(new CustomEvent('playGlobalAudio', { detail: audio }));
    setShowVocemModal(false);
  };

  const filteredPortals = selectedCategory === "all"
    ? portals
    : portals.filter(p => p.category === selectedCategory);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const currentCategoryData = selectedCategory === "all" 
    ? { name: "Todos", icon: Sparkles }
    : categories[selectedCategory];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Portais Místicos
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            Ferramentas para sua jornada de autoconhecimento
          </p>

          {/* DESKTOP - Botões Horizontais */}
          <div className="hidden md:flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full transition ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Todos
            </button>
            {Object.entries(categories).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    selectedCategory === key
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* MOBILE - Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full max-w-md mx-auto flex items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    {React.createElement(currentCategoryData.icon, { className: "w-5 h-5" })}
                    <span className="font-semibold">{currentCategoryData.name}</span>
                  </div>
                  <ChevronDown className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[calc(100vw-2rem)] max-w-md bg-slate-900 border-purple-500/30"
                align="center"
              >
                <DropdownMenuItem
                  onClick={() => setSelectedCategory("all")}
                  className="text-white hover:bg-purple-900/30 cursor-pointer py-3"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  <span className="text-base">Todos</span>
                </DropdownMenuItem>
                {Object.entries(categories).map(([key, cat]) => {
                  const Icon = cat.icon;
                  return (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className="text-white hover:bg-purple-900/30 cursor-pointer py-3"
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="text-base">{cat.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortals.map((portal, index) => {
            const Icon = portal.icon;
            const isActive = portal.status === "Ativo";

            return (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  onClick={() => handlePortalClick(portal)}
                  className={`bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6 hover:border-purple-700/50 transition group relative overflow-hidden ${
                    portal.path || portal.isModal ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${portal.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${portal.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-purple-300 mb-2 group-hover:text-purple-200 transition">
                      {portal.name}
                    </h3>

                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {portal.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-3 py-1 rounded-full border ${
                        isActive
                          ? "bg-green-900/30 text-green-300 border-green-700/30"
                          : "bg-purple-900/30 text-purple-300 border-purple-700/30"
                      }`}>
                        {portal.status}
                      </span>
                      {(portal.path || portal.isModal) && (
                        <Sparkles className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <VocemModal
        isOpen={showVocemModal}
        onClose={() => setShowVocemModal(false)}
        onPlayAudio={handlePlayAudio}
      />

      <EspheraModal
        isOpen={showEspheraModal}
        onClose={() => setShowEspheraModal(false)}
        user={user}
      />
    </div>
  );
}