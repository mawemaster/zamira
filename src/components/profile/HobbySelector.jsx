import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";

export const HOBBY_OPTIONS = [
  { category: "Criatividade & Arte", items: [
    "Desenho e Pintura", "Fotografia", "Escrita Criativa", "Tocar Instrumentos",
    "Canto", "Dança", "Artesanato", "Design Gráfico", "Edição de Vídeo",
    "Teatro e Atuação", "Escultura", "Cerâmica", "Caligrafia", "Arte Digital"
  ]},
  { category: "Mente & Conhecimento", items: [
    "Leitura", "Aprender novos idiomas", "História", "Filosofia", "Psicologia",
    "Ciência", "Tecnologia", "Xadrez", "Quebra-cabeças", "Astronomia"
  ]},
  { category: "Natureza & Aventura", items: [
    "Jardinagem", "Caminhadas", "Campismo", "Viagens", "Observação de Pássaros",
    "Montanhismo", "Praia e Surf", "Ciclismo", "Mergulho", "Animais de Estimação",
    "Permacultura"
  ]},
  { category: "Corpo & Bem-Estar", items: [
    "Ioga", "Meditação", "Artes Marciais", "Corrida", "Academia",
    "Natação", "Dança", "Culinária Saudável", "Pilates", "Tai Chi Chuan"
  ]},
  { category: "Social & Lazer", items: [
    "Cozinhar", "Voluntariado", "Filmes e Séries", "Games", "Jogos de Tabuleiro",
    "Astrologia", "Tarot", "Cristais", "Música", "Podcasts", "Moda e Estilo",
    "Colecionismo", "Astrofotografia"
  ]}
];

export default function HobbySelector({ selected = [], onChange }) {
  const [searchTerm, setSearchTerm] = useState("");

  const allItems = HOBBY_OPTIONS.flatMap(cat => 
    cat.items.map(item => ({ item, category: cat.category }))
  );

  const filteredItems = allItems.filter(({ item }) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleHobby = (hobby) => {
    if (selected.includes(hobby)) {
      onChange(selected.filter(h => h !== hobby));
    } else {
      onChange([...selected, hobby]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Pesquisar hobbies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-purple-900/30 text-white"
        />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((hobby) => (
            <Badge
              key={hobby}
              className="bg-purple-600 text-white pr-1"
            >
              {hobby}
              <button
                onClick={() => toggleHobby(hobby)}
                className="ml-1 hover:bg-purple-700 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="max-h-80 overflow-y-auto space-y-4 border border-purple-900/30 rounded-lg p-4 bg-slate-800/50">
        {HOBBY_OPTIONS.map((category) => {
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
                    onClick={() => toggleHobby(item)}
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