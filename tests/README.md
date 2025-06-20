# テストスイート

## 🧪 概要

tmux + Claude Multi-Agent システムの包括的なテストスイートです。

## 📁 テスト構成

```
tests/
├── frontend/          # フロントエンドテスト
│   ├── components.test.js
│   ├── hooks.test.js
│   └── utils.test.js
├── backend/          # バックエンドテスト
│   ├── api.test.js
│   ├── auth.test.js
│   └── database.test.js
├── integration/      # 統合テスト
│   ├── e2e.test.js
│   └── api-integration.test.js
└── README.md
```

## 🚀 テスト実行

### 前提条件

```bash
# Node.js 18.x以上
node --version

# テスト依存関係インストール
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev supertest playwright
npm install --save-dev eslint-plugin-testing-library
```

### 全テスト実行

```bash
# すべてのテスト実行
npm test

# 監視モードで実行
npm run test:watch

# カバレッジ付きで実行
npm run test:coverage
```

### 個別テスト実行

```bash
# フロントエンドテストのみ
npm run test:frontend

# バックエンドテストのみ
npm run test:backend

# E2Eテストのみ
npm run test:e2e

# 特定のテストファイル
npm test components.test.js

# 特定のテストケース
npm test -- --testNamePattern="should render product list"
```

## 🎯 テストカテゴリ

### フロントエンドテスト（Frontend Tests）

#### コンポーネントテスト
```javascript
// 例: ProductCard コンポーネント
describe('ProductCard Component', () => {
  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

**テスト対象:**
- React コンポーネントの描画
- ユーザーインタラクション
- 状態管理（useState, useContext）
- プロパティの受け渡し
- イベントハンドリング

#### フックステスト
```javascript
// 例: useCart フック
describe('useCart Hook', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem(mockProduct);
    });
    expect(result.current.items).toHaveLength(1);
  });
});
```

#### ユーティリティテスト
```javascript
// 例: 価格フォーマット関数
describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(1000)).toBe('¥1,000');
  });
});
```

### バックエンドテスト（Backend Tests）

#### APIエンドポイントテスト
```javascript
// 例: Products API
describe('GET /api/products', () => {
  it('should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body.products).toBeInstanceOf(Array);
  });
});
```

**テスト対象:**
- REST API エンドポイント
- 認証・認可
- データベース操作
- バリデーション
- エラーハンドリング

#### 認証テスト
```javascript
describe('Authentication', () => {
  it('should authenticate valid user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);
    
    expect(response.body.token).toBeDefined();
  });
});
```

#### データベーステスト
```javascript
describe('User Model', () => {
  it('should create user with hashed password', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'plaintext'
    });
    
    expect(user.password).not.toBe('plaintext');
  });
});
```

### 統合テスト（Integration Tests）

#### End-to-End テスト
```javascript
// 例: ユーザーフロー
describe('User Shopping Flow', () => {
  it('should complete purchase flow', async () => {
    await page.goto('/products');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="checkout"]');
    await fillPaymentForm(page);
    await page.click('[data-testid="place-order"]');
    
    expect(page.url()).toContain('/order-confirmation');
  });
});
```

**テスト対象:**
- フロントエンド・バックエンド統合
- ユーザーフロー全体
- クロスブラウザ対応
- レスポンシブデザイン
- パフォーマンス

## 📊 テストカバレッジ目標

### 目標カバレッジ
- **全体**: 80%以上
- **フロントエンド**: 85%以上
- **バックエンド**: 90%以上
- **重要な機能**: 95%以上

### カバレッジレポート生成

```bash
# HTMLレポート生成
npm run test:coverage

# 詳細レポート表示
npm run coverage:report

# カバレッジ確認
open coverage/lcov-report/index.html
```

## 🔧 テスト設定

### Jest設定（jest.config.js）

```javascript
module.exports = {
  // テスト環境
  testEnvironment: 'jsdom',
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // モジュールパス
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js'
  ],
  
  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Playwright設定（playwright.config.js）

```javascript
module.exports = {
  // ブラウザ設定
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  
  // テスト設定
  testDir: './tests/integration',
  timeout: 30000,
  
  // レポート設定
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ]
};
```

## 🎪 CI/CD統合

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

### テスト前処理

```bash
# データベースセットアップ
npm run db:test:setup

# テストデータ投入
npm run db:test:seed

# サーバー起動（E2Eテスト用）
npm run server:test &
```

## 🐛 テストデバッグ

### デバッグモード実行

```bash
# Jestデバッグモード
npm test -- --verbose --no-cache

# Playwrightデバッグモード
npm run test:e2e -- --debug

# 特定のテストをデバッグ
npm test -- --testNamePattern="should add to cart" --verbose
```

### ログ出力

```javascript
// テスト内でのデバッグ
describe('Debug Test', () => {
  it('should debug properly', () => {
    console.log('Debug info:', testData);
    screen.debug(); // React Testing Library
  });
});
```

## 📝 テスト作成ガイドライン

### 命名規則

```javascript
// ✅ 良い例
describe('ProductCard Component', () => {
  it('should render product name and price', () => {});
  it('should handle add to cart click', () => {});
  it('should display sale badge when on sale', () => {});
});

// ❌ 悪い例
describe('Test', () => {
  it('works', () => {});
});
```

### テストデータ管理

```javascript
// factories/productFactory.js
export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  price: 100,
  category: 'electronics',
  ...overrides
});

// テストでの使用
const product = createMockProduct({ price: 200 });
```

### モック作成

```javascript
// API モック
jest.mock('../api/products', () => ({
  getProducts: jest.fn(() => Promise.resolve(mockProducts)),
  createProduct: jest.fn()
}));

// React コンポーネントモック
jest.mock('../components/LoadingSpinner', () => {
  return function LoadingSpinner() {
    return <div data-testid="loading">Loading...</div>;
  };
});
```

## 🔗 関連リンク

- [Jest Documentation](https://jestjs.io/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](../docs/faq/testing-best-practices.md)

## ❓ トラブルシューティング

### よくある問題

1. **テストタイムアウト**
   ```bash
   # タイムアウト時間延長
   npm test -- --testTimeout=10000
   ```

2. **メモリ不足**
   ```bash
   # Node.jsメモリ制限緩和
   NODE_OPTIONS="--max-old-space-size=4096" npm test
   ```

3. **モック問題**
   ```javascript
   // モッククリア
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

4. **非同期処理**
   ```javascript
   // 適切な待機
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument();
   });
   ```

---

テストに関する質問や問題がある場合は、[GitHub Issues](https://github.com/your-repo/claude-code-communication/issues)で報告してください。