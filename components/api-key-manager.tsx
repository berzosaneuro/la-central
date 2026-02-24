'use client';

import { useState, useEffect } from 'react';
import { AuthService, User } from '@/lib/auth';
import { ApiService, WebhookService, WebhookEvent } from '@/lib/api';
import { AuditService } from '@/lib/audit';

export function ApiKeyManager() {
  const [currentUser] = useState<User | null>(AuthService.getCurrentUser());
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks'>('keys');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setApiKeys(ApiService.getApiKeysByUser(currentUser.id));
      setWebhooks(WebhookService.getWebhooksByUser(currentUser.id));
    }
  }, [currentUser]);

  const handleCreateApiKey = () => {
    if (!currentUser) return;
    const name = prompt('Nombre de la API Key:');
    if (!name) return;

    const apiKey = ApiService.generateApiKey(name, currentUser.id, currentUser.permissions);
    setApiKeys([...apiKeys, apiKey]);
    AuditService.log(currentUser.id, 'CREATE' as any, 'api_keys' as any, apiKey.id);
    alert(`API Key creada: ${apiKey.key}\n⚠️  Guarda esto en un lugar seguro.`);
  };

  const handleRevokeApiKey = (keyId: string) => {
    if (!currentUser) return;
    if (confirm('¿Estás seguro? Esta acción es irreversible.')) {
      ApiService.revokeApiKey(keyId);
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      AuditService.log(currentUser.id, 'UPDATE' as any, 'api_keys' as any, keyId);
    }
  };

  const handleCreateWebhook = () => {
    if (!currentUser) return;
    const url = prompt('URL del Webhook:');
    if (!url) return;

    const webhook = WebhookService.registerWebhook(url, [WebhookEvent.CLONE_CREATED], currentUser.id);
    setWebhooks([...webhooks, webhook]);
    AuditService.log(currentUser.id, 'CREATE' as any, 'webhooks' as any, webhook.id);
  };

  const handleDeleteWebhook = (webhookId: string) => {
    if (!currentUser) return;
    if (confirm('¿Eliminar este webhook?')) {
      WebhookService.deleteWebhook(webhookId);
      setWebhooks(webhooks.filter(w => w.id !== webhookId));
      AuditService.log(currentUser.id, 'DELETE' as any, 'webhooks' as any, webhookId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur rounded-lg border border-slate-700">
        <div className="flex border-b border-slate-700">
          {(['keys', 'webhooks'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'keys' ? 'API Keys' : 'Webhooks'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <button
                onClick={handleCreateApiKey}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                + Nueva API Key
              </button>
              <div className="space-y-2">
                {apiKeys.map(key => (
                  <div key={key.id} className="bg-slate-700/50 p-4 rounded flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{key.name}</p>
                      <p className="text-slate-400 text-xs">Creada: {new Date(key.createdAt).toLocaleString('es-ES')}</p>
                    </div>
                    <button
                      onClick={() => handleRevokeApiKey(key.id)}
                      disabled={!key.isActive}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50"
                    >
                      {key.isActive ? 'Revocar' : 'Revocada'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <button
                onClick={handleCreateWebhook}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                + Nuevo Webhook
              </button>
              <div className="space-y-2">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="bg-slate-700/50 p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium break-all">{webhook.url}</p>
                        <p className="text-slate-400 text-xs">ID: {webhook.id}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {webhook.events.map(event => (
                        <span key={event} className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
