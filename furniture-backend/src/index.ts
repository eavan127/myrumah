import express = require("express");
import cors = require("cors");
import dotenv = require("dotenv");
import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

dotenv.config();

// Setup PostgreSQL adapter for Prisma 7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

app.use(cors());
app.use(express.json());

// ==================== AUTH MIDDLEWARE ====================
const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================
// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: { id: user.id, email: user.email },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user (protected route)
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
    res.json({ message: '🪑 Furniture Backend API is running!' });
});

// ==================== PRODUCT ROUTES ====================
app.get('/api/products', async (req, res) => {
    try {
        const furniture = await prisma.furniture.findMany();
        // Map database fields to frontend expected fields
        res.json(furniture.map(f => ({
            ...f,
            title: f.name, // Frontend expects 'title', DB has 'name'
            merchantName: 'Season Flagship',
            tags: [f.category] // Frontend expects 'tags' array, DB has 'category' string
        })));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const furniture = await prisma.furniture.findUnique({
            where: { id: req.params.id }
        });

        if (!furniture) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            ...furniture,
            title: furniture.name,
            merchantName: 'Season Flagship',
            tags: [furniture.category] // Frontend expects 'tags' array
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        // Adapter for frontend 'title' -> backend 'name'
        const { title, ...rest } = req.body;
        const furniture = await prisma.furniture.create({
            data: {
                ...rest,
                name: title || rest.name
            }
        });
        res.json(furniture);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ==================== MERCHANT ROUTES (Mock) ====================
// In a real app, this would come from a Merchant table
const MOCK_MERCHANTS = [
    {
        id: '1',
        name: 'Season Flagship',
        logoUri: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=2069&auto=format&fit=crop',
        description: 'Premium furniture for the modern home.',
        address: '123 Luxury Lane, Design District',
        rating: 4.8
    },
    {
        id: '2',
        name: 'Nordic Living',
        logoUri: 'https://images.unsplash.com/photo-1513506003011-3b03c8b61c91?q=80&w=2070&auto=format&fit=crop',
        description: 'Authentic Scandinavian minimalism.',
        address: '456 Fjord Ave, Nordic Park',
        rating: 4.9
    }
];

app.get('/api/merchants', (req, res) => {
    res.json(MOCK_MERCHANTS);
});

app.get('/api/merchants/:id', (req, res) => {
    const merchant = MOCK_MERCHANTS.find(m => m.id === req.params.id);
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
    res.json(merchant);
});

// ==================== CART ROUTES (Protected) ====================

// Helper to calculate total
const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// Get User's Cart
app.get('/api/cart', authenticateToken, async (req: any, res) => {
    try {
        const userId = String(req.user.userId);

        let cart = await prisma.cart.findFirst({
            where: { userId }
        });

        // Create cart if doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId,
                    items: [],
                    total: 0
                }
            });
        }

        res.json(cart);
    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add Item to Cart
app.post('/api/cart/add', authenticateToken, async (req: any, res) => {
    try {
        const userId = String(req.user.userId);
        const { productId, quantity } = req.body;

        // Fetch product details for price/info
        const product = await prisma.furniture.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cart = await prisma.cart.findFirst({ where: { userId } });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId, items: [], total: 0 }
            });
        }

        let items = cart.items as any[] || [];
        const existingItemIndex = items.findIndex((item: any) => item.id === productId);

        if (existingItemIndex > -1) {
            items[existingItemIndex].quantity += quantity;
        } else {
            items.push({
                id: product.id,
                title: product.name,
                price: product.price,
                imageUri: product.imageUrl, // Map DB 'imageUrl' to frontend 'imageUri'
                merchantId: '1', // Hardcoded for now, or add to DB schema
                quantity: quantity
            });
        }

        const updatedTotal = calculateTotal(items);

        const updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: {
                items: items,
                total: updatedTotal
            }
        });

        res.json(updatedCart);
    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Update Item Quantity
app.post('/api/cart/update', authenticateToken, async (req: any, res) => {
    try {
        const userId = String(req.user.userId);
        const { productId, quantity } = req.body;

        const cart = await prisma.cart.findFirst({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        let items = cart.items as any[] || [];
        const itemIndex = items.findIndex((item: any) => item.id === productId);

        if (itemIndex > -1) {
            if (quantity > 0) {
                items[itemIndex].quantity = quantity;
            } else {
                // Remove if quantity is 0 or less
                items.splice(itemIndex, 1);
            }

            const updatedCart = await prisma.cart.update({
                where: { id: cart.id },
                data: {
                    items: items,
                    total: calculateTotal(items)
                }
            });
            return res.json(updatedCart);
        }

        res.status(404).json({ error: 'Item not found in cart' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove Item from Cart
app.delete('/api/cart/:productId', authenticateToken, async (req: any, res) => {
    try {
        const userId = String(req.user.userId);
        const { productId } = req.params;

        const cart = await prisma.cart.findFirst({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        let items = cart.items as any[] || [];
        const newItems = items.filter((item: any) => item.id !== productId);

        const updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: {
                items: newItems,
                total: calculateTotal(newItems)
            }
        });

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// ==================== ORDER ROUTES (Protected) ====================

// Helper to calculate order status based on time elapsed
const calculateOrderStatus = (createdAt: Date): string => {
    const now = new Date();
    const hoursElapsed = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

    if (hoursElapsed < 24) return "Processing";     // 0-24 hours
    if (hoursElapsed < 72) return "Shipping";       // 24-72 hours (3 days)
    return "Arrived";                               // After 3 days
};

// Create Order from Cart (called when user pays)
app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
        const userId = String(req.user.userId);
        const { shippingAddress, paymentDetails } = req.body;

        console.log('Creating order for userId:', userId);

        // Get user's cart
        const cart = await prisma.cart.findFirst({ where: { userId } });
        console.log('Found cart:', cart);

        if (!cart || (cart.items as any[]).length === 0) {
            console.log('Cart is empty or not found for userId:', userId);
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Create order with cart items and payment details
        const order = await prisma.order.create({
            data: {
                userId,
                items: cart.items as any,  // Cast to satisfy Prisma's JSON type
                total: cart.total,
                status: 'pending',
                shippingAddress: shippingAddress || undefined,
                paymentDetails: paymentDetails || undefined
            }
        });

        // Clear cart after successful order
        await prisma.cart.update({
            where: { id: cart.id },
            data: { items: [], total: 0 }
        });
        // Resets the cart’s items to an empty array.

        // Return order with calculated status
        res.json({
            ...order,
            calculatedStatus: calculateOrderStatus(order.createdAt)
        });
        //Object spread operator.
        //Copies all enumerable properties from the order object into the response.

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get User's Orders with calculated status
app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: String(req.user.userId) },
            orderBy: { createdAt: 'desc' }  // Most recent first
        });

        // Add calculated status to each order
        const ordersWithStatus = orders.map((order: any) => ({
            //Iterates through each order returned from the database.
            ...order,
            //have original properties
            //then below here is to add the new property
            calculatedStatus: calculateOrderStatus(order.createdAt)
        }));

        res.json(ordersWithStatus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// This endpoint retrieves all orders belonging to the authenticated user, 
// sorted by most recent first, and returns each order with an additional calculated (dynamic) status 
// based on its creation time.

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});