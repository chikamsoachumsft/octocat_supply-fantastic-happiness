# Backend Documentation Generator Prompt

Use this prompt to generate comprehensive backend documentation using the **API-first + Example-driven** style with TSDoc inline comments.

---

## Prompt Template

```
Please document the backend code following these guidelines:

### Documentation Style
- Use TSDoc format for all TypeScript code with `/** */` comment blocks
- Include `@param`, `@returns`, `@throws`, `@example` tags where applicable
- Focus on documenting public APIs and exported functions thoroughly
- Keep internal/private function docs minimal but clear

### Structure Requirements

1. **Module/File Level Documentation**
   - Add a file-level comment at the top explaining the module's purpose
   - List key responsibilities and dependencies
   - Include a usage example if it's a standalone module

2. **Function/Method Documentation**
   - One-line summary of what the function does
   - Document all parameters with types and descriptions
   - Document return values with type and description
   - List all possible errors/exceptions thrown
   - Provide at least one realistic usage example

3. **Type/Interface Documentation**
   - Describe the purpose of each interface or type
   - Document each property with inline comments
   - Include validation rules or constraints if applicable

4. **Repository Pattern Specific**
   - Document the data access layer's purpose
   - Explain database interactions and SQL operations
   - Note transaction handling and error scenarios
   - Show example usage with actual model data

### Example Format

\`\`\`typescript
/**
 * Retrieves all active suppliers from the database with optional filtering.
 * 
 * @param filters - Optional filters for supplier search
 * @param filters.status - Filter by supplier status (active/inactive)
 * @param filters.country - Filter by supplier country code
 * @returns Promise resolving to array of Supplier objects
 * @throws {DatabaseError} When database connection fails
 * @throws {ValidationError} When filter parameters are invalid
 * 
 * @example
 * // Get all active suppliers
 * const suppliers = await getSuppliers({ status: 'active' });
 * 
 * @example
 * // Get suppliers from specific country
 * const usSuppliers = await getSuppliers({ country: 'US', status: 'active' });
 */
export async function getSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
  // implementation
}
\`\`\`

### Focus Areas for This Repo

1. **Repository Layer** (`api/src/repositories/*.ts`)
   - Document all CRUD operations
   - Explain SQL query logic for complex operations
   - Show example usage with realistic data

2. **Route Handlers** (`api/src/routes/*.ts`)
   - Document HTTP endpoints (method, path, purpose)
   - List request/response schemas
   - Include status codes and error responses
   - Provide curl or fetch examples

3. **Models** (`api/src/models/*.ts`)
   - Document each model's purpose in the domain
   - Explain relationships to other models
   - Note validation rules and constraints

4. **Database Operations** (`api/src/db/*.ts`)
   - Document migration and seeding processes
   - Explain connection management
   - Note error handling strategies

### Output Requirements
- Generate TSDoc comments for the specified file(s)
- Keep examples realistic using domain data (suppliers, branches, products, orders)
- Ensure examples are copy-paste runnable
- Mark deprecated or internal-use-only functions clearly

### Target File
[Specify the file path here, e.g., `api/src/repositories/suppliersRepo.ts`]
```

---

## Quick Usage Examples

### Example 1: Document a Repository File
```
Using the backend documentation prompt above, please document api/src/repositories/suppliersRepo.ts
```

### Example 2: Document All Route Handlers
```
Using the backend documentation prompt above, please document all files in api/src/routes/ focusing on HTTP endpoint specifications and request/response examples
```

### Example 3: Document Models with Relationships
```
Using the backend documentation prompt above, please document api/src/models/ emphasizing the relationships between Supplier, Branch, Product, and Order entities
```

---

## Tips for Best Results

1. **Be Specific**: Point to exact files or directories you want documented
2. **Provide Context**: If there's business logic that isn't obvious from code, mention it
3. **Request Examples**: Always ask for realistic, domain-specific examples
4. **Iterate**: Start with one file, review the style, then apply to others
5. **Integration**: After generating docs, ensure they align with existing docs in `docs/architecture.md` and `docs/backend-architecture.md`

---

## Validation Checklist

After documentation is generated, verify:
- [ ] All public functions have TSDoc comments
- [ ] All `@param` and `@returns` tags are present and accurate
- [ ] At least one `@example` per public function
- [ ] Error conditions documented with `@throws`
- [ ] Examples use realistic data from the domain model
- [ ] File-level comments explain module purpose
- [ ] Comments explain "why" not just "what"
