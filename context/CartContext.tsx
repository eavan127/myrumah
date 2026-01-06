import { useAuth } from '@/components/AuthContext';
import api from '@/services/api';
import { Product } from '@/services/product';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth(); // Get auth token to know when to fetch

    // Fetch Cart from Backend
    const fetchCart = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await api.get('/cart');
            // Backend returns { items: [], total: 0 }
            // Ensure items is an array
            const cartItems = response.data.items || [];
            setItems(cartItems);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Reload cart when user logs in
    useEffect(() => {
        if (token) {
            fetchCart();
        } else {
            setItems([]); // Clear local cart on logout
        }
    }, [token]);

    const addToCart = async (product: Product) => {
        // Optimistic Update (Immediate UI feedback)
        const tempId = product.id;
        setItems(prevItems => {
            const existing = prevItems.find(i => i.id === tempId);
            if (existing) {
                return prevItems.map(i => i.id === tempId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });

        try {
            await api.post('/cart/add', {
                productId: product.id,
                quantity: 1
            });
            // Ideally sync back with server to be sure, but let's trust for now or fetch in background
            // fetchCart(); 
        } catch (error) {
            console.error('Failed to add to cart:', error);
            // Revert on error (optional but recommended)
            fetchCart(); // Re-sync to correct state
        }
    };

    const removeFromCart = async (productId: string) => {
        setItems(prevItems => prevItems.filter(i => i.id !== productId));
        try {
            await api.delete(`/cart/${productId}`);
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            fetchCart();
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        setItems(prevItems =>
            prevItems.map(i => i.id === productId ? { ...i, quantity } : i)
        );

        try {
            await api.post('/cart/update', {
                productId,
                quantity
            });
        } catch (error) {
            console.error('Failed to update quantity:', error);
            fetchCart();
        }
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((sum, item) => {
        // Handle string prices if necessary (though backend sends numbers now for new items)
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount, isLoading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
