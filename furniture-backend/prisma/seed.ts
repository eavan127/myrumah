import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv'; // using default import for consistency if esModuleInterop is on, or require if not. 
import { Pool } from "pg";
// Given previous files used require, but seed is often TS. Let's use require-style for safety if not sure about tsconfig.
// actually, let's stick to the imports used in index.ts but this is a standalone script.

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const furnitureData = [
    // ==================== CHAIRS ====================
    {
        name: "The Monarch Lounge Chair",
        description: "A statement piece of pure luxury. Upholstered in authentic Italian cognac leather with hand-stitched detailing, resting on a solid walnut frame. Designed for those who appreciate the finer things.",
        price: 1299.00,
        category: "CHAIR",
        material: "Italian Leather, Walnut Wood",
        dimensions: "W85 x D90 x H80 cm",
        imageUrl: "https://images.unsplash.com/photo-1567538096630-e08558e0fcde?q=80&w=2148&auto=format&fit=crop",
        stock: 5
    },
    {
        name: "Aero Velvet Armchair",
        description: "Soft, curvaceous, and undeniably elegant. The Aero features plush midnight blue velvet upholstery that feels as expensive as it looks, accented by brushed gold legs.",
        price: 899.00,
        category: "CHAIR",
        material: "Royal Velvet, Brass",
        dimensions: "W75 x D75 x H85 cm",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop",
        stock: 8
    },
    {
        name: "Minimalist Weave Chair",
        description: "Scandinavian simplicity meets artisanal craftsmanship. Hand-woven paper cord seat on a masterfully bent natural oak frame. Lightweight, durable, and timeless.",
        price: 459.00,
        category: "CHAIR",
        material: "Natural Oak, Paper Cord",
        dimensions: "W50 x D50 x H78 cm",
        imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e276?q=80&w=1000&auto=format&fit=crop",
        stock: 12
    },

    // ==================== TABLES ====================
    {
        name: "Carrara Marble Dining Table",
        description: "Dine in opulence. A solid slab of genuine Carrara marble with distinctive grey veining, honed to a matte finish. Supported by a geometric black steel base.",
        price: 2499.00,
        category: "TABLE",
        material: "Carrara Marble, Powder-coated Steel",
        dimensions: "L200 x W100 x H75 cm",
        imageUrl: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=2158&auto=format&fit=crop",
        stock: 3
    },
    {
        name: "Obsidian Coffee Table",
        description: "A centerpiece that demands attention. Tempered smoked glass top floats above a sculptural ash wood base stained in deep espresso. Modern, sleek, and mysterious.",
        price: 650.00,
        category: "TABLE",
        material: "Smoked Glass, Ash Wood",
        dimensions: "D90 x H40 cm",
        imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1976&auto=format&fit=crop",
        stock: 10
    },
    {
        name: "Rustic Teak Console",
        description: "Reclaimed teak wood with a raw, textured finish. Perfect for the entryway or behind a sofa, bringing organic warmth to any contemporary space.",
        price: 549.00,
        category: "TABLE",
        material: "Reclaimed Teak",
        dimensions: "L150 x W40 x H80 cm",
        imageUrl: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=2071&auto=format&fit=crop",
        stock: 6
    },

    // ==================== LIGHTING ====================
    {
        name: "Eclipse Pendant Light",
        description: "Inspired by the celestial. Two brass discs overlap to create a soft, diffused glow that mimics a lunar eclipse. A functional work of art.",
        price: 399.00,
        category: "LIGHTING",
        material: "Brushed Brass, LED",
        dimensions: "D40 cm",
        imageUrl: "https://images.unsplash.com/photo-1513506003011-3b03c8b61c91?q=80&w=2070&auto=format&fit=crop",
        stock: 15
    },
    {
        name: "Noir Industrial Floor Lamp",
        description: "Matte black metal finish with a customizable articulating arm. Provides focused reading light with a silhouette that cuts a striking figure in any room.",
        price: 279.00,
        category: "LIGHTING",
        material: "Matte Black Steel",
        dimensions: "H160 cm",
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=2070&auto=format&fit=crop",
        stock: 20
    },

    // ==================== DECOR ====================
    {
        name: "Abstract Ceramic Vase Set",
        description: "A trio of hand-thrown stoneware vases in earthy, muted tones. Their organic shapes break the rigidity of modern lines, adding soul to your shelving.",
        price: 189.00,
        category: "DECOR",
        material: "Stoneware Ceramic",
        dimensions: "Various Sizes",
        imageUrl: "https://images.unsplash.com/photo-1581783342308-f792ca1145f2?q=80&w=2070&auto=format&fit=crop",
        stock: 25
    },
    {
        name: "Bohemian Jute Rug",
        description: "Hand-braided natural jute fibers create a durable and sustainable foundation for your living space. Adds texture and warmth instantly.",
        price: 299.00,
        category: "DECOR",
        material: "100% Natural Jute",
        dimensions: "200 x 300 cm",
        imageUrl: "https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?q=80&w=1974&auto=format&fit=crop",
        stock: 8
    }
];

async function main() {
    console.log('🌱 Starting seed...');

    // Optional: Clear existing data
    // await prisma.furniture.deleteMany();
    // console.log('Deleted existing furniture.');

    for (const item of furnitureData) {
        const furniture = await prisma.furniture.create({
            data: item
        });
        console.log(`Created furniture: ${furniture.name}`);
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
