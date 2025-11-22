import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Code, Plus, Edit2, Trash2, Save, X, Activity, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function TrackingTab() {
  const [editingCode, setEditingCode] = useState(null);
  const [showNewCode, setShowNewCode] = useState(false);
  const [codeData, setCodeData] = useState({
    code_name: "",
    code_type: "head",
    code_content: "",
    is_active: true,
    priority: 0,
    description: ""
  });

  const queryClient = useQueryClient();

  const { data: trackingCodes, isLoading } = useQuery({
    queryKey: ['tracking-codes'],
    queryFn: () => base44.entities.TrackingCode.list("-priority", 100),
  });

  const saveCodeMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCode) {
        return await base44.entities.TrackingCode.update(editingCode.id, data);
      }
      return await base44.entities.TrackingCode.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-codes'] });
      setEditingCode(null);
      setShowNewCode(false);
      setCodeData({
        code_name: "",
        code_type: "head",
        code_content: "",
        is_active: true,
        priority: 0,
        description: ""
      });
      alert('✅ Código de tracking salvo! Atualize a página para aplicar as mudanças.');
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: async (id) => await base44.entities.TrackingCode.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-codes'] });
      alert('✅ Código removido!');
    },
  });

  const handleEdit = (code) => {
    setEditingCode(code);
    setCodeData(code);
    setShowNewCode(true);
  };

  const handleSave = () => {
    if (!codeData.code_name || !codeData.code_content) {
      alert('❌ Preencha o nome e o código');
      return;
    }
    saveCodeMutation.mutate(codeData);
  };

  const codeTypeLabels = {
    head: "HEAD (antes de </head>)",
    body_start: "BODY START (após <body>)",
    body_end: "BODY END (antes de </body>)",
    footer: "FOOTER (final da página)"
  };

  const codeTypeColors = {
    head: "bg-blue-100 text-blue-800",
    body_start: "bg-green-100 text-green-800",
    body_end: "bg-purple-100 text-purple-800",
    footer: "bg-orange-100 text-orange-800"
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tracking & Analytics</h2>
          <p className="text-slate-600">Gerencie pixels, tags e códigos de rastreamento</p>
        </div>
        <Button
          onClick={() => {
            setShowNewCode(true);
            setEditingCode(null);
            setCodeData({
              code_name: "",
              code_type: "head",
              code_content: "",
              is_active: true,
              priority: 0,
              description: ""
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Código
        </Button>
      </div>

      {/* Formulário de Código */}
      {showNewCode && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              {editingCode ? 'Editar Código de Tracking' : 'Novo Código de Tracking'}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setShowNewCode(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome do Código *</label>
                <Input
                  placeholder="ex: Google Analytics, Facebook Pixel"
                  value={codeData.code_name}
                  onChange={(e) => setCodeData({...codeData, code_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Posição do Código *</label>
                <select
                  value={codeData.code_type}
                  onChange={(e) => setCodeData({...codeData, code_type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="head">HEAD (Meta tags, scripts iniciais)</option>
                  <option value="body_start">BODY START (Após abertura do body)</option>
                  <option value="body_end">BODY END (Antes do fechamento do body)</option>
                  <option value="footer">FOOTER (Final da página)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
              <Input
                placeholder="ex: Pixel de conversão para Facebook Ads"
                value={codeData.description}
                onChange={(e) => setCodeData({...codeData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Código HTML/JavaScript *</label>
              <Textarea
                placeholder={`<script>
  // Google Analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;...})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-XXXXX-Y', 'auto');
  ga('send', 'pageview');
</script>`}
                value={codeData.code_content}
                onChange={(e) => setCodeData({...codeData, code_content: e.target.value})}
                rows={10}
                className="font-mono text-xs"
              />
              <p className="text-xs text-slate-600 mt-2">
                💡 Cole o código fornecido pela plataforma de analytics (Google Analytics, Facebook Pixel, etc)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Prioridade (ordem de execução)</label>
                <Input
                  type="number"
                  placeholder="0 (maior número = executa primeiro)"
                  value={codeData.priority}
                  onChange={(e) => setCodeData({...codeData, priority: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={codeData.is_active}
                    onChange={(e) => setCodeData({...codeData, is_active: e.target.checked})}
                  />
                  <span className="text-sm">Código Ativo</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saveCodeMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Código
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewCode(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Códigos Ativos */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          </div>
        ) : trackingCodes && trackingCodes.length > 0 ? (
          trackingCodes.map((code) => (
            <Card key={code.id} className="bg-white border-slate-200 p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900">{code.code_name}</h3>
                    <Badge className={codeTypeColors[code.code_type]}>
                      {codeTypeLabels[code.code_type]}
                    </Badge>
                    {code.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                    <Badge variant="outline">Prioridade: {code.priority}</Badge>
                  </div>
                  {code.description && (
                    <p className="text-sm text-slate-600 mb-2">{code.description}</p>
                  )}
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer hover:text-slate-700">Ver código</summary>
                    <pre className="mt-2 p-3 bg-slate-100 rounded overflow-x-auto">
                      <code>{code.code_content}</code>
                    </pre>
                  </details>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(code)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este código?')) {
                        deleteCodeMutation.mutate(code.id);
                      }
                    }}
                    className="border-red-300 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-white border-slate-200 p-12 text-center">
            <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhum código de tracking configurado</p>
            <Button
              onClick={() => setShowNewCode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Código
            </Button>
          </Card>
        )}
      </div>

      {/* Exemplos Comuns */}
      <Card className="bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200 p-6">
        <h4 className="font-bold text-slate-900 mb-4">📌 Exemplos Comuns de Códigos de Tracking:</h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-blue-600">Google Analytics (GA4):</strong>
            <p className="text-xs text-slate-600 mt-1">Posição: HEAD • Rastreia pageviews e eventos</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-blue-600">Facebook Pixel:</strong>
            <p className="text-xs text-slate-600 mt-1">Posição: HEAD • Rastreia conversões do Facebook Ads</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-blue-600">Google Tag Manager:</strong>
            <p className="text-xs text-slate-600 mt-1">Posição: BODY START + BODY END • Container de tags</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <strong className="text-blue-600">Hotjar / Clarity:</strong>
            <p className="text-xs text-slate-600 mt-1">Posição: HEAD • Gravação de sessões e heatmaps</p>
          </div>
        </div>
      </Card>

      {/* Aviso */}
      <Card className="bg-orange-50 border-orange-200 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-orange-900">
              <strong>⚠️ Importante:</strong> Os códigos de tracking são inseridos automaticamente em todas as páginas do site. 
              Certifique-se de que o código está correto antes de ativar. Códigos malformados podem quebrar o site.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}