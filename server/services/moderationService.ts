import { storage } from "../storage";
import { notificationService } from "./notificationService";

class ModerationService {
  async addToQueue(mediaId: string, reason?: string) {
    try {
      // Create moderation queue entry
      const queueEntry = {
        mediaId,
        reason: reason || 'Automatic review required',
        status: 'pending' as const,
      };

      // Note: We don't have a direct method to insert into moderation queue
      // This would need to be added to the storage interface
      console.log('Adding to moderation queue:', queueEntry);

      // For now, just update the media asset status
      await storage.updateMediaAssetStatus(mediaId, 'pending');

      // Notify admins about new item in queue
      // This is simplified - in reality we'd get all admin users
      await notificationService.sendSystemNotification({
        kind: 'system',
        payloadJson: {
          message: 'New content awaiting moderation',
          mediaId
        }
      });

    } catch (error) {
      console.error('Error adding to moderation queue:', error);
      throw error;
    }
  }

  async approve(queueId: string, reviewerId: string, notes?: string) {
    try {
      const queueItem = await storage.getModerationItem(queueId);
      if (!queueItem) {
        throw new Error('Moderation item not found');
      }

      // Update moderation queue item
      await storage.updateModerationItem(queueId, {
        status: 'approved',
        reviewerId,
        notes,
        decidedAt: new Date(),
      });

      // Update media asset status
      await storage.updateMediaAssetStatus(queueItem.mediaId, 'approved');

      // Get media asset to notify owner
      const mediaAsset = await storage.getMediaAsset(queueItem.mediaId);
      if (mediaAsset) {
        await notificationService.sendNotification(mediaAsset.ownerId, {
          kind: 'moderation',
          payloadJson: {
            message: 'Your content has been approved',
            mediaTitle: mediaAsset.title,
            status: 'approved'
          }
        });
      }

      // Create audit log
      await storage.createAuditLog({
        actorId: reviewerId,
        action: 'content_approved',
        targetType: 'media_asset',
        targetId: queueItem.mediaId,
        diffJson: { notes, queueId }
      });

    } catch (error) {
      console.error('Error approving content:', error);
      throw error;
    }
  }

  async reject(queueId: string, reviewerId: string, notes?: string) {
    try {
      const queueItem = await storage.getModerationItem(queueId);
      if (!queueItem) {
        throw new Error('Moderation item not found');
      }

      // Update moderation queue item
      await storage.updateModerationItem(queueId, {
        status: 'rejected',
        reviewerId,
        notes,
        decidedAt: new Date(),
      });

      // Update media asset status
      await storage.updateMediaAssetStatus(queueItem.mediaId, 'rejected');

      // Get media asset to notify owner
      const mediaAsset = await storage.getMediaAsset(queueItem.mediaId);
      if (mediaAsset) {
        await notificationService.sendNotification(mediaAsset.ownerId, {
          kind: 'moderation',
          payloadJson: {
            message: 'Your content has been rejected',
            mediaTitle: mediaAsset.title,
            status: 'rejected',
            reason: notes
          }
        });
      }

      // Create audit log
      await storage.createAuditLog({
        actorId: reviewerId,
        action: 'content_rejected',
        targetType: 'media_asset',
        targetId: queueItem.mediaId,
        diffJson: { notes, queueId }
      });

    } catch (error) {
      console.error('Error rejecting content:', error);
      throw error;
    }
  }
}

export const moderationService = new ModerationService();
