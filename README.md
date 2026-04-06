# Piper UI

Next.js frontend for the Piper coding assistant.

## Requirements

- Node.js 18+
- pnpm

## Setup

```bash
# Install dependencies
pnpm install

# Copy env file and fill in values
cp env.example .env.local
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `API_BASE_URL` | Upstream Python API URL (server-side) | `http://localhost:8000` |
| `NEXT_PUBLIC_API_BASE_URL` | Next.js API route prefix (client-side) | `/api` |

## Dev

```bash
pnpm dev
```

Runs on [http://localhost:3000](http://localhost:3000).

## Build

```bash
pnpm build
pnpm start
```
