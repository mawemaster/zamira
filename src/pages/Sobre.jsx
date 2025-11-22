import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Heart, Users, BookOpen, Map, Crown, Target, Compass, Star
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SobrePage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Hub"));
  };

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Autenticidade",
      description: "Valorizamos conexões genuínas e crescimento real"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Comunidade",
      description: "Construímos juntos um espaço acolhedor e respeitoso"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Magia",
      description: "Acreditamos no poder transformador da espiritualidade"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Conhecimento",
      description: "Compartilhamos sabedoria ancestral e moderna"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#02031C] via-slate-900 to-[#02031C] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#02031C]/95 backdrop-blur-xl border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png"
            alt="Zamira"
            className="h-10 w-auto cursor-pointer"
            onClick={() => navigate(createPageUrl("Home"))}
          />
          <Button onClick={handleLogin} className="bg-purple-600 hover:bg-purple-700">
            Entrar
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Sobre o <span className="text-purple-400">Zamira</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Uma plataforma criada com amor para unir pessoas em busca de crescimento espiritual, 
              autoconhecimento e conexões verdadeiras
            </p>
          </motion.div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-purple-500/30 p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Nossa História</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Zamira nasceu da visão de criar um espaço onde espiritualidade e tecnologia se encontram. 
                Acreditamos que o mundo digital pode ser um portal para conexões mais profundas e 
                transformação pessoal verdadeira.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Combinando elementos de redes sociais, gamificação e conteúdo educacional místico, 
                criamos um ecossistema único onde cada membro pode trilhar sua própria jornada espiritual 
                enquanto contribui para o crescimento da comunidade.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Nossos <span className="text-purple-400">Valores</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-purple-500/20 p-6 h-full hover:border-purple-500/50 transition">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 text-white">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para <span className="text-purple-400">Começar</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Junte-se à comunidade Zamira gratuitamente hoje
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-7 text-xl rounded-full shadow-2xl shadow-purple-500/50"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Criar Conta Grátis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-purple-900/30 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2024 Zamira. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}