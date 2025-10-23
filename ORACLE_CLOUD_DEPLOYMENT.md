# Oracle Cloud Deployment Guide (Always Free Tier)

This guide walks you through deploying your Node.js + React + PostgreSQL app to Oracle Cloud's Always Free tier.

## Prerequisites

- ✅ Oracle Cloud account (Always Free eligible)
- ✅ Code pushed to GitHub
- ✅ SSH key generated locally

---

## Phase 1: Set Up Compute Instance on Oracle Cloud

### Step 1: Create a Compute Instance

1. Go to [cloud.oracle.com](https://cloud.oracle.com)
2. Sign in to your Oracle Cloud account
3. Click **"Create an instance"** or go to **Compute → Instances**
4. Fill in:
   - **Name**: `joe-app` (or your choice)
   - **Image and Shape**:
     - Image: Ubuntu 24.04 (or latest LTS)
     - Shape: Ampere (Always Free eligible) - **VM.Standard.A1.Compute** (4 OCPUs, 24GB RAM)
   - **Networking**: 
     - Create new VCN or use default
     - Subnet: Create new
   - **SSH Key**: 
     - Download the private key (save as `oracle-key.pem`)
     - Or paste your existing public key

5. Click **"Create"** and wait 2-3 minutes

### Step 2: Get Your Public IP

1. Once instance is running, note the **Public IP address**
2. You'll use this to SSH into the instance

---

## Phase 2: Configure the Compute Instance

### Step 1: SSH into Your Instance

```bash
ssh -i oracle-key.pem ubuntu@<PUBLIC_IP>
```

### Step 2: Update System and Install Dependencies

```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version
npm --version
```

### Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create your database
sudo -u postgres createdb joe

# Create a postgres user with password (optional but recommended)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your-secure-password';"
```

### Step 4: Install Git and Clone Your Repository

```bash
# Install git
sudo apt install -y git

# Create app directory
mkdir ~/app
cd ~/app

# Clone your repository
git clone https://github.com/YOUR_USERNAME/joe-main.git
cd joe-main
```

---

## Phase 3: Build and Deploy Your App

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment Variables

```bash
# Create .env file
cat > .env <<EOF
DATABASE_URL="postgresql://postgres:your-secure-password@localhost:5432/joe"
NODE_ENV="production"
PORT=3000
EOF
```

### Step 3: Set Up Database Schema

```bash
# Create tables in PostgreSQL
npx drizzle-kit push

# Optionally import your data (if you have data-export.json)
# DATABASE_URL="postgresql://postgres:your-secure-password@localhost:5432/joe" npx tsx import-data.ts
```

### Step 4: Build the App

```bash
npm run build
```

### Step 5: Test the App Locally

```bash
DATABASE_URL="postgresql://postgres:your-secure-password@localhost:5432/joe" npm start
```

Visit `http://<PUBLIC_IP>:3000` to verify it works, then press `Ctrl+C` to stop.

---

## Phase 4: Set Up Auto-Start with PM2

### Step 1: Install PM2

```bash
sudo npm install -g pm2
```

### Step 2: Create PM2 Ecosystem Config

```bash
cat > ecosystem.config.cjs <<EOF
module.exports = {
  apps: [{
    name: 'joe-app',
    script: './dist/index.js',
    instances: 1,
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://postgres:your-secure-password@localhost:5432/joe',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF
```

### Step 3: Start with PM2

```bash
# Start the app
pm2 start ecosystem.config.cjs

# Save PM2 startup script (auto-restart on reboot)
pm2 startup
pm2 save

# View logs
pm2 logs joe-app
```

---

## Phase 5: Configure Firewall & Network

### Step 1: Open Port 3000 in Oracle Cloud Firewall

1. Go to **Compute → Instances**
2. Click your instance
3. Under **Subnets**, click the subnet name
4. Go to **Security Lists**
5. Click the security list name
6. Click **"Add Ingress Rule"**
7. Add:
   - **Source**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Destination Port Range**: `3000`
   - **Description**: `Node.js App Port`
   - Click **"Add Ingress Rule"**

### Step 2: Also Add Port 80/443 (for reverse proxy later)

Repeat the above for ports 80 and 443

---

## Phase 6: Set Up Nginx Reverse Proxy (Optional but Recommended)

This lets you use port 80/443 instead of 3000.

### Step 1: Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 2: Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/joe-app > /dev/null <<EOF
upstream joe_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://joe_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
```

### Step 3: Enable the Config

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/joe-app /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

Now you can access your app at `http://<PUBLIC_IP>` (port 80)

---

## Phase 7: Set Up SSL with Let's Encrypt (Optional)

### Step 1: Get a Domain Name

You'll need a domain (or use DuckDNS for free dynamic DNS)

### Step 2: Update DNS Records

Point your domain to your Oracle Cloud public IP

### Step 3: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 4: Get SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com

# Agree to terms and enter email
```

### Step 5: Auto-Renewal

```bash
# Certbot auto-renewal is already set up
# Verify:
sudo systemctl status certbot.timer
```

Now your app is available at `https://your-domain.com`

---

## Phase 8: Monitoring & Maintenance

### View App Logs

```bash
pm2 logs joe-app
```

### Check App Status

```bash
pm2 status
```

### Restart App

```bash
pm2 restart joe-app
```

### Stop App

```bash
pm2 stop joe-app
```

### Update Your App

```bash
cd ~/app/joe-main

# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Restart with PM2
pm2 restart joe-app
```

---

## Common Issues & Troubleshooting

### App won't start - Connection refused

**Fix**: Check if PostgreSQL is running:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Port 3000 not accessible from browser

**Fix**: Check firewall rules in Oracle Cloud console - make sure port 3000 is open

### Database connection errors

**Fix**: Verify DATABASE_URL:
```bash
pm2 env joe-app | grep DATABASE_URL
```

### Out of memory errors

**Check**: 
```bash
free -h
df -h
```

The Always Free instance has 24GB RAM, should be sufficient.

---

## Database Backups

### Backup PostgreSQL

```bash
# Create backup
sudo -u postgres pg_dump joe > ~/backups/joe-backup-$(date +%Y%m%d).sql

# Restore backup
sudo -u postgres psql joe < ~/backups/joe-backup-YYYYMMDD.sql
```

---

## Useful Commands Reference

```bash
# SSH into instance
ssh -i oracle-key.pem ubuntu@<PUBLIC_IP>

# View public IP
hostname -I

# Check disk space
df -h

# Check memory
free -h

# Monitor system
top

# View PostgreSQL status
sudo systemctl status postgresql

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
```

---

## Summary

Your app is now deployed on Oracle Cloud Always Free with:
- ✅ Node.js + React frontend
- ✅ PostgreSQL database
- ✅ PM2 auto-restart
- ✅ Nginx reverse proxy
- ✅ SSL/HTTPS (optional)
- ✅ Free tier eligible ($0/month)

**Next Steps**:
1. Test everything thoroughly
2. Set up backups
3. Monitor app performance
4. Deploy updates via `git pull` + `npm run build` + `pm2 restart`