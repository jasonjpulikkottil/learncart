import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LearnCart API',
            version: '1.0.0',
            description: 'API for the LearnCart student marketplace',
            contact: {
                name: 'LearnCart Support',
                email: 'support@learncart.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'https://campiz.vercel.app',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'next-auth.session-token',
                    description: 'NextAuth session cookie (automatically sent by browser)',
                },
            },
            schemas: {
                Listing: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Listing ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Listing title',
                            maxLength: 100,
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description',
                            maxLength: 2000,
                        },
                        price: {
                            type: 'number',
                            description: 'Price in INR',
                            minimum: 0,
                        },
                        category: {
                            type: 'string',
                            enum: ['textbooks', 'electronics', 'furniture', 'clothing', 'other'],
                            description: 'Item category',
                        },
                        condition: {
                            type: 'string',
                            enum: ['new', 'like-new', 'good', 'fair'],
                            description: 'Item condition',
                        },
                        imageUrl: {
                            type: 'string',
                            description: 'Image URL',
                        },
                        isSwappable: {
                            type: 'boolean',
                            description: 'Whether item is open for swap',
                        },
                        swapPreferences: {
                            type: 'string',
                            description: 'What items seller wants in exchange',
                            maxLength: 500,
                        },
                        location: {
                            type: 'object',
                            properties: {
                                city: {
                                    type: 'string',
                                },
                                area: {
                                    type: 'string',
                                },
                                pincode: {
                                    type: 'string',
                                    pattern: '^[1-9][0-9]{5}$',
                                },
                                coordinates: {
                                    type: 'object',
                                    properties: {
                                        type: {
                                            type: 'string',
                                            enum: ['Point'],
                                        },
                                        coordinates: {
                                            type: 'array',
                                            items: {
                                                type: 'number',
                                            },
                                            description: '[longitude, latitude]',
                                        },
                                    },
                                },
                            },
                        },
                        meetupPreference: {
                            type: 'string',
                            enum: ['pickup', 'delivery', 'both'],
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'sold', 'swapped'],
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                            maxLength: 100,
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        phoneNumber: {
                            type: 'string',
                            pattern: '^[6-9]\\\\d{9}$',
                        },
                        whatsappEnabled: {
                            type: 'boolean',
                        },
                        location: {
                            type: 'object',
                            properties: {
                                city: { type: 'string' },
                                area: { type: 'string' },
                                state: { type: 'string' },
                                pincode: { type: 'string' },
                            },
                        },
                        emailVerified: {
                            type: 'boolean',
                        },
                        isAdmin: {
                            type: 'boolean',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Listings',
                description: 'Listing management endpoints',
            },
            {
                name: 'Users',
                description: 'User profile and account endpoints',
            },
            {
                name: 'Auth',
                description: 'Authentication endpoints',
            },
            {
                name: 'Admin',
                description: 'Admin-only endpoints (requires admin privileges)',
            },
        ],
    },
    apis: ['./src/app/api/**/*.js'], // Path to API files with annotations
};

export const swaggerSpec = swaggerJsdoc(options);
