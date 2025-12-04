/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - cartItemId
 *         - cartId
 *         - productId
 *         - quantity
 *         - addedAt
 *       properties:
 *         cartItemId:
 *           type: integer
 *           description: The unique identifier for the cart item
 *         cartId:
 *           type: integer
 *           description: The cart this item belongs to
 *         productId:
 *           type: integer
 *           description: The product in the cart
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: The quantity of the product in the cart
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the item was added to the cart
 */
export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  addedAt: string;
}
