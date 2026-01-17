import { Context } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

export class SwaggerService {
  constructor() {}

  handleSwaggerUI = swaggerUI({
    url: '/api/doc',
    title: 'Hono.js Boilerplate API Documentation',
  });

  async handleOpenAPISpec(c: Context) {
    const spec = this.getOpenAPISpec();
    return c.json(spec);
  }

  private getOpenAPISpec() {
    return {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Hono.js Boilerplate API',
        description:
          'Production-ready Hono.js boilerplate with authentication, PostgreSQL, Redis, and payment integration',
        contact: {
          name: 'API Support',
          email: 'support@honojs-boilerplate.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://api.example.com',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'Authentication', description: 'User authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Profile', description: 'User profile endpoints' },
        { name: 'Orders', description: 'Order management endpoints' },
        { name: 'Payments', description: 'Payment processing endpoints' },
        { name: 'Health', description: 'Health check endpoints' },
      ],
      paths: {
        '/health': {
          get: {
            tags: ['Health'],
            summary: 'Health check',
            description: 'Check if API is running',
            responses: {
              '200': {
                description: 'API is healthy',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/version': {
          get: {
            tags: ['Health'],
            summary: 'API version',
            description: 'Get API version information',
            responses: {
              '200': {
                description: 'API version',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'Hono.js Boilerplate' },
                        version: { type: 'string', example: '1.0.0' },
                        api: { type: 'string', example: 'v1' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/auth/register': {
          post: {
            tags: ['Authentication'],
            summary: 'Register new user',
            description: 'Create a new user account',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string', format: 'email', example: 'user@example.com' },
                      password: { type: 'string', minLength: 8, example: 'password123' },
                      name: { type: 'string', minLength: 2, example: 'John Doe' },
                      phone: {
                        type: 'string',
                        pattern: '^\\+?[1-9]\\d{10,15}$',
                        example: '+6281234567890',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'User registered successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            user: { type: 'object' },
                            accessToken: { type: 'string' },
                            refreshToken: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Validation failed' },
                        details: { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/auth/login': {
          post: {
            tags: ['Authentication'],
            summary: 'User login',
            description: 'Authenticate user with email and password',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string', format: 'email', example: 'user@example.com' },
                      password: { type: 'string', example: 'password123' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            user: { type: 'object' },
                            accessToken: { type: 'string' },
                            refreshToken: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Invalid credentials',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Invalid email or password' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/auth/logout': {
          post: {
            tags: ['Authentication'],
            summary: 'User logout',
            description: 'Logout user and invalidate session',
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Logout successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            message: { type: 'string', example: 'Logged out successfully' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'User not authenticated' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/auth/refresh': {
          post: {
            tags: ['Authentication'],
            summary: 'Refresh access token',
            description: 'Get new access token using refresh token',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                      refreshToken: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Token refreshed successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            user: { type: 'object' },
                            accessToken: { type: 'string' },
                            refreshToken: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Invalid refresh token',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Invalid or expired token' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/users/me': {
          get: {
            tags: ['Users'],
            summary: 'Get current user profile',
            description: 'Get profile of authenticated user',
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'User profile retrieved',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            name: { type: 'string', nullable: true },
                            phone: { type: 'string', nullable: true },
                            avatar: { type: 'string', nullable: true },
                            isActive: { type: 'boolean' },
                            emailVerified: { type: 'boolean' },
                            createdAt: { type: 'string' },
                            updatedAt: { type: 'string' },
                            profile: { type: 'object', nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'User not authenticated' },
                      },
                    },
                  },
                },
              },
            },
          },
          put: {
            tags: ['Users'],
            summary: 'Update current user profile',
            description: 'Update profile of authenticated user',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', minLength: 2, example: 'John Doe' },
                      phone: {
                        type: 'string',
                        pattern: '^\\+?[1-9]\\d{10,15}$',
                        example: '+6281234567890',
                      },
                      avatar: {
                        type: 'string',
                        format: 'uri',
                        example: 'https://example.com/avatar.jpg',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Profile updated successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Validation failed' },
                        details: { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/users/me/password': {
          put: {
            tags: ['Users'],
            summary: 'Update user password',
            description: 'Update password of authenticated user',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword', 'confirmPassword'],
                    properties: {
                      currentPassword: { type: 'string', example: 'oldpassword123' },
                      newPassword: { type: 'string', minLength: 8, example: 'newpassword123' },
                      confirmPassword: { type: 'string', minLength: 8, example: 'newpassword123' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Password updated successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            message: { type: 'string', example: 'Password updated successfully' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Validation error or incorrect current password',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Current password is incorrect' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/profile': {
          get: {
            tags: ['Profile'],
            summary: 'Get user profile',
            description: 'Get detailed profile of authenticated user',
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Profile retrieved',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Profile'],
            summary: 'Create user profile',
            description: 'Create a new profile for authenticated user',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      bio: { type: 'string', example: 'Software developer' },
                      address: { type: 'string', example: '123 Main St' },
                      city: { type: 'string', example: 'Jakarta' },
                      country: { type: 'string', example: 'Indonesia' },
                      postalCode: { type: 'string', example: '12345' },
                      dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Profile created successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          put: {
            tags: ['Profile'],
            summary: 'Update user profile',
            description: 'Update profile of authenticated user',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      bio: { type: 'string', example: 'Software developer' },
                      address: { type: 'string', example: '123 Main St' },
                      city: { type: 'string', example: 'Jakarta' },
                      country: { type: 'string', example: 'Indonesia' },
                      postalCode: { type: 'string', example: '12345' },
                      dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Profile updated successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['Profile'],
            summary: 'Delete user profile',
            description: 'Delete profile of authenticated user',
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Profile deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            message: { type: 'string', example: 'Profile deleted successfully' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/orders': {
          get: {
            tags: ['Orders'],
            summary: 'List user orders',
            description: 'Get a paginated list of orders for authenticated user',
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                description: 'Page number',
                schema: { type: 'integer', default: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                description: 'Number of items per page',
                schema: { type: 'integer', default: 10 },
              },
            ],
            responses: {
              '200': {
                description: 'Orders retrieved',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'array', items: { type: 'object' } },
                        pagination: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['Orders'],
            summary: 'Create new order',
            description: 'Create a new order for authenticated user',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['items'],
                    properties: {
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            productName: { type: 'string', example: 'Product A' },
                            quantity: { type: 'integer', example: 2 },
                            price: { type: 'number', example: 100000 },
                            metadata: { type: 'object' },
                          },
                        },
                      },
                      notes: { type: 'string', example: 'Please deliver before 5 PM' },
                    },
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'Order created successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Validation failed' },
                        details: { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/orders/{id}': {
          get: {
            tags: ['Orders'],
            summary: 'Get order details',
            description: 'Get details of a specific order',
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Order ID',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Order details retrieved',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
              '404': {
                description: 'Order not found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Order not found' },
                      },
                    },
                  },
                },
              },
            },
          },
          put: {
            tags: ['Orders'],
            summary: 'Update order',
            description: 'Update a specific order',
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Order ID',
                schema: { type: 'string' },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        enum: [
                          'PENDING',
                          'CONFIRMED',
                          'PROCESSING',
                          'SHIPPED',
                          'DELIVERED',
                          'CANCELLED',
                          'REFUNDED',
                        ],
                        example: 'CONFIRMED',
                      },
                      notes: { type: 'string', example: 'Updated notes' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Order updated successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['Orders'],
            summary: 'Delete order',
            description: 'Delete a specific order',
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Order ID',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Order deleted successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                          type: 'object',
                          properties: {
                            message: { type: 'string', example: 'Order deleted successfully' },
                          },
                        },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Cannot delete order',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Order cannot be deleted' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/payments/initiate': {
          post: {
            tags: ['Payments'],
            summary: 'Initiate payment',
            description: 'Initiate a new payment for an order',
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['orderId', 'paymentMethod', 'amount'],
                    properties: {
                      orderId: { type: 'string', example: 'clxxxxxxxxxxxxx' },
                      paymentMethod: {
                        type: 'string',
                        enum: [
                          'credit_card',
                          'bank_transfer',
                          'ewallet',
                          'qris',
                          'virtual_account',
                        ],
                        example: 'virtual_account',
                      },
                      amount: { type: 'number', example: 200000 },
                      currency: { type: 'string', example: 'IDR' },
                      customerDetails: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', example: 'John Doe' },
                          email: { type: 'string', format: 'email', example: 'john@example.com' },
                          phone: { type: 'string', example: '+6281234567890' },
                        },
                      },
                      expiryMinutes: { type: 'integer', example: 60 },
                      callbackUrl: {
                        type: 'string',
                        format: 'uri',
                        example: 'https://example.com/callback',
                      },
                      returnUrl: {
                        type: 'string',
                        format: 'uri',
                        example: 'https://example.com/return',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Payment initiated successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Validation error',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Validation failed' },
                        details: { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/payments/callback': {
          post: {
            tags: ['Payments'],
            summary: 'Payment callback',
            description: 'Handle payment callback from payment gateway',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      paymentId: { type: 'string', example: 'PAY123456' },
                      orderId: { type: 'string', example: 'clxxxxxxxxxxxxx' },
                      status: { type: 'string', example: 'PAID' },
                      transactionId: { type: 'string', example: 'TXN123456' },
                      signature: { type: 'string', example: 'abc123...' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'Callback processed successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/payments/{id}/status': {
          get: {
            tags: ['Payments'],
            summary: 'Get payment status',
            description: 'Get status of a specific payment',
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Payment ID',
                schema: { type: 'string' },
              },
            ],
            responses: {
              '200': {
                description: 'Payment status retrieved',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                      },
                    },
                  },
                },
              },
              '404': {
                description: 'Payment not found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Payment not found' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT authentication token. Format: Bearer {token}',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string', example: 'Validation failed' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
          Success: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              total: { type: 'number', example: 100 },
              totalPages: { type: 'number', example: 10 },
              hasNext: { type: 'boolean', example: true },
              hasPrev: { type: 'boolean', example: false },
            },
          },
        },
      },
    };
  }
}
