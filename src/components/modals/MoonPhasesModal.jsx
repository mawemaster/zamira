import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Moon, Sun, X } from "lucide-react";

export default function MoonPhasesModal({ onClose }) {
  // Dados fixos para garantir que carregue sempre
  const phases = [
    { day: "Hoje", phase: "Lua Nova", icon: Moon, desc: "Momento de plantar sementes e intenções." },
    { day: "Amanhã", phase: "Lua Crescente", icon: Moon, desc: "Energia para agir e fazer crescer." },
    { day: "Quarta-feira", phase: "Quarto Crescente", icon: Moon, desc: "Supere desafios e persista." },
    { day: "Sexta-feira", phase: "Lua Cheia", icon: Sun, desc: "Intuição máxima e colheita." },
    { day: "Domingo", phase: "Lua Minguante", icon: Moon, desc: "Limpeza, desapego e reflexão." },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#1e1b4b] border-purple-500/30 text-white sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2 text-purple-300">
              <Moon className="w-5 h-5" />
              Fases da Lua - Esta Semana
            </DialogTitle>
            {/* Botão de fechar extra caso o X padrão não apareça */}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white h-6 w-6">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4 mt-4">
          <div className="space-y-3">
            {phases.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-purple-900/50 rounded-full flex-shrink-0">
                  <item.icon className="w-5 h-5 text-purple-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white">{item.day}</p>
                    <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full">{item.phase}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}