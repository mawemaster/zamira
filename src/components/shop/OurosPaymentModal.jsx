import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Loader2, ShieldCheck, CreditCard, QrCode, Copy, CheckCircle, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function OurosPaymentModal({ isOpen, onClose, pack, user }) {
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [processing, setProcessing] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [copied, setCopied] = useState(false);
  const [showPixPopup, setShowPixPopup] = useState(false);

  const handlePixPayment = async () => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('createPixPayment', {
        product_id: `ouros_${pack.amount}`,
        product_name: `${pack.amount} Ouros${pack.bonus > 0 ? ` + ${pack.bonus} Bônus` : ''}`,
        quantity: 1,
        unit_price: pack.price,
        payer: {
          email: user.email,
          name: user.full_name
        },
        address: null,
        is_virtual: true
      });

      if (response.data.success) {
        setPixData(response.data);
        setShowPixPopup(true);
        toast.success("QR Code PIX gerado com sucesso!");
      } else {
        toast.error("Erro ao gerar PIX. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao processar PIX:", error);
      toast.error("Erro ao processar PIX. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('createCardPayment', {
        product_id: `ouros_${pack.amount}`,
        product_name: `${pack.amount} Ouros${pack.bonus > 0 ? ` + ${pack.bonus} Bônus` : ''}`,
        quantity: 1,
        unit_price: pack.price,
        payer: {
          email: user.email,
          name: user.full_name
        },
        card: cardData,
        address: null,
        is_virtual: true
      });

      if (response.data.success) {
        toast.success("Pagamento processado com sucesso!");
        
        setTimeout(async () => {
          const totalOuros = pack.amount + pack.bonus;
          await base44.auth.updateMe({
            ouros: (user.ouros || 0) + totalOuros
          });
          
          toast.success(`${totalOuros} Ouros adicionados à sua carteira! ✨`);
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Erro ao processar pagamento. Verifique os dados do cartão.");
      }
    } catch (error) {
      console.error("Erro ao processar cartão:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setPixData(null);
    setCardData({
      number: "",
      name: "",
      expiry: "",
      cvv: ""
    });
    setPaymentMethod("pix");
    setShowPixPopup(false);
    onClose();
  };

  const handleClosePixPopup = () => {
    setShowPixPopup(false);
    setPixData(null);
  };

  if (!isOpen || !pack) return null;

  const totalOuros = pack.amount + pack.bonus;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full md:max-w-2xl bg-gradient-to-b from-slate-900 to-slate-800 md:rounded-2xl shadow-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-purple-900/30 flex-shrink-0">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                Pagamento de Ouros
              </h2>
              <button
                onClick={handleClose}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </button>
            </div>

            {/* Conteúdo Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Resumo do Pacote */}
                <Card className="bg-slate-800/50 border-purple-900/30 p-4 md:p-6">
                  <div className="text-center">
                    <Coins className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-2">
                      {pack.amount} Ouros
                    </h3>
                    {pack.bonus > 0 && (
                      <div className="mb-2 md:mb-3">
                        <span className="bg-green-600 text-white text-xs md:text-sm px-3 py-1 rounded-full font-semibold">
                          +{pack.bonus} BÔNUS
                        </span>
                      </div>
                    )}
                    <p className="text-gray-400 text-sm md:text-base mb-3 md:mb-4">
                      Total: {totalOuros} ouros
                    </p>
                    <p className="text-3xl md:text-4xl font-bold text-white">
                      R$ {pack.price.toFixed(2)}
                    </p>
                  </div>
                </Card>

                {/* Métodos de Pagamento */}
                <Card className="bg-slate-800/50 border-purple-900/30 p-4 md:p-6">
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                    <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 mb-4 md:mb-6">
                      <TabsTrigger 
                        value="pix" 
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs md:text-sm"
                      >
                        <QrCode className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        PIX
                      </TabsTrigger>
                      <TabsTrigger 
                        value="card" 
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs md:text-sm"
                      >
                        <CreditCard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Cartão
                      </TabsTrigger>
                    </TabsList>

                    {/* PIX */}
                    <TabsContent value="pix">
                      <div className="text-center">
                        <p className="text-gray-300 text-sm md:text-base mb-4 md:mb-6">
                          Pagamento instantâneo via PIX.
                          <br className="hidden md:block" />
                          Seus ouros serão creditados automaticamente após a confirmação.
                        </p>
                        <Button
                          onClick={handlePixPayment}
                          disabled={processing}
                          className="w-full bg-gradient-to-r from-[#A85DED] via-purple-600 to-[#A85DED] hover:from-[#9547D9] hover:via-purple-700 hover:to-[#9547D9] h-12 md:h-14 text-sm md:text-base font-semibold shadow-lg shadow-[#A85DED]/50"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                              Gerando QR Code...
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Gerar QR Code PIX
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Cartão de Crédito */}
                    <TabsContent value="card">
                      <div className="space-y-3 md:space-y-4">
                        <div>
                          <label className="block text-xs md:text-sm text-gray-300 mb-1.5 md:mb-2">
                            Número do Cartão
                          </label>
                          <Input
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                            placeholder="0000 0000 0000 0000"
                            className="bg-slate-900 border-purple-900/30 text-white h-10 md:h-12 text-sm md:text-base"
                          />
                        </div>

                        <div>
                          <label className="block text-xs md:text-sm text-gray-300 mb-1.5 md:mb-2">
                            Nome no Cartão
                          </label>
                          <Input
                            value={cardData.name}
                            onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                            placeholder="NOME COMPLETO"
                            className="bg-slate-900 border-purple-900/30 text-white h-10 md:h-12 text-sm md:text-base"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="block text-xs md:text-sm text-gray-300 mb-1.5 md:mb-2">
                              Validade
                            </label>
                            <Input
                              value={cardData.expiry}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                setCardData({ ...cardData, expiry: value });
                              }}
                              placeholder="MM/AA"
                              maxLength={5}
                              className="bg-slate-900 border-purple-900/30 text-white h-10 md:h-12 text-sm md:text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-xs md:text-sm text-gray-300 mb-1.5 md:mb-2">
                              CVV
                            </label>
                            <Input
                              value={cardData.cvv}
                              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              placeholder="000"
                              maxLength={4}
                              type="password"
                              className="bg-slate-900 border-purple-900/30 text-white h-10 md:h-12 text-sm md:text-base"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handleCardPayment}
                          disabled={processing || !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv}
                          className="w-full bg-gradient-to-r from-[#A85DED] via-purple-600 to-[#A85DED] hover:from-[#9547D9] hover:via-purple-700 hover:to-[#9547D9] h-12 md:h-14 text-sm md:text-base font-semibold shadow-lg shadow-[#A85DED]/50"
                        >
                          {processing ? (
                            <>
                              <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Pagar R$ {pack.price.toFixed(2)}
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Selo de Segurança */}
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-400">
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                  Pagamento 100% seguro via Mercado Pago
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Popup QR Code PIX */}
      <AnimatePresence>
        {showPixPopup && pixData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={handleClosePixPopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl border-2 border-purple-500/30 overflow-hidden"
            >
              {/* Header com Gradiente */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                <QrCode className="w-12 h-12 text-white mx-auto mb-3 relative z-10" />
                <h3 className="text-2xl font-bold text-white relative z-10">
                  QR Code PIX
                </h3>
                <p className="text-purple-100 text-sm mt-2 relative z-10">
                  Escaneie ou copie o código
                </p>
                
                {/* Botão Fechar */}
                <button
                  onClick={handleClosePixPopup}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition z-20"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6">
                {/* QR Code */}
                {pixData.qr_code_base64 && (
                  <div className="bg-white p-4 rounded-2xl shadow-xl mx-auto inline-block">
                    <img 
                      src={pixData.qr_code_base64} 
                      alt="QR Code PIX" 
                      className="w-64 h-64" 
                    />
                  </div>
                )}

                {/* Valor */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1">Valor do Pagamento</p>
                  <p className="text-3xl font-bold text-white">
                    R$ {pack.price.toFixed(2)}
                  </p>
                </div>

                {/* Código PIX Copia e Cola */}
                <div>
                  <p className="text-xs text-gray-400 mb-2 text-center">
                    Código PIX Copia e Cola:
                  </p>
                  <div className="bg-slate-900 p-4 rounded-xl border border-purple-900/30">
                    <p className="text-xs text-white break-all font-mono leading-relaxed text-center">
                      {pixData.qr_code}
                    </p>
                  </div>
                </div>

                {/* Botão Copiar */}
                <Button
                  onClick={copyPixCode}
                  className="w-full bg-gradient-to-r from-[#A85DED] via-purple-600 to-[#A85DED] hover:from-[#9547D9] hover:via-purple-700 hover:to-[#9547D9] h-14 text-base font-semibold shadow-lg shadow-[#A85DED]/50"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Código Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copiar Código PIX
                    </>
                  )}
                </Button>

                {/* Info */}
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Após o pagamento, seus ouros serão creditados automaticamente em sua carteira.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}