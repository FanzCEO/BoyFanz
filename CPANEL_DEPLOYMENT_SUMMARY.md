# BoyFanz v1 - cPanel Deployment Summary

## 🎯 Quick Reference

### Server Credentials
```
Domain:         boyzapp.com
IP Address:     67.217.54.66
cPanel User:    boyzapp
cPanel Pass:    Bama@11061990
cPanel URL:     https://67.217.54.66:2083
Email:          Josh@fanzunlimited.com
Nameservers:    ns1.fanzgroupholdings.com
                ns2.fanzgroupholdings.com
```

## ✅ Deployment Files Created

### 1. Configuration Files
- ✅ `.env.production` - Production environment variables
- ✅ `CPANEL_DEPLOYMENT_GUIDE.md` - Complete 20-page deployment guide
- ✅ `database/init-cpanel-database.sql` - Database initialization script
- ✅ `create-deployment-package.sh` - Automated packaging script

### 2. Build Output
- ✅ `dist/` - Production build (completed successfully)
- ✅ `dist/public/` - Static frontend assets (2.5MB)
- ✅ `dist/index.js` - Server bundle (1.8MB)
- ✅ All dependencies bundled and ready

## 🚀 30-Second Quick Deploy

### 1. Create Package
```bash
cd /Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz
./create-deployment-package.sh
```

### 2. Upload to Server
```bash
scp boyfanz-deploy-*.tar.gz boyzapp@67.217.54.66:/home/boyzapp/
```

### 3. Extract & Deploy
```bash
ssh boyzapp@67.217.54.66
cd /home/boyzapp
tar -xzf boyfanz-deploy-*.tar.gz
cd boyfanz-deploy
```

### 4. Setup Database
```bash
# In cPanel: Create database "boyzapp_db" and user "boyzapp_user"
psql -U boyzapp_user -d boyzapp_db -f database/init-cpanel-database.sql
```

### 5. Configure & Start
```bash
cp .env.example .env
nano .env  # Update credentials
npm install --production
./start.sh
```

## 📋 Pre-Deployment Checklist

### cPanel Setup
- [ ] Access cPanel at https://67.217.54.66:2083
- [ ] Create PostgreSQL database: `boyzapp_db`
- [ ] Create PostgreSQL user: `boyzapp_user`
- [ ] Grant all privileges to user
- [ ] Install Node.js 18+ (Software > Setup Node.js App)

### Environment Configuration
- [ ] Copy .env.example to .env
- [ ] Set `DATABASE_URL` with PostgreSQL credentials
- [ ] Generate `JWT_SECRET`: `openssl rand -hex 32`
- [ ] Generate `SESSION_SECRET`: `openssl rand -hex 32`
- [ ] Set `WEB_APP_URL=https://boyzapp.com`
- [ ] Configure payment gateway credentials (CCBill, Segpay)

### DNS & SSL
- [ ] Point domain to 67.217.54.66
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Enable HTTPS redirect
- [ ] Verify domain resolves correctly

## 🗄️ Database Information

### Tables Created (15 Core Tables)
1. **users** - User accounts and authentication
2. **user_profiles** - Extended user information
3. **user_sessions** - Session management
4. **posts** - Content posts
5. **comments** - Post comments
6. **likes** - Post likes
7. **subscriptions** - Creator subscriptions
8. **followers** - Follow relationships
9. **messages** - Direct messaging
10. **notifications** - User notifications
11. **transactions** - Payment transactions
12. **creator_earnings** - Creator revenue
13. **media_files** - Uploaded media

### Views Created
- `active_subscriptions` - Active subscription details
- `user_stats` - User statistics aggregation

### Default Admin Account
```
Email:    Josh@fanzunlimited.com
Password: admin123
⚠️  CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
```

## 🔧 Application Startup

### Option A: cPanel Node.js App (Recommended)
1. Go to **Software > Setup Node.js App**
2. Click **Create Application**
3. Settings:
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `/home/boyzapp/boyfanz-deploy`
   - **Application URL**: `boyzapp.com`
   - **Application Startup File**: `dist/index.js`
4. Click **Create** and **Start**

### Option B: PM2 Process Manager
```bash
npm install -g pm2
pm2 start dist/index.js --name boyfanz
pm2 save
pm2 startup
```

### Option C: Startup Script
```bash
./start.sh
```

## 📊 Post-Deployment Tasks

### 1. Security
```bash
# Change default admin password immediately
# Login at: https://boyzapp.com
# Email: Josh@fanzunlimited.com
# Default password: admin123
```

### 2. Email Configuration
Create email account in cPanel:
```
Email: noreply@boyzapp.com
```

Add to .env:
```env
SMTP_HOST=mail.boyzapp.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@boyzapp.com
SMTP_PASSWORD=your_email_password
```

