-- BerzosaNeuro tables
-- Subscriptions per user
CREATE TABLE IF NOT EXISTS public.berzosa_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free', -- 'free', 'premium', 'gold'
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.berzosa_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "berzosa_sub_select_own" ON public.berzosa_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "berzosa_sub_insert_own" ON public.berzosa_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "berzosa_sub_update_own" ON public.berzosa_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Meditations content library
CREATE TABLE IF NOT EXISTS public.berzosa_meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer,
  audio_url text,
  image_url text,
  category text, -- 'respiracion', 'visualizacion', 'cuerpo', 'foco'
  plan_required text NOT NULL DEFAULT 'free', -- 'free', 'premium', 'gold'
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.berzosa_meditations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "berzosa_meditations_read_all" ON public.berzosa_meditations FOR SELECT USING (true);

-- 7-day course progress
CREATE TABLE IF NOT EXISTS public.berzosa_course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, day_number)
);
ALTER TABLE public.berzosa_course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "berzosa_progress_own" ON public.berzosa_course_progress FOR ALL USING (auth.uid() = user_id);

-- Meditation sessions log (contador)
CREATE TABLE IF NOT EXISTS public.berzosa_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meditation_id uuid REFERENCES public.berzosa_meditations(id),
  duration_seconds integer,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.berzosa_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "berzosa_sessions_own" ON public.berzosa_sessions FOR ALL USING (auth.uid() = user_id);

-- Contact messages
CREATE TABLE IF NOT EXISTS public.berzosa_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.berzosa_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "berzosa_contacts_insert" ON public.berzosa_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "berzosa_contacts_admin_read" ON public.berzosa_contacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed some meditations
INSERT INTO public.berzosa_meditations (title, description, duration_minutes, category, plan_required, sort_order) VALUES
  ('Respiración 4-7-8', 'Calma el sistema nervioso en minutos. Ideal para empezar.', 5, 'respiracion', 'free', 1),
  ('Escáner corporal', 'Conecta con tu cuerpo y libera tensión acumulada.', 10, 'cuerpo', 'free', 2),
  ('Foco total', 'Activa la concentración profunda antes de una tarea importante.', 8, 'foco', 'free', 3),
  ('Visualización de claridad', 'Entrena tu mente para ver con más nitidez.', 12, 'visualizacion', 'premium', 4),
  ('Reset mental', 'Borra el ruido del día y reinicia desde cero.', 15, 'respiracion', 'premium', 5),
  ('Neuroplasticidad activa', 'Activa los mecanismos de cambio cerebral mientras meditas.', 20, 'foco', 'premium', 6),
  ('Arquitectura del pensamiento', 'Reorganiza tus patrones mentales desde la raíz.', 25, 'visualizacion', 'gold', 7),
  ('Integración profunda', 'La meditación más avanzada del método NEURO.', 30, 'cuerpo', 'gold', 8),
  ('Presencia expandida', 'Accede a estados de consciencia superiores.', 35, 'visualizacion', 'gold', 9)
ON CONFLICT DO NOTHING;
