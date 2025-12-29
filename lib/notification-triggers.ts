import { createClient } from "@/utils/supabase/server";
import { LinkCheckResult } from "./link-checker";
import { RetryCheckResult } from "./link-checker-retry";

export interface NotificationRecord {
  id?: string;
  user_id: string;
  link_id: string;
  type: 'link_broken' | 'link_recovered' | 'link_slow';
  message: string;
  is_read: boolean;
  created_at: Date;
}

/**
 * Step 54: Create notification trigger function
 * Check if status changed from active to broken
 */
export async function checkStatusChangeAndNotify(
  linkId: string,
  oldStatus: string,
  newStatus: string
): Promise<{ shouldNotify: boolean; notificationType?: string; message?: string }> {
  // Status changed from active to broken/warning
  if (oldStatus === 'active' && (newStatus === 'broken' || newStatus === 'warning')) {
    return {
      shouldNotify: true,
      notificationType: 'link_broken',
      message: `Your link has ${newStatus === 'broken' ? 'stopped working' : 'encountered issues'}`,
    };
  }

  // Status changed from broken/warning to active (recovery)
  if ((oldStatus === 'broken' || oldStatus === 'warning') && newStatus === 'active') {
    return {
      shouldNotify: true,
      notificationType: 'link_recovered',
      message: 'Your link is now working again',
    };
  }

  return { shouldNotify: false };
}

/**
 * Step 55: Check if notification should be sent
 * Step 56: Don't spam (max 1 notification per link per day)
 */
export async function shouldSendNotification(
  linkId: string,
  notificationType: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check if we already sent this type of notification in the last 24 hours
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('link_id', linkId)
      .eq('type', notificationType)
      .gte('created_at', oneDayAgo.toISOString())
      .limit(1);

    if (error) {
      console.error('[Notification] Error checking recent notifications:', error);
      return false;
    }

    // If we found a recent notification, don't send another one
    if (data && data.length > 0) {
      console.log(`[Notification] Skipping - already sent ${notificationType} for link ${linkId} in last 24h`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Notification] Unexpected error:', error);
    return false;
  }
}

/**
 * Step 57: Store notification in database
 */
export async function storeNotification(
  userId: string,
  linkId: string,
  type: 'link_broken' | 'link_recovered' | 'link_slow',
  message: string
): Promise<{ success: boolean; error?: string; data?: NotificationRecord }> {
  try {
    const supabase = await createClient();

    const notification = {
      user_id: userId,
      link_id: linkId,
      type,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('[Notification] Error storing notification:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Notification] ✅ Stored notification: ${type} for link ${linkId}`);
    return { success: true, data };
  } catch (error) {
    console.error('[Notification] Unexpected error storing notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Step 58: Trigger email send
 * This function prepares the email data and returns it for sending
 */
export async function prepareNotificationEmail(
  linkId: string,
  userId: string,
  notificationType: string,
  message: string
): Promise<{
  shouldSend: boolean;
  emailData?: {
    to: string;
    subject: string;
    body: string;
  };
}> {
  try {
    const supabase = await createClient();

    // Get user email and notification preferences
    const { data: user, error: userError } = await supabase
      .from('user_settings')
      .select('email, notification_preferences')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      console.error('[Notification] Error fetching user settings:', userError);
      return { shouldSend: false };
    }

    // Check if user has email notifications enabled
    const preferences = user.notification_preferences || {};
    if (preferences.email_enabled === false) {
      console.log('[Notification] Email notifications disabled for user');
      return { shouldSend: false };
    }

    // Get link details
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('name, url')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      console.error('[Notification] Error fetching link:', linkError);
      return { shouldSend: false };
    }

    // Prepare email content
    const subject = notificationType === 'link_broken'
      ? `⚠️ Alert: Link "${link.name}" is down`
      : `✅ Good news: Link "${link.name}" is back up`;

    const body = `
Hello,

${message}

Link: ${link.name}
URL: ${link.url}

Please check your dashboard for more details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/links/${linkId}

Best regards,
LinkGuardian Team
    `.trim();

    return {
      shouldSend: true,
      emailData: {
        to: user.email,
        subject,
        body,
      },
    };
  } catch (error) {
    console.error('[Notification] Error preparing email:', error);
    return { shouldSend: false };
  }
}

/**
 * Step 59: Handle digest mode (batch notifications)
 * Get all pending notifications for digest
 */
export async function getPendingDigestNotifications(
  userId: string,
  since: Date
): Promise<{ success: boolean; notifications?: NotificationRecord[] }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Notification] Error fetching digest notifications:', error);
      return { success: false };
    }

    return { success: true, notifications: data || [] };
  } catch (error) {
    console.error('[Notification] Unexpected error fetching digest:', error);
    return { success: false };
  }
}

/**
 * Main notification handler
 * Combines all steps: check status, rate limit, store, and prepare email
 */
export async function handleLinkStatusNotification(
  linkId: string,
  userId: string,
  oldStatus: string,
  newStatus: string
): Promise<{ notificationSent: boolean }> {
  try {
    console.log(`[Notification] Checking status change: ${oldStatus} → ${newStatus} for link ${linkId}`);

    // Step 54-55: Check if status changed significantly
    const { shouldNotify, notificationType, message } = await checkStatusChangeAndNotify(
      linkId,
      oldStatus,
      newStatus
    );

    if (!shouldNotify || !notificationType || !message) {
      console.log('[Notification] No notification needed for this status change');
      return { notificationSent: false };
    }

    // Step 56: Check rate limiting (don't spam)
    const canSend = await shouldSendNotification(linkId, notificationType);
    if (!canSend) {
      return { notificationSent: false };
    }

    // Step 57: Store notification
    const { success: stored } = await storeNotification(
      userId,
      linkId,
      notificationType as 'link_broken' | 'link_recovered' | 'link_slow',
      message
    );

    if (!stored) {
      console.error('[Notification] Failed to store notification');
      return { notificationSent: false };
    }

    // Step 58: Prepare email (actual sending would be done by email service)
    const { shouldSend, emailData } = await prepareNotificationEmail(
      linkId,
      userId,
      notificationType,
      message
    );

    if (shouldSend && emailData) {
      console.log('[Notification] 📧 Email prepared:', emailData.subject);
      // TODO: Send email via Resend/SendGrid
      // await sendEmail(emailData);
    }

    console.log(`[Notification] ✅ Notification handled for link ${linkId}`);
    return { notificationSent: true };
  } catch (error) {
    console.error('[Notification] Error handling notification:', error);
    return { notificationSent: false };
  }
}
