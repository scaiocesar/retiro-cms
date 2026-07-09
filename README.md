# Retiro CMS

Sistema de gerenciamento de retiro católico com cadastro de participantes, eventos, camisetas, crianças e relatórios.

## Stack

- **Next.js 16** (App Router) — frontend e API
- **TypeScript** + **Tailwind CSS**
- **PostgreSQL** + **Drizzle ORM**
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

### 1. Subir o PostgreSQL

```bash
docker compose up db -d
```

### 2. Configurar ambiente e rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

As migrations rodam automaticamente na inicialização do servidor.

Acesse [http://localhost:3000](http://localhost:3000)

**Na rede local (celular/outro PC):** use `http://SEU_IP:3000` (ex: `http://192.168.1.153:3000`). O servidor escuta em todas as interfaces (`0.0.0.0`).

**Credenciais padrão:**
- Email: `admin@retiro.local`
- Senha: `admin123`

## Docker (app + banco)

```bash
cp .env.example .env
docker compose up --build
```

Acesse [http://localhost:3000](http://localhost:3000)

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `SESSION_SECRET` | Chave da sessão (mín. 32 caracteres) |
| `ADMIN_EMAIL` | Email do admin inicial |
| `ADMIN_PASSWORD` | Senha do admin inicial |
| `RECREATE_ADMIN_ON_START` | Se `true`, redefine a senha do admin a cada start |

### Scripts do banco

```bash
npm run db:migrate   # aplicar migrations
npm run db:push      # sincronizar schema (dev)
npm run db:studio    # interface visual Drizzle
```

## Estrutura

```
src/
├── app/           # Pages e API routes
├── components/    # UI e formulários
└── lib/
    ├── auth/      # Sessão iron-session
    ├── db/        # Schema, migrations e seed
    ├── repositories/
    ├── services/
    └── types/
drizzle/migrations # SQL migrations
```
