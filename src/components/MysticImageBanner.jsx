
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Gerar posições aleatórias para os vagalumes
const generateFireflies = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 15 + Math.random() * 10,
    size: 2 + Math.random() * 3,
  }));
};

const fireflies = generateFireflies(20);

export default function MysticImageBanner({ user }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mb-4 md:mb-6"
    >
      {/* 
        Assuming 'Card' is a div with specific styling or a custom component.
        For a fully functioning file without external dependencies not specified,
        this is implemented as a div applying the provided classNames and onClick.
      */}
      <div
        className="relative overflow-hidden border-2 border-cyan-600/50 cursor-pointer hover:scale-[1.01] md:hover:scale-[1.02] transition-transform group"
        onClick={() => navigate(createPageUrl("PortalEntrada"))}
      >
        {/* Container com bordas arredondadas e efeito de brilho */}
        <div className="relative rounded-3xl overflow-hidden">
          {/* Efeito de borda luminosa animada */}
          <div className="absolute inset-0 rounded-3xl z-10 pointer-events-none">
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-500/0 via-purple-400/40 to-purple-500/0 animate-border-flow"
                 style={{
                   backgroundSize: '200% 100%',
                   animation: 'border-glow 6s ease-in-out infinite'
                 }}
            />
          </div>

          {/* Imagem principal */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.5/1] lg:aspect-[3/1] w-full">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4319b264a_paraoplanodeao1.jpg"
              alt="Portal Místico - Clique para acessar a Área do Aluno"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Overlay escuro para destacar os vagalumes */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Vagalumes animados */}
            <div className="absolute inset-0 overflow-hidden">
              {fireflies.map((firefly) => (
                <motion.div
                  key={firefly.id}
                  className="absolute rounded-full bg-yellow-200/80 blur-[1px]"
                  style={{
                    width: `${firefly.size}px`,
                    height: `${firefly.size}px`,
                    left: `${firefly.initialX}%`,
                    top: `${firefly.initialY}%`,
                    boxShadow: '0 0 8px 2px rgba(255, 255, 200, 0.6)',
                  }}
                  animate={{
                    x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
                    y: [0, -50 - Math.random() * 100, -100 - Math.random() * 150, -200],
                    opacity: [0, 0.8, 0.6, 0],
                    scale: [0, 1, 0.8, 0],
                  }}
                  transition={{
                    duration: firefly.duration,
                    delay: firefly.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Gradiente suave no topo e fundo para suavizar as bordas */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-50" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none transition-opacity duration-700 group-hover:opacity-50" />
          </div>

          {/* Efeito de brilho ao passar o mouse */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        </div>
      </div>

      <style jsx>{`
        @keyframes border-glow {
          0%, 100% {
            background-position: 0% 50%;
            opacity: 0.3;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.8;
          }
        }
      `}</style>
    </motion.div>
  );
}
