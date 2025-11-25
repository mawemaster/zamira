import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
// Correção do caminho e do comando import
import { supabase } from "../api/supabaseClient"; 
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
  LogIn, 
  Mail, 
  Lock,
  Heart
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  setDefaultOptions({ locale: ptBR, weekStartsOn: 0 });
}

const ADMIN_EMAILS = ["mawemaster@gmail.com", "chotteemelyn@gmail.com"];
const NO_LAYOUT_PAGES = ["Home", "Sobre", "PortalTarotPremium"];

const archetypeColors = {
  bruxa_natural: "#9333EA", sabio: "#F59E0B", guardiao_astral: "#3B82F6",
  xama: "#10B981", navegador_cosmico: "#8B5CF6", alquimista: "#6366F1", none: "#64748B"
};

const THEME_CONFIGS = {
  dark: { background: "#02031C", backgroundGradient: "linear-gradient(to bottom, #02031C, #1a1a2e, #02031C)", surface: "#1e1b4b", card: "#1e293b", accent: "#a855f7", accentHover: "#9333ea", border: "rgba(168, 85, 247, 0.3)", textSecondary: "#cbd5e1" },
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
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

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

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        navigate(createPageUrl("Hub"));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser({ ...authUser, ...profile });
        if (THEME_CONFIGS[profile.theme]) setThemeConfig(THEME_CONFIGS[profile.theme]);
      } else {
        setUser(authUser);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: email.split('@')[0] } }
        });
        if (error) throw error;
        alert("Cadastro realizado! Se você não entrar automaticamente, verifique seu email.");
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((mode) => (mode === "login" ? "signup" : "login"));
    setAuthError("");
    setShowPassword(false);
  };

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

  if (!user) {
    return (
      <div
        className="relative min-h-screen overflow-hidden px-4 py-10 md:py-16 text-white"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(168,85,247,0.28), transparent 35%), radial-gradient(circle at 85% 15%, rgba(59,130,246,0.22), transparent 30%), linear-gradient(140deg, #0c0a2a 0%, #1a0f3c 40%, #2c0f4f 75%, #3b0b60 100%)"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.08),transparent_35%)] blur-3xl" />
        <div className="absolute inset-0 pointer-events-none">
          {fireflies.map((firefly) => (
            <motion.span
              key={firefly.id}
              className="absolute w-2 h-2 rounded-full bg-purple-400/70 blur-[1px]"
              style={{ left: `${firefly.initialX}%`, top: `${firefly.initialY}%` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.15, 0.9], y: [0, -6, 0] }}
              transition={{ duration: firefly.duration, repeat: Infinity, delay: firefly.delay, ease: "easeInOut" }}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="relative text-center">
            <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
            <p className="text-gray-300">Conectando ao universo...</p>
          </div>
        ) : (
          <div className="relative max-w-5xl mx-auto grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-purple-200">
                <Sparkles className="w-4 h-4" />
                Portal místico
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Bem-vindo ao portal Zamira
                </h1>
                <p className="text-gray-300 text-lg">
                  Conecte-se à comunidade, desbloqueie rituais e acompanhe sua evolução interior com segurança.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg shadow-purple-900/30">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-300" />
                    <div>
                      <p className="font-semibold text-white text-sm">Acesso seguro</p>
                      <p className="text-gray-400 text-xs">Autenticação protegida e moderada.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg shadow-purple-900/30">
                  <div className="flex items-center gap-3">
                    <Headphones className="w-5 h-5 text-purple-300" />
                    <div>
                      <p className="font-semibold text-white text-sm">Suporte amigo</p>
                      <p className="text-gray-400 text-xs">Equipe pronta para ajudar sua jornada.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 border border-white/15 rounded-2xl p-8 shadow-2xl shadow-purple-900/40 backdrop-blur-lg"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-purple-200 font-semibold uppercase tracking-[0.08em]">
                    {authMode === "login" ? "Entrada" : "Convite"}
                  </p>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {authMode === "login" ? "Acesse sua conta" : "Crie sua conta"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">Sua jornada mística começa aqui.</p>
                </div>
                <Badge variant="outline" className="border-purple-500/40 text-purple-100 bg-purple-500/10">
                  Zamira
                </Badge>
              </div>

              {authError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Seu email"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className="pl-10 pr-24 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-xs text-purple-200 hover:text-white transition"
                    >
                      {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-semibold shadow-lg shadow-purple-900/40"
                  disabled={authLoading}
                >
                  {authLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : (
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      {authMode === "login" ? "Entrar" : "Cadastrar"}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-gray-300">
                  {authMode === "login" ? "Ainda não tem conta? " : "Já é um iniciado? "}
                  <button
                    onClick={toggleAuthMode}
                    className="text-purple-300 hover:text-white font-semibold underline hover:no-underline"
                  >
                    {authMode === "login" ? "Criar agora" : "Fazer login"}
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Ao continuar, você concorda com a guarda segura dos seus dados e o código de conduta da comunidade.
                </p>
              </div>
            </motion.div>
          </div>
        )}
        <div className="mt-12 text-center text-xs text-gray-300 flex items-center justify-center gap-2">
          Desenvolvido com
          <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
          por Vexto Digital
        </div>
      </div>
    );
  }

  const isAdmin = ADMIN_EMAILS.includes(user?.email);
  const archColor = user?.archetype ? archetypeColors[user.archetype] : archetypeColors.none;

  return (
    <div className="min-h-screen text-white" style={{ background: themeConfig.backgroundGradient }}>
      <style>{`:root { --archetype-color: ${archColor}; --theme-accent: ${themeConfig.accent}; }`}</style>
      <PWAHeadTags />
      <PWAInstallPrompt />
      
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
