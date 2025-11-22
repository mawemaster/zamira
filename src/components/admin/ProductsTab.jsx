import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, Search, Edit2, Save, X, Trash2, Plus, Activity, Upload, Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [editData, setEditData] = useState({
    name: '', price: 0, category: '', type: 'Físico', 
    description: '', short_description: '', images: [], 
    is_active: true, stock: 0
  });
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: () => base44.entities.Product.list("-created_date", 200),
    refetchInterval: 10000,
  });

  const createOrUpdateProductMutation = useMutation({
    mutationFn: async (data) => {
      if (editingProduct) {
        return await base44.entities.Product.update(editingProduct.id, data);
      }
      return await base44.entities.Product.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-all'] });
      setEditingProduct(null);
      setShowNewProduct(false);
      setEditData({
        name: '', price: 0, category: '', type: 'Físico', 
        description: '', short_description: '', images: [], 
        is_active: true, stock: 0
      });
      alert('✅ Produto salvo com sucesso!');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      return await base44.entities.Product.delete(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-all'] });
    },
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditData({
      name: product.name || '',
      price: product.price || 0,
      category: product.category || '',
      type: product.type || 'Físico',
      description: product.description || '',
      short_description: product.short_description || '',
      images: product.images || [],
      is_active: product.is_active !== false,
      stock: product.stock || 0
    });
    setShowNewProduct(true);
  };

  const handleSave = () => {
    if (!editData.name || !editData.category) {
      alert('Nome e categoria são obrigatórios');
      return;
    }
    createOrUpdateProductMutation.mutate(editData);
  };

  const handleDelete = (productId) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setEditData({
          ...editData,
          images: [...editData.images, file_url]
        });
        alert('✅ Imagem adicionada!');
      } catch (error) {
        alert('Erro ao fazer upload: ' + error.message);
      }
    }
  };

  const removeImage = (index) => {
    const newImages = editData.images.filter((_, i) => i !== index);
    setEditData({ ...editData, images: newImages });
  };

  const filteredProducts = products?.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Produtos</h2>
          <p className="text-slate-600">{filteredProducts.length} produtos encontrados</p>
        </div>
        <Button
          onClick={() => {
            setShowNewProduct(true);
            setEditingProduct(null);
            setEditData({
              name: '', price: 0, category: '', type: 'Físico', 
              description: '', short_description: '', images: [], 
              is_active: true, stock: 0
            });
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-10 border-slate-300"
          />
        </div>
      </Card>

      {/* Formulário de Edição/Criação */}
      {showNewProduct && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewProduct(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Nome</label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Preço (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.price}
                  onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value)})}
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Categoria</label>
                <Input
                  value={editData.category}
                  onChange={(e) => setEditData({...editData, category: e.target.value})}
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Estoque</label>
                <Input
                  type="number"
                  value={editData.stock}
                  onChange={(e) => setEditData({...editData, stock: parseInt(e.target.value)})}
                  className="border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição Curta</label>
              <Input
                value={editData.short_description}
                onChange={(e) => setEditData({...editData, short_description: e.target.value})}
                className="border-slate-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Descrição Completa</label>
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                className="border-slate-300 h-32"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Imagens do Produto
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {editData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img} className="w-24 h-24 object-cover rounded border-2 border-slate-300" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editData.is_active}
                  onChange={(e) => setEditData({...editData, is_active: e.target.checked})}
                />
                <span className="text-sm">Produto Ativo</span>
              </label>
              <select
                value={editData.type}
                onChange={(e) => setEditData({...editData, type: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="Físico">Físico</option>
                <option value="Digital">Digital</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNewProduct(false)}
                className="border-slate-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createOrUpdateProductMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Produto
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="bg-white border-slate-200 p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum produto encontrado</p>
          </Card>
        ) : (
          filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card className="bg-white border-slate-200 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-900">{product.name}</p>
                      {product.is_active !== false ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <span className="font-bold text-purple-600">
                        R$ {product.price?.toFixed(2)}
                      </span>
                      <span>Estoque: {product.stock || 0}</span>
                      <span className="text-xs text-slate-500">
                        {product.sales_count || 0} vendas
                      </span>
                      <span className="text-xs text-slate-500">
                        {product.images?.length || 0} imagens
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(product)}
                      className="border-slate-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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