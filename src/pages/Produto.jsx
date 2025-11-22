import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Heart,
  Star,
  Minus,
  Plus,
  Shield,
  Truck,
  ShoppingCart,
  Sparkles,
  MessageCircle,
  Gem
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/shop/ProductCard";
import CheckoutModal from "../components/shop/CheckoutModal";

function MysticDivider() {
  return (
    <div className="flex items-center gap-4 my-12">
      <Separator className="flex-1 bg-purple-900/30" />
      <Gem className="w-6 h-6 text-purple-400" />
      <Separator className="flex-1 bg-purple-900/30" />
    </div>
  );
}

function ReviewSection({ productId, reviews, user }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Review.create({
        product_id: productId,
        user_id: user.id,
        user_name: user.display_name || user.full_name,
        user_avatar: user.avatar_url,
        rating,
        comment: comment.trim(),
        is_verified_purchase: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setRating(0);
      setComment("");
      alert("Avaliação enviada com sucesso! ✨");
    },
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">
        Avaliações dos Viajantes
      </h2>

      {/* Média de Avaliações */}
      <Card className="bg-[#1a1a2e] border-purple-900/20 p-8 mb-8">
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-[#fbbf24] mb-2">
            {avgRating}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(parseFloat(avgRating))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-400">Baseado em {reviews.length} avaliações</p>
        </div>

        {/* Distribuição */}
        <div className="space-y-2">
          {ratingDistribution.map(({ star, count }) => {
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-20">
                  {star} estrelas
                </span>
                <div className="flex-1 h-3 bg-purple-900/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#fbbf24] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Formulário de Avaliação */}
      <Card className="bg-[#1a1a2e] border-purple-900/20 p-4 md:p-6 mb-8">
        <h3 className="text-lg md:text-xl font-bold text-white mb-4">Deixe o seu eco</h3>
        
        <div className="flex flex-col md:flex-row items-start gap-2 md:gap-4 mb-4">
          <img
            src={user?.avatar_url || 'https://via.placeholder.com/40'}
            alt="Avatar"
            className="w-10 h-10 rounded-full hidden md:block"
          />
          <div className="flex-1 w-full">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Como este artefato ressoou com a sua energia?"
              className="bg-[#0f0f1e] border-purple-900/20 text-white resize-none text-sm md:text-base"
              rows={4}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="hover:scale-110 transition"
              >
                <Star
                  className={`w-6 h-6 md:w-8 md:h-8 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <Button
            onClick={() => submitReviewMutation.mutate()}
            disabled={rating === 0 || !comment.trim() || submitReviewMutation.isPending}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] w-full sm:w-auto h-11 md:h-12 text-sm md:text-base"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar Avaliação
          </Button>
        </div>
      </Card>

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-[#1a1a2e] border-purple-900/20 p-6">
            <div className="flex items-start gap-4">
              <img
                src={review.user_avatar || 'https://via.placeholder.com/50'}
                alt={review.user_name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{review.user_name}</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300">{review.comment}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ProdutoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

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

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId }, "created_date", 1);
      return products[0];
    },
    enabled: !!productId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId }, "-created_date", 50),
    enabled: !!productId,
    initialData: [],
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => base44.entities.Product.filter({
      category: product.category,
      is_active: true
    }, "-sales_count", 4),
    enabled: !!product?.category,
    initialData: [],
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CartItem.create({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.images?.[0],
        quantity
      });
    },
    onSuccess: () => {
      alert("Artefato Adicionado ao Carrinho! 🛒✨");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  useEffect(() => {
    if (product?.images?.[0]) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1e]">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1e]">
        <Card className="bg-[#1a1a2e] border-purple-900/20 p-12 text-center">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            Artefato Não Encontrado
          </h2>
          <p className="text-gray-400 mb-6">
            Este item místico não existe em nossa dimensão
          </p>
          <Button onClick={() => navigate(createPageUrl("Loja"))}>
            Voltar à Loja
          </Button>
        </Card>
      </div>
    );
  }

  const relatedFiltered = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0f0f1e]">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Grid Principal */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-12">
          {/* Galeria */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-4 bg-slate-800">
              <img
                src={mainImage || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`aspect-square rounded-md md:rounded-lg overflow-hidden border-2 transition ${
                      mainImage === img
                        ? 'border-[#fbbf24] scale-105'
                        : 'border-purple-900/20 hover:border-purple-700/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Badge className="bg-[#8b5cf6] text-white mb-3 text-xs md:text-sm">
              {product.category}
            </Badge>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-4 md:mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    star <= Math.round(product.rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              ))}
              <span className="text-gray-400 text-xs md:text-sm">({product.review_count || 0} avaliações)</span>
            </div>

            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#fbbf24] mb-6 md:mb-8">
              R$ {product.price?.toFixed(2)}
            </div>

            {/* Quantidade */}
            <div className="mb-6">
              <label className="block text-white text-sm md:text-base font-semibold mb-3">Quantidade:</label>
              <div className="flex items-center gap-4 bg-[#1a1a2e] rounded-full p-2 w-fit">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full h-8 w-8 md:h-10 md:w-10 text-white hover:text-white hover:bg-slate-700"
                >
                  <Minus className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <span className="text-xl md:text-2xl font-bold text-white w-10 md:w-12 text-center">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full h-8 w-8 md:h-10 md:w-10 text-white hover:text-white hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3 mb-6 md:mb-8">
              <Button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold h-12 md:h-14 text-base md:text-lg rounded-full"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Comprar Agora
              </Button>

              <Button
                onClick={() => setIsFavorited(!isFavorited)}
                variant="outline"
                className="w-full border-2 border-white/20 h-12 md:h-14 text-base md:text-lg rounded-full text-white hover:text-white hover:bg-slate-800"
              >
                <Heart className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
                {isFavorited ? 'Guardado no Cofre' : 'Favoritar'}
              </Button>
            </div>

            {/* Descrição Curta */}
            {product.short_description && (
              <p className="text-gray-300 text-sm md:text-base mb-6 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Garantias */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                <span className="text-xs md:text-sm">Compra Segura</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Truck className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="text-xs md:text-sm">Envio para todo o Cosmos</span>
              </div>
            </div>
          </motion.div>
        </div>

        <MysticDivider />

        {/* Descrição Completa */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-[#fbbf24]" />
                <h2 className="text-3xl font-bold text-white">
                  A Essência do Artefacto
                </h2>
              </div>
              <div
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: product.description.replace(/\n/g, '<br />')
                }}
              />
            </Card>
          </motion.div>
        )}

        {/* Detalhes */}
        {product.details && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="bg-[#1a1a2e] border-purple-900/20 p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Detalhes Técnicos</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-4 bg-[#0f0f1e] rounded-lg">
                    <span className="text-gray-400">{key}:</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        <MysticDivider />

        {/* Avaliações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <ReviewSection productId={product.id} reviews={reviews} user={user} />
        </motion.div>

        {/* Produtos Relacionados */}
        {relatedFiltered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-8">
              Artefatos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedFiltered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        product={product}
        quantity={quantity}
        user={user}
      />
    </div>
  );
}