# UI Architecture

This folder contains the new UI implementation following the recommended Electron architecture pattern.

## Architecture Overview

**Architecture A: "Local backend" in the Electron main process**

### Components

1. **Renderer (UI)**: TanStack Router + TanStack Query
   - Located in `src/ui/`
   - Uses React with TypeScript
   - TanStack Router for routing
   - TanStack Query for data fetching and caching
   - oRPC client for type-safe API calls

2. **Main Process (Local API)**: oRPC procedures
   - Located in `src/electron/orpc/`
   - Handles all business logic
   - Manages database access
   - Exposes procedures via IPC

3. **Database**: SQLite (better-sqlite3)
   - Located in `src/electron/db/`
   - WAL mode enabled for better concurrency
   - Only accessible from main process

4. **Transport**: Electron IPC
   - `ipcRenderer.invoke` ↔ `ipcMain.handle`
   - Custom oRPC transport in `src/ui/lib/orpc/ipc-transport.ts`

## Folder Structure

```
src/ui/
├── main.tsx                 # Entry point
├── index.css               # Global styles
├── lib/
│   ├── router.tsx          # TanStack Router setup
│   ├── query-client.ts     # TanStack Query client
│   └── orpc/
│       ├── client.ts       # oRPC client instance
│       └── ipc-transport.ts # IPC transport for oRPC
├── routes/                 # TanStack Router routes
│   ├── __root.tsx
│   └── index.tsx
├── components/             # React components
├── hooks/                  # Custom hooks (TanStack Query hooks)
└── README.md

src/electron/
├── orpc/
│   ├── router.ts           # Main oRPC router
│   ├── server.ts           # oRPC server setup (IPC handler)
│   ├── routers/            # Individual procedure routers
│   └── services/           # Business logic layer
└── db/
    ├── database.ts         # SQLite setup
    └── repositories/       # Data access layer
```

## Data Flow

```
UI Component
  ↓
TanStack Query Hook (useQuery/useMutation)
  ↓
oRPC Client (orpcClient.example.hello())
  ↓
IPC Transport (window.electronAPI.invoke('orpc:invoke', ...))
  ↓
Electron IPC (ipcRenderer.invoke ↔ ipcMain.handle)
  ↓
oRPC Server (router handler)
  ↓
Service Layer (business logic)
  ↓
Repository Layer (database queries)
  ↓
SQLite Database
  ↓
Result flows back up the chain
```

## Usage Example

### Creating a Query Hook

```typescript
// src/ui/hooks/useExampleQuery.ts
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '../lib/orpc/client';

export function useExampleHello(name?: string) {
  return useQuery({
    queryKey: ['example', 'hello', name],
    queryFn: async () => {
      return await orpcClient.example.hello({ name });
    },
  });
}
```

### Using in a Component

```typescript
// src/ui/components/ExampleComponent.tsx
import { useExampleHello } from '../hooks/useExampleQuery';

export function ExampleComponent() {
  const { data, isLoading } = useExampleHello('World');
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{data?.message}</div>;
}
```

### Creating an oRPC Procedure

```typescript
// src/electron/orpc/routers/example.router.ts
import { procedure, router } from '@orpc/server';
import { z } from 'zod';

export const exampleRouter = router({
  hello: procedure
    .input(z.object({ name: z.string().optional() }))
    .handler(async ({ input }) => {
      return { message: `Hello, ${input.name || 'World'}!` };
    }),
});
```

## Development

### Running the UI

The UI runs on a separate Vite dev server (port 3001):

```bash
npm run dev:ui
```

### Building

```bash
npm run build:ui
```

## Key Benefits

1. **Security**: Renderer can't access filesystem/DB directly
2. **Type Safety**: Full TypeScript support with oRPC
3. **Familiar**: Works like a web client/server, but all local
4. **Testable**: Procedures are pure functions around a DB layer
5. **Offline-First**: SQLite works perfectly offline

## Next Steps

1. Add your domain-specific routers in `src/electron/orpc/routers/`
2. Create services in `src/electron/orpc/services/`
3. Set up repositories in `src/electron/db/repositories/`
4. Create TanStack Query hooks in `src/ui/hooks/`
5. Build components in `src/ui/components/`

