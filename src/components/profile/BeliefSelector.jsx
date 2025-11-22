import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const BELIEFS_OPTIONS = [
  // Filosofias / Sem Afiliação
  { category: "Filosofias / Sem Afiliação", items: [
    "Agnosticismo", "Ateísmo", "Ceticismo", "Espiritual mas não religioso(a)",
    "Humanismo", "Estoicismo", "Epicurismo", "Existencialismo", "Niilismo",
    "Absurdismo", "Panteísmo", "Panenteísmo", "Deísmo", "Racionalismo",
    "Empirismo", "Livre-pensamento", "Prefiro não dizer"
  ]},
  // Religiões Mundiais
  { category: "Cristianismo", items: [
    "Catolicismo Romano", "Protestantismo Evangélico", "Cristianismo Ortodoxo",
    "Espiritismo-Cristão (Kardecista)", "Mórmon", "Testemunhas de Jeová",
    "Adventista do Sétimo Dia"
  ]},
  { category: "Islamismo", items: ["Sunismo", "Xiismo", "Sufismo"] },
  { category: "Hinduísmo", items: ["Vaishnavismo", "Shaivismo", "Shaktismo", "Smartismo"] },
  { category: "Budismo", items: ["Theravada", "Mahayana", "Vajrayana", "Zen Budismo"] },
  { category: "Judaísmo", items: ["Ortodoxo", "Conservador", "Reformista", "Reconstrucionista"] },
  { category: "Outras Religiões", items: [
    "Fé Bahá'í", "Sikhismo", "Jainismo", "Taoísmo", "Confucionismo",
    "Xintoísmo", "Zoroastrismo", "Rastafari"
  ]},
  // Caminhos Pagãos
  { category: "Caminhos Pagãos & da Terra", items: [
    "Paganismo Geral", "Neopaganismo", "Wicca", "Bruxaria Tradicional",
    "Bruxaria Solitária", "Bruxaria Verde", "Bruxaria de Cozinha",
    "Bruxaria Cósmica", "Druidismo", "Xamanismo", "Animismo", "Totemismo",
    "Crença em Gaia", "Ecologia Profunda", "Paganismo Hélénico",
    "Paganismo Nórdico (Asatru)", "Paganismo Egípcio (Kemetismo)",
    "Paganismo Romano", "Paganismo Celta", "Paganismo Eslavo", "Fitoterapia Mágica"
  ]},
  // Tradições Afro
  { category: "Tradições Afro-diaspóricas", items: [
    "Candomblé", "Umbanda", "Santería", "Vodu Haitiano", "Palo Mayombe",
    "Quimbanda", "Ifá"
  ]},
  // Misticismo
  { category: "Misticismo & Escolas Esotéricas", items: [
    "Gnosticismo", "Hermetismo", "Teosofia", "Antroposofia", "Kabbalah",
    "Alquimia", "Ordem Rosacruz", "Maçonaria", "Thelema", "Satanismo",
    "Movimento Nova Era", "Ocultismo Geral"
  ]},
  // Práticas Divinatórias
  { category: "Práticas Divinatórias", items: [
    "Tarot (Taromancia)", "Astrologia", "Numerologia", "Leitura de Runas",
    "Quiromancia", "I Ching", "Pêndulo e Radiestesia", "Baralho Cigano",
    "Uso de Oráculos", "Cristalomancia", "Hidromancia", "Piromancia",
    "Cafeomancia", "Tassomancia", "Geomancia", "Lançamento de Dados"
  ]},
  // Práticas de Cura
  { category: "Práticas de Cura & Energia", items: [
    "Reiki", "Cura Prânica", "Terapia com Cristais", "Cromoterapia",
    "Aromaterapia", "Cura com Frequências", "Barras de Access", "ThetaHealing",
    "Yoga", "Tantra", "Cura Xamânica", "Acupuntura", "Reflexologia",
    "Toque Quântico", "Magnified Healing", "Constelações Familiares",
    "Meditação"
  ]},
  // Conceitos Metafísicos
  { category: "Conceitos Metafísicos", items: [
    "Lei da Atração", "Reencarnação", "Karma e Dharma", "Registos Akáshicos",
    "Projeção Astral", "Guias Espirituais / Anjos", "Mestres Ascensionados",
    "Eu Superior", "Elementais (Fadas, Gnomos)", "Trabalho com a Sombra",
    "Interpretação de Sonhos", "Ho'oponopono", "Crianças Índigo/Cristal",
    "Atlântida / Lemúria", "Canalização", "Consciência Cósmica"
  ]}
];

export default function BeliefSelector({ selected = [], onChange }) {
  const [searchTerm, setSearchTerm] = useState("");

  const allItems = BELIEFS_OPTIONS.flatMap(cat => 
    cat.items.map(item => ({ item, category: cat.category }))
  );

  const filteredItems = allItems.filter(({ item }) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBelief = (belief) => {
    if (selected.includes(belief)) {
      onChange(selected.filter(b => b !== belief));
    } else {
      onChange([...selected, belief]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Pesquisar crenças..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-purple-900/30 text-white"
        />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((belief) => (
            <Badge
              key={belief}
              className="bg-purple-600 text-white pr-1"
            >
              {belief}
              <button
                onClick={() => toggleBelief(belief)}
                className="ml-1 hover:bg-purple-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="max-h-80 overflow-y-auto space-y-4 border border-purple-900/30 rounded-lg p-4 bg-slate-800/50">
        {BELIEFS_OPTIONS.map((category) => {
          const categoryItems = category.items.filter(item =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (categoryItems.length === 0) return null;

          return (
            <div key={category.category}>
              <h4 className="text-sm font-bold text-purple-300 mb-2">
                {category.category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categoryItems.map((item) => (
                  <Badge
                    key={item}
                    onClick={() => toggleBelief(item)}
                    className={`cursor-pointer transition ${
                      selected.includes(item)
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}