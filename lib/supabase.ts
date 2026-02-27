import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

export type Message = {
  id: string
  from_clone_id: string
  to_clone_id: string
  from_instance_id: string
  to_instance_id: string
  subject: string
  body: string
  read: boolean
  created_at: string
}

export type Report = {
  id: string
  clone_id: string
  instance_id: string
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom'
  title: string
  data: Record<string, unknown>
  generated_at: string
  status: 'pending' | 'ready' | 'archived'
}

export type InstanceConfig = {
  id: string
  instance_id: string
  config_key: string
  config_value: string
  updated_at: string
}

export type CloneUpdate = {
  id: string
  clone_id: string
  instance_id: string
  version: string
  status: 'pending' | 'downloading' | 'installing' | 'complete' | 'error'
  progress: number
  error_message?: string
  created_at: string
}

export const subscribeToMessages = (cloneId: string, callback: (msg: Message) => void) => {
  return supabase
    .channel(`messages-${cloneId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `to_clone_id=eq.${cloneId}`
    }, (payload) => callback(payload.new as Message))
    .subscribe()
}

export const subscribeToUpdates = (cloneId: string, callback: (upd: CloneUpdate) => void) => {
  return supabase
    .channel(`updates-${cloneId}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'clone_updates',
      filter: `clone_id=eq.${cloneId}`
    }, (payload) => callback(payload.new as CloneUpdate))
    .subscribe()
}
