# BoyFanz Backend Route Inventory

Generated: 2026-01-06

## Route Registration Order (Critical for Collisions)

Routes are registered in `server/routes.ts` and `server/index.ts` in this order:

1. `setupHealthEndpoints(app)` - Health checks (index.ts)
2. `setupCSRFTokenEndpoint(app)` - CSRF tokens (index.ts)
3. Stripe webhook `/api/webhooks/getstream` (index.ts:80)
4. `app.use(ssoRoutes)` - SSO routes (routes.ts:245)
5. `app.use("/api/data-retention", dataRetentionRoutes)` (routes.ts:248)
6. Many inline routes in routes.ts
7. `app.use('/api/auth', authRoutes)` (routes.ts:5804) **COLLISION POINT**

## Authentication Routes

### ssoRoutes.ts (Mounted first at routes.ts:245)
| Path | Method | Description |
|------|--------|-------------|
| `/login` | GET | Redirect to FanzSSO |
| `/auth/sso/login` | GET | Redirect to FanzSSO |
| `/auth/sso/callback` | GET | SSO callback handler |
| `/logout` | POST | Logout (local or global) |
| `/api/logout` | POST | API logout endpoint |
| `/auth/sso/logout` | POST | SSO logout |
| `/api/logout` | GET | API logout (SPA clients) |
| `/api/auth/user` | GET | **Get current user** |
| `/api/auth/session` | GET | Get session status |
| `/api/auth/check-admin` | GET | Check admin privileges |
| `/api/platform/current` | GET | Platform metadata |

### authRoutes.ts (Mounted at routes.ts:5808 as `/api/auth`)
| Path | Method | Description |
|------|--------|-------------|
| `/register` → `/api/auth/register` | POST | Email/password register (forwards to SSO) |
| `/login` → `/api/auth/login` | POST | Email/password login (forwards to SSO) |
| `/logout` → `/api/auth/logout` | POST | Email/password logout |
| ~~`/session`~~ | - | ✅ REMOVED - handled by ssoRoutes |
| ~~`/user`~~ | - | ✅ REMOVED - handled by ssoRoutes |

### auth.ts (setupLocalAuth - NEVER CALLED, DEAD CODE)
| Path | Method | Description |
|------|--------|-------------|
| `/api/register` | POST | Register (DEAD) |
| `/api/login` | POST | Login (DEAD) |
| `/api/logout` | POST | Logout (DEAD) |
| `/api/auth/user` | GET | Get user (DEAD) |

