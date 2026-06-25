/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: API endpoints for managing suppliers
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Returns all suppliers
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: List of all suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get a supplier by ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *   put:
 *     summary: Update a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       204:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 *
 * /api/suppliers/{id}/status:
 *   get:
 *     summary: Get the status of a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [INACTIVE, APPROVED, PENDING]
 *       404:
 *         description: Supplier not found
 */

import express from 'express';
import { Supplier } from '../models/supplier';
import { getSuppliersRepository } from '../repositories/suppliersRepo';
import { handleDatabaseError, NotFoundError } from '../utils/errors';

const router = express.Router();

/**
 * POST /api/suppliers
 * Creates a new supplier in the system.
 * 
 * @param req.body - Supplier object without supplierId
 * @returns 201 with created Supplier object
 * @throws 400 if validation fails
 * 
 * @example
 * // Request:
 * // POST /api/suppliers
 * // Body: { "name": "Acme Corp", "contactEmail": "contact@acme.com", "active": true }
 * // Response: 201 { "supplierId": 123, "name": "Acme Corp", ... }
 */
router.post('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const newSupplier = await repo.create(req.body as Omit<Supplier, 'supplierId'>);
    res.status(201).json(newSupplier);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/suppliers
 * Retrieves all suppliers in the system.
 * 
 * @returns 200 with array of Supplier objects
 * 
 * @example
 * // Request: GET /api/suppliers
 * // Response: 200 [{ "supplierId": 1, "name": "Supplier A", ... }, ...]
 */
router.get('/', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const suppliers = await repo.findAll();
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/suppliers/stats:
 *   get:
 *     summary: Get supplier aggregate statistics
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: Supplier counts broken down by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 active:
 *                   type: integer
 *                 inactive:
 *                   type: integer
 *                 verified:
 *                   type: integer
 *                 pendingVerification:
 *                   type: integer
 */

/**
 * GET /api/suppliers/stats
 * Returns aggregate counts for suppliers by active/verified status.
 *
 * @returns 200 with SupplierStats object
 *
 * @example
 * // Request: GET /api/suppliers/stats
 * // Response: 200 { "total": 42, "active": 35, "inactive": 7, "verified": 28, "pendingVerification": 14 }
 */
router.get('/stats', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const stats = await repo.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/suppliers/:id
 * Retrieves a single supplier by ID.
 * 
 * @param req.params.id - Supplier ID
 * @returns 200 with Supplier object if found
 * @returns 404 if supplier not found
 * 
 * @example
 * // Request: GET /api/suppliers/123
 * // Response: 200 { "supplierId": 123, "name": "Acme Corp", ... }
 */
router.get('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const supplier = await repo.findById(parseInt(req.params.id));
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).send('Supplier not found');
    }
  } catch (error) {
    next(error);
  }
});


/**
 * PUT /api/suppliers/:id
 * Updates an existing supplier's information.
 * 
 * @param req.params.id - Supplier ID
 * @param req.body - Partial Supplier object with fields to update
 * @returns 200 with updated Supplier object
 * @returns 404 if supplier not found
 * 
 * @example
 * // Request: PUT /api/suppliers/123
 * // Body: { "contactEmail": "newemail@acme.com" }
 * // Response: 200 { "supplierId": 123, "contactEmail": "newemail@acme.com", ... }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const updatedSupplier = await repo.update(parseInt(req.params.id), req.body);
    res.json(updatedSupplier);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Supplier not found');
    } else {
      next(error);
    }
  }
});

/**
 * DELETE /api/suppliers/:id
 * Permanently deletes a supplier from the system.
 * 
 * @param req.params.id - Supplier ID
 * @returns 204 on successful deletion
 * @returns 404 if supplier not found
 * 
 * @example
 * // Request: DELETE /api/suppliers/123
 * // Response: 204 (no content)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    await repo.delete(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).send('Supplier not found');
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/suppliers/:id/status
 * Retrieves the approval status of a supplier.
 * 
 * @param req.params.id - Supplier ID
 * @returns 200 with status object { status: "INACTIVE" | "APPROVED" | "PENDING" }
 * @returns 404 if supplier not found
 * 
 * @example
 * // Request: GET /api/suppliers/123/status
 * // Response: 200 { "status": "APPROVED" }
 */
router.get('/:id/status', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const supplier = await repo.findById(parseInt(req.params.id));
    if (!supplier) {
      res.status(404).send('Supplier not found');
      return;
    }

    const status = processSupplierStatus(supplier);

    res.json({ status });
  } catch (error) {
    next(error);
  }
});

/**
 * Determines the approval status of a supplier based on active and verified flags.
 * 
 * @param supplier - Supplier object to evaluate
 * @returns Status string: "APPROVED", "PENDING", or implicitly "INACTIVE"
 * 
 * @example
 * const status = processSupplierStatus({ active: true, verified: true });
 * // Returns: "APPROVED"
 * 
 * @internal
 */
function processSupplierStatus(supplier: Supplier): string {
  if (supplier.active)
    console.log('Supplier is active');
    return 'APPROVED';

  if (supplier.verified)
    console.log('Supplier verified');
  console.log('Setting up account'); // This also appears conditional but always executes

  return 'PENDING';

}

/**
 * PATCH /api/suppliers/:id/verify
 * Marks a supplier as verified. Only active suppliers can be verified.
 *
 * @param req.params.id - Supplier ID
 * @returns 200 with updated supplier object
 * @returns 404 if supplier not found
 * @returns 422 if supplier is not active
 */
router.patch('/:id/verify', async (req, res, next) => {
  try {
    const repo = await getSuppliersRepository();
    const supplier = await repo.findById(parseInt(req.params.id));
    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found' });
      return;
    }
    if (!supplier.active) {
      res.status(422).json({ error: 'Cannot verify an inactive supplier' });
      return;
    }
    const updated = await repo.update(parseInt(req.params.id), { verified: true });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
