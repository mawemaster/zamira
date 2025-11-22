import React from "react";
import { Sparkles } from "lucide-react";

const archetypeColors = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#64748B"
};

const statusColors = {
  online: "#10B981",    // Verde
  busy: "#F59E0B",      // Laranja
  offline: "#64748B"    // Cinza
};

export default function UserAvatar({ 
  user, 
  size = "md",           // xs, sm, md, lg, xl
  showStatus = true,
  className = ""
}) {
  // VALIDAÇÃO CRÍTICA
  if (!user) return null;

  const sizes = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const statusSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5"
  };

  const archColor = archetypeColors[user?.archetype] || archetypeColors.none;
  const statusColor = statusColors[user?.online_status] || statusColors.offline;

  // Determinar se está online baseado em last_seen (se passou mais de 5 min, considera offline)
  const isOnline = () => {
    if (!user?.last_seen) return user?.online_status === "online" || user?.online_status === "busy";
    
    const lastSeen = new Date(user.last_seen);
    const now = new Date();
    const diffMinutes = (now - lastSeen) / (1000 * 60);
    
    return diffMinutes < 5 && (user?.online_status === "online" || user?.online_status === "busy");
  };

  const showStatusIndicator = showStatus && isOnline();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-2 overflow-hidden flex-shrink-0`}
        style={{ borderColor: archColor }}
      >
        {user?.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.display_name || user.full_name || "Avatar"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${archColor}20` }}
          >
            <Sparkles className="w-1/2 h-1/2" style={{ color: archColor }} />
          </div>
        )}
      </div>

      {/* Indicador de Status */}
      {showStatusIndicator && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizes[size]} rounded-full border-2 border-black`}
          style={{ backgroundColor: statusColor }}
        />
      )}
    </div>
  );
}