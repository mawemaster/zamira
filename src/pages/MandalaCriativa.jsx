import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, Download, Share2, Sparkles, RotateCcw, Eye,
  Loader2, Pencil, Eraser, Undo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PATTERNS = [
  { id: 'floral', name: 'Floral', icon: '🌸' },
  { id: 'geometric', name: 'Geométrica', icon: '⬢' },
  { id: 'cosmic', name: 'Cósmica', icon: '✨' },
  { id: 'nature', name: 'Natureza', icon: '🍃' },
  { id: 'sacred', name: 'Sagrada', icon: '🕉️' },
  { id: 'tribal', name: 'Tribal', icon: '🪶' }
];

const COLOR_PALETTES = [
  { id: 'chakras', name: 'Chakras', colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'] },
  { id: 'sunset', name: 'Pôr do Sol', colors: ['#FF6B6B', '#FFD93D', '#FF9A56', '#F56C84', '#C44569'] },
  { id: 'ocean', name: 'Oceano', colors: ['#0077BE', '#00A8E8', '#00D9FF', '#7DFFFF', '#B4FFE4'] },
  { id: 'forest', name: 'Floresta', colors: ['#2D5016', '#5C8001', '#7CB518', '#C9DF56', '#D6E68C'] },
  { id: 'galaxy', name: 'Galáxia', colors: ['#1A1A2E', '#16213E', '#0F3460', '#533483', '#E94560'] },
  { id: 'pastel', name: 'Pastel', colors: ['#FFD6E8', '#C4E1FF', '#D5AAFF', '#FFEECC', '#B8E6B8'] }
];

const SYMBOLS = ['✨', '🌙', '☀️', '⭐', '💫', '🔮', '🪬', '☯️', '🕉️', '∞'];
const COMPLEXITIES = ['simples', 'medio', 'complexo', 'muito-complexo'];

const BRUSH_SIZES = [2, 5, 10, 15, 20];

export default function MandalaCriativaPage() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('gerar'); // 'gerar' ou 'desenhar'
  const [config, setConfig] = useState({
    pattern: 'floral',
    colors: COLOR_PALETTES[0].colors,
    symmetry: 8,
    complexity: 'medio',
    centerSymbol: '✨',
    outerRing: 'petals',
    backgroundEffect: 'gradient'
  });
  const [title, setTitle] = useState('');
  const [intention, setIntention] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  
  // Estados para desenho manual
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLOR_PALETTES[0].colors[0]);
  const [brushSize, setBrushSize] = useState(10);
  const [tool, setTool] = useState('brush'); // 'brush' ou 'eraser'
  
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUser();
  }, []);

  React.useEffect(() => {
    if (mode === 'desenhar') {
      initDrawingCanvas();
    }
  }, [mode]);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const initDrawingCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    let x, y;
    if (e.type.includes('touch')) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Ajustar para escala do canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    x *= scaleX;
    y *= scaleY;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const generateMandala = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (config.backgroundEffect === 'gradient') {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
        gradient.addColorStop(0, config.colors[0] + '40');
        gradient.addColorStop(1, config.colors[config.colors.length - 1] + '20');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      const layers = config.complexity === 'simples' ? 3 : config.complexity === 'medio' ? 5 : config.complexity === 'complexo' ? 7 : 10;
      
      for (let layer = layers; layer > 0; layer--) {
        const radius = (layer / layers) * 250;
        const colorIndex = (layer - 1) % config.colors.length;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        for (let i = 0; i < config.symmetry; i++) {
          const angle = (Math.PI * 2 * i) / config.symmetry;
          ctx.rotate(angle);
          
          ctx.beginPath();
          ctx.fillStyle = config.colors[colorIndex] + 'AA';
          ctx.strokeStyle = config.colors[colorIndex];
          ctx.lineWidth = 2;
          
          if (config.pattern === 'floral') {
            ctx.ellipse(radius, 0, radius * 0.3, radius * 0.15, 0, 0, Math.PI * 2);
          } else if (config.pattern === 'geometric') {
            ctx.rect(radius - 20, -10, 40, 20);
          } else {
            ctx.arc(radius, 0, radius * 0.2, 0, Math.PI * 2);
          }
          
          ctx.fill();
          ctx.stroke();
          ctx.rotate(-angle);
        }
        
        ctx.restore();
      }
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fillStyle = config.colors[0];
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(config.centerSymbol, centerX, centerY);
      
      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImage(imageUrl);
    }
    
    setIsGenerating(false);
  };

  const saveMandala = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !title) {
      alert('Por favor, dê um título à sua mandala');
      return;
    }

    const imageUrl = canvas.toDataURL('image/png');

    try {
      await base44.entities.MandalaCreation.create({
        creator_id: user.id,
        creator_name: user.display_name || user.full_name,
        title,
        intention,
        mandala_config: config,
        image_url: imageUrl,
        is_shared: false
      });

      alert('✅ Mandala salva!');
      setTitle('');
      setIntention('');
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const shareToFeed = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !title) {
      alert('Gere e dê um título primeiro');
      return;
    }

    const imageUrl = canvas.toDataURL('image/png');

    try {
      await base44.entities.MandalaCreation.create({
        creator_id: user.id,
        creator_name: user.display_name || user.full_name,
        title,
        intention,
        mandala_config: config,
        image_url: imageUrl,
        is_shared: true
      });

      await base44.entities.Post.create({
        author_id: user.id,
        author_name: user.display_name || user.full_name,
        author_avatar: user.avatar_url,
        author_level: user.level,
        author_archetype: user.archetype,
        post_type: 'reflexao',
        content: `🎨 ${title}\n\n${intention || 'Uma mandala criada com intenção e amor ✨'}`,
        images: [imageUrl],
        visibility: 'public'
      });

      alert('✅ Mandala compartilhada no feed!');
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02031C] via-slate-900 to-[#02031C] text-white p-3 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Palette className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Mandala Criativa
          </h1>
          <p className="text-slate-300 text-sm md:text-base">Ateliê da Alma - meditação ativa colorindo</p>
        </div>

        {/* Abas */}
        <Tabs value={mode} onValueChange={setMode} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="gerar">
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar IA
            </TabsTrigger>
            <TabsTrigger value="desenhar">
              <Pencil className="w-4 h-4 mr-2" />
              Desenhar
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Controles */}
          <div className="space-y-4">
            {mode === 'gerar' ? (
              <>
                <Card className="bg-slate-800/50 border-purple-500/30 p-4">
                  <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Padrão da Mandala
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {PATTERNS.map(pattern => (
                      <button
                        key={pattern.id}
                        onClick={() => setConfig({...config, pattern: pattern.id})}
                        className={`p-3 rounded-xl border-2 transition ${
                          config.pattern === pattern.id
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-slate-600 bg-slate-700/30 hover:border-purple-400 text-slate-200'
                        }`}
                      >
                        <div className="text-2xl mb-1">{pattern.icon}</div>
                        <div className="text-xs font-semibold">{pattern.name}</div>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="bg-slate-800/50 border-pink-500/30 p-4">
                  <h3 className="text-lg font-bold text-pink-300 mb-3">🎨 Paleta de Cores</h3>
                  <div className="space-y-2">
                    {COLOR_PALETTES.map(palette => (
                      <button
                        key={palette.id}
                        onClick={() => setConfig({...config, colors: palette.colors})}
                        className={`w-full p-2 rounded-lg border-2 transition flex items-center gap-2 ${
                          JSON.stringify(config.colors) === JSON.stringify(palette.colors)
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-slate-600 hover:border-pink-400'
                        }`}
                      >
                        <div className="flex gap-1">
                          {palette.colors.map((color, idx) => (
                            <div key={idx} className="w-6 h-6 rounded-full" style={{backgroundColor: color}} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold flex-1 text-left">{palette.name}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="bg-slate-800/50 border-blue-500/30 p-4">
                  <h3 className="text-lg font-bold text-blue-300 mb-3">⚙️ Configurações</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Simetria: {config.symmetry}</label>
                      <input
                        type="range"
                        min="4"
                        max="16"
                        value={config.symmetry}
                        onChange={(e) => setConfig({...config, symmetry: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Complexidade</label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMPLEXITIES.map(comp => (
                          <button
                            key={comp}
                            onClick={() => setConfig({...config, complexity: comp})}
                            className={`p-2 rounded-lg border-2 text-sm transition ${
                              config.complexity === comp
                                ? 'border-blue-500 bg-blue-500/20 text-white'
                                : 'border-slate-600 hover:border-blue-400 text-slate-200'
                            }`}
                          >
                            {comp.charAt(0).toUpperCase() + comp.slice(1).replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-slate-300 mb-2 block">Símbolo Central</label>
                      <div className="flex gap-2 flex-wrap">
                        {SYMBOLS.map(symbol => (
                          <button
                            key={symbol}
                            onClick={() => setConfig({...config, centerSymbol: symbol})}
                            className={`w-10 h-10 rounded-full border-2 text-xl transition ${
                              config.centerSymbol === symbol
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-slate-600 hover:border-blue-400'
                            }`}
                          >
                            {symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <>
                <Card className="bg-slate-800/50 border-pink-500/30 p-4">
                  <h3 className="text-lg font-bold text-pink-300 mb-3">🎨 Paleta de Cores</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {COLOR_PALETTES.flatMap(p => p.colors).filter((v, i, a) => a.indexOf(v) === i).map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentColor(color)}
                        className={`w-full aspect-square rounded-full border-2 transition ${
                          currentColor === color ? 'border-white scale-110' : 'border-slate-600'
                        }`}
                        style={{backgroundColor: color}}
                      />
                    ))}
                  </div>
                </Card>

                <Card className="bg-slate-800/50 border-purple-500/30 p-4">
                  <h3 className="text-lg font-bold text-purple-300 mb-3">🖌️ Ferramentas</h3>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => setTool('brush')}
                      className={`p-3 rounded-lg border-2 transition ${
                        tool === 'brush' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-slate-600 text-slate-200'
                      }`}
                    >
                      <Pencil className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs">Pincel</p>
                    </button>
                    <button
                      onClick={() => setTool('eraser')}
                      className={`p-3 rounded-lg border-2 transition ${
                        tool === 'eraser' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-slate-600 text-slate-200'
                      }`}
                    >
                      <Eraser className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs">Borracha</p>
                    </button>
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Tamanho: {brushSize}px</label>
                    <div className="flex gap-2">
                      {BRUSH_SIZES.map(size => (
                        <button
                          key={size}
                          onClick={() => setBrushSize(size)}
                          className={`flex-1 py-2 rounded-lg border-2 text-xs transition ${
                            brushSize === size ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-slate-600 text-slate-200'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={clearCanvas}
                    variant="outline"
                    className="w-full mt-4 border-red-500 text-red-400 hover:bg-red-500/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpar Tudo
                  </Button>
                </Card>
              </>
            )}

            <Card className="bg-slate-800/50 border-yellow-500/30 p-4">
              <h3 className="text-lg font-bold text-yellow-300 mb-3">📝 Detalhes</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Título da sua mandala..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Textarea
                  placeholder="Intenção ou propósito desta mandala..."
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  rows={3}
                />
              </div>
            </Card>

            {mode === 'gerar' && (
              <Button
                onClick={generateMandala}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-lg py-6"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando sua mandala...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Mandala
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Canvas */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-purple-500/30 p-4 md:p-6">
              <h3 className="text-lg font-bold text-purple-300 mb-4 text-center">
                {mode === 'gerar' ? '✨ Sua Mandala' : '🎨 Desenhe Livremente'}
              </h3>
              
              <div className="relative">
                <div className="aspect-square bg-slate-900/50 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={mode === 'desenhar' ? startDrawing : undefined}
                    onMouseMove={mode === 'desenhar' ? draw : undefined}
                    onMouseUp={mode === 'desenhar' ? stopDrawing : undefined}
                    onMouseLeave={mode === 'desenhar' ? stopDrawing : undefined}
                    onTouchStart={mode === 'desenhar' ? startDrawing : undefined}
                    onTouchMove={mode === 'desenhar' ? draw : undefined}
                    onTouchEnd={mode === 'desenhar' ? stopDrawing : undefined}
                  />
                  {!generatedImage && !isGenerating && mode === 'gerar' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                      <Eye className="w-12 h-12 mb-2 opacity-30" />
                      <p className="text-sm">Configure e gere sua mandala</p>
                    </div>
                  )}
                </div>

                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                    <p className="mt-4 text-purple-300 font-semibold">Criando sua mandala...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button
                  onClick={saveMandala}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/20"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
                <Button
                  onClick={shareToFeed}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Feed
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedImage(null);
                    if (mode === 'desenhar') clearCanvas();
                  }}
                  variant="outline"
                  className="border-slate-500 text-slate-400 hover:bg-slate-500/20"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Nova
                </Button>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
              <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Dica Mística
              </h4>
              <p className="text-sm text-slate-300">
                {mode === 'gerar' 
                  ? 'As mandalas são ferramentas poderosas de meditação e autoconhecimento. Ao criar a sua, concentre-se na sua intenção e permita que as cores e formas fluam naturalmente através de você. ✨'
                  : 'Desenhe livremente com o coração. Não se preocupe com perfeição - a beleza está na expressão autêntica da sua alma. Deixe as cores guiarem seus movimentos. 🎨'
                }
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}