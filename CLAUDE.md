# CLAUDE.md — EL JEFAZO OS (la-central)

Este archivo proporciona orientación para asistentes de IA (y desarrolladores humanos) que trabajen en este repositorio.

---

## Descripción del Proyecto

**EL JEFAZO OS** es una Progressive Web App (PWA) con diseño mobile-first que funciona como panel de control maestro. Gestiona una flota de "clones" (instancias de aplicaciones desplegadas), hace seguimiento de suscripciones y renovaciones, y ofrece una interfaz de comando centralizada — con una estética futurista de neón oscuro.

La app es completamente del lado del cliente. Todo el estado se persiste mediante `localStorage`. No se utilizan rutas de API backend ni conexiones a base de datos en la implementación actual.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Librería UI | React 19 |
| Lenguaje | TypeScript 5 (modo strict) |
| Estilos | Tailwind CSS 4 |
| Animaciones | Framer Motion 12 |
| Notificaciones | React Hot Toast 2 |
| OCR | Tesseract.js 7 |
| Firebase | Firebase 12 + Firebase Admin 13 (instalado, aún no activo) |
| Gestor de paquetes | pnpm (npm también funciona) |

---

## Estructura de Directorios

```
la-central/
├── app/
│   ├── layout.tsx       # Layout raíz: metadatos, config PWA, viewport
│   ├── page.tsx         # Punto de entrada — renderiza <JefazoOS />
│   └── globals.css      # Estilos globales, Tailwind, variables CSS
├── components/
│   └── jefazo-os.tsx    # Aplicación principal (~1.200 líneas, todas las pantallas)
├── public/
│   ├── manifest.json    # Manifiesto PWA (nombre, iconos, tema)
│   ├── bugatti.jpg      # Imagen de fondo de la pantalla de login
│   ├── icon-192.png     # Icono PWA
│   └── icon-512.png     # Icono PWA
├── next.config.ts       # Config de Next.js (mínima, ampliar según necesidad)
├── tsconfig.json        # Config TypeScript (strict, alias de ruta @/*)
├── eslint.config.mjs    # ESLint (reglas Next.js + TypeScript)
└── postcss.config.mjs   # PostCSS con Tailwind
```

---

## Archivo Clave: `components/jefazo-os.tsx`

Este único archivo contiene toda la aplicación. Se organiza de la siguiente manera:

### Interfaces de Datos
- `Renovacion` — elemento de suscripción/renovación (dominio, hosting, claves API, etc.)
- `Clone` — instancia de app desplegada (versión, estado, servidor, ingresos, puntuación)
- `GlobalState` — interruptores maestros (master on/off, mantenimiento, emergencia, autoUpdate)
- `AdminSettings` — teléfono y email de contacto
- `ActivityLog` — evento del sistema con marca de tiempo

### Funciones de Utilidad
| Función | Propósito |
|---|---|
| `LS` | Wrapper de `localStorage` con claves con prefijo (`jz_*`) |
| `semver` | Parsear y comparar cadenas de versión semántica |
| `daysUntil()` | Días restantes hasta una fecha |
| `fmtDate()` / `fmtDT()` | Formateo de fechas (locale español) |
| `calcScore()` | Puntuación de salud del clone (0–100) |
| `renovEstado()` | Estado de renovación: `OK`, `PROXIMO`, `CRITICO`, `VENCIDO`, `SNOOZED` |

### Sistema de Audio (`SFX`)
Sonidos sintetizados mediante la Web Audio API (sin archivos de audio). Claves: `login`, `notify`, `error`, `click`, `alert`, `success`.

### Tema de Color (objeto `T`)
Constantes de color centralizadas:
- Primarios: `#00C8FF` (azul neón), `#3A9FFF` (azul eléctrico)
- Fondos: `#000410` (oscuro), `#0A1628` (tarjeta)
- Estado: `#00FF80` (verde), `#FFA040` (naranja), `#FF4466` (rojo)

### Componentes UI Reutilizables
`NeonBorder`, `Btn`, `Card`, `InputField`, `Toggle`, `Toast`, `Label`, `Badge`, `HudStat`, `ScoreBar`, `Header`, `Screen`, `Modal`, `QuickActions`

### Pantallas de la Aplicación
| Pantalla | Clave de ruta | Descripción |
|---|---|---|
| `LoginScreen` | — | Acceso con efectos metálicos 3D |
| `Ecosystem` | `ecosystem` | Dashboard principal, lista de clones y HUD |
| `CloneCtrl` | `clone` | Controles por clone, métricas y acciones |
| `AddClone` | `addClone` | Formulario para crear un nuevo clone |
| `Marketplace` | `marketplace` | Instalar plantillas de clones predefinidos |
| `CentroMando` | `centroMando` | Interruptores globales, copia de seguridad/importar |
| `Renovaciones` | `renovaciones` | Seguimiento de renovaciones de suscripciones |
| `Comunicaciones` | `comms` | Plantillas de mensajes WhatsApp/email |
| `ShareQR` | `share` | Compartir enlace y código QR |
| `AdminPanel` | `admin` | Métricas agregadas y registro de actividad |
| `InsightsPanel` | `insights` | Recomendaciones automáticas tipo IA |
| `EmergencyScreen` | `emergency` | Acciones de emergencia a nivel de sistema |
| `CriticalAlert` | overlay | Modal de alerta para renovaciones caducadas o críticas |

