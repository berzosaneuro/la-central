-- BerzosaNeuro Schema
-- Plans: free, premium, gold

-- User subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'gold')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Service role policy for admin/stripe webhooks
CREATE POLICY "subscriptions_service_all" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);

-- Meditations table
CREATE TABLE IF NOT EXISTS public.meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  duration_min integer NOT NULL,
  description text,
  audio_url text,
  plan_required text NOT NULL DEFAULT 'free' CHECK (plan_required IN ('free', 'premium', 'gold')),
  category text DEFAULT 'general',
  order_index integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.meditations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meditations_select_all" ON public.meditations FOR SELECT USING (true);
CREATE POLICY "meditations_admin_all" ON public.meditations FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert default meditations
INSERT INTO public.meditations (title, duration_min, description, plan_required, category, order_index) VALUES
  ('Reset mental', 5, 'Vacía la mente y vuelve al presente.', 'free', 'presencia', 1),
  ('Ansiedad', 8, 'Regula el sistema nervioso y corta la espiral.', 'free', 'regulacion', 2),
  ('Insomnio', 12, 'Libera la tensión y prepara el cuerpo para dormir.', 'free', 'descanso', 3),
  ('Presencia profunda', 10, 'Ancla la conciencia al momento presente.', 'premium', 'presencia', 4),
  ('Metacognición activa', 15, 'Observa tus pensamientos sin identificarte.', 'premium', 'metacognicion', 5),
  ('Rumiación cero', 12, 'Corta el bucle mental con técnicas de anclaje.', 'premium', 'regulacion', 6),
  ('Neuroplasticidad', 20, 'Entrena nuevos patrones neuronales.', 'gold', 'avanzado', 7),
  ('Ego observer', 18, 'Disuelve los mecanismos del ego con consciencia.', 'gold', 'avanzado', 8),
  ('Supraconciencia', 25, 'Accede a estados de conciencia expandida.', 'gold', 'avanzado', 9),
  ('Flujo de atención', 22, 'Desarrolla la atención sostenida sin esfuerzo.', 'gold', 'avanzado', 10)
ON CONFLICT DO NOTHING;

-- Articles / Biblioteca
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  summary text,
  content text,
  plan_required text NOT NULL DEFAULT 'free' CHECK (plan_required IN ('free', 'premium', 'gold')),
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_select_published" ON public.articles FOR SELECT USING (published = true);
CREATE POLICY "articles_admin_all" ON public.articles FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

INSERT INTO public.articles (title, slug, summary, plan_required) VALUES
  ('Por qué tu mente no se calla', 'mente-no-se-calla', 'El ruido mental tiene una causa neurológica. Aprende a entenderla.', 'free'),
  ('Ego: mecanismo defensivo', 'ego-mecanismo-defensivo', 'El ego no es tu enemigo. Es una función de supervivencia que puedes observar.', 'free'),
  ('Neuroplasticidad aplicada al ahora', 'neuroplasticidad-ahora', 'Cómo el cerebro cambia con la práctica deliberada de presencia.', 'premium'),
  ('Cómo cortar la rumiación', 'cortar-la-rumiacion', 'Técnicas prácticas para salir del bucle mental en menos de 3 minutos.', 'premium')
ON CONFLICT DO NOTHING;

-- Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_insert_anon" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_admin_select" ON public.contact_messages FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "contact_admin_update" ON public.contact_messages FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.berzosa_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  plan text NOT NULL DEFAULT 'free',
  is_admin boolean DEFAULT false,
  meditation_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.berzosa_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bprofiles_select_own" ON public.berzosa_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "bprofiles_update_own" ON public.berzosa_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "bprofiles_insert_own" ON public.berzosa_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "bprofiles_admin_all" ON public.berzosa_profiles FOR ALL USING (true);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_berzosa_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.berzosa_profiles (id, full_name, email, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    NEW.email,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_berzosa_user_created ON auth.users;
CREATE TRIGGER on_berzosa_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_berzosa_new_user();
