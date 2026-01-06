// @ts-nocheck
/**
 * Live Chat Support Routes
 *
 * Real-time live chat with AI fallback, admin/moderator alerts,
 * and PWA push notifications.
 */

import { Router, Request, Response } from 'express';
import { db, pool } from '../db';
import { isAuthenticated, requireModeratorOrAdmin } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';
import webpush from 'web-push';

const router = Router();

// In-memory chat sessions (production would use Redis)
const activeSessions = new Map<string, {
  id: string;
  status: 'waiting' | 'connected' | 'ended';
  userId?: string;
  userName: string;
  userEmail?: string;
  agentId?: string;
  agentName?: string;
  queuePosition: number;
  estimatedWait: number;
  messages: Array<{
    id: string;
    type: 'user' | 'agent' | 'bot' | 'system';
    content: string;
    senderId?: string;
    senderName?: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  connectedAt?: Date;
}>();

// Queue for waiting sessions
let chatQueue: string[] = [];

// Active agents
const activeAgents = new Map<string, {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'busy' | 'away';
  currentChats: string[];
  maxChats: number;
}>();

// Validation schemas
const startChatSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().min(1),
  userEmail: z.string().email().optional(),
  currentPage: z.string().optional()
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['user', 'agent']).default('user')
});

/**
 * Get support availability status
 * GET /api/help/support/status
 */
router.get('/support/status', async (req: Request, res: Response) => {
  try {
    // Count active agents
    let onlineAgents = 0;
    activeAgents.forEach(agent => {
      if (agent.status === 'online') onlineAgents++;
    });

    // Calculate average wait time based on queue
    const avgWaitMinutes = Math.max(2, chatQueue.length * 3);

    return res.json({
      isOnline: onlineAgents > 0,
      agentsAvailable: onlineAgents,
      averageWaitTime: avgWaitMinutes <= 5 ? '< 5 min' : `~${avgWaitMinutes} min`,
      queueLength: chatQueue.length
    });
  } catch (error) {
    console.error('Error getting support status:', error);
    return res.status(500).json({ error: 'Failed to get support status' });
  }
});

/**
 * Get chat support info (for ChatPage component)
 * GET /api/help/chat/info
 */
router.get('/chat/info', async (req: Request, res: Response) => {
  try {
    let onlineAgents = 0;
    activeAgents.forEach(agent => {
      if (agent.status === 'online') onlineAgents++;
    });

    const avgWaitMinutes = Math.max(2, chatQueue.length * 3);

    return res.json({
      isAvailable: onlineAgents > 0,
      queueLength: chatQueue.length,
      averageWaitTime: avgWaitMinutes <= 5 ? '< 5 min' : `~${avgWaitMinutes} min`,
      activeAgents: onlineAgents,
      businessHours: {
        start: '9:00 AM',
        end: '10:00 PM',
        timezone: 'EST'
      }
    });
  } catch (error) {
    console.error('Error getting chat info:', error);
    return res.status(500).json({ error: 'Failed to get chat info' });
  }
});

/**
 * Start a new live chat session
 * POST /api/help/chat/live/start
 */
