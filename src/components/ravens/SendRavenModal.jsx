import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SendRavenModal({ isOpen, onClose, currentUser, recipient }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  if (!currentUser || !recipient) return null;

  const sendRavenMutation = useMutation({
    mutationFn: async (ravenData) => {
      const raven = await base44.entities.Raven.create(ravenData);
      return raven;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ravens'] });
      toast.success("🦅 Corvo enviado com sucesso!");
      setMessage("");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao enviar corvo");
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;

    sendRavenMutation.mutate({
      sender_id: currentUser.id,
      sender_name: currentUser.display_name || currentUser.full_name || 'Viajante',
      sender_avatar: currentUser.avatar_url || '',
      recipient_id: recipient.id,
      recipient_name: recipient.display_name || recipient.full_name || 'Viajante',
      recipient_avatar: recipient.avatar_url || '',
      message: message.trim()
    });
  };

  const recipientName = recipient.display_name || recipient.full_name || 'Viajante';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full border border-purple-500/30 overflow-hidden"
          >
            <div className="p-6 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4332b5385_corvo.png" 
                    alt="Corvo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Enviar um Corvo</h3>
                  <p className="text-sm text-gray-400">Para: {recipientName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-300 text-sm mb-4">
                Um corvo místico levará sua mensagem até {recipientName}. 
                Escreva com sabedoria, pois corvos carregam energias poderosas.
              </p>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva sua mensagem aqui..."
                className="bg-slate-800 border-purple-900/30 text-white min-h-[150px] mb-4"
                maxLength={500}
              />
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{message.length}/500</span>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendRavenMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {sendRavenMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Corvo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}