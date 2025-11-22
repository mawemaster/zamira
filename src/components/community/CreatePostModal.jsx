import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Sparkles, Image as ImageIcon, Mic, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const postTypes = [
  { value: "simples", label: "Post Simples", emoji: "💭", description: "Compartilhe um pensamento" },
  { value: "pergunta", label: "Pergunta", emoji: "❓", description: "Busque sabedoria da comunidade" },
  { value: "dica", label: "Dica", emoji: "💡", description: "Compartilhe conhecimento" },
  { value: "reflexao", label: "Reflexão", emoji: "🧘", description: "Uma meditação profunda" },
  { value: "ritual", label: "Ritual", emoji: "🔮", description: "Descreva uma prática mística" }
];

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

export default function CreatePostModal({ user, onClose, onSubmit, isLoading }) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("simples");
  const [images, setImages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const archColor = archetypeColors[user?.archetype || 'none'];
  const selectedType = postTypes.find(t => t.value === postType);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      toast.success(`${files.length} imagem(ns) enviada(s)!`);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar imagens");
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAudioUrl(file_url);
      setAudioFile(file);
      toast.success("Áudio enviado!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar áudio");
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
        
        setUploading(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
          setAudioUrl(file_url);
          setAudioFile(audioFile);
          toast.success("Gravação salva!");
        } catch (error) {
          console.error("Erro ao fazer upload:", error);
          toast.error("Erro ao salvar gravação");
        } finally {
          setUploading(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      toast.success("Gravando áudio...");
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      toast.error("Erro ao acessar microfone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = () => {
    setAudioUrl("");
    setAudioFile(null);
  };

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0 && !audioUrl) {
      toast.error("Adicione texto, imagem ou áudio ao seu post");
      return;
    }

    onSubmit({
      content: content.trim(),
      post_type: postType,
      images,
      audio_url: audioUrl
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/30 p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: archColor }}
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white">
                    {user?.display_name || user?.full_name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">Criar emanação mística</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Dropdown para tipo de post */}
              <div>
                <label className="block text-sm font-semibold text-purple-300 mb-2">
                  Tipo de Emanação
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full bg-slate-800 border-purple-900/30 text-white hover:bg-slate-700 justify-start"
                    >
                      <span className="mr-2 text-lg">{selectedType?.emoji}</span>
                      <span className="flex-1 text-left">{selectedType?.label}</span>
                      <span className="text-xs text-gray-400">{selectedType?.description}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full bg-slate-900 border-purple-900/30">
                    {postTypes.map(type => (
                      <DropdownMenuItem 
                        key={type.value} 
                        onClick={() => setPostType(type.value)}
                        className="text-white hover:bg-slate-800 cursor-pointer"
                      >
                        <span className="mr-2 text-lg">{type.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{type.label}</p>
                          <p className="text-xs text-gray-400">{type.description}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Compartilhe sua sabedoria com o universo..."
                  className="bg-slate-800 border-purple-900/30 text-white placeholder:text-gray-400 min-h-[150px] text-base resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {content.length} / 5000
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {audioUrl && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-300 font-medium">Áudio anexado</span>
                    </div>
                    <button
                      onClick={removeAudio}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}

              {/* Botões de Média - MELHORADOS PARA MOBILE */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20 px-3 py-2 touch-manipulation"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  <span className="text-xs md:text-sm">Imagens</span>
                </Button>

                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploading || audioUrl}
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20 px-3 py-2 touch-manipulation"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  <span className="text-xs md:text-sm">Enviar Áudio</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={recording ? stopRecording : startRecording}
                  disabled={uploading || audioUrl}
                  className={`border-purple-500/30 hover:bg-purple-900/20 px-3 py-2 touch-manipulation ${
                    recording ? 'text-red-400 animate-pulse' : 'text-purple-300'
                  }`}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  <span className="text-xs md:text-sm">{recording ? 'Parar' : 'Gravar'}</span>
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-purple-900/30 text-purple-300 hover:bg-purple-900/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || uploading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  style={{
                    background: `linear-gradient(135deg, ${archColor}, ${archColor}DD)`
                  }}
                >
                  {isLoading || uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {uploading ? 'Enviando...' : 'Publicando...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}