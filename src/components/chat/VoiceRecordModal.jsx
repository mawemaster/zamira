import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Mic, Square, Play, Pause, Trash2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function VoiceRecordModal({ isOpen, onClose, onVoiceSent, user }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioChunks(chunks);
        
        // Parar stream
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
      toast.error("Não foi possível acessar o microfone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setAudioChunks([]);
    setRecordingTime(0);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const sendVoice = async () => {
    if (!audioChunks.length) return;
    
    setUploading(true);
    try {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      onVoiceSent(file_url);
      deleteRecording();
      onClose();
      toast.success("Áudio enviado! 🎤");
    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      toast.error("Erro ao enviar áudio");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    deleteRecording();
    if (isRecording) {
      stopRecording();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-2 border-purple-500/30 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">Gravar Áudio</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Visualização */}
            <div className="mb-8">
              <div className="relative w-48 h-48 mx-auto">
                {/* Círculo Pulsante */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isRecording && !isPaused && (
                    <>
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute w-full h-full rounded-full bg-purple-600/30"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        }}
                        className="absolute w-full h-full rounded-full bg-purple-600/20"
                      />
                    </>
                  )}
                  
                  {/* Ícone Central */}
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center ${
                      isRecording
                        ? 'bg-gradient-to-br from-red-600 to-red-700'
                        : 'bg-gradient-to-br from-purple-600 to-purple-700'
                    }`}
                  >
                    <Mic className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mt-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-sm text-gray-400">
                  {isRecording
                    ? isPaused
                      ? "Gravação pausada"
                      : "Gravando..."
                    : audioURL
                    ? "Áudio gravado"
                    : "Pronto para gravar"}
                </p>
              </div>
            </div>

            {/* Preview do Áudio */}
            {audioURL && !isRecording && (
              <div className="mb-6 bg-slate-800/50 p-4 rounded-xl">
                <audio controls className="w-full">
                  <source src={audioURL} type="audio/webm" />
                </audio>
              </div>
            )}

            {/* Controles */}
            <div className="flex items-center justify-center gap-4">
              {!isRecording && !audioURL && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 px-8"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Iniciar Gravação
                </Button>
              )}

              {isRecording && (
                <>
                  {!isPaused ? (
                    <Button
                      onClick={pauseRecording}
                      size="icon"
                      variant="outline"
                      className="h-14 w-14 rounded-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                    >
                      <Pause className="w-6 h-6" />
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeRecording}
                      size="icon"
                      variant="outline"
                      className="h-14 w-14 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500/10"
                    >
                      <Play className="w-6 h-6" />
                    </Button>
                  )}

                  <Button
                    onClick={stopRecording}
                    size="icon"
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                </>
              )}

              {audioURL && !isRecording && (
                <>
                  <Button
                    onClick={deleteRecording}
                    size="icon"
                    variant="outline"
                    className="h-14 w-14 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-6 h-6" />
                  </Button>

                  <Button
                    onClick={sendVoice}
                    disabled={uploading}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-14 px-8"
                  >
                    {uploading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                        </motion.div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Áudio
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Instruções */}
            <p className="text-center text-xs text-gray-500 mt-6">
              {!isRecording && !audioURL && "Clique para começar a gravar sua mensagem"}
              {isRecording && "Clique no quadrado para parar a gravação"}
              {audioURL && !isRecording && "Ouça a prévia e envie ou delete para gravar novamente"}
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}