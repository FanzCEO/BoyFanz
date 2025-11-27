# BoyFanz v1 - cPanel Deployment Guide

## Server Information
- **Domain**: boyzapp.com
- **IP Address**: 67.217.54.66
- **cPanel Username**: boyzapp
- **cPanel Password**: Bama@11061990
- **Nameservers**:
  - ns1.fanzgroupholdings.com
  - ns2.fanzgroupholdings.com
- **Contact Email**: Josh@fanzunlimited.com

## Pre-Deployment Checklist

### 1. Server Access
- [ ] cPanel URL: https://67.217.54.66:2083
- [ ] Login with credentials above
- [ ] Verify domain is active

### 2. Required Software (Install via cPanel)
- [ ] Node.js 18+ (Setup Node.js in cPanel > Software)
- [ ] PostgreSQL 14+ (Database > PostgreSQL Databases)
- [ ] PM2 or Node.js process manager

## Deployment Steps

### Step 1: Database Setup

1. **Create PostgreSQL Database**
   - Login to cPanel
   - Go to **Databases > PostgreSQL Databases**
   - Create database: `boyzapp_db`
   - Create user: `boyzapp_user`
   - Set strong password (save it for .env)
   - Grant ALL PRIVILEGES to user on database

2. **Import Database Schema**
   ```bash
   # SSH into server or use cPanel Terminal
   cd /home/boyzapp/boyfanz
   psql -U boyzapp_user -d boyzapp_db -f database/complete-schema.sql
   ```

### Step 2: Upload Application Files

#### Option A: Using cPanel File Manager
1. Go to **Files > File Manager**
2. Navigate to `/home/boyzapp/public_html`
3. Upload the deployment package: `boyfanz-deploy.tar.gz`
4. Extract the archive

#### Option B: Using SSH/SCP
```bash
# From your local machine
cd /Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz
tar -czf boyfanz-deploy.tar.gz \
  dist/ \
  node_modules/ \
  package.json \
  package-lock.json \
  .env.production \
  database/

# Upload to server
scp boyfanz-deploy.tar.gz boyzapp@67.217.54.66:/home/boyzapp/
ssh boyzapp@67.217.54.66
cd /home/boyzapp
tar -xzf boyfanz-deploy.tar.gz
```

#### Option C: Using Git (Recommended)
```bash
# SSH into server
ssh boyzapp@67.217.54.66

# Clone repository
cd /home/boyzapp
git clone <your-repo-url> boyfanz
cd boyfanz

# Install dependencies
npm install --production
# or
pnpm install --production
```

### Step 3: Configure Environment Variables

1. **Copy and Edit .env File**
   ```bash
   cd /home/boyzapp/boyfanz
   cp .env.production .env
   nano .env
   ```

2. **Generate Secrets**
   ```bash
   # Generate JWT Secret
   openssl rand -hex 32

   # Generate Session Secret
   openssl rand -hex 32
   ```

3. **Update .env File**
   - Set `DATABASE_URL` with your PostgreSQL credentials
   - Set `JWT_SECRET` with generated secret
   - Set `SESSION_SECRET` with generated secret
   - Update `PGPASSWORD` with your database password
   - Configure payment gateway credentials
   - Set `WEB_APP_URL=https://boyzapp.com`

### Step 4: Setup Node.js Application

1. **Install Node.js via cPanel**
   - Go to **Software > Setup Node.js App**
   - Click **Create Application**
   - Node.js Version: 18.x or higher
   - Application Mode: Production
   - Application Root: `/home/boyzapp/boyfanz`
   - Application URL: `boyzapp.com`
   - Application Startup File: `dist/index.js`
   - Passenger log file: `/home/boyzapp/logs/nodejs.log`

2. **Or Setup PM2 (Alternative)**
   ```bash
   # Install PM2 globally
   npm install -g pm2

   # Start application
   pm2 start dist/index.js --name boyfanz

   # Save PM2 process list
   pm2 save

   # Setup PM2 to start on boot
   pm2 startup
   ```

### Step 5: Configure Web Server

#### Using cPanel Node.js App (Recommended)
- The application is automatically configured when you create the Node.js app
- cPanel will handle the proxy configuration

#### Manual Apache Configuration (if needed)
Create `.htaccess` in `/home/boyzapp/public_html`:

