# BoyFanz Frontend API Calls Inventory

Generated: 2026-01-06

## Authentication APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/auth/user` | GET | useAuth | Get current user |
| `/api/auth/login` | POST | useAuth | Login with credentials |
| `/api/auth/register` | POST | useAuth | Register new user |
| `/api/auth/logout` | POST | useAuth | Logout |
| `/api/auth/check-admin` | GET | usePermissions | Check admin status |
| `/api/auth/session` | GET | Various | Session status |
| `/api/auth/creator-signup` | POST | CreatorSignup | Creator registration |

## User & Profile APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/user/platform-access` | GET | PlatformSwitcher | Platform access list |
| `/api/profiles/complete-onboarding` | POST | OnboardingFlow | Complete onboarding |
| `/api/profile-themes/:userId` | GET/PUT | ProfileCustomizer | Profile themes |

## Content APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/content/feed` | GET | Various | Content feed |
| `/api/infinity-feed` | GET | BoyFanzSPA | Infinite scroll feed |
| `/api/posts/:postId/react` | POST | PostView | React to post |
| `/api/posts/:postId/save` | POST | PostView | Save post |
| `/api/posts/:postId/repost` | POST | PostView | Repost |
| `/api/posts/:postId/quote` | POST | PostView | Quote post |
| `/api/reels` | GET | FanzCock | Get reels |
| `/api/reels/:reelId/like` | POST | Reels | Like reel |
| `/api/reels/:reelId/share` | POST | Reels | Share reel |
| `/api/stories/:storyId/view` | POST | Stories | Mark story viewed |

## Creator APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/creators/discover` | GET | SearchCreators | Discover creators |
| `/api/creators/:creatorId/verification-status` | GET | VerifiedMediaGate | Creator verification |
| `/api/creators/:creatorId/subscribe` | POST | LiveViewer | Subscribe to creator |
| `/api/creator/free-links/:id` | GET/PUT/DELETE | FreeLinksPage | Free links |
| `/api/creator-pro/status` | GET | CreatorProDashboard | Pro status |
| `/api/creator-pro/tiers` | GET | CreatorProDashboard | Pro tiers |
| `/api/creator-pro/scoring` | GET | CreatorProDashboard | Pro scoring |
| `/api/creator-pro/strikes` | GET | CreatorProDashboard | Strikes |
| `/api/creator-pro/recalculate` | POST | CreatorProDashboard | Recalculate score |
| `/api/creator-pro/referral-code` | POST | CreatorProDashboard | Generate referral |
| `/api/creator-pro/strikes/:strikeId/appeal` | POST | CreatorProDashboard | Appeal strike |

## Forum APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/forums/categories` | GET | ForumsHome, CreateTopic | Forum categories |
| `/api/forums/categories/:slug` | GET | ForumCategory | Category details |
| `/api/forums/topics` | GET/POST | ForumsHome, CreateTopic | Topics |
| `/api/forums/topics/:id` | GET | ForumTopic | Topic detail |
| `/api/forums/topics/:id/replies` | POST | ForumTopic | Reply to topic |
| `/api/forums/topics/:id/like` | POST | ForumTopic | Like topic |
| `/api/forums/reputation/:userId` | GET | ReputationBadge | User reputation |
| `/api/forums/admin/topics` | GET | Admin | Admin topics |
| `/api/forums/admin/topics/:topicId/moderate` | POST | Admin | Moderate topic |

## Messaging APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/messages` | GET/POST | Messages | Messages |
| `/api/messages/:messageId/purchase` | POST | Messages | Purchase message |
| `/api/social-notifications/:notificationId/read` | POST | Header | Mark notification read |

## Payment APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/payments/stripe/payment-methods` | GET | Payments | Get payment methods |
| `/api/payments/stripe/payment-methods/:cardId` | DELETE | Payments | Delete payment method |
| `/api/payments/crypto/rates` | GET | useCryptoPayments | Crypto rates |
| `/api/payments/crypto/:paymentId` | GET | useCryptoPayments | Payment status |
| `/api/payments/crypto/:paymentId/refund` | POST | useCryptoPayments | Refund crypto |

