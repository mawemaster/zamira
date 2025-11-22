
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, ChevronDown, ChevronUp, CheckCircle, Star, Award, Lightbulb,
  TrendingUp, Palette, DollarSign, MessageSquare, Feather, BookText, Users, Gift, 
  ExternalLink, PlayCircle, CheckSquare, Sparkles, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Assuming `base44` is provided globally or via context for authentication
// For a standalone example, `base44` would need to be mocked or imported
const base44 = {
  auth: {
    me: async () => {
      // Mock user data for demonstration
      return { id: "123", name: "Usuária Tarot" }; 
    }
  }
};

const actionPlanSections = [
  {
    id: 1,
    title: "01. Definição de Nicho",
    icon: <Target className="w-6 h-6" />,
    color: "from-blue-600 to-cyan-600",
    bgColor: "bg-gradient-to-br from-blue-900/30 to-cyan-900/30",
    borderColor: "border-blue-500/30",
    cards: [
      {
        title: "Parte 1: Introdução ao Conceito de Nicho",
        content: `Olá, pessoal! Sejam bem-vindos ao nosso canal. Eu sou Emelyn e, sua guia no mundo do Tarot. Hoje vamos falar sobre um tema crucial para todas as tarológas: a importância de definir um nicho. Vamos entender por que isso é fundamental e como escolher o nicho certo pode transformar a sua prática. Vamos lá?

O que é um Nicho?
Um nicho é um segmento específico do mercado ao qual você direciona seus serviços. Em vez de tentar alcançar todo mundo, você foca em um grupo particular de pessoas que compartilham interesses, necessidades ou características semelhantes.

Por Que Definir um Nicho?
1. Facilita a Comunicação: Quando você conhece bem seu público, pode falar diretamente com eles, usando a linguagem e os temas que ressoam.
2. Aumenta a Relevância: Ao focar em um nicho, você se torna uma especialista naquele assunto, aumentando sua credibilidade e atraindo mais clientes.
3. Melhora a Conversão: Mensagens direcionadas têm maior impacto, resultando em mais consultas e vendas.

Exemplos de Nichos no Tarot:
- Tarot para Relacionamentos: Focado em questões amorosas e de relacionamento.
- Tarot para Carreira: Ajudando profissionais a tomar decisões de carreira.
- Tarot para Autoconhecimento: Para pessoas em busca de crescimento pessoal e espiritual.`,
        hasVideo: true,
        videoTitle: "Parte 1: Introdução ao Conceito de Nicho.mp4"
      },
      {
        title: "Vamos ver alguns exemplos práticos?",
        content: `Exemplos Práticos de Nichos:

1. Tarot para Empreendedoras:
   - Público-alvo: Mulheres que têm ou querem iniciar um negócio.
   - Conteúdo: Tiragens sobre decisões de negócio, direcionamento profissional, energia para projetos.

2. Tarot para Mães:
   - Público-alvo: Mães que buscam equilíbrio entre maternidade e vida pessoal.
   - Conteúdo: Orientações sobre criação dos filhos, autocompaixão, energia familiar.

3. Tarot para Jovens Adultos:
   - Público-alvo: Pessoas de 18 a 25 anos em transição para a vida adulta.
   - Conteúdo: Questões de identidade, primeiros empregos, relacionamentos iniciais.

Cada um desses nichos permite que você crie conteúdo específico, atraindo exatamente as pessoas que mais se beneficiarão dos seus serviços.`,
        isStarted: true
      },
      {
        title: "Como escolho o meu nicho?",
        content: `Como Escolher Seu Nicho:

1. Autoconhecimento:
   - O que você ama fazer? Quais temas te apaixonam?
   - Em que áreas da vida você tem experiência ou conhecimento profundo?
   - Quais tipos de consultas você mais gosta de fazer?

2. Pesquisa de Mercado:
   - Quem são as pessoas que mais procuram seus serviços?
   - Quais são as dores e necessidades do seu público potencial?
   - Existe demanda para o nicho que você está considerando?

3. Teste e Ajuste:
   - Comece criando conteúdo para o nicho escolhido.
   - Observe o engajamento e feedback.
   - Esteja aberta para ajustar conforme necessário.

Dicas Importantes:
- Não tenha medo de ser específico(a). Quanto mais claro for seu nicho, mais fácil será se destacar.
- Seu nicho pode evoluir com o tempo. Permita-se crescer e adaptar.
- Mantenha sua autenticidade. Escolha um nicho que realmente ressoe com você.`
      },
      {
        title: "TAREFA: Defina Seu Nicho",
        content: `📝 EXERCÍCIO PRÁTICO: Definindo Seu Nicho

Agora é hora de colocar a mão na massa! Complete as seguintes reflexões:

1. Liste 3 temas que você AMA no Tarot:
   - Tema 1: _________________
   - Tema 2: _________________
   - Tema 3: _________________

2. Quem você quer ajudar? Descreva seu cliente ideal:
   - Idade: _________________
   - Situação de vida: _________________
   - Principais desafios: _________________
   - O que essa pessoa busca: _________________

3. Combine suas paixões com as necessidades do seu público:
   - Meu nicho será: _________________
   - Vou ajudar [público] com [problema/desejo]: _________________

4. Crie uma frase que resuma seu posicionamento:
   "Eu ajudo [público-alvo] a [resultado desejado] através do Tarot"

Exemplo: "Eu ajudo mulheres empreendedoras a tomarem decisões de negócio com confiança através do Tarot"

💡 Dica: Não precisa ser perfeito! Você pode ajustar conforme ganha experiência.`,
        isTask: true
      },
      {
        title: "BÔNUS: 10 Nichos Específicos para Taróloga(o)s",
        content: `🎁 10 Nichos Rentáveis para Tarológas:

1. 💼 Tarot para Empreendedoras Digitais
   Ajuda com decisões de negócio, lançamentos, energia de marca

2. 💑 Tarot para Relacionamentos Conscientes
   Foco em autoamor, relacionamentos saudáveis, Twin Flames

3. 🎓 Tarot para Estudantes e Vestibulandos
   Orientação de carreira, escolha de curso, motivação nos estudos

4. 🤰 Tarot para Maternidade
   Gestação, criação consciente, equilíbrio mãe-mulher

5. 🌙 Tarot e Astrologia Juntos
   Leituras que combinam Tarot com mapa astral

6. 🧘‍♀️ Tarot para Desenvolvimento Espiritual
   Autoconhecimento profundo, despertar, missão de alma

7. 💰 Tarot Financeiro
   Prosperidade, mentalidade de abundância, decisões financeiras

8. 🎨 Tarot para Artistas e Criativos
   Desbloqueio criativo, direcionamento artístico

9. 🏳️‍🌈 Tarot LGBTQIA+
   Espaço seguro, questões de identidade e aceitação

10. 💪 Tarot Motivacional
    Empoderamento, superação, confiança

Escolha um que ressoe com você e teste por 30 dias!`,
        isBonus: true
      }
    ]
  },
  {
    id: 2,
    title: "02. Branding Pessoal",
    icon: <Star className="w-6 h-6" />,
    color: "from-purple-600 to-pink-600",
    bgColor: "bg-gradient-to-br from-purple-900/30 to-pink-900/30",
    borderColor: "border-purple-500/30",
    cards: [
      {
        title: "Construindo Sua Marca Pessoal",
        content: `✨ O Que é Branding Pessoal?

Branding pessoal é a forma como você se apresenta ao mundo. É a sua identidade profissional, que inclui sua aparência visual, sua mensagem, seus valores e a experiência que você oferece aos seus clientes.

Por Que o Branding é Importante?
1. Diferenciação: Em um mercado cheio de tarológas, seu branding te destaca.
2. Confiança: Uma marca bem construída transmite profissionalismo e credibilidade.
3. Conexão: Pessoas se conectam com marcas autênticas que compartilham seus valores.
4. Memorabilidade: Um branding forte faz com que você seja lembrada.

Elementos do Branding Pessoal:

📸 Identidade Visual
- Cores que representam sua energia
- Fontes que comunicam sua personalidade
- Logo ou símbolo que te identifica
- Estética consistente nas redes sociais

💬 Voz e Tom
- Como você se comunica com seu público?
- Formal, descontraído, místico, moderno?
- Que linguagem você usa?

🎯 Posicionamento
- Qual é sua mensagem principal?
- O que te torna única?
- Que transformação você promete?

❤️ Valores
- No que você acredita?
- O que é importante para você?
- Que princípios guiam seu trabalho?`
      },
      {
        title: "Identidade Visual",
        content: `🎨 Criando Sua Identidade Visual

Paleta de Cores:
Escolha 3-5 cores que representem sua energia e nicho.

Exemplos:
- Tarot Místico: Roxo escuro, dourado, preto
- Tarot Moderno: Rosa millennial, branco, cinza
- Tarot Natural: Verde, marrom, bege
- Tarot Lunar: Azul escuro, prata, branco

Como Escolher Suas Cores:
1. Pense na emoção que quer transmitir
2. Observe tarológas que você admira
3. Teste combinações no Canva ou Adobe Color
4. Escolha cores que você realmente gosta

Tipografia (Fontes):
- Escolha 2 fontes: uma para títulos, outra para textos
- Mantenha legibilidade
- Evite fontes muito rebuscadas em excesso

Exemplos de Combinações:
- Clássico: Playfair Display + Montserrat
- Moderno: Poppins + Open Sans
- Místico: Cinzel + Lato

Elementos Visuais:
- Símbolos místicos (lua, estrelas, cristais)
- Ilustrações de cartas
- Padrões (mandalas, geometria sagrada)
- Texturas (aquarela, granulado, glitter)

🎯 Dica de Ouro: Use sempre as mesmas cores e fontes em todos os seus materiais para criar reconhecimento visual!`
      },
      {
        title: "Elementos Visuais",
        content: `📐 Elementos Visuais da Sua Marca

Logo e Símbolo:
Você não precisa de um logo profissional no início, mas ter um símbolo ou monograma ajuda muito.

Opções Simples:
- Suas iniciais estilizadas
- Um símbolo místico que te representa
- Uma ilustração de carta específica
- Um elemento da natureza

Onde Usar:
- Foto de perfil
- Marca d'água em imagens
- Assinatura de e-mails
- Material impresso

Fotografia:
A forma como você aparece nas fotos comunica muito sobre sua marca.

Dicas:
- Use sempre o mesmo filtro/edição
- Mantenha um estilo consistente
- Mostre seu espaço de atendimento
- Inclua suas ferramentas (baralho, cristais)
- Apareça nas fotos! Pessoas se conectam com pessoas

Templates:
Crie templates para seus posts recorrentes:
- Feed de Instagram
- Stories
- Reels
- Posts de blog
- E-books e PDFs

Ferramentas:
- Canva (gratuito)
- Adobe Express
- Over
- Unfold

💡 Consistência Visual = Profissionalismo e Confiança`
      },
      {
        title: "Narrativa e Mensagem",
        content: `📖 Construindo Sua Narrativa

Sua História:
As pessoas se conectam com histórias. Compartilhe a sua!

Perguntas para Refletir:
- Como você descobriu o Tarot?
- Que transformação ele trouxe para sua vida?
- Por que você decidiu ajudar outras pessoas?
- Qual é sua missão?

Estrutura da História:
1. Antes: Como era sua vida antes do Tarot?
2. Transformação: O que mudou quando você conheceu o Tarot?
3. Depois: Como você está agora e como pode ajudar outros?
4. Convite: Como as pessoas podem começar essa jornada com você?

Sua Mensagem Principal:
Defina em 1-2 frases o que você representa.

Exemplos:
"Ajudo mulheres a se reconectarem com sua intuição e tomarem decisões alinhadas com sua essência"

"Guio empreendedoras a criarem negócios prósperos conectados com seu propósito de alma"

Pilares de Conteúdo:
Defina 3-5 temas que você sempre aborda:

Exemplo:
1. Autoconhecimento
2. Intuição
3. Empoderamento feminino
4. Espiritualidade prática
5. Abundância

Tom de Voz:
- Acolhedora e empática?
- Motivadora e direta?
- Sábia e mística?
- Divertida e leve?

Escolha um tom e mantenha consistência!`
      },
      {
        title: "Autenticidade e Transparência",
        content: `💎 Seja Você Mesma

Por Que Autenticidade Importa?
Em um mundo cheio de filtros e personas fabricadas, ser genuína te diferencia e cria conexões reais.

Como Ser Autêntica Online:

1. Mostre Bastidores
   - Compartilhe seu processo de estudo
   - Mostre seu espaço de atendimento
   - Fale sobre seus desafios
   - Celebre suas conquistas

2. Seja Vulnerável (com Limites)
   - Não precisa expor tudo, mas compartilhe aprendizados
   - Fale sobre erros e como os superou
   - Mostre que você também é humana

3. Defina Seus Valores
   - O que você defende?
   - O que você NÃO faz?
   - Que tipo de atendimento você oferece?

4. Admita o Que Não Sabe
   - Ninguém sabe tudo
   - Estar em constante aprendizado é lindo
   - Seja honesta sobre suas limitações

Transparência no Trabalho:
✅ Seja clara sobre preços, tempo de atendimento, o que está incluído
❌ Evite promessas milagrosas, garantir resultados específicos

🌟 As pessoas certas vão amar você exatamente como você é!`
      }
    ]
  },
  {
    id: 3,
    title: "03. Design para Tarológas",
    icon: <Palette className="w-6 h-6" />,
    color: "from-pink-600 to-rose-600",
    bgColor: "bg-gradient-to-br from-pink-900/30 to-rose-900/30",
    borderColor: "border-pink-500/30",
    cards: [
      {
        title: "Criação de Identidade Visual",
        content: `🎨 Criando Sua Identidade Visual Profissional

Psicologia das Cores:
🟣 Roxo/Violeta - Espiritualidade, misticismo, magia
🌸 Rosa - Amor, compaixão, feminilidade
💙 Azul - Confiança, calma, intuição
💚 Verde - Cura, crescimento, prosperidade
🖤 Preto + Dourado - Luxo, elegância

Montando Sua Paleta:
1. Cor principal (60%)
2. Cor secundária (30%)
3. Cor de destaque (10%)
4. Neutros (branco, preto, cinza)

Fontes:
Títulos: Playfair Display, Cinzel, Cormorant
Textos: Montserrat, Poppins, Open Sans

Combinações Prontas:
1. Cinzel + Montserrat (Clássico)
2. Playfair Display + Lato (Elegante)
3. Cormorant + Poppins (Moderno)`
      },
      {
        title: "Ferramentas: Canva e Photoshop",
        content: `🛠️ Ferramentas Essenciais

CANVA (Gratuito)
O Que Criar:
✅ Posts para Instagram
✅ Capas de e-books
✅ Thumbnails de vídeos
✅ Banners
✅ Materiais para impressão

Recursos:
- Templates prontos
- Banco de imagens
- Elementos gráficos
- Remoção de fundo (Pro)
- Animações

Dica: Crie um "Brand Kit" com suas cores!

PHOTOSHOP (Profissional)
Quando Usar:
- Edições complexas
- Manipulação avançada
- Elementos personalizados

Alternativas Gratuitas:
- GIMP
- Photopea
- Pixlr

💡 Comece com Canva!`
      },
      {
        title: "Design de Conteúdo Atraente",
        content: `📱 Posts que Param o Scroll

Anatomia de um Post Perfeito:
1. GANCHO VISUAL - Primeira impressão
2. TÍTULO - Máximo 6 palavras
3. CORPO - Texto legível (mínimo 30pt)
4. CALL TO ACTION - "Salve", "Comente"

Tipos que Funcionam:
📊 Carrossel - Ensina passo a passo
💬 Pergunta - Gera engajamento
📖 Educativo - Ensina algo novo
✨ Inspiracional - Motivação
🎯 Oferta - Serviços

Regras:
❌ Evite: +3 fontes, textos pequenos, poluição
✅ Faça: Espaço em branco, consistência

Templates para Criar:
1. Significado de Carta
2. Dica Rápida
3. Citação
4. Divulgação`
      },
      {
        title: "Aula Gravada: Design Completo",
        content: `🎥 AULA COMPLETA DE DESIGN

Conteúdo:
1. Dominando o Canva do Zero
2. Posts para Instagram
3. Paleta de Cores Profissional
4. Tipografia para Redes
5. Elementos Gráficos
6. Banco de Imagens
7. Marca D'água
8. Organizando Designs

⏱️ Duração: 1h30min
🎁 + Templates de Bônus`,
        hasVideo: true,
        isBonus: true
      },
      {
        title: "Como Fazer Animações",
        content: `🎬 ANIMAÇÕES PROFISSIONAIS

O Que Aprenderá:
1. Animações no Canva
2. CapCut para Vídeos
3. After Effects Básico
4. Animações para Stories
5. Reels Virais

Ferramentas:
Iniciante: Canva Pro, CapCut
Intermediário: Adobe Express, InShot
Avançado: After Effects

💡 Comece simples!`,
        hasVideo: true,
        isBonus: true
      }
    ]
  },
  {
    id: 4,
    title: "04. Precificação de Métodos",
    icon: <DollarSign className="w-6 h-6" />,
    color: "from-green-600 to-emerald-600",
    bgColor: "bg-gradient-to-br from-green-900/30 to-emerald-900/30",
    borderColor: "border-green-500/30",
    cards: [
      {
        title: "Estratégias de Precificação",
        content: `💰 Como Precificar Seus Atendimentos

O Erro Mais Comum:
Cobrar muito barato por medo.

A Verdade:
Seu trabalho VALE! Precifique pelo VALOR entregue.

Método de Precificação:
1. CALCULE CUSTOS (tempo, energia, materiais)
2. PESQUISE O MERCADO
3. DEFINA POSICIONAMENTO
   - Iniciante: R$ 30-60
   - Intermediária: R$ 70-150
   - Experiente: R$ 180-350+
   - Premium: R$ 400+

Fatores que Aumentam Valor:
⭐ Experiência
⭐ Especialização
⭐ Depoimentos
⭐ Diferenciais

Fórmula:
Preço = (Custo Hora × Tempo) + Lucro + Valor Percebido

Psicologia:
✅ R$ 97 (terminar em 7)
✅ R$ 197 funciona melhor que R$ 200

Quando Aumentar:
📈 A cada 10-20 atendimentos
📈 Agenda cheia
📈 Fila de espera`
      },
      {
        title: "Criando Pacotes de Serviços",
        content: `📦 Pacotes Irresistíveis

Estrutura:

🥉 INICIAL - R$ 47-77
- 30 min, 3 cartas, objetivo

🥈 INTERMEDIÁRIO - R$ 97-197
- 60 min, completo, áudio/PDF

🥇 PREMIUM - R$ 297-597
- 90+ min, múltiplas tiragens, acompanhamento

💎 VIP - R$ 997+
- Mentoria, múltiplas sessões

Técnica do Contraste:
1 consulta: R$ 147
3 consultas: R$ 397 (R$ 132 cada)
6 consultas: R$ 697 (R$ 116 cada)

A maioria escolhe a do meio!

Bônus que Agregam:
🎁 Áudio gravado
🎁 PDF resumo
🎁 Mensagem acompanhamento
🎁 E-book

💡 Pacote deve valer 3x o preço em valor percebido!`
      },
      {
        title: "Passos para Estratégia de Precificação",
        content: `🎯 Seu Plano Estratégico

PASSO 1: Autoavaliação
- Tempo de estudo?
- Quantas consultas já fez?
- Diferenciais?
- Meta mensal?

PASSO 2: Pesquisa
Encontre 5 tarológas similares e anote preços

PASSO 3: Posicionamento
□ Iniciante → 20-30% abaixo
□ Intermediária → Média
□ Experiente → 20-50% acima
□ Premium → 2x-3x média

PASSO 4: Monte Pacotes
Básico: R$ ___
Intermediário: R$ ___
Premium: R$ ___

PASSO 5: Diferenciais
O que te torna única?

PASSO 6: Teste e Ajuste
Mês 1: R$ ___
Ajuste trimestral

PASSO 7: Comunicação de Valor
Não: "Consulta - R$ 97"
Sim: "Consulta Completa
✨ 60 min aprofundada
📱 Áudio gravado
📋 PDF resumo
R$ 97"

PASSO 8: Objeções
"Tá caro" → "Você investiria quanto em clareza?"
"Não tenho tempo" → "Quando seria melhor?"

PASSO 9: Promoções
✅ Lançamento, aniversário, datas especiais

PASSO 10: Aumente Preços
📈 A cada 3-6 meses
Avise com antecedência!`
      }
    ]
  },
  {
    id: 5,
    title: "05. Scripts de Abordagem",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "from-orange-600 to-amber-600",
    bgColor: "bg-gradient-to-br from-orange-900/30 to-amber-900/30",
    borderColor: "border-orange-500/30",
    cards: [
      {
        title: "Scripts para Diferentes Clientes",
        content: `💬 Scripts Prontos

CLIENTE INDECISO:
"Oi! Vi que você se interessou.
Pode me contar o que está buscando?
Assim te oriento melhor! 😊"

CLIENTE COM URGÊNCIA:
"Tenho vaga hoje às [horário]!
30 min focados - R$ 57
Confirma?"

PRIMEIRA VEZ:
"Bem-vinda! 🌟
Consultinha especial Primeira Jornada:
30 min de acolhimento
R$ 47 (preço especial)
Quando seria melhor?"

JÁ TE CONHECE:
"Alegria ter você de volta! 💜
Como foi desde última vez?
O que quer explorar agora?"

RESPOSTA ESPECÍFICA:
"O Tarot traz clareza!
Vamos olhar:
✨ Energias envolvidas
✨ O que você pode mudar
✨ Possíveis caminhos
Topa?"

QUER DESCONTO:
"Não trabalho com desconto, mas tenho:
1️⃣ Consulta Rápida - R$ 57
2️⃣ Parcelar no cartão
3️⃣ Lista de promoção
O que funciona?"

COMPARANDO PREÇOS:
"Cada taróloga é única!
Meus diferenciais:
✨ [Diferencial 1]
✨ [Diferencial 2]
Entrego valor em cada centavo!"

FECHAMENTO:
"Recapitulando:
📅 [Data]
⏰ [Duração]
💰 [Valor]
Confirma? 💜"`,
      },
      {
        title: "Técnicas de Fechamento",
        content: `🎯 Fechamentos que Convertem

1. DIRETO
"Vamos agendar?
- Sexta 15h
- Sábado 10h
Qual prefere?"

2. ESCOLHA
"Você prefere:
Opção 1: 30min - R$ 57
Opção 2: 60min - R$ 97?"

3. URGÊNCIA
"Só 2 vagas essa semana:
- Quinta 14h
- Sexta 16h
Depois só semana que vem!"

4. BENEFÍCIO IMEDIATO
"Confirmando hoje, recebe:
✨ E-book
✨ Meditação
✨ PDF
Bora?"

5. REDUÇÃO DE RISCO
"Se não gostar, devolvo!
99% amam.
Experimenta sem medo!"

6. RESUMO DE VALOR
"Incluído:
✅ 60 min
✅ Tiragem completa
✅ Áudio gravado
✅ PDF
R$ 97 - Vale muito!"

7. DEPOIMENTO
"Olha o que [Nome] falou:
[depoimento]
Quer a mesma clareza?"

8. ESCASSEZ
"Vagas até dia [X]!
Depois descanso.
Garante logo!"

9. CONEXÃO EMOCIONAL
"Sinto que pode te ajudar!
Se permita esse autocuidado.
Bora? 💜"

10. PARCERIA
"Vou ser sincera:
Posso te ajudar!
Aceita minha ajuda? 🙏"`
      },
      {
        title: "Upselling e Cross-selling",
        content: `📈 Aumentando Ticket Médio

UPSELLING:

Cliente quer básica (R$ 57)?
Ofereça completa (R$ 97):
"Por R$ 40 a mais, ganha:
✅ +30 min
✅ Áudio
✅ PDF
Vale muito mais!"

OFEREÇA PACOTE:
1 consulta = R$ 97
3 consultas = R$ 267
💰 Economia R$ 24!

NO ATENDIMENTO:
"Tem muita coisa...
Acompanhamento em 30 dias?
R$ 77 especial! Garante?"

CROSS-SELLING:

Cliente agendou Tarot?
Ofereça materiais:
📖 E-book - R$ 17
🎧 Meditação - R$ 27
💎 Kit - R$ 37

Serviços Complementares:
"Já pensou em:
- Mapa Astral?
- Numerologia?
Faço combo especial!"

BUMP OFFER:
No checkout:
"Quer Meditação de Atração por R$ 17?
□ SIM!
□ Não"

~30% adicionam!

Métricas:
100 vendas básicas: R$ 5.700
Com upsell: R$ 9.380
+64% 🚀`
      }
    ]
  },
  {
    id: 6,
    title: "06. Copywriting",
    icon: <Feather className="w-6 h-6" />,
    color: "from-indigo-600 to-purple-600",
    bgColor: "bg-gradient-to-br from-indigo-900/30 to-purple-900/30",
    borderColor: "border-indigo-500/30",
    cards: [
      {
        title: "Escrita Persuasiva",
        content: `✍️ Textos que Vendem

Fórmulas de Copy:

AIDA:
A - Atenção (gancho)
I - Interesse (problema)
D - Desejo (solução)
A - Ação (CTA)

PAS:
P - Problem (problema)
A - Agitate (agitar)
S - Solve (resolver)

Exemplo:
"Sentindo que está perdida? (P)
Sem saber que decisão tomar e com medo de errar? (A)
O Tarot traz a clareza que você precisa! (S)
Agende sua consulta! (CTA)"

Gatilhos Mentais:
✨ Escassez: "Últimas vagas!"
✨ Urgência: "Só até hoje!"
✨ Autoridade: "Com 10 anos de experiência"
✨ Prova Social: "500+ clientes atendidas"
✨ Reciprocidade: "E-book grátis"

Headlines Poderosas:
"Como [resultado] em [tempo] sem [objeção]"
"O segredo de [resultado] que [autoridade] não conta"
"[Número] formas de [benefício]"

Use Emoção + Lógica!`
      },
      {
        title: "Estrutura de Textos",
        content: `📝 Modelos Prontos

POST INSTAGRAM:
[Gancho emocional]
[Problema/Dúvida]
[Como o Tarot ajuda]
[Benefícios]
[Call to Action]
.
[Hashtags]

EMAIL VENDAS:
Assunto: [Curiosidade + benefício]

Oi [Nome]!

[Conexão pessoal]
[Problema que ela tem]
[Como você resolve]
[Prova social]
[Oferta com benefícios]
[CTA claro]
[PS: urgência/bônus]

PÁGINA DE VENDAS:
1. Headline magnética
2. Subheadline (benefício)
3. Problema (dor)
4. Solução (seu serviço)
5. Como funciona
6. Benefícios (bullets)
7. Depoimentos
8. Preço e garantia
9. FAQ
10. CTA final

STORY VENDAS:
Slide 1: Gancho
Slide 2-3: Problema
Slide 4-5: Solução
Slide 6: Prova
Slide 7: Oferta
Slide 8: CTA + link`
      },
      {
        title: "Storytelling que Converte",
        content: `📖 O Poder das Histórias

Estrutura de História:

1. SITUAÇÃO INICIAL
"Há 3 anos, eu estava completamente perdida..."

2. CONFLITO/PROBLEMA
"Até que tudo desmoronou quando..."

3. JORNADA/LUTA
"Foi quando descobri o Tarot e..."

4. TRANSFORMAÇÃO
"Hoje, minha vida é completamente diferente..."

5. CONVITE
"E eu quero te ajudar a viver isso também!"

Tipos de Histórias:

💜 Sua Jornada
Como o Tarot mudou sua vida

💫 Transformação de Cliente
Antes e depois de atendimentos

🌟 Bastidores
Dia a dia de uma taróloga

✨ Lição Aprendida
Erros e aprendizados

Elementos Poderosos:
- Emoção genuína
- Detalhes sensoriais
- Diálogos
- Virada/twist
- Mensagem clara

Exemplo Completo:
"Eu nunca vou esquecer da Maria.

Ela chegou na consulta com os olhos cheios de lágrimas. Acabara de descobrir uma traição e não sabia se ficava ou ia embora.

As cartas mostraram algo surpreendente: não era sobre ele. Era sobre ela finalmente se escolher.

3 meses depois, ela me mandou uma mensagem:
'Obrigada por me ajudar a encontrar minha força. Terminei sim, mas pela primeira vez na vida, escolhi EU.'

Hoje ela é outra pessoa.

Se você também precisa de clareza para fazer escolhas difíceis, posso te ajudar.

[Link consulta]"

💡 Histórias vendem mais que argumentos!`
      }
    ]
  },
  {
    id: 7,
    title: "07. Narrativas de Venda",
    icon: <BookText className="w-6 h-6" />,
    color: "from-violet-600 to-purple-600",
    bgColor: "bg-gradient-to-br from-violet-900/30 to-purple-900/30",
    borderColor: "border-violet-500/30",
    cards: [
      {
        title: "Desenvolvimento de Narrativa",
        content: `🎭 Criando História em Torno dos Seus Serviços

O Que é Narrativa de Venda?
É a história que você conta sobre seu serviço que faz as pessoas quererem comprar.

Estrutura:

1. MUNDO COMUM
"A maioria das pessoas vive no automático, sem se questionar..."

2. CHAMADO À AVENTURA
"Mas você é diferente. Você busca respostas mais profundas..."

3. ENCONTRO COM MENTOR
"O Tarot é essa ferramenta ancestral que..."

4. TRANSFORMAÇÃO
"E quando você se permite essa jornada..."

5. NOVO MUNDO
"Você se torna a heroína da sua própria história!"

Exemplo Narrativa Completa:

"Você já sentiu que está vivendo no piloto automático?

Acordar, trabalhar, dormir, repetir.

Sem propósito. Sem clareza. Sem direção.

É como andar no escuro, sem saber para onde ir.

Eu já estive aí. E foi o Tarot que acendeu a luz.

Não de forma mágica. Mas me dando as perguntas certas para EU MESMA encontrar minhas respostas.

Hoje, cada decisão que tomo é consciente. Alinhada. Minha.

E essa é a transformação que ofereço:
Não te dou as respostas.
Te dou a CLAREZA para você encontrá-las.

Pronta para acender sua própria luz?

[CTA]"

Elementos Essenciais:
✅ Identificação (ela se vê na história)
✅ Emoção (desperta sentimentos)
✅ Transformação (mostra possibilidade)
✅ Convite (CTA suave)

Narrativas por Nicho:

💼 Para Empreendedoras:
"Tomar decisões de negócio é solitário...
E se você tivesse uma guia espiritual para iluminar seu caminho?"

💕 Para Relacionamentos:
"Você merece um amor que te escolhe todos os dias.
O Tarot te ajuda a entender o que realmente está buscando."

🌙 Para Autoconhecimento:
"Quem você é quando ninguém está olhando?
Descubra sua essência através do Tarot."

💡 Sua narrativa precisa ser ÚNICA e VERDADEIRA!`
      },
      {
        title: "Elementos de uma Boa Narrativa",
        content: `🎯 Problema, Solução e Resultado

IDENTIFICAÇÃO DO PROBLEMA:

Seja específica!
❌ "Se você tem problemas..."
✅ "Se você acorda todo dia se sentindo vazia, sem saber o que realmente quer..."

Tipos de Problemas:
- Emocionais (medo, ansiedade, solidão)
- Práticos (indecisão, falta de direção)
- Relacionais (conflitos, fim de ciclo)
- Profissionais (carreira, propósito)
- Espirituais (desconexão, falta de sentido)

Exemplo:
"Você está num relacionamento que não te faz feliz, mas tem medo de ficar sozinha?"

AGITAÇÃO DO PROBLEMA:

Mostre consequências:
"E a cada dia que passa, você se sente mais distante de quem você realmente é..."

"Enquanto isso, o tempo vai passando e você continua adiando suas decisões..."

SOLUÇÃO (Seu Serviço):

Apresente como ponte:
"O Tarot não vai te dizer o que fazer.
Mas vai te dar a clareza que você precisa para VOCÊ decidir."

Benefícios Específicos:
✅ "Entender seus padrões"
✅ "Ver opções que você não via"
✅ "Conectar com sua intuição"
✅ "Tomar decisões alinhadas"

RESULTADO/TRANSFORMAÇÃO:

Pinte o futuro:
"Imagine você:
- Confiante nas suas escolhas
- Conectada com sua intuição
- Vivendo alinhada com seu propósito
- Em paz com suas decisões"

Ou use resultado de cliente real:
"Como a Júlia que hoje vive o relacionamento dos sonhos"
"Como a Ana que largou o emprego e abriu seu negócio"

PROVA SOCIAL:

Depoimentos:
"Não sou só eu que digo! Veja o que minhas clientes falam:"

[Depoimento 1]
[Depoimento 2]
[Depoimento 3]

Números:
"+ de 500 mulheres atendidas"
"98% de satisfação"
"Média de 4.9 estrelas"

CTA (Call to Action):

Seja clara e direta:
❌ "Se quiser, me chama"
✅ "Clique no link e agende sua consulta"

✅ "Quero agendar minha consulta!"
✅ "Sim, quero essa transformação!"
✅ "Garantir minha vaga!"

---

NARRATIVA COMPLETA EXEMPLO:

PROBLEMA:
"Você sente que está presa num emprego que não te realiza. Todo domingo à noite, aquele aperto no peito. Toda segunda, o despertador parece um pesadelo. Você SABE que não é isso que quer, mas tem medo de mudar..."

AGITAÇÃO:
"E enquanto isso, o tempo passa. Mais um ano. Mais dois. E você continua ali, adiando seus sonhos, sufocando sua essência..."

SOLUÇÃO:
"O Tarot de Carreira te ajuda a ter clareza sobre:
✨ Seus verdadeiros talentos
✨ O caminho profissional alinhado com você
✨ O timing certo para mudanças
✨ Como dar os próximos passos com confiança"

RESULTADO:
"Imagine acordar animada para trabalhar. Fazendo o que ama. Ganhando bem. Realizada.

É possível! Eu já ajudei dezenas de mulheres a fazerem essa transição.

Como a Paula, que saiu de um emprego corporativo tóxico e hoje tem seu próprio negócio de bem-estar.

Ou a Fernanda, que descobriu seu propósito e hoje trabalha com o que ama."

PROVA:
[3 depoimentos com fotos]

CTA:
"Pronta para descobrir seu verdadeiro caminho profissional?

Agende sua Consulta de Carreira:
60 minutos de análise profunda
+ Áudio para revisitar
+ PDF com plano de ação
R$ 147

[BOTÃO: Quero Transformar Minha Carreira!]

Vagas limitadas! Garanta a sua agora."

---

💡 DICA FINAL:

Teste diferentes narrativas e veja o que gera mais engajamento.

Salve as que funcionam e reutilize adaptando!`
      },
      {
        title: "Casos de Sucesso",
        content: `⭐ Usando Depoimentos Estrategicamente

Como Coletar Depoimentos:

1. DURANTE A CONSULTA:
"Fico feliz que tenha gostado!
Você se importaria de escrever um depoimento?
Ajuda muito outras pessoas a conhecerem meu trabalho! 💜"

2. APÓS A CONSULTA:
Mensagem follow-up:
"Oi [Nome]! Como você está?
As coisas fluíram como apareceu nas cartas?

Se quiser compartilhar sua experiência, aceito depoimento! Pode ser áudio ou texto, como preferir!"

3. FACILITE:
Envie perguntas guia:
- Como era antes da consulta?
- O que mais te marcou?
- Que mudança você percebeu?
- Recomendaria? Por quê?

Onde Usar Depoimentos:

📱 Stories (compartilhe prints)
📸 Feed (post dedicado)
💬 Site/bio
📧 Email de vendas
🎥 Vídeo (compile vários)

Formato de Depoimento Poderoso:

"Antes da consulta com [seu nome], eu [problema].

Durante a leitura, ela [o que você fez de especial].

Hoje, [resultado/transformação].

Recomendo MUITO! Se você [problema similar], não pense duas vezes!"

- [Nome e foto da cliente]

Tipos de Depoimentos:

💬 Texto Simples
"Melhor consulta da minha vida! Super recomendo!"

📝 Texto Detalhado
[História completa de transformação]

🎤 Áudio
Cliente gravando depoimento (poste no Stories!)

🎥 Vídeo
O mais poderoso! Peça para gravar selfie

📊 Antes e Depois
Comparação clara de mudança

Transforme Depoimentos em Conteúdo:

Post 1: "O que minhas clientes dizem"
[3-5 depoimentos curtos]

Post 2: "História de transformação"
[1 depoimento longo com contexto]

Post 3: "Perguntei para minhas clientes"
[Respostas sobre o que mais gostaram]

Carrossel: "Resultados Reais"
Slide 1: Título
Slide 2-6: 1 depoimento por slide
Slide 7: CTA

Credibilidade:

Mostre:
✅ Quantidade de atendimentos
✅ Anos de experiência
✅ Formações/cursos
✅ Certificações
✅ Resultados de clientes

"Já atendi + de 500 pessoas
98% recomendam
Formada em [curso]
Praticante há [X] anos"

Ética:

✅ Peça autorização para usar
✅ Não invente depoimentos
✅ Pode usar iniciais se pessoa preferir anonimato
✅ Seja honesta sobre resultados

❌ Não prometa milagres
❌ Não garanta resultados específicos
❌ Respeite privacidade

Frequência:

📅 Compartilhe depoimento:
- 1x por semana no feed
- 2-3x por semana nos stories
- Todo email de venda

Sempre que possível, mostre que OUTRAS PESSOAS confiam em você!

🎯 Depoimento é Prova Social = Aumenta Confiança = Mais Vendas!`
      }
    ]
  },
  {
    id: 8,
    title: "08. Como Crescer Seu Perfil",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-cyan-600 to-blue-600",
    bgColor: "bg-gradient-to-br from-cyan-900/30 to-blue-900/30",
    borderColor: "border-cyan-500/30",
    cards: [
      {
        title: "Estratégias de Crescimento",
        content: `📈 Técnicas para Aumentar Seguidores e Engajamento

Técnicas Eficientes:

1. CONHEÇA SEU PÚBLICO-ALVO
   - Pesquise e Analise: Entenda idades, interesses, desafios
   - Feedback e Interação: Pergunte diretamente o que querem

2. CRIE CONTEÚDO VALIOSO E RELEVANTE
   - Eduque e Inspire: Insights sobre tarot, técnicas
   - Histórias e Exemplos: Use casos reais

3. USE ELEMENTOS VISUAIS ATRAENTES
   - Imagens de Qualidade: Posts visualmente atraentes
   - Vídeos e Reels: Conteúdo dinâmico
   - Stories Interativos: Enquetes, caixinhas de perguntas

4. SEJA CONSISTENTE
   - Frequência: Poste regularmente (mínimo 3-4x/semana)
   - Horários: Descubra quando seu público está online

5. ENGAJE COM SEU PÚBLICO
   - Responda Comentários e DMs
   - Faça Perguntas e Enquetes
   - Lives e Q&A

6. USE HASHTAGS ESTRATÉGICAS
   - Específicas: #TarotBrasil #TarologaBrasileira
   - Populares: #Tarot #Espiritualidade
   - Nicho: #TarotParaEmpreendedoras
   - Misture: 5 grandes + 15 médias + 10 pequenas

7. COLABORE E FAÇA PARCERIAS
   - Lives com outras tarológas
   - Posts conjuntos
   - Menções e tags

8. ANALISE E AJUSTE
   - Veja o que funciona
   - Mais do que dá resultado
   - Teste formatos

Truques de Crescimento Rápido:

🔥 REELS VIRAIS
- Gancho forte nos 3 primeiros segundos
- Legendas chamativas
- Trending áudios
- CTA no final

💬 ENGAJAMENTO NOS STORIES
- Caixinha de perguntas diária
- Enquetes
- Quiz
- Desafios

📸 POSTS SALVOS
Conteúdo que as pessoas salvam:
- Listas (Top 10...)
- Tutoriais
- Significados de cartas
- Tiragens passo a passo

Frequência Ideal:

📱 Instagram:
- Feed: 4-5x semana
- Stories: Diário (10-15 por dia)
- Reels: 3-4x semana

Meta de Crescimento:

Mês 1-3: 100-300 seguidores/mês
Mês 4-6: 300-500 seguidores/mês
Mês 7-12: 500-1000 seguidores/mês

💡 Consistência > Perfeição!`
      },
      {
        title: "Parcerias e Colaborações",
        content: `🤝 Colabore para Crescer

Tipos de Parcerias:

1. LIVES CONJUNTAS
Você + outra taróloga = 2 públicos

Formato:
- Tema comum
- Cada uma traz expertise
- Promovam juntas antes
- Salvem para Reels depois

2. POSTS COLABORATIVOS
- Mencionem uma a outra
- "3 tarológas indicam..."
- Roundup de dicas

3. TAKEOVER (Troca de Stories)
- Você posta nos stories dela
- Ela posta nos seus
- Apresentem uma a outra

4. SORTEIOS CONJUNTOS
- Junte 3-5 profissionais
- Sorteio de consultas
- Todos ganham seguidores

5. GUEST POSTS
- Escreva para blog de outra
- Convide para escrever no seu

Como Encontrar Parceiras:

🔍 Procure por:
- Mesmo nicho, públicos complementares
- Valores similares
- Tamanho de audiência parecido
- Profissionalismo

Onde procurar:
- Instagram (busque hashtags)
- Grupos de Facebook
- Comunidades online
- Eventos presenciais

Abordagem:

Mensagem:
"Oi [Nome]! 💜

Acompanho seu trabalho e admiro muito [algo específico]!

Estava pensando em fazer uma live sobre [tema] e acho que seria incrível termos essa conversa juntas!

Você faria entre [data1] e [data2]?

O que acha?"

Regras da Parceria:

✅ Benefício mútuo
✅ Combinações claras
✅ Divulgação igual
✅ Profissionalismo
✅ Gratidão mútua

❌ Competição
❌ Comparações
❌ Roubar clientes
❌ Falta de combinação

Além de Tarológas:

Parcerias complementares:
- Astrólogas
- Terapeutas holísticas
- Coaches
- Yoga/meditação
- Lojas esotéricas
- Marcas místicas

Exemplo Win-Win:
Você (taróloga) + Loja de cristais:
- Você indica a loja
- Loja oferece desconto para seus clientes
- Loja divulga você
- Vocês fazem live conjunta

💡 Sozinha você vai rápido. Junto, vocês vão longe!`
      },
      {
        title: "Planejamento de Conteúdo",
        content: `📅 Calendário Editorial

Por Que Planejar?

✅ Consistência
✅ Menos estresse
✅ Melhor qualidade
✅ Aproveita datas importantes
✅ Balanceamento de temas

Estrutura Semanal:

SEGUNDA: Motivação
Post inspiracional para começar semana

TERÇA: Educação
Ensine algo sobre Tarot

QUARTA: Conexão
Pergunta, enquete, interação

QUINTA: Bastidores
Mostre seu dia a dia

SEXTA: Diversão
Conteúdo leve, memes, trends

SÁBADO: Oferta
Divulgue seus serviços

DOMINGO: Reflexão
Mensagem profunda, tiragem semanal

Pilares de Conteúdo:

40% - Educação (ensinar)
30% - Inspiração (motivar)
20% - Conexão (engajar)
10% - Venda (ofertar)

Planejamento Mensal:

Semana 1: Foco em [Pilar 1]
Semana 2: Foco em [Pilar 2]
Semana 3: Foco em [Pilar 3]
Semana 4: Promoção/Lançamento

Datas Importantes:

🌙 Luas:
- Nova: Novos começos
- Crescente: Crescimento
- Cheia: Plenitude, rituais
- Minguante: Limpeza, release

📅 Datas Especiais:
- 01/01: Ano novo
- 02/02: Dia de Iemanjá
- Carnaval
- Páscoa
- Dia das Mães
- Dia dos Namorados
- Halloween
- Black Friday
- Natal

♈ Datas Astrológicas:
- Início de cada signo
- Mercúrio retrógrado
- Eclipses
- Equinócios/Solstícios

Ferramentas:

📱 Apps:
- Trello
- Notion
- Planoly
- Later

📊 Planilha Simples:
Data | Tipo | Tema | Status | Resultado

Produção em Lote:

Reserve 1 dia para criar:
- 12 posts do mês
- 30 stories
- 4 Reels

Economiza tempo e mantém consistência!

Exemplo de Mês Planejado:

JANEIRO - Tema: Recomeços

Sem 1: Ano Novo
- Tiragem para 2025
- Metas e intenções
- Limpeza energética

Sem 2: Autoconhecimento
- Quem você quer ser?
- Soltando o velho
- Abrir para o novo

Sem 3: Planejamento
- Mapa do ano
- Cada mês
- Preparação

Sem 4: Ação
- Primeiros passos
- Oferta de pacote anual
- Promoção

💡 Planejar 1 hora/semana poupa 10 horas de improviso!`
      }
    ]
  },
  {
    id: 9,
    title: "09. BÔNUS",
    icon: <Gift className="w-6 h-6" />,
    color: "from-yellow-600 to-orange-600",
    bgColor: "bg-gradient-to-br from-yellow-900/30 to-orange-900/30",
    borderColor: "border-yellow-500/30",
    cards: [
      {
        title: "PROMPTS INSTAGRAM CARROSSEL",
        content: `📊 Prompts Prontos para Criar Carrosséis Virais

Use com ChatGPT/Claude:

PROMPT 1: Educacional
"Crie um carrossel de 10 slides sobre [tema do Tarot].
Título chamativo, cada slide com 1 dica prática.
Tom: acolhedor e místico.
Público: [seu nicho]"

PROMPT 2: Significados
"Liste significados da carta [carta] em 8 categorias:
Amor, Carreira, Espiritual, Invertida, Positivo, Negativo, Conselho, Resumo.
Linguagem simples e envolvente."

PROMPT 3: Tutorial
"Crie passo a passo para iniciantes:
[Tema - ex: Como fazer tiragem de 3 cartas]
10 slides máximo.
Explique como se estivesse ensinando uma amiga."

PROMPT 4: Mitos vs Verdades
"Liste 7 mitos e verdades sobre Tarot.
Formato: Slide 1 (Mito), Slide 2 (Verdade).
Quebre objeções comuns."

PROMPT 5: Checklist
"Crie checklist de [tema]:
- Ex: Como escolher seu primeiro baralho
- Ex: Preparação antes da leitura
- Ex: Cuidados com seu baralho
8-10 itens com emoji"

Títulos que Funcionam:

✅ "10 Coisas Que Ninguém Te Conta Sobre Tarot"
✅ "Como Ler Tarot Mesmo Sendo Iniciante"
✅ "7 Erros Que Você Comete ao Consultar Tarot"
✅ "O Guia Completo de [tema]"
✅ "Antes de Comprar um Baralho, Leia Isso"

Estrutura Vencedora:

Slide 1: GANCHO
- Título impactante
- Visual chamativo
- Promessa clara

Slides 2-9: CONTEÚDO
- 1 ideia por slide
- Texto grande
- Visual limpo
- Informação valiosa

Slide 10: CTA
- Recapitule valor
- Chame para ação
- Salve/Compartilhe
- Siga para mais

🎨 Dica: Use sempre seu template de marca!`,
        isBonus: true
      },
      {
        title: "CRIATIVOS CAMPEÕES",
        content: `🏆 Análise de Criativos que Deram Certo

Exemplo 1: "Escolha Sua Carta"

Funcionou porque:
✅ Interativo (pessoa precisa escolher)
✅ Rápido (resultado imediato)
✅ Compartilhável (marca amiga)
✅ Viral (algoritmo ama engajamento)

Como replicar:
1. Crie imagem com 3-4 cartas
2. "Escolha uma carta intuitivamente"
3. Nos comentários, revele significados
4. "Qual você escolheu?"

---

Exemplo 2: "Antes vs Depois"

"Como eu era vs Como sou agora (depois do Tarot)"

Funcionou porque:
✅ Relatable (pessoas se identificam)
✅ Aspiracional (querem chegar lá)
✅ Pessoal (sua história)
✅ Prova (resultado real)

Como replicar:
Use 2 fotos suas ou texto comparativo

---

Exemplo 3: "Tutorial Rápido"

"Como fazer tiragem de 3 cartas em 60 segundos"

Funcionou porque:
✅ Útil (ensina algo)
✅ Rápido (não toma tempo)
✅ Acionável (podem fazer agora)
✅ Salvo (referência futura)

Como replicar:
Vídeo curto ou carrossel simples

---

Exemplo 4: "Meme Místico"

Meme de situação engraçada relacionada a Tarot

Funcionou porque:
✅ Divertido
✅ Compartilhável
✅ Humaniza você
✅ Algoritmo ama

---

Exemplo 5: "Depoimento Emocional"

Print de mensagem de cliente emocionada

Funcionou porque:
✅ Prova social
✅ Emoção genuína
✅ Resultado real
✅ Gera confiança

---

Formatos que SEMPRE Funcionam:

📌 Listas: "7 sinais de que você é..."
📌 Perguntas: "Qual carta te representa?"
📌 Tutoriais: "Como fazer..."
📌 Mitos: "Verdade ou mentira sobre..."
📌 Histórias: "A cliente que..."
📌 Trends: Adapte para Tarot
📌 Comparações: "Tipos de..."

Copie a ESTRUTURA, não o conteúdo!

💡 Analise seus próprios posts: quais performaram melhor? Faça mais disso!`,
        isBonus: true
      },
      {
        title: "NARRATIVAS VENCEDORAS",
        content: `✨ Narrativas Que Converteram

NARRATIVA 1: A Transformação

"Há 2 anos, eu estava completamente perdida...

Trabalhava num emprego que odiava. Relacionamento tóxico. Sem propósito.

Até que uma amiga me deu uma leitura de Tarot de presente.

Aquelas cartas mexeram comigo de um jeito que eu nunca imaginei.

Comecei a estudar. Me aprofundei. Me transformei.

Hoje eu acordo FELIZ. Fazendo o que amo. Ajudando outras pessoas a encontrarem sua luz.

E eu posso te ajudar também.

Se você sente que está perdida, sem direção, sem propósito...

O Tarot pode ser o mapa que você precisa.

[Link para agendar]"

ROI: 47 consultas agendadas a partir desse post

---

NARRATIVA 2: O Problema Específico

"Se você está num relacionamento que:

- Não te faz feliz
- Mas tem medo de ficar sozinha
- Não sabe se termina ou dá mais uma chance
- Sente culpa só de pensar em sair
- Todo mundo fala para você sair mas você não consegue

Eu te entendo.

Porque eu já estive aí.

O Tarot me ajudou a entender que o problema não era tomar a decisão "certa".

Era entender o que EU realmente queria.

E quando isso ficou claro, a decisão foi natural.

Quer essa clareza também?

[CTA]"

ROI: 89% de conversão entre quem clicou

---

NARRATIVA 3: Dia a Dia Real

"6h - Acordo com sol nascendo
6h30 - Meditação com meu baralho
7h - Primeira cliente do dia
9h - Café e estudo de cartas novas
10h - Gravação de conteúdo
12h - Almoço ouvindo podcast de Tarot
14h - 2 consultas
17h - Respondo DMs
19h - Jantar e descanso
21h - Última cliente
22h - Gratidão pelas trocas do dia

Esse é meu dia como taróloga profissional.

Vivo fazendo o que AMO.
Acordo FELIZ.
Durmo REALIZADA.

Não troco por nada!

E você? Está vivendo seu propósito ou ainda adiando?

Posso te ajudar a dar o primeiro passo! 💜"

ROI: Post mais salvo do mês

---

NARRATIVA 4: Resultado de Cliente

"A Ana chegou dizendo:
'Tô confusa. Não sei se fico no emprego ou empreendo.'

As cartas mostraram que ela já SABIA a resposta.
Só tinha medo de confiar nela mesma.

Trabalhamos:
✨ Seus medos
✨ Seus talentos únicos
✨ O timing certo
✨ Primeiros passos

3 meses depois:
Ela pediu demissão.
Abriu seu negócio de bem-estar.
Hoje fatura 3x mais do que ganhava.

E está FELIZ.

Não foi o Tarot que fez isso.
Foi ela. Sempre foi ela.

O Tarot só iluminou o caminho.

Você também tem suas respostas dentro de você.
Só precisa de clareza para vê-las.

Posso iluminar seu caminho? 🕯️

[Link]"

ROI: 23 vendas diretas + 67 salvamentos

---

NARRATIVA 5: Quebra de Objeção

"'Mas o futuro não é fixo. Como o Tarot pode prever?'

EXATAMENTE!

O Tarot NÃO prevê futuro fixo.

Ele mostra TENDÊNCIAS baseadas na sua energia ATUAL.

Se você mudar energia, muda resultado.

É tipo GPS:
- Mostra caminho atual
- Você pode mudar rota
- Te avisa de obstáculos
- Sugere melhor caminho

O futuro é SEU.
O Tarot só ilumina as opções.

Faz sentido? 💜"

ROI: 156 compartilhamentos

---

Elementos Comuns de Todas:

✅ Honestidade
✅ Vulnerabilidade
✅ Transformação clara
✅ Identificação
✅ CTA suave
✅ Emoção real

💡 Sua melhor narrativa é sua VERDADE!`,
        isBonus: true
      },
      {
        title: "CRIATIVO EXEMPLO - Análise",
        content: `🎨 Anatomia de um Criativo Campeão

ANÁLISE DETALHADA:

POST: "3 Cartas Para Descobrir Seu Propósito"

Por Que Funcionou:

1. TÍTULO MAGNÉTICO
✅ Número específico (3)
✅ Promessa clara (Propósito)
✅ Benefício óbvio (Descobrir)

2. VISUAL IMPACTANTE
✅ 3 cartas em destaque
✅ Cores vibrantes
✅ Fundo que contrasta
✅ Texto grande e legível

3. CONTEÚDO VALIOSO
Carrossel de 10 slides:

Slide 1: Gancho
"Seu propósito está nas cartas"

Slides 2-4: As 3 posições
- Carta 1: Seus dons
- Carta 2: Sua missão
- Carta 3: Próximo passo

Slides 5-7: Como fazer
Passo a passo detalhado

Slide 8: Exemplo real
Caso de uma cliente

Slide 9: Dica extra
Como aprofundar

Slide 10: CTA
"Quer ajuda profissional?
[Link]"

4. ENGAJAMENTO
✅ Pediu para compartilhar
✅ Perguntou "Qual carta você tirou?"
✅ Respondeu TODOS os comentários

RESULTADOS:

📊 Alcance: 47.3K
💬 Comentários: 892
💾 Salvamentos: 3.1K
📤 Compartilhamentos: 2.4K
📈 Novos seguidores: 847
💰 Consultas: 34 vendas diretas

O QUE REPLICAR:

1. Ensine algo ESPECÍFICO
2. Dê valor REAL
3. Seja VISUAL
4. Peça AÇÃO
5. RESPONDA tudo

Variações que Você Pode Fazer:

"3 Cartas Para..."
- ...Entender Seu Relacionamento
- ...Tomar Decisões de Carreira
- ...Desbloquear Abundância
- ...Conhecer Seu Ano
- ...Resolver Conflito Interno

Mesma estrutura, temas diferentes!

Checklist do Criativo Campeão:

□ Gancho forte (primeiros 3 seg)
□ Visual atraente
□ Promessa clara
□ Conteúdo valioso
□ Fácil de consumir
□ CTA claro
□ Incentiva engajamento
□ Compartilhável

💡 Use essa checklist em TODOS os seus posts!`,
        isBonus: true
      },
      {
        title: "HEADLINES CATIVANTES",
        content: `📢 Modelos de Headlines Prontos Para Usar

FÓRMULA: [Número] + [Objetivo] + [Tempo/Forma] + [Sem Objeção]

Exemplos:

"7 Formas de Ler Tarot Mesmo Sendo Iniciante"
"5 Segredos do Tarot Que Ninguém Te Conta"
"Como Ganhar R$ 3K/Mes com Tarot em 90 Dias"
"10 Erros Que Você Comete ao Consultar Tarot"

---

CURIOSIDADE:

"O Que o Tarot Revelou Sobre Você?"
"A Carta Que Mudou Minha Vida (E Pode Mudar a Sua)"
"Por Que 90% das Pessoas Lêem Tarot Errado"

---

ESPECÍFICO:

"Para Quem Está em Dúvida se Termina ou Continua"
"Se Você Odeia Seu Emprego, Leia Isso"
"Antes de Tomar Qualquer Decisão Importante..."

---

NEGAÇÃO:

"Tarot NÃO Prevê o Futuro (E Isso é Ótimo)"
"Você Não Precisa Ser Vidente Para Ler Tarot"
"Pare de Tentar Controlar o Resultado"

---

IDENTIFICAÇÃO:

"Se Você Sente Que Está Perdida..."
"Para Quem Está Cansada de Se Autosabotar"
"Isso É Para Você Que Não Aguenta Mais..."

---

URGÊNCIA:

"Últimas 3 Vagas de Abril!"
"Promoção Termina em 24h"
"Nunca Mais Vou Fazer Esse Preço"

---

BENEFÍCIO DIRETO:

"Clareza em 60 Minutos"
"Descubra Seu Propósito Hoje"
"Termine o Ano com Direção Clara"

---

TRANSFORMAÇÃO:

"De Perdida a Confiante: A Jornada de [Nome]"
"Como Deixei de Ter Medo de Decidir"
"Antes Eu [antes]. Hoje Eu [depois]"

---

COMBO NÚMEROS + BENEFÍCIO:

"3 Cartas Para Entender Qualquer Situação"
"5 Minutos Para Clareza Total"
"1 Tiragem Que Muda Tudo"

---

TEMPLATES PARA PREENCHER:

"O Guia Definitivo de ___________"
"___________ em ___ Passos Simples"
"Como ___________ Sem ___________"
"O Segredo Para ___________ Que Ninguém Conta"
"___________ : O Que Você Precisa Saber"
"Por Que ___________ Não Está Funcionando Para Você"
"___ Sinais de Que Você Deveria ___________"
"Pare de ___________ e Comece a ___________"

---

HEADLINES PARA VENDAS:

"Consulta Completa de Autoconhecimento - 60 Min"
"Descubra Seu Propósito em 1 Hora"
"Tire Suas 3 Maiores Dúvidas Agora"
"Transforme Sua Vida em 1 Consulta"

---

TESTE A/B:

Teste 2 headlines diferentes:

Versão A: "Como Descobrir Seu Propósito"
Versão B: "Seu Propósito Revelado em 3 Cartas"

Use a que der mais resultado!

---

FÓRMULA FINAL:

[Emoção] + [Especificidade] + [Benefício Claro] + [Urgência/Curiosidade]

Exemplo:
"Sentindo Perdida? Descubra Seu Propósito em 3 Cartas (Antes Que Seja Tarde)"

Emoção: Perdida
Especificidade: 3 Cartas
Benefício: Propósito
Urgência: Antes que seja tarde

💡 Headline faz 80% do trabalho! Teste até acertar!`,
        isBonus: true
      },
      {
        title: "Workshop Ao Vivo",
        content: `🎥 WORKSHOPS EXCLUSIVOS AO VIVO

Próximos Temas:

📅 Workshop 1: "Montando Seu Funil de Vendas"
- Data: A definir
- Como levar do Instagram até a venda
- Estratégias automatizadas
- Ferramentas gratuitas

📅 Workshop 2: "Reels que Viralizam"
- Como criar Reels que explodem
- Análise de Reels de sucesso
- Trends para Tarológas
- Edição profissional rápida

📅 Workshop 3: "Precificação Estratégica Avançada"
- Precificação psicológica
- Quando aumentar preços
- Pacotes VIP
- Contratos e garantias

📅 Workshop 4: "Stories que Vendem"
- Estrutura de stories de venda
- Sequência de aquecimento
- CTA que converte
- Stickers estratégicos

Como Participar:
- Fique de olho nos anúncios
- Entre no grupo de networking
- Ative notificações
- Todos são gratuitos para alunas!

Replays Disponíveis:
✅ Gravação liberada por 7 dias
✅ Material complementar em PDF

💜 Nos vemos nos workshops!`,
        isBonus: true,
        hasVideo: true
      }
    ]
  },
  {
    id: 10,
    title: "10. Grupo de Networking",
    icon: <Users className="w-6 h-6" />,
    color: "from-teal-600 to-green-600",
    bgColor: "bg-gradient-to-br from-teal-900/30 to-green-900/30",
    borderColor: "border-teal-500/30",
    cards: [
      {
        title: "Entre no Grupo de Networking!",
        content: `👥 Comunidade Exclusiva de Tarológas

O Que é o Grupo?

Uma comunidade privada de tarológas que estão crescendo juntas, trocando experiências, dúvidas, dicas e fazendo networking.

O Que Você Encontra:

💜 Suporte de outras tarólogas
💬 Tirar dúvidas sobre cartas
💡 Ideias de conteúdo
📊 Compartilhar resultados
🤝 Parcerias e colaborações
🎉 Celebrar conquistas
📚 Material extra
🎁 Lives exclusivas

Regras do Grupo:

✅ Respeito mútuo
✅ Sem competição
✅ Compartilhe conhecimento
✅ Apoie outras tarólogas
✅ Seja ativa

❌ Sem autopromoção excessiva
❌ Sem negatividade
❌ Sem roubar ideias

Como Entrar:

1. Clique no link abaixo
2. Apresente-se
3. Participe ativamente
4. Conecte-se com outras tarólogas!

[LINK DO GRUPO]

Eventos no Grupo:

🗓️ Toda semana:
- Segunda: Motivação semanal
- Quarta: Q&A ao vivo
- Sexta: Compartilhe sua vitória

🗓️ Todo mês:
- Lives com especialistas
- Desafios de crescimento
- Análise de conteúdo
- Networking ativo

Benefícios:

🌟 Termine o isolamento
🌟 Aprenda com quem está na frente
🌟 Ensine quem está começando
🌟 Faça amigas de verdade
🌟 Cresçam juntas!

💜 Te espero lá dentro!

Obs: Grupo exclusivo para alunas do Portal Tarot!`,
        link: "#grupo-networking",
        isExternal: true
      }
    ]
  }
];

