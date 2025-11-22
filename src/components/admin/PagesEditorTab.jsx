import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileCode, Edit3, Save, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EXISTING_PAGES = [
  { name: "Hub", path: "pages/Hub.js" },
  { name: "Explorar", path: "pages/Explorar.js" },
  { name: "Chat", path: "pages/Chat.js" },
  { name: "MinhaConta", path: "pages/MinhaConta.js" },
  { name: "Arquetipo", path: "pages/Arquetipo.js" },
  { name: "Portais", path: "pages/Portais.js" },
  { name: "ArenaHub", path: "pages/ArenaHub.js" },
  { name: "Loja", path: "pages/Loja.js" },
  { name: "Produto", path: "pages/Produto.js" },
  { name: "Carteira", path: "pages/Carteira.js" },
  { name: "ZamiraCity", path: "pages/ZamiraCity.js" },
  { name: "AreaDoAluno", path: "pages/AreaDoAluno.js" },
  { name: "BibliotecaMistica", path: "pages/BibliotecaMistica.js" },
  { name: "PlannerLunar", path: "pages/PlannerLunar.js" },
  { name: "Notificacoes", path: "pages/Notificacoes.js" },
  { name: "PlanoDeAcao", path: "pages/PlanoDeAcao.js" },
  { name: "Certificado", path: "pages/Certificado.js" },
  { name: "OraculoCombinacoes", path: "pages/OraculoCombinacoes.js" },
];

export default function PagesEditorTab() {
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageContent, setPageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPage = async (page) => {
    setIsLoading(true);
    setSelectedPage(page);
    
    try {
      const response = await fetch(`/${page.path}`);
      const content = await response.text();
      setPageContent(content);
    } catch (error) {
      console.error("Erro ao carregar página:", error);
      setPageContent("// Erro ao carregar conteúdo da página");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePage = async () => {
    if (!selectedPage || !pageContent) return;
    
    setIsSaving(true);
    
    try {
      // Usar a API do Base44 para salvar o arquivo
      const response = await fetch('/api/edit-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: selectedPage.path,
          content: pageContent
        })
      });

      if (response.ok) {
        alert('✅ Página salva com sucesso!');
      } else {
        alert('❌ Erro ao salvar página');
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('❌ Erro ao salvar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Editor de Páginas</h2>
        <p className="text-slate-600">Clique em uma página para editar seu código</p>
      </div>

      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-1 bg-slate-100">
          <TabsTrigger value="existing">
            <FileText className="w-4 h-4 mr-2" />
            Páginas Existentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Dica:</strong> Clique em qualquer página para editar seu código diretamente aqui. As alterações serão salvas instantaneamente.
            </p>
          </div>

          {selectedPage ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="bg-white border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{selectedPage.name}</h3>
                      <p className="text-xs text-slate-600">{selectedPage.path}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSavePage}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Salvar</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedPage(null);
                        setPageContent("");
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Fechar
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600">Carregando código...</p>
                  </div>
                ) : (
                  <div className="relative">
                    <textarea
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      className="w-full h-[600px] p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-lg border-2 border-slate-700 focus:border-purple-500 focus:outline-none"
                      spellCheck="false"
                    />
                    <Badge className="absolute top-2 right-2 bg-slate-800 text-slate-300">
                      JavaScript/JSX
                    </Badge>
                  </div>
                )}
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {EXISTING_PAGES.map((page) => (
                <motion.button
                  key={page.name}
                  onClick={() => handleSelectPage(page)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left"
                >
                  <Card className="bg-white border-slate-200 p-4 hover:border-purple-400 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{page.name}</h3>
                        <p className="text-xs text-slate-600 truncate">{page.path}</p>
                      </div>
                      <Edit3 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    </div>
                  </Card>
                </motion.button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}