## Event APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/events` | GET | EventsHome | List events |
| `/api/events/:eventId` | GET | EventDetails | Event detail |
| `/api/events/:eventId/join` | POST | EventLive | Join event |
| `/api/events/:eventId/leave` | POST | EventLive | Leave event |
| `/api/events/:eventId/tip` | POST | EventLive | Tip at event |
| `/api/events/:eventId/purchase-ticket` | POST | EventDetails | Buy ticket |
| `/api/events/:eventId/start` | POST | EventHost | Start event |
| `/api/events/:eventId/end` | POST | EventHost | End event |
| `/api/events/:eventId/cancel` | POST | EventHost | Cancel event |

## Custom Request APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/custom-requests/:requestId/respond` | POST | CustomRequests | Respond to request |
| `/api/custom-requests/:requestId/approve` | POST | CustomRequests | Approve request |
| `/api/custom-requests/:requestId/pay` | POST | CustomRequests | Pay for request |
| `/api/custom-requests/:requestId/start` | POST | CustomRequests | Start request |
| `/api/custom-requests/:requestId/deliver` | POST | CustomRequests | Deliver content |
| `/api/custom-requests/:requestId/dispute` | POST | CustomRequests | Dispute request |

## Social/Discovery APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/map/nearby` | GET | NearbyMe | Nearby people |
| `/api/map/location` | POST | NearbyMe | Update location |
| `/api/fuck-buddies/:userId` | GET | FuckBuddies | Get fuck buddies |
| `/api/fuck-buddies/:userId/top-eight` | GET | FuckBuddies | Top eight |
| `/api/fuck-buddies/request/:requestId/respond` | POST | FuckBuddies | Respond to request |
| `/api/free-links/:slug/redeem` | POST | FreeLinkRedeem | Redeem free link |

## Help & Support APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/help/search` | GET | AISearchInterface | Search help |
| `/api/help/chat/live/:sessionId/messages` | GET | FloatingSupportWidget | Chat messages |
| `/api/help/chat/live/:sessionId/send` | POST | FloatingSupportWidget | Send message |
| `/api/help/tickets/:ticketId/comments` | POST | TicketDetailPage | Add comment |
| `/api/help/tickets/:ticketId/status` | PUT | TicketDetailPage | Update status |

## Compliance APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/compliance/2257-verification` | POST | Compliance2257Form | 2257 verification |
| `/api/compliance/costar-verification` | POST | CoStarVerificationForm | CoStar verification |
| `/api/compliance/costar-complete/:token` | POST | CoStarVerificationForm | Complete CoStar |
| `/api/costar/invitations` | GET/POST | CoStarInviteForm | Invitations |
| `/api/costar/invite/:token` | GET | CoStarVerify | Get invite |
| `/api/costar/verify/:inviteToken` | POST | CoStar2257Form | Verify CoStar |

## Data Retention APIs (GDPR/CCPA)

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/data-retention/dashboard` | GET | PrivacySettings | Dashboard |
| `/api/data-retention/consent` | GET/POST | Various | Consent management |
| `/api/data-retention/export` | POST | PrivacySettings | Request export |
| `/api/data-retention/delete` | POST | PrivacySettings | Request deletion |
| `/api/data-retention/delete/:deletionId/cancel` | POST | PrivacySettings | Cancel deletion |

## Admin APIs

### User Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users/:userId` | PUT/DELETE | Update/delete user |
| `/api/admin/users/:userId/role` | PUT | Change user role |

### Content Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/posts/:postId` | GET/PUT/DELETE | Manage post |
| `/api/admin/stories/:storyId` | GET/PUT/DELETE | Manage story |
| `/api/admin/stories/:storyId/archive` | POST | Archive story |
| `/api/admin/streams/:streamId` | PUT/DELETE | Manage stream |
| `/api/admin/comments/:commentId/moderate` | POST | Moderate comment |
| `/api/admin/categories/:type/:categoryId` | PUT/DELETE | Manage category |
| `/api/admin/categories/:type` | POST | Create category |
| `/api/admin/categories/:type/bulk` | POST | Bulk operations |
| `/api/admin/categories/:type/reorder` | POST | Reorder categories |

