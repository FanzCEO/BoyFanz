# FANZ Development Rules for Claude

## CRITICAL - HIGHEST PRIORITY

### Platform Deployment Lock System

**NEVER deploy to a locked platform without authorization.** This is a non-negotiable security requirement.

#### Before ANY Deployment to These Platforms:

1. **Check if platform is locked:**
   ```bash
   ssh fanz 'test -f /var/www/<platform>/.deploy-lock && echo "LOCKED" || echo "unlocked"'
   ```

2. **If locked, MUST verify with user's code first:**
   ```bash
   ssh fanz '/var/www/<platform>/verify-deploy.sh "<USER_PROVIDED_CODE>"'
   ```

3. **Only proceed if verification succeeds**

#### Locked Platforms (require code before deployment):
- **boyfanz** - `/var/www/boyfanz` - LOCKED
- More platforms will be added here as they are set up

#### Lock Setup for New Platforms:
When setting up a new platform, ALWAYS run:
```bash
/Users/wyattcole/Projects/FANZ/platform-lock-template/setup-platform-lock.sh <platform> /var/www/<platform>
```

#### Authorization Code Hash:
- SHA-256: `9fd74769485c33ebaca8be3a4e9142ca99539eca9ec5e419b8601176e9ef9a44`
- Ask user for code if needed - NEVER guess or bypass

---

## Password Security

All user passwords MUST be hashed with bcrypt. Never store plain text passwords.

---

## Deployment Order

1. Build locally: `npm run build`
2. **Check platform lock status**
3. **Verify authorization if locked**
4. Deploy: `rsync -avz dist/ fanz:/var/www/<platform>/dist/`
5. Restart: `pm2 restart <platform>`

---

## MCP Server Tools

Use the `mcp__fanz__*` tools for:
- Platform status checks
- User management
- Database queries
- Restarts (after authorized deployment)

---

## Contact

Platform owner: Wyatt
All deployment authorization goes through Wyatt's code.
