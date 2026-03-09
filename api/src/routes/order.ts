/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GuestCheckoutItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           description: The ID of the product to order
 *         quantity:
 *           type: integer
 *           description: The quantity of the product to order
 *           minimum: 1
 *     GuestCheckoutRequest:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GuestCheckoutItem'
 *           description: Array of products to include in the order
 *         customerName:
 *           type: string
 *           description: Name of the customer (optional)
 *         customerEmail:
 *           type: string
 *           format: email
 *           description: Email address of the customer (optional)
 *         branchId:
 *           type: integer
 *           description: The ID of the branch placing the order (optional, defaults to branch 1)
 *     OrderWithItems:
 *       allOf:
 *         - $ref: '#/components/schemas/Order'
 *         - type: object
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderDetail'
 *               description: Order line items (only present for guest checkout orders)
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
 *     description: >
 *       Creates a new order. Supports two request shapes:
 *       **Guest checkout** (supply `items`) — creates the order, inserts order details, and
 *       decrements product stock. Returns the created order enriched with an `items` array.
 *       **Traditional order** (supply `orderDate`, `name`, `description`, `status`) — creates
 *       a bare order record and returns the `Order` object only.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/GuestCheckoutRequest'
 *               - $ref: '#/components/schemas/Order'
 *           examples:
 *             guestCheckout:
 *               summary: Guest checkout with items
 *               value:
 *                 items:
 *                   - productId: 1
 *                     quantity: 2
 *                 customerName: Jane Doe
 *                 customerEmail: jane@example.com
 *                 branchId: 1
 *             traditionalOrder:
 *               summary: Traditional order
 *               value:
 *                 branchId: 1
 *                 orderDate: "2024-01-01T00:00:00Z"
 *                 name: "Order #1"
 *                 description: Monthly supplies
 *                 status: pending
 *     responses:
 *       201:
 *         description: >
 *           Order created successfully. Guest checkout responses include an `items` array
 *           of `OrderDetail` objects. Traditional order responses return a plain `Order`.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/OrderWithItems'
 *                 - $ref: '#/components/schemas/Order'
 *             examples:
 *               guestCheckoutResponse:
 *                 summary: Guest checkout response (includes items)
 *                 value:
 *                   orderId: 42
 *                   branchId: 1
 *                   orderDate: "2024-01-01T00:00:00Z"
 *                   name: Guest Order
 *                   description: Guest checkout order
 *                   status: pending
 *                   customerName: Jane Doe
 *                   customerEmail: jane@example.com
 *                   items:
 *                     - orderDetailId: 1
 *                       orderId: 42
 *                       productId: 1
 *                       quantity: 2
 *                       unitPrice: 9.99
 *               traditionalOrderResponse:
 *                 summary: Traditional order response
 *                 value:
 *                   orderId: 43
 *                   branchId: 1
 *                   orderDate: "2024-01-01T00:00:00Z"
 *                   name: "Order #1"
 *                   description: Monthly supplies
 *                   status: pending
 *       400:
 *         description: >
 *           Validation error. Returned when a product is not found or stock is insufficient
 *           to fulfil the requested quantity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Insufficient stock for product 1
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
import { getOrdersRepository } from '../repositories/ordersRepo';
import { handleDatabaseError, NotFoundError } from '../utils/errors';

const router = express.Router();

// Create a new order
router.post('/', async (req, res, next) => {
  try {
    const repo = await getOrdersRepository();
    const newOrder = await repo.create(req.body as Omit<Order, 'orderId'>);
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
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
