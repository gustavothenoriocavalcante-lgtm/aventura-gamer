// Games data for AVENTURA GAMER portal
// Design: "Caderno de Aventuras" — 6 student-created games

export interface Game {
  id: string;
  title: string;
  creator: string;
  url: string;
  image: string; // placeholder — user should replace with actual game images
  description: string;
  color: string; // accent color for card
}

// Avatar URLs (generated)
export const AVATARS = [
  {
    index: 1,
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar1-aZsFtVQBPFrDYdtUVzEMQV.webp",
    label: "Tartaruga",
  },
  {
    index: 2,
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar2-Wmb9ZRrc2GJvmijeVnJ9zd.webp",
    label: "Carta",
  },
  {
    index: 3,
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar3-fVefRsDRQRCZ7RvnKEvMbE.webp",
    label: "Parkour",
  },
  {
    index: 4,
    url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/avatar4-47vrdxdTBCq5HjPYT8KQwH.webp",
    label: "Ninja",
  },
];

export const GAMES: Game[] = [
  {
    id: "game1",
    title: "Jogo da Tartaruga",
    creator: "Guilherme",
    url: "https://merry-treacle-727dc3.netlify.app",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/game-turtle-Wzqx4gbFx4Mqm4STkeisWW.webp",
    description: "Guie a tartaruga por obstáculos neste jogo de aventura criado pelo Guilherme!",
    color: "#16a34a",
  },
  {
    id: "game2",
    title: "Jogo das Cartas",
    creator: "Diego",
    url: "https://chimerical-shortbread-6ee684.netlify.app",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/game-cards-n4WpfPnMmy2YofnfaNHKsK.webp",
    description: "Teste sua memória e estratégia neste jogo de cartas criado pelo Diego!",
    color: "#dc2626",
  },
  {
    id: "game3",
    title: "Jogo do Parkour",
    creator: "Eduardo",
    url: "https://rococo-frangollo-06f594.netlify.app",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/game-parkour-NViBjojwpY85JdhQ48qmwW.webp",
    description: "Salte e corra pelos obstáculos neste jogo de parkour criado pelo Eduardo!",
    color: "#2563eb",
  },
  {
    id: "game4",
    title: "Jogo do Ninja",
    creator: "Giovanna",
    url: "https://stalwart-begonia-cb3516.netlify.app",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/game-ninja-bucSkANNNRWjPj5JKgWDDP.webp",
    description: "Seja o ninja mais ágil neste desafio criado pela Giovanna!",
    color: "#7c3aed",
  },
  {
    id: "game5",
    title: "Jogo do Cubo",
    creator: "Yohan",
    url: "https://coruscating-biscuit-1ff3af.netlify.app",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/game-cubo-mWJxpEVrALb9tnP7cgxhrt.webp",
    description: "Resolva os puzzles de cubo neste desafio criado pelo Yohan!",
    color: "#d97706",
  },
  {
    id: "game6",
    title: "Jogo da Branca de Neve",
    creator: "Gabriela",
    url: "https://mellow-pithivier-0a980d.netlify.app/",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663768359059/PFNdfEZkt4rFciRAiuHLFa/game-snowwhite-gw3LH9JcvEJHPzszJJSa2K.webp",
    description: "Viva a aventura da Branca de Neve neste jogo criado pela Gabriela!",
    color: "#db2777",
  },
];

// Chatbot knowledge base
export const CHATBOT_CONTEXT = `
Você é o Aventureiro, o assistente do portal AVENTURA GAMER — um portal escolar de jogos criados por alunos.

SOBRE O PORTAL:
- O AVENTURA GAMER é um portal escolar onde alunos podem jogar games criados por seus colegas de turma.
- O objetivo é valorizar a criatividade dos estudantes e criar uma comunidade de jogadores.

JOGOS DISPONÍVEIS:
1. Jogo da Tartaruga — criado por Guilherme. Um jogo de aventura onde você guia uma tartaruga por obstáculos.
2. Jogo das Cartas — criado por Diego. Um jogo de cartas que testa memória e estratégia.
3. Jogo do Parkour — criado por Eduardo. Um jogo de plataforma com corrida e saltos.
4. Jogo do Ninja — criado por Giovanna. Um jogo de ação com um ninja ágil.
5. Jogo do Cubo — criado por Yohan. Um puzzle de cubo desafiador.
6. Jogo da Branca de Neve — criado por Gabriela. Uma aventura baseada no conto da Branca de Neve.

NAVEGAÇÃO:
- Página principal: cards dos jogos com botão "Jogar"
- Fórum: comunidade online para discussão, dicas e conversas
- Perfil: crie seu perfil de jogador com nome e avatar
- Admin: painel de administração (apenas para administradores)

Responda sempre em português brasileiro, de forma amigável e entusiasmada, como um NPC de jogo de aventura!
`;
