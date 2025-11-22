import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminGlobalMessage({ user }) {
  const [currentMessage, setCurrentMessage] = useState(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-global-messages', user?.id],
    queryFn: async () => {
      const msgs = await base44.entities.AdminGlobalMessage.filter(
        { is_active: true },
        "-created_date",
        1
      );
      return msgs;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const markAsShownMutation = useMutation({
    mutationFn: async (messageId) => {
      const msg = await base44.entities.AdminGlobalMessage.update(messageId, {
        is_active: false
      });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-global-messages'] });
    }
  });

  useEffect(() => {
    if (messages && messages.length > 0 && messages[0]) {
      const msg = messages[0];
      
      // Se for SYSTEM_RELOAD, fazer reload imediato
      if (msg.message === 'SYSTEM_RELOAD') {
        markAsShownMutation.mutate(msg.id);
        
        // Limpar cache e recarregar
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        setTimeout(() => {
          window.location.reload(true);
        }, 1000);
        return;
      }

      setCurrentMessage(msg);
      
      const timer = setTimeout(() => {
        setCurrentMessage(null);
        markAsShownMutation.mutate(msg.id);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {currentMessage && currentMessage.message !== 'SYSTEM_RELOAD' && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-4 border-2 border-white/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1">📢 Mensagem da Administração</h3>
                <p className="text-white/90 text-sm">{currentMessage.message}</p>
              </div>

              <Button
                onClick={() => {
                  setCurrentMessage(null);
                  markAsShownMutation.mutate(currentMessage.id);
                }}
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}