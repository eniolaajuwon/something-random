import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    // Add a delay to allow other initialization to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if we can connect to Supabase
    const { error: connectionError } = await supabase.from('_test').select('*').limit(1);
    if (connectionError && connectionError.code !== 'PGRST204') {
      console.warn('Supabase connection not available:', connectionError);
      return;
    }

    // Create user_profiles table
    const { error: profilesError } = await supabase.rpc('create_user_profiles_table', {});
    if (profilesError) {
      if (!profilesError.message.includes('already exists')) {
        console.warn('Note: User profiles table setup pending:', profilesError);
      }
    }

    // Create search_history table
    const { error: searchError } = await supabase.rpc('create_search_history_table', {});
    if (searchError) {
      if (!searchError.message.includes('already exists')) {
        console.warn('Note: Search history table setup pending:', searchError);
      }
    }
  } catch (error) {
    // Log the error but don't throw - allow the app to continue functioning
    console.warn('Database setup deferred:', error);
  }
}