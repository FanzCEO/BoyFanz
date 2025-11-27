# Install Node.js on WHM Server - Complete Guide

## ✅ Perfect! You Have Root Access

With WHM root access, you can install Node.js and enable it for all cPanel accounts including boyzapp.com.

---

## 🎯 Quick Start (5 Minutes)

### Option 1: EasyApache 4 Method (FASTEST - Recommended for Standard cPanel)

1. **Login to WHM** at: `https://67.217.54.66:2087`

2. **Search for**: `EasyApache 4` in the search box

3. **Click**: `EasyApache 4` under Software

4. **Click**: `Customize` button

5. **Click**: `Apache Modules` tab

6. **Search for**: `nodejs`

7. **Check**: `ea-nodejs20` (or highest version available, like `ea-nodejs18`, `ea-nodejs16`)

8. **Click**: `Review` at bottom

9. **Click**: `Provision` to install

**Wait 2-5 minutes** for installation to complete.

---

### Option 2: CloudLinux Node.js Selector (BEST - If you have CloudLinux)

#### Check if you have CloudLinux:

```bash
# SSH into your server as root
ssh root@67.217.54.66

# Check OS
cat /etc/redhat-release
# If it says "CloudLinux" you have it!
```

#### Install Node.js Selector:

1. **SSH as root**:
```bash
ssh root@67.217.54.66
```

2. **Install Node.js Selector**:
```bash
yum groupinstall alt-nodejs20 -y
yum install lvemanager -y
```

3. **Install Apache Passenger** (required for Node.js apps):
```bash
yum install ea-apache24-mod-alt-passenger -y
```

4. **Enable in WHM**:
   - Login to WHM
   - Go to: `Plugins` → `LVE Manager`
   - Click: `Options`
   - Enable: `Node.js Selector`
   - Save

5. **Set available Node.js versions**:
```bash
# Make Node.js 18, 20, etc available
cloudlinux-selector set --json --interpreter nodejs --selector-status enabled --version 18.20
cloudlinux-selector set --json --interpreter nodejs --selector-status enabled --version 20.10
```

---

### Option 3: Manual Node.js Installation (If above don't work)

#### Install Node.js system-wide:

```bash
# SSH as root
ssh root@67.217.54.66

# Download and install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install nodejs -y

# Verify installation
node --version
npm --version

# Install PM2 globally (for process management)
npm install -g pm2
```

#### Install Passenger (Apache module for Node.js):

```bash
# Install Phusion Passenger
yum install -y epel-release pygpgme curl
curl --fail -sSLo /etc/yum.repos.d/passenger.repo https://oss-binaries.phusionpassenger.com/yum/definitions/el-passenger.repo

# Install Passenger Apache module
yum install -y mod_passenger

# Restart Apache
systemctl restart httpd
# or
service httpd restart
```

---

## 🔧 Enable Node.js in cPanel Feature Manager

After installing Node.js, enable it for your cPanel accounts:

### 1. Login to WHM

```
https://67.217.54.66:2087
```

### 2. Go to Feature Manager

**Search**: `feature manager` in WHM search box

### 3. Edit Feature List

- Click: `default` (or your feature list name)
- **Scroll down** to find: `Setup Node.js App` or `Application Manager`
- **Check the box** to enable it
- Click: `Save`

### 4. Apply to Account

**Option A**: Edit existing account
- WHM → `Account Functions` → `Modify an Account`
- Select: `boyzapp`
- Change feature list to the one you just edited
- Save

**Option B**: Make it default for all accounts
- WHM → `Packages` → `Edit a Package`
- Edit your default package
- Enable Node.js features
- Save

---

## 📋 Verify Installation

### Method 1: Check via WHM

1. **WHM** → `Server Status` → `Apache Status`
2. Look for: `mod_passenger` or `node` in loaded modules

### Method 2: Check via SSH

```bash
ssh root@67.217.54.66

# Check Node.js
node --version
# Should show: v18.x.x or v20.x.x

# Check npm
npm --version
# Should show: 9.x.x or 10.x.x

# Check Passenger
passenger --version
# Should show version info

# Check if Passenger module is loaded in Apache
httpd -M | grep passenger
# Should show: passenger_module
```

### Method 3: Check in cPanel

1. **Login to cPanel**: `https://67.217.54.66:2083`
2. **Username**: `boyzapp`
3. **Password**: `Bama@11061990`
4. **Search**: `node` in cPanel search
5. **You should see**: `Setup Node.js App` icon

---

## 🚀 After Installation - Deploy BoyFanz

Once Node.js shows up in cPanel, follow these steps:

### 1. Access Setup Node.js App

**cPanel** → Search `node` → Click `Setup Node.js App`

