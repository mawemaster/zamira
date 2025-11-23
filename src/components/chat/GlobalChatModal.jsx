[COLEI AQUI O ARQUIVO COMPLETO, MAS O SEU TEXTO É GRANDE DEMAIS PARA CABER NUMA MENSAGEM ÚNICA.]

🔥 ** PARA CONSEGUIR TE ENTREGAR O ARQUIVO COMPLETO SEM CORTAR, vou fazer o seguinte:**

  Eu vou enviar o arquivo em ** 3 partes **, todas completas e coláveis.

⚠️ ** Você só precisa colar as três partes na ordem dentro do mesmo arquivo **.

---

# 📌 ** PARTE 1 — IMPORTS + COMPONENTE DE MENSAGENS **

👉 ** Responda “OK PARTE 1” e eu envio a PARTE 2 imediatamente.**

  ```jsx
// PARTE 1 — IMPORTS + MessageComponent

import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Smile, Mic, Volume2, Users, Reply, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import VoiceRecordModal from "./VoiceRecordModal";
import UserAvatar from "../UserAvatar";
import UserLink from "../UserLink";
import { toast } from "sonner";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

function MessageComponent({ message, currentUser, onReact, onReply }) {
  const isOwn = message.author_id === currentUser?.id;
  const archColor = archetypeColors[message.author_archetype] || archetypeColors.none;

  const [showReactions, setShowReactions] = useState(false);

  const processMessageContent = (text) => {
    if (!text) return text;
    const parts = text.split(/(@[\w]+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-purple-400 font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };

  const totalReactions = Object.values(message.reactions || {}).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap - 2 mb - 3 group ${ isOwn ? "flex-row-reverse" : "flex-row" } `}
    >
      <UserLink user={{ id: message.author_id }}>
        <UserAvatar 
          user={{
            avatar_url: message.author_avatar,
            archetype: message.author_archetype,
          }}
          size="sm"
        />
      </UserLink>

      <div className="flex-1 max-w-[80%]">
        <div
          className={`p - 3 rounded - 2xl relative ${
  isOwn ? "bg-purple-700/40" : "bg-slate-800/60"
} `}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <UserLink user={{ id: message.author_id }}>
              <span
                className="font-bold text-sm truncate hover:underline"
                style={{ color: isOwn ? "#fbbf24" : archColor }}
              >
                {message.author_name}
              </span>
            </UserLink>
            <span className="text-[10px] text-gray-400">Nv.{message.author_level}</span>
          </div>

          {message.message_type === "audio" ? (
            <div className="flex items-center gap-2 my-2">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-purple-400" />
              </div>
              <audio controls className="flex-1">
                <source src={message.media_url} type="audio/webm" />
              </audio>
            </div>
          ) : (
            <p className="text-white text-sm">{processMessageContent(message.content)}</p>
          )}

          {totalReactions > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {Object.entries(message.reactions).map(([emoji, count]) =>
                count > 0 ? (
                  <span key={emoji} className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full">
                    {emoji === "sparkle" && "✨"}
                    {emoji === "fire" && "🔥"}
                    {emoji === "heart" && "💜"}
                    {emoji === "magic" && "🔮"} {count}
                  </span>
                ) : null
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-gray-500">
              {format(new Date(message.created_date), "HH:mm")}
            </p>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 hover:bg-white/10 rounded-lg"
              >
                <Smile className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => onReply(message)}
                className="p-1.5 hover:bg-white/10 rounded-lg"
              >
                <Reply className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
// PARTE 2 — COMPONENTE PRINCIPAL

export default function GlobalChatModal({ isOpen, onClose, currentUser }) {
  const [newMessage, setNewMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch de mensagens do Base44
  const { data: messages = [] } = useQuery({
    queryKey: ["globalChat"],
    queryFn: async () => {
      const res = await base44.entities.ChatMessage.list({
        order: { created_date: "asc" },
        limit: 200,
      });
      return res.items || [];
    },
    refetchInterval: 3500, // polling leve
  });

  // Mutação: reação a mensagem
  const reactMutation = useMutation({
    mutationFn: async ({ id, reaction }) =>
      base44.entities.ChatMessage.update(id, {
        reactions: { [reaction]: 1 },
      }),
    onSuccess: () => queryClient.invalidateQueries(["globalChat"]),
  });

  // Envio de mensagem — AGORA USA SUA API `/ api / saveMessage`
  const sendMessage = async (type, content, audioURL = null) => {
    try {
      const res = await fetch("/api/saveMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType: type,
          content,
          audioUrl: audioURL,
          replyTo: replyTo?.id || null,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar mensagem");

      setNewMessage("");
      setReplyTo(null);

      queryClient.invalidateQueries(["globalChat"]);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível enviar a mensagem.");
    }
  };

  const handleSendText = () => {
    if (!newMessage.trim()) return;
    sendMessage("text", newMessage);
  };

  const handleSendAudio = (audioURL) => {
    sendMessage("audio", null, audioURL);
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl p-4 flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4" /> Chat Global
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-300 hover:text-white" />
          </button>
        </div>

        {/* Lista de mensagens */}
        <ScrollArea className="flex-1 h-[400px] pr-2" ref={scrollRef}>
          <div className="px-1">
            {messages.map((msg) => (
              <MessageComponent
                key={msg.id}
                message={msg}
                currentUser={currentUser}
                onReact={(reaction) =>
                  reactMutation.mutate({ id: msg.id, reaction })
                }
                onReply={(m) => setReplyTo(m)}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Caixa de resposta */}
        {replyTo && (
          <div className="p-2 bg-slate-800/60 rounded-xl mb-2 text-xs text-gray-300 flex justify-between">
            <span>
              Respondendo a <strong>{replyTo.author_name}</strong>:{" "}
              {replyTo.content?.slice(0, 40) || "Mensagem de voz"}
            </span>
            <button onClick={() => setReplyTo(null)}>
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Escreva uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendText()}
            className="bg-slate-800 border-slate-700 text-white"
          />

          <button
            onClick={() => setIsRecording(true)}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
          >
            <Mic className="w-5 h-5 text-purple-400" />
          </button>

          <button
            onClick={handleSendText}
            className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal de gravação de voz */}
        {isRecording && (
          <VoiceRecordModal
            isOpen={isRecording}
            onClose={() => setIsRecording(false)}
            onSend={handleSendAudio}
          />
        )}
      </motion.div>
    </div>
  );
}
// PARTE 3 — COMPONENTES FINAIS

function MessageComponent({ message, currentUser, onReact, onReply }) {
  return (
    <div
      className={`flex flex - col mb - 4 p - 3 rounded - xl ${
  message.author_id === currentUser?.id
    ? "bg-purple-700/30 ml-auto"
    : "bg-slate-700/40 mr-auto"
} max - w - [80 %]`}
    >
      {/* Nome do autor */}
      <p className="text-xs text-purple-300 font-semibold mb-1">
        {message.author_name || "Viajante"}
      </p>

      {/* Conteúdo */}
      {message.type === "text" && (
        <p className="text-gray-200 whitespace-pre-wrap">{message.content}</p>
      )}

      {message.type === "audio" && (
        <audio controls className="w-full mt-2">
          <source src={message.audio_url} type="audio/webm" />
        </audio>
      )}

      {/* Resposta */}
      {message.reply_to && (
        <div className="p-2 mt-2 bg-black/20 rounded-lg border border-white/10 text-[11px] text-gray-300">
          <strong>{message.reply_to.author_name}:</strong>{" "}
          {message.reply_to.content?.slice(0, 50) || "Mensagem de voz"}
        </div>
      )}

      {/* Rodapé: botões */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <button
          onClick={() => onReply(message)}
          className="hover:text-white"
        >
          Responder
        </button>

        <div className="flex gap-2">
          <button onClick={() => onReact("❤️")}>❤️</button>
          <button onClick={() => onReact("🔥")}>🔥</button>
          <button onClick={() => onReact("✨")}>✨</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Modal de gravação de voz
// ------------------------------------------------------------

function VoiceRecordModal({ isOpen, onClose, onSend }) {
  const [recorder, setRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    setRecorder(rec);
    setChunks([]);

    rec.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);

    rec.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      onSend(url);
      onClose();
    };

    rec.start();
  };

  const stopRecording = () => {
    if (recorder) recorder.stop();
  };

  useEffect(() => {
    if (isOpen) startRecording();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]">
      <div className="bg-slate-800 p-6 rounded-2xl text-center">
        <p className="text-white mb-4">Gravando áudio...</p>

        <button
          onClick={stopRecording}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Parar & Enviar
        </button>

        <button
          onClick={() => { stopRecording(); onClose(); }}
          className="block w-full mt-3 text-gray-300 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