### Financial Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/financial/transactions/:id/status` | PUT | Transaction status |
| `/api/admin/financial/transactions/:id/refund` | POST | Refund transaction |
| `/api/admin/financial/transactions/export` | GET | Export transactions |
| `/api/admin/financial/deposits/:id/status` | PUT | Deposit status |
| `/api/admin/financial/billing/invoices/:id/status` | PUT | Invoice status |
| `/api/admin/financial/billing/profiles/:id` | PUT | Billing profile |
| `/api/admin/financial/tax-rates/:id` | PUT/DELETE | Tax rates |
| `/api/admin/financial/tax-rates/export` | GET | Export tax rates |
| `/api/admin/financial/payment-gateways/:id` | PUT/DELETE | Payment gateways |
| `/api/admin/financial/payment-gateways/:id/test` | POST | Test gateway |
| `/api/admin/payouts/:payoutId/status` | PUT | Payout status |
| `/api/admin/payouts/:payoutId/fraud-check` | POST | Fraud check |

### Complaints & Moderation
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/complaints/:complaintId/assign` | POST | Assign complaint |
| `/api/admin/complaints/:complaintId/escalate` | POST | Escalate complaint |
| `/api/admin/complaints/:complaintId/resolve` | POST | Resolve complaint |
| `/api/admin/complaints/:complaintId/comments` | POST | Add comment |

### Verification
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/verifications/age/:verificationId` | PUT | Age verification |
| `/api/admin/verifications/kyc/:verificationId` | PUT | KYC verification |
| `/api/admin/verifications/costar/:verificationId` | PUT | CoStar verification |
| `/api/admin/verifications/:verificationId/notes` | POST | Add notes |

### Configuration
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/system-settings/:id` | PUT | System settings |
| `/api/admin/settings/limits` | GET/PUT | Settings limits |
| `/api/admin/appearance` | GET/PUT | Site appearance |
| `/api/admin/branding` | GET | Get branding |
| `/api/admin/branding/colors` | PUT | Update colors |
| `/api/admin/branding/upload` | POST | Upload asset |
| `/api/admin/branding/:assetId` | DELETE | Delete asset |

### Storage & Media
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/storage-providers` | GET/POST | Storage providers |
| `/api/admin/storage-providers/:id` | PUT/DELETE | Provider config |
| `/api/admin/storage-providers/:id/test` | POST | Test provider |
| `/api/admin/storage-providers/:id/set-primary` | POST | Set primary |
| `/api/admin/storage-providers/:providerId/purge-cache` | POST | Purge cache |
| `/api/admin/storage-providers/alerts` | GET | Storage alerts |
| `/api/admin/storage-providers/alerts/:id/acknowledge` | POST | Acknowledge |
| `/api/admin/storage-providers/alerts/:id/resolve` | POST | Resolve alert |
| `/api/admin/gallery` | GET | Gallery items |
| `/api/admin/gallery/:id` | PUT/DELETE | Gallery item |
| `/api/admin/gallery/upload` | POST | Upload to gallery |
| `/api/admin/gallery/bulk-delete` | POST | Bulk delete |
| `/api/admin/gallery/bulk-update` | POST | Bulk update |
| `/api/admin/video/encoding` | GET/PUT | Video encoding |

### Communications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/announcements/:id` | PUT/DELETE | Announcement |
| `/api/admin/announcements/:id/publish` | POST | Publish |
| `/api/admin/announcements/:id/pause` | POST | Pause |
| `/api/admin/push-notification-campaigns/:id` | PUT/DELETE | Campaign |
| `/api/admin/push-notification-campaigns/:id/send` | POST | Send campaign |
| `/api/admin/push-notification-campaigns/:id/test-send` | POST | Test send |
| `/api/admin/push-notification-campaigns/:id/pause` | POST | Pause campaign |
| `/api/admin/message-templates/:templateId` | PUT/DELETE | Template |
| `/api/admin/message-templates/:templateId/send` | POST | Send template |
| `/api/admin/messages/:messageId/flag` | POST | Flag message |

### Email Marketing
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/email-marketing/campaigns` | GET/POST | Campaigns |
| `/api/email-marketing/campaigns/:id` | PUT/DELETE | Campaign |
| `/api/email-marketing/campaigns/:id/send` | POST | Send campaign |
| `/api/email-marketing/campaigns/:id/test` | POST | Test campaign |
| `/api/email-marketing/templates` | GET/POST | Templates |
| `/api/email-marketing/analytics` | GET | Analytics |
| `/api/email-marketing/scheduler/status` | GET | Scheduler status |
| `/api/email-marketing/scheduler/start` | POST | Start scheduler |
| `/api/email-marketing/scheduler/stop` | POST | Stop scheduler |
| `/api/email-marketing/verification-reminder/bulk` | POST | Bulk reminder |

### Shop & Products
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/products/:productId` | PUT/DELETE | Product |
| `/api/admin/orders/:orderId` | PUT | Order |
| `/api/admin/orders/:orderId/fulfill` | POST | Fulfill order |
| `/api/admin/orders/:orderId/refund` | POST | Refund order |
| `/api/admin/shop/bulk-:type` | POST | Bulk shop ops |

