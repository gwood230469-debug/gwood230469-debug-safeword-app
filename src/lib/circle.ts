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

// The live "circles" RLS policy (with check (created_by = auth.uid())) is
// confirmed correct against migration 0006 — a reproducible "new row
// violates row-level security policy" error here despite that means auth.uid()
// isn't resolving to `userId` for this specific request. Check the client's
// own view of its session immediately before inserting, so a real failure
// reports *why* (no session yet vs. a different signed-in user) instead of
// Postgres's generic RLS message, which doesn't distinguish the two.
export async function createCircle(userId: string): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("Your sign-in isn't ready yet — please wait a moment and try again.");
  }
  if (sessionData.session.user.id !== userId) {
    throw new Error('The signed-in account changed — please restart the app and try again.');
  }

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

export type NewMemberInvite = { member: CircleMember; inviteToken: string };

// Creates the circle_members row plus its circle_invites row in one call —
// the caller uses `inviteToken` to build the shareable deep link immediately.
export async function inviteMember(
  circleId: string,
  createdBy: string,
  displayName: string,
  phoneNumber: string | null
): Promise<NewMemberInvite> {
  const { data: memberRow, error: memberError } = await supabase
    .from('circle_members')
    .insert({ circle_id: circleId, display_name: displayName, phone_number: phoneNumber, status: 'invited' })
    .select('*')
    .single();
  if (memberError) throw memberError;

  const { data: inviteRow, error: inviteError } = await supabase
    .from('circle_invites')
    .insert({ circle_id: circleId, member_id: memberRow.id, created_by: createdBy })
    .select('token')
    .single();
  if (inviteError) throw inviteError;

  return { member: fromRow(memberRow), inviteToken: inviteRow.token };
}

// For "Resend invite": the same still-unused token is reused rather than
// minting a new one, so the link stays valid even if the invitee already has
// an old copy of it somewhere.
export async function getInviteTokenForMember(memberId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('circle_invites')
    .select('token')
    .eq('member_id', memberId)
    .is('used_at', null)
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.token ?? null;
}

// Confirms the signed-in caller into whichever circle_members row this
// invite token belongs to. Runs server-side via a security-definer function
// (see migration 0006) rather than direct table RLS, since the caller has no
// membership yet to check against before this succeeds.
export async function claimInvite(token: string): Promise<string> {
  const { data, error } = await supabase.rpc('claim_invite', { invite_token: token });
  if (error) throw error;
  return data as string;
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
