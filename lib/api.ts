// API & Webhooks Management System
import { ApiKey, Webhook, WebhookEvent, Permission } from "./types";

const apiKeys: ApiKey[] = [];
const webhooks: Webhook[] = [];
const webhookLogs: any[] = [];

export class ApiService {
  static generateApiKey(name: string, userId: string, permissions: Permission[]): ApiKey {
    const key = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hashedKey = Buffer.from(key).toString("base64"); // In production, use bcrypt

    const apiKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      key: hashedKey,
      userId,
      permissions,
      createdAt: new Date(),
      isActive: true,
    };
    apiKeys.push(apiKey);
    return { ...apiKey, key }; // Return unhashed key only once
  }

  static getApiKey(keyId: string): ApiKey | undefined {
    return apiKeys.find(k => k.id === keyId);
  }

  static getApiKeysByUser(userId: string): ApiKey[] {
    return apiKeys.filter(k => k.userId === userId);
  }

  static revokeApiKey(keyId: string): boolean {
    const key = apiKeys.find(k => k.id === keyId);
    if (key) {
      key.isActive = false;
      key.lastUsed = new Date();
      return true;
    }
    return false;
  }

  static deleteApiKey(keyId: string): boolean {
    const index = apiKeys.findIndex(k => k.id === keyId);
    if (index !== -1) {
      apiKeys.splice(index, 1);
      return true;
    }
    return false;
  }

  static validateApiKey(keyHash: string): ApiKey | null {
    const key = apiKeys.find(k => k.key === keyHash && k.isActive);
    if (key) {
      key.lastUsed = new Date();
    }
    return key || null;
  }
}

export class WebhookService {
  static registerWebhook(url: string, events: WebhookEvent[], userId: string): Webhook {
    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      url,
      events,
      userId,
      createdAt: new Date(),
      isActive: true,
      retryPolicy: {
        maxRetries: 3,
        retryDelayMs: 5000,
      },
    };
    webhooks.push(webhook);
    return webhook;
  }

  static getWebhook(webhookId: string): Webhook | undefined {
    return webhooks.find(w => w.id === webhookId);
  }

  static getWebhooksByUser(userId: string): Webhook[] {
    return webhooks.filter(w => w.userId === userId);
  }

  static getWebhooksByEvent(event: WebhookEvent): Webhook[] {
    return webhooks.filter(w => w.isActive && w.events.includes(event));
  }

  static deleteWebhook(webhookId: string): boolean {
    const index = webhooks.findIndex(w => w.id === webhookId);
    if (index !== -1) {
      webhooks.splice(index, 1);
      return true;
    }
    return false;
  }

  static disableWebhook(webhookId: string): boolean {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (webhook) {
      webhook.isActive = false;
      return true;
    }
    return false;
  }

  static async triggerWebhook(webhookId: string, event: WebhookEvent, data: any): Promise<void> {
    const webhook = this.getWebhook(webhookId);
    if (!webhook || !webhook.isActive) return;

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    webhookLogs.push({
      webhookId,
      event,
      payload,
      timestamp: new Date(),
      status: "pending",
    });

    // In production, implement actual HTTP calls with retry logic
    try {
      // await fetch(webhook.url, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });
    } catch (error) {
      console.error(`[v0] Webhook trigger failed for ${webhookId}:`, error);
    }
  }

  static getWebhookLogs(webhookId?: string, limit: number = 100): any[] {
    let logs = webhookLogs;
    if (webhookId) {
      logs = logs.filter(l => l.webhookId === webhookId);
    }
    return logs.slice(-limit);
  }
}
