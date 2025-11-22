import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

export default function AppUpdateNotifier() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Verificar atualizações a cada 5 minutos
      setInterval(() => {
        reg.update();
      }, 5 * 60 * 1000);

      // Listener para quando há uma nova versão esperando
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nova versão disponível! 🚀');
            setShowUpdate(true);
          }
        });
      });
    });

    // Listener para quando o service worker está controlando
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Enviar mensagem para o service worker trocar para a nova versão
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md"
        >
          <Card className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 border-2 border-purple-400/50 p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">Nova Versão Disponível! ✨</h3>
                <p className="text-purple-100 text-xs">
                  Atualize para ter as últimas melhorias místicas
                </p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-white text-purple-600 hover:bg-purple-50 h-8 text-xs font-bold"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Atualizar
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 text-xs"
                >
                  Depois
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}