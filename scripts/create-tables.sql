-- Tabla para mensajes entre clones
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_clone_id uuid NOT NULL,
  to_clone_id uuid NOT NULL,
  from_instance uuid NOT NULL,
  to_instance uuid NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'general', -- 'general', 'alert', 'update', 'critical'
  read boolean DEFAULT false,
  priority integer DEFAULT 0, -- 0=normal, 1=high, 2=critical
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla para reportes generados
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clone_id uuid NOT NULL,
  instance_id uuid NOT NULL,
  report_type text NOT NULL, -- 'performance', 'activity', 'financial', 'custom'
  title text NOT NULL,
  content jsonb NOT NULL,
  file_url text,
  format text DEFAULT 'pdf', -- 'pdf', 'csv', 'json'
  generated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabla para configuración de instancias
CREATE TABLE IF NOT EXISTS instance_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL,
  config_key text NOT NULL,
  config_value jsonb NOT NULL,
  category text DEFAULT 'general', -- 'general', 'security', 'performance', 'integration'
  last_updated_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(instance_id, config_key)
);

-- Tabla para actualización de clones (deploy tracking)
CREATE TABLE IF NOT EXISTS clone_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clone_id uuid NOT NULL,
  instance_id uuid NOT NULL,
  version text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  changes jsonb NOT NULL,
  deployment_started_at timestamp with time zone,
  deployment_completed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deployed_by uuid NOT NULL REFERENCES auth.users(id),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clone_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "messages_select_own" ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "messages_insert_own" ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "messages_update_own" ON messages FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "reports_select_own" ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reports_insert_own" ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for instance_configs
CREATE POLICY "instance_configs_select_own" ON instance_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "instance_configs_insert_own" ON instance_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "instance_configs_update_own" ON instance_configs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for clone_updates
CREATE POLICY "clone_updates_select_own" ON clone_updates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "clone_updates_insert_own" ON clone_updates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_messages_from_clone ON messages(from_clone_id);
CREATE INDEX idx_messages_to_clone ON messages(to_clone_id);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_reports_clone ON reports(clone_id);
CREATE INDEX idx_instance_configs_instance ON instance_configs(instance_id);
CREATE INDEX idx_clone_updates_clone ON clone_updates(clone_id);
CREATE INDEX idx_clone_updates_status ON clone_updates(status);
