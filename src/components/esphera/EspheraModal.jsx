import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Crown, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EspheraModal({ isOpen, onClose, user }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedFree, setHasAskedFree] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.esphera_free_question_used) {
      setHasAskedFree(true);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [answer]);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error("Digite sua pergunta");
      return;
    }

    // Se já usou a pergunta grátis e não tem ouros
    if (hasAskedFree && (!user.ouros || user.ouros < 10)) {
      toast.error("Você precisa de 10 Ouros ou uma assinatura para mais perguntas");
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('espheraChat', {
        question: question,
        userId: user.id
      });

      if (response.data.success) {
        setAnswer(response.data.answer);

        // Se não tinha usado a pergunta grátis, marcar como usado
        if (!hasAskedFree) {
          await base44.auth.updateMe({ esphera_free_question_used: true });
          setHasAskedFree(true);
        } else {
          // Cobrar 10 ouros
          await base44.auth.updateMe({ ouros: (user.ouros || 0) - 10 });
          toast.success("10 Ouros debitados");
        }
      } else {
        toast.error(response.data.error || "Erro ao consultar Esphera");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao consultar Esphera");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            <Card className="bg-gradient-to-br from-purple-900/40 via-slate-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-xl">
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Eye className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                      Esphera AI
                      <Crown className="w-5 h-5 text-yellow-400" />
                    </h2>
                    <p className="text-xs md:text-sm text-purple-200">
                      Sua Taróloga e Conselheira IA
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm text-white">
                    {!hasAskedFree ? (
                      <p>
                        <strong>Primeira pergunta GRÁTIS!</strong> Perguntas adicionais custam 10 Ouros cada ou você pode ter{" "}
                        <button
                          onClick={() => navigate(createPageUrl("EspheraAI"))}
                          className="text-yellow-300 underline font-bold hover:text-yellow-200"
                        >
                          acesso ilimitado com assinatura
                        </button>
                      </p>
                    ) : (
                      <p>
                        Cada pergunta custa <strong>10 Ouros</strong> ou tenha{" "}
                        <button
                          onClick={() => navigate(createPageUrl("EspheraAI"))}
                          className="text-yellow-300 underline font-bold hover:text-yellow-200"
                        >
                          acesso ilimitado com assinatura
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="p-4 md:p-6 max-h-[50vh] overflow-y-auto space-y-4">
                {answer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 rounded-2xl p-4 md:p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-purple-200 font-semibold mb-1">Esphera AI</p>
                          <p className="text-white text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                            {answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 md:p-6 border-t border-purple-500/30">
                <div className="space-y-3">
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Faça sua pergunta para Esphera... (Ex: O que o Tarot revela sobre meu futuro profissional?)"
                    className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-gray-400 min-h-[100px] resize-none text-sm md:text-base"
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">
                      {hasAskedFree ? "10 Ouros por pergunta" : "Primeira pergunta grátis"}
                    </p>
                    <Button
                      onClick={handleAsk}
                      disabled={isLoading || !question.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Consultando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Perguntar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}