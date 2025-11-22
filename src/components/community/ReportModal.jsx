
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const reportReasons = [
  { id: "spam", label: "Spam ou Conteúdo Irrelevante", emoji: "🚫" },
  { id: "harassment", label: "Assédio ou Bullying", emoji: "😠" },
  { id: "hate_speech", label: "Discurso de Ódio", emoji: "⚠️" },
  { id: "violence", label: "Violência ou Ameaças", emoji: "🔴" },
  { id: "nudity", label: "Nudez ou Conteúdo Sexual", emoji: "🔞" },
  { id: "misinformation", label: "Desinformação", emoji: "❌" },
  { id: "other", label: "Outro Motivo", emoji: "📝" }
];

export default function ReportModal({ isOpen, onClose, post, currentUser }) {
  // Validação essencial
  if (!post?.id || !currentUser?.id) return null;

  const queryClient = useQueryClient();
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id || !post?.id) return;

      await base44.entities.PostReport.create({
        post_id: post.id,
        post_content: post.content,
        post_author_id: post.author_id,
        post_author_name: post.author_name,
        reporter_id: currentUser.id,
        reporter_name: currentUser.display_name || currentUser.full_name,
        reason: selectedReason,
        details: details,
        status: "pending"
      });
    },
    onSuccess: () => {
      toast.success("Denúncia enviada. Nossa equipe irá revisar.");
      onClose();
      setSelectedReason("");
      setDetails("");
    },
    onError: () => {
      toast.error("Erro ao enviar denúncia");
    }
  });

  const handleSubmitReport = () => {
    if (!selectedReason) {
      toast.error("Selecione um motivo");
      return;
    }

    if (!currentUser?.id || !post?.id) {
      toast.error("Erro ao enviar denúncia");
      return;
    }

    reportMutation.mutate(); // No arguments needed, mutationFn captures state
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-red-500/30"
        >
          {/* Header */}
          <div className="p-6 border-b border-red-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                  <Flag className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Denunciar Publicação</h3>
                  <p className="text-sm text-gray-400">Ajude-nos a manter a comunidade segura</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3">
                Por que você está denunciando este post?
              </label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      selectedReason === reason.id
                        ? 'border-red-500 bg-red-900/30'
                        : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reason.emoji}</span>
                      <span className="text-white font-medium">{reason.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">
                Detalhes Adicionais (Opcional)
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Forneça mais informações sobre o problema..."
                maxLength={500}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1">
                {details.length} / 500 caracteres
              </p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">⚠️ Aviso Importante</p>
                  <p className="text-xs">
                    Denúncias falsas ou abusivas podem resultar em penalidades na sua conta. 
                    Use este recurso apenas para reportar violações reais das diretrizes da comunidade.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-red-500/30 bg-slate-900/50">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-600 text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={!selectedReason || reportMutation.isPending}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
              >
                {reportMutation.isPending ? 'Enviando...' : 'Enviar Denúncia'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
