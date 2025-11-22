import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Swords, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  "Tarot",
  "Astrologia",
  "Numerologia",
  "Cristais",
  "Magia",
  "Filosofia Mística"
];

export default function CreateDuelModal({ user, onClose, onSubmit, isLoading }) {
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [argument, setArgument] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!category || !question.trim() || !argument.trim()) {
      return;
    }

    // Escolher oponente aleatório (simulação - você pode melhorar isso)
    const opponents = [
      {
        id: "opponent_1",
        name: "Luz Interior",
        avatar: "https://i.pravatar.cc/150?img=1",
        level: 42,
        archetype: "guardiao_astral",
        argument: "Representa uma revelação súbita e chocante que destrói as nossas percepções atuais. É um 'despertar' forçado pelo universo, que nos obriga a abandonar o que não é mais sustentável em nossa vida."
      },
      {
        id: "opponent_2",
        name: "Viajante Cósmico",
        avatar: "https://i.pravatar.cc/150?img=8",
        level: 35,
        archetype: "navegador_cosmico",
        argument: "É sobre a necessidade de desconstrução para permitir nova construção. Representa o fim de ilusões e a chance de recomeçar com bases mais sólidas."
      }
    ];

    const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];

    onSubmit({
      category,
      question,
      challenger_argument: argument,
      opponent_id: randomOpponent.id,
      opponent_name: randomOpponent.name,
      opponent_avatar: randomOpponent.avatar,
      opponent_level: randomOpponent.level,
      opponent_archetype: randomOpponent.archetype,
      opponent_argument: randomOpponent.argument
    });
  };

  const isFormValid = category && question.trim() && argument.trim();

  return (
    <AnimatePresence>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-[#131128] border-purple-400/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-yellow-300 flex items-center gap-3">
              <Swords className="w-8 h-8" />
              Lançar um Duelo
            </DialogTitle>
            <p className="text-gray-400 mt-2">
              Proponha uma questão, apresente seu argumento e convide a comunidade para o debate.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Categoria */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Categoria da Batalha
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-800 border-purple-400/30 text-white">
                  <SelectValue placeholder="Selecione a arena do conhecimento" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-purple-400/30">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Questão */}
            <div>
              <label className="block text-white font-semibold mb-2">
                A Questão do Duelo
              </label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Qual o significado mais profundo da carta 'A Torre'?"
                className="bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Argumento */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Seu Argumento Inicial
              </label>
              <Textarea
                value={argument}
                onChange={(e) => setArgument(e.target.value)}
                placeholder="Defenda seu ponto de vista com sabedoria e clareza..."
                className="bg-slate-800 border-purple-400/30 text-white placeholder:text-gray-500 min-h-[150px] resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-purple-400/30 text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Swords className="w-5 h-5 mr-2" />
                {isLoading ? 'Lançando...' : 'Lançar Desafio na Arena'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}