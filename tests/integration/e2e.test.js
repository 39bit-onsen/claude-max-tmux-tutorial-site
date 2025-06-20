// End-to-End Integration Tests
const { chromium, firefox, webkit } = require('playwright');
const { expect, describe, it, beforeAll, afterAll, beforeEach } = require('@jest/globals');

describe('E2E Integration Tests', () => {
  let browser;
  let context;
  let page;
  const baseURL = 'http://localhost:3000';

  beforeAll(async () => {
    // Launch browser for testing
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await context.newPage();
    await page.goto(baseURL);
  });

  describe('User Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      // Navigate to registration page
      await page.click('text=Sign Up');
      await expect(page).toHaveURL(`${baseURL}/register`);

      // Fill registration form
      await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
      await page.fill('[data-testid="name-input"]', 'E2E Test User');

      // Submit registration
      await page.click('[data-testid="register-button"]');

      // Verify successful registration
      await expect(page.locator('text=Registration successful')).toBeVisible();
      await expect(page).toHaveURL(`${baseURL}/login`);

      // Login with new account
      await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
      await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
      await page.click('[data-testid="login-button"]');

      // Verify successful login
      await expect(page.locator('text=Welcome back')).toBeVisible();
      await expect(page).toHaveURL(`${baseURL}/dashboard`);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    it('should handle login validation errors', async () => {
      await page.click('text=Sign In');
      
      // Try login without filling fields
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();

      // Try with invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('text=Invalid email format')).toBeVisible();

      // Try with wrong credentials
      await page.fill('[data-testid="email-input"]', 'wrong@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    it('should maintain session across page refreshes', async () => {
      // Login first
      await loginUser(page, 'test@example.com', 'password123');
      
      // Refresh page
      await page.reload();
      
      // Verify still logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page).toHaveURL(`${baseURL}/dashboard`);
    });

    it('should handle logout properly', async () => {
      await loginUser(page, 'test@example.com', 'password123');
      
      // Open user menu and logout
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');
      
      // Verify logout
      await expect(page).toHaveURL(`${baseURL}/`);
      await expect(page.locator('text=Sign In')).toBeVisible();
      
      // Try to access protected page
      await page.goto(`${baseURL}/dashboard`);
      await expect(page).toHaveURL(`${baseURL}/login`);
    });
  });

  describe('Product Browsing and Search', () => {
    beforeEach(async () => {
      await page.goto(`${baseURL}/products`);
    });

    it('should display product catalog correctly', async () => {
      // Verify products are loaded
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
      
      // Check product card elements
      const firstProduct = page.locator('[data-testid="product-card"]').first();
      await expect(firstProduct.locator('[data-testid="product-name"]')).toBeVisible();
      await expect(firstProduct.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(firstProduct.locator('[data-testid="product-image"]')).toBeVisible();
    });

    it('should filter products by category', async () => {
      // Click on electronics category
      await page.click('[data-testid="category-electronics"]');
      
      // Wait for filtering
      await page.waitForLoadState('networkidle');
      
      // Verify only electronics products are shown
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      for (let i = 0; i < count; i++) {
        const category = await productCards.nth(i).getAttribute('data-category');
        expect(category).toBe('electronics');
      }
    });

    it('should search products by name', async () => {
      // Search for specific product
      await page.fill('[data-testid="search-input"]', 'laptop');
      await page.click('[data-testid="search-button"]');
      
      // Wait for search results
      await page.waitForLoadState('networkidle');
      
      // Verify search results contain search term
      const productNames = page.locator('[data-testid="product-name"]');
      const count = await productNames.count();
      
      for (let i = 0; i < count; i++) {
        const name = await productNames.nth(i).textContent();
        expect(name.toLowerCase()).toContain('laptop');
      }
    });

    it('should apply price range filter', async () => {
      // Set price range
      await page.fill('[data-testid="min-price-input"]', '100');
      await page.fill('[data-testid="max-price-input"]', '500');
      await page.click('[data-testid="apply-filter-button"]');
      
      // Wait for filtering
      await page.waitForLoadState('networkidle');
      
      // Verify prices are within range
      const prices = page.locator('[data-testid="product-price"]');
      const count = await prices.count();
      
      for (let i = 0; i < count; i++) {
        const priceText = await prices.nth(i).textContent();
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        expect(price).toBeGreaterThanOrEqual(100);
        expect(price).toBeLessThanOrEqual(500);
      }
    });

    it('should handle pagination correctly', async () => {
      // Check if pagination exists
      const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();
      
      if (paginationExists) {
        // Click next page
        await page.click('[data-testid="next-page"]');
        
        // Wait for page load
        await page.waitForLoadState('networkidle');
        
        // Verify URL changed
        await expect(page).toHaveURL(/page=2/);
        
        // Verify different products are shown
        await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
      }
    });
  });

  describe('Shopping Cart Functionality', () => {
    beforeEach(async () => {
      await loginUser(page, 'test@example.com', 'password123');
      await page.goto(`${baseURL}/products`);
    });

    it('should add products to cart', async () => {
      // Add first product to cart
      await page.click('[data-testid="product-card"]').first().locator('[data-testid="add-to-cart"]');
      
      // Verify cart notification
      await expect(page.locator('text=Added to cart')).toBeVisible();
      
      // Check cart badge
      const cartBadge = page.locator('[data-testid="cart-badge"]');
      await expect(cartBadge).toHaveText('1');
      
      // Add another product
      await page.click('[data-testid="product-card"]').nth(1).locator('[data-testid="add-to-cart"]');
      await expect(cartBadge).toHaveText('2');
    });

    it('should view and modify cart contents', async () => {
      // Add products to cart first
      await addProductsToCart(page, 2);
      
      // Go to cart page
      await page.click('[data-testid="cart-icon"]');
      await expect(page).toHaveURL(`${baseURL}/cart`);
      
      // Verify cart items
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
      
      // Update quantity
      const quantityInput = page.locator('[data-testid="quantity-input"]').first();
      await quantityInput.clear();
      await quantityInput.fill('3');
      await page.click('[data-testid="update-quantity"]');
      
      // Verify total updated
      await expect(page.locator('[data-testid="cart-total"]')).toContainText('$');
      
      // Remove item
      await page.click('[data-testid="remove-item"]').first();
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    });

    it('should persist cart across sessions', async () => {
      // Add products to cart
      await addProductsToCart(page, 2);
      
      // Logout and login again
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');
      await loginUser(page, 'test@example.com', 'password123');
      
      // Check cart is preserved
      const cartBadge = page.locator('[data-testid="cart-badge"]');
      await expect(cartBadge).toHaveText('2');
    });
  });

  describe('Checkout Process', () => {
    beforeEach(async () => {
      await loginUser(page, 'test@example.com', 'password123');
      await addProductsToCart(page, 2);
      await page.click('[data-testid="cart-icon"]');
      await page.click('[data-testid="checkout-button"]');
    });

    it('should complete full checkout process', async () => {
      // Fill shipping information
      await page.fill('[data-testid="shipping-street"]', '123 Test Street');
      await page.fill('[data-testid="shipping-city"]', 'Test City');
      await page.fill('[data-testid="shipping-zip"]', '12345');
      await page.fill('[data-testid="shipping-country"]', 'Test Country');
      
      // Continue to payment
      await page.click('[data-testid="continue-to-payment"]');
      
      // Fill payment information
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', 'Test User');
      
      // Place order
      await page.click('[data-testid="place-order"]');
      
      // Verify order success
      await expect(page.locator('text=Order placed successfully')).toBeVisible();
      await expect(page).toHaveURL(/\/order\/\d+/);
      
      // Verify order details
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
      
      // Verify cart is cleared
      await page.click('[data-testid="cart-icon"]');
      await expect(page.locator('text=Your cart is empty')).toBeVisible();
    });

    it('should validate shipping information', async () => {
      // Try to continue without filling required fields
      await page.click('[data-testid="continue-to-payment"]');
      
      // Verify validation errors
      await expect(page.locator('text=Street address is required')).toBeVisible();
      await expect(page.locator('text=City is required')).toBeVisible();
      await expect(page.locator('text=ZIP code is required')).toBeVisible();
    });

    it('should validate payment information', async () => {
      // Fill shipping and continue
      await fillShippingInfo(page);
      await page.click('[data-testid="continue-to-payment"]');
      
      // Try to place order without payment info
      await page.click('[data-testid="place-order"]');
      
      // Verify validation errors
      await expect(page.locator('text=Card number is required')).toBeVisible();
      await expect(page.locator('text=Expiry date is required')).toBeVisible();
      await expect(page.locator('text=CVC is required')).toBeVisible();
    });

    it('should handle payment failures gracefully', async () => {
      // Fill shipping
      await fillShippingInfo(page);
      await page.click('[data-testid="continue-to-payment"]');
      
      // Use a card number that will be declined
      await page.fill('[data-testid="card-number"]', '4000000000000002');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', 'Test User');
      
      // Try to place order
      await page.click('[data-testid="place-order"]');
      
      // Verify error handling
      await expect(page.locator('text=Payment failed')).toBeVisible();
      await expect(page.locator('[data-testid="place-order"]')).toBeEnabled();
    });
  });

  describe('User Profile and Order History', () => {
    beforeEach(async () => {
      await loginUser(page, 'test@example.com', 'password123');
    });

    it('should display and update user profile', async () => {
      await page.goto(`${baseURL}/profile`);
      
      // Verify profile information
      await expect(page.locator('[data-testid="profile-email"]')).toHaveValue('test@example.com');
      
      // Update profile
      await page.fill('[data-testid="profile-name"]', 'Updated Name');
      await page.fill('[data-testid="profile-phone"]', '+1234567890');
      await page.click('[data-testid="save-profile"]');
      
      // Verify update success
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });

    it('should display order history', async () => {
      await page.goto(`${baseURL}/orders`);
      
      // Verify orders list
      await expect(page.locator('[data-testid="order-item"]')).toHaveCount.greaterThanOrEqual(0);
      
      // If orders exist, check order details
      const orderCount = await page.locator('[data-testid="order-item"]').count();
      if (orderCount > 0) {
        await page.click('[data-testid="order-item"]').first();
        
        // Verify order details page
        await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
        await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
      }
    });

    it('should change password successfully', async () => {
      await page.goto(`${baseURL}/profile`);
      await page.click('[data-testid="change-password-tab"]');
      
      // Fill password change form
      await page.fill('[data-testid="current-password"]', 'password123');
      await page.fill('[data-testid="new-password"]', 'newpassword123');
      await page.fill('[data-testid="confirm-new-password"]', 'newpassword123');
      
      await page.click('[data-testid="change-password-button"]');
      
      // Verify success
      await expect(page.locator('text=Password changed successfully')).toBeVisible();
      
      // Test new password by logging out and back in
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Logout');
      
      await loginUser(page, 'test@example.com', 'newpassword123');
      await expect(page).toHaveURL(`${baseURL}/dashboard`);
    });
  });

  describe('Responsive Design Tests', () => {
    it('should work correctly on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${baseURL}/products`);
      
      // Verify mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Test product grid on mobile
      const productCards = page.locator('[data-testid="product-card"]');
      const firstCard = productCards.first();
      
      // Verify single column layout
      const cardWidth = await firstCard.evaluate(el => el.offsetWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(cardWidth).toBeGreaterThan(viewportWidth * 0.8);
    });

    it('should work correctly on tablet devices', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${baseURL}/products`);
      
      // Test tablet layout
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      // Should show 2-3 products per row on tablet
      if (count >= 6) {
        const firstRowCards = productCards.first();
        const secondRowCards = productCards.nth(2);
        
        const firstTop = await firstRowCards.evaluate(el => el.offsetTop);
        const secondTop = await secondRowCards.evaluate(el => el.offsetTop);
        
        expect(secondTop).toBeGreaterThan(firstTop);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should load pages within acceptable time limits', async () => {
      const startTime = Date.now();
      await page.goto(`${baseURL}/products`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle large product catalogs efficiently', async () => {
      await page.goto(`${baseURL}/products?limit=100`);
      
      // Verify virtual scrolling or pagination
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount.lessThanOrEqual(50);
      
      // Test scrolling performance
      const startTime = Date.now();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(100);
      const scrollTime = Date.now() - startTime;
      
      expect(scrollTime).toBeLessThan(500);
    });
  });

  describe('Accessibility Tests', () => {
    it('should support keyboard navigation', async () => {
      await page.goto(`${baseURL}/products`);
      
      // Tab through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    it('should have proper ARIA labels', async () => {
      await page.goto(`${baseURL}/products`);
      
      // Check for ARIA labels on interactive elements
      const addToCartButtons = page.locator('[data-testid="add-to-cart"]');
      const count = await addToCartButtons.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = addToCartButtons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });

    it('should support screen readers', async () => {
      await page.goto(`${baseURL}/products`);
      
      // Check for proper heading structure
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      // Check for alt text on images
      const productImages = page.locator('[data-testid="product-image"]');
      const imageCount = await productImages.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = productImages.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });

  describe('Cross-Browser Compatibility', () => {
    const browsers = [
      { name: 'chromium', launcher: chromium },
      { name: 'firefox', launcher: firefox },
      { name: 'webkit', launcher: webkit }
    ];

    browsers.forEach(({ name, launcher }) => {
      it(`should work correctly in ${name}`, async () => {
        const testBrowser = await launcher.launch({ headless: true });
        const testContext = await testBrowser.newContext();
        const testPage = await testContext.newPage();
        
        try {
          await testPage.goto(baseURL);
          
          // Test basic functionality
          await expect(testPage.locator('text=Welcome')).toBeVisible();
          
          // Test navigation
          await testPage.click('text=Products');
          await expect(testPage).toHaveURL(`${baseURL}/products`);
          
          // Test product loading
          await expect(testPage.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
          
        } finally {
          await testBrowser.close();
        }
      });
    });
  });
});

// Helper functions
async function loginUser(page, email, password) {
  await page.goto(`${baseURL}/login`);
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL(`${baseURL}/dashboard`);
}

async function addProductsToCart(page, count) {
  await page.goto(`${baseURL}/products`);
  for (let i = 0; i < count; i++) {
    await page.click(`[data-testid="product-card"]:nth-child(${i + 1}) [data-testid="add-to-cart"]`);
    await page.waitForTimeout(500);
  }
}

async function fillShippingInfo(page) {
  await page.fill('[data-testid="shipping-street"]', '123 Test Street');
  await page.fill('[data-testid="shipping-city"]', 'Test City');
  await page.fill('[data-testid="shipping-zip"]', '12345');
  await page.fill('[data-testid="shipping-country"]', 'Test Country');
}

module.exports = {
  loginUser,
  addProductsToCart,
  fillShippingInfo
};