router.post('/chat/live/start', async (req: Request, res: Response) => {
  try {
    const validation = startChatSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { userId, userName, userEmail, currentPage } = validation.data;
    const sessionId = `chat_${crypto.randomBytes(16).toString('hex')}`;

    // Find an available agent
    let assignedAgent: { id: string; name: string; avatar?: string } | null = null;
    for (const [agentId, agent] of activeAgents) {
      if (agent.status === 'online' && agent.currentChats.length < agent.maxChats) {
        assignedAgent = { id: agentId, name: agent.name, avatar: agent.avatar };
        agent.currentChats.push(sessionId);
        agent.status = agent.currentChats.length >= agent.maxChats ? 'busy' : 'online';
        break;
      }
    }

    const queuePosition = assignedAgent ? 0 : chatQueue.length + 1;
    if (!assignedAgent) {
      chatQueue.push(sessionId);
    }

    const session = {
      id: sessionId,
      status: (assignedAgent ? 'connected' : 'waiting') as 'waiting' | 'connected' | 'ended',
      userId,
      userName,
      userEmail,
      agentId: assignedAgent?.id,
      agentName: assignedAgent?.name,
      queuePosition,
      estimatedWait: queuePosition * 3,
      messages: [],
      createdAt: new Date(),
      connectedAt: assignedAgent ? new Date() : undefined
    };

    activeSessions.set(sessionId, session);

    // Alert all online admins/moderators about new chat
    await alertAdminsModerators({
      type: 'new_chat',
      sessionId,
      userName,
      userEmail,
      currentPage,
      status: session.status
    });

    return res.json({
      session: {
        id: session.id,
        status: session.status,
        queuePosition: session.queuePosition,
        estimatedWait: session.estimatedWait,
        agent: assignedAgent ? {
          id: assignedAgent.id,
          name: assignedAgent.name,
          avatar: assignedAgent.avatar,
          status: 'online'
        } : null,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Error starting live chat:', error);
    return res.status(500).json({ error: 'Failed to start live chat' });
  }
});

/**
 * Get messages for a chat session
 * GET /api/help/chat/live/:sessionId/messages
 */
router.get('/chat/live/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({
      messages: session.messages.map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        sender: m.senderId ? {
          id: m.senderId,
          name: m.senderName || 'Unknown',
          role: m.type === 'agent' ? 'agent' : 'user'
        } : undefined
      }))
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * Send a message in a chat session
 * POST /api/help/chat/live/:sessionId/send
 */
router.post('/chat/live/:sessionId/send', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const validation = sendMessageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const { content, type } = validation.data;
    const userId = (req as any).user?.id;

    const message = {
      id: `msg_${crypto.randomBytes(8).toString('hex')}`,
      type: type as 'user' | 'agent',
      content,
      senderId: userId || session.userId,
      senderName: type === 'agent' ? session.agentName : session.userName,
      timestamp: new Date()
    };

    session.messages.push(message);

    // If user message, alert the assigned agent
    if (type === 'user' && session.agentId) {
      await sendAgentNotification(session.agentId, {
        type: 'new_message',
        sessionId,
        userName: session.userName,
        preview: content.substring(0, 50)
      });
    }

    // If agent message, could send push to user if they have app installed
    if (type === 'agent' && session.userId) {
      await sendUserPushNotification(session.userId, {
        title: 'Support Reply',
        body: content.substring(0, 100),
        tag: `chat_${sessionId}`,
        data: { url: '/help/chat', sessionId }
      });
    }

    return res.json({
      message: {
        id: message.id,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        sender: {
          id: message.senderId,
          name: message.senderName,
          role: message.type
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * Agent joins a chat session
 * POST /api/help/chat/admin/:sessionId/join
 */
router.post('/chat/admin/:sessionId/join', requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    const agentId = (req as any).user?.id;
    const agentName = (req as any).user?.firstName || 'Support Agent';

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status === 'connected' && session.agentId !== agentId) {
      return res.status(400).json({ error: 'Session already has an agent' });
    }

    // Update session
    session.status = 'connected';
    session.agentId = agentId;
    session.agentName = agentName;
    session.connectedAt = new Date();

    // Remove from queue if present
    chatQueue = chatQueue.filter(id => id !== sessionId);

    // Update queue positions for remaining sessions
    chatQueue.forEach((id, index) => {
      const s = activeSessions.get(id);
      if (s) {
        s.queuePosition = index + 1;
        s.estimatedWait = (index + 1) * 3;
      }
    });

    // Add system message
    session.messages.push({
      id: `sys_${Date.now()}`,
      type: 'system',
      content: `${agentName} has joined the chat.`,
      timestamp: new Date()
    });

    // Track agent
    if (!activeAgents.has(agentId)) {
      activeAgents.set(agentId, {
        id: agentId,
        name: agentName,
        status: 'online',
        currentChats: [sessionId],
        maxChats: 5
      });
    } else {
      const agent = activeAgents.get(agentId)!;
      if (!agent.currentChats.includes(sessionId)) {
        agent.currentChats.push(sessionId);
      }
    }

    // Send push notification to user
    if (session.userId) {
      await sendUserPushNotification(session.userId, {
        title: 'Support Connected!',
        body: `${agentName} is ready to help you.`,
        tag: `chat_${sessionId}`,
        data: { url: '/help/chat', sessionId }
      });
    }

    return res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        userName: session.userName,
        userEmail: session.userEmail,
        messages: session.messages
      }
    });
  } catch (error) {
    console.error('Error joining chat:', error);
    return res.status(500).json({ error: 'Failed to join chat' });
  }
});

/**
 * Get all waiting chats (for admin dashboard)
 * GET /api/help/chat/admin/queue
 */
router.get('/chat/admin/queue', requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const waitingChats: any[] = [];
    const activeChats: any[] = [];

    activeSessions.forEach((session, id) => {
      const chatInfo = {
        id: session.id,
        status: session.status,
        userName: session.userName,
        userEmail: session.userEmail,
        queuePosition: session.queuePosition,
        messageCount: session.messages.length,
        lastMessage: session.messages[session.messages.length - 1]?.content?.substring(0, 50),
        createdAt: session.createdAt,
        agent: session.agentName
      };

      if (session.status === 'waiting') {
        waitingChats.push(chatInfo);
      } else if (session.status === 'connected') {
        activeChats.push(chatInfo);
      }
    });

    return res.json({
      waiting: waitingChats,
      active: activeChats,
      queueLength: chatQueue.length
    });
  } catch (error) {
    console.error('Error getting chat queue:', error);
    return res.status(500).json({ error: 'Failed to get chat queue' });
  }
});

/**
 * End a chat session
 * POST /api/help/chat/live/:sessionId/end
 */
