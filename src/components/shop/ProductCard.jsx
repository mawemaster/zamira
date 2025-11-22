import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

const rankStyles = {
  0: {
    border: "border-2 border-yellow-500",
    shadow: "shadow-lg shadow-yellow-500/50",
    badge: { bg: "bg-yellow-500", text: "1º Lugar", icon: "🥇" }
  },
  1: {
    border: "border-2 border-gray-300",
    shadow: "shadow-lg shadow-gray-300/50",
    badge: { bg: "bg-gray-300 text-black", text: "2º Lugar", icon: "🥈" }
  },
  2: {
    border: "border-2 border-amber-700",
    shadow: "shadow-lg shadow-amber-700/50",
    badge: { bg: "bg-amber-700", text: "3º Lugar", icon: "🥉" }
  }
};

export default function ProductCard({ product, rank, showSales }) {
  const [isFavorited, setIsFavorited] = useState(false);
  
  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const hasRank = rank !== undefined && rank < 3;
  const rankStyle = hasRank ? rankStyles[rank] : null;

  return (
    <Link to={createPageUrl(`Produto?id=${product.id}`)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="group h-full"
      >
        <Card className={`bg-[#1a1a2e] border-purple-900/20 overflow-hidden h-full hover:border-purple-700/40 transition-all ${hasRank ? `${rankStyle.border} ${rankStyle.shadow}` : ''}`}>
          {/* Imagem */}
          <div className="relative aspect-square overflow-hidden bg-slate-800">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Badge de Rank */}
            {hasRank && (
              <Badge className={`absolute top-2 left-2 md:top-3 md:left-3 ${rankStyle.badge.bg} text-white font-bold px-2 py-0.5 md:px-3 md:py-1 shadow-lg text-[10px] md:text-xs`}>
                <span className="mr-1">{rankStyle.badge.icon}</span>
                <span className="hidden md:inline">{rankStyle.badge.text}</span>
              </Badge>
            )}

            {/* Botão Favoritar */}
            <Button
              onClick={handleFavorite}
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white h-8 w-8 md:h-10 md:w-10"
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
            </Button>
          </div>

          <CardContent className="p-2 md:p-4">
            {/* Categoria */}
            <p className="text-[10px] md:text-xs text-purple-400 font-semibold mb-1 md:mb-2 uppercase tracking-wide">
              {product.category}
            </p>

            {/* Nome */}
            <h3 className="text-xs md:text-sm lg:text-base font-bold text-white mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[3rem]">
              {product.name}
            </h3>

            {/* Vendas (se aplicável) */}
            {showSales && (
              <p className="text-[10px] md:text-xs text-gray-400 mb-1 md:mb-2">
                {product.sales_count} vendidos
              </p>
            )}

            {/* Preço e Avaliação */}
            <div className="flex items-center justify-between">
              <span className="text-base md:text-lg lg:text-xl font-bold text-[#fbbf24]">
                R$ {product.price?.toFixed(2)}
              </span>
              <div className="flex items-center gap-0.5 md:gap-1">
                <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] md:text-xs text-gray-300">{product.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}