// Backup & Recovery System
import { BackupData } from "./types";

const backups: BackupData[] = [];

export class BackupService {
  static createBackup(
    data: any,
    name: string,
    createdBy: string,
    description?: string,
    isAutomatic: boolean = false,
    tags?: string[]
  ): BackupData {
    const backup: BackupData = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      timestamp: new Date(),
      size: JSON.stringify(data).length,
      createdBy,
      data,
      tags,
      isAutomatic,
    };
    backups.push(backup);
    return backup;
  }

  static getBackup(backupId: string): BackupData | undefined {
    return backups.find(b => b.id === backupId);
  }

  static getAllBackups(): BackupData[] {
    return [...backups].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static getBackupsByTag(tag: string): BackupData[] {
    return backups.filter(b => b.tags?.includes(tag));
  }

  static deleteBackup(backupId: string): boolean {
    const index = backups.findIndex(b => b.id === backupId);
    if (index !== -1) {
      backups.splice(index, 1);
      return true;
    }
    return false;
  }

  static deleteOldBackups(daysToKeep: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const initialLength = backups.length;
    const filtered = backups.filter(b => b.timestamp > cutoffDate);
    backups.length = 0;
    backups.push(...filtered);
    return initialLength - backups.length;
  }

  static getBackupSize(): number {
    return backups.reduce((total, b) => total + b.size, 0);
  }

  static getBackupStats() {
    return {
      totalBackups: backups.length,
      totalSize: this.getBackupSize(),
      automaticBackups: backups.filter(b => b.isAutomatic).length,
      manualBackups: backups.filter(b => !b.isAutomatic).length,
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
      newestBackup: backups.length > 0 ? backups[0].timestamp : null,
    };
  }
}
