-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create threads_accounts table for storing user's Threads OAuth tokens
CREATE TABLE IF NOT EXISTS public.threads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  threads_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, threads_user_id)
);

-- Create reply_templates table for storing predefined reply messages
CREATE TABLE IF NOT EXISTS public.reply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auto_reply_rules table for defining when and how to auto-reply
CREATE TABLE IF NOT EXISTS public.auto_reply_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  threads_account_id UUID NOT NULL REFERENCES public.threads_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_keywords TEXT[], -- Array of keywords to trigger replies
  reply_template_id UUID REFERENCES public.reply_templates(id) ON DELETE SET NULL,
  custom_reply_text TEXT, -- Alternative to template
  delay_minutes INTEGER DEFAULT 0, -- Delay before replying
  max_replies_per_day INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reply_history table for tracking all auto-replies
CREATE TABLE IF NOT EXISTS public.reply_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  threads_account_id UUID NOT NULL REFERENCES public.threads_accounts(id) ON DELETE CASCADE,
  auto_reply_rule_id UUID REFERENCES public.auto_reply_rules(id) ON DELETE SET NULL,
  original_post_id TEXT NOT NULL, -- Threads post ID
  original_post_content TEXT,
  reply_post_id TEXT, -- Our reply post ID
  reply_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for threads_accounts
CREATE POLICY "threads_accounts_select_own" ON public.threads_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "threads_accounts_insert_own" ON public.threads_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "threads_accounts_update_own" ON public.threads_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "threads_accounts_delete_own" ON public.threads_accounts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reply_templates
CREATE POLICY "reply_templates_select_own" ON public.reply_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reply_templates_insert_own" ON public.reply_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reply_templates_update_own" ON public.reply_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reply_templates_delete_own" ON public.reply_templates FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for auto_reply_rules
CREATE POLICY "auto_reply_rules_select_own" ON public.auto_reply_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "auto_reply_rules_insert_own" ON public.auto_reply_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auto_reply_rules_update_own" ON public.auto_reply_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "auto_reply_rules_delete_own" ON public.auto_reply_rules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reply_history
CREATE POLICY "reply_history_select_own" ON public.reply_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reply_history_insert_own" ON public.reply_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reply_history_update_own" ON public.reply_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reply_history_delete_own" ON public.reply_history FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threads_accounts_user_id ON public.threads_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_templates_user_id ON public.reply_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_user_id ON public.auto_reply_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_active ON public.auto_reply_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reply_history_user_id ON public.reply_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_history_status ON public.reply_history(status);
CREATE INDEX IF NOT EXISTS idx_reply_history_scheduled ON public.reply_history(scheduled_for) WHERE status = 'pending';
