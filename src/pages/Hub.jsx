import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Map, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 space-y-6 pt-6">
      {/* Cabeçalho de Boas Vindas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-2xl font-bold text-white">Portal Místico</h1>
        <p className="text-gray-400 text-sm">
          Seu universo de autoconhecimento começa agora.
        </p>
      </motion.div>

      {/* Card de Status */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-24 h-24 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Sua Jornada</h2>
        <p className="text-gray-300 text-sm mb-4">
          Você está no início. O banco de dados está conectado, mas ainda não temos postagens no feed.
        </p>
        <Button 
          onClick={() => navigate(createPageUrl("Explorar"))}
          className="bg-white text-purple-900 hover:bg-gray-100 w-full"
        >
          <Map className="w-4 h-4 mr-2" />
          Explorar o Mapa
        </Button>
      </motion.div>

      {/* Grid de Ações Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition"
          onClick={() => navigate(createPageUrl("TiragemDiaria"))}
        >
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-pink-400" />
          </div>
          <span className="text-sm font-medium text-gray-200">Tiragem Diária</span>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition"
          onClick={() => navigate(createPageUrl("Chat"))}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-200">Chat Místico</span>
        </motion.div>
      </div>

      {/* Aviso de Construção */}
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
        <p className="text-xs text-yellow-200">
          🚧 <strong>Modo Construção:</strong> Agora precisamos criar as tabelas de "Posts" no Supabase para o feed funcionar de verdade.
        </p>
      </div>
    </div>
  );
}