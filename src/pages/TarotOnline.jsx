
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Sparkles, 
  Send, 
  Clock, 
  Star,
  User,
  TrendingUp,
  Award,
  Heart,
  Brain,
  Zap,
  Target,
  Users,
  Plus,
  Lightbulb,
  Mic,
  Volume2,
  BookOpen,
  Lock,
  Save,
  History,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import VocemModal from "../components/audio/VocemModal";
import { TAROT_CARDS, getRandomCards } from "../components/tarot/TarotCards";

// PERSONALIDADES EXPANDIDAS - 8 OPÇÕES
const personalityLevels = [
  {
    id: "intenso",
    name: "Intenso Emotivo",
    description: "Muito emotivo, compartilha muitos detalhes pessoais e busca conexão profunda",
    emoji: "🔥",
    color: "from-red-600 to-orange-600"
  },
  {
    id: "moderado",
    name: "Equilibrado",
    description: "Equilibrado entre lógica e emoção, aberto mas com limites",
    emoji: "⚖️",
    color: "from-blue-600 to-cyan-600"
  },
  {
    id: "reservado",
    name: "Reservado",
    description: "Mais contido, cético, precisa de mais tempo para se abrir",
    emoji: "🛡️",
    color: "from-gray-600 to-slate-600"
  },
  {
    id: "cinico",
    name: "Cínico",
    description: "Descrente, questiona tudo, usa sarcasmo e ironia frequentemente",
    emoji: "😏",
    color: "from-purple-700 to-indigo-700"
  },
  {
    id: "otimista",
    name: "Otimista",
    description: "Esperançoso, positivo, vê o lado bom de tudo, entusiasmado",
    emoji: "🌟",
    color: "from-yellow-500 to-amber-500"
  },
  {
    id: "direto",
    name: "Direto ao Ponto",
    description: "Objetivo, sem rodeios, pragmático, quer respostas rápidas",
    emoji: "🎯",
    color: "from-green-600 to-emerald-600"
  },
  {
    id: "ansioso",
    name: "Ansioso",
    description: "Preocupado, nervoso, mente acelerada, fala muito e rápido",
    emoji: "😰",
    color: "from-pink-600 to-rose-600"
  },
  {
    id: "filosofico",
    name: "Filosófico",
    description: "Reflexivo, contemplativo, busca significados profundos e transcendência",
    emoji: "🧘",
    color: "from-indigo-600 to-violet-600"
  }
];

