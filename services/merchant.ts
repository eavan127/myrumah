import api from './api';

export interface Merchant {
    id: string;
    name: string;
    logoUri: string;
    description: string;
    address: string;
    rating: number;
}

export interface Review {
    id: string;
    userName: string;
    avatarUri?: string;
    rating: number;
    comment: string;
    date: string;
}

// API functions
export const getMerchants = async (): Promise<Merchant[]> => {
    try {
        const response = await api.get('/merchants');
        return response.data;
    } catch (error) {
        console.error('Error fetching merchants:', error);
        throw error;
    }
};

export const getMerchant = async (id: string): Promise<Merchant | null> => {
    try {
        const response = await api.get(`/merchants/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching merchant:', error);
        return null;
    }
};

export const getMerchantReviews = async (merchantId: string): Promise<Review[]> => {
    try {
        const response = await api.get(`/merchants/${merchantId}/reviews`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
};

export const createMerchant = async (data: Omit<Merchant, 'id'>): Promise<Merchant> => {
    const response = await api.post('/merchants', data);
    return response.data;
};

export const updateMerchant = async (id: string, data: Partial<Merchant>): Promise<Merchant> => {
    const response = await api.put(`/merchants/${id}`, data);
    return response.data;
};

export const deleteMerchant = async (id: string): Promise<void> => {
    await api.delete(`/merchants/${id}`);
};