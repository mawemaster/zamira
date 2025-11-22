import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, Play, ArrowRight, Sparkles, Users, BookOpen, Award, MessageCircle, Clock, Video, FileText, Eye, Crown
} from "lucide-react";
import PDFViewer from "../components/PDFViewer";

// Carrossel de imagens do topo
const topCarouselImages = [
  "https://portaltarot.com.br/wp-content/uploads/2025/10/1.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/10/2.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/10/3.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/10/4.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/10/5.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/10/6.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/10/7.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/10/8.png",
];

// Imagens dos Arcanos flutuantes
const arcanosImages = [
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-1.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-1-1.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-2.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-1-2.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-3.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-4.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-5.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-6.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-7.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/arcanos-para-o-tarot-virtual-8.png",
];

// Imagens dos designs flutuantes
const designImages = [
  "https://portaltarot.com.br/wp-content/uploads/2025/05/Design-sem-nome-33-1.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/Design-sem-nome-34.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/Design-sem-nome-33.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/Design-sem-nome-34-1.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/Design-sem-nome-35.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/Design-sem-nome-36.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/05/Design-sem-nome-37.png",
];

// Imagens VOCEM
const vocemImages = [
  "https://portaltarot.com.br/wp-content/uploads/2025/06/6-1.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/06/4-3.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/06/3-4.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/06/1-2.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/06/2-2.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/06/4-2.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/06/5-3.png",
];

// Depoimentos da comunidade
const communityImages = [
  "https://portaltarot.com.br/wp-content/uploads/2025/09/3.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/09/2.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/09/1.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/09/7.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/09/8.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/09/6.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/09/5.png",
  "https://portaltarot.com.br/wp-content/uploads/2025/09/4.png",
];

// Componente de carrossel infinito
function InfiniteCarousel({ images, speed = 30, reverse = false }) {
  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex gap-4"
        animate={{
          x: reverse ? [0, -1920] : [-1920, 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...images, ...images, ...images].map((img, index) => (
          <img
            key={index}
            src={img}
            alt=""
            className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] object-contain flex-shrink-0"
          />
        ))}
      </motion.div>
    </div>
  );
}