### Bookings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/bookings` | GET | List bookings |
| `/api/admin/bookings/:id/status` | PUT | Booking status |

### OAuth & API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/oauth-credentials` | GET | OAuth creds |
| `/api/admin/oauth-credentials/:platform` | PUT/DELETE | Platform OAuth |
| `/api/admin/oauth-credentials/:platform/verify` | POST | Verify OAuth |
| `/api/admin/oauth-settings/test/:provider` | POST | Test OAuth |
| `/api/admin/api-keys/:id` | DELETE | Delete API key |
| `/api/admin/webhooks/:id` | PUT/DELETE | Webhook |
| `/api/admin/webhooks/:id/test` | POST | Test webhook |

### Consent & Compliance
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/consent-forms` | GET/POST | Consent forms |
| `/api/admin/consent-withdrawals` | GET | Withdrawals |

### Reports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/reports/:reportType` | GET | Generate report |

## Utility APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/upload/get-url` | POST | Various | Get upload URL |
| `/api/mediahub/upload/:uploadId/chunk` | POST | useChunkedUpload | Upload chunk |
| `/api/mediahub/upload/:uploadId/complete` | POST | useChunkedUpload | Complete upload |
| `/api/video-clips/:clipId` | GET/DELETE | ClipSelector | Video clips |
| `/api/security/public-status` | GET | SecurityShield | Security status |
| `/api/consent/:sessionId` | GET | GDPRConsentBanner | Consent status |
| `/api/seo/structured-data/:pageType` | GET | useSEO | SEO data |
| `/api/seo/backlinks` | GET | useSEO | Backlinks |
| `/api/tutorials/:id/progress` | GET/POST | InteractiveTutorialViewer | Tutorial progress |
| `/api/tutorials/:id/complete` | POST | InteractiveTutorialViewer | Complete tutorial |
| `/api/local-bots/:botId/status` | GET | useAgents | Bot status |
| `/api/local-bots/:botId/action` | POST | useAgents | Bot action |
| `/api/bots/local/status` | GET | AgentSidebar | All bots status |
| `/api/platform/current` | GET | Various | Platform metadata |
| `/api/blacklist` | GET/POST | blacklist-management | Blacklist |
| `/api/blacklist/:id` | DELETE | blacklist-management | Remove from blacklist |

## Third-Party Integration APIs

| Endpoint | Method | Component/Hook | Description |
|----------|--------|----------------|-------------|
| `/api/bunny/status` | GET | BunnyCDN | CDN status |
| `/api/bunny/stats` | GET | BunnyCDN | CDN stats |
| `/api/bunny/purge` | POST | BunnyCDN | Purge cache |
| `/api/fanzcloud/health` | GET | FanzCloud | Cloud health |
| `/api/fanzcloud/quota` | GET | FanzCloud | Storage quota |
| `/api/fanzfiliate/campaigns/:id/status` | PUT | FanzFiliate | Campaign status |

## Revenue & Monetization APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/revenue-quests/quests` | GET | List quests |
| `/api/revenue-quests/quests/:questId/contribute` | POST | Contribute to quest |
| `/api/tip-games` | GET/POST | Tip games |
| `/api/tip-games/admin/all` | GET | Admin tip games |
| `/api/trust/proofs` | GET/POST | Trust proofs |
| `/api/trust/disputes` | GET/POST | Trust disputes |
| `/api/collaborations/request/:requestId/:action` | POST | Collaboration actions |
| `/api/polls/:pollId/vote` | POST | Vote on poll |

## Summary

- **Total API Endpoints Identified**: ~250+
- **Authentication APIs**: 7
- **Content APIs**: 10
- **Creator APIs**: 11
- **Forum APIs**: 10
- **Payment APIs**: 5
- **Event APIs**: 9
- **Admin APIs**: 100+
- **Utility APIs**: 20+

