-- Create the database schema for Threads Auto Reply app
-- This script sets up all necessary tables with proper relationships and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create threads_accounts table to store connected Threads accounts
CREATE TABLE IF NOT EXISTS public.threads_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  threads_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, threads_user_id)
);

-- Create reply_rules table for automated reply configurations
CREATE TABLE IF NOT EXISTS public.reply_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  threads_account_id UUID REFERENCES public.threads_accounts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_keywords TEXT[] DEFAULT '{}',
  trigger_conditions JSONB DEFAULT '{}',
  reply_template_id UUID,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reply_templates table for reusable reply templates
CREATE TABLE IF NOT EXISTS public.reply_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reply_history table to track sent replies
CREATE TABLE IF NOT EXISTS public.reply_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  threads_account_id UUID REFERENCES public.threads_accounts(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.reply_rules(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.reply_templates(id) ON DELETE SET NULL,
  original_post_id TEXT NOT NULL,
  original_post_content TEXT,
  reply_content TEXT NOT NULL,
  reply_post_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for reply_template_id in reply_rules
ALTER TABLE public.reply_rules 
ADD CONSTRAINT fk_reply_rules_template 
FOREIGN KEY (reply_template_id) REFERENCES public.reply_templates(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_threads_accounts_user_id ON public.threads_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_accounts_threads_user_id ON public.threads_accounts(threads_user_id);
CREATE INDEX IF NOT EXISTS idx_reply_rules_user_id ON public.reply_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_rules_threads_account_id ON public.reply_rules(threads_account_id);
CREATE INDEX IF NOT EXISTS idx_reply_templates_user_id ON public.reply_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_history_user_id ON public.reply_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reply_history_threads_account_id ON public.reply_history(threads_account_id);
CREATE INDEX IF NOT EXISTS idx_reply_history_status ON public.reply_history(status);
CREATE INDEX IF NOT EXISTS idx_reply_history_created_at ON public.reply_history(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for threads_accounts table
CREATE POLICY "Users can view own threads accounts" ON public.threads_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads accounts" ON public.threads_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads accounts" ON public.threads_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads accounts" ON public.threads_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reply_rules table
CREATE POLICY "Users can view own reply rules" ON public.reply_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reply rules" ON public.reply_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reply rules" ON public.reply_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reply rules" ON public.reply_rules
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reply_templates table
CREATE POLICY "Users can view own reply templates" ON public.reply_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reply templates" ON public.reply_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reply templates" ON public.reply_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reply templates" ON public.reply_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for reply_history table
CREATE POLICY "Users can view own reply history" ON public.reply_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reply history" ON public.reply_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_threads_accounts_updated_at BEFORE UPDATE ON public.threads_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reply_rules_updated_at BEFORE UPDATE ON public.reply_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reply_templates_updated_at BEFORE UPDATE ON public.reply_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
