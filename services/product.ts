import api from './api';

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

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const getProduct = async (id: string): Promise<Product | null> => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

export const getMerchantProducts = async (merchantId: string): Promise<Product[]> => {
    try {
        const response = await api.get(`/products?merchantId=${merchantId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching merchant products:', error);
        return [];
    }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
};
// When creating a NEW product, the server generates the ID for you. You shouldn't provide it! so we need to omit = which mean
// remove the id from the product object

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
};
//**`Partial`** means **"Make ALL properties optional"**
//When updating a product, you might only want to change ONE field, not all of them!

export const deleteProduct = async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
};