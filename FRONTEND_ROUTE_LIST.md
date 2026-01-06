# BoyFanz Frontend Route Inventory

Generated: 2026-01-06

## Public Routes (Unauthenticated)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Landing | Homepage/landing page |
| `/auth/register` | Register | Email/password registration |
| `/auth/login` | LoginNew | Email/password login |
| `/auth/forgot-password` | ForgotPassword | Password reset request |
| `/auth/reset-password` | ResetPasswordNew | Password reset form |
| `/auth/verify-email` | VerifyEmail | Email verification |
| `/auth/resend-verification` | ResendVerification | Resend verification email |
| `/auth/breeding-zone-signup` | BreedingZoneSignup | Special signup flow |
| `/auth/starz-signup` | StarzSignup | Legacy signup (deprecated) |
| `/auth/fanz-signup` | FanzSignup | Legacy signup (deprecated) |
| `/auth/login-old` | Login | Legacy login (deprecated) |
| `/auth/reset-password-old` | ResetPassword | Legacy reset (deprecated) |
| `/auth-complete` | AuthComplete | SSO callback success |
| `/auth-error` | AuthError | SSO callback error |
| `/starz-elite` | StarzElite | Starz Elite landing |
| `/creator/:userId` | CreatorProfile | Public creator profile |
| `/search` | SearchCreators | Creator search |
| `/blog` | Blog | Blog posts |
| `/contact` | Contact | Contact page |
| `/safety` | SafetyCenter | Safety information |
| `/resources` | CivilResources | Civil resources |
| `/terms` | TermsOfService | Terms of service |
| `/privacy` | PrivacyPolicy | Privacy policy |
| `/wittle-bear-foundation` | WittleBearFoundation | Foundation page |
| `/outlawz` | Outlawz | Outlawz section |
| `/profile/:userId` | NaughtyProfile | User profile |
| `/help` | HelpCenter | Help center |
| `/help/faq` | FAQPage | FAQ |
| `/help/search` | SearchResultsPage | Help search |
| `/help/wiki` | WikiPage | Wiki index |
| `/help/wiki/:slug` | WikiArticlePage | Wiki article |
| `/help/articles/:slug` | WikiArticlePage | Article page |
| `/help/contact` | TicketCreationPage | Support contact |
| `/help/chat` | ChatPage | Live chat |
| `/help/tutorials` | TutorialsPage | Tutorials |
| `/help/tickets` | TicketsPage | Support tickets |
| `/help/tickets/create` | TicketCreationPage | Create ticket |
| `/help/tickets/:id` | TicketDetailPage | Ticket detail |
| `/forums` | ForumsHome | Forum index |
| `/forums/category/:slug` | ForumCategory | Forum category |
| `/forums/topic/:id` | ForumTopic | Forum topic |
| `/become-creator` | BecomeCreator | Creator application |
| `/creator-signup` | CreatorSignup | Creator signup with 2257 |
| `/fan-signup` | FanSignup | Fan signup |
| `/signup` | FanSignup | Generic signup |
| `/costar/verify/:token` | CoStarVerify | CoStar verification |

## Protected Routes (Authenticated)

### Core Navigation
| Path | Component | Description |
|------|-----------|-------------|
| `/` | SocialHome | Social feed (when logged in) |
| `/social` | SocialHome | Social feed |
| `/dashboard` | Dashboard | User dashboard |
| `/breeding-zone` | BreedingZone | Breeding zone |
| `/feed` | PostsFeed | Content feed |
| `/spa` | BoyFanzSPA | SPA experience |
| `/infinity-feed` | BoyFanzSPA | Infinite scroll feed |
| `/fanzccock` | FanzCock | Reels/short videos |
| `/reels` | FanzCock | Reels |

### Bathhouse Zone
| Path | Component | Description |
|------|-----------|-------------|
| `/bathhouse` | Bathhouse | Bathhouse main |
| `/bathhouse/locker-room` | LockerRoom | Locker room |
| `/bathhouse/showers` | Showers | Showers |
| `/bathhouse/steam-room` | SteamRoom | Steam room |
| `/bathhouse/sauna` | Sauna | Sauna |
| `/bathhouse/pool` | Pool | Pool area |
| `/bathhouse/gym` | Gym | Gym |
| `/bathhouse/private-rooms` | PrivateRooms | Private rooms |
| `/bathhouse/sling-room` | SlingRoom | Sling room |
| `/bathhouse/fuck-bench` | FuckBench | Fuck bench |
| `/bathhouse/voyeur` | Voyeur | Voyeur area |
| `/bathhouse/dark-room` | DarkRoom | Dark room |
| `/bathhouse/vip` | VIPLounge | VIP lounge |

