import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const zodiacSigns = [
  { name: "Áries", emoji: "♈", dates: "21/03 - 19/04", element: "Fogo" },
  { name: "Touro", emoji: "♉", dates: "20/04 - 20/05", element: "Terra" },
  { name: "Gêmeos", emoji: "♊", dates: "21/05 - 20/06", element: "Ar" },
  { name: "Câncer", emoji: "♋", dates: "21/06 - 22/07", element: "Água" },
  { name: "Leão", emoji: "♌", dates: "23/07 - 22/08", element: "Fogo" },
  { name: "Virgem", emoji: "♍", dates: "23/08 - 22/09", element: "Terra" },
  { name: "Libra", emoji: "♎", dates: "23/09 - 22/10", element: "Ar" },
  { name: "Escorpião", emoji: "♏", dates: "23/10 - 21/11", element: "Água" },
  { name: "Sagitário", emoji: "♐", dates: "22/11 - 21/12", element: "Fogo" },
  { name: "Capricórnio", emoji: "♑", dates: "22/12 - 19/01", element: "Terra" },
  { name: "Aquário", emoji: "♒", dates: "20/01 - 18/02", element: "Ar" },
  { name: "Peixes", emoji: "♓", dates: "19/02 - 20/03", element: "Água" }
];

export default function HoroscopoPage() {
  const [user, setUser] = useState(null);
  const [selectedSign, setSelectedSign] = useState(null);
  const [horoscope, setHoroscope] = useState("");
  const [loading, setLoading] = useState(false);

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

  const generateHoroscope = async (sign) => {
    setLoading(true);
    setSelectedSign(sign);
    
    try {
      const prompt = `Crie um horóscopo do dia para o signo de ${sign.name}. Seja inspirador, místico e específico. Inclua dicas sobre amor, trabalho e energia do dia. Máximo 150 palavras.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBD6sfREj9WchZQ5maQ5LWBZN1v36SZY_Q`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      setHoroscope(text);
    } catch (error) {
      setHoroscope("As estrelas estão temporariamente obscurecidas. Tente novamente em alguns momentos. ✨");
    }
    
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 mb-6">
            <Star className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Horóscopo Diário
          </h1>
          <p className="text-gray-400 text-lg">
            Almanaque das Estrelas - escolha seu signo
          </p>
        </motion.div>

        {/* Signos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {zodiacSigns.map((sign, index) => (
            <motion.div
              key={sign.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => generateHoroscope(sign)}
                className={`p-6 cursor-pointer transition border ${
                  selectedSign?.name === sign.name
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/20 to-orange-900/10'
                    : 'border-purple-900/30 hover:border-purple-700/50 bg-gradient-to-br from-slate-900 to-slate-800'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{sign.emoji}</div>
                  <h3 className="font-bold text-purple-300 mb-1">{sign.name}</h3>
                  <p className="text-xs text-gray-400 mb-1">{sign.dates}</p>
                  <p className="text-xs text-gray-500">{sign.element}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Horóscopo */}
        {selectedSign && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-500/50 p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{selectedSign.emoji}</div>
                <h2 className="text-3xl font-bold text-yellow-300 mb-2">{selectedSign.name}</h2>
                <p className="text-gray-400">{selectedSign.dates} • {selectedSign.element}</p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse mx-auto mb-4" />
                  <p className="text-gray-400">Consultando as estrelas...</p>
                </div>
              ) : horoscope ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-center whitespace-pre-wrap">
                    {horoscope}
                  </p>
                </div>
              ) : null}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}