### 2. Create Application

Click: `Create Application`

**Fill in**:
```
Node.js version: 18.20.4 (or latest available)
Application mode: Production
Application root: /home/boyzapp/boyfanz-deploy
Application URL: boyzapp.com
Application startup file: index.js
```

Click: `Create`

### 3. Install Dependencies

- Click: `Run NPM Install` button
- Wait for completion (30-60 seconds)

### 4. Start Application

- The app should auto-start
- If not, click: `Restart` button

### 5. Setup SSL

**cPanel** → Search `ssl` → `SSL/TLS Status`
- Check: `boyzapp.com`
- Click: `Run AutoSSL`
- Wait 30 seconds for certificate

### 6. Verify

Visit: `https://boyzapp.com`

Your app should be live!

---

## 🔍 Troubleshooting

### Issue: "Setup Node.js App" still not showing

**Fix 1**: Restart cPanel service
```bash
ssh root@67.217.54.66
/scripts/restartsrv_cpsrvd
```

**Fix 2**: Clear cPanel cache
```bash
/usr/local/cpanel/bin/rebuild_sprites
```

**Fix 3**: Update cPanel
```bash
/scripts/upcp --force
```

### Issue: Passenger not loading

**Fix**: Rebuild Apache configuration
```bash
ssh root@67.217.54.66
/scripts/rebuildhttpdconf
/scripts/restartsrv_httpd
```

### Issue: Node.js installed but apps won't start

**Check logs**:
```bash
tail -f /usr/local/apache/logs/error_log
tail -f /home/boyzapp/logs/boyzapp.com.error.log
```

**Fix**: Ensure Passenger is properly configured
```bash
# Check Passenger config
passenger-config validate-install

# Check Passenger working
passenger-memory-stats
```

---

## 📖 What Each Method Does

### EasyApache 4 Method
- ✅ Easiest (point and click)
- ✅ Integrates with cPanel automatically
- ✅ Updates via WHM
- ❌ Limited to EA4 provided versions
- **Best for**: Standard cPanel/WHM servers

### CloudLinux Method
- ✅ Multiple Node.js versions available
- ✅ Users can switch versions
- ✅ Better resource isolation
- ✅ Built-in cPanel integration
- ❌ Requires CloudLinux OS
- **Best for**: CloudLinux servers (shared hosting providers)

### Manual Installation
- ✅ Latest Node.js versions
- ✅ Full control
- ✅ Works on any Linux
- ❌ Manual cPanel integration
- ❌ Manual updates
- **Best for**: VPS/Dedicated servers without CloudLinux

---

## 🎯 Recommended Path

### If you have CloudLinux (check with `cat /etc/redhat-release`):
→ Use **CloudLinux Node.js Selector** method

### If you have standard CentOS/AlmaLinux:
→ Use **EasyApache 4** method first
→ If that doesn't work, use **Manual Installation**

---

## 📞 Quick Commands Reference

### Check Your Server OS:
```bash
ssh root@67.217.54.66
cat /etc/redhat-release
```

### EasyApache 4 Install:
```
WHM → EasyApache 4 → Customize → Apache Modules → ea-nodejs20 → Provision
```

### CloudLinux Install:
```bash
ssh root@67.217.54.66
yum groupinstall alt-nodejs20 -y
yum install ea-apache24-mod-alt-passenger -y
```

### Manual Install:
```bash
ssh root@67.217.54.66
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install nodejs -y
npm install -g pm2
```

### Enable in cPanel:
```
WHM → Feature Manager → default → Check "Setup Node.js App" → Save
```

### Restart Services:
```bash
/scripts/restartsrv_httpd
/scripts/restartsrv_cpsrvd
```

---

## ✅ After Installation Checklist

- [ ] Node.js installed and `node --version` works
- [ ] Passenger module loaded in Apache
- [ ] "Setup Node.js App" appears in cPanel (boyzapp account)
- [ ] BoyFanz files ready at `/home/boyzapp/boyfanz-deploy/`
- [ ] `.env` file with credentials in place
- [ ] Application created in cPanel Node.js interface
- [ ] Dependencies installed (`npm install` completed)
- [ ] Application started and running
- [ ] SSL certificate installed on boyzapp.com
- [ ] Site accessible at https://boyzapp.com

---

## 🚀 Ready?

1. **Start with**: EasyApache 4 method (fastest)
2. **If that doesn't work**: Try CloudLinux method
3. **If nothing works**: Use manual installation

Once installed, the "Setup Node.js App" icon will appear in cPanel and you can deploy BoyFanz following the original guide.

**Need help?** Let me know which method you want to try and I'll provide the exact commands!