### Componente Principal (`JefazoOS`)
- Estado único en el nivel superior
- Navegación mediante el string `screen` + `slideDir` para la dirección de animación
- Monitorea renovaciones críticas en cada cambio de estado
- Importa/exporta el estado completo como JSON

---

## Claves de LocalStorage

Todas las claves tienen el prefijo `jz_`:

| Clave | Contenido |
|---|---|
| `jz_clones` | Array de objetos `Clone` |
| `jz_renov` | Array de objetos `Renovacion` |
| `jz_gs` | Objeto `GlobalState` |
| `jz_adminSettings` | Teléfono y email del admin |
| `jz_comms_ph` | Número de WhatsApp (Comunicaciones) |
| `jz_comms_em` | Dirección de email (Comunicaciones) |
| `jz_share_url` | URL de despliegue (ShareQR) |

---

## Flujo de Desarrollo

### Instalación
```bash
pnpm install       # Instalar dependencias
pnpm dev           # Iniciar servidor de desarrollo en http://localhost:3000
```

### Build y Lint
```bash
pnpm build         # Build de producción (genera .next/)
pnpm start         # Servir build de producción
pnpm lint          # Ejecutar ESLint
```

### Sin Tests
Actualmente no hay framework de tests configurado. Si se añaden, se recomienda Vitest (compatible con Next.js y la config TypeScript existente).

---

## Convenciones y Estilo de Código

### TypeScript
- El modo strict está activo. Todos los tipos deben ser explícitos; evitar `any`.
- El alias `@/*` apunta a la raíz del proyecto.
- Target ES2017 — no usar características no soportadas en ese target.

### Patrones de Componentes
- Las pantallas se definen como componentes funcionales de React dentro de `jefazo-os.tsx`.
- Todo el estado interno y la navegación viven en el componente padre `JefazoOS`; las pantallas reciben `state` y `setState` (o una función setter) como props.
- Usar `useCallback` para handlers pasados como props y `useMemo` para valores derivados o calculados.

### Estilos
- Las clases de utilidad de Tailwind CSS son el mecanismo principal de estilo.
- El objeto de constantes `T` se usa para todos los estilos inline dinámicos (bordes, efectos glow, etc.).
- Los efectos de brillo neón se aplican mediante estilos inline `boxShadow`.
- Los insets de área segura (`env(safe-area-inset-*)`) se usan para soporte de notch/barra de inicio en móvil.
- Variables CSS en `globals.css`: `--background` (`#000410`), `--foreground` (`#E0F4FF`).

### Idioma
- Todo el texto de la interfaz, etiquetas y mensajes está en **español**.
- Mantener cualquier nuevo texto visible al usuario en español para ser coherente con la app.

### Audio
- Usar `SFX.<clave>()` para reproducir sonidos. Nunca importar archivos de audio.
- Siempre envolver las llamadas a `SFX` en try/catch — la Web Audio API puede lanzar errores en algunos navegadores.

### Notificaciones
- Usar `react-hot-toast` (`toast.success`, `toast.error`) para feedback transitorio.
- Usar `PushNotif.send()` para notificaciones push en segundo plano (requiere permiso del navegador).

---

## Configuración PWA

- Manifiesto en `public/manifest.json`: nombre de la app, iconos, color de tema `#000410`, display `standalone`.
- Metaetiquetas en `app/layout.tsx` para soporte de modo standalone en iOS (`apple-mobile-web-app-capable`).
- El viewport está bloqueado (sin escalado del usuario) — no cambiar esto sin considerar la UX en móvil.

---

## Integraciones Externas

| Servicio | Uso |
|---|---|
| QR Server | `https://api.qrserver.com/v1/create-qr-code/` — renderizado como `<img>` |
| WhatsApp | Links `https://wa.me/<numero>?text=<msg>` |
| Telegram | Links `https://t.me/share/url?url=...` |
| Email | Links con protocolo `mailto:` |
| Firebase | Instalado pero aún no conectado a las pantallas activas |

---

## Notas de Seguridad (Importante)

- Existen **credenciales hardcodeadas** en `LoginScreen` (`"EL JEFAZO"` / `"berzosa15031980"`). Son solo para demo y **deben reemplazarse** antes de cualquier despliegue real.
- Todos los datos de la aplicación se guardan en `localStorage` (lado del cliente, sin cifrar). No almacenar secretos genuinamente sensibles aquí.
- Las credenciales de Firebase (cuando se añadan) deben guardarse en variables de entorno (`.env.local`), nunca en el control de versiones.

---

## Firebase (Uso Futuro)

Los paquetes de Firebase están instalados (`firebase`, `firebase-admin`). Al integrar:
- Guardar la config en `.env.local` (Next.js lo carga automáticamente, nunca se commitea)
- Usar rutas de API de Next.js (`app/api/`) para llamadas al SDK de administrador
- El SDK de cliente puede inicializarse en un archivo utilitario `lib/firebase.ts`

---

## Despliegue

La app es un proyecto Next.js estándar y puede desplegarse en:
- **Vercel** (recomendado — configuración cero)
- **Netlify** (exportación estática o SSR)
- **Cualquier host Node.js** mediante `pnpm build && pnpm start`

No se requieren variables de entorno para la implementación actual. Cuando se añadan Firebase u otros servicios, documentar las variables necesarias en un archivo `.env.example`.

---

## Flujo de Git

- La rama estable principal es `master`.
- Las ramas de funcionalidades siguen el patrón `claude/<descripción>-<session-id>` para trabajo asistido por IA.
- Los mensajes de commit usan el estilo convencional: `feat:`, `fix:`, `chore:`, `refactor:`.