### 3. Cron Jobs
In cPanel > Advanced > Cron Jobs:

**Database Backup (Daily at 3 AM)**
```bash
0 3 * * * cd /home/boyzapp/boyfanz-deploy && pg_dump -U boyzapp_user boyzapp_db | gzip > ~/backups/db_$(date +\%Y\%m\%d).sql.gz
```

**Session Cleanup (Daily at 2 AM)**
```bash
0 2 * * * cd /home/boyzapp/boyfanz-deploy && node dist/scripts/cleanup.js
```

### 4. File Upload Limits
In cPanel > Software > Select PHP Version > Options:
- `upload_max_filesize`: 100M
- `post_max_size`: 100M
- `max_execution_time`: 300

## 🔍 Verification Steps

### 1. Check Application Status
```bash
# If using PM2
pm2 status
pm2 logs boyfanz

# If using cPanel
tail -f ~/logs/nodejs.log
```

### 2. Test Website
```bash
# Test local
curl http://localhost:3000

# Test domain
curl https://boyzapp.com

# Test API
curl https://boyzapp.com/api/health
```

Expected response:
```json
{"status":"ok","database":"connected"}
```

### 3. Test Features
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Login/logout functions
- [ ] Post creation works
- [ ] Image upload works
- [ ] Database queries execute
- [ ] SSL certificate active

## 🐛 Troubleshooting

### Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Check environment
cat .env | grep DATABASE_URL

# Check logs
pm2 logs boyfanz --lines 50
tail -f ~/logs/nodejs.log
```

### Database Connection Errors
```bash
# Test connection
psql -U boyzapp_user -d boyzapp_db -h localhost

# Verify credentials in .env
grep DATABASE_URL .env
```

### Port Already in Use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Restart
pm2 restart boyfanz
```

### Permission Errors
```bash
# Fix ownership
chown -R boyzapp:boyzapp /home/boyzapp/boyfanz-deploy

# Fix permissions
chmod -R 755 /home/boyzapp/boyfanz-deploy
chmod 644 /home/boyzapp/boyfanz-deploy/.env
```

## 📈 Performance Optimization

### Enable Caching
Add to `.htaccess`:
```apache
<FilesMatch "\.(jpg|jpeg|png|gif|js|css|ico|svg)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### Enable Compression
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

## 📚 Documentation

### Full Guides
- **CPANEL_DEPLOYMENT_GUIDE.md** - Complete 20-page deployment guide
- **database/README.md** - Database schema documentation
- **INSTALL.txt** - Quick installation instructions

### Quick Commands
```bash
# SSH Login
ssh boyzapp@67.217.54.66

# App directory
cd /home/boyzapp/boyfanz-deploy

# View logs
pm2 logs boyfanz
tail -f ~/logs/nodejs.log

# Restart
pm2 restart boyfanz

# Database access
psql -U boyzapp_user -d boyzapp_db

# Generate secrets
openssl rand -hex 32
```

## ✅ Final Checklist

Before going live:
- [ ] Deployment package created and uploaded
- [ ] Database created and initialized
- [ ] Environment variables configured
- [ ] Application started successfully
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Default admin password changed
- [ ] Email service configured
- [ ] Cron jobs set up
- [ ] Backups configured
- [ ] File upload limits increased
- [ ] Application tested and verified
- [ ] Payment gateways configured (if using)
- [ ] Monitoring enabled

## 🎯 Next Steps

### Immediate
1. Change admin password
2. Test all features
3. Configure email service
4. Set up backups
5. Enable monitoring

### Short Term
1. Configure payment gateways
2. Setup content moderation
3. Create user documentation
4. Plan marketing strategy
5. Configure analytics

### Long Term
1. Scale infrastructure as needed
2. Add additional features
3. Optimize performance
4. Expand platform
5. Build community

## 💰 Estimated Costs

### Server
- cPanel Hosting: ~$30-50/month
- PostgreSQL Database: Included with hosting
- SSL Certificate: Free (Let's Encrypt)

### Payment Processing
- CCBill: 10-15% transaction fee
- Segpay: 10-15% transaction fee

### Optional Services
- Email Service: $10-20/month
- CDN: $5-20/month
- Monitoring: $10-30/month

**Total Monthly**: ~$50-130/month (base hosting + essential services)

## 📞 Support

### Contact
- **Email**: Josh@fanzunlimited.com
- **Server IP**: 67.217.54.66
- **cPanel**: https://67.217.54.66:2083

### Resources
- cPanel Documentation: https://docs.cpanel.net/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Node.js on cPanel: https://docs.cpanel.net/ea4/experimental/nodejs/

---

**Generated**: 2025-11-16
**Version**: 1.0.0
**Platform**: BoyFanz v1
**Server**: boyzapp.com (67.217.54.66)
**Status**: ✅ Ready for Deployment
