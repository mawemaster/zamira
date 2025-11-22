import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Heart, MessageCircle, Image, Edit, Save, X, Eye, EyeOff, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function KamasutraTab() {
  const [editingPosition, setEditingPosition] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedPosition, setExpandedPosition] = useState(null);
  const queryClient = useQueryClient();

  const { data: positions = [], isLoading: loadingPositions } = useQuery({
    queryKey: ['admin-kamasutra-positions'],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.KamasutraPosition.list("-created_date", 500);
      return result || [];
    },
  });

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['admin-kamasutra-comments'],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.KamasutraComment.list("-created_date", 1000);
      return result || [];
    },
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['admin-kamasutra-likes'],
    queryFn: async () => {
      const result = await base44.asServiceRole.entities.KamasutraLike.list("-created_date", 2000);
      return result || [];
    },
  });

  const updatePositionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.asServiceRole.entities.KamasutraPosition.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kamasutra-positions'] });
      setEditingPosition(null);
      setEditForm({});
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.asServiceRole.entities.KamasutraComment.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kamasutra-comments'] });
    }
  });

  const handleEdit = (position) => {
    setEditingPosition(position.id);
    setEditForm(position);
  };

  const handleSave = () => {
    if (!editingPosition) return;
    updatePositionMutation.mutate({ id: editingPosition, data: editForm });
  };

  const handleCancel = () => {
    setEditingPosition(null);
    setEditForm({});
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditForm({ ...editForm, image_url: file_url });
    } catch (error) {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loadingPositions || loadingComments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const positionLikesCount = {};
  const positionCommentsMap = {};
  
  likes.forEach(like => {
    if (like && like.position_id) {
      positionLikesCount[like.position_id] = (positionLikesCount[like.position_id] || 0) + 1;
    }
  });
  
  comments.forEach(comment => {
    if (comment && comment.position_id) {
      if (!positionCommentsMap[comment.position_id]) {
        positionCommentsMap[comment.position_id] = [];
      }
      positionCommentsMap[comment.position_id].push(comment);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Kamasutra Manager</h2>
          <p className="text-gray-400 text-sm">
            {positions.length} posições | {comments.length} comentários | {likes.length} curtidas
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-purple-400">📖 Posições</h3>
        
        {positions.length === 0 ? (
          <Card className="bg-slate-900/50 border-purple-500/30 p-8 text-center">
            <p className="text-gray-400">Nenhuma posição cadastrada ainda</p>
          </Card>
        ) : (
          positions.map((position) => {
            if (!position || !position.id) return null;
            
            const positionComments = positionCommentsMap[position.id] || [];
            const isExpanded = expandedPosition === position.id;
            
            return (
              <Card key={position.id} className="bg-slate-900/50 border-purple-500/30 p-4">
                {editingPosition === position.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Nome</label>
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-800 border-purple-900/30 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Descrição</label>
                      <Textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="bg-slate-800 border-purple-900/30 text-white h-32"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Dicas</label>
                      <Textarea
                        value={editForm.tips || ''}
                        onChange={(e) => setEditForm({ ...editForm, tips: e.target.value })}
                        className="bg-slate-800 border-purple-900/30 text-white h-24"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Significado Místico</label>
                      <Textarea
                        value={editForm.mystical_meaning || ''}
                        onChange={(e) => setEditForm({ ...editForm, mystical_meaning: e.target.value })}
                        className="bg-slate-800 border-purple-900/30 text-white h-24"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Dificuldade</label>
                        <Select
                          value={editForm.difficulty || 'iniciante'}
                          onValueChange={(value) => setEditForm({ ...editForm, difficulty: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="iniciante">Iniciante</SelectItem>
                            <SelectItem value="intermediário">Intermediário</SelectItem>
                            <SelectItem value="avançado">Avançado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Categoria</label>
                        <Select
                          value={editForm.category || 'intimidade'}
                          onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                        >
                          <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="intimidade">Intimidade</SelectItem>
                            <SelectItem value="energia">Energia</SelectItem>
                            <SelectItem value="conexão">Conexão</SelectItem>
                            <SelectItem value="exploração">Exploração</SelectItem>
                            <SelectItem value="tântrico">Tântrico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Imagem da Posição</label>
                      {editForm.image_url && (
                        <img src={editForm.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-2" />
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={editForm.image_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                          placeholder="https://..."
                          className="bg-slate-800 border-purple-900/30 text-white flex-1"
                        />
                        <Button
                          onClick={() => document.getElementById(`upload-${position.id}`).click()}
                          disabled={uploadingImage}
                          variant="outline"
                          className="border-purple-500/30"
                        >
                          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                        <input
                          id={`upload-${position.id}`}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.is_active !== false}
                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-300">Posição Ativa (visível no app)</label>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={updatePositionMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="border-gray-600 text-gray-300">
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-1">{position.name || 'Sem nome'}</h4>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{position.description || 'Sem descrição'}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-purple-900/50">{position.difficulty || 'iniciante'}</Badge>
                          <Badge className="bg-blue-900/50">{position.category || 'intimidade'}</Badge>
                          {position.is_active !== false ? (
                            <Badge className="bg-green-900/50 text-green-400">
                              <Eye className="w-3 h-3 mr-1" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge className="bg-red-900/50 text-red-400">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inativa
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-pink-400" />
                            {positionLikesCount[position.id] || 0} curtidas
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            {positionComments.length} comentários
                          </span>
                        </div>
                      </div>
                      
                      {position.image_url ? (
                        <img 
                          src={position.image_url} 
                          alt={position.name}
                          className="w-32 h-32 object-cover rounded-lg ml-4 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-slate-800 rounded-lg ml-4 flex items-center justify-center flex-shrink-0">
                          <Image className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(position)} size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Posição
                      </Button>
                      
                      <Button
                        onClick={() => setExpandedPosition(isExpanded ? null : position.id)}
                        size="sm"
                        variant="outline"
                        className="border-purple-500/30"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                        {isExpanded ? 'Ocultar' : 'Ver'} Comentários ({positionComments.length})
                      </Button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && positionComments.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-2 border-t border-purple-500/20 pt-4"
                        >
                          <h5 className="text-sm font-bold text-purple-300 mb-2">💬 Comentários desta Posição</h5>
                          {positionComments.map((comment) => {
                            if (!comment || !comment.id) return null;
                            
                            return (
                              <Card key={comment.id} className="bg-slate-800/50 border-slate-700/30 p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-white font-bold text-sm">
                                        {comment.is_anonymous ? '🎭 Anônimo' : comment.user_name || 'Usuário'}
                                      </span>
                                      {comment.is_anonymous && comment.user_id && (
                                        <Badge className="bg-yellow-900/50 text-yellow-400 text-xs">
                                          ID: {comment.user_id.substring(0, 8)}...
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <p className="text-gray-300 text-sm mb-1">{comment.comment || ''}</p>
                                    
                                    {comment.created_date && (
                                      <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(comment.created_date), { 
                                          addSuffix: true, 
                                          locale: ptBR 
                                        })}
                                      </span>
                                    )}
                                  </div>

                                  <Button
                                    onClick={() => {
                                      if (confirm('Excluir este comentário?')) {
                                        deleteCommentMutation.mutate(comment.id);
                                      }
                                    }}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </Card>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-xl font-bold text-purple-400">💬 Todos os Comentários Recentes</h3>
        
        {comments.length === 0 ? (
          <Card className="bg-slate-900/50 border-purple-500/30 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">Nenhum comentário ainda</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {comments.slice(0, 100).map((comment) => {
              if (!comment || !comment.id) return null;
              
              return (
                <Card key={comment.id} className="bg-slate-900/50 border-purple-500/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-bold">
                          {comment.is_anonymous ? '🎭 Anônimo' : comment.user_name || 'Usuário'}
                        </span>
                        {comment.is_anonymous && comment.user_id && (
                          <Badge className="bg-yellow-900/50 text-yellow-400 text-xs">
                            ID: {comment.user_id.substring(0, 8)}...
                          </Badge>
                        )}
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-purple-400 text-sm">{comment.position_name || 'Posição'}</span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2">{comment.comment || ''}</p>
                      
                      {comment.created_date && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_date), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => {
                        if (confirm('Excluir este comentário?')) {
                          deleteCommentMutation.mutate(comment.id);
                        }
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}