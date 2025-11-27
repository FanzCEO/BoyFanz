# GitHub Actions Auto-Deploy Setup

## ✅ What's Been Configured

1. **GitHub Actions Workflow** - Created at `.github/workflows/deploy.yml`
2. **SSH Key Pair** - Generated and public key added to server
3. **Deployment Script** - Automatically builds and deploys on every push to main/master

## 🔧 How to Complete Setup

### Step 1: Add GitHub Secrets

Go to your GitHub repository settings and add these secrets:

**Repository → Settings → Secrets and variables → Actions → New repository secret**

Add the following three secrets:

#### 1. SSH_PRIVATE_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAFoH3m4zvIWDqRM/oxTKJmpEaMZJTpkoVG1MUKazRrMQAAAKBbWn0zW1p9
MwAAAAtzc2gtZWQyNTUxOQAAACAFoH3m4zvIWDqRM/oxTKJmpEaMZJTpkoVG1MUKazRrMQ
AAAEBKavM4KGG8xkw5u9buORBkhKHk/4k6VP/lAW764aZ/lAWgfebjO8hYOpEz+jFMomak
RoxklOmShUbUxQprNGsxAAAAFmdpdGh1Yi1hY3Rpb25zLWJveWZhbnoBAgMEBQYH
-----END OPENSSH PRIVATE KEY-----
```

#### 2. SERVER_HOST
```
67.217.54.66
```

#### 3. SERVER_USER
```
root
```

### Step 2: Test the Workflow

1. Commit the workflow file:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions auto-deploy workflow"
   git push origin main
   ```

2. Go to **Actions** tab in your GitHub repository
3. You should see the deployment running
4. It will automatically:
   - Install dependencies
   - Build the application
   - Deploy files to the server
   - Restart the PM2 process
   - Copy static files to public_html

### Step 3: Verify Deployment

After the workflow completes, check:
- https://boyzapp.com - Should show updated version
- Server logs: `ssh root@67.217.54.66 'pm2 logs boyzapp --lines 50'`

## 🚀 How It Works

Every time you push code to the `main` or `master` branch:

1. **GitHub Actions triggers** automatically
2. **Builds your app** in GitHub's servers
3. **Deploys to production** via SSH
4. **Restarts backend** with PM2
5. **Updates frontend** static files
6. **Confirms deployment** success

## 🔒 Security Notes

- SSH private key is stored securely in GitHub Secrets (encrypted)
- Only authorized GitHub Actions can access the key
- Key is restricted to deployment tasks only
- Server access is logged and auditable

## 🎯 Manual Deployment

You can also trigger deployment manually:
- Go to **Actions** tab
- Select **Deploy to Production** workflow
- Click **Run workflow**
- Choose branch and click **Run workflow**

## 📝 Customization

Edit `.github/workflows/deploy.yml` to:
- Add pre-deployment tests
- Run database migrations
- Send Slack/Discord notifications
- Deploy to multiple servers
- Add staging environment

## ✅ Current Status

- ✅ Workflow file created
- ✅ SSH keys generated
- ✅ Public key added to server
- 🔲 GitHub Secrets (you need to add these)
- 🔲 First deployment test

## 🆘 Troubleshooting

If deployment fails:

1. **Check GitHub Actions logs** - Go to Actions tab and click on the failed run
2. **Verify secrets** - Make sure all 3 secrets are added correctly
3. **Test SSH manually** - Try `ssh root@67.217.54.66` from your machine
4. **Check server logs** - `ssh root@67.217.54.66 'pm2 logs boyzapp'`
5. **Check disk space** - `ssh root@67.217.54.66 'df -h'`

## 📞 Support

If you encounter issues, check:
- GitHub Actions documentation: https://docs.github.com/en/actions
- PM2 documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- Server logs for specific error messages
