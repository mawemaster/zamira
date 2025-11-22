
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";

const ARCHETYPE_COLORS = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#A855F7"
};

export default function Minimap({ 
  currentMap, 
  mapData,
  playerPos, 
  otherPlayers,
  npcPosition,
  mysticalPoints,
  transitionZones,
  isExpanded,
  onToggleExpand
}) {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapData) return;

    const ctx = canvas.getContext('2d');
    
    // Tamanho menor em mobile
    const baseSize = isMobile ? (isExpanded ? 200 : 100) : (isExpanded ? 300 : 150);
    canvas.width = baseSize;
    canvas.height = baseSize;

    const mapWidth = mapData.width;
    const mapHeight = mapData.height;
    const scale = baseSize / Math.max(mapWidth, mapHeight);

    // Fundo do minimapa
    ctx.fillStyle = 'rgba(10, 10, 21, 0.9)';
    ctx.fillRect(0, 0, baseSize, baseSize);

    // Grade do mapa
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
    ctx.lineWidth = 1;
    const gridSize = 5;
    for (let x = 0; x <= mapWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, mapHeight * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= mapHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(mapWidth * scale, y * scale);
      ctx.stroke();
    }

    // Áreas caminháveis (tons de verde claro)
    if (mapData.collisionMap) {
      mapData.collisionMap.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 0) {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        });
      });
    }

    // Zonas de transição (roxo brilhante)
    if (transitionZones) {
      transitionZones.forEach(zone => {
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2) * 0.3 + 0.7;
        
        ctx.fillStyle = `rgba(168, 85, 247, ${0.4 * pulse})`;
        ctx.fillRect(
          zone.x * scale,
          zone.y * scale,
          zone.width * scale,
          zone.height * scale
        );
        
        ctx.strokeStyle = `rgba(168, 85, 247, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          zone.x * scale,
          zone.y * scale,
          zone.width * scale,
          zone.height * scale
        );
      });
    }

    // Pontos místicos (estrelas)
    if (mysticalPoints) {
      mysticalPoints.forEach(point => {
        const px = point.x * scale;
        const py = point.y * scale;
        
        ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, 8);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // NPC (laranja)
    if (npcPosition && currentMap === npcPosition.map) {
      const npcX = npcPosition.x * scale;
      const npcY = npcPosition.y * scale;
      
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(npcX, npcY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Outros jogadores (cor do arquétipo)
    otherPlayers.forEach(player => {
      if (player.current_room === currentMap && player.user) {
        const px = player.x * scale;
        const py = player.y * scale;
        const color = ARCHETYPE_COLORS[player.user.archetype] || ARCHETYPE_COLORS.none;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Jogador atual (amarelo brilhante com pulso)
    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 3) * 0.2 + 0.8;
    const playerX = playerPos.x * scale;
    const playerY = playerPos.y * scale;
    
    // Anel externo pulsante
    ctx.strokeStyle = `rgba(251, 191, 36, ${pulse * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(playerX, playerY, 8 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    
    // Jogador
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(playerX, playerY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Indicador de direção
    const directionAngles = {
      up: -Math.PI / 2,
      down: Math.PI / 2,
      left: Math.PI,
      right: 0
    };
    const angle = directionAngles[playerPos.direction] || 0;
    const arrowLength = 8;
    const arrowX = playerX + Math.cos(angle) * arrowLength;
    const arrowY = playerY + Math.sin(angle) * arrowLength;
    
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(arrowX, arrowY);
    ctx.stroke();

    // Borda do minimapa
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, baseSize, baseSize);

  }, [currentMap, mapData, playerPos, otherPlayers, npcPosition, mysticalPoints, transitionZones, isExpanded, isMobile]);

  const sizeClass = isMobile 
    ? (isExpanded ? 'w-[200px] h-[200px]' : 'w-[100px] h-[100px]') 
    : (isExpanded ? 'w-[300px] h-[300px]' : 'w-[150px] h-[150px]');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed ${isExpanded ? 'top-20' : 'top-20'} ${isMobile ? 'right-2' : 'right-4'} z-40 bg-slate-900/90 backdrop-blur-sm rounded-2xl border-2 border-purple-500/50 shadow-2xl overflow-hidden ${sizeClass}`}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Botão de expansão */}
        <button
          onClick={onToggleExpand}
          className={`absolute top-2 right-2 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-purple-500/30 flex items-center justify-center transition`}
        >
          {isExpanded ? (
            <Minimize2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-purple-300`} />
          ) : (
            <Maximize2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-purple-300`} />
          )}
        </button>

        {/* Legenda */}
        {isExpanded && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-800/90 rounded-lg p-2 border border-purple-500/30">
            <div className={`grid grid-cols-2 gap-1 ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}>
              <div className="flex items-center gap-1">
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-yellow-400`}></div>
                <span className="text-yellow-300">Você</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-purple-400`}></div>
                <span className="text-purple-300">Jogadores</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-orange-400`}></div>
                <span className="text-orange-300">NPC</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-purple-400`}></div>
                <span className="text-purple-300">Portais</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nome do mapa */}
      <div className={`absolute top-2 left-2 bg-slate-800/80 px-2 py-1 rounded ${isMobile ? 'text-[8px]' : 'text-[10px]'} text-purple-300 font-semibold`}>
        {mapData?.name || 'Mapa'}
      </div>
    </motion.div>
  );
}