```apache
# Disable directory browsing
Options -Indexes

# Enable rewrite engine
RewriteEngine On

# Redirect all requests to Node.js app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Enable HTTPS redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Step 6: SSL Certificate Setup

1. **Install SSL Certificate**
   - Go to **Security > SSL/TLS**
   - Click **Manage SSL Sites**
   - Select domain: `boyzapp.com`
   - Install AutoSSL (Let's Encrypt) or upload custom certificate

2. **Force HTTPS**
   - Already configured in `.htaccess` above

### Step 7: File Permissions

```bash
# Set correct permissions
cd /home/boyzapp/boyfanz
chmod 755 dist/
chmod 644 .env
chmod -R 755 node_modules/
```

### Step 8: Start the Application

#### Using cPanel Node.js App
1. Go to **Software > Setup Node.js App**
2. Click on your application
3. Click **Restart** or **Start**

#### Using PM2
```bash
pm2 start boyfanz
pm2 status
```

### Step 9: Verify Deployment

1. **Check Application Status**
   ```bash
   # If using PM2
   pm2 status
   pm2 logs boyfanz

   # If using cPanel
   tail -f /home/boyzapp/logs/nodejs.log
   ```

2. **Test the Website**
   - Visit: https://boyzapp.com
   - Check homepage loads
   - Test user registration
   - Verify database connection

3. **Check Application Health**
   ```bash
   curl http://localhost:3000/api/health
   # or
   curl https://boyzapp.com/api/health
   ```

## Post-Deployment Configuration

### Email Setup

1. **Configure Email Accounts**
   - Go to **Email > Email Accounts**
   - Create: `noreply@boyzapp.com`
   - Update `.env` with SMTP settings

2. **SMTP Configuration** (Add to .env)
   ```env
   SMTP_HOST=mail.boyzapp.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=noreply@boyzapp.com
   SMTP_PASSWORD=your_email_password
   ```

### Cron Jobs for Background Tasks

1. **Setup Cron Jobs**
   - Go to **Advanced > Cron Jobs**

2. **Add Cleanup Job** (Daily at 2 AM)
   ```bash
   0 2 * * * cd /home/boyzapp/boyfanz && node dist/scripts/cleanup.js
   ```

3. **Add Database Backup** (Daily at 3 AM)
   ```bash
   0 3 * * * pg_dump -U boyzapp_user boyzapp_db | gzip > /home/boyzapp/backups/db_$(date +\%Y\%m\%d).sql.gz
   ```

### File Upload Limits

1. **Increase Upload Limits**
   - Go to **Software > Select PHP Version**
   - Click **Options**
   - Set `upload_max_filesize` to `100M`
   - Set `post_max_size` to `100M`
   - Set `max_execution_time` to `300`

### Monitoring

1. **Setup Resource Monitoring**
   - Go to **Metrics > CPU and Concurrent Connection Usage**
   - Monitor resource usage

2. **Application Logs**
   ```bash
   # View application logs
   tail -f /home/boyzapp/logs/nodejs.log

   # View error logs
   tail -f /home/boyzapp/logs/error.log
   ```

## Troubleshooting

### Application Won't Start

1. **Check Node.js Version**
   ```bash
   node --version  # Should be 18+
   ```

2. **Check Dependencies**
   ```bash
   cd /home/boyzapp/boyfanz
   npm install
   ```

3. **Check Environment Variables**
   ```bash
   cat .env
   # Verify all required variables are set
   ```

### Database Connection Errors

1. **Verify PostgreSQL is Running**
   ```bash
   systemctl status postgresql
   # or check in cPanel
   ```

2. **Test Database Connection**
   ```bash
   psql -U boyzapp_user -d boyzapp_db -h localhost
   ```

3. **Check Database Credentials in .env**

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Restart application
pm2 restart boyfanz
```

### Permission Denied Errors

```bash
# Fix ownership
chown -R boyzapp:boyzapp /home/boyzapp/boyfanz

# Fix permissions
chmod -R 755 /home/boyzapp/boyfanz
chmod 644 /home/boyzapp/boyfanz/.env
```

## Maintenance

### Update Application

```bash
# SSH into server
ssh boyzapp@67.217.54.66

# Navigate to app directory
cd /home/boyzapp/boyfanz

# Pull latest changes (if using git)
git pull origin main

# Rebuild if needed
npm run build

# Restart application
pm2 restart boyfanz
# or restart via cPanel Node.js App Manager
```

### Database Backup

```bash
# Manual backup
pg_dump -U boyzapp_user boyzapp_db > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql

# Download backup
scp boyzapp@67.217.54.66:/home/boyzapp/backup_*.sql.gz ./
```

### Database Restore

```bash
# Upload backup
scp backup.sql.gz boyzapp@67.217.54.66:/home/boyzapp/

# SSH into server
ssh boyzapp@67.217.54.66

# Decompress
gunzip backup.sql.gz

# Restore
psql -U boyzapp_user boyzapp_db < backup.sql
```

## Security Checklist

- [x] Strong database password set
- [x] Unique JWT and session secrets generated
- [x] SSL certificate installed
- [x] HTTPS redirect enabled
- [ ] Firewall configured (via cPanel)
- [ ] Regular backups scheduled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Performance Optimization

### Enable Caching

Add to `.htaccess`:
```apache
# Cache static files
<FilesMatch "\.(jpg|jpeg|png|gif|js|css|ico|svg)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### Enable Compression

```apache
# Enable Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

## Support & Resources

- **cPanel Documentation**: https://docs.cpanel.net/
- **Node.js on cPanel**: https://docs.cpanel.net/ea4/experimental/nodejs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/

## Quick Reference Commands

```bash
# SSH Login
ssh boyzapp@67.217.54.66

# Navigate to app
cd /home/boyzapp/boyfanz

# View logs
pm2 logs boyfanz
tail -f /home/boyzapp/logs/nodejs.log

# Restart app
pm2 restart boyfanz

# Check status
pm2 status

# Database access
psql -U boyzapp_user -d boyzapp_db

# Generate secrets
openssl rand -hex 32
```

## Contact

For deployment support:
- Email: Josh@fanzunlimited.com
- Server IP: 67.217.54.66

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
**Status**: Ready for Production Deployment
