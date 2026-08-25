#!/bin/bash
set -e

export NVM_DIR="/home/ec2-user/.nvm"

if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

PROJECT_DIR="/home/ec2-user/snack/frontend"
LOG_DIR="/home/ec2-user/snack/logs/frontend"

mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/codedeploy-$(date '+%Y-%m-%d_%H-%M-%S').log"
exec > >(tee -a "$LOG_FILE") 2>&1

START_TIME=$(date +%s)

echo "====================================================="
echo "CodeDeploy Frontend Deployment Started"
echo "Start Time : $(date '+%Y-%m-%d %H:%M:%S')"
echo "====================================================="

cd "$PROJECT_DIR"

echo
echo "[1/6] Remove .next"
rm -rf .next

echo
echo "[2/6] Remove node_modules"
rm -rf node_modules

echo
echo "[3/6] Install Packages"
npm install

echo
echo "[4/6] Build Standalone"
NEXT_PRIVATE_STANDALONE=true npx next build

echo
echo "[5/6] Copy Static Assets"
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

echo
echo "[6/6] Restart PM2"

if pm2 describe frontend > /dev/null 2>&1; then
    HOSTNAME=0.0.0.0 PORT=3000 pm2 restart frontend --update-env
else
    HOSTNAME=0.0.0.0 PORT=3000 \
    pm2 start .next/standalone/server.js \
      --name frontend \
      --interpreter node
fi

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo
echo "====================================================="
echo "CodeDeploy Frontend Deployment Completed"
echo "Finish Time : $(date '+%Y-%m-%d %H:%M:%S')"
echo "Elapsed Time : ${ELAPSED} sec"
echo "====================================================="