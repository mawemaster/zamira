import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Wind, Loader2, Play, Pause, Volume2, Heart, Brain, Sparkles } from "lucide-react";

const FREQUENCIES = {
  meditacao: [
    { name: '432 Hz - Cura Universal', url: 'https://www.youtube.com/embed/1yRY5B3Q8u4', duration: '3h', description: 'Frequência da natureza e harmonia' },
    { name: '528 Hz - Transformação DNA', url: 'https://www.youtube.com/embed/WUwJUrXn2oY', duration: '1h', description: 'Frequência dos milagres e reparo celular' },
    { name: '639 Hz - Conexão e Relacionamentos', url: 'https://www.youtube.com/embed/FqeU68F53qU', duration: '3h', description: 'Harmonia nos relacionamentos' },
    { name: '741 Hz - Despertar da Intuição', url: 'https://www.youtube.com/embed/Ml-79TzitoY', duration: '3h', description: 'Limpeza de toxinas e despertar espiritual' },
    { name: '963 Hz - Ativação Pineal', url: 'https://www.youtube.com/embed/EKTZ151yLnk', duration: '3h', description: 'Conexão com o divino' },
    { name: '285 Hz - Regeneração dos Tecidos', url: 'https://www.youtube.com/embed/iRDTQuZUv7k', duration: '1h', description: 'Cura física e energética' },
    { name: '396 Hz - Liberação do Medo', url: 'https://www.youtube.com/embed/Dxyg9eH_56w', duration: '3h', description: 'Libera culpa e medo' },
    { name: '174 Hz - Fundação Natural', url: 'https://www.youtube.com/embed/f91CL0gwOCQ', duration: '1h', description: 'Base para expansão da consciência' },
  ],
  ondas_cerebrais: [
    { name: 'Alpha Waves - Relaxamento', url: 'https://www.youtube.com/embed/dQaToxatVaU', duration: '2h', description: 'Estado meditativo leve' },
    { name: 'Theta Waves - Meditação Profunda', url: 'https://www.youtube.com/embed/mcOd3J0CgCQ', duration: '3h', description: 'Acesso ao subconsciente' },
    { name: 'Delta Waves - Sono Profundo', url: 'https://www.youtube.com/embed/B1k_4JPgsNw', duration: '8h', description: 'Regeneração e cura durante sono' },
    { name: 'Gamma Waves - Foco Máximo', url: 'https://www.youtube.com/embed/Hzkml5IkUU8', duration: '1h', description: 'Concentração e processamento' },
    { name: 'Beta Waves - Concentração Ativa', url: 'https://www.youtube.com/embed/j_CUFFIKLck', duration: '2h', description: 'Estado de vigília e atenção' },
  ],
  natureza: [
    { name: 'Chuva na Floresta', url: 'https://www.youtube.com/embed/nDq6TstdEi8', duration: '10h', description: 'Sons da chuva em floresta tropical' },
    { name: 'Ondas do Mar', url: 'https://www.youtube.com/embed/WHPYKLOM8zc', duration: '12h', description: 'Ondas suaves na praia' },
    { name: 'Cachoeira Relaxante', url: 'https://www.youtube.com/embed/eKFTSSKCzWA', duration: '8h', description: 'Água corrente e natureza' },
    { name: 'Floresta ao Amanhecer', url: 'https://www.youtube.com/embed/xNN7iTA57jM', duration: '3h', description: 'Pássaros e sons matinais' },
    { name: 'Fogueira Crepitante', url: 'https://www.youtube.com/embed/UgHKb_7884o', duration: '10h', description: 'Som de lenha queimando' },
    { name: 'Trovões Distantes', url: 'https://www.youtube.com/embed/nqJiWbD08Yw', duration: '8h', description: 'Tempestade suave' },
  ],
  chakras: [
    { name: 'Todos os 7 Chakras - Alinhamento', url: 'https://www.youtube.com/embed/ARoih-LzXI0', duration: '1h', description: 'Harmonização completa' },
    { name: 'Chakra Raiz - 396 Hz', url: 'https://www.youtube.com/embed/Dxyg9eH_56w', duration: '1h', description: 'Segurança e estabilidade' },
    { name: 'Chakra Sacral - 417 Hz', url: 'https://www.youtube.com/embed/u09s0uz0tEU', duration: '1h', description: 'Criatividade e emoções' },
    { name: 'Chakra Plexo Solar - 528 Hz', url: 'https://www.youtube.com/embed/WUwJUrXn2oY', duration: '1h', description: 'Poder pessoal' },
    { name: 'Chakra Cardíaco - 639 Hz', url: 'https://www.youtube.com/embed/FqeU68F53qU', duration: '1h', description: 'Amor e compaixão' },
    { name: 'Chakra Laríngeo - 741 Hz', url: 'https://www.youtube.com/embed/Ml-79TzitoY', duration: '1h', description: 'Expressão e verdade' },
    { name: 'Chakra Terceiro Olho - 852 Hz', url: 'https://www.youtube.com/embed/Sle4E_5wttA', duration: '1h', description: 'Intuição e clareza' },
    { name: 'Chakra Coroa - 963 Hz', url: 'https://www.youtube.com/embed/EKTZ151yLnk', duration: '1h', description: 'Conexão espiritual' },
  ],
  binaurais: [
    { name: 'Concentração Profunda - 40 Hz', url: 'https://www.youtube.com/embed/VBe99lKo09c', duration: '2h', description: 'Foco intenso para estudos' },
    { name: 'Meditação Zen - 7.83 Hz', url: 'https://www.youtube.com/embed/0WqIKUMDz1k', duration: '3h', description: 'Frequência da Terra (Schumann)' },
    { name: 'Sono Instantâneo - 1 Hz', url: 'https://www.youtube.com/embed/WGxJHPkmRw0', duration: '8h', description: 'Indução ao sono profundo' },
    { name: 'Lucid Dreaming - 6 Hz', url: 'https://www.youtube.com/embed/YKgYRkFl3SQ', duration: '8h', description: 'Sonhos lúcidos' },
    { name: 'Criatividade - 10 Hz', url: 'https://www.youtube.com/embed/jPpUNAFHgxM', duration: '2h', description: 'Inspiração e ideias' },
  ],
  mantras: [
    { name: 'OM Mantra - 108 Repetições', url: 'https://www.youtube.com/embed/PchZ9f0e4a0', duration: '30min', description: 'Som primordial do universo' },
    { name: 'Gayatri Mantra', url: 'https://www.youtube.com/embed/Tq_Y9a1s9XY', duration: '1h', description: 'Iluminação espiritual' },
    { name: 'Maha Mrityunjaya Mantra', url: 'https://www.youtube.com/embed/xGa8i6GC_ow', duration: '1h', description: 'Cura e proteção' },
    { name: 'Cantos Tibetanos', url: 'https://www.youtube.com/embed/w-T9aoTNfJw', duration: '3h', description: 'Monges tibetanos' },
    { name: 'Cantos Gregorianos', url: 'https://www.youtube.com/embed/W-hrBhA4XkM', duration: '2h', description: 'Canto sagrado cristão' },
  ]
};

