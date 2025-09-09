# Valorant Helper Monorepo

## Requisitos
- Node.js 18+

## Instalação
```bash
npm install
```

## Desenvolvimento
- Backend: Nest (Fastify) em :3000
- Frontend: Vite React em :5173 (proxy /api -> :3000)

```bash
# Em paralelo
npm run dev
```

Ou iniciar separadamente:
```bash
npm run dev:backend
npm run dev:frontend
```

## Endpoints
- GET /agents
- GET /maps
- POST /analyze { map, teamAgents: string[], enemyAgents: string[] }
- POST /suggest { map, picks: string[], teamSize?: number }
- POST /randomize { map?: string }

## Notas
- Base de dados simples em JSON em `packages/backend/src/data`.
- Lógica de pontuação simples para sugestões: preferência de mapa, diversidade de função, sinergias.
