'use server';

import { createClient } from '@/lib/supabase/server';

export interface App {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  version: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

// AUTO-INCREMENT VERSION
function incrementVersion(version: string): string {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1] || '0'}.${patch}`;
}

// CREATE
export async function createApp(data: Omit<App, 'id' | 'user_id' | 'version' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: newApp, error } = await supabase
    .from('apps')
    .insert([
      {
        user_id: user.id,
        version: '1.0.0',
        ...data,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return newApp;
}

// READ ALL
export async function getApps(clientId?: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('apps')
    .select('*')
    .eq('user_id', user.id);

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// READ ONE
export async function getApp(id: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// UPDATE (Auto-increments version on any update)
export async function updateApp(id: string, updates: Partial<Omit<App, 'id' | 'user_id' | 'version' | 'created_at' | 'updated_at'>>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get current version
  const { data: currentApp, error: fetchError } = await supabase
    .from('apps')
    .select('version')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;

  const newVersion = incrementVersion(currentApp.version);

  const { data, error } = await supabase
    .from('apps')
    .update({ ...updates, version: newVersion })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DELETE
export async function deleteApp(id: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}
