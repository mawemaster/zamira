import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Send, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreatePollModal({ user, onClose, onSubmit, isLoading }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState("24");
  const [category, setCategory] = useState("geral");
  const [shareToFeed, setShareToFeed] = useState(true);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!question.trim()) return;
    
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) return;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(duration));

    onSubmit({
      question: question.trim(),
      options: validOptions.map((text, index) => ({
        id: `opt_${index}`,
        text: text.trim(),
        votes: 0
      })),
      expires_at: expiresAt.toISOString(),
      category,
      shared_to_feed: shareToFeed
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Criar Enquete</h3>
                  <p className="text-sm text-gray-400">Pergunte à comunidade</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2">
                  Sua Pergunta
                </label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Qual é a sua pergunta?"
                  className="bg-slate-800 border-purple-900/30 text-white placeholder:text-gray-400 h-20"
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {question.length} / 200
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-purple-300">
                    Opções de Resposta
                  </label>
                  {options.length < 6 && (
                    <Button
                      onClick={addOption}
                      size="sm"
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="bg-slate-800 border-purple-900/30 text-white placeholder:text-gray-400"
                        maxLength={100}
                      />
                      {options.length > 2 && (
                        <Button
                          onClick={() => removeOption(index)}
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Duração
                  </label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-900/30">
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="6">6 horas</SelectItem>
                      <SelectItem value="12">12 horas</SelectItem>
                      <SelectItem value="24">1 dia</SelectItem>
                      <SelectItem value="72">3 dias</SelectItem>
                      <SelectItem value="168">1 semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-300 mb-2">
                    Categoria
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-slate-800 border-purple-900/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-900/30">
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="tarot">Tarot</SelectItem>
                      <SelectItem value="astrologia">Astrologia</SelectItem>
                      <SelectItem value="espiritualidade">Espiritualidade</SelectItem>
                      <SelectItem value="comunidade">Comunidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                <input
                  type="checkbox"
                  id="shareToFeed"
                  checked={shareToFeed}
                  onChange={(e) => setShareToFeed(e.target.checked)}
                  className="w-5 h-5 rounded border-purple-500/50 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="shareToFeed" className="text-sm text-purple-200 cursor-pointer">
                  Compartilhar esta enquete no feed da comunidade
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-purple-900/30 text-purple-300 hover:bg-purple-900/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!question.trim() || options.filter(o => o.trim()).length < 2 || isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Publicar Enquete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}