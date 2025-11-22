
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Play, CheckCircle, ChevronDown, ChevronUp, Sparkles, BookOpen, Volume2, MapPin, Package, X, Award, Target, Video
} from "lucide-react";
import VocemModal from "../components/audio/VocemModal";
import VideoPlayer from "../components/course/VideoPlayer";
import MinimizedVideoPlayer from "../components/course/MinimizedVideoPlayer";

export default function AreaDoAlunoPage() {
  const [user, setUser] = useState(null);
  const [expandedModules, setExpandedModules] = useState([1]);
  const [showVocemModal, setShowVocemModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [minimizedLesson, setMinimizedLesson] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const { data: courses } = useQuery({
    queryKey: ['tarot-courses'],
    queryFn: () => base44.entities.TarotCourse.filter({ is_active: true }, "lesson_number", 100),
    enabled: !!user
  });

  const { data: myOrder } = useQuery({
    queryKey: ['my-manual-order', user?.id],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({
        user_id: user.id,
        product_name: { $regex: 'Manual', $options: 'i' }
      }, "-created_date", 1);
      return orders[0];
    },
    enabled: !!user
  });

  const { data: lastWatchedProgress } = useQuery({
    queryKey: ['last-watched', user?.id],
    queryFn: async () => {
      const allProgress = await base44.entities.CourseProgress.filter({
        user_id: user.id
      }, "-last_watched", 1);

      if (allProgress && allProgress.length > 0) {
        const progressItem = allProgress[0];
        const course = courses?.find(c => c.id === progressItem.course_id);
        return course ? { ...course, progress: progressItem } : null;
      }
      return null;
    },
    enabled: !!user && !!courses
  });

  const toggleModule = (moduleId) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const handlePlayAudio = (audio) => {
    if (!audio) return;
    window.dispatchEvent(new CustomEvent('playGlobalAudio', { detail: audio }));
    setShowVocemModal(false);
  };

  const handleTrackOrder = () => {
    if (!user.address || !user.address.street) {
      alert('Por favor, adicione seu endereço completo em "Minha Conta" primeiro');
      navigate(createPageUrl("MinhaConta"));
      return;
    }

    setShowTrackingModal(true);
  };

  const openGoogleMaps = () => {
    const address = `${user.address.street}, ${user.address.number}, ${user.address.city} - ${user.address.state}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const shippingStatuses = {
    aguardando: { label: 'Aguardando Envio', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
    preparando: { label: 'Preparando Pedido', color: 'bg-blue-100 text-blue-800', icon: '📋' },
    enviado: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
    em_transito: { label: 'Em Trânsito', color: 'bg-purple-100 text-purple-800', icon: '🛣️' },
    entregue: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: '✅' }
  };

  const organizedModules = courses ? courses.reduce((acc, course) => {
    const moduleId = Math.floor((course.lesson_number - 1) / 3) + 1;
    if (!acc[moduleId]) {
      acc[moduleId] = {
        id: moduleId,
        title: `Módulo ${moduleId}`,
        lessons: []
      };
    }
    acc[moduleId].lessons.push(course);
    return acc;
  }, {}) : {};

  const modulesArray = Object.values(organizedModules);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white p-4 md:p-6 pb-32">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Portal Tarot
          </h1>
          <p className="text-gray-400 text-lg">
            Sua jornada de aprendizado místico
          </p>
        </motion.div>

        {!selectedLesson && !minimizedLesson && lastWatchedProgress && lastWatchedProgress.progress && lastWatchedProgress.progress.video_progress > 0 && !lastWatchedProgress.progress.is_completed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Play className="w-5 h-5 text-purple-400" />
                  Continuar Assistindo
                </h3>
                <p className="text-sm text-slate-400">{lastWatchedProgress.title}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMinimizedLesson(lastWatchedProgress)}
                className="text-purple-400 hover:text-purple-300"
              >
                Minimizar
              </Button>
            </div>

            <VideoPlayer
              course={lastWatchedProgress}
              user={user}
              onNext={modulesArray.length > 0 ? () => {
                const currentModule = modulesArray.find(m => m.lessons.some(l => l.id === lastWatchedProgress.id));
                const currentIndex = currentModule?.lessons.findIndex(l => l.id === lastWatchedProgress.id);
                if (currentIndex < currentModule.lessons.length - 1) {
                  setSelectedLesson(currentModule.lessons[currentIndex + 1]);
                }
              } : null}
              onPrevious={modulesArray.length > 0 ? () => {
                const currentModule = modulesArray.find(m => m.lessons.some(l => l.id === lastWatchedProgress.id));
                const currentIndex = currentModule?.lessons.findIndex(l => l.id === lastWatchedProgress.id);
                if (currentIndex > 0) {
                  setSelectedLesson(currentModule.lessons[currentIndex - 1]);
                }
              } : null}
            />
          </motion.div>
        )}

        {selectedLesson && !minimizedLesson ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{selectedLesson.title}</h2>
                <p className="text-slate-400 text-sm">{selectedLesson.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMinimizedLesson(selectedLesson);
                    setSelectedLesson(null);
                  }}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Minimizar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <VideoPlayer
              course={selectedLesson}
              user={user}
              onNext={modulesArray.length > 0 ? () => {
                const currentModule = modulesArray.find(m => m.lessons.some(l => l.id === selectedLesson.id));
                const currentIndex = currentModule?.lessons.findIndex(l => l.id === selectedLesson.id);
                if (currentIndex < currentModule.lessons.length - 1) {
                  setSelectedLesson(currentModule.lessons[currentIndex + 1]);
                }
              } : null}
              onPrevious={modulesArray.length > 0 ? () => {
                const currentModule = modulesArray.find(m => m.lessons.some(l => l.id === selectedLesson.id));
                const currentIndex = currentModule?.lessons.findIndex(l => l.id === selectedLesson.id);
                if (currentIndex > 0) {
                  setSelectedLesson(currentModule.lessons[currentIndex - 1]);
                }
              } : null}
            />
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {modulesArray.map((module) => {
            const isExpanded = expandedModules.includes(module.id);
            const completedCount = module.lessons.filter(l => l.is_completed).length;
            const progress = (completedCount / module.lessons.length) * 100;

            return (
              <Card key={module.id} className="bg-[#1a1a2e] border-purple-900/30 overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-purple-900/10 transition"
                >
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-gray-200">
                      {module.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 bg-slate-700 h-1.5 rounded-full overflow-hidden max-w-xs">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                      <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-purple-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-purple-900/30">
                    {module.lessons.map((lesson) => {
                      const getYouTubeVideoId = (url) => {
                        if (!url) return null;
                        if (url.includes('youtube.com/watch')) return url.split('v=')[1]?.split('&')[0];
                        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
                        return null;
                      };

                      const videoId = getYouTubeVideoId(lesson.video_url);
                      const thumbnail = lesson.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className="w-full p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-purple-900/10 transition border-b border-purple-900/20 last:border-0"
                        >
                          {thumbnail && (
                            <div className="flex-shrink-0 w-20 md:w-24 h-12 md:h-14 rounded-lg overflow-hidden bg-slate-800 relative">
                              <img
                                src={thumbnail}
                                alt={lesson.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-purple-600/90 flex items-center justify-center">
                                  <Play className="w-3 h-3 md:w-4 md:h-4 text-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex-shrink-0">
                            {lesson.is_completed ? (
                              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                            ) : (
                              <Play className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                            )}
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold text-white text-sm md:text-base truncate">{lesson.title}</p>
                            <p className="text-xs md:text-sm text-gray-400 truncate">{lesson.duration || lesson.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          <Card
            onClick={() => navigate(createPageUrl("OraculoCombinacoes"))}
            className="bg-[#1a1a2e] border-purple-900/30 p-6 hover:bg-purple-900/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Oráculo de Combinações</h3>
                <p className="text-sm text-gray-400">Explore combinações de cartas</p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => navigate(createPageUrl("BibliotecaMistica"))}
            className="bg-[#1a1a2e] border-purple-900/30 p-6 hover:bg-purple-900/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Biblioteca Mística</h3>
                <p className="text-sm text-gray-400">Acesse materiais complementares</p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => navigate(createPageUrl("PlanoDeAcao"))}
            className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-orange-500/30 p-6 hover:bg-orange-900/20 transition cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-600 to-yellow-600 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Plano de Ação</h3>
                <p className="text-sm text-orange-200">
                  Guia completo para se tornar uma taróloga de sucesso
                </p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setShowVocemModal(true)}
            className="bg-[#1a1a2e] border-pink-500/30 p-6 hover:bg-purple-900/10 transition cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Vocem</h3>
                <p className="text-sm text-gray-400">Biblioteca de áudios e meditações</p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => navigate(createPageUrl("Certificado"))}
            className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30 p-6 hover:bg-yellow-900/20 transition cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  Certificado de Mestria
                  {user.tarot_certificate_url && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </h3>
                <p className="text-sm text-yellow-200">
                  {user.tarot_certificate_url
                    ? "Ver seu certificado consagrado"
                    : "Consagre seu nome no pergaminho sagrado"}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CONSULTA COM EMELYN - COM FOTO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card 
            className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/50 hover:border-purple-400/80 transition cursor-pointer overflow-hidden"
            onClick={() => navigate(createPageUrl("ConsultaEmelyn"))}
          >
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 shadow-xl border-4 border-purple-500">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/d7838e0fb_ImagemdoWhatsAppde2025-11-13s131958_d191baad1.jpg"
                    alt="Emelyn Chotté"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    Consulta Individual com Emelyn
                    <span className="text-yellow-400 text-xl md:text-2xl">👑</span>
                  </h3>
                  <p className="text-purple-200 text-xs md:text-sm lg:text-base mb-3 md:mb-4 leading-relaxed">
                    Agende uma sessão exclusiva de tarot profissional por videoconferência. 
                    Orientação personalizada e transformadora.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-yellow-600 text-white text-xs">
                      Sessões Individuais
                    </Badge>
                    <Badge className="bg-purple-600 text-white text-xs">
                      Online
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] border-purple-900/30 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/638330904_meuEbookResetei-2-_1_.png"
                    alt="Manual de Tarot Físico"
                    className="w-64 h-auto object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Manual de Tarot Físico
                  </h2>
                  <p className="text-purple-400 text-sm mb-4">
                    Status: <span className="font-semibold">Em preparação</span>
                  </p>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    Uma viagem concisa pelos 78 Arcanos do Tarot. Este manual completo será enviado para você em breve.
                  </p>
                  <Button
                    onClick={handleTrackOrder}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Rastrear Envio
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <VocemModal
        isOpen={showVocemModal}
        onClose={() => setShowVocemModal(false)}
        onPlayAudio={handlePlayAudio}
      />

      <AnimatePresence>
        {minimizedLesson && (
          <MinimizedVideoPlayer
            course={minimizedLesson}
            onClose={() => setMinimizedLesson(null)}
            onMaximize={() => {
              setSelectedLesson(minimizedLesson);
              setMinimizedLesson(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onProgressUpdate={async (time, duration) => {
              const progressData = {
                user_id: user.id,
                course_id: minimizedLesson.id,
                lesson_number: minimizedLesson.lesson_number,
                video_progress: time,
                video_duration: duration,
                is_completed: time / duration >= 0.9,
                last_watched: new Date().toISOString()
              };

              try {
                const existing = await base44.entities.CourseProgress.filter({
                  user_id: user.id,
                  course_id: minimizedLesson.id
                });

                if (existing && existing.length > 0) {
                  await base44.entities.CourseProgress.update(existing[0].id, progressData);
                } else {
                  await base44.entities.CourseProgress.create(progressData);
                }
              } catch (error) {
                console.error('Erro ao salvar progresso:', error);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTrackingModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-purple-500/50 p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-400" />
                  Rastreamento
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowTrackingModal(false)} className="text-gray-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {myOrder ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">Status do Pedido</p>
                    <Badge className={shippingStatuses[myOrder.shipping_status || 'aguardando'].color}>
                      {shippingStatuses[myOrder.shipping_status || 'aguardando'].icon} {shippingStatuses[myOrder.shipping_status || 'aguardando'].label}
                    </Badge>
                  </div>

                  {myOrder.tracking_code && (
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">Código de Rastreio</p>
                      <p className="text-white font-mono">{myOrder.tracking_code}</p>
                    </div>
                  )}

                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">Endereço de Entrega</p>
                    <p className="text-white text-sm">
                      {user.address.street}, {user.address.number}
                      {user.address.complement && ` - ${user.address.complement}`}
                      <br />
                      {user.address.neighborhood} - {user.address.city}/{user.address.state}
                      <br />
                      CEP: {user.address.cep}
                    </p>
                  </div>

                  <Button
                    onClick={openGoogleMaps}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Ver no Google Maps
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Nenhum pedido encontrado</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
