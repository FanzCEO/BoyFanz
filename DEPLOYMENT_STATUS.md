# BoyFanz Deployment Status

**Last Updated:** 2026-01-06 12:52 UTC

## Current CI/CD Status

### GitHub Actions Pipeline
- **Workflow:** `Deploy BoyFanz via SSH`
- **Status:** FIXING SSH AUTH
- **Trigger:** Push to `main` branch

### Recent Commits
| Commit | Description | Status |
|--------|-------------|--------|
| `af4061e` | Fix Admin folder casing for Linux | SSH AUTH FAILED |
| `5940576` | Use npm install instead of ci | BUILD PASSED |
| `b321e91` | Add CI/CD pipeline + liveChatRoutes | INITIAL SETUP |

## Issues Fixed

### 1. Admin Folder Case Sensitivity
- **Problem:** Git had `client/src/pages/Admin/` (capital A), disk had `admin/` (lowercase)
- **Impact:** GitHub Actions (Linux) couldn't find files due to case sensitivity
- **Fix:** Renamed folder in git index to lowercase `admin/`

### 2. Missing liveChatRoutes Import
- **Problem:** `server/routes/liveChatRoutes.ts` existed but was never imported
- **Impact:** `/api/help/support/status` returned 404
- **Fix:** Added import and `app.use('/api/help', liveChatRoutes)` in `server/routes.ts`

### 3. npm ci Without Lock File
- **Problem:** `.gitignore` excluded `package-lock.json`
- **Impact:** `npm ci` failed in GitHub Actions
- **Fix:** Changed to `npm install` in workflow

## Pending Issues

### SSH Authentication for Deployment
- **Problem:** GitHub Actions can't SSH to 67.217.54.66
- **Cause:** Wrong SSH key in GitHub secrets (deploy key != server access key)
- **Solution:** Need server's authorized SSH private key in secrets

## Server Details

| Property | Value |
|----------|-------|
| Server IP | 67.217.54.66 |
| App Directory | /var/www/boyfanz |
| PM2 Process | boyfanz |
| Port | 3202 |
| Node | v20.x |

## Repository

- **GitHub:** https://github.com/FanzCEO/BoyFanz
- **Branch:** main
- **Local Path:** /Users/wyattcole/The Correct Platforms/boyfanz

## Backup Locations

- Server backup: `/var/backups/boyfanz-20260106-*.tar.gz`
- iCloud: (configured separately)
- Dropbox: (configured separately)
