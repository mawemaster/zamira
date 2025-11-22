import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function PortalEntradaPage() {
  const navigate = useNavigate();
  const [isActivated, setIsActivated] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Pré-carregar AreaDoAluno em segundo plano
  useEffect(() => {
    // Preload da página AreaDoAluno
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'prefetch';
    preloadLink.href = createPageUrl("AreaDoAluno");
    document.head.appendChild(preloadLink);

    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);

  const handleClick = () => {
    if (isActivated) return;
    
    setIsActivated(true);
    setShowVideo(true);

    // Tocar áudio após 1 segundo
    setTimeout(() => {
      const audio = new Audio('https://seja-aluno.portaltarot.com.br/wp-content/uploads/2025/02/12231.mp3');
      audio.play();

      // Após 11 segundos (1s delay + 10s de zoom), redirecionar
      setTimeout(() => {
        navigate(createPageUrl("AreaDoAluno"));
      }, 11000);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Vídeo de fundo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center' }}
      >
        <source src="https://seja-aluno.portaltarot.com.br/wp-content/uploads/2025/02/12234.mp4" type="video/mp4" />
      </video>

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Conteúdo principal - Banner clicável */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-4xl w-full"
        >
          <button
            onClick={handleClick}
            disabled={isActivated}
            className="w-full group cursor-pointer disabled:cursor-default"
          >
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/09e54dc3a_O-EREMITA-2.png"
              alt="Comece Aqui - Conheça o Portal Tarot e como usar"
              className="w-full h-auto rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        </motion.div>

        {/* Instruções sutis */}
        {!isActivated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="mt-8 text-center"
          >
            <p className="text-white/70 text-sm md:text-base font-light tracking-wide">
              Clique na imagem para começar sua jornada
            </p>
          </motion.div>
        )}
      </div>

      {/* Tela de zoom - Portal místico */}
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 6 }}
            transition={{ duration: 10, ease: "easeInOut" }}
            className="relative"
          >
            {/* Círculo do portal holográfico */}
            <motion.div
              className="relative"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 2, delay: 10 }}
            >
              <div className="relative w-64 h-64">
                {/* Imagem holográfica de fundo */}
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/19bd8531b_cropped-cropped-Design-sem-nome-5.png"
                  alt="Portal Holográfico"
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  style={{
                    boxShadow: '0 0 100px rgba(168, 85, 247, 0.8), inset 0 0 80px rgba(236, 72, 153, 0.5)'
                  }}
                />

                {/* Overlay de brilho */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)'
                  }}
                />

                {/* Partículas místicas orbitando */}
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 12)}%`,
                        top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 12)}%`,
                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>

                {/* Anel de energia rotativo */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400/50"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}