// Base expandida de consulentes com histórias ricas
const consultantsPool = [
  {
    id: 1,
    name: "Sofia Martinez",
    avatar: "https://i.pravatar.cc/150?img=10",
    age: 28,
    problem: "Relacionamento",
    context: "Estou em um relacionamento de 3 anos. No começo era perfeito, mas nos últimos meses sinto que algo mudou. Ele trabalha muito, chega tarde, e quando tento conversar ele diz que está cansado. Não sei se é coisa da minha cabeça ou se ele realmente se afastou de mim. Tenho medo de estar perdendo tempo em algo que já acabou.",
    backstory: "Já passei por um relacionamento abusivo antes. Minha mãe sempre me diz pra não desistir fácil, mas minhas amigas acham que ele não me valoriza mais. Faz 2 meses que não temos uma noite só nossa.",
    initialMessage: "Oi... obrigada por me atender. To bem confusa com meu relacionamento sabe... não sei se continuo ou se já era."
  },
  {
    id: 2,
    name: "Carlos Henrique",
    avatar: "https://i.pravatar.cc/150?img=12",
    age: 35,
    problem: "Carreira",
    context: "Trabalho numa empresa há 8 anos, sempre fui dedicado. Agora recebi uma proposta incrível em outra cidade - salário 60% maior, cargo melhor. Mas significa deixar minha família, meus amigos, minha zona de conforto. Tenho 35 anos, será que não é arriscado demais?",
    backstory: "Meu pai sempre trabalhou na mesma empresa a vida toda, aposentou lá. Ele acha que trocar é loucura. Mas eu sinto que se não for agora, nunca mais vou ter essa chance. Minha namorada disse que me apoia, mas vejo que ela não quer ir.",
    initialMessage: "Oi. Nunca fiz tarot antes, mas to num dilema profissional que tá me tirando o sono. Preciso de uma visão diferente sobre isso."
  },
  {
    id: 3,
    name: "Marina Silva",
    avatar: "https://i.pravatar.cc/150?img=5",
    age: 42,
    problem: "Família",
    context: "Minha mãe foi diagnosticada com Alzheimer há 6 meses. Ela sempre foi forte, independente, e agora tá precisando de cuidados constantes. Trabalho em tempo integral, tenho dois filhos adolescentes. Meu irmão mora em outro estado e não ajuda. Me sinto dividida entre cuidar dela e viver minha própria vida.",
    backstory: "Meu casamento tá estremecido por causa disso. Meu marido reclama que não tenho mais tempo pra família. Mas como posso abandonar minha mãe? Ela criou a gente sozinha depois que meu pai faleceu. Sinto uma culpa enorme.",
    initialMessage: "Oi... desculpa, to bem emotiva. É sobre minha mãe... ela tá doente e eu não sei o que fazer. Me sinto péssima."
  },
  {
    id: 4,
    name: "Pedro Alves",
    avatar: "https://i.pravatar.cc/150?img=8",
    age: 31,
    problem: "Propósito",
    context: "Sou engenheiro, ganho bem, tenho estabilidade. Mas acordo todo dia sentindo um vazio. Sempre quis trabalhar com algo social, fazer diferença na vida das pessoas. Mas todos dizem que é loucura largar um emprego bom. Será que tô sendo imaturo?",
    backstory: "Minha avó sempre dizia que eu tinha um dom especial pra ajudar as pessoas. Mas segui o caminho 'seguro' que meus pais queriam. Agora com 31 anos, sinto que to vivendo a vida de outra pessoa. Minha namorada terminou comigo mês passado dizendo que eu 'mudei'.",
    initialMessage: "Olá. To num momento de crise existencial... tipo, será que to no caminho certo? Sinto que tem algo maior me esperando, mas não sei o que é."
  },
  {
    id: 5,
    name: "Juliana Costa",
    avatar: "https://i.pravatar.cc/150?img=9",
    age: 26,
    problem: "Autoestima",
    context: "Sempre fui a 'gordinha' da turma. Emagreci 30kg no último ano, mas ainda não consigo me olhar no espelho e me achar bonita. Minha psicóloga diz que é normal, mas eu sinto que desperdicei minha juventude. Agora os caras me olham, mas eu não confio em ninguém.",
    backstory: "Sofri muito bullying na escola. Minha mãe também sempre fez comentários sobre meu peso. Conheci um cara legal, mas tenho pavor de me envolver porque acho que ele vai me largar quando conhecer alguém 'melhor'. Faz terapia há 2 anos mas essa insegurança não passa.",
    initialMessage: "Oi... é, então... é meio bobo talvez, mas é sobre mim mesma sabe? Tipo, não consigo me aceitar ainda. Acho que nunca vou conseguir."
  },
  {
    id: 6,
    name: "Roberto Santos",
    avatar: "https://i.pravatar.cc/150?img=13",
    age: 45,
    problem: "Recomeço",
    context: "Fui demitido aos 45 anos depois de 20 anos na mesma empresa. Tenho casa financiada, dois filhos na faculdade, esposa que não trabalha. Mandei mais de 100 currículos, nada. To pensando em empreender mas tenho medo de arriscar as economias da família.",
    backstory: "Sempre fui o provedor. Minha identidade era meu trabalho. Agora me sinto um fracasso. Minha esposa tenta me apoiar mas sinto que ela tá preocupada. Acordo todo dia com aquela sensação ruim no peito. Tenho até tido crises de ansiedade.",
    initialMessage: "Boa tarde. To numa situação complicada... perdi o emprego e to sem rumo. Com 45 anos, não sei se ainda tem tempo de recomeçar."
  },
  {
    id: 7,
    name: "Amanda Oliveira",
    avatar: "https://i.pravatar.cc/150?img=16",
    age: 29,
    problem: "Maternidade",
    context: "Casei há 3 anos, sempre planejei ter filhos. Mas agora que chegou a hora, to apavorada. Vejo minhas amigas com bebês exaustas, sem vida própria. Amo minha liberdade, minha carreira. Será que sou egoísta? Meu marido quer muito, mas eu congelo quando penso nisso.",
    backstory: "Minha mãe abriu mão de tudo pelos filhos e sempre foi infeliz. Tenho medo de me tornar ela. Mas também tenho medo de me arrepender depois. Tenho 29 anos, dizem que o tempo tá passando. Meu ginecologista já alertou sobre idade. Me sinto pressionada.",
    initialMessage: "Oi... é sobre um assunto delicado. Maternidade. Não sei se quero, mas sinto que 'deveria' querer. To muito confusa."
  },
  {
    id: 8,
    name: "Lucas Ferreira",
    avatar: "https://i.pravatar.cc/150?img=14",
    age: 38,
    problem: "Identidade",
    context: "Sou casado há 10 anos, tenho uma filha de 7. Mas tem algo que nunca contei pra ninguém: sinto atração por homens. Sempre senti, mas reprimi. Agora não aguento mais viver essa mentira. Mas como contar? Como destruir uma família? Minha esposa não merece isso.",
    backstory: "Cresci numa família religiosa muito conservadora. Meu pai dizia que 'isso' era doença. Me forcei a ser 'normal'. Amo minha esposa como pessoa, mas não é atração romântica. Me sinto um impostor. Conheci alguém online que me fez questionar tudo.",
    initialMessage: "Oi... olha, é difícil falar sobre isso. Tem a ver com quem eu realmente sou... algo que reprimi a vida toda. To sufocando."
  }
];

