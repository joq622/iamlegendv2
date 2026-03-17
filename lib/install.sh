#!/bin/bash
#############################################################################
#                                                                           #
#                     Developed By STANY TZ                                 #
#                                                                           #
#  🌐  GitHub   : https://github.com/Stanytz378                             #
#  ▶️  YouTube  : https://youtube.com/@STANYTZ                              #
#  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7fzu4EwEjmsD4Tzs1p     #
#                                                                           #
#    © 2026 STANY TZ. All rights reserved.                                 #
#                                                                           #
#    Description: VPS Installer for ᴵ ᴬᴹ ᴸᴱᴳᴱᴺᴰ WhatsApp Bot               #
#                                                                           #
#############################################################################

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ᴵ ᴬᴹ ᴸᴱᴳᴱᴺᴰ WhatsApp Bot Installer  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo bash install.sh)"
  exit 1
fi

# Install dependencies
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y curl git ffmpeg libvips-dev build-essential libwebp-dev

# Install Node.js 20
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 20 ]; then
  echo "📦 Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "✅ Node.js $(node -v) installed"

# Clone repo
echo "📥 Cloning ᴵ ᴬᴹ ᴸᴱᴳᴱᴺᴰ..."
git clone https://github.com/Stanytz378/IAMLEGEND /root/IAMLEGEND
cd /root/IAMLEGEND

# Install npm packages
echo "📦 Installing npm packages..."
npm install --legacy-peer-deps

# Setup data
echo "📁 Setting up data files..."
npm run reset-data

# Create .env
if [ ! -f .env ]; then
  cp sample.env .env
  echo ""
  echo "# Database (optional - use one):" >> .env
  echo "# MONGO_URL=" >> .env
  echo "# POSTGRES_URL=" >> .env
  echo "# MYSQL_URL=" >> .env
  echo "# DB_URL=" >> .env
  echo ""
  echo "⚠️  Please edit /root/IAMLEGEND/.env with your settings"
  echo "   nano /root/IAMLEGEND/.env"
fi

# PM2 setup
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2..."
  npm install -g pm2
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Edit your config: nano /root/IAMLEGEND/.env"
echo "  2. Start the bot:    cd /root/IAMLEGEND && pm2 start index.js --name iamlegend"
echo "  3. View logs:        pm2 logs iamlegend"
echo "  4. Auto-start:       pm2 startup && pm2 save"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"