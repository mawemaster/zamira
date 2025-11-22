import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Plus, Edit, Trash, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MagicTab() {
  const [editingCard, setEditingCard] = useState(null);
  const [creatingCard, setCreatingCard] = useState(false);
  const [cardForm, setCardForm] = useState({});
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['admin-magic-cards'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.MagicCard.list("-created_date", 500);
    }
  });

  const createCardMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.asServiceRole.entities.MagicCard.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-magic-cards'] });
      setCreatingCard(false);
      setCardForm({});
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.asServiceRole.entities.MagicCard.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-magic-cards'] });
      setEditingCard(null);
      setCardForm({});
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.asServiceRole.entities.MagicCard.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-magic-cards'] });
    }
  });

  const handleStartCreate = () => {
    setCreatingCard(true);
    setCardForm({
      name: "",
      type: "criatura",
      color: "branco",
      mana_cost: 1,
      power: 1,
      toughness: 1,
      description: "",
      rarity: "comum",
      is_active: true
    });
  };

  const handleEdit = (card) => {
    setEditingCard(card.id);
    setCardForm(card);
  };

  const handleSave = () => {
    if (creatingCard) {
      createCardMutation.mutate(cardForm);
    } else if (editingCard) {
      updateCardMutation.mutate({ id: editingCard, data: cardForm });
    }
  };

  const handleCancel = () => {
    setEditingCard(null);
    setCreatingCard(false);
    setCardForm({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const CardForm = () => (
    <Card className="bg-slate-900/50 border-purple-500/30 p-4 mb-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nome da Carta</label>
            <Input
              value={cardForm.name || ''}
              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              className="bg-slate-800 border-purple-900/30 text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Tipo</label>
            <Select
              value={cardForm.type || 'criatura'}
              onValueChange={(value) => setCardForm({ ...cardForm, type: value })}
            >
              <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="criatura">Criatura</SelectItem>
                <SelectItem value="feitico">Feitiço</SelectItem>
                <SelectItem value="instantaneo">Instantâneo</SelectItem>
                <SelectItem value="encantamento">Encantamento</SelectItem>
                <SelectItem value="artefato">Artefato</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Cor</label>
            <Select
              value={cardForm.color || 'branco'}
              onValueChange={(value) => setCardForm({ ...cardForm, color: value })}
            >
              <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="branco">⚪ Branco</SelectItem>
                <SelectItem value="azul">🔵 Azul</SelectItem>
                <SelectItem value="preto">⚫ Preto</SelectItem>
                <SelectItem value="vermelho">🔴 Vermelho</SelectItem>
                <SelectItem value="verde">🟢 Verde</SelectItem>
                <SelectItem value="incolor">⚪ Incolor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Custo Mana</label>
            <Input
              type="number"
              value={cardForm.mana_cost || 1}
              onChange={(e) => setCardForm({ ...cardForm, mana_cost: parseInt(e.target.value) })}
              className="bg-slate-800 border-purple-900/30 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Raridade</label>
            <Select
              value={cardForm.rarity || 'comum'}
              onValueChange={(value) => setCardForm({ ...cardForm, rarity: value })}
            >
              <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comum">Comum</SelectItem>
                <SelectItem value="incomum">Incomum</SelectItem>
                <SelectItem value="rara">Rara</SelectItem>
                <SelectItem value="mitica">Mítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {cardForm.type === 'criatura' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Poder</label>
              <Input
                type="number"
                value={cardForm.power || 1}
                onChange={(e) => setCardForm({ ...cardForm, power: parseInt(e.target.value) })}
                className="bg-slate-800 border-purple-900/30 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Resistência</label>
              <Input
                type="number"
                value={cardForm.toughness || 1}
                onChange={(e) => setCardForm({ ...cardForm, toughness: parseInt(e.target.value) })}
                className="bg-slate-800 border-purple-900/30 text-white"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Descrição/Efeito</label>
          <Textarea
            value={cardForm.description || ''}
            onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
            className="bg-slate-800 border-purple-900/30 text-white h-24"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Texto de Sabor</label>
          <Textarea
            value={cardForm.flavor_text || ''}
            onChange={(e) => setCardForm({ ...cardForm, flavor_text: e.target.value })}
            className="bg-slate-800 border-purple-900/30 text-white h-20"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">URL da Imagem</label>
          <Input
            value={cardForm.image_url || ''}
            onChange={(e) => setCardForm({ ...cardForm, image_url: e.target.value })}
            placeholder="https://..."
            className="bg-slate-800 border-purple-900/30 text-white"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            {creatingCard ? 'Criar Carta' : 'Salvar'}
          </Button>
          <Button onClick={handleCancel} variant="outline" className="border-gray-600 text-gray-300">
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
          <h2 className="text-2xl font-bold text-white">Magic: Gerenciador de Cartas</h2>
          <p className="text-gray-400 text-sm">{cards.length} cartas no sistema</p>
        </div>
        <Button onClick={handleStartCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Carta
        </Button>
      </div>

      {(creatingCard || editingCard) && <CardForm />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.id} className="bg-slate-900/50 border-purple-500/30 p-4">
            {card.image_url && (
              <img src={card.image_url} alt={card.name} className="w-full h-40 object-cover rounded-lg mb-3" />
            )}
            <h3 className="text-white font-bold mb-1">{card.name}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className="bg-blue-900/50 text-xs">{card.type}</Badge>
              <Badge className="bg-purple-900/50 text-xs">{card.color}</Badge>
              <Badge className="bg-yellow-900/50 text-xs">{card.rarity}</Badge>
            </div>
            {card.type === 'criatura' && (
              <p className="text-sm text-gray-400 mb-2">{card.power}/{card.toughness}</p>
            )}
            <p className="text-xs text-gray-300 mb-3 line-clamp-2">{card.description}</p>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(card)} size="sm" variant="outline" className="flex-1">
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button 
                onClick={() => {
                  if (confirm('Deletar esta carta?')) {
                    deleteCardMutation.mutate(card.id);
                  }
                }}
                size="sm" 
                variant="ghost" 
                className="text-red-400 hover:text-red-300"
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