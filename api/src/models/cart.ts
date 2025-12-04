/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - cartId
 *         - sessionId
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         cartId:
 *           type: integer
 *           description: The unique identifier for the cart
 *         sessionId:
 *           type: string
 *           description: The session identifier for the cart (unique)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the cart was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the cart was last updated
 */
export interface Cart {
  cartId: number;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}
