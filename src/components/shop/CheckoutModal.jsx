import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Loader2, ShieldCheck, CreditCard, ArrowLeft, QrCode, Copy, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutModal({ isOpen, onClose, product, quantity, user }) {
  const [step, setStep] = useState("address"); // address, payment, processing, success
  const [useExistingAddress, setUseExistingAddress] = useState(null);
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState({
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: ""
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix"); // pix, card
  const [pixData, setPixData] = useState(null);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && user?.address?.cep) {
      setUseExistingAddress(null);
    }
  }, [isOpen, user]);

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCep(value);

    if (value.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();

        if (data.erro) {
          alert("CEP não encontrado");
        } else {
          setAddress({
            ...address,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || ""
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleContinueToPayment = () => {
    if (useExistingAddress === true) {
      setAddress({
        rua: user.address.street,
        numero: user.address.number,
        complemento: user.address.complement || "",
        bairro: user.address.neighborhood,
        cidade: user.address.city,
        estado: user.address.state
      });
    }
    setStep("payment");
  };

  const handlePixPayment = async () => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('createPixPayment', {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        payer: {
          email: user.email,
          name: user.full_name
        },
        address: {
          ...address,
          cep
        }
      });

      if (response.data.success) {
        setPixData(response.data);
        setStep("success");
      } else {
        alert("Erro ao gerar PIX. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao processar PIX:", error);
      alert("Erro ao processar PIX. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('createCardPayment', {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
        payer: {
          email: user.email,
          name: user.full_name
        },
        card: cardData,
        address: {
          ...address,
          cep
        }
      });

      if (response.data.success) {
        setStep("success");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 3000);
      } else {
        alert("Erro ao processar pagamento. Verifique os dados do cartão.");
      }
    } catch (error) {
      console.error("Erro ao processar cartão:", error);
      alert("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const subtotal = product.price * quantity;
  const frete = 0;
  const total = subtotal + frete;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto"
      >
        <div className="min-h-screen p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pt-4">
              <button
                onClick={step === "payment" ? () => setStep("address") : onClose}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm md:text-base">{step === "payment" ? "Voltar" : "Voltar para a Loja"}</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#fbbf24] mb-2">
                Finalize o seu ritual de compra de forma segura
              </h1>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Formulário */}
              <div>
                {step === "address" && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Escolha de Endereço */}
                    {user?.address?.cep && useExistingAddress === null && (
                      <Card className="bg-[#1a1a2e] border-purple-900/30 p-6">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                          Usar endereço cadastrado?
                        </h3>
                        <div className="bg-[#0f0f1e] p-4 rounded-lg mb-4">
                          <p className="text-sm text-gray-300">
                            {user.address.street}, {user.address.number}
                            {user.address.complement ? ` - ${user.address.complement}` : ""}
                          </p>
                          <p className="text-sm text-gray-300">
                            {user.address.neighborhood} - {user.address.city}/{user.address.state}
                          </p>
                          <p className="text-sm text-gray-400">CEP: {user.address.cep}</p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => setUseExistingAddress(true)}
                            className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed]"
                          >
                            Sim, usar este
                          </Button>
                          <Button
                            onClick={() => setUseExistingAddress(false)}
                            variant="outline"
                            className="flex-1 border-white/20"
                          >
                            Usar outro
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* Formulário de Endereço */}
                    {(useExistingAddress === false || (!user?.address?.cep && useExistingAddress === null)) && (
                      <>
                        <Card className="bg-[#1a1a2e] border-purple-900/30 p-6">
                          <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                            Informações de Contato
                          </h3>
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">E-mail</label>
                            <Input
                              value={user.email}
                              disabled
                              className="bg-[#0f0f1e] border-purple-900/30 text-gray-400"
                            />
                          </div>
                        </Card>

                        <Card className="bg-[#1a1a2e] border-purple-900/30 p-6">
                          <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                            Endereço de Entrega
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">CEP</label>
                              <div className="relative">
                                <Input
                                  value={cep}
                                  onChange={handleCepChange}
                                  placeholder="00000-000"
                                  maxLength={8}
                                  className="bg-[#0f0f1e] border-purple-900/30 text-white"
                                />
                                {loadingCep && (
                                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 animate-spin" />
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Rua</label>
                              <Input
                                value={address.rua}
                                onChange={(e) => setAddress({ ...address, rua: e.target.value })}
                                className="bg-[#0f0f1e] border-purple-900/30 text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">Número</label>
                                <Input
                                  value={address.numero}
                                  onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                                  className="bg-[#0f0f1e] border-purple-900/30 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">Complemento</label>
                                <Input
                                  value={address.complemento}
                                  onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                                  placeholder="Apto, bloco, etc."
                                  className="bg-[#0f0f1e] border-purple-900/30 text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Bairro</label>
                              <Input
                                value={address.bairro}
                                onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                                className="bg-[#0f0f1e] border-purple-900/30 text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">Cidade</label>
                                <Input
                                  value={address.cidade}
                                  onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                                  className="bg-[#0f0f1e] border-purple-900/30 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">Estado</label>
                                <Input
                                  value={address.estado}
                                  onChange={(e) => setAddress({ ...address, estado: e.target.value })}
                                  maxLength={2}
                                  className="bg-[#0f0f1e] border-purple-900/30 text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </>
                    )}
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    <Card className="bg-[#1a1a2e] border-purple-900/30 p-6">
                      <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                        <TabsList className="grid w-full grid-cols-2 bg-[#0f0f1e]">
                          <TabsTrigger value="pix" className="data-[state=active]:bg-purple-600">
                            <QrCode className="w-4 h-4 mr-2" />
                            PIX
                          </TabsTrigger>
                          <TabsTrigger value="card" className="data-[state=active]:bg-purple-600">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Cartão de Crédito
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pix" className="mt-6">
                          <div className="text-center">
                            <p className="text-gray-300 mb-6">
                              Clique no botão abaixo para gerar o QR Code e o código para pagamento com PIX.
                            </p>
                            <Button
                              onClick={handlePixPayment}
                              disabled={processing}
                              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] h-14 text-lg"
                            >
                              {processing ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Gerando PIX...
                                </>
                              ) : (
                                <>
                                  <QrCode className="w-5 h-5 mr-2" />
                                  Pagar com PIX
                                </>
                              )}
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="card" className="mt-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Número do Cartão</label>
                              <Input
                                value={cardData.number}
                                onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                placeholder="0000 0000 0000 0000"
                                className="bg-[#0f0f1e] border-purple-900/30 text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Nome no Cartão</label>
                              <Input
                                value={cardData.name}
                                onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                                placeholder="NOME COMPLETO"
                                className="bg-[#0f0f1e] border-purple-900/30 text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">Validade</label>
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
                                  className="bg-[#0f0f1e] border-purple-900/30 text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">CVV</label>
                                <Input
                                  value={cardData.cvv}
                                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                  placeholder="000"
                                  maxLength={4}
                                  type="password"
                                  className="bg-[#0f0f1e] border-purple-900/30 text-white"
                                />
                              </div>
                            </div>

                            <Button
                              onClick={handleCardPayment}
                              disabled={processing || !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv}
                              className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold h-14 text-lg"
                            >
                              {processing ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Processando...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-5 h-5 mr-2" />
                                  Pagar R$ {total.toFixed(2)}
                                </>
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </Card>
                  </motion.div>
                )}

                {step === "success" && pixData && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Card className="bg-[#1a1a2e] border-purple-900/30 p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          PIX Gerado com Sucesso!
                        </h3>
                        <p className="text-gray-400 mb-6">
                          Escaneie o QR Code ou copie o código abaixo para pagar
                        </p>

                        {/* QR Code */}
                        <div className="bg-white p-4 rounded-lg mb-6 inline-block">
                          <img src={pixData.qr_code_base64} alt="QR Code PIX" className="w-64 h-64" />
                        </div>

                        {/* Código PIX */}
                        <div className="bg-[#0f0f1e] p-4 rounded-lg mb-4">
                          <p className="text-xs text-gray-400 mb-2">Código PIX Copia e Cola:</p>
                          <p className="text-sm text-white break-all font-mono">{pixData.qr_code}</p>
                        </div>

                        <Button
                          onClick={copyPixCode}
                          className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] h-12"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5 mr-2" />
                              Copiar Código PIX
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-gray-500 mt-4">
                          Após o pagamento, seu pedido será processado automaticamente.
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Resumo do Pedido */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="lg:sticky lg:top-24 h-fit"
              >
                <Card className="bg-[#1a1a2e] border-purple-900/30 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Resumo do Pedido
                  </h3>

                  {/* Item */}
                  <div className="flex gap-4 mb-6">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-400">Qtd: {quantity}</p>
                      <p className="text-sm font-bold text-[#fbbf24] mt-1">
                        R$ {(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-purple-900/30 mb-4" />

                  {/* Totais */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Frete</span>
                      <span className="text-white">{frete === 0 ? "A calcular" : `R$ ${frete.toFixed(2)}`}</span>
                    </div>
                    <Separator className="bg-purple-900/30" />
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-white">Total</span>
                      <span className="text-xl font-bold text-[#fbbf24]">
                        R$ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  {step === "address" && (
                    <Button
                      onClick={handleContinueToPayment}
                      disabled={useExistingAddress === null || (useExistingAddress === false && (!cep || !address.rua || !address.numero || !address.bairro || !address.cidade || !address.estado))}
                      className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-black font-bold h-14 text-lg rounded-full"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Continuar para Pagamento
                    </Button>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Ambiente de pagamento 100% seguro via Mercado Pago.
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}