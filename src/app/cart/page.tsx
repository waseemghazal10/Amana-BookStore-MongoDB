// src/app/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartItem from '../components/CartItem';
import { fetchCartItems, updateCartItem, removeFromCart, clearCart as clearCartAPI, fetchBookById } from '@/lib/api-client';
import { Book, CartItem as CartItemType } from '../types';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<{ book: Book; quantity: number; cartId: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart items from API
  const loadCart = async () => {
    try {
      setIsLoading(true);
      const cart = await fetchCartItems();
      
      // Fetch book details for each cart item
      const itemsWithBooks = await Promise.all(
        cart.map(async (item) => {
          try {
            const bookData = await fetchBookById(item.bookId);
            return {
              book: bookData,
              quantity: item.quantity,
              cartId: item.id
            };
          } catch (error) {
            console.error(`Failed to fetch book ${item.bookId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null values (failed fetches)
      const validItems = itemsWithBooks.filter((item): item is { book: Book; quantity: number; cartId: string } => item !== null);
      setCartItems(validItems);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      // Find the cart item
      const item = cartItems.find(item => item.book.id === bookId);
      if (!item) return;

      // Update via API
      await updateCartItem(item.cartId, newQuantity);

      // Update local state
      const updatedItems = cartItems.map(item => 
        item.book.id === bookId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      
      // Notify navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  };

  const removeItem = async (bookId: string) => {
    try {
      // Find the cart item
      const item = cartItems.find(item => item.book.id === bookId);
      if (!item) return;

      // Remove via API
      await removeFromCart(item.cartId);

      // Update local state
      const updatedItems = cartItems.filter(item => item.book.id !== bookId);
      setCartItems(updatedItems);
      
      // Notify navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const clearCart = async () => {
    try {
      // Clear via API
      await clearCartAPI();

      // Update local state
      setCartItems([]);
      
      // Notify navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
          <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md">
            {cartItems.map((item) => (
              <CartItem
                key={item.book.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
              />
            ))}
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center text-xl font-bold mb-4 text-gray-800">
              <span>Total: ${totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1 bg-gray-500 text-white text-center py-3 rounded-md hover:bg-gray-600 transition-colors cursor-pointer">
                Continue Shopping
              </Link>
              <button 
                onClick={clearCart}
                className="flex-1 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}