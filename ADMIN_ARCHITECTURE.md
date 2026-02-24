# Central v2.0 - Arquitectura de Administración

## Descripción General

Central v2.0 ahora incluye un sistema de administración avanzado y modular diseñado para facilitar la gestión centralizada, auditoría, y escalabilidad del sistema.

## Estructura del Sistema

### 1. **Core Modules** (`lib/`)

#### `types.ts` - Definiciones de Tipos
- Tipos para usuarios, roles y permisos (RBAC)
- Estructuras de auditoría y logs
- Modelos de configuración global
- Esquemas de backups y recuperación
- Definiciones de API keys y webhooks
- Tipos de notificaciones y analytics

#### `auth.ts` - Sistema de Autenticación y Autorización
- Gestión de usuarios y roles (5 niveles: SUPER_ADMIN, ADMIN, MANAGER, OPERATOR, VIEWER)
- Control de permisos granulares por recurso
- Métodos para crear, actualizar y gestionar usuarios

**Permisos por Rol:**
- **SUPER_ADMIN**: Acceso total a todos los recursos
- **ADMIN**: Gestión completa de clones, renovaciones, usuarios
- **MANAGER**: Lectura y actualización de clones y renovaciones
- **OPERATOR**: Lectura y ejecución de operaciones
- **VIEWER**: Solo lectura

#### `audit.ts` - Sistema de Auditoría y Logs
- Registro detallado de todas las acciones del sistema
- Filtrado y búsqueda de logs
- Limpieza automática de logs antiguos (configurable)
- Estadísticas de auditoría

#### `config.ts` - Sistema de Configuración Global
- Gestión centralizada de configuraciones del sistema
- Configuración de sonidos
- Persistencia de valores con tipos
- Sin base de datos (localStorage → reemplazar con BD en producción)

#### `backup.ts` - Sistema de Backups y Recuperación
- Creación manual y automática de backups
- Gestión de retención de backups
- Estadísticas de almacenamiento
- Soporte para etiquetas y categorización

#### `api.ts` - Gestión de APIs y Webhooks
- Generación y gestión de API keys
- Registro de webhooks para eventos del sistema
- Validación de claves API
- Logs de ejecución de webhooks

#### `notifications.ts` - Sistema de Notificaciones
- Notificaciones en tiempo real (con suscripción)
- Tipos: INFO, WARNING, ERROR, SUCCESS
- Gestión de notificaciones leídas/no leídas
- Limpieza automática de notificaciones antiguas

#### `analytics.ts` - Sistema de Analytics
- Seguimiento de eventos del sistema
- Estadísticas por usuario y por evento
- Métricas del sistema
- Cálculo de tasas de error

#### `api-routes.ts` - Estructura de Rutas REST API
- Definición de endpoints para integración con terceros
- Formateador de respuestas API
- Rate limiting básico
- Validación de API keys

#### `admin-init.ts` - Inicialización del Sistema
- Setup automático de usuarios por defecto
- Configuración inicial del sistema
- Creación de usuarios de ejemplo

### 2. **Components** (`components/`)

#### `admin-dashboard.tsx` - Dashboard Centralizado
Interfaz principal con 5 secciones:
1. **Overview** - Estadísticas y acciones recientes
2. **Users** - Gestión de usuarios y sus roles
3. **Audit** - Visualización de logs de auditoría con filtros
4. **Backups** - Gestión y estadísticas de backups
5. **Config** - Configuración global del sistema

**Stats Mostrados:**
- Total de usuarios
- Usuarios activos
- Acciones recientes
- Salud del sistema
- Total de backups
- Almacenamiento usado

#### `api-key-manager.tsx` - Gestor de API Keys y Webhooks
- Generación y revocación de API keys
- Registro y gestión de webhooks
- Vista detallada de eventos por webhook

#### `notification-center.tsx` - Centro de Notificaciones
- Bell icon con contador de notificaciones no leídas
- Dropdown con lista de notificaciones
- Marcado como leído individual y en lote
- Eliminación de notificaciones
- Suscripción en tiempo real

### 3. **Pages** (`app/`)

