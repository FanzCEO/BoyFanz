import { Router } from 'express';
import { db } from '../db';
import { isAuthenticated, requireAdmin } from '../middleware/auth';

const router = Router();

// ===== ADMIN SAFETY CENTER ROUTES =====

// Get safety dashboard stats
router.get('/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    // Mock safety stats - in production pull from database
    const stats = {
      panicButtonTriggered: 12,
      screenshotAttempts: 847,
      blockedUsers: 156,
      activeReports: 23,
      resolvedReports: 1847,
      avgResponseTime: '4.2 hours',
      safetyScore: 94.7,
      trendsThisWeek: {
        panicButton: -15,
        screenshots: +5,
        reports: -8,
        blocked: +3
      }
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching safety stats:', error);
    res.status(500).json({ error: 'Failed to fetch safety stats' });
  }
});

// Get all safety reports
router.get('/admin/reports', requireAdmin, async (req, res) => {
  try {
    const { status, type, priority } = req.query;

    // Mock reports data
    const reports = [
      {
        id: 'report_001',
        type: 'harassment',
        priority: 'high',
        status: 'pending',
        reporterId: 'user_123',
        reporterUsername: 'affected_user',
        reportedId: 'user_456',
        reportedUsername: 'bad_actor',
        description: 'User sending threatening messages and repeated unwanted contact',
        evidence: ['screenshot_1.jpg', 'screenshot_2.jpg'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        assignedTo: null
      },
      {
        id: 'report_002',
        type: 'underage_suspicion',
        priority: 'critical',
        status: 'investigating',
        reporterId: 'user_789',
        reporterUsername: 'concerned_creator',
        reportedId: 'user_111',
        reportedUsername: 'suspicious_account',
        description: 'Profile suggests user may be under 18',
        evidence: ['profile_screenshot.jpg'],
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000),
        assignedTo: 'mod_team'
      },
      {
        id: 'report_003',
        type: 'content_violation',
        priority: 'medium',
        status: 'pending',
        reporterId: 'user_222',
        reporterUsername: 'viewer123',
        reportedId: 'user_333',
        reportedUsername: 'rule_breaker',
        description: 'Content violates community guidelines - extreme content without proper tags',
        evidence: ['content_link_1'],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        assignedTo: null
      },
      {
        id: 'report_004',
        type: 'impersonation',
        priority: 'high',
        status: 'resolved',
        reporterId: 'user_444',
        reporterUsername: 'real_creator',
        reportedId: 'user_555',
        reportedUsername: 'fake_account',
        description: 'User impersonating verified creator, using stolen content',
        evidence: ['comparison.jpg', 'original_content.jpg'],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        assignedTo: 'admin_1',
        resolution: 'Account terminated, content removed'
      },
      {
        id: 'report_005',
        type: 'scam',
        priority: 'high',
        status: 'pending',
        reporterId: 'user_666',
        reporterUsername: 'scam_victim',
        reportedId: 'user_777',
        reportedUsername: 'scammer_user',
        description: 'User promised exclusive content for payment but never delivered',
        evidence: ['payment_proof.jpg', 'dm_screenshots.jpg'],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        assignedTo: null
      }
    ];

    let filtered = reports;
    if (status) filtered = filtered.filter(r => r.status === status);
    if (type) filtered = filtered.filter(r => r.type === type);
    if (priority) filtered = filtered.filter(r => r.priority === priority);

    res.json({
      reports: filtered,
      total: filtered.length,
      byStatus: {
        pending: reports.filter(r => r.status === 'pending').length,
        investigating: reports.filter(r => r.status === 'investigating').length,
        resolved: reports.filter(r => r.status === 'resolved').length
      },
      byPriority: {
        critical: reports.filter(r => r.priority === 'critical').length,
        high: reports.filter(r => r.priority === 'high').length,
        medium: reports.filter(r => r.priority === 'medium').length,
        low: reports.filter(r => r.priority === 'low').length
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get panic button alerts
router.get('/admin/panic-alerts', requireAdmin, async (req, res) => {
  try {
    const alerts = [
      {
        id: 'panic_001',
        userId: 'creator_123',
        username: 'streaming_creator',
        streamId: 'stream_456',
        triggeredAt: new Date(Date.now() - 15 * 60 * 1000),
        status: 'active',
        reason: 'Viewer making threats in chat',
        viewerCount: 234,
        streamUrl: '/streams/stream_456',
        location: 'Los Angeles, CA',
        responseActions: ['stream_paused', 'chat_disabled']
      },
      {
        id: 'panic_002',
        userId: 'creator_789',
        username: 'live_performer',
        streamId: 'stream_111',
        triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'resolved',
        reason: 'Doxxing attempt in chat',
        viewerCount: 89,
        streamUrl: '/streams/stream_111',
        location: 'New York, NY',
        responseActions: ['stream_ended', 'user_banned', 'ip_blocked'],
        resolution: 'Offending user permanently banned, evidence preserved for legal'
      }
    ];

    res.json({
      alerts,
      activeCount: alerts.filter(a => a.status === 'active').length,
      resolvedCount: alerts.filter(a => a.status === 'resolved').length
    });
  } catch (error) {
    console.error('Error fetching panic alerts:', error);
    res.status(500).json({ error: 'Failed to fetch panic alerts' });
  }
});

// Get screenshot detection logs
router.get('/admin/screenshot-logs', requireAdmin, async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    const logs = [
      {
        id: 'ss_001',
        userId: 'user_123',
        username: 'screenshot_user',
        contentId: 'post_456',
        contentType: 'photo',
        creatorId: 'creator_789',
        creatorUsername: 'protected_creator',
        detectedAt: new Date(Date.now() - 30 * 60 * 1000),
        method: 'screen_capture_api',
        deviceInfo: 'iPhone 15 Pro - iOS 17.2',
        action: 'warning_sent',
        warningCount: 2
      },
      {
        id: 'ss_002',
        userId: 'user_456',
        username: 'repeat_offender',
        contentId: 'post_789',
        contentType: 'video',
        creatorId: 'creator_111',
        creatorUsername: 'exclusive_content',
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        method: 'print_screen_key',
        deviceInfo: 'Windows 11 - Chrome 120',
        action: 'account_restricted',
        warningCount: 5
      },
      {
        id: 'ss_003',
        userId: 'user_789',
        username: 'first_time',
        contentId: 'dm_attachment_123',
        contentType: 'dm_media',
        creatorId: 'creator_222',
        creatorUsername: 'private_sender',
        detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        method: 'devtools_detection',
        deviceInfo: 'MacOS - Safari 17',
        action: 'warning_sent',
        warningCount: 1
      }
    ];

    res.json({
      logs,
      total: logs.length,
      byMethod: {
        screen_capture_api: logs.filter(l => l.method === 'screen_capture_api').length,
        print_screen_key: logs.filter(l => l.method === 'print_screen_key').length,
        devtools_detection: logs.filter(l => l.method === 'devtools_detection').length,
        screen_recording: logs.filter(l => l.method === 'screen_recording').length
      },
      byAction: {
        warning_sent: logs.filter(l => l.action === 'warning_sent').length,
        account_restricted: logs.filter(l => l.action === 'account_restricted').length,
        account_suspended: logs.filter(l => l.action === 'account_suspended').length
      }
    });
  } catch (error) {
    console.error('Error fetching screenshot logs:', error);
    res.status(500).json({ error: 'Failed to fetch screenshot logs' });
  }
});

// Get blocked users list
router.get('/admin/blocked-users', requireAdmin, async (req, res) => {
  try {
    const blockedUsers = [
      {
        id: 'block_001',
        userId: 'user_bad_1',
        username: 'banned_user_1',
        email: 'banned1@example.com',
        reason: 'Repeated harassment after warnings',
        blockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        blockedBy: 'admin_1',
        blockType: 'permanent',
        violations: ['harassment', 'threatening_messages'],
        ipAddresses: ['192.168.1.100', '10.0.0.50'],
        appealStatus: 'denied'
      },
      {
        id: 'block_002',
        userId: 'user_bad_2',
        username: 'temp_banned',
        email: 'tempban@example.com',
        reason: 'Content policy violation - 3rd strike',
        blockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        blockedBy: 'mod_1',
        blockType: 'temporary',
        blockDuration: '30 days',
        expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        violations: ['content_violation'],
        ipAddresses: ['172.16.0.25'],
        appealStatus: 'pending'
      },
      {
        id: 'block_003',
        userId: 'user_bad_3',
        username: 'scammer_account',
        email: 'scammer@fake.com',
        reason: 'Payment fraud and scamming creators',
        blockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        blockedBy: 'admin_2',
        blockType: 'permanent',
        violations: ['fraud', 'scam', 'chargebacks'],
        ipAddresses: ['192.168.50.1', '192.168.50.2', '192.168.50.3'],
        appealStatus: 'not_eligible'
      }
    ];

    res.json({
      blockedUsers,
      total: blockedUsers.length,
      permanent: blockedUsers.filter(u => u.blockType === 'permanent').length,
      temporary: blockedUsers.filter(u => u.blockType === 'temporary').length
    });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});

// Update report status
router.put('/admin/reports/:reportId', requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, assignedTo, resolution, notes } = req.body;

    // In production, update database
    res.json({
      success: true,
      report: {
        id: reportId,
        status,
        assignedTo,
        resolution,
        notes,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Respond to panic alert
router.post('/admin/panic-alerts/:alertId/respond', requireAdmin, async (req, res) => {
  try {
    const { alertId } = req.params;
    const { action, notes } = req.body;

    // Actions: resolve, escalate, contact_creator, end_stream, ban_offender
    res.json({
      success: true,
      alert: {
        id: alertId,
        status: action === 'resolve' ? 'resolved' : 'active',
        responseAction: action,
        notes,
        respondedAt: new Date(),
        respondedBy: (req as any).user?.id
      }
    });
  } catch (error) {
    console.error('Error responding to panic alert:', error);
    res.status(500).json({ error: 'Failed to respond to panic alert' });
  }
});

// Block/unblock user
router.post('/admin/users/:userId/block', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, blockType, duration, violations } = req.body;

    res.json({
      success: true,
      block: {
        userId,
        reason,
        blockType,
        duration,
        violations,
        blockedAt: new Date(),
        blockedBy: (req as any).user?.id
      }
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

router.delete('/admin/users/:userId/block', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    res.json({
      success: true,
      message: `User ${userId} unblocked`,
      unblockReason: reason,
      unblockedAt: new Date()
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Get safety settings
router.get('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const settings = {
      screenshotProtection: {
        enabled: true,
        warningThreshold: 3,
        restrictionThreshold: 5,
        suspensionThreshold: 10,
        notifyCreators: true,
        detectionMethods: ['screen_capture_api', 'print_screen', 'devtools', 'screen_recording']
      },
      panicButton: {
        enabled: true,
        autoActions: ['pause_stream', 'disable_chat', 'notify_mods'],
        responseTimeTarget: 5, // minutes
        escalationTime: 15 // minutes
      },
      reportSystem: {
        enabled: true,
        anonymousReporting: true,
        autoModeration: true,
        criticalAlertRecipients: ['admin@boyfanz.com', 'safety@boyfanz.com'],
        autoEscalateTypes: ['underage_suspicion', 'threats', 'doxxing']
      },
      contentBlocking: {
        enabled: true,
        blockVPN: false,
        blockTor: true,
        geoBlocking: ['KP', 'IR', 'SY'],
        deviceFingerprinting: true
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching safety settings:', error);
    res.status(500).json({ error: 'Failed to fetch safety settings' });
  }
});

// Update safety settings
router.put('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const settings = req.body;

    // In production, save to database
    res.json({
      success: true,
      settings,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating safety settings:', error);
    res.status(500).json({ error: 'Failed to update safety settings' });
  }
});

// ===== CREATOR SAFETY ROUTES =====

// Trigger panic button (for creators during streams)
router.post('/panic', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { streamId, reason, severity } = req.body;

    // In production, this would:
    // 1. Pause the stream
    // 2. Disable chat
    // 3. Alert moderators
    // 4. Log the incident

    res.json({
      success: true,
      alert: {
        id: `panic_${Date.now()}`,
        userId,
        streamId,
        reason,
        severity: severity || 'high',
        triggeredAt: new Date(),
        status: 'active',
        autoActions: ['stream_paused', 'chat_disabled', 'mods_notified']
      },
      message: 'Safety team has been alerted. Your stream is paused.'
    });
  } catch (error) {
    console.error('Error triggering panic button:', error);
    res.status(500).json({ error: 'Failed to trigger panic button' });
  }
});

// Report content/user
router.post('/report', isAuthenticated, async (req, res) => {
  try {
    const reporterId = (req as any).user?.id;
    const { type, reportedId, contentId, description, evidence } = req.body;

    const priority = ['underage_suspicion', 'threats', 'doxxing'].includes(type)
      ? 'critical'
      : ['harassment', 'impersonation', 'scam'].includes(type)
        ? 'high'
        : 'medium';

    res.json({
      success: true,
      report: {
        id: `report_${Date.now()}`,
        type,
        priority,
        status: 'pending',
        reporterId,
        reportedId,
        contentId,
        description,
        evidence: evidence || [],
        createdAt: new Date()
      },
      message: 'Report submitted. Our safety team will review it promptly.'
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Log screenshot attempt (client-side detection)
router.post('/screenshot-detected', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { contentId, contentType, creatorId, method, deviceInfo } = req.body;

    // Check user's warning count and take appropriate action
    const warningCount = 2; // In production, get from database
    let action = 'warning_sent';

    if (warningCount >= 5) {
      action = 'account_restricted';
    } else if (warningCount >= 10) {
      action = 'account_suspended';
    }

    res.json({
      logged: true,
      action,
      warningCount: warningCount + 1,
      message: warningCount >= 5
        ? 'Your account has been restricted due to repeated screenshot attempts.'
        : 'Screenshot attempts are logged. Repeated violations may result in account restrictions.'
    });
  } catch (error) {
    console.error('Error logging screenshot:', error);
    res.status(500).json({ error: 'Failed to log screenshot attempt' });
  }
});

// Get creator's safety dashboard
router.get('/my-dashboard', isAuthenticated, async (req, res) => {
  try {
    const creatorId = (req as any).user?.id;

    const dashboard = {
      screenshotAttempts: {
        total: 23,
        thisWeek: 5,
        byContent: [
          { contentId: 'post_1', title: 'Exclusive photo set', attempts: 8 },
          { contentId: 'post_2', title: 'Private message media', attempts: 6 },
          { contentId: 'post_3', title: 'PPV video', attempts: 5 }
        ]
      },
      blockedUsers: 12,
      pendingReports: 2,
      safetyScore: 92,
      recentAlerts: [
        {
          type: 'screenshot_attempt',
          contentTitle: 'Exclusive photo set',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          userWarned: true
        }
      ]
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching creator safety dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch safety dashboard' });
  }
});

// Block user (creator blocking a fan)
router.post('/block-user', isAuthenticated, async (req, res) => {
  try {
    const creatorId = (req as any).user?.id;
    const { userId, reason } = req.body;

    res.json({
      success: true,
      block: {
        creatorId,
        blockedUserId: userId,
        reason,
        blockedAt: new Date()
      },
      message: 'User has been blocked. They can no longer view your content or contact you.'
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

export default router;
