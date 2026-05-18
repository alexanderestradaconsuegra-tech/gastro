# Gastro POS - Guía para Claude Code

Sistema POS para restaurante con menú digital QR, gestión de pedidos en tiempo real y panel de administración.

## Arquitectura

```
gastro/
├── apps/
│   ├── mesa/          # App cliente QR (Next.js, puerto 3000)
│   └── admin/         # App caja/camarero/cocina (Next.js, puerto 3001)
├── supabase/
│   └── migrations/    # SQL migrations (001_schema, 002_seed)
├── n8n/
│   └── workflows/     # Workflows importables en n8n
├── docker-compose.yml
└── .env.example
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Base de datos | Supabase (PostgreSQL 15) |
| Realtime | Supabase Realtime (WebSockets) |
| Auth | Supabase Auth (JWT) |
| Automatización | n8n self-hosted (EasyPanel en VPS) |
| Contenedores | Docker + docker-compose |

## Variables de entorno requeridas

Crear `apps/mesa/.env.local` y `apps/admin/.env.local` copiando `.env.example`:

```bash
cp .env.example apps/mesa/.env.local
cp .env.example apps/admin/.env.local
```

Variables mínimas para desarrollo:
- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clave pública anon
- `N8N_WEBHOOK_BASE_URL` — URL base de n8n (ej: `https://n8n.tu-dominio.com`)

## Comandos de desarrollo

```bash
# Instalar dependencias (desde raíz de cada app)
cd apps/mesa  && npm install
cd apps/admin && npm install

# Desarrollo local
cd apps/mesa  && npm run dev   # http://localhost:3000
cd apps/admin && npm run dev   # http://localhost:3001

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Migraciones Supabase

```bash
# Instalar CLI de Supabase (una vez)
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# Aplicar migraciones en orden
supabase db push

# O ejecutar manualmente en el SQL Editor de Supabase:
# 1. supabase/migrations/001_schema.sql
# 2. supabase/migrations/002_seed.sql
```

Credenciales demo (PIN `1234` hasheado):
- `admin@nido.cl` → rol admin
- `marco@nido.cl` → camarero
- `cocina@nido.cl` → cocina
- `caja@nido.cl` → caja

## Workflows n8n

Importar en orden desde la UI de n8n (Settings > Import Workflow):

| Archivo | Webhook path | Descripción |
|---------|-------------|-------------|
| `01_order_create.json` | `POST /webhook/order-create` | Crea pedido completo |
| `02_camarero_call.json` | `POST /webhook/camarero-call` | Llamada al camarero |
| `03_bill_request.json` | `POST /webhook/bill-request` | Solicitud de cobro |
| `04_feedback.json` | `POST /webhook/feedback` | Reseña del cliente |

Configurar en n8n → Credentials → Environment:
- `SUPABASE_URL` — URL de Supabase
- `SUPABASE_SERVICE_KEY` — service_role key (nunca la anon)

## Docker / EasyPanel

### Build local
```bash
docker-compose up --build
```

### EasyPanel (producción)

Cada app se despliega como servicio independiente en EasyPanel:

1. Crear servicio tipo **App** para `mesa`:
   - Build context: `apps/mesa`
   - Puerto: `3000`
   - Variables de entorno: copiar de `.env.example`

2. Crear servicio tipo **App** para `admin`:
   - Build context: `apps/admin`
   - Puerto: `3001`
   - Variables de entorno: copiar de `.env.example`

3. n8n se despliega como servicio independiente con la imagen oficial `n8nio/n8n`.

Los Dockerfiles usan build multi-stage y usuario non-root (`nextjs:nodejs`) para seguridad.
`output: "standalone"` está habilitado en ambos `next.config.ts`.

## Modelo de datos clave

```
restaurants → tables → sessions → orders → order_items
                     ↘ calls
                     ↘ messages
                     ↘ reviews
```

- **RLS**: `anon` solo puede leer `menu_items` (visible) y `tables` (activas).
- **service_role** bypasea RLS (usar solo en n8n y server-side).
- **Realtime** habilitado en: `orders`, `calls`, `messages`, `tables`.

## Convenciones de código

- IDs de pedidos: `ORD-XXXX` (4 dígitos)
- IDs de calls: `C-XXXXXXXX` (8 chars hex)
- IDs de expenses: `E-XXXXXXXX`
- Precios en pesos CLP (INTEGER, sin decimales)
- Timestamps en TIMESTAMPTZ (UTC)
- Zona horaria del restaurante: `America/Santiago`
