
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Edit2, Save, X, Trash2, Crown, Mail, MessageSquare, Send,
  Calendar, TrendingUp, Coins, Activity, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersTab({ searchQuery }) {
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [localSearch, setLocalSearch] = useState("");
  const [selectedUserForMessage, setSelectedUserForMessage] = useState(null);
  const [individualMessage, setIndividualMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users-full'],
    queryFn: () => base44.entities.User.list("-created_date", 1000),
    refetchInterval: 10000,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      return await base44.entities.User.update(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-full'] });
      setEditingUser(null);
      setEditData({});
      alert('✅ Usuário atualizado!');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await base44.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-full'] });
    },
  });

  const sendIndividualMessageMutation = useMutation({
    mutationFn: async ({ userId, message }) => {
      const response = await base44.functions.invoke('sendIndividualMessage', {
        userId,
        message
      });
      return response.data;
    },
    onSuccess: () => {
      alert('✅ Mensagem enviada!');
      setSelectedUserForMessage(null);
      setIndividualMessage("");
    },
  });

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditData({
      display_name: user.display_name || '',
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      level: user.level || 1,
      xp: user.xp || 0,
      ouros: user.ouros || 0,
      archetype: user.archetype || 'none',
      mystical_title: user.mystical_title || '',
      pronouns: user.pronouns || '',
      relationship_status: user.relationship_status || '',
      is_pro_subscriber: user.is_pro_subscriber || false,
      online_status: user.online_status || 'offline',
      user_role: user.user_role || 'user',
      is_active: user.is_active !== false
    });
  };

  const handleSave = () => {
    if (editingUser) {
      updateUserMutation.mutate({ userId: editingUser, data: editData });
    }
  };

  const handleDelete = (userId) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSendMessage = () => {
    if (selectedUserForMessage && individualMessage.trim()) {
      sendIndividualMessageMutation.mutate({
        userId: selectedUserForMessage.id,
        message: individualMessage
      });
    }
  };

  const filteredUsers = users?.filter(user => {
    const query = (localSearch || searchQuery || '').toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
        <p className="text-slate-600">Carregando usuários...</p>
      </div>
    );
  }

  const roleLabels = {
    user: "Usuário",
    moderator: "Moderador",
    admin: "Administrador"
  };

  const roleColors = {
    user: "bg-slate-100 text-slate-800",
    moderator: "bg-blue-100 text-blue-800",
    admin: "bg-yellow-100 text-yellow-800"
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Usuários</h2>
          <p className="text-slate-600">{filteredUsers.length} usuários</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-10 border-slate-300"
          />
        </div>
      </Card>

      {selectedUserForMessage && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Enviar Mensagem Individual
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedUserForMessage(null)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-600">Para: <strong>{selectedUserForMessage.display_name || selectedUserForMessage.full_name}</strong></p>
            <p className="text-xs text-slate-500">{selectedUserForMessage.email}</p>
          </div>
          <Textarea
            value={individualMessage}
            onChange={(e) => setIndividualMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="mb-4 h-32"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendIndividualMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {filteredUsers.map((user, index) => {
            const isEditing = editingUser === user.id;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.01 }}
              >
                <Card className="bg-white border-slate-200 p-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Nome</label>
                          <Input
                            value={editData.display_name}
                            onChange={(e) => setEditData({...editData, display_name: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Username</label>
                          <Input
                            value={editData.username}
                            onChange={(e) => setEditData({...editData, username: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Email</label>
                          <Input
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Nível</label>
                          <Input
                            type="number"
                            value={editData.level}
                            onChange={(e) => setEditData({...editData, level: parseInt(e.target.value)})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">XP</label>
                          <Input
                            type="number"
                            value={editData.xp}
                            onChange={(e) => setEditData({...editData, xp: parseInt(e.target.value)})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Ouros</label>
                          <Input
                            type="number"
                            value={editData.ouros}
                            onChange={(e) => setEditData({...editData, ouros: parseInt(e.target.value)})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Pronomes</label>
                          <Input
                            value={editData.pronouns}
                            onChange={(e) => setEditData({...editData, pronouns: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Título</label>
                          <Input
                            value={editData.mystical_title}
                            onChange={(e) => setEditData({...editData, mystical_title: e.target.value})}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Status Online</label>
                          <select
                            value={editData.online_status}
                            onChange={(e) => setEditData({...editData, online_status: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg"
                          >
                            <option value="online">Online</option>
                            <option value="busy">Ocupado</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Conta PRO</label>
                          <select
                            value={editData.is_pro_subscriber ? 'true' : 'false'}
                            onChange={(e) => setEditData({...editData, is_pro_subscriber: e.target.value === 'true'})}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg"
                          >
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Permissão</label>
                          <select
                            value={editData.user_role}
                            onChange={(e) => setEditData({...editData, user_role: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg bg-yellow-50"
                          >
                            <option value="user">👤 Usuário</option>
                            <option value="moderator">🛡️ Moderador</option>
                            <option value="admin">👑 Administrador</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Conta Ativa</label>
                          <select
                            value={editData.is_active ? 'true' : 'false'}
                            onChange={(e) => setEditData({...editData, is_active: e.target.value === 'true'})}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg"
                          >
                            <option value="true">✅ Ativa</option>
                            <option value="false">🚫 Desativada</option>
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs font-medium text-slate-700 mb-1 block">Bio</label>
                          <Textarea
                            value={editData.bio}
                            onChange={(e) => setEditData({...editData, bio: e.target.value})}
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Dados Completos do Perfil
                        </h4>
                        <div className="grid md:grid-cols-3 gap-3 text-xs">
                          <div><strong>Nome Completo:</strong> {user.first_name} {user.last_name}</div>
                          <div><strong>Data Nascimento:</strong> {user.birth_date || 'N/D'}</div>
                          <div><strong>Signo Solar:</strong> {user.sun_sign || 'N/D'}</div>
                          <div><strong>Hora Nascimento:</strong> {user.birth_time || (user.birth_time_unknown ? 'Desconhecido' : 'N/D')}</div>
                          <div><strong>Cidade Natal:</strong> {user.birth_city || 'N/D'}</div>
                          <div><strong>Gênero:</strong> {user.gender || 'N/D'}</div>
                          <div><strong>Orientação:</strong> {user.orientation || 'N/D'}</div>
                          <div><strong>Relacionamento:</strong> {user.relationship_status || 'N/D'}</div>
                          <div><strong>Perfil Completo:</strong> {user.profile_completed ? '✅ Sim' : '❌ Não'}</div>
                          <div className="md:col-span-3">
                            <strong>No Zamira para:</strong> {user.zamira_purpose?.length ? user.zamira_purpose.join(', ') : 'N/D'}
                          </div>
                          <div className="md:col-span-3">
                            <strong>Crenças ({user.beliefs?.length || 0}):</strong> {user.beliefs?.length ? user.beliefs.slice(0, 5).join(', ') + (user.beliefs.length > 5 ? '...' : '') : 'N/D'}
                          </div>
                          <div className="md:col-span-3">
                            <strong>Hobbies ({user.hobbies?.length || 0}):</strong> {user.hobbies?.length ? user.hobbies.slice(0, 5).join(', ') + (user.hobbies.length > 5 ? '...' : '') : 'N/D'}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setEditingUser(null)}
                          className="border-slate-300"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={updateUserMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-bold text-slate-900">
                              {user.display_name || user.full_name || 'Sem nome'}
                            </p>
                            {user.is_pro_subscriber && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Crown className="w-3 h-3 mr-1" />
                                PRO
                              </Badge>
                            )}
                            <Badge className={roleColors[user.user_role || 'user']}>
                              {roleLabels[user.user_role || 'user']}
                            </Badge>
                            {user.is_active === false && (
                              <Badge className="bg-red-100 text-red-800">
                                Desativada
                              </Badge>
                            )}
                            {user.online_status === 'online' && (
                              <Badge className="bg-green-100 text-green-800">
                                Online
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Nv {user.level || 1}
                            </span>
                            <span className="flex items-center gap-1">
                              <Coins className="w-3 h-3 text-yellow-600" />
                              {user.ouros || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedUserForMessage(user)}
                            className="border-blue-300 text-blue-600"
                            title="Mensagem"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(user)}
                            className="border-slate-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            className="border-red-300 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4 mt-3">
                        <div className="grid md:grid-cols-3 gap-2 text-xs">
                          <div><strong>Username:</strong> {user.username || 'N/D'}</div>
                          <div><strong>Signo:</strong> {user.sun_sign || 'N/D'}</div>
                          <div><strong>Pronomes:</strong> {user.pronouns || 'N/D'}</div>
                          <div><strong>Arquétipo:</strong> {user.archetype || 'none'}</div>
                          <div><strong>Título:</strong> {user.mystical_title || 'N/D'}</div>
                          <div><strong>XP Total:</strong> {user.xp || 0}</div>
                          <div><strong>Crenças:</strong> {user.beliefs?.length || 0} selecionadas</div>
                          <div><strong>Hobbies:</strong> {user.hobbies?.length || 0} selecionados</div>
                          <div><strong>Perfil:</strong> {user.profile_completed ? '✅ Completo' : '⏳ Incompleto'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
