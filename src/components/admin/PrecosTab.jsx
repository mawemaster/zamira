import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Save, AlertCircle, DollarSign, Dices, Gift, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PRICING_ITEMS = [
  {
    id: "dice_roll",
    name: "Dados da Intenção",
    description: "Custo por lançamento dos dados místicos",
    icon: Dices,
    color: "text-purple-400",
    defaultValue: 1
  },
  {
    id: "remove_spell",
    name: "Remover Feitiço",
    description: "Custo para remover feitiço de post",
    icon: Sparkles,
    color: "text-pink-400",
    defaultValue: 5
  },
  {
    id: "post_donation_min",
    name: "Doação Mínima (Post)",
    description: "Valor mínimo para doar em posts",
    icon: Gift,
    color: "text-yellow-400",
    defaultValue: 1
  }
];

export default function PrecosTab() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = () => {
    // Carregar preços do localStorage ou usar valores padrão
    const savedPrices = localStorage.getItem('zamira_prices');
    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
    } else {
      // Valores padrão
      const defaultPrices = {};
      PRICING_ITEMS.forEach(item => {
        defaultPrices[item.id] = item.defaultValue;
      });
      setPrices(defaultPrices);
    }
  };

  const handlePriceChange = (itemId, value) => {
    setPrices(prev => ({
      ...prev,
      [itemId]: parseInt(value) || 0
    }));
  };

  const savePrices = () => {
    setLoading(true);
    try {
      localStorage.setItem('zamira_prices', JSON.stringify(prices));
      toast.success("Preços atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar preços");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-purple-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gestão de Preços em Ouros</h2>
            <p className="text-gray-400 text-sm">Configure os valores de todas as funcionalidades pagas em Zamira</p>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-300 font-semibold text-sm mb-1">
                Atenção ao Alterar Preços
              </p>
              <p className="text-yellow-200/80 text-xs leading-relaxed">
                As mudanças de preço afetam imediatamente todas as transações futuras. 
                Certifique-se de comunicar aos usuários sobre alterações significativas.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRICING_ITEMS.map((item) => {
          const Icon = item.icon;
          const currentPrice = prices[item.id] !== undefined ? prices[item.id] : item.defaultValue;

          return (
            <Card key={item.id} className="bg-slate-900 border-purple-500/30 p-6 hover:border-purple-500/50 transition">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold mb-1">{item.name}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Preço Atual</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type="number"
                        min="0"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="bg-slate-800 border-purple-900/30 text-white pr-16"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-yellow-400">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-semibold">Ouros</span>
                      </div>
                    </div>
                  </div>
                </div>

                {currentPrice !== item.defaultValue && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2">
                    <p className="text-blue-300 text-xs">
                      Valor padrão: <span className="font-semibold">{item.defaultValue} Ouros</span>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-slate-900 border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold mb-1">Salvar Alterações</h3>
            <p className="text-gray-400 text-sm">
              As mudanças entrarão em vigor imediatamente após salvar
            </p>
          </div>
          <Button
            onClick={savePrices}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Salvando..." : "Salvar Preços"}
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-900 border-purple-500/30 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Histórico de Alterações
        </h3>
        <div className="bg-slate-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            Nenhuma alteração registrada ainda
          </p>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30 p-6">
        <h3 className="text-white font-bold mb-4">💡 Dicas de Precificação</h3>
        <ul className="space-y-2">
          <li className="text-gray-300 text-sm flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            <span>Mantenha preços acessíveis para não desestimular o uso</span>
          </li>
          <li className="text-gray-300 text-sm flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            <span>Features premium devem ter valor percebido alto</span>
          </li>
          <li className="text-gray-300 text-sm flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            <span>Monitore o impacto das mudanças na economia do app</span>
          </li>
          <li className="text-gray-300 text-sm flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            <span>Comunique alterações significativas aos usuários</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}