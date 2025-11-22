
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  Shield, Users, MessageSquare, Package, TrendingUp, Settings,
  Activity, Eye, Database, FileText, Award, Coins, Map,
  BarChart3, Bell, Sparkles, Crown, Search, Filter,
  RefreshCw, Download, Upload, ChevronRight, X, Edit2,
  Save, Trash2, Plus, Phone, ShoppingBag, Zap, Target, Headphones, Send, Video, Volume2, Smartphone, Megaphone, Brain, Code2, GraduationCap, Flag, Loader2, BookOpen // Added Loader2, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";

import DashboardTab from "../components/admin/DashboardTab";
import UsersTab from "../components/admin/UsersTab";
import MessagesTab from "../components/admin/MessagesTab";
import PostsTab from "../components/admin/PostsTab";
import ProductsTab from "../components/admin/ProductsTab";
import EconomyTab from "../components/admin/EconomyTab";
import AnalyticsTab from "../components/admin/AnalyticsTab";
import SystemTab from "../components/admin/SystemTab";
import SuporteTab from "../components/admin/SuporteTab";
import AssinaturasTab from "../components/admin/AssinaturasTab";
import ConteudoTab from "../components/admin/ConteudoTab";
import SonsTab from "../components/admin/SonsTab";
import JogosTab from "../components/admin/JogosTab";
import AppTab from "../components/admin/AppTab";
import AdsTab from "../components/admin/AdsTab";
import QuizzesTab from "../components/admin/QuizzesTab";
import PagesEditorTab from "../components/admin/PagesEditorTab";
import TrackingTab from "../components/admin/TrackingTab";
import PortalTarotTab from "../components/admin/PortalTarotTab";
import ZamiraCityTab from "../components/admin/ZamiraCityTab";
import PrecosTab from "../components/admin/PrecosTab";
import ConsultasTab from "../components/admin/ConsultasTab";
import ReportsTab from "../components/admin/ReportsTab";
import KamasutraTab from "../components/admin/KamasutraTab";
import MidiaTab from "../components/admin/MidiaTab";
import GlobalChatTab from "../components/admin/GlobalChatTab";
import MagicTab from "../components/admin/MagicTab";
import SkinsTab from "../components/admin/SkinsTab";
import EnciclopediaTab from "../components/admin/EnciclopediaTab"; // Added EnciclopediaTab

const ADMIN_EMAILS = ["mawemaster@gmail.com", "chotteemelyn@gmail.com"];

