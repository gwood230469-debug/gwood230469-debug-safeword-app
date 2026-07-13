import { supabase } from './supabase';

export async function createLoopInEvent(circleId: string, triggeredBy: string): Promise<string> {
  const { data, error } = await supabase
    .from('verification_events')
    .insert({ circle_id: circleId, triggered_by: triggeredBy, type: 'loop_in_request' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}
