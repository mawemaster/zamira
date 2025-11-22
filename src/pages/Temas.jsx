import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

const themes = [
  {
    id: "dark",
    name: "Padrão Escuro",
    description: "Fundos púrpura-escuro, acentos dourados místicos",
    preview: "linear-gradient(135deg, #1e1b4b, #000000)",
    colors: {
      background: "#02031C",
      backgroundGradient: "linear-gradient(to bottom, #02031C, #1a1a2e, #02031C)",
      surface: "#1e1b4b",
      surfaceHover: "#2e2b5b",
      card: "#1e293b",
      cardHover: "#2e3a4b",
      accent: "#a855f7",
      accentHover: "#9333ea",
      text: "#ffffff",
      textSecondary: "#cbd5e1",
      border: "#6b21a8"
    }
  },
  {
    id: "verde-esmeralda",
    name: "Verde Esmeralda",
    description: "Fundos em verde-floresta, acentos esmeralda",
    preview: "linear-gradient(135deg, #064e3b, #022c22)",
    colors: {
      background: "#022c22",
      backgroundGradient: "linear-gradient(to bottom, #022c22, #064e3b, #022c22)",
      surface: "#064e3b",
      surfaceHover: "#065f4b",
      card: "#134e4a",
      cardHover: "#236e6a",
      accent: "#10b981",
      accentHover: "#059669",
      text: "#ffffff",
      textSecondary: "#d1fae5",
      border: "#047857"
    }
  },
  {
    id: "azul-safira",
    name: "Azul Safira",
    description: "Fundos azul-noite, acentos safira elétrico",
    preview: "linear-gradient(135deg, #1e3a8a, #0c1e3f)",
    colors: {
      background: "#0c1e3f",
      backgroundGradient: "linear-gradient(to bottom, #0c1e3f, #1e3a8a, #0c1e3f)",
      surface: "#1e3a8a",
      surfaceHover: "#2e4a9a",
      card: "#1e40af",
      cardHover: "#2e50bf",
      accent: "#3b82f6",
      accentHover: "#2563eb",
      text: "#ffffff",
      textSecondary: "#dbeafe",
      border: "#1d4ed8"
    }
  },
  {
    id: "vermelho-rubi",
    name: "Vermelho Rubi",
    description: "Fundos vinho escuro, acentos rubi intenso",
    preview: "linear-gradient(135deg, #7f1d1d, #3f0f0f)",
    colors: {
      background: "#3f0f0f",
      backgroundGradient: "linear-gradient(to bottom, #3f0f0f, #7f1d1d, #3f0f0f)",
      surface: "#7f1d1d",
      surfaceHover: "#8f2d2d",
      card: "#991b1b",
      cardHover: "#a92b2b",
      accent: "#dc2626",
      accentHover: "#b91c1c",
      text: "#ffffff",
      textSecondary: "#fecaca",
      border: "#991b1b"
    }
  },
  {
    id: "amarelo-topazio",
    name: "Amarelo Topázio",
    description: "Fundos marrom-dourado, acentos topázio",
    preview: "linear-gradient(135deg, #78350f, #451a03)",
    colors: {
      background: "#451a03",
      backgroundGradient: "linear-gradient(to bottom, #451a03, #78350f, #451a03)",
      surface: "#78350f",
      surfaceHover: "#88451f",
      card: "#92400e",
      cardHover: "#a2501e",
      accent: "#f59e0b",
      accentHover: "#d97706",
      text: "#ffffff",
      textSecondary: "#fde68a",
      border: "#b45309"
    }
  },
  {
    id: "prata-lunar",
    name: "Prata Lunar",
    description: "Fundos cinza-azulado, acentos prata metálico",
    preview: "linear-gradient(135deg, #334155, #1e293b)",
    colors: {
      background: "#1e293b",
      backgroundGradient: "linear-gradient(to bottom, #1e293b, #334155, #1e293b)",
      surface: "#334155",
      surfaceHover: "#435165",
      card: "#475569",
      cardHover: "#576579",
      accent: "#94a3b8",
      accentHover: "#cbd5e1",
      text: "#ffffff",
      textSecondary: "#e2e8f0",
      border: "#64748b"
    }
  },
  {
    id: "rosa-celestial",
    name: "Rosa Celestial",
    description: "Tons de rosa e roxo celestial",
    preview: "linear-gradient(135deg, #831843, #4a044e)",
    colors: {
      background: "#4a044e",
      backgroundGradient: "linear-gradient(to bottom, #4a044e, #831843, #4a044e)",
      surface: "#831843",
      surfaceHover: "#932853",
      card: "#9f1239",
      cardHover: "#af2249",
      accent: "#ec4899",
      accentHover: "#db2777",
      text: "#ffffff",
      textSecondary: "#fbcfe8",
      border: "#be185d"
    }
  },
  {
    id: "laranja-fogo",
    name: "Laranja Fogo",
    description: "Chamas laranjas e vermelhas vibrantes",
    preview: "linear-gradient(135deg, #c2410c, #7c2d12)",
    colors: {
      background: "#7c2d12",
      backgroundGradient: "linear-gradient(to bottom, #7c2d12, #c2410c, #7c2d12)",
      surface: "#c2410c",
      surfaceHover: "#d2511c",
      card: "#ea580c",
      cardHover: "#fa681c",
      accent: "#fb923c",
      accentHover: "#f97316",
      text: "#ffffff",
      textSecondary: "#fed7aa",
      border: "#c2410c"
    }
  }
];

