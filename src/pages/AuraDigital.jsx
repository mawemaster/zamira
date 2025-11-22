import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Zap, Loader2, Download, Share2, RefreshCw } from "lucide-react";

const AURA_COLORS = {
  red: { name: 'Vermelho', meaning: 'Energia, paixão, força de vontade', chakra: 'Raiz' },
  orange: { name: 'Laranja', meaning: 'Criatividade, entusiasmo, vitalidade', chakra: 'Sacral' },
  yellow: { name: 'Amarelo', meaning: 'Alegria, inteligência, confiança', chakra: 'Plexo Solar' },
  green: { name: 'Verde', meaning: 'Cura, amor, harmonia', chakra: 'Cardíaco' },
  blue: { name: 'Azul', meaning: 'Comunicação, verdade, paz', chakra: 'Laríngeo' },
  indigo: { name: 'Índigo', meaning: 'Intuição, sabedoria, percepção', chakra: 'Terceiro Olho' },
  violet: { name: 'Violeta', meaning: 'Espiritualidade, transformação, conexão', chakra: 'Coroa' },
  white: { name: 'Branco', meaning: 'Pureza, proteção, iluminação', chakra: 'Todos' },
  gold: { name: 'Dourado', meaning: 'Divindade, sabedoria superior, mestria', chakra: 'Coroa' }
};

