import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Plus, Edit, Trash, Save, X, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SkinsTab() {
  const [editingSkin, setEditingSkin] = useState(null);
  const [creatingSkin, setCreatingSkin] = useState(false);
  const [skinForm, setSkinForm] = useState({});
  const queryClient = useQueryClient();

  const { data: skins = [], isLoading } = useQuery({
    queryKey: ['admin-skins'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.Skin.list("-created_date", 500);
    }
  });

  const createSkinMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.asServiceRole.entities.Skin.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skins'] });
      setCreatingSkin(false);
      setSkinForm({});
    }
  });

  const updateSkinMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.asServiceRole.entities.Skin.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skins'] });
      setEditingSkin(null);
      setSkinForm({});
    }
  });

  const deleteSkinMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.asServiceRole.entities.Skin.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skins'] });
    }
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }) => {
      return await base44.asServiceRole.entities.Skin.update(id, { is_available: !isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skins'] });
    }
  });

  const handleStartCreate = () => {
    setCreatingSkin(true);
    setSkinForm({
      name: "",
      description: "",
      image_url: "",
      rarity: "comum",
      price_ouros: 100,
      is_available: true,
      category: "criatura"
    });
  };

  const handleEdit = (skin) => {
    setEditingSkin(skin.id);
    setSkinForm(skin);
  };

  const handleSave = () => {
    if (creatingSkin) {
      createSkinMutation.mutate(skinForm);
    } else if (editingSkin) {
      updateSkinMutation.mutate({ id: editingSkin, data: skinForm });
    }
  };

  const handleCancel = () => {
    setEditingSkin(null);
    setCreatingSkin(false);
    setSkinForm({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const SkinForm = () => (
    <Card className="bg-slate-800/70 border-purple-500/20 p-4 mb-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Nome da Skin</label>
            <Input
              value={skinForm.name || ''}
              onChange={(e) => setSkinForm({ ...skinForm, name: e.target.value })}
              className="bg-slate-900/70 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Categoria</label>
            <Select
              value={skinForm.category || 'criatura'}
              onValueChange={(value) => setSkinForm({ ...skinForm, category: value })}
            >
              <SelectTrigger className="bg-slate-900/70 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="criatura">Criatura</SelectItem>
                <SelectItem value="elemental">Elemental</SelectItem>
                <SelectItem value="mistico">Místico</SelectItem>
                <SelectItem value="divino">Divino</SelectItem>
                <SelectItem value="sombrio">Sombrio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Raridade</label>
            <Select
              value={skinForm.rarity || 'comum'}
              onValueChange={(value) => setSkinForm({ ...skinForm, rarity: value })}
            >
              <SelectTrigger className="bg-slate-900/70 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comum">Comum</SelectItem>
                <SelectItem value="rara">Rara</SelectItem>
                <SelectItem value="epica">Épica</SelectItem>
                <SelectItem value="lendaria">Lendária</SelectItem>
                <SelectItem value="mitica">Mítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Preço (Ouros)</label>
            <Input
              type="number"
              value={skinForm.price_ouros || 100}
              onChange={(e) => setSkinForm({ ...skinForm, price_ouros: parseInt(e.target.value) })}
              className="bg-slate-900/70 border-gray-700 text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">Descrição</label>
          <Textarea
            value={skinForm.description || ''}
            onChange={(e) => setSkinForm({ ...skinForm, description: e.target.value })}
            className="bg-slate-900/70 border-gray-700 text-white h-20"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">Lore</label>
          <Textarea
            value={skinForm.lore || ''}
            onChange={(e) => setSkinForm({ ...skinForm, lore: e.target.value })}
            className="bg-slate-900/70 border-gray-700 text-white h-24"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">URL da Imagem</label>
          <Input
            value={skinForm.image_url || ''}
            onChange={(e) => setSkinForm({ ...skinForm, image_url: e.target.value })}
            placeholder="https://..."
            className="bg-slate-900/70 border-gray-700 text-white"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {creatingSkin ? 'Criar Skin' : 'Salvar'}
          </Button>
          <Button onClick={handleCancel} className="bg-gray-700 hover:bg-gray-600 text-gray-200">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciador de Skins</h2>
          <p className="text-gray-300 text-sm">{skins.length} skins no sistema</p>
        </div>
        <Button onClick={handleStartCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Skin
        </Button>
      </div>

      {(creatingSkin || editingSkin) && <SkinForm />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skins.map((skin) => (
          <Card key={skin.id} className="bg-slate-800/70 border-purple-500/20 p-4">
            {skin.image_url && (
              <img src={skin.image_url} alt={skin.name} className="w-full h-40 object-cover rounded-lg mb-3" />
            )}
            <h3 className="text-white font-bold mb-1">{skin.name}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className="bg-purple-900/50 text-xs text-gray-200">{skin.rarity}</Badge>
              <Badge className="bg-blue-900/50 text-xs text-gray-200">{skin.price_ouros} ⚡</Badge>
              {!skin.is_available && (
                <Badge className="bg-red-900/50 text-xs text-gray-200">Indisponível</Badge>
              )}
            </div>
            <p className="text-xs text-gray-300 mb-3 line-clamp-2">{skin.description}</p>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(skin)} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button 
                onClick={() => toggleAvailabilityMutation.mutate({ id: skin.id, isAvailable: skin.is_available })}
                size="sm" 
                className={`${skin.is_available ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {skin.is_available ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button 
                onClick={() => {
                  if (confirm('Deletar esta skin?')) {
                    deleteSkinMutation.mutate(skin.id);
                  }
                }}
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}