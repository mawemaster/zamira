import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Sistema de tracking de progresso de missões
export default function QuestTracker({ user }) {
  useEffect(() => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id) return;

    // Função para atualizar progresso de uma missão
    const updateQuestProgress = async (actionType, count = 1) => {
      try {
        // VALIDAÇÃO ANTES DE USAR
        if (!user?.id) return;

        // Buscar missões ativas desse tipo
        const quests = await base44.entities.Quest.filter({
          action_type: actionType,
          is_active: true
        });

        for (const quest of quests) {
          if (!quest?.id) continue; // Pular missões sem ID

          // Buscar progresso do usuário
          let progress = await base44.entities.QuestProgress.filter({
            user_id: user.id,
            quest_id: quest.id
          });

          if (progress.length === 0) {
            // Criar novo progresso
            await base44.entities.QuestProgress.create({
              user_id: user.id,
              quest_id: quest.id,
              quest_title: quest.title,
              quest_type: quest.type,
              current_count: count,
              target_count: quest.target_count,
              is_completed: count >= quest.target_count
            });
          } else {
            const currentProgress = progress[0];
            if (!currentProgress?.id) continue; // Pular se não tiver ID

            const newCount = currentProgress.current_count + count;
            const isCompleted = newCount >= quest.target_count;

            // Atualizar progresso
            await base44.entities.QuestProgress.update(currentProgress.id, {
              current_count: newCount,
              is_completed: isCompleted,
              completed_at: isCompleted && !currentProgress.is_completed 
                ? new Date().toISOString() 
                : currentProgress.completed_at
            });
          }
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso da missão:', error);
      }
    };

    // Listeners para ações do usuário
    const handlePostCreated = () => updateQuestProgress('create_post');
    const handleCommentCreated = () => updateQuestProgress('comment_post');
    const handleReactionAdded = () => updateQuestProgress('react_post');
    const handleDailyTarot = () => updateQuestProgress('daily_tarot');
    const handlePortalVisit = () => updateQuestProgress('visit_portal');
    const handleChatMessage = () => updateQuestProgress('chat_message');
    const handleUserFollowed = () => updateQuestProgress('follow_user');
    const handlePostShared = () => updateQuestProgress('share_post');
    const handleProfileCompleted = () => updateQuestProgress('complete_profile');
    const handleLunarEvent = () => updateQuestProgress('lunar_event');
    const handleArenaDuel = () => updateQuestProgress('arena_duel');
    const handleShopPurchase = () => updateQuestProgress('shop_purchase');
    const handleVoiceMessage = () => updateQuestProgress('voice_message');

    // Registrar listeners
    window.addEventListener('questAction:create_post', handlePostCreated);
    window.addEventListener('questAction:comment_post', handleCommentCreated);
    window.addEventListener('questAction:react_post', handleReactionAdded);
    window.addEventListener('questAction:daily_tarot', handleDailyTarot);
    window.addEventListener('questAction:visit_portal', handlePortalVisit);
    window.addEventListener('questAction:chat_message', handleChatMessage);
    window.addEventListener('questAction:follow_user', handleUserFollowed);
    window.addEventListener('questAction:share_post', handlePostShared);
    window.addEventListener('questAction:complete_profile', handleProfileCompleted);
    window.addEventListener('questAction:lunar_event', handleLunarEvent);
    window.addEventListener('questAction:arena_duel', handleArenaDuel);
    window.addEventListener('questAction:shop_purchase', handleShopPurchase);
    window.addEventListener('questAction:voice_message', handleVoiceMessage);

    return () => {
      window.removeEventListener('questAction:create_post', handlePostCreated);
      window.removeEventListener('questAction:comment_post', handleCommentCreated);
      window.removeEventListener('questAction:react_post', handleReactionAdded);
      window.removeEventListener('questAction:daily_tarot', handleDailyTarot);
      window.removeEventListener('questAction:visit_portal', handlePortalVisit);
      window.removeEventListener('questAction:chat_message', handleChatMessage);
      window.removeEventListener('questAction:follow_user', handleUserFollowed);
      window.removeEventListener('questAction:share_post', handlePostShared);
      window.removeEventListener('questAction:complete_profile', handleProfileCompleted);
      window.removeEventListener('questAction:lunar_event', handleLunarEvent);
      window.removeEventListener('questAction:arena_duel', handleArenaDuel);
      window.removeEventListener('questAction:shop_purchase', handleShopPurchase);
      window.removeEventListener('questAction:voice_message', handleVoiceMessage);
    };
  }, [user?.id]); // Dependência corrigida

  return null; // Componente invisível
}