// Initialize Admin System
// This module sets up the admin system with default data and users

import { AuthService, UserRole } from '@/lib/auth';
import { ConfigService } from '@/lib/config';
import { NotificationService, NotificationType } from '@/lib/notifications';
import { AuditService } from '@/lib/audit';

export function initializeAdminSystem() {
  console.log('[v0] Inicializando sistema admin...');

  // Create default admin user if none exists
  const allUsers = AuthService.getAllUsers();
  if (allUsers.length === 0) {
    const superAdmin = AuthService.createUser(
      'admin@central.local',
      'Super Admin',
      UserRole.SUPER_ADMIN
    );
    console.log('[v0] Super Admin creado:', superAdmin.id);

    // Log admin creation
    AuditService.log(
      superAdmin.id,
      'CREATE',
      'users',
      superAdmin.id,
      { before: null, after: superAdmin },
      { type: 'system_init' }
    );

    // Set current user
    AuthService.setCurrentUser(superAdmin);

    // Create welcome notification
    NotificationService.createNotification(
      superAdmin.id,
      NotificationType.SUCCESS,
      'Bienvenido a Central v2.0',
      'Sistema de administración inicializado correctamente',
      { type: 'system' }
    );
  }

  // Initialize default configurations
  const defaultConfigs = [
    { key: 'system_name', value: 'Central v2.0', description: 'Nombre del sistema' },
    { key: 'system_version', value: '2.0.0', description: 'Versión actual' },
    { key: 'theme_mode', value: 'dark', description: 'Modo de tema' },
    { key: 'language', value: 'es', description: 'Idioma predeterminado' },
    { key: 'notifications_enabled', value: true, description: 'Habilitar notificaciones' },
    { key: 'auto_backup_enabled', value: true, description: 'Backups automáticos habilitados' },
    { key: 'auto_backup_interval_hours', value: 24, description: 'Intervalo de backup automático' },
    { key: 'audit_retention_days', value: 90, description: 'Días para retener logs de auditoría' },
    { key: 'backup_retention_days', value: 30, description: 'Días para retener backups' },
    { key: 'api_rate_limit', value: 1000, description: 'Límite de rate limiting por hora' },
  ];

  defaultConfigs.forEach(config => {
    const existing = ConfigService.getConfig(config.key);
    if (!existing) {
      ConfigService.setConfig(
        config.key,
        config.value,
        typeof config.value === 'boolean' ? 'boolean' : typeof config.value === 'number' ? 'number' : 'string',
        'system',
        config.description
      );
    }
  });

  console.log('[v0] Sistema admin inicializado correctamente');
}

export function createExampleUsers() {
  console.log('[v0] Creando usuarios de ejemplo...');

  const roles = [
    { email: 'admin@example.com', name: 'Administrador', role: UserRole.ADMIN },
    { email: 'manager@example.com', name: 'Gerente', role: UserRole.MANAGER },
    { email: 'operator@example.com', name: 'Operador', role: UserRole.OPERATOR },
    { email: 'viewer@example.com', name: 'Visualizador', role: UserRole.VIEWER },
  ];

  roles.forEach(({ email, name, role }) => {
    const existing = AuthService.getAllUsers().find(u => u.email === email);
    if (!existing) {
      const user = AuthService.createUser(email, name, role);
      console.log(`[v0] Usuario ${role} creado:`, user.id);
    }
  });
}

// Export admin system context
export const AdminSystemContext = {
  initialize: initializeAdminSystem,
  createExampleUsers,
};
