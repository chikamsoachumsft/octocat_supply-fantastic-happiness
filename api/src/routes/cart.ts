/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for managing shopping cart
 */

/**
 * @swagger
 * /api/cart/{sessionId}:
 *   get:
 *     summary: Get or create cart with items for a session
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier for the cart
 *     responses:
 *       200:
 *         description: Cart with items retrieved or created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cartItemId:
 *                         type: integer
 *                       cartId:
 *                         type: integer
 *                       productId:
 *                         type: integer
 *                       quantity:
 *                         type: integer
 *                       addedAt:
 *                         type: string
 *                         format: date-time
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier for the cart
 *     responses:
 *       204:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 *
 * /api/cart/{sessionId}/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier for the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Product ID to add
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantity to add
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Invalid input (missing fields or invalid quantity)
 *       404:
 *         description: Cart or product not found
 *
 * /api/cart/{sessionId}/items/{cartItemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier for the cart
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: New quantity for the item
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Cart or cart item not found
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier for the cart
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart item ID
 *     responses:
 *       204:
 *         description: Item removed from cart successfully
 *       404:
 *         description: Cart or cart item not found
 */

import express from 'express';
import { getCartRepository } from '../repositories/cartRepo';
import { NotFoundError, ValidationError } from '../utils/errors';

const router = express.Router();

// Get or create cart with items
router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const repo = await getCartRepository();

    // Get existing cart or create new one
    let cart = await repo.getCartBySessionId(sessionId);
    if (!cart) {
      cart = await repo.createCart(sessionId);
    }

    // Get cart items with product details
    const items = await repo.getCartItems(cart.cartId);

    res.json({
      cart,
      items,
    });
  } catch (error) {
    next(error);
  }
});

// Add item to cart
router.post('/:sessionId/items', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      throw new ValidationError('productId and quantity are required');
    }

    if (typeof productId !== 'number' || typeof quantity !== 'number') {
      throw new ValidationError('productId and quantity must be numbers');
    }

    if (quantity < 1) {
      throw new ValidationError('quantity must be at least 1');
    }

    const repo = await getCartRepository();

    // Get or create cart
    let cart = await repo.getCartBySessionId(sessionId);
    if (!cart) {
      cart = await repo.createCart(sessionId);
    }

    // Add item to cart
    const cartItem = await repo.addItem(cart.cartId, productId, quantity);

    // Update cart timestamp
    await repo.touchCart(cart.cartId);

    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
});

// Update cart item quantity
router.put('/:sessionId/items/:cartItemId', async (req, res, next) => {
  try {
    const { sessionId, cartItemId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity) {
      throw new ValidationError('quantity is required');
    }

    if (typeof quantity !== 'number') {
      throw new ValidationError('quantity must be a number');
    }

    if (quantity < 1) {
      throw new ValidationError('quantity must be at least 1');
    }

    const repo = await getCartRepository();

    // Verify cart exists
    const cart = await repo.getCartBySessionId(sessionId);
    if (!cart) {
      throw new NotFoundError('Cart', sessionId);
    }

    // Update item quantity
    await repo.updateItemQuantity(parseInt(cartItemId), quantity);

    // Update cart timestamp
    await repo.touchCart(cart.cartId);

    res.status(200).json({ message: 'Cart item quantity updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Remove item from cart
router.delete('/:sessionId/items/:cartItemId', async (req, res, next) => {
  try {
    const { sessionId, cartItemId } = req.params;
    const repo = await getCartRepository();

    // Verify cart exists
    const cart = await repo.getCartBySessionId(sessionId);
    if (!cart) {
      throw new NotFoundError('Cart', sessionId);
    }

    // Remove item
    await repo.removeItem(parseInt(cartItemId));

    // Update cart timestamp
    await repo.touchCart(cart.cartId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Clear cart
router.delete('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const repo = await getCartRepository();

    // Get cart
    const cart = await repo.getCartBySessionId(sessionId);
    if (!cart) {
      throw new NotFoundError('Cart', sessionId);
    }

    // Clear all items
    await repo.clearCart(cart.cartId);

    // Update cart timestamp
    await repo.touchCart(cart.cartId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
