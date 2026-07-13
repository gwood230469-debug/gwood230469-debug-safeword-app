import { AuthProvider } from '../types/models';
import { supabase } from './supabase';

export async function getOwnDisplayName(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.display_name ?? null;
}

export async function createProfile(userId: string, displayName: string, authProvider: AuthProvider): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: displayName, auth_provider: authProvider });
  if (error) throw error;
}
