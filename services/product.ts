export interface Product {
    id: string;
    title: string;
    price: string;
    imageUri: string;
    merchantId: string;
    merchantName?: string;
    description: string;
    dimensions?: string;
    materials?: string;
    tags?: string[];
    stock?: number;
    rating?: number;
    reviewCount?: number;
}

let products: Product[] = [
    {
        id: '1',
        title: 'STRANDMON',
        price: '299',
        imageUri: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1965&auto=format&fit=crop',
        merchantId: 'merchant_1',
        merchantName: 'Season Flagship',
        description: 'A classic high-back armchair that brings timeless style and comfort to any living room.',
        dimensions: '82x96x101 cm',
        materials: 'Fabric, Wood',
        tags: ['Living Room', 'Chair', 'Classic'],
        stock: 12,
        rating: 4.9,
        reviewCount: 154
    },
    {
        id: '2',
        title: 'Nordic Vase',
        price: '45',
        imageUri: 'https://images.unsplash.com/photo-1581783342308-f792ca11df53?q=80&w=2070&auto=format&fit=crop',
        merchantId: 'merchant_2',
        merchantName: 'Nordic Home',
        description: 'Minimalist ceramic vase, perfect for dried flowers or as a standalone piece.',
        dimensions: '15x30 cm',
        materials: 'Ceramic',
        tags: ['Decor', 'Modern'],
        stock: 50,
        rating: 4.7,
        reviewCount: 42
    },
    {
        id: '3',
        title: 'LUNAR Lamp',
        price: '89',
        imageUri: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=2070&auto=format&fit=crop',
        merchantId: 'merchant_3',
        merchantName: 'Lumina Lights',
        description: 'Ambient table lamp with a spherical glass shade and messing base.',
        dimensions: '25x40 cm',
        materials: 'Glass, Metal',
        tags: ['Lighting', 'Bedroom'],
        stock: 22,
        rating: 4.6,
        reviewCount: 88
    },
    {
        id: '4',
        title: 'OAK Coffee Table',
        price: '199',
        imageUri: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1976&auto=format&fit=crop',
        merchantId: 'merchant_4',
        merchantName: 'WoodWorks Co.',
        description: 'Solid oak coffee table with a natural finish and rounded edges.',
        dimensions: '120x60x45 cm',
        materials: 'Solid Oak',
        tags: ['Table', 'Living Room'],
        stock: 8,
        rating: 4.8,
        reviewCount: 210
    },
    {
        id: '5',
        title: 'Velvet Sofa',
        price: '899',
        imageUri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop',
        merchantId: 'merchant_5',
        merchantName: 'Urban Living',
        description: 'Luxurious green velvet sofa, 3-seater with deep cushions.',
        dimensions: '220x95x85 cm',
        materials: 'Velvet, Wood',
        tags: ['Living Room', 'Chair', 'Luxury'],
        stock: 4,
        rating: 5.0,
        reviewCount: 15
    },
    {
        id: '6',
        title: 'Minimalist Desk',
        price: '249',
        imageUri: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2070&auto=format&fit=crop',
        merchantId: 'merchant_2',
        merchantName: 'Nordic Home',
        description: 'Clean white desk with birch legs, ideal for modern workspaces.',
        dimensions: '140x70x75 cm',
        materials: 'MDF, Birch',
        tags: ['Table', 'Office'],
        stock: 15,
        rating: 4.4,
        reviewCount: 65
    },
    {
        id: '7',
        title: 'Abstract Art',
        price: '129',
        imageUri: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1974&auto=format&fit=crop',
        merchantId: 'merchant_6',
        merchantName: 'Art & Decor',
        description: 'Large canvas print with neutral colors and abstract forms.',
        dimensions: '100x150 cm',
        materials: 'Canvas, Wood',
        tags: ['Decor', 'Art'],
        stock: 30,
        rating: 4.9,
        reviewCount: 30
    },
    {
        id: '8',
        title: 'Rattan Chair',
        price: '159',
        imageUri: 'https://images.unsplash.com/photo-1596162955779-9c8f7b43f0a0?q=80&w=2070&auto=format&fit=crop',
        merchantId: 'merchant_4',
        merchantName: 'WoodWorks Co.',
        description: 'Hand-woven rattan chair with a natural relaxed vibe.',
        dimensions: '70x75x80 cm',
        materials: 'Rattan, Bamboo',
        tags: ['Chair', 'Outdoor', 'Boho'],
        stock: 18,
        rating: 4.7,
        reviewCount: 95
    }
];

export const getProducts = async () => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...products];
};

export const getMerchantProducts = async (merchantId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return products.filter(p => p.merchantId === merchantId);
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    products.push(newProduct);
    return newProduct;
};
