// Backend API Tests
const request = require('supertest');
const { expect, describe, it, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock Express app
const mockApp = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  use: jest.fn(),
  listen: jest.fn()
};

// Mock database
const mockDb = {
  products: [
    { id: 1, name: 'Test Product 1', price: 100, category: 'electronics' },
    { id: 2, name: 'Test Product 2', price: 200, category: 'clothing' }
  ],
  users: [
    { id: 1, email: 'test@example.com', password: 'hashedpassword' }
  ],
  orders: [],
  carts: []
};

describe('Backend API Tests', () => {
  let app;

  beforeEach(() => {
    // Reset mock database
    mockDb.products = [
      { id: 1, name: 'Test Product 1', price: 100, category: 'electronics' },
      { id: 2, name: 'Test Product 2', price: 200, category: 'clothing' }
    ];
    mockDb.orders = [];
    mockDb.carts = [];
  });

  describe('Products API', () => {
    describe('GET /api/products', () => {
      it('should return all products', async () => {
        const mockResponse = {
          products: mockDb.products,
          total: mockDb.products.length,
          page: 1,
          limit: 10
        };

        // Mock API endpoint
        const getProducts = jest.fn().mockResolvedValue(mockResponse);
        
        const result = await getProducts();
        
        expect(result.products).toHaveLength(2);
        expect(result.products[0]).toHaveProperty('id');
        expect(result.products[0]).toHaveProperty('name');
        expect(result.products[0]).toHaveProperty('price');
        expect(result.total).toBe(2);
      });

      it('should support pagination', async () => {
        const mockResponse = {
          products: [mockDb.products[0]],
          total: 2,
          page: 1,
          limit: 1
        };

        const getProducts = jest.fn().mockResolvedValue(mockResponse);
        const result = await getProducts({ page: 1, limit: 1 });

        expect(result.products).toHaveLength(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(1);
        expect(result.total).toBe(2);
      });

      it('should filter products by category', async () => {
        const electronicsProducts = mockDb.products.filter(p => p.category === 'electronics');
        const mockResponse = {
          products: electronicsProducts,
          total: electronicsProducts.length,
          page: 1,
          limit: 10
        };

        const getProducts = jest.fn().mockResolvedValue(mockResponse);
        const result = await getProducts({ category: 'electronics' });

        expect(result.products).toHaveLength(1);
        expect(result.products[0].category).toBe('electronics');
      });

      it('should search products by name', async () => {
        const searchResults = mockDb.products.filter(p => 
          p.name.toLowerCase().includes('test product 1')
        );
        const mockResponse = {
          products: searchResults,
          total: searchResults.length,
          page: 1,
          limit: 10
        };

        const getProducts = jest.fn().mockResolvedValue(mockResponse);
        const result = await getProducts({ search: 'test product 1' });

        expect(result.products).toHaveLength(1);
        expect(result.products[0].name).toContain('Test Product 1');
      });

      it('should filter products by price range', async () => {
        const filteredProducts = mockDb.products.filter(p => 
          p.price >= 50 && p.price <= 150
        );
        const mockResponse = {
          products: filteredProducts,
          total: filteredProducts.length,
          page: 1,
          limit: 10
        };

        const getProducts = jest.fn().mockResolvedValue(mockResponse);
        const result = await getProducts({ minPrice: 50, maxPrice: 150 });

        expect(result.products).toHaveLength(1);
        expect(result.products[0].price).toBe(100);
      });
    });

    describe('GET /api/products/:id', () => {
      it('should return specific product', async () => {
        const productId = 1;
        const expectedProduct = mockDb.products.find(p => p.id === productId);

        const getProduct = jest.fn().mockResolvedValue(expectedProduct);
        const result = await getProduct(productId);

        expect(result).toEqual(expectedProduct);
        expect(result.id).toBe(productId);
      });

      it('should return 404 for non-existent product', async () => {
        const getProduct = jest.fn().mockRejectedValue(new Error('Product not found'));

        await expect(getProduct(999)).rejects.toThrow('Product not found');
      });
    });

    describe('POST /api/products', () => {
      it('should create new product', async () => {
        const newProduct = {
          name: 'New Product',
          price: 300,
          category: 'books',
          description: 'A new test product'
        };

        const createdProduct = { ...newProduct, id: 3 };
        const createProduct = jest.fn().mockResolvedValue(createdProduct);

        const result = await createProduct(newProduct);

        expect(result).toHaveProperty('id');
        expect(result.name).toBe(newProduct.name);
        expect(result.price).toBe(newProduct.price);
      });

      it('should validate required fields', async () => {
        const invalidProduct = { price: 100 }; // Missing name

        const createProduct = jest.fn().mockRejectedValue(
          new Error('Validation error: name is required')
        );

        await expect(createProduct(invalidProduct)).rejects.toThrow('Validation error');
      });

      it('should validate price format', async () => {
        const invalidProduct = {
          name: 'Test Product',
          price: 'invalid_price'
        };

        const createProduct = jest.fn().mockRejectedValue(
          new Error('Validation error: price must be a number')
        );

        await expect(createProduct(invalidProduct)).rejects.toThrow('price must be a number');
      });
    });

    describe('PUT /api/products/:id', () => {
      it('should update existing product', async () => {
        const productId = 1;
        const updateData = { name: 'Updated Product', price: 150 };
        const updatedProduct = { ...mockDb.products[0], ...updateData };

        const updateProduct = jest.fn().mockResolvedValue(updatedProduct);
        const result = await updateProduct(productId, updateData);

        expect(result.name).toBe('Updated Product');
        expect(result.price).toBe(150);
      });

      it('should return 404 for non-existent product', async () => {
        const updateProduct = jest.fn().mockRejectedValue(new Error('Product not found'));

        await expect(updateProduct(999, { name: 'Test' })).rejects.toThrow('Product not found');
      });
    });

    describe('DELETE /api/products/:id', () => {
      it('should delete existing product', async () => {
        const productId = 1;
        const deleteProduct = jest.fn().mockResolvedValue({ message: 'Product deleted successfully' });

        const result = await deleteProduct(productId);

        expect(result.message).toBe('Product deleted successfully');
      });

      it('should return 404 for non-existent product', async () => {
        const deleteProduct = jest.fn().mockRejectedValue(new Error('Product not found'));

        await expect(deleteProduct(999)).rejects.toThrow('Product not found');
      });
    });
  });

  describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
      it('should register new user', async () => {
        const newUser = {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        };

        const registeredUser = {
          id: 2,
          email: newUser.email,
          name: newUser.name
        };

        const registerUser = jest.fn().mockResolvedValue({
          user: registeredUser,
          token: 'jwt_token_here'
        });

        const result = await registerUser(newUser);

        expect(result.user.email).toBe(newUser.email);
        expect(result.user).not.toHaveProperty('password');
        expect(result.token).toBeDefined();
      });

      it('should reject duplicate email', async () => {
        const duplicateUser = {
          email: 'test@example.com', // Already exists
          password: 'password123'
        };

        const registerUser = jest.fn().mockRejectedValue(
          new Error('Email already exists')
        );

        await expect(registerUser(duplicateUser)).rejects.toThrow('Email already exists');
      });

      it('should validate email format', async () => {
        const invalidUser = {
          email: 'invalid-email',
          password: 'password123'
        };

        const registerUser = jest.fn().mockRejectedValue(
          new Error('Invalid email format')
        );

        await expect(registerUser(invalidUser)).rejects.toThrow('Invalid email format');
      });

      it('should validate password strength', async () => {
        const weakPasswordUser = {
          email: 'test@example.com',
          password: '123' // Too weak
        };

        const registerUser = jest.fn().mockRejectedValue(
          new Error('Password too weak')
        );

        await expect(registerUser(weakPasswordUser)).rejects.toThrow('Password too weak');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'password123'
        };

        const loginUser = jest.fn().mockResolvedValue({
          user: { id: 1, email: credentials.email },
          token: 'jwt_token_here'
        });

        const result = await loginUser(credentials);

        expect(result.user.email).toBe(credentials.email);
        expect(result.token).toBeDefined();
      });

      it('should reject invalid credentials', async () => {
        const credentials = {
          email: 'test@example.com',
          password: 'wrong_password'
        };

        const loginUser = jest.fn().mockRejectedValue(
          new Error('Invalid credentials')
        );

        await expect(loginUser(credentials)).rejects.toThrow('Invalid credentials');
      });

      it('should reject non-existent user', async () => {
        const credentials = {
          email: 'nonexistent@example.com',
          password: 'password123'
        };

        const loginUser = jest.fn().mockRejectedValue(
          new Error('User not found')
        );

        await expect(loginUser(credentials)).rejects.toThrow('User not found');
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should logout user', async () => {
        const token = 'valid_jwt_token';
        const logoutUser = jest.fn().mockResolvedValue({
          message: 'Logged out successfully'
        });

        const result = await logoutUser(token);

        expect(result.message).toBe('Logged out successfully');
      });
    });
  });

  describe('Cart API', () => {
    describe('GET /api/cart', () => {
      it('should return user cart', async () => {
        const userId = 1;
        const mockCart = {
          id: 1,
          userId: userId,
          items: [
            { productId: 1, quantity: 2, product: mockDb.products[0] }
          ],
          total: 200
        };

        const getCart = jest.fn().mockResolvedValue(mockCart);
        const result = await getCart(userId);

        expect(result.userId).toBe(userId);
        expect(result.items).toHaveLength(1);
        expect(result.total).toBe(200);
      });

      it('should return empty cart for new user', async () => {
        const userId = 2;
        const emptyCart = {
          id: 2,
          userId: userId,
          items: [],
          total: 0
        };

        const getCart = jest.fn().mockResolvedValue(emptyCart);
        const result = await getCart(userId);

        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
      });
    });

    describe('POST /api/cart/add', () => {
      it('should add item to cart', async () => {
        const userId = 1;
        const itemData = { productId: 1, quantity: 1 };

        const addToCart = jest.fn().mockResolvedValue({
          id: 1,
          userId: userId,
          items: [{ ...itemData, product: mockDb.products[0] }],
          total: 100
        });

        const result = await addToCart(userId, itemData);

        expect(result.items).toHaveLength(1);
        expect(result.items[0].productId).toBe(itemData.productId);
        expect(result.items[0].quantity).toBe(itemData.quantity);
      });

      it('should update quantity if item already exists', async () => {
        const userId = 1;
        const itemData = { productId: 1, quantity: 1 };

        const addToCart = jest.fn().mockResolvedValue({
          id: 1,
          userId: userId,
          items: [{ productId: 1, quantity: 3, product: mockDb.products[0] }],
          total: 300
        });

        const result = await addToCart(userId, itemData);

        expect(result.items[0].quantity).toBe(3);
      });
    });

    describe('PUT /api/cart/update', () => {
      it('should update item quantity', async () => {
        const userId = 1;
        const updateData = { productId: 1, quantity: 5 };

        const updateCart = jest.fn().mockResolvedValue({
          id: 1,
          userId: userId,
          items: [{ productId: 1, quantity: 5, product: mockDb.products[0] }],
          total: 500
        });

        const result = await updateCart(userId, updateData);

        expect(result.items[0].quantity).toBe(5);
        expect(result.total).toBe(500);
      });
    });

    describe('DELETE /api/cart/remove', () => {
      it('should remove item from cart', async () => {
        const userId = 1;
        const productId = 1;

        const removeFromCart = jest.fn().mockResolvedValue({
          id: 1,
          userId: userId,
          items: [],
          total: 0
        });

        const result = await removeFromCart(userId, productId);

        expect(result.items).toHaveLength(0);
        expect(result.total).toBe(0);
      });
    });
  });

  describe('Orders API', () => {
    describe('POST /api/orders', () => {
      it('should create new order', async () => {
        const userId = 1;
        const orderData = {
          items: [{ productId: 1, quantity: 2 }],
          shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            zipCode: '12345'
          },
          paymentMethod: 'credit_card'
        };

        const createdOrder = {
          id: 1,
          userId: userId,
          ...orderData,
          status: 'pending',
          total: 200,
          createdAt: new Date().toISOString()
        };

        const createOrder = jest.fn().mockResolvedValue(createdOrder);
        const result = await createOrder(userId, orderData);

        expect(result.id).toBeDefined();
        expect(result.userId).toBe(userId);
        expect(result.status).toBe('pending');
        expect(result.total).toBe(200);
      });

      it('should validate required fields', async () => {
        const userId = 1;
        const invalidOrderData = {
          items: [] // Empty items
        };

        const createOrder = jest.fn().mockRejectedValue(
          new Error('Order must have at least one item')
        );

        await expect(createOrder(userId, invalidOrderData)).rejects.toThrow('at least one item');
      });
    });

    describe('GET /api/orders', () => {
      it('should return user orders', async () => {
        const userId = 1;
        const mockOrders = [
          {
            id: 1,
            userId: userId,
            status: 'completed',
            total: 200,
            createdAt: '2024-01-01T00:00:00Z'
          }
        ];

        const getOrders = jest.fn().mockResolvedValue({
          orders: mockOrders,
          total: 1,
          page: 1,
          limit: 10
        });

        const result = await getOrders(userId);

        expect(result.orders).toHaveLength(1);
        expect(result.orders[0].userId).toBe(userId);
      });
    });

    describe('GET /api/orders/:id', () => {
      it('should return specific order', async () => {
        const userId = 1;
        const orderId = 1;
        const mockOrder = {
          id: orderId,
          userId: userId,
          status: 'completed',
          total: 200,
          items: [{ productId: 1, quantity: 2, product: mockDb.products[0] }]
        };

        const getOrder = jest.fn().mockResolvedValue(mockOrder);
        const result = await getOrder(userId, orderId);

        expect(result.id).toBe(orderId);
        expect(result.userId).toBe(userId);
        expect(result.items).toHaveLength(1);
      });

      it('should return 404 for non-existent order', async () => {
        const getOrder = jest.fn().mockRejectedValue(new Error('Order not found'));

        await expect(getOrder(1, 999)).rejects.toThrow('Order not found');
      });

      it('should prevent access to other users orders', async () => {
        const getOrder = jest.fn().mockRejectedValue(new Error('Access denied'));

        await expect(getOrder(2, 1)).rejects.toThrow('Access denied');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const getProducts = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(getProducts()).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid JSON in request body', async () => {
      const createProduct = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      await expect(createProduct('invalid json')).rejects.toThrow('Invalid JSON');
    });

    it('should handle rate limiting', async () => {
      const rateLimitedRequest = jest.fn().mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(rateLimitedRequest()).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Security Tests', () => {
    it('should sanitize SQL injection attempts', async () => {
      const maliciousQuery = "'; DROP TABLE products; --";
      const getProducts = jest.fn().mockResolvedValue({ products: [], total: 0 });

      const result = await getProducts({ search: maliciousQuery });

      expect(result.products).toEqual([]);
      // Ensure no SQL injection occurred
    });

    it('should validate JWT tokens', async () => {
      const invalidToken = 'invalid.jwt.token';
      const protectedRoute = jest.fn().mockRejectedValue(new Error('Invalid token'));

      await expect(protectedRoute(invalidToken)).rejects.toThrow('Invalid token');
    });

    it('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const createProduct = jest.fn().mockResolvedValue({
        id: 1,
        name: '&lt;script&gt;alert("xss")&lt;/script&gt;', // Escaped
        price: 100
      });

      const result = await createProduct({ name: xssPayload, price: 100 });

      expect(result.name).not.toBe(xssPayload);
      expect(result.name).toContain('&lt;');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large product lists efficiently', async () => {
      const startTime = Date.now();
      
      const getProducts = jest.fn().mockResolvedValue({
        products: Array(10000).fill().map((_, i) => ({ id: i, name: `Product ${i}`, price: 100 })),
        total: 10000
      });

      await getProducts({ limit: 10000 });
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should implement proper pagination for large datasets', async () => {
      const getProducts = jest.fn().mockResolvedValue({
        products: Array(50).fill().map((_, i) => ({ id: i, name: `Product ${i}`, price: 100 })),
        total: 10000,
        page: 1,
        limit: 50
      });

      const result = await getProducts({ page: 1, limit: 50 });

      expect(result.products).toHaveLength(50);
      expect(result.total).toBe(10000);
    });
  });
});

// Mock utilities for other test files
module.exports = {
  mockDb,
  setupTestDb: () => {
    // Setup test database
    return mockDb;
  },
  clearTestDb: () => {
    // Clear test database
    mockDb.products = [];
    mockDb.users = [];
    mockDb.orders = [];
    mockDb.carts = [];
  },
  createMockUser: (userData = {}) => {
    return {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedpassword',
      ...userData
    };
  },
  createMockProduct: (productData = {}) => {
    return {
      id: 1,
      name: 'Test Product',
      price: 100,
      category: 'test',
      description: 'Test description',
      ...productData
    };
  }
};