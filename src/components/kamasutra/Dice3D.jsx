import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export default function Dice3D({ isRolling, size = 100 }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const diceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      1,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Criar Dado
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    const materials = [
      createFaceMaterial("#9333EA", "♥"), // 1
      createFaceMaterial("#EC4899", "✦"), // 2
      createFaceMaterial("#8B5CF6", "⚡"), // 3
      createFaceMaterial("#A855F7", "★"), // 4
      createFaceMaterial("#C026D3", "♦"), // 5
      createFaceMaterial("#DB2777", "🔮") // 6
    ];

    const dice = new THREE.Mesh(geometry, materials);
    scene.add(dice);
    diceRef.current = dice;

    // Iluminação
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Animação
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (isRolling && dice) {
        dice.rotation.x += 0.15;
        dice.rotation.y += 0.15;
      } else if (dice) {
        dice.rotation.x += 0.005;
        dice.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      geometry.dispose();
      materials.forEach(m => m.dispose());
      renderer.dispose();
    };
  }, [isRolling, size]);

  function createFaceMaterial(color, symbol) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);

    // Borda
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 236);

    // Símbolo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: texture });
  }

  return <div ref={containerRef} style={{ width: size, height: size }} />;
}