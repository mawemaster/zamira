import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, Search, DollarSign, TrendingUp, Users, Activity, Send 
} from "lucide-react";
import { motion } from "framer-motion";

export default function EconomyTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [ourosAmount, setOurosAmount] = useState(0);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-economy-users'],
    queryFn: () => base44.entities.User.list("-ouros", 500),
  });

  const addOurosMutation = useMutation({
    mutationFn: async ({ userEmail, amount }) => {
      const response = await base44.functions.invoke('addOurosToUser', {
        userEmail,
        ourosAmount: amount
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-economy-users'] });
      alert(`${data.amountAdded} ouros adicionados com sucesso!`);
      setSelectedUser(null);
      setOurosAmount(0);
    },
    onError: (error) => {
      alert('Erro ao adicionar ouros: ' + error.message);
    }
  });

  const handleAddOuros = () => {
    if (selectedUser && ourosAmount !== 0) {
      addOurosMutation.mutate({
        userEmail: selectedUser.email,
        amount: ourosAmount
      });
    }
  };

  const filteredUsers = users?.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    );
  }) || [];

  const totalOuros = users?.reduce((sum, user) => sum + (user.ouros || 0), 0) || 0;
  const avgOuros = users?.length ? Math.floor(totalOuros / users.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciar Economia</h2>
        <p className="text-slate-600">Controle total da moeda do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {totalOuros.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">Ouros no Sistema</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {avgOuros.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">Média por Usuário</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {users?.length || 0}
              </p>
              <p className="text-sm text-slate-600">Usuários Totais</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Adicionar Ouros */}
      {selectedUser && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-bold text-amber-900">
              Adicionar/Remover Ouros
            </h3>
          </div>
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-amber-900 mb-1 block">
                Usuário Selecionado
              </label>
              <Input
                value={selectedUser.display_name || selectedUser.email}
                disabled
                className="border-amber-300 bg-white"
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium text-amber-900 mb-1 block">
                Quantidade
              </label>
              <Input
                type="number"
                value={ourosAmount}
                onChange={(e) => setOurosAmount(parseInt(e.target.value) || 0)}
                placeholder="Ex: 1000 ou -500"
                className="border-amber-300"
              />
            </div>
            <Button
              onClick={handleAddOuros}
              disabled={addOurosMutation.isPending || ourosAmount === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Aplicar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null);
                setOurosAmount(0);
              }}
              className="border-amber-300"
            >
              Cancelar
            </Button>
          </div>
          <p className="text-xs text-amber-700">
            💡 Use números positivos para adicionar e negativos para remover ouros
          </p>
        </Card>
      )}

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
            <p className="text-slate-600">Carregando dados...</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01 }}
            >
              <Card 
                className={`bg-white border-slate-200 p-4 hover:shadow-md transition cursor-pointer ${
                  selectedUser?.id === user.id ? 'ring-2 ring-amber-500' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{user.display_name || user.full_name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <p className="font-bold text-lg text-slate-900">
                        {(user.ouros || 0).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Nv {user.level || 1}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}