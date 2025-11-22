import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function TestimonialModal({ isOpen, onClose, profileUser, currentUser }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Escreva seu depoimento");
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.ProfileTestimonial.create({
        profile_user_id: profileUser.id,
        profile_user_name: profileUser.display_name || profileUser.full_name,
        author_id: currentUser.id,
        author_name: currentUser.display_name || currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        content: content.trim(),
        status: "pending"
      });

      await base44.entities.Notification.create({
        user_id: profileUser.id,
        type: "announcement",
        title: "📝 Novo Depoimento!",
        message: `${currentUser.display_name || currentUser.full_name} deixou um depoimento no seu perfil aguardando aprovação`,
        from_user_id: currentUser.id,
        from_user_name: currentUser.display_name || currentUser.full_name,
        from_user_avatar: currentUser.avatar_url,
        action_url: "/MinhaConta"
      });

      toast.success("Depoimento enviado! Aguardando aprovação.");
      setContent("");
      onClose();
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao enviar depoimento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl"
          >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  Deixar Depoimento
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Escreva um depoimento sobre <strong className="text-white">{profileUser.display_name || profileUser.full_name}</strong>. 
                Ele precisará aprovar antes de aparecer no perfil.
              </p>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compartilhe sua experiência com este viajante místico..."
                className="bg-slate-800 border-purple-900/30 text-white h-32 mb-4"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mb-4">{content.length}/500</p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-purple-900/30 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}