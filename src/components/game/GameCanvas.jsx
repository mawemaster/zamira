import React, { useRef, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users, MessageCircle, UserPlus, X, User as UserIcon, Clock, Compass, HelpCircle, Move, Mic, Backpack, Home, Eye, Video } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import SoundManager from "./SoundManager";
import UserAvatar from "../UserAvatar";
import useWebRTC from "./WebRTCManager";
import VideoOverlay from "./VideoOverlay";
import LoadingScreen from "./LoadingScreen";
import MapTransitionAnimation from "./MapTransitionAnimation";
import MapAnimationOverlay from "./MapAnimationOverlay";
import InventorySystem from "./InventorySystem";
import Minimap from "./Minimap";
import WelderShop from "./WelderShop";
import MobileGameMenu from "./MobileGameMenu";

const TILE_SIZE = 48;
const PLAYER_SPEED = 8;
const UPDATE_INTERVAL = 30;
const SYNC_INTERVAL = 100;
const PROXIMITY_DISTANCE = 8;
const NPC_PROXIMITY = 3;
const ADMIN_EMAIL = "mawemaster@gmail.com";

const MAPS = {
  lobby: {
    name: "Centro de Zamira",
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/6d234581f_Mapadejogo2Dcom.png",
    width: 20,
    height: 20,
    spawnPoint: { x: 9.5, y: 9.5 },
    minX: 2, maxX: 17,
    minY: 2, maxY: 17,
    collisionMap: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
      [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    transitionZones: [
      { x: 9.5, y: 1.5, width: 3, height: 1, targetMap: "city", targetPos: { x: 9.5, y: 17 }, label: "Cidade Expandida" }
    ]
  },
  city: {
    name: "Cidade de Zamira",
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/710d92912_Mapadejogo2Dcom3.png",
    width: 20,
    height: 20,
    spawnPoint: { x: 9.5, y: 17 },
    minX: 1, maxX: 18,
    minY: 1, maxY: 18,
    collisionMap: Array(20).fill(null).map((_, y) => 
      Array(20).fill(null).map((_, x) => {
        if (x === 0 || x === 19 || y === 0 || y === 19) return 1;
        if (y === 0 && x >= 8 && x <= 11) return 0;
        return 0;
      })
    ),
    transitionZones: [
      { x: 9.5, y: 1, width: 3, height: 1, targetMap: "lobby", targetPos: { x: 9.5, y: 17 }, label: "Centro de Zamira" }
    ]
  }
};

const FAVICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e5f6f991e09e82bef3795/a3f627646_imgi_2_337f3cf9e282bc41c87500e885414629.png";

const NPC_MERCHANT = {
  name: "Welder",
  x: 10.5,
  y: 9,
  avatar: "🛒",
  color: "#F59E0B",
  map: "lobby"
};

const MYSTICAL_POINTS = [
  { x: 5, y: 5, name: "Fonte da Sabedoria", emoji: "🌟", map: "lobby" },
  { x: 15, y: 5, name: "Portal do Norte", emoji: "🌀", map: "lobby" },
  { x: 5, y: 15, name: "Portal do Sul", emoji: "🌀", map: "lobby" },
  { x: 15, y: 15, name: "Jardim Lunar", emoji: "🌙", map: "lobby" },
];

const PORTAL_DESTINATIONS = {
  'lobby': {
    '4,4': { x: 15, y: 15 },
    '15,4': { x: 4, y: 15 },
    '4,15': { x: 15, y: 4 },
    '15,15': { x: 4, y: 4 },
  },
  'city': {}
};

const ARCHETYPE_COLORS = {
  bruxa_natural: "#9333EA",
  sabio: "#F59E0B",
  guardiao_astral: "#3B82F6",
  xama: "#10B981",
  navegador_cosmico: "#8B5CF6",
  alquimista: "#6366F1",
  none: "#A855F7"
};

const ARCHETYPE_ICONS = {
  bruxa_natural: "🌿",
  sabio: "📚",
  guardiao_astral: "⭐",
  xama: "🦅",
  navegador_cosmico: "🌌",
  alquimista: "⚗️",
  none: "✨"
};

export default function GameCanvas({ user, onExit }) {
  const currentUser = user;
  if (!currentUser?.id) return null;

  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  
  const [playerPos, setPlayerPos] = useState({ x: 9.5, y: 9.5 });
  const [playerDirection, setPlayerDirection] = useState('down');
  const [isMoving, setIsMoving] = useState(false);
  const [targetPos, setTargetPos] = useState(null);
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  const [showNPCBalloon, setShowNPCBalloon] = useState(false);
  const [showNPCShop, setShowNPCShop] = useState(false);
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [zamiraTime, setZamiraTime] = useState('');
  
  const [mapArtImage, setMapArtImage] = useState(null);
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  const [adminTrail, setAdminTrail] = useState([]);
  
  const [currentMap, setCurrentMap] = useState("lobby");
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [pendingTransition, setPendingTransition] = useState(null);
  const [mapImages, setMapImages] = useState({});

  const [showTransitionAnimation, setShowTransitionAnimation] = useState(false);
  const [transitionDestination, setTransitionDestination] = useState(null);

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  const [showInventory, setShowInventory] = useState(false);
  const [minimapExpanded, setMinimapExpanded] = useState(false);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState(null);
  const [fireflies, setFireflies] = useState([]);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);

  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const lastStepSoundRef = useRef(Date.now());
  const allUsersCache = useRef({});

  const [zoomLevel, setZoomLevel] = useState(1);
  const [preloadedProducts, setPreloadedProducts] = useState(null);
  const [citySettings, setCitySettings] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTask, setLoadingTask] = useState("Iniciando...");

  // WebRTC Hook
  const webRTC = useWebRTC({
    currentUser,
    otherPlayers,
    playerPos,
    proximityDistance: PROXIMITY_DISTANCE
  });

  const calculateDistance = useCallback((x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const generateFireflies = () => {
      const newFireflies = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        duration: 5 + Math.random() * 10,
        delay: Math.random() * 5,
      }));
      setFireflies(newFireflies);
    };
    generateFireflies();
  }, []);

  useEffect(() => {
    const updateZamiraTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setZamiraTime(`${hours}:${minutes}`);
    };
    
    updateZamiraTime();
    const interval = setInterval(updateZamiraTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const isWalkable = useCallback((x, y) => {
    const map = MAPS[currentMap];
    if (!map || !map.collisionMap) return false;
    
    if (x < map.minX || x > map.maxX || y < map.minY || y > map.maxY) return false;

    const tileX = Math.floor(x);
    const tileY = Math.floor(y);
    
    if (tileY < 0 || tileY >= map.height || tileX < 0 || tileX >= map.width) return false;
    
    return map.collisionMap[tileY][tileX] !== 1;
  }, [currentMap]);

  const getCompassDirection = useCallback(() => {
    const dirMap = { 'down': 'S', 'up': 'N', 'left': 'W', 'right': 'E' };
    return dirMap[playerDirection] || 'N';
  }, [playerDirection]);

  // 🚀 PRÉ-CARREGAMENTO TOTAL
  useEffect(() => {
    let isMounted = true;
    
    const preloadEverything = async () => {
      try {
        console.log("🔄 INICIANDO CARREGAMENTO COMPLETO");
        
        setLoadingTask("Carregando mapas...");
        setLoadingProgress(10);
        
        const loadedImages = {};
        for (const [mapKey, mapData] of Object.entries(MAPS)) {
          await new Promise((resolve) => {
            const mapImg = new Image();
            mapImg.crossOrigin = "anonymous";
            mapImg.onload = () => {
              loadedImages[mapKey] = mapImg;
              console.log(`✅ Mapa ${mapKey} carregado`);
              resolve();
            };
            mapImg.onerror = () => {
              console.error(`❌ Erro mapa ${mapKey}`);
              resolve();
            };
            mapImg.src = mapData.url;
          });
        }
        
        if (!isMounted) return;
        setMapImages(loadedImages);
        setLoadingProgress(20);

        setLoadingTask("Carregando produtos...");
        const products = await base44.entities.MysticalProduct.filter({ is_active: true });
        if (!isMounted) return;
        setPreloadedProducts(products);
        setLoadingProgress(30);

        setLoadingTask("Carregando configurações...");
        const settings = await base44.entities.ZamiraCitySettings.list();
        if (settings.length > 0 && isMounted) {
          setCitySettings(settings[0]);
        }
        setLoadingProgress(35);

        setLoadingTask("Localizando você...");
        const positions = await base44.entities.ZamiraPosition.filter({ user_id: currentUser.id });
        let initialMap = 'lobby';
        
        if (positions.length > 0) {
          const pos = positions[0];
          if (!isMounted) return;
          
          setPlayerPos({ x: pos.x, y: pos.y });
          setPlayerDirection(pos.direction || 'down');
          setCurrentMap(pos.current_room || 'lobby');
          initialMap = pos.current_room || 'lobby';
          
          await base44.entities.ZamiraPosition.update(pos.id, { is_online: true });
        } else {
          const spawn = MAPS[initialMap].spawnPoint;
          if (!isMounted) return;
          
          setPlayerPos(spawn);
          setCurrentMap(initialMap);
          
          await base44.entities.ZamiraPosition.create({
            user_id: currentUser.id,
            x: spawn.x,
            y: spawn.y,
            direction: 'down',
            current_room: initialMap,
            is_online: true
          });
        }
        
        if (!isMounted) return;
        setMapArtImage(loadedImages[initialMap]);
        setLoadingProgress(50);

        setLoadingTask("Carregando TODOS os jogadores online...");
        console.log("🔍 Buscando jogadores...");
        
        const allPositions = await base44.entities.ZamiraPosition.filter(
          { is_online: true },
          "-updated_date",
          500
        );
        
        console.log(`📍 ${allPositions.length} posições encontradas`);
        
        const otherPositions = allPositions.filter(p => p.user_id && p.user_id !== currentUser.id);
        console.log(`👥 ${otherPositions.length} outros jogadores`);
        
        if (!isMounted) return;
        setLoadingProgress(60);

        const userIds = [...new Set(otherPositions.map(p => p.user_id))].filter(Boolean);
        console.log(`🆔 ${userIds.length} IDs únicos: ${userIds.join(', ')}`);
        
        setLoadingTask(`Carregando dados de ${userIds.length} jogadores...`);
        
        // CARREGAR EM LOTES PARALELOS
        const batchSize = 10;
        for (let i = 0; i < userIds.length; i += batchSize) {
          const batch = userIds.slice(i, i + batchSize);
          
          await Promise.all(batch.map(async (userId) => {
            try {
              const users = await base44.entities.User.filter({ id: userId });
              if (users.length > 0 && isMounted) {
                allUsersCache.current[userId] = users[0];
                console.log(`✅ ${users[0].display_name || users[0].full_name} (${userId})`);
              } else {
                console.warn(`⚠️ Usuário não encontrado: ${userId}`);
              }
            } catch (err) {
              console.error(`❌ Erro user ${userId}:`, err);
            }
          }));
          
          if (!isMounted) return;
          const progress = 60 + (i / userIds.length) * 30;
          setLoadingProgress(Math.floor(progress));
        }

        if (!isMounted) return;
        setLoadingProgress(90);

        const playersWithUsers = otherPositions
          .filter(pos => allUsersCache.current[pos.user_id])
          .map(pos => ({
            ...pos,
            user: allUsersCache.current[pos.user_id]
          }));
        
        console.log(`✨ ${playersWithUsers.length} jogadores PRONTOS`);
        
        if (!isMounted) return;
        setOtherPlayers(playersWithUsers);
        setLoadingProgress(95);

        setLoadingTask("Preparando ambiente...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!isMounted) return;
        setLoadingProgress(100);
        
        setTimeout(() => {
          if (isMounted) {
            setAllAssetsLoaded(true);
            console.log("🎮 ZAMIRA TOTALMENTE CARREGADA!");
          }
        }, 300);
      } catch (error) {
        console.error("❌ Erro no carregamento:", error);
        if (isMounted) setAllAssetsLoaded(true);
      }
    };

    preloadEverything();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (mapImages[currentMap]) {
      setMapArtImage(mapImages[currentMap]);
    }
  }, [currentMap, mapImages]);

  // 🚀 SINCRONIZAÇÃO EM TEMPO REAL
  useEffect(() => {
    if (!allAssetsLoaded) return;

    const syncPlayers = async () => {
      try {
        const allPositions = await base44.entities.ZamiraPosition.filter(
          { is_online: true },
          "-updated_date",
          500
        );
        
        const otherPositions = allPositions.filter(p => p.user_id && p.user_id !== currentUser.id);
        
        // Carregar novos usuários que não estão no cache
        const newUserIds = otherPositions
          .map(p => p.user_id)
          .filter(id => !allUsersCache.current[id]);
        
        if (newUserIds.length > 0) {
          console.log(`🆕 Carregando ${newUserIds.length} novos jogadores...`);
          
          await Promise.all(newUserIds.map(async (userId) => {
            try {
              const users = await base44.entities.User.filter({ id: userId });
              if (users.length > 0) {
                allUsersCache.current[userId] = users[0];
                console.log(`✅ Novo: ${users[0].display_name || users[0].full_name}`);
              }
            } catch (err) {
              console.error(`❌ Erro ao carregar ${userId}:`, err);
            }
          }));
        }
        
        const players = otherPositions
          .filter(pos => allUsersCache.current[pos.user_id])
          .map(pos => ({
            ...pos,
            user: allUsersCache.current[pos.user_id]
          }));
        
        setOtherPlayers(players);

        const nearby = players.filter(player => {
          if (player.current_room !== currentMap) return false;
          const distance = calculateDistance(
            playerPos.x, playerPos.y,
            player.x, player.y
          );
          return distance <= PROXIMITY_DISTANCE;
        });

        setNearbyPlayers(nearby);
      } catch (error) {
        console.error("❌ Erro sync:", error);
      }
    };

    syncPlayers();
    const interval = setInterval(syncPlayers, SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [currentUser.id, playerPos, currentMap, calculateDistance, allAssetsLoaded]);

  const savePosition = useCallback(async (x, y, direction = 'down', mapName = null) => {
    try {
      const existing = await base44.entities.ZamiraPosition.filter({ user_id: currentUser.id });
      const roomToSave = mapName || currentMap;
      
      const tileX = Math.floor(x);
      const tileY = Math.floor(y);
      const portalKey = `${tileX},${tileY}`;
      
      if (PORTAL_DESTINATIONS[roomToSave]?.[portalKey]) {
        if (window.playPortalSound) window.playPortalSound();
        const dest = PORTAL_DESTINATIONS[roomToSave][portalKey];
        setPlayerPos({ x: dest.x + 0.5, y: dest.y + 0.5 });
        setTargetPos(null);
        x = dest.x + 0.5;
        y = dest.y + 0.5;
      }
      
      if (existing.length > 0) {
        await base44.entities.ZamiraPosition.update(existing[0].id, {
          x, y, direction, current_room: roomToSave, is_online: true
        });
      } else {
        await base44.entities.ZamiraPosition.create({
          user_id: currentUser.id,
          x, y, direction,
          current_room: roomToSave,
          is_online: true
        });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  }, [currentUser.id, currentMap]);

  useEffect(() => {
    const distance = calculateDistance(playerPos.x, playerPos.y, NPC_MERCHANT.x, NPC_MERCHANT.y);
    if (currentMap === NPC_MERCHANT.map && distance <= NPC_PROXIMITY && !showNPCShop) {
      setShowNPCBalloon(true);
    } else {
      setShowNPCBalloon(false);
    }
  }, [playerPos, showNPCShop, calculateDistance, currentMap]);

  useEffect(() => {
    const map = MAPS[currentMap];
    if (!map) return;

    for (const zone of map.transitionZones) {
      const distance = calculateDistance(playerPos.x, playerPos.y, zone.x, zone.y);
      
      if (distance <= 1.5 && !showTransitionModal && !showTransitionAnimation) {
        setPendingTransition(zone);
        setShowTransitionModal(true);
        setTargetPos(null);
        break;
      }
    }
  }, [playerPos, currentMap, showTransitionModal, showTransitionAnimation, calculateDistance]);

  const handleTransition = async (accept) => {
    setShowTransitionModal(false);
    
    if (!accept || !pendingTransition) {
      setPendingTransition(null);
      return;
    }

    if (window.playPortalSound) window.playPortalSound();

    setTransitionDestination(pendingTransition);
    setShowTransitionAnimation(true);

    const targetMapKey = pendingTransition.targetMap;
    if (!mapImages[targetMapKey] && MAPS[targetMapKey]) {
      const mapImg = new Image();
      mapImg.crossOrigin = "anonymous";
      mapImg.src = MAPS[targetMapKey].url;
      await new Promise(resolve => {
        mapImg.onload = () => {
          setMapImages(prev => ({ ...prev, [targetMapKey]: mapImg }));
          resolve();
        };
        mapImg.onerror = () => resolve();
      });
    }
  };

  const completeTransition = async () => {
    if (!transitionDestination) return;

    setCurrentMap(transitionDestination.targetMap);
    setPlayerPos(transitionDestination.targetPos);
    setTargetPos(null);
    
    await savePosition(
      transitionDestination.targetPos.x, 
      transitionDestination.targetPos.y, 
      playerDirection,
      transitionDestination.targetMap
    );

    setShowTransitionAnimation(false);
    setPendingTransition(null);
    setTransitionDestination(null);
  };

  const drawAdminTrail = useCallback((ctx) => {
    if (adminTrail.length < 2) return;
    
    adminTrail.forEach((pos) => {
      const progress = (Date.now() - pos.timestamp) / 2000;
      if (progress >= 1) return;
      
      const opacity = (1 - progress) * 0.7;
      const hue = (1 - progress) * 360;
      const size = 6 + (1 - progress) * 6;
      
      const drawX = pos.x * TILE_SIZE;
      const drawY = pos.y * TILE_SIZE;
      
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [adminTrail]);

  const drawPlayerAvatar = useCallback((ctx, x, y, user, isCurrentPlayer = false) => {
    if (!user) return;
    
    const drawX = x * TILE_SIZE;
    const drawY = y * TILE_SIZE;
    
    const isAdmin = user.email === ADMIN_EMAIL;
    const baseRadius = isAdmin ? 25 : 22;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(drawX + TILE_SIZE/2, drawY + TILE_SIZE - 2, isAdmin ? 18 : 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const archColor = ARCHETYPE_COLORS[user.archetype] || ARCHETYPE_COLORS.none;
    const userIsSpeaking = webRTC.isSpeaking[user.id] || webRTC.isSpeaking['local'];
    
    if (userIsSpeaking) {
      const time = Date.now() / 200;
      const speakPulse = Math.sin(time * 5) * 0.4 + 0.6;
      
      ctx.strokeStyle = `rgba(34, 197, 94, ${speakPulse})`;
      ctx.lineWidth = 6;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, baseRadius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    if (isAdmin) {
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * 4) * 0.3 + 0.7;
      
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.lineWidth = 5;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, baseRadius + 7, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.6})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, baseRadius + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = archColor;
    ctx.beginPath();
    ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, baseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    if (isCurrentPlayer && !isAdmin) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, baseRadius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, baseRadius - 2, 0, Math.PI * 2);
    ctx.clip();
    
    if (user.avatar_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = user.avatar_url;
      
      if (img.complete) {
        const imgSize = (baseRadius - 2) * 2;
        ctx.drawImage(img, drawX + TILE_SIZE/2 - (imgSize/2), drawY + TILE_SIZE/2 - (imgSize/2), imgSize, imgSize);
      } else {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((user.display_name || user.full_name || 'U')[0].toUpperCase(), 
                     drawX + TILE_SIZE/2, drawY + TILE_SIZE/2);
      }
    } else {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((user.display_name || user.full_name || 'U')[0].toUpperCase(), 
                   drawX + TILE_SIZE/2, drawY + TILE_SIZE/2);
    }
    
    ctx.restore();
    
    const fontSize = isMobile ? 10 : 12;
    const name = user.display_name || user.full_name || 'Viajante';
    const archIcon = ARCHETYPE_ICONS[user.archetype] || ARCHETYPE_ICONS.none;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    
    const nameWidth = ctx.measureText(name).width;
    ctx.font = `${fontSize + 2}px Arial`;
    ctx.strokeText(archIcon, drawX + TILE_SIZE/2 - (nameWidth / 2) - 10, drawY - 10);
    ctx.fillText(archIcon, drawX + TILE_SIZE/2 - (nameWidth / 2) - 10, drawY - 10);
    
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.strokeText(name, drawX + TILE_SIZE/2 + 5, drawY - 10);
    ctx.fillText(name, drawX + TILE_SIZE/2 + 5, drawY - 10);
    
    if (isAdmin) {
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.strokeText('👑 ADMIN', drawX + TILE_SIZE/2, drawY - 28);
      ctx.fillText('👑 ADMIN', drawX + TILE_SIZE/2, drawY - 28);
    }
    
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = `bold ${fontSize - 2}px Arial`;
    ctx.strokeText(`Nv ${user.level || 1}`, drawX + TILE_SIZE/2, drawY + TILE_SIZE + 16);
    ctx.fillText(`Nv ${user.level || 1}`, drawX + TILE_SIZE/2, drawY + TILE_SIZE + 16);
    
    if (!isCurrentPlayer) {
      const distance = calculateDistance(playerPos.x, playerPos.y, x, y);
      if (distance <= PROXIMITY_DISTANCE) {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(drawX + TILE_SIZE - 8, drawY + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [calculateDistance, isMobile, playerPos, webRTC.isSpeaking]);

  const drawNPC = useCallback((ctx) => {
    if (currentMap !== NPC_MERCHANT.map) return;

    const drawX = NPC_MERCHANT.x * TILE_SIZE;
    const drawY = NPC_MERCHANT.y * TILE_SIZE;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(drawX + TILE_SIZE/2, drawY + TILE_SIZE - 2, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = NPC_MERCHANT.color;
    ctx.beginPath();
    ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, 22, 0, Math.PI * 2);
    ctx.fill();
    
    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(245, 158, 11, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(drawX + TILE_SIZE/2, drawY + TILE_SIZE/2, 26, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(NPC_MERCHANT.avatar, drawX + TILE_SIZE/2, drawY + TILE_SIZE/2);
    
    const fontSize = isMobile ? 10 : 12;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.strokeText(NPC_MERCHANT.name, drawX + TILE_SIZE/2, drawY - 10);
    ctx.fillText(NPC_MERCHANT.name, drawX + TILE_SIZE/2, drawY - 10);
  }, [isMobile, currentMap]);

  const drawMysticalPoints = useCallback((ctx) => {
    const pointsInMap = MYSTICAL_POINTS.filter(p => p.map === currentMap);
    
    pointsInMap.forEach(point => {
      const drawX = point.x * TILE_SIZE;
      const drawY = point.y * TILE_SIZE;
      
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * 2) * 0.2 + 0.8;
      
      ctx.shadowColor = '#A855F7';
      ctx.shadowBlur = 20;
      
      ctx.font = `${24 * pulse}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.emoji, drawX + TILE_SIZE/2, drawY + TILE_SIZE/2);
      
      ctx.shadowBlur = 0;
    });
  }, [currentMap]);

  const drawTransitionIndicators = useCallback((ctx) => {
    const map = MAPS[currentMap];
    if (!map) return;

    map.transitionZones.forEach(zone => {
      const drawX = zone.x * TILE_SIZE;
      const drawY = zone.y * TILE_SIZE;
      
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * 2) * 0.3 + 0.7;
      const bounce = Math.sin(time * 3) * 8;
      
      const arrowColor = '#A855F7';
      
      ctx.save();
      ctx.translate(drawX + TILE_SIZE/2, drawY + TILE_SIZE);
      
      ctx.fillStyle = `rgba(168, 85, 247, ${pulse})`;
      ctx.shadowColor = arrowColor;
      ctx.shadowBlur = 20;
      
      ctx.beginPath();
      ctx.moveTo(0, -40 + bounce);
      ctx.lineTo(-20, -10 + bounce);
      ctx.lineTo(-8, -10 + bounce);
      ctx.lineTo(-8, 15 + bounce);
      ctx.lineTo(8, 15 + bounce);
      ctx.lineTo(8, -10 + bounce);
      ctx.lineTo(20, -10 + bounce);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }, [currentMap]);

  // RENDERIZAÇÃO PRINCIPAL
  useEffect(() => {
    if (!allAssetsLoaded) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - (isMobile ? 140 : 120);
    
    setCanvasDimensions({ width: canvas.width, height: canvas.height });
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-(playerPos.x * TILE_SIZE + TILE_SIZE / 2), -(playerPos.y * TILE_SIZE + TILE_SIZE / 2));

      if (mapArtImage) {
        const map = MAPS[currentMap];
        ctx.drawImage(mapArtImage, 0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE);
      }
      
      if (currentUser.email === ADMIN_EMAIL) {
        drawAdminTrail(ctx);
      }
      
      drawMysticalPoints(ctx);
      drawTransitionIndicators(ctx);
      
      if (currentMap === NPC_MERCHANT.map) {
        drawNPC(ctx);
      }
      
      // RENDERIZAR TODOS OS JOGADORES NO MAPA ATUAL
      const playersInCurrentMap = otherPlayers.filter(p => 
        p && p.user && p.current_room === currentMap
      );
      
      playersInCurrentMap.forEach(player => {
        drawPlayerAvatar(ctx, player.x, player.y, player.user, false);
      });
      
      drawPlayerAvatar(ctx, playerPos.x, playerPos.y, currentUser, true);
      
      if (targetPos) {
        const targetDrawX = targetPos.x * TILE_SIZE;
        const targetDrawY = targetPos.y * TILE_SIZE;
        
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 4) * 0.3 + 0.7;
        
        ctx.strokeStyle = `rgba(168, 85, 247, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(targetDrawX + TILE_SIZE/2, targetDrawY + TILE_SIZE/2, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [allAssetsLoaded, playerPos, targetPos, otherPlayers, currentUser, mapArtImage, drawPlayerAvatar, drawNPC, drawMysticalPoints, drawAdminTrail, drawTransitionIndicators, isMobile, currentMap, zoomLevel]);

  useEffect(() => {
    if (currentUser.email === ADMIN_EMAIL && isMoving) {
      const now = Date.now();
      if (now - (lastUpdateRef.current || 0) > 50) {
        setAdminTrail(prev => {
          const newTrail = [...prev, { x: playerPos.x, y: playerPos.y, timestamp: now }];
          const filtered = newTrail.filter(p => now - p.timestamp < 2000);
          return filtered.slice(-30);
        });
      }
    }
  }, [playerPos, isMoving, currentUser.email]);

  useEffect(() => {
    if (!targetPos) {
      setIsMoving(false);
      return;
    }
    
    setIsMoving(true);
    
    const moveInterval = setInterval(() => {
      setPlayerPos(current => {
        const dx = targetPos.x - current.x;
        const dy = targetPos.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.1) {
          setTargetPos(null);
          setIsMoving(false);
          return current;
        }
        
        const moveX = (dx / distance) * (PLAYER_SPEED / 60);
        const moveY = (dy / distance) * (PLAYER_SPEED / 60);
        
        if (Math.abs(dx) > Math.abs(dy)) {
          setPlayerDirection(dx > 0 ? 'right' : 'left');
        } else {
          setPlayerDirection(dy > 0 ? 'down' : 'up');
        }
        
        const newX = current.x + moveX;
        const newY = current.y + moveY;
        
        if (isWalkable(newX, newY)) {
          const now = Date.now();
          if (now - lastStepSoundRef.current > 300) {
            if (window.playStepSound) window.playStepSound();
            lastStepSoundRef.current = now;
          }
          
          const updateNow = Date.now();
          if (updateNow - lastUpdateRef.current > UPDATE_INTERVAL) {
            savePosition(newX, newY, playerDirection);
            lastUpdateRef.current = updateNow;
          }
          
          return { x: newX, y: newY };
        }
        
        setTargetPos(null);
        setIsMoving(false);
        return current;
      });
    }, 16);
    
    return () => clearInterval(moveInterval);
  }, [targetPos, isWalkable, savePosition, playerDirection]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const scaledClickX = (clickX - canvas.width / 2) / zoomLevel + (playerPos.x * TILE_SIZE + TILE_SIZE / 2);
    const scaledClickY = (clickY - canvas.height / 2) / zoomLevel + (playerPos.y * TILE_SIZE + TILE_SIZE / 2);

    const worldX = scaledClickX / TILE_SIZE;
    const worldY = scaledClickY / TILE_SIZE;
    
    if (currentMap === NPC_MERCHANT.map) {
      const npcDx = worldX - NPC_MERCHANT.x;
      const npcDy = worldY - NPC_MERCHANT.y;
      const npcDistance = Math.sqrt(npcDx * npcDx + npcDy * npcDy);
      
      if (npcDistance < 0.8) {
        const playerDistance = calculateDistance(playerPos.x, playerPos.y, NPC_MERCHANT.x, NPC_MERCHANT.y);
        if (playerDistance <= NPC_PROXIMITY) {
          setShowNPCShop(true);
          setShowNPCBalloon(false);
          if (window.playInteractSound) window.playInteractSound();
        }
        return;
      }
    }
    
    const playersInMap = otherPlayers.filter(p => p && p.user && p.current_room === currentMap);
    let clickedPlayer = null;
    
    for (const player of playersInMap) {
      const dx = worldX - player.x;
      const dy = worldY - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 0.8) {
        clickedPlayer = player;
        break;
      }
    }
    
    if (clickedPlayer) {
      setSelectedPlayer(clickedPlayer);
      setShowInteractionModal(true);
    } else if (isWalkable(worldX, worldY)) {
      setTargetPos({ x: worldX, y: worldY });
    }
  };

  const handleViewProfile = async () => {
    if (!selectedPlayer?.user) return;
    setShowInteractionModal(false);
    setProfileData(selectedPlayer.user);
    setShowProfileModal(true);
  };

  const handleConnect = async () => {
    if (!selectedPlayer?.user) return;
    
    try {
      const existingConnections = await base44.entities.Connection.filter({
        follower_id: currentUser.id,
        following_id: selectedPlayer.user.id
      });
      
      if (existingConnections.length === 0) {
        await base44.entities.Connection.create({
          follower_id: currentUser.id,
          follower_name: currentUser.display_name || currentUser.full_name,
          follower_avatar: currentUser.avatar_url,
          following_id: selectedPlayer.user.id,
          following_name: selectedPlayer.user.display_name || selectedPlayer.user.full_name,
          following_avatar: selectedPlayer.user.avatar_url
        });
        
        await base44.entities.Notification.create({
          user_id: selectedPlayer.user.id,
          type: "follow",
          title: "Nova Conexão!",
          message: `${currentUser.display_name || currentUser.full_name} conectou-se com você`,
          from_user_id: currentUser.id,
          from_user_name: currentUser.display_name || currentUser.full_name,
          from_user_avatar: currentUser.avatar_url
        });
      }
      
      setShowInteractionModal(false);
    } catch (error) {
      console.error("Erro ao conectar:", error);
    }
  };

  const handleGameExit = () => {
    setPendingNavigationUrl(null);
    setShowExitConfirm(true);
  };

  const handleNavigation = (path) => {
    setPendingNavigationUrl(createPageUrl(path));
    setShowExitConfirm(true);
  };

  const confirmExit = async () => {
    try {
      const positions = await base44.entities.ZamiraPosition.filter({ user_id: currentUser.id });
      if (positions.length > 0) {
        await base44.entities.ZamiraPosition.update(positions[0].id, { is_online: false });
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
    
    if (pendingNavigationUrl) {
      navigate(pendingNavigationUrl);
    } else {
      if (onExit) onExit();
    }
    setShowExitConfirm(false);
    setPendingNavigationUrl(null);
  };

  if (!allAssetsLoaded) {
    return <LoadingScreen progress={loadingProgress} currentTask={loadingTask} />;
  }

  const playersInMap = otherPlayers.filter(p => p && p.user && p.current_room === currentMap);

  const navItems = [
    { icon: Home, label: "Início", path: "Hub" },
    { icon: Compass, label: "Explorar", path: "Explorar" },
    { icon: Eye, label: "Portal", path: "Portais", special: true },
    { icon: MessageCircle, label: "Chat", path: "Chat" },
    { icon: UserIcon, label: "Conta", path: "MinhaConta" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
      <SoundManager 
        isGameActive={true} 
        currentMap={currentMap}
        onStepSound={false} 
        onPortalSound={true} 
        onConnectSound={true}
        onCollectSound={true}
        onInteractSound={true}
        onSuccessSound={true}
        onNotificationSound={true}
      />

      <AnimatePresence>
        {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
        {showMobileMenu && <MobileGameMenu currentUser={currentUser} onClose={() => setShowMobileMenu(false)} onNavigate={handleNavigation} />}
        {showTutorial && <MobileTutorial onClose={() => setShowTutorial(false)} />}
        
        {showVideoOverlay && nearbyPlayers.length > 0 && (
          <VideoOverlay
            webRTC={webRTC}
            currentUser={currentUser}
            nearbyPlayers={nearbyPlayers}
            onClose={() => setShowVideoOverlay(false)}
          />
        )}
        
        {showMinimap && (
          <Minimap 
            playerPos={playerPos} 
            currentMap={currentMap} 
            mapImages={mapImages} 
            MAPS={MAPS} 
            TILE_SIZE={TILE_SIZE} 
            otherPlayers={otherPlayers} 
            nearbyPlayers={nearbyPlayers} 
            minimapExpanded={minimapExpanded} 
            setMinimapExpanded={setMinimapExpanded} 
          />
        )}
        
        {showNPCShop && (
          <WelderShop
            currentUser={currentUser}
            preloadedProducts={preloadedProducts}
            onClose={() => setShowNPCShop(false)}
          />
        )}
        
        {showInventory && (
          <InventorySystem
            currentUser={currentUser}
            onClose={() => setShowInventory(false)}
          />
        )}
        
        {profileData && showProfileModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            onClick={() => setShowProfileModal(false)}
          >
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-purple-600 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-between">
                Perfil de {profileData.display_name || profileData.full_name}
                <X className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowProfileModal(false)} />
              </h3>
              <div className="flex flex-col items-center gap-4">
                <UserAvatar user={profileData} size="lg" />
                <p className="text-gray-300 text-center">
                  Arquetipo: <span className="font-bold" style={{ color: ARCHETYPE_COLORS[profileData.archetype] }}>
                    {profileData.archetype?.replace(/_/g, ' ').toUpperCase() || 'NÃO DEFINIDO'}
                  </span>
                </p>
                <p className="text-gray-300 text-center">Nível: <span className="font-bold text-yellow-400">{profileData.level || 1}</span></p>
              </div>
              <Button onClick={() => setShowProfileModal(false)} className="mt-6 w-full bg-purple-600 hover:bg-purple-700">Fechar</Button>
            </div>
          </motion.div>
        )}
        
        {selectedPlayer && showInteractionModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            onClick={() => setShowInteractionModal(false)}
          >
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-purple-600 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-between">
                {selectedPlayer.user?.display_name || selectedPlayer.user?.full_name || 'Jogador'}
                <X className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white" onClick={() => setShowInteractionModal(false)} />
              </h3>
              <div className="flex flex-col gap-3">
                <Button onClick={handleViewProfile} className="bg-blue-600 hover:bg-blue-700">
                  <UserIcon className="w-4 h-4 mr-2" /> Ver Perfil
                </Button>
                {selectedPlayer.user?.id !== currentUser.id && (
                  <Button onClick={handleConnect} className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="w-4 h-4 mr-2" /> Conectar
                  </Button>
                )}
                <Button onClick={() => setShowInteractionModal(false)} className="bg-gray-600 hover:bg-gray-700">
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {showTransitionModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          >
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-purple-600 w-full max-w-sm mx-4 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Entrar em {pendingTransition?.label}?</h3>
              <p className="text-gray-300 mb-6">Você será transportado para {pendingTransition?.label}.</p>
              <div className="flex justify-around gap-4">
                <Button onClick={() => handleTransition(true)} className="bg-green-600 hover:bg-green-700 flex-1">
                  Confirmar
                </Button>
                <Button onClick={() => handleTransition(false)} className="bg-red-600 hover:bg-red-700 flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
        {showTransitionAnimation && <MapTransitionAnimation onComplete={completeTransition} />}
        
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          >
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-purple-600 w-full max-w-sm mx-4 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Confirmar Saída</h3>
              <p className="text-gray-300 mb-6">Você realmente deseja sair? Sua posição será salva.</p>
              <div className="flex justify-around gap-4">
                <Button onClick={confirmExit} className="bg-green-600 hover:bg-green-700 flex-1">Sair</Button>
                <Button onClick={() => setShowExitConfirm(false)} className="bg-red-600 hover:bg-red-700 flex-1">Cancelar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 p-2 md:p-3 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 hover:scale-110 transition z-50"
              style={{
                background: 'radial-gradient(circle, rgba(168,85,237,0.4) 0%, rgba(139,92,246,0.6) 50%, rgba(109,40,217,0.8) 100%)',
                boxShadow: 'inset 0 2px 12px rgba(255,255,255,0.4), 0 0 25px rgba(168,85,237,0.6)',
                border: '3px solid rgba(168,85,237,0.7)'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <img src={FAVICON_URL} alt="Menu" className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-2xl" />
              </div>
            </button>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg truncate">
                {MAPS[currentMap]?.name || 'Zamira'}
              </h2>
              {!isMobile && (
                <p className="text-gray-400 text-xs flex items-center gap-1 md:gap-2">
                  <Users className="w-3 h-3" />
                  {playersInMap.length + 1} viajantes
                  {nearbyPlayers.length > 0 && <span className="text-green-400">• {nearbyPlayers.length} próximos</span>}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setShowInventory(true)}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition text-sm md:text-base flex items-center gap-2"
            >
              <Backpack className="w-4 h-4 md:w-5 md:h-5" />
              {!isMobile && <span>Inventário</span>}
            </button>

            <div className="flex items-center gap-1 md:gap-2 bg-slate-800/50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
              <span className="text-white font-mono text-xs md:text-sm">{zamiraTime}</span>
            </div>
            
            {!isMobile && (
              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                <Compass className="w-4 h-4 text-blue-400" />
                <span className="text-white font-bold text-sm">{getCompassDirection()}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleGameExit} 
            className="px-3 md:px-4 py-1.5 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition text-sm md:text-base ml-2"
          >
            Sair
          </button>
        </div>

        {isMobile && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-3 h-3" />
              <span>{playersInMap.length + 1} online</span>
              {nearbyPlayers.length > 0 && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-green-400">{nearbyPlayers.length} próximos</span>
                </>
              )}
            </div>
            <button onClick={() => setShowTutorial(true)} className="flex items-center gap-1 text-purple-400 hover:text-purple-300">
              <HelpCircle className="w-3 h-3" />
              <span>Ajuda</span>
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className={`absolute top-[60px] md:top-[72px] left-0 right-0 ${isMobile ? 'bottom-[140px]' : 'bottom-[60px]'} cursor-pointer`}
          style={{ touchAction: 'none' }}
        />
        
        {canvasDimensions.width > 0 && (
          <div className={`absolute top-[60px] md:top-[72px] left-0 right-0 ${isMobile ? 'bottom-[140px]' : 'bottom-[60px]'} pointer-events-none`}>
            <MapAnimationOverlay
              currentMap={currentMap}
              playerPos={playerPos}
              canvasWidth={canvasDimensions.width}
              canvasHeight={canvasDimensions.height}
              tileSize={TILE_SIZE}
            />
          </div>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-purple-500/20 ${isMobile ? 'p-2' : 'p-3'} z-10`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-400 flex-shrink-0`} />
            <p className={`text-white ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
              <span className="font-bold">{isMobile ? 'Toque' : 'Clique'}</span> para mover
              {!isMobile && nearbyPlayers.length > 0 && (
                <span className="text-green-400 ml-2">• {nearbyPlayers.length} próximos</span>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={webRTC.toggleMic}
              className={`${webRTC.micEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} gap-1`}
            >
              <Mic className="w-4 h-4" />
              {!isMobile && <span className="text-xs">{webRTC.micEnabled ? 'ON' : 'OFF'}</span>}
            </Button>
            
            <Button
              size="sm"
              onClick={webRTC.toggleCamera}
              className={`${webRTC.cameraEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'} gap-1`}
            >
              <Video className="w-4 h-4" />
              {!isMobile && <span className="text-xs">{webRTC.cameraEnabled ? 'ON' : 'OFF'}</span>}
            </Button>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-purple-900/30" style={{ backgroundColor: 'rgba(2, 3, 28, 0.98)' }}>
        <div className="flex items-center justify-around h-14 md:h-16 px-2 max-w-md mx-auto relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            if (item.special) {
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center -mt-8 md:-mt-10"
                >
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 shadow-xl"
                    style={{ borderWidth: '3px', borderColor: '#02031C' }}
                  >
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </button>
                </motion.div>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition"
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-[9px] md:text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function WelcomeModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-2xl shadow-2xl border border-purple-500 m-4 max-w-lg w-full text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white">
          <X size={24} />
        </button>
        <div className="text-6xl mb-4 animate-bounce">✨</div>
        <h2 className="text-3xl font-bold text-white mb-4">Bem-vindo(a) à Zamira!</h2>
        <p className="text-purple-200 mb-6 text-lg">Explore um mundo de magia e conexões reais.</p>
        <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg">
          Começar!
        </Button>
      </motion.div>
    </motion.div>
  );
}

function MobileTutorial({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-br from-blue-900 to-teal-900 p-8 rounded-2xl border border-blue-500 m-4 max-w-lg w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">📱</div>
        <h2 className="text-3xl font-bold text-white mb-4">Guia Rápido</h2>
        <ul className="text-blue-100 text-left mb-6 space-y-3 px-4">
          <li className="flex items-start gap-3">
            <Move className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />
            <div><span className="font-semibold">Movimento:</span> Toque no mapa para mover</div>
          </li>
          <li className="flex items-start gap-3">
            <Mic className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />
            <div><span className="font-semibold">Áudio/Vídeo:</span> Automático com jogadores próximos</div>
          </li>
          <li className="flex items-start gap-3">
            <Users className="w-6 h-6 text-blue-300 flex-shrink-0 mt-1" />
            <div><span className="font-semibold">Interação:</span> Clique em outros jogadores</div>
          </li>
        </ul>
        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full">
          Entendi!
        </Button>
      </motion.div>
    </motion.div>
  );
}