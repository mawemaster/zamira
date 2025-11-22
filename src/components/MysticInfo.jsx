import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "../../api/supabaseClient";

export default function PostCard({ post, currentUser }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    try {
      await supabase.from('posts').update({ likes_count: newLikesCount }).eq('id', post.id);
    } catch (err) { console.error(err); }
  };

  return (
    <Card className="bg-[#1e1b4b]/50 border-purple-500/20 p-4 mb-4 hover:border-purple-500/40 transition-all">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold border border-white/10">
            {post.author_avatar ? <img src={post.author_avatar} className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5" />}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white text-sm md:text-base">{post.author_name || "Viajante"}</h3>
              <p className="text-xs text-gray-400">{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR }) : "Agora"}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
          </div>
          <p className="text-gray-200 text-sm md:text-base mt-2 mb-3 whitespace-pre-wrap break-words">{post.content}</p>
          <div className="flex items-center gap-4 pt-2 border-t border-white/5">
            <Button variant="ghost" size="sm" className={`gap-2 px-2 hover:bg-white/5 ${isLiked ? 'text-pink-500' : 'text-gray-400'}`} onClick={handleLike}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /><span className="text-xs">{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 px-2 text-gray-400 hover:text-blue-400 hover:bg-white/5">
              <MessageCircle className="w-4 h-4" /><span className="text-xs">{post.comments_count || 0}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}