# デプロイ手順書

## 🚀 概要

tmux + Claude Multi-Agent 教材サイトのデプロイ手順を説明します。本番環境、ステージング環境、開発環境それぞれの設定方法を網羅しています。

## 📋 前提条件

### 必要なツール
- Node.js 18.x 以上
- Docker & Docker Compose
- Git
- tmux
- Claude Code CLI

### 環境要件
- **メモリ**: 最低 2GB、推奨 4GB以上
- **CPU**: 最低 2コア、推奨 4コア以上
- **ストレージ**: 最低 10GB、推奨 20GB以上
- **OS**: Ubuntu 20.04+, CentOS 8+, macOS 12+

## 🏗️ アーキテクチャ概要

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Database      │
│   (Nginx)       │────│   (Node.js)     │────│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   File Storage  │              │
         └──────────────│   (S3/MinIO)    │──────────────┘
                        └─────────────────┘
```

## 🌍 環境別デプロイ

### 開発環境（Development）

#### 1. ローカル開発セットアップ

```bash
# リポジトリクローン
git clone https://github.com/your-repo/claude-code-communication.git
cd claude-code-communication/tutorial-site

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.development
```

#### 2. 環境変数設定（.env.development）

```bash
# アプリケーション設定
NODE_ENV=development
PORT=3000
HOST=localhost

# データベース設定
DATABASE_URL=postgresql://username:password@localhost:5432/tutorial_dev
REDIS_URL=redis://localhost:6379

# Claude Code設定
ANTHROPIC_API_KEY=your_development_api_key

# ファイルストレージ
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10MB

# セキュリティ設定
JWT_SECRET=your_jwt_secret_development
SESSION_SECRET=your_session_secret_development

# ログ設定
LOG_LEVEL=debug
LOG_FILE=./logs/app-dev.log
```

#### 3. 開発サーバー起動

```bash
# データベースセットアップ
npm run db:setup

# 開発サーバー起動
npm run dev

# または個別起動
npm run dev:frontend  # フロントエンド開発サーバー
npm run dev:backend   # バックエンド開発サーバー
```

#### 4. tmux開発環境起動

```bash
# 開発用tmuxセッション起動
./scripts/start-dev-multiagent.sh

# セッション接続
tmux attach-session -t tutorial-dev
```

### ステージング環境（Staging）

#### 1. ステージングサーバー準備

```bash
# サーバーセットアップ（Ubuntu 20.04例）
sudo apt update
sudo apt install -y nodejs npm postgresql redis-server nginx

# Node.js 18.x インストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2インストール
sudo npm install -g pm2
```

#### 2. アプリケーションデプロイ

```bash
# アプリケーションディレクトリ作成
sudo mkdir -p /var/www/tutorial-site
sudo chown $USER:$USER /var/www/tutorial-site

# コードデプロイ
cd /var/www/tutorial-site
git clone https://github.com/your-repo/claude-code-communication.git .
cd tutorial-site

# 依存関係インストール
npm ci --production

# ビルド実行
npm run build
```

#### 3. 環境変数設定（.env.staging）

```bash
# アプリケーション設定
NODE_ENV=staging
PORT=3001
HOST=0.0.0.0

# データベース設定
DATABASE_URL=postgresql://username:password@localhost:5432/tutorial_staging
REDIS_URL=redis://localhost:6379

# Claude Code設定
ANTHROPIC_API_KEY=your_staging_api_key

# ファイルストレージ
UPLOAD_PATH=/var/www/tutorial-site/uploads
MAX_FILE_SIZE=50MB

# セキュリティ設定
JWT_SECRET=your_jwt_secret_staging
SESSION_SECRET=your_session_secret_staging

