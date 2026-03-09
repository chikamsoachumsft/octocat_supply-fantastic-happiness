/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Returns all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *   put:
 *     summary: Update an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */

import express from 'express';
import { Order } from '../models/order';
import { OrderDetail } from '../models/orderDetail';
import { getOrdersRepository } from '../repositories/ordersRepo';
import { getOrderDetailsRepository } from '../repositories/orderDetailsRepo';
import { getProductsRepository } from '../repositories/productsRepo';
import { handleDatabaseError, NotFoundError, ValidationError } from '../utils/errors';

const router = express.Router();

const DEFAULT_GUEST_BRANCH_ID = 1; // Default branch for guest orders

// Interface for guest checkout request
interface GuestCheckoutItem {
  productId: number;
  quantity: number;
}

interface GuestCheckoutRequest {
  customerName?: string;
  customerEmail?: string;
  branchId?: number;
  items?: GuestCheckoutItem[];
  // Traditional order fields (for backwards compatibility)
  orderDate?: string;
  name?: string;
  description?: string;
  status?: string;
}

// Create a new order (supports both traditional and guest checkout)
router.post('/', async (req, res, next) => {
  try {
    const body = req.body as GuestCheckoutRequest;
    
    // Guest checkout flow - if items are provided
    if (body.items && body.items.length > 0) {
      const ordersRepo = await getOrdersRepository();
      const orderDetailsRepo = await getOrderDetailsRepository();
      const productsRepo = await getProductsRepository();

      // Validate all items have sufficient stock BEFORE creating order
      for (const item of body.items) {
        const hasStock = await productsRepo.checkStock(item.productId, item.quantity);
        if (!hasStock) {
          const product = await productsRepo.findById(item.productId);
          throw new ValidationError(
            `Insufficient stock for product "${product?.name || item.productId}". ` +
            `Requested: ${item.quantity}, Available: ${product?.stockLevel || 0}`
          );
        }
      }

      // Create the order
      const orderData: Omit<Order, 'orderId'> = {
        branchId: body.branchId || DEFAULT_GUEST_BRANCH_ID,
        orderDate: body.orderDate || new Date().toISOString(),
        name: body.name || `Order from ${body.customerName || 'Guest'}`,
        description: body.description || 'Guest checkout order',
        status: body.status || 'pending',
        customerName: body.customerName,
        customerEmail: body.customerEmail,
      };

      const newOrder = await ordersRepo.create(orderData);

      // Create order details and decrement stock for each item
      const orderDetails: OrderDetail[] = [];
      for (const item of body.items) {
        const product = await productsRepo.findById(item.productId);
        if (!product) {
          throw new ValidationError(`Product with ID ${item.productId} not found`);
        }

        // Create order detail
        const orderDetail = await orderDetailsRepo.create({
          orderId: newOrder.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          notes: '',
        });
        orderDetails.push(orderDetail);

        // Decrement stock
        await productsRepo.decrementStock(item.productId, item.quantity);
      }

      // Return order with details
      res.status(201).json({
        ...newOrder,
        items: orderDetails,
      });
    } else {
      // Traditional order creation (backwards compatibility)
      const repo = await getOrdersRepository();
      const newOrder = await repo.create(req.body as Omit<Order, 'orderId'>);
      res.status(201).json(newOrder);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
});

// Get all orders
router.get('/', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const orders = await repo.findAll();

    // Non-linear pattern example: duplicate destructuring in object
    if (orders.length > 0) {
      const { orderId: id, orderId: duplicateId } = orders[0];
      console.log('Non-linear pattern in order routes:', id, duplicateId);
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Get an order by ID
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const order = await repo.findById(parseInt(req.params.id));
    if (order) {
      res.json(order);
    } else {
      res.status(404).send('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

// Update an order by ID
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const updatedOrder = await repo.update(parseInt(req.params.id), req.body);
    res.json(updatedOrder);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Order not found');
    } else {
      next(error);
    }
  }
});

// Delete an order by ID
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Order not found');
    } else {
      next(error);
    }
  }
});

export default router;
