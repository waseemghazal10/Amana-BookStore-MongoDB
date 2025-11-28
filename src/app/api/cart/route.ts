// src/app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { getCartItems, addToCart, updateCartItem, removeFromCart, clearCart } from '@/lib/db-operations';

// GET /api/cart - Get cart items
export async function GET() {
  try {
    const cartItems = await getCartItems();
    return NextResponse.json(cartItems);
  } catch (err) {
    console.error('Error fetching cart items:', err);
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, quantity } = body;

    if (!bookId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId and quantity' },
        { status: 400 }
      );
    }

    const newItem = await addToCart({
      bookId,
      quantity,
      addedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Item added to cart successfully',
      item: newItem 
    });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, quantity } = body;

    if (!id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: id and quantity' },
        { status: 400 }
      );
    }

    await updateCartItem(id, quantity);

    return NextResponse.json({ 
      message: 'Cart item updated successfully'
    });
  } catch (err) {
    console.error('Error updating cart item:', err);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart or clear entire cart
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const clearAll = searchParams.get('clearAll');

    if (clearAll === 'true') {
      await clearCart();
      return NextResponse.json({ 
        message: 'Cart cleared successfully'
      });
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing required parameter: itemId' },
        { status: 400 }
      );
    }

    await removeFromCart(itemId);
    
    return NextResponse.json({ 
      message: 'Item removed from cart successfully',
      itemId 
    });
  } catch (err) {
    console.error('Error removing cart item:', err);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

// Future implementation notes:
// - Session management for user carts (using NextAuth.js or similar)
// - Database integration patterns (Prisma, Drizzle, or raw SQL)
// - Cart persistence strategies:
//   * Guest carts: Store in localStorage/cookies with optional merge on login
//   * User carts: Store in database with user ID association
//   * Hybrid approach: localStorage for guests, database for authenticated users
// - Security considerations:
//   * Validate user ownership of cart items
//   * Sanitize input data
//   * Rate limiting to prevent abuse
// - Performance optimizations:
//   * Cache frequently accessed cart data
//   * Batch operations for multiple item updates
//   * Implement optimistic updates on the frontend

// Example future database integration:
// import { db } from '@/lib/database';
// import { getServerSession } from 'next-auth';
// 
// export async function GET() {
//   const session = await getServerSession();
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
//   
//   try {
//     const cartItems = await db.cartItem.findMany({
//       where: { userId: session.user.id },
//       include: { book: true }
//     });
//     
//     return NextResponse.json(cartItems);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch cart items' },
//       { status: 500 }
//     );
//   }
// }