export default function TemasPage() {
  const [user, setUser] = useState(null);
  const [currentTheme, setCurrentTheme] = useState("dark");
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const userTheme = currentUser.theme || "dark";
      setCurrentTheme(userTheme);
      applyThemeToApp(userTheme);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const applyThemeToApp = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--theme-bg', theme.colors.background);
    root.style.setProperty('--theme-bg-gradient', theme.colors.backgroundGradient);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-surface-hover', theme.colors.surfaceHover);
    root.style.setProperty('--theme-card', theme.colors.card);
    root.style.setProperty('--theme-card-hover', theme.colors.cardHover);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-accent-hover', theme.colors.accentHover);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--theme-border', theme.colors.border);
    
    // Apply to body
    document.body.style.background = theme.colors.backgroundGradient;
    document.body.style.color = theme.colors.text;
    
    // Apply theme class
    document.body.setAttribute('data-theme', themeId);
  };

  const changeThemeMutation = useMutation({
    mutationFn: async (themeId) => {
      await base44.auth.updateMe({ theme: themeId });
      return themeId;
    },
    onSuccess: (themeId) => {
      setCurrentTheme(themeId);
      applyThemeToApp(themeId);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleThemeChange = (themeId) => {
    changeThemeMutation.mutate(themeId);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--theme-bg-gradient, linear-gradient(to bottom, #02031C, #1a1a2e))' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 mb-6">
            <Palette className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Alquimia Cromática
          </h1>
          <p className="text-lg" style={{ color: 'var(--theme-text-secondary, #cbd5e1)' }}>
            Personalize as cores de todo o portal místico
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden cursor-pointer transition-all border-2 ${
                currentTheme === theme.id
                  ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105'
                  : 'hover:scale-102'
              }`}
              style={{
                borderColor: currentTheme === theme.id ? theme.colors.accent : theme.colors.border,
                background: `linear-gradient(to bottom, ${theme.colors.card}, ${theme.colors.surface})`
              }}
              onClick={() => handleThemeChange(theme.id)}>
                {/* Preview */}
                <div 
                  className="h-32 relative"
                  style={{ background: theme.preview }}
                >
                  {currentTheme === theme.id && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-5 h-5 text-purple-600" />
                    </motion.div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: theme.colors.background }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: theme.colors.surface }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6" style={{ color: theme.colors.text }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.accent }}>
                    {theme.name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                    {theme.description}
                  </p>
                  
                  {currentTheme === theme.id ? (
                    <div className="flex items-center gap-2 text-sm text-green-400 font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Tema Ativo</span>
                    </div>
                  ) : (
                    <Button 
                      size="sm"
                      style={{ 
                        backgroundColor: theme.colors.accent,
                        color: theme.colors.text 
                      }}
                      className="w-full"
                    >
                      Aplicar Tema
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <style>{`
          /* Global Theme Styles */
          [data-theme] .bg-slate-900,
          [data-theme] .bg-slate-800 {
            background: var(--theme-card) !important;
          }
          
          [data-theme] .bg-purple-600 {
            background: var(--theme-accent) !important;
          }
          
          [data-theme] .hover\\:bg-purple-700:hover {
            background: var(--theme-accent-hover) !important;
          }
          
          [data-theme] .border-purple-500,
          [data-theme] .border-purple-900 {
            border-color: var(--theme-border) !important;
          }
          
          [data-theme] .text-gray-400,
          [data-theme] .text-gray-300 {
            color: var(--theme-text-secondary) !important;
          }
        `}</style>
      </div>
    </div>
  );
}