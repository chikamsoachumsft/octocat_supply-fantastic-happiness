# TSDoc + Swagger Copy-Paste Templates

Reference templates for documenting OctoCAT API code.  
These are used by the `tsdoc-api-docs` skill.

---

## TSDoc Block — Repository Method Template

```typescript
/**
 * Retrieves a single {Entity} record by its primary key.
 *
 * @param db - The active better-sqlite3 Database instance
 * @param id - The numeric primary key of the {entity} to look up
 * @returns The matching {@link Entity} record with all fields in camelCase
 * @throws {NotFoundError} When no {entity} exists for the given `id`
 * @throws {DatabaseError} On unexpected SQLite errors
 * @example
 * const entity = get{Entity}ById(db, 42);
 * console.log(entity.{entityName}); // "Example Name"
 */
get{Entity}ById(db: Database.Database, id: number): {Entity}
```

### Variant — Create method

```typescript
/**
 * Inserts a new {entity} record into the database.
 *
 * @param db - The active better-sqlite3 Database instance
 * @param data - The fields for the new {entity}; `id` is auto-assigned
 * @returns The newly created {@link Entity} record including its generated `id`
 * @throws {ValidationError} When required fields are missing or invalid
 * @throws {ConflictError} When a unique constraint is violated
 * @throws {DatabaseError} On unexpected SQLite errors
 * @example
 * const entity = create{Entity}(db, { {entityName}: 'Example', isActive: true });
 * console.log(entity.id); // auto-generated integer
 */
create{Entity}(db: Database.Database, data: Create{Entity}DTO): {Entity}
```

### Variant — Update method

```typescript
/**
 * Updates fields on an existing {entity} record.
 *
 * @param db - The active better-sqlite3 Database instance
 * @param id - The primary key of the {entity} to update
 * @param data - Partial set of fields to update; omitted fields are unchanged
 * @returns The updated {@link Entity} record
 * @throws {NotFoundError} When no {entity} exists for the given `id`
 * @throws {ValidationError} When supplied field values are invalid
 * @throws {DatabaseError} On unexpected SQLite errors
 * @example
 * const updated = update{Entity}(db, 42, { isActive: false });
 * console.log(updated.isActive); // false
 */
update{Entity}(db: Database.Database, id: number, data: Partial<{Entity}>): {Entity}
```

### Variant — Delete method

```typescript
/**
 * Permanently removes an {entity} record from the database.
 *
 * @param db - The active better-sqlite3 Database instance
 * @param id - The primary key of the {entity} to delete
 * @returns `void` on success
 * @throws {NotFoundError} When no {entity} exists for the given `id`
 * @throws {DatabaseError} On unexpected SQLite errors
 * @example
 * delete{Entity}(db, 42);
 * // record is permanently removed; subsequent lookups throw NotFoundError
 */
delete{Entity}(db: Database.Database, id: number): void
```

---

## Swagger JSDoc Block — Route Template

### GET collection

```typescript
/**
 * @openapi
 * /{entities}:
 *   get:
 *     summary: List all {entities}
 *     tags: [{Entities}]
 *     responses:
 *       200:
 *         description: Array of {entity} objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/{Entity}'
 *       500:
 *         description: Internal server error
 */
router.get('/', ...)
```

### GET by ID

```typescript
/**
 * @openapi
 * /{entities}/{id}:
 *   get:
 *     summary: Get a {entity} by ID
 *     tags: [{Entities}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the {entity}
 *     responses:
 *       200:
 *         description: {Entity} found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Entity}'
 *       404:
 *         description: {Entity} not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', ...)
```

### POST create

```typescript
/**
 * @openapi
 * /{entities}:
 *   post:
 *     summary: Create a new {entity}
 *     tags: [{Entities}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Create{Entity}Request'
 *     responses:
 *       201:
 *         description: {Entity} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Entity}'
 *       400:
 *         description: Missing or invalid fields
 *       409:
 *         description: Conflict — duplicate unique value
 *       422:
 *         description: Unprocessable entity
 *       500:
 *         description: Internal server error
 */
router.post('/', ...)
```

### PUT update

```typescript
/**
 * @openapi
 * /{entities}/{id}:
 *   put:
 *     summary: Update an existing {entity}
 *     tags: [{Entities}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Update{Entity}Request'
 *     responses:
 *       200:
 *         description: {Entity} updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{Entity}'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: {Entity} not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', ...)
```

### DELETE

```typescript
/**
 * @openapi
 * /{entities}/{id}:
 *   delete:
 *     summary: Delete a {entity} by ID
 *     tags: [{Entities}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: {Entity} deleted
 *       404:
 *         description: {Entity} not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', ...)
```
