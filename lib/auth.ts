// Authentication & Authorization System
import { User, UserRole, Permission, PermissionAction, PermissionResource } from "./types";

// In-memory store (replace with database later)
let currentUser: User | null = null;
const users = new Map<string, User>();

// Default roles with permissions
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    { resource: PermissionResource.CLONES, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.RENOVATIONS, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.SOUNDS, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.USERS, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.SETTINGS, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.BACKUPS, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.LOGS, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.API_KEYS, actions: Object.values(PermissionAction) },
    { resource: PermissionResource.WEBHOOKS, actions: Object.values(PermissionAction) },
  ],
  [UserRole.ADMIN]: [
    { resource: PermissionResource.CLONES, actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE] },
    { resource: PermissionResource.RENOVATIONS, actions: [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE] },
    { resource: PermissionResource.SOUNDS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
    { resource: PermissionResource.USERS, actions: [PermissionAction.READ, PermissionAction.MANAGE] },
    { resource: PermissionResource.SETTINGS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
    { resource: PermissionResource.BACKUPS, actions: [PermissionAction.CREATE, PermissionAction.READ] },
    { resource: PermissionResource.LOGS, actions: [PermissionAction.READ] },
  ],
  [UserRole.MANAGER]: [
    { resource: PermissionResource.CLONES, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
    { resource: PermissionResource.RENOVATIONS, actions: [PermissionAction.READ, PermissionAction.UPDATE] },
    { resource: PermissionResource.SOUNDS, actions: [PermissionAction.READ] },
    { resource: PermissionResource.SETTINGS, actions: [PermissionAction.READ] },
  ],
  [UserRole.OPERATOR]: [
    { resource: PermissionResource.CLONES, actions: [PermissionAction.READ, PermissionAction.EXECUTE] },
    { resource: PermissionResource.RENOVATIONS, actions: [PermissionAction.READ, PermissionAction.EXECUTE] },
    { resource: PermissionResource.SOUNDS, actions: [PermissionAction.READ, PermissionAction.EXECUTE] },
  ],
  [UserRole.VIEWER]: [
    { resource: PermissionResource.CLONES, actions: [PermissionAction.READ] },
    { resource: PermissionResource.RENOVATIONS, actions: [PermissionAction.READ] },
    { resource: PermissionResource.SOUNDS, actions: [PermissionAction.READ] },
  ],
};

export class AuthService {
  static getCurrentUser(): User | null {
    return currentUser;
  }

  static setCurrentUser(user: User | null): void {
    currentUser = user;
  }

  static hasPermission(user: User, resource: PermissionResource, action: PermissionAction): boolean {
    const permission = user.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  }

  static hasAnyPermission(user: User, resource: PermissionResource, actions: PermissionAction[]): boolean {
    const permission = user.permissions.find(p => p.resource === resource);
    return permission ? actions.some(action => permission.actions.includes(action)) : false;
  }

  static createUser(email: string, name: string, role: UserRole): User {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      permissions: rolePermissions[role],
      createdAt: new Date(),
      isActive: true,
    };
    users.set(user.id, user);
    return user;
  }

  static getUser(userId: string): User | undefined {
    return users.get(userId);
  }

  static getAllUsers(): User[] {
    return Array.from(users.values());
  }

  static updateUserRole(userId: string, newRole: UserRole): User | null {
    const user = users.get(userId);
    if (!user) return null;
    user.role = newRole;
    user.permissions = rolePermissions[newRole];
    return user;
  }

  static deactivateUser(userId: string): void {
    const user = users.get(userId);
    if (user) user.isActive = false;
  }

  static activateUser(userId: string): void {
    const user = users.get(userId);
    if (user) user.isActive = true;
  }
}