# ログ設定
LOG_LEVEL=info
LOG_FILE=/var/log/tutorial-site/app.log
```

#### 4. PM2設定

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tutorial-site-staging',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'staging',
      PORT: 3001
    },
    error_file: '/var/log/tutorial-site/pm2-error.log',
    out_file: '/var/log/tutorial-site/pm2-out.log',
    log_file: '/var/log/tutorial-site/pm2.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};

# PM2でアプリケーション起動
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Nginx設定

```nginx
# /etc/nginx/sites-available/tutorial-site-staging
server {
    listen 80;
    server_name staging.tutorial-site.com;

    # セキュリティヘッダー
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # 静的ファイル
    location /static/ {
        alias /var/www/tutorial-site/tutorial-site/dist/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API プロキシ
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # フロントエンド
    location / {
        try_files $uri $uri/ @backend;
    }

    location @backend {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 設定有効化
sudo ln -s /etc/nginx/sites-available/tutorial-site-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 本番環境（Production）

#### 1. 本番サーバー構成

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tutorial_production
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 2. 本番用Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S tutorial -u 1001

WORKDIR /app

COPY --from=builder --chown=tutorial:nodejs /app/dist ./dist
COPY --from=builder --chown=tutorial:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=tutorial:nodejs /app/package.json ./package.json

USER tutorial

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

#### 3. 本番環境変数（.env.production）

```bash
# アプリケーション設定
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# データベース設定
DATABASE_URL=postgresql://username:password@db:5432/tutorial_production
REDIS_URL=redis://redis:6379

# Claude Code設定
ANTHROPIC_API_KEY=your_production_api_key

# ファイルストレージ
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=100MB

# セキュリティ設定
JWT_SECRET=your_strong_jwt_secret_production
SESSION_SECRET=your_strong_session_secret_production

# SSL設定
FORCE_HTTPS=true
TRUST_PROXY=true

# ログ設定
LOG_LEVEL=warn
LOG_FILE=/app/logs/app.log

# 監視設定
HEALTH_CHECK_ENDPOINT=/health
METRICS_ENDPOINT=/metrics
```

#### 4. 本番デプロイスクリプト

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 本番環境デプロイ開始"

# 環境変数確認
if [ ! -f .env.production ]; then
    echo "❌ .env.production ファイルが見つかりません"
    exit 1
fi

# バックアップ作成
echo "📦 データベースバックアップ作成"
docker-compose -f docker-compose.prod.yml exec db \
    pg_dump -U $DB_USER $DB_NAME > backups/backup-$(date +%Y%m%d-%H%M%S).sql

# 最新コード取得
echo "📥 最新コード取得"
git fetch origin
git checkout main
git pull origin main

# 依存関係更新
echo "📚 依存関係更新"
npm ci --production

# ビルド実行
echo "🔨 アプリケーションビルド"
npm run build

# テスト実行
echo "🧪 本番前テスト実行"
npm run test:production

# コンテナ更新
echo "🐳 コンテナ更新"
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# ヘルスチェック
echo "🏥 ヘルスチェック"
sleep 30
curl -f http://localhost/health || exit 1

echo "✅ デプロイ完了"
```

## 🔄 CI/CD設定

### GitHub Actions設定

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.STAGING_HOST }}
        username: ${{ secrets.STAGING_USER }}
        key: ${{ secrets.STAGING_SSH_KEY }}
        script: |
          cd /var/www/tutorial-site
          git pull origin main
          npm ci --production
          npm run build
          pm2 restart tutorial-site-staging

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && contains(github.event.head_commit.message, '[deploy]')
    
    environment: production
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /var/www/tutorial-site
          ./deploy-production.sh
```

## 📊 監視・ログ

### 1. アプリケーション監視

```javascript
// monitoring/healthcheck.js
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };
  
  res.json(health);
});

app.get('/metrics', (req, res) => {
  // Prometheus形式のメトリクス
  res.set('Content-Type', 'text/plain');
  res.send(`
    # HELP tutorial_site_requests_total Total requests
    # TYPE tutorial_site_requests_total counter
    tutorial_site_requests_total ${global.requestCount || 0}
    
    # HELP tutorial_site_response_time_seconds Response time
    # TYPE tutorial_site_response_time_seconds histogram
    tutorial_site_response_time_seconds_sum ${global.responseTimeSum || 0}
    tutorial_site_response_time_seconds_count ${global.responseCount || 0}
  `);
});
```

### 2. ログ設定

```javascript
// config/logging.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: process.env.LOG_FILE || './logs/app.log',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

### 3. エラー監視

```bash
# Sentry設定例
npm install @sentry/node

# config/sentry.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

## 🔐 セキュリティ設定

### 1. SSL/TLS設定

```bash
# Let's Encrypt証明書取得
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tutorial-site.com

# 自動更新設定
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 2. ファイアウォール設定

```bash
# UFW設定
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw deny 3000  # アプリケーションポートを直接アクセス不可に
```

### 3. セキュリティヘッダー

```nginx
# セキュリティヘッダー設定
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
```

## 📦 バックアップ・復旧

### 1. 自動バックアップ

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/tutorial-site"
DATE=$(date +%Y%m%d-%H%M%S)

# データベースバックアップ
docker-compose -f docker-compose.prod.yml exec -T db \
    pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/db-$DATE.sql.gz"

# ファイルバックアップ
tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" uploads/

# 古いバックアップ削除（30日以上）
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "バックアップ完了: $DATE"
```

### 2. 復旧手順

```bash
# データベース復旧
gunzip -c backup-file.sql.gz | docker-compose -f docker-compose.prod.yml exec -T db \
    psql -U $DB_USER $DB_NAME

# ファイル復旧
tar -xzf uploads-backup.tar.gz -C ./
```

## 🚨 トラブルシューティング

### よくある問題と解決方法

#### 1. アプリケーションが起動しない

```bash
# ログ確認
docker-compose -f docker-compose.prod.yml logs app

# ポート確認
sudo netstat -tlnp | grep :3000

# プロセス確認
ps aux | grep node
```

#### 2. データベース接続エラー

```bash
# データベース接続テスト
docker-compose -f docker-compose.prod.yml exec db psql -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# データベースログ確認
docker-compose -f docker-compose.prod.yml logs db
```

#### 3. メモリ不足

```bash
# メモリ使用量確認
free -h
docker stats

# スワップ設定
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📞 サポート

デプロイに関する問題やサポートが必要な場合：

- **GitHub Issues**: [問題報告](https://github.com/your-repo/claude-code-communication/issues)
- **Discord**: [コミュニティサポート](https://discord.gg/your-server)
- **Email**: deploy-support@tutorial-site.com

---

## 🔗 関連リンク

- [プロジェクト仕様書](../project-spec.md)
- [トラブルシューティング](./faq/troubleshooting.md)
- [開発ガイド](./README.md)