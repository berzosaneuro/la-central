# Guía de Integración - El Jefazo OS

## 🎯 Próximas Pasos para Conectar Servicios

Este documento proporciona un roadmap claro para conectar todas las integraciones que requiere el sistema.

## 1. Base de Datos (PRIORITARIO)

### Opción A: Supabase (Recomendado)

**Ventajas:**
- PostgreSQL real
- Autenticación integrada
- Row Level Security (RLS)
- Tiempo real con Realtime
- API REST automática

**Pasos:**
1. Crear proyecto en supabase.com
2. Copiar credenciales a `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

3. Crear tablas:
```sql
-- Tabla de usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'viewer',
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de auditoría
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT,
  resource TEXT,
  resource_id TEXT,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de configuración
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  value JSONB,
  type TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Tabla de backups
CREATE TABLE backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  data JSONB,
  size INTEGER,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de API keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT,
  key_hash TEXT,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  url TEXT,
  events JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

4. Actualizar servicios para usar Supabase:
```typescript
// lib/auth-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUsersFromDB() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}
```

### Opción B: Firebase

**Ventajas:**
- Setup rápido
- Escalabilidad automática
- Integración con Auth
- No servidor

**Pasos similares:** Ver documentación de Firebase

### Opción C: Neon (PostgreSQL sin servidor)

**Ventajas:**
- PostgreSQL serverless
- Scales on demand
- Backup automático

## 2. Autenticación

### Con Supabase Auth
```typescript
// lib/auth-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}
```

### Con NextAuth.js (Alternativa)
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate against database
        const user = await validateUser(credentials);
        return user;
      },
    }),
  ],
};

export const handler = NextAuth(authOptions);
```

## 3. WebSockets (Tiempo Real)

### Con Supabase Realtime
```typescript
// hooks/useRealtimeNotifications.ts
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useRealtimeNotifications(userId: string) {
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('New notification:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
```

### Con Socket.io
```typescript
// lib/socket.ts
import io from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL);

// hooks/useSocket.ts
export function useSocketConnection() {
  useEffect(() => {
    socket.on('notification', (data) => {
      console.log('Received notification:', data);
    });

    return () => {
      socket.off('notification');
    };
  }, []);
}
```

## 4. APIs REST Reales

### Crear API routes en Next.js

```typescript
// app/api/v1/clones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-routes';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('Authorization')?.split(' ')[1];

  if (!apiKey || !validateApiKey(apiKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.from('clones').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('Authorization')?.split(' ')[1];

  if (!apiKey || !validateApiKey(apiKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('clones')
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
}
```

## 5. Integraciones Externas

### Slack Integration
```typescript
// lib/slack.ts
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function notifySlack(channel: string, message: string) {
  try {
    await slack.chat.postMessage({
      channel,
      text: message,
    });
  } catch (error) {
    console.error('Slack notification failed:', error);
  }
}
```

### Discord Integration
```typescript
// lib/discord.ts
import { EmbedBuilder, WebhookClient } from 'discord.js';

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL!,
});

export async function notifyDiscord(title: string, message: string) {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(title)
    .setDescription(message);

  await webhookClient.send({ embeds: [embed] });
}
```

### Email Integration
```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}
```

## 6. Analytics Dashboard

### Con Vercel Analytics
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Con Plotly o Recharts
```typescript
// components/analytics-dashboard.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export function AnalyticsDashboard({ data }: { data: any[] }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
    </LineChart>
  );
}
```

## 📋 Checklist de Integración

### Fase 1: Base de Datos ✅ PRIORITARIO
- [ ] Elegir proveedor (recomendado: Supabase)
- [ ] Crear proyecto y credenciales
- [ ] Crear tablas SQL
- [ ] Reemplazar in-memory stores con BD
- [ ] Implementar migrations

### Fase 2: Autenticación
- [ ] Conectar auth provider
- [ ] Crear login/signup pages
- [ ] Implementar session management
- [ ] Agregar MFA (opcional)

### Fase 3: Tiempo Real
- [ ] Setup WebSockets
- [ ] Actualizar componentes para usar realtime
- [ ] Implementar push notifications

### Fase 4: APIs REST
- [ ] Crear API routes
- [ ] Implementar rate limiting real
- [ ] Documentar endpoints
- [ ] Crear SDK para clientes

### Fase 5: Integraciones Externas
- [ ] Slack
- [ ] Discord
- [ ] Email
- [ ] Otros servicios

### Fase 6: Analytics
- [ ] Dashboard mejorado
- [ ] Reportes personalizables
- [ ] Exportación de datos

## 🚀 Para Empezar Rápido

1. **Copia este template para Supabase:**
```bash
npx create-next-app@latest --ts --tailwind --eslint
npm install @supabase/supabase-js
```

2. **Configura variables de entorno**
3. **Reemplaza los servicios en `lib/`**
4. **Prueba la integración**

## 📚 Recursos Útiles

- [Supabase Docs](https://supabase.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Vercel KV (Redis)](https://vercel.com/docs/storage/vercel-kv)

## ❓ Preguntas?

Consulta `ADMIN_ARCHITECTURE.md` para más detalles sobre la estructura del sistema.
