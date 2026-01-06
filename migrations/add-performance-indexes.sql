-- C1: PERFORMANCE - Add indexes for frequently queried columns
-- These indexes improve query performance for common access patterns
-- Safe to run multiple times (IF NOT EXISTS)

-- User lookups by email (login, password reset)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User lookups by username (profile pages)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- User filtering by role (admin queries)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- User filtering by status (active users)
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Posts by creator (creator dashboard, profile pages)
CREATE INDEX IF NOT EXISTS idx_posts_creator_id ON posts(creator_id);

-- Posts by creation date (feed sorting)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Posts by status (published content filtering)
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Composite index for feed queries (creator + date)
CREATE INDEX IF NOT EXISTS idx_posts_creator_created ON posts(creator_id, created_at DESC);

-- Comments by post (comment threads)
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Comments by user (user activity)
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Likes by post (like counts)
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);

-- Likes by user (user's liked posts)
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- Subscriptions by subscriber (user's subscriptions)
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);

-- Subscriptions by creator (creator's subscribers)
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator_id ON subscriptions(creator_id);

-- Subscriptions by status (active subscriptions)
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Transactions by user (transaction history)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Transactions by type (payment queries)
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Transactions by status (pending/completed filtering)
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Transactions by date (recent activity)
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Messages by sender (sent messages)
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Messages by recipient (inbox)
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- Messages by thread (conversation view)
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);

-- Notifications by user (notification feed)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Notifications by read status (unread count)
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Composite index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);

-- Media by post (media galleries)
CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);

-- Media by type (image/video filtering)
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);

-- Payouts by creator (payout history)
CREATE INDEX IF NOT EXISTS idx_payouts_creator_id ON payouts(creator_id);

-- Payouts by status (pending payouts)
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- Audit logs by actor (admin action tracking)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);

-- Audit logs by target (entity history)
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs(target_id);

-- Audit logs by date (recent activity)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Sessions by user (session management)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON session(sess -> 'userId');

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE posts;
ANALYZE comments;
ANALYZE likes;
ANALYZE subscriptions;
ANALYZE transactions;
ANALYZE messages;
ANALYZE notifications;
ANALYZE media;
ANALYZE payouts;
ANALYZE audit_logs;
