import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, Users, MessageCircle, Crown, Map, Heart, Star, Compass,
  BookOpen, Zap, Shield, TrendingUp, Award, Gift, ArrowRight
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (authenticated) {
      navigate(createPageUrl("Hub"));
    } else {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Hub"));
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#02031C] flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Jornada Espiritual",
      description: "Evolua através de níveis e arquétipos místicos únicos",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Comunidade Mística",
      description: "Conecte-se com viajantes espirituais de todo o Brasil",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      icon: <Map className="w-8 h-8" />,
      title: "Cidade de Zamira",
      description: "Explore um metaverso místico em tempo real",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Arena de Duelos",
      description: "Compita em debates místicos e conquiste coroas",
      gradient: "from-yellow-600 to-orange-600"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Portais de Sabedoria",
      description: "Tarot, Astrologia, Cristais e muito mais",
      gradient: "from-indigo-600 to-purple-600"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Sistema de Recompensas",
      description: "Ganhe Ouros e desbloqueie conteúdo exclusivo",
      gradient: "from-rose-600 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#02031C] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#02031C]/95 backdrop-blur-xl border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png"
            alt="Zamira"
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-4">
            <a href="#sobre" className="text-gray-300 hover:text-white transition text-sm hidden md:block">Sobre</a>
            <a href="#recursos" className="text-gray-300 hover:text-white transition text-sm hidden md:block">Recursos</a>
            <a href="#comunidade" className="text-gray-300 hover:text-white transition text-sm hidden md:block">Comunidade</a>
            <Button onClick={handleLogin} className="bg-purple-600 hover:bg-purple-700">
              Entrar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden">
        {/* Animated Background */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{ y: y1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        <div className="relative z-10 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Bem-vindo ao Zamira
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              A plataforma social mística que conecta espiritualidade,
              <br className="hidden md:block" />
              conhecimento e comunidade em um só lugar
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-2xl shadow-purple-500/50"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Começar Jornada Grátis
              </Button>
              <Button 
                onClick={() => document.getElementById('sobre').scrollIntoView({ behavior: 'smooth' })}
                size="lg"
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-900/20 px-8 py-6 text-lg rounded-full"
              >
                Saiba Mais
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="relative py-24 px-4 bg-gradient-to-b from-black to-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              O que é <span className="text-purple-400">Zamira</span>?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Zamira é mais que uma rede social - é um ecossistema completo onde espiritualidade, 
              gamificação e conhecimento místico se encontram. Desenvolva sua jornada espiritual, 
              conecte-se com almas afins e desbloqueie sabedoria ancestral.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Evolução Gamificada</h3>
                  <p className="text-gray-400">
                    Suba de nível, escolha seu arquétipo e desbloqueie poderes místicos únicos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Conexões Autênticas</h3>
                  <p className="text-gray-400">
                    Encontre pessoas que vibram na mesma frequência espiritual
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Conhecimento Ilimitado</h3>
                  <p className="text-gray-400">
                    Acesse cursos, PDFs, vídeos e conteúdo exclusivo sobre Tarot, Astrologia e mais
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png"
                alt="Zamira"
                className="w-full max-w-md mx-auto drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="relative py-24 px-4 bg-gradient-to-b from-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Recursos <span className="text-purple-400">Místicos</span>
            </h2>
            <p className="text-xl text-gray-300">
              Tudo que você precisa para sua evolução espiritual
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 p-6 h-full hover:border-purple-500/50 transition group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="comunidade" className="relative py-24 px-4 bg-gradient-to-b from-black to-slate-950">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Junte-se a <span className="text-purple-400">Milhares</span> de Viajantes
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Uma comunidade vibrante de pessoas que buscam crescimento espiritual,
              autoconhecimento e conexões autênticas
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div>
                <div className="text-5xl font-bold text-purple-400 mb-2">1000+</div>
                <p className="text-gray-400">Membros Ativos</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">50+</div>
                <p className="text-gray-400">Cursos & Recursos</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-400 mb-2">24/7</div>
                <p className="text-gray-400">Comunidade Online</p>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-7 text-xl rounded-full shadow-2xl shadow-purple-500/50"
            >
              <Star className="w-6 h-6 mr-3" />
              Comece Gratuitamente
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-slate-950 via-purple-950/30 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50"
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Sua Jornada Mística <span className="text-purple-400">Começa Aqui</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Cadastre-se gratuitamente e descubra um mundo de possibilidades espirituais
            </p>

            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-7 text-xl rounded-full shadow-2xl shadow-purple-500/50 mb-6"
            >
              <Crown className="w-6 h-6 mr-3" />
              Criar Conta Grátis
            </Button>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                100% Seguro
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Acesso Imediato
              </span>
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                Grátis para Sempre
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-purple-900/30 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Zamira. Todos os direitos reservados.</p>
          <p className="mt-2">Plataforma mística para evolução espiritual e conexão humana.</p>
        </div>
      </footer>
    </div>
  );
}