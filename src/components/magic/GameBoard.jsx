import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Shield, Swords, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MagicCard from "./MagicCard";

const PHASES = [
  { id: "manutencao", label: "Manutenção", color: "bg-slate-600" },
  { id: "compra", label: "Compra", color: "bg-blue-600" },
  { id: "principal1", label: "Principal 1", color: "bg-purple-600" },
  { id: "combate_inicio", label: "Combate", color: "bg-red-600" },
  { id: "principal2", label: "Principal 2", color: "bg-purple-600" },
  { id: "final", label: "Final", color: "bg-slate-600" }
];

export default function GameBoard({ match, currentPlayer, onAction }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [attackers, setAttackers] = useState([]);
  const [blockers, setBlockers] = useState({});

  const isMyTurn = match.current_turn === currentPlayer.id;
  const myField = match.game_state?.battlefield?.[`player${match.player1_id === currentPlayer.id ? '1' : '2'}`] || [];
  const opponentField = match.game_state?.battlefield?.[`player${match.player1_id === currentPlayer.id ? '2' : '1'}`] || [];
  const myHand = match.game_state?.hands?.[`player${match.player1_id === currentPlayer.id ? '1' : '2'}`] || [];

  const myLife = match.player1_id === currentPlayer.id ? match.player1_life : match.player2_life;
  const opponentLife = match.player1_id === currentPlayer.id ? match.player2_life : match.player1_life;
  const opponentName = match.player1_id === currentPlayer.id ? match.player2_name : match.player1_name;

  const handlePlayCard = (card) => {
    if (!isMyTurn || match.phase === 'combate_inicio') return;
    onAction('play_card', { cardId: card.id });
    setSelectedCard(null);
  };

  const handleDeclareAttacker = (cardId) => {
    if (match.phase !== 'combate_declarar_atacantes') return;
    if (attackers.includes(cardId)) {
      setAttackers(attackers.filter(id => id !== cardId));
    } else {
      setAttackers([...attackers, cardId]);
    }
  };

  const handleNextPhase = () => {
    if (match.phase === 'combate_declarar_atacantes' && attackers.length > 0) {
      onAction('declare_attackers', { attackers });
      setAttackers([]);
    } else {
      onAction('next_phase');
    }
  };

  const canPlayCard = (card) => {
    if (!isMyTurn) return false;
    if (card.type === 'instantaneo') return true;
    return match.phase === 'principal1' || match.phase === 'principal2';
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Opponent Area */}
      <div className="p-4 bg-gradient-to-b from-red-900/20 to-transparent border-b border-red-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-white">{opponentName}</p>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-red-300 font-bold">{opponentLife}</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {match.game_state?.libraries?.player2?.length || 0} cartas no deck
          </div>
        </div>

        {/* Opponent Battlefield */}
        <div className="grid grid-cols-6 gap-2 min-h-[100px]">
          {opponentField.map((card, idx) => (
            <MagicCard key={idx} card={card} size="sm" flipped />
          ))}
        </div>
      </div>

      {/* Center Area - Stack & Phase Indicator */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-slate-800/90 px-4 py-2 rounded-full border border-purple-500/50">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold">Turno {match.turn_number || 1}</span>
            <span className="text-xs text-gray-400">•</span>
            {PHASES.map((phase) => (
              <div
                key={phase.id}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  match.phase === phase.id ? phase.color + ' text-white' : 'text-gray-500'
                }`}
              >
                {phase.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stack */}
        {match.stack && match.stack.length > 0 && (
          <div className="bg-purple-900/50 border-2 border-purple-500 rounded-lg p-4">
            <p className="text-xs text-purple-300 mb-2">PILHA</p>
            <div className="space-y-2">
              {match.stack.map((spell, idx) => (
                <div key={idx} className="bg-slate-800 rounded p-2 text-sm">
                  {spell.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Turn Indicator */}
        <div className={`absolute ${isMyTurn ? 'bottom-4' : 'top-4'} right-4`}>
          <div className={`px-4 py-2 rounded-full font-bold ${
            isMyTurn ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            {isMyTurn ? 'SEU TURNO' : 'TURNO DO OPONENTE'}
          </div>
        </div>
      </div>

      {/* My Battlefield */}
      <div className="p-4 bg-gradient-to-t from-blue-900/20 to-transparent border-t border-blue-500/30">
        <div className="grid grid-cols-6 gap-2 mb-3 min-h-[100px]">
          {myField.map((card, idx) => (
            <MagicCard
              key={idx}
              card={card}
              size="sm"
              onClick={() => match.phase === 'combate_declarar_atacantes' && handleDeclareAttacker(card.id)}
              selected={attackers.includes(card.id)}
              canAttack={match.phase === 'combate_declarar_atacantes' && !card.summoning_sickness}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-white">{currentPlayer.display_name || currentPlayer.full_name}</p>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-bold">{myLife}</span>
              </div>
            </div>
          </div>

          {isMyTurn && (
            <Button
              onClick={handleNextPhase}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              Próxima Fase
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Hand */}
      <div className="p-4 bg-slate-950 border-t border-slate-700">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <AnimatePresence>
            {myHand.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MagicCard
                  card={card}
                  onClick={() => canPlayCard(card) && handlePlayCard(card)}
                  disabled={!canPlayCard(card)}
                  size="md"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}