import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Tag, Sparkles, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../components/shop/ProductCard";

// Mock de compradores recentes
const recentPurchases = [
  { id: 1, displayName: "Luz Interior", purchasedItem: "O Oráculo da Deusa", avatar: "https://i.pravatar.cc/150?img=1", borderColor: "border-yellow-500" },
  { id: 2, displayName: "Feiticeira Verde", purchasedItem: "Kit de Cristais Essenciais", avatar: "https://i.pravatar.cc/150?img=5", borderColor: "border-purple-500" },
  { id: 3, displayName: "Oráculo Moderno", purchasedItem: "E-book Os Segredos", avatar: "https://i.pravatar.cc/150?img=12", borderColor: "border-amber-500" },
  { id: 4, displayName: "Viajante Cósmico", purchasedItem: "Vela Aromática", avatar: "https://i.pravatar.cc/150?img=8", borderColor: "border-blue-500" },
  { id: 5, displayName: "Mestre das Sombras", purchasedItem: "Meditação Guiada", avatar: "https://i.pravatar.cc/150?img=15", borderColor: "border-green-500" },
];

export default function LojaPage() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("Todos");

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

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, "-sales_count", 100),
    initialData: [],
  });

  const getFilteredProducts = () => {
    let filtered = products;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de categoria
    if (filter === "Físicos") {
      filtered = filtered.filter(p => p.type === "Físico");
    } else if (filter === "Digitais") {
      filtered = filtered.filter(p => p.type === "Digital");
    } else if (filter === "Top Vendas") {
      filtered = [...filtered].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const filters = ['Todos', 'Físicos', 'Digitais', 'Top Vendas'];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1e]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1e]">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
            Loja Mística
          </h1>
          <p className="text-gray-400 text-sm md:text-base lg:text-lg">
            Artefatos místicos para sua jornada espiritual
          </p>
        </motion.div>

        {/* Ecos da Sacola Cósmica */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <Card className="bg-[#1a1a2e] border-purple-900/20 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Tag className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              <h2 className="text-base md:text-lg lg:text-xl font-bold text-white">Ecos da Sacola Cósmica</h2>
            </div>
            <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4">
              As últimas aquisições da nossa comunidade
            </p>

            <ScrollArea className="w-full">
              <div className="flex gap-3 md:gap-4 pb-4">
                {recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex-shrink-0 text-center">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 ${purchase.borderColor} mb-2 mx-auto`}>
                      <img src={purchase.avatar} alt={purchase.displayName} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-white max-w-[64px] md:max-w-[80px] truncate">
                      {purchase.displayName}
                    </p>
                    <p className="text-[10px] md:text-xs text-gray-400 max-w-[64px] md:max-w-[80px] truncate">
                      {purchase.purchasedItem}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 md:mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produtos..."
              className="pl-10 md:pl-12 bg-[#1a1a2e] border-purple-900/20 text-white h-12 md:h-14 text-sm md:text-base lg:text-lg"
            />
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8"
        >
          {filters.map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? "default" : "outline"}
              className={`text-xs md:text-sm ${
                filter === f
                  ? "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-0"
                  : "border-2 border-white/20 bg-transparent hover:bg-white/5 text-white"
              }`}
            >
              {f}
            </Button>
          ))}
        </motion.div>

        {/* Grid de Produtos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-purple-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400 text-sm md:text-base">Carregando artefatos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-8 md:p-12 text-center">
              <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-purple-500/30 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-purple-300 mb-2">
                Nenhum artefato encontrado
              </h3>
              <p className="text-sm md:text-base text-gray-400">
                Tente ajustar sua busca ou filtros
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rank={filter === "Top Vendas" ? index : undefined}
                  showSales={filter === "Top Vendas"}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}