## Route Collision Summary

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/auth/user` | ✅ RESOLVED | Duplicate removed from authRoutes.ts |
| `/api/auth/session` | ✅ RESOLVED | Duplicate removed from authRoutes.ts |

**All route collisions have been resolved.**

## Main Routes (routes.ts inline definitions)

### Admin Routes
| Path | Method | Description |
|------|--------|-------------|
| `/api/admin/analytics` | GET/POST | Analytics data |
| `/api/admin/appearance` | GET/PUT | Site appearance |
| `/api/admin/audit` | GET | Audit logs |
| `/api/admin/bookings` | GET/POST | Booking management |
| `/api/admin/branding` | GET/PUT/POST | Branding assets |
| `/api/admin/compliance` | GET | Compliance status |
| `/api/admin/creator-health` | GET | Creator health metrics |
| `/api/admin/delegated-permissions/my` | GET | User's delegated permissions |
| `/api/admin/experiments` | GET/POST | A/B experiments |
| `/api/admin/fraud` | GET/POST | Fraud detection |
| `/api/admin/gallery` | GET/POST/PUT/DELETE | Gallery management |
| `/api/admin/moderation` | GET/POST | Content moderation |
| `/api/admin/revenue` | GET | Revenue analytics |
| `/api/admin/support-tickets` | GET/POST | Support tickets |

### Content Routes
| Path | Method | Description |
|------|--------|-------------|
| `/api/content/feed` | GET | Content feed |
| `/api/infinity-feed` | GET | Infinite scroll feed |
| `/api/posts/:postId` | GET/PUT/DELETE | Post CRUD |
| `/api/posts/:postId/react` | POST | React to post |
| `/api/posts/:postId/save` | POST | Save post |
| `/api/posts/:postId/repost` | POST | Repost |
| `/api/posts/:postId/quote` | POST | Quote post |
| `/api/reels` | GET/POST | Reels content |
| `/api/stories` | GET/POST | Stories |

### Creator Routes
| Path | Method | Description |
|------|--------|-------------|
| `/api/creators/discover` | GET | Discover creators |
| `/api/creators/:creatorId` | GET | Creator profile |
| `/api/creators/:creatorId/subscribe` | POST | Subscribe |
| `/api/creator/analytics` | GET | Creator analytics |
| `/api/creator/free-links` | GET/POST | Free links |
| `/api/creator-pro/*` | Various | Creator Pro features |

### Modular Route Files

#### forumRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/categories` | GET/POST | Forum categories |
| `/categories/:slug` | GET | Category by slug |
| `/topics` | GET/POST | Topics |
| `/topics/:id` | GET/PUT/DELETE | Topic by ID |
| `/topics/:id/replies` | POST | Reply to topic |
| `/topics/:id/like` | POST | Like topic |
| `/reputation/:userId` | GET | User reputation |

#### fuckBuddyRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/:userId` | GET | Get fuck buddies |
| `/:userId/top-eight` | GET | Top eight |
| `/request/:requestId/respond` | POST | Respond to request |
| `/search` | GET | Search for buddies |

#### liveChatRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/sessions` | GET/POST | Chat sessions |
| `/sessions/:id/messages` | GET/POST | Session messages |
| `/sessions/:id/close` | POST | Close session |

#### customRequestRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/` | GET/POST | List/create requests |
| `/:requestId` | GET | Get request |
| `/:requestId/respond` | POST | Respond |
| `/:requestId/approve` | POST | Approve |
| `/:requestId/pay` | POST | Pay |
| `/:requestId/start` | POST | Start work |
| `/:requestId/deliver` | POST | Deliver |
| `/:requestId/dispute` | POST | Dispute |

#### dataRetentionRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/dashboard` | GET | GDPR dashboard |
| `/consent` | GET/POST | Consent management |
| `/export` | POST | Request data export |
| `/delete` | POST | Request deletion |
| `/delete/:deletionId/cancel` | POST | Cancel deletion |
| `/admin/stats` | GET | Admin stats |
| `/admin/trigger-deletions` | POST | Trigger deletions |
| `/admin/trigger-exports` | POST | Trigger exports |
| `/admin/legal-hold` | POST | Legal hold |

#### battlesRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/` | GET/POST | Battles list/create |
| `/:battleId` | GET | Battle details |
| `/:battleId/vote` | POST | Vote in battle |
| `/:battleId/join` | POST | Join battle |

#### gamificationRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/achievements` | GET | User achievements |
| `/leaderboard` | GET | Leaderboard |
| `/challenges` | GET | Active challenges |
| `/rewards/claim` | POST | Claim rewards |

#### tipGamesRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/` | GET/POST | Tip games |
| `/admin/all` | GET | Admin view all |
| `/:gameId` | GET | Game details |
| `/:gameId/play` | POST | Play game |

#### streamingRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/streams` | GET/POST | Streams |
| `/streams/:id` | GET | Stream details |
| `/streams/:id/start` | POST | Start stream |
| `/streams/:id/stop` | POST | Stop stream |
| `/streams/:id/tip` | POST | Send tip |

#### liveEventsRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/` | GET/POST | Events |
| `/:eventId` | GET | Event details |
| `/:eventId/join` | POST | Join event |
| `/:eventId/leave` | POST | Leave event |
| `/:eventId/tip` | POST | Tip at event |
| `/:eventId/purchase-ticket` | POST | Buy ticket |
| `/:eventId/start` | POST | Start event |
| `/:eventId/end` | POST | End event |
| `/:eventId/cancel` | POST | Cancel event |

#### paymentRoutes.ts (payments.ts)
| Path | Method | Description |
|------|--------|-------------|
| `/ccbill/create-flexform` | POST | Create CCBill FlexForm |
| `/ccbill/payment-tokens` | GET | List payment tokens |
| `/ccbill/payment-tokens/:id` | DELETE | Remove token |
| `/crypto/rates` | GET | Crypto rates |
| `/crypto/:paymentId` | GET | Payment status |
| `/crypto/:paymentId/refund` | POST | Refund |
| `/webhooks/ccbill` | POST | CCBill webhook |

#### helpSupportRoutes.ts
| Path | Method | Description |
|------|--------|-------------|
| `/search` | GET | AI search |
| `/tickets` | GET/POST | Tickets |
| `/tickets/:id` | GET | Ticket detail |
| `/tickets/:id/comments` | POST | Add comment |
| `/tickets/:id/status` | PUT | Update status |
| `/chat/live/:sessionId/messages` | GET | Chat messages |
| `/chat/live/:sessionId/send` | POST | Send message |
| `/faq` | GET | FAQ list |
| `/wiki` | GET | Wiki articles |
| `/wiki/:slug` | GET | Article by slug |

## Health & Utility Routes

| Path | Method | Description |
|------|--------|-------------|
| `/health` | GET | Basic health check |
| `/health/ready` | GET | Readiness probe |
| `/health/live` | GET | Liveness probe |
| `/api/csrf-token` | GET | Get CSRF token |
| `/api/upload/get-url` | POST | Get signed upload URL |
| `/api/mediahub/upload/:id/chunk` | POST | Upload chunk |
| `/api/mediahub/upload/:id/complete` | POST | Complete upload |

## Webhook Routes

| Path | Method | Description |
|------|--------|-------------|
| `/api/webhooks/getstream` | POST | GetStream events |
| `/api/webhooks/ccbill` | POST | CCBill events |
| `/api/webhooks/fanzcard` | POST | FanzCard events |

## Summary

- **Total Route Files**: 94+ in `/server/routes/`
- **Route Collisions**: ✅ 0 (2 were found and fixed)
- **Dead Code Routes**: 4 (in auth.ts setupLocalAuth - marked deprecated)
- **Estimated Total Endpoints**: 500+
- **Stub Endpoints Added**: 5 (marketplace, groups, collaborations)

