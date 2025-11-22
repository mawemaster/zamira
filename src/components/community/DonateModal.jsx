import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Heart, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const presetAmounts = [5, 10, 25, 50, 100, 250];

export default function DonateModal({ isOpen, onClose, post, currentUser, onDonate }) {
  // Validação essencial
  if (!post?.id || !currentUser?.id) return null;

  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleDonate = () => {
    if (!currentUser?.id || !post?.id) return;

    const donationAmount = parseInt(amount);

    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast.error("Digite uma quantidade válida!");
      return;
    }

    if ((currentUser.ouros || 0) < donationAmount) {
      toast.error("Você não tem Ouros suficientes");
      return;
    }

    if (donationAmount < 1) {
      toast.error("A doação mínima é de 1 Ouro");
      return;
    }

    if (post.author_id === currentUser.id) {
      toast.error("Você não pode doar para si mesmo!");
      return;
    }

    onDonate({
      amount: donationAmount,
      message: message.trim() || null
    });

    onClose();
    setAmount(5);
    setMessage("");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900 border-yellow-500/30 overflow-hidden">
            <div className="p-6 border-b border-yellow-500/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    💰 Doar Ouros
                  </h2>
                  <p className="text-yellow-300 text-sm">
                    Apoie este post com Ouros
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-yellow-400">
                <Coins className="w-5 h-5" />
                <span className="font-bold">{currentUser.ouros || 0} Ouros disponíveis</span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">
                  Valores Rápidos
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`px-4 py-3 rounded-lg border-2 transition font-bold ${
                        Number(amount) === preset
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500 border-yellow-400 text-white shadow-lg shadow-yellow-500/50'
                          : 'bg-slate-800 border-yellow-900/30 text-yellow-400 hover:bg-slate-700'
                      }`}
                    >
                      {preset} 💰
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Quantidade Personalizada
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Digite a quantidade..."
                    min="1"
                    max={currentUser.ouros || 0}
                    className="bg-slate-800 border-yellow-900/30 text-white placeholder:text-gray-400 pl-10"
                  />
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400 pointer-events-none" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Mensagem (Opcional)
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Deixe uma mensagem de apoio..."
                  maxLength={200}
                  className="bg-slate-800 border-yellow-900/30 text-white placeholder:text-gray-400"
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {message.length} / 200 caracteres
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-yellow-500/30 text-yellow-300 hover:bg-yellow-900/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDonate}
                  disabled={!amount || Number(amount) <= 0}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Doar {amount || 0} Ouros
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}