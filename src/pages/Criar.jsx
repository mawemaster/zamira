import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreatePostModal from "../components/community/CreatePostModal";

export default function CriarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
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

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      return await base44.entities.Post.create({
        ...postData,
        author_id: user.id,
        author_name: user.display_name || user.full_name,
        author_avatar: user.avatar_url,
        author_level: user.level || 1,
        author_archetype: user.archetype || 'none',
        author_title: user.mystical_title || '',
        reactions: {
          sparkle: 0,
          crystal_ball: 0,
          pray: 0,
          fire: 0,
          water: 0
        },
        reactions_by_user: {},
        comments_count: 0,
        shares_count: 0
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      await base44.auth.updateMe({
        xp: (user.xp || 0) + 5
      });

      navigate(createPageUrl("Hub"));
    },
  });

  const handleCreatePost = (postData) => {
    createPostMutation.mutate(postData);
  };

  const handleClose = () => {
    navigate(createPageUrl("Hub"));
  };

  if (!user) {
    return null;
  }

  return (
    <CreatePostModal
      user={user}
      onClose={handleClose}
      onSubmit={handleCreatePost}
      isLoading={createPostMutation.isPending}
    />
  );
}