const modules = actionPlanSections.map((section) => {
  let emojiIcon;
  let iconBgColorClass;
  let subtitleText;
  let descriptionText;
  let pointsList = [];

  const baseTitle = section.title.replace(/^\d+\.\s*/, ''); // Remove "01. " prefix

  // Map Lucide icon to emoji and set background color
  switch (section.id) {
    case 1: emojiIcon = "🎯"; iconBgColorClass = "bg-blue-600"; subtitleText = "Identifique seu público ideal no mundo do Tarot."; break; // Definição de Nicho - Target
    case 2: emojiIcon = "⭐"; iconBgColorClass = "bg-purple-600"; subtitleText = "Crie uma identidade única e memorável para sua prática."; break; // Branding Pessoal - Star
    case 3: emojiIcon = "🎨"; iconBgColorClass = "bg-pink-600"; subtitleText = "Desenvolva visuais atraentes para seus conteúdos e marca."; break; // Design para Tarológas - Palette
    case 4: emojiIcon = "💰"; iconBgColorClass = "bg-green-600"; subtitleText = "Defina o valor justo para seus atendimentos e produtos."; break; // Precificação de Métodos - DollarSign
    case 5: emojiIcon = "💬"; iconBgColorClass = "bg-orange-600"; subtitleText = "Comunique-se de forma eficaz para converter mais clientes."; break; // Scripts de Abordagem - MessageSquare
    case 6: emojiIcon = "✍️"; iconBgColorClass = "bg-indigo-600"; subtitleText = "Escreva textos que vendem e conectam com seu público."; break; // Copywriting - Feather
    case 7: emojiIcon = "📖"; iconBgColorClass = "bg-violet-600"; subtitleText = "Construa histórias que envolvam e persuadam seus clientes."; break; // Narrativas de Venda - BookText
    case 8: emojiIcon = "📈"; iconBgColorClass = "bg-cyan-600"; subtitleText = "Expanda seu alcance e atraia mais seguidores engajados."; break; // Como Crescer Seu Perfil - TrendingUp
    case 9: emojiIcon = "🎁"; iconBgColorClass = "bg-yellow-600"; subtitleText = "Acesse recursos extras para acelerar seu crescimento."; break; // BÔNUS - Gift
    case 10: emojiIcon = "👥"; iconBgColorClass = "bg-teal-600"; subtitleText = "Conecte-se com outras tarólogas e crie parcerias."; break; // Grupo de Networking - Users
    default: emojiIcon = "💡"; iconBgColorClass = "bg-gray-600"; subtitleText = "Descubra um novo aspecto da sua jornada.";
  }

  // Summarize content for description and points
  const firstCardContent = section.cards[0]?.content || "";
  descriptionText = firstCardContent.split('\n')[0]; // First line as description
  if (descriptionText && descriptionText.length > 150) {
    descriptionText = descriptionText.substring(0, 150) + '...';
  } else if (!descriptionText) {
    descriptionText = `Aprenda sobre ${baseTitle.toLowerCase()}.`;
  }
  
  // Extract bullet points or key phrases
  const lines = firstCardContent.split('\n').filter(line => line.trim() !== '');
  pointsList = lines.filter(line => line.startsWith('-') || line.startsWith('✅') || line.startsWith('⭐') || line.startsWith('1.')).slice(0, 3).map(line => line.replace(/^- /, '').replace(/^✅ /, '').replace(/^⭐ /, '').replace(/^\d+\.\s*/, '').trim());

  if (pointsList.length < 3) {
      if (section.id === 1) pointsList = ["Facilita a Comunicação", "Aumenta a Relevância", "Melhora a Conversão"];
      if (section.id === 2) pointsList = ["Diferenciação no mercado", "Transmite profissionalismo", "Cria conexão autêntica"];
      if (section.id === 3) pointsList = ["Crie posts que param o scroll", "Domine Canva e Photoshop", "Desenvolva uma identidade visual"];
      if (section.id === 4) pointsList = ["Calcule seus custos corretamente", "Crie pacotes irresistíveis", "Aumente seu ticket médio"];
      if (section.id === 5) pointsList = ["Scripts para diferentes clientes", "Técnicas de fechamento", "Estratégias de Upselling"];
      if (section.id === 6) pointsList = ["Fórmulas de Copy persuasivas", "Estrutura de textos para vendas", "Storytelling que converte"];
      if (section.id === 7) pointsList = ["Crie histórias em torno dos seus serviços", "Pinte o futuro para seus clientes", "Transforme objeções em oportunidades"];
      if (section.id === 8) pointsList = ["Reels virais e engajamento", "Parcerias e colaborações", "Planejamento de conteúdo eficaz"];
      if (section.id === 9) pointsList = ["Prompts para Carrosséis Virais", "Análise de Criativos Campeões", "Workshops Exclusivos Ao Vivo"];
      if (section.id === 10) pointsList = ["Suporte de outras tarólogas", "Ideias de conteúdo e parcerias", "Lives e eventos exclusivos"];
  }
  // Ensure we always have at least 3 points for display
  while (pointsList.length < 3) {
      pointsList.push(`Ponto chave ${pointsList.length + 1}`);
  }


  return {
    title: baseTitle,
    subtitle: subtitleText,
    icon: emojiIcon,
    iconBg: iconBgColorClass,
    color: `${section.bgColor} ${section.borderColor}`,
    description: descriptionText,
    points: pointsList,
  };
});


