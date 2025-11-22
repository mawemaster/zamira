import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function PWANotifications({ user }) {
  useEffect(() => {
    // VALIDAÇÃO CRÍTICA
    if (!user?.id) return;

    // Verificar se está instalado como PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    if (!isPWA) return;

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);

          // Solicitar permissão para notificações
          requestNotificationPermission(registration);

          // Verificar atualizações a cada 1 hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Registrar Periodic Background Sync (se disponível)
          if ('periodicSync' in registration) {
            registration.periodicSync.register('check-notifications', {
              minInterval: 15 * 60 * 1000 // 15 minutos
            }).catch((err) => {
              console.log('Periodic Sync não disponível:', err);
            });
          }
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }

    // Listener para quando o app volta a ficar ativo
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // App voltou a ficar visível - sincronizar dados
        syncData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]); // Dependência corrigida

  const requestNotificationPermission = async (registration) => {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return;
    }

    if (Notification.permission === 'granted') {
      subscribeToNotifications(registration);
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        subscribeToNotifications(registration);
      }
    }
  };

  const subscribeToNotifications = async (registration) => {
    try {
      // Verificar se já existe uma subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Criar nova subscription
        const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // Salvar subscription no backend (opcional)
      await saveSubscription(subscription);
      
      console.log('Push subscription criada:', subscription);
    } catch (error) {
      console.error('Erro ao criar push subscription:', error);
    }
  };

  const saveSubscription = async (subscription) => {
    console.log('Subscription salva:', subscription);
  };

  const syncData = async () => {
    // VALIDAÇÃO ANTES DE SINCRONIZAR
    if (!user?.id) return;

    // Sincronizar notificações quando o app voltar a ficar ativo
    try {
      const notifs = await base44.entities.Notification.filter(
        { user_id: user.id, is_read: false },
        "-created_date",
        5
      );

      // Se houver novas notificações não lidas, disparar evento
      if (notifs.length > 0) {
        window.dispatchEvent(new CustomEvent('newNotifications', {
          detail: { count: notifs.length }
        }));
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return null; // Este é um componente lógico sem UI
}