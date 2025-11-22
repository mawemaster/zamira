import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, 
  Compass, 
  MessageCircle, 
  Bell,
  Store,
  User as UserIcon,
  Settings,
  Sparkles,
  Eye,
  Coins,
  Backpack,
  Crown,
  Shield,
  Headphones,
  Megaphone,
  LogIn
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import XPBar from "../components/XPBar";
import UserAvatar from "../components/UserAvatar";
import NotificationToast from "../components/NotificationToast";
import GlobalAudioPlayer from "../components/audio/GlobalAudioPlayer";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import PWANotifications from "../components/PWANotifications";
import PWAHeadTags from "../components/PWAHeadTags";
import QuestTracker from "../components/QuestTracker";
import AdminGlobalMessage from "../components/AdminGlobalMessage";
import RavenNotificationIcon from "../components/ravens/RavenNotificationIcon";

import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';

if (typeof window !== 'undefined') {
  setDefaultOptions({ 
    locale: ptBR,
    weekStartsOn: 0
  });
}

const ADMIN_EMAILS = ["mawemaster@gmail.com", "chotteemelyn@gmail.com"];

const NO_LAYOUT_PAGES = ["Home", "Sobre", "PortalTarotPremium"];

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

const THEME_CONFIGS = {
  dark: {
    background: "#02031C",
    backgroundGradient: "linear-gradient(to bottom, #02031C, #1a1a2e, #02031C)",
    surface: "#1e1b4b",
    card: "#1e293b",
    accent: "#a855f7",
    accentHover: "#9333ea",
    border: "rgba(168, 85, 247, 0.3)",
    textSecondary: "#cbd5e1"
  },
  "verde-esmeralda": {
    background: "#022c22",
    backgroundGradient: "linear-gradient(to bottom, #022c22, #064e3b, #022c22)",
    surface: "#064e3b",
    card: "#134e4a",
    accent: "#10b981",
    accentHover: "#059669",
    border: "rgba(16, 185, 129, 0.3)",
    textSecondary: "#d1fae5"
  },
  "azul-safira": {
    background: "#0c1e3f",
    backgroundGradient: "linear-gradient(to bottom, #0c1e3f, #1e3a8a, #0c1e3f)",
    surface: "#1e3a8a",
    card: "#1e40af",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    border: "rgba(59, 130, 246, 0.3)",
    textSecondary: "#dbeafe"
  },
  "vermelho-rubi": {
    background: "#3f0f0f",
    backgroundGradient: "linear-gradient(to bottom, #3f0f0f, #7f1d1d, #3f0f0f)",
    surface: "#7f1d1d",
    card: "#991b1b",
    accent: "#dc2626",
    accentHover: "#b91c1c",
    border: "rgba(220, 38, 38, 0.3)",
    textSecondary: "#fecaca"
  },
  "amarelo-topazio": {
    background: "#451a03",
    backgroundGradient: "linear-gradient(to bottom, #451a03, #78350f, #451a03)",
    surface: "#78350f",
    card: "#92400e",
    accent: "#f59e0b",
    accentHover: "#d97706",
    border: "rgba(245, 158, 11, 0.3)",
    textSecondary: "#fde68a"
  },
  "prata-lunar": {
    background: "#1e293b",
    backgroundGradient: "linear-gradient(to bottom, #1e293b, #334155, #1e293b)",
    surface: "#334155",
    card: "#475569",
    accent: "#94a3b8",
    accentHover: "#cbd5e1",
    border: "rgba(148, 163, 184, 0.3)",
    textSecondary: "#e2e8f0"
  },
  "rosa-celestial": {
    background: "#4a044e",
    backgroundGradient: "linear-gradient(to bottom, #4a044e, #831843, #4a044e)",
    surface: "#831843",
    card: "#9f1239",
    accent: "#ec4899",
    accentHover: "#db2777",
    border: "rgba(236, 72, 153, 0.3)",
    textSecondary: "#fbcfe8"
  },
  "laranja-fogo": {
    background: "#7c2d12",
    backgroundGradient: "linear-gradient(to bottom, #7c2d12, #c2410c, #7c2d12)",
    surface: "#c2410c",
    card: "#ea580c",
    accent: "#fb923c",
    accentHover: "#f97316",
    border: "rgba(251, 146, 60, 0.3)",
    textSecondary: "#fed7aa"
  }
};

const generateFireflies = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 6,
  }));
};