export default function AdminZamiraPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro de autenticação:", error);
      navigate("/Hub");
    }
  };

  const sendGlobalMessageMutation = useMutation({
    mutationFn: async (message) => {
      const response = await base44.functions.invoke('sendGlobalMessage', { message });
      return response.data;
    },
    onSuccess: (data) => {
      alert(`✅ Mensagem enviada para ${data.sent_to} usuários!`);
      setGlobalMessage("");
      setShowMessageBox(false);
    },
    onError: (error) => {
      alert('Erro ao enviar mensagem: ' + error.message);
    }
  });

  const handleSendGlobalMessage = () => {
    if (globalMessage.trim()) {
      sendGlobalMessageMutation.mutate(globalMessage);
    }
  };

  // This 'tabs' array is kept to support the existing mobile navigation, as per instructions.
  // The 'id' fields have been updated to match the new desktop tab keys for consistency.
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity, component: DashboardTab },
    { id: "portal_tarot", label: "Portal Tarot", icon: GraduationCap, component: PortalTarotTab },
    { id: "zamira_city", label: "Zamira City", icon: Map, component: ZamiraCityTab },
    { id: "kamasutra", label: "Kamasutra", icon: Sparkles, component: KamasutraTab },
    { id: "media", label: "Mídia", icon: Database, component: MidiaTab },
    { id: "chat", label: "Chat Global", icon: MessageSquare, component: GlobalChatTab },
    { id: "consultations", label: "Consultas", icon: Video, component: ConsultasTab },
    { id: "reports", label: "Denúncias", icon: Flag, component: ReportsTab },
    { id: "pages", label: "Editor", icon: FileText, component: PagesEditorTab },
    { id: "tracking", label: "Tracking", icon: Code2, component: TrackingTab },
    { id: "users", label: "Usuários", icon: Users, component: UsersTab },
    { id: "messages", label: "Conversas", icon: MessageSquare, component: MessagesTab },
    { id: "posts", label: "Posts", icon: FileText, component: PostsTab },
    { id: "products", label: "Produtos", icon: ShoppingBag, component: ProductsTab },
    { id: "content", label: "Conteúdo", icon: Video, component: ConteudoTab },
    { id: "quizzes", label: "Quizzes", icon: Brain, component: QuizzesTab },
    { id: "games", label: "Jogos", icon: Map, component: JogosTab },
    { id: "app", label: "App", icon: Smartphone, component: AppTab },
    { id: "ads", label: "Ads", icon: Megaphone, component: AdsTab },
    { id: "economy", label: "Economia", icon: Coins, component: EconomyTab },
    { id: "prices", label: "Preços", icon: Target, component: PrecosTab },
    { id: "support", label: "Suporte", icon: Headphones, component: SuporteTab },
    { id: "subscriptions", label: "PRO", icon: Crown, component: AssinaturasTab },
    { id: "analytics", label: "Analytics", icon: BarChart3, component: AnalyticsTab },
    { id: "sounds", label: "Sons", icon: Volume2, component: SonsTab },
    { id: "system", label: "Sistema", icon: Settings, component: SystemTab },
    { id: "magic", label: "Magic Cards", icon: Award, component: MagicTab },
    { id: "skins", label: "Skins", icon: Package, component: SkinsTab },
    { id: "enciclopedia", label: "Enciclopédia", icon: BookOpen, component: EnciclopediaTab } // Added EnciclopediaTab to array
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Card className="bg-slate-900/50 border-red-500/30 p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para acessar esta área.</p>
        </Card>
      </div>
    );
  }

  // ActiveComponent is still used by the mobile navigation (kept code)
  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/91a87ae92_zamira-icon.png"
              alt="Admin"
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-sm font-bold text-gray-900">Painel</h1>
              <p className="text-[9px] text-gray-500">Controle Total</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMessageBox(!showMessageBox)}
              className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800 text-xs hidden md:flex"
            >
              <Bell className="w-3 h-3 mr-1" />
              Mensagem
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-900 w-8 h-8"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/Hub")}
              className="text-gray-600 hover:text-gray-900 w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showMessageBox && (
          <div className="border-t border-purple-200 bg-purple-50 p-4">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm text-purple-800 font-semibold mb-2">
                📢 Enviar Mensagem Global
              </p>
              <div className="flex gap-2">
                <Textarea
                  value={globalMessage}
                  onChange={(e) => setGlobalMessage(e.target.value)}
                  placeholder="Digite a mensagem..."
                  className="flex-1 border-purple-200 bg-white text-gray-900"
                  rows={2}
                />
                <Button
                  onClick={handleSendGlobalMessage}
                  disabled={sendGlobalMessageMutation.isPending || !globalMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Desktop Tabs */}
        <div className="hidden lg:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full bg-gray-100 border border-gray-200 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Dashboard</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Usuários</TabsTrigger>
              <TabsTrigger value="posts" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Posts</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Produtos</TabsTrigger>
              <TabsTrigger value="economy" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Economia</TabsTrigger>
              <TabsTrigger value="more" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Mais ▼</TabsTrigger>
            </TabsList>

            {activeTab === 'more' && (
              <div className="grid grid-cols-5 gap-2">
                <Button onClick={() => setActiveTab('analytics')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Analytics</Button>
                <Button onClick={() => setActiveTab('support')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Suporte</Button>
                <Button onClick={() => setActiveTab('subscriptions')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Assinaturas</Button>
                <Button onClick={() => setActiveTab('content')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Conteúdo</Button>
                <Button onClick={() => setActiveTab('kamasutra')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Kamasutra</Button>
                <Button onClick={() => setActiveTab('media')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Mídia</Button>
                <Button onClick={() => setActiveTab('games')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Jogos</Button>
                <Button onClick={() => setActiveTab('app')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">App</Button>
                <Button onClick={() => setActiveTab('ads')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Anúncios</Button>
                <Button onClick={() => setActiveTab('quizzes')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Quizzes</Button>
                <Button onClick={() => setActiveTab('pages')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Páginas</Button>
                <Button onClick={() => setActiveTab('tracking')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Tracking</Button>
                <Button onClick={() => setActiveTab('sounds')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Sons</Button>
                <Button onClick={() => setActiveTab('consultations')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Consultas</Button>
                <Button onClick={() => setActiveTab('reports')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Denúncias</Button>
                <Button onClick={() => setActiveTab('prices')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Preços</Button>
                <Button onClick={() => setActiveTab('chat')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Chat Global</Button>
                <Button onClick={() => setActiveTab('messages')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Mensagens</Button>
                <Button onClick={() => setActiveTab('system')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Sistema</Button>
                <Button onClick={() => setActiveTab('portal_tarot')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Portal Tarot</Button>
                <Button onClick={() => setActiveTab('zamira_city')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300">Zamira City</Button>
                <Button onClick={() => setActiveTab('skins')} className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-900 border-purple-300">✨ Skins</Button>
                <Button onClick={() => setActiveTab('magic')} className="bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-900 border-indigo-300">🃏 Magic</Button>
                <Button onClick={() => setActiveTab('enciclopedia')} className="bg-gradient-to-r from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 text-blue-900 border-blue-300">📚 Enciclopédia</Button>
              </div>
            )}

            <TabsContent value="dashboard"><DashboardTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="posts"><PostsTab /></TabsContent>
            <TabsContent value="products"><ProductsTab /></TabsContent>
            <TabsContent value="economy"><EconomyTab /></TabsContent>
            <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
            <TabsContent value="support"><SuporteTab /></TabsContent>
            <TabsContent value="subscriptions"><AssinaturasTab /></TabsContent>
            <TabsContent value="content"><ConteudoTab /></TabsContent>
            <TabsContent value="kamasutra"><KamasutraTab /></TabsContent>
            <TabsContent value="media"><MidiaTab /></TabsContent>
            <TabsContent value="games"><JogosTab /></TabsContent>
            <TabsContent value="app"><AppTab /></TabsContent>
            <TabsContent value="ads"><AdsTab /></TabsContent>
            <TabsContent value="quizzes"><QuizzesTab /></TabsContent>
            <TabsContent value="pages"><PagesEditorTab /></TabsContent>
            <TabsContent value="tracking"><TrackingTab /></TabsContent>
            <TabsContent value="sounds"><SonsTab /></TabsContent>
            <TabsContent value="consultations"><ConsultasTab /></TabsContent>
            <TabsContent value="reports"><ReportsTab /></TabsContent>
            <TabsContent value="prices"><PrecosTab /></TabsContent>
            <TabsContent value="chat"><GlobalChatTab /></TabsContent>
            <TabsContent value="messages"><MessagesTab /></TabsContent>
            <TabsContent value="system"><SystemTab /></TabsContent>
            <TabsContent value="portal_tarot"><PortalTarotTab /></TabsContent>
            <TabsContent value="zamira_city"><ZamiraCityTab /></TabsContent>
            <TabsContent value="skins"><SkinsTab /></TabsContent>
            <TabsContent value="magic"><MagicTab /></TabsContent>
            <TabsContent value="enciclopedia"><EnciclopediaTab /></TabsContent>
          </Tabs>
        </div>

        {/* This div renders the actual content component for the mobile view */}
        <div className="md:hidden py-4">
          {ActiveComponent && <ActiveComponent searchQuery={searchQuery} />}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white backdrop-blur-lg border-t-2 border-gray-200 shadow-2xl z-[100]">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 p-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition whitespace-nowrap min-w-[70px] ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-600 bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />
      </nav>
    </div>
  );
}
