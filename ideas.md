# AVENTURA GAMER — Design Brainstorm

## Três Abordagens Estilísticas

### Abordagem 1: "Caderno de Aventuras"
Estética de caderno escolar artesanal com rabiscos, anotações e elementos desenhados à mão. Fundo branco com detalhes em verde, como se os alunos tivessem desenhado o portal em seus cadernos.
**Probabilidade:** 0.07

### Abordagem 2: "Pixel Garden"
Mistura de pixel art retrô com jardinagem — verde natural, pixels quadrados, mas com sensação orgânica e acolhedora. Evoca jogos clássicos de aventura sem ser futurista.
**Probabilidade:** 0.04

### Abordagem 3: "Clube de Jogos Escolar"
Estética de clube/grêmio estudantil: cartazes colados, quadro de avisos, post-its, cores quentes e verdes suaves. Parece um mural físico digitalizado — handcrafted e cheio de personalidade.
**Probabilidade:** 0.09

---

## Abordagem Escolhida: "Caderno de Aventuras" (Abordagem 1)

### Design Movement
Handcrafted Editorial — inspirado em zines escolares, cadernos de RPG e fanzines de jogos dos anos 90. Combina tipografia editorial com elementos desenhados à mão.

### Core Principles
1. **Artesanal e Pessoal** — cada elemento parece ter sido colocado com intenção, não gerado automaticamente
2. **Branco como Tela** — fundo branco limpo com detalhes em verde suave como tinta de caneta
3. **Hierarquia Clara** — títulos grandes e expressivos, corpo de texto legível, espaçamento generoso
4. **Personalidade Escolar** — elementos que remetem ao ambiente de sala de aula e criatividade estudantil

### Color Philosophy
- **Fundo:** Branco puro `#FFFFFF` e off-white `#F9FAFB`
- **Verde Principal:** `#22C55E` (green-500) — vibrante mas não neon
- **Verde Suave:** `#DCFCE7` (green-100) — para fundos de cards e destaques
- **Verde Escuro:** `#15803D` (green-700) — para textos em verde e bordas
- **Cinza Texto:** `#1F2937` (gray-800) — texto principal
- **Cinza Suave:** `#6B7280` (gray-500) — texto secundário
- **Sombras:** `rgba(0,0,0,0.06)` — muito sutis, quase imperceptíveis

### Layout Paradigm
Layout assimétrico com coluna lateral fixa à direita (anúncios) e conteúdo principal à esquerda. Header com logo e navegação. Cards de jogos em grid 2x3. Personagem fixo no canto inferior esquerdo. QR code fixo no canto superior direito.

### Signature Elements
1. **Bordas tracejadas verdes** — como linhas de caderno, usadas em separadores e bordas de cards
2. **Tags/badges arredondados** — pequenas etiquetas verdes para categorias e criadores
3. **Sombras suaves com leve deslocamento** — `box-shadow: 4px 4px 0px rgba(34,197,94,0.15)`

### Interaction Philosophy
Interações físicas e satisfatórias: botões que "afundam" ao clicar (scale 0.97), cards que elevam levemente no hover (translateY -4px), transições suaves de 150-200ms. Nada de animações exageradas.

### Animation
- Entrada de cards: fade-in + slide-up com stagger de 60ms
- Hover em cards: `transform: translateY(-4px)` + sombra mais intensa, 180ms ease-out
- Botões: `scale(0.97)` no active, 150ms
- Personagem: idle.gif parado, troca para talking.gif ao clicar
- Balão de fala: scale de 0.95 → 1 com opacity 0 → 1, 200ms

### Typography System
- **Display/Títulos:** "Fredoka One" — arredondado, amigável, escolar
- **Corpo:** "Nunito" — legível, suave, moderno sem ser genérico
- **Código/Tags:** "Space Mono" — para elementos técnicos e nomes de criadores

### Brand Essence
Portal de jogos criado por alunos, para alunos — onde cada jogo tem uma história e um rosto.
**Personalidade:** Criativo, Acolhedor, Autêntico

### Brand Voice
Direto, entusiasmado e escolar. Celebra os criadores pelo nome.
- "Jogue os games criados pelos seus colegas!"
- "Qual aventura você vai explorar hoje?"

### Wordmark & Logo
Ícone de joystick estilizado com folha de caderno integrada — símbolo de jogo + escola. Verde sobre branco.

### Signature Brand Color
Verde `#22C55E` — verde de destaque, cor principal do portal.