export default function SantuarioSilencioPage() {
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('meditacao');
  const [playingAudio, setPlayingAudio] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const handlePlay = (audio) => {
    if (!audio || !audio.url) return;
    
    // Extrair ID do vídeo do YouTube
    const urlParts = audio.url.split('/embed/');
    if (!urlParts[1]) return;
    
    const videoId = urlParts[1].split('?')[0];
    
    if (videoId) {
      // Abrir vídeo em nova aba
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  const categories = Object.keys(FREQUENCIES);
  const currentFrequencies = FREQUENCIES[selectedCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              scale: { duration: 3, repeat: Infinity },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Wind className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
            Santuário do Silêncio
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Frequências sagradas e sons curativos</p>
        </motion.div>

        {/* Categorias */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition text-sm ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-teal-600 to-green-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'meditacao' ? '🧘 Meditação' :
               cat === 'ondas_cerebrais' ? '🧠 Ondas Cerebrais' :
               cat === 'natureza' ? '🌿 Natureza' :
               cat === 'chakras' ? '🌈 Chakras' :
               cat === 'binaurais' ? '🎧 Binaurais' :
               '🕉️ Mantras'}
            </button>
          ))}
        </div>



        {/* Lista de Frequências */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFrequencies.map((freq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="bg-slate-800/50 border-teal-500/30 p-4 hover:border-teal-400 transition group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                      <Volume2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-teal-300 text-sm mb-1 line-clamp-2">
                        {freq.name}
                      </h3>
                      <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                        {freq.duration}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-4 line-clamp-2">
                    {freq.description}
                  </p>

                  <Button
                    onClick={() => handlePlay(freq)}
                    className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Ouvir Agora
                  </Button>
                </Card>
              </motion.div>
            ))}
        </div>

        {/* Info */}
        <Card className="bg-gradient-to-br from-teal-900/30 to-green-900/30 border-teal-500/30 p-4 md:p-6 mt-6">
          <h4 className="font-bold text-teal-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Benefícios das Frequências
          </h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p>Redução de estresse e ansiedade</p>
            </div>
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p>Melhora do foco e concentração</p>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p>Equilíbrio energético dos chakras</p>
            </div>
            <div className="flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p>Indução ao estado meditativo</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}