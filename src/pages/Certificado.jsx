
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Award, Download, Share2, Wand2, Loader2,
  AlertCircle, CheckCircle, Coins, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const TEMPLATE_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/e104515a7_asfsafasfasfa.png";

export default function CertificadoPage() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Preencher com o nome do usuário por padrão
      if (!currentUser.tarot_certificate_url && currentUser.display_name) {
        setUserName(currentUser.display_name);
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const generateMutation = useMutation({
    mutationFn: async ({ name, isRegenerate }) => {
      const response = await base44.functions.invoke('generateCertificate', {
        userName: name,
        isRegenerate
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
      loadUser();
      alert(data.message || '✨ Certificado gerado com sucesso!');
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Erro ao gerar certificado');
    }
  });

  const handleGenerate = () => {
    if (!userName.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }

    if (userName.length > 30) {
      alert('O nome deve ter no máximo 30 caracteres');
      return;
    }

    generateMutation.mutate({ name: userName, isRegenerate: false });
  };

  const handleRegenerate = () => {
    if (!userName.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }

    if (userName.length > 30) {
      alert('O nome deve ter no máximo 30 caracteres');
      return;
    }

    if (!user.ouros || user.ouros < 500) {
      alert('❌ Saldo insuficiente! Você precisa de 500 ouros para reforjar o certificado.');
      return;
    }

    const confirm = window.confirm(
      `🔮 Deseja realmente reforjar seu certificado?\n\n` +
      `Custo: 500 ouros\n` +
      `Saldo atual: ${user.ouros} ouros\n\n` +
      `Novo nome: ${userName}`
    );

    if (confirm) {
      generateMutation.mutate({ name: userName, isRegenerate: true });
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(user.tarot_certificate_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado_portal_tarot_${user.display_name || 'usuario'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      alert('✅ Certificado baixado com sucesso!');
    } catch (error) {
      alert('❌ Erro ao baixar certificado');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleShareToFeed = async () => {
    try {
      const newPost = await base44.entities.Post.create({
        author_id: user.id,
        author_name: user.display_name || user.full_name,
        author_username: user.username || user.id,
        author_avatar: user.avatar_url,
        author_level: user.level || 1,
        author_archetype: user.archetype || 'none',
        content: `Ritual concluído! 🎓✨\n\nConcluí a minha jornada no Portal Tarot e cravei o meu nome no pergaminho sagrado! 🔮📜\n\n#PortalTarot #Certificação #Tarologia`,
        images: [user.tarot_certificate_url],
        reactions: {
          inspirador: 0,
          mistico: 0,
          gratidao: 0,
          poderoso: 0,
          curativo: 0
        },
        reactions_by_user: {},
        comments_count: 0,
        shares_count: 0
      });

      // XP por post
      await base44.auth.updateMe({
        xp: (user.xp || 0) + 5
      });

      setShowShareModal(false);
      alert('✅ Certificado compartilhado no feed!');
      navigate(createPageUrl('Hub'));
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('❌ Erro ao compartilhar no feed');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const hasCertificate = !!user.tarot_certificate_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl("AreaDoAluno"))}
          variant="ghost"
          className="text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Área do Aluno
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Certificado de Mestria
          </h1>
          <p className="text-slate-400">
            Consagre seu nome no pergaminho sagrado do Portal Tarot
          </p>
        </motion.div>

        {/* Estado A: Primeira Consagração */}
        {!hasCertificate ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-purple-500/30 p-6">
              <div className="text-center mb-6">
                <img
                  src={TEMPLATE_IMAGE}
                  alt="Certificado Base"
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl border-2 border-purple-500/30"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Digite o seu nome completo para a consagração:
                  </label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={30}
                    placeholder="Seu nome aqui..."
                    className="bg-slate-800 border-purple-500/30 text-white text-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {userName.length}/30 caracteres
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !userName.trim()}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-4 text-base font-bold"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cravando nome...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      ✨ Cravar Nome (Grátis)
                    </>
                  )}
                </Button>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-200">
                      <p className="font-medium mb-1">📜 Informações importantes:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Seu certificado será único e personalizado</li>
                        <li>A primeira consagração é totalmente GRATUITA</li>
                        <li>Alterações futuras custarão 500 ouros</li>
                        <li>Você poderá compartilhar no feed e exibir no perfil</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Estado B: Certificado Consagrado */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-yellow-500/30 p-6">
              <div className="text-center mb-6">
                <div className="inline-block p-1 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg">
                  <img
                    src={user.tarot_certificate_url}
                    alt="Seu Certificado"
                    className="w-full max-w-2xl rounded-lg shadow-2xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/20 text-sm py-2.5"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fazer Download
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/20 text-sm py-2.5"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partilhar no Feed
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-300 mb-2">
                    Deseja reforjar seu certificado?
                  </h3>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    maxLength={30}
                    placeholder="Novo nome..."
                    className="bg-slate-800 border-purple-500/30 text-white mb-2"
                  />
                  <p className="text-xs text-slate-500 mb-3">
                    {userName.length}/30 caracteres
                  </p>

                  <Button
                    onClick={handleRegenerate}
                    disabled={generateMutation.isPending || !userName.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs py-2.5"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        Reforjando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 mr-1.5" />
                        Reforjar Nome (500 Ouros)
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-200">
                      <p className="font-medium mb-1">🎉 Parabéns!</p>
                      <p className="text-xs">
                        Você completou sua jornada no Portal Tarot. Seu certificado
                        estará visível no seu perfil para todos verem!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modal de Compartilhamento */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-purple-500/50 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-purple-400" />
                Compartilhar no Feed
              </h3>

              <p className="text-slate-300 mb-6">
                Seu certificado será publicado com a seguinte mensagem:
              </p>

              <Card className="bg-slate-800/50 border-purple-500/30 p-4 mb-6">
                <p className="text-sm text-white leading-relaxed">
                  Ritual concluído! 🎓✨<br /><br />
                  Concluí a minha jornada no Portal Tarot e cravei o meu nome no pergaminho sagrado! 🔮📜<br /><br />
                  #PortalTarot #Certificação #Tarologia
                </p>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowShareModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleShareToFeed}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
