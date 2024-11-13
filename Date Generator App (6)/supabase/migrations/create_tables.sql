-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to setup user_profiles table
CREATE OR REPLACE FUNCTION create_user_profiles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    date_preference TEXT,
    interests TEXT,
    budget TEXT,
    gender TEXT,
    sexuality TEXT,
    age_range TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles(user_id);
  
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
  CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);
    
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
  CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);
    
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
  CREATE POLICY "Users can insert their own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);
END;
$$;

-- Create function to setup search_history table
CREATE OR REPLACE FUNCTION create_search_history_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    time_of_day TEXT NOT NULL,
    date_itinerary_id UUID,
    date_title TEXT,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  
  CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON public.search_history(user_id);
  
  ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;
  CREATE POLICY "Users can view their own search history"
    ON public.search_history FOR SELECT
    USING (auth.uid() = user_id);
    
  DROP POLICY IF EXISTS "Users can insert their own search history" ON public.search_history;
  CREATE POLICY "Users can insert their own search history"
    ON public.search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
  DROP POLICY IF EXISTS "Users can delete their own search history" ON public.search_history;
  CREATE POLICY "Users can delete their own search history"
    ON public.search_history FOR DELETE
    USING (auth.uid() = user_id);
END;
$$;

-- Execute the functions to create tables
SELECT create_user_profiles_table();
SELECT create_search_history_table();