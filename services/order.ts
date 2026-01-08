import api from './api';

export interface Order {
    id: string;
    userId: string;
    items: any[];
    total: number;
    status: string;
    calculatedStatus: string;  // "Processing" | "Shipping" | "Arrived"
    shippingAddress?: any;
    paymentDetails?: any;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentDetails {
    method: string;        // 'card' | 'paypal' | 'bank'
    cardLast4?: string;    // Last 4 digits (for card payments)
    cardBrand?: string;    // 'Visa' | 'Mastercard' etc.
}

export interface ShippingAddress {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
}

// Create order from cart (called when user pays)
export const createOrder = async (
    shippingAddress: ShippingAddress,
    paymentDetails: PaymentDetails
): Promise<Order> => {
    const response = await api.post('/orders', {
        shippingAddress,
        paymentDetails
    });
    return response.data;
};

// Get all orders for current user
export const getOrders = async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
};

// Get single order by ID
export const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
};
