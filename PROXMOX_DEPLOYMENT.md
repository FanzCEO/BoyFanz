# BoyFanz Proxmox Deployment Guide

## 📋 Prerequisites

1. **Proxmox Server** with:
   - VM or LXC container running Ubuntu/Debian
   - At least 2GB RAM, 2 CPU cores
   - 20GB storage minimum

2. **On Your Proxmox VM**:
   - Docker & Docker Compose installed
   - SSH access configured
   - Firewall rules allowing port 3000 (or your chosen port)

---

## 🚀 Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### Step 1: Prepare Your Proxmox VM

```bash
# SSH into your Proxmox VM
ssh root@your-proxmox-vm-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Create app directory
mkdir -p /opt/boyfanz
cd /opt/boyfanz
```

#### Step 2: Transfer Files to Proxmox

**From your local machine:**

```bash
# Option A: Using SCP
cd /Users/joshuastone/FANZ-Unified-Ecosystem/boyfanz
tar -czf boyfanz.tar.gz .
scp boyfanz.tar.gz root@your-proxmox-vm-ip:/opt/boyfanz/

# Option B: Using Git (if you have a repo)
ssh root@your-proxmox-vm-ip
cd /opt/boyfanz
git clone https://github.com/your-username/boyfanz.git .
```

#### Step 3: Configure Environment

**On Proxmox VM:**

```bash
cd /opt/boyfanz

# Extract if using tar
tar -xzf boyfanz.tar.gz

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=sqlite:/app/data/fanz_db.sqlite
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
EOF

# Set proper permissions
chmod 600 .env
```

#### Step 4: Build and Deploy

```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# Check logs
docker-compose logs -f boyfanz

# Check status
docker-compose ps
```

#### Step 5: Configure Reverse Proxy (Optional but Recommended)

**Install Nginx:**

```bash
apt install nginx -y

# Create Nginx config
cat > /etc/nginx/sites-available/boyfanz << 'EOF'
server {
    listen 80;
    server_name boyfanz.yourdomain.com;  # Change this

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/boyfanz /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**Add SSL with Let's Encrypt:**

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d boyfanz.yourdomain.com
```

---

### Method 2: Direct Node.js Deployment

#### Step 1: Install Node.js on Proxmox VM

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2
```

#### Step 2: Deploy Application

```bash
# Create app directory
mkdir -p /opt/boyfanz
cd /opt/boyfanz

# Transfer and extract your app
# (use scp or git as shown above)

# Install dependencies
pnpm install --prod

# Build application
pnpm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'boyfanz',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### Method 3: Proxmox LXC Container (Lightweight)

```bash
# On Proxmox host
pct create 100 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname boyfanz \
  --memory 2048 \
  --cores 2 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --storage local-lvm \
  --rootfs local-lvm:20

# Start container
pct start 100

# Enter container
pct enter 100

# Now follow Docker or Node.js deployment steps above
```

---

## 🔧 Post-Deployment

### Configure Firewall

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # If not using reverse proxy

# Enable firewall
ufw enable
```

### Set Up Monitoring

```bash
# Install monitoring tools
apt install htop nethogs iotop -y

# Monitor Docker containers
docker stats

# Monitor with PM2 (if using PM2)
pm2 monit
```

### Backup Strategy

```bash
# Create backup script
cat > /opt/boyfanz/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/boyfanz"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /opt/boyfanz/data/fanz_db.sqlite $BACKUP_DIR/db_$DATE.sqlite

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/boyfanz/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x /opt/boyfanz/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/boyfanz/backup.sh" | crontab -
```

---

## 📊 Useful Commands

### Docker Commands

```bash
# View logs
docker-compose logs -f boyfanz

# Restart application
docker-compose restart boyfanz

# Stop application
docker-compose down

# Update application
docker-compose pull
docker-compose up -d --build

# Clean up
docker system prune -a
```

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs boyfanz

# Restart
pm2 restart boyfanz

# Stop
pm2 stop boyfanz

# Update and restart
pm2 reload boyfanz
```

---

## 🔍 Troubleshooting

### Check Application Status

```bash
# Test if app is responding
curl http://localhost:3000

# Check open ports
netstat -tulpn | grep 3000

# Check Docker container
docker inspect boyfanz-app

# Check container logs
docker logs boyfanz-app --tail 100
```

### Common Issues

**Port Already in Use:**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Memory Issues:**
```bash
# Check memory usage
free -h
# Increase VM memory in Proxmox
```

**Permission Issues:**
```bash
# Fix permissions
chown -R www-data:www-data /opt/boyfanz
chmod -R 755 /opt/boyfanz
```

---

## 🌐 Access Your Application

After deployment:
- **Direct**: `http://your-proxmox-vm-ip:3000`
- **With Nginx**: `http://boyfanz.yourdomain.com`
- **With SSL**: `https://boyfanz.yourdomain.com`

---

## 📝 Notes

- The underground fight ring aesthetic is fully deployed
- All styling (blood-red neon, industrial fonts, cage patterns) is included
- Database is SQLite by default (change to PostgreSQL for production scale)
- Logs are stored in `/app/logs` or viewable via `docker-compose logs`

---

**Need Help?** Check the server logs or run diagnostics:

```bash
# Full system check
docker-compose ps
docker-compose logs --tail=50
curl -v http://localhost:3000/api/health
```
