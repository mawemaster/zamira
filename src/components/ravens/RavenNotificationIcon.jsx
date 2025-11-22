import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";

export default function RavenNotificationIcon({ unreadCount = 0 }) {
  const navigate = useNavigate();

  if (!unreadCount || unreadCount === 0) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      onClick={() => navigate(createPageUrl("Chat"))}
      className="fixed left-4 bottom-20 md:bottom-24 z-[45] w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-purple-500/50 flex items-center justify-center shadow-2xl hover:scale-110 transition-all"
      style={{
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-400/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/4332b5385_corvo.png" 
        alt="Corvos" 
        className="w-8 h-8 md:w-10 md:h-10 object-contain relative z-10"
      />
      
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-6 min-w-[24px] px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-bold border-2 border-[#02031C] z-20">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </motion.button>
  );
}