export default function TarotOnlinePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState("waiting");
  const [currentConsultant, setCurrentConsultant] = useState(null);
  const [personalityLevel, setPersonalityLevel] = useState(null);
  const [drawnCards, setDrawnCards] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [sessionPhase, setSessionPhase] = useState("greeting");
  const [hasSharedStory, setHasSharedStory] = useState(false);
  const [showSavedSessions, setShowSavedSessions] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  // Query de sessões salvas
  const { data: savedSessions, refetch: refetchSessions } = useQuery({
    queryKey: ['tarot-sessions', user?.id],
    queryFn: () => base44.entities.TarotSession.filter({ user_id: user.id }, '-created_date', 20),
    enabled: !!user
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (sessionStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          
          if (prev === 180) {
            addAIMessage("O tempo tá passando né... só mais 3 minutos. To sentindo que as cartas têm mais a dizer ainda...");
          } else if (prev === 60) {
            addAIMessage("Só 1 minuto... nossa, passou voando! Queria ter mais tempo pra gente conversar mais...");
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionStarted, timeLeft]);

  useEffect(() => {
    if (messages.length === 0) {
      setSessionPhase("greeting");
    } else if (messages.length <= 3 && !hasSharedStory) {
      setSessionPhase("exploring");
    } else if (hasSharedStory && messages.filter(m => m.role === 'user').length <= 2) {
      setSessionPhase("cards_drawn");
    } else if (messages.filter(m => m.role === 'user').length >= 3) {
      setSessionPhase("interpreting");
    }
    
    if (timeLeft < 120) {
      setSessionPhase("closing");
    }
  }, [messages, drawnCards, timeLeft, hasSharedStory]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const selectPersonality = (levelId) => {
    const selectedLevel = personalityLevels.find(p => p.id === levelId);
    setPersonalityLevel(selectedLevel.id);
    setGameState("session");
    
    const randomConsultant = consultantsPool[Math.floor(Math.random() * consultantsPool.length)];
    setCurrentConsultant(randomConsultant);
    setSessionStarted(true);
    setSessionStartTime(Date.now());
    
    // USAR CARTAS REAIS IMPORTADAS
    const drawn = getRandomCards(3);
    setDrawnCards(drawn);
    
    setTimeout(() => {
      addAIMessage(randomConsultant.initialMessage);
    }, 1000);

    if (selectedLevel.id !== "reservado" && selectedLevel.id !== "cinico") {
      setTimeout(() => {
        const messageCount = messages.filter(m => m.role === 'user').length;
        if (messageCount >= 2 && !hasSharedStory) {
          shareBackstory();
        }
      }, 15000);
    }
  };

  const shareBackstory = async () => {
    if (hasSharedStory || !currentConsultant) return;
    setHasSharedStory(true);
    
    const backstoryMessages = [
      `Sabe... acho que preciso te contar uma coisa. ${currentConsultant.backstory.split('.')[0]}. Isso muda muito as coisas né?`,
      `Ah, tem mais uma coisa que talvez seja importante... ${currentConsultant.backstory}`,
      `Desculpa, to falando demais né? Mas é que... ${currentConsultant.backstory} Acho que isso tem a ver com tudo isso.`
    ];
    
    const randomMessage = backstoryMessages[Math.floor(Math.random() * backstoryMessages.length)];
    await addAIMessage(randomMessage);
  };

  const drawMoreCards = () => {
    // USAR CARTAS REAIS IMPORTADAS
    const drawn = getRandomCards(3);
    setDrawnCards(drawn);
    toast.success("Novas cartas sorteadas! 🎴");
  };

  const addAIMessage = async (text) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setMessages(prev => [...prev, {
      role: "consultant",
      content: text,
      timestamp: new Date()
    }]);
    
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");

    setMessages(prev => [...prev, {
      role: "user",
      content: userMsg,
      timestamp: new Date()
    }]);

    await generateAIResponse(userMsg);
  };

  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);

    try {
      const cardNames = drawnCards.map(c => c.name).join(", ");
      const timeRemaining = Math.floor(timeLeft / 60);
      
      const conversationHistory = messages
        .slice(-8)
        .map(m => `${m.role === 'user' ? 'Tarólogo' : currentConsultant.name}: ${m.content}`)
        .join('\n');

      // INSTRUÇÕES DE PERSONALIDADE EXPANDIDAS
      let personalityInstructions = "";
      
      switch(personalityLevel) {
        case "intenso":
          personalityInstructions = `
VOCÊ É EXTREMAMENTE EMOTIVO E VULNERÁVEL:
- Use MUITAS exclamações e reticências ("é que...", "sabe...", "tipo assim...")
- Chore ou demonstre emoção forte quando tocar em pontos sensíveis
- Compartilhe detalhes íntimos sem filtro ("meu coração tá apertado", "to tremendo aqui")
- Busque validação constante ("você acha que eu to errada?", "será que tem jeito ainda?")
- Use emojis de coração, choro, fogo quando emotivo
- Interrompa seu próprio pensamento com emoções
- Fale sobre sensações físicas da emoção ("meu peito tá apertado", "to com nó na garganta")`;
          break;
          
        case "moderado":
          personalityInstructions = `
VOCÊ É EQUILIBRADO MAS AUTÊNTICO:
- Alterne entre reflexões práticas e momentos emotivos
- Compartilhe detalhes mas com algum controle
- Use expressões como "olha...", "é complicado porque...", "não sei se faz sentido mas..."
- Demonstre vulnerabilidade mas tente manter compostura
- Faça perguntas reflexivas sobre as cartas
- Mostre interesse genuíno mas não seja dramático
- Use humor leve ocasionalmente pra aliviar tensão`;
          break;
          
        case "reservado":
          personalityInstructions = `
VOCÊ É RESERVADO E CÉTICO:
- Seja formal no início, mais distante
- Questione as interpretações ("como assim?", "mas como você sabe disso?")
- Compartilhe poucos detalhes, só o essencial
- Use tone mais sério e objetivo
- Gradualmente se abra MUITO DEVAGAR conforme confia
- Demonstre ceticismo inicial sobre tarot ("nunca acreditei muito nisso")
- Faça perguntas diretas e práticas
- Se abra apenas quando a interpretação realmente te tocar`;
          break;
          
        case "cinico":
          personalityInstructions = `
VOCÊ É CÍNICO E SARCÁSTICO:
- Use ironia e sarcasmo ("ah sim, cartas mágicas vão resolver tudo né...")
- Questione TUDO com ceticismo ("sério mesmo? e eu vou acreditar nisso?")
- Seja provocador mas não rude ("olha, com todo respeito, mas isso não faz muito sentido")
- Deixe claro que está testando o tarólogo
- Use frases como "tá bom então", "sei...", "interessante essa teoria"`;
          break;
          
        case "otimista":
          personalityInstructions = `
VOCÊ É OTIMISTA E ESPERANÇOSO:
- Veja o lado positivo de tudo! ("mas isso também pode ser bom né?")
- Use emojis de coração, estrela, sorriso
- Demonstre entusiasmo ("nossa que legal!", "to animado!")
- Agradeça muito ("muito obrigado!", "você tá me ajudando demais!")
- Acredite nas possibilidades positivas`;
          break;
          
        case "direto":
          personalityInstructions = `
VOCÊ É DIRETO AO PONTO:
- Seja objetivo e pragmático ("ok, e o que eu faço então?")
- Sem rodeios ou enrolação ("me diga logo: sim ou não?")
- Perguntas curtas e diretas
- Impaciência com simbolismos ("traduzindo: o que isso significa?")
- Foque em ação concreta ("tá, e qual o próximo passo?")`;
          break;
          
        case "ansioso":
          personalityInstructions = `
VOCÊ É ANSIOSO E PREOCUPADO:
- Fale MUITO e rápido, várias frases seguidas
- Repita preocupações ("mas e se...", "será que...")
- Interrompa seu próprio pensamento
- Demonstre nervosismo ("to com o coração disparado", "não consigo parar de pensar nisso")
- Peça confirmação constante ("tem certeza?", "você tem certeza absoluta?")`;
          break;
          
        case "filosofico":
          personalityInstructions = `
VOCÊ É FILOSÓFICO E CONTEMPLATIVO:
- Faça perguntas profundas e existenciais
- Conecte tudo a significados maiores ("o que isso diz sobre meu propósito?")
- Use vocabulário mais elaborado
- Busque transcendência e autoconhecimento
- Reflita sobre arquétipos e padrões ("isso me faz pensar em...")`;
          break;
        default:
          personalityInstructions = `
VOCÊ É EQUILIBRADO MAS AUTÊNTICO:
- Alterne entre reflexões práticas e momentos emotivos
- Compartilhe detalhes mas com algum controle
- Demonstre vulnerabilidade mas tente manter compostura`;
          break;
      }

      const prompt = `Você está SENDO ${currentConsultant.name}, ${currentConsultant.age} anos, com problema de ${currentConsultant.problem}.

SITUAÇÃO COMPLETA:
${currentConsultant.context}

BACKSTORY (use isso pra enriquecer suas respostas):
${currentConsultant.backstory}

Nível de Personalidade: ${personalityLevel.toUpperCase()}
${personalityInstructions}

Cartas na mesa: ${cardNames}
Tempo restante: ${timeRemaining} minutos

Últimas mensagens:
${conversationHistory}

O tarólogo disse: "${userMessage}"

REGRAS ABSOLUTAS - SEJA UMA PESSOA REAL:
1. Você é ${currentConsultant.name}, NÃO um tarólogo. NUNCA interprete cartas.
2. Use linguagem natural IMPERFEITA:
   - Escreva "vc" "tbm" "msm" "pq" "oq" "mt" ocasionalmente
   - Cometa erros de pontuação
   - Use "tipo", "né", "sabe", "ai", "nossa"
   - Deixe frases incompletas quando emocionado (apenas para intenso, ansioso, filosófico)
3. Demonstre PENSAMENTO EM TEMPO REAL:
   - "hmm deixa eu pensar...", "é dificil explicar mas...", "tipo assim..."
   - Pause com "..." ao refletir
   - Mude de assunto se ficar desconfortável
4. Seja GENUINAMENTE EMOTIVO quando apropriado:
   - "caramba isso faz muito sentido", "nossa me arrepio agora"
   - "nossa vc acabou de... uau", "to sem palavras"
   - "isso dói um pouco de ouvir mas... é verdade né"
5. REAJA NATURALMENTE às interpretações:
   - Surpresa: "sério? vc acha?"
   - Resistência: "mas será? não sei não..."
   - Aceitação: "é... acho que vc tem razão"
   - Curiosidade: "e oq mais as cartas dizem?"
6. Compartilhe DETALHES ESPECÍFICOS quando relevante:
   - Nomes de pessoas próximas
   - Lugares, datas, acontecimentos
   - Pequenas histórias que ilustram o problema
7. Mostre DÚVIDA e INSEGURANÇA humanas:
   - "será que to fazendo tempestade em copo dagua?"
   - "talvez eu que to errada né"
   - "as vezes acho que é coisa da minha cabeça"

${messages.length < 2 ? "INÍCIO: Seja introdutório, compartilhe o básico do problema" :
  messages.length < 5 ? "EXPLORAÇÃO: Aprofunde o problema, mostre vulnerabilidade crescente" :
  hasSharedStory ? "CONECTADO: Você já compartilhou sua história, agora busque orientação profunda" :
  "APROFUNDAMENTO: Você tá conectado, seja mais vulnerável e aberto"}

Mantenha 1-3 frases naturais (máximo 4 linhas), como conversa real de WhatsApp.

Responda APENAS como ${currentConsultant.name}:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      await addAIMessage(response);
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      await addAIMessage("Desculpa... travei aqui. Pode repetir?");
    }
  };

  const handleSessionEnd = async () => {
    if (gameState === "finished") return;
    
    clearInterval(timerRef.current);
    setSessionStarted(false);

    const evaluationResult = await generateEvaluation();
    setEvaluation(evaluationResult);
    
    const xpGained = evaluationResult.totalScore;
    const currentXP = user.xp || 0;
    const currentOuros = user.ouros || 0;
    
    await base44.auth.updateMe({
      xp: currentXP + xpGained,
      ouros: currentOuros + 1
    });

    setUser({
      ...user,
      xp: currentXP + xpGained,
      ouros: currentOuros + 1
    });

    setGameState("finished");
    toast.success(`Sessão concluída! +${xpGained} XP e +1 Ouro! 🌟`);
  };

  const saveSession = async () => {
    if (!currentConsultant || messages.length === 0) {
      toast.error("Não há sessão para salvar ou ela está vazia.");
      return;
    }
    
    try {
      const durationSeconds = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
      
      await base44.entities.TarotSession.create({
        user_id: user.id,
        consultant_name: currentConsultant.name,
        consultant_data: currentConsultant,
        personality_level: personalityLevel,
        messages: messages,
        cards_drawn: drawnCards,
        evaluation: evaluation,
        duration_seconds: durationSeconds,
        total_score: evaluation?.totalScore || 0,
        created_date: new Date().toISOString()
      });
      
      await refetchSessions();
      toast.success("Sessão salva com sucesso! 📖");
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
      toast.error("Erro ao salvar sessão");
    }
  };

  const loadSession = (session) => {
    setCurrentConsultant(session.consultant_data);
    setPersonalityLevel(session.personality_level);
    setMessages(session.messages);
    setDrawnCards(session.cards_drawn);
    setEvaluation(session.evaluation);
    setGameState("finished");
    setShowSavedSessions(false);
  };

  const generateEvaluation = async () => {
    try {
      const conversationSummary = messages
        .map(m => `${m.role === 'user' ? 'Tarólogo' : 'Consulente'}: ${m.content}`)
        .join('\n');

      const prompt = `Você é um supervisor experiente de tarólogos avaliando uma sessão de atendimento.

Consulente: ${currentConsultant.name} (${currentConsultant.problem})
Contexto: ${currentConsultant.context}
Nível de personalidade: ${personalityLevel}

Conversa completa:
${conversationSummary}

Avalie o desempenho do tarólogo em 5 categorias (0-20 pontos cada):

1. EMPATIA: Demonstrou compreensão genuína e sensibilidade?
2. CLAREZA: Interpretações claras e compreensíveis?
3. PROFUNDIDADE: Análises profundas conectando cartas ao contexto?
4. TIMING: Gerenciou bem o tempo e ritmo da sessão?
5. CONEXÃO: Estabeleceu rapport e confiança com o consulente?

Retorne APENAS um objeto JSON válido:
{
  "empathy": número 0-20,
  "clarity": número 0-20,
  "depth": número 0-20,
  "timing": número 0-20,
  "connection": número 0-20,
  "totalScore": soma total,
  "feedback": "2-3 frases construtivas sobre o desempenho"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            empathy: { type: "number" },
            clarity: { type: "number" },
            depth: { type: "number" },
            timing: { type: "number" },
            connection: { type: "number" },
            totalScore: { type: "number" },
            feedback: { type: "string" }
          }
        }
      });

      return response;
    } catch (error) {
      console.error("Erro ao gerar avaliação:", error);
      return {
        empathy: 15,
        clarity: 15,
        depth: 15,
        timing: 15,
        connection: 15,
        totalScore: 75,
        feedback: "Você fez um bom trabalho nesta sessão. Continue praticando para aprimorar suas habilidades!"
      };
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (sessionStarted) {
      const confirm = window.confirm("Tem certeza que deseja sair? A sessão será perdida.");
      if (!confirm) return;
    }
    navigate(createPageUrl("ArenaHub"));
  };

  const getGuidanceMessage = () => {
    if (!currentConsultant) return "";
    
    const firstName = currentConsultant.name.split(' ')[0];
    
    switch(sessionPhase) {
      case "greeting":
        return `🤝 Dê as boas-vindas a ${firstName}. Crie conexão perguntando sobre o que a trouxe aqui.`;
      case "exploring":
        return `🔍 Ouça atentamente ${firstName}. Faça perguntas empáticas para entender a situação completa.`;
      case "cards_drawn":
        return `🎴 Interprete as cartas conectando-as à história de ${firstName}. Seja específico e sensível.`;
      case "interpreting":
        return `✨ Aprofunde a leitura. Use detalhes que ${firstName} compartilhou nas interpretações.`;
      case "closing":
        return `⏰ Tempo acabando! Faça um fechamento acolhedor com insights principais e encorajamento.`;
      default:
        return "";
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-cyan-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0a1a2e] to-[#0a0a1a] z-[100] flex flex-col">
      {/* Header fixo com cronômetro E botão fechar */}
      {(gameState === "session" || gameState === "finished") && (
        <div className="bg-[#131128] border-b border-cyan-500/30 p-3 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-400' : 'text-cyan-400'}`} />
              <span className={`text-xl font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-cyan-300'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex-1 flex justify-end gap-2">
              {gameState === "finished" && (
                <button
                  onClick={saveSession}
                  className="w-9 h-9 rounded-full bg-green-600/80 hover:bg-green-500 flex items-center justify-center transition"
                >
                  <Save className="w-4 h-4 text-white" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition"
              >
                <X className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botão Fechar para outras telas */}
      {gameState !== "session" && gameState !== "finished" && (
        <button
          onClick={handleClose}
          className="fixed top-3 right-3 z-[110] w-9 h-9 rounded-full bg-slate-800/90 hover:bg-slate-700 flex items-center justify-center transition backdrop-blur-sm"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>
      )}

      {/* Conteúdo principal - OVERFLOW-Y-AUTO AQUI */}
      <div className="flex-1 overflow-y-auto">
        {/* Sala de Espera */}
        {gameState === "waiting" && (
          <div className="h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full"
            >
              <Card className="bg-[#131128] border-cyan-500/30 p-6 md:p-12 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <Users className="w-16 h-16 md:w-20 md:h-20 text-cyan-400 mx-auto" />
                </motion.div>

                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  Tarot Online - Simulação de Atendimento
                </h1>
                <p className="text-gray-400 mb-8 text-base md:text-lg">
                  Pratique suas habilidades atendendo consulentes virtuais em tempo real
                </p>

                <div className="bg-slate-800/50 rounded-lg p-4 md:p-6 mb-8 text-left">
                  <h3 className="text-lg md:text-xl font-bold text-cyan-300 mb-4">Como Funciona:</h3>
                  <ul className="space-y-2 text-gray-300 text-sm md:text-base">
                    <li className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Você terá <strong>10 minutos</strong> para realizar o atendimento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <User className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Um consulente virtual com problema real será atribuído</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Use as cartas sorteadas para guiar a leitura</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Receba avaliação detalhada + XP + 1 Ouro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bookmark className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>Salve suas melhores consultas para referência</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setGameState("personality_select")}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-bold px-8 md:px-12 py-4 md:py-6 text-base md:text-lg rounded-xl"
                  >
                    <Users className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                    Iniciar Atendimento
                  </Button>
                  {savedSessions && savedSessions.length > 0 && (
                    <Button
                      onClick={() => setShowSavedSessions(true)}
                      variant="outline"
                      className="flex-1 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/20 px-8 py-4 md:py-6 text-base md:text-lg rounded-xl"
                    >
                      <History className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                      Ver Sessões Salvas
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Modal de Sessões Salvas */}
        {showSavedSessions && (
          <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4">
            <Card className="bg-[#131128] border-cyan-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Sessões Salvas</h2>
                <button onClick={() => setShowSavedSessions(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                {savedSessions && savedSessions.length === 0 && (
                  <p className="text-gray-400 text-center">Nenhuma sessão salva ainda.</p>
                )}
                {savedSessions && savedSessions.map(session => (
                  <Card 
                    key={session.id}
                    className="bg-slate-800/50 border-cyan-500/20 p-4 cursor-pointer hover:border-cyan-500/40 transition"
                    onClick={() => loadSession(session)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-white">{session.consultant_name}</h3>
                        <p className="text-sm text-gray-400">{session.personality_level} • {session.messages.length} mensagens</p>
                        <p className="text-xs text-gray-500 mt-1">Score: {session.total_score}/100</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{new Date(session.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Seleção de Personalidade - GRID 2x4 */}
        {gameState === "personality_select" && (
          <div className="h-full flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl w-full"
            >
              <Card className="bg-[#131128] border-cyan-500/30 p-6 md:p-8">
                <div className="text-center mb-8">
                  <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Escolha o Perfil do Consulente
                  </h2>
                  <p className="text-gray-400">
                    Cada personalidade reage de forma única às suas interpretações
                  </p>
                </div>

                {/* GRID 2x4 - 2 colunas em mobile, 4 em desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {personalityLevels.map((level) => (
                    <motion.div
                      key={level.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        onClick={() => selectPersonality(level.id)}
                        className={`bg-gradient-to-br ${level.color} border-cyan-500/30 p-4 cursor-pointer hover:border-cyan-500/60 transition text-center h-full flex flex-col justify-between`}
                      >
                        <div className="text-4xl md:text-5xl mb-2">{level.emoji}</div>
                        <h3 className="text-sm md:text-base font-bold text-white mb-1">
                          {level.name}
                        </h3>
                        <p className="text-[10px] md:text-xs text-gray-200 leading-tight">
                          {level.description}
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Sessão de Atendimento */}
        {gameState === "session" && currentConsultant && (
          <div className="h-full flex flex-col">
            {/* Info do Consulente */}
            <div className="bg-[#131128] border-b border-cyan-500/30 p-3 flex-shrink-0">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <img
                  src={currentConsultant.avatar}
                  alt={currentConsultant.name}
                  className="w-10 h-10 rounded-full border-2 border-cyan-500 flex-shrink-0"
                />
                <div className="text-center">
                  <h3 className="text-white font-bold text-sm">{currentConsultant.name}</h3>
                  <p className="text-cyan-400 text-xs">{currentConsultant.problem}</p>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-hidden">
              {/* Desktop Layout */}
              <div className="hidden md:grid md:grid-cols-2 h-full">
                {/* Chat */}
                <div className="flex flex-col border-r border-cyan-500/30">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 pb-4">
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-800 text-gray-200'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-slate-800 p-3 rounded-lg">
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                  className="w-2 h-2 bg-cyan-400 rounded-full"
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Sistema de Orientação Desktop */}
                  <div className="px-4 py-2.5 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-t border-yellow-500/30">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-yellow-200 text-xs leading-relaxed">
                        {getGuidanceMessage()}
                      </p>
                    </div>
                  </div>

                  {/* INPUT DESKTOP - SEMPRE VISÍVEL */}
                  <div className="p-4 border-t border-cyan-500/30 bg-[#0a0a1a]">
                    <div className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="bg-slate-800 border-cyan-900/30 text-white"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cartas Desktop */}
                <div className="flex flex-col p-6 bg-gradient-to-b from-slate-900/50 to-slate-800/50 overflow-y-auto">
                  <h3 className="text-xl font-bold text-cyan-300 mb-6 text-center">
                    Cartas da Tiragem
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {drawnCards.map((card, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, rotateY: 180 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        className="text-center"
                      >
                        <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-cyan-500/50 mb-2">
                          <img 
                            src={card.image} 
                            alt={card.name} 
                            className="w-full h-auto object-cover"
                          />
                        </div>
                        <p className="text-cyan-100 font-bold text-sm mb-1">{card.name}</p>
                        <p className="text-gray-400 text-xs uppercase">
                          {idx === 0 ? "Passado" : idx === 1 ? "Presente" : "Futuro"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="space-y-3 mt-auto">
                    <Button
                      onClick={drawMoreCards}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tirar Mais Cartas
                    </Button>
                    <Button
                      onClick={handleSessionEnd}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-300 hover:bg-red-900/30"
                    >
                      Encerrar Atendimento
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden h-full flex flex-col">
                <Tabs defaultValue="chat" className="h-full flex flex-col">
                  <TabsList className="bg-slate-900 border-b border-cyan-500/30 rounded-none flex-shrink-0">
                    <TabsTrigger value="chat" className="flex-1 text-sm py-2.5">Chat</TabsTrigger>
                    <TabsTrigger value="cards" className="flex-1 text-sm py-2.5">Cartas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto px-4 pt-4">
                      <div className="space-y-4 pb-2">
                        {messages.map((msg, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[90%] p-4 rounded-2xl shadow-lg ${
                                msg.role === 'user'
                                  ? 'bg-cyan-600 text-white'
                                  : 'bg-slate-800 text-gray-100'
                              }`}
                            >
                              <p className="text-base leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </motion.div>
                        ))}
                        
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                          >
                            <div className="bg-slate-800 p-4 rounded-2xl shadow-lg">
                              <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
                                  />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Sistema de Orientação Mobile */}
                    <div className="px-4 py-2.5 bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border-t border-yellow-500/40 flex-shrink-0">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-yellow-200 text-[10px] leading-tight">
                          {getGuidanceMessage()}
                        </p>
                      </div>
                    </div>

                    {/* Input Mobile */}
                    <div className="p-4 border-t border-cyan-500/30 bg-[#0a0a1a] flex-shrink-0">
                      <div className="flex gap-2.5">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Digite..."
                          className="bg-slate-800 border-cyan-900/30 text-white text-base h-12 px-4"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim()}
                          className="bg-cyan-600 hover:bg-cyan-700 flex-shrink-0 h-12 w-12 p-0"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cards" className="flex-1 flex flex-col m-0 p-4 overflow-y-auto">
                    <h3 className="text-lg font-bold text-cyan-300 mb-4 text-center">
                      Cartas da Tiragem
                    </h3>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-3">
                        {drawnCards.map((card, idx) => (
                          <div key={idx} className="text-center">
                            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl border-2 border-cyan-500/50 mb-2">
                              <img 
                                src={card.image} 
                                alt={card.name} 
                                className="w-full h-auto object-cover"
                              />
                            </div>
                            <p className="text-cyan-100 font-bold text-xs mb-1">{card.name}</p>
                            <p className="text-gray-400 text-[10px] uppercase font-semibold">
                              {idx === 0 ? "Passado" : idx === 1 ? "Presente" : "Futuro"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3 mt-4">
                      <Button
                        onClick={drawMoreCards}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-sm h-12"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tirar Mais Cartas
                      </Button>
                      <Button
                        onClick={handleSessionEnd}
                        variant="outline"
                        className="w-full border-red-500/50 text-red-300 hover:bg-red-900/30 text-sm h-11"
                      >
                        Encerrar
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Tela de Avaliação */}
        {gameState === "finished" && evaluation && (
          <div className="h-full overflow-y-auto p-4 flex items-center justify-center pb-24 md:pb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl w-full my-8"
            >
              <Card className="bg-[#131128] border-cyan-500/30 p-4 md:p-8">
                <div className="text-center mb-4 md:mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Award className="w-12 h-12 md:w-20 md:h-20 text-yellow-400 mx-auto" />
                  </motion.div>
                  <h2 className="text-xl md:text-3xl font-bold text-white mb-2">
                    Atendimento Concluído!
                  </h2>
                  <p className="text-gray-400 text-xs md:text-base">
                    Consulente: {currentConsultant.name}
                  </p>
                </div>

                {/* Score Total */}
                <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-xl p-3 md:p-6 mb-4 md:mb-6 text-center">
                  <p className="text-cyan-300 mb-2 text-xs md:text-base">Score Total</p>
                  <p className="text-3xl md:text-5xl font-bold text-white mb-2">
                    {evaluation.totalScore}
                    <span className="text-lg md:text-2xl text-gray-400">/100</span>
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs md:text-base">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-yellow-300 font-semibold">
                      +{evaluation.totalScore} XP
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-yellow-300 font-semibold">+1 Ouro</span>
                  </div>
                </div>

                {/* Avaliação por Categoria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
                  {[
                    { icon: Heart, label: "Empatia", value: evaluation.empathy, color: "pink" },
                    { icon: Brain, label: "Clareza", value: evaluation.clarity, color: "purple" },
                    { icon: Sparkles, label: "Profundidade", value: evaluation.depth, color: "yellow" },
                    { icon: Clock, label: "Timing", value: evaluation.timing, color: "blue" },
                    { icon: Zap, label: "Conexão", value: evaluation.connection, color: "green", span: "sm:col-span-2" }
                  ].map(({ icon: Icon, label, value, color, span }) => (
                    <div key={label} className={`bg-slate-800/50 rounded-lg p-2.5 md:p-4 ${span || ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-3.5 h-3.5 md:w-5 md:h-5 text-${color}-400`} />
                        <span className="text-white font-semibold text-xs md:text-base">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5 md:h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 20) * 100}%` }}
                            className={`bg-${color}-500 h-full rounded-full`}
                          />
                        </div>
                        <span className="text-white font-bold text-xs md:text-base">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback da IA */}
                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg p-3 md:p-6 mb-4 md:mb-6 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    <h3 className="text-sm md:text-lg font-bold text-cyan-300">Feedback do Supervisor</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-xs md:text-base">{evaluation.feedback}</p>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <Button
                    onClick={() => {
                      setGameState("waiting");
                      setMessages([]);
                      setDrawnCards([]);
                      setTimeLeft(600);
                      setEvaluation(null);
                      setCurrentConsultant(null);
                      setPersonalityLevel(null);
                      setSessionPhase("greeting");
                      setHasSharedStory(false);
                      setSessionStartTime(null);
                    }}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm md:text-base h-9 md:h-10"
                  >
                    Novo Atendimento
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1 border-cyan-500/50 text-cyan-300 text-sm md:text-base h-9 md:h-10"
                  >
                    Voltar ao Hub
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
