# Retiro CMS

Sistema de gerenciamento de retiro católico com cadastro de participantes, eventos, camisetas, crianças e relatórios.

## Stack

- **Next.js 16** (App Router) — frontend e API
- **TypeScript** + **Tailwind CSS**
- **Banco em memória** (fase 1) — preparado para migração PostgreSQL via padrão Repository
- **Docker** — deploy em container

## Módulos

- **Autenticação** — papéis Admin e Usuário
- **Eventos** — nome, data, ativo/inativo (admin)
- **Participantes** — inscrição, camisetas, crianças, servidor
- **Relatórios** — métricas e exportação CSV
- **Usuários** — gestão de acesso (admin)

### Permissões

| Ação | Admin | Usuário |
|------|-------|---------|
| Gerenciar eventos | Sim | Não |
| Adicionar participantes | Sim | Sim |
| Editar/excluir participantes | Sim | Não |
| Ver relatórios | Sim | Sim |
| Gerenciar usuários | Sim | Não |

## Desenvolvimento local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

**Na rede local (celular/outro PC):** use `http://SEU_IP:3000` (ex: `http://192.168.1.153:3000`). O servidor escuta em todas as interfaces (`0.0.0.0`).

**Credenciais padrão:**
- Email: `admin@retiro.local`
- Senha: `admin123`

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Acesse [http://localhost:3000](http://localhost:3000)

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `SESSION_SECRET` | Chave da sessão (mín. 32 caracteres) |
| `ADMIN_EMAIL` | Email do admin inicial |
| `ADMIN_PASSWORD` | Senha do admin inicial |

## Banco em memória

> **Atenção:** os dados são perdidos ao reiniciar o container ou o servidor de desenvolvimento.

A camada de repositório (`src/lib/repositories/`) está preparada para trocar para PostgreSQL adicionando `DATABASE_URL` e implementando `Postgres*Repository`.

## Estrutura

```
src/
├── app/           # Pages e API routes
├── components/    # UI e formulários
└── lib/
    ├── auth/      # Sessão iron-session
    ├── db/        # Store em memória + seed
    ├── repositories/
    ├── services/
    └── types/
```

## Próximos passos (fase 2)

- PostgreSQL com Drizzle ORM
- Persistência de dados entre reinícios
- Check-in no dia do evento
