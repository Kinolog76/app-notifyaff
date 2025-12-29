import { createClient } from '@/utils/supabase/server';
import { handleLinkStatusNotification } from './notification-triggers';

export type LinkStatus = 'active' | 'broken' | 'warning' | 'pending';

export function determineStatus(statusCode: number | null): LinkStatus {
  if (!statusCode) {
    return 'broken';
  }

  if (statusCode >= 200 && statusCode < 300) {
    return 'active';
  }

  if (statusCode >= 300 && statusCode < 400) {
    return 'warning'; // Redirects
  }

  if (statusCode >= 400) {
    return 'broken';
  }

  return 'pending';
}

export async function updateLinkStatus(linkId: string, status: LinkStatus): Promise<void> {
  const supabase = await createClient();

  // Get current status before updating
  const { data: currentLink } = await supabase
    .from('links')
    .select('status, user_id')
    .eq('id', linkId)
    .single();

  const oldStatus = currentLink?.status || 'pending';
  const userId = currentLink?.user_id;

  // Update status
  const { error } = await supabase
    .from('links')
    .update({
      status,
      last_checked_at: new Date().toISOString(),
    })
    .eq('id', linkId);

  if (error) {
    console.error('Failed to update link status:', error);
    return;
  }

  // Trigger notifications if status changed
  if (userId && oldStatus !== status) {
    await handleLinkStatusNotification(linkId, userId, oldStatus, status);
  }
}
