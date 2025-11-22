
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, MessageSquare, ShoppingBag, TrendingUp, Activity,
  Eye, DollarSign, Package, Award, Map, Crown, Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardTab() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalPosts: 0,
    totalMessages: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalOuros: 0,
    activeVoiceRooms: 0
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list("-created_date", 1000),
    refetchInterval: 5000,
  });

  const { data: positions } = useQuery({
    queryKey: ['admin-positions'],
    queryFn: () => base44.entities.ZamiraPosition.filter({ is_online: true }),
    refetchInterval: 2000,
  });

  const { data: posts } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => base44.entities.Post.list("-created_date", 100),
  });

  const { data: messages } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.DirectMessage.list("-created_date", 100),
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: voiceRooms } = useQuery({
    queryKey: ['admin-voice-rooms'],
    queryFn: () => base44.entities.VoiceRoom.filter({ is_active: true }),
    refetchInterval: 3000,
  });

  const { data: orders } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => base44.entities.Order.list("-created_date", 200),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['dashboard-subscriptions'],
    queryFn: () => base44.entities.User.filter({ is_pro_subscriber: true }),
  });

  useEffect(() => {
    if (users) {
      const totalOuros = users.reduce((sum, user) => sum + (user.ouros || 0), 0);
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        totalOuros: totalOuros
      }));
    }
  }, [users]);

  useEffect(() => {
    if (positions) {
      setStats(prev => ({ ...prev, onlineUsers: positions.length }));
    }
  }, [positions]);

  useEffect(() => {
    if (posts) {
      setStats(prev => ({ ...prev, totalPosts: posts.length }));
    }
  }, [posts]);

  useEffect(() => {
    if (messages) {
      setStats(prev => ({ ...prev, totalMessages: messages.length }));
    }
  }, [messages]);

  useEffect(() => {
    if (products) {
      setStats(prev => ({ ...prev, totalProducts: products.length }));
    }
  }, [products]);

  useEffect(() => {
    if (voiceRooms) {
      setStats(prev => ({ ...prev, activeVoiceRooms: voiceRooms.length }));
    }
  }, [voiceRooms]);

  // Calcular estatísticas de vendas
  const totalSales = orders?.filter(o => o.status === 'approved')?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
  const totalOrders = orders?.filter(o => o.status === 'approved')?.length || 0;
  const proSubscribers = subscriptions?.length || 0;
  const proRevenue = proSubscribers * 29.90; // Assumindo R$ 29,90/mês

  const statCards = [
    { 
      label: "Usuários Totais", 
      value: stats.totalUsers, 
      icon: Users, 
      color: "from-blue-500 to-blue-600",
      change: "+12% este mês"
    },
    { 
      label: "Online Agora", 
      value: stats.onlineUsers, 
      icon: Activity, 
      color: "from-green-500 to-green-600",
      change: "Em tempo real"
    },
    { 
      label: "Posts Publicados", 
      value: stats.totalPosts, 
      icon: MessageSquare, 
      color: "from-purple-500 to-purple-600",
      change: "+23% esta semana"
    },
    { 
      label: "Mensagens Enviadas", 
      value: stats.totalMessages, 
      icon: Eye, 
      color: "from-pink-500 to-pink-600",
      change: "+45% hoje"
    },
    { 
      label: "Produtos Cadastrados", 
      value: stats.totalProducts, 
      icon: ShoppingBag, 
      color: "from-amber-500 to-amber-600",
      change: "Atualizado"
    },
    { 
      label: "Conversas de Voz", 
      value: stats.activeVoiceRooms, 
      icon: Zap, 
      color: "from-indigo-500 to-indigo-600",
      change: "Ativas agora"
    },
    { 
      label: "Ouros no Sistema", 
      value: stats.totalOuros.toLocaleString(), 
      icon: Crown, 
      color: "from-yellow-500 to-yellow-600",
      change: "Total circulante"
    },
    { 
      label: "Viajantes em Zamira", 
      value: stats.onlineUsers, 
      icon: Map, 
      color: "from-teal-500 to-teal-600",
      change: "Explorando"
    },
    { 
      label: "Vendas Aprovadas", 
      value: `R$ ${totalSales.toFixed(2)}`, 
      icon: DollarSign, 
      color: "from-green-500 to-green-600",
      change: `${totalOrders} pedidos`
    },
    { 
      label: "Receita PRO/Mês", 
      value: `R$ ${proRevenue.toFixed(2)}`, 
      icon: Crown, 
      color: "from-yellow-500 to-amber-600",
      change: `${proSubscribers} assinantes`
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-600">Visão geral do sistema em tempo real</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white border-slate-200 p-4 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
                <Badge variant="outline" className="text-xs text-slate-500 border-slate-300">
                  {stat.change}
                </Badge>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Vendas Recentes */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-green-600" />
          Vendas Recentes
        </h3>
        <div className="space-y-3">
          {orders?.slice(0, 5).map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {order.product_name}
                </p>
                <p className="text-xs text-slate-500">
                  Quantidade: {order.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  R$ {order.total?.toFixed(2)}
                </p>
                <Badge className={`text-xs ${
                  order.status === 'approved' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Atividade Recente */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Atividade Recente
        </h3>
        <div className="space-y-3">
          {posts?.slice(0, 5).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {post.author_name} criou um post
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {post.content?.substring(0, 60)}...
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {new Date(post.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Usuários Online na Cidade */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Map className="w-5 h-5 text-teal-600" />
          Viajantes em Zamira ({positions?.length || 0})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {positions?.slice(0, 8).map((pos) => (
            <div key={pos.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                {pos.user_id?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  Viajante #{pos.user_id?.substring(0, 8)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {pos.current_room || 'lobby'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
