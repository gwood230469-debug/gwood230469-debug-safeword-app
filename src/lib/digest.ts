import { supabase } from './supabase';
import { DigestItem, DigestRegion } from '../types/models';

function fromRow(row: any): DigestItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    publishedAt: row.published_at,
    region: row.region as DigestRegion,
  };
}

export async function listDigestItems(): Promise<DigestItem[]> {
  const { data, error } = await supabase
    .from('digest_items')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function getDigestItem(itemId: string): Promise<DigestItem | null> {
  const { data, error } = await supabase.from('digest_items').select('*').eq('id', itemId).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}
