import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Users, Volume2, VolumeX, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "../UserAvatar";

export function VoiceRoomControls({ voiceRoom }) {
  if (!voiceRoom?.myRoom) return null;

  const participantsCount = voiceRoom.myRoom?.participants?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-24 right-4 z-50 bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-xl shadow-2xl border border-green-500/50"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white font-semibold text-sm">Conversa Ativa</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-green-200" />
        <span className="text-green-100 text-xs">{participantsCount} participante{participantsCount !== 1 ? 's' : ''}</span>
        <button
          onClick={() => voiceRoom?.setShowParticipantsModal?.(true)}
          className="ml-auto text-green-300 hover:text-white transition text-xs underline"
        >
          Ver todos
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={voiceRoom.micEnabled ? "default" : "destructive"}
          onClick={voiceRoom.toggleMic}
          className="flex-1"
        >
          {voiceRoom.micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={voiceRoom.leaveRoom}
        >
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export function ParticipantsModal({ room, onClose, currentUser, otherPlayers }) {
  if (!room?.participants) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-purple-500/30 max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participantes ({room.participants.length})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {room.participants.map((participant) => {
            const isMe = participant.user_id === currentUser?.id;
            const playerData = isMe ? currentUser : otherPlayers.find(p => p.user_id === participant.user_id)?.user;

            return (
              <div
                key={participant.user_id}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
              >
                {playerData && <UserAvatar user={playerData} size="sm" />}
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">
                    {participant.user_name || 'Participante'}
                    {isMe && <span className="text-green-400 ml-2">(Você)</span>}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {playerData?.archetype ? playerData.archetype.replace(/_/g, ' ') : 'Viajante'}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            );
          })}
        </div>

        {room.pending_invites && room.pending_invites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Aguardando ({room.pending_invites.length})</h4>
            <div className="space-y-2">
              {room.pending_invites.map((invite, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-gray-400 text-xs">Convite pendente...</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={onClose} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
          Fechar
        </Button>
      </motion.div>
    </motion.div>
  );
}

export function PendingInviteModal({ invite, onAccept, onDecline, invitingUser }) {
  if (!invite) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-xl border border-purple-500/50 max-w-sm w-full mx-4 shadow-2xl"
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">🎙️</div>
          <h3 className="text-xl font-bold text-white mb-2">Convite para Conversa!</h3>
          {invitingUser && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserAvatar user={invitingUser} size="sm" />
              <p className="text-purple-200">{invitingUser.display_name || invitingUser.full_name}</p>
            </div>
          )}
          <p className="text-purple-300 text-sm">
            {invitingUser ? `${invitingUser.display_name || invitingUser.full_name} te convidou` : 'Você foi convidado'} para uma conversa de áudio.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Aceitar
          </Button>
          <Button
            onClick={onDecline}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Recusar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}