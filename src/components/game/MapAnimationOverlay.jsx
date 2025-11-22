
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Posições dos portais azuis no mapa (ajustadas para mapa 20x20)
const BLUE_PORTAL_POSITIONS = {
  lobby: [
    { x: 7, y: 12 }, // Portal azul inferior esquerdo
    { x: 15, y: 16 }, // Portal azul inferior direito
  ],
  city: [
    { x: 5, y: 15 }, // Ajustado para 20x20
    { x: 12, y: 8 },
    { x: 8, y: 5 },
    { x: 15, y: 14 },
  ]
};

// Posições dos portais roxos (ajustadas para mapa 20x20)
const PURPLE_PORTAL_POSITIONS = {
  lobby: [
    { x: 5, y: 5, name: "Portal Norte" },
    { x: 15, y: 5, name: "Portal Nordeste" },
    { x: 5, y: 15, name: "Portal Sul" }
  ],
  city: [
    { x: 4, y: 4, name: "Portal Central" },
    { x: 15, y: 4, name: "Portal Leste" },
    { x: 10, y: 15, name: "Portal Sul" }
  ]
};

const generateFireflies = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 8,
    size: 1.5 + Math.random() * 2.5,
    opacity: 0.4 + Math.random() * 0.5,
    hue: 45 + Math.random() * 15
  }));
};