export default function AuraDigitalPage() {
  const [user, setUser] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [auraResult, setAuraResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    loadUser();
    return () => {
      stopCamera();
    };
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
      }
      setShowCamera(true);
    } catch (error) {
      alert('Erro ao acessar câmera: ' + error.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const photoUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(photoUrl);
      stopCamera();
      analyzeAura(photoUrl);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target.result);
        analyzeAura(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeAura = async (photoBase64) => {
    setIsScanning(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta foto de uma pessoa e determine:
1. A cor principal da aura (escolha entre: red, orange, yellow, green, blue, indigo, violet, white, gold)
2. A cor secundária da aura
3. A emoção predominante detectada na expressão facial
4. O nível de energia (0-100)
5. Uma interpretação profunda e inspiradora do estado energético atual

Retorne apenas no formato JSON solicitado.`,
        response_json_schema: {
          type: "object",
          properties: {
            aura_color: { type: "string" },
            secondary_color: { type: "string" },
            emotion_detected: { type: "string" },
            energy_level: { type: "number" },
            interpretation: { type: "string" }
          }
        },
        file_urls: [photoBase64]
      });

      const result = {
        photo_url: photoBase64,
        aura_color: response.aura_color || 'violet',
        secondary_color: response.secondary_color || 'indigo',
        emotion_detected: response.emotion_detected || 'Equilibrada',
        energy_level: response.energy_level || 75,
        interpretation: response.interpretation || 'Sua energia está em harmonia com o universo.',
        recommendations: [
          'Pratique meditação para equilibrar sua energia',
          'Passe tempo na natureza para fortalecer seu campo áurico',
          'Use cristais relacionados à sua cor de aura',
          'Faça exercícios de respiração consciente'
        ]
      };

      await base44.entities.AuraReading.create({
        ...result,
        user_id: user.id,
        scanned_at: new Date().toISOString()
      });

      setAuraResult(result);
    } catch (error) {
      console.error("Erro na análise:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setCapturedPhoto(null);
    setAuraResult(null);
    setShowCamera(false);
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            Aura Digital
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Revelador da Aura - visualize sua energia</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!capturedPhoto && !showCamera && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-slate-800/50 border-orange-500/30 p-6 md:p-8 text-center">
                <h3 className="text-xl md:text-2xl font-bold text-orange-300 mb-4">
                  Posicione seu rosto e clique em Capturar
                </h3>
                <p className="text-slate-300 mb-6 text-sm md:text-base">
                  Nossa IA analisará sua expressão facial e energia para revelar a cor da sua aura atual
                </p>

                <div className="bg-gradient-to-r from-orange-900/30 to-pink-900/30 border border-orange-500/30 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-bold text-orange-300 mb-2">Como funciona:</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Análise de expressões faciais por IA</li>
                    <li>• Detecção do estado emocional atual</li>
                    <li>• Mapeamento de energia dos chakras</li>
                    <li>• Interpretação personalizada da aura</li>
                  </ul>
                </div>

                <div className="grid gap-3">
                  <Button
                    onClick={startCamera}
                    className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 py-6 text-base md:text-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Ativar Câmera
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full border-orange-500/30 text-orange-300 py-6 text-base md:text-lg"
                  >
                    Escolher Foto da Galeria
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {showCamera && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-slate-800/50 border-orange-500/30 p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-orange-300 mb-4 text-center">
                  Posicione seu rosto e clique em Capturar
                </h3>
                
                <div className="relative aspect-square max-w-lg mx-auto bg-black rounded-2xl overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[70%] h-[70%] border-4 border-dashed border-orange-500/60 rounded-full" />
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={capturePhoto}
                    className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar
                  </Button>
                  <Button
                    onClick={() => { stopCamera(); }}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Card className="bg-slate-800/50 border-orange-500/30 p-6 md:p-8">
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <img src={capturedPhoto} className="w-full h-full object-cover rounded-full border-4 border-orange-500/50" />
                  
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full" />
                  </motion.div>
                </div>

                <motion.h2
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl md:text-3xl font-bold text-orange-300 mb-4"
                >
                  Analisando sua Aura...
                </motion.h2>
                <p className="text-slate-400 mb-2">IA processando expressões faciais</p>
                <p className="text-sm text-slate-500">Mapeando campo energético</p>
              </Card>
            </motion.div>
          )}

          {auraResult && !isScanning && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-slate-800/50 border-orange-500/30 p-4 md:p-6 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-orange-300 mb-4 text-center">
                  Sua Aura Revelada
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <img src={auraResult.photo_url} className="w-full aspect-square object-cover rounded-xl" />
                    <div className="absolute inset-0 rounded-xl" style={{
                      background: `radial-gradient(circle, transparent 40%, ${auraResult.aura_color}60 70%, ${auraResult.aura_color}30 100%)`
                    }} />
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-orange-900/30 to-pink-900/30 rounded-xl">
                      <h4 className="font-bold text-orange-300 mb-2">Cor Primária da Aura</h4>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full" style={{backgroundColor: auraResult.aura_color}} />
                        <div>
                          <p className="font-bold">{AURA_COLORS[auraResult.aura_color]?.name}</p>
                          <p className="text-xs text-slate-400">Chakra: {AURA_COLORS[auraResult.aura_color]?.chakra}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">{AURA_COLORS[auraResult.aura_color]?.meaning}</p>
                    </div>

                    <div className="p-4 bg-slate-700/50 rounded-xl">
                      <h4 className="font-bold text-orange-300 mb-2">Emoção Detectada</h4>
                      <p className="text-lg">{auraResult.emotion_detected}</p>
                    </div>

                    <div className="p-4 bg-slate-700/50 rounded-xl">
                      <h4 className="font-bold text-orange-300 mb-2">Nível de Energia</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-slate-600 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${auraResult.energy_level}%` }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                          />
                        </div>
                        <span className="font-bold">{auraResult.energy_level}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl mb-6">
                  <h4 className="font-bold text-purple-300 mb-3">Interpretação</h4>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{auraResult.interpretation}</p>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-xl mb-6">
                  <h4 className="font-bold text-blue-300 mb-3">Recomendações</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {auraResult.recommendations?.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="border-slate-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Nova Leitura
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-400"
                    onClick={() => {
                      navigator.share?.({ 
                        title: 'Minha Aura Digital',
                        text: `Minha aura é ${AURA_COLORS[auraResult.aura_color]?.name}!`
                      });
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-400"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = 'minha-aura.jpg';
                      link.href = auraResult.photo_url;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}