export default function PortalTarotPremiumPage() {
  const [user, setUser] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: false });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: pdfs } = useQuery({
    queryKey: ['pdf-library'],
    queryFn: () => base44.entities.PDFLibrary.filter({ 
      is_active: true,
      category: 'tarot'
    }, "order", 50),
    enabled: !!user
  });

  const canAccessPDF = (pdf) => {
    if (!pdf.is_premium) return true;
    return user?.is_pro_subscriber;
  };

  const handleOpenPDF = async (pdf) => {
    if (!canAccessPDF(pdf)) {
      alert('Este PDF é exclusivo para membros PRO');
      return;
    }

    // Incrementar visualizações
    await base44.entities.PDFLibrary.update(pdf.id, {
      views_count: (pdf.views_count || 0) + 1
    });

    setSelectedPDF(pdf);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
        
        * {
          font-family: 'Roboto', sans-serif !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        
        p {
          font-weight: 400;
          line-height: 1.6;
        }
      `}</style>

      {/* HERO SECTION */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-start px-4 py-8 sm:py-12 overflow-hidden"
      >
        {/* Background com gradiente verde místico */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00cf7f]/5 via-black to-black" />
        
        {/* Círculos animados - efeito do SVG original */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg width="900" height="900" viewBox="0 0 1105 1104" fill="none" className="w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] opacity-20">
            <g>
              <path 
                opacity="0.4" 
                d="M195 552C195 748.613 355.058 908 552.5 908C749.942 908 910 748.613 910 552C910 355.387 749.942 196 552.5 196C355.058 196 195 355.387 195 552Z" 
                stroke="url(#grad1)" 
                strokeWidth="8.4" 
                strokeDasharray="1.4 8.4"
              />
              <path 
                opacity="0.4" 
                d="M3 552C3 855.204 249.02 1101 552.5 1101C855.98 1101 1102 855.204 1102 552C1102 248.796 855.98 3 552.5 3C249.02 3 3 248.796 3 552Z" 
                stroke="url(#grad2)" 
                strokeWidth="4.2" 
                strokeDasharray="1.4 12.6"
              />
            </g>
            <defs>
              <linearGradient id="grad1" x1="552.5" y1="808.232" x2="552.5" y2="257.971" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00CF7F" stopOpacity="0" />
                <stop offset="0.196628" stopColor="#00CF7F" />
                <stop offset="0.81159" stopColor="#00CF7F" />
                <stop offset="0.986765" stopColor="#00CF7F" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="grad2" x1="552.5" y1="891.045" x2="552.5" y2="164.732" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00CF7F" stopOpacity="0" />
                <stop offset="0.196628" stopColor="#00CF7F" />
                <stop offset="0.81159" stopColor="#00CF7F" />
                <stop offset="0.986765" stopColor="#00CF7F" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Logo Portal Tarot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mb-8 sm:mb-12 w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] mx-auto"
        >
          <img 
            src="https://portaltarot.com.br/wp-content/uploads/2024/02/O-EREMITA-2.png" 
            alt="Portal Tarot"
            className="w-full h-auto"
          />
        </motion.div>

        {/* Carrossel de imagens */}
        <div className="relative z-10 w-full max-w-7xl mb-8 sm:mb-12">
          <InfiniteCarousel images={topCarouselImages} speed={25} />
        </div>

        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 text-center max-w-5xl mb-8 sm:mb-12 px-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="text-white">O Portal Tarot é mais</span>
            <br />
            <span className="text-white">que um curso.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed font-light">
            É um ecossistema vivo onde sabedoria ancestral
            <br className="hidden sm:block" />
            encontra o despertar da nova era.
          </p>
          
          <Button
            size="lg"
            className="bg-[#00cf7f] hover:bg-[#00b66f] text-black font-bold text-sm sm:text-base md:text-lg px-8 sm:px-12 py-5 sm:py-7 rounded-full shadow-2xl shadow-[#00cf7f]/30 hover:scale-105 transition-all duration-300 uppercase"
          >
            ACESSAR AGORA
            <ArrowRight className="w-5 h-5 ml-2 sm:ml-3" />
          </Button>
        </motion.div>

        {/* Arcanos flutuantes - primeira fileira */}
        <div className="relative z-10 w-full mb-4 sm:mb-6">
          <InfiniteCarousel images={arcanosImages.slice(0, 6)} speed={35} />
        </div>

        {/* Arcanos flutuantes - segunda fileira */}
        <div className="relative z-10 w-full">
          <InfiniteCarousel images={arcanosImages.slice(6)} speed={30} reverse={true} />
        </div>
      </section>

      {/* SEÇÃO: Desperte sua intuição */}
      <section className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-black">
        <div className="max-w-7xl mx-auto">
          {/* Título da seção */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
              Desperte sua intuição.
              <br />
              <span className="text-[#00cf7f]">Estruture seu dom.</span>
              <br />
              Viva o Tarot.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Imagem do MacBook */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img 
                src="https://portaltarot.com.br/wp-content/uploads/2025/05/IDENTIDADE-VISUAL-PORTAL-TAROT-1200-x-800-px-2.png" 
                alt="Portal Tarot Interface"
                className="w-full h-auto"
              />
            </motion.div>

            {/* Benefícios */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00cf7f]/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#00cf7f]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Seja aluno e ganhe</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Manual de Tarot Terapêutico e Divinatório. Um material exclusivo, impresso com amor, 
                    que vai acompanhar a sua jornada como Taróloga de <strong>verdade.</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00cf7f]/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#00cf7f]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Preparamos um epicentro</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Conteúdos e ferramentas que agregam valor em suas interpretações e consultas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00cf7f]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#00cf7f]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Estruture seu dom. Viva o Tarot</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                    Acesso completo à sua formação mágica: materiais, métodos, mentorias e uma comunidade 
                    que reconhece seu poder.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#00cf7f] hover:bg-[#00b66f] text-black font-bold text-sm sm:text-base px-8 sm:px-12 py-5 sm:py-6 rounded-full shadow-lg shadow-[#00cf7f]/20 uppercase"
              >
                EMBARQUE AGORA
              </Button>
            </motion.div>
          </div>
        </div>
      </section>



      {/* SEÇÃO: Processo em 4 etapas */}
      <section className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-[#00cf7f] uppercase text-xs sm:text-sm font-bold mb-3 sm:mb-4 tracking-widest">
              PROCESSO TRANSPARENTE
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Do conceito ao resultado em
              <br />
              <span className="text-[#00cf7f]">4 etapas simples</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {[
              {
                icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Organização",
                description: "Aqui dentro do Portal você vai entender como a organização pode acelerar os seus estudos com o Tarot."
              },
              {
                icon: <Video className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Aprendizado",
                description: "Todo o conhecimento essencial sobre o Tarot encontra-se no Portal Tarot."
              },
              {
                icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Atualizações",
                description: "Os usuários receberão atualizações abrangentes em nosso Portal."
              },
              {
                icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />,
                title: "Suporte",
                description: "Todos os membros do portal têm acesso a suporte dedicado via WhatsApp."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border-[#00cf7f]/10 p-6 sm:p-8 h-full hover:border-[#00cf7f]/30 transition-all">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#00cf7f]/10 flex items-center justify-center mb-4 sm:mb-6 text-[#00cf7f]">
                    {item.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Certificado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <img 
              src="https://portaltarot.com.br/wp-content/uploads/2025/09/Certificado-Portal-Tarot-3.png" 
              alt="Certificado Portal Tarot"
              className="max-w-full sm:max-w-2xl w-full mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO: VOCEM - Grimório Auditivo */}
      <section className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-black overflow-hidden">
        {/* Background com imagem VOCEM */}
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://portaltarot.com.br/wp-content/uploads/2025/10/3-8__1_-removebg-preview.png" 
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="text-[#00cf7f]">VOCEM</span>
              <br />
              Grimório Auditivo
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              VOCEM é um grimório como nenhum outro. Não se lê — se escuta.
              <br className="hidden sm:block" />
              Cada episódio é uma página viva de um livro que não se lê, mas se sente — 
              um espaço onde a palavra se torna ritual e o som, um portal de acesso a dimensões 
              simbólicas, filosóficas e mágicas.
            </p>
          </motion.div>

          {/* Carrossel VOCEM */}
          <div className="mb-8 sm:mb-12">
            <InfiniteCarousel images={vocemImages} speed={28} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Button
              size="lg"
              className="bg-[#00cf7f] hover:bg-[#00b66f] text-black font-bold text-sm sm:text-base px-8 sm:px-12 py-5 sm:py-6 rounded-full shadow-lg shadow-[#00cf7f]/20 uppercase"
            >
              QUERO ASSINAR AGORA
            </Button>
          </motion.div>
        </div>

        {/* Carrossel de designs no fundo */}
        <div className="mt-12 sm:mt-16 opacity-10">
          <InfiniteCarousel images={designImages} speed={32} reverse={true} />
        </div>
      </section>

      {/* SEÇÃO: Comunidade do Portal Tarot */}
      <section className="relative py-16 sm:py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Comunidade do Portal Tarot
            </h2>
          </motion.div>

          {/* Grid de depoimentos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {communityImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="aspect-[3/4] overflow-hidden rounded-lg"
              >
                <img 
                  src={img} 
                  alt={`Depoimento ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="compra" className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-black via-[#00cf7f]/5 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">
              Transforme Sua Vida
              <br />
              <span className="text-[#00cf7f]">com o Portal Tarot</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 font-light">
              Junte-se a milhares de alunos que já despertaram sua intuição
            </p>

            <Button
              size="lg"
              className="bg-[#00cf7f] hover:bg-[#00b66f] text-black font-bold text-lg sm:text-xl md:text-2xl px-12 sm:px-16 py-7 sm:py-10 rounded-full shadow-2xl shadow-[#00cf7f]/40 hover:scale-105 transition-all duration-300 uppercase"
            >
              <Award className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4" />
              QUERO FAZER PARTE
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 ml-3 sm:ml-4" />
            </Button>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#00cf7f]" />
                <span>Acesso vitalício</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#00cf7f]" />
                <span>Certificado incluído</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#00cf7f]" />
                <span>Suporte premium</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-gray-900 py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-xs sm:text-sm">
          <p>© 2024 Portal Tarot. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedPDF && (
          <PDFViewer 
            pdf={selectedPDF} 
            onClose={() => setSelectedPDF(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}