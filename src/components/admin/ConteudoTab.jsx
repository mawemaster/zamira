import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, Music, Search, Edit2, Save, X, Trash2, Plus, Activity, BookOpen, FileText
} from "lucide-react";
import { motion } from "framer-motion";

export default function ConteudoTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingAudio, setEditingAudio] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingVocem, setEditingVocem] = useState(null);
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [showNewAudio, setShowNewAudio] = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showNewPDF, setShowNewPDF] = useState(false);
  const [showNewVocemAudio, setShowNewVocemAudio] = useState(false);
  const [editingPDF, setEditingPDF] = useState(null);
  const [pdfData, setPdfData] = useState({
    title: "", description: "", pdf_url: "", cover_image_url: "",
    category: "tarot", is_premium: false, order: 0
  });
  const [videoData, setVideoData] = useState({
    title: "", description: "", video_url: "", thumbnail_url: "", 
    portal_type: "tarot", duration: "", is_premium: false, order: 0
  });
  const [audioData, setAudioData] = useState({
    title: "", description: "", audio_url: "", thumbnail_url: "",
    category: "meditacao", duration: 0, is_premium: false, order: 0
  });
  const [courseData, setCourseData] = useState({
    title: "", description: "", content: "", video_url: "", thumbnail_url: "",
    lesson_number: 1, is_premium: false, order: 0
  });
  const [vocemAudioData, setVocemAudioData] = useState({
    title: "", description: "", audio_url: "", category: "meditacao", is_premium: false, order: 0
  });
  const queryClient = useQueryClient();

  const { data: videos, isLoading: loadingVideos } = useQuery({
    queryKey: ['admin-portal-videos'],
    queryFn: () => base44.entities.PortalVideo.list("-order", 500),
  });

  const { data: audios, isLoading: loadingAudios } = useQuery({
    queryKey: ['admin-voice-content'],
    queryFn: () => base44.entities.VoiceContent.list("-order", 500),
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['admin-tarot-courses'],
    queryFn: () => base44.entities.TarotCourse.list("lesson_number", 500),
  });

  const { data: pdfs, isLoading: loadingPDFs } = useQuery({
    queryKey: ['admin-pdf-library'],
    queryFn: () => base44.entities.PDFLibrary.list("-order", 500),
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data) => {
      if (editingVideo) {
        return await base44.entities.PortalVideo.update(editingVideo.id, data);
      }
      return await base44.entities.PortalVideo.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-portal-videos'] });
      setEditingVideo(null);
      setShowNewVideo(false);
      setVideoData({
        title: "", description: "", video_url: "", thumbnail_url: "", 
        portal_type: "tarot", duration: "", is_premium: false, order: 0
      });
      alert('✅ Vídeo salvo!');
    },
  });

  const createAudioMutation = useMutation({
    mutationFn: async (data) => {
      if (editingAudio) {
        return await base44.entities.VoiceContent.update(editingAudio.id, data);
      }
      return await base44.entities.VoiceContent.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-voice-content'] });
      setEditingAudio(null);
      setShowNewAudio(false);
      setShowNewVocemAudio(false);
      setAudioData({
        title: "", description: "", audio_url: "", thumbnail_url: "",
        category: "meditacao", duration: 0, is_premium: false, order: 0
      });
      setVocemAudioData({
        title: "", description: "", audio_url: "", category: "meditacao", is_premium: false, order: 0
      });
      alert('✅ Áudio salvo!');
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCourse) {
        return await base44.entities.TarotCourse.update(editingCourse.id, data);
      }
      return await base44.entities.TarotCourse.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tarot-courses'] });
      setEditingCourse(null);
      setShowNewCourse(false);
      setCourseData({
        title: "", description: "", content: "", video_url: "", thumbnail_url: "",
        lesson_number: 1, is_premium: false, order: 0
      });
      alert('✅ Curso salvo!');
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id) => await base44.entities.PortalVideo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-portal-videos'] }),
  });

  const deleteAudioMutation = useMutation({
    mutationFn: async (id) => await base44.entities.VoiceContent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-voice-content'] }),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id) => await base44.entities.TarotCourse.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tarot-courses'] }),
  });

  const createPDFMutation = useMutation({
    mutationFn: async (data) => {
      if (editingPDF) {
        return await base44.entities.PDFLibrary.update(editingPDF.id, data);
      }
      return await base44.entities.PDFLibrary.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pdf-library'] });
      setEditingPDF(null);
      setShowNewPDF(false);
      setPdfData({
        title: "", description: "", pdf_url: "", cover_image_url: "",
        category: "tarot", is_premium: false, order: 0
      });
      alert('✅ PDF salvo!');
    },
  });

  const deletePDFMutation = useMutation({
    mutationFn: async (id) => await base44.entities.PDFLibrary.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pdf-library'] }),
  });

  const handleThumbnailUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        if (type === 'video') {
          setVideoData({ ...videoData, thumbnail_url: file_url });
        } else if (type === 'audio') {
          setAudioData({ ...audioData, thumbnail_url: file_url });
        } else if (type === 'course') {
          setCourseData({ ...courseData, thumbnail_url: file_url });
        }
        alert('✅ Miniatura enviada!');
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setVideoData(video);
    setShowNewVideo(true);
  };

  const handleEditAudio = (audio) => {
    setEditingAudio(audio);
    setAudioData(audio);
    setShowNewAudio(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseData(course);
    setShowNewCourse(true);
  };

  const handleEditPDF = (pdf) => {
    setEditingPDF(pdf);
    setPdfData(pdf);
    setShowNewPDF(true);
  };

  const filteredVideos = videos?.filter(v => 
    v.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredAudios = audios?.filter(a => 
    a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredCourses = courses?.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredPDFs = pdfs?.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciar Conteúdo</h2>
          <p className="text-slate-600">Vídeos, Áudios, Cursos, PDFs e VOCEM</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conteúdo..."
            className="pl-10 border-slate-300"
          />
        </div>
      </Card>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger value="videos" className="text-xs md:text-sm">
            <Video className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Vídeos</span>
            <span className="md:hidden">Vid</span> ({videos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="audios" className="text-xs md:text-sm">
            <Music className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Áudios</span>
            <span className="md:hidden">Aud</span> ({audios?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pdfs" className="text-xs md:text-sm">
            <FileText className="w-4 h-4 mr-1 md:mr-2" />
            PDFs ({pdfs?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="courses" className="text-xs md:text-sm">
            <BookOpen className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden md:inline">Cursos</span>
            <span className="md:hidden">Cur</span> ({courses?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="vocem" className="text-xs md:text-sm">
            <Music className="w-4 h-4 mr-1 md:mr-2" />
            VOCEM ({audios?.filter(a => a.category === 'meditacao').length || 0})
          </TabsTrigger>
        </TabsList>

        {/* VÍDEOS DOS PORTAIS */}
        <TabsContent value="videos" className="space-y-4 mt-6">
          <Button
            onClick={() => {
              setShowNewVideo(true);
              setEditingVideo(null);
              setVideoData({
                title: "", description: "", video_url: "", thumbnail_url: "", 
                portal_type: "tarot", duration: "", is_premium: false, order: 0
              });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Vídeo
          </Button>

          {showNewVideo && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewVideo(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Título do vídeo"
                  value={videoData.title}
                  onChange={(e) => setVideoData({...videoData, title: e.target.value})}
                />
                <Textarea
                  placeholder="Descrição"
                  value={videoData.description}
                  onChange={(e) => setVideoData({...videoData, description: e.target.value})}
                  rows={3}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">URL do Vídeo (YouTube, Google Drive, etc) ou Upload:</label>
                  <Input
                    placeholder="Cole o link do YouTube/Drive ou faça upload"
                    value={videoData.video_url}
                    onChange={(e) => setVideoData({...videoData, video_url: e.target.value})}
                    className="mb-2"
                  />
                  <p className="text-xs text-slate-600 mb-2">
                    💡 YouTube: https://www.youtube.com/watch?v=... | Google Drive: Compartilhe e cole o link
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setVideoData({ ...videoData, video_url: file_url });
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Miniatura:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e, 'video')}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                  {videoData.thumbnail_url && (
                    <img src={videoData.thumbnail_url} className="mt-2 w-32 h-20 object-cover rounded" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <select
                    value={videoData.portal_type}
                    onChange={(e) => setVideoData({...videoData, portal_type: e.target.value})}
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="tarot">Tarot</option>
                    <option value="astrologia">Astrologia</option>
                    <option value="meditacao">Meditação</option>
                    <option value="cristais">Cristais</option>
                    <option value="numerologia">Numerologia</option>
                    <option value="geral">Geral</option>
                  </select>
                  <Input
                    placeholder="Duração (ex: 15:30)"
                    value={videoData.duration}
                    onChange={(e) => setVideoData({...videoData, duration: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={videoData.is_premium}
                      onChange={(e) => setVideoData({...videoData, is_premium: e.target.checked})}
                    />
                    <span className="text-sm">Conteúdo PRO</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Ordem"
                    value={videoData.order}
                    onChange={(e) => setVideoData({...videoData, order: parseInt(e.target.value)})}
                    className="w-24"
                  />
                </div>

                <Button
                  onClick={() => createVideoMutation.mutate(videoData)}
                  disabled={createVideoMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Vídeo
                </Button>
              </div>
            </Card>
          )}

          {loadingVideos ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card className="bg-white border-slate-200 p-12 text-center">
              <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum vídeo encontrado</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="bg-white border-slate-200 p-4">
                  <div className="flex items-start gap-4">
                    {video.thumbnail_url && (
                      <img src={video.thumbnail_url} className="w-24 h-16 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{video.title}</h3>
                        <Badge variant="outline" className="capitalize">{video.portal_type}</Badge>
                        {video.is_premium && <Badge className="bg-yellow-100 text-yellow-800">PRO</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{video.description}</p>
                      <p className="text-xs text-slate-500">{video.views_count || 0} visualizações • {video.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditVideo(video)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => deleteVideoMutation.mutate(video.id)}
                        className="border-red-300 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ÁUDIOS DO VOICE */}
        <TabsContent value="audios" className="space-y-4 mt-6">
          <Button
            onClick={() => {
              setShowNewAudio(true);
              setEditingAudio(null);
              setAudioData({
                title: "", description: "", audio_url: "", thumbnail_url: "",
                category: "meditacao", duration: 0, is_premium: false, order: 0
              });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Áudio
          </Button>

          {showNewAudio && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingAudio ? 'Editar Áudio' : 'Novo Áudio'}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewAudio(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Título do áudio"
                  value={audioData.title}
                  onChange={(e) => setAudioData({...audioData, title: e.target.value})}
                />
                <Textarea
                  placeholder="Descrição"
                  value={audioData.description}
                  onChange={(e) => setAudioData({...audioData, description: e.target.value})}
                  rows={3}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">URL do Áudio (YouTube, Google Drive) ou Upload:</label>
                  <Input
                    placeholder="Cole o link ou faça upload"
                    value={audioData.audio_url}
                    onChange={(e) => setAudioData({...audioData, audio_url: e.target.value})}
                    className="mb-2"
                  />
                  <p className="text-xs text-slate-600 mb-2">
                    💡 Aceita YouTube, Google Drive ou arquivo de áudio
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setAudioData({ ...audioData, audio_url: file_url });
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Miniatura:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e, 'audio')}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                  {audioData.thumbnail_url && (
                    <img src={audioData.thumbnail_url} className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <select
                    value={audioData.category}
                    onChange={(e) => setAudioData({...audioData, category: e.target.value})}
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="meditacao">Meditação</option>
                    <option value="ritual">Ritual</option>
                    <option value="mantra">Mantra</option>
                    <option value="guiada">Guiada</option>
                    <option value="aula">Aula</option>
                    <option value="podcast">Podcast</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Duração (segundos)"
                    value={audioData.duration}
                    onChange={(e) => setAudioData({...audioData, duration: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={audioData.is_premium}
                      onChange={(e) => setAudioData({...audioData, is_premium: e.target.checked})}
                    />
                    <span className="text-sm">Conteúdo PRO</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Ordem"
                    value={audioData.order}
                    onChange={(e) => setAudioData({...audioData, order: parseInt(e.target.value)})}
                    className="w-24"
                  />
                </div>

                <Button
                  onClick={() => createAudioMutation.mutate(audioData)}
                  disabled={createAudioMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Áudio
                </Button>
              </div>
            </Card>
          )}

          {loadingAudios ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            </div>
          ) : filteredAudios.length === 0 ? (
            <Card className="bg-white border-slate-200 p-12 text-center">
              <Music className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum áudio encontrado</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAudios.map((audio) => (
                <Card key={audio.id} className="bg-white border-slate-200 p-4">
                  <div className="flex items-start gap-4">
                    {audio.thumbnail_url && (
                      <img src={audio.thumbnail_url} className="w-24 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{audio.title}</h3>
                        <Badge variant="outline" className="capitalize">{audio.category}</Badge>
                        {audio.is_premium && <Badge className="bg-yellow-100 text-yellow-800">PRO</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{audio.description}</p>
                      <p className="text-xs text-slate-500">{audio.plays_count || 0} reproduções • {audio.duration}s</p>
                      {audio.audio_url && (
                        <>
                          {audio.audio_url.includes('youtube.com') || audio.audio_url.includes('youtu.be') || audio.audio_url.includes('drive.google.com') ? (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-blue-900">
                                🎵 Link: {audio.audio_url.substring(0, 50)}...
                              </p>
                            </div>
                          ) : (
                            <audio controls className="mt-2 w-full max-w-md">
                              <source src={audio.audio_url} type="audio/mpeg" />
                            </audio>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditAudio(audio)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => deleteAudioMutation.mutate(audio.id)}
                        className="border-red-300 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CURSOS DO TAROT */}
        <TabsContent value="courses" className="space-y-4 mt-6">
          <Button
            onClick={() => {
              setShowNewCourse(true);
              setEditingCourse(null);
              setCourseData({
                title: "", description: "", content: "", video_url: "", thumbnail_url: "",
                lesson_number: (courses?.length || 0) + 1, is_premium: false, order: 0
              });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Curso
          </Button>

          {showNewCourse && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCourse ? 'Editar Curso' : 'Novo Curso'}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewCourse(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Título do curso"
                  value={courseData.title}
                  onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                />
                <Textarea
                  placeholder="Descrição"
                  value={courseData.description}
                  onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                  rows={3}
                />
                <Textarea
                  placeholder="Conteúdo completo (pode usar markdown)"
                  value={courseData.content}
                  onChange={(e) => setCourseData({...courseData, content: e.target.value})}
                  rows={8}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">URL do Vídeo (YouTube, Google Drive) ou Upload:</label>
                  <Input
                    placeholder="Cole o link ou faça upload"
                    value={courseData.video_url}
                    onChange={(e) => setCourseData({...courseData, video_url: e.target.value})}
                    className="mb-2"
                  />
                  <p className="text-xs text-slate-600 mb-2">
                    💡 Aceita YouTube, Google Drive ou upload direto
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setCourseData({ ...courseData, video_url: file_url });
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Miniatura:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailUpload(e, 'course')}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                  {courseData.thumbnail_url && (
                    <img src={courseData.thumbnail_url} className="mt-2 w-32 h-20 object-cover rounded" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Número da lição"
                    value={courseData.lesson_number}
                    onChange={(e) => setCourseData({...courseData, lesson_number: parseInt(e.target.value)})}
                  />
                  <Input
                    placeholder="Duração (ex: 45 min)"
                    value={courseData.duration}
                    onChange={(e) => setCourseData({...courseData, duration: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={courseData.is_premium}
                      onChange={(e) => setCourseData({...courseData, is_premium: e.target.checked})}
                    />
                    <span className="text-sm">Conteúdo PRO</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="Ordem"
                    value={courseData.order}
                    onChange={(e) => setCourseData({...courseData, order: parseInt(e.target.value)})}
                    className="w-24"
                  />
                </div>

                <Button
                  onClick={() => createCourseMutation.mutate(courseData)}
                  disabled={createCourseMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Curso
                </Button>
              </div>
            </Card>
          )}

          {loadingCourses ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="bg-white border-slate-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum curso encontrado</p>
              <p className="text-xs text-slate-500 mt-2">Clique em "Adicionar Curso" para criar o primeiro</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="bg-white border-slate-200 p-4">
                  <div className="flex items-start gap-4">
                    {course.thumbnail_url && (
                      <img src={course.thumbnail_url} className="w-24 h-16 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{course.title}</h3>
                        <Badge variant="outline">Lição {course.lesson_number}</Badge>
                        {course.is_premium && <Badge className="bg-yellow-100 text-yellow-800">PRO</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{course.description}</p>
                      <p className="text-xs text-slate-500">{course.views_count || 0} visualizações • {course.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditCourse(course)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => deleteCourseMutation.mutate(course.id)}
                        className="border-red-300 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PDFs DA BIBLIOTECA */}
        <TabsContent value="pdfs" className="space-y-4 mt-6">
          <Button
            onClick={() => {
              setShowNewPDF(true);
              setEditingPDF(null);
              setPdfData({
                title: "", description: "", pdf_url: "", cover_image_url: "",
                category: "tarot", is_premium: false, order: 0
              });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar PDF
          </Button>

          {showNewPDF && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingPDF ? 'Editar PDF' : 'Novo PDF'}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewPDF(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Título do PDF"
                  value={pdfData.title}
                  onChange={(e) => setPdfData({...pdfData, title: e.target.value})}
                />
                <Textarea
                  placeholder="Descrição"
                  value={pdfData.description}
                  onChange={(e) => setPdfData({...pdfData, description: e.target.value})}
                  rows={3}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">Upload do PDF:</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setPdfData({ ...pdfData, pdf_url: file_url });
                        alert('✅ PDF enviado!');
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                  {pdfData.pdf_url && (
                    <p className="text-xs text-green-600 mt-2">✅ PDF carregado</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Imagem de Capa (OBRIGATÓRIO):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setPdfData({ ...pdfData, cover_image_url: file_url });
                        alert('✅ Capa enviada!');
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700"
                  />
                  {pdfData.cover_image_url && (
                    <img src={pdfData.cover_image_url} className="mt-2 w-32 h-40 object-cover rounded shadow-lg" />
                  )}
                  {!pdfData.cover_image_url && (
                    <p className="text-xs text-orange-600 mt-2">⚠️ A capa do PDF é obrigatória para exibição correta</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <select
                    value={pdfData.category}
                    onChange={(e) => setPdfData({...pdfData, category: e.target.value})}
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="tarot">Tarot</option>
                    <option value="astrologia">Astrologia</option>
                    <option value="cristais">Cristais</option>
                    <option value="meditacao">Meditação</option>
                    <option value="outros">Outros</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Ordem"
                    value={pdfData.order}
                    onChange={(e) => setPdfData({...pdfData, order: parseInt(e.target.value)})}
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pdfData.is_premium}
                    onChange={(e) => setPdfData({...pdfData, is_premium: e.target.checked})}
                  />
                  <span className="text-sm">Conteúdo PRO</span>
                </label>

                <Button
                  onClick={() => {
                    if (!pdfData.cover_image_url) {
                      alert('❌ Por favor, adicione uma imagem de capa para o PDF!');
                      return;
                    }
                    createPDFMutation.mutate(pdfData);
                  }}
                  disabled={createPDFMutation.isPending || !pdfData.pdf_url || !pdfData.cover_image_url}
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar PDF
                </Button>
              </div>
            </Card>
          )}

          {loadingPDFs ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            </div>
          ) : filteredPDFs.length === 0 ? (
            <Card className="bg-white border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum PDF encontrado</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPDFs.map((pdf) => (
                <Card key={pdf.id} className="bg-white border-slate-200 p-4">
                  <div className="flex items-start gap-4">
                    {pdf.cover_image_url && (
                      <img src={pdf.cover_image_url} className="w-20 h-28 object-cover rounded shadow" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{pdf.title}</h3>
                        <Badge variant="outline" className="capitalize">{pdf.category}</Badge>
                        {pdf.is_premium && <Badge className="bg-yellow-100 text-yellow-800">PRO</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{pdf.description}</p>
                      <p className="text-xs text-slate-500">{pdf.views_count || 0} visualizações</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditPDF(pdf)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => deletePDFMutation.mutate(pdf.id)}
                        className="border-red-300 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* VOCEM */}
        <TabsContent value="vocem" className="space-y-4 mt-6">
          <Button
            onClick={() => {
              setShowNewVocemAudio(true);
              setVocemAudioData({
                title: "", description: "", audio_url: "", category: "meditacao", is_premium: false, order: audios?.length || 0
              });
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Áudio VOCEM
          </Button>

          {showNewVocemAudio && (
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-300 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Novo Áudio VOCEM</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewVocemAudio(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Título do áudio"
                  value={vocemAudioData.title}
                  onChange={(e) => setVocemAudioData({...vocemAudioData, title: e.target.value})}
                />
                <Textarea
                  placeholder="Descrição"
                  value={vocemAudioData.description}
                  onChange={(e) => setVocemAudioData({...vocemAudioData, description: e.target.value})}
                  rows={3}
                />

                <div>
                  <label className="text-sm font-medium mb-2 block">URL do Áudio (YouTube, Google Drive) ou Upload:</label>
                  <Input
                    placeholder="https://www.youtube.com/... ou https://drive.google.com/..."
                    value={vocemAudioData.audio_url}
                    onChange={(e) => setVocemAudioData({...vocemAudioData, audio_url: e.target.value})}
                    className="mb-2"
                  />
                  <p className="text-xs text-slate-600 mb-2">
                    💡 Cole o link do YouTube ou Google Drive para áudios
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        setVocemAudioData({ ...vocemAudioData, audio_url: file_url });
                        alert('✅ Áudio enviado!');
                      }
                    }}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-700"
                  />
                </div>

                <select
                  value={vocemAudioData.category}
                  onChange={(e) => setVocemAudioData({...vocemAudioData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="meditacao">Meditação</option>
                  <option value="ritual">Ritual</option>
                  <option value="mantra">Mantra</option>
                  <option value="guiada">Guiada</option>
                  <option value="aula">Aula</option>
                  <option value="podcast">Podcast</option>
                </select>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={vocemAudioData.is_premium}
                    onChange={(e) => setVocemAudioData({...vocemAudioData, is_premium: e.target.checked})}
                  />
                  <span className="text-sm">Conteúdo PRO</span>
                </label>

                <Button
                  onClick={() => createAudioMutation.mutate(vocemAudioData)}
                  disabled={createAudioMutation.isPending || !vocemAudioData.audio_url}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Áudio VOCEM
                </Button>
              </div>
            </Card>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              ℹ️ Aqui você pode criar e gerenciar áudios VOCEM disponíveis para todos os usuários.
            </p>
          </div>

          {loadingAudios ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
            </div>
          ) : filteredAudios.length === 0 ? (
            <Card className="bg-white border-slate-200 p-12 text-center">
              <Music className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum áudio VOCEM encontrado</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAudios.map((audio) => (
                <Card key={audio.id} className="bg-white border-slate-200 p-4">
                  <div className="flex items-start gap-4">
                    {audio.thumbnail_url && (
                      <img src={audio.thumbnail_url} className="w-24 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{audio.title}</h3>
                        <Badge variant="outline" className="capitalize">{audio.category}</Badge>
                        {audio.is_premium && <Badge className="bg-yellow-100 text-yellow-800">PRO</Badge>}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{audio.description}</p>
                      <p className="text-xs text-slate-500">{audio.plays_count || 0} reproduções</p>
                      {audio.audio_url && (
                        <>
                          {audio.audio_url.includes('youtube.com') || audio.audio_url.includes('youtu.be') || audio.audio_url.includes('drive.google.com') ? (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-blue-900 truncate">
                                🎵 Link: {audio.audio_url}
                              </p>
                            </div>
                          ) : (
                            <audio controls className="mt-2 w-full max-w-md">
                              <source src={audio.audio_url} type="audio/mpeg" />
                            </audio>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditAudio(audio)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => deleteAudioMutation.mutate(audio.id)}
                        className="border-red-300 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}