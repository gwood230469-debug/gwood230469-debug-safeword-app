import { supabase } from './supabase';
import { CircleMember, MemberStatus } from '../types/models';

function fromRow(row: any): CircleMember {
  return {
    id: row.id,
    circleId: row.circle_id,
    userId: row.user_id,
    phoneNumber: row.phone_number,
    displayName: row.display_name,
    status: row.status as MemberStatus,
    invitedAt: row.invited_at,
    confirmedAt: row.confirmed_at,
  };
}

export type OwnCircleState =
  | { role: 'creator' | 'member'; circleId: string }
  | { role: 'none' };

// Determines whether the signed-in user already created a circle, already
// belongs to one as a confirmed member, or has neither yet.
export async function getOwnCircleState(userId: string): Promise<OwnCircleState> {
  const { data: created, error: createdError } = await supabase
    .from('circles')
    .select('id')
    .eq('created_by', userId)
    .limit(1)
    .maybeSingle();
  if (createdError) throw createdError;
  if (created) return { role: 'creator', circleId: created.id };

  const { data: membership, error: membershipError } = await supabase
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .limit(1)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (membership) return { role: 'member', circleId: membership.circle_id };

  return { role: 'none' };
}

export async function createCircle(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('circles')
    .insert({ created_by: userId })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function listMembers(circleId: string): Promise<CircleMember[]> {
  const { data, error } = await supabase
    .from('circle_members')
    .select('*')
    .eq('circle_id', circleId)
    .order('invited_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function inviteMember(circleId: string, displayName: string, phoneNumber: string): Promise<CircleMember> {
  const { data, error } = await supabase
    .from('circle_members')
    .insert({ circle_id: circleId, display_name: displayName, phone_number: phoneNumber, status: 'invited' })
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

// Called right after a user confirms their own phone via OTP. If someone had
// already added this phone number to a circle, this links & confirms that
// invited row to the now-authenticated user — this *is* "confirming their own
// device", no separate invite link/SMS needed beyond the normal sign-in OTP.
export async function tryConfirmInvitedMembership(
  userId: string,
  phoneNumber: string
): Promise<CircleMember | null> {
  const { data, error } = await supabase
    .from('circle_members')
    .update({ user_id: userId, status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('phone_number', phoneNumber)
    .eq('status', 'invited')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function safeWordExists(circleId: string): Promise<boolean> {
  const { data, error } = await supabase.from('safe_words').select('id').eq('circle_id', circleId).maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function setSafeWord(circleId: string, userId: string, encryptedValue: string): Promise<void> {
  const { error } = await supabase
    .from('safe_words')
    .upsert({ circle_id: circleId, encrypted_value: encryptedValue, updated_by: userId, updated_at: new Date().toISOString() }, { onConflict: 'circle_id' });
  if (error) throw error;
}
