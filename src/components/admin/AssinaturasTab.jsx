import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, Search, TrendingUp, Users, DollarSign, Activity, Calendar
} from "lucide-react";
import { motion } from "framer-motion";

export default function AssinaturasTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.User.list("-created_date", 1000),
  });

  const toggleProMutation = useMutation({
    mutationFn: async ({ userId, isPro }) => {
      return await base44.entities.User.update(userId, {
        is_pro_subscriber: !isPro
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    },
  });

  const filteredUsers = users?.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    );
  }) || [];

  const proUsers = users?.filter(u => u.is_pro_subscriber) || [];
  const freeUsers = users?.filter(u => !u.is_pro_subscriber) || [];
  const conversionRate = users?.length ? ((proUsers.length / users.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Assinaturas</h2>
        <p className="text-slate-600">Controle de usuários PRO e FREE</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{proUsers.length}</p>
              <p className="text-sm text-slate-600">Usuários PRO</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{freeUsers.length}</p>
              <p className="text-sm text-slate-600">Usuários FREE</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
              <p className="text-sm text-slate-600">Taxa Conversão</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">R$ 0</p>
              <p className="text-sm text-slate-600">Receita Mensal</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar usuários..."
            className="pl-10 border-slate-300"
          />
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Carregando assinaturas...</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
            >
              <Card className="bg-white border-slate-200 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900">{user.display_name || user.full_name}</p>
                      {user.is_pro_subscriber ? (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          <Crown className="w-3 h-3 mr-1" />
                          PRO
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-600">
                          FREE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span>{user.email}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProMutation.mutate({ 
                      userId: user.id, 
                      isPro: user.is_pro_subscriber 
                    })}
                    disabled={toggleProMutation.isPending}
                    className={user.is_pro_subscriber ? 
                      "border-yellow-300 text-yellow-700 hover:bg-yellow-50" : 
                      "border-slate-300"
                    }
                  >
                    {user.is_pro_subscriber ? "Remover PRO" : "Tornar PRO"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}