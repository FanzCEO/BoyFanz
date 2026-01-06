# FANZ Development Rules for Claude

## CRITICAL - HIGHEST PRIORITY

### Platform Deployment Lock System

**NEVER deploy to a locked platform without authorization.** This is a non-negotiable security requirement.

#### Before ANY Deployment to BoyFanz:

1. **Check if platform is locked:**
   ```bash
   test -f /var/www/boyfanz/.deploy-lock && echo "LOCKED" || echo "unlocked"
   ```

2. **If locked, MUST verify with user code first:**
   ```bash
   /var/www/boyfanz/verify-deploy.sh "<USER_PROVIDED_CODE>"
   ```

3. **Only proceed if verification succeeds**

#### This Platform is: LOCKED
- Requires authorization code before deployment
- SHA-256 Hash: `91d24fe509143191d1de388e8d62584fb4cd0a569f95f6d7d28927e7943f0fad`
- Ask user for code if needed - NEVER guess or bypass

---

## Password Security

All user passwords MUST be hashed with bcrypt. Never store plain text passwords.

---

## Deployment Order

1. Build locally: `npm run build`
2. **Check platform lock status**
3. **Verify authorization if locked**
4. Deploy: `rsync -avz dist/ fanz:/var/www/boyfanz/dist/`
5. Restart: `pm2 restart boyfanz`

---

## Contact

Platform owner: Wyatt
All deployment authorization goes through Wyatt code.
