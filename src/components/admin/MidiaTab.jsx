import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Image, FileText, Video, Music, File, Trash2, Search, ExternalLink, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MidiaTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allMedia, setAllMedia] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    scanAllMedia();
  }, []);

  const scanAllMedia = async () => {
    setIsScanning(true);
    const mediaUrls = new Set();
    
    try {
      const [
        users,
        posts,
        positions,
        products,
        voices,
        videos,
        articles
      ] = await Promise.all([
        base44.asServiceRole.entities.User.list("-created_date", 1000),
        base44.asServiceRole.entities.Post.list("-created_date", 500),
        base44.asServiceRole.entities.KamasutraPosition.list("-created_date", 200),
        base44.asServiceRole.entities.MysticalProduct.list("-created_date", 200),
        base44.asServiceRole.entities.VoiceContent.list("-created_date", 200),
        base44.asServiceRole.entities.PortalVideo.list("-created_date", 200),
        base44.asServiceRole.entities.Article.list("-created_date", 200)
      ]);

      // Users
      users.forEach(user => {
        if (user.avatar_url) {
          mediaUrls.add(JSON.stringify({
            url: user.avatar_url,
            type: 'image',
            source: 'User Avatar',
            entity: 'User',
            entityId: user.id,
            userName: user.display_name || user.full_name,
            createdDate: user.created_date
          }));
        }
        if (user.banner_url) {
          mediaUrls.add(JSON.stringify({
            url: user.banner_url,
            type: 'image',
            source: 'User Banner',
            entity: 'User',
            entityId: user.id,
            userName: user.display_name || user.full_name,
            createdDate: user.created_date
          }));
        }
      });

      // Posts
      posts.forEach(post => {
        if (post.images && Array.isArray(post.images)) {
          post.images.forEach(img => {
            mediaUrls.add(JSON.stringify({
              url: img,
              type: 'image',
              source: 'Post',
              entity: 'Post',
              entityId: post.id,
              userName: post.author_name,
              createdDate: post.created_date
            }));
          });
        }
        if (post.audio_url) {
          mediaUrls.add(JSON.stringify({
            url: post.audio_url,
            type: 'audio',
            source: 'Post Audio',
            entity: 'Post',
            entityId: post.id,
            userName: post.author_name,
            createdDate: post.created_date
          }));
        }
      });

      // Kamasutra
      positions.forEach(pos => {
        if (pos.image_url) {
          mediaUrls.add(JSON.stringify({
            url: pos.image_url,
            type: 'image',
            source: 'Kamasutra Position',
            entity: 'KamasutraPosition',
            entityId: pos.id,
            userName: pos.name,
            createdDate: pos.created_date
          }));
        }
      });

      // Products
      products.forEach(prod => {
        if (prod.image_url) {
          mediaUrls.add(JSON.stringify({
            url: prod.image_url,
            type: 'image',
            source: 'Product',
            entity: 'MysticalProduct',
            entityId: prod.id,
            userName: prod.name,
            createdDate: prod.created_date
          }));
        }
      });

      // Voice Content
      voices.forEach(voice => {
        if (voice.audio_url) {
          mediaUrls.add(JSON.stringify({
            url: voice.audio_url,
            type: 'audio',
            source: 'Voice Content',
            entity: 'VoiceContent',
            entityId: voice.id,
            userName: voice.title,
            createdDate: voice.created_date
          }));
        }
      });

      // Videos
      videos.forEach(video => {
        if (video.thumbnail_url) {
          mediaUrls.add(JSON.stringify({
            url: video.thumbnail_url,
            type: 'image',
            source: 'Video Thumbnail',
            entity: 'PortalVideo',
            entityId: video.id,
            userName: video.title,
            createdDate: video.created_date
          }));
        }
        if (video.video_url) {
          mediaUrls.add(JSON.stringify({
            url: video.video_url,
            type: 'video',
            source: 'Video',
            entity: 'PortalVideo',
            entityId: video.id,
            userName: video.title,
            createdDate: video.created_date
          }));
        }
      });

      // Articles
      articles.forEach(article => {
        if (article.cover_image) {
          mediaUrls.add(JSON.stringify({
            url: article.cover_image,
            type: 'image',
            source: 'Article Cover',
            entity: 'Article',
            entityId: article.id,
            userName: article.title,
            createdDate: article.created_date
          }));
        }
      });

      const mediaArray = Array.from(mediaUrls).map(item => JSON.parse(item));
      mediaArray.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      
      setAllMedia(mediaArray);
    } catch (error) {
      console.error('Erro ao escanear mídia:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getMediaColor = (type) => {
    switch (type) {
      case 'image': return 'bg-blue-900/50 text-blue-400';
      case 'audio': return 'bg-purple-900/50 text-purple-400';
      case 'video': return 'bg-pink-900/50 text-pink-400';
      default: return 'bg-gray-900/50 text-gray-400';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('URL copiada!');
  };

  const filteredMedia = allMedia.filter(media => 
    media.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentMedia = filteredMedia.filter(media => {
    const daysDiff = (new Date() - new Date(media.createdDate)) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Escaneando mídia em todas as entidades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciador de Mídia</h2>
          <p className="text-gray-400 text-sm">{allMedia.length} arquivos de mídia encontrados</p>
        </div>
        <Button onClick={scanAllMedia} className="bg-purple-600 hover:bg-purple-700">
          <Loader2 className="w-4 h-4 mr-2" />
          Reescanear
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar mídia..."
          className="pl-10 bg-slate-800 border-purple-900/30 text-white"
        />
      </div>

      {recentMedia.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-purple-400 mb-3">🆕 Mídia Recente (últimos 7 dias)</h3>
          <div className="space-y-2">
            {recentMedia.slice(0, 10).map((media, index) => (
              <Card key={index} className="bg-gradient-to-r from-purple-900/30 to-slate-900/30 border-purple-500/50 p-3">
                <div className="flex items-start gap-3">
                  {media.type === 'image' && (
                    <img src={media.url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  {media.type !== 'image' && (
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${getMediaColor(media.type)}`}>
                      {getMediaIcon(media.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getMediaColor(media.type)}>{media.type}</Badge>
                      <Badge variant="outline" className="text-gray-400 text-xs">{media.source}</Badge>
                      <Badge className="bg-green-900/50 text-green-400 text-xs">NOVO</Badge>
                    </div>
                    <p className="text-white text-sm font-medium mb-1 truncate">{media.userName}</p>
                    <p className="text-gray-400 text-xs truncate">{media.url}</p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(media.createdDate), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      onClick={() => copyToClipboard(media.url)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => window.open(media.url, '_blank')}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-purple-400 mb-3">📁 Toda a Mídia</h3>
        <div className="space-y-2">
          {filteredMedia.map((media, index) => (
            <Card key={index} className="bg-slate-900/50 border-purple-500/30 p-3">
              <div className="flex items-start gap-3">
                {media.type === 'image' && (
                  <img src={media.url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                )}
                {media.type !== 'image' && (
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${getMediaColor(media.type)}`}>
                    {getMediaIcon(media.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getMediaColor(media.type)}>{media.type}</Badge>
                    <Badge variant="outline" className="text-gray-400 text-xs">{media.source}</Badge>
                  </div>
                  <p className="text-white text-sm font-medium mb-1 truncate">{media.userName}</p>
                  <p className="text-gray-400 text-xs truncate">{media.url}</p>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(media.createdDate), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>

                <div className="flex gap-1">
                  <Button
                    onClick={() => copyToClipboard(media.url)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => window.open(media.url, '_blank')}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}