### Creator Tools
| Path | Component | Description |
|------|-----------|-------------|
| `/media` | Media | Media management |
| `/earnings` | EarningsPage | Earnings dashboard |
| `/free-links` | FreeLinksPage | Free link management |
| `/creator-pro` | CreatorProDashboard | Creator pro tools |
| `/mass-messaging` | MassMessaging | Mass messaging |
| `/creator/nearby` | CreatorNearbyMe | Nearby creators |
| `/creator/training` | CreatorOnboarding | Creator training |

### Financial
| Path | Component | Description |
|------|-----------|-------------|
| `/wallet` | Wallet | Wallet |
| `/payments` | Payments | Payments |
| `/payments/received` | PaymentsReceived | Received payments |
| `/payouts` | Payouts | Payouts |
| `/withdrawals` | Withdrawals | Withdrawals |
| `/fanz-money-center` | FanzMoneyCenter | Money center |
| `/billing` | FanzMoneyCenter | Billing |
| `/revenue-quests` | RevenueQuests | Revenue quests |
| `/trust` | TrustDashboard | Trust dashboard |

### Social & Discovery
| Path | Component | Description |
|------|-----------|-------------|
| `/nearby` | NearbyFans | Nearby fans |
| `/fuck-buddies` | FuckBuddies | Fuck buddies |
| `/messages` | Messages | Messages |
| `/notifications` | Notifications | Notifications |
| `/referrals` | Referrals | Referrals |
| `/saved` | SavedPosts | Saved posts |
| `/stories` | Stories | Stories |
| `/post/:postId` | PostView | Single post view |
| `/free/:slug` | FreeLinkRedeem | Free link redemption |

### Streaming & Events
| Path | Component | Description |
|------|-----------|-------------|
| `/streams` | StreamsHome | Streams home |
| `/streams/create` | StreamCreation | Create stream |
| `/streams/:id/dashboard` | StreamDashboard | Stream dashboard |
| `/streams/:id/watch` | LiveViewer | Watch stream |
| `/streams/:id/analytics` | StreamAnalytics | Stream analytics |
| `/events` | EventsHome | Events home |
| `/events/host` | EventHost | Host event |
| `/events/:eventId` | EventDetails | Event details |
| `/events/:eventId/live` | EventLive | Live event |

### Custom Requests
| Path | Component | Description |
|------|-----------|-------------|
| `/custom-requests` | CustomRequests | Custom requests |
| `/creator-requests` | CreatorRequests | Creator requests |
| `/custom-requests/new/:creatorId` | CreateCustomRequest | New request |

### Settings
| Path | Component | Description |
|------|-----------|-------------|
| `/settings` | Settings | Settings main |
| `/settings/privacy` | PrivacySettings | Privacy settings |
| `/settings/password` | PasswordSettings | Password settings |
| `/settings/countries` | CountriesSettings | Country settings |
| `/settings/restricted` | RestrictedSettings | Restricted settings |

### FanzFiliate
| Path | Component | Description |
|------|-----------|-------------|
| `/ads` | AdvertiserDashboard | Ads home |
| `/ads/advertiser` | AdvertiserDashboard | Advertiser dashboard |
| `/ads/publisher` | PublisherDashboard | Publisher dashboard |
| `/promote` | AdvertiserDashboard | Promote |

### Miscellaneous
| Path | Component | Description |
|------|-----------|-------------|
| `/compliance` | Compliance | Compliance |
| `/purchased` | Purchased | Purchased content |
| `/subscriptions` | Subscriptions | Subscriptions |
| `/release-forms` | ReleaseForms | Release forms |
| `/analytics` | AnalyticsDashboard | Analytics |
| `/forums/create` | CreateTopic | Create forum topic |
| `/explore` | SearchCreators | Explore |
| `/shop` | SearchCreators | Shop |
| `/vip` | BecomeVIP | VIP info |

## Admin Panel Routes (`/panel/admin/*`)