#### `/admin` - Página de Administración
- Acceso centralizado a todas las funciones de admin
- Integración de todos los componentes
- Header con notificaciones y perfil

## Características Principales

### ✅ Implementadas

1. **Panel de Control Centralizado**
   - Dashboard con estadísticas en tiempo real
   - Gráficos de rendimiento del sistema
   - Acceso rápido a todas las funciones

2. **Gestión de Usuarios y Permisos (RBAC)**
   - 5 niveles de rol con permisos específicos
   - Activación/desactivación de usuarios
   - Auditoría de cambios

3. **Sistema de Auditoría Completo**
   - Registro de todas las acciones
   - Filtrado avanzado de logs
   - Historial detallado con cambios

4. **Backups y Recuperación**
   - Backups manuales y automáticos
   - Gestión de retención
   - Estadísticas de almacenamiento

5. **API REST para Terceros**
   - Estructura definida de endpoints
   - Rate limiting
   - Validación de API keys

6. **Sistema de Configuración Global**
   - Centralización de todas las configuraciones
   - Configuración de sonidos
   - Persistencia de valores

7. **Notificaciones en Tiempo Real**
   - Sistema de suscripción
   - 4 tipos de notificaciones
   - Gestión de lecturas

8. **Analytics y Métricas**
   - Seguimiento de eventos
   - Estadísticas por usuario
   - Métricas del sistema

### 🔄 Próximas Integraciones

1. **Base de Datos (Firebase/Supabase)**
   - Reemplazar localStorage con persistencia en BD
   - Sincronización en tiempo real

2. **Autenticación Avanzada**
   - JWT tokens
   - OAuth2 integration
   - MFA support

3. **WebSockets**
   - Actualizaciones en tiempo real
   - Push notifications

4. **Integraciones Externas**
   - Slack
   - Discord
   - Email
   - Webhooks avanzados

5. **Analytics Dashboard Mejorado**
   - Gráficos interactivos
   - Reportes personalizables
   - Exportación de datos

## Modelos de Datos

### Usuario (User)
```typescript
{
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}
```

### Permiso (Permission)
```typescript
{
  resource: PermissionResource;
  actions: PermissionAction[];
}
```

### Log de Auditoría (AuditLog)
```typescript
{
  id: string;
  userId: string;
  action: AuditAction;
  resource: PermissionResource;
  resourceId?: string;
  changes?: { before: any; after: any };
  timestamp: Date;
}
```

### Configuración (SystemConfig)
```typescript
{
  id: string;
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "json";
  updatedAt: Date;
  updatedBy: string;
}
```

## Seguridad

- ✅ RBAC granular
- ✅ Auditoría completa
- ✅ API keys con hash
- ⏳ JWT tokens (próximo)
- ⏳ Rate limiting (básico implementado)
- ⏳ Encriptación de datos sensibles

## Escalabilidad

La arquitectura está diseñada para escalar:
- Módulos desacoplados e independientes
- Fácil integración con base de datos
- API REST definida para terceros
- Sistema de hooks y webhooks
- Soporte para múltiples usuarios

## Uso

### Inicializar Sistema
```typescript
import { AdminSystemContext } from '@/lib/admin-init';

AdminSystemContext.initialize();
AdminSystemContext.createExampleUsers();
```

### Acceder al Dashboard
```
http://localhost:3000/admin
```

### Crear Usuario
```typescript
import { AuthService, UserRole } from '@/lib/auth';

const user = AuthService.createUser('user@example.com', 'Nombre', UserRole.ADMIN);
```

### Registrar Acción
```typescript
import { AuditService } from '@/lib/audit';

AuditService.log(userId, 'CREATE', 'clones', cloneId, changes);
```

### Crear Notificación
```typescript
import { NotificationService } from '@/lib/notifications';

NotificationService.createNotification(
  userId,
  'success',
  'Título',
  'Mensaje'
);
```

## Próximos Pasos

1. Conectar base de datos (Supabase/Firebase)
2. Implementar autenticación real
3. Agregar WebSockets para tiempo real
4. Crear API endpoints reales
5. Dashboard de analytics mejorado
6. Integraciones con servicios externos
