import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Coins, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const quickAmounts = [1, 5, 10, 25, 50, 100];

export default function DonateModal({ recipientUser, currentUser, onClose, isOpen }) {
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const donateMutation = useMutation({
    mutationFn: async (donationAmount) => {
      const userOuros = currentUser.ouros || 0;
      
      if (userOuros < donationAmount) {
        throw new Error("Ouros insuficientes");
      }

      await base44.auth.updateMe({
        ouros: userOuros - donationAmount
      });

      const targetOuros = recipientUser.ouros || 0;
      await base44.asServiceRole.entities.User.update(recipientUser.id, {
        ouros: targetOuros + donationAmount
      });

      await base44.entities.Notification.create({
        user_id: recipientUser.id,
        type: "announcement",
        title: "Doação Recebida! 🎁",
        message: `${currentUser.display_name || currentUser.full_name || 'Alguém'} doou ${donationAmount} Ouros para você`,
        from_user_id: currentUser.id,
        from_user_name: currentUser.display_name || currentUser.full_name || 'Viajante',
        from_user_avatar: currentUser.avatar_url || ''
      });
    },
    onSuccess: () => {
      toast.success("Doação realizada com sucesso! ✨");
      queryClient.invalidateQueries({ queryKey: ['user'] });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao realizar doação");
    }
  });

  const handleDonate = () => {
    const donationAmount = parseInt(amount);
    if (donationAmount > 0) {
      donateMutation.mutate(donationAmount);
    }
  };

  if (!currentUser || !recipientUser || !isOpen) return null;

  const recipientName = recipientUser.display_name || recipientUser.full_name || 'Viajante';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center mb-3">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-yellow-300 mb-1">
                  Doar Ouros
                </h3>
                <p className="text-sm text-gray-400">
                  Envie energia para {recipientName}
                </p>
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

            <div className="mb-6 p-4 bg-slate-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Seu saldo</p>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-300">
                  {currentUser.ouros || 0}
                </span>
                <span className="text-gray-400">Ouros</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickAmounts.map(qty => (
                <button
                  key={qty}
                  onClick={() => setAmount(qty.toString())}
                  className={`p-3 rounded-lg border-2 transition ${
                    amount === qty.toString()
                      ? 'border-yellow-500 bg-yellow-900/30'
                      : 'border-purple-900/30 hover:border-purple-700/50'
                  }`}
                >
                  <span className="text-xl font-bold text-white">{qty}</span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Ou digite um valor
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                min="1"
                className="bg-slate-800 border-purple-900/30 text-gray-200 text-center text-xl"
              />
            </div>

            <Button
              onClick={handleDonate}
              disabled={!amount || parseInt(amount) <= 0 || donateMutation.isPending}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-lg py-6"
            >
              {donateMutation.isPending ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Confirmar Doação
                </>
              )}
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}