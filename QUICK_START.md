# BoyFanz - Quick Start Guide

## 🎯 Your Platform is LIVE!

**Production URL:** https://boyzapp.com

## 🔐 GitHub Secrets Required

Add these 3 secrets in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|-------|
| `SERVER_HOST` | `67.217.54.66` |
| `SERVER_USER` | `root` |
| `SSH_PRIVATE_KEY` | See GITHUB_ACTIONS_SETUP.md |

## 🚀 Auto-Deploy is Active

Every `git push` to main/master will automatically:
1. Build your app
2. Deploy to production
3. Restart backend server
4. Update frontend files

## 📱 Current Stack

**Frontend:**
- React 19 + Vite
- TailwindCSS
- PWA enabled
- Service Worker registered

**Backend:**
- Node.js 20 + Express
- PM2 process manager (port 3100)
- PostgreSQL database (boyzapp_db)
- 45+ database tables

**Server:**
- AlmaLinux 9.7
- nginx + Apache
- SSL/HTTPS enabled
- WebSocket support

## 🔧 Useful Commands

```bash
# View backend logs
ssh root@67.217.54.66 'pm2 logs boyzapp'

# Restart backend
ssh root@67.217.54.66 'pm2 restart boyzapp'

# Check server status
ssh root@67.217.54.66 'pm2 status'

# Database access
ssh root@67.217.54.66 'sudo -u postgres psql boyzapp_db'

# View Apache logs
ssh root@67.217.54.66 'tail -f /var/log/httpd/boyzapp.com-error_log'
```

## 🎨 Features Enabled

✅ User Authentication
✅ Profile Management
✅ Content Upload/Streaming
✅ Subscriptions & Payments
✅ Messaging & Chat
✅ Notifications
✅ Analytics Dashboard
✅ Admin Panel
✅ Age Verification
✅ Content Moderation
✅ PWA/Mobile Support
✅ Real-time Features

## 🔥 Next Steps

1. **Add GitHub Secrets** (see GITHUB_ACTIONS_SETUP.md)
2. **Push code to trigger first auto-deploy**
3. **Test the live site** at https://boyzapp.com
4. **Customize branding** and content
5. **Configure payment providers**
6. **Set up email service**
7. **Add Stream.io API keys** for chat

---

**🚀 You're all set! Happy coding!**
