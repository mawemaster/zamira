import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Smartphone, Sparkles, Bell, Zap, Download, ArrowDown } from "lucide-react";

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone || 
                      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);
    
    if (standalone) {
      console.log('App já está instalado! ✅');
      return;
    }

    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Verificar se já mostrou hoje
    const lastShown = localStorage.getItem('pwa-install-prompt-shown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      console.log('Prompt já mostrado hoje');
      return;
    }

    // Verificar se usuário já recusou permanentemente
    if (localStorage.getItem('pwa-install-never') === 'true') {
      console.log('Usuário optou por nunca mostrar');
      return;
    }

    // Listener para evento de instalação (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt disparado! ✅');
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar prompt após 5 segundos
      setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem('pwa-install-prompt-shown', today);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS, mostrar após 5 segundos
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem('pwa-install-prompt-shown', today);
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Listener para quando o app é instalado
    window.addEventListener('appinstalled', (evt) => {
      console.log('App instalado com sucesso! 🎉');
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDownload = async () => {
    if (isIOS) {
      // Para iOS, rolar para baixo e destacar instruções
      document.getElementById('ios-instructions')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (deferredPrompt) {
      // Android/Chrome - Disparar instalação nativa
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar`);
        
        if (outcome === 'accepted') {
          console.log('PWA instalado com sucesso! 🎉');
          localStorage.setItem('pwa-installed', 'true');
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('Erro ao instalar:', error);
      }
    } else {
      // Fallback para navegadores que não suportam
      alert('Para baixar o app:\n\n1. Toque no menu do navegador (⋮)\n2. Selecione "Instalar app" ou "Adicionar à tela inicial"');
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  const handleNeverShow = () => {
    localStorage.setItem('pwa-install-never', 'true');
    setShowPrompt(false);
  };

  const handleLater = () => {
    localStorage.removeItem('pwa-install-prompt-shown');
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 border-2 border-purple-500/50 p-6 relative overflow-hidden shadow-2xl">
            {/* Efeitos de fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-500/10" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-3xl" />
            
            {/* Animação de brilho */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Botão Fechar */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-purple-950/50 hover:bg-purple-950 flex items-center justify-center transition z-10"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>

            {/* Conteúdo */}
            <div className="relative z-10">
              {/* Ícone */}
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl"
                >
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png"
                    alt="Zamira"
                    className="w-16 h-16 object-contain"
                  />
                </motion.div>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Baixe o App Zamira! 📱✨
              </h2>
              <p className="text-purple-200 text-center mb-6 text-sm">
                Instale agora e tenha acesso instantâneo ao portal místico
              </p>

              {/* Benefícios */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 bg-purple-950/30 p-3 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Notificações Mágicas</p>
                    <p className="text-purple-200 text-xs">Alertas de posts, mensagens e eventos cósmicos</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-purple-950/30 p-3 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-pink-600/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-pink-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Acesso Ultra-Rápido</p>
                    <p className="text-purple-200 text-xs">Abra instantaneamente sem navegador</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-purple-950/30 p-3 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">Experiência Imersiva</p>
                    <p className="text-purple-200 text-xs">Tela cheia sem distrações</p>
                  </div>
                </div>
              </div>

              {/* Botão de Download Principal */}
              {!isIOS && deferredPrompt && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold h-14 text-lg shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
                  >
                    <Download className="w-6 h-6 mr-2 animate-bounce" />
                    Baixar App Agora
                  </Button>
                </motion.div>
              )}

              {/* iOS ou Fallback */}
              {isIOS ? (
                <div className="space-y-3">
                  <div id="ios-instructions" className="bg-purple-950/50 p-4 rounded-lg border-2 border-purple-500/30">
                    <p className="text-white text-sm mb-3 font-semibold flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-green-400" />
                      Siga estes passos para baixar:
                    </p>
                    <ol className="text-purple-200 text-xs space-y-2 list-decimal list-inside">
                      <li className="pl-2">
                        Toque no botão <strong className="text-white">Compartilhar</strong> 
                        <span className="inline-block mx-1 px-1.5 py-0.5 bg-purple-700/50 rounded text-[10px]">↑</span> 
                        (na barra inferior do Safari)
                      </li>
                      <li className="pl-2">
                        Role para baixo e toque em <strong className="text-white">"Adicionar à Tela de Início"</strong>
                      </li>
                      <li className="pl-2">
                        Toque em <strong className="text-white">"Adicionar"</strong> no canto superior direito
                      </li>
                      <li className="pl-2 text-green-300">
                        ✨ Pronto! O Zamira estará na sua tela inicial
                      </li>
                    </ol>
                  </div>
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold h-12"
                  >
                    Entendi, vou baixar!
                  </Button>
                  <button
                    onClick={handleLater}
                    className="w-full text-purple-300 hover:text-purple-200 text-sm"
                  >
                    Lembrar amanhã
                  </button>
                </div>
              ) : !deferredPrompt ? (
                <div className="space-y-3">
                  <div className="bg-purple-950/50 p-4 rounded-lg border-2 border-purple-500/30">
                    <p className="text-white text-sm mb-2 font-semibold">
                      📱 Como baixar:
                    </p>
                    <ol className="text-purple-200 text-xs space-y-1.5 list-decimal list-inside">
                      <li>Toque no menu do navegador (⋮ ou ☰)</li>
                      <li>Selecione "Instalar app" ou "Adicionar à tela inicial"</li>
                      <li>Confirme a instalação</li>
                    </ol>
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold h-12"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Ver Instruções
                  </Button>
                  <button
                    onClick={handleLater}
                    className="w-full text-purple-300 hover:text-purple-200 text-sm"
                  >
                    Lembrar amanhã
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleLater}
                    variant="outline"
                    className="w-full border-purple-400 text-purple-200 hover:bg-purple-900/30 h-11"
                  >
                    Lembrar amanhã
                  </Button>
                </div>
              )}

              <button
                onClick={handleNeverShow}
                className="w-full text-purple-400 hover:text-purple-300 text-xs mt-3"
              >
                Não mostrar novamente
              </button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}