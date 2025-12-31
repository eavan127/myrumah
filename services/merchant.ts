export interface Merchant {
    id: string;
    name: string;
    logoUri: string;
    description: string;
    address: string;
    rating: number;
}

const merchants: Merchant[] = [
    {
        id: 'merchant_1',
        name: 'RumahAI Flagship',
        logoUri: 'https://via.placeholder.com/150',
        description: 'Quality furniture for every room in your home.',
        address: '123 Furniture St, Design City',
        rating: 4.8
    },
    {
        id: 'merchant_2',
        name: 'Modern Living',
        logoUri: 'https://via.placeholder.com/150',
        description: 'Contemporary designs for the modern lifestyle.',
        address: '456 Modern Ave, Style Town',
        rating: 4.5
    },
    {
        id: 'merchant_3',
        name: 'Vintage Finds',
        logoUri: 'https://via.placeholder.com/150',
        description: 'Timeless pieces with a story to tell.',
        address: '789 Retro Blvd, Classic Ville',
        rating: 4.9
    }
];

// ... existing code ...

export const getMerchants = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...merchants];
};

export interface Review {
    id: string;
    userName: string;
    avatarUri?: string;
    rating: number;
    comment: string;
    date: string;
}

const reviews: Record<string, Review[]> = {
    'merchant_1': [
        { id: 'r1', userName: 'Sarah J.', rating: 5, comment: 'Amazing quality and fast delivery!', date: '2 days ago' },
        { id: 'r2', userName: 'Mike T.', rating: 4, comment: 'Good value for money.', date: '1 week ago' }
    ],
    'merchant_2': [
        { id: 'r3', userName: 'Emily R.', rating: 5, comment: 'Love the modern designs!', date: '3 days ago' }
    ]
};


export const getMerchantReviews = async (merchantId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return reviews[merchantId] || [];
};

export const getMerchant = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return merchants.find(m => m.id === id) || null;
};
