// ============ EJEMPLOS DE USO PRÁCTICO ============

// EJEMPLO 1: Crear Usuario y Registrar en Auditoría
import { AuthService, UserRole } from '@/lib/auth';
import { AuditService, AuditAction } from '@/lib/audit';

export function exampleCreateUser() {
  const currentUserId = 'user_123'; // Current admin user

  // Crear nuevo usuario
  const newUser = AuthService.createUser(
    'newuser@company.com',
    'Juan Pérez',
    UserRole.MANAGER
  );

  // Registrar en auditoría
  AuditService.log(
    currentUserId,
    AuditAction.CREATE,
    'users',
    newUser.id,
    { before: null, after: newUser }
  );

  console.log('Usuario creado:', newUser);
}

// ============ EJEMPLO 2: Crear Backup y Notificar ============
import { BackupService } from '@/lib/backup';
import { NotificationService, NotificationType } from '@/lib/notifications';

export function exampleCreateBackup(userId: string) {
  const backupData = {
    clones: [],
    renovaciones: [],
    sounds: [],
    settings: [],
    version: '2.0.0',
  };

  // Crear backup
  const backup = BackupService.createBackup(
    backupData,
    `Backup ${new Date().toLocaleString()}`,
    userId,
    'Backup automático del sistema',
    true, // isAutomatic
    ['auto', 'sistema']
  );

  // Registrar auditoría
  AuditService.log(
    userId,
    AuditAction.BACKUP_EXPORT,
    'backups',
    backup.id
  );

  // Notificar al usuario
  NotificationService.createNotification(
    userId,
    NotificationType.SUCCESS,
    'Backup Completado',
    `Backup de ${(backup.size / 1024).toFixed(2)} KB creado exitosamente`,
    { backupId: backup.id, size: backup.size }
  );
}

// ============ EJEMPLO 3: Gestionar API Keys ============
import { ApiService } from '@/lib/api';

export function exampleApiKeyManagement(userId: string) {
  const user = AuthService.getUser(userId);
  if (!user) return;

  // Generar nueva API key
  const apiKey = ApiService.generateApiKey(
    'Integration API Key',
    userId,
    user.permissions
  );

  console.log('Nueva API Key (guarda esto en un lugar seguro):', apiKey.key);

  // Registrar en auditoría
  AuditService.log(
    userId,
    AuditAction.CREATE,
    'api_keys',
    apiKey.id
  );

  // Más tarde, revocar la key
  ApiService.revokeApiKey(apiKey.id);

  AuditService.log(
    userId,
    AuditAction.UPDATE,
    'api_keys',
    apiKey.id,
    { before: { isActive: true }, after: { isActive: false } }
  );
}

// ============ EJEMPLO 4: Registrar Webhook ============
import { WebhookService, WebhookEvent } from '@/lib/api';

export function exampleWebhookSetup(userId: string) {
  const webhook = WebhookService.registerWebhook(
    'https://external-api.com/webhooks/clones',
    [
      WebhookEvent.CLONE_CREATED,
      WebhookEvent.CLONE_UPDATED,
      WebhookEvent.CLONE_DELETED,
    ],
    userId
  );

  console.log('Webhook registrado:', webhook.id);

  AuditService.log(
    userId,
    AuditAction.CREATE,
    'webhooks',
    webhook.id,
    { before: null, after: webhook }
  );

  // Disparar evento de webhook (cuando se cree un clone)
  WebhookService.triggerWebhook(webhook.id, WebhookEvent.CLONE_CREATED, {
    cloneId: 'clone_123',
    name: 'Clone de Prueba',
    createdAt: new Date(),
  });
}

// ============ EJEMPLO 5: Usar Configuración Global ============
import { ConfigService } from '@/lib/config';

export function exampleConfigManagement() {
  // Obtener configuración
  const theme = ConfigService.getConfigValue('theme_mode', 'dark');
  const backupInterval = ConfigService.getConfigValue('auto_backup_interval_hours', 24);

  console.log('Tema:', theme);
  console.log('Intervalo de backup:', backupInterval, 'horas');

  // Actualizar configuración
  ConfigService.setConfig(
    'auto_backup_interval_hours',
    12,
    'number',
    'admin_user_id',
    'Intervalo de backup automático'
  );

  // Obtener todas las configuraciones
  const allConfigs = ConfigService.getAllConfigs();
  console.log('Configuraciones del sistema:', allConfigs);
}

// ============ EJEMPLO 6: Querying de Auditoría ============
export function exampleAuditQueries() {
  // Obtener todos los logs
  const allLogs = AuditService.getLogs();

  // Obtener logs de un usuario específico
  const userLogs = AuditService.getLogs({
    userId: 'user_123',
    limit: 50,
  });

  // Obtener logs de una acción específica
  const createLogs = AuditService.getLogs({
    action: AuditAction.CREATE,
    resource: 'users',
    limit: 100,
  });

  // Obtener logs en un rango de fechas
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Últimos 7 días

  const recentLogs = AuditService.getLogs({
    startDate,
    endDate: new Date(),
    limit: 1000,
  });

  // Obtener resumen de auditoría
  const summary = AuditService.getLogsSummary();
  console.log('Total de logs:', summary.totalLogs);
  console.log('Logs por acción:', summary.logsByAction);
  console.log('Logs por recurso:', summary.logsByResource);
}

