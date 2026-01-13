# FANZ Infrastructure Status

**Last Updated:** 2026-01-13 05:40 UTC

---

## Server Architecture

| Server | IP Address | Role | Status |
|--------|------------|------|--------|
| Server A | 162.246.18.126 | Platform Services | Online |
| Server B | 67.211.216.30 | Admin/AI/Control Services | Online |
| Server C | 64.20.46.122 | Database Only | Online (No public DNS) |
| Server D | 67.217.54.66 | Legacy (Draining) | Deprecated |

---

## Server A - Platform Services (162.246.18.126)

### Platform Subdomains
| Subdomain | Status |
|-----------|--------|
| boyfanz.fanz.website | Active |
| girlfanz.fanz.website | Active |
| pupfanz.fanz.website | Active |
| taboofanz.fanz.website | Active |
| transfanz.fanz.website | Active |
| bearfanz.fanz.website | Active |
| milffanz.fanz.website | Active |
| cougarfanz.fanz.website | Active |
| brofanz.fanz.website | Active |
| femmefanz.fanz.website | Active |
| daddyfanz.fanz.website | Active |
| southernfanz.fanz.website | Active |
| gayfanz.fanz.website | Active |

### Other Services
| Subdomain | Status |
|-----------|--------|
| api.fanz.website | Active |
| app.fanz.website | Active |
| admin.fanz.website | Active |
| database.fanz.website | Active |
| postgres.fanz.website | Active |

---

## Server B - Admin/AI/Control Services (67.211.216.30)

### Core Services
| Subdomain | Port | PM2 Status | SSL Expiry |
|-----------|------|------------|------------|
| dash.fanz.website | 3001 | Online | Apr 13, 2026 |
| sso.fanz.website | 3002 | Online | Apr 13, 2026 |
| sdk.fanz.website | 3003 | Online | Apr 13, 2026 |
| studio.fanz.website | 3004 | Online | Apr 13, 2026 |
| tools.fanz.website | 3005 | Online | Apr 13, 2026 |

### Recently Migrated (from Server C)
| Subdomain | Port | PM2 Status | SSL Expiry | Migration Date |
|-----------|------|------------|------------|----------------|
| link.fanz.website | 3008 | Online | Apr 13, 2026 | 2026-01-13 |
| vault.fanz.website | 3009 | Online | Apr 13, 2026 | 2026-01-13 |
| drop.fanz.website | 3010 | Online | Apr 13, 2026 | 2026-01-13 |
| forge.fanz.website | 3012 | Online | Apr 13, 2026 | 2026-01-13 |
| meet.fanz.website | 3011 | Online | Apr 13, 2026 | 2026-01-13 |

### AI/Bot Services
| Subdomain | Status |
|-----------|--------|
| ai.fanz.website | Active |
| bot.fanz.website | Active |
| gpt.fanz.website | Active |
| defender.fanz.website | Active |

### Business Services
| Subdomain | Status |
|-----------|--------|
| crm.fanz.website | Active |
| landing.fanz.website | Active |
| kb.fanz.website | Active |
| media.fanz.website | Active |
| money.fanz.website | Active |
| prospectus.fanz.website | Active |
| affiliate.fanz.website | Active |
| work.fanz.website | Active |
| protect.fanz.website | Active |

---

## Server C - Database Only (64.20.46.122)

**Purpose:** PostgreSQL database server only - no public-facing services

**Public DNS Records:** None (correct configuration)

**Internal Access:** Via private network or SSH tunnel only

---

## External Services

| Service | DNS Record | Target |
|---------|------------|--------|
| db.fanz.website | CNAME | mcayxybcgxhfttvwmhgm.supabase.co |

---

## Recent Changes Log

### 2026-01-13
- **DNS Migration:** Moved 5 subdomains from Server C (64.20.46.122) to Server B (67.211.216.30)
  - link, vault, drop, forge, meet
- **SSL Certificates:** Generated Let's Encrypt certs for all 5 migrated subdomains
- **Bug Fix:** Fixed forge.fanz.website 502 error (nginx port mismatch 4006 → 3012)
- **Verification:** Confirmed no remaining DNS records pointing to 64.20.46.122

---

## Health Check Commands

```bash
# Check all Server B services
ssh root@67.211.216.30 "pm2 list"

# Test migrated subdomains
for d in link vault drop forge meet; do
  curl -sI "https://$d.fanz.website" | head -1
done

# Verify no DNS pointing to Server C
dig +short link.fanz.website vault.fanz.website drop.fanz.website forge.fanz.website meet.fanz.website
```

---

## SSL Certificate Renewal

All certificates managed by certbot with auto-renewal enabled.

**Expiry Date:** April 13, 2026

**Renewal Command (if needed):**
```bash
ssh root@67.211.216.30 "certbot renew"
```

---

## Contact

Platform Owner: Wyatt Cole / Joshua Stone
Company: FANZ Group Holdings LLC