export default function MapAnimationOverlay({ 
  currentMap, 
  playerPos, 
  canvasWidth, 
  canvasHeight, 
  tileSize,
  zoomLevel = 1,
  targetMap, // New prop
  onComplete, // New prop
  currentRoom // New prop
}) {
  const canvasRef = useRef(null);
  const fireflies = useRef(generateFireflies(60));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let animationFrame;
    const effectiveTileSize = tileSize * zoomLevel;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() / 1000;
      const cameraX = playerPos.x * effectiveTileSize - canvas.width / 2;
      const cameraY = playerPos.y * effectiveTileSize - canvas.height / 2;

      // ===== SOMBREAMENTO NOS CANTOS =====
      const vignetteFade = Math.min(canvas.width, canvas.height) * 0.4;
      
      // Canto superior esquerdo
      const topLeftGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, vignetteFade);
      topLeftGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      topLeftGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
      topLeftGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topLeftGradient;
      ctx.fillRect(0, 0, vignetteFade, vignetteFade);

      // Canto superior direito
      const topRightGradient = ctx.createRadialGradient(canvas.width, 0, 0, canvas.width, 0, vignetteFade);
      topRightGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      topRightGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
      topRightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topRightGradient;
      ctx.fillRect(canvas.width - vignetteFade, 0, vignetteFade, vignetteFade);

      // Canto inferior esquerdo
      const bottomLeftGradient = ctx.createRadialGradient(0, canvas.height, 0, 0, canvas.height, vignetteFade);
      bottomLeftGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      bottomLeftGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
      bottomLeftGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bottomLeftGradient;
      ctx.fillRect(0, canvas.height - vignetteFade, vignetteFade, vignetteFade);

      // Canto inferior direito
      const bottomRightGradient = ctx.createRadialGradient(canvas.width, canvas.height, 0, canvas.width, canvas.height, vignetteFade);
      bottomRightGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      bottomRightGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
      bottomRightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bottomRightGradient;
      ctx.fillRect(canvas.width - vignetteFade, canvas.height - vignetteFade, vignetteFade, vignetteFade);

      // ===== DESENHAR PORTAIS AZUIS =====
      const bluePortals = BLUE_PORTAL_POSITIONS[currentMap] || [];
      bluePortals.forEach(portal => {
        const screenX = portal.x * effectiveTileSize - cameraX;
        const screenY = portal.y * effectiveTileSize - cameraY;

        if (screenX < -150 || screenX > canvas.width + 150 || 
            screenY < -150 || screenY > canvas.height + 150) {
          return;
        }

        const baseRadius = effectiveTileSize * 2;
        const pulse = Math.sin(time * 1.2) * 0.2 + 0.8;

        // Anel externo azul claro
        const outerGradient = ctx.createRadialGradient(
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, 0,
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse * 1.3
        );
        outerGradient.addColorStop(0, `rgba(100, 180, 255, ${0.3 * pulse})`);
        outerGradient.addColorStop(0.5, `rgba(80, 150, 255, ${0.15 * pulse})`);
        outerGradient.addColorStop(1, 'rgba(60, 120, 255, 0)');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Anel médio azul médio
        const midGradient = ctx.createRadialGradient(
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, 0,
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse * 0.8
        );
        midGradient.addColorStop(0, `rgba(120, 200, 255, ${0.4 * pulse})`);
        midGradient.addColorStop(0.6, `rgba(90, 170, 255, ${0.2 * pulse})`);
        midGradient.addColorStop(1, 'rgba(70, 140, 255, 0)');

        ctx.fillStyle = midGradient;
        ctx.beginPath();
        ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo azul brilhante
        const innerGradient = ctx.createRadialGradient(
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, 0,
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * 0.3 * pulse
        );
        innerGradient.addColorStop(0, `rgba(180, 220, 255, ${0.6 * pulse})`);
        innerGradient.addColorStop(0.5, `rgba(140, 200, 255, ${0.4 * pulse})`);
        innerGradient.addColorStop(1, `rgba(100, 170, 255, ${0.2 * pulse})`);

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * 0.3 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Partículas azuis orbitando
        for (let i = 0; i < 8; i++) {
          const angle = time * 1.5 + (i * Math.PI * 2 / 8);
          const orbitRadius = baseRadius * 0.6;
          const particleX = screenX + effectiveTileSize/2 + Math.cos(angle) * orbitRadius;
          const particleY = screenY + effectiveTileSize/2 + Math.sin(angle) * orbitRadius;
          const particlePulse = Math.sin(time * 2.5 + i) * 0.3 + 0.7;

          ctx.fillStyle = `rgba(150, 210, 255, ${0.5 * particlePulse})`;
          ctx.shadowColor = 'rgba(100, 180, 255, 0.8)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 3 * particlePulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Ondas azuis expandindo
        const wavePhase = (time * 1.5) % 2;
        if (wavePhase < 1.5) {
          const waveRadius = baseRadius * wavePhase * 0.7;
          const waveOpacity = (1 - wavePhase / 1.5) * 0.35;

          ctx.strokeStyle = `rgba(120, 200, 255, ${waveOpacity})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // ===== DESENHAR PORTAIS ROXOS (similar, adaptado com effectiveTileSize) =====
      const purplePortals = PURPLE_PORTAL_POSITIONS[currentMap] || [];
      purplePortals.forEach(portal => {
        const screenX = portal.x * effectiveTileSize - cameraX;
        const screenY = portal.y * effectiveTileSize - cameraY;

        if (screenX < -100 || screenX > canvas.width + 100 || 
            screenY < -100 || screenY > canvas.height + 100) {
          return;
        }

        const baseRadius = effectiveTileSize * 1.2;
        const pulse = Math.sin(time * 1.5) * 0.15 + 0.85;

        const outerGradient = ctx.createRadialGradient(
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, 0,
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse * 1.5
        );
        outerGradient.addColorStop(0, `rgba(100, 200, 255, ${0.15 * pulse})`);
        outerGradient.addColorStop(0.5, `rgba(100, 200, 255, ${0.08 * pulse})`);
        outerGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse * 1.5, 0, Math.PI * 2);
        ctx.fill();

        const midGradient = ctx.createRadialGradient(
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, 0,
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse
        );
        midGradient.addColorStop(0, `rgba(120, 220, 255, ${0.25 * pulse})`);
        midGradient.addColorStop(0.6, `rgba(100, 200, 255, ${0.12 * pulse})`);
        midGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

        ctx.fillStyle = midGradient;
        ctx.beginPath();
        ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * pulse, 0, Math.PI * 2);
        ctx.fill();

        const innerGradient = ctx.createRadialGradient(
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, 0,
          screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * 0.4 * pulse
        );
        innerGradient.addColorStop(0, `rgba(180, 240, 255, ${0.4 * pulse})`);
        innerGradient.addColorStop(0.5, `rgba(140, 220, 255, ${0.25 * pulse})`);
        innerGradient.addColorStop(1, `rgba(100, 200, 255, ${0.1 * pulse})`);

        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, baseRadius * 0.4 * pulse, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 6; i++) {
          const angle = time * 2 + (i * Math.PI * 2 / 6);
          const orbitRadius = baseRadius * 0.7;
          const particleX = screenX + effectiveTileSize/2 + Math.cos(angle) * orbitRadius;
          const particleY = screenY + effectiveTileSize/2 + Math.sin(angle) * orbitRadius;
          const particlePulse = Math.sin(time * 3 + i) * 0.3 + 0.7;

          ctx.fillStyle = `rgba(180, 240, 255, ${0.5 * particlePulse})`;
          ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 2.5 * particlePulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        const wavePhase = (time * 1.2) % 2;
        if (wavePhase < 1.5) {
          const waveRadius = baseRadius * wavePhase * 0.8;
          const waveOpacity = (1 - wavePhase / 1.5) * 0.25;

          ctx.strokeStyle = `rgba(100, 200, 255, ${waveOpacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(screenX + effectiveTileSize/2, screenY + effectiveTileSize/2, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // ===== DESENHAR VAGALUMES =====
      fireflies.current.forEach(firefly => {
        const phase = (time + firefly.delay) % firefly.duration;
        const progress = phase / firefly.duration;

        const x = (firefly.initialX + Math.sin(progress * Math.PI * 4) * 8 + Math.cos(progress * Math.PI * 2) * 3) * canvas.width / 100;
        const y = (firefly.initialY + Math.cos(progress * Math.PI * 5) * 6 + Math.sin(progress * Math.PI * 3) * 4 - progress * 8) * canvas.height / 100;

        const pulseOpacity = Math.sin(progress * Math.PI * 10) * 0.4 + 0.6;
        const finalOpacity = firefly.opacity * pulseOpacity;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, firefly.size * 4);
        gradient.addColorStop(0, `hsla(${firefly.hue}, 100%, 80%, ${finalOpacity * 0.9})`);
        gradient.addColorStop(0.3, `hsla(${firefly.hue}, 90%, 70%, ${finalOpacity * 0.7})`);
        gradient.addColorStop(0.6, `hsla(${firefly.hue}, 80%, 60%, ${finalOpacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(255, 240, 150, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, firefly.size * 4, 0, Math.PI * 2);
        ctx.fill();

        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, firefly.size);
        coreGradient.addColorStop(0, `hsla(${firefly.hue}, 100%, 95%, ${finalOpacity})`);
        coreGradient.addColorStop(0.5, `hsla(${firefly.hue}, 100%, 85%, ${finalOpacity * 0.8})`);
        coreGradient.addColorStop(1, `hsla(${firefly.hue}, 90%, 75%, ${finalOpacity * 0.3})`);

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(x, y, firefly.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = `hsla(${firefly.hue}, 100%, 70%, ${finalOpacity * 0.6})`;
        ctx.shadowBlur = firefly.size * 3;
        ctx.fillStyle = `hsla(${firefly.hue}, 100%, 90%, ${finalOpacity * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, firefly.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [currentMap, playerPos, canvasWidth, canvasHeight, tileSize, zoomLevel]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        mixBlendMode: 'screen',
        opacity: 0.85
      }}
    />
  );
}
