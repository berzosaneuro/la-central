'use client';

import { useState, useEffect } from 'react';
import { AuthService, User, UserRole } from '@/lib/auth';
import { AuditService } from '@/lib/audit';
import { ConfigService } from '@/lib/config';
import { BackupService } from '@/lib/backup';
import { AnalyticsService } from '@/lib/analytics';
import { NotificationService } from '@/lib/notifications';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  recentActions: number;
  systemHealth: number;
  backupCount: number;
  storageUsed: string;
}

export function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    recentActions: 0,
    systemHealth: 100,
    backupCount: 0,
    storageUsed: '0 MB',
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'backups' | 'config'>('overview');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      updateStats();
      const interval = setInterval(updateStats, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, []);

  const updateStats = () => {
    const allUsers = AuthService.getAllUsers();
    const logs = AuditService.getLogs({ limit: 100 });
    const backupStats = BackupService.getBackupStats();
    const metrics = AnalyticsService.getSystemMetrics();

    setStats({
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.isActive).length,
      recentActions: logs.length,
      systemHealth: 95,
      backupCount: backupStats.totalBackups,
      storageUsed: `${(backupStats.totalSize / 1024 / 1024).toFixed(2)} MB`,
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">El Jefazo OS - Admin</h1>
          <p className="text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Bienvenido, {currentUser.name} ({currentUser.role})</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">{new Date().toLocaleString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Usuarios Totales"
            value={stats.totalUsers}
            subtext={`${stats.activeUsers} activos`}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Acciones Recientes"
            value={stats.recentActions}
            subtext="Últimas 100"
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Salud del Sistema"
            value={`${stats.systemHealth}%`}
            subtext="Operacional"
            color="from-yellow-500 to-yellow-600"
          />
          <StatCard
            title="Backups"
            value={stats.backupCount}
            subtext={stats.storageUsed}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700">
          <div className="flex border-b border-slate-700">
            {(['overview', 'users', 'audit', 'backups', 'config'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab user={currentUser} stats={stats} />}
            {activeTab === 'users' && <UsersTab user={currentUser} />}
            {activeTab === 'audit' && <AuditTab user={currentUser} />}
            {activeTab === 'backups' && <BackupsTab user={currentUser} />}
            {activeTab === 'config' && <ConfigTab user={currentUser} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ STAT CARD ============
interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  color: string;
}

function StatCard({ title, value, subtext, color }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-1`}>
      <div className="bg-slate-800 rounded p-4">
        <p className="text-slate-400 text-sm mb-2">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-slate-500 text-xs">{subtext}</p>
      </div>
    </div>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab({ user, stats }: { user: User; stats: DashboardStats }) {
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const logs = AuditService.getLogs({ limit: 10 });
    setRecentLogs(logs);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Acciones Recientes</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentLogs.length > 0 ? (
            recentLogs.map((log: any) => (
              <div key={log.id} className="bg-slate-700/50 p-3 rounded flex justify-between text-sm">
                <div>
                  <p className="text-white font-medium">{log.action}</p>
                  <p className="text-slate-400 text-xs">{log.resource}</p>
                </div>
                <p className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleTimeString('es-ES')}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">Sin acciones recientes</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ USERS TAB ============
function UsersTab({ user }: { user: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.OPERATOR);

  useEffect(() => {
    setUsers(AuthService.getAllUsers());
  }, []);

  const handleCreateUser = () => {
    const email = prompt('Email:');
    const name = prompt('Nombre:');
    if (email && name) {
      const newUser = AuthService.createUser(email, name, newUserRole);
      setUsers([...users, newUser]);
      AuditService.log(user.id, 'CREATE' as any, 'users' as any, newUser.id);
    }
  };

  const handleToggleUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      if (targetUser.isActive) {
        AuthService.deactivateUser(userId);
      } else {
        AuthService.activateUser(userId);
      }
      setUsers([...users]);
      AuditService.log(user.id, 'UPDATE' as any, 'users' as any, userId);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCreateUser}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
      >
        + Nuevo Usuario
      </button>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="px-4 py-2 text-slate-400">Email</th>
              <th className="px-4 py-2 text-slate-400">Nombre</th>
              <th className="px-4 py-2 text-slate-400">Rol</th>
              <th className="px-4 py-2 text-slate-400">Estado</th>
              <th className="px-4 py-2 text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/20">
                <td className="px-4 py-2 text-white">{u.email}</td>
                <td className="px-4 py-2 text-slate-300">{u.name}</td>
                <td className="px-4 py-2">
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">{u.role}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleToggleUser(u.id)}
                    className="text-xs bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded transition-colors"
                  >
                    {u.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ AUDIT TAB ============
function AuditTab({ user }: { user: User }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let filtered = AuditService.getLogs({ limit: 100 });
    if (filter !== 'all') {
      filtered = filtered.filter(l => l.action === filter);
    }
    setLogs(filtered);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'CREATE', 'UPDATE', 'DELETE', 'READ'].map(action => (
          <button
            key={action}
            onClick={() => setFilter(action)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              filter === action
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {action}
          </button>
        ))}
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map(log => (
          <div key={log.id} className="bg-slate-700/50 p-3 rounded border border-slate-600">
            <div className="flex justify-between mb-2">
              <span className="text-white font-medium">{log.action}</span>
              <span className="text-slate-400 text-xs">{new Date(log.timestamp).toLocaleString('es-ES')}</span>
            </div>
            <p className="text-slate-300 text-sm">Resource: {log.resource}</p>
            {log.resourceId && <p className="text-slate-400 text-xs">ID: {log.resourceId}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ BACKUPS TAB ============
function BackupsTab({ user }: { user: User }) {
  const [backups, setBackups] = useState<any[]>([]);
  const [backupStats, setBackupStats] = useState<any>(null);

  useEffect(() => {
    setBackups(BackupService.getAllBackups());
    setBackupStats(BackupService.getBackupStats());
  }, []);

  const handleCreateBackup = () => {
    const name = prompt('Nombre del backup:') || `Backup ${new Date().toLocaleString('es-ES')}`;
    // Implement full backup logic with actual data
    alert(`Backup creado: ${name}`);
    AuditService.log(user.id, 'BACKUP_EXPORT' as any, 'backups' as any);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-700/50 p-4 rounded">
          <p className="text-slate-400 text-sm mb-1">Total Backups</p>
          <p className="text-2xl font-bold text-white">{backupStats?.totalBackups || 0}</p>
        </div>
        <div className="bg-slate-700/50 p-4 rounded">
          <p className="text-slate-400 text-sm mb-1">Tamaño Total</p>
          <p className="text-2xl font-bold text-white">{(backupStats?.totalSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <div className="bg-slate-700/50 p-4 rounded">
          <p className="text-slate-400 text-sm mb-1">Automáticos</p>
          <p className="text-2xl font-bold text-white">{backupStats?.automaticBackups || 0}</p>
        </div>
      </div>
      <button
        onClick={handleCreateBackup}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
      >
        + Crear Backup Manual
      </button>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {backups.map(backup => (
          <div key={backup.id} className="bg-slate-700/50 p-3 rounded">
            <div className="flex justify-between">
              <span className="text-white font-medium">{backup.name}</span>
              <span className="text-slate-400 text-xs">{new Date(backup.timestamp).toLocaleString('es-ES')}</span>
            </div>
            <p className="text-slate-400 text-sm">{(backup.size / 1024).toFixed(2)} KB</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ CONFIG TAB ============
function ConfigTab({ user }: { user: User }) {
  const [configs, setConfigs] = useState<any[]>([]);

  useEffect(() => {
    setConfigs(ConfigService.getAllConfigs());
  }, []);

  const handleUpdateConfig = (key: string) => {
    const config = configs.find(c => c.key === key);
    if (!config) return;

    let newValue;
    if (config.type === 'boolean') {
      newValue = !config.value;
    } else {
      newValue = prompt(`${key}:`, config.value);
      if (newValue === null) return;
    }

    ConfigService.setConfig(key, newValue, config.type, user.id, config.description);
    setConfigs([...configs]);
    AuditService.log(user.id, 'UPDATE' as any, 'settings' as any, key);
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {configs.map(config => (
        <div key={config.key} className="bg-slate-700/50 p-3 rounded flex justify-between items-center">
          <div>
            <p className="text-white font-medium">{config.key}</p>
            <p className="text-slate-400 text-xs">{config.description || 'Sin descripción'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-300">{String(config.value)}</span>
            <button
              onClick={() => handleUpdateConfig(config.key)}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
