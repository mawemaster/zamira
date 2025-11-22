
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Sparkles, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { Card } from "@/components/ui/card"; // Card component is no longer used for the main modal body, but might be used for audio items.
import { Button } from "@/components/ui/button";

export default function VocemModal({ isOpen, onClose, onPlayAudio }) { // onPlayAudio prop retained to preserve functionality
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: audios } = useQuery({
    queryKey: ['vocem-audios'],
    queryFn: () => base44.entities.VoiceContent.filter({}, "order", 100),
    enabled: isOpen
  });

  const handlePlayAudio = (audio) => {
    if (!audio || !audio.audio_url) return;
    
    setSelectedAudio(audio);
    
    // Se for YouTube/Drive, usar link direto, senão usar URL do arquivo
    let audioUrl = audio.audio_url;
    
    if (audio.audio_url && (audio.audio_url.includes('youtube.com') || audio.audio_url.includes('youtu.be'))) {
      const videoId = getYouTubeVideoId(audio.audio_url);
      if (videoId) {
        audioUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    onPlayAudio({
      title: audio.title || 'Sem título',
      description: audio.description || '',
      url: audioUrl,
      duration: audio.duration ? `${Math.floor(audio.duration / 60)}:${(audio.duration % 60).toString().padStart(2, '0')}` : null
    });
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch')) return url.split('v=')[1]?.split('&')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
    return null;
  };

  const filteredAudios = audios?.filter(audio =>
    audio.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // if (!isOpen) return null; // Removed as per outline, replaced by {isOpen && ...} inside AnimatePresence

  return (
    <AnimatePresence>
      {isOpen && ( // Conditionally render the modal when isOpen is true
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" // Updated className
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} // Updated initial/animate/exit
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" // Updated className, replaced Card styling
          >
            <div className="p-6 border-b border-purple-500/30"> {/* Updated padding and structure */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Voltar para Área do Aluno</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* The original title, description, and search input from the header are removed as per the outline's new header structure. 
                If search functionality is needed, the input should be re-added in a new dedicated section below the header.
                For now, the searchTerm state will remain, but the input to change it is absent. */}
            
            {/* Re-adding a section for title/count and search input to preserve functionality, 
                as the outline did not explicitly remove these features, only changed the header structure. 
                This section is placed right after the new button header. */}
            <div className="p-4 md:p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-3xl font-bold text-white mb-2">
                    🎵 Vocem - Meditações Guiadas
                  </h2>
                  <p className="text-purple-300 text-sm md:text-base">
                    {audios?.length || 0} áudios místicos disponíveis
                  </p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Buscar meditação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 md:py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-200px)]"> 
              <div className="grid gap-3">
                {filteredAudios.length > 0 ? (
                  filteredAudios.map((audio, index) => (
                    <motion.div
                      key={audio.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card 
                        className={`p-4 bg-slate-800/60 border-purple-500/20 hover:border-purple-500/40 transition cursor-pointer group ${
                          selectedAudio?.id === audio.id ? 'border-purple-500 bg-purple-900/30' : ''
                        }`}
                        onClick={() => handlePlayAudio(audio)}
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                              selectedAudio?.id === audio.id 
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                                : 'bg-gradient-to-br from-purple-600/50 to-pink-600/50 group-hover:from-purple-500 group-hover:to-pink-500'
                            } transition`}>
                              <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-1" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm md:text-lg mb-1 truncate">
                              {audio.title}
                            </h3>
                            <p className="text-purple-300 text-xs md:text-sm truncate">
                              {audio.description}
                            </p>
                          </div>

                          <div className="flex-shrink-0">
                            <span className="text-gray-400 text-xs md:text-sm">
                              {audio.duration ? `${Math.floor(audio.duration / 60)}:${(audio.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-purple-500/50 mx-auto mb-3" />
                    <p className="text-gray-400 text-lg">
                      Nenhuma meditação encontrada
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-3 md:p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-purple-200 text-xs md:text-sm">
                  💡 <strong>Dica:</strong> Clique em qualquer áudio para começar a tocar. 
                  O player aparecerá na parte inferior da tela e você poderá arrastá-lo 
                  para qualquer canto enquanto ouve.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
