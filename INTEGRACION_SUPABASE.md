# Integración Supabase - EL JEFAZO OS v5.1.0+

## 📊 Tablas Creadas en Supabase

```sql
-- messages: Mensajería entre clones
-- reports: Sistema de generación de reportes
-- instance_configs: Configuración por instancia
-- clone_updates: Tracking de actualizaciones de clones
```

### Características:
- ✅ RLS (Row Level Security) habilitado en todas
- ✅ Timestamps automáticos
- ✅ Real-time subscriptions configuradas

---

## 🔌 API Routes Creadas

### 1. `/api/messages` (GET, POST, PATCH)
**Funcionalidad:**
- GET: Obtener mensajes para un clon
- POST: Enviar mensaje entre clones
- PATCH: Marcar mensaje como leído

**Payload POST:**
```json
{
  "from_clone_id": "clone-1",
  "to_clone_id": "clone-2",
  "from_instance_id": "master",
  "to_instance_id": "master",
  "subject": "Tema",
  "body": "Contenido del mensaje"
}
```

### 2. `/api/reports` (GET, POST, DELETE)
**Funcionalidad:**
- GET: Obtener reportes de un clon o tipo
- POST: Generar nuevo reporte
- DELETE: Eliminar reporte

**Payload POST:**
```json
{
  "clone_id": "clone-1",
  "instance_id": "master",
  "report_type": "daily|weekly|monthly|custom",
  "title": "Nombre del reporte",
  "data": { "métricas": "aquí" }
}
```

### 3. `/api/config` (GET, POST)
**Funcionalidad:**
- GET: Obtener configuración de instancia
- POST: Guardar/actualizar configuración

**Payload POST:**
```json
{
  "instance_id": "master",
  "config_key": "api_url",
  "config_value": "https://api.ejemplo.com"
}
```

### 4. `/api/updates` (GET, POST, PATCH)
**Funcionalidad:**
- GET: Obtener historial de updates para un clon
- POST: Iniciar nuevo update/despliegue
- PATCH: Actualizar progreso de despliegue

**Payload POST:**
```json
{
  "clone_id": "clone-1",
  "instance_id": "master",
  "version": "v1.2.3"
}
```

---

## 🎛️ Componentes Nuevos

### 1. AdminPanelComplete (`/components/admin-panel-complete.tsx`)
**Panel administrativo completo con 6 tabs:**

#### 📊 RESUMEN (Overview)
- Selector de instancia actual
- Lista de clones en instancia
- Acciones globales (sincronizar, deploy a todos)

#### ⚙️ MI CONFIGURACIÓN (config-local)
- Crear/editar configuraciones locales
- Ver todas las configuraciones guardadas
- Aplica solo a instancia seleccionada

#### 🌐 FILIALES (config-filiales)
- Ver todas las instancias conectadas
- Estado en tiempo real (ONLINE/OFFLINE)
- Sincronizar cada filial
- Actualizar cada filial independientemente

#### 💬 MENSAJES (messaging)
- Enviar mensajes a clones específicos
- Recibir mensajes en real-time (Supabase Realtime)
- Historial de mensajes
- Marcar como leído

#### 📈 REPORTES (reports)
- Generar reportes (daily, weekly, monthly, custom)
- Descargar como CSV
- Historial de reportes
- Datos con métricas automáticas

#### 🚀 ACTUALIZACIONES (updates)
- Despliegue de nuevas versiones
- Progreso de instalación en tiempo real
- Historial de updates
- Simulación de progreso

---

## 🌟 Características Clave

### Real-time Subscriptions
```typescript
// Cada vez que llega un mensaje, se actualiza automáticamente
subscribeToMessages(cloneId, (msg) => {
  console.log('Nuevo mensaje:', msg)
})

// Cada vez que hay un update, se notifica en tiempo real
subscribeToUpdates(cloneId, (upd) => {
  console.log('Actualización:', upd)
})
```

### Broadcast a Todos los Clones
```typescript
// Enviar mensaje a todos los clones
broadcastToClones('Mensaje para todos')

// Deploy a todos los clones
deployToAllClones()
```

### Configuración por Instancia
- Cada instancia tiene su propia configuración
- Cambios independientes sin afectar otras filiales
- Actualización inmediata

---

## 🚀 Cómo Usar

### 1. Acceder a Admin+
En ECOSISTEMA → Presionar botón "🔧 ADMIN+"

### 2. Navegar tabs
- **RESUMEN**: Ver estado general
- **MI CONFIG**: Configurar la instancia actual
- **FILIALES**: Gestionar otras instancias
- **MENSAJES**: Comunicarse con clones
- **REPORTES**: Generar análisis
- **UPDATES**: Desplegar nuevas versiones

### 3. Enviar Mensaje
1. Tab "MENSAJES"
2. Seleccionar clon destino
3. Asunto y contenido
4. Enviar
5. El clon recibe en tiempo real

### 4. Generar Reporte
1. Tab "REPORTES"
2. Título + Tipo (daily/weekly/monthly)
3. Generar
4. Descargar como CSV

### 5. Desplegar Versión
1. Tab "UPDATES"
2. Versión (ej: v1.2.3)
3. Iniciar deploy
4. Ver progreso en tiempo real
5. Confirmar cuando llegue al 100%

---

## 📋 Estado de Implementación

| Característica | Status | Notas |
|---|---|---|
| Tablas Supabase | ✅ Completo | 4 tablas con RLS |
| API Routes | ✅ Completo | 4 rutas REST |
| Mensajería Real-time | ✅ Completo | Supabase Realtime |
| AdminPanel | ✅ Completo | 6 tabs funcionales |
| Reportes | ✅ Completo | CSV descargable |
| Updates/Deploy | ✅ Completo | Progress tracking |
| Multi-instancia | ✅ Completo | Config independientes |

---

## 🔒 Seguridad

- ✅ RLS habilitado (solo acceso a datos propios)
- ✅ Variables de entorno protegidas
- ✅ Validación en servidor
- ✅ Timestamps auditables

---

## 💡 Próximas Mejoras

- [ ] Exportar reportes a PDF
- [ ] Notificaciones push en tiempo real
- [ ] Webhooks para eventos
- [ ] Encriptación de mensajes
- [ ] Analytics avanzado
- [ ] Rollback de updates automático

---

## 📞 Troubleshooting

**Error: "No se puede conectar a Supabase"**
- Verificar variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

**Los mensajes no llegan en tiempo real**
- Verificar que Realtime esté habilitado en Supabase
- Revisar la conexión del cliente

**Los reportes se descarga vacío**
- Verificar que los datos estén siendo generados correctamente
- Revisar la consola para errores

---

Documentación actualizada v5.1.0 | Enero 2025