const fireflies = generateFireflies(12);

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadRavensCount, setUnreadRavensCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioPlaylist, setAudioPlaylist] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [themeConfig, setThemeConfig] = useState(THEME_CONFIGS.dark);
  const [isLoading, setIsLoading] = useState(true); 
   
  const shownNotificationsRef = useRef(new Set());
  const notificationGroupsRef = useRef(new Map());

  if (NO_LAYOUT_PAGES.includes(currentPageName)) {
    return children;
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadUser();
      setIsLoading(false);
      // loadNotifications(); // Desativado pois requer banco
      // loadUnreadRavens(); // Desativado pois requer banco
    };
    init();
    
    // Intervalo desativado para evitar erros no console sem banco de dados
    // const interval = setInterval(() => {
    //   loadNotifications();
    //   updateLastSeen();
    //   loadUser();
    //   loadUnreadRavens();
    // }, 5000);
    
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.documentElement.setAttribute('xml:lang', 'pt-BR');
    const metaTag = document.querySelector('meta[http-equiv="content-language"]');
    if (metaTag) {
      metaTag.setAttribute('content', 'pt-BR');
    } else {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'content-language';
      meta.content = 'pt-BR';
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    const handlePlayGlobalAudio = (event) => {
      const audio = event.detail;
      if (audio) {
        setCurrentAudio(audio);
        setAudioPlaylist([audio]);
        setCurrentAudioIndex(0);
      }
    };

    window.addEventListener('playGlobalAudio', handlePlayGlobalAudio);
    return () => window.removeEventListener('playGlobalAudio', handlePlayGlobalAudio);
  }, []);

  // --- FUNÇÃO MODIFICADA PARA BYPASS (LOGIN FALSO) ---
  const loadUser = async () => {
    // Cria um usuário falso na memória para o app funcionar sem banco de dados
    const fakeUser = {
      id: "user-bypass-001",
      full_name: "Viajante Místico",
      display_name: "Viajante",
      email: "admin@zamira.com",
      level: 10,
      ouros: 1000,
      archetype: "bruxa_natural", // Você pode mudar para: sabio, xama, alquimista, etc.
      is_pro_subscriber: true,
      online_status: "online",
      theme: "dark",
      detected_location: {
        country: "Brazil",
        state: "RJ",
        city: "Rio de Janeiro",
        timezone: "America/Sao_Paulo"
      }
    };

    console.log("Modo Bypass: Usuário carregado manualmente.");
    setUser(fakeUser);
    
    const theme = THEME_CONFIGS[fakeUser.theme] || THEME_CONFIGS.dark;
    setThemeConfig(theme);
    document.body.setAttribute('data-theme', fakeUser.theme);
    document.body.style.background = theme.backgroundGradient;
  };
  // ---------------------------------------------------

  const updateLastSeen = async () => {
    // Função desativada no modo bypass
  };

  const detectUserLocation = async (currentUser) => {
    // Função desativada no modo bypass
  };

  const loadNotifications = async () => {
    // Função desativada no modo bypass
  };

  const loadUnreadRavens = async () => {
    // Função desativada no modo bypass
  };

  const removeToastNotification = (id) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleCloseAudioPlayer = () => {
    setCurrentAudio(null);
    setAudioPlaylist([]);
    setCurrentAudioIndex(0);
  };

  const handleNextAudio = () => {
    if (audioPlaylist.length > 0 && currentAudioIndex < audioPlaylist.length - 1) {
      const nextIndex = currentAudioIndex + 1;
      setCurrentAudioIndex(nextIndex);
      setCurrentAudio(audioPlaylist[nextIndex]);
    } else if (audioPlaylist.length > 0 && currentAudioIndex === audioPlaylist.length - 1) {
      setCurrentAudioIndex(0);
      setCurrentAudio(audioPlaylist[0]);
    }
  };

  const handlePreviousAudio = () => {
    if (audioPlaylist.length > 0 && currentAudioIndex > 0) {
      const prevIndex = currentAudioIndex - 1;
      setCurrentAudioIndex(prevIndex);
      setCurrentAudio(audioPlaylist[prevIndex]);
    } else if (audioPlaylist.length > 0 && currentAudioIndex === 0) {
      setCurrentAudioIndex(audioPlaylist.length - 1);
      setCurrentAudio(audioPlaylist[audioPlaylist.length - 1]);
    }
  };

  const handleLogout = async () => {
    // Simplesmente recarrega a página para "deslogar"
    window.location.href = createPageUrl("Home");
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(createPageUrl("Notificacoes"));
  };

  const archColor = user?.archetype ? archetypeColors[user.archetype] : archetypeColors.none;

  const navItems = [
    { icon: Home, label: "Início", path: "Hub" },
    { icon: Compass, label: "Explorar", path: "Explorar" },
    { icon: Eye, label: "Portal", path: "Portais", special: true },
    { icon: MessageCircle, label: "Chat", path: "Chat" },
    { icon: UserIcon, label: "Conta", path: "MinhaConta" }
  ];

  // Tela de Carregamento ou Login
  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: themeConfig.background }}>
        {isLoading ? (
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-300">Carregando o portal...</p>
          </div>
        ) : (
          <div className="text-center max-w-md w-full bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png" 
              alt="Zamira" 
              className="h-16 mx-auto mb-6 object-contain"
            />
            <h2 className="text-2xl font-bold text-white mb-4">Bem-vindo de volta</h2>
            <p className="text-gray-400 mb-8">Para acessar o portal místico, você precisa se conectar.</p>
            
            {/* BOTÃO CORRIGIDO PARA IR AO HUB */}
            <Button 
              onClick={() => navigate(createPageUrl("Hub"))}
              className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 text-white"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar no Portal
            </Button>
          </div>
        )}
      </div>
    );
  }

  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  // Renderização Principal (quando logado)
  return (
    <div className="min-h-screen text-white" style={{ background: themeConfig.backgroundGradient }}>
      <style>{`
        :root {
          --archetype-color: ${archColor};
          --theme-bg: ${themeConfig.background};
          --theme-surface: ${themeConfig.surface};
          --theme-card: ${themeConfig.card};
          --theme-accent: ${themeConfig.accent};
          --theme-accent-hover: ${themeConfig.accentHover};
          --theme-border: ${themeConfig.border};
          --theme-text-secondary: ${themeConfig.textSecondary};
        }
        body {
          background: ${themeConfig.backgroundGradient} !important;
        }
        h1 { font-size: clamp(1.5rem, 5vw, 2.5rem); }
        h2 { font-size: clamp(1.25rem, 4vw, 2rem); }
        h3 { font-size: clamp(1.125rem, 3.5vw, 1.75rem); }
        h4 { font-size: clamp(1rem, 3vw, 1.5rem); }
        h5 { font-size: clamp(0.875rem, 2.5vw, 1.25rem); }
        h6 { font-size: clamp(0.75rem, 2vw, 1rem); }
        
        @media (max-width: 640px) {
          h1 { font-size: 1.5rem !important; }
          h2 { font-size: 1.25rem !important; }
          h3 { font-size: 1.125rem !important; }
          h4 { font-size: 1rem !important; }
          h5 { font-size: 0.875rem !important; }
          h6 { font-size: 0.75rem !important; }
        }
      `}</style>

      <PWAHeadTags />
      <PWAInstallPrompt />
      {user && <PWANotifications user={user} />}
      {user && <AdminGlobalMessage user={user} />}

      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b" style={{ 
        backgroundColor: `rgba(${parseInt(themeConfig.background.slice(1, 3), 16)}, ${parseInt(themeConfig.background.slice(3, 5), 16)}, ${parseInt(themeConfig.background.slice(5, 7), 16)}, 0.95)`,
        borderColor: themeConfig.border
      }}>
        <div className="max-w-7xl mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          <Link to={createPageUrl("Hub")} className="flex items-center gap-2 md:gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png" 
              alt="Zamira" 
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={handleNotificationClick}
              className="relative text-gray-200 hover:text-white h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 flex items-center justify-center rounded-lg hover:bg-white/10 transition touch-manipulation"
            >
              <Bell className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 pointer-events-none" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center bg-pink-500 text-white text-[10px] md:text-xs font-bold z-[52] pointer-events-none" style={{ borderWidth: '2px', borderColor: themeConfig.background }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </button>

            <button
              onClick={() => navigate(createPageUrl("Loja"))}
              className="text-gray-200 hover:text-white h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 flex items-center justify-center rounded-lg hover:bg-white/10 transition touch-manipulation"
            >
              <Store className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 pointer-events-none" />
            </button>

            <button
              onClick={() => navigate(createPageUrl("Carteira"))}
              className="text-gray-200 hover:text-white h-10 w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 flex items-center justify-center rounded-lg hover:bg-white/10 transition touch-manipulation px-2 md:px-2.5"
            >
              <div className="flex items-center gap-1 pointer-events-none">
                <Coins className="w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 text-yellow-400" />
                <span className="text-xs md:text-sm font-bold text-yellow-300">{user.ouros || 0}</span>
              </div>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 md:gap-2 hover:opacity-80 transition ml-1 md:ml-2 touch-manipulation h-10 w-10 md:h-11 md:w-11 rounded-lg hover:bg-white/10">
                  <UserAvatar user={user} size="sm" showStatus={true} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 md:w-56 z-[60]" style={{ backgroundColor: themeConfig.card, borderColor: themeConfig.border }}>
                <div className="px-3 py-2 border-b" style={{ borderColor: themeConfig.border }}>
                  <p className="text-sm font-semibold text-white truncate">
                    {user.display_name || user.full_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">Nível {user.level || 1}</p>
                    {user.is_pro_subscriber ? (
                      <Badge className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white text-[10px] px-1.5 py-0 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PRO
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-600 text-[10px] px-1.5 py-0">
                        FREE
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isAdmin && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => navigate(createPageUrl("AdminZamira"))} 
                      className="cursor-pointer text-yellow-400 hover:text-yellow-300"
                      style={{ backgroundColor: 'transparent' }}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      🔒 Painel Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ backgroundColor: themeConfig.border }} />
                  </>
                )}
                
                <DropdownMenuItem onClick={() => navigate(createPageUrl("MinhaConta"))} className="cursor-pointer text-gray-200 hover:text-white">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(createPageUrl("Arquetipo"))} className="cursor-pointer text-gray-200 hover:text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Meu Arquétipo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(createPageUrl("Inventario"))} className="cursor-pointer text-gray-200 hover:text-white">
                  <Backpack className="w-4 h-4 mr-2" />
                  Meu Inventário
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(createPageUrl("ZamiraAds"))} className="cursor-pointer hover:text-white" style={{ color: themeConfig.accent }}>
                  <Megaphone className="w-4 h-4 mr-2" />
                  Zamira Ads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(createPageUrl("Suporte"))} className="cursor-pointer text-blue-400 hover:text-blue-300">
                  <Headphones className="w-4 h-4 mr-2" />
                  Suporte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(createPageUrl("Configuracoes"))} className="cursor-pointer text-gray-200 hover:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator style={{ backgroundColor: themeConfig.border }} />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:text-red-300">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {user && <XPBar user={user} />}
      {user && <QuestTracker user={user} />}
      {user && <RavenNotificationIcon unreadCount={unreadRavensCount} />}

      <main className="pt-[68px] md:pt-[76px] pb-20 md:pb-24 lg:pb-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t" style={{ 
        backgroundColor: `rgba(${parseInt(themeConfig.background.slice(1, 3), 16)}, ${parseInt(themeConfig.background.slice(3, 5), 16)}, ${parseInt(themeConfig.background.slice(5, 7), 16)}, 0.98)`,
        borderColor: themeConfig.border
      }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireflies.map((firefly) => (
            <motion.div
              key={firefly.id}
              className="absolute rounded-full blur-[2px]"
              style={{
                width: '3px',
                height: '3px',
                left: `${firefly.initialX}%`,
                top: `${firefly.initialY}%`,
                backgroundColor: themeConfig.accent + '66'
              }}
              animate={{
                x: [0, Math.random() * 80 - 40, Math.random() * 80 - 40, 0],
                y: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
                opacity: [0.2, 0.6, 0.4, 0.2],
                scale: [0.8, 1.2, 0.9, 0.8],
              }}
              transition={{
                duration: firefly.duration,
                delay: firefly.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-around h-14 md:h-16 px-2 max-w-md mx-auto relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === createPageUrl(item.path);
            const Icon = item.icon;
            
            if (item.special) {
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center -mt-8 md:-mt-10"
                >
                  <Link
                    to={createPageUrl(item.path)}
                    className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl transition-all duration-300 touch-manipulation"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${themeConfig.accent}, ${themeConfig.accentHover})`,
                      boxShadow: `0 20px 25px -5px ${themeConfig.accent}60, 0 10px 10px -5px ${themeConfig.accent}40`,
                      borderWidth: '3px', 
                      borderColor: themeConfig.background 
                    }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white relative z-10 pointer-events-none" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 pointer-events-none"
                      style={{ borderColor: themeConfig.accent + '80' }}
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.5, 0.2, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </Link>
                </motion.div>
              );
            }

            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className={`flex flex-col items-center gap-0.5 md:gap-1 transition touch-manipulation p-2 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6 pointer-events-none" />
                <span className="text-[9px] md:text-[10px] pointer-events-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <GlobalAudioPlayer
        audio={currentAudio}
        onClose={handleCloseAudioPlayer}
        onNext={audioPlaylist.length > 1 ? handleNextAudio : null}
        onPrevious={audioPlaylist.length > 1 ? handlePreviousAudio : null}
        playlist={audioPlaylist}
        currentAudioIndex={currentAudioIndex}
      />

      <div className="fixed bottom-[70px] right-2 md:bottom-6 md:right-6 z-[100] space-y-2">
        {toastNotifications.map((notif) => (
          notif?.id ? (
            <NotificationToast
              key={notif.id}
              notification={notif}
              onClose={() => removeToastNotification(notif.id)}
            />
          ) : null
        ))}
      </div>
    </div>
  );
}