export default function PlanoDeAcaoPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null); // Iniciar null = todos fechados

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const toggleModule = (moduleIndex) => {
    setExpandedModule(expandedModule === moduleIndex ? null : moduleIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl("AreaDoAluno"))}
          variant="ghost"
          className="text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Área do Aluno
        </Button>

        {/* Hero */}
        <div className="relative overflow-hidden border-b border-purple-900/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
          
          <div className="px-4 py-10 md:py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
              >
                <Target className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Portal Tarot - Plano de Ação
              </h1>
              <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto">
                Seu guia completo para se tornar uma taróloga de sucesso
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-6">
                <Badge className="bg-purple-600 text-white px-3 py-1.5 text-xs">
                  {modules.length} Módulos
                </Badge>
                <Badge className="bg-pink-600 text-white px-3 py-1.5 text-xs">
                  Conteúdo Completo
                </Badge>
                <Badge className="bg-blue-600 text-white px-3 py-1.5 text-xs">
                  Bônus
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Módulos - Iniciam FECHADOS */}
        <div className="px-4 py-6 md:py-8">
          <div className="space-y-4">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`${module.color} border overflow-hidden backdrop-blur-sm cursor-pointer transition-all ${
                    expandedModule === index ? 'ring-2 ring-white/30' : ''
                  }`}
                  onClick={() => toggleModule(index)}
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${module.iconBg} flex items-center justify-center text-white text-xl md:text-3xl flex-shrink-0`}>
                          <span className="text-2xl md:text-3xl">{module.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate">
                            {module.title}
                          </h3>
                          <p className="text-gray-300 text-xs md:text-sm truncate">{module.subtitle}</p>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`w-6 h-6 text-white transition-transform duration-300 ${
                          expandedModule === index ? 'rotate-180' : ''
                        } flex-shrink-0`}
                      />
                    </div>

                    <AnimatePresence>
                      {expandedModule === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-white/20 overflow-hidden"
                        >
                          <p className="text-white/90 text-sm md:text-base leading-relaxed mb-4">
                            {module.description}
                          </p>
                          <ul className="space-y-2">
                            {module.points.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-white/80 text-xs md:text-sm">
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5 text-green-400" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