router.post('/chat/live/:sessionId/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'ended';
    session.messages.push({
      id: `sys_${Date.now()}`,
      type: 'system',
      content: 'Chat session has ended.',
      timestamp: new Date()
    });

    // Remove from agent's active chats
    if (session.agentId) {
      const agent = activeAgents.get(session.agentId);
      if (agent) {
        agent.currentChats = agent.currentChats.filter(id => id !== sessionId);
        if (agent.currentChats.length < agent.maxChats) {
          agent.status = 'online';
        }
      }
    }

    // Remove from queue
    chatQueue = chatQueue.filter(id => id !== sessionId);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error ending chat:', error);
    return res.status(500).json({ error: 'Failed to end chat' });
  }
});

/**
 * Agent goes online/offline
 * POST /api/help/chat/admin/status
 */
router.post('/chat/admin/status', requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).user?.id;
    const agentName = (req as any).user?.firstName || 'Agent';
    const { status } = req.body;

    if (!['online', 'away', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'offline') {
      activeAgents.delete(agentId);
    } else {
      if (!activeAgents.has(agentId)) {
        activeAgents.set(agentId, {
          id: agentId,
          name: agentName,
          status: status as 'online' | 'busy' | 'away',
          currentChats: [],
          maxChats: 5
        });
      } else {
        activeAgents.get(agentId)!.status = status as 'online' | 'busy' | 'away';
      }
    }

    return res.json({ success: true, status });
  } catch (error) {
    console.error('Error updating agent status:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

// Helper: Alert admins and moderators about new chats
async function alertAdminsModerators(data: {
  type: string;
  sessionId: string;
  userName: string;
  userEmail?: string;
  currentPage?: string;
  status: string;
}) {
  try {
    // Get all admin/moderator users with push subscriptions
    const result = await pool.query(`
      SELECT DISTINCT u.id, u.username, u.first_name, pds.push_subscription
      FROM users u
      LEFT JOIN pwa_device_subscriptions pds ON pds.user_id = u.id AND pds.is_active = true
      WHERE u.role IN ('admin', 'moderator')
      AND pds.push_subscription IS NOT NULL
    `);

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log('[LiveChat] VAPID keys not configured, skipping push notifications');
      return;
    }

    webpush.setVapidDetails(
      'mailto:support@fanzunlimited.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    for (const row of result.rows) {
      try {
        const subscription = row.push_subscription;
        if (subscription) {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: '🔔 New Support Chat',
              body: `${data.userName} needs assistance`,
              icon: '/icons/support-128.png',
              badge: '/icons/badge-72.png',
              tag: `support_${data.sessionId}`,
              data: {
                type: 'support_chat',
                sessionId: data.sessionId,
                url: '/admin/support'
              },
              requireInteraction: true
            })
          );
          console.log(`[LiveChat] Push sent to admin ${row.username}`);
        }
      } catch (pushError) {
        console.error(`[LiveChat] Push failed for ${row.id}:`, pushError);
      }
    }
  } catch (error) {
    console.error('[LiveChat] Failed to alert admins:', error);
  }
}

// Helper: Send notification to specific agent
async function sendAgentNotification(agentId: string, data: {
  type: string;
  sessionId: string;
  userName: string;
  preview: string;
}) {
  try {
    const result = await pool.query(`
      SELECT push_subscription
      FROM pwa_device_subscriptions
      WHERE user_id = $1 AND is_active = true
    `, [agentId]);

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) return;

    webpush.setVapidDetails(
      'mailto:support@fanzunlimited.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    for (const row of result.rows) {
      if (row.push_subscription) {
        try {
          await webpush.sendNotification(
            row.push_subscription,
            JSON.stringify({
              title: `💬 ${data.userName}`,
              body: data.preview,
              tag: `chat_${data.sessionId}`,
              data: { url: '/admin/support', sessionId: data.sessionId }
            })
          );
        } catch (e) {
          console.error('[LiveChat] Agent notification failed:', e);
        }
      }
    }
  } catch (error) {
    console.error('[LiveChat] Failed to notify agent:', error);
  }
}

// Helper: Send push notification to user
async function sendUserPushNotification(userId: string, notification: {
  title: string;
  body: string;
  tag: string;
  data?: any;
}) {
  try {
    const result = await pool.query(`
      SELECT push_subscription
      FROM pwa_device_subscriptions
      WHERE user_id = $1 AND is_active = true AND notifications_enabled = true
    `, [userId]);

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) return;

    webpush.setVapidDetails(
      'mailto:support@fanzunlimited.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    for (const row of result.rows) {
      if (row.push_subscription) {
        try {
          await webpush.sendNotification(
            row.push_subscription,
            JSON.stringify({
              ...notification,
              icon: '/icons/icon-128.png',
              badge: '/icons/badge-72.png'
            })
          );
        } catch (e) {
          console.error('[LiveChat] User notification failed:', e);
        }
      }
    }
  } catch (error) {
    console.error('[LiveChat] Failed to notify user:', error);
  }
}

export default router;