| Path | Component | Description |
|------|-----------|-------------|
| `/panel/admin/dashboard` | AdminDashboard | Admin dashboard |
| `/panel/admin/complaints` | ComplaintsManagement | Complaints |
| `/panel/admin/withdrawals` | WithdrawalsManagement | Withdrawals |
| `/panel/admin/verification` | VerificationManagement | Verification |
| `/panel/admin/moderation` | ModerationQueue | Moderation queue |
| `/panel/admin/forums` | ForumsManagement | Forums |
| `/panel/admin/moderation-queue` | ModerationQueue | Moderation queue (alt) |
| `/panel/admin/users` | UserManagement | User management |
| `/panel/admin/delegation` | DelegationManager | Delegation |
| `/panel/admin/themes` | ThemeManager | Themes |
| `/panel/admin/reports` | AdminReports | Reports |
| `/panel/admin/compliance` | CompliancePage | Compliance |
| `/panel/admin/security` | SecurityDashboard | Security |
| `/panel/admin/posts` | PostsManagement | Posts |
| `/panel/admin/streaming` | LiveStreaming | Streaming |
| `/panel/admin/stories` | StoriesManagement | Stories |
| `/panel/admin/shop` | ShopManagement | Shop |
| `/panel/admin/categories` | CategoriesManagement | Categories |
| `/panel/admin/pages` | PagesManagement | Pages |
| `/panel/admin/blog` | BlogManagement | Blog |
| `/panel/admin/transactions` | TransactionsManagement | Transactions |
| `/panel/admin/billing` | BillingManagement | Billing |
| `/panel/admin/tax-rates` | TaxRatesManagement | Tax rates |
| `/panel/admin/payment-settings` | PaymentSettings | Payment settings |
| `/panel/admin/deposits` | DepositsManagement | Deposits |
| `/panel/admin/sales` | Sales | Sales |
| `/panel/admin/products` | Products | Products |
| `/panel/admin/subscriptions` | SubscriptionsManagement | Subscriptions |
| `/panel/admin/user-ads` | UserAds | User ads |
| `/panel/admin/referrals` | ReferralsManagement | Referrals |
| `/panel/admin/leaderboard` | LeaderboardScores | Leaderboard |
| `/panel/admin/livestream-settings` | LivestreamSettings | Livestream settings |
| `/panel/admin/livestream-requests` | LivestreamRequests | Livestream requests |
| `/panel/admin/consent-forms` | ConsentForms | Consent forms |
| `/panel/admin/consent-withdrawal` | ConsentWithdrawalForms | Consent withdrawal |
| `/panel/admin/oauth-settings` | SocialOAuthSettings | OAuth settings |
| `/panel/admin/announcements` | AnnouncementsManagement | Announcements |
| `/panel/admin/comments` | CommentsManagement | Comments |
| `/panel/admin/messages` | MessagesManagement | Messages |
| `/panel/admin/push-notifications` | PushNotifications | Push notifications |
| `/panel/admin/storage` | UnifiedStorageManagement | Storage |
| `/panel/admin/system-settings` | SystemSettings | System settings |
| `/panel/admin/email-marketing` | EmailManagement | Email marketing |
| `/panel/admin/platforms` | PlatformManagement | Platforms |
| `/panel/admin/data-privacy` | DataPrivacy | Data privacy |
| `/panel/admin/agents` | AgentsManagement | Agents |
| `/panel/admin/branding` | BrandingManagement | Branding |
| `/panel/admin/bookings` | BookingManagement | Bookings |
| `/panel/admin/appearance` | SiteAppearance | Appearance |
| `/panel/admin/gallery` | GalleryManagement | Gallery |
| `/panel/admin/settings-limits` | SettingsLimits | Settings limits |
| `/panel/admin/video-encoding` | VideoEncoding | Video encoding |
| `/panel/admin/custom-code` | CustomCodeEditor | Custom code |
| `/panel/admin/languages` | Languages | Languages |
| `/panel/admin/pwa-settings` | PWASettings | PWA settings |
| `/panel/admin/social-profiles` | SocialProfiles | Social profiles |
| `/panel/admin/google-settings` | GoogleSettings | Google settings |

## Legacy Redirects

| Old Path | Redirects To |
|----------|--------------|
| `/starz-studio` | `/breeding-zone` |
| `/starz-membership` | `/breeding-zone` |
| `/panel/admin` | `/panel/admin/dashboard` |
| `/admin` | `/panel/admin/dashboard` |
| `/admin/dashboard` | `/panel/admin/dashboard` |
| `/admin/messages` | `/panel/admin/messages` |
| `/admin/categories` | `/panel/admin/categories` |
| `/admin/shop` | `/panel/admin/shop` |
| `/admin/stories` | `/panel/admin/stories` |
| `/admin/streaming` | `/panel/admin/streaming` |
| `/admin/posts` | `/panel/admin/posts` |
| `/admin/themes` | `/panel/admin/themes` |
| `/admin/users` | `/panel/admin/users` |
| `/admin/tax-rates` | `/panel/admin/tax-rates` |
| `/admin/deposits` | `/panel/admin/deposits` |
| `/admin/announcements` | `/panel/admin/announcements` |
| `/admin/push-notifications` | `/panel/admin/push-notifications` |
| `/admin/email-marketing` | `/panel/admin/email-marketing` |
| `/admin/system-settings` | `/panel/admin/system-settings` |

## Route Count Summary

- **Public Routes**: 48
- **Protected Routes**: 95
- **Admin Routes**: 52
- **Legacy Redirects**: 18
- **Total**: 213

