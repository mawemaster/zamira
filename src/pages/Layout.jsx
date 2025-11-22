import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from "@/api/supabaseClient"; // CONEXÃO REAL
import { 
  Home, Compass, MessageCircle, Bell, Store, User as UserIcon, Settings,
  Sparkles, Eye, Coins, Backpack, Crown, Shield, Headphones, Megaphone, LogIn, Mail, Lock
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Importando Input
import { motion } from "framer-motion";

// Imports dos seus componentes (mantidos)
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
  setDefaultOptions({ locale: ptBR, weekStartsOn: 0 });
}

const ADMIN_EMAILS = ["mawemaster@gmail.com", "chotteemelyn@gmail.com"];
const NO_LAYOUT_PAGES = ["Home", "Sobre", "PortalTarotPremium"];

// Mantendo configurações de tema e cores
const archetypeColors = {
  bruxa_natural: "#9333EA", sabio: "#F59E0B", guardiao_astral: "#3B82F6",
  xama: "#10B981", navegador_cosmico: "#8B5CF6", alquimista: "#6366F1", none: "#64748B"
};

const THEME_CONFIGS = {
  dark: { background: "#02031C", backgroundGradient: "linear-gradient(to bottom, #02031C, #1a1a2e, #02031C)", surface: "#1e1b4b", card: "#1e293b", accent: "#a855f7", accentHover: "#9333ea", border: "rgba(168, 85, 247, 0.3)", textSecondary: "#cbd5e1" },
  // ... (Você pode manter os outros temas se quiser, simplifiquei aqui para não ficar gigante, mas o código original tinha todos)
};

const generateFireflies = (count) => Array.from({ length: count }, (_, i) => ({
  id: i, initialX: Math.random() * 100, initialY: Math.random() * 100,
  delay: Math.random() * 5, duration: 8 + Math.random() * 6,
}));

const fireflies = generateFireflies(12);

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [themeConfig, setThemeConfig] = useState(THEME_CONFIGS.dark);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para o Login/Cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // 'login' ou 'signup'
  const [authLoading, setAuthLoading] = useState(false);

  // Estados dos componentes extras
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadRavensCount, setUnreadRavensCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioPlaylist, setAudioPlaylist] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  
  const shownNotificationsRef = useRef(new Set());
  const notificationGroupsRef = useRef(new Map());

  if (NO_LAYOUT_PAGES.includes(currentPageName)) return children;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);

  // --- CARREGAR USUÁRIO REAL (SUPABASE) ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      
      // 1. Verifica sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };
    init();

    // Escuta mudanças na autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        navigate(createPageUrl("Hub")); // Redireciona para a raiz se deslogar
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      // Busca dados extras na tabela 'profiles'
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({ ...authUser, ...profile });
        // Aplica tema se existir
        if (THEME_CONFIGS[profile.theme]) setThemeConfig(THEME_CONFIGS[profile.theme]);
      } else {
        // Se não tiver perfil criado ainda, usa o básico
        setUser(authUser);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  // --- FUNÇÕES DE AUTENTICAÇÃO ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Cadastro
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: email.split('@')[0] } // Usa parte do email como nome inicial
          }
        });
        if (error) throw error;
        alert("Cadastro realizado! Se você não entrar automaticamente, verifique seu email.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Funções auxiliares (Áudio, Logout, etc) mantidas simplificadas
  const handleLogout = async () => { await supabase.auth.signOut(); };
  const handleNotificationClick = (e) => { e.preventDefault(); navigate(createPageUrl("Notificacoes")); };
  const handleCloseAudioPlayer = () => { setCurrentAudio(null); setAudioPlaylist([]); };
  const removeToastNotification = (id) => { setToastNotifications(prev => prev.filter(n => n.id !== id)); };

  const navItems = [
    { icon: Home, label: "Início", path: "Hub" },
    { icon: Compass, label: "Explorar", path: "Explorar" },
    { icon: Eye, label: "Portal", path: "Portais", special: true },
    { icon: MessageCircle, label: "Chat", path: "Chat" },
    { icon: UserIcon, label: "Conta", path: "MinhaConta" }
  ];

  // --- TELA DE LOGIN / BOAS VINDAS ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: themeConfig.background }}>
        {isLoading ? (
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-300">Conectando ao universo...</p>
          </div>
        ) : (
          <div className="max-w-md w-full bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png" alt="Zamira" className="h-16 mx-auto mb-4 object-contain" />
              <h2 className="text-2xl font-bold text-white">{authMode === 'login' ? 'Entrar no Portal' : 'Criar Conta'}</h2>
              <p className="text-gray-400 text-sm mt-2">Sua jornada mística começa aqui.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="email" 
                    placeholder="Seu email" 
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    type="password" 
                    placeholder="Sua senha" 
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11" disabled={authLoading}>
                {authLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'Entrar' : 'Cadastrar')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {authMode === 'login' ? 'Ainda não tem conta? ' : 'Já é um iniciado? '}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-purple-400 hover:text-purple-300 font-semibold underline hover:no-underline"
                >
                  {authMode === 'login' ? 'Criar agora' : 'Fazer login'}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isAdmin = ADMIN_EMAILS.includes(user?.email);
  const archColor = user?.archetype ? archetypeColors[user.archetype] : archetypeColors.none;

  return (
    <div className="min-h-screen text-white" style={{ background: themeConfig.backgroundGradient }}>
      {/* Estilos Globais e Componentes do App Logado */}
      <style>{`:root { --archetype-color: ${archColor}; --theme-accent: ${themeConfig.accent}; }`}</style>
      <PWAHeadTags />
      <PWAInstallPrompt />
      {/* Header, Main, Nav e Player (código padrão mantido visualmente) */}
      
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b" style={{ backgroundColor: themeConfig.background + 'F2', borderColor: themeConfig.border }}>
        <div className="max-w-7xl mx-auto px-3 h-14 md:h-16 flex items-center justify-between">
          <Link to={createPageUrl("Hub")}><img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png" alt="Zamira" className="h-8 md:h-10 w-auto object-contain" /></Link>
          <div className="flex items-center gap-2">
             <button onClick={handleNotificationClick} className="relative p-2 text-gray-200 hover:bg-white/10 rounded-lg"><Bell className="w-5 h-5" /></button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild><button><UserAvatar user={user} size="sm" /></button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
                    <div className="px-2 py-1.5 text-sm font-semibold">{user.display_name || user.email}</div>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer">Sair</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </header>

      <XPBar user={user} />
      <QuestTracker user={user} />

      <main className="pt-[68px] pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t bg-black/90 border-white/10">
         <div className="flex justify-around h-16 items-center max-w-md mx-auto">
            {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === createPageUrl(item.path);
                if (item.special) return (
                    <Link key={item.path} to={createPageUrl(item.path)} className="-mt-8">
                        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-lg border-4 border-black">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                );
                return (
                    <Link key={item.path} to={createPageUrl(item.path)} className={`flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px]">{item.label}</span>
                    </Link>
                )
            })}
         </div>
      </nav>

      <GlobalAudioPlayer audio={currentAudio} onClose={handleCloseAudioPlayer} />
    </div>
  );
}