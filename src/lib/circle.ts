import { supabase } from './supabase';
import { CircleMember, MemberStatus } from '../types/models';

// Mirrors circle_members' columns (see supabase/migrations/0006_oauth_reset.sql).
type CircleMemberRow = {
  id: string;
  circle_id: string;
  user_id: string | null;
  phone_number: string | null;
  display_name: string;
  status: MemberStatus;
  invited_at: string;
  confirmed_at: string | null;
};

function fromRow(row: CircleMemberRow): CircleMember {
  return {
    id: row.id,
    circleId: row.circle_id,
    userId: row.user_id,
    phoneNumber: row.phone_number,
    displayName: row.display_name,
    status: row.status,
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

// ROOT CAUSE FOUND (via migration 0008_debug_whoami.sql): auth.uid() was
// always resolving correctly — a whoami() RPC call proved the server-side
// identity matched `userId` exactly on every failing attempt. The real
// culprit is a PostgreSQL/RLS interaction: `.insert(...).select().single()`
// issues INSERT ... RETURNING, which requires the new row to *also* satisfy
// a SELECT policy so it can be returned. That SELECT policy
// (is_circle_member -> is_circle_creator, a `stable` security-definer
// function) can evaluate against a pre-insert snapshot within the same
// statement, so it doesn't yet see the row this same INSERT just created —
// producing the exact same "new row violates row-level security policy"
// text as a genuine WITH CHECK failure, despite the insert itself being
// perfectly allowed. Splitting the insert and the read-back into two
// separate statements avoids the same-statement snapshot issue entirely.
export async function createCircle(userId: string): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("Your sign-in isn't ready yet — please wait a moment and try again.");
  }
  if (sessionData.session.user.id !== userId) {
    throw new Error('The signed-in account changed — please restart the app and try again.');
  }

  const { error: insertError } = await supabase.from('circles').insert({ created_by: userId });
  if (insertError) throw insertError;

  const { data, error: selectError } = await supabase
    .from('circles')
    .select('id')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (selectError) throw selectError;
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
