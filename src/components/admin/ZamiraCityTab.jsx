import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Save, Plus, Trash2, Edit2, Map, MessageSquare, Bell, Clock, Settings, ShoppingBag, Eye, EyeOff, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ZamiraCityTab() {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    effect_type: "xp_boost",
    effect_value: 0,
    effect_duration_hours: 0,
    price_ouros: 0,
    rarity: "common",
    category: "potion",
    icon: "✨",
    image_url: "",
    stock: -1,
    is_active: true
  });

  const { data: settings } = useQuery({
    queryKey: ['zamira-city-settings'],
    queryFn: async () => {
      const allSettings = await base44.entities.ZamiraCitySettings.list();
      return allSettings.length > 0 ? allSettings[0] : null;
    }
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['mystical-products-admin'],
    queryFn: () => base44.entities.MysticalProduct.list("-created_date", 100)
  });

  const { data: onlinePlayers } = useQuery({
    queryKey: ['zamira-online-players'],
    queryFn: async () => {
      const positions = await base44.entities.ZamiraPosition.filter({ is_online: true });
      return positions;
    },
    refetchInterval: 3000
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (settings) {
        return await base44.entities.ZamiraCitySettings.update(settings.id, data);
      }
      return await base44.entities.ZamiraCitySettings.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zamira-city-settings'] });
      alert('✅ Configurações salvas!');
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProduct) {
        return await base44.entities.MysticalProduct.update(editingProduct.id, data);
      }
      return await base44.entities.MysticalProduct.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mystical-products-admin'] });
      setShowProductForm(false);
      setEditingProduct(null);
      setProductData({
        name: "",
        description: "",
        effect_type: "xp_boost",
        effect_value: 0,
        effect_duration_hours: 0,
        price_ouros: 0,
        rarity: "common",
        category: "potion",
        icon: "✨",
        image_url: "",
        stock: -1,
        is_active: true
      });
      alert('✅ Produto salvo!');
    }
  });

  const toggleProductMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      return await base44.entities.MysticalProduct.update(id, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mystical-products-admin'] });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => await base44.entities.MysticalProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mystical-products-admin'] });
      alert('🗑️ Produto removido!');
    }
  });

  const handleAddMessage = () => {
    if (!newMessage.trim()) return;
    
    const currentMessages = settings?.slider_messages || [];
    updateSettingsMutation.mutate({
      slider_messages: [...currentMessages, newMessage.trim()]
    });
    setNewMessage("");
  };

  const handleRemoveMessage = (index) => {
    const currentMessages = settings?.slider_messages || [];
    updateSettingsMutation.mutate({
      slider_messages: currentMessages.filter((_, i) => i !== index)
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductData(product);
    setShowProductForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setProductData({ ...productData, image_url: file_url });
        alert('✅ Imagem enviada!');
      } catch (error) {
        alert('Erro ao enviar imagem: ' + error.message);
      }
    }
  };

  const currentSettings = settings || {
    slider_messages: [],
    slider_enabled: true,
    city_announcement: "",
    announcement_active: false,
    lobby_label: "CIDADE EXPANDIDA",
    city_label: "CENTRO DE ZAMIRA",
    arrow_color: "#A855F7",
    arrow_bg_color: "#A855F7",
    lobby_countdown_enabled: false,
    lobby_countdown_target: "",
    lobby_countdown_message: "LIVE em:",
    is_maintenance: false,
    maintenance_message: ""
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Gerenciar Cidade de Zamira</h2>
        <p className="text-slate-600">Controle completo do metaverso</p>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 p-4">
          <p className="text-purple-900 text-sm font-medium mb-1">Jogadores Online</p>
          <p className="text-3xl font-bold text-purple-600">{onlinePlayers?.length || 0}</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 p-4">
          <p className="text-orange-900 text-sm font-medium mb-1">Produtos Ativos</p>
          <p className="text-3xl font-bold text-orange-600">
            {products?.filter(p => p.is_active).length || 0}
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-4">
          <p className="text-blue-900 text-sm font-medium mb-1">Mensagens Slider</p>
          <p className="text-3xl font-bold text-blue-600">
            {currentSettings.slider_messages?.length || 0}
          </p>
        </Card>
      </div>

      {/* SLIDER DE MENSAGENS */}
      <Card className="bg-white border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Slider de Mensagens
          </h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentSettings.slider_enabled}
              onChange={(e) => updateSettingsMutation.mutate({ slider_enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Ativo</span>
          </label>
        </div>

        <div className="space-y-3 mb-4">
          {currentSettings.slider_messages?.map((msg, index) => (
            <div key={index} className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
              <span className="flex-1 text-sm text-slate-900">{msg}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveMessage(index)}
                className="border-red-300 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nova mensagem para o slider..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
          />
          <Button onClick={handleAddMessage} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-slate-600 mt-3">
          💡 Mensagens passam automaticamente no topo da cidade
        </p>
      </Card>

      {/* AVISO CENTRALIZADO */}
      <Card className="bg-white border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Aviso Centralizado
          </h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentSettings.announcement_active}
              onChange={(e) => updateSettingsMutation.mutate({ announcement_active: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Exibir</span>
          </label>
        </div>

        <Textarea
          value={currentSettings.city_announcement || ""}
          onChange={(e) => updateSettingsMutation.mutate({ city_announcement: e.target.value })}
          placeholder="Digite o aviso que aparecerá no centro da tela..."
          rows={3}
          className="mb-3"
        />

        <p className="text-xs text-slate-600">
          💡 Aparece no centro da tela para todos que estão na cidade
        </p>
      </Card>

      {/* LABELS DOS PORTAIS */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-blue-600" />
          Textos dos Portais
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Portal do Lobby</label>
            <Input
              value={currentSettings.lobby_label || "CIDADE EXPANDIDA"}
              onChange={(e) => updateSettingsMutation.mutate({ lobby_label: e.target.value })}
              placeholder="CIDADE EXPANDIDA"
            />
            <p className="text-xs text-slate-500 mt-1">Texto que aparece no portal do lobby</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Portal da Cidade</label>
            <Input
              value={currentSettings.city_label || "CENTRO DE ZAMIRA"}
              onChange={(e) => updateSettingsMutation.mutate({ city_label: e.target.value })}
              placeholder="CENTRO DE ZAMIRA"
            />
            <p className="text-xs text-slate-500 mt-1">Texto que aparece no portal da cidade</p>
          </div>
        </div>
      </Card>

      {/* CORES DAS SETAS */}
      <Card className="bg-white border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          Cores das Setas dos Portais
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Cor da Seta</label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={currentSettings.arrow_color || "#A855F7"}
                onChange={(e) => updateSettingsMutation.mutate({ arrow_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={currentSettings.arrow_color || "#A855F7"}
                onChange={(e) => updateSettingsMutation.mutate({ arrow_color: e.target.value })}
                placeholder="#A855F7"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cor do Fundo</label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={currentSettings.arrow_bg_color || "#A855F7"}
                onChange={(e) => updateSettingsMutation.mutate({ arrow_bg_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={currentSettings.arrow_bg_color || "#A855F7"}
                onChange={(e) => updateSettingsMutation.mutate({ arrow_bg_color: e.target.value })}
                placeholder="#A855F7"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* CRONÔMETRO DE LIVE */}
      <Card className="bg-white border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            Cronômetro de LIVE (Lobby)
          </h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentSettings.lobby_countdown_enabled}
              onChange={(e) => updateSettingsMutation.mutate({ lobby_countdown_enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Ativar</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Mensagem do Cronômetro</label>
            <Input
              value={currentSettings.lobby_countdown_message || "LIVE em:"}
              onChange={(e) => updateSettingsMutation.mutate({ lobby_countdown_message: e.target.value })}
              placeholder="LIVE em:"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Data e Hora da Live</label>
            <Input
              type="datetime-local"
              value={currentSettings.lobby_countdown_target?.slice(0, 16) || ""}
              onChange={(e) => updateSettingsMutation.mutate({ 
                lobby_countdown_target: e.target.value ? new Date(e.target.value).toISOString() : "" 
              })}
            />
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3">
          💡 Quando ativado, mostra cronômetro no lobby esperando a live
        </p>
      </Card>

      {/* PRODUTOS DA LOJA - COMPLETO */}
      <Card className="bg-white border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            Produtos da Loja de Zamira
          </h3>
          <Button
            onClick={() => {
              setShowProductForm(true);
              setEditingProduct(null);
              setProductData({
                name: "",
                description: "",
                effect_type: "xp_boost",
                effect_value: 0,
                effect_duration_hours: 0,
                price_ouros: 0,
                rarity: "common",
                category: "potion",
                icon: "✨",
                image_url: "",
                stock: -1,
                is_active: true
              });
            }}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        {/* Formulário de Produto */}
        <AnimatePresence>
          {showProductForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-900">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h4>
                  <Button variant="ghost" size="icon" onClick={() => setShowProductForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Nome do Produto</label>
                    <Input
                      value={productData.name}
                      onChange={(e) => setProductData({...productData, name: e.target.value})}
                      placeholder="Ex: Poção de XP Místico"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Descrição</label>
                    <Textarea
                      value={productData.description}
                      onChange={(e) => setProductData({...productData, description: e.target.value})}
                      placeholder="Descrição detalhada do produto..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <select
                      value={productData.category}
                      onChange={(e) => setProductData({...productData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="potion">Poção</option>
                      <option value="crystal">Cristal</option>
                      <option value="amulet">Amuleto</option>
                      <option value="scroll">Pergaminho</option>
                      <option value="essence">Essência</option>
                      <option value="artifact">Artefato</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Efeito</label>
                    <select
                      value={productData.effect_type}
                      onChange={(e) => setProductData({...productData, effect_type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="xp_boost">Boost de XP</option>
                      <option value="remove_spell">Remover Feitiço</option>
                      <option value="tinder_boost">Boost Tinder</option>
                      <option value="duel_boost">Boost Duelo</option>
                      <option value="protection">Proteção</option>
                      <option value="quest_accelerator">Acelerador de Missões</option>
                      <option value="gold_multiplier">Multiplicador de Ouro</option>
                      <option value="energy_recovery">Recuperação de Energia</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Valor do Efeito</label>
                    <Input
                      type="number"
                      value={productData.effect_value}
                      onChange={(e) => setProductData({...productData, effect_value: parseFloat(e.target.value)})}
                      placeholder="Ex: 50 (para 50% ou 50 pontos)"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Duração (horas)</label>
                    <Input
                      type="number"
                      value={productData.effect_duration_hours}
                      onChange={(e) => setProductData({...productData, effect_duration_hours: parseFloat(e.target.value)})}
                      placeholder="0 = permanente"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Preço (Ouros)</label>
                    <Input
                      type="number"
                      value={productData.price_ouros}
                      onChange={(e) => setProductData({...productData, price_ouros: parseFloat(e.target.value)})}
                      placeholder="Ex: 100"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Raridade</label>
                    <select
                      value={productData.rarity}
                      onChange={(e) => setProductData({...productData, rarity: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="common">Comum</option>
                      <option value="uncommon">Incomum</option>
                      <option value="rare">Raro</option>
                      <option value="epic">Épico</option>
                      <option value="legendary">Lendário</option>
                      <option value="mythical">Mítico</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Ícone (Emoji)</label>
                    <Input
                      value={productData.icon}
                      onChange={(e) => setProductData({...productData, icon: e.target.value})}
                      placeholder="✨"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Estoque</label>
                    <Input
                      type="number"
                      value={productData.stock}
                      onChange={(e) => setProductData({...productData, stock: parseInt(e.target.value)})}
                      placeholder="-1 = ilimitado"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Imagem do Produto</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-700"
                    />
                    {productData.image_url && (
                      <img src={productData.image_url} className="mt-2 w-32 h-32 object-cover rounded" />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={productData.is_active}
                        onChange={(e) => setProductData({...productData, is_active: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Produto ativo na loja</span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={() => createProductMutation.mutate(productData)}
                  disabled={createProductMutation.isPending || !productData.name}
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Atualizar Produto' : 'Criar Produto'}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Produtos */}
        {loadingProducts ? (
          <p className="text-slate-600 text-center py-6">Carregando...</p>
        ) : products && products.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl">{product.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-slate-600">{product.price_ouros} ouros • {product.rarity}</p>
                  </div>
                  <Badge className={product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleProductMutation.mutate({ id: product.id, isActive: product.is_active })}
                  >
                    {product.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja remover este produto?')) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                    className="border-red-300 text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-center py-6">Nenhum produto cadastrado</p>
        )}
      </Card>

      {/* MANUTENÇÃO */}
      <Card className="bg-white border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            Modo Manutenção
          </h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentSettings.is_maintenance}
              onChange={(e) => updateSettingsMutation.mutate({ is_maintenance: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-red-600">Ativar Manutenção</span>
          </label>
        </div>

        <div className="mb-3">
          <label className="text-sm font-medium mb-2 block">Mensagem de Manutenção</label>
          <Textarea
            value={currentSettings.maintenance_message || ""}
            onChange={(e) => updateSettingsMutation.mutate({ maintenance_message: e.target.value })}
            placeholder="A Cidade de Zamira está em manutenção. Voltaremos em breve..."
            rows={3}
          />
        </div>

        <p className="text-xs text-slate-600">
          ⚠️ Quando ativo, bloqueia entrada na cidade para todos
        </p>
      </Card>
    </div>
  );
}