// ============ EJEMPLO 7: Gestión de Notificaciones ============
export function exampleNotificationHandling(userId: string) {
  // Crear diferentes tipos de notificaciones
  NotificationService.createNotification(
    userId,
    NotificationType.INFO,
    'Información',
    'Este es un mensaje informativo'
  );

  NotificationService.createNotification(
    userId,
    NotificationType.SUCCESS,
    'Éxito',
    'La operación se completó correctamente'
  );

  NotificationService.createNotification(
    userId,
    NotificationType.WARNING,
    'Advertencia',
    'Deberías revisar esto'
  );

  NotificationService.createNotification(
    userId,
    NotificationType.ERROR,
    'Error',
    'Algo salió mal'
  );

  // Obtener notificaciones
  const allNotifications = NotificationService.getNotifications(userId);
  const unreadNotifications = NotificationService.getNotifications(userId, true);

  console.log('Total:', allNotifications.length);
  console.log('No leídas:', unreadNotifications.length);

  // Marcar como leído
  if (allNotifications.length > 0) {
    NotificationService.markAsRead(userId, allNotifications[0].id);
  }

  // Obtener cantidad no leída
  const unreadCount = NotificationService.getUnreadCount(userId);
  console.log('Notificaciones no leídas:', unreadCount);
}

// ============ EJEMPLO 8: Analytics ============
import { AnalyticsService } from '@/lib/analytics';

export function exampleAnalytics(userId: string) {
  // Registrar eventos
  AnalyticsService.trackEvent('clone_created', userId, {
    cloneName: 'Mi Clone',
    cloneSize: 1024,
  });

  AnalyticsService.trackEvent('user_login', userId);

  AnalyticsService.trackEvent('backup_started', userId);

  // Obtener estadísticas
  const stats = AnalyticsService.getEventStats();
  console.log('Eventos del sistema:', stats);

  // Estadísticas de usuario
  const userStats = AnalyticsService.getUserStats(userId);
  console.log('Primer acceso:', userStats.firstSeen);
  console.log('Último acceso:', userStats.lastSeen);
  console.log('Eventos por tipo:', userStats.eventTypes);

  // Métricas del sistema
  const metrics = AnalyticsService.getSystemMetrics();
  console.log('Usuarios activos:', metrics.activeUsers);
  console.log('Tasa de error:', metrics.errorRate, '%');
}

// ============ EJEMPLO 9: Suscripción Real-Time a Notificaciones ============
export function exampleRealtimeSubscription(userId: string) {
  // Suscribirse a nuevas notificaciones (en un componente React)
  const unsubscribe = NotificationService.subscribe(userId, (notification) => {
    console.log('Nueva notificación en tiempo real:', notification);
    
    // Aquí puedes:
    // - Mostrar toast
    // - Reproducir sonido
    // - Actualizar UI
    // - Enviar a Slack/Discord
  });

  // Más tarde, desuscribirse
  // unsubscribe();
}

// ============ EJEMPLO 10: Control de Permisos ============
export function examplePermissionChecking() {
  const user = AuthService.getUser('user_123');
  if (!user) return;

  // Verificar permiso específico
  const canCreateClones = AuthService.hasPermission(
    user,
    'clones',
    'create'
  );

  if (canCreateClones) {
    console.log('Usuario puede crear clones');
  }

  // Verificar cualquiera de varios permisos
  const canManageClones = AuthService.hasAnyPermission(
    user,
    'clones',
    ['create', 'update', 'delete']
  );

  if (canManageClones) {
    console.log('Usuario puede manejar clones');
  }

  // Ver permisos del usuario
  console.log('Permisos del usuario:', user.permissions);
}

// ============ EJEMPLO 11: Sistema de Roles ============
export function exampleRoleManagement(userId: string, targetUserId: string) {
  const admin = AuthService.getUser(userId);
  const targetUser = AuthService.getUser(targetUserId);

  if (!admin || !targetUser) return;

  console.log('Rol actual:', targetUser.role);

  // Cambiar rol
  const updated = AuthService.updateUserRole(targetUserId, UserRole.ADMIN);

  if (updated) {
    AuditService.log(
      userId,
      AuditAction.UPDATE,
      'users',
      targetUserId,
      {
        before: { role: targetUser.role },
        after: { role: updated.role },
      }
    );

    console.log('Nuevo rol:', updated.role);
  }
}

// ============ EJEMPLO 12: Cleanup y Mantenimiento ============
export function exampleMaintenance() {
  // Limpiar logs antiguos (más de 90 días)
  const deletedLogs = AuditService.clearOldLogs(90);
  console.log('Logs eliminados:', deletedLogs);

  // Limpiar backups antiguos
  const deletedBackups = BackupService.deleteOldBackups(30);
  console.log('Backups eliminados:', deletedBackups);

  // Limpiar notificaciones antiguas
  const deletedNotifications = NotificationService.clearOldNotifications('user_123', 30);
  console.log('Notificaciones eliminadas:', deletedNotifications);

  // Limpiar eventos de analytics
  const deletedEvents = AnalyticsService.clearOldEvents(90);
  console.log('Eventos analytics eliminados:', deletedEvents);

  // Estadísticas de backups
  const stats = BackupService.getBackupStats();
  console.log('Estadísticas de backups:', stats);
}

// ============ EJEMPLO 13: Usar en React Component ============
import { useState, useEffect } from 'react';

export function ExampleComponent() {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Cargar usuarios
    setUsers(AuthService.getAllUsers());

    // Cargar notificaciones del usuario actual
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setNotifications(NotificationService.getNotifications(currentUser.id));

      // Suscribirse a nuevas notificaciones
      const unsubscribe = NotificationService.subscribe(currentUser.id, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return unsubscribe;
    }
  }, []);

  return (
    <div>
      <h1>Usuarios ({users.length})</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} - {user.role}</li>
        ))}
      </ul>

      <h1>Notificaciones ({notifications.length})</h1>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>{notif.title}: {notif.message}</li>
        ))}
      </ul>
    </div>
  );
}
