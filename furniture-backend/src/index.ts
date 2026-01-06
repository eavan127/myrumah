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

// ==================== FURNITURE ROUTES ====================
app.get('/api/furniture', async (req, res) => {
    try {
        const furniture = await prisma.furniture.findMany();
        res.json(furniture);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch furniture' });
    }
});

app.get('/api/furniture/:id', async (req, res) => {
    try {
        const furniture = await prisma.furniture.findUnique({
            where: { id: req.params.id }
        });
        res.json(furniture);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch furniture' });
    }
});

app.post('/api/furniture', async (req, res) => {
    try {
        const furniture = await prisma.furniture.create({
            data: req.body
        });
        res.json(furniture);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create furniture' });
    }
});

// ==================== CART ROUTES (Protected) ====================
app.get('/api/cart/:userId', authenticateToken, async (req: any, res) => {
    try {
        // Ensure user can only access their own cart
        if (req.user.userId !== parseInt(req.params.userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const cart = await prisma.cart.findFirst({
            where: { userId: req.params.userId }
        });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// ==================== ORDER ROUTES (Protected) ====================
app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
        const order = await prisma.order.create({
            data: {
                ...req.body,
                userId: String(req.user.userId) // Use authenticated user's ID
            }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: String(req.user.userId) }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});