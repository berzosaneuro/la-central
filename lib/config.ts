// Global System Configuration
import { SystemConfig, SoundConfig } from "./types";

const configs = new Map<string, SystemConfig>();
const soundConfigs = new Map<string, SoundConfig>();

// Initialize default configs
const defaultConfigs: SystemConfig[] = [
  {
    id: "cfg_theme",
    key: "theme",
    value: "dark",
    type: "string",
    description: "Application theme (dark/light)",
    updatedAt: new Date(),
    updatedBy: "system",
  },
  {
    id: "cfg_language",
    key: "language",
    value: "es",
    type: "string",
    description: "Default language",
    updatedAt: new Date(),
    updatedBy: "system",
  },
  {
    id: "cfg_backup_retention",
    key: "backup_retention_days",
    value: 90,
    type: "number",
    description: "Days to keep backups",
    updatedAt: new Date(),
    updatedBy: "system",
  },
  {
    id: "cfg_notification_enabled",
    key: "notifications_enabled",
    value: true,
    type: "boolean",
    description: "Enable system notifications",
    updatedAt: new Date(),
    updatedBy: "system",
  },
];

defaultConfigs.forEach(cfg => configs.set(cfg.key, cfg));

export class ConfigService {
  static getConfig(key: string): SystemConfig | undefined {
    return configs.get(key);
  }

  static getConfigValue(key: string, defaultValue?: any): any {
    const config = configs.get(key);
    return config ? config.value : defaultValue;
  }

  static setConfig(key: string, value: any, type: string, updatedBy: string, description?: string): SystemConfig {
    const existing = configs.get(key);
    const config: SystemConfig = {
      id: existing?.id || `cfg_${Date.now()}`,
      key,
      value,
      type: type as any,
      description: description || existing?.description,
      updatedAt: new Date(),
      updatedBy,
    };
    configs.set(key, config);
    return config;
  }

  static getAllConfigs(): SystemConfig[] {
    return Array.from(configs.values());
  }

  static deleteConfig(key: string): boolean {
    return configs.delete(key);
  }

  // Sound Configurations
  static getSoundConfig(soundId: string): SoundConfig | undefined {
    return soundConfigs.get(soundId);
  }

  static getAllSoundConfigs(): SoundConfig[] {
    return Array.from(soundConfigs.values());
  }

  static setSoundConfig(config: SoundConfig): SoundConfig {
    soundConfigs.set(config.id, config);
    return config;
  }

  static deleteSoundConfig(soundId: string): boolean {
    return soundConfigs.delete(soundId);
  }

  static getSoundsByCategory(category: string): SoundConfig[] {
    return Array.from(soundConfigs.values()).filter(s => s.category === category);
  }
}
