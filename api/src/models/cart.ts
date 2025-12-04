/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - cartId
 *         - userId
 *       properties:
 *         cartId:
 *           type: integer
 *           description: The unique identifier for the cart
 *         userId:
 *           type: string
 *           description: The user ID who owns this cart
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was last updated
 *     CartItem:
 *       type: object
 *       required:
 *         - cartItemId
 *         - cartId
 *         - productId
 *         - quantity
 *       properties:
 *         cartItemId:
 *           type: integer
 *           description: The unique identifier for the cart item
 *         cartId:
 *           type: integer
 *           description: The cart this item belongs to
 *         productId:
 *           type: integer
 *           description: The product ID
 *         quantity:
 *           type: integer
 *           description: Quantity of the product in the cart
 *           minimum: 1
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: When the item was added to the cart
 *     CartWithItems:
 *       type: object
 *       required:
 *         - cartId
 *         - userId
 *         - items
 *       properties:
 *         cartId:
 *           type: integer
 *           description: The unique identifier for the cart
 *         userId:
 *           type: string
 *           description: The user ID who owns this cart
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was last updated
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               cartItemId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               productName:
 *                 type: string
 *               productPrice:
 *                 type: number
 *               productImgName:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               addedAt:
 *                 type: string
 *                 format: date-time
 */
export interface Cart {
  cartId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  addedAt: string;
}

export interface CartItemWithProduct extends CartItem {
  productName: string;
  productPrice: number;
  productImgName: string;
  productDiscount?: number;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
}
