import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Edit, Trash, Save, X, Eye, EyeOff, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EnciclopediaTab() {
  const [editingPDF, setEditingPDF] = useState(null);
  const [creatingPDF, setCreatingPDF] = useState(false);
  const [pdfForm, setPdfForm] = useState({});
  const queryClient = useQueryClient();

  const { data: pdfs = [], isLoading } = useQuery({
    queryKey: ['admin-pdfs'],
    queryFn: async () => {
      return await base44.asServiceRole.entities.PDFLibrary.list("-created_date", 500);
    }
  });

  const createPDFMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.asServiceRole.entities.PDFLibrary.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pdfs'] });
      setCreatingPDF(false);
      setPdfForm({});
    }
  });

  const updatePDFMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.asServiceRole.entities.PDFLibrary.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pdfs'] });
      setEditingPDF(null);
      setPdfForm({});
    }
  });

  const deletePDFMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.asServiceRole.entities.PDFLibrary.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pdfs'] });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      return await base44.asServiceRole.entities.PDFLibrary.update(id, { is_active: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pdfs'] });
    }
  });

  const handleStartCreate = () => {
    setCreatingPDF(true);
    setPdfForm({
      title: "",
      description: "",
      pdf_url: "",
      cover_image_url: "",
      category: "outros",
      is_premium: false,
      is_active: true,
      views_count: 0,
      order: 0
    });
  };

  const handleEdit = (pdf) => {
    setEditingPDF(pdf.id);
    setPdfForm(pdf);
  };

  const handleSave = () => {
    if (creatingPDF) {
      createPDFMutation.mutate(pdfForm);
    } else if (editingPDF) {
      updatePDFMutation.mutate({ id: editingPDF, data: pdfForm });
    }
  };

  const handleCancel = () => {
    setEditingPDF(null);
    setCreatingPDF(false);
    setPdfForm({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const PDFForm = () => (
    <Card className="bg-white border-gray-300 p-6 mb-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-700 font-medium mb-2 block">Título do PDF</label>
          <Input
            value={pdfForm.title || ''}
            onChange={(e) => setPdfForm({ ...pdfForm, title: e.target.value })}
            className="bg-gray-50 border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 font-medium mb-2 block">Descrição</label>
          <Textarea
            value={pdfForm.description || ''}
            onChange={(e) => setPdfForm({ ...pdfForm, description: e.target.value })}
            className="bg-gray-50 border-gray-300 text-gray-900 h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 font-medium mb-2 block">Categoria</label>
            <Select
              value={pdfForm.category || 'outros'}
              onValueChange={(value) => setPdfForm({ ...pdfForm, category: value })}
            >
              <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receitas">Receitas</SelectItem>
                <SelectItem value="mundo_holistico">Mundo Holístico</SelectItem>
                <SelectItem value="marketing_digital">Marketing Digital</SelectItem>
                <SelectItem value="saude_mental">Saúde Mental</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium mb-2 block">Ordem de Exibição</label>
            <Input
              type="number"
              value={pdfForm.order || 0}
              onChange={(e) => setPdfForm({ ...pdfForm, order: parseInt(e.target.value) })}
              className="bg-gray-50 border-gray-300 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-700 font-medium mb-2 block">URL do PDF</label>
          <Input
            value={pdfForm.pdf_url || ''}
            onChange={(e) => setPdfForm({ ...pdfForm, pdf_url: e.target.value })}
            placeholder="https://..."
            className="bg-gray-50 border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 font-medium mb-2 block">URL da Capa (opcional)</label>
          <Input
            value={pdfForm.cover_image_url || ''}
            onChange={(e) => setPdfForm({ ...pdfForm, cover_image_url: e.target.value })}
            placeholder="https://..."
            className="bg-gray-50 border-gray-300 text-gray-900"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pdfForm.is_premium || false}
              onChange={(e) => setPdfForm({ ...pdfForm, is_premium: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Exclusivo PRO</span>
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {creatingPDF ? 'Criar PDF' : 'Salvar'}
          </Button>
          <Button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white">
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
          <h2 className="text-2xl font-bold text-gray-900">Enciclopédia - Gerenciador de PDFs</h2>
          <p className="text-gray-600 text-sm">{pdfs.length} PDFs no sistema</p>
        </div>
        <Button onClick={handleStartCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo PDF
        </Button>
      </div>

      {(creatingPDF || editingPDF) && <PDFForm />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pdfs.map((pdf) => (
          <Card key={pdf.id} className="bg-white border-gray-300 p-4 shadow-sm">
            {pdf.cover_image_url && (
              <img src={pdf.cover_image_url} alt={pdf.title} className="w-full h-32 object-cover rounded-lg mb-3" />
            )}
            <h3 className="text-gray-900 font-bold mb-1">{pdf.title}</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className="bg-purple-100 text-purple-800 text-xs">{pdf.category}</Badge>
              {pdf.is_premium && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">PRO</Badge>
              )}
              {!pdf.is_active && (
                <Badge className="bg-red-100 text-red-800 text-xs">Inativo</Badge>
              )}
              <Badge className="bg-gray-100 text-gray-800 text-xs">{pdf.views_count || 0} views</Badge>
            </div>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{pdf.description}</p>
            <div className="flex gap-2">
              <Button onClick={() => handleEdit(pdf)} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                <Edit className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button 
                onClick={() => toggleActiveMutation.mutate({ id: pdf.id, isActive: pdf.is_active })}
                size="sm" 
                className={`${pdf.is_active ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {pdf.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button 
                onClick={() => {
                  if (confirm('Deletar este PDF?')) {
                    deletePDFMutation.mutate(pdf.id);
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