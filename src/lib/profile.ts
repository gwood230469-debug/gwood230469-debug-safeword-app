import { supabase } from './supabase';

export async function getOwnDisplayName(userId: string): Promise<string | null> {
  const { data, error } = await supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.display_name ?? null;
}

export async function setOwnDisplayName(userId: string, displayName: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: userId, display_name: displayName });
  if (error) throw error;
}
